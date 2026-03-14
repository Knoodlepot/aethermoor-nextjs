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

// ─── Inner component (must live inside ThemeProvider) ─────────────────────────

function GameContent() {
  // ...existing code...

    // [E2E DEBUG] GameContent function invoked
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line no-console
      console.log('[E2E DEBUG] GameContent function invoked');
      // E2E: force a breakpoint for test
      debugger;
      // window.alert('[E2E DEBUG] GameContent function invoked');
    }

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

  const playerInfoPanel = (
    <div
      style={{
        background: T.panel,
        borderBottom: `2px solid ${T.border}`,
        padding: '8px 14px',
        userSelect: 'none' as const,
        marginBottom: 12,
      }}
    >
      {/* Name / class / level */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 6,
          flexWrap: 'wrap' as const,
        }}
      >
        <span
          style={{
            ...tf,
            color: T.gold,
            fontSize: 14,
            letterSpacing: 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap' as const,
            maxWidth: 200,
          }}
        >
          {player?.name || 'Adventurer'}
        </span>
        <span style={{ color: T.textFaint, fontSize: 11 }}>·</span>
        <span style={{ ...tf, color: T.accent, fontSize: 11, letterSpacing: 1 }}>
          {player?.class || '—'}&nbsp;Lv.{player?.level ?? 1}
        </span>
      </div>
      {/* Stats + HP + gold */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexWrap: 'wrap' as const,
        }}
      >
        {/* Core stats */}
        {(
          [
            ['STR', player?.str],
            ['AGI', player?.agi],
            ['INT', player?.int],
            ['WIL', player?.wil],
          ] as [string, number | undefined][]
        ).map(([label, val]) => (
          <div key={label} style={{ textAlign: 'center', minWidth: 28 }}>
            <div style={{ ...tf, color: T.text, fontSize: 13, lineHeight: '1.2' }}>
              {val ?? '—'}
            </div>
            <div style={{ ...tf, color: T.textFaint, fontSize: 9, letterSpacing: 1 }}>
              {label}
            </div>
          </div>
        ))}

        <div style={{ width: 1, height: 24, background: T.border, flexShrink: 0 }} />

        {/* HP bar */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 10,
              ...tf,
              color: T.textMuted,
              marginBottom: 2,
            }}
          >
            <span>HP</span>
            <span style={{ marginLeft: 8 }}>
              {hp}/{maxHp}
            </span>
          </div>
          <div
            style={{
              height: 5,
              width: 100,
              borderRadius: 3,
              background: T.border,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${hpPct}%`,
                background: hpColor,
                borderRadius: 3,
                transition: 'width 0.3s',
              }}
            />
          </div>
        </div>

        {/* Gold */}
        <div style={{ ...tf, color: T.gold, fontSize: 13, whiteSpace: 'nowrap' as const }}>
          {player?.gold ?? 0} gp
        </div>
      </div>
    </div>
  );

  // ── Bottom action buttons (right column, legacy style) ─────────────────────
  const actionButtons = player && (
    <div style={{ display: 'flex', flexShrink: 0, borderTop: `1px solid ${T.border}`, padding: '6px 8px', gap: 4, flexWrap: 'wrap' as const, justifyContent: 'flex-start', background: T.panelAlt }}>
      {tbBtn('📜 Quests', () => ui.toggleModal('questLog'))}
      {['town', 'npc'].includes(player?.context) && tbBtn('🛒 Shop', () => ui.toggleModal('shop'))}
      {tbBtn('🎒 Gear', () => ui.toggleModal('inventory'))}
      {tbBtn('⭐ Rep', () => ui.toggleModal('standings'))}
      {tbBtn('📖 Bestiary', () => ui.toggleModal('bestiary'))}
      {tbBtn('⚒️ Craft', () => ui.toggleModal('crafting'))}
      {tbBtn('📝 Patch', () => ui.openModal('patchNotes'))}
      {tbBtn('🌿 Skills', () => ui.toggleModal('skillTree'))}
      {tbBtn('❓ Guide', () => ui.openModal('howToPlay'))}
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
      {/* Left: narrative + input bar */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <NarrativePanel
          narrative={gameState.narrative}
          log={gameState.log}
          suggestions={ui.suggestions}
          pendingSuggestion={ui.pendingSuggestion}
          onSuggestionSelect={(s) => {
            // Stage the suggestion for confirm-or-edit; NarrativePanel shows the confirm card
            ui.setPendingSuggestion(s);
          }}
        />
        <InputBar
          player={gameState.player}
          onFreeText={handleFreeText}
          isLoading={gameLoop.isLoading}
          fillInput={ui.fillInput || null}
        />
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
          suggestions={ui.suggestions}
          pendingSuggestion={ui.pendingSuggestion}
          onSuggestionSelect={(s) => ui.setPendingSuggestion(s)}
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
