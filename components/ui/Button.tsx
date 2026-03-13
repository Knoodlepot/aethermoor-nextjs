'use client';

import React from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  style,
  ...props
}: ButtonProps) {
  const { T } = useTheme();

  const baseStyle: React.CSSProperties = {
    padding: size === 'sm' ? '6px 12px' : size === 'lg' ? '12px 24px' : '8px 16px',
    fontSize: size === 'sm' ? 12 : size === 'lg' ? 16 : 14,
    border: `1px solid ${T.border}`,
    borderRadius: 4,
    cursor: 'pointer',
    fontWeight: 600,
    transition: 'all 0.2s ease',
  };

  const variantStyle: React.CSSProperties =
    variant === 'primary'
      ? {
          background: T.choiceColor,
          color: T.bg,
        }
      : variant === 'danger'
        ? {
            background: T.hpColor,
            color: '#fff',
          }
        : {
            background: T.panel,
            color: T.text,
          };

  const [isHovered, setIsHovered] = React.useState(false);
  const hoverStyle = isHovered
    ? variant === 'primary' || variant === 'danger'
      ? { opacity: 0.8 }
      : { background: T.selectedBg }
    : {};

  return (
    <button
      style={{
        ...baseStyle,
        ...variantStyle,
        ...hoverStyle,
        ...style,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {children}
    </button>
  );
}
