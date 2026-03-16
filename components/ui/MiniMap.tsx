'use client';

import React from 'react';
import { MapView } from '@/components/ui/MapView';
import type { Player, WorldSeed } from '@/lib/types';

interface MiniMapProps {
  player: Player;
  worldSeed: WorldSeed;
  onOpenMap: () => void;
}

// Canvas internal resolution: 920×620. Map content occupies x=0–710; key panel starts at x=725.
// We scale the inner wrapper to 920/710 × container width so the canvas fills the full
// container width showing only the map area — the key panel is clipped by overflow:hidden.
// Height is derived from that scale so the aspect ratio stays correct (≈ square result).
const CANVAS_W = 920;
const MAP_CONTENT_W = 710; // rightmost edge of map content (before key panel gap)
const CANVAS_H = 620;
// Scale factor: we want MAP_CONTENT_W canvas-units to fill 100% of the container width.
// Inner wrapper width = CANVAS_W / MAP_CONTENT_W × 100% ≈ 129.6%
const INNER_W_PCT = (CANVAS_W / MAP_CONTENT_W) * 100; // ~129.6
// At this scale, canvas display height = containerWidth × (CANVAS_H / MAP_CONTENT_W)
// For a 264px container → 264 × 620/710 ≈ 230px tall (nearly square).
const HEIGHT_RATIO = CANVAS_H / MAP_CONTENT_W; // used as padding-top % trick via fixed px

export function MiniMap({ player, worldSeed, onOpenMap }: MiniMapProps) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div style={{ padding: '0 8px 8px' }}>
      {/* Outer clip container — full sidebar width, taller height */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          // paddingTop gives a height proportional to the visible map area
          paddingTop: `${HEIGHT_RATIO * 100}%`,
          overflow: 'hidden',
          borderRadius: 4,
          border: hovered ? '1px solid #c9a84c88' : '1px solid #3a2810',
          cursor: 'pointer',
          transition: 'border-color 0.15s',
          boxShadow: hovered ? '0 0 8px rgba(201,168,76,0.15)' : 'none',
        }}
      >
        {/* Inner wrapper: wider than outer so key panel scrolls off-screen to the right */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: `${INNER_W_PCT}%`,
            height: '100%',
          }}
        >
          <MapView player={player} worldSeed={worldSeed} inline />
        </div>

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
