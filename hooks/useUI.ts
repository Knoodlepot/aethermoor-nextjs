'use client';

import { useState, useCallback } from 'react';
import type { Enemy } from '../lib/types';
import type { EventLogEntry } from '../lib/tagParsers';
import type { AchievementDef } from '../lib/achievements';

export type ScreenType = 'loading' | 'title' | 'game' | 'out_of_tokens' | 'death';

export interface UIContext {
  // Screen management
  screen: ScreenType;
  setScreen: (screen: ScreenType) => void;

  // Modal state
  showInventory: boolean;
  showShop: boolean;
  showQuestLog: boolean;
  showCrafting: boolean;
  showBestiary: boolean;
  showSkillTree: boolean;
  showStandings: boolean;
  showPatchNotes: boolean;
  showHowToPlay: boolean;
  showUserProfile: boolean;
  showFactionOffer: boolean;
  showNGPlusScreen: boolean;
  showEnding: boolean;
  showDungeonWarning: boolean;
  showTokenShop: boolean;
  showAchievements: boolean;
  showCompanion: boolean;
  showSubclass: boolean;

  // Achievement toasts
  achievementToasts: AchievementDef[];
  pushAchievementToast: (def: AchievementDef) => void;
  shiftAchievementToast: () => void;

  // Token warning
  lowTokenWarning: boolean;
  setLowTokenWarning: (show: boolean) => void;

  // Modal control
  openModal: (modalName: string) => void;
  closeModal: (modalName: string) => void;
  toggleModal: (modalName: string) => void;

  // Map state
  mapOpen: boolean;
  setMapOpen: (open: boolean) => void;

  // Combat state
  currentEnemy: Enemy | null;
  setCurrentEnemy: (enemy: Enemy | null) => void;
  combatLog: string[];
  addCombatLogEntry: (entry: string) => void;
  clearCombatLog: () => void;
  playerDefending: boolean;
  setPlayerDefending: (defending: boolean) => void;
  playerStatusEffects: string[];
  setPlayerStatusEffects: (effects: string[]) => void;

  // Mobile state
  isMobile: boolean;
  setIsMobile: (mobile: boolean) => void;

  // Input/suggestions state
  pendingSuggestion: any | null;
  setPendingSuggestion: (suggestion: any | null) => void;
  fillInput: string;
  setFillInput: (text: string) => void;
  suggestions: string[];
  setSuggestions: (suggestions: string[]) => void;
  lastInput: string;
  setLastInput: (text: string) => void;

  // Messages
  levelUpMsg: string;
  setLevelUpMsg: (msg: string) => void;
  dungeonExitPrompt: boolean;
  setDungeonExitPrompt: (show: boolean) => void;

  // Theme
  themeKey: string;
  setThemeKey: (key: string) => void;

  // Tab state
  leftTab: string;
  setLeftTab: (tab: string) => void;
  mobileTab: string;
  setMobileTab: (tab: string) => void;

  // Vision menu
  showVisionMenu: boolean;
  setShowVisionMenu: (show: boolean) => void;

  // Quest log deep-link
  questLogInitialId: string | null;
  openQuestLogAt: (questId: string) => void;
  clearQuestLogInitialId: () => void;

  // Death screen
  deathInfo: { name: string; cls: string; level: number; gameDay: number; finalNarrative: string } | null;
  showDeathScreen: (info: { name: string; cls: string; level: number; gameDay: number; finalNarrative: string }) => void;

  // Event log
  eventLog: EventLogEntry[];
  addEventLogEntries: (entries: EventLogEntry[]) => void;
  clearEventLog: () => void;
}

/**
 * useUI - Manage all UI screen and modal state
 */
