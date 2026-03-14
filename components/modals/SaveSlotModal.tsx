'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import type { SlotSummary } from '@/hooks/useStorage';

interface SaveSlotModalProps {
  mode: 'save' | 'load';
  currentSlot: number;
  loadSlots: () => Promise<SlotSummary[]>;
  onSave?: (slot: number) => void;
  onLoad?: (slot: number) => void;
  onClose: () => void;
}

export function SaveSlotModal({ mode, currentSlot, loadSlots, onSave, onLoad, onClose }: SaveSlotModalProps) {
  const { T, tf } = useTheme();
  const [slots, setSlots] = useState<SlotSummary[]>([
    { slot: 1, empty: true },
    { slot: 2, empty: true },
    { slot: 3, empty: true },
  ]);
  const [loading, setLoading] = useState(true);
  const [confirmOverwrite, setConfirmOverwrite] = useState<number | null>(null);

  useEffect(() => {
    loadSlots().then((s) => {
      setSlots(s);
      setLoading(false);
    });
  }, [loadSlots]);

  const handleSlotClick = (slot: number) => {
    if (mode === 'load') {
      if (!slots.find((s) => s.slot === slot)?.empty) {
        onLoad?.(slot);
        onClose();
      }
    } else {
      // Save mode
      if (!slots.find((s) => s.slot === slot)?.empty && slot !== currentSlot) {
        setConfirmOverwrite(slot);
      } else {
        onSave?.(slot);
        onClose();
      }
    }
  };

  const formatDate = (savedAt?: string) => {
    if (!savedAt) return '';
    try {
      return new Date(savedAt).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: T.panel,
          border: `1px solid ${T.border}`,
          borderRadius: 6,
          padding: '2rem',
          width: '100%',
          maxWidth: 420,
        }}
      >
        <h2 style={{ ...tf, color: T.gold, fontSize: 18, letterSpacing: 3, marginBottom: 24, textAlign: 'center' }}>
          {mode === 'save' ? 'SAVE GAME' : 'LOAD GAME'}
        </h2>

        {loading ? (
          <div style={{ color: T.textMuted, textAlign: 'center', padding: '2rem', fontFamily: "'Crimson Text',serif" }}>
            Loading saves…
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {slots.map((s) => {
              const isActive = s.slot === currentSlot;
              const isConfirming = confirmOverwrite === s.slot;
              const canInteract = mode === 'save' || !s.empty;

              return (
                <div
                  key={s.slot}
                  onClick={() => !isConfirming && canInteract && handleSlotClick(s.slot)}
                  style={{
                    background: isActive ? T.selectedBg ?? T.panelAlt : T.panelAlt,
                    border: `1px solid ${isActive ? T.accent : T.border}`,
                    borderRadius: 4,
                    padding: '14px 16px',
                    cursor: canInteract ? 'pointer' : 'default',
                    opacity: mode === 'load' && s.empty ? 0.4 : 1,
                    transition: 'all 0.15s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span style={{ ...tf, color: T.textMuted, fontSize: 11, letterSpacing: 1 }}>
                        SLOT {s.slot}
                      </span>
                      {isActive && mode === 'save' && (
                        <span style={{ ...tf, color: T.accent, fontSize: 10, letterSpacing: 1 }}>CURRENT</span>
                      )}
                    </div>
                    {s.empty ? (
                      <div style={{ color: T.textFaint ?? T.textMuted, fontFamily: "'Crimson Text',serif", fontSize: 14, fontStyle: 'italic' }}>
                        Empty slot
                      </div>
                    ) : (
                      <>
                        <div style={{ ...tf, color: T.text, fontSize: 15 }}>
                          {s.name} <span style={{ color: T.textMuted, fontSize: 12 }}>· {s.cls} · Lv {s.level}</span>
                        </div>
                        <div style={{ color: T.textMuted, fontSize: 12, fontFamily: "'Crimson Text',serif" }}>
                          {s.location}{s.savedAt ? ` · ${formatDate(s.savedAt)}` : ''}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Overwrite confirm */}
                  {isConfirming ? (
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => { onSave?.(s.slot); onClose(); }}
                        style={{ ...tf, background: '#c03030', border: 'none', color: '#fff', padding: '4px 10px', fontSize: 11, cursor: 'pointer', borderRadius: 3 }}
                      >
                        Overwrite
                      </button>
                      <button
                        onClick={() => setConfirmOverwrite(null)}
                        style={{ background: 'transparent', border: `1px solid ${T.border}`, color: T.textMuted, padding: '4px 10px', fontSize: 11, cursor: 'pointer', borderRadius: 3 }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div style={{ ...tf, color: canInteract ? T.accent : T.textFaint ?? T.textMuted, fontSize: 11, letterSpacing: 1, flexShrink: 0 }}>
                      {mode === 'save' ? '→ Save' : s.empty ? '' : '→ Load'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <button
          onClick={onClose}
          style={{
            display: 'block', width: '100%', marginTop: 20,
            background: 'transparent', border: `1px solid ${T.border}`,
            color: T.textMuted, padding: '8px', fontSize: 11,
            cursor: 'pointer', letterSpacing: 2, ...tf,
          }}
        >
          CANCEL
        </button>
      </div>
    </div>
  );
}
