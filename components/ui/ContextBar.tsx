'use client';

import { useTheme } from '@/components/providers/ThemeProvider';
import type { Player } from '@/lib/types';

interface ContextBarProps {
  player: Player | null;
  isLoading: boolean;
  isDyslexic?: boolean;
  locationGrid?: Record<string, any>;
  onShop?: () => void;
  onSkills?: () => void;
  onQuests?: () => void;
  onDungeon?: () => void;
  dungeonAvailable?: boolean;
  onCraft?: () => void;
  onGear?: () => void;
  onBestiary?: () => void;
  activeQuestCount?: number;
  skillPts?: number;
  bestiaryCount?: number;
}

export function ContextBar({ player, isLoading, isDyslexic, onShop: _onShop, onSkills: _onSkills, onQuests: _onQuests, onDungeon, dungeonAvailable, onCraft: _onCraft, onGear, onBestiary, activeQuestCount: _activeQuestCount, skillPts: _skillPts, locationGrid: _locationGrid, bestiaryCount = 0 }: ContextBarProps) {
  const { T } = useTheme();
  const ctx = player?.context || 'explore';

  const tf = {
    fontFamily: isDyslexic
      ? "'OpenDyslexic',Arial,sans-serif"
      : "'Cinzel','Palatino Linotype',serif",
  };

  const ctxInfo: Record<string, { label: string; color: string; icon: string }> = {
    explore: { label: 'Exploring',   color: '#4a8040', icon: '🌲' },
    town:    { label: 'In Town',     color: '#7060a0', icon: '🏛️' },
    combat:  { label: 'In Combat!',  color: '#c03030', icon: '⚔️' },
    npc:     { label: 'Talking',     color: '#4070a0', icon: '💬' },
    camp:    { label: 'Camped',      color: '#a06020', icon: '🔥' },
    travel:  { label: 'Travelling',  color: '#5080a0', icon: '🚶' },
    farm:    { label: 'At Farm',     color: '#6a8040', icon: '🌾' },
    poi:     { label: 'At Location', color: '#806030', icon: '⚠️' },
  };
  const ctxData = ctxInfo[ctx] || ctxInfo.explore;

  return (
    <div
      style={{
        display: 'flex',
        borderBottom: `1px solid ${T.border}`,
        background: ctxData.color + '18',
      }}
    >
      {/* Left: context status only */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4px 8px', gap: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 11 }}>{ctxData.icon}</span>
          <span style={{ ...tf, color: ctxData.color, fontSize: 8, letterSpacing: 1 }}>
            {ctxData.label.toUpperCase()}
          </span>
        </div>
        {isLoading && (
          <span style={{ color: T.textFaint, fontSize: 8, fontStyle: 'italic', fontFamily: 'Crimson Text,serif' }}>
            weaving story...
          </span>
        )}
      </div>

      {/* Right: buttons */}
      {(onDungeon || onGear || onBestiary) && (
        <div style={{ flex: 1, borderLeft: `1px solid ${T.border}`, padding: '4px', display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            {onBestiary && (
              <button
                onClick={onBestiary}
                style={{
                  gridColumn: '1 / -1',
                  background: 'transparent', border: `1px solid ${T.accent}`,
                  color: T.gold, padding: '2px 6px', fontSize: 9, cursor: 'pointer',
                  fontFamily: "'Cinzel','Palatino Linotype',serif", letterSpacing: 0.5,
                  position: 'relative' as const, whiteSpace: 'nowrap' as const, textAlign: 'center' as const,
                }}
              >
                📖 Bestiary
                {bestiaryCount > 0 && (
                  <span style={{ position: 'absolute', top: -3, right: -3, background: '#c04040', color: '#fff', borderRadius: '50%', width: 12, height: 12, fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {bestiaryCount}
                  </span>
                )}
              </button>
            )}
            {onGear && (
              <button onClick={onGear} title="Character Screen — Equipped gear, inventory, skill tree, and attributes" style={{ background: 'transparent', border: `1px solid ${T.accent}`, color: T.gold, padding: '2px 6px', fontSize: 9, cursor: 'pointer', fontFamily: "'Cinzel','Palatino Linotype',serif", letterSpacing: 0.5, whiteSpace: 'nowrap' as const }}>
                🎒 Character
              </button>
            )}
            {onDungeon && (
              <button
                onClick={onDungeon}
                style={{
                  background: dungeonAvailable ? 'rgba(100,20,20,0.35)' : 'transparent',
                  border: `1px solid ${dungeonAvailable ? '#c03030' : T.accent}`,
                  color: dungeonAvailable ? '#e06060' : T.gold,
                  padding: '2px 6px', fontSize: 9, cursor: 'pointer',
                  fontFamily: "'Cinzel','Palatino Linotype',serif", letterSpacing: 0.5,
                  whiteSpace: 'nowrap' as const,
                  animation: dungeonAvailable ? 'pulse 1.2s infinite' : 'none',
                }}
              >
                🕳️ Dungeon
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
