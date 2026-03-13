'use client';

import React from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';

interface InputBarProps {
  player: { context?: string } | null;
  onFreeText: (text: string) => void;
  isLoading: boolean;
  fillInput?: string | null;
}

export function InputBar({ player, onFreeText, isLoading, fillInput }: InputBarProps) {
  const { T, isDyslexic } = useTheme();
  const [text, setText] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  const ff = isDyslexic
    ? "'OpenDyslexic',Arial,sans-serif"
    : "'Crimson Text',Georgia,serif";
  const cin = isDyslexic
    ? "'OpenDyslexic',Arial,sans-serif"
    : "'Cinzel','Palatino Linotype',serif";
  const ctx = player?.context || 'explore';

  React.useEffect(() => {
    if (fillInput) {
      setText(fillInput);
      inputRef.current?.focus();
    }
  }, [fillInput]);

  const submit = () => {
    const t = text.trim();
    if (!t || isLoading) return;
    onFreeText(t);
    setText('');
    inputRef.current?.focus();
  };

  const placeholders: Record<string, string> = {
    combat: isLoading ? 'The dice are cast...' : 'What do you do? (attack, dodge, cast a spell...)',
    town: isLoading ? 'The world stirs...' : 'What do you do?',
    npc: isLoading ? 'They await your words...' : 'What do you say?',
    dungeon: isLoading ? 'The darkness listens...' : 'What do you do?',
    camp: isLoading ? 'The fire crackles...' : 'What do you do?',
    explore: isLoading ? 'The Fates weave your story...' : 'What do you do?',
  };

  return (
    <div style={{ background: T.panelAlt, borderTop: `2px solid ${T.border}`, flexShrink: 0 }}>
      <div style={{ display: 'flex', gap: 8, padding: '10px 10px', alignItems: 'center' }}>
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={placeholders[ctx] || placeholders.explore}
          disabled={isLoading}
          style={{
            flex: 1,
            background: T.inputBg || T.bg,
            border: `1px solid ${T.border}`,
            color: T.text,
            padding: '11px 14px',
            fontSize: isDyslexic ? 15 : 14,
            fontFamily: ff,
            outline: 'none',
            borderRadius: 4,
            opacity: isLoading ? 0.5 : 1,
            letterSpacing: isDyslexic ? '0.05em' : 'normal',
            transition: 'border-color 0.15s',
          }}
          onFocus={(e) => { e.target.style.borderColor = T.accent; }}
          onBlur={(e) => { e.target.style.borderColor = T.border; }}
        />
        <button
          onClick={submit}
          disabled={isLoading || !text.trim()}
          style={{
            background: text.trim() && !isLoading ? T.accent + '22' : 'transparent',
            border: `1px solid ${text.trim() && !isLoading ? T.accent : T.border}`,
            color: text.trim() && !isLoading ? T.gold : T.textFaint,
            padding: '11px 16px',
            cursor: isLoading || !text.trim() ? 'default' : 'pointer',
            fontSize: 16,
            borderRadius: 4,
            transition: 'all 0.15s',
            opacity: isLoading || !text.trim() ? 0.35 : 1,
            fontFamily: cin,
          }}
        >
          ▶
        </button>
      </div>
    </div>
  );
}
