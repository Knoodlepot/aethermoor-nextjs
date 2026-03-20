import type { Metadata } from 'next';
import Link from 'next/link';
import React from 'react';

export const metadata: Metadata = {
  title: 'Pricing — Aethermoor',
  description:
    'Start free with 50 tokens. Top up whenever you like — no subscription required. Choose from six token bundles to fuel your AI-narrated adventure.',
};

const PACKAGES = [
  { label: 'Starter',    tokens: 100,   price: '£1.00',  pencePerToken: 1.0  },
  { label: 'Adventurer', tokens: 290,   price: '£2.50',  pencePerToken: 0.86 },
  { label: 'Hero',       tokens: 650,   price: '£5.00',  pencePerToken: 0.77 },
  { label: 'Legend',     tokens: 1500,  price: '£9.99',  pencePerToken: 0.67 },
  { label: 'Champion',   tokens: 3500,  price: '£19.99', pencePerToken: 0.57 },
  { label: 'Immortal',   tokens: 8500,  price: '£49.99', pencePerToken: 0.59 },
];

const MODEL_COSTS = [
  { name: 'Haiku',  cost: 1,  desc: 'Fast & snappy narration' },
  { name: 'Sonnet', cost: 4,  desc: 'Richer, more detailed prose' },
  { name: 'Opus',   cost: 20, desc: 'Deepest storytelling' },
];

const page: React.CSSProperties = {
  minHeight: '100vh',
  background: '#0d0b07',
  color: '#c4a87a',
  fontFamily: 'Georgia, serif',
  padding: '48px 24px 80px',
};
const inner: React.CSSProperties = { maxWidth: 780, margin: '0 auto' };
const heading: React.CSSProperties = {
  fontFamily: '"Cinzel", Georgia, serif',
  color: '#f0c060',
  fontSize: '2rem',
  letterSpacing: 2,
  textAlign: 'center',
  marginBottom: 8,
};
const sub: React.CSSProperties = {
  textAlign: 'center',
  color: '#a08060',
  fontSize: '1rem',
  marginBottom: 48,
};
const sectionTitle: React.CSSProperties = {
  fontFamily: '"Cinzel", Georgia, serif',
  color: '#c4873a',
  fontSize: '1rem',
  letterSpacing: 1,
  borderBottom: '1px solid #2e2010',
  paddingBottom: 6,
  marginBottom: 20,
  marginTop: 48,
};
const grid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: 16,
};
const card: React.CSSProperties = {
  background: '#13100a',
  border: '1px solid #2e2010',
  borderRadius: 4,
  padding: '20px 18px',
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
};
const cardTitle: React.CSSProperties = {
  fontFamily: '"Cinzel", Georgia, serif',
  color: '#f0c060',
  fontSize: '0.95rem',
  letterSpacing: 1,
};
const cardTokens: React.CSSProperties = {
  color: '#80c060',
  fontSize: '1.4rem',
  fontWeight: 700,
};
const cardPrice: React.CSSProperties = { color: '#c4a87a', fontSize: '1rem' };
const cardPer: React.CSSProperties = { color: '#6a5535', fontSize: '0.8rem' };

const modelRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '10px 0',
  borderBottom: '1px solid #1a1408',
};

const ctaBox: React.CSSProperties = {
  marginTop: 56,
  textAlign: 'center',
  padding: '28px 24px',
  background: '#13100a',
  border: '1px solid #2e2010',
  borderRadius: 4,
};
const ctaLink: React.CSSProperties = {
  display: 'inline-block',
  background: '#c4873a',
  color: '#0d0b07',
  fontFamily: '"Cinzel", Georgia, serif',
  fontWeight: 700,
  padding: '12px 32px',
  textDecoration: 'none',
  borderRadius: 3,
  fontSize: '1rem',
  letterSpacing: 1,
};
const navBar: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 40,
  paddingBottom: 16,
  borderBottom: '1px solid #1a1408',
};
const navLink: React.CSSProperties = { color: '#a08060', textDecoration: 'none', fontSize: '0.9rem' };
const faqItem: React.CSSProperties = { marginBottom: 24 };
const faqQ: React.CSSProperties = { color: '#f0c060', fontFamily: '"Cinzel", Georgia, serif', fontSize: '0.9rem', marginBottom: 6 };
const faqA: React.CSSProperties = { color: '#a08060', fontSize: '0.9rem', lineHeight: 1.7 };

