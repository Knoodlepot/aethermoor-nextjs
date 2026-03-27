import { query } from './db';
import type { ModerationIncident } from './db';

/**
 * Sanitize string for storage (remove control characters, truncate)
 */
export function sanitiseStr(text: string, maxLength: number = 1000): string {
  if (!text) return '';

  // Remove control characters except newlines and tabs
  let sanitized = text.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');

  // Truncate if too long
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength) + '...';
  }

  return sanitized;
}

/**
 * Log a moderation incident (manual review only)
 */
export async function logModerationIncident(
  accountId: string,
  playerId: string,
  source: string,
  reason: string,
  triggerText?: string,
  cardType?: 'yellow' | 'red' | null
): Promise<number | null> {
  try {
    const sanitizedTrigger = triggerText ? sanitiseStr(triggerText, 500) : null;
    const sanitizedReason = sanitiseStr(reason, 500);

    const result = await query<ModerationIncident>(
      `INSERT INTO moderation_incidents
       (account_id, player_id, source, reason, trigger_text, card_type, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending', NOW())
       RETURNING id`,
      [accountId, playerId, source, sanitizedReason, sanitizedTrigger, cardType ?? null]
    );

    if (result.rows.length === 0) {
      return null;
    }

    console.log(`[Moderation] Incident #${result.rows[0].id} logged for ${playerId}: ${reason}`);
    return result.rows[0].id;
  } catch (error) {
    console.error('Log moderation incident error:', error);
    return null;
  }
}

/**
 * Get pending moderation incidents
 */
export async function getPendingIncidents(limit: number = 50) {
  try {
    const result = await query<ModerationIncident>(
      `SELECT id, account_id, player_id, source, reason, trigger_text, status,
              admin_notes, created_at, reviewed_at, reviewed_by
       FROM moderation_incidents
       WHERE status = 'pending'
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit]
    );

    return result.rows;
  } catch (error) {
    console.error('Get pending incidents error:', error);
    return [];
  }
}

/**
 * Get all incidents for an account
 */
export async function getAccountIncidents(accountId: string, limit: number = 100) {
  try {
    const result = await query<ModerationIncident>(
      `SELECT id, account_id, player_id, source, reason, trigger_text, status,
              admin_notes, created_at, reviewed_at, reviewed_by
       FROM moderation_incidents
       WHERE account_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [accountId, limit]
    );

    return result.rows;
  } catch (error) {
    console.error('Get account incidents error:', error);
    return [];
  }
}

/**
 * Get incidents by status
 */
