'use client';

import React from 'react';
import type { Player, WorldSeed } from '@/lib/types';

interface MapViewProps {
  player: Player;
  worldSeed: WorldSeed;
  onClose?: () => void;
  inline?: boolean;
  onCommand?: (cmd: string) => void;
}

// ── Layout constants ──
const W = 920, H = 620;
const MAP_W = 700, MAP_H = 580, MAP_X = 10, MAP_Y = 10;
const KEY_X = 725, KEY_Y = 20;
const PAD = 44;
const BASE_SX = (MAP_W - PAD * 2) / 100;
const BASE_SY = (MAP_H - PAD * 2) / 100;
const ZOOM_MIN = 0.6, ZOOM_MAX = 3.0;
const ZOOM_STEP_BTN = 0.25, ZOOM_STEP_SCROLL = 0.12;

// ── Tier icons for location list ──
const TIER_ICONS: Record<string, string> = {
  capital: '🏰', city: '🏙️', town: '🏘️', village: '🏡', hamlet: '🛖',
  farm_arable: '🌾', farm_livestock: '🐄', farm_mixed: '🐂',
  poi_forest: '🌲', poi_cave: '🕳️', poi_ruins: '🏚️', poi_wood: '🌳', poi_shrine: '⛩️',
  dungeon: '🗝️', poi: '⚠️', farm: '🌾',
};

const NODE: Record<string, { r: number; fill: string; stroke: string; label: string; icon: string }> = {
  capital:        { r: 9,  fill: '#2a2010', stroke: '#c9a84c', label: '#fffce0', icon: '🏰' },
  city:           { r: 6,  fill: '#1a2030', stroke: '#6090c0', label: '#90b8e0', icon: '🏙️' },
  town:           { r: 5,  fill: '#1a2018', stroke: '#60885a', label: '#88a870', icon: '🏘️' },
  village:        { r: 4,  fill: '#1c1a10', stroke: '#706448', label: '#a08c68', icon: '🏡' },
  hamlet:         { r: 3,  fill: '#181410', stroke: '#4c4030', label: '#806858', icon: '🛖' },
  farm_arable:    { r: 2,  fill: '#101808', stroke: '#384828', label: '#587040', icon: '🌾' },
  farm_livestock: { r: 2,  fill: '#181008', stroke: '#403020', label: '#706040', icon: '🐄' },
  farm_mixed:     { r: 2,  fill: '#141408', stroke: '#383820', label: '#606040', icon: '🐂' },
  poi_forest:     { r: 4,  fill: '#0c1808', stroke: '#386020', label: '#5a9038', icon: '🌲' },
  poi_cave:       { r: 4,  fill: '#180c08', stroke: '#583830', label: '#a05838', icon: '🕳️' },
  poi_ruins:      { r: 4,  fill: '#101008', stroke: '#484030', label: '#907850', icon: '🏚️' },
  poi_wood:       { r: 4,  fill: '#0c0818', stroke: '#382050', label: '#7050a0', icon: '🌳' },
  poi_shrine:     { r: 4,  fill: '#180808', stroke: '#603020', label: '#c06030', icon: '⛩️' },
  dungeon:        { r: 5,  fill: '#100810', stroke: '#703090', label: '#c080e0', icon: '🗝️' },
  poi:            { r: 4,  fill: '#101010', stroke: '#505050', label: '#909090', icon: '⚠️' },
};

const ROAD_STYLE: Record<string, { color: string; width: number; dash: number[]; fogColor: string; fogWidth: number }> = {
  highway: { color: '#c9a84c', width: 3,   dash: [],      fogColor: 'rgba(201,168,76,0.35)',  fogWidth: 2   },
  road:    { color: '#7a6c50', width: 2,   dash: [],      fogColor: 'rgba(122,108,80,0.35)',  fogWidth: 1.5 },
  dirt:    { color: '#5a4430', width: 1.5, dash: [5, 4],  fogColor: 'rgba(90,68,48,0.3)',    fogWidth: 1   },
  trail:   { color: '#3a5030', width: 1,   dash: [3, 5],  fogColor: 'rgba(58,80,48,0.25)',   fogWidth: 1   },
  track:   { color: '#382818', width: 1,   dash: [2, 6],  fogColor: 'rgba(56,40,24,0.2)',    fogWidth: 0.8 },
};

function fmtHours(h: number): string {
  if (h < 1) return '<1h';
  if (h < 24) return `${Math.round(h)}h`;
  const d = Math.floor(h / 24), rem = Math.round(h % 24);
  return rem > 0 ? `${d}d ${rem}h` : `${d}d`;
}

// Deterministic seeded random for terrain textures (avoids noise flicker on re-render)
function seededRand(seed: number) {
  let s = seed >>> 0;
  return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 0xffffffff; };
}

// Generate organic (irregular blob) control points around a rectangle
function organicPoints(
  px: number, py: number, pw: number, ph: number,
  r: () => number,
  steps: number = 10
): Array<{ x: number; y: number }> {
  const pts: Array<{ x: number; y: number }> = [];
  const jx = pw * 0.13, jy = ph * 0.13;
  const nt = Math.max(2, Math.round(steps * pw / (pw + ph)));
  const ns = Math.max(2, Math.round(steps * ph / (pw + ph)));
  for (let i = 0; i < nt; i++)
    pts.push({ x: px + (i / nt) * pw + (r() - 0.5) * jx, y: py + (r() - 0.5) * jy });
  for (let i = 0; i < ns; i++)
    pts.push({ x: px + pw + (r() - 0.5) * jx, y: py + (i / ns) * ph + (r() - 0.5) * jy });
  for (let i = nt; i > 0; i--)
    pts.push({ x: px + (i / nt) * pw + (r() - 0.5) * jx, y: py + ph + (r() - 0.5) * jy });
  for (let i = ns; i > 0; i--)
    pts.push({ x: px + (r() - 0.5) * jx, y: py + (i / ns) * ph + (r() - 0.5) * jy });
  return pts;
}

