'use client';

import React from 'react';
import { useTheme, THEMES, ThemeKey } from '@/components/providers/ThemeProvider';
import { Button } from './Button';

export function ThemeToggle() {
  const { themeKey, setThemeKey, isDyslexic } = useTheme();
  const [showDropdown, setShowDropdown] = React.useState(false);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        🎨 Theme {isDyslexic && '(Dyslexia)'}
      </Button>

      {showDropdown && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 4,
            background: THEMES[themeKey].panel,
            border: `1px solid ${THEMES[themeKey].border}`,
            borderRadius: 4,
            zIndex: 1000,
            minWidth: 200,
          }}
        >
          {(Object.entries(THEMES) as Array<[ThemeKey, any]>).map(
            ([key, theme]) => (
              <button
                key={key}
                onClick={() => {
                  setThemeKey(key);
                  setShowDropdown(false);
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 12px',
                  background: themeKey === key ? theme.selectedBg : 'transparent',
                  border: 'none',
                  color: theme.text,
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: 13,
                }}
              >
                {theme.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