export function useUI(): UIContext {
  // Screen management
  const [screen, setScreen] = useState<ScreenType>('loading');

  // Modal visibility flags
  const [showInventory, setShowInventory] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showQuestLog, setShowQuestLog] = useState(false);
  const [showCrafting, setShowCrafting] = useState(false);
  const [showBestiary, setShowBestiary] = useState(false);
  const [showSkillTree, setShowSkillTree] = useState(false);
  const [showStandings, setShowStandings] = useState(false);
  const [showPatchNotes, setShowPatchNotes] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showFactionOffer, setShowFactionOffer] = useState(false);
  const [showNGPlusScreen, setShowNGPlusScreen] = useState(false);
  const [showEnding, setShowEnding] = useState(false);
  const [showDungeonWarning, setShowDungeonWarning] = useState(false);
  const [showTokenShop, setShowTokenShop] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showCompanion, setShowCompanion] = useState(false);
  const [showSubclass, setShowSubclass] = useState(false);

  // Achievement toasts
  const [achievementToasts, setAchievementToasts] = useState<AchievementDef[]>([]);

  const pushAchievementToast = useCallback((def: AchievementDef) => {
    setAchievementToasts((prev) => [...prev, def]);
  }, []);

  const shiftAchievementToast = useCallback(() => {
    setAchievementToasts((prev) => prev.slice(1));
  }, []);

  // Token warning
  const [lowTokenWarning, setLowTokenWarning] = useState(false);

  // Map state
  const [mapOpen, setMapOpen] = useState(false);

  // Combat state
  const [currentEnemy, setCurrentEnemy] = useState<Enemy | null>(null);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  // Event log — initialise from localStorage so it survives page refresh
  const [eventLog, setEventLog] = useState<EventLogEntry[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('ae-event-log');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });
  const [playerDefending, setPlayerDefending] = useState(false);
  const [playerStatusEffects, setPlayerStatusEffects] = useState<string[]>([]);

  // Mobile state
  const [isMobile, setIsMobile] = useState(false);

  // Input/suggestions state
  const [pendingSuggestion, setPendingSuggestion] = useState<any | null>(null);
  const [fillInput, setFillInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [lastInput, setLastInput] = useState('');

  // Messages
  const [levelUpMsg, setLevelUpMsg] = useState('');
  const [dungeonExitPrompt, setDungeonExitPrompt] = useState(false);

  // Theme
  const [themeKey, setThemeKey] = useState('dark');

  // Tab state
  const [leftTab, setLeftTab] = useState('character');
  const [mobileTab, setMobileTab] = useState('actions');

  // Vision menu
  const [showVisionMenu, setShowVisionMenu] = useState(false);

  // Quest log deep-link
  const [questLogInitialId, setQuestLogInitialId] = useState<string | null>(null);

  const openQuestLogAt = useCallback((questId: string) => {
    setQuestLogInitialId(questId);
    setShowQuestLog(true);
  }, []);

  const clearQuestLogInitialId = useCallback(() => {
    setQuestLogInitialId(null);
  }, []);

  // Death screen
  const [deathInfo, setDeathInfo] = useState<{ name: string; cls: string; level: number; gameDay: number; finalNarrative: string } | null>(null);

  const showDeathScreen = useCallback((info: { name: string; cls: string; level: number; gameDay: number; finalNarrative: string }) => {
    setDeathInfo(info);
    setScreen('death');
  }, []);

  /**
   * Open a modal by name
   */
  const openModal = useCallback((modalName: string) => {
    const map: Record<string, any> = {
      inventory: setShowInventory,
      shop: setShowShop,
      questLog: setShowQuestLog,
      crafting: setShowCrafting,
      bestiary: setShowBestiary,
      skillTree: setShowSkillTree,
      standings: setShowStandings,
      patchNotes: setShowPatchNotes,
      howToPlay: setShowHowToPlay,
      userProfile: setShowUserProfile,
      factionOffer: setShowFactionOffer,
      ngPlus: setShowNGPlusScreen,
      ending: setShowEnding,
      dungeonWarning: setShowDungeonWarning,
      tokenShop: setShowTokenShop,
      achievements: setShowAchievements,
      companion: setShowCompanion,
      map: setMapOpen,
    };

    if (map[modalName]) {
      map[modalName](true);
    }
  }, []);

  /**
   * Close a modal by name
   */
  const closeModal = useCallback((modalName: string) => {
    const map: Record<string, any> = {
      inventory: setShowInventory,
      shop: setShowShop,
      questLog: setShowQuestLog,
      crafting: setShowCrafting,
      bestiary: setShowBestiary,
      skillTree: setShowSkillTree,
      standings: setShowStandings,
      patchNotes: setShowPatchNotes,
      howToPlay: setShowHowToPlay,
      userProfile: setShowUserProfile,
      factionOffer: setShowFactionOffer,
      ngPlus: setShowNGPlusScreen,
      ending: setShowEnding,
      dungeonWarning: setShowDungeonWarning,
      tokenShop: setShowTokenShop,
      achievements: setShowAchievements,
      companion: setShowCompanion,
      map: setMapOpen,
    };

    if (map[modalName]) {
      map[modalName](false);
    }
  }, []);

  /**
   * Toggle a modal by name
   */
  const toggleModal = useCallback((modalName: string) => {
    const map: Record<string, any> = {
      inventory: [showInventory, setShowInventory],
      shop: [showShop, setShowShop],
      questLog: [showQuestLog, setShowQuestLog],
      crafting: [showCrafting, setShowCrafting],
      bestiary: [showBestiary, setShowBestiary],
      skillTree: [showSkillTree, setShowSkillTree],
      standings: [showStandings, setShowStandings],
      patchNotes: [showPatchNotes, setShowPatchNotes],
      howToPlay: [showHowToPlay, setShowHowToPlay],
      userProfile: [showUserProfile, setShowUserProfile],
      factionOffer: [showFactionOffer, setShowFactionOffer],
      ngPlus: [showNGPlusScreen, setShowNGPlusScreen],
      ending: [showEnding, setShowEnding],
      dungeonWarning: [showDungeonWarning, setShowDungeonWarning],
      tokenShop: [showTokenShop, setShowTokenShop],
      achievements: [showAchievements, setShowAchievements],
      companion: [showCompanion, setShowCompanion],
      subclass: [showSubclass, setShowSubclass],
      map: [mapOpen, setMapOpen],
    };

    if (map[modalName]) {
      const [current, setter] = map[modalName];
      setter(!current);
    }
  }, [
    showInventory,
    showShop,
    showQuestLog,
    showCrafting,
    showBestiary,
    showSkillTree,
    showStandings,
    showPatchNotes,
    showHowToPlay,
    showUserProfile,
    showFactionOffer,
    showNGPlusScreen,
    showEnding,
    showDungeonWarning,
    mapOpen,
    showTokenShop,
    showAchievements,
    showCompanion,
    showSubclass,
  ]);

  /**
   * Add entry to combat log
   */
  const addCombatLogEntry = useCallback((entry: string) => {
    setCombatLog((prev) => [...prev, entry].slice(-50)); // Keep last 50 entries
  }, []);

  /**
   * Clear combat log
   */
  const clearCombatLog = useCallback(() => {
    setCombatLog([]);
  }, []);

  /**
   * Add entries to the event log (XP, gold, rep changes)
   */
  const addEventLogEntries = useCallback((entries: EventLogEntry[]) => {
    if (!entries.length) return;
    setEventLog(prev => {
      const next = [...prev, ...entries].slice(-100);
      try { localStorage.setItem('ae-event-log', JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  /**
   * Clear event log
   */
  const clearEventLog = useCallback(() => {
    setEventLog([]);
    try { localStorage.removeItem('ae-event-log'); } catch {}
  }, []);

  return {
    screen,
    setScreen,
    showInventory,
    showShop,
    showQuestLog,
    showCrafting,
    showBestiary,
    showSkillTree,
    showStandings,
    showPatchNotes,
    showHowToPlay,
    showUserProfile,
    showFactionOffer,
    showNGPlusScreen,
    showEnding,
    showDungeonWarning,
    showTokenShop,
    showAchievements,
    showCompanion,
    showSubclass,
    achievementToasts,
    pushAchievementToast,
    shiftAchievementToast,
    lowTokenWarning,
    setLowTokenWarning,
    openModal,
    closeModal,
    toggleModal,
    mapOpen,
    setMapOpen,
    currentEnemy,
    setCurrentEnemy,
    combatLog,
    addCombatLogEntry,
    clearCombatLog,
    playerDefending,
    setPlayerDefending,
    playerStatusEffects,
    setPlayerStatusEffects,
    isMobile,
    setIsMobile,
    pendingSuggestion,
    setPendingSuggestion,
    fillInput,
    setFillInput,
    suggestions,
    setSuggestions,
    lastInput,
    setLastInput,
    levelUpMsg,
    setLevelUpMsg,
    dungeonExitPrompt,
    setDungeonExitPrompt,
    themeKey,
    setThemeKey,
    leftTab,
    setLeftTab,
    mobileTab,
    setMobileTab,
    showVisionMenu,
    setShowVisionMenu,
    questLogInitialId,
    openQuestLogAt,
    clearQuestLogInitialId,
    deathInfo,
    showDeathScreen,
    eventLog,
    addEventLogEntries,
    clearEventLog,
  };
}