// Draw a smooth bezier curve through organic control points
function drawOrganic(g: CanvasRenderingContext2D, pts: Array<{ x: number; y: number }>) {
  if (pts.length < 3) return;
  g.beginPath();
  const last = pts[pts.length - 1];
  g.moveTo((last.x + pts[0].x) / 2, (last.y + pts[0].y) / 2);
  for (let i = 0; i < pts.length; i++) {
    const c = pts[i], n = pts[(i + 1) % pts.length];
    g.quadraticCurveTo(c.x, c.y, (c.x + n.x) / 2, (c.y + n.y) / 2);
  }
  g.closePath();
}

export function MapView({ player, worldSeed, onClose, inline = false, onCommand }: MapViewProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [selectedDest, setSelectedDest] = React.useState<string | null>(null);
  const [zoom, setZoom] = React.useState(1.0);
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });
  const isDragging = React.useRef(false);
  const dragStart = React.useRef({ x: 0, y: 0, ox: 0, oy: 0 });

  // Clamp offset so world content never fully leaves the map window
  const clampOffset = React.useCallback((ox: number, oy: number, z: number) => {
    const ww = 100 * BASE_SX * z, wh = 100 * BASE_SY * z;
    const winW = MAP_W - PAD * 2, winH = MAP_H - PAD * 2;
    const minX = ww <= winW ? (winW - ww) / 2 : -(ww - winW);
    const maxX = ww <= winW ? (winW - ww) / 2 : 0;
    const minY = wh <= winH ? (winH - wh) / 2 : -(wh - winH);
    const maxY = wh <= winH ? (winH - wh) / 2 : 0;
    return { x: Math.max(minX, Math.min(maxX, ox)), y: Math.max(minY, Math.min(maxY, oy)) };
  }, []);

  const doZoom = React.useCallback((targetZoom: number, pivotX: number, pivotY: number) => {
    const z = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, targetZoom));
    setZoom(prev => {
      setOffset(prevOff => {
        const wx = (pivotX - MAP_X - PAD - prevOff.x) / (BASE_SX * prev);
        const wy = (pivotY - MAP_Y - PAD - prevOff.y) / (BASE_SY * prev);
        const newOx = pivotX - MAP_X - PAD - wx * BASE_SX * z;
        const newOy = pivotY - MAP_Y - PAD - wy * BASE_SY * z;
        return clampOffset(newOx, newOy, z);
      });
      return z;
    });
  }, [clampOffset]);

  // ── Mouse handlers ──
  const handleWheel = React.useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const rect = canvasRef.current!.getBoundingClientRect();
    const px = (e.clientX - rect.left) * (W / rect.width);
    const py = (e.clientY - rect.top) * (H / rect.height);
    setZoom(prev => {
      const dir = e.deltaY > 0 ? -1 : 1;
      const newZ = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, prev + dir * ZOOM_STEP_SCROLL));
      setOffset(prevOff => {
        const wx = (px - MAP_X - PAD - prevOff.x) / (BASE_SX * prev);
        const wy = (py - MAP_Y - PAD - prevOff.y) / (BASE_SY * prev);
        return clampOffset(px - MAP_X - PAD - wx * BASE_SX * newZ, py - MAP_Y - PAD - wy * BASE_SY * newZ, newZ);
      });
      return newZ;
    });
  }, [clampOffset]);

  const handleMouseDown = React.useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return;
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  }, [offset]);

  const handleMouseMove = React.useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging.current) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = W / rect.width, scaleY = H / rect.height;
    const dx = (e.clientX - dragStart.current.x) * scaleX;
    const dy = (e.clientY - dragStart.current.y) * scaleY;
    setZoom(z => { setOffset(clampOffset(dragStart.current.ox + dx, dragStart.current.oy + dy, z)); return z; });
  }, [clampOffset]);

  const stopDrag = React.useCallback(() => { isDragging.current = false; }, []);

  // ── Draw ──
  React.useEffect(() => {
    // Debug: log redraws and key props
    // eslint-disable-next-line no-console
    console.log('[MapView Redraw]', {
      playerLoc: player?.location,
      explored: player?.exploredLocations,
      worldSeed: worldSeed?.seed,
      worldSeedObj: worldSeed,
    });
    const canvas = canvasRef.current;
    if (!canvas) return;
    const g = canvas.getContext('2d');
    if (!g) return;

    g.clearRect(0, 0, W, H);

    const lg: Record<string, any> = (worldSeed.travelMatrix as any)?.locationGrid || {};
    const routes: any[] = (worldSeed.travelMatrix as any)?.routes || [];
    const terrain: any[] = (worldSeed.travelMatrix as any)?.terrain || [];
    const explored = new Set<string>((player as any).exploredLocations || [player.location]);
    const current = player.location;

    // World → canvas coords (respects zoom + offset)
    const toScreen = (mx: number, my: number) => ({
      x: MAP_X + PAD + offset.x + mx * BASE_SX * zoom,
      y: MAP_Y + PAD + offset.y + my * BASE_SY * zoom,
    });

    const clipToMap = () => {
      g.beginPath();
      g.rect(MAP_X + PAD - 1, MAP_Y + PAD - 1, MAP_W - PAD * 2 + 2, MAP_H - PAD * 2 + 2);
      g.clip();
    };

    // ── Background ──
    const bgGrd = g.createLinearGradient(MAP_X, MAP_Y, MAP_X, MAP_Y + MAP_H);
    bgGrd.addColorStop(0, '#060810');
    bgGrd.addColorStop(1, '#0d1220');
    g.fillStyle = bgGrd;
    g.fillRect(MAP_X, MAP_Y, MAP_W, MAP_H);

    // Parchment noise (fixed, not zoomed)
    for (let i = 0; i < 600; i++) {
      g.globalAlpha = 0.016 + Math.random() * 0.022;
      g.fillStyle = Math.random() > 0.5 ? '#c0a860' : '#7a5a28';
      g.fillRect(MAP_X + Math.random() * MAP_W, MAP_Y + Math.random() * MAP_H, Math.random() * 3 + 1, Math.random() * 3 + 1);
    }
    g.globalAlpha = 1;

    // ── TERRAIN (clipped, zoomed) ──
    g.save();
    clipToMap();

    terrain.forEach((t: any, ti: number) => {
      const { type, x, y, w, h } = t;
      if (!type || x == null || y == null || !w || !h) return;
      const s1 = toScreen(x, y), s2 = toScreen(x + w, y + h);
      const px = s1.x, py = s1.y, pw = s2.x - s1.x, ph = s2.y - s1.y;
      if (pw <= 0 || ph <= 0) return;
      const sr = seededRand(ti * 888131 + (type.charCodeAt(0) || 0) * 17);
      const r  = seededRand(ti * 999983 + (type.charCodeAt(0) || 0) * 7);
      const pts = organicPoints(px, py, pw, ph, sr);
      g.save();
      drawOrganic(g, pts);
      g.clip();

      if (type === 'forest' || type === 'woodland' || type === 'glade') {
        g.fillStyle = 'rgba(10,32,8,0.55)'; g.fillRect(px, py, pw, ph);
        g.fillStyle = 'rgba(40,80,20,0.6)';
        for (let i = 0; i < 80; i++) {
          g.beginPath(); g.arc(px + r() * pw, py + r() * ph, 1.5 + r() * 2, 0, Math.PI * 2); g.fill();
        }
        g.strokeStyle = 'rgba(50,90,25,0.35)'; g.lineWidth = 0.8; g.setLineDash([]);
        for (let i = 0; i < 15; i++) {
          const cx = px + r() * pw, cy = py + r() * ph, cs = 4 + r() * 5;
          g.beginPath(); g.moveTo(cx - cs / 2, cy); g.lineTo(cx + cs / 2, cy); g.stroke();
          g.beginPath(); g.moveTo(cx, cy - cs / 2); g.lineTo(cx, cy + cs / 2); g.stroke();
        }
      } else if (type === 'plains') {
        g.fillStyle = 'rgba(120,100,40,0.22)'; g.fillRect(px, py, pw, ph);
        g.strokeStyle = 'rgba(150,130,60,0.15)'; g.lineWidth = 0.7; g.setLineDash([]);
        const sp = Math.max(4, ph / 10);
        for (let ly = py; ly < py + ph; ly += sp) { g.beginPath(); g.moveTo(px, ly); g.lineTo(px + pw, ly); g.stroke(); }
      } else if (type === 'grasslands') {
        g.fillStyle = 'rgba(50,100,20,0.28)'; g.fillRect(px, py, pw, ph);
        g.fillStyle = 'rgba(70,130,30,0.3)';
        for (let i = 0; i < 60; i++) {
          g.beginPath(); g.arc(px + r() * pw, py + r() * ph, 1 + r() * 1.5, 0, Math.PI * 2); g.fill();
        }
      } else if (type === 'hills') {
        g.fillStyle = 'rgba(80,65,40,0.28)'; g.fillRect(px, py, pw, ph);
        g.strokeStyle = 'rgba(110,90,60,0.5)'; g.lineWidth = 1; g.setLineDash([]);
        for (let i = 0; i < 18; i++) {
          const hx = px + r() * pw, hy = py + r() * ph, hr = 5 + r() * 8;
          g.beginPath(); g.arc(hx, hy, hr, Math.PI, Math.PI * 2); g.stroke();
          g.beginPath(); g.arc(hx, hy + hr * 0.4, hr * 0.6, Math.PI, Math.PI * 2); g.stroke();
        }
      } else if (type === 'mountains') {
        g.fillStyle = 'rgba(45,42,50,0.35)'; g.fillRect(px, py, pw, ph);
        const rows = Math.max(2, Math.floor(ph / 28));
        for (let row = 0; row < rows; row++) {
          const baseY = py + ph - (row + 1) * (ph / (rows + 0.5));
          const peaks = Math.max(2, Math.floor(pw / 18));
          for (let p = 0; p < peaks; p++) {
            const pkX = px + (p + 0.5 + r() * 0.4 - 0.2) * (pw / peaks);
            const pkW = (pw / peaks) * (0.65 + r() * 0.5);
            const pkH = 14 + r() * 24;
            g.fillStyle = 'rgba(70,65,80,0.65)';
            g.beginPath();
            g.moveTo(pkX - pkW / 2, baseY + 8);
            g.lineTo(pkX, baseY - pkH);
            g.lineTo(pkX + pkW / 2, baseY + 8);
            g.closePath(); g.fill();
            g.fillStyle = 'rgba(200,200,220,0.28)';
            g.beginPath();
            g.moveTo(pkX - pkW * 0.15, baseY - pkH + pkH * 0.28);
            g.lineTo(pkX, baseY - pkH);
            g.lineTo(pkX + pkW * 0.15, baseY - pkH + pkH * 0.28);
            g.closePath(); g.fill();
          }
        }
      } else if (type === 'tundra') {
        g.fillStyle = 'rgba(150,165,195,0.2)'; g.fillRect(px, py, pw, ph);
        g.fillStyle = 'rgba(175,190,215,0.22)';
        for (let i = 0; i < 40; i++) {
          g.beginPath(); g.arc(px + r() * pw, py + r() * ph, 1 + r() * 1.5, 0, Math.PI * 2); g.fill();
        }
        g.strokeStyle = 'rgba(130,145,170,0.2)'; g.lineWidth = 0.5; g.setLineDash([2, 4]);
        for (let i = 0; i < 10; i++) {
          const lx = px + r() * pw, ly = py + r() * ph;
          g.beginPath(); g.moveTo(lx, ly); g.lineTo(lx + r() * 20 - 10, ly + r() * 20 - 10); g.stroke();
        }
        g.setLineDash([]);
      } else if (type === 'swamp') {
        g.fillStyle = 'rgba(35,65,35,0.38)'; g.fillRect(px, py, pw, ph);
        g.fillStyle = 'rgba(55,85,45,0.3)';
        for (let i = 0; i < 55; i++) {
          g.beginPath(); g.arc(px + r() * pw, py + r() * ph, 1 + r() * 3, 0, Math.PI * 2); g.fill();
        }
      }
      g.restore();
      // Soft parchment border traces the organic edge
      g.save();
      drawOrganic(g, pts);
      g.strokeStyle = 'rgba(180,155,80,0.18)';
      g.lineWidth = 1.5;
      g.setLineDash([]);
      g.stroke();
      g.restore();
    });

    // ── RIVERS ── (curved bezier on river-flagged routes)
    const drawnRivers = new Set<string>();
    routes.forEach((r: any) => {
      if (!r.river) return;
      const fromLoc = lg[r.from], toLoc = lg[r.to];
      if (!fromLoc || !toLoc) return;
      if (!explored.has(r.from) && !explored.has(r.to)) return;
      const key = [r.from, r.to].sort().join('~');
      if (drawnRivers.has(key)) return;
      drawnRivers.add(key);
      const fs = toScreen(fromLoc.x, fromLoc.y), ts = toScreen(toLoc.x, toLoc.y);
      const mx2 = (fs.x + ts.x) / 2 + Math.sin((fromLoc.x + toLoc.x) * 0.31) * 14;
      const my2 = (fs.y + ts.y) / 2 + Math.cos((fromLoc.y + toLoc.y) * 0.31) * 14;
      const lw = Math.max(1.5, 2.5 * Math.min(zoom, 1.5));
      g.save();
      g.strokeStyle = 'rgba(55,105,175,0.55)'; g.lineWidth = lw; g.setLineDash([]);
      g.beginPath(); g.moveTo(fs.x, fs.y); g.quadraticCurveTo(mx2, my2, ts.x, ts.y); g.stroke();
      g.strokeStyle = 'rgba(100,155,215,0.22)'; g.lineWidth = lw * 0.4;
      g.beginPath(); g.moveTo(fs.x, fs.y); g.quadraticCurveTo(mx2, my2, ts.x, ts.y); g.stroke();
      g.restore();
    });

    // Fallback: connect river-flagged nodes in x-order if no river routes
    if (drawnRivers.size === 0) {
      const rn = Object.entries(lg)
        .filter(([, v]: [string, any]) => v.river)
        .map(([name, v]: [string, any]) => ({ name, x: v.x ?? 50, y: v.y ?? 50 }))
        .sort((a, b) => a.x - b.x);
      if (rn.length > 1) {
        g.save();
        g.strokeStyle = 'rgba(55,105,175,0.45)'; g.lineWidth = 2; g.setLineDash([]);
        g.beginPath();
        const st = toScreen(rn[0].x, rn[0].y); g.moveTo(st.x, st.y);
        for (let i = 1; i < rn.length; i++) {
          const prev = rn[i - 1], curr = rn[i];
          const ps = toScreen(prev.x, prev.y), cs = toScreen(curr.x, curr.y);
          g.quadraticCurveTo((ps.x + cs.x) / 2, (ps.y + cs.y) / 2 + Math.sin(i * 1.3) * 10, cs.x, cs.y);
        }
        g.stroke();
        g.restore();
      }
    }

    g.restore(); // end terrain+river clip

    // ── Map borders & chrome (always fixed) ──
    g.strokeStyle = '#c9a84c'; g.lineWidth = 2;
    g.strokeRect(MAP_X + 6, MAP_Y + 6, MAP_W - 12, MAP_H - 12);
    g.strokeStyle = 'rgba(201,168,76,0.25)'; g.lineWidth = 1;
    g.strokeRect(MAP_X + 10, MAP_Y + 10, MAP_W - 20, MAP_H - 20);

    g.font = 'bold 13px Cinzel,serif'; g.fillStyle = '#c9a84c';
    g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    g.fillText('AETHERMOOR', MAP_X + MAP_W / 2, MAP_Y + 22);
    g.font = '9px Cinzel,serif'; g.fillStyle = '#7a6030';
    g.fillText('— Known Lands —', MAP_X + MAP_W / 2, MAP_Y + 34);

    // Compass rose (fixed)
    const crx = MAP_X + MAP_W - 36, cry = MAP_Y + MAP_H - 36;
    g.font = 'bold 8px Cinzel,serif'; g.fillStyle = '#c9a84c88'; g.textAlign = 'center';
    g.fillText('N', crx, cry - 16); g.fillText('S', crx, cry + 21);
    g.fillText('E', crx + 18, cry + 4); g.fillText('W', crx - 18, cry + 4);
    g.strokeStyle = '#c9a84c33'; g.lineWidth = 1;
    g.beginPath(); g.moveTo(crx, cry - 12); g.lineTo(crx, cry + 12); g.stroke();
    g.beginPath(); g.moveTo(crx - 12, cry); g.lineTo(crx + 12, cry); g.stroke();

    // Zoom indicator
    g.font = '7px Cinzel,serif'; g.fillStyle = '#504030'; g.textAlign = 'left';
    g.fillText(`${Math.round(zoom * 100)}%`, MAP_X + 14, MAP_Y + MAP_H - 8);

    // ── Roads (clipped, zoomed) ──
    g.save();
    clipToMap();
    if (routes.length > 0) {
      routes.forEach((r: any) => {
        const fromLoc = lg[r.from], toLoc = lg[r.to];
        if (!fromLoc || !toLoc) return;
        const fromEx = explored.has(r.from), toEx = explored.has(r.to);
        if (!fromEx && !toEx) return;
        const fs = toScreen(fromLoc.x, fromLoc.y), ts = toScreen(toLoc.x, toLoc.y);
        const rs = ROAD_STYLE[r.roadType] || ROAD_STYLE.dirt;
        const both = fromEx && toEx;
        g.save();
        g.strokeStyle = both ? rs.color : rs.fogColor;
        g.lineWidth = both ? rs.width * Math.min(zoom, 1.5) : rs.fogWidth;
        g.setLineDash(both ? rs.dash : [4, 6]);
        g.beginPath(); g.moveTo(fs.x, fs.y); g.lineTo(ts.x, ts.y); g.stroke();
        g.restore();
      });
    } else {
      const tm = worldSeed.travelMatrix as any;
      if (tm && typeof tm === 'object') {
        const drawn = new Set<string>();
        Object.entries(tm).forEach(([fromKey, dests]: [string, any]) => {
          if (typeof dests !== 'object') return;
          Object.keys(dests).forEach((toKey) => {
            const key = [fromKey, toKey].sort().join('→');
            if (drawn.has(key)) return; drawn.add(key);
            const fromLoc = lg[fromKey], toLoc = lg[toKey];
            if (!fromLoc || !toLoc || (!explored.has(fromKey) && !explored.has(toKey))) return;
            const fs = toScreen(fromLoc.x, fromLoc.y), ts = toScreen(toLoc.x, toLoc.y);
            g.save();
            g.strokeStyle = 'rgba(201,168,76,0.35)'; g.lineWidth = 1.5; g.setLineDash([4, 4]);
            g.beginPath(); g.moveTo(fs.x, fs.y); g.lineTo(ts.x, ts.y); g.stroke();
            g.restore();
          });
        });
      }
    }

    // ── Nodes (clipped, zoomed) ──
    Object.entries(lg).forEach(([name, loc]: [string, any]) => {
      const { x, y, type, isPOI } = loc;
      const isFarm = typeof type === 'string' && type.startsWith('farm');

      if (!explored.has(name)) {
        const adj = routes.find((r: any) =>
          (r.from === name && explored.has(r.to)) || (r.to === name && explored.has(r.from))
        );
        if (!adj) return;
        const s = toScreen(x, y);
        g.globalAlpha = 0.4;
        g.font = 'bold 9px serif'; g.fillStyle = '#806040'; g.textAlign = 'center';
        g.fillText('?', s.x, s.y + 4);
        g.globalAlpha = 1;
        return;
      }
      if (isFarm) return;

      const nd = NODE[type] || (isPOI ? NODE.poi : NODE.hamlet);
      if (!nd) return;
      const s = toScreen(x, y);
      const isCur = name === current;
      const nr = nd.r * Math.min(zoom, 2);

      if (isCur) {
        const grd = g.createRadialGradient(s.x, s.y, 0, s.x, s.y, nr * 5);
        grd.addColorStop(0, 'rgba(201,168,76,0.55)');
        grd.addColorStop(1, 'rgba(201,168,76,0)');
        g.fillStyle = grd; g.fillRect(s.x - nr * 5, s.y - nr * 5, nr * 10, nr * 10);
      }
      g.beginPath(); g.arc(s.x, s.y, nr, 0, Math.PI * 2);
      g.fillStyle = nd.fill; g.fill();
      g.strokeStyle = isCur ? '#fffce0' : nd.stroke;
      g.lineWidth = isCur ? 2 : 1; g.stroke();
      g.font = `${Math.max(8, nr * 1.5)}px serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(nd.icon, s.x, s.y);
      if (isCur) {
        g.font = 'bold 12px serif'; g.fillStyle = '#fffce0';
        g.textAlign = 'center'; g.textBaseline = 'alphabetic';
        g.fillText('◆', s.x, s.y - nr - 4);
      }
      const short = name.length > 14 ? name.split(' ')[0] : name;
      const labelSize = Math.max(7, Math.min(10, 7 * Math.min(zoom, 1.4)));
      g.font = isCur ? `bold ${labelSize}px Cinzel,serif` : `${labelSize}px Cinzel,serif`;
      g.fillStyle = isCur ? '#fffce0' : nd.label;
      g.textAlign = 'center'; g.textBaseline = 'alphabetic';
      g.fillText(short, s.x, s.y + nr + 10);
    });

    g.restore(); // end roads+nodes clip

    // ── Key panel ──
    g.fillStyle = '#08090e';
    g.fillRect(KEY_X, KEY_Y, W - KEY_X - 8, MAP_Y + MAP_H - KEY_Y);
    g.strokeStyle = '#c9a84c44'; g.lineWidth = 1;
    g.strokeRect(KEY_X, KEY_Y, W - KEY_X - 8, MAP_Y + MAP_H - KEY_Y);

    g.font = 'bold 9px Cinzel,serif'; g.fillStyle = '#c9a84c'; g.textAlign = 'left'; g.textBaseline = 'alphabetic';
    g.fillText('MAP KEY', KEY_X + 10, KEY_Y + 16);
    g.strokeStyle = '#c9a84c33'; g.lineWidth = 1;
    g.beginPath(); g.moveTo(KEY_X + 6, KEY_Y + 22); g.lineTo(W - 14, KEY_Y + 22); g.stroke();

    // Settlements
    g.font = 'bold 8px Cinzel,serif'; g.fillStyle = '#a07848';
    g.fillText('SETTLEMENTS', KEY_X + 10, KEY_Y + 35);
    [
      { icon: '🏰', label: 'Capital', col: '#e8cc6a' },
      { icon: '🏙️', label: 'City',    col: '#80b0d8' },
      { icon: '🏘️', label: 'Town',    col: '#80a870' },
      { icon: '🏡', label: 'Village', col: '#a08c68' },
      { icon: '🛖', label: 'Hamlet',  col: '#887060' },
      { icon: '🌾', label: 'Farm',    col: '#70a050' },
    ].forEach((sk, i) => {
      const kx = KEY_Y + 47 + i * 16;
      g.font = '12px serif'; g.textAlign = 'left'; g.textBaseline = 'alphabetic';
      g.fillText(sk.icon, KEY_X + 10, kx + 2);
      g.font = '8px Cinzel,serif'; g.fillStyle = sk.col;
      g.fillText(sk.label, KEY_X + 28, kx + 2);
    });

    const divY1 = KEY_Y + 144;
    g.strokeStyle = '#c9a84c22'; g.lineWidth = 1;
    g.beginPath(); g.moveTo(KEY_X + 6, divY1); g.lineTo(W - 14, divY1); g.stroke();

    // POIs
    g.font = 'bold 8px Cinzel,serif'; g.fillStyle = '#a07848'; g.textAlign = 'left';
    g.fillText('POINTS OF INTEREST', KEY_X + 10, divY1 + 13);
    [
      { icon: '🌲', label: 'Ancient Forest',   col: '#7ab850' },
      { icon: '🕳️', label: 'Cave',             col: '#c07050' },
      { icon: '🏚️', label: 'Ancient Ruins',    col: '#b09870' },
      { icon: '🌳', label: 'Dark Wood',        col: '#9070c0' },
      { icon: '⛩️', label: 'Forgotten Shrine', col: '#d07840' },
    ].forEach((pk, i) => {
      const kx = divY1 + 25 + i * 16;
      g.font = '12px serif'; g.fillText(pk.icon, KEY_X + 10, kx + 2);
      g.font = '8px Cinzel,serif'; g.fillStyle = pk.col;
      g.fillText(pk.label, KEY_X + 28, kx + 2);
    });

    const divY2 = divY1 + 108;
    g.strokeStyle = '#c9a84c22'; g.lineWidth = 1;
    g.beginPath(); g.moveTo(KEY_X + 6, divY2); g.lineTo(W - 14, divY2); g.stroke();

    // Roads
    g.font = 'bold 8px Cinzel,serif'; g.fillStyle = '#a07848'; g.textAlign = 'left';
    g.fillText('ROADS', KEY_X + 10, divY2 + 13);
    [
      { type: 'highway', label: "King's Road",   desc: 'Capital / City'     },
      { type: 'road',    label: 'Merchant Road', desc: 'City / Town'        },
      { type: 'dirt',    label: 'Dirt Road',     desc: 'Village / Hamlet'   },
      { type: 'trail',   label: 'Trail',         desc: 'Points of Interest' },
      { type: 'track',   label: 'Farm Track',    desc: 'Farms'              },
    ].forEach((rk, i) => {
      const ry = divY2 + 26 + i * 22;
      const rs = ROAD_STYLE[rk.type];
      g.save();
      g.strokeStyle = rs.color; g.lineWidth = rs.width; g.setLineDash(rs.dash);
      g.beginPath(); g.moveTo(KEY_X + 10, ry); g.lineTo(KEY_X + 50, ry); g.stroke();
      g.restore();
      g.font = 'bold 8px Cinzel,serif'; g.fillStyle = rs.color; g.textAlign = 'left';
      g.fillText(rk.label, KEY_X + 56, ry + 3);
      g.font = '7px Cinzel,serif'; g.fillStyle = '#807060';
      g.fillText(rk.desc, KEY_X + 56, ry + 13);
    });

    const divY3 = divY2 + 140;
    g.strokeStyle = '#c9a84c22'; g.lineWidth = 1;
    g.beginPath(); g.moveTo(KEY_X + 6, divY3); g.lineTo(W - 14, divY3); g.stroke();

    // Terrain key
    g.font = 'bold 8px Cinzel,serif'; g.fillStyle = '#a07848'; g.textAlign = 'left';
    g.fillText('TERRAIN', KEY_X + 10, divY3 + 13);
    [
      { col: 'rgba(10,32,8,0.75)',      label: 'Forest / Woodland', river: false },
      { col: 'rgba(50,100,20,0.65)',    label: 'Grasslands',        river: false },
      { col: 'rgba(120,100,40,0.55)',   label: 'Plains',            river: false },
      { col: 'rgba(80,65,40,0.65)',     label: 'Hills',             river: false },
      { col: 'rgba(45,42,50,0.7)',      label: 'Mountains',         river: false },
      { col: 'rgba(150,165,195,0.5)',   label: 'Tundra',            river: false },
      { col: 'rgba(35,65,35,0.65)',     label: 'Swamp',             river: false },
      { col: 'rgba(55,105,175,0.6)',    label: 'River',             river: true  },
    ].forEach((tk, i) => {
      const ty = divY3 + 26 + i * 14;
      if (tk.river) {
        g.save();
        g.strokeStyle = tk.col; g.lineWidth = 2.5; g.setLineDash([]);
        g.beginPath(); g.moveTo(KEY_X + 10, ty - 3); g.lineTo(KEY_X + 24, ty - 3); g.stroke();
        g.restore();
      } else {
        g.fillStyle = tk.col; g.fillRect(KEY_X + 10, ty - 8, 14, 10);
        g.strokeStyle = 'rgba(201,168,76,0.18)'; g.lineWidth = 0.5; g.setLineDash([]);
        g.strokeRect(KEY_X + 10, ty - 8, 14, 10);
      }
      g.font = '7px Cinzel,serif'; g.fillStyle = '#a09080'; g.textAlign = 'left';
      g.fillText(tk.label, KEY_X + 28, ty);
    });

    // Markers
    const divY4 = divY3 + 130;
    if (divY4 < MAP_Y + MAP_H - 20) {
      g.strokeStyle = '#c9a84c22'; g.lineWidth = 1;
      g.beginPath(); g.moveTo(KEY_X + 6, divY4); g.lineTo(W - 14, divY4); g.stroke();
      g.font = 'bold 8px Cinzel,serif'; g.fillStyle = '#a07848'; g.textAlign = 'left';
      g.fillText('MARKERS', KEY_X + 10, divY4 + 13);
      [{ sym: '◆', col: '#fffce0', label: 'Your location' }, { sym: '?', col: '#806040', label: 'Unexplored nearby' }]
        .forEach((mk, i) => {
          const my = divY4 + 26 + i * 16;
          g.font = 'bold 10px serif'; g.fillStyle = mk.col; g.textAlign = 'left';
          g.fillText(mk.sym, KEY_X + 13, my + 3);
          g.font = '8px Cinzel,serif'; g.fillStyle = mk.col;
          g.fillText(mk.label, KEY_X + 26, my + 3);
        });
    }

  }, [player, worldSeed, zoom, offset]);

  // ── Travel helpers ──
  const lg: Record<string, any> = (worldSeed.travelMatrix as any)?.locationGrid || {};
  const explored = React.useMemo(() => {
    const set = new Set<string>(player.exploredLocations ?? [player.location]);
    set.add(player.location);
    return Array.from(set).filter(n => n && !n.startsWith('Dungeon'));
  }, [player.exploredLocations, player.location]);

  const hasMount = (player as any).equipped?.mount === 'Horse';

  const travelOptions = React.useMemo(() => {
    if (!selectedDest) return [];
    const from = lg[player.location], to = lg[selectedDest];
    let footHours = 8;
    if (from && to) {
      const dx = (from.x ?? 50) - (to.x ?? 50), dy = (from.y ?? 50) - (to.y ?? 50);
      footHours = Math.max(1, Math.sqrt(dx * dx + dy * dy) * 1.5);
    }
    const opts: { method: string; label: string; icon: string; hours: number; cost: number }[] = [
      { method: 'foot', label: 'On Foot', icon: '👣', hours: footHours, cost: 0 },
    ];
    if (hasMount) {
      opts.push({ method: 'horse', label: 'Your Horse', icon: '🐴', hours: footHours / 2.5, cost: 0 });
    } else {
      opts.push({ method: 'hire_horse', label: 'Hire Horse', icon: '🐴', hours: footHours / 2.5, cost: 15 });
    }
    const fromNode = lg[player.location], toNode = lg[selectedDest];
    if (fromNode?.river && toNode?.river) {
      opts.push({ method: 'barge', label: 'River Barge', icon: '⛵', hours: footHours / 3, cost: Math.round(8 + footHours * 0.3) });
    }
    if (fromNode?.coast && fromNode?.harbour && toNode?.coast && toNode?.harbour) {
      opts.push({ method: 'boat', label: 'Sea Vessel', icon: '⚓', hours: footHours / 4, cost: Math.round(10 + footHours * 0.4) });
    }
    return opts.map(o => ({ ...o, hours: Math.max(1, Math.round(o.hours)) }));
  }, [selectedDest, player.location, lg, hasMount]);

  const destIcon = selectedDest ? (TIER_ICONS[(lg[selectedDest]?.type ?? 'poi')] ?? '📍') : '';

  if (inline) {
    return <canvas ref={canvasRef} width={W} height={H} style={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain' }} />;
  }

  const panelBg = 'rgba(6,5,3,0.97)';
  const borderCol = '#3a2810';
  const goldCol = '#c9a84c';
  const dimCol = '#806040';
  const textCol = '#c8a870';
  const zoomBtnStyle: React.CSSProperties = {
    background: 'rgba(10,8,4,0.88)', border: `1px solid ${goldCol}88`, color: goldCol,
    width: 28, height: 28, cursor: 'pointer', fontFamily: 'serif', fontSize: 16,
    borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 0, lineHeight: 1,
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.90)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={() => { setSelectedDest(null); onClose?.(); }}
    >
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }} onClick={(e) => e.stopPropagation()}>

        {/* ── Left panel: explored locations ── */}
        <div style={{ width: 200, height: H, background: panelBg, border: `1px solid ${borderCol}`, borderRadius: 4, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '10px 12px 8px', borderBottom: `1px solid ${borderCol}`, fontFamily: 'Cinzel,serif', color: goldCol, fontSize: 10, letterSpacing: 1 }}>
            FAST TRAVEL
          </div>
          <div style={{ padding: '6px 10px', borderBottom: `1px solid ${borderCol}`, color: dimCol, fontSize: 9, fontFamily: 'Cinzel,serif' }}>
            {player.location}
          </div>
          <div style={{ overflowY: 'auto', flex: 1, padding: '4px 0' }}>
            {explored.filter(n => n !== player.location).map(name => {
              const node = lg[name];
              const icon = TIER_ICONS[(node?.type ?? 'poi')] ?? '📍';
              const isSel = name === selectedDest;
              return (
                <button key={name} onClick={() => setSelectedDest(isSel ? null : name)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', background: isSel ? 'rgba(201,168,76,0.12)' : 'transparent', border: 'none', borderBottom: `1px solid ${borderCol}22`, cursor: 'pointer', color: isSel ? goldCol : textCol, textAlign: 'left', fontFamily: 'Cinzel,serif', fontSize: 9 }}
                >
                  <span style={{ fontSize: 13 }}>{icon}</span>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                </button>
              );
            })}
            {explored.filter(n => n !== player.location).length === 0 && (
              <div style={{ color: dimCol, fontSize: 9, fontFamily: 'Cinzel,serif', padding: '12px 10px', textAlign: 'center' }}>
                Explore locations to unlock fast travel.
              </div>
            )}
          </div>
        </div>

        {/* ── Map canvas ── */}
        <div style={{ position: 'relative' }}>
          <canvas
            ref={canvasRef} width={W} height={H}
            style={{ display: 'block', borderRadius: 4, cursor: isDragging.current ? 'grabbing' : 'grab' }}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={stopDrag}
            onMouseLeave={stopDrag}
          />

          {/* Close */}
          <button onClick={() => { setSelectedDest(null); onClose?.(); }}
            style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(0,0,0,0.75)', border: `1px solid ${goldCol}`, color: goldCol, padding: '4px 10px', cursor: 'pointer', fontFamily: 'Cinzel,serif', fontSize: 10, borderRadius: 2, letterSpacing: 1 }}
          >
            ✕ Close
          </button>

          {/* Zoom controls */}
          <div style={{ position: 'absolute', top: 50, left: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <button style={zoomBtnStyle} onClick={() => doZoom(zoom + ZOOM_STEP_BTN, MAP_X + MAP_W / 2, MAP_Y + MAP_H / 2)} title="Zoom in">＋</button>
            <button style={zoomBtnStyle} onClick={() => doZoom(zoom - ZOOM_STEP_BTN, MAP_X + MAP_W / 2, MAP_Y + MAP_H / 2)} title="Zoom out">－</button>
            <button style={{ ...zoomBtnStyle, fontSize: 11, fontFamily: 'Cinzel,serif' }} onClick={() => { setZoom(1.0); setOffset({ x: 0, y: 0 }); }} title="Reset view">⌖</button>
          </div>

          {/* Travel popup */}
          {selectedDest && (
            <div style={{ position: 'absolute', bottom: 18, left: '50%', transform: 'translateX(-50%)', background: panelBg, border: `1px solid ${goldCol}55`, borderRadius: 6, padding: '14px 18px', minWidth: 320, zIndex: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.8)' }}>
              <div style={{ fontFamily: 'Cinzel,serif', color: goldCol, fontSize: 13, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>{destIcon}</span>
                <span>Travel to {selectedDest}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {travelOptions.map(opt => {
                  const canAfford = (player.gold ?? 0) >= opt.cost;
                  return (
                    <div key={opt.method} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 4, border: `1px solid ${borderCol}` }}>
                      <span style={{ fontSize: 16 }}>{opt.icon}</span>
                      <span style={{ flex: 1, fontFamily: 'Cinzel,serif', color: textCol, fontSize: 10 }}>{opt.label}</span>
                      <span style={{ fontFamily: 'Cinzel,serif', color: dimCol, fontSize: 9, marginRight: 8 }}>⏱ {fmtHours(opt.hours)}</span>
                      <span style={{ fontFamily: 'Cinzel,serif', color: opt.cost === 0 ? '#70a860' : textCol, fontSize: 10, marginRight: 10 }}>
                        {opt.cost === 0 ? 'Free' : `${opt.cost}g`}
                      </span>
                      <button
                        disabled={!canAfford || !onCommand}
                        onClick={() => { onCommand?.(`fast_travel:${selectedDest}:${opt.method}:${opt.cost}`); setSelectedDest(null); onClose?.(); }}
                        style={{ background: canAfford ? '#2a1a08' : '#111', border: `1px solid ${canAfford ? goldCol : '#333'}`, color: canAfford ? goldCol : '#555', padding: '4px 10px', cursor: canAfford ? 'pointer' : 'not-allowed', fontFamily: 'Cinzel,serif', fontSize: 9, borderRadius: 3, letterSpacing: 0.5 }}
                      >
                        Go
                      </button>
                    </div>
                  );
                })}
              </div>
              <button onClick={() => setSelectedDest(null)} style={{ marginTop: 10, background: 'transparent', border: 'none', color: dimCol, cursor: 'pointer', fontFamily: 'Cinzel,serif', fontSize: 9, padding: 0 }}>
                ✕ Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
