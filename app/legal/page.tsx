'use client';

import React from 'react';

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function LegalPage() {
  return (
    <div style={{
      margin: 0,
      background: '#0d0a06',
      color: '#d4b896',
      fontFamily: 'Georgia, serif',
      lineHeight: 1.6,
      minHeight: '100dvh',
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px 48px' }}>
        <h1 style={{ color: '#f0c060', fontFamily: '"Cinzel", Georgia, serif', letterSpacing: 1 }}>
          Aethermoor Legal
        </h1>
        <div style={{ color: '#8a6f4b', fontSize: 13 }}>Last updated: 2026-03-11</div>

        {/* Sticky nav */}
        <nav aria-label="Legal sections" style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background: '#13100a',
          border: '1px solid #2e2010',
          padding: 10,
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          marginBottom: 14,
          marginTop: 14,
        }}>
          {[
            { id: 'terms',   label: 'Terms of Service' },
            { id: 'privacy', label: 'Privacy Policy' },
            { id: 'refund',  label: 'Refund Policy' },
          ].map(({ id, label }) => (
            <button key={id} onClick={() => scrollTo(id)} style={{
              color: '#f0c060',
              background: 'none',
              border: '1px solid #c4873a55',
              padding: '6px 10px',
              fontSize: 14,
              cursor: 'pointer',
              fontFamily: 'Georgia, serif',
            }}>
              {label}
            </button>
          ))}
          <a href="/" style={{
            color: '#f0c060',
            textDecoration: 'none',
            border: '1px solid #c4873a55',
            padding: '6px 10px',
            fontSize: 14,
          }}>
            Back to Game
          </a>
        </nav>

        {/* Terms */}
        <section id="terms" style={{
          background: '#13100a',
          border: '1px solid #2e2010',
          padding: 16,
          marginBottom: 12,
          scrollMarginTop: 72,
        }}>
          <h2 style={{ color: '#f0c060', fontFamily: '"Cinzel", Georgia, serif', letterSpacing: 1 }}>
            Terms of Service
          </h2>
          <p>Aethermoor is a fantasy roleplaying game for players aged 18+. By using the game, you agree not to misuse the service, attempt fraud, or abuse staff/community channels.</p>
          <p>Accounts, virtual currency/tokens, and progression systems may be adjusted for balance, bug fixes, safety, or policy compliance.</p>
        </section>

        {/* Privacy */}
        <section id="privacy" style={{
          background: '#13100a',
          border: '1px solid #2e2010',
          padding: 16,
          marginBottom: 12,
          scrollMarginTop: 72,
        }}>
          <h2 style={{ color: '#f0c060', fontFamily: '"Cinzel", Georgia, serif', letterSpacing: 1 }}>
            Privacy Policy
          </h2>
          <p>The game uses local storage for save data and may store account-related data on backend services when signed in. Payment processing is handled by third-party providers.</p>
          <p>We do not sell personal data. Contact support for data access or removal requests where applicable.</p>
        </section>

        {/* Refund */}
        <section id="refund" style={{
          background: '#13100a',
          border: '1px solid #2e2010',
          padding: 16,
          marginBottom: 12,
          scrollMarginTop: 72,
        }}>
          <h2 style={{ color: '#f0c060', fontFamily: '"Cinzel", Georgia, serif', letterSpacing: 1 }}>
            Refund Policy
          </h2>
          <p>Token purchases are generally non-refundable once delivered. If you experience a billing error, duplicate charge, or failed delivery, contact support with transaction details.</p>
          <p>
            Support contact:{' '}
            <a href="mailto:support.aethermoor@gmail.com" style={{ color: '#f0c060', textDecoration: 'underline', textUnderlineOffset: 2 }}>
              support.aethermoor@gmail.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
