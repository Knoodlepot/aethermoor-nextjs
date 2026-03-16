"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { SideQuestPanel } from '@/components/panels/SideQuestPanel';
import { ContextActionPanel } from '@/components/panels/ContextActionPanel';

// UI
import { NarrativePanel } from '@/components/ui/NarrativePanel';
import { MapView } from '@/components/ui/MapView';
import { MiniMap } from '@/components/ui/MiniMap';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { AgeGate } from '@/components/ui/AgeGate';

// Screens
import { CharacterCreationScreen } from '@/components/screens/CharacterCreationScreen';
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
import { OutOfTokensScreen } from '@/components/screens/OutOfTokensScreen';
import { DeathScreen } from '@/components/screens/DeathScreen';
import { TokenShopScreen } from '@/components/screens/TokenShopScreen';

// Modals
import { HowToPlayModal } from '@/components/modals/HowToPlayModal';
import { FactionOfferModal } from '@/components/modals/FactionOfferModal';
import { UserProfileModal } from '@/components/modals/UserProfileModal';
import { SaveSlotModal } from '@/components/modals/SaveSlotModal';
import { ClassInfoModal } from '@/components/modals/ClassInfoModal';

import { CLASSES, STATUS_EFFECTS } from '@/lib/constants';
import { countItem, XP_TABLE } from '@/lib/helpers';
import { generateWorldSeed, INIT_PLAYER } from '@/lib/worldgen';

// ─── Inner component (must live inside ThemeProvider) ─────────────────────────

/** XP required to reach the next level (simple formula matching legacy) */
function xpForNextLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.4, level - 1));
}


function GameContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNewGame = searchParams.get('new') === '1';
  const { T, tf, isDyslexic } = useTheme();

  // All hooks in dependency order
  const auth = useAuth();
  const initialSlot = Math.min(3, Math.max(1, parseInt(searchParams.get('slot') ?? '1', 10) || 1));
  const storage = useStorage(auth.token, initialSlot);
  const gameState = useGameState(storage);
  const ui = useUI();
  const gameLoop = useGameLoop(gameState, ui, storage, auth.token, (bal) => setTokenBalance(bal));

  // Guest-mode flag: bypass auth gate without a real JWT
  const [guestMode, setGuestMode] = useState(false);
  const [newGameLoading, setNewGameLoading] = useState(false);
  const [showNewGameConfirm, setShowNewGameConfirm] = useState(false);
  const [showSaveSlot, setShowSaveSlot] = useState(false);


  // Age gate — persisted in localStorage so it only shows once per browser
  const [ageVerified, setAgeVerified] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAgeVerified(localStorage.getItem('aethermoor_age_verified') === '1');
    }
  }, []);

  const handleAgeConfirm = () => {
    localStorage.setItem('aethermoor_age_verified', '1');
    setAgeVerified(true);
  };

  // Token balance
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Fix: seedCopied state for seed copy-to-clipboard UI (must be at top level)
  const [seedCopied, setSeedCopied] = useState(false);
  const [playerIdCopied, setPlayerIdCopied] = useState(false);
  const [showMobilePanel, setShowMobilePanel] = useState(false);

  // Fetch token balance on mount and after Stripe return
  useEffect(() => {
    if (auth.authStatus !== 'authed') return;
    fetch('/api/tokens/balance', { credentials: 'include' })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.balance != null) setTokenBalance(d.balance); })
      .catch(() => {});

    if (searchParams.get('payment') === 'success') {
      setPaymentSuccess(true);
      // Replace URL to remove query param, then clear banner after 8s
      window.history.replaceState({}, '', window.location.pathname);
      setTimeout(() => setPaymentSuccess(false), 8000);
    }
  }, [auth.authStatus, searchParams]);

  /** Start a new game: generate world, init player, get opening narrative */
  const handleStartNewGame = async (name: string, cls: string, seedStr?: string) => {
    storage.clearAllSaves();
    setNewGameLoading(true);
    try {
      const seed = generateWorldSeed(seedStr);
      const worldData = seed.worldData ?? [];
      // Use seeded RNG for starting location
      const mulberry32 = (a: number) => {
        return function() {
          var t = a += 0x6D2B79F5;
          t = Math.imul(t ^ t >>> 15, t | 1);
          t ^= t + Math.imul(t ^ t >>> 7, t | 61);
          return ((t ^ t >>> 14) >>> 0) / 4294967296;
        }
      };
      const stringToSeed = (str: string) => {
        let h = 2166136261 >>> 0;
        for (let i = 0; i < str.length; i++) {
          h ^= str.charCodeAt(i);
          h = Math.imul(h, 16777619);
        }
        return h >>> 0;
      };
      const rng = mulberry32(stringToSeed(seed.seed || seedStr || ''));
      const starters = worldData.filter((d: any) => d.type === 'village' || d.type === 'hamlet');
      const startLoc: string = starters.length > 0
        ? starters[Math.floor(rng() * starters.length)].name
        : 'Aethermoor Capital';
      // Debug log for settlements and routes
      if (typeof window !== 'undefined') {
        // eslint-disable-next-line no-console
        const settlements = worldData.filter((d: any) => ['capital','city','town','village','hamlet'].includes(d.type));
        const routes = seed.travelMatrix?.routes || [];
        console.log('[Worldgen Debug]', {
          settlementsCount: settlements.length,
          settlements: settlements.map((s: any) => ({ name: s.name, type: s.type })),
          routesCount: routes.length,
          routes: routes.map((r: any) => ({ from: r.from, to: r.to, roadType: r.roadType })),
          startLoc,
          seed: seed.seed,
        });
      }

      const mainQuestEntry = {
        id: 'main_' + Date.now(),
        title: seed.questTitle,
        objective: 'Investigate the growing darkness across Aethermoor',
        status: 'active',
        type: 'main',
        isMain: true,
        templateIcon: seed.templateIcon,
      };


      // Reveal all directly connected locations (neighbors) at game start
      const locationGrid = seed.travelMatrix?.locationGrid || {};
      const routes = seed.travelMatrix?.routes || [];
      const neighborNames = routes
        .filter((r: any) => r.from === startLoc || r.to === startLoc)
        .map((r: any) => r.from === startLoc ? r.to : r.from);
      // Only the starting location is explored; neighbors show as "?" on the map
      const initialExplored = [startLoc];
      if (typeof window !== 'undefined') {
        // eslint-disable-next-line no-console
        console.log('[Worldgen Debug - Explored]', {
          startLoc,
          neighborNames,
          initialExplored,
        });
      }

      const player = {
        ...INIT_PLAYER(name, cls, startLoc, worldData),
        location: startLoc,
        exploredLocations: initialExplored,
        quests: [mainQuestEntry],
      };

      gameState.setPlayer(player as any);
      gameState.setWorldSeed(seed as any);
      gameState.setMessages([]);
      gameState.setLog([]);

      // Call narrator for opening scene
      const introMsg = [
        {
          role: 'user',
          content: `Begin the adventure. I am ${player.name}, a ${player.class}. Paint the opening scene in ${player.location}. The world has a shadow over it — ${seed.act1Hook}. Don't name the villain yet. Describe the world around me richly with this dread woven in naturally so I know what I can do. One first hint of the main quest hook should colour the atmosphere.`,
        },
      ];
      gameState.addMessage('user', introMsg[0].content);

      // Await cloud save so the narrator API's canonical-state lookup finds
      // the new game, not the old save. Fire-and-forget had a timing race.
      await storage.saveToCloud(player as any, seed as any, introMsg, '', []);

      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ messages: introMsg, player, worldSeed: seed }),
      });
      const data = await res.json();
      if (res.ok && data.narrative) {
        const narrative = data.cleanNarrative || data.narrative;
        gameState.setNarrative(narrative);
        gameState.addMessage('assistant', narrative);
        // The API may return stale canonical data (old save) because the new
        // game hasn't been committed to the DB yet. Overlay any tag-based updates
        // from the opening scene but always lock in the core new-game identity fields.
        const finalPlayer = data.player
          ? {
              ...player,
              ...data.player,
              // Always lock new-game identity fields — canonical DB state is the OLD save
              name: player.name,
              class: player.class,
              level: player.level,
              location: player.location,
              exploredLocations: player.exploredLocations,
              quests: player.quests,
              inventory: player.inventory,
              gold: player.gold,
              hp: player.hp,
              maxHp: player.maxHp,
              factionStandings: player.factionStandings,
              statusEffects: player.statusEffects,
            }
          : player;
        const finalSeed = data.worldSeed
          ? { ...seed, ...data.worldSeed, travelMatrix: seed.travelMatrix, worldData: seed.worldData, worldSettlements: seed.worldSettlements, seed: seed.seed }
          : seed;
        gameState.setPlayer(finalPlayer);
        gameState.setWorldSeed(finalSeed);
        await storage.saveGame(finalPlayer, finalSeed, [
          ...introMsg,
          { role: 'assistant', content: narrative },
        ], narrative, []);
      } else {
        gameState.setNarrative('Your adventure begins…');
        await storage.saveGame(player, seed, introMsg, 'Your adventure begins…', []);
      }
    } catch (err) {
      console.error('New game error:', err);
    } finally {
      setNewGameLoading(false);
    }
  };


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

  // Debug: expose gameState for manual testing
  useEffect(() => {
    if (gameState.isLoaded) {
      // @ts-ignore
      window.gameState = gameState;
    }
  }, [gameState.isLoaded, gameState.player, gameState]);

  // ── Auth / loading gates ────────────────────────────────────────────────────

  if (!ageVerified) {
    return <AgeGate onConfirm={handleAgeConfirm} />;
  }

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

  // ── Character creation — no save found OR ?new=1 ─────────────────────────────

  if (gameState.isLoaded && (!gameState.player || isNewGame)) {
    return (
      <CharacterCreationScreen
        onStart={async (name, cls, seed) => {
          // After starting, clear the ?new=1 param so refreshing doesn't re-trigger
          await handleStartNewGame(name, cls, seed);
          router.replace('/game');
        }}
        isLoading={newGameLoading}
        gravestones={[]}
      />
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
  const _ch = Math.floor(clockHour);
  const _cm = clockHour % 1 >= 0.5 ? '30' : '00';
  const _h12 = _ch === 0 ? 12 : _ch > 12 ? _ch - 12 : _ch;
  const ampm = _ch < 12 ? 'AM' : 'PM';
  const clockStr = `Day ${clockDay} · ${_h12}:${_cm}${ampm}`;
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

  // Token color tier helper
  const tokenColor = (t: number) =>
    t > 50 ? '#80c060' : t > 20 ? '#c9a84c' : t > 10 ? '#e08030' : '#e04040';
  const tokenBorderColor = (t: number) =>
    t > 50 ? '#80c06044' : t > 20 ? '#c9a84c44' : t > 10 ? '#e0803066' : '#e0404066';

  // ── Player Info Panel (for right column) ───────────────────────────────────

  // ── XP bar values ──────────────────────────────────────────────────────────
  const playerLevel: number = player?.level ?? 1;
  const playerXp: number = player?.xp ?? 0;
  const xpFloor = XP_TABLE[Math.max(0, playerLevel - 1)] ?? 0;
  const xpCeil = XP_TABLE[Math.min(playerLevel, XP_TABLE.length - 1)] ?? XP_TABLE[XP_TABLE.length - 1];
  const xpProgress = Math.max(0, playerXp - xpFloor);
  const xpRange = Math.max(1, xpCeil - xpFloor);
  const xpPct = Math.min(100, Math.round((xpProgress / xpRange) * 100));
  const rations = player ? (player.inventory ?? []).filter((i: string) => i.toLowerCase().includes('ration')).length : 0;

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

  /** Compute tooltip lines for a given stat key + value */
  const statTooltip = (key: string, val: number): string[] => {
    const v = val || 0;
    switch (key) {
      case 'str': {
        const dmg = 5 + Math.floor(v / 2);
        const hw  = Math.floor(v / 3);
        const shv = v >= 10 ? 'guaranteed' : v >= 6 ? 'reliable' : 'unlikely';
        return [`Melee damage: ${dmg}`, `Heavy weapon: +${hw}`, `Shove/grapple: ${shv}`];
      }
      case 'agi': {
        const dodge = Math.min(45, v * 3);
        const bs    = Math.floor(v * 1.5);
        const sth   = v >= 8 ? 'expert' : v >= 5 ? 'reliable' : 'risky';
        return [`Dodge chance: ${dodge}%`, `Backstab: ${bs} dmg`, `Stealth: ${sth}`];
      }
      case 'int': {
        const sp  = 6 + Math.floor(v * 1.2);
        const pot = v >= 9 ? 'bonus tick' : v >= 4 ? 'full effect' : 'half effect';
        const id  = v >= 7 ? 'auto' : 'manual';
        return [`Spell damage: ~${sp}`, `Potions: ${pot}`, `Item identify: ${id}`];
      }
      case 'wil': {
        const dv  = Math.floor(v * 1.5);
        const mr  = Math.min(30, v * 2);
        const fr  = v >= 8 ? 'immune' : v >= 5 ? 'resists basic' : 'susceptible';
        return [`Divine/heal: ${dv}`, `Magic resist: ${mr}%`, `Fear: ${fr}`];
      }
      default: return [];
    }
  };

  /** Stat pill with hover tooltip */
  const StatPill = ({ label, statKey, value }: { label: string; statKey: string; value: number }) => {
    const [hovered, setHovered] = React.useState(false);
    const lines = statTooltip(statKey, value);
    return (
      <div
        style={{ position: 'relative' as const, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: T.panel, padding: '3px 5px', border: `1px solid ${hovered ? T.accent : T.border}`, cursor: 'default', transition: 'border-color 0.15s' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onTouchStart={() => setHovered(h => !h)}
      >
        <span style={{ fontSize: 10, color: T.textMuted }}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <span style={{ color: T.gold, fontSize: 12, ...tf }}>{value ?? '—'}</span>
          {(player?.statPoints ?? 0) > 0 && (
            <button
              onClick={() => handleCommand('stat_point:' + statKey)}
              style={{ background: T.accent + '33', border: `1px solid ${T.accent}`, color: T.accent, width: 16, height: 16, fontSize: 11, cursor: 'pointer', padding: 0, lineHeight: '1' }}
            >+</button>
          )}
        </div>
        {hovered && lines.length > 0 && (
          <div style={{
            position: 'absolute' as const,
            bottom: '100%',
            right: 0,
            marginBottom: 4,
            background: '#0a0805',
            border: `1px solid ${T.accent}`,
            padding: '6px 8px',
            zIndex: 100,
            width: 130,
            pointerEvents: 'none' as const,
            boxShadow: '0 4px 16px #00000088',
          }}>
            <div style={{ ...tf, color: T.accent, fontSize: 8, letterSpacing: 1, marginBottom: 4 }}>{label} MECHANICS</div>
            {lines.map((line, i) => (
              <div key={i} style={{ fontSize: 10, color: T.text, lineHeight: 1.5 }}>· {line}</div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Clock colour matching legacy: night=blue, dawn=orange, day=green, evening=amber
  const rawHour = (player as any)?.gameHour ?? 8;
  const charClockColor = rawHour < 6 || rawHour >= 21 ? '#6878c8'
    : rawHour < 8  ? '#c09050'
    : rawHour < 17 ? '#90b848'
    : '#c07038';

  const playerInfoPanel = player ? (
    <div style={{ background: T.panelAlt, borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
      {/* ── Identity block: centred, legacy style ── */}
      <div style={{ padding: '4px 6px 4px', textAlign: 'center' as const }}>
        <div style={{ ...tf, color: T.gold, fontSize: 16, letterSpacing: 1 }}>{player.name}</div>
        <div style={{ color: T.accent, fontSize: 11, letterSpacing: 1, marginTop: 2 }}>{player.class} · Lv.{playerLevel}</div>
        <div style={{ color: charClockColor, fontSize: 11, marginTop: 4, letterSpacing: 1 }}>{clockStr}</div>
      </div>

      {/* ── HP / XP bars ── */}
      <div style={{ padding: '0 6px 4px' }}>
        <StatBar label="❤️ HP" value={hp} max={maxHp} color={T.hpColor} />
        <StatBar label="✨ XP" value={xpProgress} max={xpRange} color={T.xpColor} />
        <div style={{ fontSize: 9, color: T.textFaint, textAlign: 'right' as const, marginTop: 2, marginBottom: 8 }}>
          Next: {xpCeil} XP
        </div>

        {(player?.statPoints ?? 0) > 0 && (
          <div style={{ color: T.gold, fontSize: 11, textAlign: 'center' as const, marginBottom: 4, animation: 'pulse 1.5s infinite' }}>
            ⬆ {player.statPoints} stat points!
          </div>
        )}
        {(player?.statusEffects?.length ?? 0) > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
            {player!.statusEffects!.map((eff: string) => {
              const info = STATUS_EFFECTS[eff];
              return (
                <span key={eff} title={info ? `${info.label}: ${info.description} | Cure: ${info.cure}` : eff}
                  style={{ fontSize: 10, padding: '2px 6px', borderRadius: 3, border: '1px solid #c0603066', color: '#c06030', cursor: 'help', whiteSpace: 'nowrap' as const }}>
                  {info?.icon ?? '❓'} {info?.label ?? eff}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Resources row ── */}
      <div style={{ borderTop: `1px solid ${T.border}`, padding: '4px 6px', display: 'flex', justifyContent: 'space-around' }}>
        {([['🪙', player.gold, 'Gold'], ['🎒', rations, 'Rations']] as [string, any, string][]).map(([icon, val, lbl]) => (
          <div key={lbl} style={{ textAlign: 'center' as const }}>
            <div style={{ color: lbl === 'Rations' ? (val > 0 ? '#80a060' : '#c05050') : T.gold, fontSize: 17, lineHeight: '1.2', ...tf }}>{val}</div>
            <div style={{ color: T.textMuted, fontSize: 10 }}>{icon} {lbl}</div>
          </div>
        ))}
        <button onClick={() => ui.toggleModal('standings')}
          style={{ textAlign: 'center' as const, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <div style={{ color: T.gold, fontSize: 17, lineHeight: '1.2', ...tf }}>{player.reputation ?? 0}</div>
          <div style={{ color: T.textMuted, fontSize: 10 }}>⭐ Rep</div>
        </button>
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
    <div style={{ display: 'flex', flexShrink: 0, borderTop: `1px solid ${T.border}`, padding: '6px 8px', gap: 4, flexWrap: 'wrap' as const, justifyContent: 'center', background: T.panelAlt }}>
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
        locationGrid={(gameState.worldSeed?.travelMatrix as any)?.locationGrid}
        onShop={() => ui.toggleModal('shop')}
        onSkills={() => ui.toggleModal('skillTree')}
        onQuests={() => ui.toggleModal('questLog')}
        onDungeon={() => dungeonAvailable ? handleCommand('enter_dungeon') : !atCapital ? showDungeonHint() : undefined}
        dungeonAvailable={dungeonAvailable}
        onCraft={() => ui.toggleModal('crafting')}
        onGear={() => ui.toggleModal('inventory')}
        onBestiary={() => ui.toggleModal('bestiary')}
        activeQuestCount={activeQuestCount}
        skillPts={skillPts}
        bestiaryCount={bestiaryCount}
      />
      {/* Context-sensitive action panel — changes template based on explore/town/combat */}
      {player && (
        <ContextActionPanel
          context={(player as any).context || 'explore'}
          isLoading={gameLoop.isLoading}
          onAction={(text) => handleFreeText(text)}
          onOpenShop={() => ui.toggleModal('shop')}
          inventory={(player as any).inventory || []}
          location={(player as any).location}
          locationGrid={(gameState.worldSeed?.travelMatrix as any)?.locationGrid}
        />
      )}

      <div className="ae-right-col" style={{ flex: 1, overflowY: 'auto' }}>
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
        <SideQuestPanel
          quests={gameState.player?.quests || []}
          onOpenQuest={(questId) => ui.openQuestLogAt(questId)}
          onToggleTrack={(questId) => handleCommand('toggle_quest_track:' + questId)}
          onAbandon={(questId) => handleCommand('abandon_quest:' + questId)}
          onOpenLog={() => ui.openModal('questLog')}
        />
        {player && worldSeed && (
          <MiniMap
            player={player}
            worldSeed={worldSeed}
            onOpenMap={() => ui.setMapOpen(true)}
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
        padding: '4px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        userSelect: 'none' as const,
      }}
    >
      <div style={{ ...tf, color: T.gold, fontSize: 18, letterSpacing: 3 }}>⚔ AETHERMOOR</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto', flexShrink: 1, msOverflowStyle: 'none' } as React.CSSProperties}>
        {/* Token balance display — always visible */}
        {tokenBalance !== null && (
          <div
            onClick={() => ui.openModal('tokenShop')}
            title="Buy more tokens"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer',
              padding: '4px 7px',
              border: `1px solid ${tokenBorderColor(tokenBalance)}`,
              borderRadius: 6,
              background: tokenBalance <= 10 ? '#e0404022' : 'transparent',
              transition: 'all 0.2s',
            }}
          >
            <span>🪙</span>
            <span
              style={{
                fontSize: 12,
                color: tokenColor(tokenBalance),
                fontWeight: tokenBalance <= 20 ? 'bold' : 'normal',
                animation: tokenBalance <= 10 ? 'pulse 1s infinite' : 'none',
                fontFamily: "'Cinzel','Palatino Linotype',serif",
              }}
            >
              {tokenBalance}
            </span>
          </div>
        )}
        {!ui.isMobile && (
          <>
            <button
              onClick={() => setShowNewGameConfirm(true)}
              style={{ background: 'transparent', border: `1px solid ${T.accent}`, color: T.gold, padding: '4px 10px', fontSize: 11, cursor: 'pointer', fontFamily: "'Cinzel','Palatino Linotype',serif", letterSpacing: 1 }}
            >
              New Game
            </button>
            {player && (
              <button
                onClick={() => setShowSaveSlot(true)}
                style={{ background: 'transparent', border: `1px solid ${T.border}`, color: T.textMuted, padding: '4px 10px', fontSize: 11, cursor: 'pointer', fontFamily: "'Cinzel','Palatino Linotype',serif", letterSpacing: 1 }}
              >
                💾 Save
              </button>
            )}
            {auth.token && (
              <button
                onClick={() => router.push('/')}
                style={{ background: 'transparent', border: `1px solid ${T.border}`, color: T.textMuted, padding: '4px 10px', fontSize: 11, cursor: 'pointer', fontFamily: "'Cinzel','Palatino Linotype',serif", letterSpacing: 1 }}
              >
                Main Menu
              </button>
            )}
            {worldSeed?.seed && (
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(worldSeed.seed);
                    setSeedCopied(true);
                    setTimeout(() => setSeedCopied(false), 1200);
                  } catch {}
                }}
                title="World Seed — share this code with friends so they can start a new game in the same world."
                style={{ background: 'transparent', border: `1px solid ${T.border}`, color: seedCopied ? T.gold : T.textMuted, padding: '4px 10px', fontSize: 11, cursor: 'pointer', fontFamily: "'Cinzel','Palatino Linotype',serif", letterSpacing: 1, transition: 'color 0.2s' }}
              >
                {seedCopied ? '✓ Copied' : '🌱 Seed'}
              </button>
            )}
            {auth.token && auth.playerId && (
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(auth.playerId!);
                    setPlayerIdCopied(true);
                    setTimeout(() => setPlayerIdCopied(false), 1500);
                  } catch {}
                }}
                title="Your Player ID — share with support or friends."
                style={{ background: 'transparent', border: `1px solid ${T.border}`, color: playerIdCopied ? T.gold : T.textMuted, padding: '4px 10px', fontSize: 11, cursor: 'pointer', fontFamily: "'Cinzel','Palatino Linotype',serif", letterSpacing: 1, transition: 'color 0.2s' }}
              >
                {playerIdCopied ? '✓ ID Copied' : '🪪 Player ID'}
              </button>
            )}
          </>
        )}
        {ui.isMobile && (
          <button
            onClick={() => setShowMobilePanel(true)}
            style={{ background: 'transparent', border: `1px solid ${T.border}`, color: T.textMuted, padding: '4px 10px', fontSize: 16, cursor: 'pointer', letterSpacing: 1 }}
          >
            ☰
          </button>
        )}
      </div>
    </div>
  );


  const desktopLayout = (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      {/* Left: story + suggestions + input bar (fills all space) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <NarrativePanel
          narrative={gameState.narrative}
          log={gameState.log}
        />
        {/* Suggestion buttons — sit above the input bar in their own row */}
        {ui.suggestions.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', flexShrink: 0, borderTop: `1px solid ${T.border}` }}>
            {ui.suggestions.slice(0, 3).map((s, idx) => (
              <button
                key={idx}
                onClick={() => { ui.setSuggestions([]); handleFreeText(s); }}
                style={{
                  padding: '9px 16px',
                  background: 'transparent',
                  border: 'none',
                  color: T.gold,
                  cursor: 'pointer',
                  fontFamily: "'Cinzel',serif",
                  fontSize: 11,
                  letterSpacing: 0.5,
                  textAlign: 'left' as const,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = T.panelAlt)}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                ▸ {s}
              </button>
            ))}
          </div>
        )}
        {/* Input bar */}
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
      {/* Compact character bar */}
      {player && (
        <div
          onClick={() => ui.toggleModal('inventory')}
          style={{
            background: T.panelAlt,
            borderBottom: `1px solid ${T.border}`,
            padding: '4px 10px',
            flexShrink: 0,
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
            <span style={{ ...tf, color: T.gold, fontSize: 11 }}>
              {player.name} · {player.class} Lv.{playerLevel}
            </span>
            {((player.statPoints ?? 0) > 0 || (player.skillPoints ?? 0) > 0) && (
              <span style={{ color: '#f0c060', fontSize: 10, animation: 'pulse 1s infinite' }}>⬆ Points!</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <div style={{ flex: 1, height: 4, background: T.border, borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.round((hp / maxHp) * 100)}%`, background: T.hpColor }} />
            </div>
            <div style={{ flex: 1, height: 4, background: T.border, borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${xpRange > 0 ? Math.round((xpProgress / xpRange) * 100) : 0}%`, background: T.xpColor }} />
            </div>
          </div>
        </div>
      )}

      {/* Narrative (scrollable, fills remaining space) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <NarrativePanel
          narrative={gameState.narrative}
          log={gameState.log}
        />
      </div>

      {/* Input bar */}
      <InputBar
        player={gameState.player}
        onFreeText={handleFreeText}
        isLoading={gameLoop.isLoading}
        fillInput={ui.fillInput || null}
      />
    </div>
  );

  // ── Mobile slide-in panel ────────────────────────────────────────────────────
  const mobilePanelOverlay = ui.isMobile ? (
    <>
      <div
        onClick={() => setShowMobilePanel(false)}
        style={{
          position: 'fixed', inset: 0, zIndex: 150,
          background: '#00000077',
          opacity: showMobilePanel ? 1 : 0,
          pointerEvents: showMobilePanel ? 'auto' : 'none',
          transition: 'opacity 0.25s ease',
        }}
      />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: '85%', zIndex: 151,
        background: T.bg,
        borderLeft: `1px solid ${T.border}`,
        display: 'flex', flexDirection: 'column',
        overflowY: 'auto',
        transform: showMobilePanel ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.25s ease',
      }}>
        {/* Close button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '6px 10px', borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
          <button onClick={() => setShowMobilePanel(false)} style={{ background: 'none', border: 'none', color: T.textMuted, fontSize: 20, cursor: 'pointer', lineHeight: 1 }}>✕</button>
        </div>
        {playerInfoPanel}
        <ContextBar
          player={gameState.player}
          isLoading={gameLoop.isLoading}
          isDyslexic={isDyslexic}
          locationGrid={(gameState.worldSeed?.travelMatrix as any)?.locationGrid}
          onShop={() => ui.toggleModal('shop')}
          onSkills={() => ui.toggleModal('skillTree')}
          onQuests={() => ui.toggleModal('questLog')}
          onDungeon={() => dungeonAvailable ? handleCommand('enter_dungeon') : !atCapital ? showDungeonHint() : undefined}
          dungeonAvailable={dungeonAvailable}
          onCraft={() => ui.toggleModal('crafting')}
          onGear={() => { ui.toggleModal('inventory'); setShowMobilePanel(false); }}
          onBestiary={() => { ui.toggleModal('bestiary'); setShowMobilePanel(false); }}
          activeQuestCount={activeQuestCount}
          skillPts={skillPts}
          bestiaryCount={bestiaryCount}
        />
        {ui.currentEnemy && (
          <CombatPanel
            enemy={ui.currentEnemy}
            combatLog={ui.combatLog}
            playerStatusEffects={ui.playerStatusEffects}
            playerDefending={ui.playerDefending}
          />
        )}
        {player && (
          <ContextActionPanel
            context={(player as any).context || 'explore'}
            isLoading={gameLoop.isLoading}
            onAction={(text) => { handleFreeText(text); setShowMobilePanel(false); }}
            onOpenShop={() => { ui.toggleModal('shop'); setShowMobilePanel(false); }}
            inventory={(player as any).inventory || []}
            location={(player as any).location}
            locationGrid={(gameState.worldSeed?.travelMatrix as any)?.locationGrid}
          />
        )}
        {worldSeed && (
          <MainQuestPanel
            worldSeed={gameState.worldSeed}
            onOpen={() => { ui.toggleModal('questLog'); setShowMobilePanel(false); }}
          />
        )}
        <SideQuestPanel
          quests={gameState.player?.quests || []}
          onOpenQuest={(questId) => { ui.openQuestLogAt(questId); setShowMobilePanel(false); }}
          onToggleTrack={(questId) => handleCommand('toggle_quest_track:' + questId)}
          onAbandon={(questId) => handleCommand('abandon_quest:' + questId)}
          onOpenLog={() => { ui.openModal('questLog'); setShowMobilePanel(false); }}
        />
        {player && worldSeed && (
          <MiniMap
            player={player}
            worldSeed={worldSeed}
            onOpenMap={() => { ui.setMapOpen(true); setShowMobilePanel(false); }}
          />
        )}
      </div>
    </>
  ) : null;

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
          key={gameState.worldSeed?.seed ?? (gameState.worldSeed as any)?.questTitle ?? `slot-${storage.currentSlot}`}
          player={gameState.player as any}
          worldSeed={gameState.worldSeed as any}
          onClose={() => ui.setMapOpen(false)}
          onCommand={handleCommand}
        />
      </div>
    ) : null;

  // ── Render ──────────────────────────────────────────────────────────────────

  // Out of tokens — fullscreen takeover
  if (ui.screen === 'out_of_tokens') {
    return (
      <OutOfTokensScreen
        onBuyTokens={() => {
          ui.setScreen('game');
          ui.openModal('tokenShop');
        }}
        onReturnToTitle={() => router.push('/')}
      />
    );
  }

  // Death — fullscreen permadeath screen
  if (ui.screen === 'death' && ui.deathInfo) {
    return (
      <DeathScreen
        name={ui.deathInfo.name}
        cls={ui.deathInfo.cls}
        level={ui.deathInfo.level}
        gameDay={ui.deathInfo.gameDay}
        finalNarrative={ui.deathInfo.finalNarrative}
        onBeginAnew={() => {
          ui.setScreen('game');
          router.push('/game?new=1');
        }}
      />
    );
  }

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

      {/* Main content area — desktop or mobile layout */}
      {ui.isMobile ? mobileLayout : desktopLayout}

      {/* Map overlay */}
      {mapOverlay}

      {mobilePanelOverlay}

      {/* ─── Screens & Modals ─── */}

      {ui.showInventory && player && (
        <InventoryScreen
          player={player}
          onEquip={(item: string) => handleCommand('equip:' + item)}
          onUnequip={(slot: string) => handleCommand('unequip:' + slot)}
          onUse={(item: string) => handleCommand('use:' + item)}
          onDrop={(item: string) => handleCommand('drop:' + item)}
          onUnlock={(skillId: string) => handleCommand('unlock_skill:' + skillId)}
          onSpendStats={(allocs: Record<string, number>) => {
            Object.entries(allocs).forEach(([stat, count]) => {
              for (let i = 0; i < count; i++) handleCommand('stat_point:' + stat);
            });
          }}
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
          onBarter={() => {
            ui.closeModal('shop');
            handleFreeText('I try to barter with the merchant, offering to negotiate a better price or trade goods instead of paying full coin.');
          }}
        />
      )}

      {ui.showQuestLog && player && (
        <QuestLogScreen
          player={player}
          worldSeed={gameState.worldSeed}
          onClose={() => ui.closeModal('questLog')}
          onDismiss={(questId: string) => handleCommand('dismiss_quest:' + questId)}
          onAbandon={(questId: string) => handleCommand('abandon_quest:' + questId)}
          onToggleTrack={(questId: string) => handleCommand('toggle_quest_track:' + questId)}
          initialQuestId={ui.questLogInitialId}
          onInitialQuestIdConsumed={ui.clearQuestLogInitialId}
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

      {/* ── Token Shop ────────────────────────────────────────────────────── */}
      {ui.showTokenShop && (
        <TokenShopScreen
          tokenBalance={tokenBalance ?? 0}
          paymentSuccess={paymentSuccess}
          onClose={() => ui.closeModal('tokenShop')}
        />
      )}

      {/* ── Save Slot picker ──────────────────────────────────────────────── */}
      {showSaveSlot && player && (
        <SaveSlotModal
          mode="save"
          currentSlot={storage.currentSlot}
          loadSlots={storage.loadSlots}
          onSave={(slot) => {
            storage.setCurrentSlot(slot);
            void storage.saveGame(gameState.player!, gameState.worldSeed!, gameState.messages ?? [], gameState.narrative ?? '', gameState.log ?? [], slot);
          }}
          onClose={() => setShowSaveSlot(false)}
        />
      )}

      {/* ── New Game confirm modal ─────────────────────────────────────────── */}
      {showNewGameConfirm && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: T.panel, border: `1px solid ${T.border}`,
            borderRadius: 6, padding: '2rem', maxWidth: 360, width: '90%',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>⚔️</div>
            <h2 style={{ ...tf, color: T.gold, fontFamily: "'Cinzel','Palatino Linotype',serif", fontSize: 18, marginBottom: 8 }}>
              Start a New Game?
            </h2>
            <p style={{ ...tf, color: T.textMuted, fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>
              Would you like to save your current game before starting fresh?
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={async () => {
                  await storage.saveGame(
                    gameState.player!, gameState.worldSeed!,
                    gameState.messages ?? [], gameState.narrative ?? '', gameState.log ?? []
                  );
                  setShowNewGameConfirm(false);
                  router.push('/game?new=1');
                }}
                style={{ background: T.gold, color: '#0d0d1a', border: 'none', borderRadius: 4, padding: '8px 18px', fontSize: 13, cursor: 'pointer', fontFamily: "'Cinzel','Palatino Linotype',serif", fontWeight: 'bold' }}
              >
                💾 Save & New Game
              </button>
              <button
                onClick={() => {
                  setShowNewGameConfirm(false);
                  router.push('/game?new=1');
                }}
                style={{ background: 'transparent', color: T.textMuted, border: `1px solid ${T.border}`, borderRadius: 4, padding: '8px 18px', fontSize: 13, cursor: 'pointer', fontFamily: "'Cinzel','Palatino Linotype',serif" }}
              >
                Skip
              </button>
              <button
                onClick={() => setShowNewGameConfirm(false)}
                style={{ background: 'transparent', color: T.textMuted, border: `1px solid ${T.border}`, borderRadius: 4, padding: '8px 18px', fontSize: 13, cursor: 'pointer', fontFamily: "'Cinzel','Palatino Linotype',serif" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Outer wrapper: provides ThemeProvider context ────────────────────────────

export function GameView() {
  return (
    <ThemeProvider>
      <Suspense fallback={null}>
        <GameContent />
      </Suspense>
    </ThemeProvider>
  );
}
