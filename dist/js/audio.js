/**
 * audio.js — hybrid custom audio loader (./sound/music/w_1..6.mp3 & ./sound/fx/*.mp3)
 * with automatic fallback to the procedural Web Audio synthesizer & Haptics controller.
 */
import { CONFIG } from './config.js';

const midiToFreq = (m) => 440 * Math.pow(2, (m - 69) / 12);

const SFX_FILES = {
  click: 'click.mp3',
  shoot: 'shoot.mp3',
  hit: 'hit.mp3',
  kill: 'kill.mp3',
  coreHit: 'core_hit.mp3',
  shieldBreak: 'shield_break.mp3',
  shieldUp: 'shield_up.mp3',
  shockwave: 'shockwave.mp3',
  chain: 'chain.mp3',
  blast: 'blast.mp3',
  teleport: 'teleport.mp3',
  healPulse: 'heal.mp3',
  powerup: 'powerup.mp3',
  cardsIn: 'cards_in.mp3',
  pick: 'card_pick.mp3',
  buy: 'buy.mp3',
  comboUp: 'combo_up.mp3',
  bossWarning: 'boss_warning.mp3',
  bossAttack: 'boss_attack.mp3',
  bossDown: 'boss_down.mp3',
  waveClear: 'wave_clear.mp3',
  stageClear: 'stage_clear.mp3',
  record: 'record.mp3',
  achievement: 'achievement.mp3',
  gameOver: 'game_over.mp3',
};

/**
 * 6 Distinct Musical Profiles (fallback when ./sound/music/w_1.mp3 .. w_6.mp3 are not present)
 */
const WORLD_MUSIC = [
  {
    bpm: 124,
    bassWave: 'sawtooth',
    leadWave: 'sawtooth',
    padNotes: [50, 57, 62],
    bassNotes: [38, 38, 50, 38, 41, 41, 53, 41, 45, 45, 57, 45, 43, 43, 55, 45],
    arpNotes: [62, 65, 69, 74, 72, 69, 65, 62, 64, 67, 72, 76, 74, 69, 67, 64],
    bossBass: [38, 38, 37, 38, 41, 41, 40, 41, 35, 35, 34, 35, 33, 33, 36, 37],
    filterBase: 2600,
  },
  {
    bpm: 130,
    bassWave: 'sawtooth',
    leadWave: 'square',
    padNotes: [52, 59, 64],
    bassNotes: [40, 40, 41, 40, 40, 43, 41, 40, 38, 38, 40, 38, 36, 36, 39, 38],
    arpNotes: [64, 65, 68, 71, 72, 71, 68, 65, 62, 64, 67, 71, 68, 65, 64, 60],
    bossBass: [40, 40, 41, 40, 39, 39, 40, 39, 36, 36, 37, 36, 35, 35, 38, 39],
    filterBase: 2400,
  },
  {
    bpm: 118,
    bassWave: 'sawtooth',
    leadWave: 'triangle',
    padNotes: [49, 56, 61],
    bassNotes: [37, 49, 37, 49, 40, 52, 40, 52, 42, 54, 42, 54, 44, 56, 42, 54],
    arpNotes: [61, 64, 68, 73, 76, 73, 68, 64, 66, 69, 73, 78, 75, 72, 68, 63],
    bossBass: [37, 37, 44, 37, 36, 36, 43, 36, 33, 33, 40, 33, 32, 32, 39, 36],
    filterBase: 2800,
  },
  {
    bpm: 128,
    bassWave: 'sawtooth',
    leadWave: 'sawtooth',
    padNotes: [54, 61, 66],
    bassNotes: [42, 42, 54, 42, 45, 45, 57, 45, 47, 47, 59, 47, 49, 49, 61, 49],
    arpNotes: [66, 69, 73, 78, 76, 73, 69, 66, 68, 71, 76, 80, 78, 73, 71, 68],
    bossBass: [42, 42, 41, 42, 45, 45, 44, 45, 40, 40, 39, 40, 37, 37, 40, 41],
    filterBase: 3000,
  },
  {
    bpm: 126,
    bassWave: 'triangle',
    leadWave: 'sawtooth',
    padNotes: [57, 64, 69],
    bassNotes: [45, 45, 57, 45, 41, 41, 53, 41, 48, 48, 60, 48, 43, 43, 55, 43],
    arpNotes: [69, 72, 76, 81, 79, 76, 72, 69, 65, 69, 72, 77, 76, 72, 69, 64],
    bossBass: [45, 45, 44, 45, 41, 41, 40, 41, 38, 38, 37, 38, 40, 40, 43, 44],
    filterBase: 3100,
  },
  {
    bpm: 132,
    bassWave: 'sawtooth',
    leadWave: 'square',
    padNotes: [55, 62, 67],
    bassNotes: [43, 43, 55, 43, 46, 46, 58, 46, 39, 39, 51, 39, 42, 42, 54, 42],
    arpNotes: [67, 70, 74, 79, 78, 74, 70, 67, 63, 67, 70, 75, 74, 70, 66, 62],
    bossBass: [43, 43, 42, 43, 46, 46, 45, 46, 39, 39, 38, 39, 38, 38, 41, 42],
    filterBase: 2900,
  },
];

