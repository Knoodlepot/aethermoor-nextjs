'use client';

import React from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import {
  PATCH_NOTES_SECTIONS,
  PATCH_NOTES_VERSION,
  PATCH_NOTES_TITLE,
} from '@/lib/constants';

interface PatchNotesScreenProps {
  onClose: () => void;
}

export function PatchNotesScreen({ onClose }: PatchNotesScreenProps) {
  const { T, tf, bf } = useTheme();

  return (
    <div
      style={{
        ...bf,
        position: 'fixed',
        inset: 0,
        background: T.bg + 'ee',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: T.panel,
          border: `1px solid ${T.accent}`,
          width: '100%',
          maxWidth: 600,
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 8px 40px #00000099',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: T.panelAlt,
            borderBottom: `1px solid ${T.border}`,
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div>
            <div style={{ ...tf, color: T.gold, fontSize: 16, letterSpacing: 2 }}>
              📝 PATCH NOTES
            </div>
            <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>
              v{PATCH_NOTES_VERSION} · {PATCH_NOTES_TITLE}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: `1px solid ${T.border}`,
              color: T.textMuted,
              width: 28,
              height: 28,
              cursor: 'pointer',
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 20, overflowY: 'auto', flex: 1 }}>
          {PATCH_NOTES_SECTIONS.map((sec) => (
            <div key={sec.title} style={{ marginBottom: 20 }}>
              <div
                style={{
                  ...tf,
                  color: T.accent,
                  fontSize: 11,
                  letterSpacing: 2,
                  marginBottom: 10,
                  paddingBottom: 6,
                  borderBottom: `1px solid ${T.border}`,
                }}
              >
                {sec.title.toUpperCase()}
              </div>
              <ul style={{ margin: 0, paddingLeft: 20, listStyle: 'none' }}>
                {sec.items.map((item, idx) => (
                  <li
                    key={idx}
                    style={{
                      fontSize: 13,
                      color: T.text,
                      lineHeight: 1.65,
                      marginBottom: 6,
                      paddingLeft: 4,
                      position: 'relative',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        left: -14,
                        color: T.accent,
                        fontSize: 10,
                        top: 3,
                      }}
                    >
                      •
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Footer note */}
          <div
            style={{
              marginTop: 8,
              paddingTop: 12,
              borderTop: `1px solid ${T.border}`,
              fontSize: 11,
              color: T.textFaint,
              fontStyle: 'italic',
            }}
          >
            Aethermoor is in active development. More updates coming soon.
          </div>
        </div>
      </div>
    </div>
  );
}
