'use client';

import React from 'react';

// ── Styles ──────────────────────────────────────────────────────────────────

const S = {
  page: {
    background: '#0d0a06',
    color: '#d4c5a0',
    fontFamily: "'Crimson Text', Georgia, serif",
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  header: {
    background: '#13100a',
    borderBottom: '1px solid #2e2515',
    padding: '14px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
  },
  h1: {
    fontFamily: "'Cinzel', serif",
    color: '#c9a84c',
    fontSize: 18,
    letterSpacing: 4,
    margin: 0,
  },
  subtitle: {
    fontFamily: "'Cinzel', serif",
    fontSize: 9,
    letterSpacing: 3,
    color: '#5a4a2a',
    marginTop: 2,
  },
  tabBar: {
    background: '#13100a',
    borderBottom: '1px solid #2e2515',
    display: 'flex',
    flexShrink: 0,
    padding: '0 24px',
    overflowX: 'auto' as const,
  },
  scrollContent: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '24px 16px 48px',
  },
  card: {
    background: '#13100a',
    border: '1px solid #2e2515',
    padding: '20px 22px',
    marginBottom: 18,
    maxWidth: 720,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  cardTitle: {
    fontFamily: "'Cinzel', serif",
    fontSize: 11,
    letterSpacing: 3,
    color: '#c9a84c',
    marginBottom: 14,
    paddingBottom: 8,
    borderBottom: '1px solid #2e2515',
  },
  label: {
    fontSize: 11,
    color: '#8a7a5a',
    letterSpacing: 1,
    display: 'block' as const,
    marginBottom: 4,
    fontFamily: "'Cinzel', serif",
  },
  input: {
    background: '#0d0a06',
    border: '1px solid #2e2515',
    color: '#d4c5a0',
    padding: '8px 12px',
    fontSize: 13,
    fontFamily: "'Crimson Text', Georgia, serif",
    width: '100%',
    outline: 'none',
  },
  btn: {
    background: 'transparent',
    border: '1px solid #c9a84c',
    color: '#c9a84c',
    padding: '8px 18px',
    fontFamily: "'Cinzel', serif",
    fontSize: 10,
    letterSpacing: 2,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  btnDanger: {
    background: 'transparent',
    border: '1px solid #c04030',
    color: '#c04030',
    padding: '8px 18px',
    fontFamily: "'Cinzel', serif",
    fontSize: 10,
    letterSpacing: 2,
    cursor: 'pointer',
  },
  btnSmall: {
    background: 'transparent',
    border: '1px solid #5a4a2a',
    color: '#8a7a5a',
    padding: '4px 10px',
    fontFamily: "'Cinzel', serif",
    fontSize: 9,
    letterSpacing: 1,
    cursor: 'pointer',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: 12,
  },
  th: {
    fontFamily: "'Cinzel', serif",
    fontSize: 9,
    letterSpacing: 2,
    color: '#8a7a5a',
    textAlign: 'left' as const,
    padding: '6px 8px',
    borderBottom: '1px solid #2e2515',
  },
  td: {
    padding: '7px 8px',
    borderBottom: '1px solid #1a1510',
    fontSize: 12,
    color: '#d4c5a0',
  },
  pill: {
    display: 'inline-block',
    padding: '1px 6px',
    fontSize: 9,
    fontFamily: "'Cinzel', serif",
    letterSpacing: 1,
    border: '1px solid',
    marginLeft: 6,
  },
  row: {
    display: 'flex',
    gap: 12,
    alignItems: 'flex-end',
    flexWrap: 'wrap' as const,
  },
  field: {
    display: 'flex',
    flexDirection: 'column' as const,
    flex: 1,
    minWidth: 120,
  },
  divider: {
    borderTop: '1px solid #2e2515',
    margin: '16px 0',
  },
  stat: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
    flex: 1,
  },
  statVal: {
    fontFamily: "'Cinzel', serif",
    color: '#c9a84c',
    fontSize: 22,
  },
  statLabel: {
    fontSize: 10,
    color: '#8a7a5a',
    marginTop: 2,
  },
  msg: (type: 'ok' | 'err' | 'info') => ({
    padding: '8px 12px',
    fontSize: 12,
    marginTop: 8,
    background: type === 'ok' ? '#102010' : type === 'err' ? '#200808' : '#101820',
    border: `1px solid ${type === 'ok' ? '#408040' : type === 'err' ? '#804040' : '#204060'}`,
    color: type === 'ok' ? '#80c080' : type === 'err' ? '#c08080' : '#80a0c0',
  }),
};

// ── Types ────────────────────────────────────────────────────────────────────

interface GiftEntry { pid: string; amount: number; note: string; ts: string; }
interface ActivePlayer { player_id: string; email: string; api_calls: number; last_active: string; }
interface PlayerProfile {
  player: { player_id: string; tokens: number; total_spent: number; email: string; verified: boolean; created_at: string };
  tokenLog: { id: number; change: number; reason: string; created_at: string }[];
  incidents: { id: number; source: string; reason: string; trigger_text: string; status: string; created_at: string }[];
}

// ── Calculator data ──────────────────────────────────────────────────────────

const PACKAGES = [
  { id: 'starter',    name: 'Starter',    tokens: 75,   price: 1.00  },
  { id: 'adventurer', name: 'Adventurer', tokens: 300,  price: 2.50  },
  { id: 'hero',       name: 'Hero',       tokens: 750,  price: 5.00  },
  { id: 'legend',     name: 'Legend',     tokens: 1500, price: 9.99  },
  { id: 'champion',   name: 'Champion',   tokens: 3500, price: 19.99 },
  { id: 'immortal',   name: 'Immortal',   tokens: 7300, price: 49.99 },
];

const TABS = ['PLAYERS', 'GIFT LOG', 'CALCULATOR', 'SUPPORT', 'SETTINGS', 'DISCORD'];

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) { return n.toFixed(2); }
function fmtDate(s: string) {
  try { return new Date(s).toLocaleString(); } catch { return s; }
}

