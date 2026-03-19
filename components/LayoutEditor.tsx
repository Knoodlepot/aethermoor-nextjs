'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

// ── Types ────────────────────────────────────────────────────────────────────

type PanelBox = {
  id: string;
  label: string;
  color: string;       // hex base color
  x: number;           // px from canvas left
  y: number;           // px from canvas top
  w: number;           // px width
  h: number;           // px height
  zIndex: number;
};

type DragState = {
  type: 'move' | 'resize';
  panelId: string;
  startX: number;      // pointer position when drag started
  startY: number;
  origX: number;       // panel position when drag started
  origY: number;
  origW: number;
  origH: number;
  handle?: string;     // 'n' | 's' | 'e' | 'w' | 'nw' | 'ne' | 'sw' | 'se'
};

// ── Constants ────────────────────────────────────────────────────────────────

const MIN_W = 80;
const MIN_H = 40;
const TOOLBAR_H = 48;
const LS_KEY = 'ae-layout-editor-panels';
const SNAP_THRESHOLD = 8;

// All predefined panel types — used both for defaults and the Add Panel menu
const PANEL_CATALOG = [
  { id: 'narrative',  label: 'Narrative',       color: '#2a7a7a' },
  { id: 'input',      label: 'Input Bar',        color: '#4a5a7a' },
  { id: 'playerInfo', label: 'Player Info',      color: '#9a7a20' },
  { id: 'contextBar', label: 'Context Bar',      color: '#9a6010' },
  { id: 'contextAct', label: 'Context Actions',  color: '#8a5000' },
  { id: 'combat',     label: 'Combat Panel',     color: '#7a2020' },
  { id: 'mainQuest',  label: 'Main Quest',       color: '#5a2a8a' },
  { id: 'sideQuests', label: 'Side Quests',      color: '#3a3a9a' },
  { id: 'miniMap',    label: 'Mini Map',         color: '#2a6a30' },
  { id: 'eventLog',   label: 'Event Log',        color: '#3a6a4a' },
] as const;

// Default layout mirrors the real game (~70% left / ~30% right split).
// Positions are in canvas pixels — the canvas is the full window minus toolbar.
function buildDefaults(cw: number, ch: number): PanelBox[] {
  const rightX = Math.round(cw * 0.70);
  const rightW = cw - rightX;
  const inputH = 72;

  // right column panel heights
  const playerH  = 150;
  const ctxBarH  = 80;
  const ctxActH  = 90;
  const combatH  = 120;
  const mainQH   = 100;
  const sideQH   = 120;
  const mapH     = ch - playerH - ctxBarH - ctxActH - combatH - mainQH - sideQH;

  return [
    { id: 'narrative',    label: 'Narrative',        color: '#2a7a7a', x: 0,      y: 0,                                          w: rightX, h: ch - inputH, zIndex: 1 },
    { id: 'input',        label: 'Input Bar',         color: '#4a5a7a', x: 0,      y: ch - inputH,                                w: rightX, h: inputH,     zIndex: 1 },
    { id: 'playerInfo',   label: 'Player Info',       color: '#9a7a20', x: rightX, y: 0,                                          w: rightW, h: playerH,    zIndex: 1 },
    { id: 'contextBar',   label: 'Context Bar',       color: '#9a6010', x: rightX, y: playerH,                                    w: rightW, h: ctxBarH,    zIndex: 1 },
    { id: 'contextAct',   label: 'Context Actions',   color: '#8a5000', x: rightX, y: playerH + ctxBarH,                          w: rightW, h: ctxActH,    zIndex: 1 },
    { id: 'combat',       label: 'Combat Panel',      color: '#7a2020', x: rightX, y: playerH + ctxBarH + ctxActH,                w: rightW, h: combatH,    zIndex: 1 },
    { id: 'mainQuest',    label: 'Main Quest',        color: '#5a2a8a', x: rightX, y: playerH + ctxBarH + ctxActH + combatH,      w: rightW, h: mainQH,     zIndex: 1 },
    { id: 'sideQuests',   label: 'Side Quests',       color: '#3a3a9a', x: rightX, y: playerH + ctxBarH + ctxActH + combatH + mainQH,  w: rightW, h: sideQH,    zIndex: 1 },
    { id: 'miniMap',      label: 'Mini Map',          color: '#2a6a30', x: rightX, y: playerH + ctxBarH + ctxActH + combatH + mainQH + sideQH, w: rightW, h: Math.max(MIN_H, mapH), zIndex: 1 },
  ];
}

