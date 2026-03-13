'use client';

import React, { useState } from 'react';
import { HowToPlayModal } from '@/components/modals/HowToPlayModal';
import { PatchNotesScreen } from '@/components/screens/PatchNotesScreen';
import { THEMES, type ThemeKey } from '@/components/providers/ThemeProvider';

export default function Home() {
  const [showGuide, setShowGuide] = useState(false);
  const [showPatches, setShowPatches] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ThemeKey>('standard');

  const buttonStyle = {
    padding: '0.85rem 1.5rem',
    background: '#c9a84c',
    color: '#0d0d1a',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.95rem',
    fontFamily: 'Georgia, serif',
    fontWeight: 'bold' as const,
    letterSpacing: '0.05em',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block',
  };

  const secondaryButtonStyle = {
    padding: '0.75rem 1.25rem',
    background: 'transparent',
    color: '#c9a84c',
    border: '1px solid #c9a84c',
    borderRadius: '4px',
    fontSize: '0.9rem',
    fontFamily: 'Georgia, serif',
    fontWeight: 'bold' as const,
    letterSpacing: '0.05em',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block',
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100dvh',
      backgroundColor: '#0d0a06',
      fontFamily: 'Georgia, serif',
      color: '#d4b896',
      padding: '1rem',
    }}>
      <div style={{ maxWidth: '700px', width: '100%', textAlign: 'center' }}>
        {/* Header */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚔️</div>
          <h1 style={{
            fontSize: '3rem',
            color: '#c9a84c',
            marginBottom: '0.5rem',
            letterSpacing: '0.12em',
            fontFamily: 'Cinzel, serif',
            fontWeight: 'bold',
          }}>
            AETHERMOOR
          </h1>
          <p style={{
            fontSize: '0.95rem',
            marginBottom: '1.5rem',
            lineHeight: '1.8',
            color: '#b8925a',
            maxWidth: '500px',
            margin: '1rem auto',
          }}>
            An AI-powered browser RPG where your choices matter, and every decision shapes your destiny.
          </p>
        </div>

        {/* Main Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '2rem',
        }}>
          <a href="/game" style={buttonStyle}>
            New Game
          </a>
          <a href="/game" style={buttonStyle}>
            Load Game
          </a>
          <button onClick={() => setShowGuide(true)} style={secondaryButtonStyle}>
            How to Play
          </button>
          <button onClick={() => setShowPatches(true)} style={secondaryButtonStyle}>
            Patch Notes
          </button>
        </div>

        {/* Account & Theme */}
        <div style={{
          display: 'flex',
          gap: '1.5rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
          alignItems: 'center',
          marginBottom: '2rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid #2e2010',
        }}>
          <a href="/auth" style={secondaryButtonStyle}>
            Account
          </a>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <label style={{ fontSize: '0.9rem', color: '#b8925a' }}>Theme:</label>
            <select
              value={selectedTheme}
              onChange={(e) => setSelectedTheme(e.target.value as ThemeKey)}
              style={{
                padding: '0.5rem 0.75rem',
                background: '#0a0805',
                color: '#c9a84c',
                border: '1px solid #2e2010',
                borderRadius: '3px',
                fontSize: '0.9rem',
                fontFamily: 'Georgia, serif',
                cursor: 'pointer',
              }}
            >
              {Object.entries(THEMES).map(([key, theme]) => (
                <option key={key} value={key}>
                  {theme.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          paddingTop: '1.5rem',
          borderTop: '1px solid #2e2010',
          fontSize: '0.8rem',
          color: '#7a6040',
        }}>
          <p>v0.3.0 — Next.js Migration Phase 5</p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
            Your theme preference resets on reload. Sign in to save your settings.
          </p>
        </div>
      </div>

      {/* Modals */}
      {showGuide && <HowToPlayModal onClose={() => setShowGuide(false)} />}
      {showPatches && <PatchNotesScreen onClose={() => setShowPatches(false)} />}
    </div>
  );
}
