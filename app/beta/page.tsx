'use client';

import React, { useState } from 'react';

export default function BetaPage() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/beta/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      if (res.ok) {
        window.location.href = '/';
      } else if (res.status === 429) {
        setError('Too many attempts. Please wait a few minutes and try again.');
      } else {
        setError('Invalid access code. Please check and try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0d0d0f',
      fontFamily: "'Georgia', serif",
      padding: '1rem',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '380px',
        background: '#18181c',
        border: '1px solid #2e2e38',
        borderRadius: '8px',
        padding: '2.5rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚔</div>
          <h1 style={{ color: '#c9a96e', fontSize: '1.4rem', margin: 0, fontWeight: 'normal', letterSpacing: '0.05em' }}>
            Aethermoor
          </h1>
          <p style={{ color: '#666', fontSize: '0.85rem', margin: '0.5rem 0 0' }}>
            Beta access required
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="password"
            placeholder="Enter access code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            autoFocus
            autoComplete="off"
            style={{
              background: '#0d0d0f',
              border: '1px solid #2e2e38',
              borderRadius: '4px',
              color: '#e0d6c4',
              fontSize: '1rem',
              padding: '0.65rem 0.85rem',
              outline: 'none',
              width: '100%',
              boxSizing: 'border-box',
              letterSpacing: '0.15em',
              fontFamily: 'monospace',
            }}
          />

          {error && (
            <p style={{ color: '#c0392b', fontSize: '0.82rem', margin: 0, textAlign: 'center' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !code.trim()}
            style={{
              background: loading || !code.trim() ? '#2a2a30' : '#c9a96e',
              color: loading || !code.trim() ? '#555' : '#0d0d0f',
              border: 'none',
              borderRadius: '4px',
              padding: '0.65rem',
              fontSize: '0.95rem',
              cursor: loading || !code.trim() ? 'not-allowed' : 'pointer',
              fontFamily: "'Georgia', serif",
              letterSpacing: '0.04em',
              transition: 'background 0.15s',
            }}
          >
            {loading ? 'Checking…' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  );
}
