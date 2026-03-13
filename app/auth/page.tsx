'use client';

import React from 'react';
import { AuthScreen } from '@/components/screens/AuthScreen';

// Reads ?reset=<token> from the URL (used by email reset links)
function getResetToken(): string | null {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get('reset');
}

export default function AuthPage() {
  const [resetToken, setResetToken] = React.useState<string | null>(null);

  React.useEffect(() => {
    setResetToken(getResetToken());
  }, []);

  function handleAuth(data: any) {
    if (data.token) {
      // AuthScreen has already persisted the token via storageSet
      // Redirect to game
      window.location.href = '/game';
    }
  }

  return <AuthScreen onAuth={handleAuth} resetToken={resetToken} />;
}
