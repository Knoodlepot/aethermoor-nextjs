import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { CookieConsent } from '@/components/ui/CookieConsent';

export const metadata: Metadata = {
  title: 'Aethermoor — AI-Powered Browser RPG',
  description:
    'Aethermoor is a dark fantasy RPG narrated in real time by AI. Create your hero, explore a procedurally generated world, join factions, and shape your own legend — all in your browser.',
  metadataBase: new URL('https://aethermoor.com'),
  openGraph: {
    title: 'Aethermoor — AI-Powered Browser RPG',
    description:
      'A dark fantasy RPG narrated in real time by AI. Explore a procedurally generated world, join factions, and shape your legend — free to start.',
    url: 'https://aethermoor.com',
    siteName: 'Aethermoor',
    images: [
      {
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: 'Aethermoor — AI-Powered Browser RPG',
      },
    ],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aethermoor — AI-Powered Browser RPG',
    description:
      'A dark fantasy RPG narrated in real time by AI. Free to start — 50 tokens included.',
    images: ['/api/og'],
  },
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">⚔️</text></svg>',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
        {/* PostHog is initialised on-demand by CookieConsent after user consent */}
        <CookieConsent />
      </body>
    </html>
  );
}
