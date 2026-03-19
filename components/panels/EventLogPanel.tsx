'use client';

import React, { useRef, useEffect } from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import type { EventLogEntry } from '@/lib/tagParsers';

interface EventLogPanelProps {
  entries: EventLogEntry[];
}

function formatEntry(entry: EventLogEntry): { label: string; color: string } {
  const sign = entry.value >= 0 ? '+' : '';
  switch (entry.type) {
    case 'xp':
      return {
        label: `${sign}${entry.value} XP${entry.reason ? ` — ${entry.reason}` : ''}`,
        color: '#6dbf6d',
      };
    case 'gold':
      return {
        label: `${sign}${entry.value}g${entry.reason ? ` — ${entry.reason}` : ''}`,
        color: entry.value >= 0 ? '#c8a840' : '#a07830',
      };
    case 'rep':
      return {
        label: `${sign}${entry.value} rep${entry.reason ? ` — ${entry.reason}` : ''}`,
        color: entry.value >= 0 ? '#5ab8c8' : '#b85050',
      };
  }
}

export function EventLogPanel({ entries }: EventLogPanelProps) {
  const { T } = useTheme();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new entries arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries.length]);

  const visible = entries.slice(-20).reverse();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
      borderBottom: `1px solid ${T.border}`,
    }}>
      {/* Header */}
      <div style={{
        padding: '4px 10px',
        borderBottom: `1px solid ${T.border}`,
        fontFamily: "'Cinzel', serif",
        fontSize: 11,
        letterSpacing: '0.08em',
        color: T.textMuted,
        flexShrink: 0,
      }}>
        Event Log
      </div>

      {/* Entries */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '4px 10px',
        }}
      >
        {visible.length === 0 ? (
          <div style={{
            color: T.textMuted,
            fontFamily: "'Crimson Text', serif",
            fontSize: 11,
            fontStyle: 'italic',
            paddingTop: 2,
          }}>
            No events yet
          </div>
        ) : (
          visible.map((entry, i) => {
            const { label, color } = formatEntry(entry);
            return (
              <div key={entry.timestamp + i} style={{
                fontFamily: "'Crimson Text', serif",
                fontSize: 11,
                color: i === 0 ? color : `${color}99`,
                marginBottom: 1,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {label}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
