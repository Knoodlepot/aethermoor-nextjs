'use client';

import React, { useState } from 'react';

interface UserProfileModalProps {
  email: string;
  onClose: () => void;
  onEmailChange?: (newEmail: string) => void;
  onPasswordChange?: () => void;
}

type Mode = 'main' | 'email' | 'pw';

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#0d0a06',
  border: '1px solid #2e2010',
  color: '#d4b896',
  padding: '10px 14px',
  fontSize: 15,
  fontFamily: 'Georgia,serif',
  outline: 'none',
  borderRadius: 4,
  boxSizing: 'border-box' as const,
};

const btnStyle: React.CSSProperties = {
  width: '100%',
  background: '#c9a84c22',
  border: '1px solid #c9a84c',
  color: '#c9a84c',
  padding: '11px',
  fontSize: 15,
  fontFamily: 'Cinzel,serif',
  letterSpacing: '0.06em',
  cursor: 'pointer',
  borderRadius: 4,
  marginTop: 8,
};

const labelStyle: React.CSSProperties = {
  color: '#7a6040',
  fontSize: 12,
  letterSpacing: '0.05em',
  display: 'block',
  marginBottom: 4,
  fontFamily: 'Cinzel,serif',
};

export function UserProfileModal({
  email,
  onClose,
  onEmailChange,
  onPasswordChange,
}: UserProfileModalProps) {
  const [mode, setMode] = useState<Mode>('main');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Email form state
  const [newEmail, setNewEmail] = useState('');
  const [emailCurrentPw, setEmailCurrentPw] = useState('');

  // Password form state
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  function resetForms() {
    setError('');
    setSuccess('');
    setNewEmail('');
    setEmailCurrentPw('');
    setCurrentPw('');
    setNewPw('');
    setConfirmPw('');
  }

  function goMode(m: Mode) {
    resetForms();
    setMode(m);
  }

  async function handleEmailChange(e: React.FormEvent) {
    e.preventDefault();
    if (!newEmail || !emailCurrentPw) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/change-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ newEmail, currentPassword: emailCurrentPw }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to change email.');
      } else {
        setSuccess('Email updated successfully.');
        onEmailChange?.(newEmail);
        setNewEmail('');
        setEmailCurrentPw('');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPw || !newPw || !confirmPw) {
      setError('Please fill in all fields.');
      return;
    }
    if (newPw !== confirmPw) {
      setError('New passwords do not match.');
      return;
    }
    if (newPw.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to change password.');
      } else {
        setSuccess('Password updated successfully.');
        onPasswordChange?.();
        setCurrentPw('');
        setNewPw('');
        setConfirmPw('');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#0d0a06ee',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        fontFamily: 'Georgia,serif',
        color: '#d4b896',
      }}
    >
      <div
        style={{
          background: '#13100a',
          border: '1px solid #c9a84c',
          width: '100%',
          maxWidth: 420,
          boxShadow: '0 8px 40px #00000099',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: '#0a0805',
            borderBottom: '1px solid #2e2010',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              fontFamily: 'Cinzel,serif',
              color: '#c9a84c',
              fontSize: 14,
              letterSpacing: 2,
            }}
          >
            {mode === 'main'
              ? 'ACCOUNT'
              : mode === 'email'
              ? 'CHANGE EMAIL'
              : 'CHANGE PASSWORD'}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid #2e2010',
              color: '#9a7a55',
              width: 28,
              height: 28,
              cursor: 'pointer',
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 2,
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 20 }}>
          {/* ── MAIN MODE ── */}
          {mode === 'main' && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <span style={labelStyle}>CURRENT EMAIL</span>
                <div
                  style={{
                    background: '#0a0805',
                    border: '1px solid #2e2010',
                    padding: '10px 14px',
                    fontSize: 14,
                    color: '#d4b896',
                    borderRadius: 4,
                    wordBreak: 'break-all',
                  }}
                >
                  {email}
                </div>
              </div>
              <button style={btnStyle} onClick={() => goMode('email')}>
                Change Email
              </button>
              <button style={btnStyle} onClick={() => goMode('pw')}>
                Change Password
              </button>
              <button
                style={{
                  ...btnStyle,
                  background: 'transparent',
                  border: '1px solid #2e2010',
                  color: '#9a7a55',
                  marginTop: 12,
                }}
                onClick={onClose}
              >
                Close
              </button>
            </div>
          )}

          {/* ── EMAIL MODE ── */}
          {mode === 'email' && (
            <form onSubmit={handleEmailChange}>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>NEW EMAIL ADDRESS</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  style={inputStyle}
                  placeholder="newaddress@example.com"
                  autoFocus
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>CURRENT PASSWORD</label>
                <input
                  type="password"
                  value={emailCurrentPw}
                  onChange={(e) => setEmailCurrentPw(e.target.value)}
                  style={inputStyle}
                  placeholder="Enter your current password"
                />
              </div>
              {error && (
                <div style={{ color: '#c03030', fontSize: 12, marginBottom: 10 }}>
                  {error}
                </div>
              )}
              {success && (
                <div style={{ color: '#60a060', fontSize: 12, marginBottom: 10 }}>
                  {success}
                </div>
              )}
              <button type="submit" style={btnStyle} disabled={loading}>
                {loading ? 'Saving...' : 'Update Email'}
              </button>
              <button
                type="button"
                style={{
                  ...btnStyle,
                  background: 'transparent',
                  border: '1px solid #2e2010',
                  color: '#9a7a55',
                }}
                onClick={() => goMode('main')}
              >
                Back
              </button>
            </form>
          )}

          {/* ── PASSWORD MODE ── */}
          {mode === 'pw' && (
            <form onSubmit={handlePasswordChange}>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>CURRENT PASSWORD</label>
                <input
                  type="password"
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  style={inputStyle}
                  placeholder="Enter your current password"
                  autoFocus
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>NEW PASSWORD</label>
                <input
                  type="password"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  style={inputStyle}
                  placeholder="At least 8 characters"
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>CONFIRM NEW PASSWORD</label>
                <input
                  type="password"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  style={inputStyle}
                  placeholder="Repeat new password"
                />
              </div>
              {error && (
                <div style={{ color: '#c03030', fontSize: 12, marginBottom: 10 }}>
                  {error}
                </div>
              )}
              {success && (
                <div style={{ color: '#60a060', fontSize: 12, marginBottom: 10 }}>
                  {success}
                </div>
              )}
              <button type="submit" style={btnStyle} disabled={loading}>
                {loading ? 'Saving...' : 'Update Password'}
              </button>
              <button
                type="button"
                style={{
                  ...btnStyle,
                  background: 'transparent',
                  border: '1px solid #2e2010',
                  color: '#9a7a55',
                }}
                onClick={() => goMode('main')}
              >
                Back
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
