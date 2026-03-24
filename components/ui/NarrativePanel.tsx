'use client';

import React from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { parseMarkdown, stripContextTag } from '@/lib/tagParsers';

interface NarrativePanelProps {
  narrative: string;
  log?: Array<{ type: string; text: string; timestamp?: string }>;
  isLoading?: boolean;
}

export function NarrativePanel({
  narrative,
  log = [],
  isLoading = false,
}: NarrativePanelProps) {
  const { T, bf, isDyslexic, narrativeFontSize } = useTheme();
  const logRef = React.useRef<HTMLDivElement>(null);

  // Scroll to top on new narration
  React.useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = 0;
    }
  }, [narrative]);

  const dyxNarr = isDyslexic
    ? {
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
      {/* Typing indicator — shown while AI is generating */}
      {isLoading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 2px 0' }}>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                display: 'inline-block',
                width: 6, height: 6,
                borderRadius: '50%',
                background: T.textFaint,
                animation: `typingDot 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      )}

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
            fontSize: narrativeFontSize,
            overflow: 'visible',
            ...bf,
            ...dyxNarr,
          }}
          dangerouslySetInnerHTML={{ __html: parseMarkdown(stripContextTag(narrative)) }}
        />
      )}

    </div>
  );
}
