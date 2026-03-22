import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cacheGetJson, cacheSetJson } from '@/lib/redis';

const CACHE_KEY = 'leaderboard:v1';
const CACHE_TTL = 60; // 60 seconds

export async function GET() {
  try {
    // Check cache first
    const cached = await cacheGetJson<object[]>(CACHE_KEY);
    if (cached) {
      return NextResponse.json({ entries: cached, cached: true });
    }

    const result = await query(
      `SELECT player_id, hero_name, hero_class, hero_level, deepest_floor, ng_plus, world_seed, world_name, country_code, updated_at
       FROM leaderboard_entries
       ORDER BY deepest_floor DESC, ng_plus DESC, hero_level DESC
       LIMIT 100`,
      []
    );

    const entries = result.rows;

    // Cache the result
    await cacheSetJson(CACHE_KEY, entries, CACHE_TTL);

    return NextResponse.json({ entries, cached: false });
  } catch (error) {
    console.error('[DUNGEON LEADERBOARD]', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
