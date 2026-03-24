'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import type { EventLogEntry } from '@/lib/tagParsers';

type Tab = 'all' | 'xp' | 'gold' | 'rep' | 'combat' | 'incoming';

const TABS: { id: Tab; label: string }[] = [
  { id: 'all',      label: 'All' },
  { id: 'xp',       label: 'XP' },
  { id: 'gold',     label: 'Gold' },
  { id: 'rep',      label: 'Rep' },
  { id: 'combat',   label: 'Combat' },
  { id: 'incoming', label: 'Incoming' },
];

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
    case 'combat':
      return {
        label: `${sign}${entry.value} dmg${entry.reason ? ` → ${entry.reason}` : ''}`,
        color: '#e06060',
      };
    case 'incoming':
      return {
        label: `${entry.value} dmg received`,
        color: '#b04040',
      };
  }
}

export function EventLogPanel({ entries }: EventLogPanelProps) {
  const { T } = useTheme();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<Tab>('all');

  const filtered = activeTab === 'all' ? entries : entries.filter(e => e.type === activeTab);
  const visible = filtered.slice(-20).reverse();

  // Auto-scroll to bottom when new entries arrive on the active tab
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [filtered.length]);

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

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: `1px solid ${T.border}`,
        flexShrink: 0,
        overflowX: 'auto',
        msOverflowStyle: 'none',
      } as React.CSSProperties}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: '1 0 auto',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? `2px solid ${T.gold}` : '2px solid transparent',
              color: activeTab === tab.id ? T.gold : T.textMuted,
              padding: '3px 6px',
              fontSize: 10,
              cursor: 'pointer',
              fontFamily: "'Cinzel', serif",
              letterSpacing: '0.05em',
              whiteSpace: 'nowrap',
              transition: 'color 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
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
