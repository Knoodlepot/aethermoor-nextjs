export default function PreviewExpiredPage() {
  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0d0d0f', fontFamily: "'Georgia', serif", padding: '1rem', textAlign: 'center',
    }}>
      <div style={{ maxWidth: '400px' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚔</div>
        <h1 style={{ color: '#c9a96e', fontSize: '1.3rem', fontWeight: 'normal', margin: '0 0 1rem', letterSpacing: '0.05em' }}>
          Aethermoor
        </h1>
        <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
          Your preview session has expired.<br />
          Contact us if you'd like more time to explore.
        </p>
      </div>
    </div>
  );
}
