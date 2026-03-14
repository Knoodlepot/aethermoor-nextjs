'use client';

import React from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import type { Player, WorldSeed } from '@/lib/types';

interface MapViewProps {
  player: Player;
  worldSeed: WorldSeed;
  onClose?: () => void;
  inline?: boolean;
}

// High-contrast, crisp, advanced map rendering
export function MapView({ player, worldSeed, onClose, inline = false }: MapViewProps) {
  const { T, tf } = useTheme();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  // Double resolution for sharpness
  const W = 920, H = 620, DPR = window.devicePixelRatio || 1;
  const MAP_W = 700, MAP_H = 580, MAP_X = 10, MAP_Y = 10, KEY_X = 725, KEY_Y = 20, PAD = 15;

  // Color palette for high contrast
  const COLORS = {
    bg: '#0a0a18', // deep blue-black
    star: '#22263a',
    border: '#ffe08a',
    capital: '#ffe08a',
    city: '#7fd6ff',
    town: '#ffb36b',
    village: '#b0ffb0',
    hamlet: '#e0e0e0',
    poi: '#ff6bcb',
    farm: '#e6e600',
    player: '#ff4d4d',
    road: '#ffe08a',
    dirt: '#bfa76a',
    trail: '#b0b0b0',
    track: '#a0a0a0',
    legendText: '#fff',
    legendBg: '#181820',
  };

  // Map type to color/icon
  const TYPE_ICON = {
    capital: '🏰',
    city: '🏙️',
    town: '🏘️',
    village: '🏡',
    hamlet: '🛖',
    farm_arable: '🌾',
    farm_livestock: '🐄',
    farm_mixed: '🚜',
    poi_forest: '🌲',
    poi_cave: '🕳️',
    poi_ruins: '🏚️',
    poi_wood: '🌳',
    poi_shrine: '⛩️',
  };

  // Helper: transform world coords to screen
  const toScreen = (mx: number, my: number) => ({
    x: (MAP_X + PAD + ((mx / 100) * (MAP_W - PAD * 2))) * DPR,
    y: (MAP_Y + PAD + ((my / 100) * (MAP_H - PAD * 2))) * DPR,
  });

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const g = canvas.getContext('2d');
    if (!g) return;

    // Set up double resolution for sharpness
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.scale(1, 1);

    // Draw background (deep blue-black)
    g.fillStyle = COLORS.bg;
    g.fillRect(0, 0, W * DPR, H * DPR);

    // Starfield (subtle, not grainy)
    for (let i = 0; i < 180; i++) {
      g.fillStyle = COLORS.star;
      g.beginPath();
      const r = Math.random() * 1.2 * DPR;
      g.arc(Math.random() * W * DPR, Math.random() * H * DPR, r, 0, Math.PI * 2);
      g.fill();
    }

    // Border
    g.strokeStyle = COLORS.border;
    g.lineWidth = 4 * DPR;
    g.strokeRect(MAP_X * DPR, MAP_Y * DPR, MAP_W * DPR, MAP_H * DPR);

    // Draw roads from travelMatrix (if available)
    if (worldSeed.travelMatrix) {
      // travelMatrix: Record<string, Record<string, number>>
      // We'll treat any connection as a road; if terrain info is needed, adjust here.
      const drawn = new Set<string>();
      Object.entries(worldSeed.travelMatrix).forEach(([fromKey, dests]) => {
        Object.entries(dests).forEach(([toKey, val]) => {
          // Avoid drawing both A→B and B→A
          const key = [fromKey, toKey].sort().join('→');
          if (drawn.has(key)) return;
          drawn.add(key);
          const from = worldSeed.locationGrid?.[fromKey];
          const to = worldSeed.locationGrid?.[toKey];
          if (!from || !to) return;
          const a = toScreen(from.x, from.y);
          const b = toScreen(to.x, to.y);
          // Optionally: use val to determine road type (if available)
          let color = COLORS.road;
          let width = 4 * DPR;
          // If you have terrain info, set color/width here
          g.save();
          g.strokeStyle = color;
          g.shadowColor = '#000';
          g.shadowBlur = 4 * DPR;
          g.lineWidth = width;
          g.beginPath();
          g.moveTo(a.x, a.y);
          g.lineTo(b.x, b.y);
          g.stroke();
          g.restore();
        });
      });
    }

    // Draw settlements/POIs
    if (worldSeed.locationGrid) {
      Object.entries(worldSeed.locationGrid).forEach(([name, loc]: [string, any]) => {
        const { x, y, type } = loc;
        const screen = toScreen(x, y);
        let color = COLORS[type] || COLORS.village;
        let icon = TYPE_ICON[type] || '•';
        let size = 7 * DPR;
        if (type === 'capital') size = 13 * DPR;
        else if (type === 'city') size = 11 * DPR;
        else if (type === 'town') size = 9 * DPR;
        else if (type.startsWith('poi')) size = 10 * DPR;
        else if (type.startsWith('farm')) size = 7 * DPR;
        else if (type === 'hamlet') size = 6 * DPR;

        // Draw icon (emoji)
        g.font = `bold ${size * 1.5}px serif`;
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.shadowColor = '#000';
        g.shadowBlur = 2 * DPR;
        g.fillStyle = color;
        g.fillText(icon, screen.x, screen.y);

        // Optionally: draw name (for capitals/cities/POIs)
        if (type === 'capital' || type === 'city' || type.startsWith('poi')) {
          g.font = `bold ${11 * DPR}px ${tf.fontFamily}`;
          g.shadowBlur = 0;
          g.fillStyle = COLORS.legendText;
          g.fillText(name, screen.x, screen.y + size * 1.2);
        }
      });
    }

    // Player marker
    if (player.location) {
      const loc = worldSeed.locationGrid?.[player.location];
      if (loc) {
        const screen = toScreen(loc.x, loc.y);
        g.save();
        g.beginPath();
        g.arc(screen.x, screen.y, 15 * DPR, 0, Math.PI * 2);
        g.fillStyle = COLORS.player;
        g.shadowColor = '#fff';
        g.shadowBlur = 8 * DPR;
        g.globalAlpha = 0.7;
        g.fill();
        g.globalAlpha = 1;
        g.lineWidth = 3 * DPR;
        g.strokeStyle = COLORS.border;
        g.stroke();
        g.restore();
      }
    }

    // Title
    g.font = `bold ${22 * DPR}px ${tf.fontFamily}`;
    g.fillStyle = COLORS.border;
    g.shadowBlur = 0;
    g.fillText('AETHERMOOR', (MAP_X + MAP_W / 2) * DPR, (MAP_Y + 30) * DPR);

    // Legend/key (right panel)
    const legendItems = [
      { label: 'Capital', icon: TYPE_ICON.capital, color: COLORS.capital },
      { label: 'City', icon: TYPE_ICON.city, color: COLORS.city },
      { label: 'Town', icon: TYPE_ICON.town, color: COLORS.town },
      { label: 'Village', icon: TYPE_ICON.village, color: COLORS.village },
      { label: 'Hamlet', icon: TYPE_ICON.hamlet, color: COLORS.hamlet },
      { label: 'Farm', icon: TYPE_ICON.farm_arable, color: COLORS.farm },
      { label: 'POI', icon: TYPE_ICON.poi_forest, color: COLORS.poi },
      { label: 'You', icon: '🧑‍🦱', color: COLORS.player },
      { label: 'Highway', icon: '━', color: COLORS.road },
      { label: 'Dirt Road', icon: '━', color: COLORS.dirt },
      { label: 'Trail', icon: '━', color: COLORS.trail },
      { label: 'Track', icon: '━', color: COLORS.track },
    ];
    const legendX = KEY_X * DPR, legendY = KEY_Y * DPR;
    g.save();
    g.globalAlpha = 0.95;
    g.fillStyle = COLORS.legendBg;
    g.fillRect(legendX - 18 * DPR, legendY - 12 * DPR, 170 * DPR, (legendItems.length * 28 + 20) * DPR);
    g.globalAlpha = 1;
    legendItems.forEach((item, idx) => {
      const y = legendY + 18 * DPR + idx * 28 * DPR;
      g.font = `bold ${18 * DPR}px serif`;
      g.textAlign = 'left';
      g.textBaseline = 'middle';
      g.fillStyle = item.color;
      g.fillText(item.icon, legendX, y);
      g.font = `bold ${13 * DPR}px ${tf.fontFamily}`;
      g.fillStyle = COLORS.legendText;
      g.fillText(item.label, legendX + 32 * DPR, y);
    });
    g.restore();
  }, [player, worldSeed, T, tf]);

  if (inline) {
    return (
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        style={{ border: `2px solid ${COLORS.border}`, borderRadius: 4 }}
      />
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 3000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'relative',
          background: COLORS.legendBg,
          border: `2px solid ${COLORS.border}`,
          borderRadius: 4,
          padding: 16,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            background: COLORS.player,
            color: '#fff',
            border: 'none',
            borderRadius: 2,
            padding: '4px 12px',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 'bold',
            boxShadow: '0 2px 8px #000a',
          }}
        >
          Close
        </button>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          style={{ display: 'block', marginTop: 8 }}
        />
      </div>
    </div>
  );
}
