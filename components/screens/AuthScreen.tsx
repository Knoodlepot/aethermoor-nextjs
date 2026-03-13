'use client';

import React from 'react';
import { storageSet } from '@/hooks/useLocalStorage';

// ── OAuth config ──
const GOOGLE_CLIENT_ID = '899787108374-ichv1no0u6oncvtjo5asrf8h0cttj4im.apps.googleusercontent.com';
const DISCORD_CLIENT_ID = '1480701445266477196';

type AuthMode = 'login' | 'register' | 'forgot' | 'reset' | 'verify_sent';

interface AuthScreenProps {
  onAuth: (data: any) => void;
  resetToken?: string | null;
}

// ── Hardcoded dark styles (no ThemeProvider — appears before game loads) ──
const S = {
  bg: '#0d0a06',
  panel: '#13100a',
  border: '#2e2010',
  gold: '#f0c060',
  accent: '#c4873a',
  text: '#d4b896',
  muted: '#9a7a55',
  faint: '#6a523c',
  error: '#c04040',
  success: '#60a060',
  input: '#0a0805',
};

function passwordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  const colors = ['', '#c03030', '#c06030', '#c0a030', '#60a060', '#3090c0'];
  return { score, label: labels[score] || '', color: colors[score] || S.muted };
}

export function AuthScreen({ onAuth, resetToken }: AuthScreenProps) {
  const [mode, setMode] = React.useState<AuthMode>(resetToken ? 'reset' : 'login');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPw, setConfirmPw] = React.useState('');
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [localResetToken, setLocalResetToken] = React.useState<string | null>(resetToken || null);

  // Update mode and local token when resetToken prop changes
  React.useEffect(() => {
    if (resetToken) {
      setLocalResetToken(resetToken);
      if (mode === 'login') {
        setMode('reset');
      }
    }
  }, [resetToken, mode]);

  // On mount: handle OAuth redirect codes in URL params
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const googleCode = params.get('code');
    const state = params.get('state');
    const oauthError = params.get('error');

    if (oauthError) {
      setError('OAuth sign-in was cancelled or failed.');
      return;
    }

    if (googleCode) {
      const provider = state?.startsWith('discord') ? 'discord' : 'google';
      setLoading(true);
      fetch(`/api/auth/oauth/${provider}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: googleCode, redirectUri: window.location.origin + window.location.pathname }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.token) {
            storageSet('rpg-auth-token', data.token);
            onAuth(data);
          } else {
            setError(data.error || 'OAuth login failed.');
          }
        })
        .catch(() => setError('OAuth network error.'))
        .finally(() => setLoading(false));

      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function getRedirectUri() {
    return window.location.origin + window.location.pathname;
  }

  function handleGoogleOAuth() {
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: getRedirectUri(),
      response_type: 'code',
      scope: 'openid email profile',
      state: 'google_' + Math.random().toString(36).slice(2),
    });
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  }

  function handleDiscordOAuth() {
    const params = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      redirect_uri: getRedirectUri(),
      response_type: 'code',
      scope: 'identify email',
      state: 'discord_' + Math.random().toString(36).slice(2),
    });
    window.location.href = `https://discord.com/api/oauth2/authorize?${params}`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (mode === 'register' && password !== confirmPw) {
      setError('Passwords do not match.');
      return;
    }
    if (mode === 'register' && password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      let endpoint = '';
      let body: Record<string, string> = {};

      if (mode === 'login') {
        endpoint = '/api/auth/login';
        body = { email, password };
      } else if (mode === 'register') {
        endpoint = '/api/auth/register';
        body = { email, password };
      } else if (mode === 'forgot') {
        endpoint = '/api/auth/forgot-password';
        body = { email };
      } else if (mode === 'reset') {
        endpoint = '/api/auth/reset-password';
        body = { token: localResetToken || '', password };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong.');
        return;
      }

      if (mode === 'login' || mode === 'register') {
        if (data.token) {
          storageSet('authToken', data.token);
          onAuth(data);
        } else if (mode === 'register') {
          setMode('verify_sent');
        }
      } else if (mode === 'forgot') {
        setMode('verify_sent');
        setSuccess('Password reset email sent. Check your inbox.');
      } else if (mode === 'reset') {
        setSuccess('Password reset. You can now log in.');
        setMode('login');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const pwStrength = (mode === 'register' || mode === 'reset') && password
    ? passwordStrength(password)
    : null;

  const TITLE: Record<AuthMode, string> = {
    login: 'Sign In',
    register: 'Create Account',
    forgot: 'Forgot Password',
    reset: 'Reset Password',
    verify_sent: 'Check Your Email',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: S.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        fontFamily: "'Crimson Text', Georgia, serif",
        color: S.text,
      }}
    >
      <div
        style={{
          background: S.panel,
          border: `1px solid ${S.border}`,
          width: '100%',
          maxWidth: 400,
          boxShadow: '0 8px 40px #00000088',
        }}
      >
        {/* Logo / title */}
        <div
          style={{
            background: S.bg,
            borderBottom: `1px solid ${S.border}`,
            padding: '20px 24px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontFamily: "'Cinzel','Palatino Linotype',serif",
              color: S.gold,
              fontSize: 22,
              letterSpacing: 4,
              marginBottom: 4,
            }}
          >
            AETHERMOOR
          </div>
          <div style={{ fontSize: 12, color: S.muted, letterSpacing: 1 }}>
            {TITLE[mode].toUpperCase()}
          </div>
        </div>

        <div style={{ padding: '24px 24px 20px' }}>

          {/* Verify-sent / success state */}
          {mode === 'verify_sent' ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📬</div>
              <div style={{ fontSize: 14, color: S.text, lineHeight: 1.6, marginBottom: 16 }}>
                {success || 'A verification email has been sent. Check your inbox to continue.'}
              </div>
              <button
                onClick={() => { setMode('login'); setSuccess(''); }}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'transparent',
                  border: `1px solid ${S.accent}`,
                  color: S.accent,
                  cursor: 'pointer',
                  fontFamily: "'Cinzel','Palatino Linotype',serif",
                  fontSize: 12,
                  letterSpacing: 2,
                }}
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Email field */}
              {mode !== 'reset' && (
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 11, color: S.muted, letterSpacing: 1, display: 'block', marginBottom: 4 }}>
                    EMAIL
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    style={{
                      width: '100%',
                      background: S.input,
                      border: `1px solid ${S.border}`,
                      color: S.text,
                      padding: '8px 12px',
                      fontSize: 14,
                      fontFamily: 'inherit',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              )}

              {/* Password field */}
              {(mode === 'login' || mode === 'register' || mode === 'reset') && (
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 11, color: S.muted, letterSpacing: 1, display: 'block', marginBottom: 4 }}>
                    {mode === 'reset' ? 'NEW PASSWORD' : 'PASSWORD'}
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    style={{
                      width: '100%',
                      background: S.input,
                      border: `1px solid ${S.border}`,
                      color: S.text,
                      padding: '8px 12px',
                      fontSize: 14,
                      fontFamily: 'inherit',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  {/* Strength meter */}
                  {pwStrength && password && (
                    <div style={{ marginTop: 6 }}>
                      <div
                        style={{
                          height: 3,
                          background: S.border,
                          borderRadius: 2,
                          overflow: 'hidden',
                          marginBottom: 3,
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${(pwStrength.score / 5) * 100}%`,
                            background: pwStrength.color,
                            transition: 'width 0.2s, background 0.2s',
                          }}
                        />
                      </div>
                      <div style={{ fontSize: 10, color: pwStrength.color }}>{pwStrength.label}</div>
                    </div>
                  )}
                </div>
              )}

              {/* Confirm password (register / reset) */}
              {(mode === 'register' || mode === 'reset') && (
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 11, color: S.muted, letterSpacing: 1, display: 'block', marginBottom: 4 }}>
                    CONFIRM PASSWORD
                  </label>
                  <input
                    type="password"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    required
                    autoComplete="new-password"
                    style={{
                      width: '100%',
                      background: S.input,
                      border: `1px solid ${confirmPw && confirmPw !== password ? S.error : S.border}`,
                      color: S.text,
                      padding: '8px 12px',
                      fontSize: 14,
                      fontFamily: 'inherit',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  {confirmPw && confirmPw !== password && (
                    <div style={{ fontSize: 10, color: S.error, marginTop: 3 }}>Passwords do not match</div>
                  )}
                </div>
              )}

              {/* Error / success messages */}
              {error && (
                <div
                  style={{
                    background: '#2a0808',
                    border: `1px solid ${S.error}44`,
                    padding: '8px 12px',
                    marginBottom: 12,
                    fontSize: 12,
                    color: S.error,
                  }}
                >
                  {error}
                </div>
              )}
              {success && (
                <div
                  style={{
                    background: '#0a2a0a',
                    border: `1px solid ${S.success}44`,
                    padding: '8px 12px',
                    marginBottom: 12,
                    fontSize: 12,
                    color: S.success,
                  }}
                >
                  {success}
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '11px',
                  background: loading ? S.border : S.accent,
                  border: 'none',
                  color: loading ? S.faint : '#fff',
                  cursor: loading ? 'default' : 'pointer',
                  fontFamily: "'Cinzel','Palatino Linotype',serif",
                  fontSize: 13,
                  letterSpacing: 2,
                  transition: 'all 0.2s',
                  marginBottom: 12,
                }}
              >
                {loading ? 'Please wait...' : TITLE[mode].toUpperCase()}
              </button>

              {/* OAuth buttons (login only) */}
              {mode === 'login' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                  <div
                    style={{
                      textAlign: 'center',
                      fontSize: 10,
                      color: S.faint,
                      letterSpacing: 1,
                      marginBottom: 4,
                    }}
                  >
                    OR CONTINUE WITH
                  </div>
                  <button
                    type="button"
                    onClick={handleGoogleOAuth}
                    style={{
                      width: '100%',
                      padding: '9px',
                      background: 'transparent',
                      border: `1px solid ${S.border}`,
                      color: S.text,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontSize: 13,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      transition: 'border-color 0.2s',
                    }}
                  >
                    Google
                  </button>
                  <button
                    type="button"
                    onClick={handleDiscordOAuth}
                    style={{
                      width: '100%',
                      padding: '9px',
                      background: 'transparent',
                      border: `1px solid ${S.border}`,
                      color: '#7289da',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontSize: 13,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      transition: 'border-color 0.2s',
                    }}
                  >
                    Discord
                  </button>
                </div>
              )}
            </form>
          )}

          {/* Mode-switching links */}
          {mode !== 'verify_sent' && (
            <div style={{ borderTop: `1px solid ${S.border}`, paddingTop: 14, fontSize: 12, textAlign: 'center' }}>
              {mode === 'login' && (
                <>
                  <span style={{ color: S.muted }}>No account? </span>
                  <button
                    onClick={() => { setMode('register'); setError(''); }}
                    style={{ background: 'none', border: 'none', color: S.accent, cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', padding: 0 }}
                  >
                    Create one
                  </button>
                  <span style={{ color: S.faint, margin: '0 10px' }}>·</span>
                  <button
                    onClick={() => { setMode('forgot'); setError(''); }}
                    style={{ background: 'none', border: 'none', color: S.muted, cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', padding: 0 }}
                  >
                    Forgot password?
                  </button>
                </>
              )}
              {mode === 'register' && (
                <>
                  <span style={{ color: S.muted }}>Already have an account? </span>
                  <button
                    onClick={() => { setMode('login'); setError(''); }}
                    style={{ background: 'none', border: 'none', color: S.accent, cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', padding: 0 }}
                  >
                    Sign in
                  </button>
                </>
              )}
              {(mode === 'forgot' || mode === 'reset') && (
                <button
                  onClick={() => { setMode('login'); setError(''); }}
                  style={{ background: 'none', border: 'none', color: S.muted, cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', padding: 0 }}
                >
                  Back to sign in
                </button>
              )}
            </div>
          )}

          {/* Play as guest (login only) */}
          {mode === 'login' && (
            <div style={{ marginTop: 12, textAlign: 'center' }}>
              <button
                onClick={() => onAuth({ guest: true })}
                style={{
                  background: 'none',
                  border: 'none',
                  color: S.faint,
                  cursor: 'pointer',
                  fontSize: 11,
                  fontFamily: 'inherit',
                  padding: 0,
                  letterSpacing: 0.5,
                }}
              >
                Play as guest (no cloud save)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
