'use client';

import React from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import type { Player } from '@/lib/types';
import { RECIPES, LOCATION_TIERS } from '@/lib/constants';
import { countItem, getProfessionLevel } from '@/lib/helpers';

interface CraftingScreenProps {
  player: Player;
  onCraft: (recipeId: string) => void;
  onClose: () => void;
}

const CRAFTING_TABS = [
  { id: 'alchemy', label: '🧪 Alchemy' },
  { id: 'cooking', label: '🍖 Cooking' },
  { id: 'smithing', label: '⚒️ Smithing' },
  { id: 'enchanting', label: '✨ Enchanting' },
] as const;

export function CraftingScreen({ player, onCraft, onClose }: CraftingScreenProps) {
  const { T, tf, bf } = useTheme();
  const [tab, setTab] = React.useState<string>('alchemy');

  // helpers.ts getProfessionLevel takes (professions, profName) — not player directly
  const craftLevel = React.useMemo(
    () => getProfessionLevel(player.professions || {}, 'crafting'),
    [player]
  );

  // LOCATION_TIERS is a mutable record populated at runtime from worldSeed.
  // Falls back to 'village' when empty (fresh session / demo mode).
  const locTier = LOCATION_TIERS[player.location] || 'village';

  const allRecipes = RECIPES.filter((r) => r.type === tab).map((recipe) => {
    const levelOk = craftLevel >= recipe.minCraftLevel;
    const locOk = !recipe.locationTypeRequired || recipe.locationTypeRequired.includes(locTier);
    const ingredientsOk = recipe.ingredients.every(
      (ing) => countItem(player.inventory || [], ing.item) >= ing.qty
    );
    return { recipe, levelOk, locOk, ingredientsOk, canCraft: levelOk && locOk && ingredientsOk };
  });
  const craftableRecipes = allRecipes.filter((r) => r.canCraft);
  const lockedRecipes = allRecipes.filter((r) => !r.canCraft);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.72)',
        zIndex: 900,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          ...bf,
          background: T.panel,
          border: `2px solid ${T.border}`,
          maxWidth: 640,
          width: '100%',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 8px 40px #00000099',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '12px 16px',
            borderBottom: `1px solid ${T.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <span style={{ ...tf, color: T.accent, letterSpacing: 1, fontSize: 15 }}>
            ⚒️ CRAFTING
          </span>
          <span style={{ color: T.textMuted, fontSize: 12 }}>
            Crafting Lv.{craftLevel} of 5
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: T.textFaint,
              cursor: 'pointer',
              fontSize: 18,
              padding: '0 4px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
          {CRAFTING_TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                ...bf,
                flex: 1,
                padding: '8px 4px',
                background: tab === t.id ? T.panelAlt : 'transparent',
                border: 'none',
                borderBottom: `2px solid ${tab === t.id ? T.accent : 'transparent'}`,
                color: tab === t.id ? T.accent : T.textMuted,
                cursor: 'pointer',
                fontSize: 12,
                transition: 'all 0.15s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Recipe list */}
        <div style={{ overflowY: 'auto', flex: 1, padding: 12 }}>
          {allRecipes.length === 0 ? (
            <p style={{ color: T.textFaint, textAlign: 'center', marginTop: 32 }}>
              No recipes available.
            </p>
          ) : (
            <>
              {[...craftableRecipes, ...lockedRecipes].map(({ recipe, levelOk, locOk, ingredientsOk, canCraft }, idx) => {
                const isFirstLocked = !canCraft && idx === craftableRecipes.length;
                return (
                  <React.Fragment key={recipe.id}>
                    {isFirstLocked && craftableRecipes.length > 0 && (
                      <div style={{ fontSize: 9, color: T.textFaint, letterSpacing: 2, padding: '8px 0 4px', borderTop: `1px solid ${T.border}`, marginTop: 4, marginBottom: 4 }}>
                        LOCKED — MISSING INGREDIENTS OR REQUIREMENTS
                      </div>
                    )}
                    <div
                      style={{
                        padding: 12,
                        marginBottom: 10,
                        border: `1px solid ${T.border}`,
                        background: T.panelAlt,
                        opacity: canCraft ? 1 : 0.5,
                        position: 'relative' as const,
                      }}
                    >
                      {!canCraft && (
                        <span style={{ position: 'absolute', top: 6, right: 8, fontSize: 11, color: T.textFaint }}>🔒</span>
                      )}
                      {/* Recipe title row */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ ...tf, color: T.text, fontSize: 14 }}>
                          {recipe.icon} {recipe.name}
                          {recipe.resultQty > 1 ? ` ×${recipe.resultQty}` : ''}
                        </span>
                        <button
                          onClick={() => canCraft && onCraft(recipe.id)}
                          disabled={!canCraft}
                          style={{
                            padding: '4px 12px',
                            background: canCraft ? T.accent : T.border,
                            color: canCraft ? '#fff' : T.textFaint,
                            border: 'none',
                            cursor: canCraft ? 'pointer' : 'not-allowed',
                            fontSize: 12,
                            ...tf,
                            letterSpacing: 1,
                            transition: 'all 0.15s',
                          }}
                        >
                          Craft
                        </button>
                      </div>

                      {/* Description */}
                      <div style={{ color: T.textMuted, fontSize: 12, fontStyle: 'italic', marginBottom: 6 }}>
                        {recipe.desc}
                      </div>

                      {/* Ingredients */}
                      <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 4, marginBottom: 4 }}>
                        {recipe.ingredients.map((ing) => {
                          const have = countItem(player.inventory || [], ing.item);
                          const ok = have >= ing.qty;
                          return (
                            <span
                              key={ing.item}
                              style={{
                                fontSize: 11,
                                padding: '2px 8px',
                                background: ok ? '#1a3a1a' : '#3a1a1a',
                                color: ok ? '#60a060' : '#c04040',
                                border: `1px solid ${ok ? '#60a060' : '#c04040'}`,
                              }}
                            >
                              {ing.item} {have}/{ing.qty}
                            </span>
                          );
                        })}
                      </div>

                      {/* Requirement warnings */}
                      {!levelOk && (
                        <div style={{ color: '#c08040', fontSize: 11, marginTop: 2 }}>
                          — Requires Crafting Lv.{recipe.minCraftLevel}
                        </div>
                      )}
                      {!locOk && (
                        <div style={{ color: '#c08040', fontSize: 11, marginTop: 2 }}>
                          — Needs{' '}
                          {recipe.type === 'smithing'
                            ? 'a forge (town or larger)'
                            : 'an arcane district (city or larger)'}
                        </div>
                      )}
                    </div>
                  </React.Fragment>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
