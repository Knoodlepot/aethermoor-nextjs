'use client';

import { useState, useCallback } from 'react';
import type { Player, WorldSeed } from '../lib/types';
import type { GameStateContext } from './useGameState';
import type { UIContext } from './useUI';
import type { UseStorageReturn } from './useStorage';
import { FACTION_JOIN_OFFERS, PROTECTED_ITEMS, RECIPES } from '../lib/constants';
import { getItemSlotEx } from '../lib/helpers';

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
  _authToken?: string | null
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
          const parts = command.split(':');
          const price = parseInt(parts[parts.length - 1], 10);
          const itemName = parts.slice(1, -1).join(':');
          if (!isNaN(price) && itemName) {
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

        // 1. Add user message to conversation history
        const userMessages = [...gs.messages.slice(-19), { role: 'user', content: command }];
        gs.setMessages(userMessages);

        // 2. Call Claude API for narration
        const narratorResponse = await callClaude(userMessages, updatedPlayer, updatedSeed);

        if (!narratorResponse.success || !narratorResponse.narrative) {
          return { success: false, error: narratorResponse.error || 'AI call failed' };
        }

        // 3. Use server-applied state updates from /api/claude
        const cleanNarrative = narratorResponse.cleanNarrative || narratorResponse.narrative;
        if (narratorResponse.player && narratorResponse.worldSeed) {
          updatedPlayer = narratorResponse.player;
          updatedSeed = narratorResponse.worldSeed;
        }

        // 4. Update all game state
        gs.setPlayer(updatedPlayer);
        gs.setWorldSeed(updatedSeed);
        gs.setNarrative(cleanNarrative);
        gs.addMessage('assistant', cleanNarrative);

        // 5. Add to game log
        gs.addLogEntry('action', command);
        gs.addLogEntry('response', cleanNarrative.substring(0, 100));

        // 6. Save game state — include assistant response in saved history
        const fullMessages = [
          ...userMessages,
          { role: 'assistant', content: cleanNarrative },
        ];
        await storage.saveGame(updatedPlayer, updatedSeed, fullMessages, cleanNarrative, gs.log);

        // 7. Update UI suggestions if provided
        if (narratorResponse.suggestions && narratorResponse.suggestions.length > 0) {
          ui.setSuggestions(narratorResponse.suggestions.slice(0, 5));
          ui.setPendingSuggestion(null);
        } else {
          ui.setSuggestions([]);
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
   * Call Claude API with current game context
   */
  const callClaude = useCallback(
    async (
      messages: any[],
      player: Player,
      worldSeed: WorldSeed
    ): Promise<{
      success: boolean;
      narrative?: string;
      cleanNarrative?: string;
      player?: Player;
      worldSeed?: WorldSeed;
      suggestions?: string[];
      error?: string;
    }> => {
      try {
        const res = await fetch('/api/claude', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            messages,
            player,
            worldSeed,
          }),
        });

        const data = await res.json();

        if (res.ok && data.narrative) {
          return {
            success: true,
            narrative: data.narrative,
            cleanNarrative: data.cleanNarrative,
            player: data.player,
            worldSeed: data.worldSeed,
            suggestions: data.suggestions,
          };
        }

        return { success: false, error: data.error || 'API error' };
      } catch (error: any) {
        console.error('Claude API error:', error);
        return { success: false, error: error.message };
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
