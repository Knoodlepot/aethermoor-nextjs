'use client';

import { useState, useCallback } from 'react';
import type { Player, WorldSeed } from '../lib/types';
import type { GameStateContext } from './useGameState';
import type { UIContext } from './useUI';
import type { UseStorageReturn } from './useStorage';
import { FACTION_JOIN_OFFERS, PROTECTED_ITEMS, RECIPES, CONSUMABLE_EFFECTS } from '../lib/constants';
import { getItemSlotEx, formatGameTime, advanceGameTime, xpToLevel, HP_PER_LEVEL, LEVEL_CAP } from '../lib/helpers';
import { extractBestiaryTag } from '../lib/tagParsers';

export interface GameLoopContext {
  executeCommand: (
    command: string,
    gameState: GameStateContext
  ) => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
  combatState: any | null;
  setCombatState: (state: any | null) => void;
}

/**
 * useGameLoop - Orchestrate all game actions and coordinate tag extraction
 */
export function useGameLoop(
  gameState: GameStateContext,
  ui: UIContext,
  storage: UseStorageReturn,
  _authToken?: string | null,
  setTokenBalance?: (balance: number) => void
): GameLoopContext {
  const [isLoading, setIsLoading] = useState(false);
  const [combatState, setCombatState] = useState<any | null>(null);

  /**
   * Main command execution orchestrator
   */
  const executeCommand = useCallback(
    async (command: string, gs: GameStateContext): Promise<{ success: boolean; error?: string }> => {
      // Guard checks
      if (isLoading || !gs.player || !gs.worldSeed) {
        return { success: false, error: 'Game not ready' };
      }

      setIsLoading(true);
      ui.setSuggestions([]);
      try {
        // Track state for save
        let updatedPlayer = gs.player;
        let updatedSeed = gs.worldSeed;

        // ── Deterministic short-circuits (no narrator call needed) ──
        if (command.startsWith('unlock_skill:')) {
          const skillId = command.slice('unlock_skill:'.length);
          const currentSkills: string[] = Array.isArray((updatedPlayer as any).unlockedSkills)
            ? (updatedPlayer as any).unlockedSkills
            : [];
          const currentPoints: number = (updatedPlayer as any).skillPoints ?? 0;

          if (currentSkills.includes(skillId)) {
            return { success: false, error: 'Already unlocked' };
          }
          if (currentPoints < 1) {
            return { success: false, error: 'No skill points available' };
          }

          updatedPlayer = {
            ...updatedPlayer,
            unlockedSkills: [...currentSkills, skillId],
            skillPoints: currentPoints - 1,
          } as typeof updatedPlayer;

          gs.setPlayer(updatedPlayer);
          await storage.saveGame(updatedPlayer, updatedSeed, gs.messages, gs.narrative || '', gs.log);
          return { success: true };
        }

        // ── join_faction:<id> ──
        if (command.startsWith('join_faction:')) {
          const fid = command.slice('join_faction:'.length);
          const joined: string[] = Array.isArray(updatedPlayer.joinedFactions) ? updatedPlayer.joinedFactions : [];
          if (!joined.includes(fid)) {
            const offer = (FACTION_JOIN_OFFERS as Record<string, any>)[fid];
            const giftItem: string | null = offer?.gift ?? null;
            const newInventory = giftItem ? [...updatedPlayer.inventory, giftItem] : [...updatedPlayer.inventory];
            const rivalId: string | null = offer?.rival ?? null;
            const newStandings = { ...updatedPlayer.factionStandings };
            newStandings[fid] = (newStandings[fid] ?? 0) + 50; // starting reputation with faction
            if (rivalId) newStandings[rivalId] = (newStandings[rivalId] ?? 0) - 30;
            updatedPlayer = {
              ...updatedPlayer,
              joinedFactions: [...joined, fid],
              pendingFactionOffer: null,
              inventory: newInventory,
              factionStandings: newStandings,
            };
          }
          gs.setPlayer(updatedPlayer);
          await storage.saveGame(updatedPlayer, updatedSeed, gs.messages, gs.narrative || '', gs.log);
          return { success: true };
        }

        // ── decline_faction:<id> ──
        if (command.startsWith('decline_faction:')) {
          const fid = command.slice('decline_faction:'.length);
          const declines: string[] = Array.isArray(updatedPlayer.factionDeclines) ? updatedPlayer.factionDeclines : [];
          const newDeclines = declines.includes(fid) ? declines : [...declines, fid];
          let nextOffer: string | null = null;
          if (newDeclines.length >= 2 && !updatedPlayer.joinedFactions?.includes('the_forgotten')
              && updatedPlayer.pendingFactionOffer !== 'the_forgotten'
              && !newDeclines.includes('the_forgotten')) {
            nextOffer = 'the_forgotten';
          }
          updatedPlayer = {
            ...updatedPlayer,
            factionDeclines: newDeclines,
            pendingFactionOffer: nextOffer,
          };
          gs.setPlayer(updatedPlayer);
          await storage.saveGame(updatedPlayer, updatedSeed, gs.messages, gs.narrative || '', gs.log);
          return { success: true };
        }

        // ── rival_faction:<id> ── (mark as declined + standing penalty)
        if (command.startsWith('rival_faction:')) {
          const fid = command.slice('rival_faction:'.length);
          const declines: string[] = Array.isArray(updatedPlayer.factionDeclines) ? updatedPlayer.factionDeclines : [];
          const newDeclines = declines.includes(fid) ? declines : [...declines, fid];
          const newStandings = { ...updatedPlayer.factionStandings };
          newStandings[fid] = (newStandings[fid] ?? 0) - 50;
          updatedPlayer = {
            ...updatedPlayer,
            factionDeclines: newDeclines,
            pendingFactionOffer: null,
            factionStandings: newStandings,
          };
          gs.setPlayer(updatedPlayer);
          await storage.saveGame(updatedPlayer, updatedSeed, gs.messages, gs.narrative || '', gs.log);
          return { success: true };
        }

        // ── buy:<name>:<price> ──
        if (command.startsWith('buy:')) {
          const shopCtx = updatedPlayer.context;
          if (shopCtx !== 'town' && shopCtx !== 'npc') {
            return { success: false, error: 'No shop available here — find a settlement or merchant.' };
          }
          const parts = command.split(':');
          const price = parseInt(parts[parts.length - 1], 10);
          const itemName = parts.slice(1, -1).join(':');
          if (!isNaN(price) && updatedPlayer.gold >= price && itemName) {
            updatedPlayer = {
              ...updatedPlayer,
              gold: updatedPlayer.gold - price,
              inventory: [...updatedPlayer.inventory, itemName],
            };
            gs.setPlayer(updatedPlayer);
            await storage.saveGame(updatedPlayer, updatedSeed, gs.messages, gs.narrative || '', gs.log);
            return { success: true };
          }
          return { success: false, error: 'Cannot buy item' };
        }

        // ── sell:<name>:<price> ──
        if (command.startsWith('sell:')) {
          const sellCtx = updatedPlayer.context;
          if (sellCtx !== 'town' && sellCtx !== 'npc') {
            return { success: false, error: 'No shop available here — find a settlement or merchant.' };
          }
          const parts = command.split(':');
          const price = parseInt(parts[parts.length - 1], 10);
          const itemName = parts.slice(1, -1).join(':');
          if (!isNaN(price) && itemName) {
            if (PROTECTED_ITEMS.has(itemName)) return { success: false, error: 'That item cannot be sold' };
            const idx = updatedPlayer.inventory.indexOf(itemName);
            if (idx === -1) return { success: false, error: 'Item not in inventory' };
            const newInv = [...updatedPlayer.inventory];
            newInv.splice(idx, 1);
            updatedPlayer = { ...updatedPlayer, gold: updatedPlayer.gold + price, inventory: newInv };
            gs.setPlayer(updatedPlayer);
            await storage.saveGame(updatedPlayer, updatedSeed, gs.messages, gs.narrative || '', gs.log);
            return { success: true };
          }
          return { success: false, error: 'Cannot sell item' };
        }

        // ── equip:<name> ──
        if (command.startsWith('equip:')) {
          const itemName = command.slice('equip:'.length);
          const slot = getItemSlotEx(itemName);
          if (!slot) return { success: false, error: 'Item cannot be equipped' };
          const idx = updatedPlayer.inventory.indexOf(itemName);
          if (idx === -1) return { success: false, error: 'Item not in inventory' };
          const newInv = [...updatedPlayer.inventory];
          newInv.splice(idx, 1);
          const prevItem = updatedPlayer.equipped?.[slot] ?? null;
          if (prevItem) newInv.push(prevItem);
          updatedPlayer = {
            ...updatedPlayer,
            inventory: newInv,
            equipped: { ...updatedPlayer.equipped, [slot]: itemName },
          };
          gs.setPlayer(updatedPlayer);
          await storage.saveGame(updatedPlayer, updatedSeed, gs.messages, gs.narrative || '', gs.log);
          return { success: true };
        }

        // ── unequip:<slot> ──
        if (command.startsWith('unequip:')) {
          const slot = command.slice('unequip:'.length);
          const itemName = updatedPlayer.equipped?.[slot] ?? null;
          if (!itemName) return { success: false, error: 'Nothing equipped in that slot' };
          updatedPlayer = {
            ...updatedPlayer,
            inventory: [...updatedPlayer.inventory, itemName],
            equipped: { ...updatedPlayer.equipped, [slot]: null },
          };
          gs.setPlayer(updatedPlayer);
          await storage.saveGame(updatedPlayer, updatedSeed, gs.messages, gs.narrative || '', gs.log);
          return { success: true };
        }

        // ── drop:<name> ──
        if (command.startsWith('drop:')) {
          const itemName = command.slice('drop:'.length);
          if (PROTECTED_ITEMS.has(itemName)) return { success: false, error: 'That item cannot be dropped' };
          const idx = updatedPlayer.inventory.indexOf(itemName);
          if (idx === -1) return { success: false, error: 'Item not in inventory' };
          const newInv = [...updatedPlayer.inventory];
          newInv.splice(idx, 1);
          updatedPlayer = { ...updatedPlayer, inventory: newInv };
          gs.setPlayer(updatedPlayer);
          await storage.saveGame(updatedPlayer, updatedSeed, gs.messages, gs.narrative || '', gs.log);
          return { success: true };
        }

        // ── craft:<recipeId> ──
        if (command.startsWith('craft:')) {
          const recipeId = command.slice('craft:'.length);
          const recipe = RECIPES.find((r) => r.id === recipeId);
          if (!recipe) return { success: false, error: 'Unknown recipe' };
          const craftLevel: number = (updatedPlayer.professions as any)?.crafting?.level ?? 0;
          if (craftLevel < recipe.minCraftLevel) return { success: false, error: 'Crafting level too low' };
          const inv = [...updatedPlayer.inventory];
          for (const { item, qty } of recipe.ingredients) {
            let needed = qty;
            for (let i = inv.length - 1; i >= 0 && needed > 0; i--) {
              if (inv[i].toLowerCase() === item.toLowerCase()) { inv.splice(i, 1); needed--; }
            }
            if (needed > 0) return { success: false, error: `Missing ingredient: ${item}` };
          }
          for (let i = 0; i < recipe.resultQty; i++) inv.push(recipe.result);
          const professions = { ...(updatedPlayer.professions as any) };
          if (professions.crafting) {
            professions.crafting = { ...professions.crafting, xp: (professions.crafting.xp ?? 0) + recipe.xpReward };
          }
          updatedPlayer = { ...updatedPlayer, inventory: inv, professions };
          gs.setPlayer(updatedPlayer);
          await storage.saveGame(updatedPlayer, updatedSeed, gs.messages, gs.narrative || '', gs.log);
          return { success: true };
        }

        // ── use:<itemName> ──
        if (command.startsWith('use:')) {
          const itemName = command.slice('use:'.length);
          const idx = updatedPlayer.inventory.indexOf(itemName);
          if (idx === -1) return { success: false, error: 'Item not in inventory' };
          const effect = (CONSUMABLE_EFFECTS as Record<string, any>)[itemName.toLowerCase()];
          if (!effect) {
            // Not a consumable — let narrator handle it
          } else {
            const newInv = [...updatedPlayer.inventory];
            newInv.splice(idx, 1);
            let newHp = updatedPlayer.hp;
            if (effect.hpFull) newHp = updatedPlayer.maxHp;
            else if (effect.hp) newHp = Math.min(updatedPlayer.maxHp, newHp + effect.hp);
            // Clear any status effects this item cures
            let newStatusEffects = updatedPlayer.statusEffects || [];
            if (effect.clearStatus && effect.clearStatus.length > 0) {
              newStatusEffects = newStatusEffects.filter((e: string) => !effect.clearStatus!.includes(e));
            }
            updatedPlayer = {
              ...updatedPlayer,
              inventory: newInv,
              hp: newHp,
              str: updatedPlayer.str + (effect.str ?? 0),
              agi: updatedPlayer.agi + (effect.agi ?? 0),
              int: updatedPlayer.int + (effect.int ?? 0),
              wil: updatedPlayer.wil + (effect.wil ?? 0),
              statusEffects: newStatusEffects,
            };
            if (effect.msg) {
              gs.addLogEntry('action', effect.msg);
              gs.setNarrative(effect.msg);
            }
            gs.setPlayer(updatedPlayer);
            ui.setPlayerStatusEffects(newStatusEffects);
            await storage.saveGame(updatedPlayer, updatedSeed, gs.messages, gs.narrative || '', gs.log);
            return { success: true };
          }
        }

        // ── dismiss_quest:<questId> ──
        if (command.startsWith('dismiss_quest:')) {
          const questId = command.slice('dismiss_quest:'.length);
          updatedPlayer = {
            ...updatedPlayer,
            quests: updatedPlayer.quests.filter((q) => q.id !== questId),
          };
          gs.setPlayer(updatedPlayer);
          await storage.saveGame(updatedPlayer, updatedSeed, gs.messages, gs.narrative || '', gs.log);
          return { success: true };
        }

        // ── stat_point:<stat>[:<count>] ──
        if (command.startsWith('stat_point:')) {
          const parts = command.slice('stat_point:'.length).split(':');
          const stat = parts[0] as 'str' | 'agi' | 'int' | 'wil';
          const count = parts[1] ? Math.max(1, parseInt(parts[1], 10) || 1) : 1;
          const pts: number = (updatedPlayer as any).statPoints ?? 0;
          if (pts > 0 && ['str', 'agi', 'int', 'wil'].includes(stat)) {
            const apply = Math.min(count, pts);
            updatedPlayer = {
              ...updatedPlayer,
              [stat]: ((updatedPlayer as any)[stat] ?? 0) + apply,
              statPoints: pts - apply,
            } as any;
            gs.setPlayer(updatedPlayer);
            await storage.saveGame(updatedPlayer, updatedSeed, gs.messages, gs.narrative || '', gs.log);
          }
          return { success: true };
        }

        // ── enter_dungeon ──
        if (command === 'enter_dungeon') {
          const atCapital = updatedPlayer.location === 'Aethermoor Capital';
          if (!atCapital) return { success: false, error: 'You must be at Aethermoor Capital to enter the dungeon' };
          const currentFloor = (updatedPlayer as any).dungeon?.floor ?? 0;
          if (currentFloor > 0) return { success: false, error: 'Already in the dungeon' };
          const msg = 'You descend the worn stone steps beneath the Capital. The air grows cold and the torchlight flickers. You stand at the entrance to the Dungeon of Echoes — Floor 1.';
          updatedPlayer = {
            ...updatedPlayer,
            location: 'Dungeon of Echoes - Floor 1',
            context: 'dungeon',
            dungeon: { ...(updatedPlayer as any).dungeon, floor: 1, deepestFloor: Math.max(1, (updatedPlayer as any).dungeon?.deepestFloor ?? 0) },
          } as typeof updatedPlayer;
          gs.setPlayer(updatedPlayer);
          gs.setNarrative(msg);
          gs.addLogEntry('action', 'enter_dungeon');
          gs.addLogEntry('response', msg.substring(0, 100));
          await storage.saveGame(updatedPlayer, updatedSeed, gs.messages, msg, gs.log);
          return { success: true };
        }

        // ── fast_travel:<dest>:<method>:<cost> ──
        if (command.startsWith('fast_travel:')) {
          const parts = command.slice('fast_travel:'.length).split(':');
          const dest = parts[0];
          const method = parts[1] || 'foot';
          const cost = parseInt(parts[2] || '0', 10);
          if (!dest) return { success: false, error: 'No destination specified' };
          if (updatedPlayer.location === dest) return { success: false, error: 'Already there' };
          if ((updatedPlayer as any).combat?.inCombat) return { success: false, error: 'Cannot travel during combat' };
          if (updatedPlayer.context === 'dungeon') return { success: false, error: 'Cannot travel from a dungeon' };
          if ((updatedPlayer.gold ?? 0) < cost) return { success: false, error: 'Not enough gold' };

          // Calculate travel hours from locationGrid coords
          const lg: Record<string, any> = (updatedSeed.travelMatrix as any)?.locationGrid || {};
          const fromNode = lg[updatedPlayer.location];
          const toNode = lg[dest];
          let travelHours = 8; // fallback
          if (fromNode && toNode) {
            const dx = (fromNode.x ?? 50) - (toNode.x ?? 50);
            const dy = (fromNode.y ?? 50) - (toNode.y ?? 50);
            const dist = Math.sqrt(dx * dx + dy * dy);
            const footHours = dist * 1.5;
            const SPEED: Record<string, number> = { foot: 1, horse: 2.5, hire_horse: 2.5, barge: 3, boat: 4 };
            // Round to nearest half-hour for more precise clock display
            travelHours = Math.max(0.5, Math.round((footHours / (SPEED[method] ?? 1)) * 2) / 2);
          }

          // Advance game time
          let newHour = (updatedPlayer.gameHour ?? 8) + travelHours;
          let newDay = updatedPlayer.gameDay ?? 1;
          while (newHour >= 24) { newHour -= 24; newDay++; }

          // Build arrival narrative
          const methodLabels: Record<string, string> = { foot: 'on foot', horse: 'on horseback', hire_horse: 'on a hired horse', barge: 'by river barge', boat: 'by sea' };
          const methodLabel = methodLabels[method] ?? method;
          const timeDesc = travelHours < 24
            ? (travelHours % 1 === 0.5 ? `${Math.floor(travelHours)}h 30m` : `${travelHours}h`)
            : `${Math.floor(travelHours / 24)}d ${travelHours % 24 > 0 ? (travelHours % 24) + 'h' : ''}`.trim();
          const arrivalTime = formatGameTime(newHour, newDay).time;
          const msg = `After ${timeDesc} travelling ${methodLabel}, you arrive at ${dest} at ${arrivalTime}. The road-dust settles as you take in your surroundings.`;

          const exploredSet = new Set(updatedPlayer.exploredLocations ?? [updatedPlayer.location]);
          exploredSet.add(dest);

          const TOWN_TYPES = new Set(['hamlet', 'village', 'town', 'city', 'capital']);
          const destNode = lg[dest];
          const arrivalContext = TOWN_TYPES.has(destNode?.type) ? 'town' : 'explore';

          updatedPlayer = {
            ...updatedPlayer,
            gold: (updatedPlayer.gold ?? 0) - cost,
            location: dest,
            context: arrivalContext,
            gameHour: newHour,
            gameDay: newDay,
            exploredLocations: Array.from(exploredSet),
          };
          gs.setPlayer(updatedPlayer);
          gs.setNarrative(msg);
          gs.addLogEntry('action', `fast_travel → ${dest} (${methodLabel})`);
          gs.addLogEntry('response', msg.substring(0, 100));
          await storage.saveGame(updatedPlayer, updatedSeed, gs.messages, msg, gs.log);
          return { success: true };
        }

        // ── abandon_quest:<questId> ──
        if (command.startsWith('abandon_quest:')) {
          const questId = command.slice('abandon_quest:'.length);
          updatedPlayer = {
            ...updatedPlayer,
            quests: (updatedPlayer.quests || []).map((q) =>
              q.id === questId ? { ...q, status: 'failed' as const } : q
            ),
          };
          gs.setPlayer(updatedPlayer);
          await storage.saveGame(updatedPlayer, updatedSeed, gs.messages, gs.narrative, gs.log);
          return { success: true };
        }

        // ── toggle_quest_track:<questId> ──
        if (command.startsWith('toggle_quest_track:')) {
          const questId = command.slice('toggle_quest_track:'.length);
          updatedPlayer = {
            ...updatedPlayer,
            quests: (updatedPlayer.quests || []).map((q) =>
              q.id === questId ? { ...q, tracked: !(q.tracked ?? true) } : q
            ),
          };
          gs.setPlayer(updatedPlayer);
          await storage.saveGame(updatedPlayer, updatedSeed, gs.messages, gs.narrative, gs.log);
          return { success: true };
        }

        // 1. Add user message to conversation history
        const userMessages = [...gs.messages.slice(-39), { role: 'user', content: command }];
        gs.setMessages(userMessages);

        // 2. Call Claude API for narration (streaming — clear narrative first so chunks build it up)
        gs.setNarrative('');
        const preNarratorLevel = updatedPlayer.level;
        const narratorResponse = await callClaude(userMessages, updatedPlayer, updatedSeed, (chunk) => gs.appendNarrative(chunk));

        if (!narratorResponse.success || !narratorResponse.narrative) {
          if (narratorResponse.error === 'no_tokens') {
            ui.setScreen('out_of_tokens');
          }
          return { success: false, error: narratorResponse.error || 'AI call failed' };
        }

        // Update token balance display from server response
        if (narratorResponse.tokenBalance != null && setTokenBalance) {
          setTokenBalance(narratorResponse.tokenBalance);
          if (narratorResponse.tokenBalance <= 5) {
            ui.setLowTokenWarning(true);
          }
        }

        // 3. Use server-applied state updates from /api/claude
        const cleanNarrative = narratorResponse.cleanNarrative || narratorResponse.narrative;
        if (narratorResponse.player && narratorResponse.worldSeed) {
          // Merge narrator updates onto current local state, never letting
          // stale canonical DB data overwrite core identity or world-structure.
          updatedPlayer = {
            ...gs.player,
            ...narratorResponse.player,
            // Lock identity fields against stale canonical DB data
            name: (gs.player as any).name,
            class: (gs.player as any).class,
            // Allow location/exploredLocations from server when narrator emitted travelTo tag;
            // otherwise fall back to local state so stale canonical saves don't revert position.
            location: (narratorResponse.player as any).location !== (gs.player as any).location
              ? (narratorResponse.player as any).location
              : (gs.player as any).location,
            exploredLocations: (narratorResponse.player as any).exploredLocations
              ?? (gs.player as any).exploredLocations,
          } as typeof gs.player;

          // Client-side bestiary fallback: parse raw narrative in case server missed the tag.
          // Only applies if the server's returned bestiary doesn't already reflect this kill.
          {
            const rawNarrative = narratorResponse.narrative || '';
            const bestiaryEntry = extractBestiaryTag(rawNarrative);
            if (bestiaryEntry?.archetypeId) {
              const priorBestiary: any[] = (gs.player as any).bestiary || [];
              const mergedBestiary: any[] = (updatedPlayer as any).bestiary || [];
              const priorEntry = priorBestiary.find((b: any) => b.archetypeId === bestiaryEntry.archetypeId);
              const mergedEntry = mergedBestiary.find((b: any) => b.archetypeId === bestiaryEntry.archetypeId);
              const serverAlreadyUpdated =
                mergedEntry && (!priorEntry || mergedEntry.timesKilled > (priorEntry.timesKilled || 0));
              if (!serverAlreadyUpdated) {
                const currentDay = (updatedPlayer as any).gameDay || 1;
                let newBestiary: any[];
                if (mergedEntry) {
                  newBestiary = mergedBestiary.map((b: any) =>
                    b.archetypeId === bestiaryEntry.archetypeId
                      ? { ...b, timesKilled: (b.timesKilled || 0) + 1, lastKilledDay: currentDay }
                      : b
                  );
                } else {
                  newBestiary = [...mergedBestiary, {
                    archetypeId: bestiaryEntry.archetypeId,
                    name: bestiaryEntry.name || bestiaryEntry.archetypeId,
                    icon: bestiaryEntry.icon || '👾',
                    tier: bestiaryEntry.tier ?? 1,
                    timesKilled: 1,
                    firstKilledDay: currentDay,
                    lastKilledDay: currentDay,
                  }];
                }
                updatedPlayer = { ...updatedPlayer, bestiary: newBestiary } as typeof gs.player;
              }
            }
          }

          // Advance time automatically on every narrator turn (mirrors legacy behaviour)
          // Combat: ~5 minutes. All other actions: 30 minutes.
          const isCombatAction = (updatedPlayer as any).context === 'combat';
          const baseHours = isCombatAction ? (5 / 60) : 0.5;
          updatedPlayer = advanceGameTime(updatedPlayer as any, baseHours) as typeof gs.player;

          // Grant base XP on every narrator turn (mirrors legacy behaviour: 10-24 XP per response)
          // The narrator's xpGain tag adds on top of this for kills/quests.
          {
            const baseXp = 10 + Math.floor(Math.random() * 15);
            const oldLevel = updatedPlayer.level || 1;
            const newXp = (updatedPlayer.xp || 0) + baseXp;
            const newLevel = Math.min(xpToLevel(newXp), LEVEL_CAP);
            const levelsGained = newLevel - oldLevel;
            let newMaxHp = updatedPlayer.maxHp || 0;
            let newStatPoints = updatedPlayer.statPoints || 0;
            let newSkillPoints = updatedPlayer.skillPoints || 0;
            if (levelsGained > 0) {
              const hpGain = (HP_PER_LEVEL[(updatedPlayer as any).class] ?? 5) * levelsGained;
              newMaxHp += hpGain;
              newStatPoints += 3 * levelsGained;
              newSkillPoints += 1 * levelsGained;
            }
            updatedPlayer = {
              ...updatedPlayer,
              xp: newXp,
              level: newLevel,
              maxHp: newMaxHp,
              hp: levelsGained > 0 ? Math.min(newMaxHp, (updatedPlayer.hp || 0) + (HP_PER_LEVEL[(updatedPlayer as any).class] ?? 5) * levelsGained) : updatedPlayer.hp,
              statPoints: newStatPoints,
              skillPoints: newSkillPoints,
            } as typeof gs.player;
          }

          const localSeed = gs.worldSeed as any;
          updatedSeed = {
            ...localSeed,
            ...narratorResponse.worldSeed,
            travelMatrix: localSeed.travelMatrix,
            worldData: localSeed.worldData,
            worldSettlements: localSeed.worldSettlements,
            seed: localSeed.seed,
          } as typeof gs.worldSeed;
        }

        // 3b. Show level-up notification if the player leveled up
        if (updatedPlayer.level > preNarratorLevel) {
          ui.setLevelUpMsg(`LEVEL UP! You are now level ${updatedPlayer.level}! +3 Stat Points, +1 Skill Point!`);
        }

        // 3c. Dispatch event log entries (XP, gold, rep changes with reasons)
        const sc = narratorResponse.stateChanges;
        if (sc?.eventLogEntries?.length) {
          ui.addEventLogEntries(sc.eventLogEntries);
        }

        // 3a. Handle player death (hp reached 0 from hpChange tag)
        if (updatedPlayer.hp <= 0) {
          const gravestone = {
            name: updatedPlayer.name,
            level: updatedPlayer.level,
            class: updatedPlayer.class,
            day: updatedPlayer.gameDay || 1,
            epitaph: `Fell in battle on Day ${updatedPlayer.gameDay || 1}.`,
          };
          const deadPlayer = {
            ...updatedPlayer,
            hp: 0,
            deathCount: (updatedPlayer.deathCount || 0) + 1,
            gravestones: [...(updatedPlayer.gravestones || []), gravestone],
          };
          // Save the gravestone record before wiping the save
          await storage.saveGame(deadPlayer, updatedSeed, [], cleanNarrative, gs.log);
          storage.clearAllSaves();
          ui.showDeathScreen({
            name: updatedPlayer.name,
            cls: updatedPlayer.class,
            level: updatedPlayer.level,
            gameDay: updatedPlayer.gameDay || 1,
            finalNarrative: cleanNarrative,
          });
          return { success: true };
        }

        // 4. Update all game state
        gs.setPlayer(updatedPlayer);
        gs.setWorldSeed(updatedSeed);
        gs.setNarrative(cleanNarrative);
        gs.addMessage('assistant', cleanNarrative);
        ui.setPlayerStatusEffects(updatedPlayer.statusEffects || []);

        // 5. Add to game log
        gs.addLogEntry('action', command);
        gs.addLogEntry('response', cleanNarrative.substring(0, 100));

        // 6. Save game state — include assistant response in saved history
        const fullMessages = [
          ...userMessages,
          { role: 'assistant', content: cleanNarrative },
        ];
        await storage.saveGame(updatedPlayer, updatedSeed, fullMessages, cleanNarrative, gs.log);

        // 7. Update UI suggestions if provided; fall back to context defaults
        if (narratorResponse.suggestions && narratorResponse.suggestions.length > 0) {
          ui.setSuggestions(narratorResponse.suggestions.slice(0, 3));
          ui.setPendingSuggestion(null);
        } else {
          const ctx = (updatedPlayer as any).context || 'explore';
          const fallback: Record<string, string[]> = {
            explore: ['Look around carefully', 'Travel to the nearest settlement', 'Make camp for the night'],
            town:    ['Visit the tavern', 'Check the notice board', 'Browse the market stalls'],
            npc:     ['Ask about local rumours', 'Request a task or errand', 'Say farewell and leave'],
            combat:  ['Strike with my weapon', 'Attempt to dodge and retreat', 'Look for an advantage'],
            dungeon: ['Proceed deeper', 'Search for traps or hidden passages', 'Rest and tend to wounds'],
            camp:    ['Rest until morning', 'Keep watch through the night', 'Tend to wounds and gear'],
            farm:    ['Speak to the farmhand', 'Inspect the crops and land', 'Head back toward the road'],
          };
          ui.setSuggestions(fallback[ctx] || fallback.explore);
        }

        return { success: true };
      } catch (error: any) {
        console.error('Command execution error:', error);
        return { success: false, error: error.message || 'Command failed' };
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, storage, gameState, ui]
  );

  /**
   * Call Claude API with current game context (SSE streaming for narrator calls)
   */
  const callClaude = useCallback(
    async (
      messages: any[],
      player: Player,
      worldSeed: WorldSeed,
      onChunk?: (text: string) => void
    ): Promise<{
      success: boolean;
      narrative?: string;
      cleanNarrative?: string;
      player?: Player;
      worldSeed?: WorldSeed;
      suggestions?: string[];
      tokenBalance?: number;
      stateChanges?: Record<string, any>;
      error?: string;
    }> => {
      const attempt = async () => {
        const res = await fetch('/api/claude', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            messages,
            player,
            worldSeed,
            modelTier: (player as any).modelTier ?? 'haiku',
          }),
        });

        // Handle non-ok without body
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          return { success: false as const, status: res.status, error: (data.error || 'API error') as string };
        }

        const contentType = res.headers.get('content-type') ?? '';

        // SSE stream path (narrator calls)
        if (contentType.includes('text/event-stream') && res.body) {
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let sseBuffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            sseBuffer += decoder.decode(value, { stream: true });

            const events = sseBuffer.split('\n\n');
            sseBuffer = events.pop() ?? '';

            for (const event of events) {
              if (!event.startsWith('data: ')) continue;
              let payload: any;
              try { payload = JSON.parse(event.slice(6)); } catch { continue; }

              if (payload.type === 'chunk' && onChunk) {
                onChunk(payload.text as string);
              } else if (payload.type === 'done') {
                return {
                  success: true,
                  narrative: payload.narrative as string,
                  cleanNarrative: payload.cleanNarrative as string | undefined,
                  player: payload.player as Player | undefined,
                  worldSeed: payload.worldSeed as WorldSeed | undefined,
                  suggestions: payload.suggestions as string[] | undefined,
                  tokenBalance: payload.tokenBalance as number | undefined,
                  stateChanges: (payload.stateChanges ?? {}) as Record<string, any>,
                };
              } else if (payload.type === 'error') {
                return { success: false as const, status: 500, error: (payload.error || 'stream_error') as string };
              }
            }
          }
          return { success: false as const, status: 500, error: 'stream ended without done event' };
        }

        // Buffered JSON fallback (utility calls)
        const data = await res.json();
        if (data.narrative) {
          return {
            success: true,
            narrative: data.narrative as string,
            cleanNarrative: data.cleanNarrative as string | undefined,
            player: data.player as Player | undefined,
            worldSeed: data.worldSeed as WorldSeed | undefined,
            suggestions: data.suggestions as string[] | undefined,
            tokenBalance: data.tokenBalance as number | undefined,
            stateChanges: (data.stateChanges ?? {}) as Record<string, any>,
          };
        }
        return { success: false as const, status: res.status, error: (data.error || 'API error') as string };
      };

      try {
        const result = await attempt();
        // Single retry for server errors (5xx) — don't retry 4xx (auth, rate limit, no tokens)
        if (!result.success && result.status != null && result.status >= 500) {
          await new Promise(r => setTimeout(r, 1000));
          return attempt();
        }
        return result;
      } catch (error: any) {
        // Network error — retry once after 1s
        await new Promise(r => setTimeout(r, 1000));
        try {
          return await attempt();
        } catch (e: any) {
          console.error('Claude API error:', e);
          return { success: false, error: e.message as string };
        }
      }
    },
    []
  );

  return {
    executeCommand,
    isLoading,
    combatState,
    setCombatState,
  };
}
