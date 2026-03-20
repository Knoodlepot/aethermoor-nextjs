'use client';

import React from 'react';
import { useTheme, THEMES, type ThemeKey, type TextSize } from '@/components/providers/ThemeProvider';

export type ModelTier = 'haiku' | 'sonnet' | 'opus';

const TIERS: { id: ModelTier; name: string; model: string; cost: number; desc: string; colour: string }[] = [
  { id: 'haiku',  name: 'Haiku',  model: 'claude-haiku-4-5',  cost: 1,  colour: '#4a7a4a', desc: 'Fast and responsive. Great for everyday adventuring — quick narration, snappy combat, smooth exploration.' },
  { id: 'sonnet', name: 'Sonnet', model: 'claude-sonnet-4-6', cost: 4,  colour: '#4a6a9a', desc: 'Richer prose and deeper world-building. Ideal for roleplayers who want more vivid, detailed storytelling.' },
  { id: 'opus',   name: 'Opus',   model: 'claude-opus-4-6',   cost: 20, colour: '#8a4a9a', desc: 'The most powerful model available. Exceptional creative depth, nuanced characters, and complex narrative reasoning.' },
];

const LANGUAGES: { name: string; native: string; warning: string }[] = [
  { name: 'English',    native: 'English',    warning: '' },
  { name: 'French',     native: 'Français',   warning: 'La narration peut ne pas être parfaite à 100 %.' },
  { name: 'Spanish',    native: 'Español',    warning: 'La narración puede no ser 100% precisa.' },
  { name: 'German',     native: 'Deutsch',    warning: 'Die Erzählung ist möglicherweise nicht 100 % korrekt.' },
  { name: 'Italian',    native: 'Italiano',   warning: 'La narrazione potrebbe non essere accurata al 100%.' },
  { name: 'Portuguese', native: 'Português',  warning: 'A narração pode não ser 100% precisa.' },
  { name: 'Dutch',      native: 'Nederlands', warning: 'De vertelling is mogelijk niet 100% correct.' },
  { name: 'Polish',     native: 'Polski',     warning: 'Narracja może nie być w 100% poprawna.' },
  { name: 'Russian',    native: 'Русский',    warning: 'Повествование может быть неточным.' },
  { name: 'Swedish',    native: 'Svenska',    warning: 'Berättelsen kanske inte är 100% korrekt.' },
  { name: 'Norwegian',  native: 'Norsk',      warning: 'Fortellingen er kanskje ikke 100 % korrekt.' },
  { name: 'Danish',     native: 'Dansk',      warning: 'Fortællingen er muligvis ikke 100% korrekt.' },
  { name: 'Japanese',   native: '日本語',      warning: 'ナレーションは100%正確ではない場合があります。' },
  { name: 'Chinese',    native: '中文',        warning: '旁白可能并非100%准确。' },
  { name: 'Korean',     native: '한국어',      warning: '내레이션이 100% 정확하지 않을 수 있습니다.' },
  { name: 'Arabic',     native: 'العربية',    warning: 'قد لا تكون السرد دقيقاً بنسبة 100٪.' },
  { name: 'Hindi',      native: 'हिन्दी',     warning: 'कथन 100% सटीक नहीं हो सकता।' },
  { name: 'Turkish',    native: 'Türkçe',     warning: 'Anlatım %100 doğru olmayabilir.' },
  { name: 'Greek',      native: 'Ελληνικά',   warning: 'Η αφήγηση μπορεί να μην είναι 100% ακριβής.' },
];

const FUN_LANGUAGES: { name: string; native: string; warning: string }[] = [
  { name: 'Latin',         native: 'Latina',        warning: 'Narrator speaks in Classical Latin. Gloriously archaic.' },
  { name: 'Pirate',        native: 'Pirate',        warning: "Arrr! The narrator be speakin' like a salty sea dog." },
  { name: 'Old Norse',     native: 'Norrœnt mál',   warning: 'The narrator speaks in the tongue of the ancient Vikings. Results may be gloriously imperfect.' },
  { name: 'Shakespearean', native: 'Shakespearean', warning: 'Forsooth! The narrator doth speak in the manner of the Bard. Verily.' },
  { name: 'Klingon',       native: 'tlhIngan Hol',  warning: 'nuqneH! The narrator will attempt Klingon. Honour demands it.' },
];

const TEXT_SIZES: { id: TextSize; label: string; desc: string }[] = [
  { id: 'small',  label: 'S', desc: 'Small'  },
  { id: 'medium', label: 'M', desc: 'Medium' },
  { id: 'large',  label: 'L', desc: 'Large'  },
];

const SECTION = { fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: 3, color: '#8a7a5a', marginBottom: 10 } as const;

