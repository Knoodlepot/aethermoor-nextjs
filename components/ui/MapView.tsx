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

export function MapView({
  player,
  worldSeed,
  onClose,
  inline = false,
}: MapViewProps) {
  const { T, tf } = useTheme();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const W = 920;
  const H = 620;
  const MAP_W = 700;
  const MAP_H = 580;
  const MAP_X = 10;
  const MAP_Y = 10;
  const KEY_X = 725;
  const KEY_Y = 20;
  const PAD = 15;

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const g = canvas.getContext('2d');
    if (!g) return;

    // Coordinate transform
    const toScreen = (mx: number, my: number) => ({
      x: MAP_X + PAD + ((mx / 100) * (MAP_W - PAD * 2)) / 2,
      y: MAP_Y + PAD + ((my / 100) * (MAP_H - PAD * 2)) / 2,
    });

    // Draw background
    g.fillStyle = T.panelAlt;
    g.fillRect(0, 0, W, H);

    // Parchment noise effect
    for (let i = 0; i < 600; i++) {
      g.fillStyle = `rgba(0,0,0,${Math.random() * 0.02})`;
      g.fillRect(
        Math.random() * W,
        Math.random() * H,
        Math.random() * 3,
        Math.random() * 3
      );
    }

    // Border
    g.strokeStyle = T.border;
    g.lineWidth = 2;
    g.strokeRect(MAP_X, MAP_Y, MAP_W, MAP_H);

    // Title
    g.fillStyle = T.gold;
    g.font = `bold 18px ${tf.fontFamily}`;
    g.fillText('World Map', 20, 35);

    // Draw settlements
    if (worldSeed.locationGrid) {
      Object.values(worldSeed.locationGrid).forEach((loc: any) => {
        const { x, y, type } = loc;
        const screen = toScreen(x, y);

        // Location marker
        let color = T.text;
        let size = 4;

        if (type === 'capital') {
          color = T.gold;
          size = 7;
        } else if (type === 'city') {
          color = T.accent;
          size = 6;
        } else if (type === 'town') {
          color = T.choiceColor;
          size = 5;
        }

        g.fillStyle = color;
        g.beginPath();
        g.arc(screen.x, screen.y, size, 0, Math.PI * 2);
        g.fill();
      });
    }

    // Player location
    if (player.location) {
      const loc = worldSeed.locationGrid?.[player.location];
      if (loc) {
        const screen = toScreen(loc.x, loc.y);
        g.fillStyle = T.hpColor;
        g.strokeStyle = T.gold;
        g.lineWidth = 2;
        g.beginPath();
        g.arc(screen.x, screen.y, 8, 0, Math.PI * 2);
        g.fill();
        g.stroke();
      }
    }

    // Legend
    g.fillStyle = T.text;
    g.font = `bold 12px ${tf.fontFamily}`;
    g.fillText('Legend:', KEY_X, KEY_Y);

    const legendItems = [
      { label: 'Capital', color: T.gold },
      { label: 'City', color: T.accent },
      { label: 'Town', color: T.choiceColor },
      { label: 'You', color: T.hpColor },
    ];

    legendItems.forEach((item, idx) => {
      const y = KEY_Y + 25 + idx * 18;
      g.fillStyle = item.color;
      g.beginPath();
      g.arc(KEY_X + 5, y, 3, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = T.text;
      g.font = `11px ${tf.fontFamily}`;
      g.fillText(item.label, KEY_X + 15, y + 3);
    });
  }, [player, worldSeed, T, tf]);

  if (inline) {
    return (
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        style={{ border: `1px solid ${T.border}`, borderRadius: 4 }}
      />
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
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
          background: T.panel,
          border: `2px solid ${T.border}`,
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
            background: T.hpColor,
            color: '#fff',
            border: 'none',
            borderRadius: 2,
            padding: '4px 8px',
            cursor: 'pointer',
            fontSize: 12,
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
