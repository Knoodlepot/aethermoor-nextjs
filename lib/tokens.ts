import { query } from './db';
import type { Player } from './db';
import { cacheGetJson, cacheSetJson, cacheDel } from './redis';

const BAL_TTL = 30; // seconds

/**
 * Get player token balance (cached 30s)
 */
export async function getBalance(playerId: string): Promise<number> {
  try {
    const key = `token:bal:${playerId}`;
    const cached = await cacheGetJson<number>(key);
    if (cached !== null) return cached;

    const result = await query<Player>(
      `SELECT tokens FROM players WHERE player_id = $1`,
      [playerId]
    );

    const balance = result.rows.length === 0 ? 0 : result.rows[0].tokens;
    await cacheSetJson(key, balance, BAL_TTL);
    return balance;
  } catch (error) {
    console.error('Get balance error:', error);
    return 0;
  }
}

/**
 * Ensure player row exists (create if not)
 */
export async function ensurePlayerRow(playerId: string): Promise<void> {
  try {
    const existing = await query(
      `SELECT player_id FROM players WHERE player_id = $1`,
      [playerId]
    );

    if (existing.rows.length === 0) {
      // Create new player with 50 bonus tokens
      await query(
        `INSERT INTO players (player_id, tokens, created_at, updated_at)
         VALUES ($1, $2, NOW(), NOW())`,
        [playerId, 50]
      );

      // Log the token award
      await query(
        `INSERT INTO token_log (player_id, change, reason, model_tier, created_at)
         VALUES ($1, $2, $3, NULL, NOW())`,
        [playerId, 50, 'New player bonus']
      );
    }
  } catch (error) {
    console.error('Ensure player row error:', error);
  }
}

/**
 * Spend tokens per AI turn (cost varies by model tier)
 */
export async function spendToken(playerId: string, cost: number = 1, modelTier?: string): Promise<boolean> {
  try {
    const balance = await getBalance(playerId);
    if (balance < cost) {
      return false;
    }

    const result = await query(
      `UPDATE players
       SET tokens = tokens - $2, updated_at = NOW()
       WHERE player_id = $1 AND tokens >= $2`,
      [playerId, cost]
    );

    if (result.rowCount! > 0) {
      await query(
        `INSERT INTO token_log (player_id, change, reason, model_tier, created_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [playerId, -cost, 'AI turn', modelTier ?? null]
      );
      await cacheDel(`token:bal:${playerId}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Spend token error:', error);
    return false;
  }
}

/**
 * Add tokens to player account
 */
export async function addTokens(
  playerId: string,
  amount: number,
  reason: string
): Promise<boolean> {
  try {
    if (amount <= 0) {
      return false; // Only positive amounts
    }

    // Ensure player exists
    await ensurePlayerRow(playerId);

    // Add tokens
    const result = await query(
      `UPDATE players
       SET tokens = tokens + $1, updated_at = NOW()
       WHERE player_id = $2`,
      [amount, playerId]
    );

    if (result.rowCount! > 0) {
      // Log the token addition
      await query(
        `INSERT INTO token_log (player_id, change, reason, model_tier, created_at)
         VALUES ($1, $2, $3, NULL, NOW())`,
        [playerId, amount, reason]
      );
      await cacheDel(`token:bal:${playerId}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Add tokens error:', error);
    return false;
  }
}

/**
 * Get token transaction history
 */
export async function getTokenHistory(playerId: string, limit: number = 50) {
  try {
    const result = await query(
      `SELECT id, player_id, change, reason, created_at
       FROM token_log
       WHERE player_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [playerId, limit]
    );

    return result.rows;
  } catch (error) {
    console.error('Get token history error:', error);
    return [];
  }
}

/**
 * Get total tokens spent by player
 */
export async function getTotalSpent(playerId: string): Promise<number> {
  try {
    const result = await query<Player>(
      `SELECT total_spent FROM players WHERE player_id = $1`,
      [playerId]
    );

    if (result.rows.length === 0) {
      return 0;
    }

    return result.rows[0].total_spent;
  } catch (error) {
    console.error('Get total spent error:', error);
    return 0;
  }
}

/**
 * Update total spent (for Stripe purchases)
 */
export async function updateTotalSpent(playerId: string, amountPence: number): Promise<void> {
  try {
    await query(
      `UPDATE players
       SET total_spent = total_spent + $1, updated_at = NOW()
       WHERE player_id = $2`,
      [amountPence, playerId]
    );
  } catch (error) {
    console.error('Update total spent error:', error);
  }
}
