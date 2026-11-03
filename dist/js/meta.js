/**
 * meta.js — 33-node branching Skill Tree:
 *  - Center Root + Runic Matrix (2)
 *  - 4 Balanced Branches × 5-6 Nodes (23)
 *  - 4 Ultimate Branch Capstones (4)
 *  - 4 Cross-Branch Bridge Nodes (4)
 */
import { CONFIG } from './config.js';

const pct = (x) => `${Math.round(x * 100)}%`;

export const META_DEFS = [
  /* ═══════════════════════ CENTER ROOT & RUNIC MATRIX ═══════════════════════ */
  {
    id: 'coreAwaken', name: 'Core Awakening', branch: 'core', color: '#8ff5ff',
    x: 600, y: 450, parent: null, reqLv: 0,
    icon: '<circle cx="12" cy="12" r="10.2" stroke-dasharray="3.2 2"/><polygon class="f" points="12 3.2 18.2 5.8 20.8 12 18.2 18.2 12 20.8 5.8 18.2 3.2 12 5.8 5.8"/><polygon points="12 6 17.2 9 17.2 15 12 18 6.8 15 6.8 9"/><circle class="f" cx="12" cy="12" r="3.2"/><path d="M12 1v2.5M12 20.5V23M1 12h2.5M20.5 12H23M4.2 4.2l1.8 1.8M18 18l1.8 1.8M19.8 4.2L18 6M6 18l-1.8 1.8"/>',
    now: () => 'Central neural reactor online · Unlocks all specialization branches',
  },
  {
    id: 'runeSlot', name: 'Runic Matrix', branch: 'core', color: '#ffd23d',
    x: 600, y: 310, parent: 'coreAwaken', reqLv: 1,
    icon: '<polygon class="f" points="12 2 20.5 7 20.5 17 12 22 3.5 17 3.5 7"/><polygon points="12 5.5 17.5 15.5 6.5 15.5"/><circle class="f" cx="12" cy="12" r="2.6"/><circle class="f" cx="12" cy="4.5" r="1.4"/><circle class="f" cx="18.5" cy="15.8" r="1.4"/><circle class="f" cx="5.5" cy="15.8" r="1.4"/>',
    now: (lv) => lv > 0
      ? '3 Boss Rune slots unlocked in the Core Armory'
      : 'Unlocks a 3rd Boss Rune equip slot in the Core Armory',
  },

  /* ═══════════════════════ OFFENSE BRANCH (Top-Right · Red) ═══════════════════════ */
  {
    id: 'damage', name: 'Plasma Overcharge', branch: 'offense', color: '#ff4d5e',
    x: 755, y: 345, parent: 'coreAwaken', reqLv: 1,
    icon: '<circle cx="12" cy="12" r="9.8" stroke-dasharray="2.5 2.5"/><polygon class="f" points="12 1.8 14.2 7.4 19.6 4.4 16.6 9.8 22.2 12 16.6 14.2 19.6 19.6 14.2 16.6 12 22.2 9.8 16.6 4.4 19.6 7.4 14.2 1.8 12 7.4 9.8 4.4 4.4 9.8 7.4"/><polygon points="12 6.5 15.5 12 12 17.5 8.5 12"/><circle class="f" cx="12" cy="12" r="2.4"/>',
    now: (lv) => `+${pct(lv * CONFIG.meta.damage.perLevel)} base weapon damage`,
  },
  {
    id: 'fireRate', name: 'Rapid Cycler', branch: 'offense', color: '#ff4d5e',
    x: 775, y: 455, parent: 'coreAwaken', reqLv: 1,
    icon: '<rect x="2" y="5" width="4.5" height="14" rx="1"/><path d="M6.5 8h6M6.5 12h8M6.5 16h6"/><polygon class="f" points="11 5.5 16.5 12 11 18.5 13 12"/><polygon class="f" points="16 4.5 22.5 12 16 19.5 18.2 12"/><circle cx="4.2" cy="8.5" r=".9"/><circle cx="4.2" cy="12" r=".9"/><circle cx="4.2" cy="15.5" r=".9"/>',
    now: (lv) => `+${pct(lv * CONFIG.meta.fireRate.perLevel)} base fire rate`,
  },
  {
    id: 'critRate', name: 'Precision Optics', branch: 'offense', color: '#ff4d5e',
    x: 895, y: 245, parent: 'damage', reqLv: 1,
    icon: '<circle cx="12" cy="12" r="9.2"/><circle cx="12" cy="12" r="5.6" stroke-dasharray="3 2"/><polygon class="f" points="12 8.2 15.8 12 12 15.8 8.2 12"/><circle class="f" cx="12" cy="12" r="1.6"/><path d="M12 1.2v4M12 18.8v4M1.2 12h4M18.8 12h4M4.5 4.5l2.2 2.2M17.3 17.3l2.2 2.2M19.5 4.5l-2.2 2.2M6.7 17.3l-2.2 2.2"/>',
    now: (lv) => `+${pct(lv * CONFIG.meta.critRate.perLevel)} starting critical hit chance`,
  },
  {
    id: 'bossSlayer', name: 'Titan Breaker', branch: 'offense', color: '#ff4d5e',
    x: 915, y: 375, parent: 'damage', reqLv: 2,
    icon: '<polygon class="f" points="12 1.8 20.5 7.2 17.5 20.5 6.5 20.5 3.5 7.2"/><polygon points="12 5 17.2 8.5 15.2 17.8 8.8 17.8 6.8 8.5"/><path d="M12 2v19M7.5 11.5L12 15l4.5-3.5M8.5 8.5L12 11l3.5-2.5"/><circle class="f" cx="12" cy="14.5" r="2"/>',
    now: (lv) => `+${pct(lv * CONFIG.meta.bossSlayer.perLevel)} bonus damage against Bosses & Elites`,
  },
  {
    id: 'critDmg', name: 'Lethal Amplifier', branch: 'offense', color: '#ff4d5e',
    x: 1030, y: 175, parent: 'critRate', reqLv: 2,
    icon: '<polygon class="f" points="12 1.5 15.2 8.2 22.5 9.2 17.2 14.2 18.5 21.5 12 18 5.5 21.5 6.8 14.2 1.5 9.2 8.8 8.2"/><polygon points="12 5.5 14 9.8 18.6 10.4 15.2 13.6 16 18.2 12 16 8 18.2 8.8 13.6 5.4 10.4 10 9.8"/><circle class="f" cx="12" cy="12.5" r="2.2"/>',
    now: (lv) => `+${pct(lv * CONFIG.meta.critDmg.perLevel)} critical hit damage multiplier`,
  },
  {
    id: 'overpierce', name: 'Tungsten Sabot', branch: 'offense', color: '#ff4d5e',
    x: 1045, y: 315, parent: 'bossSlayer', reqLv: 2,
    icon: '<path d="M1.5 12h19"/><polygon class="f" points="22.5 12 13.5 6.5 15.5 12 13.5 17.5"/><polygon class="f" points="14 12 8.5 8 10 12 8.5 16"/><path d="M5.5 5v14M9.5 6.5v11M2 9l3 3-3 3"/>',
    now: (lv) => `Shots natively pierce through +${lv * CONFIG.meta.overpierce.perLevel} enem${lv > 1 ? 'ies' : 'y'}`,
  },
  {
    id: 'capOmega', name: 'Omega Railgun', branch: 'offense', color: '#ff4d5e', capstone: true,
    x: 1140, y: 235, parents: ['critDmg', 'overpierce'], reqLv: 2,
    icon: '<polygon class="f" points="23 12 9 4 12.5 12 9 20"/><polygon class="f" points="12 12 3 6.5 5.5 12 3 17.5"/><circle class="f" cx="15" cy="12" r="2.6"/><path d="M1 12h20"/>',
    now: () => 'CAPSTONE: Every 6th shot fires an Omega Rail bolt (250% Crit Damage & pierces all enemies)',
  },

  /* ═══════════════════════ DEFENSE BRANCH (Top-Left · Blue) ═══════════════════════ */
  {
    id: 'hp', name: 'Reinforced Hull', branch: 'defense', color: '#4db8ff',
    x: 445, y: 345, parent: 'coreAwaken', reqLv: 1,
    icon: '<polygon class="f" points="12 2 20.8 7 20.8 17 12 22 3.2 17 3.2 7"/><polygon points="12 4.8 18.2 8.4 18.2 15.6 12 19.2 5.8 15.6 5.8 8.4"/><path class="f" d="M10.5 8h3v2.5H16v3h-2.5V16h-3v-2.5H8v-3h2.5z"/><path d="M12 2v2.8M20.8 7l-2.6 1.4M20.8 17l-2.6-1.4M12 22v-2.8M3.2 17l2.6-1.4M3.2 7l2.6 1.4"/>',
    now: (lv) => `${CONFIG.core.baseHp + lv * CONFIG.meta.hp.perLevel} starting Core HP`,
  },
  {
    id: 'blastGuard', name: 'Impact Dampeners', branch: 'defense', color: '#4db8ff',
    x: 425, y: 455, parent: 'coreAwaken', reqLv: 1,
    icon: '<circle cx="12" cy="12" r="9.8" stroke-dasharray="4 2.5"/><circle cx="12" cy="12" r="6.8"/><polygon class="f" points="12 6.8 16.5 9.4 16.5 14.6 12 17.2 7.5 14.6 7.5 9.4"/><circle class="f" cx="12" cy="12" r="2.2"/><path d="M3.5 3.5l3.2 3.2M17.3 17.3l3.2 3.2M20.5 3.5l-3.2 3.2M6.7 17.3l-3.2 3.2"/>',
    now: (lv) => `+${pct(lv * CONFIG.meta.blastGuard.perLevel)} knockback force on all shots`,
  },
  {
    id: 'aegisStart', name: 'Aegis Protocol', branch: 'defense', color: '#4db8ff',
    x: 305, y: 245, parent: 'hp', reqLv: 2,
    icon: '<path class="f" d="M12 2L20.2 5.2v6.4c0 5.1-3.5 9-8.2 10.6-4.7-1.6-8.2-5.5-8.2-10.6V5.2z"/><path d="M12 4.8l5.6 2.2v4.6c0 3.6-2.4 6.4-5.6 7.7-3.2-1.3-5.6-4.1-5.6-7.7V7z"/><polyline points="8.5 12 11 14.5 15.8 9.5"/><path d="M12 2v2.8M3.8 5.2L6.4 7M20.2 5.2L17.6 7"/>',
    now: (lv) => lv === 0
      ? 'Start run with an active Energy Shield'
      : `Begin run with Shield (recharges ${lv} wave${lv > 1 ? 's' : ''} faster)`,
  },
  {
    id: 'hullRegen', name: 'Nano-Repair Bay', branch: 'defense', color: '#4db8ff',
    x: 285, y: 375, parent: 'blastGuard', reqLv: 2,
    icon: '<circle cx="12" cy="12" r="9.6" stroke-dasharray="5 2.5"/><polygon points="12 3.8 19.2 8 19.2 16 12 20.2 4.8 16 4.8 8"/><path class="f" d="M10.2 7.2h3.6v3h3v3.6h-3v3h-3.6v-3h-3v-3.6h3z"/><circle cx="12" cy="12" r="1.4"/>',
    now: (lv) => lv === 0
      ? 'Auto-repair 1 HP every N waves'
      : `Restore 1 HP automatically every ${Math.max(2, 6 - lv)} waves`,
  },
  {
    id: 'thornsStart', name: 'Reactive Armor', branch: 'defense', color: '#4db8ff',
    x: 170, y: 175, parent: 'aegisStart', reqLv: 1,
    icon: '<polygon class="f" points="12 1.8 15 8.2 22 9 16.8 13.8 18.2 20.8 12 17.2 5.8 20.8 7.2 13.8 2 9 9 8.2"/><circle cx="12" cy="12" r="9.8"/><circle class="f" cx="12" cy="12" r="2.8"/>',
    now: (lv) => lv === 0
      ? 'Start every run with Counter-Pulse nova when hit'
      : `Begin run with Lv ${lv} Counter-Pulse shockwave on hit/block`,
  },
  {
    id: 'invulnBoost', name: 'Phase Cloak', branch: 'defense', color: '#4db8ff',
    x: 155, y: 315, parent: 'hullRegen', reqLv: 1,
    icon: '<path class="f" d="M12 2.5L20 6v6c0 5-3.4 8.8-8 10.2-4.6-1.4-8-5.2-8-10.2V6z"/><circle cx="12" cy="12" r="4" stroke-dasharray="2 2"/>',
    now: (lv) => `+${pct(lv * CONFIG.meta.invulnBoost.perLevel)} invulnerability time after taking or blocking a hit`,
  },
  {
    id: 'capPhoenix', name: 'Phoenix Protocol', branch: 'defense', color: '#4db8ff', capstone: true,
    x: 60, y: 235, parents: ['thornsStart', 'invulnBoost'], reqLv: 2,
    icon: '<path class="f" d="M12 2c3 4 7 6.5 7 11.5a7 7 0 1 1-14 0C5 8.5 9 6 12 2z"/><polygon points="12 7 16 13 12 19 8 13"/><circle class="f" cx="12" cy="13.5" r="2.5"/>',
    now: () => 'CAPSTONE: Once per run, fatal damage revives Core at 50% HP and unleashes a mega shockwave',
  },

  /* ═══════════════════════ TACTICAL BRANCH (Bottom-Left · Emerald) ═══════════════════════ */
  {
    id: 'projVelocity', name: 'Magnetic Rails', branch: 'tactical', color: '#2effb4',
    x: 455, y: 575, parent: 'coreAwaken', reqLv: 1,
    icon: '<path d="M2 7h11M2 17h11M5 10v4M9 10v4"/><polygon class="f" points="22.5 12 13 6.5 15.2 12 13 17.5"/><circle class="f" cx="16.5" cy="12" r="2.2"/><path d="M1.5 12h11.5"/>',
    now: (lv) => `+${pct(lv * CONFIG.meta.projVelocity.perLevel)} base projectile speed & range`,
  },
  {
    id: 'aimMagnet', name: 'Smart Targeting', branch: 'tactical', color: '#2effb4',
    x: 315, y: 635, parent: 'projVelocity', reqLv: 1,
    icon: '<path d="M3 7V3h4M17 3h4v4M21 17v4h-4M7 21H3v-4"/><circle cx="12" cy="12" r="6.8" stroke-dasharray="3.2 2.2"/><polygon class="f" points="12 7.5 16.5 12 12 16.5 7.5 12"/><circle class="f" cx="12" cy="12" r="1.8"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
    now: (lv) => `+${pct(lv * CONFIG.meta.aimMagnet.perLevel)} aim-assist magnetism radius`,
  },
  {
    id: 'shockAmp', name: 'Resonance Wave', branch: 'tactical', color: '#2effb4',
    x: 335, y: 755, parent: 'projVelocity', reqLv: 2,
    icon: '<circle cx="12" cy="12" r="10" stroke-dasharray="3.5 2.5"/><circle cx="12" cy="12" r="6.8"/><polygon class="f" points="12 6.8 15.2 10 18.5 12 15.2 14 12 17.2 8.8 14 5.5 12 8.8 10"/><circle class="f" cx="12" cy="12" r="2.2"/>',
    now: (lv) => `+${pct(lv * CONFIG.meta.shockAmp.perLevel)} Shockwave & AoE blast radius`,
  },
  {
    id: 'orbitAmp', name: 'Drone Telemetry', branch: 'tactical', color: '#2effb4',
    x: 185, y: 695, parent: 'aimMagnet', reqLv: 2,
    icon: '<ellipse cx="12" cy="12" rx="10.2" ry="4.5" transform="rotate(-28 12 12)"/><ellipse cx="12" cy="12" rx="10.2" ry="4.5" transform="rotate(28 12 12)" opacity=".65"/><circle class="f" cx="12" cy="12" r="3.4"/><polygon class="f" points="20.5 7.5 22.8 9.2 20.8 11.2 18.8 9.5"/><polygon class="f" points="3.5 16.5 5.2 14.5 3.2 12.8 1.2 14.8"/>',
    now: (lv) => `+${pct(lv * CONFIG.meta.orbitAmp.perLevel)} Orbiter & Chain Lightning damage`,
  },
  {
    id: 'startBounce', name: 'Kinetic Ricochet', branch: 'tactical', color: '#2effb4',
    x: 160, y: 585, parent: 'orbitAmp', reqLv: 1,
    icon: '<path d="M2.5 18l7.5-11 5.5 8 6.5-9"/><polygon class="f" points="22.5 6 17 6.5 19.5 10.5"/><circle class="f" cx="10" cy="7" r="2.2"/><circle class="f" cx="15.5" cy="15" r="2.2"/>',
    now: (lv) => `Shots natively ricochet to +${lv} nearby enem${lv > 1 ? 'ies' : 'y'}`,
  },
  {
    id: 'arenaAmp', name: 'Arena Mastery', branch: 'tactical', color: '#2effb4',
    x: 195, y: 815, parent: 'shockAmp', reqLv: 2,
    icon: '<polygon class="f" points="12 2 21 7 21 17 12 22 3 17 3 7"/><circle cx="12" cy="12" r="5"/><circle class="f" cx="12" cy="12" r="2.2"/>',
    now: (lv) => `+${pct(lv * CONFIG.meta.arenaAmp.perLevel)} power & damage from all World Arena Mechanics`,
  },
  {
    id: 'capInterceptor', name: 'Interceptor Halo', branch: 'tactical', color: '#2effb4', capstone: true,
    x: 65, y: 710, parents: ['startBounce', 'arenaAmp'], reqLv: 1,
    icon: '<circle cx="12" cy="12" r="9.5" stroke-dasharray="3 2"/><polygon class="f" points="12 4 19 12 12 20 5 12"/><circle class="f" cx="12" cy="12" r="2.8"/>',
    now: () => 'CAPSTONE: +1 Starting Orbiter & Orbiters vaporize enemy projectiles (Orbs) on contact',
  },

  /* ═══════════════════════ ECONOMY BRANCH (Bottom-Right · Gold) ═══════════════════════ */
  {
    id: 'shardGain', name: 'Shard Extractor', branch: 'economy', color: '#ffd23d',
    x: 745, y: 575, parent: 'coreAwaken', reqLv: 1,
    icon: '<polygon class="f" points="12 1.8 20.2 9.2 12 22.2 3.8 9.2"/><polygon points="12 4.8 17 9.4 12 18.8 7 9.4"/><path d="M3.8 9.2h16.4M12 1.8v20.4M7 9.4L12 1.8l5 7.6"/><circle class="f" cx="12" cy="9.4" r="1.8"/>',
    now: (lv) => `+${pct(lv * CONFIG.meta.shardGain.perLevel)} Shards earned from every run`,
  },
  {
    id: 'rerolls', name: 'Tactical Reroll', branch: 'economy', color: '#ffd23d',
    x: 885, y: 635, parent: 'shardGain', reqLv: 1,
    icon: '<path d="M3.5 11A8.5 8.5 0 0 1 18.2 5.2M20.5 13A8.5 8.5 0 0 1 5.8 18.8"/><polygon class="f" points="18.5 1.8 20.5 7.2 14.8 6.2"/><polygon class="f" points="5.5 22.2 3.5 16.8 9.2 17.8"/><polygon class="f" points="12 8 16 12 12 16 8 12"/><circle cx="12" cy="12" r="1.5"/>',
    now: (lv) => `${1 + lv * CONFIG.meta.rerolls.perLevel} card reroll${1 + lv > 1 ? 's' : ''} available per run`,
  },
  {
    id: 'extraChoice', name: 'Expanded Deck', branch: 'economy', color: '#ffd23d',
    x: 865, y: 755, parent: 'shardGain', reqLv: 2,
    icon: '<rect x="2.2" y="6.5" width="9.5" height="13.5" rx="1.8" transform="rotate(-10 7 13)"/><rect class="f" x="7.2" y="4" width="9.8" height="14" rx="1.8"/><rect x="12.5" y="6.5" width="9.2" height="13.5" rx="1.8" transform="rotate(10 17 13)"/><polygon class="f" points="12 8.2 14.2 11 12 13.8 9.8 11"/>',
    now: (lv) => lv >= CONFIG.meta.extraChoice.max
      ? 'Always 4 upgrade cards offered between waves'
      : lv === 0 ? '3 upgrade cards offered' : `${pct(CONFIG.meta.extraChoice.chance[lv - 1])} chance for a 4th card`,
  },
  {
    id: 'startUpgrade', name: 'Headstart Matrix', branch: 'economy', color: '#ffd23d',
    x: 1015, y: 695, parent: 'rerolls', reqLv: 2,
    icon: '<polygon class="f" points="12 2 14.8 8.2 21.5 9 16.5 13.6 17.8 20.4 12 17 6.2 20.4 7.5 13.6 2.5 9 9.2 8.2"/><circle cx="12" cy="12" r="9.8" stroke-dasharray="2.5 2.5"/><circle class="f" cx="12" cy="12.4" r="2.6"/>',
    now: (lv) => lv === 0 ? 'No starting bonus card' : `Begin every run with ${lv} random upgrade${lv > 1 ? 's' : ''}`,
  },
  {
    id: 'podRate', name: 'Supply Beacon', branch: 'economy', color: '#ffd23d',
    x: 1005, y: 815, parent: 'extraChoice', reqLv: 2,
    icon: '<polygon class="f" points="12 2 20 7 20 17 12 22 4 17 4 7"/><circle class="f" cx="12" cy="12" r="3.5"/><path d="M12 2v5M20 7l-4.5 2.5M20 17l-4.5-2.5M12 22v-5M4 17l4.5-2.5M4 7l4.5 2.5"/>',
    now: (lv) => `+${pct(lv * CONFIG.meta.podRate.perLevel)} Supply Pod & Vault Drone spawn rate & buff duration`,
  },
  {
    id: 'capSingularity', name: 'Singularity Deck', branch: 'economy', color: '#ffd23d', capstone: true,
    x: 1135, y: 710, parents: ['startUpgrade', 'podRate'], reqLv: 1,
    icon: '<polygon class="f" points="12 1.5 15.5 8 22.5 9.2 17.2 14.2 18.8 21.5 12 17.8 5.2 21.5 6.8 14.2 1.5 9.2 8.5 8"/><circle class="f" cx="12" cy="12" r="3"/>',
    now: () => 'CAPSTONE: 2× chance for Mythic Synergy & Corrupted cards + 1% bonus Score per Skill Tree level',
  },

  /* ═══════════════════════ 4 CROSS-BRANCH BRIDGE NODES ═══════════════════════ */
  {
    id: 'brVamp', name: 'Vampiric Hull', branch: 'bridge', color: '#ff7be5', bridge: true,
    x: 600, y: 185, parents: ['damage', 'hp'], reqLv: 2,
    icon: '<path class="f" d="M12 2L20 5.5V12c0 5.2-3.5 9.1-8 10.5C7.5 21.1 4 17.2 4 12V5.5z"/><polygon class="f" points="12 7 15.5 12 12 17 8.5 12"/>',
    now: () => 'BRIDGE (Offense + Defense): Destroying any Boss or Elite immediately recharges Energy Shield',
  },
  {
    id: 'brCryo', name: 'Cryo-Ballistics', branch: 'bridge', color: '#8ff5ff', bridge: true,
    x: 915, y: 520, parents: ['fireRate', 'rerolls'], reqLv: 2,
    icon: '<polygon class="f" points="12 2 15 9 22 12 15 15 12 22 9 15 2 12 9 9"/><circle cx="12" cy="12" r="2.5"/>',
    now: () => 'BRIDGE (Offense + Economy): Critical Hits chill enemies for 1.4s (slows movement & +25% damage taken)',
  },
  {
    id: 'brSalvage', name: 'Overclock Salvage', branch: 'bridge', color: '#2eff9c', bridge: true,
    x: 600, y: 710, parents: ['projVelocity', 'shardGain'], reqLv: 2,
    icon: '<polygon class="f" points="13.5 2 4.8 13.2 11.2 13.2 9.2 22 19.2 10.8 12.8 10.8"/><circle cx="12" cy="12" r="9.5" stroke-dasharray="3 2.5"/>',
    now: () => 'BRIDGE (Tactical + Economy): Shooting any Pod, Magma Rock, Pylon or Prism grants +35% Fire Rate for 3.5s',
  },
  {
    id: 'brGolden', name: 'Golden Aegis', branch: 'bridge', color: '#ffd23d', bridge: true,
    x: 285, y: 520, parents: ['blastGuard', 'aimMagnet'], reqLv: 2,
    icon: '<polygon class="f" points="12 2 19 9 12 22 5 9"/><circle cx="12" cy="12" r="9.5" stroke-dasharray="3 2"/>',
    now: () => 'BRIDGE (Defense + Tactical): Every Perfect Wave completed grants +10 bonus Shards',
  },
];

