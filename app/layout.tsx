import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

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
        url: '/og-image.png',
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
    images: ['/og-image.png'],
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
        {/* Posthog analytics — only loads when key is set */}
        {process.env.NEXT_PUBLIC_POSTHOG_KEY && (
          <Script id="posthog-init" strategy="afterInteractive">{`
            !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]);t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+" (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys getNextSurveyStep onSessionId setPersonPropertiesForFlags".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
            posthog.init('${process.env.NEXT_PUBLIC_POSTHOG_KEY}', {
              api_host: '${process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com'}',
              person_profiles: 'identified_only',
            });
          `}</Script>
        )}
      </body>
    </html>
  );
}
