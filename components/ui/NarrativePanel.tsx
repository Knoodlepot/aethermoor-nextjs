'use client';

import React from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { parseMarkdown, stripContextTag } from '@/lib/tagParsers';

interface NarrativePanelProps {
  narrative: string;
  log?: Array<{ type: string; text: string; timestamp?: string }>;
}

export function NarrativePanel({
  narrative,
  log = [],
}: NarrativePanelProps) {
  const { T, bf, isDyslexic } = useTheme();
  const logRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on narrative update
  React.useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [narrative]);

  const dyxNarr = isDyslexic
    ? {
        fontSize: 18,
        lineHeight: 2.1,
        letterSpacing: '0.04em',
        wordSpacing: '0.18em',
        textAlign: 'left' as const,
      }
    : {};

  return (
    <div
      ref={logRef}
      data-testid="narrative-panel"
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: 20,
        paddingBottom: 32,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {/* Main narrative */}
      {narrative && (
        <div
          style={{
            background: T.panelAlt,
            border: `1px solid ${T.border}`,
            padding: isDyslexic ? 24 : 18,
            paddingBottom: isDyslexic ? 28 : 22,
            marginBottom: 10,
            animation: 'slideIn 0.4s ease',
            lineHeight: 2.0,
            fontSize: 15,
            overflow: 'visible',
            ...bf,
            ...dyxNarr,
          }}
          dangerouslySetInnerHTML={{ __html: parseMarkdown(stripContextTag(narrative)) }}
        />
      )}

      {/* Game log (last 15 entries) */}
      {log.length > 0 && (
        <div
          style={{
            marginTop: 20,
            padding: 12,
            background: T.panel,
            border: `1px solid ${T.border}`,
            borderRadius: 4,
            maxHeight: 150,
            overflowY: 'auto',
          }}
        >
          {log
            .slice(-15)
            .reverse()
            .map((entry, idx) => (
              <div
                key={idx}
                style={{
                  fontSize: 12,
                  color:
                    entry.type === 'action' ? T.gold : T.textMuted,
                  marginBottom: 4,
                  fontFamily:
                    entry.type === 'action'
                      ? "'Cinzel',serif"
                      : "'Crimson Text',serif",
                }}
              >
                [{entry.type}] {entry.text}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