function parseUnreleased(md: string): string {
  const lines = md.split('\n');
  const start = lines.findIndex((l) => l.startsWith('## [Unreleased]'));
  if (start === -1) return '';
  const end = lines.findIndex((l, i) => i > start && l.startsWith('## ['));
  const section = end === -1 ? lines.slice(start + 1) : lines.slice(start + 1, end);
  return section
    .map((l) => {
      if (l.startsWith('### ')) return `\n**${l.replace('### ', '')}**`;
      if (l.startsWith('- ')) return l;
      return l.trim() ? l : '';
    })
    .filter((l, i, arr) => l !== '' || (i > 0 && arr[i - 1] !== ''))
    .join('\n')
    .trim();
}

// ── Main component ───────────────────────────────────────────────────────────

export default function AdminPage() {
  const [tab, setTab] = React.useState(0);
  const [secret, setSecret] = React.useState('');
  const [unlocked, setUnlocked] = React.useState(false);
  const [lockInput, setLockInput] = React.useState('');
  const [lockErr, setLockErr] = React.useState('');

  // Players tab
  const [minutes, setMinutes] = React.useState(60);
  const [activePlayers, setActivePlayers] = React.useState<ActivePlayer[]>([]);
  const [activeMsg, setActiveMsg] = React.useState('');
  const [lookupId, setLookupId] = React.useState('');
  const [profile, setProfile] = React.useState<PlayerProfile | null>(null);
  const [profileMsg, setProfileMsg] = React.useState('');
  const [giftAmount, setGiftAmount] = React.useState('');
  const [giftNote, setGiftNote] = React.useState('');
  const [giftMsg, setGiftMsg] = React.useState('');
  const [confirmClear, setConfirmClear] = React.useState(false);
  const [clearMsg, setClearMsg] = React.useState('');

  // Gift log
  const [giftLog, setGiftLog] = React.useState<GiftEntry[]>([]);

  // Calculator
  const [calcQty, setCalcQty] = React.useState<Record<string, number>>(
    Object.fromEntries(PACKAGES.map((p) => [p.id, 0]))
  );
  const [calcTok, setCalcTok] = React.useState<Record<string, number>>(
    Object.fromEntries(PACKAGES.map((p) => [p.id, p.tokens]))
  );
  const [calcPrc, setCalcPrc] = React.useState<Record<string, number>>(
    Object.fromEntries(PACKAGES.map((p) => [p.id, p.price]))
  );
  const [stripePct, setStripePct] = React.useState(1.5);
  const [stripeFixed, setStripeFixed] = React.useState(0.20);
  const [breakagePct, setBreakagePct] = React.useState(20);
  const [haikuSplit, setHaikuSplit] = React.useState(0);
  const [gbpRate, setGbpRate] = React.useState(0.80);

  // Support
  const [supportQuery, setSupportQuery] = React.useState('');
  const [supportProfile, setSupportProfile] = React.useState<PlayerProfile | null>(null);
  const [supportMsg, setSupportMsg] = React.useState('');
  const [supportGift, setSupportGift] = React.useState('');
  const [supportGiftNote, setSupportGiftNote] = React.useState('');
  const [supportGiftMsg, setSupportGiftMsg] = React.useState('');

  // Settings
  const [settingsSecret, setSettingsSecret] = React.useState('');
  const [discordWebhook, setDiscordWebhook] = React.useState('');
  const [settingsSaved, setSettingsSaved] = React.useState('');

  // Discord
  const [patchText, setPatchText] = React.useState('');
  const [discordMsg, setDiscordMsg] = React.useState('');
  const [discordLoaded, setDiscordLoaded] = React.useState(false);

  // ── Mount ──────────────────────────────────────────────────────────────────
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    // Security: wipe any secret that leaked into localStorage
    localStorage.removeItem('ae_admin_secret');
    const stored = sessionStorage.getItem('ae_admin_secret') || '';
    if (stored) { setSecret(stored); setUnlocked(true); }
    setSettingsSecret(stored);
    setDiscordWebhook(localStorage.getItem('ae_discord_webhook') || '');
  }, []);

  // ── Auth ───────────────────────────────────────────────────────────────────
  function handleUnlock() {
    if (!lockInput.trim()) { setLockErr('Enter the admin secret.'); return; }
    sessionStorage.setItem('ae_admin_secret', lockInput.trim());
    setSecret(lockInput.trim());
    setSettingsSecret(lockInput.trim());
    setUnlocked(true);
    setLockErr('');
  }

  // ── API helpers ────────────────────────────────────────────────────────────
  async function adminGet(path: string, params: Record<string, string> = {}) {
    const url = new URL(path, window.location.origin);
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
    const res = await fetch(url.toString(), { headers: { 'x-admin-secret': secret } });
    return res.json();
  }

  async function adminPost(path: string, body: Record<string, any>) {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
      body: JSON.stringify(body),
    });
    return res.json();
  }

  // ── Players ────────────────────────────────────────────────────────────────
  async function fetchActivePlayers() {
    setActiveMsg('Loading...');
    const data = await adminGet('/api/admin/active-players', { minutes: String(minutes) });
    if (data.error) { setActiveMsg(`Error: ${data.error}`); return; }
    setActivePlayers(data.players || []);
    setActiveMsg(`${data.count} player(s) active in the last ${data.windowMinutes} min`);
  }

  async function fetchPlayer() {
    if (!lookupId.trim()) return;
    setProfileMsg('Loading...');
    setProfile(null);
    const data = await adminGet('/api/admin/player', { playerId: lookupId.trim() });
    if (data.error) { setProfileMsg(`Error: ${data.error}`); return; }
    setProfile(data);
    setProfileMsg('');
    setConfirmClear(false);
    setGiftMsg('');
    setClearMsg('');
  }

  async function giftTokens() {
    if (!profile || !giftAmount) return;
    const amount = parseInt(giftAmount, 10);
    if (isNaN(amount) || amount <= 0) { setGiftMsg('Enter a valid amount.'); return; }
    const data = await adminPost('/api/admin/add-tokens', {
      secret,
      playerId: profile.player.player_id,
      amount,
      reason: giftNote || 'Admin grant',
    });
    if (data.error) { setGiftMsg(`Error: ${data.error}`); return; }
    setGiftMsg(`✓ Gifted ${amount} tokens`);
    const entry: GiftEntry = {
      pid: profile.player.player_id,
      amount,
      note: giftNote || 'Admin grant',
      ts: new Date().toLocaleString(),
    };
    setGiftLog((l) => [entry, ...l]);
    setGiftAmount('');
    setGiftNote('');
    fetchPlayer();
  }

  async function clearModeration() {
    if (!profile) return;
    const data = await adminPost('/api/admin/clear-moderation', { playerId: profile.player.player_id });
    if (data.error) { setClearMsg(`Error: ${data.error}`); return; }
    setClearMsg(`✓ Cleared ${data.cleared} incident(s)`);
    setConfirmClear(false);
    fetchPlayer();
  }

  // ── Calculator ─────────────────────────────────────────────────────────────
  const calcResults = React.useMemo(() => {
    const SONNET_IN = 3.0, SONNET_OUT = 15.0, HAIKU_IN = 0.8, HAIKU_OUT = 4.0;
    const AVG_INPUT = 4000, AVG_OUTPUT = 400;
    let grossGBP = 0, txCount = 0, totalTokens = 0;
    for (const p of PACKAGES) {
      const qty = calcQty[p.id] || 0;
      const toks = calcTok[p.id] || p.tokens;
      const prc = calcPrc[p.id] || p.price;
      grossGBP += qty * prc;
      txCount += qty;
      totalTokens += qty * toks;
    }
    const grossUSD = grossGBP / gbpRate;
    const stripeFees = txCount > 0 ? (grossGBP * stripePct / 100) + (txCount * stripeFixed) : 0;
    const netGBP = grossGBP - stripeFees;
    const netUSD = netGBP / gbpRate;
    const breakageTokens = Math.floor(totalTokens * breakagePct / 100);
    const activeTokens = totalTokens - breakageTokens;
    const avgCostPerCallUSD =
      ((AVG_INPUT / 1_000_000) * (SONNET_IN * (1 - haikuSplit / 100) + HAIKU_IN * (haikuSplit / 100))) +
      ((AVG_OUTPUT / 1_000_000) * (SONNET_OUT * (1 - haikuSplit / 100) + HAIKU_OUT * (haikuSplit / 100)));
    const apiCalls = activeTokens;
    const totalApiCostUSD = apiCalls * avgCostPerCallUSD;
    const totalApiCostGBP = totalApiCostUSD * gbpRate;
    const profitGBP = netGBP - totalApiCostGBP;
    const profitUSD = profitGBP / gbpRate;
    return { grossGBP, grossUSD, stripeFees, netGBP, netUSD, totalTokens, breakageTokens, activeTokens, totalApiCostUSD, totalApiCostGBP, profitGBP, profitUSD };
  }, [calcQty, calcTok, calcPrc, stripePct, stripeFixed, breakagePct, haikuSplit, gbpRate]);

  // ── Settings save ──────────────────────────────────────────────────────────
  function saveSettings() {
    if (settingsSecret) {
      sessionStorage.setItem('ae_admin_secret', settingsSecret);
      setSecret(settingsSecret);
    }
    if (discordWebhook) localStorage.setItem('ae_discord_webhook', discordWebhook);
    else localStorage.removeItem('ae_discord_webhook');
    setSettingsSaved('Saved.');
    setTimeout(() => setSettingsSaved(''), 2000);
  }

  // ── Discord ────────────────────────────────────────────────────────────────
  async function loadChangelog() {
    setDiscordMsg('Loading...');
    const url = new URL('/api/admin/changelog', window.location.origin);
    url.searchParams.set('secret', secret);
    const res = await fetch(url.toString());
    const data = await res.json();
    if (data.error) { setDiscordMsg(`Error: ${data.error}`); return; }
    setPatchText(parseUnreleased(data.content));
    setDiscordMsg('');
    setDiscordLoaded(true);
  }

  async function postToDiscord() {
    const webhook = discordWebhook || localStorage.getItem('ae_discord_webhook') || '';
    if (!webhook) { setDiscordMsg('No webhook URL set in Settings.'); return; }
    if (!patchText.trim()) { setDiscordMsg('No patch notes to post.'); return; }
    setDiscordMsg('Posting...');
    try {
      const res = await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'Aethermoor Patch Bot', content: patchText }),
      });
      if (res.ok) setDiscordMsg('✓ Posted to Discord!');
      else setDiscordMsg(`Discord error: ${res.status}`);
    } catch { setDiscordMsg('Failed to post to Discord.'); }
  }

  // ── Tab click handler ──────────────────────────────────────────────────────
  function onTabClick(i: number) {
    setTab(i);
    if (i === 5 && !discordLoaded) loadChangelog();
  }

  // ── Lock screen ────────────────────────────────────────────────────────────
  if (!unlocked) {
    return (
      <div style={{ ...S.page, alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ ...S.card, width: '100%', maxWidth: 400, textAlign: 'center' }}>
          <div style={{ fontFamily: "'Cinzel', serif", color: '#c9a84c', fontSize: 22, letterSpacing: 4, marginBottom: 6 }}>⚔️</div>
          <div style={{ ...S.cardTitle, textAlign: 'center', marginBottom: 20 }}>AETHERMOOR ADMIN</div>
          <label style={S.label}>ADMIN SECRET</label>
          <input
            style={{ ...S.input, marginBottom: 12 }}
            type="password"
            value={lockInput}
            onChange={(e) => setLockInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
            placeholder="Enter SESSION_SECRET…"
            autoFocus
          />
          {lockErr && <div style={S.msg('err')}>{lockErr}</div>}
          <button style={{ ...S.btn, marginTop: 12, width: '100%' }} onClick={handleUnlock}>
            UNLOCK
          </button>
        </div>
      </div>
    );
  }

  // ── Tab bar ────────────────────────────────────────────────────────────────
  const TAB_LABELS = [
    'PLAYERS',
    `GIFT LOG${giftLog.length > 0 ? ` (${giftLog.length})` : ''}`,
    'CALCULATOR',
    'SUPPORT',
    'SETTINGS',
    'DISCORD',
  ];

  return (
    <div style={S.page}>
      <div style={S.header}>
        <div>
          <div style={S.h1}>⚔ AETHERMOOR</div>
          <div style={S.subtitle}>ADMIN PANEL</div>
        </div>
        <button style={S.btnSmall} onClick={() => { sessionStorage.clear(); setUnlocked(false); setSecret(''); }}>
          LOCK
        </button>
      </div>

      <div style={S.tabBar}>
        {TAB_LABELS.map((label, i) => (
          <button
            key={i}
            onClick={() => onTabClick(i)}
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 10,
              letterSpacing: 2,
              color: tab === i ? '#c9a84c' : '#5a4a2a',
              background: 'transparent',
              border: 'none',
              borderBottom: `2px solid ${tab === i ? '#c9a84c' : 'transparent'}`,
              padding: '12px 16px 10px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              marginBottom: -1,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── PLAYERS ── */}
      {tab === 0 && (
        <div style={S.scrollContent}>
          {/* Recently Active */}
          <div style={S.card}>
            <div style={S.cardTitle}>RECENTLY ACTIVE</div>
            <div style={S.row}>
              <div style={S.field}>
                <label style={S.label}>TIME WINDOW (MINUTES)</label>
                <input style={S.input} type="number" min={1} max={1440} value={minutes}
                  onChange={(e) => setMinutes(Number(e.target.value))} />
              </div>
              <button style={S.btn} onClick={fetchActivePlayers}>FETCH</button>
            </div>
            {activeMsg && <div style={{ fontSize: 11, color: '#8a7a5a', marginTop: 8 }}>{activeMsg}</div>}
            {activePlayers.length > 0 && (
              <div style={{ overflowX: 'auto', marginTop: 12 }}>
                <table style={S.table}>
                  <thead>
                    <tr>
                      <th style={S.th}>PLAYER ID</th>
                      <th style={S.th}>EMAIL</th>
                      <th style={S.th}>SAVES</th>
                      <th style={S.th}>LAST ACTIVE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activePlayers.map((p) => (
                      <tr key={p.player_id} style={{ cursor: 'pointer' }}
                        onClick={() => { setLookupId(p.player_id); setTab(0); setTimeout(fetchPlayer, 50); }}>
                        <td style={S.td}><span style={{ color: '#c9a84c', fontFamily: 'monospace', fontSize: 11 }}>{p.player_id.slice(0, 12)}…</span></td>
                        <td style={S.td}>{p.email}</td>
                        <td style={S.td}>{(p as any).save_slots ?? '-'}</td>
                        <td style={S.td}>{fmtDate(p.last_active)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Look Up Player */}
          <div style={S.card}>
            <div style={S.cardTitle}>LOOK UP PLAYER</div>
            <div style={S.row}>
              <div style={S.field}>
                <label style={S.label}>PLAYER ID OR EMAIL</label>
                <input style={S.input} type="text" value={lookupId}
                  onChange={(e) => setLookupId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchPlayer()}
                  placeholder="player_… or email@example.com" />
              </div>
              <button style={S.btn} onClick={fetchPlayer}>LOOKUP</button>
            </div>
            {profileMsg && <div style={S.msg('err')}>{profileMsg}</div>}

            {profile && (
              <>
                <div style={S.divider} />
                {/* Stats */}
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
                  <div style={S.stat}><span style={S.statVal}>{profile.player.tokens}</span><span style={S.statLabel}>Tokens</span></div>
                  <div style={S.stat}><span style={S.statVal}>{profile.player.total_spent}</span><span style={S.statLabel}>Total Spent</span></div>
                  <div style={S.stat}>
                    <span style={{ ...S.statVal, fontSize: 14, marginTop: 4 }}>{profile.player.email}</span>
                    <span style={S.statLabel}>Email
                      <span style={{ ...S.pill, borderColor: profile.player.verified ? '#408040' : '#804040', color: profile.player.verified ? '#80c080' : '#c08080' }}>
                        {profile.player.verified ? 'VERIFIED' : 'UNVERIFIED'}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Gift tokens */}
                <div style={S.divider} />
                <div style={{ ...S.cardTitle, fontSize: 10, marginBottom: 10 }}>GIFT TOKENS</div>
                <div style={S.row}>
                  <div style={S.field}>
                    <label style={S.label}>AMOUNT</label>
                    <input style={S.input} type="number" min={1} value={giftAmount}
                      onChange={(e) => setGiftAmount(e.target.value)} placeholder="100" />
                  </div>
                  <div style={{ ...S.field, flex: 2 }}>
                    <label style={S.label}>NOTE (OPTIONAL)</label>
                    <input style={S.input} type="text" value={giftNote}
                      onChange={(e) => setGiftNote(e.target.value)} placeholder="Bug compensation…" />
                  </div>
                  <button style={S.btn} onClick={giftTokens}>GIFT</button>
                </div>
                {giftMsg && <div style={S.msg(giftMsg.startsWith('✓') ? 'ok' : 'err')}>{giftMsg}</div>}

                {/* Clear moderation */}
                {profile.incidents.length > 0 && (
                  <>
                    <div style={S.divider} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 12, color: '#8a7a5a' }}>{profile.incidents.length} moderation incident(s)</span>
                      {confirmClear ? (
                        <>
                          <span style={{ fontSize: 12, color: '#c04030' }}>Clear all?</span>
                          <button style={S.btnDanger} onClick={clearModeration}>CONFIRM</button>
                          <button style={S.btnSmall} onClick={() => setConfirmClear(false)}>CANCEL</button>
                        </>
                      ) : (
                        <button style={S.btnDanger} onClick={() => setConfirmClear(true)}>CLEAR MODERATION</button>
                      )}
                    </div>
                    {clearMsg && <div style={S.msg(clearMsg.startsWith('✓') ? 'ok' : 'err')}>{clearMsg}</div>}
                  </>
                )}

                {/* Token log */}
                {profile.tokenLog.length > 0 && (
                  <>
                    <div style={S.divider} />
                    <div style={{ ...S.cardTitle, fontSize: 10, marginBottom: 8 }}>TOKEN LOG (LAST 20)</div>
                    <table style={S.table}>
                      <thead><tr>
                        <th style={S.th}>CHANGE</th>
                        <th style={S.th}>REASON</th>
                        <th style={S.th}>DATE</th>
                      </tr></thead>
                      <tbody>
                        {profile.tokenLog.map((t) => (
                          <tr key={t.id}>
                            <td style={{ ...S.td, color: t.change >= 0 ? '#80c080' : '#c08080', fontFamily: 'monospace' }}>
                              {t.change >= 0 ? '+' : ''}{t.change}
                            </td>
                            <td style={S.td}>{t.reason}</td>
                            <td style={{ ...S.td, fontSize: 11, color: '#8a7a5a' }}>{fmtDate(t.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}

                {/* Incidents */}
                {profile.incidents.length > 0 && (
                  <>
                    <div style={S.divider} />
                    <div style={{ ...S.cardTitle, fontSize: 10, marginBottom: 8 }}>MODERATION INCIDENTS</div>
                    <table style={S.table}>
                      <thead><tr>
                        <th style={S.th}>STATUS</th>
                        <th style={S.th}>REASON</th>
                        <th style={S.th}>TRIGGER</th>
                        <th style={S.th}>DATE</th>
                      </tr></thead>
                      <tbody>
                        {profile.incidents.map((inc) => (
                          <tr key={inc.id}>
                            <td style={{ ...S.td, color: inc.status === 'red' ? '#c04030' : '#c09030' }}>{inc.status?.toUpperCase()}</td>
                            <td style={S.td}>{inc.reason}</td>
                            <td style={{ ...S.td, fontSize: 11, color: '#8a7a5a', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inc.trigger_text}</td>
                            <td style={{ ...S.td, fontSize: 11, color: '#8a7a5a' }}>{fmtDate(inc.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ── GIFT LOG ── */}
      {tab === 1 && (
        <div style={S.scrollContent}>
          <div style={S.card}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ ...S.cardTitle, marginBottom: 0, flex: 1 }}>SESSION GIFT LOG</div>
              {giftLog.length > 0 && (
                <button style={S.btnSmall} onClick={() => { if (confirm('Clear gift log?')) setGiftLog([]); }}>CLEAR</button>
              )}
            </div>
            {giftLog.length === 0 ? (
              <div style={{ fontSize: 13, color: '#5a4a2a', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>
                No tokens gifted this session.
              </div>
            ) : (
              giftLog.map((g, i) => (
                <div key={i} style={{ borderTop: '1px solid #2e2515', padding: '10px 0', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ color: '#c9a84c', fontFamily: 'monospace', fontSize: 11 }}>{g.pid.slice(0, 16)}…</span>
                  <span style={{ color: '#80c080', fontFamily: "'Cinzel', serif", fontSize: 13 }}>+{g.amount}</span>
                  <span style={{ flex: 1, color: '#8a7a5a', fontSize: 12 }}>{g.note}</span>
                  <span style={{ color: '#5a4a2a', fontSize: 11 }}>{g.ts}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── CALCULATOR ── */}
      {tab === 2 && (
        <div style={S.scrollContent}>
          <div style={S.card}>
            <div style={S.cardTitle}>TOKEN PACKAGES</div>
            <table style={S.table}>
              <thead><tr>
                <th style={S.th}>PACKAGE</th>
                <th style={S.th}>QTY SOLD</th>
                <th style={S.th}>TOKENS</th>
                <th style={S.th}>PRICE (£)</th>
              </tr></thead>
              <tbody>
                {PACKAGES.map((p) => (
                  <tr key={p.id}>
                    <td style={{ ...S.td, fontFamily: "'Cinzel', serif", fontSize: 11, color: '#c9a84c' }}>{p.name}</td>
                    <td style={S.td}>
                      <input style={{ ...S.input, width: 80 }} type="number" min={0} value={calcQty[p.id]}
                        onChange={(e) => setCalcQty((q) => ({ ...q, [p.id]: Number(e.target.value) }))} />
                    </td>
                    <td style={S.td}>
                      <input style={{ ...S.input, width: 80 }} type="number" min={1} value={calcTok[p.id]}
                        onChange={(e) => setCalcTok((t) => ({ ...t, [p.id]: Number(e.target.value) }))} />
                    </td>
                    <td style={S.td}>
                      <input style={{ ...S.input, width: 80 }} type="number" min={0.01} step={0.01} value={calcPrc[p.id]}
                        onChange={(e) => setCalcPrc((t) => ({ ...t, [p.id]: Number(e.target.value) }))} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={S.card}>
            <div style={S.cardTitle}>ASSUMPTIONS</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Stripe Fee %', val: stripePct, set: setStripePct, step: 0.1 },
                { label: 'Stripe Fixed (£)', val: stripeFixed, set: setStripeFixed, step: 0.01 },
                { label: 'Breakage %', val: breakagePct, set: setBreakagePct, step: 1 },
                { label: 'Haiku Split %', val: haikuSplit, set: setHaikuSplit, step: 1 },
                { label: 'USD → GBP Rate', val: gbpRate, set: setGbpRate, step: 0.01 },
              ].map(({ label, val, set, step }) => (
                <div key={label}>
                  <label style={S.label}>{label}</label>
                  <input style={S.input} type="number" step={step} value={val}
                    onChange={(e) => set(Number(e.target.value))} />
                </div>
              ))}
            </div>
          </div>

          <div style={S.card}>
            <div style={S.cardTitle}>RESULTS</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
              {[
                ['Gross Revenue', `£${fmt(calcResults.grossGBP)} / $${fmt(calcResults.grossUSD)}`],
                ['Stripe Fees', `£${fmt(calcResults.stripeFees)}`],
                ['Net After Stripe', `£${fmt(calcResults.netGBP)} / $${fmt(calcResults.netUSD)}`],
                ['Total Tokens Sold', calcResults.totalTokens.toLocaleString()],
                ['Breakage', `${calcResults.breakageTokens.toLocaleString()} tokens`],
                ['Active Tokens', calcResults.activeTokens.toLocaleString()],
                ['Anthropic Cost', `$${fmt(calcResults.totalApiCostUSD)} / £${fmt(calcResults.totalApiCostGBP)}`],
                ['Estimated Profit', `£${fmt(calcResults.profitGBP)} / $${fmt(calcResults.profitUSD)}`],
              ].map(([label, value]) => (
                <React.Fragment key={label as string}>
                  <div style={{ color: '#8a7a5a', fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: 1, alignSelf: 'center' }}>{label}</div>
                  <div style={{ color: '#c9a84c', fontFamily: "'Cinzel', serif", fontSize: 13 }}>{value}</div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── SUPPORT ── */}
      {tab === 3 && (
        <div style={S.scrollContent}>
          <div style={S.card}>
            <div style={S.cardTitle}>PLAYER SUPPORT LOOKUP</div>
            <div style={S.row}>
              <div style={{ ...S.field, flex: 1 }}>
                <label style={S.label}>SEARCH BY EMAIL OR PLAYER ID</label>
                <input style={S.input} type="text" value={supportQuery}
                  onChange={(e) => setSupportQuery(e.target.value)}
                  onKeyDown={async (e) => {
                    if (e.key !== 'Enter' || !supportQuery.trim()) return;
                    setSupportMsg('Loading...');
                    setSupportProfile(null);
                    const data = await adminGet('/api/admin/player', { playerId: supportQuery.trim() });
                    if (data.error) { setSupportMsg(`Not found: ${data.error}`); return; }
                    setSupportProfile(data);
                    setSupportMsg('');
                  }}
                  placeholder="email@example.com or player_…" />
              </div>
              <button style={{ ...S.btn, alignSelf: 'flex-end' }} onClick={async () => {
                if (!supportQuery.trim()) return;
                setSupportMsg('Loading...');
                setSupportProfile(null);
                const data = await adminGet('/api/admin/player', { playerId: supportQuery.trim() });
                if (data.error) { setSupportMsg(`Not found: ${data.error}`); return; }
                setSupportProfile(data);
                setSupportMsg('');
              }}>SEARCH</button>
            </div>
            {supportMsg && <div style={{ marginTop: 10, fontSize: 12, color: supportMsg.startsWith('Not') ? '#c04040' : '#8a7a5a' }}>{supportMsg}</div>}
          </div>

          {supportProfile && (
            <>
              <div style={S.card}>
                <div style={S.cardTitle}>ACCOUNT DETAILS</div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    {([
                      ['Player ID', supportProfile.player.player_id],
                      ['Email', supportProfile.player.email],
                      ['Tokens', supportProfile.player.tokens],
                      ['Total Spent', supportProfile.player.total_spent],
                      ['Verified', supportProfile.player.verified ? 'Yes' : 'No'],
                      ['Registered', fmtDate(supportProfile.player.created_at)],
                    ] as [string, any][]).map(([k, v]) => (
                      <tr key={k}>
                        <td style={{ ...S.td, color: '#8a7a5a', width: 140, fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: 1 }}>{k}</td>
                        <td style={{ ...S.td, fontFamily: 'monospace', fontSize: 12 }}>{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={S.card}>
                <div style={S.cardTitle}>GIFT TOKENS</div>
                <div style={S.row}>
                  <div style={S.field}>
                    <label style={S.label}>AMOUNT</label>
                    <input style={S.input} type="number" min="1" value={supportGift}
                      onChange={(e) => setSupportGift(e.target.value)} placeholder="50" />
                  </div>
                  <div style={{ ...S.field, flex: 2 }}>
                    <label style={S.label}>NOTE</label>
                    <input style={S.input} type="text" value={supportGiftNote}
                      onChange={(e) => setSupportGiftNote(e.target.value)} placeholder="Support compensation" />
                  </div>
                  <button style={{ ...S.btn, alignSelf: 'flex-end' }} onClick={async () => {
                    if (!supportProfile || !supportGift) return;
                    const amount = parseInt(supportGift, 10);
                    if (isNaN(amount) || amount <= 0) { setSupportGiftMsg('Enter a valid amount.'); return; }
                    const data = await adminPost('/api/admin/add-tokens', {
                      secret,
                      playerId: supportProfile.player.player_id,
                      amount,
                      reason: supportGiftNote || 'Support grant',
                    });
                    if (data.error) { setSupportGiftMsg(`Error: ${data.error}`); return; }
                    setSupportGiftMsg(`✓ ${amount} tokens added`);
                    setSupportGift('');
                    setSupportGiftNote('');
                    const refreshed = await adminGet('/api/admin/player', { playerId: supportProfile.player.player_id });
                    if (!refreshed.error) setSupportProfile(refreshed);
                  }}>GIFT</button>
                </div>
                {supportGiftMsg && <div style={{ marginTop: 8, fontSize: 12, color: supportGiftMsg.startsWith('✓') ? '#60a060' : '#c04040' }}>{supportGiftMsg}</div>}
              </div>

              {supportProfile.tokenLog.length > 0 && (
                <div style={S.card}>
                  <div style={S.cardTitle}>RECENT TOKEN HISTORY</div>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={S.th}>CHANGE</th>
                        <th style={S.th}>REASON</th>
                        <th style={S.th}>DATE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {supportProfile.tokenLog.map((t) => (
                        <tr key={t.id}>
                          <td style={{ ...S.td, color: t.change > 0 ? '#60a060' : '#c04040', fontFamily: 'monospace' }}>{t.change > 0 ? '+' : ''}{t.change}</td>
                          <td style={S.td}>{t.reason}</td>
                          <td style={S.td}>{fmtDate(t.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {supportProfile.incidents.length > 0 && (
                <div style={S.card}>
                  <div style={S.cardTitle}>MODERATION INCIDENTS</div>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={S.th}>SOURCE</th>
                        <th style={S.th}>REASON</th>
                        <th style={S.th}>STATUS</th>
                        <th style={S.th}>DATE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {supportProfile.incidents.map((inc) => (
                        <tr key={inc.id}>
                          <td style={S.td}>{inc.source}</td>
                          <td style={S.td}>{inc.reason}</td>
                          <td style={{ ...S.td, color: inc.status === 'blocked' ? '#c04040' : '#c9a84c' }}>{inc.status}</td>
                          <td style={S.td}>{fmtDate(inc.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── SETTINGS ── */}
      {tab === 4 && (
        <div style={S.scrollContent}>
          <div style={S.card}>
            <div style={S.cardTitle}>CONFIGURATION</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={S.label}>ADMIN SECRET (SESSION_SECRET)</label>
                <input style={S.input} type="password" value={settingsSecret}
                  onChange={(e) => setSettingsSecret(e.target.value)}
                  placeholder="Kept in sessionStorage only — not persisted to localStorage" />
                <div style={{ fontSize: 11, color: '#5a4a2a', marginTop: 4 }}>
                  Stored only for this browser tab. Cleared on close.
                </div>
              </div>
              <div>
                <label style={S.label}>DISCORD WEBHOOK URL</label>
                <input style={S.input} type="text" value={discordWebhook}
                  onChange={(e) => setDiscordWebhook(e.target.value)}
                  placeholder="https://discord.com/api/webhooks/…" />
              </div>
              <div>
                <button style={S.btn} onClick={saveSettings}>SAVE</button>
                {settingsSaved && <span style={{ marginLeft: 12, fontSize: 12, color: '#80c080' }}>{settingsSaved}</span>}
              </div>
            </div>
          </div>
          <div style={S.card}>
            <div style={S.cardTitle}>ABOUT</div>
            <div style={{ fontSize: 12, color: '#8a7a5a' }}>API: <span style={{ color: '#c9a84c' }}>{typeof window !== 'undefined' ? window.location.origin : ''}</span></div>
          </div>
        </div>
      )}

      {/* ── DISCORD ── */}
      {tab === 5 && (
        <div style={S.scrollContent}>
          <div style={S.card}>
            <div style={S.cardTitle}>POST PATCH NOTES</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              <button style={S.btn} onClick={loadChangelog}>↺ RELOAD FROM CHANGELOG</button>
              <button style={S.btnSmall} onClick={() => {
                navigator.clipboard.writeText(patchText);
              }}>COPY</button>
            </div>
            <textarea
              style={{ ...S.input, minHeight: 200, resize: 'vertical' as const, lineHeight: 1.6 }}
              value={patchText}
              onChange={(e) => setPatchText(e.target.value)}
              placeholder="Patch notes will load here…"
            />
            {discordMsg && <div style={S.msg(discordMsg.startsWith('✓') ? 'ok' : discordMsg === 'Loading...' ? 'info' : 'err')}>{discordMsg}</div>}
            <div style={{ marginTop: 12 }}>
              <button style={S.btn} onClick={postToDiscord}>POST TO DISCORD</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
