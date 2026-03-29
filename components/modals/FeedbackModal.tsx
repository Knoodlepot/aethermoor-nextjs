'use client';

import React, { useState } from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';

type FeedbackType = 'bug' | 'suggestion' | 'other';

interface FeedbackModalProps {
  playerId?: string | null;
  currentLocation?: string;
  lastInput?: string;
  onClose: () => void;
}

export function FeedbackModal({ playerId, currentLocation, lastInput, onClose }: FeedbackModalProps) {
  const { T, tf } = useTheme();
  const [type, setType] = useState<FeedbackType>('bug');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [screenshot, setScreenshot] = useState<{ base64: string; filename: string } | null>(null);
  const [screenshotError, setScreenshotError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setScreenshotError('Please select an image file.'); return; }
    if (file.size > 4 * 1024 * 1024) { setScreenshotError('Screenshot must be under 4 MB.'); return; }
    setScreenshotError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip data URL prefix to get raw base64
      const base64 = result.split(',')[1];
      setScreenshot({ base64, filename: file.name });
    };
    reader.readAsDataURL(file);
  };

  const typeLabels: Record<FeedbackType, string> = {
    bug: 'Bug Report',
    suggestion: 'Suggestion',
    other: 'Other',
  };

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setStatus('sending');
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, message: message.trim(), playerId, currentLocation, lastInput, screenshot }),
      });
      if (res.ok) {
        setStatus('sent');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const overlay: React.CSSProperties = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000,
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
  };
  const box: React.CSSProperties = {
    background: T.panel, border: `1px solid ${T.border}`,
    padding: '24px 28px', maxWidth: 480, width: '100%',
    display: 'flex', flexDirection: 'column', gap: 16,
    maxHeight: '90vh', overflowY: 'auto',
  };
  const heading: React.CSSProperties = { ...tf, color: T.gold, fontSize: '1rem', letterSpacing: 1, margin: 0 };
  const btnBase: React.CSSProperties = {
    border: `1px solid ${T.border}`, background: 'transparent', color: T.textMuted,
    padding: '6px 14px', cursor: 'pointer', fontSize: 12,
    fontFamily: "'Cinzel','Palatino Linotype',serif", letterSpacing: 1,
  };
  const btnActive: React.CSSProperties = { ...btnBase, border: `1px solid ${T.gold}`, color: T.gold };

  return (
    <div style={overlay} onClick={onClose}>
      <div style={box} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={heading}>Send Feedback</h2>
          <button onClick={onClose} style={{ ...btnBase, padding: '2px 8px', fontSize: 16 }}>✕</button>
        </div>

        {status === 'sent' ? (
          <div style={{ color: '#80c060', textAlign: 'center', padding: '24px 0', fontSize: '0.9rem' }}>
            Thank you — your feedback has been received.
          </div>
        ) : (
          <>
            {/* Type selector */}
            <div style={{ display: 'flex', gap: 8 }}>
              {(Object.keys(typeLabels) as FeedbackType[]).map((t) => (
                <button key={t} style={type === t ? btnActive : btnBase} onClick={() => setType(t)}>
                  {typeLabels[t]}
                </button>
              ))}
            </div>

            {/* Message */}
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                type === 'bug'
                  ? 'Describe what happened and what you expected…'
                  : type === 'suggestion'
                  ? 'What would you like to see in Aethermoor?'
                  : 'Your message…'
              }
              rows={5}
              style={{
                background: T.panelAlt, border: `1px solid ${T.border}`, color: T.text,
                padding: '10px 12px', fontSize: '0.9rem', resize: 'vertical', fontFamily: 'Georgia, serif',
                outline: 'none', width: '100%', boxSizing: 'border-box',
              }}
            />

            {/* Screenshot upload */}
            <div>
              <label style={{ color: T.textMuted, fontSize: '0.8rem', display: 'block', marginBottom: 6 }}>
                Screenshot (optional, max 4 MB)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ color: T.text, fontSize: '0.8rem', width: '100%' }}
              />
              {screenshotError && (
                <div style={{ color: '#e04040', fontSize: '0.75rem', marginTop: 4 }}>{screenshotError}</div>
              )}
              {screenshot && !screenshotError && (
                <div style={{ color: '#80c060', fontSize: '0.75rem', marginTop: 4 }}>
                  ✓ {screenshot.filename} attached
                </div>
              )}
            </div>

            {/* Context shown to the user */}
            <div style={{ color: T.textMuted, fontSize: '0.75rem', lineHeight: 1.5 }}>
              Auto-attached: Player ID, current location, last action.
            </div>

            {status === 'error' && (
              <div style={{ color: '#e04040', fontSize: '0.85rem' }}>
                Could not send — please try again or email support.aethermoor@gmail.com
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!message.trim() || status === 'sending'}
              style={{
                ...btnBase,
                background: message.trim() ? T.accent : 'transparent',
                color: message.trim() ? '#0d0b07' : T.textMuted,
                border: `1px solid ${message.trim() ? T.accent : T.border}`,
                padding: '8px 20px', alignSelf: 'flex-end',
              }}
            >
              {status === 'sending' ? 'Sending…' : 'Send'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
