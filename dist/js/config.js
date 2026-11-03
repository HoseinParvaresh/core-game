/**
 * config.js — 6 Worlds (with distinct palettes & Endless Mode), Arena mechanics,
 * 5-Level Chassis progression, 18 Upgradable Boss Runes (Lv 1..3),
 * 33-Node Skill Tree, Corrupted Cards, Tactical Enemies & 5-Category Shop for CORE.
 */
export const CONFIG = {
  /* ───────────────────────── World, loop, rendering ───────────────────────── */
  world: {
    shortSide: 640,
    spawnRadius: 340,
    cullRadius: 560,
    maxEnemies: 150,
    gridStep: 40,
  },
  loop: { step: 1 / 60, maxFrame: 0.1 },
  render: { maxDpr: 2, maxParticles: 420 },

  /* ───────────────────────── 6 Worlds & 4 Tiers Each (Easy, Medium, Hard, Endless) ───────────────────────── */
  worlds: [
    {
      id: 0,
      code: 'WORLD I',
      name: 'Cyber Nexus',
      subtitle: 'Data Amplifier Gateways',
      mechanicDesc: 'Data Gateways orbit the Core · Shots passing through gain +45% Damage',
      color: '#8ff5ff',
      accent: '#ff4fd8',
      gridColor: 'rgba(110, 175, 255, 0.30)',
      bgStops: ['#0b1536', '#060a1e', '#04050c'],
      nebulae: [
        [0.2, 0.22, 0.55, '60,130,255', 0.12],
        [0.82, 0.7, 0.5, '255,70,210', 0.07],
        [0.5, 0.9, 0.6, '46,255,200', 0.05],
      ],
      enemies: ['triangle', 'square', 'diamond', 'hexagon'],
      tactical: ['leech', 'linker', 'portal'],
      bosses: [0, 1, 2],
      hpMult: 1.0,
      speedMult: 1.0,
      shardMult: 1.0,
      tiers: [
        { id: 0, name: 'Easy', waves: 10, bossWaves: [10], hpMult: 1.0, speedMult: 1.0, clearBonus: 50 },
        { id: 1, name: 'Medium', waves: 15, bossWaves: [10, 15], hpMult: 1.2, speedMult: 1.06, clearBonus: 100 },
        { id: 2, name: 'Hard', waves: 20, bossWaves: [10, 15, 20], hpMult: 1.45, speedMult: 1.12, clearBonus: 180 },
        { id: 3, name: 'Endless', waves: 999, endless: true, bossWaves: [], hpMult: 1.5, speedMult: 1.12, clearBonus: 0 },
      ],
    },
    {
      id: 1,
      code: 'WORLD II',
      name: 'Crimson Forge',
      subtitle: 'Volatile Magma Asteroids',
      mechanicDesc: 'Magma Rocks drift across the field · Shoot them to trigger fiery AoE blasts',
      color: '#ff6b4a',
      accent: '#ffd23d',
      gridColor: 'rgba(255, 110, 74, 0.28)',
      bgStops: ['#2b0d14', '#17060c', '#090306'],
      nebulae: [
        [0.22, 0.25, 0.55, '255,80,40', 0.13],
        [0.8, 0.68, 0.5, '255,180,40', 0.08],
        [0.48, 0.9, 0.6, '220,30,80', 0.07],
      ],
      enemies: ['pulsar', 'crusher', 'mender', 'lancer'],
      tactical: ['leech', 'linker', 'portal'],
      bosses: [3, 4, 5],
      hpMult: 1.45,
      speedMult: 1.08,
      shardMult: 1.5,
      tiers: [
        { id: 0, name: 'Easy', waves: 10, bossWaves: [10], hpMult: 1.0, speedMult: 1.0, clearBonus: 90 },
        { id: 1, name: 'Medium', waves: 15, bossWaves: [10, 15], hpMult: 1.25, speedMult: 1.07, clearBonus: 160 },
        { id: 2, name: 'Hard', waves: 20, bossWaves: [10, 15, 20], hpMult: 1.55, speedMult: 1.14, clearBonus: 280 },
        { id: 3, name: 'Endless', waves: 999, endless: true, bossWaves: [], hpMult: 1.6, speedMult: 1.14, clearBonus: 0 },
      ],
    },
    {
      id: 2,
      code: 'WORLD III',
      name: 'Void Singularity',
      subtitle: 'Gravitational Rifts',
      mechanicDesc: 'Gravity Wells form in space · Pulling nearby enemies into tight clusters',
      color: '#c77dff',
      accent: '#00f5d4',
      gridColor: 'rgba(199, 125, 255, 0.30)',
      bgStops: ['#1c0b33', '#0e051d', '#05020a'],
      nebulae: [
        [0.2, 0.2, 0.58, '170,70,255', 0.14],
        [0.84, 0.72, 0.52, '0,245,212', 0.08],
        [0.5, 0.88, 0.6, '255,50,160', 0.07],
      ],
      enemies: ['spiral', 'phantom', 'specter', 'colossus'],
      tactical: ['leech', 'linker', 'portal'],
      bosses: [6, 7, 8],
      hpMult: 2.0,
      speedMult: 1.16,
      shardMult: 2.2,
      tiers: [
        { id: 0, name: 'Easy', waves: 10, bossWaves: [10], hpMult: 1.0, speedMult: 1.0, clearBonus: 150 },
        { id: 1, name: 'Medium', waves: 15, bossWaves: [10, 15], hpMult: 1.3, speedMult: 1.08, clearBonus: 260 },
        { id: 2, name: 'Hard', waves: 20, bossWaves: [10, 15, 20], hpMult: 1.65, speedMult: 1.16, clearBonus: 450 },
        { id: 3, name: 'Endless', waves: 999, endless: true, bossWaves: [], hpMult: 1.7, speedMult: 1.16, clearBonus: 0 },
      ],
    },
    {
      id: 3,
      code: 'WORLD IV',
      name: 'Astral Sanctum',
      subtitle: 'Aether Storm Pylons',
      mechanicDesc: 'Aether Pylons materialize in orbit · Shoot them to unleash 5-target chain lightning',
      color: '#2eff9c',
      accent: '#ffd23d',
      gridColor: 'rgba(46, 255, 156, 0.28)',
      bgStops: ['#08281e', '#041612', '#020806'],
      nebulae: [
        [0.22, 0.22, 0.56, '46,255,156', 0.13],
        [0.82, 0.70, 0.52, '255,210,61', 0.09],
        [0.50, 0.88, 0.60, '0,210,255', 0.07],
      ],
      enemies: ['seraph', 'bastion', 'oracle', 'archon'],
      tactical: ['leech', 'linker', 'portal'],
      bosses: [9, 10, 11],
      hpMult: 2.65,
      speedMult: 1.22,
      shardMult: 3.0,
      tiers: [
        { id: 0, name: 'Easy', waves: 10, bossWaves: [10], hpMult: 1.0, speedMult: 1.0, clearBonus: 240 },
        { id: 1, name: 'Medium', waves: 15, bossWaves: [10, 15], hpMult: 1.35, speedMult: 1.09, clearBonus: 420 },
        { id: 2, name: 'Hard', waves: 20, bossWaves: [10, 15, 20], hpMult: 1.75, speedMult: 1.18, clearBonus: 700 },
        { id: 3, name: 'Endless', waves: 999, endless: true, bossWaves: [], hpMult: 1.8, speedMult: 1.18, clearBonus: 0 },
      ],
    },
    {
      id: 4,
      code: 'WORLD V',
      name: 'Chrono-Solaris Lab',
      subtitle: 'Solar Prism Refractors',
      mechanicDesc: 'Solar Prism Crystals drift in orbit · Shoot them to split bolts into 3 homing lasers',
      color: '#ffc300',
      accent: '#ff388c',
      gridColor: 'rgba(255, 195, 0, 0.26)',
      bgStops: ['#2b1d07', '#170f03', '#090601'],
      nebulae: [
        [0.22, 0.24, 0.58, '255,185,20', 0.14],
        [0.80, 0.70, 0.52, '255,56,140', 0.09],
        [0.48, 0.88, 0.60, '255,115,30', 0.07],
      ],
      enemies: ['glacier', 'mirage', 'icicle', 'weaver'],
      tactical: ['leech', 'linker', 'portal'],
      bosses: [12, 13, 14],
      hpMult: 3.35,
      speedMult: 1.26,
      shardMult: 4.0,
      tiers: [
        { id: 0, name: 'Easy', waves: 10, bossWaves: [10], hpMult: 1.0, speedMult: 1.0, clearBonus: 350 },
        { id: 1, name: 'Medium', waves: 15, bossWaves: [10, 15], hpMult: 1.38, speedMult: 1.10, clearBonus: 600 },
        { id: 2, name: 'Hard', waves: 20, bossWaves: [10, 15, 20], hpMult: 1.80, speedMult: 1.18, clearBonus: 950 },
        { id: 3, name: 'Endless', waves: 999, endless: true, bossWaves: [], hpMult: 1.85, speedMult: 1.18, clearBonus: 0 },
      ],
    },
    {
      id: 5,
      code: 'WORLD VI',
      name: 'Quantum Bio-Hive',
      subtitle: 'Twin Quantum Wormholes',
      mechanicDesc: 'Paired Wormholes orbit the Core · Shots entering Portal A exit Portal B with +65% Dmg & +1 Pierce',
      color: '#b8ff2e',
      accent: '#ff007f',
      gridColor: 'rgba(184, 255, 46, 0.26)',
      bgStops: ['#192808', '#0d1604', '#050802'],
      nebulae: [
        [0.20, 0.22, 0.56, '184,255,46', 0.13],
        [0.82, 0.70, 0.54, '255,0,127', 0.09],
        [0.50, 0.88, 0.60, '0,245,212', 0.07],
      ],
      enemies: ['spore', 'shifter', 'brood', 'juggernaut'],
      tactical: ['leech', 'linker', 'portal'],
      bosses: [15, 16, 17],
      hpMult: 4.2,
      speedMult: 1.30,
      shardMult: 5.2,
      tiers: [
        { id: 0, name: 'Easy', waves: 10, bossWaves: [10], hpMult: 1.0, speedMult: 1.0, clearBonus: 500 },
        { id: 1, name: 'Medium', waves: 15, bossWaves: [10, 15], hpMult: 1.40, speedMult: 1.10, clearBonus: 850 },
        { id: 2, name: 'Hard', waves: 20, bossWaves: [10, 15, 20], hpMult: 1.85, speedMult: 1.20, clearBonus: 1350 },
        { id: 3, name: 'Endless', waves: 999, endless: true, bossWaves: [], hpMult: 1.90, speedMult: 1.20, clearBonus: 0 },
      ],
    },
  ],

  /* ───────────────────────── Arena Phenomena Settings ───────────────────────── */
  arena: {
    gateways: { radius: 92, span: 0.72, speed: 0.55, dmgMult: 1.45, speedMult: 1.25 },
    magma: { chancePerWave: 0.75, blastRadius: 85, blastDamageMult: 2.4 },
    gravity: { interval: 7.5, duration: 4.2, radius: 135, pullStrength: 115 },
    pylon: { chancePerWave: 0.80, arcs: 5, range: 210, dmgMult: 2.2 },
    prism: { chancePerWave: 0.85, splitCount: 3, dmgMult: 0.78 },
    wormhole: { orbitRadius: 132, portalRadius: 24, speed: 0.38, dmgMult: 1.65, extraPierce: 1 },
  },

  /* ───────────────────────── Playable Core Chassis (Lv 1..5 & Awakened Form) ───────────────────────── */
  chassisMaxLevel: 5,
  chassisUpgradeCosts: [120, 240, 420, 700],
  chassis: [
    {
      id: 'aegis', name: 'Aegis · Striker', awakenedName: 'Aegis Prime · Seraph', color: '#8ff5ff', cost: 0,
      desc: 'Balanced reactor · +8% Damage & +6% Fire Rate per Lv',
      awakenedDesc: 'AWAKENED: +1 Max HP & +10% Crit Chance',
      hpBonus: 0, damageMult: 1.0, fireRateMult: 1.0, projSpeedMult: 1.0,
      pierce: 0, orbiters: 0, chainChance: 0,
      lvDamage: 0.08, lvFireRate: 0.06, lvSpeed: 0,
      awkHp: 1, awkCrit: 0.10, awkPierce: 0, awkOrbiters: 0, awkShock: false,
    },
    {
      id: 'lancer', name: 'Lancer-X · Railgun', awakenedName: 'Lancer-X · Omega', color: '#ff5964', cost: 180,
      desc: 'Heavy railgun (+75% Dmg, +1 Pierce) · +12% Dmg & +6% Velocity per Lv',
      awakenedDesc: 'AWAKENED: +1 extra Pierce & +35% Crit Damage',
      hpBonus: 0, damageMult: 1.75, fireRateMult: 0.78, projSpeedMult: 1.35,
      pierce: 1, orbiters: 0, chainChance: 0,
      lvDamage: 0.12, lvFireRate: 0.03, lvSpeed: 0.06,
      awkHp: 0, awkCrit: 0, awkCritMult: 0.35, awkPierce: 1, awkOrbiters: 0, awkShock: false,
    },
    {
      id: 'nexus', name: 'Nexus · Carrier', awakenedName: 'Nexus · Overlord', color: '#2effb4', cost: 260,
      desc: 'Starts with 2 Orbiters & +15% Fire Rate · +8% Fire Rate & +12% Orbiter Dmg per Lv',
      awakenedDesc: 'AWAKENED: Starts with 3 Orbiters & wider orbit halo',
      hpBonus: 0, damageMult: 0.85, fireRateMult: 1.15, projSpeedMult: 1.0,
      pierce: 0, orbiters: 2, chainChance: 0,
      lvDamage: 0.05, lvFireRate: 0.08, lvOrbitDmg: 0.12,
      awkHp: 0, awkCrit: 0, awkPierce: 0, awkOrbiters: 1, awkShock: false,
    },
    {
      id: 'volt', name: 'Volt · Tesla', awakenedName: 'Volt · Storm Archon', color: '#c77dff', cost: 350,
      desc: '+28% Chain Lightning · +6% Chain Chance & +8% Damage per Lv',
      awakenedDesc: 'AWAKENED: Starts with Pulse Shockwave & +20% Shards',
      hpBonus: 0, damageMult: 1.05, fireRateMult: 1.05, projSpeedMult: 1.1,
      pierce: 0, orbiters: 0, chainChance: 0.28,
      lvDamage: 0.08, lvFireRate: 0.04, lvChain: 0.06,
      awkHp: 0, awkCrit: 0, awkPierce: 0, awkOrbiters: 0, awkShock: true, awkScore: 0.20,
    },
  ],

  /* ───────────────────────── 18 Boss Runes (Upgradable Lv 1..3 via Rune Mastering) ───────────────────────── */
  maxEquippedRunes: 2,
  runeMaxLevel: 3,
  runeUpgradeCosts: [180, 380],
  runeLevelMults: [1.0, 1.5, 2.0],
  runes: [
    {
      id: 'rune_warden', bossIdx: 0, world: 0, name: 'Warden Bulwark', color: '#ff4d5e',
      bossName: 'The Warden (W1 · W10)',
      desc: '+1 Max HP & +30% Shot Knockback (scales with Rune Lv)',
      icon: '<path class="f" d="M12 2L20 5.5V12c0 5.2-3.5 9.1-8 10.5C7.5 21.1 4 17.2 4 12V5.5z"/><path d="M12 4.8L17.2 7v4.8c0 3.7-2.3 6.5-5.2 7.6-2.9-1.1-5.2-3.9-5.2-7.6V7z"/><polygon class="f" points="12 8 15 11.5 12 16 9 11.5"/><path d="M12 2v2.8M4 5.5l2.8 1.5M20 5.5L17.2 7"/>',
      hp: 1, knockback: 0.30,
    },
    {
      id: 'rune_prism', bossIdx: 1, world: 0, name: 'Prism Lens', color: '#59c8ff',
      bossName: 'The Prism (W1 · W15)',
      desc: '+12% Crit Chance & +20% Projectile Speed',
      icon: '<polygon class="f" points="12 2 21.5 19.5 2.5 19.5"/><polygon points="12 6.2 17.8 17.2 6.2 17.2"/><circle class="f" cx="12" cy="13.5" r="2.6"/><path d="M12 2v4.2M2.5 19.5l3.7-2.3M21.5 19.5l-3.7-2.3M1.5 11l4.5 1.5M22.5 11L18 12.5"/>',
      critChance: 0.12, projSpeed: 0.20,
    },
    {
      id: 'rune_hive', bossIdx: 2, world: 0, name: 'Hive Neural Link', color: '#8ff5ff',
      bossName: 'The Hive Mind (W1 · W20)',
      desc: '+1 Starting Orbiter & +25% Orbiter Damage',
      icon: '<polygon class="f" points="12 2 20.5 7 20.5 17 12 22 3.5 17 3.5 7"/><polygon points="12 5.5 17.2 8.6 17.2 15.4 12 18.5 6.8 15.4 6.8 8.6"/><circle class="f" cx="12" cy="12" r="2.8"/><path d="M12 2v3.5M20.5 7l-3.3 1.6M20.5 17l-3.3-1.6M12 22v-3.5M3.5 17l3.3-1.6M3.5 7l3.3 1.6"/>',
      orbiters: 1, orbitDmg: 0.25,
    },
    {
      id: 'rune_vulcan', bossIdx: 3, world: 1, name: 'Vulcan Igniter', color: '#ff6b4a',
      bossName: 'The Vulcan (W2 · W10)',
      desc: '+20% Damage & shots ignite enemies with Plasma Burn',
      icon: '<path class="f" d="M12 1.8c2.6 4.2 7 6.8 7 11.7a7 7 0 1 1-14 0c0-3.4 1.8-6.2 4.2-8.4 0 2.3 1.6 3.4 2.8 3.4s1.2-2.7 0-6.7z"/><path d="M12 8.5c1.5 2.2 3.6 3.6 3.6 6.2a3.6 3.6 0 1 1-7.2 0c0-1.8.9-3.2 2.1-4.3"/><circle class="f" cx="12" cy="15.2" r="1.8"/>',
      damage: 0.20, burn: true,
    },
    {
      id: 'rune_hellion', bossIdx: 4, world: 1, name: 'Hellion Turbine', color: '#ffbe0b',
      bossName: 'The Hellion (W2 · W15)',
      desc: '+22% Fire Rate & +25% Crit Damage',
      icon: '<circle cx="12" cy="12" r="9.5" stroke-dasharray="4 2.5"/><polygon class="f" points="13.5 2.2 4.8 13.2 11.2 13.2 9.2 21.8 19.2 10.8 12.8 10.8"/><circle cx="12" cy="12" r="2.2"/>',
      fireRate: 0.22, critMult: 0.25,
    },
    {
      id: 'rune_titan', bossIdx: 5, world: 1, name: 'Titan Core Plate', color: '#ff2a55',
      bossName: 'The Iron Titan (W2 · W20)',
      desc: '+2 Max HP & +35% Damage vs Bosses & Elites',
      icon: '<polygon class="f" points="7.5 2 16.5 2 22 7.5 22 16.5 16.5 22 7.5 22 2 16.5 2 7.5"/><rect x="6.5" y="6.5" width="11" height="11" rx="2"/><circle class="f" cx="12" cy="12" r="2.8"/><path d="M12 2v4.5M12 17.5V22M2 12h4.5M17.5 12H22"/>',
      hp: 2, bossDmg: 0.35,
    },
    {
      id: 'rune_singularity', bossIdx: 6, world: 2, name: 'Void Singularity', color: '#c77dff',
      bossName: 'The Singularity (W3 · W10)',
      desc: '+1 Pierce & +1 Ricochet Bounce on every shot',
      icon: '<circle cx="12" cy="12" r="9.5" stroke-dasharray="3 3"/><ellipse cx="12" cy="12" rx="9.5" ry="3.8" transform="rotate(35 12 12)"/><ellipse cx="12" cy="12" rx="9.5" ry="3.8" transform="rotate(-35 12 12)"/><circle class="f" cx="12" cy="12" r="3.8"/>',
      pierce: 1, bounce: 1,
    },
    {
      id: 'rune_chronos', bossIdx: 7, world: 2, name: 'Chronos Hourglass', color: '#00f5d4',
      bossName: 'The Chronos (W3 · W15)',
      desc: 'All enemies move 15% slower permanently & +15% Fire Rate',
      icon: '<circle cx="12" cy="12" r="9.8" stroke-dasharray="2.5 2.5"/><polygon class="f" points="6.5 3.5 17.5 3.5 12 12 17.5 20.5 6.5 20.5 12 12"/><path d="M5 3.5h14M5 20.5h14"/><circle class="f" cx="12" cy="12" r="1.8"/>',
      globalSlow: 0.15, fireRate: 0.15,
    },
    {
      id: 'rune_sovereign', bossIdx: 8, world: 2, name: 'Sovereign Crown', color: '#ff007f',
      bossName: 'The Void Sovereign (W3 · W20)',
      desc: '+30% All Weapon Damage & +35% Shards Earned',
      icon: '<polygon class="f" points="2.5 18.5 4.8 6.5 9.2 12 12 4.5 14.8 12 19.2 6.5 21.5 18.5"/><path d="M2.5 21h19"/><circle class="f" cx="12" cy="15" r="2"/><circle class="f" cx="4.8" cy="4.5" r="1.2"/><circle class="f" cx="12" cy="2.5" r="1.4"/><circle class="f" cx="19.2" cy="4.5" r="1.2"/>',
      damage: 0.30, scoreMult: 0.35,
    },
    {
      id: 'rune_seraph', bossIdx: 9, world: 3, name: 'Seraph Feather', color: '#2eff9c',
      bossName: 'The Aether Seraph (W4 · W10)',
      desc: '+25% Projectile Speed, +15% Fire Rate & +1 Pierce',
      icon: '<path class="f" d="M20.5 3.5C14 4 8 8.5 5 15.5l-2.5 6 6-2.5c7-3 11.5-9 12-15.5z"/><path d="M3.5 20.5L17 7M9 11l-3 1M13 7l-4 1.5M13 15l1-3M17 11l1.5-4"/><circle class="f" cx="16.5" cy="7.5" r="1.8"/>',
      projSpeed: 0.25, fireRate: 0.15, pierce: 1,
    },
    {
      id: 'rune_solaris', bossIdx: 10, world: 3, name: 'Solaris Crest', color: '#ffd23d',
      bossName: 'The Solar Reactor (W4 · W15)',
      desc: '+35% Crit Damage & +15% Crit Chance',
      icon: '<polygon class="f" points="12 1.8 14.6 7.5 20.8 5.2 17.5 10.8 22.2 14.5 16.2 15.8 17.2 21.8 12 18.2 6.8 21.8 7.8 15.8 1.8 14.5 6.5 10.8 3.2 5.2 9.4 7.5"/><circle cx="12" cy="12" r="4.2"/><circle class="f" cx="12" cy="12" r="2"/>',
      critMult: 0.35, critChance: 0.15,
    },
    {
      id: 'rune_architect', bossIdx: 11, world: 3, name: 'Architect Matrix', color: '#00f5d4',
      bossName: 'The Astral Architect (W4 · W20)',
      desc: '+1 Extra Projectile per shot & +25% All Weapon Damage',
      icon: '<polygon class="f" points="12 1.8 21.2 7.2 21.2 16.8 12 22.2 2.8 16.8 2.8 7.2"/><polygon points="12 5 18.2 15.8 5.8 15.8"/><polygon points="12 19 18.2 8.2 5.8 8.2"/><circle class="f" cx="12" cy="12" r="2.6"/>',
      extraProj: 1, damage: 0.25,
    },
    {
      id: 'rune_frostbite', bossIdx: 12, world: 4, name: 'Sunburst Shard', color: '#ffc300',
      bossName: 'The Sunburst (W5 · W10)',
      desc: 'All enemies move 18% slower & +25% Crit Damage',
      icon: '<polygon class="f" points="12 1.5 15 8.5 22.5 12 15 15.5 12 22.5 9 15.5 1.5 12 9 8.5"/><circle cx="12" cy="12" r="3"/><path d="M5 5l14 14M19 5L5 19"/>',
      globalSlow: 0.18, critMult: 0.25,
    },
    {
      id: 'rune_borealis', bossIdx: 13, world: 4, name: 'Horizon Crown', color: '#ff388c',
      bossName: 'The Horizon (W5 · W15)',
      desc: '+1 Ricochet Bounce, +20% Fire Rate & +15% Crit Chance',
      icon: '<polygon class="f" points="12 2 20 8 17 21 7 21 4 8"/><polygon points="12 6 16.5 10 14.5 18 9.5 18 7.5 10"/><circle class="f" cx="12" cy="12" r="2.4"/>',
      bounce: 1, fireRate: 0.20, critChance: 0.15,
    },
    {
      id: 'rune_zero', bossIdx: 14, world: 4, name: 'Chrono Apex Heart', color: '#ffe066',
      bossName: 'The Chrono Monarch (W5 · W20)',
      desc: '+35% Weapon Damage, +1 Pierce & +2 Max HP',
      icon: '<polygon class="f" points="12 1.5 21 6.8 21 17.2 12 22.5 3 17.2 3 6.8"/><polygon class="f" points="12 5.5 17 12 12 18.5 7 12"/><circle class="f" cx="12" cy="12" r="2.2"/>',
      damage: 0.35, pierce: 1, hp: 2,
    },
    {
      id: 'rune_mycelium', bossIdx: 15, world: 5, name: 'Bio-Spore Symbiote', color: '#b8ff2e',
      bossName: 'The Spore Mind (W6 · W10)',
      desc: '+2 Max HP, +1 Starting Orbiter & +30% Orbiter Damage',
      icon: '<circle cx="12" cy="12" r="9.5" stroke-dasharray="3 2"/><circle class="f" cx="12" cy="12" r="4.5"/><circle class="f" cx="12" cy="4.5" r="2"/><circle class="f" cx="18.5" cy="15.8" r="2"/><circle class="f" cx="5.5" cy="15.8" r="2"/>',
      hp: 2, orbiters: 1, orbitDmg: 0.30,
    },
    {
      id: 'rune_quantum', bossIdx: 16, world: 5, name: 'Quantum Tunneling', color: '#ff007f',
      bossName: 'The Phase Shifter (W6 · W15)',
      desc: '+2 Pierce, +30% Projectile Speed & +40% Boss Damage',
      icon: '<ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(30 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(-30 12 12)"/><polygon class="f" points="12 6 16 12 12 18 8 12"/>',
      pierce: 2, projSpeed: 0.30, bossDmg: 0.40,
    },
    {
      id: 'rune_overmind', bossIdx: 17, world: 5, name: 'Omega Overmind', color: '#00f5d4',
      bossName: 'The Bio-Overmind (W6 · W20)',
      desc: '+1 Extra Projectile, +35% All Damage & +40% Shards Earned',
      icon: '<polygon class="f" points="12 1.5 22 8.5 18.5 21.5 5.5 21.5 2 8.5"/><polygon points="12 5 18.5 10 16 18.5 8 18.5 5.5 10"/><circle class="f" cx="12" cy="12" r="3.2"/>',
      extraProj: 1, damage: 0.35, scoreMult: 0.40,
    },
  ],

  /* ───────────────────────── Expanded 5-Category Shop (Cosmetics & Boosters) ───────────────────────── */
  cosmetics: {
    bulletSkins: [
      { id: 'default', name: 'Cyber Plasma', cost: 0, color: null, style: 'bolt', desc: 'Standard high-velocity plasma bolt' },
      { id: 'laser', name: 'Crimson Beam', cost: 200, color: '#ff2a55', style: 'laser', desc: 'Focused high-energy crimson needle lance' },
      { id: 'star', name: 'Solar Shuriken', cost: 320, color: '#ffd23d', style: 'star', desc: 'Spinning golden star-flare projectile' },
      { id: 'void', name: 'Void Crescent', cost: 450, color: '#c77dff', style: 'crescent', desc: 'Dark-matter crescent wave with violet trail' },
      { id: 'emerald', name: 'Aether Prism', cost: 600, color: '#2eff9c', style: 'diamond', desc: 'Crystalline sanctum diamond lance' },
      { id: 'rose', name: 'Rose Quartz Lance', cost: 750, color: '#ff388c', style: 'laser', desc: 'High-luminance magenta chronal beam' },
      { id: 'quantum', name: 'Quantum Star', cost: 900, color: '#b8ff2e', style: 'star', desc: 'Bio-quantum acid-green hyper star' },
    ],
    killEffects: [
      { id: 'default', name: 'Neon Shatter', cost: 0, color: null, desc: 'Standard geometric shard burst' },
      { id: 'nova', name: 'Supernova Rings', cost: 220, color: '#ffd23d', desc: 'Twin expanding golden shock rings on every kill' },
      { id: 'glitch', name: 'Cyber Arc', cost: 350, color: '#00f5d4', desc: 'High-voltage cyan micro-bolts & sparks on kill' },
      { id: 'void', name: 'Void Collapse', cost: 500, color: '#c77dff', desc: 'Singularity implosion ring & violet flare' },
      { id: 'crimson', name: 'Crimson Eruption', cost: 650, color: '#ff4d5e', desc: 'Volatile red plasma eruption & heavy sparks' },
      { id: 'emerald', name: 'Emerald Matrix', cost: 780, color: '#2eff9c', desc: 'Sanctum geometric ring & emerald sparks' },
      { id: 'solar', name: 'Solar Flare', cost: 920, color: '#ffc300', desc: 'Blinding amber corona & twin shock rings' },
    ],
    coreAuras: [
      { id: 'default', name: 'Standard Reactor', cost: 0, color: null, desc: 'Clean default Core reactor glow' },
      { id: 'runic', name: 'Runic Hex-Halo', cost: 260, color: '#8ff5ff', desc: 'Rotating sacred geometry hex-ring around the Core' },
      { id: 'binary', name: 'Cyber Telemetry', cost: 400, color: '#00f5d4', desc: 'Counter-rotating data arcs & orbital nodes' },
      { id: 'solar', name: 'Solar Corona', cost: 560, color: '#ffd23d', desc: 'Radiant golden star-crown orbiting the Core' },
      { id: 'void', name: 'Event Horizon', cost: 720, color: '#c77dff', desc: 'Swirling dark-matter accretion vortex' },
      { id: 'seraph', name: 'Seraph Halo', cost: 900, color: '#2eff9c', desc: 'Dual celestial emerald rings & diamond satellites' },
    ],
    shockStyles: [
      { id: 'default', name: 'World Sync', cost: 0, color: null, desc: 'Shockwaves match the active World theme color' },
      { id: 'gold', name: 'Golden Supernova', cost: 240, color: '#ffd23d', desc: 'Radiant gold & white double-ring shockwaves' },
      { id: 'crimson', name: 'Hellfire Pulse', cost: 380, color: '#ff4d5e', desc: 'High-intensity crimson & amber blast rings' },
      { id: 'void', name: 'Singularity Ripple', cost: 520, color: '#c77dff', desc: 'Deep violet & cyan gravitational wave' },
      { id: 'prismatic', name: 'Prismatic Spectrum', cost: 750, color: '#ff388c', desc: 'Color-shifting neon cyber-spectrum shockwave' },
    ],
    boosters: [
      {
        id: 'boost_overcharge',
        name: 'Overcharge Core',
        cost: 80,
        color: '#ff4d5e',
        desc: 'NEXT RUN: Start with +35% Weapon Damage & +20% Fire Rate',
      },
      {
        id: 'boost_aegis',
        name: 'Reinforced Plating',
        cost: 90,
        color: '#4db8ff',
        desc: 'NEXT RUN: Start with +2 Max HP & an active Energy Shield',
      },
      {
        id: 'boost_shards',
        name: 'Shard Extractor Pod',
        cost: 100,
        color: '#ffd23d',
        desc: 'NEXT RUN: Earn +50% bonus Shards from all sources',
      },
      {
        id: 'boost_headstart',
        name: 'Mythic Beacon',
        cost: 120,
        color: '#2eff9c',
        desc: 'NEXT RUN: Begin Wave 1 with +2 extra random upgrades',
      },
    ],
  },

  /* ───────────────────────── Anomaly / Mutator Waves ───────────────────────── */
  anomalies: {
    minWave: 4,
    chance: 0.26,
    types: [
      {
        id: 'swarm',
        name: 'Swarm Blitz',
        sub: 'High-speed interceptors · +40% Score',
        budgetMult: 1.35,
        hpMult: 0.7,
        speedMult: 1.15,
        scoreMult: 1.4,
      },
      {
        id: 'elite',
        name: 'Elite Guard',
        sub: 'Armoured Golden Elites · 2× Shards & Score',
        budgetMult: 0.68,
        hpMult: 1.85,
        speedMult: 0.94,
        scoreMult: 2.0,
        elite: true,
      },
      {
        id: 'storm',
        name: 'Ion Storm',
        sub: 'Cosmic lightning strikes the battlefield',
        budgetMult: 1.12,
        hpMult: 1.0,
        speedMult: 1.0,
        scoreMult: 1.25,
        stormInterval: 1.35,
      },
    ],
  },

  /* ───────────────────────── Battlefield Power-up Capsules ───────────────────────── */
  powerups: {
    minWave: 2,
    chancePerWave: 0.50,
    lifeTime: 10.0,
    frenzyDuration: 6.0,
    cryoDuration: 4.5,
    surgeDuration: 6.0,
  },

  /* ───────────────────────── 18 Achievements & Bounties ───────────────────────── */
  achievements: [
    { id: 'firstBoss', name: 'First Blood', desc: 'Defeat your first Boss', reward: 40 },
    { id: 'boss10', name: 'Titan Slayer', desc: 'Defeat 10 Bosses across all runs', reward: 110 },
    { id: 'perfect5', name: 'Untouchable', desc: 'Complete 5 Perfect Waves in total', reward: 60 },
    { id: 'perfect20', name: 'Flawless Commander', desc: 'Complete 20 Perfect Waves in total', reward: 150 },
    { id: 'combo5', name: 'Combo Master', desc: 'Reach the maximum ×5 combo multiplier', reward: 50 },
    { id: 'loot5', name: 'Vault Hunter', desc: 'Destroy 5 Golden Vault Drones', reward: 75 },
    { id: 'loot20', name: 'Treasure Raider', desc: 'Destroy 20 Golden Vault Drones', reward: 180 },
    { id: 'synergy1', name: 'Synergy Architect', desc: 'Unlock any Mythic Synergy Evolution card', reward: 80 },
    { id: 'relic1', name: 'Relic Seeker', desc: 'Claim a Boss Relic after Wave 10 or 15', reward: 90 },
    { id: 'awakened1', name: 'Awakened Reactor', desc: 'Upgrade any Core Chassis to Level 5 (Awakened)', reward: 160 },
    { id: 'armoryAll', name: 'Full Arsenal', desc: 'Unlock all 4 Core Chassis in the Armory', reward: 200 },
    { id: 'tree10', name: 'Neural Architect', desc: 'Purchase 10 total upgrades in the Skill Tree', reward: 120 },
    { id: 'world1', name: 'Nexus Conqueror', desc: 'Complete World I on Hard difficulty', reward: 150 },
    { id: 'world2', name: 'Forge Master', desc: 'Complete World II on Hard difficulty', reward: 250 },
    { id: 'world3', name: 'Lord of the Void', desc: 'Complete World III on Hard difficulty', reward: 400 },
    { id: 'world4', name: 'Sanctum Ascendant', desc: 'Complete World IV on Hard difficulty', reward: 600 },
    { id: 'world5', name: 'Solaris Sovereign', desc: 'Complete World V on Hard difficulty', reward: 850 },
    { id: 'world6', name: 'Quantum Overlord', desc: 'Complete World VI on Hard difficulty', reward: 1200 },
  ],

  /* ───────────────────────── The Core (player) ───────────────────────── */
  core: {
    radius: 24,
    baseHp: 3,
    hpCap: 15,
    invuln: 0.6,
    fireRate: 2.6,
    damage: 1,
    projectileSpeed: 640,
    projectileRadius: 4,
    projectileRange: 480,
    knockback: 110,
    spread: 0.15,
    tapBuffer: 0.14,
    aimAssist: { range: 22, strength: 0.6 },
  },

  /* ───────────────────────── Game feel ───────────────────────── */
  feel: {
    hitStopScale: 0.2,
    hitStopTime: 0.34,
    flashTime: 0.09,
    spawnTime: 0.35,
    shake: { hit: 15, kill: 1.1, bigKill: 3.2, bossKill: 22, decay: 9 },
    vibrate: {
      kill: 7, killGap: 0.09, damage: 60,
      waveClear: [20, 40, 20, 40, 70], record: [30, 60, 30, 60, 140],
    },
  },

  /* ───────────────────────── Scoring & shards ───────────────────────── */
  scoring: {
    combo: { max: 5, killsPerLevel: 6, timeout: 2.4, decayEvery: 0.4 },
    perfectWave: { base: 100, perWave: 50 },
    boss: { base: 400, perWave: 80, heal: 1 },
    shards: { perScore: 0.002, perWave: 4, waveExp: 1.15 },
    lootDrone: { chancePerWave: 0.45, minWave: 3, bonusShards: 12 },
  },

  /* ───────────────────────── Enemies (24 World + 3 Tactical + Special Units) ───────────────────────── */
  enemies: {
    // ═══ WORLD 1: Cyber Nexus ═══
    triangle: {
      name: 'Dart', world: 0, color: '#ff4fd8', unlock: 1, cost: 1, weight: 10,
      hp: 1.0, speed: 54, radius: 13, points: 10, behavior: 'seek', shards: 7,
    },
    square: {
      name: 'Bulwark', world: 0, color: '#ffb02e', unlock: 2, cost: 2.8, weight: 6,
      hp: 3.0, speed: 32, radius: 17, points: 30, behavior: 'seek', shards: 10,
    },
    diamond: {
      name: 'Needle', world: 0, color: '#c6ff3d', unlock: 4, cost: 2, weight: 7,
      hp: 0.85, speed: 106, radius: 12, points: 22, behavior: 'seek', shards: 8,
    },
    hexagon: {
      name: 'Hive Carrier', world: 0, color: '#8ff5ff', unlock: 6, cost: 3.8, weight: 5,
      hp: 2.4, speed: 40, radius: 17, points: 42, behavior: 'seek', shards: 12,
      split: { type: 'shard', count: 2 },
    },

    // ═══ WORLD 2: Crimson Forge ═══
    pulsar: {
      name: 'Pyre Weaver', world: 1, color: '#ff6b4a', unlock: 1, cost: 1.2, weight: 10,
      hp: 1.25, speed: 66, radius: 14, points: 18, behavior: 'zigzag', waveAmp: 0.68, waveFreq: 5.2, shards: 9,
    },
    crusher: {
      name: 'Magma Crusher', world: 1, color: '#ff9e00', unlock: 2, cost: 3.2, weight: 6,
      hp: 3.8, speed: 30, radius: 19, points: 38, behavior: 'seek', knockResist: 0.45, shards: 12,
    },
    mender: {
      name: 'Forge Mender', world: 1, color: '#70e000', unlock: 4, cost: 3.5, weight: 4.5,
      hp: 2.5, speed: 38, radius: 16, points: 48, behavior: 'mend', healInterval: 2.5, healRadius: 115, healAmount: 0.9, shards: 12,
    },
    lancer: {
      name: 'Rail Lancer', world: 1, color: '#ff2a55', unlock: 6, cost: 4.0, weight: 4.5,
      hp: 2.1, speed: 50, radius: 15, points: 55, behavior: 'sniper', stopDist: 210, fireInterval: 2.7, orbSpeed: 100, shards: 13,
    },

    // ═══ WORLD 3: Void Singularity ═══
    spiral: {
      name: 'Void Vortex', world: 2, color: '#00f5d4', unlock: 1, cost: 1.4, weight: 10,
      hp: 1.4, speed: 58, radius: 14, points: 25, behavior: 'spiral', swirl: 1.05, shards: 10,
    },
    phantom: {
      name: 'Phase Stalker', world: 2, color: '#e066ff', unlock: 2, cost: 2.8, weight: 7,
      hp: 1.8, speed: 58, radius: 14, points: 45, behavior: 'blink', blinkInterval: 2.8, blinkDist: 64, shards: 11,
    },
    specter: {
      name: 'Null Specter', world: 2, color: '#72efdd', unlock: 4, cost: 3.2, weight: 6,
      hp: 1.5, speed: 84, radius: 13, points: 52, behavior: 'zigzag', waveAmp: 0.85, waveFreq: 6.4, shards: 12,
      split: { type: 'shard', count: 2 },
    },
    colossus: {
      name: 'Astral Behemoth', world: 2, color: '#ffbe0b', unlock: 6, cost: 5.2, weight: 4,
      hp: 5.8, speed: 26, radius: 22, points: 85, behavior: 'seek', knockResist: 0.65, shards: 18,
      split: { type: 'shard', count: 3 },
    },

    // ═══ WORLD 4: Astral Sanctum ═══
    seraph: {
      name: 'Aether Wing', world: 3, color: '#2eff9c', unlock: 1, cost: 1.5, weight: 10,
      hp: 1.6, speed: 74, radius: 14, points: 32, behavior: 'zigzag', waveAmp: 0.75, waveFreq: 5.8, shards: 11,
    },
    bastion: {
      name: 'Sanctum Aegis', world: 3, color: '#ffd23d', unlock: 2, cost: 3.6, weight: 6,
      hp: 4.8, speed: 32, radius: 20, points: 60, behavior: 'seek', knockResist: 0.55, shards: 14,
    },
    oracle: {
      name: 'Chrono Weaver', world: 3, color: '#00f5d4', unlock: 4, cost: 3.8, weight: 5,
      hp: 2.9, speed: 44, radius: 16, points: 68, behavior: 'mend', healInterval: 2.3, healRadius: 125, healAmount: 1.1, shards: 14,
    },
    archon: {
      name: 'Solar Archon', world: 3, color: '#ff9e00', unlock: 6, cost: 4.8, weight: 4.5,
      hp: 3.4, speed: 48, radius: 18, points: 90, behavior: 'sniper', stopDist: 205, fireInterval: 2.4, orbSpeed: 112, shards: 16,
      split: { type: 'shard', count: 2 },
    },

    // ═══ WORLD 5: Chrono-Solaris Lab ═══
    icicle: {
      name: 'Solar Lancer', world: 4, color: '#ffc300', unlock: 1, cost: 1.6, weight: 10,
      hp: 1.7, speed: 62, radius: 13, points: 38, behavior: 'icicle', shards: 12,
    },
    glacier: {
      name: 'Amber Golem', world: 4, color: '#ff9e00', unlock: 2, cost: 3.8, weight: 6,
      hp: 5.2, speed: 30, radius: 20, points: 72, behavior: 'seek', knockResist: 0.6, shards: 15,
      frostNova: 85,
    },
    mirage: {
      name: 'Mirage Striker', world: 4, color: '#ff388c', unlock: 4, cost: 3.2, weight: 6,
      hp: 2.3, speed: 78, radius: 14, points: 64, behavior: 'mirage', shards: 13,
    },
    weaver: {
      name: 'Time Weaver', world: 4, color: '#ffe066', unlock: 6, cost: 4.6, weight: 4.5,
      hp: 3.6, speed: 44, radius: 17, points: 95, behavior: 'sniper', stopDist: 200, fireInterval: 2.3, orbSpeed: 115, shards: 16,
    },

    // ═══ WORLD 6: Quantum Bio-Hive ═══
    spore: {
      name: 'Bio-Regenerator', world: 5, color: '#b8ff2e', unlock: 1, cost: 1.7, weight: 10,
      hp: 2.2, speed: 64, radius: 14, points: 45, behavior: 'spore', regenRate: 0.65, shards: 12,
    },
    shifter: {
      name: 'Phase Shifter', world: 5, color: '#ff007f', unlock: 2, cost: 3.4, weight: 6.5,
      hp: 2.6, speed: 68, radius: 14, points: 70, behavior: 'shifter', phaseInterval: 3.2, shards: 14,
    },
    brood: {
      name: 'Brood Carrier', world: 5, color: '#00f5d4', unlock: 4, cost: 4.2, weight: 5,
      hp: 4.0, speed: 38, radius: 18, points: 88, behavior: 'brood', broodInterval: 3.6, shards: 16,
      split: { type: 'shard', count: 2 },
    },
    juggernaut: {
      name: 'Hive Juggernaut', world: 5, color: '#ffd23d', unlock: 6, cost: 5.6, weight: 4,
      hp: 6.8, speed: 28, radius: 22, points: 115, behavior: 'seek', knockResist: 0.7, shards: 20,
      split: { type: 'shard', count: 3 },
    },

    // ═══ 3 TACTICAL ENEMIES ═══
    leech: {
      name: 'Gravity Leech', color: '#ff38ab', unlock: 3, cost: 2.4, weight: 3.2,
      hp: 1.7, speed: 76, radius: 13, points: 42, behavior: 'leech',
      orbitDist: 64, drainRate: 0.16, shards: 11, isTactical: true,
    },
    linker: {
      name: 'Shield Linker', color: '#00f5d4', unlock: 4, cost: 3.2, weight: 2.8,
      hp: 2.3, speed: 46, radius: 15, points: 58, behavior: 'linker',
      hoverDist: 175, linkRange: 250, shards: 13, isTactical: true,
    },
    portal: {
      name: 'Splitter Portal', color: '#9b5de5', unlock: 5, cost: 4.4, weight: 2.2,
      hp: 4.2, speed: 12, radius: 20, points: 80, behavior: 'portal',
      hoverDist: 225, spawnInterval: 3.4, shards: 16, isTactical: true, knockResist: 0.85,
    },

    // ═══ Special & Arena Units ═══
    loot: {
      name: 'Vault Drone', color: '#ffd23d',
      hp: 2.2, speed: 90, radius: 15, points: 150, behavior: 'flyby', shards: 22, isLoot: true,
    },
    capsule: {
      name: 'Supply Pod', color: '#38f9d7',
      hp: 1.2, speed: 14, radius: 15, points: 75, behavior: 'capsule', shards: 14, isCapsule: true,
    },
    magmaRock: {
      name: 'Magma Rock', color: '#ff5400',
      hp: 1.8, speed: 18, radius: 18, points: 45, behavior: 'capsule', shards: 12, isMagma: true,
    },
    aetherPylon: {
      name: 'Aether Pylon', color: '#2eff9c',
      hp: 1.6, speed: 15, radius: 17, points: 65, behavior: 'capsule', shards: 14, isPylon: true,
    },
    prismNode: {
      name: 'Prism Refractor', color: '#ffc300',
      hp: 2.0, speed: 14, radius: 17, points: 70, behavior: 'capsule', shards: 14, isPrism: true,
    },
    shard: {
      name: 'Shard', color: '#d3baff',
      hp: 0.6, speed: 88, radius: 8, points: 6, behavior: 'seek', shards: 4,
    },
    orb: {
      name: 'Orb', color: '#ff7a6b',
      hp: 0.5, speed: 90, radius: 7, points: 0, behavior: 'bolt', shards: 4,
    },
  },

  /* ───────────────────────── 18 Bosses (3 per World across 6 Worlds) ───────────────────────── */
  bosses: [
    // ═══ WORLD 1 BOSSES (0, 1, 2) ═══
    {
      name: 'The Warden', world: 0, waveTag: 'Wave 10 Boss', color: '#ff4d5e', sides: 6, radius: 45, hp: 68, speed: 34,
      hover: 175, orbit: 0.22, interval: 4.1, shieldSpan: 1.3, shieldSpin: 0.6,
      summon: { types: ['triangle', 'square'], count: 4 }, fan: { count: 5, arc: 0.9, speed: 95 },
    },
    {
      name: 'The Prism', world: 0, waveTag: 'Wave 15 Boss', color: '#59c8ff', sides: 4, radius: 46, hp: 88, speed: 35,
      hover: 182, orbit: 0.28, interval: 3.8, shieldSpan: 1.45, shieldSpin: -0.75,
      summon: { types: ['diamond', 'triangle'], count: 4 }, fan: { count: 7, arc: 1.3, speed: 105 },
    },
    {
      name: 'The Hive Mind', world: 0, waveTag: 'Wave 20 Boss', color: '#8ff5ff', sides: 8, radius: 50, hp: 112, speed: 34,
      hover: 178, orbit: 0.20, interval: 3.5, shieldSpan: 1.55, shieldSpin: 0.65,
      summon: { types: ['hexagon', 'diamond', 'square'], count: 5 }, fan: { count: 9, arc: 1.7, speed: 112 },
    },

    // ═══ WORLD 2 BOSSES (3, 4, 5) ═══
    {
      name: 'The Vulcan', world: 1, waveTag: 'Wave 10 Boss', color: '#ff6b4a', sides: 6, radius: 46, hp: 78, speed: 34,
      hover: 175, orbit: 0.24, interval: 3.9, shieldSpan: 1.4, shieldSpin: 0.7,
      summon: { types: ['pulsar', 'crusher'], count: 4 }, fan: { count: 7, arc: 1.2, speed: 102 },
    },
    {
      name: 'The Hellion', world: 1, waveTag: 'Wave 15 Boss', color: '#ffbe0b', sides: 5, radius: 48, hp: 98, speed: 36,
      hover: 180, orbit: 0.30, interval: 3.6, shieldSpan: 1.5, shieldSpin: -0.8,
      summon: { types: ['pulsar', 'mender', 'lancer'], count: 5 }, fan: { count: 9, arc: 1.6, speed: 110 },
    },
    {
      name: 'The Iron Titan', world: 1, waveTag: 'Wave 20 Boss', color: '#ff2a55', sides: 8, radius: 52, hp: 128, speed: 33,
      hover: 172, orbit: 0.22, interval: 3.3, shieldSpan: 1.65, shieldSpin: 0.75,
      summon: { types: ['crusher', 'mender', 'lancer'], count: 5 }, fan: { count: 11, arc: 2.0, speed: 118 },
    },

    // ═══ WORLD 3 BOSSES (6, 7, 8) ═══
    {
      name: 'The Singularity', world: 2, waveTag: 'Wave 10 Boss', color: '#c77dff', sides: 6, radius: 47, hp: 86, speed: 36,
      hover: 176, orbit: 0.28, interval: 3.7, shieldSpan: 1.45, shieldSpin: -0.8,
      summon: { types: ['spiral', 'phantom'], count: 4 }, fan: { count: 8, arc: 1.5, speed: 108 },
    },
    {
      name: 'The Chronos', world: 2, waveTag: 'Wave 15 Boss', color: '#00f5d4', sides: 8, radius: 49, hp: 110, speed: 37,
      hover: 180, orbit: 0.32, interval: 3.4, shieldSpan: 1.55, shieldSpin: 0.85,
      summon: { types: ['phantom', 'specter', 'spiral'], count: 5 }, fan: { count: 10, arc: 1.9, speed: 115 },
    },
    {
      name: 'The Void Sovereign', world: 2, waveTag: 'Wave 20 Boss', color: '#ff007f', sides: 8, radius: 54, hp: 145, speed: 35,
      hover: 170, orbit: 0.25, interval: 3.1, shieldSpan: 1.7, shieldSpin: -0.9,
      summon: { types: ['colossus', 'specter', 'phantom'], count: 6 }, fan: { count: 13, arc: 2.4, speed: 122 },
    },

    // ═══ WORLD 4 BOSSES (9, 10, 11) ═══
    {
      name: 'The Aether Seraph', world: 3, waveTag: 'Wave 10 Boss', color: '#2eff9c', sides: 6, radius: 48, hp: 96, speed: 37,
      hover: 176, orbit: 0.30, interval: 3.5, shieldSpan: 1.5, shieldSpin: 0.85,
      summon: { types: ['seraph', 'bastion'], count: 5 }, fan: { count: 9, arc: 1.7, speed: 114 },
    },
    {
      name: 'The Solar Reactor', world: 3, waveTag: 'Wave 15 Boss', color: '#ffd23d', sides: 8, radius: 51, hp: 124, speed: 37,
      hover: 178, orbit: 0.32, interval: 3.2, shieldSpan: 1.6, shieldSpin: -0.9,
      summon: { types: ['seraph', 'oracle', 'archon'], count: 5 }, fan: { count: 11, arc: 2.1, speed: 120 },
    },
    {
      name: 'The Astral Architect', world: 3, waveTag: 'Wave 20 Boss', color: '#00f5d4', sides: 8, radius: 56, hp: 165, speed: 36,
      hover: 168, orbit: 0.28, interval: 2.9, shieldSpan: 1.75, shieldSpin: 0.95,
      summon: { types: ['bastion', 'oracle', 'archon'], count: 6 }, fan: { count: 15, arc: 2.6, speed: 128 },
    },

    // ═══ WORLD 5 BOSSES (12, 13, 14) ═══
    {
      name: 'The Sunburst', world: 4, waveTag: 'Wave 10 Boss', color: '#ffc300', sides: 6, radius: 48, hp: 108, speed: 37,
      hover: 175, orbit: 0.30, interval: 3.4, shieldSpan: 1.55, shieldSpin: -0.88,
      summon: { types: ['icicle', 'glacier'], count: 5 }, fan: { count: 9, arc: 1.8, speed: 116 },
    },
    {
      name: 'The Horizon', world: 4, waveTag: 'Wave 15 Boss', color: '#ff388c', sides: 8, radius: 51, hp: 138, speed: 38,
      hover: 178, orbit: 0.34, interval: 3.1, shieldSpan: 1.65, shieldSpin: 0.92,
      summon: { types: ['mirage', 'icicle', 'weaver'], count: 5 }, fan: { count: 11, arc: 2.2, speed: 122 },
    },
    {
      name: 'The Chrono Monarch', world: 4, waveTag: 'Wave 20 Boss', color: '#ffe066', sides: 8, radius: 55, hp: 178, speed: 36,
      hover: 168, orbit: 0.28, interval: 2.8, shieldSpan: 1.75, shieldSpin: -0.96,
      summon: { types: ['glacier', 'mirage', 'weaver'], count: 6 }, fan: { count: 15, arc: 2.6, speed: 128 },
    },

    // ═══ WORLD 6 BOSSES (15, 16, 17) ═══
    {
      name: 'The Spore Mind', world: 5, waveTag: 'Wave 10 Boss', color: '#b8ff2e', sides: 6, radius: 49, hp: 118, speed: 37,
      hover: 175, orbit: 0.30, interval: 3.3, shieldSpan: 1.55, shieldSpin: 0.88,
      summon: { types: ['spore', 'shifter'], count: 5 }, fan: { count: 10, arc: 1.9, speed: 118 },
    },
    {
      name: 'The Phase Shifter', world: 5, waveTag: 'Wave 15 Boss', color: '#ff007f', sides: 8, radius: 52, hp: 150, speed: 38,
      hover: 176, orbit: 0.34, interval: 3.0, shieldSpan: 1.68, shieldSpin: -0.94,
      summon: { types: ['shifter', 'brood', 'spore'], count: 6 }, fan: { count: 12, arc: 2.3, speed: 124 },
    },
    {
      name: 'The Bio-Overmind', world: 5, waveTag: 'Wave 20 Boss', color: '#00f5d4', sides: 8, radius: 57, hp: 195, speed: 36,
      hover: 166, orbit: 0.28, interval: 2.7, shieldSpan: 1.80, shieldSpin: 1.0,
      summon: { types: ['juggernaut', 'brood', 'shifter'], count: 6 }, fan: { count: 16, arc: 2.7, speed: 132 },
    },
  ],

  /* ───────────────────────── Waves ───────────────────────── */
  waves: {
    breakTime: 2.8,
    clearDelay: 0.9,
    bossEvery: 5,
    startDelay: 0.6,
    budget: { base: 3.5, linear: 3.5, quad: 0.28 },
    bossBudget: 0.45,
    duration: { base: 10, perWave: 0.5, max: 22 },
    hpScale: { linear: 0.055, quad: 0.020 },
    speedScale: { linear: 0.016, max: 2.0 },
    bossHp: 1.65,
    groupSize: {
      triangle: [1, 3], square: [1, 2], diamond: [1, 3], hexagon: [1, 2],
      pulsar: [1, 3], crusher: [1, 2], mender: [1, 1], lancer: [1, 2],
      spiral: [1, 3], phantom: [1, 2], specter: [1, 3], colossus: [1, 1],
      seraph: [1, 3], bastion: [1, 2], oracle: [1, 1], archon: [1, 2],
      icicle: [1, 3], glacier: [1, 2], mirage: [1, 2], weaver: [1, 2],
      spore: [1, 3], shifter: [1, 2], brood: [1, 2], juggernaut: [1, 1],
      leech: [1, 2], linker: [1, 1], portal: [1, 1],
    },
    groupGrowth: 0.05,
    introCount: 2,
    newTypeBoost: 2.2,
    spawnGap: 0.14,
  },

  /* ───────────────────────── Run Upgrades, Synergies, Boss Relics & Corrupted Cards ───────────────────────── */
  upgrades: {
    fireRate: { max: 8, weight: 10, perLevel: 0.12 },
    damage: { max: 8, weight: 10, perLevel: 0.30 },
    multiShot: { max: 4, weight: 7 },
    piercing: { max: 3, weight: 7 },
    projSpeed: { max: 4, weight: 6, perLevel: 0.15 },
    shockwave: { max: 5, weight: 6, interval: 10, intervalStep: 1.3, radius: 150, radiusStep: 22, damage: 1.6, damageStep: 0.5, knock: 320, speed: 520 },
    orbiters: { max: 5, weight: 6, radius: 58, speed: 2.6, damage: 0.8, cooldown: 0.3, size: 6 },
    shield: { max: 3, weight: 5, recharge: [4, 3, 2] },
    heal: { max: 99, weight: 8 },
    critical: { max: 5, weight: 7, perLevel: 0.08, mult: 2 },
    slowField: { max: 4, weight: 5, radius: 110, radiusStep: 18, slow: 0.22, slowStep: 0.07 },
    chain: { max: 5, weight: 5, perLevel: 0.14, range: 120, damage: 0.65 },
    blast: { max: 4, weight: 5, radius: 42, radiusStep: 12, damage: 0.38, damageStep: 0.12 },
    ricochet: { max: 3, weight: 5, range: 145 },
    vamp: { max: 3, weight: 4, killsNeeded: [28, 20, 14] },
    execute: { max: 3, weight: 4, threshold: 0.12, step: 0.06 },
    overclock: { max: 4, weight: 5, critBonus: 0.04, multStep: 0.45 },
    thorns: { max: 3, weight: 4, radius: 260, damage: 2.5, damageStep: 1.25, knock: 420 },
    homing: { max: 3, weight: 5, turnRate: 2.2, range: 150 },
    scholar: { max: 4, weight: 5, perLevel: 0.18 },
    // 4 Mythic Synergies
    evoPrism: { max: 1, weight: 14, req: ['multiShot', 'ricochet'], minLv: 2 },
    evoTesla: { max: 1, weight: 14, req: ['orbiters', 'chain'], minLv: 2, arcInterval: 0.55, arcRange: 115 },
    evoCryo: { max: 1, weight: 14, req: ['shockwave', 'slowField'], minLv: 2, chillDur: 2.8 },
    evoNova: { max: 1, weight: 14, req: ['critical', 'blast'], minLv: 2, radius: 68, damage: 0.85 },
    // 4 Boss Relics
    relicTwin: { max: 1, weight: 20, bossRelic: true, offset: 7 },
    relicBurn: { max: 1, weight: 20, bossRelic: true, duration: 3.0, dpsRatio: 0.45 },
    relicChrono: { max: 1, weight: 20, bossRelic: true, globalSlow: 0.18 },
    relicTitan: { max: 1, weight: 20, bossRelic: true, bossMult: 1.45, dmgBonus: 0.25 },
    // 4 Corrupted Cards
    corruptGlass: { max: 2, weight: 5, corrupted: true, dmgBonus: 1.0, rangePenalty: 0.30 },
    corruptShield: { max: 1, weight: 5, corrupted: true, fireRateBonus: 0.85 },
    corruptCaliber: { max: 2, weight: 5, corrupted: true, dmgBonus: 1.40, pierceBonus: 2, ratePenalty: 0.35 },
    corruptBlood: { max: 2, weight: 5, corrupted: true, critChance: 0.20, critMult: 0.75, hpPenalty: 1 },
  },
  rarity: {
    weights: { common: 62, rare: 28, epic: 10 },
    waveShift: 0.45,
    maxShift: 20,
    gain: { common: 1, rare: 2, epic: 3, mythic: 1, corrupted: 1 },
  },

  /* ───────────────────────── 33-Node Branching Skill Tree (meta) ───────────────────────── */
  meta: {
    maxLevel: 5,
    coreAwaken: { max: 1, perLevel: 1, costs: [0] },
    runeSlot: { max: 1, perLevel: 1, costs: [420] },

    // Offense Branch
    damage: { max: 5, perLevel: 0.08, costs: [45, 110, 240, 450, 800] },
    fireRate: { max: 5, perLevel: 0.06, costs: [45, 110, 240, 450, 800] },
    critRate: { max: 5, perLevel: 0.03, costs: [70, 160, 320, 580, 950] },
    critDmg: { max: 5, perLevel: 0.12, costs: [80, 180, 360, 640, 1050] },
    bossSlayer: { max: 5, perLevel: 0.08, costs: [90, 200, 400, 720, 1200] },
    overpierce: { max: 3, perLevel: 1, costs: [180, 450, 950] },
    capOmega: { max: 1, perLevel: 1, costs: [1400] },

    // Defense Branch
    hp: { max: 5, perLevel: 1, costs: [80, 180, 380, 680, 1100] },
    blastGuard: { max: 5, perLevel: 0.15, costs: [70, 150, 310, 560, 900] },
    aegisStart: { max: 3, perLevel: 1, costs: [120, 300, 650] },
    hullRegen: { max: 3, perLevel: 1, costs: [140, 340, 720] },
    thornsStart: { max: 3, perLevel: 1, costs: [160, 380, 780] },
    invulnBoost: { max: 5, perLevel: 0.15, costs: [90, 210, 420, 740, 1150] },
    capPhoenix: { max: 1, perLevel: 1, costs: [1400] },

    // Tactical Branch
    projVelocity: { max: 5, perLevel: 0.06, costs: [50, 120, 250, 460, 780] },
    aimMagnet: { max: 5, perLevel: 0.10, costs: [60, 130, 270, 490, 820] },
    shockAmp: { max: 5, perLevel: 0.08, costs: [75, 165, 330, 600, 980] },
    orbitAmp: { max: 5, perLevel: 0.10, costs: [85, 190, 380, 680, 1100] },
    arenaAmp: { max: 5, perLevel: 0.08, costs: [95, 220, 440, 780, 1200] },
    startBounce: { max: 2, perLevel: 1, costs: [260, 680] },
    capInterceptor: { max: 1, perLevel: 1, costs: [1400] },

    // Economy Branch
    shardGain: { max: 5, perLevel: 0.10, costs: [55, 130, 280, 500, 860] },
    rerolls: { max: 5, perLevel: 1, costs: [60, 140, 280, 500, 850] },
    extraChoice: { max: 5, chance: [0.2, 0.4, 0.6, 0.8, 1], costs: [80, 180, 360, 650, 1100] },
    startUpgrade: { max: 5, perLevel: 1, costs: [70, 160, 320, 560, 950] },
    podRate: { max: 5, perLevel: 0.08, costs: [85, 190, 380, 680, 1100] },
    capSingularity: { max: 1, perLevel: 1, costs: [1400] },

    // 4 Cross-Branch Bridge Nodes
    brVamp: { max: 1, perLevel: 1, costs: [650] },
    brCryo: { max: 1, perLevel: 1, costs: [650] },
    brGolden: { max: 1, perLevel: 1, costs: [650] },
    brSalvage: { max: 1, perLevel: 1, costs: [650] },
  },
};