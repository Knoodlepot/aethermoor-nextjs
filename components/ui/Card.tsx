'use client';

import React from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  style?: React.CSSProperties;
}

export function Card({ children, title, style }: CardProps) {
  const { T } = useTheme();

  return (
    <div
      style={{
        background: T.panelAlt,
        border: `1px solid ${T.border}`,
        padding: 16,
        marginBottom: 12,
        borderRadius: 4,
        ...style,
      }}
    >
      {title && (
        <div
          style={{
            color: T.gold,
            fontSize: 14,
            fontWeight: 600,
            marginBottom: 12,
          }}
        >
          {title}
        </div>
      )}
      <div style={{ color: T.text }}>{children}</div>
    </div>
  );
}
