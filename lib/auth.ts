import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { query } from './db';
import type { Account } from './db';
import type { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_EXPIRY = '90d'; // 90 days
export const AUTH_COOKIE_NAME = 'aethermoor_auth';
const AUTH_COOKIE_MAX_AGE_SECONDS = 90 * 24 * 60 * 60;

export interface JwtPayload {
  accountId: string;
  playerId: string;
  email: string;
  iat: number;
  exp: number;
}

export interface AuthContext {
  accountId: string;
  playerId: string;
  email: string;
}

/**
 * Validate JWT secret is set properly
 */
function validateJwtSecret(): void {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    console.warn('⚠ JWT_SECRET not set or too short (min 32 chars). Using dev secret.');
  }
}

validateJwtSecret();

/**
 * Hash password
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Verify password
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Issue JWT token
 */
export function issueJwt(accountId: string, playerId: string, email: string): string {
  const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
    accountId,
    playerId,
    email,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

/**
 * Verify and decode JWT token
 */
export function verifyJwt(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Register a new account
 */
export async function registerAccount(
  email: string,
  password: string
): Promise<{ accountId: string; playerId: string; token: string } | null> {
  try {
    // Check if account exists
    const existing = await query<Account>(`SELECT id FROM accounts WHERE email = $1`, [email]);
    if (existing.rows.length > 0) {
      return null; // Account already exists
    }

    const accountId = uuidv4();
    const playerId = `${email.split('@')[0]}-${uuidv4().substring(0, 8)}`;
    const passwordHash = await hashPassword(password);

    // Create account
    await query(
      `INSERT INTO accounts (id, email, password_hash, player_id, verified)
       VALUES ($1, $2, $3, $4, $5)`,
      [accountId, email, passwordHash, playerId, false]
    );

    // Create player record
    await query(
      `INSERT INTO players (player_id, account_id, tokens)
       VALUES ($1, $2, $3)`,
      [playerId, accountId, 50] // Bonus tokens for new players
    );

    // Issue JWT
    const token = issueJwt(accountId, playerId, email);

    return { accountId, playerId, token };
  } catch (error) {
    console.error('Register account error:', error);
    return null;
  }
}

/**
 * Login with email and password
 */
export async function login(
  email: string,
  password: string
): Promise<{ accountId: string; playerId: string; token: string } | null> {
  try {
    const result = await query<Account>(
      `SELECT id, password_hash, player_id FROM accounts WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return null; // Account not found
    }

    const account = result.rows[0];
    const passwordMatch = await verifyPassword(password, account.password_hash);

    if (!passwordMatch) {
      return null; // Password incorrect
    }

    const token = issueJwt(account.id, account.player_id, email);

    return {
      accountId: account.id,
      playerId: account.player_id,
      token,
    };
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
}

/**
 * Request password reset (generate token)
 */
export async function requestPasswordReset(email: string): Promise<string | null> {
  try {
    const resetToken = uuidv4();
    const resetExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    const result = await query(
      `UPDATE accounts
       SET reset_token = $1, reset_expires = $2
       WHERE email = $3
       RETURNING id`,
      [resetToken, resetExpires, email]
    );

    if (result.rows.length === 0) {
      return null; // Account not found
    }

    return resetToken;
  } catch (error) {
    console.error('Request password reset error:', error);
    return null;
  }
}

/**
 * Reset password with token
 */
export async function resetPassword(resetToken: string, newPassword: string): Promise<boolean> {
  try {
    const passwordHash = await hashPassword(newPassword);

    const result = await query(
      `UPDATE accounts
       SET password_hash = $1, reset_token = NULL, reset_expires = NULL
       WHERE reset_token = $2 AND reset_expires > NOW()`,
      [passwordHash, resetToken]
    );

    return result.rowCount! > 0;
  } catch (error) {
    console.error('Reset password error:', error);
    return false;
  }
}

/**
 * Change password (requires current password)
 */
export async function changePassword(
  accountId: string,
  currentPassword: string,
  newPassword: string
): Promise<boolean> {
  try {
    const result = await query<Account>(
      `SELECT password_hash FROM accounts WHERE id = $1`,
      [accountId]
    );

    if (result.rows.length === 0) {
      return false; // Account not found
    }

    const passwordMatch = await verifyPassword(currentPassword, result.rows[0].password_hash);
    if (!passwordMatch) {
      return false; // Current password incorrect
    }

    const newPasswordHash = await hashPassword(newPassword);

    const updateResult = await query(
      `UPDATE accounts SET password_hash = $1 WHERE id = $2`,
      [newPasswordHash, accountId]
    );

    return updateResult.rowCount! > 0;
  } catch (error) {
    console.error('Change password error:', error);
    return false;
  }
}

/**
 * Authenticate request (extract JWT from headers)
 */
export function authenticateFromHeaders(authHeader?: string): AuthContext | null {
  const token = extractBearerToken(authHeader);
  if (!token) return null;
  const decoded = verifyJwt(token);

  if (!decoded) {
    return null;
  }

  return {
    accountId: decoded.accountId,
    playerId: decoded.playerId,
    email: decoded.email,
  };
}

export function authenticateRequest(request: NextRequest): AuthContext | null {
  const headerCtx = authenticateFromHeaders(request.headers.get('authorization') || undefined);
  if (headerCtx) return headerCtx;

  const cookieToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!cookieToken) return null;
  const decoded = verifyJwt(cookieToken);
  if (!decoded) return null;

  return {
    accountId: decoded.accountId,
    playerId: decoded.playerId,
    email: decoded.email,
  };
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const headerToken = extractBearerToken(request.headers.get('authorization') || undefined);
  if (headerToken) return headerToken;
  return request.cookies.get(AUTH_COOKIE_NAME)?.value || null;
}

export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: AUTH_COOKIE_MAX_AGE_SECONDS,
  });
}

export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

function extractBearerToken(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}