interface OptionsModalProps {
  currentTier: ModelTier;
  onSelectTier: (tier: ModelTier) => void;
  narrativeNudges: boolean;
  onToggleNudges: (value: boolean) => void;
  onClose: () => void;
}

export function OptionsModal({ currentTier, onSelectTier, narrativeNudges, onToggleNudges, onClose }: OptionsModalProps) {
  const { themeKey, setThemeKey, isDyslexic, setIsDyslexic, textSize, setTextSize, language, setLanguage } = useTheme();
  const [pendingLang, setPendingLang] = React.useState<string | null>(null);
  const selectedLangData = [...LANGUAGES, ...FUN_LANGUAGES].find(l => l.name === (pendingLang ?? language));

  const handleSelectLanguage = (name: string) => {
    setPendingLang(name);
    setLanguage(name);
    // Also sync to player JSON so the narrator uses the same language
    try {
      const raw = localStorage.getItem('rpg-player-slot1');
      const p = raw ? JSON.parse(raw) : {};
      p.language = name;
      localStorage.setItem('rpg-player-slot1', JSON.stringify(p));
    } catch {}
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, overflowY: 'auto' }}
      onClick={onClose}
    >
      <div
        style={{ background: '#13100a', border: '1px solid #2e2515', maxWidth: 520, width: '100%', padding: '24px 20px', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 14, letterSpacing: 4, color: '#c9a84c' }}>OPTIONS</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#5a4a2a', fontSize: 18, cursor: 'pointer' }}>✕</button>
        </div>

        {/* DISPLAY THEME */}
        <div style={SECTION}>DISPLAY THEME</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6, marginBottom: 24 }}>
          {(Object.entries(THEMES) as [ThemeKey, typeof THEMES[ThemeKey]][]).map(([key, theme]) => {
            const active = themeKey === key;
            return (
              <button
                key={key}
                onClick={() => setThemeKey(key)}
                style={{
                  background: active ? '#c9a84c14' : 'transparent',
                  border: `1px solid ${active ? '#c9a84c' : '#2e2515'}`,
                  padding: '10px 12px',
                  cursor: 'pointer',
                  textAlign: 'left' as const,
                  transition: 'all 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                {/* Color swatches */}
                <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                  {theme.preview.map((c, i) => (
                    <span key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c, display: 'inline-block', border: '1px solid rgba(255,255,255,0.15)' }} />
                  ))}
                </div>
                <div>
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, color: active ? '#c9a84c' : '#8a7a5a', letterSpacing: 1 }}>{theme.label}</div>
                  <div style={{ fontSize: 10, color: '#5a4a2a', marginTop: 1, fontFamily: "'Crimson Text',Georgia,serif" }}>{theme.desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* GAMEPLAY */}
        <div style={SECTION}>GAMEPLAY</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #2e2515', padding: '10px 12px' }}>
            <div>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, color: narrativeNudges ? '#c9a84c' : '#8a7a5a', letterSpacing: 1 }}>NARRATIVE NUDGES</div>
              <div style={{ fontSize: 11, color: '#5a4a2a', marginTop: 2, fontFamily: "'Crimson Text',Georgia,serif" }}>NPCs and the world will occasionally remind you of your main quest if you wander too long</div>
            </div>
            <button
              onClick={() => onToggleNudges(!narrativeNudges)}
              style={{ width: 44, height: 24, borderRadius: 12, background: narrativeNudges ? '#4a7a4a' : '#2e2515', border: 'none', cursor: 'pointer', position: 'relative' as const, flexShrink: 0, transition: 'background 0.2s' }}
            >
              <span style={{ position: 'absolute' as const, top: 3, left: narrativeNudges ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', display: 'block' }} />
            </button>
          </div>
        </div>

        {/* ACCESSIBILITY */}
        <div style={SECTION}>ACCESSIBILITY</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>

          {/* Dyslexia font toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #2e2515', padding: '10px 12px' }}>
            <div>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, color: isDyslexic ? '#c9a84c' : '#8a7a5a', letterSpacing: 1 }}>DYSLEXIA-FRIENDLY FONT</div>
              <div style={{ fontSize: 11, color: '#5a4a2a', marginTop: 2, fontFamily: "'Crimson Text',Georgia,serif" }}>Uses OpenDyslexic — wider spacing, distinct letter shapes</div>
            </div>
            <button
              onClick={() => setIsDyslexic(!isDyslexic)}
              style={{
                width: 44,
                height: 24,
                borderRadius: 12,
                background: isDyslexic ? '#4a7a4a' : '#2e2515',
                border: 'none',
                cursor: 'pointer',
                position: 'relative' as const,
                flexShrink: 0,
                transition: 'background 0.2s',
              }}
            >
              <span style={{
                position: 'absolute' as const,
                top: 3,
                left: isDyslexic ? 23 : 3,
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: '#fff',
                transition: 'left 0.2s',
                display: 'block',
              }} />
            </button>
          </div>

          {/* Text size */}
          <div style={{ border: '1px solid #2e2515', padding: '10px 12px' }}>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, color: '#8a7a5a', letterSpacing: 1, marginBottom: 8 }}>NARRATOR TEXT SIZE</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {TEXT_SIZES.map((s) => {
                const active = textSize === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setTextSize(s.id)}
                    style={{
                      flex: 1,
                      padding: '6px 0',
                      background: active ? '#c9a84c22' : 'transparent',
                      border: `1px solid ${active ? '#c9a84c' : '#2e2515'}`,
                      color: active ? '#c9a84c' : '#8a7a5a',
                      cursor: 'pointer',
                      fontFamily: "'Cinzel',serif",
                      fontSize: s.id === 'small' ? 11 : s.id === 'large' ? 15 : 13,
                      letterSpacing: 1,
                      transition: 'all 0.15s',
                    }}
                  >
                    {s.desc}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* AI SELECTION */}
        <div style={SECTION}>AI SELECTION</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          {TIERS.map((t) => {
            const active = currentTier === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onSelectTier(t.id)}
                style={{ background: active ? t.colour + '22' : 'transparent', border: `1px solid ${active ? t.colour : '#2e2515'}`, padding: '10px 12px', cursor: 'pointer', textAlign: 'left' as const, width: '100%', transition: 'all 0.15s' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {active && <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.colour, display: 'inline-block' }} />}
                    <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, color: active ? t.colour : '#8a7a5a', letterSpacing: 1 }}>{t.name}</span>
                    <span style={{ fontSize: 10, color: '#5a4a2a', fontFamily: 'monospace' }}>{t.model}</span>
                  </div>
                  <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, color: active ? t.colour : '#5a4a2a', whiteSpace: 'nowrap' as const }}>{t.cost} {t.cost === 1 ? 'token' : 'tokens'}/turn</span>
                </div>
                <div style={{ fontSize: 12, color: '#8a7a5a', fontFamily: "'Crimson Text',Georgia,serif", lineHeight: 1.4, paddingLeft: active ? 14 : 0 }}>{t.desc}</div>
              </button>
            );
          })}
        </div>

        {/* NARRATOR LANGUAGE */}
        <div style={SECTION}>NARRATOR LANGUAGE</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 12 }}>
          {LANGUAGES.map((l) => {
            const active = (pendingLang ?? language) === l.name;
            return (
              <button
                key={l.name}
                onClick={() => handleSelectLanguage(l.name)}
                style={{
                  background: active ? '#c9a84c22' : 'transparent',
                  border: `1px solid ${active ? '#c9a84c' : '#2e2515'}`,
                  padding: '7px 8px', cursor: 'pointer', textAlign: 'center' as const,
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, color: active ? '#c9a84c' : '#8a7a5a', letterSpacing: 1 }}>{l.name}</div>
                <div style={{ fontSize: 11, color: active ? '#c9a84c' : '#5a4a2a', marginTop: 2 }}>{l.native}</div>
              </button>
            );
          })}
        </div>

        {/* FUN languages */}
        <div style={{ border: '1px solid #2e2515', padding: '10px 10px 8px', marginBottom: 12 }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 3, color: '#5a4a2a', marginBottom: 8 }}>FUN</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {FUN_LANGUAGES.map((l) => {
              const active = (pendingLang ?? language) === l.name;
              return (
                <button
                  key={l.name}
                  onClick={() => handleSelectLanguage(l.name)}
                  style={{
                    background: active ? '#c9a84c22' : 'transparent',
                    border: `1px solid ${active ? '#c9a84c' : '#2e2515'}`,
                    padding: '7px 8px', cursor: 'pointer', textAlign: 'center' as const,
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, color: active ? '#c9a84c' : '#8a7a5a', letterSpacing: 1 }}>{l.name}</div>
                  <div style={{ fontSize: 11, color: active ? '#c9a84c' : '#5a4a2a', marginTop: 2 }}>{l.native}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Warning for non-English */}
        {selectedLangData?.warning && (
          <div style={{ background: '#201808', border: '1px solid #5a3a10', padding: '8px 12px', fontSize: 12, color: '#c9a84c', fontFamily: "'Crimson Text',Georgia,serif", lineHeight: 1.5, marginBottom: 14 }}>
            ⚠ {selectedLangData.warning}
          </div>
        )}

        <div style={{ marginTop: 14, fontSize: 10, color: '#3a2a1a', fontFamily: "'Cinzel',serif", letterSpacing: 1, textAlign: 'center' as const }}>
          SELECTIONS SAVED TO YOUR ACCOUNT
        </div>
      </div>
    </div>
  );
}