export class AudioEngine {
  constructor(settings) {
    this.settings = settings;
    this.ctx = null;
    this.comp = null;
    this.sfxGain = null;
    this.musicGain = null;
    this.musicFilter = null;

    this.mode = 'menu';
    this.hidden = false;
    this.worldIdx = 0;
    this.wave = 1;
    this.isBoss = false;

    this.stepIdx = 0;
    this.nextNoteTime = 0;
    this.lastBeatTime = 0;
    this.timer = 0;
    this.lastHitSfx = 0;
    this.lastShootSfx = 0;

    this.customTracks = [];
    this.customSfx = {};
    this.sfxLoadingStarted = false;
    this.initCustomTracks();
    this.initCustomSfxElements();
  }

  /**
   * Loads custom world music from ./sound/music/w_1.mp3 .. w_6.mp3
   * (with fallback check in ./w_1.mp3 if not found in ./sound/music/).
   */
  initCustomTracks() {
    for (let i = 0; i < 6; i++) {
      const name = `w_${i + 1}.mp3`;
      const audio = new Audio();
      audio.loop = true;
      audio.preload = 'auto';
      const entry = { audio, status: 'loading', fallbackStep: 0 };

      const markReady = () => {
        if (entry.status !== 'ready') {
          entry.status = 'ready';
          this.syncCustomMusic();
        }
      };
      audio.addEventListener('canplaythrough', markReady);
      audio.addEventListener('loadeddata', markReady);
      audio.addEventListener('error', () => {
        if (entry.fallbackStep === 0) {
          entry.fallbackStep = 1;
          audio.src = `./${name}`;
        } else {
          entry.status = 'missing';
          this.syncCustomMusic();
        }
      });

      audio.src = `./sound/music/${name}`;
      this.customTracks.push(entry);
    }
  }

  /**
   * Preloads HTMLAudioElement pools for ./sound/fx/*.mp3 and upgrades them
   * to zero-latency Web Audio AudioBuffers as soon as AudioContext is unlocked.
   */
  initCustomSfxElements() {
    for (const [key, file] of Object.entries(SFX_FILES)) {
      const url = `./sound/fx/${file}`;
      const el = new Audio();
      el.preload = 'auto';
      const entry = {
        url,
        status: 'loading',
        buffer: null,
        pool: [el],
        poolIdx: 0,
      };
      el.addEventListener('canplaythrough', () => {
        if (entry.status === 'loading') entry.status = 'ready';
      });
      el.addEventListener('loadeddata', () => {
        if (entry.status === 'loading') entry.status = 'ready';
      });
      el.addEventListener('error', () => {
        if (!entry.buffer) entry.status = 'missing';
      });
      el.src = url;
      this.customSfx[key] = entry;
    }
  }

