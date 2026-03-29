'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';

const TOUR_KEY = 'ae-tour-completed';

interface Step {
  target: string | null; // data-tour attribute value, null = centered
  title: string;
  body: string;
}

const STEPS: Step[] = [
  {
    target: 'narrative',
    title: 'Your Story',
    body: 'Everything that happens in Aethermoor unfolds here. The narrator describes the world and responds to your every action.',
  },
  {
    target: 'input',
    title: 'Your Voice',
    body: 'Type anything to interact with the world. Speak to an NPC, fight an enemy, explore a building — natural language, no commands needed.',
  },
  {
    target: 'toolbar',
    title: 'Toolbar',
    body: 'Save your game, adjust music and sound effects, or send feedback from up here. Your progress is also saved automatically to the cloud.',
  },
  {
    target: 'rightpanel',
    title: 'Character & World',
    body: 'Open your character sheet, skill tree, inventory, quests, bestiary, and more from these buttons.',
  },
  {
    target: null,
    title: "You're Ready",
    body: 'Your legend begins now. Type anything to start your adventure — or simply wait and see what the world brings to you.',
  },
];

const PAD = 10; // highlight box padding around target

export function GuidedTour() {
  const { T, tf, isDyslexic } = useTheme();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);
  const targetRef = useRef<Element | null>(null);

  // Check localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem(TOUR_KEY)) return;
    const t = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(t);
  }, []);

  // Listen for manual replay trigger (fired by HowToPlayModal)
  useEffect(() => {
    const handler = () => {
      setStep(0);
      setRect(null);
      setVisible(true);
    };
    window.addEventListener('ae:start-tour', handler);
    return () => window.removeEventListener('ae:start-tour', handler);
  }, []);

  const measureTarget = useCallback((target: string | null) => {
    if (!target) { setRect(null); return; }
    const el = document.querySelector(`[data-tour="${target}"]`);
    if (!el) { setRect(null); return; }
    targetRef.current = el;
    const r = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    // Skip if not visible in viewport (height 0, or translated off-screen)
    if (r.height === 0 || r.right <= 0 || r.left >= vw || r.bottom <= 0 || r.top >= vh) {
      setRect(null); return;
    }
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, []);

  // Measure on step change and set up ResizeObserver
  useEffect(() => {
    if (!visible) return;
    const target = STEPS[step]?.target ?? null;
    measureTarget(target);

    // Clean up previous observer
    if (observerRef.current) { observerRef.current.disconnect(); observerRef.current = null; }

    if (target && targetRef.current) {
      const ro = new ResizeObserver(() => measureTarget(target));
      ro.observe(targetRef.current);
      ro.observe(document.documentElement);
      observerRef.current = ro;
    }

    return () => { if (observerRef.current) { observerRef.current.disconnect(); observerRef.current = null; } };
  }, [visible, step, measureTarget]);

  // Recalculate on scroll/resize
  useEffect(() => {
    if (!visible) return;
    const onResize = () => measureTarget(STEPS[step]?.target ?? null);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [visible, step, measureTarget]);

  const dismiss = useCallback(() => {
    localStorage.setItem(TOUR_KEY, '1');
    setVisible(false);
  }, []);

  const next = useCallback(() => {
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else dismiss();
  }, [step, dismiss]);

  if (!visible) return null;

  const current = STEPS[step];
  const isFinal = step === STEPS.length - 1;
  const isTargeted = !!rect;

  // Tooltip positioning relative to highlight box (or centered)
  const W = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const H = typeof window !== 'undefined' ? window.innerHeight : 800;
  const CARD_W = Math.min(320, W - 32);
  const CARD_H_EST = 160; // rough estimate for positioning

  let cardStyle: React.CSSProperties = {
    position: 'fixed',
    width: CARD_W,
    zIndex: 9002,
    background: T.panelAlt,
    border: `1px solid ${T.gold}`,
    padding: '18px 20px 14px',
    boxShadow: `0 0 32px rgba(0,0,0,0.8), 0 0 0 1px ${T.border}`,
    fontFamily: isDyslexic ? "'OpenDyslexic',Arial,sans-serif" : "'Crimson Text',Georgia,serif",
  };

  let arrowStyle: React.CSSProperties = { display: 'none' };

  if (!isTargeted || isFinal) {
    // Centered
    cardStyle = {
      ...cardStyle,
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    };
  } else {
    // Position card below or above the highlight box
    const hTop = rect.top - PAD;
    const hBottom = rect.top + rect.height + PAD;
    const hLeft = rect.left - PAD;
    const hCenterX = rect.left + rect.width / 2;

    const cardLeft = Math.max(16, Math.min(W - CARD_W - 16, hCenterX - CARD_W / 2));
    const spaceBelow = H - hBottom;
    const spaceAbove = hTop;
    const placeBelow = spaceBelow >= CARD_H_EST || spaceBelow >= spaceAbove;

    if (placeBelow) {
      cardStyle = { ...cardStyle, top: hBottom + 10, left: cardLeft };
      arrowStyle = {
        position: 'absolute',
        top: -8,
        left: Math.max(12, Math.min(CARD_W - 24, hCenterX - cardLeft - 8)),
        width: 0,
        height: 0,
        borderLeft: '8px solid transparent',
        borderRight: '8px solid transparent',
        borderBottom: `8px solid ${T.gold}`,
      };
    } else {
      cardStyle = { ...cardStyle, top: hTop - CARD_H_EST - 10, left: cardLeft };
      arrowStyle = {
        position: 'absolute',
        bottom: -8,
        left: Math.max(12, Math.min(CARD_W - 24, hCenterX - cardLeft - 8)),
        width: 0,
        height: 0,
        borderLeft: '8px solid transparent',
        borderRight: '8px solid transparent',
        borderTop: `8px solid ${T.gold}`,
      };
    }

    // Clamp card vertically to screen
    if (typeof cardStyle.top === 'number') {
      if (cardStyle.top < 8) cardStyle.top = 8;
      if (cardStyle.top + CARD_H_EST > H - 8) cardStyle.top = H - CARD_H_EST - 8;
    }

    // Unused var for linting
    void hLeft;
  }

  return (
    <>
      {/* Dark overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          zIndex: 9000,
          pointerEvents: 'none',
        }}
      />

      {/* Highlight box */}
      {isTargeted && !isFinal && (
        <div
          style={{
            position: 'fixed',
            top: rect.top - PAD,
            left: rect.left - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
            border: `2px solid ${T.gold}`,
            boxShadow: `0 0 0 4px ${T.gold}30, 0 0 20px ${T.gold}40`,
            zIndex: 9001,
            pointerEvents: 'none',
            borderRadius: 3,
          }}
        />
      )}

      {/* Tooltip card */}
      <div style={{ ...cardStyle, position: 'fixed' }}>
        {/* Arrow */}
        <div style={arrowStyle} />

        {/* Step counter */}
        {!isFinal && (
          <div style={{
            position: 'absolute', top: 10, right: 14,
            fontSize: 10, color: T.textMuted,
            fontFamily: "'Cinzel','Palatino Linotype',serif",
            letterSpacing: 1,
          }}>
            {step + 1} / {STEPS.length - 1}
          </div>
        )}

        {/* Title */}
        <div style={{
          ...tf,
          color: T.gold,
          fontSize: 14,
          letterSpacing: 2,
          marginBottom: 10,
          paddingRight: isFinal ? 0 : 40,
        }}>
          {current.title}
        </div>

        {/* Body */}
        <div style={{
          color: T.text,
          fontSize: isDyslexic ? 15 : 14,
          lineHeight: 1.6,
          marginBottom: 16,
        }}>
          {current.body}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {!isFinal ? (
            <button
              onClick={dismiss}
              style={{
                background: 'none',
                border: 'none',
                color: T.textMuted,
                cursor: 'pointer',
                fontSize: 11,
                fontFamily: "'Cinzel','Palatino Linotype',serif",
                letterSpacing: 1,
                padding: '4px 0',
              }}
            >
              Skip Tour
            </button>
          ) : <span />}

          <button
            onClick={next}
            style={{
              background: 'none',
              border: `1px solid ${T.gold}`,
              color: T.gold,
              cursor: 'pointer',
              fontSize: 12,
              fontFamily: "'Cinzel','Palatino Linotype',serif",
              letterSpacing: 2,
              padding: '7px 18px',
            }}
          >
            {isFinal ? "Let's Go!" : 'Next →'}
          </button>
        </div>
      </div>

      {/* Intercept clicks on overlay to prevent accidental game interactions */}
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 8999 }}
        onClick={(e) => e.stopPropagation()}
      />
    </>
  );
}
