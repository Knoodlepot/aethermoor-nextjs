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

// ── Tier icons for location list ──
const TIER_ICONS: Record<string, string> = {
  capital: '🏰', city: '🏙️', town: '🏘️', village: '🏡', hamlet: '🛖',
  farm_arable: '🌾', farm_livestock: '🐄', farm_mixed: '🐂',
  poi_forest: '🌲', poi_cave: '🕳️', poi_ruins: '🏚️', poi_wood: '🌳', poi_shrine: '⛩️',
  dungeon: '🗝️', poi: '⚠️', farm: '🌾',
};

function fmtHours(h: number): string {
  if (h < 1) return '<1h';
  if (h < 24) return `${Math.round(h)}h`;
  const d = Math.floor(h / 24);
  const rem = Math.round(h % 24);
  return rem > 0 ? `${d}d ${rem}h` : `${d}d`;
}

export function MapView({ player, worldSeed, onClose, inline = false, onCommand }: MapViewProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [selectedDest, setSelectedDest] = React.useState<string | null>(null);

  const W = 920, H = 620;
  const MAP_W = 700, MAP_H = 580, MAP_X = 10, MAP_Y = 10;
  const KEY_X = 725, KEY_Y = 20;
  const PAD = 44;

  const toScreen = (mx: number, my: number) => ({
    x: MAP_X + PAD + (mx / 100) * (MAP_W - PAD * 2),
    y: MAP_Y + PAD + (my / 100) * (MAP_H - PAD * 2),
  });

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

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const g = canvas.getContext('2d');
    if (!g) return;

    g.clearRect(0, 0, W, H);

    const lg: Record<string, any> = (worldSeed.travelMatrix as any)?.locationGrid || {};
    const routes: any[] = (worldSeed.travelMatrix as any)?.routes || [];
    const explored = new Set<string>((player as any).exploredLocations || [player.location]);
    const current = player.location;

    // ── Background gradient ──
    const bgGrd = g.createLinearGradient(MAP_X, MAP_Y, MAP_X, MAP_Y + MAP_H);
    bgGrd.addColorStop(0, '#060810');
    bgGrd.addColorStop(1, '#0d1220');
    g.fillStyle = bgGrd;
    g.fillRect(MAP_X, MAP_Y, MAP_W, MAP_H);

    // Parchment noise
    for (let i = 0; i < 600; i++) {
      g.globalAlpha = 0.016 + Math.random() * 0.022;
      g.fillStyle = Math.random() > 0.5 ? '#c0a860' : '#7a5a28';
      const nx = MAP_X + Math.random() * MAP_W;
      const ny = MAP_Y + Math.random() * MAP_H;
      const ns = Math.random() * 3 + 1;
      g.fillRect(nx, ny, ns, ns);
    }
    g.globalAlpha = 1;

    // Map borders
    g.strokeStyle = '#c9a84c'; g.lineWidth = 2;
    g.strokeRect(MAP_X + 6, MAP_Y + 6, MAP_W - 12, MAP_H - 12);
    g.strokeStyle = 'rgba(201,168,76,0.25)'; g.lineWidth = 1;
    g.strokeRect(MAP_X + 10, MAP_Y + 10, MAP_W - 20, MAP_H - 20);

    // Title
    g.font = 'bold 13px Cinzel,serif'; g.fillStyle = '#c9a84c';
    g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    g.fillText('AETHERMOOR', MAP_X + MAP_W / 2, MAP_Y + 22);
    g.font = '9px Cinzel,serif'; g.fillStyle = '#7a6030';
    g.fillText('— Known Lands —', MAP_X + MAP_W / 2, MAP_Y + 34);

    // Compass rose
    const cx = MAP_X + MAP_W - 36, cy = MAP_Y + MAP_H - 36;
    g.font = 'bold 8px Cinzel,serif'; g.fillStyle = '#c9a84c88'; g.textAlign = 'center';
    g.fillText('N', cx, cy - 16); g.fillText('S', cx, cy + 21);
    g.fillText('E', cx + 18, cy + 4); g.fillText('W', cx - 18, cy + 4);
    g.strokeStyle = '#c9a84c33'; g.lineWidth = 1;
    g.beginPath(); g.moveTo(cx, cy - 12); g.lineTo(cx, cy + 12); g.stroke();
    g.beginPath(); g.moveTo(cx - 12, cy); g.lineTo(cx + 12, cy); g.stroke();

    // ── Roads ──
    if (routes.length > 0) {
      routes.forEach((r: any) => {
        const fromLoc = lg[r.from];
        const toLoc = lg[r.to];
        if (!fromLoc || !toLoc) return;
        const fromEx = explored.has(r.from);
        const toEx = explored.has(r.to);
        if (!fromEx && !toEx) return;

        const fs = toScreen(fromLoc.x, fromLoc.y);
        const ts = toScreen(toLoc.x, toLoc.y);
        const rs = ROAD_STYLE[r.roadType] || ROAD_STYLE.dirt;
        const both = fromEx && toEx;

        g.save();
        g.strokeStyle = both ? rs.color : rs.fogColor;
        g.lineWidth = both ? rs.width : rs.fogWidth;
        g.setLineDash(both ? rs.dash : [4, 6]);
        g.beginPath(); g.moveTo(fs.x, fs.y); g.lineTo(ts.x, ts.y); g.stroke();
        g.restore();
      });
    } else {
      // Fallback: draw roads from travelMatrix distance object
      const tm = worldSeed.travelMatrix as any;
      if (tm && typeof tm === 'object') {
        const drawn = new Set<string>();
        Object.entries(tm).forEach(([fromKey, dests]: [string, any]) => {
          if (typeof dests !== 'object') return;
          Object.keys(dests).forEach((toKey) => {
            const key = [fromKey, toKey].sort().join('→');
            if (drawn.has(key)) return;
            drawn.add(key);
            const fromLoc = lg[fromKey]; const toLoc = lg[toKey];
            if (!fromLoc || !toLoc) return;
            if (!explored.has(fromKey) && !explored.has(toKey)) return;
            const fs = toScreen(fromLoc.x, fromLoc.y);
            const ts = toScreen(toLoc.x, toLoc.y);
            g.save();
            g.strokeStyle = 'rgba(201,168,76,0.35)'; g.lineWidth = 1.5;
            g.setLineDash([4, 4]);
            g.beginPath(); g.moveTo(fs.x, fs.y); g.lineTo(ts.x, ts.y); g.stroke();
            g.restore();
          });
        });
      }
    }

    // ── Settlement / POI nodes ──
    Object.entries(lg).forEach(([name, loc]: [string, any]) => {
      const { x, y, type, isPOI } = loc;
      const isFarm = typeof type === 'string' && type.startsWith('farm');

      if (!explored.has(name)) {
        // Show ? if adjacent to an explored node via a route
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

      if (isFarm) return; // farms omitted from main map — too cluttered

      const nd = NODE[type] || (isPOI ? NODE.poi : NODE.hamlet);
      if (!nd) return;
      const s = toScreen(x, y);
      const isCur = name === current;

      // Current location glow
      if (isCur) {
        const grd = g.createRadialGradient(s.x, s.y, 0, s.x, s.y, nd.r * 5);
        grd.addColorStop(0, 'rgba(201,168,76,0.55)');
        grd.addColorStop(1, 'rgba(201,168,76,0)');
        g.fillStyle = grd;
        g.fillRect(s.x - nd.r * 5, s.y - nd.r * 5, nd.r * 10, nd.r * 10);
      }

      // Node circle
      g.beginPath(); g.arc(s.x, s.y, nd.r, 0, Math.PI * 2);
      g.fillStyle = nd.fill; g.fill();
      g.strokeStyle = isCur ? '#fffce0' : nd.stroke;
      g.lineWidth = isCur ? 2 : 1; g.stroke();

      // Icon inside circle
      g.font = `${nd.r * 1.5}px serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(nd.icon, s.x, s.y);

      // Waymarker ◆ above current
      if (isCur) {
        g.font = 'bold 12px serif'; g.fillStyle = '#fffce0';
        g.textAlign = 'center'; g.textBaseline = 'alphabetic';
        g.fillText('◆', s.x, s.y - nd.r - 4);
      }

      // Label
      const short = name.length > 14 ? name.split(' ')[0] : name;
      g.font = isCur ? 'bold 8px Cinzel,serif' : '7px Cinzel,serif';
      g.fillStyle = isCur ? '#fffce0' : nd.label;
      g.textAlign = 'center'; g.textBaseline = 'alphabetic';
      g.fillText(short, s.x, s.y + nd.r + 10);
    });

    // ── Key panel ──
    g.fillStyle = '#08090e';
    g.fillRect(KEY_X, KEY_Y, W - KEY_X - 8, MAP_Y + MAP_H - KEY_Y);
    g.strokeStyle = '#c9a84c44'; g.lineWidth = 1;
    g.strokeRect(KEY_X, KEY_Y, W - KEY_X - 8, MAP_Y + MAP_H - KEY_Y);

    g.font = 'bold 9px Cinzel,serif'; g.fillStyle = '#c9a84c';
    g.textAlign = 'left'; g.textBaseline = 'alphabetic';
    g.fillText('MAP KEY', KEY_X + 10, KEY_Y + 16);
    g.strokeStyle = '#c9a84c33'; g.lineWidth = 1;
    g.beginPath(); g.moveTo(KEY_X + 6, KEY_Y + 22); g.lineTo(W - 14, KEY_Y + 22); g.stroke();

    // Settlements
    g.font = 'bold 8px Cinzel,serif'; g.fillStyle = '#a07848';
    g.fillText('SETTLEMENTS', KEY_X + 10, KEY_Y + 35);
    const settlementKeys = [
      { icon: '🏰', label: 'Capital', col: '#e8cc6a' },
      { icon: '🏙️', label: 'City',    col: '#80b0d8' },
      { icon: '🏘️', label: 'Town',    col: '#80a870' },
      { icon: '🏡', label: 'Village', col: '#a08c68' },
      { icon: '🛖', label: 'Hamlet',  col: '#887060' },
      { icon: '🌾', label: 'Farm',    col: '#70a050' },
    ];
    settlementKeys.forEach((sk, i) => {
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
    const poiKeys = [
      { icon: '🌲', label: 'Ancient Forest',  col: '#7ab850' },
      { icon: '🕳️', label: 'Cave',            col: '#c07050' },
      { icon: '🏚️', label: 'Ancient Ruins',   col: '#b09870' },
      { icon: '🌳', label: 'Dark Wood',       col: '#9070c0' },
      { icon: '⛩️', label: 'Forgotten Shrine',col: '#d07840' },
    ];
    poiKeys.forEach((pk, i) => {
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
    const roadKeys = [
      { type: 'highway', label: "King's Road",   desc: 'Capital / City'    },
      { type: 'road',    label: 'Merchant Road', desc: 'City / Town'       },
      { type: 'dirt',    label: 'Dirt Road',     desc: 'Village / Hamlet'  },
      { type: 'trail',   label: 'Trail',         desc: 'Points of Interest'},
      { type: 'track',   label: 'Farm Track',    desc: 'Farms'             },
    ];
    roadKeys.forEach((rk, i) => {
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

    // Markers
    g.font = 'bold 8px Cinzel,serif'; g.fillStyle = '#a07848'; g.textAlign = 'left';
    g.fillText('MARKERS', KEY_X + 10, divY3 + 13);
    [{ sym: '◆', col: '#fffce0', label: 'Your location' }, { sym: '?', col: '#806040', label: 'Unexplored nearby' }]
      .forEach((mk, i) => {
        const my = divY3 + 26 + i * 16;
        g.font = 'bold 10px serif'; g.fillStyle = mk.col; g.textAlign = 'left';
        g.fillText(mk.sym, KEY_X + 13, my + 3);
        g.font = '8px Cinzel,serif'; g.fillStyle = mk.col;
        g.fillText(mk.label, KEY_X + 26, my + 3);
      });

  }, [player, worldSeed]);

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
    const from = lg[player.location];
    const to = lg[selectedDest];
    const opts: { method: string; label: string; icon: string; hours: number; cost: number }[] = [];
    let footHours = 8;
    if (from && to) {
      const dx = (from.x ?? 50) - (to.x ?? 50);
      const dy = (from.y ?? 50) - (to.y ?? 50);
      footHours = Math.max(1, Math.sqrt(dx * dx + dy * dy) * 1.5);
    }
    opts.push({ method: 'foot', label: 'On Foot', icon: '👣', hours: footHours, cost: 0 });
    if (hasMount) {
      opts.push({ method: 'horse', label: 'Your Horse', icon: '🐴', hours: footHours / 2.5, cost: 0 });
    } else {
      opts.push({ method: 'hire_horse', label: 'Hire Horse', icon: '🐴', hours: footHours / 2.5, cost: 15 });
    }
    // River barge: both nodes have river flag
    const fromNode = lg[player.location];
    const toNode = lg[selectedDest];
    if (fromNode?.river && toNode?.river) {
      opts.push({ method: 'barge', label: 'River Barge', icon: '⛵', hours: footHours / 3, cost: Math.round(8 + footHours * 0.3) });
    }
    // Sea boat: both have coast+harbour
    if (fromNode?.coast && fromNode?.harbour && toNode?.coast && toNode?.harbour) {
      opts.push({ method: 'boat', label: 'Sea Vessel', icon: '⚓', hours: footHours / 4, cost: Math.round(10 + footHours * 0.4) });
    }
    return opts.map(o => ({ ...o, hours: Math.max(1, Math.round(o.hours)) }));
  }, [selectedDest, player.location, lg, hasMount]);

  const destIcon = selectedDest ? (TIER_ICONS[(lg[selectedDest]?.type ?? 'poi')] ?? '📍') : '';

  if (inline) {
    return (
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        style={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain' }}
      />
    );
  }

  // ── Panel styles ──
  const panelBg = 'rgba(6,5,3,0.97)';
  const borderCol = '#3a2810';
  const goldCol = '#c9a84c';
  const dimCol = '#806040';
  const textCol = '#c8a870';

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
                <button
                  key={name}
                  onClick={() => setSelectedDest(isSel ? null : name)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 10px', background: isSel ? 'rgba(201,168,76,0.12)' : 'transparent',
                    border: 'none', borderBottom: `1px solid ${borderCol}22`, cursor: 'pointer',
                    color: isSel ? goldCol : textCol, textAlign: 'left', fontFamily: 'Cinzel,serif', fontSize: 9,
                  }}
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

        {/* ── Map canvas + travel popup ── */}
        <div style={{ position: 'relative' }}>
          <canvas ref={canvasRef} width={W} height={H} style={{ display: 'block', borderRadius: 4 }} />
          <button
            onClick={() => { setSelectedDest(null); onClose?.(); }}
            style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(0,0,0,0.75)', border: `1px solid ${goldCol}`, color: goldCol, padding: '4px 10px', cursor: 'pointer', fontFamily: 'Cinzel,serif', fontSize: 10, borderRadius: 2, letterSpacing: 1 }}
          >
            ✕ Close
          </button>

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
                        onClick={() => {
                          onCommand?.(`fast_travel:${selectedDest}:${opt.method}:${opt.cost}`);
                          setSelectedDest(null);
                          onClose?.();
                        }}
                        style={{ background: canAfford ? '#2a1a08' : '#111', border: `1px solid ${canAfford ? goldCol : '#333'}`, color: canAfford ? goldCol : '#555', padding: '4px 10px', cursor: canAfford ? 'pointer' : 'not-allowed', fontFamily: 'Cinzel,serif', fontSize: 9, borderRadius: 3, letterSpacing: 0.5 }}
                      >
                        Go
                      </button>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={() => setSelectedDest(null)}
                style={{ marginTop: 10, background: 'transparent', border: 'none', color: dimCol, cursor: 'pointer', fontFamily: 'Cinzel,serif', fontSize: 9, padding: 0 }}
              >
                ✕ Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

