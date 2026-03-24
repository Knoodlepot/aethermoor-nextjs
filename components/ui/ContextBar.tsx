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
  dungeonCooldown?: number;
  onCraft?: () => void;
  onGear?: () => void;
  onBestiary?: () => void;
  activeQuestCount?: number;
  skillPts?: number;
  bestiaryCount?: number;
}

export function ContextBar({ player, isLoading, isDyslexic: _isDyslexic, onShop: _onShop, onSkills: _onSkills, onQuests: _onQuests, onDungeon, dungeonAvailable, dungeonCooldown = 0, onCraft: _onCraft, onGear, onBestiary, activeQuestCount: _activeQuestCount, skillPts: _skillPts, locationGrid: _locationGrid, bestiaryCount: _bestiaryCount = 0 }: ContextBarProps) {
  const { T, t } = useTheme();
  const ctx = player?.context || 'explore';

  const ctxInfo: Record<string, { label: string; color: string; icon: string }> = {
    explore: { label: t('exploring'),   color: '#4a8040', icon: '🌲' },
    town:    { label: t('inTown'),      color: '#7060a0', icon: '🏛️' },
    combat:  { label: t('inCombat'),    color: '#c03030', icon: '⚔️' },
    npc:     { label: t('talking'),     color: '#4070a0', icon: '💬' },
    camp:    { label: t('camped'),      color: '#a06020', icon: '🔥' },
    travel:  { label: t('travelling'),  color: '#5080a0', icon: '🚶' },
    farm:    { label: t('atFarm'),      color: '#6a8040', icon: '🌾' },
    poi:     { label: t('atLocation'),  color: '#806030', icon: '⚠️' },
  };
  const ctxData = ctxInfo[ctx] || ctxInfo.explore;
  const hasPoints = ((player?.statPoints ?? 0) > 0) || ((player?.skillPoints ?? 0) > 0);

  return (
    <div
      style={{
        display: 'flex',
        borderBottom: `1px solid ${T.border}`,
        background: ctxData.color + '18',
      }}
    >
      {/* Left: loading indicator only */}
      {isLoading && (
        <div style={{ display: 'flex', alignItems: 'center', padding: '4px 8px' }}>
          <span style={{ color: T.textFaint, fontSize: 8, fontStyle: 'italic', fontFamily: 'Crimson Text,serif' }}>
            {t('weavingStory')}
          </span>
        </div>
      )}

      {/* Right: buttons */}
      {(onDungeon || onGear || onBestiary) && (
        <div style={{ flex: 1, borderLeft: `1px solid ${T.border}`, padding: '4px', display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
            {onBestiary && (
              <button
                onClick={onBestiary}
                style={{
                  background: 'transparent', border: `1px solid ${T.accent}`,
                  color: T.gold, padding: '2px 6px', fontSize: 9, cursor: 'pointer',
                  fontFamily: "'Cinzel','Palatino Linotype',serif", letterSpacing: 0.5,
                  position: 'relative' as const, whiteSpace: 'nowrap' as const, textAlign: 'center' as const,
                }}
              >
                📖 {t('bestiary')}
              </button>
            )}
            {onGear && (
              <button onClick={onGear} title={hasPoints ? 'You have unspent points — open Character to spend them' : 'Character Screen — gear, inventory, skills, attributes'} style={{ background: 'transparent', border: `1px solid ${hasPoints ? '#f0c060' : T.accent}`, color: hasPoints ? '#f0c060' : T.gold, padding: '2px 6px', fontSize: 9, cursor: 'pointer', fontFamily: "'Cinzel','Palatino Linotype',serif", letterSpacing: 0.5, whiteSpace: 'nowrap' as const, animation: hasPoints ? 'pulse 1s infinite' : 'none', boxShadow: hasPoints ? '0 0 8px #f0c06066' : 'none' }}>
                🎒 {hasPoints ? 'Spend Points!' : t('character')}
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
                🕳️ {dungeonCooldown > 0 ? `${dungeonCooldown}s` : t('dungeon')}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
