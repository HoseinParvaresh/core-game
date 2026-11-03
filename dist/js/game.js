/**
 * game.js — fixed-timestep loop, 6-World Campaign + Endless Abyssal Mode,
 * 5-Level Chassis upgrades, 18 Upgradable Boss Runes (Lv 1..3),
 * 5-Category Shop (Bullet Skins, Kill FX, Core Auras, Shockwave Styles & Run Boosters),
 * 33-Node Skill Tree effects, Tactical Enemies, and Boss Finale.
 */
import { CONFIG } from './config.js';
import { Core } from './core.js';
import { EnemySystem } from './enemies.js';
import { ProjectileSystem } from './projectiles.js';
import { rollCards, pickStarting } from './upgrades.js';

const TAU = Math.PI * 2;
const CORE_COLOR = '#8ff5ff';
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const lerp = (a, b, t) => a + (b - a) * t;
const angleDiff = (a, b) => { let d = a - b; while (d > Math.PI) d -= TAU; while (d < -Math.PI) d += TAU; return d; };

export class Game {
  constructor({ audio, fx, input, haptics, store, meta, renderer = null }) {
    Object.assign(this, { audio, fx, input, haptics, store, meta, renderer });
    this.listeners = {};
    this.core = new Core(this);
    this.enemies = new EnemySystem(this);
    this.projectiles = new ProjectileSystem(this);
    this.debug = { god: false };

    this.acc = 0;
    this.last = 0;
    this.raf = 0;
    this.pauseFrame = 0;
    this.onFrame = null;
    this.perf = { ema: 16.7, slow: 0, fast: 0, level: 0 };

    this.state = 'menu';
    this.prevState = 'menu';
    this.worldIdx = Math.max(0, Math.min(CONFIG.worlds.length - 1, this.store?.data?.world || 0));
    this.tierIdx = Math.max(0, Math.min(3, this.store?.data?.tier || 0));
    this.chassisIdx = this.store?.data?.chassis || 0;
    this.syncWorldTheme();
    this.resetRun();
  }

  on(evt, fn) { (this.listeners[evt] ||= []).push(fn); }
  emit(evt, data) {
    const list = this.listeners[evt];
    if (list) for (let i = 0; i < list.length; i++) list[i](data);
  }

  /* ───────────────────────── 6 Worlds & 4 Tiers (Easy, Medium, Hard, Endless) ───────────────────────── */

  get worldDef() {
    return CONFIG.worlds[this.worldIdx] || CONFIG.worlds[0];
  }

  get tierDef() {
    const W = this.worldDef;
    return W.tiers[this.tierIdx] || W.tiers[0];
  }

  get isEndless() {
    return !!this.tierDef?.endless;
  }

  get campaignProgress() {
    return this.store.data.campaignProgress | 0;
  }

  isWorldUnlocked(wIdx) {
    return (wIdx * 3) <= this.campaignProgress;
  }

  isTierUnlocked(wIdx, tIdx) {
    if (tIdx === 3) {
      return (wIdx * 3 + 2) <= this.campaignProgress;
    }
    return (wIdx * 3 + tIdx) <= this.campaignProgress;
  }

  isTierCleared(wIdx, tIdx) {
    if (tIdx === 3) return false;
    return (wIdx * 3 + tIdx) < this.campaignProgress;
  }

  setWorld(wIdx) {
    const clamped = Math.max(0, Math.min(CONFIG.worlds.length - 1, wIdx));
    this.worldIdx = clamped;
    if (this.isWorldUnlocked(clamped)) {
      let bestTier = 0;
      for (let t = 0; t < 4; t++) {
        if (this.isTierUnlocked(clamped, t)) bestTier = t;
      }
      if (!this.isTierUnlocked(clamped, this.tierIdx)) {
        this.tierIdx = Math.min(this.tierIdx, bestTier);
      }
      this.store.data.world = this.worldIdx;
      this.store.data.tier = this.tierIdx;
      this.store.save();
    } else {
      this.tierIdx = 0;
    }
    this.syncWorldTheme();
    this.emit('world', this.worldDef);
    return true;
  }

  setTier(tIdx) {
    const clamped = Math.max(0, Math.min(3, tIdx));
    if (!this.isTierUnlocked(this.worldIdx, clamped)) return false;
    this.tierIdx = clamped;
    this.store.data.tier = clamped;
    this.store.save();
    this.emit('tier', this.tierDef);
    return true;
  }

  syncWorldTheme() {
    if (this.audio?.setStage) this.audio.setStage(this.worldIdx);
    if (this.renderer?.setWorldTheme) this.renderer.setWorldTheme(this.worldDef);
  }

  /* ───────────────────────── Core Armory: Chassis, Boss Runes & Shop Cosmetics ───────────────────────── */

  get chassis() {
    return CONFIG.chassis[this.chassisIdx] || CONFIG.chassis[0];
  }

  get chassisLevel() {
    return this.getChassisLevel(this.chassisIdx);
  }

  get maxEquippedRunes() {
    return (CONFIG.maxEquippedRunes || 2) + (this.meta.level('runeSlot') > 0 ? 1 : 0);
  }

  get equippedRunes() {
    return Array.isArray(this.store.data.equippedRunes)
      ? this.store.data.equippedRunes.slice(0, this.maxEquippedRunes)
      : [];
  }

  get runeLevels() {
    return this.store.data.runeLevels || {};
  }

  get equippedBulletSkin() {
    return this.store.data.equippedBulletSkin || 'default';
  }

  get equippedKillEffect() {
    return this.store.data.equippedKillEffect || 'default';
  }

  get equippedCoreAura() {
    return this.store.data.equippedCoreAura || 'default';
  }

  get equippedShockStyle() {
    return this.store.data.equippedShockStyle || 'default';
  }

  refreshCoreLoadout() {
    this.core.reset(
      this.meta.effects(),
      this.chassis,
      this.chassisLevel,
      this.equippedRunes,
      this.runeLevels
    );
  }

  isChassisUnlocked(idx) {
    const ch = CONFIG.chassis[idx];
    if (!ch) return false;
    return ch.cost === 0 || !!(this.store.data.unlockedChassis && this.store.data.unlockedChassis[ch.id]);
  }

  getChassisLevel(idx) {
    const ch = CONFIG.chassis[idx];
    if (!ch) return 1;
    const lv = this.store.data.chassisLevels?.[ch.id] | 0;
    return Math.max(1, Math.min(CONFIG.chassisMaxLevel || 5, lv || 1));
  }

  getChassisUpgradeCost(idx) {
    if (!this.isChassisUnlocked(idx)) return null;
    const lv = this.getChassisLevel(idx);
    const max = CONFIG.chassisMaxLevel || 5;
    if (lv >= max) return null;
    const costs = CONFIG.chassisUpgradeCosts || [120, 240, 420, 700];
    return costs[lv - 1] ?? 500;
  }

  canUpgradeChassis(idx) {
    const cost = this.getChassisUpgradeCost(idx);
    return cost !== null && this.store.data.shards >= cost;
  }

  upgradeChassis(idx) {
    if (!this.canUpgradeChassis(idx)) return false;
    const ch = CONFIG.chassis[idx];
    const cost = this.getChassisUpgradeCost(idx);
    this.store.data.shards -= cost;
    this.store.data.chassisLevels[ch.id] = this.getChassisLevel(idx) + 1;
    this.store.save();
    this.refreshCoreLoadout();
    if (this.getChassisLevel(idx) >= (CONFIG.chassisMaxLevel || 5)) {
      this.unlockAchievement('awakened1');
    }
    return true;
  }

  setChassis(idx) {
    const clamped = Math.max(0, Math.min(CONFIG.chassis.length - 1, idx));
    if (!this.isChassisUnlocked(clamped)) return false;
    this.chassisIdx = clamped;
    this.store.data.chassis = clamped;
    this.store.save();
    this.refreshCoreLoadout();
    this.emit('chassis', this.chassis);
    return true;
  }

  unlockChassis(idx) {
    const ch = CONFIG.chassis[idx];
    if (!ch || this.isChassisUnlocked(idx)) return false;
    if (this.store.data.shards < ch.cost) return false;
    this.store.data.shards -= ch.cost;
    this.store.data.unlockedChassis[ch.id] = 1;
    this.store.data.chassisLevels[ch.id] = Math.max(1, this.store.data.chassisLevels[ch.id] | 0);
    this.store.data.chassis = idx;
    this.chassisIdx = idx;
    this.store.save();
    this.refreshCoreLoadout();

    const allUnlocked = CONFIG.chassis.every((_, i) => this.isChassisUnlocked(i));
    if (allUnlocked) this.unlockAchievement('armoryAll');
    return true;
  }

