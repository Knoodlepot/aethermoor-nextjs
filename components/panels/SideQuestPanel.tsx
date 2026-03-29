'use client';

import { useTheme } from '@/components/providers/ThemeProvider';
import type { Quest } from '@/lib/types';

const typeColors: Record<string, string> = {
  faction: '#3090c0',
  side:    '#c0a030',
  contract:'#c06030',
};

interface SideQuestPanelProps {
  quests: Quest[];
  onOpenQuest: (questId: string) => void;
  onToggleTrack: (questId: string) => void;
  onAbandon: (questId: string) => void;
  onOpenLog: () => void;
}

const SLOT_COUNT = 2;

export function SideQuestPanel({ quests, onOpenQuest, onToggleTrack, onOpenLog }: SideQuestPanelProps) {
  const { T, tf, t } = useTheme();

  // All active non-main quests (tracked or not — slots show everything)
  const active = quests.filter((q) => (q.status as string) === 'active' && q.type !== 'main');
  const slots = active.slice(0, SLOT_COUNT);

  return (
    <div
      style={{
        background: T.panelAlt,
        border: `1px solid #3090c044`,
        padding: 4,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ ...tf, fontSize: 9, color: '#3090c0', letterSpacing: 2, flex: 1 }}>
          {t('sideQuests')}
        </span>
        <button
          onClick={onOpenLog}
          style={{
            background: 'transparent',
            border: `1px solid #3090c044`,
            color: '#3090c0',
            fontSize: 9,
            padding: '1px 6px',
            cursor: 'pointer',
            ...tf,
            letterSpacing: 0.5,
          }}
        >
          {t('allQuests')} →
        </button>
      </div>

      {/* 2-slot list */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
        {Array.from({ length: SLOT_COUNT }).map((_, i) => {
          const q = slots[i];
          if (!q) {
            // Empty slot
            return (
              <div
                key={`empty-${i}`}
                style={{
                  border: `1px dashed ${T.border}`,
                  borderRadius: 2,
                  height: 36,
                  opacity: 0.35,
                }}
              />
            );
          }

          const typeColor = typeColors[q.type] || '#c0a030';
          const tracked = q.tracked ?? true;

          return (
            <div
              key={q.id}
              onClick={() => onOpenQuest(q.id)}
              style={{
                border: `1px solid ${typeColor}66`,
                borderRadius: 2,
                padding: '4px 6px',
                cursor: 'pointer',
                position: 'relative',
                height: 36,
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
                overflow: 'hidden',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = typeColor + 'aa';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = typeColor + '66';
              }}
            >
              <span
                style={{
                  ...tf,
                  fontSize: 9,
                  color: T.text,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                  paddingRight: 16,
                  lineHeight: 1.3,
                }}
                title={q.title}
              >
                {q.title}
              </span>

              {/* Track toggle — top-right */}
              <button
                onClick={(e) => { e.stopPropagation(); onToggleTrack(q.id); }}
                title={tracked ? t('untrack') : t('track')}
                style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  background: 'transparent',
                  border: 'none',
                  color: tracked ? typeColor : T.textFaint,
                  fontSize: 9,
                  cursor: 'pointer',
                  padding: 0,
                  lineHeight: 1,
                }}
              >
                {tracked ? '👁' : '○'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
