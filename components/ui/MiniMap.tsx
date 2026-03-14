'use client';

import React from 'react';
import { MapView } from '@/components/ui/MapView';
import type { Player, WorldSeed } from '@/lib/types';

interface MiniMapProps {
  player: Player;
  worldSeed: WorldSeed;
  onOpenMap: () => void;
}

export function MiniMap({ player, worldSeed, onOpenMap }: MiniMapProps) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div style={{ padding: '0 8px 8px' }}>
      {/* Label */}
      <div style={{
        fontFamily: 'Cinzel, serif',
        fontSize: 9,
        letterSpacing: 1,
        color: '#c9a84c',
        padding: '6px 4px 4px',
        textTransform: 'uppercase',
      }}>
        World Map
      </div>

      {/* Canvas container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 178,
          overflow: 'hidden',
          borderRadius: 4,
          border: hovered ? '1px solid #c9a84c88' : '1px solid #3a2810',
          cursor: 'pointer',
          transition: 'border-color 0.15s',
          boxShadow: hovered ? '0 0 8px rgba(201,168,76,0.15)' : 'none',
        }}
      >
        {/* Inline map — canvas only, no chrome */}
        <MapView player={player} worldSeed={worldSeed} inline />

        {/* Click overlay */}
        <div
          style={{ position: 'absolute', inset: 0 }}
          onClick={onOpenMap}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        />
      </div>
    </div>
  );
}
