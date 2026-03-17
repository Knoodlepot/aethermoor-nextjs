'use client';

import React from 'react';

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
];

interface OptionsModalProps {
  currentTier: ModelTier;
  currentLanguage: string;
  onSelectTier: (tier: ModelTier) => void;
  onSelectLanguage: (language: string) => void;
  onClose: () => void;
}

export function OptionsModal({ currentTier, currentLanguage, onSelectTier, onSelectLanguage, onClose }: OptionsModalProps) {
  const [pendingLang, setPendingLang] = React.useState<string | null>(null);
  const selectedLangData = LANGUAGES.find(l => l.name === (pendingLang ?? currentLanguage));

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, overflowY: 'auto' }}
      onClick={onClose}
    >
      <div
        style={{ background: '#13100a', border: '1px solid #2e2515', maxWidth: 500, width: '100%', padding: '24px 20px', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 14, letterSpacing: 4, color: '#c9a84c' }}>OPTIONS</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#5a4a2a', fontSize: 18, cursor: 'pointer' }}>✕</button>
        </div>

        {/* AI SELECTION */}
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: 3, color: '#8a7a5a', marginBottom: 10 }}>AI SELECTION</div>
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
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: 3, color: '#8a7a5a', marginBottom: 10 }}>NARRATOR LANGUAGE</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 12 }}>
          {LANGUAGES.map((l) => {
            const active = (pendingLang ?? currentLanguage) === l.name;
            return (
              <button
                key={l.name}
                onClick={() => { setPendingLang(l.name); onSelectLanguage(l.name); }}
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

        {/* Warning for non-English */}
        {selectedLangData?.warning && (
          <div style={{ background: '#201808', border: '1px solid #5a3a10', padding: '8px 12px', fontSize: 12, color: '#c9a84c', fontFamily: "'Crimson Text',Georgia,serif", lineHeight: 1.5 }}>
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