export const META_BY_ID = Object.fromEntries(META_DEFS.map((d) => [d.id, d]));

export class Meta {
  /** @param {import('./storage.js').Storage} store */
  constructor(store) { this.store = store; }

  get shards() { return this.store.data.shards; }

  level(id) {
    if (id === 'coreAwaken') return 1;
    return this.store.data.meta[id] | 0;
  }

  get maxLevel() { return CONFIG.meta.maxLevel; }

  maxLevelOf(id) {
    return CONFIG.meta[id]?.max ?? CONFIG.meta.maxLevel;
  }

  /** True if all parent nodes in the skill tree have reached `reqLv`. */
  isUnlocked(id) {
    const def = META_BY_ID[id];
    if (!def) return false;
    const req = def.reqLv || 1;
    if (Array.isArray(def.parents) && def.parents.length) {
      return def.parents.every((pId) => this.level(pId) >= req);
    }
    if (!def.parent) return true;
    return this.level(def.parent) >= req;
  }

  /** Cost of the next level, or null when maxed. */
  cost(id) {
    const cfg = CONFIG.meta[id];
    if (!cfg) return null;
    const lv = this.level(id);
    const max = this.maxLevelOf(id);
    return lv >= max ? null : cfg.costs[lv];
  }

  canBuy(id) {
    if (!this.isUnlocked(id)) return false;
    const c = this.cost(id);
    return c !== null && this.shards >= c;
  }

