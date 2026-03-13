'use client';

import React from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import type { Player } from '@/lib/types';
import { ITEM_INFO } from '@/lib/constants';
import { getProfessionLevel } from '@/lib/helpers';
import * as helpers from '@/lib/helpers';

// ── Helpers not yet in helpers.ts — accessed via module cast ──
const generateShopStock = (helpers as any).generateShopStock as ((loc: string, player: any) => any[]) | undefined;
const getCompactPerks = (helpers as any).getCompactPerks as ((player: any) => any) | undefined;
const getItemInfo = (helpers as any).getItemInfo as ((name: string) => any) | undefined;

// ── Local price table for items not yet in a constants SHOP_ITEMS list ──
// Used for sell-price calculation (50% of base price).
const BASE_PRICES: Record<string, number> = {
  'Health Potion':         25,
  'Strong Health Potion':  50,
  'Elixir of Vigour':     120,
  'Mana Potion':           30,
  'Antidote':              20,
  'Torch':                  5,
  'Lockpick':              15,
  'Rope':                  10,
  'Forager Kit':           40,
  'Bedroll':               35,
  'Bread':                  8,
  'Rations':               15,
  'Iron Rations':          25,
  'Sword':                 80,
  'Dagger':                60,
  'Arcane Wand':          120,
  'Staff':                100,
  'Shield':                70,
  'Leather Armour':        80,
  'Chainmail':            160,
  'Scroll':                45,
  'Amulet':                90,
  'Ring':                  75,
  'Herb Broth':            30,
  'Mushroom Stew':         50,
  "Ranger's Pottage":      80,
  'Iron Sword':           100,
  'Iron Shield':           90,
  'Ring of Strength':     120,
  'Steel Sword':          200,
  'Ring of Agility':      120,
  'Amulet of Warding':    150,
  'Scroll of Mending':     60,
  'Scroll of Fire':        55,
  'Scroll of Lightning':   80,
};

function getBasePrice(name: string): number {
  // Try exact match first
  const exact = BASE_PRICES[name];
  if (exact) return exact;
  // Try from ITEM_INFO lookup via any cast
  if (getItemInfo) {
    const info = getItemInfo(name);
    if (info?.price) return info.price;
  }
  return 20; // fallback
}

function getSellPrice(name: string): number {
  return Math.floor(getBasePrice(name) * 0.5);
}

interface ShopScreenProps {
  player: Player;
  onBuy: (item: any, price: number) => void;
  onSell: (itemName: string, sellPrice: number) => void;
  onClose: () => void;
  onBarter?: () => void;
  shopPriceOverrides?: Record<string, number>;
}

