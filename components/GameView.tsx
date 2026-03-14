"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeProvider, useTheme } from '@/components/providers/ThemeProvider';
import { useAuth } from '@/hooks/useAuth';
import { useStorage } from '@/hooks/useStorage';
import { useGameState } from '@/hooks/useGameState';
import { useUI } from '@/hooks/useUI';
import { useGameLoop } from '@/hooks/useGameLoop';

// Panels
import { CommandPanel } from '@/components/panels/CommandPanel';
import { MobileCommandPanel } from '@/components/panels/MobileCommandPanel';
import { ContextBar } from '@/components/ui/ContextBar';
import { InputBar } from '@/components/panels/InputBar';
import { CombatPanel } from '@/components/panels/CombatPanel';
import { MainQuestPanel } from '@/components/panels/MainQuestPanel';

// UI
import { NarrativePanel } from '@/components/ui/NarrativePanel';
import { MapView } from '@/components/ui/MapView';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

// Screens
import { AuthScreen } from '@/components/screens/AuthScreen';
import { InventoryScreen } from '@/components/screens/InventoryScreen';
import { ShopScreen } from '@/components/screens/ShopScreen';
import { QuestLogScreen } from '@/components/screens/QuestLogScreen';
import { BestiaryScreen } from '@/components/screens/BestiaryScreen';
import { SkillTreeScreen } from '@/components/screens/SkillTreeScreen';
import { StandingsScreen } from '@/components/screens/StandingsScreen';
import { CraftingScreen } from '@/components/screens/CraftingScreen';
import { NGPlusScreen } from '@/components/screens/NGPlusScreen';
import { PatchNotesScreen } from '@/components/screens/PatchNotesScreen';

// Modals
import { HowToPlayModal } from '@/components/modals/HowToPlayModal';
import { FactionOfferModal } from '@/components/modals/FactionOfferModal';
import { UserProfileModal } from '@/components/modals/UserProfileModal';
// ClassInfoModal is imported here; rendered during character creation (future CharacterCreation screen)
import { ClassInfoModal } from '@/components/modals/ClassInfoModal';

import { CLASSES } from '@/lib/constants';
import { countItem } from '@/lib/helpers';

// ─── Inner component (must live inside ThemeProvider) ─────────────────────────

/** XP required to reach the next level (simple formula matching legacy) */
function xpForNextLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.4, level - 1));
}

