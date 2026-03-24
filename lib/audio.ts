import { Howl, Howler } from 'howler';

const AMBIENT_TRACKS: Record<string, string> = {
  wilderness: '/Audio/syouki_takahashi-midnight-forest-184304.mp3',
  town:       '/Audio/deuslower-fantasy-medieval-ambient-237371.mp3',
  dungeon:    '/Audio/deuslower-fantasy-medieval-mystery-ambient-292418.mp3',
  tavern:     '/Audio/hitslab-fantasy-fantasy-disney-music-454916.mp3',
  combat:     '/Audio/cyberwave-orchestra-dramatic-orchestral-combat-music-loop-382814.mp3',
};

const SFX_PATH = '/Audio/kenney_interface-sounds/Audio/';

const SFX_TRACKS: Record<string, string> = {
  levelup:        SFX_PATH + 'confirmation_001.ogg',
  quest_complete: SFX_PATH + 'confirmation_002.ogg',
  achievement:    SFX_PATH + 'bong_001.ogg',
  gold:           SFX_PATH + 'pluck_001.ogg',
  click:          SFX_PATH + 'click_001.ogg',
  open:           SFX_PATH + 'open_001.ogg',
  close:          SFX_PATH + 'close_001.ogg',
  error:          SFX_PATH + 'error_001.ogg',
};

const FADE_MS = 2500;
const SETTINGS_KEY = 'ae-audio-settings';

interface AudioSettings {
  musicVolume: number;
  sfxVolume: number;
  muted: boolean;
}

class AudioManager {
  private ambientHowls: Map<string, Howl> = new Map();
  private currentAmbient: string | null = null;
  private musicVolume = 0.35;
  private sfxVolume = 0.7;
  private muted = false;

  private pendingAmbient: string | null = null;

  constructor() {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        const s: AudioSettings = JSON.parse(saved);
        this.musicVolume = s.musicVolume ?? 0.35;
        this.sfxVolume   = s.sfxVolume   ?? 0.7;
        this.muted       = s.muted       ?? false;
        if (this.muted) Howler.mute(true);
      }
    } catch {}

    // Browsers block audio until a user gesture. Resume any pending track on first interaction.
    const unlock = () => {
      if (this.pendingAmbient) {
        const key = this.pendingAmbient;
        this.pendingAmbient = null;
        this.currentAmbient = null; // reset so playAmbient actually fires
        this.playAmbient(key);
      }
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('click', unlock);
    window.addEventListener('keydown', unlock);
  }

  private saveSettings() {
    if (typeof window === 'undefined') return;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({
      musicVolume: this.musicVolume,
      sfxVolume:   this.sfxVolume,
      muted:       this.muted,
    }));
  }

  private getOrCreate(key: string): Howl {
    if (!this.ambientHowls.has(key)) {
      this.ambientHowls.set(key, new Howl({
        src:    [AMBIENT_TRACKS[key]],
        loop:   true,
        volume: 0,
        html5:  true,
      }));
    }
    return this.ambientHowls.get(key)!;
  }

  playAmbient(key: string) {
    if (!AMBIENT_TRACKS[key] || this.currentAmbient === key) return;

    // If AudioContext is suspended (autoplay blocked), queue for unlock
    if ((Howler as any).ctx?.state === 'suspended') {
      this.pendingAmbient = key;
      return;
    }

    const targetVol = this.muted ? 0 : this.musicVolume;

    // Fade out previous track
    if (this.currentAmbient) {
      const prev = this.ambientHowls.get(this.currentAmbient);
      if (prev) {
        prev.fade(prev.volume(), 0, FADE_MS);
        setTimeout(() => prev.stop(), FADE_MS + 100);
      }
    }

    // Fade in new track
    const next = this.getOrCreate(key);
    next.volume(0);
    if (!next.playing()) next.play();
    next.fade(0, targetVol, FADE_MS);
    this.currentAmbient = key;
  }

  stopAmbient() {
    if (!this.currentAmbient) return;
    const prev = this.ambientHowls.get(this.currentAmbient);
    if (prev) {
      prev.fade(prev.volume(), 0, FADE_MS);
      setTimeout(() => prev.stop(), FADE_MS + 100);
    }
    this.currentAmbient = null;
  }

  playSFX(key: string) {
    if (!SFX_TRACKS[key] || this.muted) return;
    const sfx = new Howl({ src: [SFX_TRACKS[key]], volume: this.sfxVolume });
    sfx.play();
  }

  setMusicVolume(v: number) {
    this.musicVolume = Math.max(0, Math.min(1, v));
    if (this.currentAmbient && !this.muted) {
      this.ambientHowls.get(this.currentAmbient)?.volume(this.musicVolume);
    }
    this.saveSettings();
  }

  setSFXVolume(v: number) {
    this.sfxVolume = Math.max(0, Math.min(1, v));
    this.saveSettings();
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    Howler.mute(muted);
    this.saveSettings();
  }

  getMusicVolume() { return this.musicVolume; }
  getSFXVolume()   { return this.sfxVolume; }
  getMuted()       { return this.muted; }
  getCurrentTrack() { return this.currentAmbient; }
}

let _instance: AudioManager | null = null;

export function getAudioManager(): AudioManager {
  if (typeof window === 'undefined') return null as any;
  if (!_instance) _instance = new AudioManager();
  return _instance;
}