  decodeCustomSfxBuffers() {
    if (this.sfxLoadingStarted || !this.ctx) return;
    this.sfxLoadingStarted = true;
    for (const entry of Object.values(this.customSfx)) {
      fetch(entry.url)
        .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject()))
        .then((buf) => this.ctx.decodeAudioData(buf))
        .then((decoded) => {
          entry.buffer = decoded;
          entry.status = 'ready';
        })
        .catch(() => {
          /* keep HTMLAudioElement fallback or 'missing' status */
        });
    }
  }

  /**
   * Plays a custom SFX from ./sound/fx/<file>.mp3 if present.
   * Returns true if a custom sound was played, or false to fall back to the synth.
   */
  playCustomSfx(key, vol = 0.85, rate = 1.0) {
    if (this.settings.sound === false || this.hidden) return true;
    const entry = this.customSfx[key];
    if (!entry || entry.status !== 'ready') return false;

    // 1. Hardware-accelerated Web Audio Buffer (zero lag on rapid fire)
    if (entry.buffer && this.ctx && this.ctx.state === 'running') {
      try {
        const src = this.ctx.createBufferSource();
        const g = this.ctx.createGain();
        src.buffer = entry.buffer;
        if (rate !== 1.0) src.playbackRate.value = Math.max(0.5, Math.min(2.0, rate));
        g.gain.value = vol;
        src.connect(g);
        g.connect(this.sfxGain);
        src.onended = () => {
          try { src.disconnect(); g.disconnect(); } catch { /* ignore */ }
        };
        src.start(0);
        return true;
      } catch {
        /* fall through to HTMLAudioElement pool */
      }
    }

    // 2. HTMLAudioElement clone pool (works even on file:// protocol)
    try {
      while (entry.pool.length < 4) {
        const clone = entry.pool[0].cloneNode();
        entry.pool.push(clone);
      }
      const a = entry.pool[entry.poolIdx];
      entry.poolIdx = (entry.poolIdx + 1) % entry.pool.length;
      a.volume = Math.max(0, Math.min(1, vol * 0.85));
      a.playbackRate = Math.max(0.5, Math.min(2.0, rate));
      a.currentTime = 0;
      a.play().catch(() => { });
      return true;
    } catch {
      return false;
    }
  }

  hasCustomTrack(wIdx = this.worldIdx) {
    return this.customTracks[wIdx]?.status === 'ready';
  }

  syncCustomMusic() {
    const musOn = this.settings.music !== false && !this.hidden;
    const modeVol = this.mode === 'play' ? 0.85 : this.mode === 'pause' ? 0.30 : 0.65;
    const usingCustom = this.hasCustomTrack(this.worldIdx);

    for (let i = 0; i < this.customTracks.length; i++) {
      const tr = this.customTracks[i];
      if (!tr || tr.status !== 'ready') continue;
      if (i === this.worldIdx && musOn && usingCustom) {
        tr.audio.volume = modeVol;
        if (tr.audio.paused) {
          tr.audio.play().catch(() => { });
        }
      } else {
        if (!tr.audio.paused) tr.audio.pause();
      }
    }

    if (this.ctx && this.musicGain) {
      const now = this.ctx.currentTime;
      const synthVol = (musOn && !usingCustom) ? modeVol : 0;
      this.musicGain.gain.setTargetAtTime(synthVol, now, 0.06);
    }
  }

  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      try {
        this.ctx = new AC();
      } catch {
        return;
      }

      this.comp = this.ctx.createDynamicsCompressor();
      this.comp.threshold.value = -16;
      this.comp.knee.value = 12;
      this.comp.ratio.value = 3.5;
      this.comp.attack.value = 0.004;
      this.comp.release.value = 0.14;
      this.comp.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();
      this.musicFilter = this.ctx.createBiquadFilter();
      this.musicFilter.type = 'lowpass';
      this.musicFilter.frequency.value = 2600;
      this.musicFilter.Q.value = 1.4;

      this.sfxGain.connect(this.comp);
      this.musicFilter.connect(this.musicGain);
      this.musicGain.connect(this.comp);

      this.applySettings();
      this.decodeCustomSfxBuffers();
      this.nextNoteTime = this.ctx.currentTime + 0.05;
      this.timer = setInterval(() => this.scheduleMusic(), 45);
    }
    if (this.ctx && this.ctx.state === 'suspended' && !this.hidden) {
      this.ctx.resume().catch(() => { });
    }
    this.syncCustomMusic();
  }

  applySettings() {
    if (this.ctx && this.sfxGain) {
      const now = this.ctx.currentTime;
      const sfxOn = this.settings.sound !== false && !this.hidden;
      this.sfxGain.gain.setTargetAtTime(sfxOn ? 0.55 : 0, now, 0.03);
    }
    this.syncCustomMusic();
  }

  setHidden(h) {
    this.hidden = !!h;
    this.syncCustomMusic();
    if (!this.ctx) return;
    if (this.hidden) {
      this.ctx.suspend().catch(() => { });
    } else {
      this.ctx.resume().catch(() => { });
      this.nextNoteTime = this.ctx.currentTime + 0.05;
      this.applySettings();
    }
  }

  setMode(mode) {
    this.mode = mode;
    this.syncCustomMusic();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const prof = WORLD_MUSIC[this.worldIdx] || WORLD_MUSIC[0];
    const cutoff = mode === 'play'
      ? (this.isBoss ? prof.filterBase * 1.35 : prof.filterBase)
      : mode === 'pause' ? 1100 : 1850;
    this.musicFilter.frequency.setTargetAtTime(cutoff, now, 0.12);
    this.applySettings();
  }

  setStage(wIdx) {
    this.worldIdx = Math.max(0, Math.min(WORLD_MUSIC.length - 1, wIdx | 0));
    this.syncCustomMusic();
    if (this.ctx) this.setMode(this.mode);
  }

  setWave(wave, isBoss) {
    this.wave = wave;
    this.isBoss = !!isBoss;
    if (this.ctx) this.setMode(this.mode);
  }

  resetMusic() {
    this.stepIdx = 0;
    this.isBoss = false;
    this.syncCustomMusic();
  }

  pulse() {
    if (this.settings.music === false) {
      return 0.5 + 0.5 * Math.sin(performance.now() * 0.008);
    }
    if (this.hasCustomTrack(this.worldIdx)) {
      const tr = this.customTracks[this.worldIdx]?.audio;
      if (tr && !tr.paused) {
        const beat = (tr.currentTime * (124 / 60)) % 1;
        return Math.max(0, 1 - beat * 2.2);
      }
    }
    if (!this.ctx) {
      return 0.5 + 0.5 * Math.sin(performance.now() * 0.008);
    }
    const elapsed = Math.max(0, this.ctx.currentTime - this.lastBeatTime);
    return Math.max(0, 1 - elapsed * 4.2);
  }

  scheduleMusic() {
    if (this.hidden || this.settings.music === false) return;
    if (this.hasCustomTrack(this.worldIdx)) {
      this.syncCustomMusic();
      return;
    }
    if (!this.ctx || this.ctx.state !== 'running') return;

    const now = this.ctx.currentTime;
    const prof = WORLD_MUSIC[this.worldIdx] || WORLD_MUSIC[0];
    const bpm = prof.bpm + (this.isBoss ? 8 : 0);
    const stepDur = 60 / bpm / 4;

    if (this.nextNoteTime < now - 0.2) this.nextNoteTime = now;

    while (this.nextNoteTime < now + 0.12) {
      this.playStep(this.stepIdx, this.nextNoteTime, stepDur, prof);
      if (this.stepIdx % 4 === 0) this.lastBeatTime = this.nextNoteTime;
      this.stepIdx = (this.stepIdx + 1) % 16;
      this.nextNoteTime += stepDur;
    }
  }

  playStep(step, t, dur, prof) {
    const ctx = this.ctx;
    if (!ctx) return;

    if (step % 4 === 0) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(38, t + 0.13);
      const kickVol = this.mode === 'play' ? 0.85 : 0.55;
      g.gain.setValueAtTime(kickVol, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
      osc.connect(g);
      g.connect(this.musicGain);
      osc.onended = () => { try { osc.disconnect(); g.disconnect(); } catch { /* ignore */ } };
      osc.start(t);
      osc.stop(t + 0.15);
    }

    if (this.mode === 'play' && step % 4 === 2) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(820, t);
      osc.frequency.exponentialRampToValueAtTime(260, t + 0.05);
      g.gain.setValueAtTime(0.22, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.055);
      osc.connect(g);
      g.connect(this.musicFilter);
      osc.onended = () => { try { osc.disconnect(); g.disconnect(); } catch { /* ignore */ } };
      osc.start(t);
      osc.stop(t + 0.06);
    }

    const bassArr = this.isBoss ? prof.bossBass : prof.bassNotes;
    const bassNote = bassArr[step % bassArr.length];
    if (bassNote) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = prof.bassWave;
      osc.frequency.setValueAtTime(midiToFreq(bassNote), t);
      g.gain.setValueAtTime(0.52, t);
      g.gain.exponentialRampToValueAtTime(0.015, t + dur * 0.94);
      osc.connect(g);
      g.connect(this.musicFilter);
      osc.onended = () => { try { osc.disconnect(); g.disconnect(); } catch { /* ignore */ } };
      osc.start(t);
      osc.stop(t + dur);

      const sub = ctx.createOscillator();
      const sg = ctx.createGain();
      sub.type = 'triangle';
      sub.frequency.setValueAtTime(midiToFreq(bassNote + 12), t);
      sg.gain.setValueAtTime(0.32, t);
      sg.gain.exponentialRampToValueAtTime(0.008, t + dur * 0.9);
      sub.connect(sg);
      sg.connect(this.musicFilter);
      sub.onended = () => { try { sub.disconnect(); sg.disconnect(); } catch { /* ignore */ } };
      sub.start(t);
      sub.stop(t + dur);
    }

    if ((step === 0 || step === 8) && prof.padNotes) {
      for (const n of prof.padNotes) {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(midiToFreq(n), t);
        g.gain.setValueAtTime(0.18, t);
        g.gain.exponentialRampToValueAtTime(0.005, t + dur * 7.5);
        osc.connect(g);
        g.connect(this.musicFilter);
        osc.onended = () => { try { osc.disconnect(); g.disconnect(); } catch { /* ignore */ } };
        osc.start(t);
        osc.stop(t + dur * 7.6);
      }
    }

    if (step % 2 === 0 || this.isBoss || this.mode === 'play') {
      const arpNote = prof.arpNotes[step % prof.arpNotes.length] + (this.isBoss ? 12 : 0);
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = prof.leadWave;
      osc.frequency.setValueAtTime(midiToFreq(arpNote), t);
      const arpVol = this.mode === 'play' ? 0.36 : 0.26;
      g.gain.setValueAtTime(arpVol, t);
      g.gain.exponentialRampToValueAtTime(0.008, t + dur * 0.88);
      osc.connect(g);
      g.connect(this.musicFilter);
      osc.onended = () => { try { osc.disconnect(); g.disconnect(); } catch { /* ignore */ } };
      osc.start(t);
      osc.stop(t + dur);
    }
  }

  /* ───────────────────────── Sound Effects (Custom File -> Synth Fallback) ───────────────────────── */

  tone(f0, f1, dur, type = 'sine', vol = 0.28, delay = 0) {
    const ctx = this.ctx;
    if (!ctx || this.settings.sound === false || this.hidden || ctx.state !== 'running') return;
    try {
      const t = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(f0, t);
      if (f1 !== f0) osc.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.connect(g);
      g.connect(this.sfxGain);
      osc.onended = () => { try { osc.disconnect(); g.disconnect(); } catch { /* ignore */ } };
      osc.start(t);
      osc.stop(t + dur + 0.01);
    } catch {
      /* ignore audio scheduling errors */
    }
  }

  click() {
    if (this.playCustomSfx('click', 0.75)) return;
    this.tone(720, 440, 0.035, 'triangle', 0.20);
  }

  shoot() {
    const now = this.ctx ? this.ctx.currentTime : performance.now() / 1000;
    if (now - this.lastShootSfx < 0.045) return;
    this.lastShootSfx = now;
    if (this.playCustomSfx('shoot', 0.80)) return;
    this.tone(540, 175, 0.065, 'triangle', 0.22);
  }

  hit() {
    const now = this.ctx ? this.ctx.currentTime : performance.now() / 1000;
    if (now - this.lastHitSfx < 0.035) return;
    this.lastHitSfx = now;
    if (this.playCustomSfx('hit', 0.70)) return;
    this.tone(240, 110, 0.045, 'sawtooth', 0.18);
  }

  kill(mult = 1, prog = 0) {
    const rate = 1 + (mult - 1) * 0.06 + prog * 0.04;
    if (this.playCustomSfx('kill', 0.85, rate)) return;
    const base = 310 + (mult - 1) * 55 + prog * 35;
    this.tone(base, base * 1.45, 0.085, 'triangle', 0.26);
  }

  coreHit() {
    if (this.playCustomSfx('coreHit', 1.0)) return;
    this.tone(150, 42, 0.28, 'sawtooth', 0.45);
    this.tone(95, 32, 0.32, 'square', 0.32);
  }

  shieldBreak() {
    if (this.playCustomSfx('shieldBreak', 0.90)) return;
    this.tone(680, 180, 0.22, 'sawtooth', 0.30);
  }

  shieldUp() {
    if (this.playCustomSfx('shieldUp', 0.85)) return;
    this.tone(360, 740, 0.18, 'sine', 0.25);
  }

  shockwave() {
    if (this.playCustomSfx('shockwave', 0.90)) return;
    this.tone(220, 55, 0.26, 'sawtooth', 0.30);
  }

  chain() {
    if (this.playCustomSfx('chain', 0.75)) return;
    this.tone(880, 420, 0.07, 'sawtooth', 0.20);
  }

  blast() {
    if (this.playCustomSfx('blast', 0.85)) return;
    this.tone(160, 48, 0.16, 'sawtooth', 0.25);
  }

  teleport() {
    if (this.playCustomSfx('teleport', 0.75)) return;
    this.tone(420, 920, 0.09, 'sine', 0.20);
  }

  healPulse() {
    if (this.playCustomSfx('healPulse', 0.75)) return;
    this.tone(480, 680, 0.12, 'triangle', 0.20);
  }

  powerup() {
    if (this.playCustomSfx('powerup', 0.90)) return;
    this.tone(440, 660, 0.09, 'triangle', 0.25, 0);
    this.tone(660, 990, 0.14, 'triangle', 0.28, 0.07);
  }

  cardsIn() {
    if (this.playCustomSfx('cardsIn', 0.80)) return;
    this.tone(340, 520, 0.09, 'sine', 0.18);
  }

  pick() {
    if (this.playCustomSfx('pick', 0.85)) return;
    this.tone(520, 880, 0.12, 'triangle', 0.28);
  }

  buy() {
    if (this.playCustomSfx('buy', 0.90)) return;
    this.tone(587, 880, 0.09, 'triangle', 0.26, 0);
    this.tone(880, 1174, 0.14, 'triangle', 0.28, 0.07);
  }

  comboUp(mult) {
    const rate = 1 + (mult - 1) * 0.08;
    if (this.playCustomSfx('comboUp', 0.85, rate)) return;
    const f = 400 + mult * 75;
    this.tone(f, f * 1.35, 0.12, 'triangle', 0.26);
  }

  bossWarning() {
    if (this.playCustomSfx('bossWarning', 0.95)) return;
    this.tone(190, 140, 0.28, 'sawtooth', 0.34, 0);
    this.tone(190, 140, 0.28, 'sawtooth', 0.34, 0.34);
  }

  bossAttack() {
    if (this.playCustomSfx('bossAttack', 0.90)) return;
    this.tone(260, 95, 0.16, 'sawtooth', 0.28);
  }

  bossDown() {
    if (this.playCustomSfx('bossDown', 1.0)) return;
    [261, 329, 392, 523, 659].forEach((f, i) => {
      this.tone(f, f * 1.1, 0.22, 'triangle', 0.30, i * 0.08);
    });
  }

  waveClear(perfect) {
    if (this.playCustomSfx('waveClear', 0.90)) return;
    const notes = perfect ? [440, 554, 659, 880] : [392, 493, 587];
    notes.forEach((f, i) => this.tone(f, f, 0.14, 'triangle', 0.26, i * 0.065));
  }

  stageClear() {
    if (this.playCustomSfx('stageClear', 1.0)) return;
    [440, 554, 659, 880, 1108].forEach((f, i) => {
      this.tone(f, f * 1.05, 0.2, 'triangle', 0.32, i * 0.075);
    });
  }

  record() {
    if (this.playCustomSfx('record', 0.95)) return;
    [523, 659, 783, 1046].forEach((f, i) => {
      this.tone(f, f, 0.16, 'triangle', 0.28, i * 0.07);
    });
  }

  achievement() {
    if (this.playCustomSfx('achievement', 0.95)) return;
    [587, 740, 880, 1174].forEach((f, i) => {
      this.tone(f, f, 0.16, 'triangle', 0.28, i * 0.065);
    });
  }

  gameOver() {
    if (this.playCustomSfx('gameOver', 0.95)) return;
    [330, 293, 261, 196].forEach((f, i) => {
      this.tone(f, f * 0.92, 0.24, 'sawtooth', 0.28, i * 0.12);
    });
  }
}

/* ═════════════════════════════════ Haptics ═════════════════════════════════ */

export class Haptics {
  constructor(settings) {
    this.settings = settings;
    this.lastTick = 0;
  }

  buzz(pattern) {
    if (this.settings.vibration === false) return;
    try { navigator.vibrate?.(pattern); } catch { /* ignore */ }
  }

  tick() {
    const now = performance.now() / 1000;
    if (now - this.lastTick < Math.max(0.14, CONFIG.feel.vibrate.killGap)) return;
    this.lastTick = now;
    this.buzz(CONFIG.feel.vibrate.kill);
  }

  damage() { this.buzz(CONFIG.feel.vibrate.damage); }
  waveClear() { this.buzz(CONFIG.feel.vibrate.waveClear); }
  record() { this.buzz(CONFIG.feel.vibrate.record); }
}