// ── Resize handle directions ─────────────────────────────────────────────────

const HANDLES = ['nw','n','ne','e','se','s','sw','w'] as const;
type Handle = typeof HANDLES[number];

function handleCursor(h: Handle): string {
  const map: Record<Handle, string> = {
    nw: 'nw-resize', n: 'n-resize', ne: 'ne-resize',
    e: 'e-resize', se: 'se-resize', s: 's-resize',
    sw: 'sw-resize', w: 'w-resize',
  };
  return map[h];
}

function handlePos(h: Handle, w: number, hh: number): React.CSSProperties {
  const sz = 10;
  const half = sz / 2;
  const positions: Record<Handle, React.CSSProperties> = {
    nw: { top: -half, left: -half, cursor: 'nw-resize' },
    n:  { top: -half, left: w / 2 - half, cursor: 'n-resize' },
    ne: { top: -half, right: -half, cursor: 'ne-resize' },
    e:  { top: hh / 2 - half, right: -half, cursor: 'e-resize' },
    se: { bottom: -half, right: -half, cursor: 'se-resize' },
    s:  { bottom: -half, left: w / 2 - half, cursor: 's-resize' },
    sw: { bottom: -half, left: -half, cursor: 'sw-resize' },
    w:  { top: hh / 2 - half, left: -half, cursor: 'w-resize' },
  };
  return { position: 'absolute', width: sz, height: sz, background: '#fff', border: '1.5px solid #000', borderRadius: 2, zIndex: 10, ...positions[h] };
}

// ── Clamp helper ─────────────────────────────────────────────────────────────

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

/** Snap a value to the nearest candidate if within threshold, else return as-is */
function snap(v: number, candidates: number[], threshold: number): number {
  let best = v;
  let bestDist = threshold + 1;
  for (const c of candidates) {
    const d = Math.abs(v - c);
    if (d < bestDist) { bestDist = d; best = c; }
  }
  return bestDist <= threshold ? best : v;
}

// ── Main Component ────────────────────────────────────────────────────────────