function GameContent() {
  const router = useRouter();
  const { T, tf, isDyslexic } = useTheme();

  // All hooks in dependency order
  const auth = useAuth();
  const storage = useStorage(auth.token);
  const gameState = useGameState(storage);
  const ui = useUI();
  const gameLoop = useGameLoop(gameState, ui, storage, auth.token);

  // Guest-mode flag: bypass auth gate without a real JWT
  const [guestMode, setGuestMode] = useState(false);



  // Dungeon hint toast
  const [dungeonHint, setDungeonHint] = useState(false);
  const showDungeonHint = () => {
    setDungeonHint(true);
    setTimeout(() => setDungeonHint(false), 4500);
  };

  // Stable setState references for effects
  const { setIsMobile } = ui;

  // Mobile detection
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [setIsMobile]);

  // ── Command handlers ────────────────────────────────────────────────────────

  /** Execute a named command (from buttons / panels) */
  const handleCommand = (commandId: string) => {
    if (gameLoop.isLoading) return;
    void gameLoop.executeCommand(commandId, gameState);
  };

  /** Execute free-text input from the InputBar */
  const handleFreeText = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || gameLoop.isLoading) return;
    void gameLoop.executeCommand(trimmed, gameState);
  };

  // Debug: expose gameState for E2E tests
  useEffect(() => {
    if (gameState.isLoaded) {
      // @ts-ignore
      window.gameState = gameState;
    }
  }, [gameState.isLoaded, gameState.player, gameState]);

  // ── Auth / loading gates ────────────────────────────────────────────────────

  if (auth.authStatus === 'loading') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100dvh',
          background: T.bg,
          color: T.textMuted,
          fontFamily: "'Crimson Text',Georgia,serif",
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{ ...tf, color: T.gold, fontSize: 24, letterSpacing: 4, marginBottom: 14 }}
          >
            AETHERMOOR
          </div>
          <div style={{ fontSize: 14 }}>Verifying session…</div>
        </div>
      </div>
    );
  }

  if (auth.authStatus === 'unauthed' && !guestMode) {
    return (
      <AuthScreen
        onAuth={(data: any) => {
          if (data.token) {
            // AuthScreen has already persisted the token; reload so useAuth picks it up
            window.location.reload();
          } else if (data.guest) {
            setGuestMode(true);
          }
        }}
        resetToken={null}
      />
    );
  }

  if (!gameState.isLoaded) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100dvh',
          background: T.bg,
          color: T.textMuted,
          fontFamily: "'Crimson Text',Georgia,serif",
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{ ...tf, color: T.gold, fontSize: 24, letterSpacing: 4, marginBottom: 14 }}
          >
            AETHERMOOR
          </div>
          <div style={{ fontSize: 14 }}>Loading your adventure…</div>
        </div>
      </div>
    );
  }

  // ── Game is ready ───────────────────────────────────────────────────────────

  // Use 'any' casts so TypeScript doesn't object to fields not yet in the Player type
  const player = gameState.player as any;
  const worldSeed = gameState.worldSeed as any;

  // HP bar colour
  const hp: number = player?.hp ?? 0;
  const maxHp: number = player?.maxHp ?? 1;
  const hpPct = Math.max(0, Math.min(100, Math.round((hp / maxHp) * 100)));
  const hpColor = hpPct > 60 ? '#60a060' : hpPct > 30 ? '#c0a030' : '#c03030';

  // Clock
  const clockHour: number = player?.gameHour ?? 8;
  const clockDay: number = player?.gameDay ?? 1;
  const isDay = clockHour >= 6 && clockHour < 20;
  const h12 = clockHour % 12 || 12;
  const ampm = clockHour < 12 ? 'AM' : 'PM';
  const clockStr = `Day ${clockDay} · ${h12}${ampm}`;
  const clockColor = isDay ? '#c8a040' : '#7080b8';

  // ── Header button helper (legacy style) ───────────────────────────────────

  const tbBtn = (label: string, onClick: () => void, active = false, extra?: React.CSSProperties) => (
    <button
      onClick={onClick}
      style={{
        background: 'transparent',
        border: `1px solid ${active ? T.accent : T.accent}`,
        color: T.gold,
        padding: '4px 10px',
        cursor: 'pointer',
        fontSize: 11,
        fontFamily: "'Cinzel','Palatino Linotype',serif",
        letterSpacing: 1,
        position: 'relative' as const,
        transition: 'all 0.15s',
        ...extra,
      }}
    >
      {label}
    </button>
  );

  // ── Player Info Panel (for right column) ───────────────────────────────────

  // ── XP bar values ──────────────────────────────────────────────────────────
  const playerLevel: number = player?.level ?? 1;
  const playerXp: number = player?.xp ?? 0;
  const xpFloor = Math.floor(100 * Math.pow(1.4, playerLevel - 2)); // xp at start of current level
  const xpCeil = xpForNextLevel(playerLevel);
  const xpProgress = Math.max(0, playerXp - (playerLevel > 1 ? xpFloor : 0));
  const xpRange = Math.max(1, xpCeil - (playerLevel > 1 ? xpFloor : 0));
  const xpPct = Math.min(100, Math.round((xpProgress / xpRange) * 100));
  const rations = player ? countItem(player.inventory ?? [], 'Rations') : 0;

  // ── StatBar helper ─────────────────────────────────────────────────────────
  const StatBar = ({ label, value, max, color }: { label: string; value: number; max: number; color: string }) => {
    const pct = Math.min(100, Math.round((value / Math.max(1, max)) * 100));
    return (
      <div style={{ marginBottom: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, ...tf, color: T.textMuted, marginBottom: 2 }}>
          <span>{label}</span>
          <span>{value}/{max}</span>
        </div>
        <div style={{ height: 5, background: T.border, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: color, transition: 'width 0.3s' }} />
        </div>
      </div>
    );
  };

  const playerInfoPanel = player ? (
    <div style={{ background: T.panel, borderBottom: `1px solid ${T.border}`, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0, maxHeight: '60%' }}>
      {/* Identity card — two column: left = icon/name/class, right = HP/XP/attributes */}
      <div style={{ background: T.panelAlt, border: `1px solid ${T.border}`, padding: 10, display: 'flex', gap: 10 }}>
        {/* Left: class badge + name + class·level */}
        <div style={{ textAlign: 'center' as const, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 70 }}>
          <div style={{ fontSize: 22, marginBottom: 4 }}>{(CLASSES as any)[player.class]?.icon ?? '⚔️'}</div>
          <div style={{ ...tf, color: T.gold, fontSize: 13 }}>{player.name}</div>
          <div style={{ color: T.accent, fontSize: 10, letterSpacing: 1, marginTop: 2 }}>{player.class} · Lv.{playerLevel}</div>
        </div>
        {/* Divider */}
        <div style={{ width: 1, background: T.border, flexShrink: 0 }} />
        {/* Right: HP/XP bars + attributes */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <StatBar label="❤️ HP" value={hp} max={maxHp} color={T.hpColor} />
          <StatBar label="✨ XP" value={xpProgress} max={xpRange} color={T.xpColor} />
          <div style={{ fontSize: 10, color: T.textFaint, textAlign: 'right' as const, marginTop: 1, marginBottom: 6 }}>Next: {xpCeil} XP</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
            {([['STR', 'str'], ['AGI', 'agi'], ['INT', 'int'], ['WIL', 'wil']] as [string, string][]).map(([label, key]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: T.panel, padding: '3px 5px', border: `1px solid ${T.border}` }}>
                <span style={{ fontSize: 10, color: T.textMuted }}>{label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <span style={{ color: T.gold, fontSize: 12, ...tf }}>{(player as any)[key] ?? '—'}</span>
                  {(player?.statPoints ?? 0) > 0 && (
                    <button
                      onClick={() => handleCommand('stat_point:' + key)}
                      style={{ background: T.accent + '33', border: `1px solid ${T.accent}`, color: T.accent, width: 16, height: 16, fontSize: 11, cursor: 'pointer', padding: 0, lineHeight: '1' }}
                    >+</button>
                  )}
                </div>
              </div>
            ))}
          </div>
          {(player?.statPoints ?? 0) > 0 && (
            <div style={{ color: T.gold, fontSize: 11, textAlign: 'center' as const, marginTop: 4, animation: 'pulse 1.5s infinite' }}>
              ⬆ {player.statPoints} stat points!
            </div>
          )}
        </div>
      </div>
      {/* Resources row */}
      <div style={{ background: T.panelAlt, border: `1px solid ${T.border}`, padding: 12, display: 'flex', justifyContent: 'space-around' }}>
        {([['🪙', player.gold, 'Gold'], ['🎒', rations, 'Rations'], ['⭐', player.reputation ?? 0, 'Rep']] as [string, any, string][]).map(([icon, val, lbl]) => (
          <div key={lbl} style={{ textAlign: 'center' as const }}>
            <div style={{ color: lbl === 'Rations' ? (val > 0 ? '#80a060' : '#c05050') : T.gold, fontSize: 17, lineHeight: '1.2', ...tf }}>{val}</div>
            <div style={{ color: T.textMuted, fontSize: 10 }}>{icon} {lbl}</div>
          </div>
        ))}
      </div>
    </div>
  ) : null;

  // ── Bottom action buttons (right column, legacy style) ─────────────────────

  const activeQuestCount = (player?.quests ?? []).filter((q: any) => q.status === 'active').length;
  const bestiaryCount = (player?.bestiary ?? []).length;
  const skillPts = player?.skillPoints ?? 0;
  const atCapital = player?.location === 'Aethermoor Capital';
  const inDungeon = ((player as any)?.dungeon?.floor ?? 0) > 0;
  const dungeonAvailable = atCapital && !inDungeon;

  const badgeBtn = (label: string, onClick: () => void, badge?: { count: number; color: string }) => (
    <button
      onClick={onClick}
      style={{ background: 'transparent', border: `1px solid ${T.accent}`, color: T.gold, padding: '4px 10px', fontSize: 11, cursor: 'pointer', fontFamily: "'Cinzel','Palatino Linotype',serif", letterSpacing: 1, position: 'relative' as const }}
    >
      {label}
      {badge && badge.count > 0 && (
        <span style={{ position: 'absolute', top: -4, right: -4, background: badge.color, color: '#fff', borderRadius: '50%', width: 14, height: 14, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {badge.count}
        </span>
      )}
    </button>
  );

  const actionButtons = player && (
    <div style={{ display: 'flex', flexShrink: 0, borderTop: `1px solid ${T.border}`, padding: '6px 8px', gap: 4, flexWrap: 'wrap' as const, justifyContent: 'flex-start', background: T.panelAlt }}>
      {badgeBtn('📜 Quests', () => ui.toggleModal('questLog'), { count: activeQuestCount, color: T.accent })}
      {['town', 'npc'].includes(player?.context) && tbBtn('🛒 Shop', () => ui.toggleModal('shop'))}
      {tbBtn('🎒 Gear', () => ui.toggleModal('inventory'))}
      {tbBtn('⭐ Rep', () => ui.toggleModal('standings'))}
      {tbBtn('🗺️ Map', () => ui.toggleModal('map'))}
      {badgeBtn('📖 Bestiary', () => ui.toggleModal('bestiary'), { count: bestiaryCount, color: '#c04040' })}
      {tbBtn('⚒️ Craft', () => ui.toggleModal('crafting'))}
      {tbBtn('📝 Patch', () => ui.openModal('patchNotes'))}
      {badgeBtn('🌿 Skills', () => ui.toggleModal('skillTree'), { count: skillPts, color: '#60a060' })}
      <button
        onClick={() => dungeonAvailable ? handleCommand('enter_dungeon') : !atCapital ? showDungeonHint() : undefined}
        title={atCapital ? (inDungeon ? 'Already in the dungeon' : 'Enter the Dungeon of Echoes') : 'Travel to Aethermoor Capital to access the Dungeon of Echoes'}
        style={{
          background: dungeonAvailable ? 'rgba(100,20,20,0.35)' : 'transparent',
          border: `1px solid ${dungeonAvailable ? '#c03030' : T.border}`,
          color: dungeonAvailable ? '#e06060' : '#444',
          padding: '4px 10px', fontSize: 11,
          cursor: dungeonAvailable ? 'pointer' : 'not-allowed',
          fontFamily: "'Cinzel','Palatino Linotype',serif", letterSpacing: 1,
          animation: dungeonAvailable ? 'pulse 1.2s infinite' : 'none',
          opacity: atCapital ? 1 : 0.35,
          transition: 'all 0.3s',
        }}
      >🕳️ Dungeon</button>
      {/* Dungeon hint toast */}
      {dungeonHint && (
        <div style={{
          position: 'fixed' as const, bottom: 80, left: '50%', transform: 'translateX(-50%)',
          background: '#0d0610', border: '1px solid #6b2a8a', color: '#c89ad8',
          padding: '12px 20px', fontSize: 13, fontFamily: "'Crimson Text',Georgia,serif",
          fontStyle: 'italic', lineHeight: 1.7, maxWidth: 320, textAlign: 'center' as const,
          zIndex: 9999, boxShadow: '0 4px 24px #00000099', animation: 'slideIn 0.3s ease',
          pointerEvents: 'none' as const,
        }}>
          "Those who seek the Dungeon of Echoes must first stand before the seat of power... where the Capital's spires pierce the sky, a darkness waits beneath."
        </div>
      )}
    </div>
  );

  // ── Right column (combat + quest + command buttons) ─────────────────────────

  const rightColumn = (
    <div
      style={{
        width: 280,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        flexShrink: 0,
        borderLeft: `1px solid ${T.border}`,
      }}
    >
      {/* Player info panel at the top */}
      {playerInfoPanel}
      {/* Context/location bar */}
      <ContextBar
        player={gameState.player}
        isLoading={gameLoop.isLoading}
        isDyslexic={isDyslexic}
      />
      {/* Scrollable info area */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {ui.currentEnemy && (
          <CombatPanel
            enemy={ui.currentEnemy}
            combatLog={ui.combatLog}
            playerStatusEffects={ui.playerStatusEffects}
            playerDefending={ui.playerDefending}
          />
        )}
        {worldSeed && (
          <MainQuestPanel
            worldSeed={gameState.worldSeed}
            onOpen={() => ui.toggleModal('questLog')}
          />
        )}
      </div>

      {/* Action buttons at bottom of right column (legacy style) */}
      {actionButtons}
    </div>
  );

  // ── Desktop layout ──────────────────────────────────────────────────────────

  // ── Legacy-style top header ────────────────────────────────────────────────
  const toolbar = (
    <div
      style={{
        background: T.panelAlt,
        borderBottom: `1px solid ${T.border}`,
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        userSelect: 'none' as const,
      }}
    >
      <div style={{ ...tf, color: T.gold, fontSize: 18, letterSpacing: 3 }}>⚔ AETHERMOOR</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {ui.levelUpMsg && (
          <div style={{ color: '#ffffff', fontSize: 13, animation: 'pulse 1s infinite', ...tf, textShadow: `0 0 12px ${T.gold}` }}>
            {ui.levelUpMsg}
          </div>
        )}
        <div style={{ ...tf, color: clockColor, fontSize: 12, letterSpacing: 1 }}>{clockStr}</div>
        <button
          onClick={() => router.push('/')}
          style={{ background: 'transparent', border: `1px solid ${T.accent}`, color: T.gold, padding: '4px 10px', fontSize: 11, cursor: 'pointer', fontFamily: "'Cinzel','Palatino Linotype',serif", letterSpacing: 1 }}
        >
          New Game
        </button>
        {player && (
          <button
            onClick={() => void storage.saveGame(gameState.player!, gameState.worldSeed!, gameState.messages ?? [], gameState.narrative ?? '', gameState.log ?? [])}
            style={{ background: 'transparent', border: `1px solid ${T.border}`, color: T.textMuted, padding: '4px 10px', fontSize: 11, cursor: 'pointer', fontFamily: "'Cinzel','Palatino Linotype',serif", letterSpacing: 1 }}
          >
            💾 Save
          </button>
        )}
        {auth.token && (
          <button
            onClick={() => void auth.logout()}
            style={{ background: 'transparent', border: `1px solid ${T.border}`, color: T.textMuted, padding: '4px 10px', fontSize: 11, cursor: 'pointer', fontFamily: "'Cinzel','Palatino Linotype',serif", letterSpacing: 1 }}
          >
            Logout
          </button>
        )}
      </div>
    </div>
  );


  const desktopLayout = (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      {/* Left: story + suggestions/input bar (fills all space) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <NarrativePanel
          narrative={gameState.narrative}
          log={gameState.log}
        />
        {/* Bottom bar: stacked suggestions (left) + input bar (right) */}
        <div style={{ display: 'flex', flexShrink: 0, borderTop: `1px solid ${T.border}` }}>
          {/* Stacked suggestion buttons */}
          {ui.suggestions.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', flexShrink: 0, borderRight: `1px solid ${T.border}` }}>
              {ui.suggestions.slice(0, 3).map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleFreeText(s)}
                  style={{
                    padding: '0 14px',
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    borderBottom: idx < 2 ? `1px solid ${T.border}` : 'none',
                    color: T.gold,
                    cursor: 'pointer',
                    fontFamily: "'Cinzel',serif",
                    fontSize: 11,
                    letterSpacing: 0.5,
                    textAlign: 'left' as const,
                    whiteSpace: 'nowrap' as const,
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = T.panelAlt)}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          {/* Input bar fills remaining width */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <InputBar
              player={gameState.player}
              onFreeText={handleFreeText}
              isLoading={gameLoop.isLoading}
              fillInput={ui.fillInput || null}
            />
          </div>
        </div>
      </div>

      {rightColumn}
    </div>
  );

  // ── Mobile layout ───────────────────────────────────────────────────────────

  const mobileLayout = (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Narrative (scrollable) */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <NarrativePanel
          narrative={gameState.narrative}
          log={gameState.log}
        />
      </div>

      {/* Context/location bar */}
      <ContextBar
        player={gameState.player}
        isLoading={gameLoop.isLoading}
        isDyslexic={isDyslexic}
      />

      {/* Commands + combat info */}
      <div
        style={{
          padding: '10px 12px',
          background: T.panelAlt,
          borderTop: `1px solid ${T.border}`,
          overflowY: 'auto',
          maxHeight: '42vh',
        }}
      >
        {ui.currentEnemy && (
          <CombatPanel
            enemy={ui.currentEnemy}
            combatLog={ui.combatLog}
            playerStatusEffects={ui.playerStatusEffects}
            playerDefending={ui.playerDefending}
          />
        )}
        {worldSeed && (
          <MainQuestPanel
            worldSeed={gameState.worldSeed}
            onOpen={() => ui.toggleModal('questLog')}
          />
        )}
        <MobileCommandPanel
          player={gameState.player}
          onCommand={handleCommand}
          isLoading={gameLoop.isLoading}
          isDyslexic={isDyslexic}
        />
      </div>

      {/* Input bar — fixed to screen bottom */}
      <InputBar
        player={gameState.player}
        onFreeText={handleFreeText}
        isLoading={gameLoop.isLoading}
        fillInput={ui.fillInput || null}
      />
    </div>
  );

  // ── Map overlay ─────────────────────────────────────────────────────────────

  const mapOverlay =
    ui.mapOpen && player && worldSeed ? (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 200,
          background: '#000000cc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}
      >
        <MapView
          player={gameState.player as any}
          worldSeed={gameState.worldSeed as any}
          onClose={() => ui.setMapOpen(false)}
        />
      </div>
    ) : null;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        overflow: 'hidden',
        background: T.bg,
        color: T.text,
      }}
    >
      {toolbar}

      {/* Level-up banner */}
      {ui.levelUpMsg && (
        <div
          style={{
            background: T.accent + '22',
            border: `1px solid ${T.accent}`,
            padding: '8px 16px',
            textAlign: 'center',
            ...tf,
            color: T.gold,
            fontSize: 13,
            letterSpacing: 2,
            flexShrink: 0,
          }}
        >
          {ui.levelUpMsg}
          <button
            onClick={() => ui.setLevelUpMsg('')}
            style={{
              marginLeft: 12,
              background: 'none',
              border: 'none',
              color: T.textFaint,
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Main content area — desktop or mobile layout */}
      {ui.isMobile ? mobileLayout : desktopLayout}

      {/* Map overlay */}
      {mapOverlay}

      {/* ─── Screens & Modals ─── */}

      {ui.showInventory && player && (
        <InventoryScreen
          player={player}
          onEquip={(item: string) => handleCommand('equip:' + item)}
          onUnequip={(slot: string) => handleCommand('unequip:' + slot)}
          onUse={(item: string) => handleCommand('use:' + item)}
          onDrop={(item: string) => handleCommand('drop:' + item)}
          onClose={() => ui.closeModal('inventory')}
        />
      )}

      {ui.showShop && player && (
        <ShopScreen
          player={player}
          onBuy={(item: any, price: number) =>
            handleCommand(`buy:${(item as any)?.name ?? String(item)}:${price}`)
          }
          onSell={(itemName: string, price: number) =>
            handleCommand(`sell:${itemName}:${price}`)
          }
          onClose={() => ui.closeModal('shop')}
        />
      )}

      {ui.showQuestLog && player && (
        <QuestLogScreen
          player={player}
          worldSeed={gameState.worldSeed}
          onClose={() => ui.closeModal('questLog')}
          onDismiss={(questId: string) => handleCommand('dismiss_quest:' + questId)}
        />
      )}

      {ui.showBestiary && player && (
        <BestiaryScreen
          player={player}
          onClose={() => ui.closeModal('bestiary')}
        />
      )}

      {ui.showSkillTree && player && (
        <SkillTreeScreen
          player={player}
          onUnlock={(skillId: string) => handleCommand('unlock_skill:' + skillId)}
          onClose={() => ui.closeModal('skillTree')}
        />
      )}

      {ui.showStandings && player && (
        <StandingsScreen
          player={player}
          onClose={() => ui.closeModal('standings')}
        />
      )}

      {ui.showCrafting && player && (
        <CraftingScreen
          player={player}
          onCraft={(recipeId: string) => handleCommand('craft:' + recipeId)}
          onClose={() => ui.closeModal('crafting')}
        />
      )}

      {ui.showNGPlusScreen && player && (
        <NGPlusScreen
          player={player}
          worldSeed={gameState.worldSeed}
          onConfirm={(opts: any) =>
            handleCommand('ng_plus:' + JSON.stringify(opts))
          }
          onCancel={() => ui.closeModal('ngPlus')}
        />
      )}

      {ui.showPatchNotes && (
        <PatchNotesScreen onClose={() => ui.closeModal('patchNotes')} />
      )}

      {ui.showHowToPlay && (
        <HowToPlayModal onClose={() => ui.closeModal('howToPlay')} />
      )}

      {ui.showUserProfile && auth.email && (
        <UserProfileModal
          email={auth.email}
          onClose={() => ui.closeModal('userProfile')}
        />
      )}

      {ui.showFactionOffer && player?.pendingFactionOffer && (
        <FactionOfferModal
          factionId={player.pendingFactionOffer as string}
          player={player}
          onJoin={(fid: string) => {
            handleCommand('join_faction:' + fid);
            ui.closeModal('factionOffer');
          }}
          onDecline={(fid: string) => {
            handleCommand('decline_faction:' + fid);
            ui.closeModal('factionOffer');
          }}
          onRival={(fid: string) => {
            handleCommand('rival_faction:' + fid);
            ui.closeModal('factionOffer');
          }}
        />
      )}

      {/*
        ClassInfoModal is used during character creation (future CharacterCreationScreen).
        Imported here so it is available in the component tree; rendered when cls is set.
      */}
      {(false as boolean) && (
        <ClassInfoModal cls={'' as any} onClose={() => undefined} />
      )}
    </div>
  );
}

// ─── Outer wrapper: provides ThemeProvider context ────────────────────────────

export function GameView() {
  return (
    <ThemeProvider>
      <GameContent />
    </ThemeProvider>
  );
}