export default function PricingPage() {
  return (
    <div style={page}>
      <div style={inner}>
        {/* Nav */}
        <nav style={navBar}>
          <Link href="/" style={{ ...navLink, color: '#f0c060', fontFamily: '"Cinzel", Georgia, serif', letterSpacing: 1 }}>
            ⚔ AETHERMOOR
          </Link>
          <div style={{ display: 'flex', gap: 24 }}>
            <Link href="/" style={navLink}>Play Free</Link>
            <Link href="/legal" style={navLink}>Legal</Link>
          </div>
        </nav>

        {/* Header */}
        <h1 style={heading}>Tokens &amp; Pricing</h1>
        <p style={sub}>
          Start free with 50 tokens. No subscription — top up whenever you like.
        </p>

        {/* Packages */}
        <h2 style={sectionTitle}>Token Bundles</h2>
        <div style={grid}>
          {PACKAGES.map((p) => (
            <div key={p.label} style={card}>
              <div style={cardTitle}>{p.label}</div>
              <div style={cardTokens}>{p.tokens.toLocaleString()}</div>
              <div style={cardPrice}>{p.price}</div>
              <div style={cardPer}>{p.pencePerToken.toFixed(2)}p per token</div>
            </div>
          ))}
        </div>

        {/* Model costs */}
        <h2 style={sectionTitle}>Token Cost per Turn</h2>
        <p style={{ color: '#a08060', fontSize: '0.9rem', marginBottom: 16 }}>
          Each time the narrator responds, tokens are spent based on the AI model you choose in Options.
        </p>
        {MODEL_COSTS.map((m) => (
          <div key={m.name} style={modelRow}>
            <span style={{ fontFamily: '"Cinzel", Georgia, serif', color: '#f0c060', minWidth: 80 }}>{m.name}</span>
            <span style={{ color: '#80c060', fontWeight: 700, minWidth: 60 }}>{m.cost} token{m.cost !== 1 ? 's' : ''}/turn</span>
            <span style={{ color: '#a08060', fontSize: '0.9rem' }}>{m.desc}</span>
          </div>
        ))}

        {/* FAQ */}
        <h2 style={sectionTitle}>Common Questions</h2>
        <div style={faqItem}>
          <div style={faqQ}>Do tokens expire?</div>
          <div style={faqA}>No. Tokens never expire — they stay on your account until you use them.</div>
        </div>
        <div style={faqItem}>
          <div style={faqQ}>Can I try before I buy?</div>
          <div style={faqA}>Yes. Every new account starts with 50 free tokens — enough for a solid session on Haiku, or a few premium turns on Opus.</div>
        </div>
        <div style={faqItem}>
          <div style={faqQ}>What currencies are supported?</div>
          <div style={faqA}>Prices are shown in GBP and processed securely via Stripe. Stripe handles currency conversion for international cards at their standard rate.</div>
        </div>
        <div style={faqItem}>
          <div style={faqQ}>Can I get a refund?</div>
          <div style={faqA}>Yes — unused tokens are refundable within 14 days of purchase. See the <Link href="/legal" style={{ color: '#f0c060' }}>Refund Policy</Link> for details.</div>
        </div>

        {/* CTA */}
        <div style={ctaBox}>
          <p style={{ color: '#c4a87a', marginBottom: 20, fontSize: '1rem' }}>
            Ready to enter the world?
          </p>
          <Link href="/" style={ctaLink}>
            Play Free — 50 Tokens Included
          </Link>
        </div>
      </div>
    </div>
  );
}
