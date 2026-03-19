'use client';

import { useState, useEffect } from 'react';

const LS_KEY = 'ae-layout-editor-panels';

export type LayoutPanel = {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  color?: string;
  zIndex?: number;
};

export type DerivedLayout = {
  /** Width of the right column in pixels, derived from narrative panel's width */
  rightColW: number;
  /** Right-column panels sorted top-to-bottom, with their heights */
  rightPanels: Array<{ id: string; label: string; h: number }>;
  /** Whether the narrative panel is in the layout */
  hasNarrative: boolean;
  /** Whether the input bar is in the layout */
  hasInput: boolean;
  /** Raw config for custom use */
  raw: LayoutPanel[];
};

/**
 * Reads the layout editor config from localStorage and derives
 * right-column panel order/heights + left/right split for GameView.
 * Returns null if no config is saved (GameView falls back to defaults).
 */
export function useLayoutConfig(): DerivedLayout | null {
  const [config, setConfig] = useState<LayoutPanel[] | null>(null);
  const [screenW, setScreenW] = useState(0);

  useEffect(() => {
    setScreenW(window.innerWidth);
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setConfig(JSON.parse(raw));
    } catch {}
  }, []);

  if (!config || screenW === 0) return null;

  const narrative = config.find(p => p.id === 'narrative');
  const input = config.find(p => p.id === 'input');

  // Right column width = screen minus narrative width; fall back to 280px
  const narrativeW = narrative?.w ?? Math.round(screenW * 0.70);
  const rightColW = Math.max(200, screenW - narrativeW);

  // Right column panels: everything except narrative + input, sorted by y
  const rightPanels = config
    .filter(p => p.id !== 'narrative' && p.id !== 'input')
    .sort((a, b) => a.y - b.y)
    .map(p => ({ id: p.id, label: p.label, h: Math.max(40, p.h) }));

  return {
    rightColW,
    rightPanels,
    hasNarrative: !!narrative,
    hasInput: !!input,
    raw: config,
  };
}
