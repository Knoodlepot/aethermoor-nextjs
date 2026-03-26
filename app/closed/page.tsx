export default function ClosedPage() {
  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0d0d0f',
      fontFamily: "'Georgia', serif",
      padding: '1rem',
      textAlign: 'center',
    }}>
      <div style={{ maxWidth: '420px' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚔</div>
        <h1 style={{ color: '#c9a96e', fontSize: '1.4rem', fontWeight: 'normal', margin: '0 0 1rem', letterSpacing: '0.05em' }}>
          Aethermoor
        </h1>
        <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
          The game is currently in closed beta.<br />
          If you received an invite link, follow it to enter.
        </p>
      </div>
    </div>
  );
}
