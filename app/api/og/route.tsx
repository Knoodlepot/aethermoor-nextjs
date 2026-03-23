import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0d0a06',
          fontFamily: 'Georgia, serif',
          position: 'relative',
        }}
      >
        {/* Outer border */}
        <div
          style={{
            position: 'absolute',
            inset: 20,
            border: '1px solid #c9a84c44',
            display: 'flex',
          }}
        />
        {/* Inner border */}
        <div
          style={{
            position: 'absolute',
            inset: 28,
            border: '1px solid #c9a84c22',
            display: 'flex',
          }}
        />

        {/* Corner ornaments */}
        {(['topleft','topright','bottomleft','bottomright'] as const).map((pos) => (
          <div
            key={pos}
            style={{
              position: 'absolute',
              top:    pos.startsWith('top')    ? 14 : undefined,
              bottom: pos.startsWith('bottom') ? 14 : undefined,
              left:   pos.endsWith('left')     ? 14 : undefined,
              right:  pos.endsWith('right')    ? 14 : undefined,
              width: 20,
              height: 20,
              borderTop:    pos.startsWith('top')    ? '2px solid #c9a84c' : undefined,
              borderBottom: pos.startsWith('bottom') ? '2px solid #c9a84c' : undefined,
              borderLeft:   pos.endsWith('left')     ? '2px solid #c9a84c' : undefined,
              borderRight:  pos.endsWith('right')    ? '2px solid #c9a84c' : undefined,
              display: 'flex',
            }}
          />
        ))}

        {/* Sword icon */}
        <div style={{ fontSize: 64, marginBottom: 20, display: 'flex' }}>⚔</div>

        {/* Title */}
        <div
          style={{
            fontSize: 96,
            fontFamily: 'Georgia, serif',
            color: '#c9a84c',
            letterSpacing: 12,
            marginBottom: 12,
            display: 'flex',
          }}
        >
          AETHERMOOR
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 28,
            color: '#8a7a5a',
            letterSpacing: 6,
            marginBottom: 48,
            display: 'flex',
          }}
        >
          AI-POWERED BROWSER RPG
        </div>

        {/* Divider */}
        <div
          style={{
            width: 320,
            height: 1,
            background: '#c9a84c44',
            marginBottom: 40,
            display: 'flex',
          }}
        />

        {/* Feature pills */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 52 }}>
          {['4 Playable Classes', 'Procedural World', '50 Free Tokens'].map((text) => (
            <div
              key={text}
              style={{
                background: '#1a1408',
                border: '1px solid #c9a84c55',
                color: '#d4c5a0',
                padding: '10px 22px',
                fontSize: 18,
                letterSpacing: 2,
                display: 'flex',
              }}
            >
              {text}
            </div>
          ))}
        </div>

        {/* URL */}
        <div
          style={{
            position: 'absolute',
            bottom: 44,
            fontSize: 18,
            color: '#5a4a2a',
            letterSpacing: 4,
            display: 'flex',
          }}
        >
          aethermoor.com
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