  /* ───────────────────────── Boss Runes Management & Mastering (Lv 1..3) ───────────────────────── */

  isRuneUnlocked(runeId) {
    return !!(this.store.data.unlockedRunes && this.store.data.unlockedRunes[runeId]);
  }

  isRuneEquipped(runeId) {
    return this.equippedRunes.includes(runeId);
  }

  getRuneLevel(runeId) {
    const lv = this.store.data.runeLevels?.[runeId] | 0;
    return Math.max(1, Math.min(CONFIG.runeMaxLevel || 3, lv || 1));
  }

  getRuneUpgradeCost(runeId) {
    if (!this.isRuneUnlocked(runeId)) return null;
    const lv = this.getRuneLevel(runeId);
    const max = CONFIG.runeMaxLevel || 3;
    if (lv >= max) return null;
    const costs = CONFIG.runeUpgradeCosts || [180, 380];
    return costs[lv - 1] ?? 380;
  }

  canUpgradeRune(runeId) {
    const cost = this.getRuneUpgradeCost(runeId);
    return cost !== null && this.store.data.shards >= cost;
  }

  upgradeRune(runeId) {
    if (!this.canUpgradeRune(runeId)) return false;
    const cost = this.getRuneUpgradeCost(runeId);
    this.store.data.shards -= cost;
    this.store.data.runeLevels[runeId] = this.getRuneLevel(runeId) + 1;
    this.store.save();
    this.refreshCoreLoadout();
    return true;
  }

