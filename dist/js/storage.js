/**
 * storage.js — saves 33-node Skill Tree levels, 6-World Campaign & Endless progression,
 * unlocked Core Chassis & their levels (1..5), unlocked & upgraded Boss Runes (18 Runes, Lv 1..3),
 * 5-Category Shop items (Bullet Skins, Kill Effects, Core Auras, Shockwave Styles, Run Boosters),
 * 18 Achievements, stats & settings.
 */
const KEY = 'core.save.v1';

export const defaultSave = () => ({
  v: 1,
  shards: 0,
  world: 0,              // currently viewed/selected World (0..5)
  tier: 0,               // currently selected Tier (0=Easy, 1=Medium, 2=Hard, 3=Endless)
  campaignProgress: 0,   // highest unlocked step: worldIdx * 3 + tierIdx (0..17)
  chassis: 0,
  unlockedChassis: { aegis: 1, lancer: 0, nexus: 0, volt: 0 },
  chassisLevels: { aegis: 1, lancer: 1, nexus: 1, volt: 1 },
  unlockedRunes: {
    rune_warden: 0, rune_prism: 0, rune_hive: 0,
    rune_vulcan: 0, rune_hellion: 0, rune_titan: 0,
    rune_singularity: 0, rune_chronos: 0, rune_sovereign: 0,
    rune_seraph: 0, rune_solaris: 0, rune_architect: 0,
    rune_frostbite: 0, rune_borealis: 0, rune_zero: 0,
    rune_mycelium: 0, rune_quantum: 0, rune_overmind: 0,
  },
  runeLevels: {
    rune_warden: 1, rune_prism: 1, rune_hive: 1,
    rune_vulcan: 1, rune_hellion: 1, rune_titan: 1,
    rune_singularity: 1, rune_chronos: 1, rune_sovereign: 1,
    rune_seraph: 1, rune_solaris: 1, rune_architect: 1,
    rune_frostbite: 1, rune_borealis: 1, rune_zero: 1,
    rune_mycelium: 1, rune_quantum: 1, rune_overmind: 1,
  },
  equippedRunes: [],
  unlockedBulletSkins: { default: 1, laser: 0, star: 0, void: 0, emerald: 0, rose: 0, quantum: 0 },
  equippedBulletSkin: 'default',
  unlockedKillEffects: { default: 1, nova: 0, glitch: 0, void: 0, crimson: 0, emerald: 0, solar: 0 },
  equippedKillEffect: 'default',
  unlockedCoreAuras: { default: 1, runic: 0, binary: 0, solar: 0, void: 0, seraph: 0 },
  equippedCoreAura: 'default',
  unlockedShockStyles: { default: 1, gold: 0, crimson: 0, void: 0, prismatic: 0 },
  equippedShockStyle: 'default',
  activeBoosters: {
    boost_overcharge: 0,
    boost_aegis: 0,
    boost_shards: 0,
    boost_headstart: 0,
  },
  achievements: {
    firstBoss: 0, boss10: 0, perfect5: 0, perfect20: 0,
    combo5: 0, loot5: 0, loot20: 0, synergy1: 0,
    relic1: 0, awakened1: 0, armoryAll: 0,
    tree10: 0, world1: 0, world2: 0, world3: 0, world4: 0, world5: 0, world6: 0,
  },
  meta: {
    coreAwaken: 1,
    runeSlot: 0,
    damage: 0, fireRate: 0, critRate: 0, critDmg: 0, bossSlayer: 0, overpierce: 0, capOmega: 0,
    hp: 0, aegisStart: 0, hullRegen: 0, blastGuard: 0, thornsStart: 0, invulnBoost: 0, capPhoenix: 0,
    projVelocity: 0, aimMagnet: 0, shockAmp: 0, orbitAmp: 0, arenaAmp: 0, startBounce: 0, capInterceptor: 0,
    shardGain: 0, rerolls: 0, extraChoice: 0, startUpgrade: 0, podRate: 0, capSingularity: 0,
    brVamp: 0, brCryo: 0, brGolden: 0, brSalvage: 0,
  },
  stats: {
    bestScore: 0, bestWave: 0, endlessBestWave: 0, totalRuns: 0, totalKills: 0,
    totalShards: 0, stagesCleared: 0, perfectWaves: 0, bossKills: 0, lootKills: 0,
  },
  settings: { sound: true, music: true, vibration: true, damageNumbers: true },
});

function merge(base, src) {
  if (!src || typeof src !== 'object') return base;
  for (const k of Object.keys(base)) {
    const b = base[k], s = src[k];
    if (Array.isArray(b)) {
      base[k] = Array.isArray(s) ? (k === 'equippedRunes' ? s.slice(0, 3) : [...s]) : b;
    } else if (b && typeof b === 'object') {
      base[k] = merge(b, s);
    } else if (typeof s === typeof b && (typeof s !== 'number' || Number.isFinite(s))) {
      base[k] = s;
    }
  }
  return base;
}

export class Storage {
  constructor(key = KEY) {
    this.key = key;
    this.data = this.load();
  }

  load() {
    try {
      const raw = globalThis.localStorage?.getItem(this.key);
      return merge(defaultSave(), raw ? JSON.parse(raw) : null);
    } catch {
      return defaultSave();
    }
  }

  save() {
    try {
      globalThis.localStorage?.setItem(this.key, JSON.stringify(this.data));
      return true;
    } catch {
      return false;
    }
  }

  reset() {
    const settings = this.data.settings;
    this.data = defaultSave();
    this.data.settings = settings;
    this.save();
  }
}