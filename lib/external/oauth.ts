import { v4 as uuidv4 } from 'uuid';
import { query } from '../db';
import { issueJwt } from '../auth';
import { ensurePlayerRow } from '../tokens';

/**
 * OAuth Account Info
 */
export interface OAuthAccount {
  accountId: string;
  playerId: string;
  email: string;
}

/**
 * Find existing account by email or create new one
 */
export async function oauthFindOrCreate(email: string): Promise<OAuthAccount | null> {
  try {
    const emailNorm = email.toLowerCase().trim();

    // Check if account exists
    const existing = await query<{ id: string; player_id: string }>(
      `SELECT id, player_id FROM accounts WHERE email = $1`,
      [emailNorm]
    );

    if (existing.rows.length > 0) {
      const acc = existing.rows[0];
      return {
        accountId: acc.id,
        playerId: acc.player_id,
        email: emailNorm,
      };
    }

    // Create new OAuth account
    const accountId = uuidv4();
    const playerId = `player-${uuidv4().substring(0, 8)}`;

    // OAuth accounts have a random password hash (can be reset via forgot password flow)
    const randomHash = Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('hex');

    await query(
      `INSERT INTO accounts (id, email, password_hash, player_id, verified)
       VALUES ($1, $2, $3, $4, TRUE)`,
      [accountId, emailNorm, randomHash, playerId]
    );

    // Ensure player row exists with bonus tokens
    await ensurePlayerRow(playerId);

    console.log(`[OAUTH-REGISTER] ${emailNorm} → ${playerId}`);

    return {
      accountId,
      playerId,
      email: emailNorm,
    };
  } catch (error) {
    console.error('OAuth find-or-create error:', error);
    return null;
  }
}

/**
 * GOOGLE OAUTH
 */

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
let warnedMissingGoogleOAuth = false;
let warnedMissingDiscordOAuth = false;

/**
 * Get Google OAuth URL
 */
export function getGoogleOAuthUrl(state: string, redirectUri?: string): string {
  if (!GOOGLE_CLIENT_ID) {
    if (!warnedMissingGoogleOAuth) {
      console.warn('[OAUTH] Google OAuth not configured: login will not work.');
      warnedMissingGoogleOAuth = true;
    }
    throw new Error('Google OAuth not configured');
  }

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri || GOOGLE_REDIRECT_URI || '',
    response_type: 'code',
    scope: 'openid email profile',
    state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Exchange Google authorization code for tokens and user info
 */
export async function exchangeGoogleCode(
  code: string,
  redirectUri?: string
): Promise<{ account: OAuthAccount | null; error?: string }> {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return { account: null, error: 'Google OAuth not configured' };
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri || GOOGLE_REDIRECT_URI || '',
      }).toString(),
    });

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      return { account: null, error: 'Failed to exchange authorization code' };
    }

    // Get user info
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const userInfo = await userRes.json();

    if (!userInfo.email) {
      return { account: null, error: 'Email not available from Google' };
    }

    // Find or create account
    const account = await oauthFindOrCreate(userInfo.email);

    return { account: account || null };
  } catch (error: any) {
    console.error('Google OAuth error:', error.message);
    return { account: null, error: error.message };
  }
}

/**
 * DISCORD OAUTH
 */

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;

/**
 * Get Discord OAuth URL
 */
export function getDiscordOAuthUrl(state: string, redirectUri?: string): string {
  if (!DISCORD_CLIENT_ID) {
    if (!warnedMissingDiscordOAuth) {
      console.warn('[OAUTH] Discord OAuth not configured: login will not work.');
      warnedMissingDiscordOAuth = true;
    }
    throw new Error('Discord OAuth not configured');
  }

  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    redirect_uri: redirectUri || DISCORD_REDIRECT_URI || '',
    response_type: 'code',
    scope: 'identify email',
    state,
  });

  return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
}

/**
 * Exchange Discord authorization code for tokens and user info
 */
export async function exchangeDiscordCode(
  code: string,
  redirectUri?: string
): Promise<{ account: OAuthAccount | null; error?: string }> {
  if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET) {
    return { account: null, error: 'Discord OAuth not configured' };
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri || DISCORD_REDIRECT_URI || '',
        scope: 'identify email',
      }).toString(),
    });

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      return { account: null, error: 'Failed to exchange authorization code' };
    }

    // Get user info
    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const userInfo = await userRes.json();

    if (!userInfo.email) {
      return {
        account: null,
        error: 'Discord account must have a verified email',
      };
    }

    // Find or create account
    const account = await oauthFindOrCreate(userInfo.email);

    return { account: account || null };
  } catch (error: any) {
    console.error('Discord OAuth error:', error.message);
    return { account: null, error: error.message };
  }
}

/**
 * Validate OAuth configuration
 */
export function validateOAuthConfig(): {
  google: boolean;
  discord: boolean;
} {
  return {
    google: !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET),
    discord: !!(DISCORD_CLIENT_ID && DISCORD_CLIENT_SECRET),
  };
}
