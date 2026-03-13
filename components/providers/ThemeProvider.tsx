'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Theme color definitions
export const THEMES = {
  standard: {
    label: 'Standard',
    desc: 'Default fantasy palette',
    preview: ['#f0c060', '#c4873a', '#c03030'],
    dyslexic: false as const,
    gold: '#f0c060',
    accent: '#c4873a',
    hpColor: '#c03030',
    xpColor: '#8060d0',
    choiceColor: '#c4873a',
    systemText: '#4a6040',
    bg: '#0d0a06',
    panel: '#13100a',
    panelAlt: '#0a0805',
    border: '#2e2010',
    text: '#d4b896',
    textMuted: '#9a7a55',
    textFaint: '#6a523c',
    selectedBg: '#1e1508',
    inputBg: '#0a0805',
  },
  deuteranopia: {
    label: 'Deuteranopia (Red-Green)',
    desc: 'Red-green colorblind friendly',
    preview: ['#0173b2', '#de8f05', '#cc78bc'],
    dyslexic: false as const,
    gold: '#0173b2',
    accent: '#de8f05',
    hpColor: '#cc78bc',
    xpColor: '#ca9161',
    choiceColor: '#de8f05',
    systemText: '#4a6040',
    bg: '#0d0a06',
    panel: '#13100a',
    panelAlt: '#0a0805',
    border: '#2e2010',
    text: '#d4b896',
    textMuted: '#9a7a55',
    textFaint: '#6a523c',
    selectedBg: '#1e1508',
    inputBg: '#0a0805',
  },
  protanopia: {
    label: 'Protanopia (Red-Green)',
    desc: 'Red-green colorblind friendly',
    preview: ['#0173b2', '#de8f05', '#cc78bc'],
    dyslexic: false as const,
    gold: '#0173b2',
    accent: '#de8f05',
    hpColor: '#56b4e9',
    xpColor: '#ca9161',
    choiceColor: '#de8f05',
    systemText: '#4a6040',
    bg: '#0d0a06',
    panel: '#13100a',
    panelAlt: '#0a0805',
    border: '#2e2010',
    text: '#d4b896',
    textMuted: '#9a7a55',
    textFaint: '#6a523c',
    selectedBg: '#1e1508',
    inputBg: '#0a0805',
  },
  tritanopia: {
    label: 'Tritanopia (Blue-Yellow)',
    desc: 'Blue-yellow colorblind friendly',
    preview: ['#ee7733', '#0077bb', '#33bbee'],
    dyslexic: false as const,
    gold: '#ee7733',
    accent: '#cc3311',
    hpColor: '#0077bb',
    xpColor: '#33bbee',
    choiceColor: '#ee7733',
    systemText: '#4a6040',
    bg: '#0d0a06',
    panel: '#13100a',
    panelAlt: '#0a0805',
    border: '#2e2010',
    text: '#d4b896',
    textMuted: '#9a7a55',
    textFaint: '#6a523c',
    selectedBg: '#1e1508',
    inputBg: '#0a0805',
  },
  dyslexia: {
    label: 'Dyslexia-Friendly',
    dyslexic: true as const,
    preview: ['#f0c060', '#c4873a', '#c03030'],
    gold: '#f0c060',
    accent: '#c4873a',
    hpColor: '#c03030',
    xpColor: '#8060d0',
    choiceColor: '#c4873a',
    systemText: '#4a6040',
    bg: '#0d0a06',
    panel: '#13100a',
    panelAlt: '#0a0805',
    border: '#2e2010',
    text: '#d4b896',
    textMuted: '#9a7a55',
    textFaint: '#6a523c',
    selectedBg: '#1e1508',
    inputBg: '#0a0805',
  },
};

export type ThemeKey = keyof typeof THEMES;

export interface ThemeContextType {
  T: (typeof THEMES)[ThemeKey];
  themeKey: ThemeKey;
  setThemeKey: (key: ThemeKey) => void;
  tf: {
    fontFamily: string;
    letterSpacing?: string;
  };
  bf: {
    fontFamily: string;
    color: string;
    letterSpacing?: string;
    wordSpacing?: string;
    lineHeight?: number;
    fontSize?: number;
  };
  isDyslexic: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: ThemeKey;
}

export function ThemeProvider({
  children,
  initialTheme = 'standard',
}: ThemeProviderProps) {
  const [themeKey, setThemeKey] = useState<ThemeKey>(initialTheme);
  const T = THEMES[themeKey];
  const isDyslexic = !!T.dyslexic;

  // Font styling
  const tf = {
    fontFamily: "'Cinzel','Palatino Linotype',serif",
    ...(isDyslexic && {
      fontFamily: "'OpenDyslexic',Arial,sans-serif",
      letterSpacing: '0.04em',
    }),
  };

  const bf = {
    fontFamily: "'Crimson Text',Georgia,serif",
    color: T.text,
    ...(isDyslexic && {
      fontFamily: "'OpenDyslexic',Arial,sans-serif",
      letterSpacing: '0.05em',
      wordSpacing: '0.15em',
      lineHeight: 2,
    }),
  };

  // Inject font imports via style tag
  React.useEffect(() => {
    const styleId = 'aethermoor-fonts';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = isDyslexic
      ? `
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap');
        @font-face {
          font-family: 'OpenDyslexic';
          src: url('https://cdn.jsdelivr.net/npm/opendyslexic@0.91.12/OpenDyslexic-Regular.otf') format('opentype');
        }
      `
      : `
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap');
      `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [isDyslexic]);

  const value: ThemeContextType = {
    T,
    themeKey,
    setThemeKey,
    tf,
    bf,
    isDyslexic,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
