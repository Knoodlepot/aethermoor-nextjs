'use client';

import { useState, useCallback, useEffect } from 'react';

export interface AuthContext {
  token: string | null;
  email: string | null;
  authStatus: 'loading' | 'authed' | 'unauthed';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ResetPasswordConfirmRequest {
  token: string;
  newPassword: string;
}

/**
 * useAuth - Manage authentication state and JWT lifecycle
 */
export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<'loading' | 'authed' | 'unauthed'>('loading');

  /**
   * Verify cookie-backed session by calling /auth/me
   */
  const verifySession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });

      if (res.ok) {
        const data = await res.json();
        setToken('cookie-session');
        setEmail(data.email || null);
        setPlayerId(data.playerId ? String(data.playerId) : null);
        setAuthStatus('authed');
      } else {
        setToken(null);
        setEmail(null);
        setPlayerId(null);
        setAuthStatus('unauthed');
      }
    } catch (error) {
      console.error('Session verification error:', error);
      setToken(null);
      setEmail(null);
      setPlayerId(null);
      setAuthStatus('unauthed');
    }
  }, []);

  // On mount, verify session cookie
  useEffect(() => {
    void verifySession();
  }, [verifySession]);

  /**
   * Register new account
   */
  const register = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (res.ok && data.token) {
          setToken('cookie-session');
          setEmail(data.email || email);
          setAuthStatus('authed');
          return { success: true };
        }

        return { success: false, error: data.error || 'Registration failed' };
      } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : 'Registration failed' };
      }
    },
    []
  );

  /**
   * Login with email and password
   */
  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (res.ok && data.token) {
          setToken('cookie-session');
          setEmail(data.email || email);
          setAuthStatus('authed');
          return { success: true };
        }

        return { success: false, error: data.error || 'Login failed' };
      } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : 'Login failed' };
      }
    },
    []
  );

  /**
   * Request password reset email
   */
  const requestPasswordReset = useCallback(
    async (email: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email }),
        });

        const data = await res.json();

        if (res.ok) {
          return { success: true };
        }

        return { success: false, error: data.error || 'Request failed' };
      } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : 'Request failed' };
      }
    },
    []
  );

  /**
   * Confirm password reset with token
   */
  const resetPassword = useCallback(
    async (token: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ token, newPassword }),
        });

        const data = await res.json();

        if (res.ok) {
          return { success: true };
        }

        return { success: false, error: data.error || 'Reset failed' };
      } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : 'Reset failed' };
      }
    },
    []
  );

  /**
   * Change password (requires current password)
   */
  const changePassword = useCallback(
    async (
      currentPassword: string,
      newPassword: string
    ): Promise<{ success: boolean; error?: string }> => {
      if (authStatus !== 'authed') {
        return { success: false, error: 'Not authenticated' };
      }

      try {
        const res = await fetch('/api/auth/change-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ currentPassword, newPassword }),
        });

        const data = await res.json();

        if (res.ok) {
          return { success: true };
        }

        return { success: false, error: data.error || 'Change failed' };
      } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : 'Change failed' };
      }
    },
    [authStatus]
  );

  /**
   * Logout
   */
  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.warn('Logout error:', error);
    }

    setToken(null);
    setEmail(null);
    setAuthStatus('unauthed');
  }, []);

  return {
    token,
    email,
    playerId,
    authStatus,
    register,
    login,
    logout,
    requestPasswordReset,
    resetPassword,
    changePassword,
  };
}
