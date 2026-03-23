import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cacheGetJson, cacheSetJson } from '@/lib/redis';

function checkAdminAuth(request: NextRequest): boolean {
  const headerSecret = request.headers.get('x-admin-secret');
  const bearer = request.headers.get('authorization');
  const bearerSecret = bearer?.startsWith('Bearer ') ? bearer.substring(7) : null;
  const secret = headerSecret || bearerSecret;
  return !!(secret && secret === process.env.SESSION_SECRET);
}

// Estimated USD cost per narrator call by model tier
const COST_PER_CALL_USD: Record<string, number> = {
  haiku:  0.005,
  sonnet: 0.020,
  opus:   0.100,
};

// Revenue per game-token in GBP (approx: £1 Starter = 75 tokens → ~£0.0133/token)
// Blended across all packages for simplicity
const GBP_PER_GAME_TOKEN = 0.0133;
const USD_TO_GBP = 0.80;

export async function GET(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const cacheKey = 'admin:costs:v1';
  const cached = await cacheGetJson(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    // Daily breakdown by model tier for the last 30 days
    const dailyResult = await query<{
      day: string;
      model_tier: string;
      calls: string;
      tokens_spent: string;
    }>(`
      SELECT
        date_trunc('day', created_at)::date AS day,
        model_tier,
        COUNT(*)::text                       AS calls,
        SUM(-change)::text                   AS tokens_spent
      FROM token_log
      WHERE change < 0
        AND reason = 'AI turn'
        AND model_tier IS NOT NULL
        AND created_at > NOW() - INTERVAL '30 days'
      GROUP BY day, model_tier
      ORDER BY day DESC
    `);

    // Aggregate into day → { haiku, sonnet, opus } shape
    const dayMap: Record<string, { haiku: number; sonnet: number; opus: number; tokensSpent: number }> = {};
    for (const row of dailyResult.rows) {
      const day = String(row.day).substring(0, 10);
      if (!dayMap[day]) dayMap[day] = { haiku: 0, sonnet: 0, opus: 0, tokensSpent: 0 };
      const calls = parseInt(row.calls, 10);
      const tier = row.model_tier as 'haiku' | 'sonnet' | 'opus';
      if (tier in dayMap[day]) (dayMap[day] as any)[tier] = calls;
      dayMap[day].tokensSpent += parseInt(row.tokens_spent, 10);
    }

    const daily = Object.entries(dayMap)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([day, d]) => {
        const costUsd =
          d.haiku  * COST_PER_CALL_USD.haiku +
          d.sonnet * COST_PER_CALL_USD.sonnet +
          d.opus   * COST_PER_CALL_USD.opus;
        const totalCalls = d.haiku + d.sonnet + d.opus;
        const revenueGbp = d.tokensSpent * GBP_PER_GAME_TOKEN;
        const costGbp = costUsd * USD_TO_GBP;
        return { day, haiku: d.haiku, sonnet: d.sonnet, opus: d.opus, totalCalls, costUsd, costGbp, revenueGbp };
      });

    // 7-day and 30-day totals
    const last7 = daily.slice(0, 7);
    const summarize = (rows: typeof daily) => {
      const calls = rows.reduce((s, r) => s + r.totalCalls, 0);
      const costUsd = rows.reduce((s, r) => s + r.costUsd, 0);
      const costGbp = rows.reduce((s, r) => s + r.costGbp, 0);
      const revenueGbp = rows.reduce((s, r) => s + r.revenueGbp, 0);
      const margin = revenueGbp > 0 ? ((revenueGbp - costGbp) / revenueGbp) * 100 : null;
      return { calls, costUsd, costGbp, revenueGbp, margin };
    };

    const payload = {
      daily,
      summary7d:  summarize(last7),
      summary30d: summarize(daily),
    };

    await cacheSetJson(cacheKey, payload, 300); // 5-min cache
    return NextResponse.json(payload);
  } catch (error) {
    console.error('[ADMIN COSTS]', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