export async function getIncidentsByStatus(
  status: 'pending' | 'dismissed' | 'escalated',
  limit: number = 100
) {
  try {
    const result = await query<ModerationIncident>(
      `SELECT id, account_id, player_id, source, reason, trigger_text, status,
              admin_notes, created_at, reviewed_at, reviewed_by
       FROM moderation_incidents
       WHERE status = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [status, limit]
    );

    return result.rows;
  } catch (error) {
    console.error('Get incidents by status error:', error);
    return [];
  }
}

/**
 * Update incident status (manual admin action only)
 */
export async function updateIncidentStatus(
  incidentId: number,
  status: 'pending' | 'dismissed' | 'escalated',
  adminNotes?: string,
  reviewedById?: string
): Promise<boolean> {
  try {
    const sanitizedNotes = adminNotes ? sanitiseStr(adminNotes, 1000) : null;

    const result = await query(
      `UPDATE moderation_incidents
       SET status = $1, admin_notes = $2, reviewed_at = NOW(), reviewed_by = $3
       WHERE id = $4`,
      [status, sanitizedNotes, reviewedById || null, incidentId]
    );

    if (result.rowCount! > 0) {
      console.log(`[Moderation] Incident #${incidentId} marked as ${status}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Update incident status error:', error);
    return false;
  }
}

/**
 * Get incident details
 */
export async function getIncidentDetails(incidentId: number): Promise<ModerationIncident | null> {
  try {
    const result = await query<ModerationIncident>(
      `SELECT id, account_id, player_id, source, reason, trigger_text, status,
              admin_notes, created_at, reviewed_at, reviewed_by
       FROM moderation_incidents
       WHERE id = $1`,
      [incidentId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  } catch (error) {
    console.error('Get incident details error:', error);
    return null;
  }
}

/**
 * Get incidents for account in last N days
 */
export async function getRecentIncidents(accountId: string, daysBack: number = 30) {
  try {
    const result = await query<ModerationIncident>(
      `SELECT id, account_id, player_id, source, reason, trigger_text, status,
              admin_notes, created_at, reviewed_at, reviewed_by
       FROM moderation_incidents
       WHERE account_id = $1 AND created_at > NOW() - ($2 * INTERVAL '1 day')
       ORDER BY created_at DESC`,
      [accountId, daysBack]
    );

    return result.rows;
  } catch (error) {
    console.error('Get recent incidents error:', error);
    return [];
  }
}

/**
 * Check if an account is on automatic moderation hold.
 * Returns true if the account has 5+ pending incidents in the last 7 days.
 * The hold is automatically lifted when an admin dismisses enough incidents.
 */
export async function isAccountOnModerationHold(accountId: string): Promise<boolean> {
  try {
    const result = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM moderation_incidents
       WHERE account_id = $1
         AND status = 'pending'
         AND created_at > NOW() - ($2 * INTERVAL '1 day')`,
      [accountId, 7]
    );
    return parseInt(result.rows[0]?.count ?? '0') >= 5;
  } catch (error) {
    console.error('Moderation hold check error:', error);
    return false; // fail open — don't block players if the check errors
  }
}

/**
 * Get yellow/red card counts for a player (non-dismissed only)
 */
export async function getPlayerCardCounts(playerId: string): Promise<{ yellow: number; red: number }> {
  try {
    const result = await query<{ card_type: string; count: string }>(
      `SELECT card_type, COUNT(*) as count FROM moderation_incidents
       WHERE player_id = $1 AND card_type IS NOT NULL AND status != 'dismissed'
       GROUP BY card_type`,
      [playerId]
    );
    const counts = { yellow: 0, red: 0 };
    for (const row of result.rows) {
      if (row.card_type === 'yellow') counts.yellow = parseInt(row.count);
      if (row.card_type === 'red') counts.red = parseInt(row.count);
    }
    return counts;
  } catch (error) {
    console.error('Get player card counts error:', error);
    return { yellow: 0, red: 0 };
  }
}

/**
 * Check if player has an active (non-dismissed) red card
 */
export async function isPlayerRedCarded(playerId: string): Promise<boolean> {
  try {
    const result = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM moderation_incidents
       WHERE player_id = $1 AND card_type = 'red' AND status != 'dismissed'`,
      [playerId]
    );
    return parseInt(result.rows[0]?.count ?? '0') > 0;
  } catch (error) {
    console.error('Red card check error:', error);
    return false;
  }
}

/**
 * Get recent card incidents for admin notification (last 7 days, with trigger text)
 */
export async function getRecentCardIncidents(limit: number = 50) {
  try {
    const result = await query<{
      id: number; player_id: string; account_id: string; card_type: string;
      reason: string; trigger_text: string; status: string; created_at: string;
    }>(
      `SELECT id, player_id, account_id, card_type, reason, trigger_text, status, created_at
       FROM moderation_incidents
       WHERE card_type IS NOT NULL AND created_at > NOW() - INTERVAL '7 days'
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  } catch (error) {
    console.error('Get recent card incidents error:', error);
    return [];
  }
}

/**
 * Count incidents by status
 */
export async function countIncidentsByStatus(): Promise<{
  pending: number;
  dismissed: number;
  escalated: number;
}> {
  try {
    const result = await query<{ status: string; count: number }>(
      `SELECT status, COUNT(*) as count
       FROM moderation_incidents
       GROUP BY status`
    );

    const counts = { pending: 0, dismissed: 0, escalated: 0 };

    for (const row of result.rows) {
      if (row.status in counts) {
        counts[row.status as keyof typeof counts] = parseInt(row.count.toString());
      }
    }

    return counts;
  } catch (error) {
    console.error('Count incidents error:', error);
    return { pending: 0, dismissed: 0, escalated: 0 };
  }
}