  buy(id) {
    if (!this.canBuy(id)) return false;
    this.store.data.shards -= this.cost(id);
    this.store.data.meta[id] = (this.store.data.meta[id] | 0) + 1;
    this.store.save();
    return true;
  }

  /** Total skill tree levels purchased across all branches. */
  totalUpgradesBought() {
    let sum = 0;
    for (const [k, v] of Object.entries(this.store.data.meta)) {
      if (k !== 'coreAwaken') sum += (v | 0);
    }
    return sum;
  }

  /** Aggregated bonuses applied at the start of every run. */
  effects() {
    const M = CONFIG.meta;
    const L = (id) => this.level(id);
    const extra = L('extraChoice');
    const regenLv = L('hullRegen');
    const totalLv = this.totalUpgradesBought();
    return {
      runeSlot: L('runeSlot') * (M.runeSlot?.perLevel || 1),
      hp: L('hp') * M.hp.perLevel,
      damage: L('damage') * M.damage.perLevel,
      fireRate: L('fireRate') * M.fireRate.perLevel,
      critRate: L('critRate') * M.critRate.perLevel,
      critDmg: L('critDmg') * M.critDmg.perLevel,
      bossSlayer: L('bossSlayer') * M.bossSlayer.perLevel,
      overpierce: L('overpierce') * M.overpierce.perLevel,
      capOmega: L('capOmega') > 0,

      aegisStart: L('aegisStart') * M.aegisStart.perLevel,
      hullRegenEvery: regenLv > 0 ? Math.max(2, 6 - regenLv) : 0,
      blastGuard: L('blastGuard') * M.blastGuard.perLevel,
      thornsStart: L('thornsStart') * (M.thornsStart?.perLevel || 1),
      invulnBoost: L('invulnBoost') * (M.invulnBoost?.perLevel || 0.15),
      capPhoenix: L('capPhoenix') > 0,

      projVelocity: L('projVelocity') * M.projVelocity.perLevel,
      aimMagnet: L('aimMagnet') * M.aimMagnet.perLevel,
      shockAmp: L('shockAmp') * M.shockAmp.perLevel,
      orbitAmp: L('orbitAmp') * M.orbitAmp.perLevel,
      arenaAmp: L('arenaAmp') * (M.arenaAmp?.perLevel || 0.08),
      startBounce: L('startBounce') * (M.startBounce?.perLevel || 1),
      capInterceptor: L('capInterceptor') > 0,

      shardGain: L('shardGain') * M.shardGain.perLevel,
      rerolls: 1 + L('rerolls') * (M.rerolls?.perLevel || 1),
      extraChoice: extra > 0 ? M.extraChoice.chance[extra - 1] : 0,
      startUpgrades: L('startUpgrade') * M.startUpgrade.perLevel,
      podRate: L('podRate') * (M.podRate?.perLevel || 0.08),
      capSingularity: L('capSingularity') > 0,
      singularityScoreBonus: L('capSingularity') > 0 ? totalLv * 0.01 : 0,

      brVamp: L('brVamp') > 0,
      brCryo: L('brCryo') > 0,
      brSalvage: L('brSalvage') > 0,
      brGolden: L('brGolden') > 0,
    };
  }

  /** Shards earned by a run. */
  shardsFor(score, wave) {
    const S = CONFIG.scoring.shards;
    const base = score * S.perScore + S.perWave * Math.pow(Math.max(0, wave), S.waveExp);
    return Math.max(0, Math.floor(base * (1 + this.effects().shardGain)));
  }
}