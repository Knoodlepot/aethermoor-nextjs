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
  /** Bottom-row panels (same y level as input bar), sorted left-to-right, with widths */
  bottomPanels: Array<{ id: string; label: string; w: number }>;
  /** Whether the narrative panel is in the layout */
  hasNarrative: boolean;
  /** Whether the input bar is in the layout */
  hasInput: boolean;
  /** Raw config for custom use */
  raw: LayoutPanel[];
};

type StoredLayout = {
  panels: LayoutPanel[];
  canvasW: number;
  canvasH: number;
};

function parseStored(raw: string): StoredLayout | null {
  try {
    const parsed = JSON.parse(raw);
    // New format: { panels, canvasW, canvasH }
    if (parsed && !Array.isArray(parsed) && Array.isArray(parsed.panels)) {
      return { panels: parsed.panels, canvasW: parsed.canvasW, canvasH: parsed.canvasH };
    }
    // Old format: plain array — no canvas size stored, skip scaling
    if (Array.isArray(parsed)) {
      return { panels: parsed, canvasW: 0, canvasH: 0 };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Reads the layout editor config from localStorage and derives:
 * - rightColW: right column width
 * - rightPanels: panels in the right column (above the input bar row), sorted top-to-bottom
 * - bottomPanels: panels in the bottom row (same y level as input bar), sorted left-to-right
 * Scales all dimensions proportionally if the game screen differs from the saved canvas.
 * Returns null if no config is saved (GameView falls back to defaults).
 */
export function useLayoutConfig(): DerivedLayout | null {
  const [stored, setStored] = useState<StoredLayout | null>(null);
  const [screenW, setScreenW] = useState(0);
  const [screenH, setScreenH] = useState(0);

  useEffect(() => {
    setScreenW(window.innerWidth);
    setScreenH(window.innerHeight);
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = parseStored(raw);
        if (parsed) setStored(parsed);
      }
    } catch {}
  }, []);

  if (!stored || screenW === 0) return null;

  const { panels, canvasW, canvasH } = stored;

  // Scale factors: if no canvas size was saved (old format), no scaling
  const scaleW = canvasW > 0 ? screenW / canvasW : 1;
  const scaleH = canvasH > 0 ? screenH / canvasH : 1;

  const narrative = panels.find(p => p.id === 'narrative');
  const input = panels.find(p => p.id === 'input');

  // Right column width = screen minus scaled narrative width; fall back to 280px
  const narrativeW = narrative
    ? Math.round(narrative.w * scaleW)
    : Math.round(screenW * 0.70);
  const rightColW = Math.max(200, screenW - narrativeW);

  // Divide panels by column using x-position:
  // - Panels whose left edge is within the narrative column → bottom-row panels
  // - Panels whose left edge is to the right of the narrative → right-column panels
  // This is more reliable than y-position thresholds, which break when right-column
  // panels stack up close to the bottom of the screen.
  const narrativeRight = narrative ? narrative.x + narrative.w : (screenW * 0.70) / scaleW;

  // Bottom-row panels: x < narrativeRight (in narrative column area), sorted left to right
  const bottomPanels = panels
    .filter(p => p.id !== 'narrative' && p.id !== 'input' && p.x < narrativeRight)
    .sort((a, b) => a.x - b.x)
    .map(p => ({ id: p.id, label: p.label, w: Math.max(60, Math.round(p.w * scaleW)) }));

  // Right-column panels: x >= narrativeRight, sorted top to bottom
  const rightPanels = panels
    .filter(p => p.id !== 'narrative' && p.id !== 'input' && p.x >= narrativeRight)
    .sort((a, b) => a.y - b.y)
    .map(p => ({ id: p.id, label: p.label, h: Math.max(40, Math.round(p.h * scaleH)) }));

  return {
    rightColW,
    rightPanels,
    bottomPanels,
    hasNarrative: !!narrative,
    hasInput: !!input,
    raw: panels,
  };
}