  toggleRune(runeId) {
    if (!this.isRuneUnlocked(runeId)) return false;
    const list = [...this.equippedRunes];
    const idx = list.indexOf(runeId);
    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      const cap = this.maxEquippedRunes;
      if (list.length >= cap) list.shift();
      list.push(runeId);
    }
    this.store.data.equippedRunes = list;
    this.store.save();
    this.refreshCoreLoadout();
    return true;
  }

  unlockBossRune(bossIdx) {
    const rune = CONFIG.runes?.find((r) => r.bossIdx === bossIdx);
    if (!rune || this.isRuneUnlocked(rune.id)) return null;
    this.store.data.unlockedRunes[rune.id] = 1;
    this.store.data.runeLevels[rune.id] = Math.max(1, this.store.data.runeLevels[rune.id] | 0);
    const cap = this.maxEquippedRunes;
    if (this.store.data.equippedRunes.length < cap && !this.store.data.equippedRunes.includes(rune.id)) {
      this.store.data.equippedRunes.push(rune.id);
    }
    this.store.save();
    return rune;
  }

  /* ───────────────────────── 5-Category Shop Management ───────────────────────── */

  isBulletSkinUnlocked(id) {
    const sk = CONFIG.cosmetics?.bulletSkins?.find((x) => x.id === id);
    if (!sk) return false;
    return sk.cost === 0 || !!(this.store.data.unlockedBulletSkins && this.store.data.unlockedBulletSkins[id]);
  }

  unlockBulletSkin(id) {
    const sk = CONFIG.cosmetics?.bulletSkins?.find((x) => x.id === id);
    if (!sk || this.isBulletSkinUnlocked(id) || this.store.data.shards < sk.cost) return false;
    this.store.data.shards -= sk.cost;
    this.store.data.unlockedBulletSkins[id] = 1;
    this.store.data.equippedBulletSkin = id;
    this.store.save();
    return true;
  }

  setBulletSkin(id) {
    if (!this.isBulletSkinUnlocked(id)) return false;
    this.store.data.equippedBulletSkin = id;
    this.store.save();
    return true;
  }

  isKillEffectUnlocked(id) {
    const ef = CONFIG.cosmetics?.killEffects?.find((x) => x.id === id);
    if (!ef) return false;
    return ef.cost === 0 || !!(this.store.data.unlockedKillEffects && this.store.data.unlockedKillEffects[id]);
  }

  unlockKillEffect(id) {
    const ef = CONFIG.cosmetics?.killEffects?.find((x) => x.id === id);
    if (!ef || this.isKillEffectUnlocked(id) || this.store.data.shards < ef.cost) return false;
    this.store.data.shards -= ef.cost;
    this.store.data.unlockedKillEffects[id] = 1;
    this.store.data.equippedKillEffect = id;
    this.store.save();
    return true;
  }

  setKillEffect(id) {
    if (!this.isKillEffectUnlocked(id)) return false;
    this.store.data.equippedKillEffect = id;
    this.store.save();
    return true;
  }

  isCoreAuraUnlocked(id) {
    const au = CONFIG.cosmetics?.coreAuras?.find((x) => x.id === id);
    if (!au) return false;
    return au.cost === 0 || !!(this.store.data.unlockedCoreAuras && this.store.data.unlockedCoreAuras[id]);
  }

  unlockCoreAura(id) {
    const au = CONFIG.cosmetics?.coreAuras?.find((x) => x.id === id);
    if (!au || this.isCoreAuraUnlocked(id) || this.store.data.shards < au.cost) return false;
    this.store.data.shards -= au.cost;
    this.store.data.unlockedCoreAuras[id] = 1;
    this.store.data.equippedCoreAura = id;
    this.store.save();
    return true;
  }

  setCoreAura(id) {
    if (!this.isCoreAuraUnlocked(id)) return false;
    this.store.data.equippedCoreAura = id;
    this.store.save();
    return true;
  }

  isShockStyleUnlocked(id) {
    const st = CONFIG.cosmetics?.shockStyles?.find((x) => x.id === id);
    if (!st) return false;
    return st.cost === 0 || !!(this.store.data.unlockedShockStyles && this.store.data.unlockedShockStyles[id]);
  }

  unlockShockStyle(id) {
    const st = CONFIG.cosmetics?.shockStyles?.find((x) => x.id === id);
    if (!st || this.isShockStyleUnlocked(id) || this.store.data.shards < st.cost) return false;
    this.store.data.shards -= st.cost;
    this.store.data.unlockedShockStyles[id] = 1;
    this.store.data.equippedShockStyle = id;
    this.store.save();
    return true;
  }

  setShockStyle(id) {
    if (!this.isShockStyleUnlocked(id)) return false;
    this.store.data.equippedShockStyle = id;
    this.store.save();
    return true;
  }

  isBoosterActive(id) {
    return !!(this.store.data.activeBoosters && this.store.data.activeBoosters[id]);
  }

  buyBooster(id) {
    const b = CONFIG.cosmetics?.boosters?.find((x) => x.id === id);
    if (!b || this.isBoosterActive(id) || this.store.data.shards < b.cost) return false;
    this.store.data.shards -= b.cost;
    this.store.data.activeBoosters[id] = 1;
    this.store.save();
    return true;
  }

  addFreeShards(amount = 1000) {
    this.store.data.shards += amount;
    this.store.data.stats.totalShards += amount;
    this.store.save();
    return this.store.data.shards;
  }

  /* ───────────────────────── achievements ───────────────────────── */

  unlockAchievement(id) {
    const achMap = this.store.data.achievements;
    if (!achMap || achMap[id]) return false;
    const def = CONFIG.achievements.find((a) => a.id === id);
    if (!def) return false;
    achMap[id] = 1;
    this.store.data.shards += def.reward;
    this.store.data.stats.totalShards += def.reward;
    this.store.save();
    if (this.audio.achievement) this.audio.achievement();
    this.haptics.record();
    this.emit('banner', { text: def.name, sub: `Achievement · +${def.reward} Shards`, kind: 'record' });
    return true;
  }

  /* ───────────────────────── run lifecycle ───────────────────────── */

  resetRun() {
    this.time = 0;
    this.score = 0;
    this.kills = 0;
    this.wave = 0;
    this.maxWaves = this.tierDef.waves;
    this.phase = 'break';
    this.breakT = 0;
    this.clearT = 0;
    this.waveT = 0;
    this.plan = [];
    this.planIdx = 0;
    this.isBossWave = false;
    this.currentBossIdx = 0;
    this.anomaly = null;
    this.stormT = 0;
    this.waveHit = false;
    this.perfectWaves = 0;
    this.bonusShards = 0;
    this.runShardBoost = 1;
    this.rerollsLeft = 1;
    this.bannerPending = false;
    this.waveScale = { hp: 1, speed: 1 };
    this.combo = { chain: 0, mult: 1, progress: 0, timer: 0, decay: 0 };
    this.pendingCards = null;
    this.coreDead = false;
    this.dying = false;
    this.winning = false;
    this.victory = false;
    this.unlockedNextLabel = '';
    this.deathT = 0;
    this.celebrate = 0;
    this.finalized = false;
    this.recordShown = false;
    this.startBest = 0;
    this.timeScale = 1;
    this.slowT = 0;
    this.slowDur = 1;
    this.slowScale = 1;
    this.acc = 0;

    this.gatewayA = 0;
    this.gatewayAngles = [0, Math.PI];
    this.gravityWell = null;
    this.gravityTimer = CONFIG.arena.gravity.interval * 0.6;
    this.wormholeA = 0;
    const wr = CONFIG.arena.wormhole.orbitRadius || 132;
    this.wormholes = [
      { x: wr, y: 0 },
      { x: -wr, y: 0 },
    ];
  }

  startRun() {
    if (!this.isTierUnlocked(this.worldIdx, this.tierIdx)) return false;
    if (!this.isChassisUnlocked(this.chassisIdx)) {
      this.chassisIdx = 0;
    }
    this.syncWorldTheme();
    this.resetRun();
    this.enemies.clear();
    this.projectiles.clear();
    this.fx.clear();
    this.input.reset();
    this.startBest = this.store.data.stats.bestScore;

    const fx = { ...this.meta.effects() };
    const boosters = this.store.data.activeBoosters || {};
    let extraStartCards = 0;

    if (boosters.boost_overcharge) {
      fx.damage = (fx.damage || 0) + 0.35;
      fx.fireRate = (fx.fireRate || 0) + 0.20;
      boosters.boost_overcharge = 0;
    }
    if (boosters.boost_aegis) {
      fx.hp = (fx.hp || 0) + 2;
      fx.aegisStart = Math.max(1, fx.aegisStart || 0);
      boosters.boost_aegis = 0;
    }
    if (boosters.boost_shards) {
      this.runShardBoost = 1.5;
      boosters.boost_shards = 0;
    }
    if (boosters.boost_headstart) {
      extraStartCards = 2;
      boosters.boost_headstart = 0;
    }
    this.store.save();

    this.rerollsLeft = fx.rerolls || 1;
    this.core.reset(fx, this.chassis, this.chassisLevel, this.equippedRunes, this.runeLevels);
    const totalStartCards = Math.round(fx.startUpgrades || 0) + extraStartCards;
    for (const id of pickStarting(totalStartCards)) this.core.addUpgrade(id, 1);

    this.state = 'play';
    this.prevState = 'play';
    this.audio.setMode('play');
    this.beginWave(1);
    this.emit('state', this.state);
    return true;
  }

  toMenu() {
    this.worldIdx = Math.max(0, Math.min(CONFIG.worlds.length - 1, this.store?.data?.world || 0));
    this.syncWorldTheme();
    this.state = 'menu';
    this.prevState = 'menu';
    this.resetRun();
    this.enemies.clear();
    this.projectiles.clear();
    this.fx.clear();
    this.input.reset();
    this.refreshCoreLoadout();
    this.audio.setMode('menu');
    this.audio.resetMusic();
    this.emit('state', this.state);
  }

  quitToMenu() {
    const active = ['play', 'cards', 'paused'].includes(this.state);
    const summary = active ? this.finalizeRun() : null;
    this.toMenu();
    return summary;
  }

  restart() {
    if (this.state !== 'paused') return;
    this.finalizeRun();
    this.startRun();
  }

  pause() {
    if (this.state !== 'play' && this.state !== 'cards') return false;
    this.prevState = this.state;
    this.state = 'paused';
    this.core.firing = false;
    this.input.reset();
    this.audio.setMode('pause');
    this.emit('state', this.state);
    return true;
  }

  resume() {
    if (this.state !== 'paused') return false;
    this.state = this.prevState;
    this.acc = 0;
    this.last = performance.now() / 1000;
    this.input.reset();
    this.audio.setMode('play');
    this.emit('state', this.state);
    return true;
  }

  autoPause() { if (this.state === 'play') this.pause(); }

  finalizeRun() {
    if (this.finalized) return null;
    this.finalized = true;
    const st = this.store.data.stats;
    const wave = Math.max(0, this.phase === 'break' && this.state !== 'over' ? this.wave - 1 : this.wave);
    const prevScore = st.bestScore, prevWave = st.bestWave;
    const baseShards = this.meta.shardsFor(this.score, wave);
    const wMult = this.worldDef.shardMult || 1;
    const rawShards = Math.round(baseShards * wMult * (this.core.stats.scoreMult || 1)) + this.bonusShards;
    const shards = Math.round(rawShards * (this.runShardBoost || 1));
    st.totalRuns += 1;
    st.totalKills += this.kills;
    st.totalShards += shards;
    this.store.data.shards += shards;
    const newScore = this.score > prevScore, newWave = wave > prevWave;
    if (newScore) st.bestScore = this.score;
    if (newWave) st.bestWave = wave;
    if (this.isEndless && wave > (st.endlessBestWave || 0)) {
      st.endlessBestWave = wave;
    }
    this.store.save();
    return {
      score: this.score,
      wave,
      maxWaves: this.maxWaves,
      kills: this.kills,
      shards,
      newScore,
      newWave,
      victory: this.victory,
      worldName: this.worldDef.name,
      tierName: this.tierDef.name,
      unlockedNextLabel: this.unlockedNextLabel,
      bestScore: st.bestScore,
      bestWave: st.bestWave,
      perfectWaves: this.perfectWaves,
    };
  }

  /* ───────────────────────── main loop ───────────────────────── */

  start() {
    if (this.raf) return;
    this.last = performance.now() / 1000;
    const loop = (t) => { this.raf = requestAnimationFrame(loop); this.frame(t / 1000); };
    this.raf = requestAnimationFrame(loop);
  }

  frame(now) {
    let dt = now - this.last;
    this.last = now;
    if (dt > CONFIG.loop.maxFrame) dt = CONFIG.loop.maxFrame;
    if (dt < 0) dt = 0;
    this.watchPerformance(dt);
    if (this.state === 'paused' && (this.pauseFrame = (this.pauseFrame + 1) % 3) !== 0) return;

    const step = CONFIG.loop.step;
    this.acc += dt;
    let n = 0;
    while (this.acc >= step && n < 2) {
      this.step(step);
      this.acc -= step;
      n++;
    }
    if (n === 2) this.acc = 0;
    const moving = this.state === 'play' || this.state === 'over';
    if (this.renderer) this.renderer.render(this, moving ? this.acc * this.timeScale : 0);
    if (this.onFrame) this.onFrame(dt);
  }

  watchPerformance(dt) {
    const p = this.perf, ms = dt * 1000;
    p.ema += (ms - p.ema) * 0.05;
    if (this.state !== 'play') { p.slow = p.fast = 0; return; }
    if (p.ema > 22) { p.slow += dt; p.fast = 0; }
    else if (p.ema < 17.5) { p.fast += dt; p.slow = 0; }
    else p.slow = p.fast = 0;
    if (p.slow > 1.5 && p.level < 2) { p.level++; p.slow = 0; this.fx.density = [1, 0.6, 0.35][p.level]; }
    else if (p.slow > 3 && p.level >= 2) { p.slow = 0; if (this.renderer) this.renderer.lowerResolution(); }
    else if (p.fast > 8 && p.level > 0) { p.level--; p.fast = 0; this.fx.density = [1, 0.6, 0.35][p.level]; }
  }

  step(rdt) {
    if (this.slowT > 0) {
      this.slowT -= rdt;
      const k = 1 - Math.max(0, this.slowT) / this.slowDur;
      this.timeScale = lerp(this.slowScale, 1, easeOutCubic(Math.min(1, k)));
    } else this.timeScale = 1;
    const dt = rdt * this.timeScale;

    switch (this.state) {
      case 'play': this.updatePlay(dt); break;
      case 'over': this.updateOver(dt, rdt); break;
      case 'cards':
      case 'menu': this.fx.update(dt); break;
      default: break;
    }
  }

  updatePlay(dt) {
    this.time += dt;
    this.updateArenaMechanics(dt);
    this.core.update(dt, true);
    this.updateDirector(dt);
    this.enemies.update(dt);
    this.projectiles.update(dt);
    this.enemies.sweep();
    this.updateCombo(dt);
    this.fx.update(dt);
  }

  updateArenaMechanics(dt) {
    if (this.worldIdx === 0 || this.isEndless) {
      this.gatewayA = (this.gatewayA + CONFIG.arena.gateways.speed * dt) % TAU;
      this.gatewayAngles[0] = this.gatewayA;
      this.gatewayAngles[1] = (this.gatewayA + Math.PI) % TAU;
    }
    if ((this.worldIdx === 2 || (this.isEndless && this.wave >= 6)) && this.phase === 'wave') {
      const GW = CONFIG.arena.gravity;
      if (this.gravityWell) {
        this.gravityWell.life -= dt;
        if (this.gravityWell.life <= 0) this.gravityWell = null;
      } else {
        this.gravityTimer -= dt;
        if (this.gravityTimer <= 0 && this.enemies.alive > 0) {
          this.gravityTimer = GW.interval;
          const a = Math.random() * TAU;
          const dist = 135 + Math.random() * 65;
          this.gravityWell = {
            x: Math.cos(a) * dist,
            y: Math.sin(a) * dist,
            r: GW.radius,
            life: GW.duration,
            max: GW.duration,
          };
          this.fx.ring(this.gravityWell.x, this.gravityWell.y, GW.radius, 8, 0.45, '#c77dff', 2.2);
        }
      }
    }
    if (this.worldIdx === 5 || (this.isEndless && this.wave >= 10)) {
      const WH = CONFIG.arena.wormhole;
      this.wormholeA = (this.wormholeA + (WH.speed || 0.38) * dt) % TAU;
      const r = WH.orbitRadius || 132;
      this.wormholes[0].x = Math.cos(this.wormholeA) * r;
      this.wormholes[0].y = Math.sin(this.wormholeA) * r;
      this.wormholes[1].x = Math.cos(this.wormholeA + Math.PI) * r;
      this.wormholes[1].y = Math.sin(this.wormholeA + Math.PI) * r;
    }
  }

  updateOver(dt, rdt) {
    this.core.update(dt, false);
    this.projectiles.update(dt);
    this.enemies.sweep();
    this.fx.update(dt);
    if (this.celebrate > 0) {
      this.celebrate -= rdt;
      if (this.celebrate <= 0) this.celebrate = 0;
      else if (Math.random() < rdt * 11) {
        const cols = ['#ff4fd8', '#ffb02e', '#c6ff3d', '#9b6bff', '#2effb4', '#8ff5ff', '#2eff9c'];
        const a = Math.random() * TAU, r = 40 + Math.random() * 190;
        this.fx.burst(Math.cos(a) * r, Math.sin(a) * r, cols[(Math.random() * cols.length) | 0], 14, 230, 4.5, 0.9);
      }
    }
    if (this.dying || this.winning) {
      this.deathT += rdt;
      if (this.deathT >= (this.winning ? 1.55 : 1.5)) {
        this.dying = false;
        this.winning = false;
        this.finishRun();
      }
    }
  }

  /* ───────────────────────── wave director & world bosses ───────────────────────── */

  bossIndexForWave(n) {
    const wBosses = this.worldDef.bosses || [0, 1, 2];
    if (this.isEndless) {
      if (n <= 20) {
        const step = Math.min(2, Math.max(0, Math.floor((n - 10) / 5)));
        return wBosses[step];
      }
      return (wBosses[0] + Math.floor(n / 5)) % CONFIG.bosses.length;
    }
    if (n === 10) return wBosses[0];
    if (n === 15) return wBosses[1];
    if (n === 20) return wBosses[2];
    return wBosses[0];
  }

  beginWave(n) {
    const W = CONFIG.waves, wDef = this.worldDef, tDef = this.tierDef;
    const hs = W.hpScale, ss = W.speedScale;
    this.wave = n;
    this.maxWaves = tDef.waves;

    if (this.isEndless) {
      this.isBossWave = n >= 10 && n % 5 === 0;
    } else {
      this.isBossWave = tDef.bossWaves.includes(n);
    }

    if (this.isBossWave) {
      this.currentBossIdx = this.bossIndexForWave(n);
    }

    const AN = CONFIG.anomalies;
    if (!this.isBossWave && n >= AN.minWave && Math.random() < AN.chance) {
      this.anomaly = AN.types[(Math.random() * AN.types.length) | 0];
      this.stormT = this.anomaly.stormInterval || 1.35;
    } else {
      this.anomaly = null;
    }

    const k = n - 1;
    const worldHp = (wDef.hpMult || 1) * (tDef.hpMult || 1);
    const runeSlowMul = 1 - Math.min(0.45, this.core.stats.runeSlow || 0);
    const worldSpd = (wDef.speedMult || 1) * (tDef.speedMult || 1) * runeSlowMul;
    this.waveScale = {
      hp: (1 + hs.linear * k + hs.quad * k * k) * worldHp * (this.anomaly?.hpMult || 1),
      speed: Math.min(ss.max, (1 + ss.linear * k) * worldSpd * (this.anomaly?.speedMult || 1)),
    };

    this.plan = this.planWave(n, this.isBossWave);
    this.planIdx = 0;
    this.waveT = 0;
    this.waveHit = false;
    this.phase = 'break';
    this.breakT = W.breakTime + 0.45;
    this.bannerPending = true;
    this.audio.setWave(n, this.isBossWave);
  }

  planWave(n, boss = false) {
    const W = CONFIG.waves, E = CONFIG.enemies;
    const worldPool = [...(this.worldDef.enemies || []), ...(this.worldDef.tactical || ['leech', 'linker', 'portal'])];
    let budget = (W.budget.base + W.budget.linear * n + W.budget.quad * n * n) * (this.anomaly?.budgetMult || 1);
    if (boss) budget *= W.bossBudget;
    const dur = Math.min(W.duration.max, W.duration.base + W.duration.perWave * n);

    let types = worldPool.filter((k) => E[k] && E[k].unlock <= n);
    if (!types.length) types = [worldPool[0]];

    const weight = (k) => E[k].weight * (E[k].unlock > 1 && n - E[k].unlock < 2 ? W.newTypeBoost : 1);

    const groups = [];
    if (!this.anomaly) {
      for (const k of types) {
        if (E[k].unlock === n && n > 1 && !E[k].isTactical) {
          groups.push({ type: k, count: W.introCount });
          budget -= W.introCount * E[k].cost;
        }
      }
    }
    while (budget > 0.5) {
      const afford = types.filter((k) => E[k].cost <= budget + 0.01);
      if (!afford.length) break;
      let total = 0;
      for (const k of afford) total += weight(k);
      let r = Math.random() * total, type = afford[afford.length - 1];
      for (const k of afford) { r -= weight(k); if (r <= 0) { type = k; break; } }
      const [lo, hi0] = W.groupSize[type] || [1, 2];
      const hi = E[type].isTactical ? hi0 : hi0 + Math.floor(n * W.groupGrowth);
      let count = lo + Math.floor(Math.random() * (hi - lo + 1));
      count = Math.max(1, Math.min(count, Math.floor(budget / E[type].cost)));
      groups.push({ type, count });
      budget -= count * E[type].cost;
    }
    for (let i = groups.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [groups[i], groups[j]] = [groups[j], groups[i]];
    }

    const list = [], t0 = W.startDelay + (boss ? 2.6 : 0), G = Math.max(1, groups.length);
    const isEliteWave = !!this.anomaly?.elite;
    groups.forEach((g, i) => {
      const t = t0 + (dur - t0) * ((i + Math.random() * 0.8) / G), a = Math.random() * TAU;
      for (let k = 0; k < g.count; k++) {
        list.push({
          t: t + k * 0.1,
          type: g.type,
          angle: a + (k - (g.count - 1) / 2) * W.spawnGap,
          elite: isEliteWave,
        });
      }
    });
    if (boss) list.push({ t: 0.8, type: 'boss', bossIdx: this.currentBossIdx, angle: 0 });

    const podMult = this.core.stats.podRateMult || 1;
    const LD = CONFIG.scoring.lootDrone;
    if (n >= LD.minWave && Math.random() < LD.chancePerWave * podMult) {
      list.push({ t: t0 + (dur - t0) * (0.35 + Math.random() * 0.4), type: 'loot', angle: 0 });
    }
    const PU = CONFIG.powerups;
    if (n >= PU.minWave && Math.random() < PU.chancePerWave * podMult) {
      list.push({ t: t0 + (dur - t0) * (0.25 + Math.random() * 0.45), type: 'capsule', angle: 0 });
    }
    if ((this.worldIdx === 1 || (this.isEndless && n >= 4)) && Math.random() < CONFIG.arena.magma.chancePerWave) {
      list.push({ t: t0 + (dur - t0) * 0.22, type: 'magmaRock', angle: 0 });
      if (n >= 5) list.push({ t: t0 + (dur - t0) * 0.62, type: 'magmaRock', angle: 0 });
    }
    if ((this.worldIdx === 3 || (this.isEndless && n >= 8)) && Math.random() < CONFIG.arena.pylon.chancePerWave) {
      list.push({ t: t0 + (dur - t0) * 0.35, type: 'aetherPylon', angle: 0 });
    }
    if ((this.worldIdx === 4 || (this.isEndless && n >= 9)) && Math.random() < CONFIG.arena.prism.chancePerWave) {
      list.push({ t: t0 + (dur - t0) * 0.28, type: 'prismNode', angle: 0 });
      if (n >= 5) list.push({ t: t0 + (dur - t0) * 0.65, type: 'prismNode', angle: 0 });
    }
    list.sort((a, b) => a.t - b.t);
    return list;
  }

  announceWave() {
    const boss = this.isBossWave;
    const bossObj = CONFIG.bosses[this.currentBossIdx] || CONFIG.bosses[0];
    const sub = boss
      ? `Warning · ${bossObj.name} approaches`
      : this.anomaly
        ? `⚡ ${this.anomaly.name} · ${this.anomaly.sub}`
        : '';
    this.emit('wave', {
      wave: this.wave,
      boss,
      bossName: sub,
    });
    if (boss) { this.audio.bossWarning(); this.haptics.buzz([80, 60, 80, 60, 160]); }
  }

  updateDirector(dt) {
    const W = CONFIG.waves;
    if (this.phase === 'break') {
      this.breakT -= dt;
      if (this.bannerPending && this.breakT <= W.breakTime) { this.bannerPending = false; this.announceWave(); }
      if (this.breakT <= 0) { this.phase = 'wave'; this.waveT = 0; }
      return;
    }
    if (this.phase === 'clear') {
      this.clearT -= dt;
      if (this.clearT <= 0) this.openCards();
      return;
    }

    this.waveT += dt;

    if (this.anomaly?.id === 'storm' && this.enemies.alive > 0) {
      this.stormT -= dt;
      if (this.stormT <= 0) {
        this.stormT = this.anomaly.stormInterval || 1.35;
        const aliveList = this.enemies.pool.items.filter((e) => !e.dead && e.immune <= 0);
        if (aliveList.length > 0) {
          const target = aliveList[(Math.random() * aliveList.length) | 0];
          const col = this.worldDef.color || '#8ff5ff';
          this.fx.bolt(target.x + (Math.random() - 0.5) * 60, target.y - 180, target.x, target.y, col, 0.25);
          this.fx.ring(target.x, target.y, 4, 48, 0.3, col, 2.5);
          this.audio.chain();
          this.damageEnemy(target, this.core.stats.damage * 1.4, { dx: 0, dy: 1, kb: 40, crit: true });
        }
      }
    }

    const plan = this.plan;
    if (this.planIdx < plan.length && this.enemies.alive === 0 && plan[this.planIdx].t - this.waveT > 0.8) {
      this.waveT = plan[this.planIdx].t - 0.5;
    }
    while (this.planIdx < plan.length && plan[this.planIdx].t <= this.waveT) {
      const s = plan[this.planIdx];
      if (
        s.type !== 'boss' && s.type !== 'loot' && s.type !== 'capsule' &&
        s.type !== 'magmaRock' && s.type !== 'aetherPylon' && s.type !== 'prismNode' &&
        this.enemies.alive >= CONFIG.world.maxEnemies
      ) break;
      this.planIdx++;
      if (s.type === 'boss') {
        this.enemies.spawnBoss(s.bossIdx ?? this.currentBossIdx, this.wave);
      } else if (s.type === 'loot') {
        this.enemies.spawnLootDrone();
        this.emit('banner', { text: 'Vault Drone', sub: 'Shoot it before it escapes!', kind: 'perfect' });
      } else if (s.type === 'capsule') {
        this.enemies.spawnCapsule();
      } else if (s.type === 'magmaRock') {
        this.enemies.spawnMagmaRock();
      } else if (s.type === 'aetherPylon') {
        this.enemies.spawnAetherPylon();
      } else if (s.type === 'prismNode') {
        this.enemies.spawnPrismNode();
      } else {
        const R = CONFIG.world.spawnRadius + Math.random() * 10;
        this.enemies.spawn(s.type, Math.cos(s.angle) * R, Math.sin(s.angle) * R, { elite: s.elite });
      }
    }
    if (this.planIdx >= plan.length && this.enemies.alive === 0) this.completeWave();
  }

  completeWave() {
    const S = CONFIG.scoring, wDef = this.worldDef;
    const perfect = !this.waveHit;

    if (perfect) {
      const bonus = S.perfectWave.base + S.perfectWave.perWave * this.wave;
      this.perfectWaves++;
      if (this.core.stats.brGolden) this.bonusShards += 10;
      this.store.data.stats.perfectWaves = (this.store.data.stats.perfectWaves || 0) + 1;
      if (this.store.data.stats.perfectWaves >= 5) this.unlockAchievement('perfect5');
      if (this.store.data.stats.perfectWaves >= 20) this.unlockAchievement('perfect20');
      this.addScore(bonus);
    }

    if (!this.isEndless && this.wave >= this.maxWaves) {
      this.winRun();
      return;
    }

    this.phase = 'clear';
    this.clearT = CONFIG.waves.clearDelay;
    if (perfect) {
      const bonus = S.perfectWave.base + S.perfectWave.perWave * this.wave;
      const goldenSub = this.core.stats.brGolden ? ` · +10 Shards` : '';
      this.emit('banner', { text: 'Perfect wave', sub: `+${bonus.toLocaleString()} pts${goldenSub}`, kind: 'perfect' });
    }
    this.audio.waveClear(perfect);
    this.haptics.waveClear();
    if (this.core.onWaveCleared()) { this.audio.shieldUp(); this.fx.ring(0, 0, 20, 70, 0.6, '#82cdff', 3); }
    this.fx.ring(0, 0, 30, 430, 0.9, wDef.color || CORE_COLOR, 3);
    this.emit('waveClear', { wave: this.wave, perfect });
  }

  winRun() {
    if (this.winning || this.dying) return;
    this.winning = true;
    this.victory = true;
    this.state = 'over';
    this.deathT = 0;
    this.celebrate = 2.8;
    this.core.firing = false;
    this.input.reset();

    this.slowT = this.slowDur = 1.25;
    this.slowScale = 0.18;

    const wDef = this.worldDef, tDef = this.tierDef;
    this.bonusShards += tDef.clearBonus || 100;
    this.store.data.stats.stagesCleared = (this.store.data.stats.stagesCleared || 0) + 1;

    const step = this.worldIdx * 3 + this.tierIdx;
    const maxStages = CONFIG.worlds.length * 3 - 1; // 17
    if (this.tierIdx < 3 && step >= (this.store.data.campaignProgress | 0) && step < maxStages) {
      this.store.data.campaignProgress = step + 1;
      if (this.tierIdx < 2) {
        const nextT = wDef.tiers[this.tierIdx + 1];
        this.unlockedNextLabel = `${wDef.name} · ${nextT.name} Unlocked!`;
        this.tierIdx += 1;
        this.store.data.tier = this.tierIdx;
      } else if (this.worldIdx < CONFIG.worlds.length - 1) {
        const nextW = CONFIG.worlds[this.worldIdx + 1];
        this.unlockedNextLabel = `${nextW.code}: ${nextW.name} & Endless Unlocked!`;
        this.worldIdx += 1;
        this.tierIdx = 0;
        this.store.data.world = this.worldIdx;
        this.store.data.tier = 0;
        this.syncWorldTheme();
      }
    }

    if (step === 2) this.unlockAchievement('world1');
    if (step === 5) this.unlockAchievement('world2');
    if (step === 8) this.unlockAchievement('world3');
    if (step === 11) this.unlockAchievement('world4');
    if (step === 14) this.unlockAchievement('world5');
    if (step === 17) this.unlockAchievement('world6');

    this.store.save();

    if (this.audio.stageClear) this.audio.stageClear();
    else this.audio.record();
    this.haptics.record();
    this.fx.ring(0, 0, 24, 460, 1.0, wDef.color || CORE_COLOR, 4.5);
    this.fx.ring(0, 0, 18, 340, 0.75, '#ffd23d', 3);
    this.fx.flashWhite(0.6);
    this.emit('state', this.state);
  }

  /* ───────────────────────── upgrade cards, Boss Relics & reroll ───────────────────────── */

  openCards() {
    const fx = this.core.fx;
    const count = fx.extraChoice >= 1 || Math.random() < fx.extraChoice ? 4 : 3;
    const bossRelicWave = this.isBossWave && (this.wave === 10 || this.wave === 15 || (this.isEndless && this.wave % 10 === 0));
    this.pendingCards = rollCards(this.core.levels, {
      wave: this.wave,
      hp: this.core.hp,
      maxHp: this.core.stats.maxHp,
      hpCap: CONFIG.core.hpCap,
      bossRelicWave,
      singularityDeck: !!this.core.stats.capSingularity,
    }, count);
    this.state = 'cards';
    this.core.firing = false;
    this.input.reset();
    this.audio.cardsIn();
    this.emit('cards', this.pendingCards);
    this.emit('state', this.state);
  }

  rerollCards() {
    if (this.state !== 'cards' || this.rerollsLeft <= 0 || !this.pendingCards) return false;
    this.rerollsLeft--;
    const count = this.pendingCards.length;
    const bossRelicWave = this.isBossWave && (this.wave === 10 || this.wave === 15 || (this.isEndless && this.wave % 10 === 0));
    this.pendingCards = rollCards(this.core.levels, {
      wave: this.wave,
      hp: this.core.hp,
      maxHp: this.core.stats.maxHp,
      hpCap: CONFIG.core.hpCap,
      bossRelicWave,
      singularityDeck: !!this.core.stats.capSingularity,
    }, count);
    this.audio.cardsIn();
    this.haptics.buzz(15);
    this.emit('cards', this.pendingCards);
    return true;
  }

  pickCard(i) {
    const cards = this.pendingCards;
    if (!cards || !cards[i]) return false;
    const card = cards[i];
    this.pendingCards = null;
    if (card.id === 'bonus') this.addScore(200 * this.wave);
    else this.core.addUpgrade(card.id, card.gain);
    if (card.isRelic) this.unlockAchievement('relic1');
    else if (card.rarity === 'mythic') this.unlockAchievement('synergy1');
    this.audio.pick();
    this.fx.ring(0, 0, 20, 120, 0.5, card.isCorrupted ? '#ff2a55' : (this.worldDef.color || CORE_COLOR), 3);
    this.fx.flashWhite(0.25);
    if (this.state === 'cards') { this.state = 'play'; this.emit('state', this.state); }
    else if (this.state === 'paused' && this.prevState === 'cards') this.prevState = 'play';
    this.beginWave(this.wave + 1);
    return true;
  }

  /* ───────────────────────── combat, Magma, Pylons, Prisms & damage ───────────────────────── */

  triggerCapsuleBuff(x, y) {
    const PU = CONFIG.powerups;
    const durMult = this.core.stats.podRateMult || 1;
    const roll = (Math.random() * 3) | 0;
    if (this.audio.powerup) this.audio.powerup();
    if (roll === 0) {
      this.core.frenzyT = PU.frenzyDuration * durMult;
      this.fx.ring(x, y, 10, 160, 0.45, '#ff4fd8', 3);
      this.emit('banner', { text: 'Hyper-Frenzy', sub: '2× Fire Rate Active', kind: 'perfect' });
    } else if (roll === 1) {
      const items = this.enemies.pool.items;
      for (let i = 0; i < items.length; i++) {
        if (!items[i].dead) items[i].chillT = PU.cryoDuration * durMult;
      }
      this.fx.ring(0, 0, 20, 380, 0.65, '#8ff5ff', 4);
      this.emit('banner', { text: 'Cryo-Nova', sub: 'All enemies deep-frozen', kind: 'perfect' });
    } else {
      this.core.surgeT = PU.surgeDuration * durMult;
      this.fx.ring(x, y, 10, 180, 0.45, '#ffd23d', 3);
      this.emit('banner', { text: 'Overcharge Surge', sub: '100% Critical Hits Active', kind: 'perfect' });
    }
  }

  triggerMagmaBlast(x, y) {
    const M = CONFIG.arena.magma;
    const arenaMult = this.core.stats.arenaAmpMult || 1;
    const br = M.blastRadius * arenaMult, br2 = br * br;
    const bDmg = this.core.stats.damage * M.blastDamageMult * arenaMult;
    this.fx.ring(x, y, 10, br, 0.4, '#ff6b4a', 3.5);
    this.fx.flare(x, y, '#ffbe0b', br * 1.4, 0.35, 0.9);
    this.fx.shake(6);
    if (this.audio.blast) this.audio.blast();
    const items = this.enemies.pool.items;
    for (let i = 0; i < items.length; i++) {
      const o = items[i];
      if (o.dead || o.immune > 0 || o.def.isMagma) continue;
      const dx = o.x - x, dy = o.y - y, d2 = dx * dx + dy * dy;
      if (d2 <= br2) {
        const d = Math.sqrt(d2) || 1;
        this.damageEnemy(o, bDmg, { dx: dx / d, dy: dy / d, kb: 140, crit: true });
      }
    }
  }

  triggerPylonLightning(x, y) {
    const P = CONFIG.arena.pylon;
    const arenaMult = this.core.stats.arenaAmpMult || 1;
    const range2 = (P.range * arenaMult) ** 2;
    const bDmg = this.core.stats.damage * P.dmgMult * arenaMult;
    const items = this.enemies.pool.items;
    let hitCount = 0;
    this.fx.ring(x, y, 8, 90, 0.35, '#2eff9c', 3);
    this.audio.chain();

    for (let i = 0; i < items.length && hitCount < P.arcs; i++) {
      const o = items[i];
      if (o.dead || o.immune > 0 || o.def.isPylon) continue;
      const dx = o.x - x, dy = o.y - y, d2 = dx * dx + dy * dy;
      if (d2 <= range2) {
        hitCount++;
        const d = Math.sqrt(d2) || 1;
        this.fx.bolt(x, y, o.x, o.y, '#2eff9c', 0.22);
        this.damageEnemy(o, bDmg, { dx: dx / d, dy: dy / d, kb: 80, crit: true });
      }
    }
  }

  triggerPrismRefraction(x, y) {
    const PR = CONFIG.arena.prism;
    const st = this.core.stats;
    const arenaMult = st.arenaAmpMult || 1;
    const n = PR.splitCount || 3;
    const baseA = Math.atan2(-y, -x);
    this.fx.ring(x, y, 6, 95, 0.35, '#ffc300', 3);
    this.fx.flare(x, y, '#ff388c', 90, 0.3, 0.9);
    this.audio.chain();
    for (let k = 0; k < n; k++) {
      const ang = baseA + (k - (n - 1) / 2) * 0.55;
      this.projectiles.spawnSplit(x, y, ang, null, st, true, (PR.dmgMult || 0.78) * arenaMult);
    }
  }

  hitEnemy(e, p) {
    const sp = Math.hypot(p.vx, p.vy) || 1;
    const dx = p.vx / sp, dy = p.vy / sp;
    const st = this.core.stats;
    let dmg = p.dmg;

    if (e.boss && e.staggerT <= 0 && e.shieldSpan > 0 && st.pierce <= 0 && !p.omega) {
      const hitAngle = Math.atan2(p.y - e.y, p.x - e.x);
      if (Math.abs(angleDiff(hitAngle, e.shieldA)) <= e.shieldSpan * 0.5) {
        dmg *= 0.35;
        this.fx.sparks(p.x, p.y, hitAngle, '#8ff5ff', 5);
      }
    }

    if (st.relicBurn && !e.def.isCapsule && !e.def.isMagma && !e.def.isPylon && !e.def.isPrism && !e.shieldedBy) {
      if (e.burnT <= 0) e.burnTick = 0.35;
      e.burnT = CONFIG.upgrades.relicBurn.duration || 3.0;
      e.burnDps = st.damage * (CONFIG.upgrades.relicBurn.dpsRatio || 0.45);
    }

    const kb = CONFIG.core.knockback * (st.knockbackMult || 1);
    this.damageEnemy(e, dmg, { dx, dy, kb, crit: p.crit });

    if (st.blastRadius > 0) {
      const br = st.blastRadius, br2 = br * br, bDmg = p.dmg * st.blastDamageMult;
      const items = this.enemies.pool.items;
      this.fx.ring(e.x, e.y, 6, br, 0.28, p.crit ? '#ffd23d' : CORE_COLOR, 2.2);
      if (this.audio.blast) this.audio.blast();
      for (let i = 0; i < items.length; i++) {
        const o = items[i];
        if (o.dead || o === e || o.immune > 0) continue;
        const odx = o.x - e.x, ody = o.y - e.y, d2 = odx * odx + ody * ody;
        if (d2 <= br2) {
          const d = Math.sqrt(d2) || 1;
          this.damageEnemy(o, bDmg, { dx: odx / d, dy: ody / d, kb: 55, crit: false });
        }
      }
    }

    if (st.chainChance > 0 && Math.random() < st.chainChance) this.chainFrom(e, p.dmg * st.chainDamageMult);
  }

  chainFrom(from, dmg) {
    const range = this.core.stats.chainRange, items = this.enemies.pool.items;
    let best = null, bd = range * range;
    for (let i = 0; i < items.length; i++) {
      const o = items[i];
      if (o.dead || o === from) continue;
      const dx = o.x - from.x, dy = o.y - from.y, d2 = dx * dx + dy * dy;
      if (d2 < bd) { bd = d2; best = o; }
    }
    if (!best) return;
    const d = Math.sqrt(bd) || 1;
    this.fx.bolt(from.x, from.y, best.x, best.y);
    this.audio.chain();
    this.damageEnemy(best, dmg, { dx: (best.x - from.x) / d, dy: (best.y - from.y) / d, kb: 60, crit: false });
  }

  damageEnemy(e, dmg, o = {}) {
    if (e.dead || e.phased) return;

    if (e.shieldedBy && !e.shieldedBy.dead) {
      if (!o.silent) {
        this.fx.sparks(e.x, e.y, Math.atan2(o.dy || 0, o.dx || 1), '#00f5d4', 4);
        this.fx.ring(e.x, e.y, e.r * 1.1, e.r * 1.45, 0.16, '#00f5d4', 2);
      }
      return;
    }

    const st = this.core.stats;
    e.lastHitT = e.t;
    if (o.crit && st.brCryo) {
      e.chillT = Math.max(e.chillT, 1.4);
    }

    let mult = 1;
    if (e.chillT > 0) mult *= 1.25;
    if (e.boss || e.elite) mult *= (st.bossMult || 1);
    if (e.boss && e.staggerT > 0) mult *= 1.35;
    const actualDmg = dmg * mult;
    e.hp -= actualDmg;
    e.flash = CONFIG.feel.flashTime;
    const kb = (o.kb || 0) * (1 - (e.def.knockResist || 0));
    e.kx += (o.dx || 0) * kb;
    e.ky += (o.dy || 0) * kb;

    if (!o.silent) {
      const ix = e.x - (o.dx || 0) * e.r * 0.8, iy = e.y - (o.dy || 0) * e.r * 0.8;
      this.fx.sparks(ix, iy, Math.atan2(o.dy || 0, o.dx || 1), o.crit ? '#ffd23d' : e.def.color, o.crit ? 6 : 3);
      if (this.fx.density >= 0.6) this.fx.flare(ix, iy, o.crit ? '#ffd23d' : '#ffffff', o.crit ? 15 : 10, 0.09, 0.8);
    }

    if (this.store.data.settings.damageNumbers !== false && this.fx.text) {
      const disp = actualDmg >= 10 ? String(Math.round(actualDmg)) : actualDmg.toFixed(1);
      this.fx.text(
        e.x + (Math.random() - 0.5) * 10,
        e.y - e.r - 4,
        o.crit ? `${disp}!` : disp,
        o.crit ? '#ffd23d' : (o.silent ? '#ff9e66' : '#e8f3ff'),
        o.crit ? 1.2 : 0.92
      );
    }

    if (e.boss && e.charging > 0) {
      e.chargeDmg += actualDmg;
      if (e.chargeDmg >= e.chargeTarget) {
        e.charging = 0;
        e.staggerT = 2.6;
        e.tele = 0;
        this.fx.ring(e.x, e.y, e.r * 0.5, e.r * 2.8, 0.5, '#8ff5ff', 4);
        this.fx.shake(7);
        this.audio.shieldBreak();
        this.emit('banner', { text: 'Boss Staggered!', sub: 'Shields offline · +35% Damage', kind: 'perfect' });
      }
    }

    const exec = st.executeThreshold || 0;
    const thresh = e.boss ? exec * 0.35 : exec;
    if (e.hp <= 0 || (thresh > 0 && e.hp / e.maxHp <= thresh)) {
      this.killEnemy(e, o.crit);
    } else if (!o.silent) {
      this.audio.hit();
    }
  }

  triggerCosmeticKillFx(e) {
    const kFx = this.equippedKillEffect;
    if (!kFx || kFx === 'default') return;
    if (kFx === 'nova') {
      this.fx.ring(e.x, e.y, 4, e.r * 2.8, 0.32, '#ffd23d', 2.4);
      this.fx.ring(e.x, e.y, 2, e.r * 1.9, 0.22, '#ffffff', 1.5);
    } else if (kFx === 'glitch') {
      const a = Math.random() * TAU;
      this.fx.bolt(e.x - Math.cos(a) * 18, e.y - Math.sin(a) * 18, e.x + Math.cos(a) * 18, e.y + Math.sin(a) * 18, '#00f5d4', 0.16);
      this.fx.sparks(e.x, e.y, 0, '#00f5d4', 10, TAU);
    } else if (kFx === 'void') {
      this.fx.ring(e.x, e.y, e.r * 2.4, 2, 0.28, '#c77dff', 2.5);
      this.fx.flare(e.x, e.y, '#c77dff', e.r * 3.8, 0.3, 0.9);
    } else if (kFx === 'crimson') {
      this.fx.ring(e.x, e.y, 4, e.r * 2.6, 0.3, '#ff4d5e', 2.6);
      this.fx.sparks(e.x, e.y, 0, '#ff2a55', 11, TAU);
    } else if (kFx === 'emerald') {
      this.fx.ring(e.x, e.y, 4, e.r * 2.5, 0.3, '#2eff9c', 2.4);
      this.fx.sparks(e.x, e.y, 0, '#2eff9c', 9, TAU);
    } else if (kFx === 'solar') {
      this.fx.ring(e.x, e.y, 3, e.r * 3.0, 0.34, '#ffc300', 2.8);
      this.fx.flare(e.x, e.y, '#ff388c', e.r * 3.2, 0.26, 0.85);
    }
  }

  killEnemy(e, wasCrit = false, noSplit = false) {
    if (!this.enemies.markDead(e)) return;
    const def = e.def, F = CONFIG.feel, S = CONFIG.scoring, st = this.core.stats;
    this.registerKill();
    const pts = (e.boss ? S.boss.base + S.boss.perWave * this.wave : def.points) * (e.elite ? 2 : 1) * (this.anomaly?.scoreMult || 1);
    this.addScore(pts * this.combo.mult * (st.scoreMult || 1));
    this.kills++;
    if (e.elite) this.bonusShards += 2;

    if (st.brVamp && (e.boss || e.elite) && st.shieldMax > 0 && this.core.shield < st.shieldMax) {
      this.core.shield = st.shieldMax;
      this.core.shieldCharge = 0;
      this.audio.shieldUp();
      this.fx.ring(0, 0, 18, 65, 0.45, '#ff7be5', 2.6);
    }

    if (def.isLoot) {
      const bonus = S.lootDrone.bonusShards;
      this.bonusShards += bonus;
      this.store.data.stats.lootKills = (this.store.data.stats.lootKills || 0) + 1;
      if (this.store.data.stats.lootKills >= 5) this.unlockAchievement('loot5');
      if (this.store.data.stats.lootKills >= 20) this.unlockAchievement('loot20');
      this.audio.buy();
      this.emit('banner', { text: 'Vault Cracked!', sub: `+${bonus} Bonus Shards`, kind: 'perfect' });
    } else if (def.isCapsule) {
      if (st.brSalvage) this.core.salvageT = 3.5;
      this.triggerCapsuleBuff(e.x, e.y);
    } else if (def.isMagma) {
      if (st.brSalvage) this.core.salvageT = 3.5;
      this.triggerMagmaBlast(e.x, e.y);
    } else if (def.isPylon) {
      if (st.brSalvage) this.core.salvageT = 3.5;
      this.triggerPylonLightning(e.x, e.y);
    } else if (def.isPrism) {
      if (st.brSalvage) this.core.salvageT = 3.5;
      this.triggerPrismRefraction(e.x, e.y);
    }

    if (def.frostNova && !noSplit) {
      const fr = def.frostNova, fr2 = fr * fr;
      this.fx.ring(e.x, e.y, 8, fr, 0.35, '#ffc300', 2.8);
      const list = this.enemies.pool.items;
      for (let i = 0; i < list.length; i++) {
        const o = list[i];
        if (o.dead || o === e) continue;
        const dx = o.x - e.x, dy = o.y - e.y;
        if (dx * dx + dy * dy <= fr2) o.chillT = Math.max(o.chillT, 2.4);
      }
    }

    if (wasCrit && st.evoNova) {
      const nr = CONFIG.upgrades.evoNova.radius, nr2 = nr * nr;
      const nDmg = st.damage * CONFIG.upgrades.evoNova.damage;
      this.fx.ring(e.x, e.y, 8, nr, 0.35, '#ffd23d', 3);
      const list = this.enemies.pool.items;
      for (let i = 0; i < list.length; i++) {
        const o = list[i];
        if (o.dead || o === e || o.immune > 0) continue;
        const dx = o.x - e.x, dy = o.y - e.y, d2 = dx * dx + dy * dy;
        if (d2 <= nr2) {
          const d = Math.sqrt(d2) || 1;
          this.damageEnemy(o, nDmg, { dx: dx / d, dy: dy / d, kb: 90, crit: false });
        }
      }
    }

    if (st.vampKills > 0) {
      this.core.vampCount++;
      if (this.core.vampCount >= st.vampKills) {
        this.core.vampCount = 0;
        if (this.core.hp < st.maxHp) {
          this.core.heal(1);
          this.fx.ring(0, 0, 12, 65, 0.45, '#ff4fd8', 2.5);
          this.emit('banner', { text: 'Siphon Matrix', sub: '+1 HP Restored', kind: 'perfect' });
        }
      }
    }

    this.fx.burst(e.x, e.y, e.elite ? '#ffd23d' : def.color, e.boss ? 70 : def.shards || 8, e.boss ? 330 : 170, e.boss ? 7 : 4.5, e.boss ? 1.2 : 0.65);
    this.fx.flare(e.x, e.y, e.elite ? '#ffd23d' : def.color, e.boss ? 170 : e.r * 3.4, e.boss ? 0.55 : 0.26, 0.85);
    this.fx.sparks(e.x, e.y, 0, def.color, e.boss ? 26 : 7, TAU);
    this.triggerCosmeticKillFx(e);
    this.fx.shake(e.boss ? F.shake.bossKill : (def.cost || 0) >= 3 ? F.shake.bigKill : F.shake.kill);
    this.audio.kill(this.combo.mult, this.combo.progress);
    this.haptics.tick();

    if (def.split && !noSplit) {
      for (let k = 0; k < def.split.count; k++) {
        const a = Math.random() * TAU;
        const c = this.enemies.spawn(def.split.type, e.x + Math.cos(a) * 8, e.y + Math.sin(a) * 8, { immune: 0.15, instant: true, quiet: true });
        c.kx = Math.cos(a) * 190;
        c.ky = Math.sin(a) * 190;
      }
    }
    if (e.boss) this.onBossKilled(e);
  }

  onBossKilled(e) {
    this.store.data.stats.bossKills = (this.store.data.stats.bossKills || 0) + 1;
    this.unlockAchievement('firstBoss');
    if (this.store.data.stats.bossKills >= 10) this.unlockAchievement('boss10');

    const bIdx = parseInt(String(e.key || '').replace('boss', ''), 10);
    const unlockedRune = this.unlockBossRune(Number.isFinite(bIdx) ? bIdx : this.currentBossIdx);

    this.fx.flashWhite(0.9);
    this.fx.flare(e.x, e.y, e.def.color, 280, 0.8);
    this.fx.ring(e.x, e.y, e.r, 360, 0.9, e.def.color, 5);
    this.fx.ring(e.x, e.y, e.r, 220, 0.6, '#ffffff', 3);
    this.audio.bossDown();
    this.haptics.waveClear();

    this.planIdx = this.plan.length;
    const snapshot = [...this.enemies.pool.items];
    for (let i = 0; i < snapshot.length; i++) {
      if (!snapshot[i].dead) this.killEnemy(snapshot[i], false, true);
    }
    if (CONFIG.scoring.boss.heal) this.core.heal(CONFIG.scoring.boss.heal);

    if (unlockedRune) {
      this.emit('banner', { text: `Rune Unlocked: ${unlockedRune.name}`, sub: unlockedRune.desc, kind: 'record' });
    } else if (this.isEndless || this.wave < this.maxWaves) {
      this.emit('banner', { text: 'Boss defeated', sub: `+${CONFIG.scoring.boss.heal} HP · Relic Unlocked`, kind: 'boss' });
    }
  }

  enemyTouchesCore(e) {
    if (e.dead) return;
    if (e.boss) {
      const d = Math.hypot(e.x, e.y) || 1, h = e.bossDef.hover;
      e.x *= h / d; e.y *= h / d; e.hoverD = h;
      this.damageCore(1);
      return;
    }
    this.enemies.markDead(e);
    this.fx.burst(e.x, e.y, e.def.color, e.def.shards || 8, 150, 4);
    this.damageCore(e.def.contact ?? 1);
  }

  damageCore(n = 1) {
    if (this.debug.god || this.state !== 'play') return;
    const r = this.core.hurt(n);
    if (r === 'ignored') return;
    if (r === 'blocked') {
      this.audio.shieldBreak();
      this.fx.ring(0, 0, 26, 90, 0.45, '#82cdff', 3);
      this.fx.shake(4);
      this.haptics.buzz(25);
      return;
    }
    if (r === 'revived') {
      this.fx.flashWhite(0.75);
      this.fx.ring(0, 0, 24, 340, 0.75, '#4db8ff', 4.5);
      this.fx.shake(14);
      this.haptics.record();
      this.emit('banner', { text: 'Phoenix Protocol!', sub: 'Core revived at 50% HP', kind: 'record' });
      return;
    }
    const F = CONFIG.feel;
    this.waveHit = true;
    this.resetCombo();
    this.fx.shake(F.shake.hit);
    this.fx.flashHurt(1);
    this.fx.ring(0, 0, 24, 160, 0.5, '#ff4d5e', 4);
    this.audio.coreHit();
    this.haptics.damage();
    this.slowT = this.slowDur = F.hitStopTime;
    this.slowScale = F.hitStopScale;
    this.emit('damage', this.core.hp);
    if (r === 'dead') this.die();
  }

  die() {
    if (this.dying || this.winning) return;
    this.dying = true;
    this.victory = false;
    this.coreDead = true;
    this.state = 'over';
    this.deathT = 0;
    this.core.firing = false;
    this.input.reset();
    for (const e of this.enemies.pool.items) {
      if (e.dead) continue;
      this.enemies.markDead(e);
      this.fx.burst(e.x, e.y, e.def.color, 6, 210, 4);
    }
    this.fx.burst(0, 0, CORE_COLOR, 60, 400, 6, 1.2);
    this.fx.flare(0, 0, CORE_COLOR, 240, 0.8);
    this.fx.sparks(0, 0, 0, '#ffffff', 22, TAU);
    this.fx.ring(0, 0, 20, 300, 0.9, CORE_COLOR, 4);
    this.fx.ring(0, 0, 20, 200, 0.7, '#ff4d5e', 4);
    this.fx.shake(26);
    this.fx.flashHurt(1);
    this.fx.flashWhite(0.5);
    this.slowT = this.slowDur = 0.9;
    this.slowScale = 0.3;
    this.audio.gameOver();
    this.audio.setMode('menu');
    this.haptics.buzz([60, 40, 140]);
    this.emit('state', this.state);
  }

  finishRun() {
    const summary = this.finalizeRun();
    if (!summary) return;
    if (summary.newScore && summary.score > 0 && !summary.victory) {
      this.celebrate = 2.2;
      this.audio.record();
      this.haptics.record();
    }
    this.emit('over', summary);
  }

  addScore(n) {
    this.score += Math.round(n);
    if (!this.recordShown && this.startBest > 0 && this.score > this.startBest && this.state === 'play') {
      this.recordShown = true;
      this.audio.record();
      this.haptics.record();
      this.emit('banner', { text: 'NEW RECORD', sub: 'High score beaten!', kind: 'record' });
    }
  }

  setChain(n) {
    const c = this.combo, C = CONFIG.scoring.combo;
    c.chain = Math.max(0, n);
    const m = Math.min(C.max, 1 + Math.floor(c.chain / C.killsPerLevel));
    c.progress = m >= C.max ? 1 : (c.chain % C.killsPerLevel) / C.killsPerLevel;
    if (m !== c.mult) {
      const up = m > c.mult;
      c.mult = m;
      if (up) this.audio.comboUp(m);
      if (m >= 5) this.unlockAchievement('combo5');
      this.emit('combo', m);
    }
  }

  registerKill() {
    this.combo.timer = 0;
    this.combo.decay = 0;
    this.setChain(this.combo.chain + 1);
  }

  resetCombo() {
    this.combo.timer = 0;
    this.combo.decay = 0;
    this.setChain(0);
  }

  updateCombo(dt) {
    const c = this.combo, C = CONFIG.scoring.combo;
    if (c.chain <= 0 || this.phase !== 'wave') return;
    c.timer += dt;
    if (c.timer > C.timeout) {
      c.decay += dt;
      if (c.decay >= C.decayEvery) { c.decay -= C.decayEvery; this.setChain(c.chain - 1); }
    }
  }

  comboTimeLeft() {
    const t = CONFIG.scoring.combo.timeout;
    return this.combo.chain <= 0 ? 0 : Math.max(0, 1 - this.combo.timer / t);
  }
}