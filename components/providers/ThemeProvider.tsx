'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
    preview: ['#e8d44d', '#5b9bd5', '#e87d2a'],
    dyslexic: false as const,
    gold: '#e8d44d',
    accent: '#5b9bd5',
    hpColor: '#e87d2a',
    xpColor: '#9b59b6',
    choiceColor: '#5b9bd5',
    systemText: '#5b9bd5',
    bg: '#080c12',
    panel: '#0d1520',
    panelAlt: '#070b10',
    border: '#1a2d45',
    text: '#c8d8e8',
    textMuted: '#7da0c5',
    textFaint: '#4a6488',
    selectedBg: '#101e30',
    inputBg: '#070b10',
  },
  protanopia: {
    label: 'Protanopia (Red-Green)',
    desc: 'Red-green colorblind friendly',
    preview: ['#f5e642', '#4db8e8', '#f5a623'],
    dyslexic: false as const,
    gold: '#f5e642',
    accent: '#4db8e8',
    hpColor: '#f5a623',
    xpColor: '#a855f7',
    choiceColor: '#4db8e8',
    systemText: '#4db8e8',
    bg: '#06080e',
    panel: '#0a0f1a',
    panelAlt: '#060810',
    border: '#152035',
    text: '#d0dce8',
    textMuted: '#7699c2',
    textFaint: '#46607f',
    selectedBg: '#0e1828',
    inputBg: '#060810',
  },
  tritanopia: {
    label: 'Tritanopia (Blue-Yellow)',
    desc: 'Blue-yellow colorblind friendly',
    preview: ['#f0f0f0', '#e85c8a', '#e05020'],
    dyslexic: false as const,
    gold: '#f0f0f0',
    accent: '#e85c8a',
    hpColor: '#e05020',
    xpColor: '#e85c8a',
    choiceColor: '#e85c8a',
    systemText: '#c06050',
    bg: '#0e0808',
    panel: '#160d0d',
    panelAlt: '#0a0606',
    border: '#2e1212',
    text: '#e8d8d0',
    textMuted: '#a67f7f',
    textFaint: '#6b3f3f',
    selectedBg: '#1e0e0e',
    inputBg: '#0a0606',
  },
  dyslexia: {
    label: 'Light (High Contrast)',
    desc: 'Light background, high contrast text',
    dyslexic: false as const,
    preview: ['#b06010', '#c47a20', '#1a6030'],
    gold: '#7a4a08',
    accent: '#b06010',
    hpColor: '#a01818',
    xpColor: '#1a4a90',
    choiceColor: '#8a4a00',
    systemText: '#1a5030',
    bg: '#f5f0e8',
    panel: '#ece6d8',
    panelAlt: '#e4dece',
    border: '#c0a880',
    text: '#1a1208',
    textMuted: '#5f4a2d',
    textFaint: '#9b7d5a',
    selectedBg: '#d8d0bc',
    inputBg: '#f0ece2',
  },
};

export type ThemeKey = keyof typeof THEMES;
export type TextSize = 'small' | 'medium' | 'large';

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
  };
  isDyslexic: boolean;
  setIsDyslexic: (v: boolean) => void;
  textSize: TextSize;
  setTextSize: (v: TextSize) => void;
  narrativeFontSize: number;
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
  const [themeKey, setThemeKeyState] = useState<ThemeKey>(initialTheme);
  const [isDyslexicOverride, setIsDyslexicOverrideState] = useState(false);
  const [textSize, setTextSizeState] = useState<TextSize>('medium');

  // Load persisted preferences from localStorage after mount
  useEffect(() => {
    const storedTheme = localStorage.getItem('rpg-theme') as ThemeKey;
    if (storedTheme && storedTheme in THEMES) setThemeKeyState(storedTheme);

    setIsDyslexicOverrideState(localStorage.getItem('rpg-dyslexic') === '1');

    const storedSize = localStorage.getItem('rpg-textsize') as TextSize;
    if (storedSize === 'small' || storedSize === 'medium' || storedSize === 'large') {
      setTextSizeState(storedSize);
    }
  }, []);

  const setThemeKey = (key: ThemeKey) => {
    setThemeKeyState(key);
    localStorage.setItem('rpg-theme', key);
  };

  const setIsDyslexic = (v: boolean) => {
    setIsDyslexicOverrideState(v);
    localStorage.setItem('rpg-dyslexic', v ? '1' : '0');
  };

  const setTextSize = (v: TextSize) => {
    setTextSizeState(v);
    localStorage.setItem('rpg-textsize', v);
  };

  const T = THEMES[themeKey];
  const isDyslexic = isDyslexicOverride;
  const narrativeFontSize = textSize === 'small' ? 13 : textSize === 'large' ? 18 : 15;

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
    setIsDyslexic,
    textSize,
    setTextSize,
    narrativeFontSize,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
