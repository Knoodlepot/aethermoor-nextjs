'use client';

import { useState, useCallback, useEffect } from 'react';
import { storageGet, storageSet, storageRemove } from './useLocalStorage';

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
  const [authStatus, setAuthStatus] = useState<'loading' | 'authed' | 'unauthed'>('loading');

  // On mount, load token from localStorage and verify it
  useEffect(() => {
    const storedToken = storageGet('rpg-auth-token');
    const storedEmail = storageGet('rpg-auth-email');

    if (storedToken) {
      setToken(storedToken);
      setEmail(storedEmail);
      // Verify token is still valid
      verifyTokenValidity(storedToken);
    } else {
      setAuthStatus('unauthed');
    }
  }, []);

  /**
   * Verify JWT token is still valid by calling /auth/me
   */
  const verifyTokenValidity = useCallback(async (jwtToken: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });

      if (res.ok) {
        setAuthStatus('authed');
      } else {
        // Token invalid, clear it
        storageRemove('rpg-auth-token');
        storageRemove('rpg-auth-email');
        setToken(null);
        setEmail(null);
        setAuthStatus('unauthed');
      }
    } catch (error) {
      console.error('Token verification error:', error);
      setAuthStatus('unauthed');
    }
  }, []);

  /**
   * Register new account
   */
  const register = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (res.ok && data.token) {
          storageSet('rpg-auth-token', data.token);
          storageSet('rpg-auth-email', email);
          setToken(data.token);
          setEmail(email);
          setAuthStatus('authed');
          return { success: true };
        }

        return { success: false, error: data.error || 'Registration failed' };
      } catch (error: any) {
        return { success: false, error: error.message };
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
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (res.ok && data.token) {
          storageSet('rpg-auth-token', data.token);
          storageSet('rpg-auth-email', email);
          setToken(data.token);
          setEmail(email);
          setAuthStatus('authed');
          return { success: true };
        }

        return { success: false, error: data.error || 'Login failed' };
      } catch (error: any) {
        return { success: false, error: error.message };
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
          body: JSON.stringify({ email }),
        });

        const data = await res.json();

        if (res.ok) {
          return { success: true };
        }

        return { success: false, error: data.error || 'Request failed' };
      } catch (error: any) {
        return { success: false, error: error.message };
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
          body: JSON.stringify({ token, newPassword }),
        });

        const data = await res.json();

        if (res.ok) {
          return { success: true };
        }

        return { success: false, error: data.error || 'Reset failed' };
      } catch (error: any) {
        return { success: false, error: error.message };
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
      if (!token) {
        return { success: false, error: 'Not authenticated' };
      }

      try {
        const res = await fetch('/api/auth/change-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ currentPassword, newPassword }),
        });

        const data = await res.json();

        if (res.ok) {
          return { success: true };
        }

        return { success: false, error: data.error || 'Change failed' };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
    [token]
  );

  /**
   * Logout
   */
  const logout = useCallback(async () => {
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (error) {
        console.warn('Logout error:', error);
      }
    }

    storageRemove('rpg-auth-token');
    storageRemove('rpg-auth-email');
    setToken(null);
    setEmail(null);
    setAuthStatus('unauthed');
  }, [token]);

  return {
    token,
    email,
    authStatus,
    register,
    login,
    logout,
    requestPasswordReset,
    resetPassword,
    changePassword,
  };
}