export function LayoutEditor() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ w: 1280, h: 720 });
  const [panels, setPanels] = useState<PanelBox[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [saved, setSaved] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [maxZ, setMaxZ] = useState(1);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [addingCustom, setAddingCustom] = useState(false);
  const [customLabel, setCustomLabel] = useState('');

  // ── Canvas size tracking ───────────────────────────────────────────────────

  useEffect(() => {
    function measure() {
      setCanvasSize({ w: window.innerWidth, h: window.innerHeight - TOOLBAR_H });
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // ── Load from localStorage or build defaults ───────────────────────────────

  useEffect(() => {
    if (canvasSize.w === 1280 && canvasSize.h === 720) return; // wait for real size
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Support new format { panels, canvasW, canvasH } and old array format
        const loadedPanels: PanelBox[] = Array.isArray(parsed) ? parsed : (parsed?.panels ?? []);
        if (loadedPanels.length > 0) {
          setPanels(loadedPanels);
          return;
        }
      }
    } catch {}
    setPanels(buildDefaults(canvasSize.w, canvasSize.h));
  }, [canvasSize.w, canvasSize.h]);

  // ── Save helpers ────────────────────────────────────────────────────────────

  function saveToStorage(p: PanelBox[]) {
    localStorage.setItem(LS_KEY, JSON.stringify({ panels: p, canvasW: canvasSize.w, canvasH: canvasSize.h }));
  }

  // ── Auto-save (debounced) ─────────────────────────────────────────────────

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (panels.length === 0) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveToStorage(panels);
    }, 500);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [panels, canvasSize.w, canvasSize.h]);

  // ── Pointer move/up on window (handles drag outside panel) ────────────────

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!dragState) return;
    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;
    const cw = canvasSize.w;
    const ch = canvasSize.h;

    setPanels(prev => {
      // Collect all edge positions from other panels + canvas borders for snapping
      const dragged = prev.find(p => p.id === dragState.panelId)!;
      const others = prev.filter(p => p.id !== dragState.panelId);
      const xEdges = [0, cw, ...others.flatMap(o => [o.x, o.x + o.w])];
      const yEdges = [0, ch, ...others.flatMap(o => [o.y, o.y + o.h])];
      const T = SNAP_THRESHOLD;

      return prev.map(p => {
        if (p.id !== dragState.panelId) return p;

        if (dragState.type === 'move') {
          const rawX = clamp(dragState.origX + dx, 0, cw - p.w);
          const rawY = clamp(dragState.origY + dy, 0, ch - p.h);

          // Snap left or right edge to xEdges
          let snappedX = rawX;
          const sl = snap(rawX, xEdges, T);
          const sr = snap(rawX + p.w, xEdges, T);
          if (sl !== rawX) snappedX = clamp(sl, 0, cw - p.w);
          else if (sr !== rawX + p.w) snappedX = clamp(sr - p.w, 0, cw - p.w);

          // Snap top or bottom edge to yEdges
          let snappedY = rawY;
          const st = snap(rawY, yEdges, T);
          const sb = snap(rawY + p.h, yEdges, T);
          if (st !== rawY) snappedY = clamp(st, 0, ch - p.h);
          else if (sb !== rawY + p.h) snappedY = clamp(sb - p.h, 0, ch - p.h);

          return { ...p, x: snappedX, y: snappedY };
        }

        // Resize
        let { origX: nx, origY: ny, origW: nw, origH: nh } = dragState;
        const h = dragState.handle!;

        if (h.includes('e')) {
          const rawRight = dragState.origX + dragState.origW + dx;
          const snappedRight = snap(rawRight, xEdges, T);
          nw = clamp(snappedRight - nx, MIN_W, cw - nx);
        }
        if (h.includes('s')) {
          const rawBottom = dragState.origY + dragState.origH + dy;
          const snappedBottom = snap(rawBottom, yEdges, T);
          nh = clamp(snappedBottom - ny, MIN_H, ch - ny);
        }
        if (h.includes('w')) {
          const rawLeft = dragState.origX + dx;
          const snappedLeft = snap(rawLeft, xEdges, T);
          const maxNx = dragState.origX + dragState.origW - MIN_W;
          nx = clamp(snappedLeft, 0, maxNx);
          nw = dragState.origX + dragState.origW - nx;
        }
        if (h.includes('n')) {
          const rawTop = dragState.origY + dy;
          const snappedTop = snap(rawTop, yEdges, T);
          const maxNy = dragState.origY + dragState.origH - MIN_H;
          ny = clamp(snappedTop, 0, maxNy);
          nh = dragState.origY + dragState.origH - ny;
        }
        return { ...p, x: nx, y: ny, w: nw, h: nh };
      });
    });
  }, [dragState, canvasSize]);

  const handlePointerUp = useCallback(() => {
    setDragState(null);
    (document.activeElement as HTMLElement)?.blur();
  }, []);

  useEffect(() => {
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  // ── Keyboard: Delete/Backspace removes selected panel ─────────────────────

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selected) {
        // Don't fire if focus is inside an input
        if (document.activeElement && (document.activeElement as HTMLElement).tagName !== 'INPUT') {
          deletePanel(selected);
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selected]);

  // ── Panel interactions ────────────────────────────────────────────────────

  function bringToFront(id: string) {
    const newZ = maxZ + 1;
    setMaxZ(newZ);
    setPanels(prev => prev.map(p => p.id === id ? { ...p, zIndex: newZ } : p));
  }

  function startMove(e: React.PointerEvent, panel: PanelBox) {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    bringToFront(panel.id);
    setSelected(panel.id);
    setDragState({
      type: 'move',
      panelId: panel.id,
      startX: e.clientX,
      startY: e.clientY,
      origX: panel.x,
      origY: panel.y,
      origW: panel.w,
      origH: panel.h,
    });
  }

  function startResize(e: React.PointerEvent, panel: PanelBox, handle: Handle) {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragState({
      type: 'resize',
      panelId: panel.id,
      startX: e.clientX,
      startY: e.clientY,
      origX: panel.x,
      origY: panel.y,
      origW: panel.w,
      origH: panel.h,
      handle,
    });
  }

  // ── Toolbar actions ───────────────────────────────────────────────────────

  function handleReset() {
    const fresh = buildDefaults(canvasSize.w, canvasSize.h);
    setPanels(fresh);
    setSelected(null);
    saveToStorage(fresh);
  }

  function handleSave() {
    saveToStorage(panels);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  function addPredefinedPanel(entry: typeof PANEL_CATALOG[number]) {
    const newZ = maxZ + 1;
    setMaxZ(newZ);
    setPanels(prev => [...prev, {
      id: entry.id,
      label: entry.label,
      color: entry.color,
      x: Math.max(0, Math.round((canvasSize.w - 200) / 2)),
      y: Math.max(0, Math.round((canvasSize.h - 120) / 2)),
      w: 200,
      h: 120,
      zIndex: newZ,
    }]);
    setSelected(entry.id);
    setShowAddMenu(false);
  }

  function addCustomPanel(label: string) {
    if (!label.trim()) return;
    const idx = panels.filter(p => p.id.startsWith('custom_')).length + 1;
    const id = `custom_${idx}`;
    const newZ = maxZ + 1;
    setMaxZ(newZ);
    setPanels(prev => [...prev, {
      id,
      label: label.trim(),
      color: '#5a5a6a',
      x: Math.max(0, Math.round((canvasSize.w - 200) / 2)),
      y: Math.max(0, Math.round((canvasSize.h - 120) / 2)),
      w: 200,
      h: 120,
      zIndex: newZ,
    }]);
    setSelected(id);
    setCustomLabel('');
    setAddingCustom(false);
    setShowAddMenu(false);
  }

  function deletePanel(id: string) {
    setPanels(prev => prev.filter(p => p.id !== id));
    setSelected(null);
  }

  const exportJson = JSON.stringify(
    panels.map(({ id, label, x, y, w, h }) => ({ id, label, x, y, w, h })),
    null, 2
  );

  // ── Render ────────────────────────────────────────────────────────────────

  const btnStyle: React.CSSProperties = {
    padding: '6px 14px',
    background: 'transparent',
    color: '#c9a84c',
    border: '1px solid #c9a84c',
    borderRadius: 4,
    fontSize: 13,
    fontFamily: 'Georgia, serif',
    cursor: 'pointer',
    letterSpacing: '0.05em',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: '#0d0a06', userSelect: 'none', overflow: 'hidden' }}>

      {/* ── Toolbar ── */}
      <div style={{
        height: TOOLBAR_H,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '0 16px',
        borderBottom: '1px solid #2e2010',
        background: '#120d08',
      }}>
        <span style={{ color: '#c9a84c', fontFamily: 'Cinzel, serif', fontSize: 14, letterSpacing: '0.1em', marginRight: 8 }}>
          LAYOUT EDITOR
        </span>
        <button style={btnStyle} onClick={handleReset}>Reset</button>
        <button style={{ ...btnStyle, color: saved ? '#80c060' : '#c9a84c', borderColor: saved ? '#80c060' : '#c9a84c' }} onClick={handleSave}>
          {saved ? 'Saved!' : 'Save'}
        </button>
        <button style={btnStyle} onClick={() => setShowExport(true)}>Export Config</button>
        {selected && (
          <button
            style={{ ...btnStyle, color: '#ff8080', borderColor: '#ff8080' }}
            onClick={() => deletePanel(selected)}
            title="Delete selected panel (or press Delete key)"
          >
            Delete Panel
          </button>
        )}

        {/* Add Panel dropdown */}
        <div style={{ position: 'relative' }}>
          <button style={{ ...btnStyle, color: '#a0d080', borderColor: '#a0d080' }} onClick={() => { setShowAddMenu(m => !m); setAddingCustom(false); setCustomLabel(''); }}>
            + Add Panel ▾
          </button>
          {showAddMenu && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, marginTop: 4,
              background: '#1a120a', border: '1px solid #c9a84c', borderRadius: 4,
              zIndex: 9999, minWidth: 180, padding: '4px 0',
            }}>
              {PANEL_CATALOG.map(entry => {
                const alreadyOn = panels.some(p => p.id === entry.id);
                return (
                  <div
                    key={entry.id}
                    style={{
                      padding: '6px 14px', cursor: alreadyOn ? 'default' : 'pointer',
                      color: alreadyOn ? '#5a4a30' : '#c9a84c',
                      fontFamily: 'Georgia, serif', fontSize: 12,
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}
                    onClick={() => { if (!alreadyOn) addPredefinedPanel(entry); }}
                  >
                    <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: entry.color, flexShrink: 0 }} />
                    {entry.label}
                    {alreadyOn && <span style={{ fontSize: 10, color: '#5a4a30', marginLeft: 'auto' }}>on canvas</span>}
                  </div>
                );
              })}
              <div style={{ borderTop: '1px solid #2e2010', margin: '4px 0' }} />
              {!addingCustom ? (
                <div
                  style={{ padding: '6px 14px', cursor: 'pointer', color: '#80c0ff', fontFamily: 'Georgia, serif', fontSize: 12 }}
                  onClick={() => setAddingCustom(true)}
                >
                  Custom Panel...
                </div>
              ) : (
                <div style={{ padding: '6px 10px', display: 'flex', gap: 6 }}>
                  <input
                    autoFocus
                    value={customLabel}
                    onChange={e => setCustomLabel(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') addCustomPanel(customLabel); if (e.key === 'Escape') { setAddingCustom(false); setCustomLabel(''); } }}
                    placeholder="Panel name…"
                    style={{ flex: 1, background: '#0d0a06', color: '#c9a84c', border: '1px solid #5a4a30', borderRadius: 3, padding: '3px 6px', fontSize: 12, fontFamily: 'Georgia, serif' }}
                  />
                  <button style={{ ...btnStyle, padding: '2px 8px', fontSize: 11 }} onClick={() => addCustomPanel(customLabel)}>Add</button>
                </div>
              )}
            </div>
          )}
        </div>
        <div style={{ flex: 1 }} />
        <span style={{ color: '#7a6040', fontSize: 11, fontFamily: 'Georgia, serif' }}>
          Drag panel headers to move · Drag edges/corners to resize · Click canvas to deselect
        </span>
        <div style={{ flex: 1 }} />
        <a href="/game" style={{ ...btnStyle, textDecoration: 'none', fontSize: 12, color: '#b8925a', borderColor: '#7a6040' }}>
          ← Back to Game
        </a>
      </div>

      {/* ── Canvas ── */}
      <div
        ref={canvasRef}
        style={{ position: 'relative', flex: 1, overflow: 'hidden', background: '#0d0a06' }}
        onPointerDown={(e) => { if (e.target === canvasRef.current) { setSelected(null); setShowAddMenu(false); } }}
      >
        {/* Guide line: default right-column start */}
        <div style={{
          position: 'absolute', top: 0, bottom: 0,
          left: Math.round(canvasSize.w * 0.70),
          width: 1, background: '#2e2010', pointerEvents: 'none', zIndex: 0,
        }} />

        {/* Grid dots */}
        <svg
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.8" fill="#2e2010" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Panel boxes */}
        {panels.map(panel => {
          const isSelected = selected === panel.id;
          return (
            <div
              key={panel.id}
              style={{
                position: 'absolute',
                left: panel.x,
                top: panel.y,
                width: panel.w,
                height: panel.h,
                zIndex: panel.zIndex,
                background: panel.color + '33',
                border: `2px solid ${panel.color}${isSelected ? 'ff' : '99'}`,
                boxShadow: isSelected ? `0 0 0 1px ${panel.color}66, 0 4px 16px #00000088` : '0 2px 8px #00000055',
                boxSizing: 'border-box',
              }}
              onClick={(e) => { e.stopPropagation(); setSelected(panel.id); }}
            >
              {/* Drag header */}
              <div
                style={{
                  height: 28,
                  background: panel.color + '88',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: dragState?.panelId === panel.id && dragState.type === 'move' ? 'grabbing' : 'grab',
                  fontFamily: 'Cinzel, serif',
                  fontSize: 11,
                  letterSpacing: '0.08em',
                  color: '#fff',
                  textTransform: 'uppercase' as const,
                  userSelect: 'none',
                  paddingLeft: 8,
                  paddingRight: 4,
                }}
                onPointerDown={(e) => startMove(e, panel)}
              >
                <span style={{ flex: 1, textAlign: 'center' }}>{panel.label}</span>
                <span
                  style={{ cursor: 'pointer', padding: '0 6px', fontSize: 15, color: isSelected ? '#ff8080' : '#cc666688', lineHeight: 1, flexShrink: 0 }}
                  onPointerDown={e => e.stopPropagation()}
                  onClick={e => { e.stopPropagation(); deletePanel(panel.id); }}
                  title="Remove panel"
                >×</span>
              </div>

              {/* Size label */}
              <div style={{
                position: 'absolute',
                bottom: 4,
                right: 6,
                fontSize: 10,
                color: panel.color + 'cc',
                fontFamily: 'monospace',
                pointerEvents: 'none',
              }}>
                {Math.round(panel.w)} × {Math.round(panel.h)}
              </div>

              {/* Resize handles (only when selected) */}
              {isSelected && HANDLES.map(h => (
                <div
                  key={h}
                  style={handlePos(h, panel.w, panel.h)}
                  onPointerDown={(e) => { e.stopPropagation(); startResize(e, panel, h); }}
                />
              ))}
            </div>
          );
        })}
      </div>

      {/* ── Export modal ── */}
      {showExport && (
        <div
          style={{
            position: 'fixed', inset: 0, background: '#000000bb',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999,
          }}
          onClick={() => setShowExport(false)}
        >
          <div
            style={{
              background: '#1a120a', border: '1px solid #c9a84c', borderRadius: 6,
              padding: 24, maxWidth: 640, width: '90%', maxHeight: '80vh',
              display: 'flex', flexDirection: 'column', gap: 12,
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ color: '#c9a84c', fontFamily: 'Cinzel, serif', fontSize: 14, letterSpacing: '0.1em' }}>
              EXPORT CONFIG
            </div>
            <p style={{ color: '#b8925a', fontSize: 12, fontFamily: 'Georgia, serif', margin: 0 }}>
              Your layout is live — the game reads this config automatically. Copy the JSON as a backup or to share.
            </p>
            <textarea
              readOnly
              value={exportJson}
              style={{
                flex: 1, minHeight: 300, background: '#0d0a06', color: '#80c060',
                border: '1px solid #2e2010', borderRadius: 4, padding: 12,
                fontFamily: 'monospace', fontSize: 12, resize: 'vertical',
              }}
              onFocus={e => e.currentTarget.select()}
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                style={btnStyle}
                onClick={() => { navigator.clipboard.writeText(exportJson).catch(() => {}); }}
              >
                Copy to Clipboard
              </button>
              <button style={{ ...btnStyle, borderColor: '#7a6040', color: '#b8925a' }} onClick={() => setShowExport(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