export function ShopScreen({ player, onBuy, onSell, onClose, onBarter, shopPriceOverrides }: ShopScreenProps) {
  const { T, tf, bf } = useTheme();
  const [tab, setTab] = React.useState<'buy' | 'sell'>('buy');
  const [sellConfirm, setSellConfirm] = React.useState<string | null>(null);

  // ── Discount calculation ──
  const socialLevel = getProfessionLevel(player.professions || {}, 'social');
  const socialDiscount = (socialLevel - 1) * 0.02;

  const perks = getCompactPerks ? getCompactPerks(player) : {};
  const perkDiscount = (perks as any)?.discount || 0;

  const merchantsFriend = (player.legacyPerks || []).includes('merchants_friend') ? 0.25 : 0;

  const totalDiscount = Math.min(0.75, perkDiscount + socialDiscount + merchantsFriend);

  // ── Shop stock ──
  const rawStock: any[] = React.useMemo(() => {
    if (generateShopStock) {
      try {
        return generateShopStock(player.location, player) || [];
      } catch {
        return [];
      }
    }
    return [];
  }, [player.location]); // eslint-disable-line react-hooks/exhaustive-deps

  function getItemPrice(item: any): number {
    const override = shopPriceOverrides?.[item.name || item.id];
    if (override !== undefined) return override;
    const base = item.price ?? getBasePrice(item.name || '');
    return Math.max(1, Math.round(base * (1 - totalDiscount)));
  }

  function getItemIcon(name: string): string {
    const key = name.toLowerCase();
    const fromInfo = (ITEM_INFO as Record<string, { icon: string }>)[key];
    if (fromInfo) return fromInfo.icon;
    if (getItemInfo) {
      const info = getItemInfo(name);
      if (info?.icon) return info.icon;
    }
    return '📦';
  }

  const TABS = [
    { id: 'buy' as const, label: 'Buy' },
    { id: 'sell' as const, label: 'Sell' },
  ];

  return (
    <div
      style={{
        ...bf,
        position: 'fixed',
        inset: 0,
        background: T.bg + 'ee',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: T.panel,
          border: `1px solid ${T.accent}`,
          width: '100%',
          maxWidth: 560,
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 8px 40px #00000099',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: T.panelAlt,
            borderBottom: `1px solid ${T.border}`,
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div>
            <div style={{ ...tf, color: T.gold, fontSize: 16, letterSpacing: 2 }}>
              🏪 SHOP
            </div>
            <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>
              {player.gold}g available
              {totalDiscount > 0 && (
                <span style={{ color: '#60a060', marginLeft: 6 }}>
                  ({Math.round(totalDiscount * 100)}% discount)
                </span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {onBarter && (
              <button
                onClick={onBarter}
                style={{
                  ...tf,
                  background: 'transparent',
                  border: `1px solid ${T.accent}`,
                  color: T.accent,
                  padding: '4px 10px',
                  cursor: 'pointer',
                  fontSize: 10,
                  letterSpacing: 1,
                }}
              >
                Barter
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: `1px solid ${T.border}`,
                color: T.textMuted,
                width: 28, height: 28,
                cursor: 'pointer', fontSize: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1,
                background: tab === t.id ? T.selectedBg : 'transparent',
                border: 'none',
                borderBottom: `2px solid ${tab === t.id ? T.accent : 'transparent'}`,
                color: tab === t.id ? T.gold : T.textMuted,
                padding: '10px 8px',
                cursor: 'pointer',
                fontSize: 11,
                ...tf,
                letterSpacing: 1,
                transition: 'all 0.2s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>

          {/* ── BUY ── */}
          {tab === 'buy' && (
            rawStock.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: T.textFaint, fontStyle: 'italic' }}>
                This merchant has nothing to sell here.
              </div>
            ) : (
              rawStock.map((item: any, i: number) => {
                const price = getItemPrice(item);
                const canAfford = player.gold >= price;
                const icon = getItemIcon(item.name || '');
                return (
                  <div
                    key={item.id || item.name || i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 0',
                      borderBottom: `1px solid ${T.border}`,
                    }}
                  >
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ ...tf, color: T.text, fontSize: 13 }}>{item.name}</div>
                      {item.desc && (
                        <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{item.desc}</div>
                      )}
                      {item.tier && (
                        <div style={{ fontSize: 10, color: T.textFaint, marginTop: 1 }}>{item.tier}</div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ ...tf, color: canAfford ? T.gold : '#c04040', fontSize: 14 }}>
                        {price}g
                      </div>
                      <button
                        onClick={() => canAfford && onBuy(item, price)}
                        disabled={!canAfford}
                        style={{
                          marginTop: 4,
                          padding: '4px 12px',
                          background: canAfford ? T.accent : 'transparent',
                          border: `1px solid ${canAfford ? T.accent : T.border}`,
                          color: canAfford ? '#fff' : T.textFaint,
                          cursor: canAfford ? 'pointer' : 'not-allowed',
                          fontSize: 10,
                          ...tf, letterSpacing: 1,
                          transition: 'all 0.15s',
                        }}
                      >
                        Buy
                      </button>
                    </div>
                  </div>
                );
              })
            )
          )}

          {/* ── SELL ── */}
          {tab === 'sell' && (
            (player.inventory || []).length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: T.textFaint, fontStyle: 'italic' }}>
                Your inventory is empty.
              </div>
            ) : (
              (player.inventory || []).map((itemName, i) => {
                const sellPrice = getSellPrice(itemName);
                const icon = getItemIcon(itemName);
                const isConfirming = sellConfirm === itemName + i;
                return (
                  <div
                    key={itemName + i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 0',
                      borderBottom: `1px solid ${T.border}`,
                    }}
                  >
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ ...tf, color: T.text, fontSize: 13 }}>{itemName}</div>
                      <div style={{ fontSize: 11, color: T.textMuted, marginTop: 1 }}>
                        Sell for <span style={{ color: T.gold }}>{sellPrice}g</span>
                      </div>
                    </div>
                    <div style={{ flexShrink: 0 }}>
                      {isConfirming ? (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            onClick={() => {
                              setSellConfirm(null);
                              onSell(itemName, sellPrice);
                            }}
                            style={{
                              padding: '4px 10px',
                              background: '#1a3a1a',
                              border: '1px solid #60a060',
                              color: '#60a060',
                              cursor: 'pointer',
                              fontSize: 10,
                              ...tf, letterSpacing: 1,
                            }}
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setSellConfirm(null)}
                            style={{
                              padding: '4px 10px',
                              background: 'transparent',
                              border: `1px solid ${T.border}`,
                              color: T.textMuted,
                              cursor: 'pointer',
                              fontSize: 10,
                              ...tf,
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSellConfirm(itemName + i)}
                          style={{
                            padding: '4px 12px',
                            background: 'transparent',
                            border: `1px solid ${T.border}`,
                            color: T.textMuted,
                            cursor: 'pointer',
                            fontSize: 10,
                            ...tf, letterSpacing: 1,
                            transition: 'all 0.15s',
                          }}
                        >
                          Sell
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )
          )}
        </div>
      </div>
    </div>
  );
}
