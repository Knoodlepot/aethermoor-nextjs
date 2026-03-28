'use client';

import React, { useEffect, useState } from 'react';
import { initPostHog } from '@/lib/analytics';

const CONSENT_KEY = 'aethermoor_cookie_consent';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored === 'all') {
      initPostHog();
    } else if (!stored) {
      setVisible(true);
    }
    // 'essential' → no PostHog, no banner
  }, []);

  function accept() {
    localStorage.setItem(CONSENT_KEY, 'all');
    initPostHog();
    setVisible(false);
  }

  function essential() {
    localStorage.setItem(CONSENT_KEY, 'essential');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10000,
        background: '#0d0a06',
        borderTop: '1px solid #2e2010',
        padding: '14px 20px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 12,
        fontFamily: 'Georgia,serif',
        color: '#d4b896',
        fontSize: 13,
      }}
    >
      <span style={{ flex: 1, minWidth: 200 }}>
        We use a session cookie to keep you logged in.{' '}
        <a href="/legal" style={{ color: '#c9a84c', textDecoration: 'underline' }}>
          Privacy policy
        </a>
        . Optional analytics help us improve the game.
      </span>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button
          onClick={essential}
          style={{
            background: 'transparent',
            border: '1px solid #2e2010',
            color: '#9a7a55',
            padding: '7px 14px',
            fontSize: 12,
            fontFamily: 'Cinzel,serif',
            letterSpacing: '0.05em',
            cursor: 'pointer',
            borderRadius: 3,
          }}
        >
          Essential only
        </button>
        <button
          onClick={accept}
          style={{
            background: '#c9a84c22',
            border: '1px solid #c9a84c',
            color: '#c9a84c',
            padding: '7px 14px',
            fontSize: 12,
            fontFamily: 'Cinzel,serif',
            letterSpacing: '0.05em',
            cursor: 'pointer',
            borderRadius: 3,
          }}
        >
          Accept all
        </button>
      </div>
    </div>
  );
}
