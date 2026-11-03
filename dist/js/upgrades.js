/**
 * upgrades.js — 20 standard upgrades + 4 Mythic Synergy Evolutions + 4 Boss Relics
 * + 4 Corrupted Cards, plus 18 Upgradable Boss Runes (Lv 1..3) and 34-Node Skill Tree effects.
 */
import { CONFIG } from './config.js';

const pct = (x) => Math.round(x * 100);
const fix = (x) => String(+x.toFixed(1));

export const UPGRADES = [
  {
    id: 'fireRate', name: 'Rapid Fire',
    icon: '<rect x="2" y="4.5" width="4" height="15" rx="1"/><path d="M6 7.5h5M6 12h7M6 16.5h5"/><polygon class="f" points="11 5.5 16.5 12 11 18.5 13 12"/><polygon class="f" points="16 4.5 22.5 12 16 19.5 18.5 12"/><circle cx="4" cy="8" r=".8"/><circle cx="4" cy="12" r=".8"/><circle cx="4" cy="16" r=".8"/>',
    apply: (s, lv, c) => { s.fireRate *= 1 + c.perLevel * lv; },
    text: (g, c) => `+${pct(c.perLevel * g)}% fire rate`,
  },
  {
    id: 'damage', name: 'Overcharge',
    icon: '<circle cx="12" cy="12" r="9.8" stroke-dasharray="2.5 2.5"/><polygon class="f" points="12 1.8 14.2 7.4 19.6 4.4 16.6 9.8 22.2 12 16.6 14.2 19.6 19.6 14.2 16.6 12 22.2 9.8 16.6 4.4 19.6 7.4 14.2 1.8 12 7.4 9.8 4.4 4.4 9.8 7.4"/><polygon points="12 6.5 15.5 12 12 17.5 8.5 12"/><circle class="f" cx="12" cy="12" r="2.4"/>',
    apply: (s, lv, c) => { s.damage *= 1 + c.perLevel * lv; },
    text: (g, c) => `+${pct(c.perLevel * g)}% damage`,
  },
  {
    id: 'multiShot', name: 'Multi-Shot',
    icon: '<path d="M12 21V7M12 21L5 9M12 21l7-12"/><circle class="f" cx="12" cy="4.5" r="2.2"/><circle class="f" cx="4" cy="7.5" r="2"/><circle class="f" cx="20" cy="7.5" r="2"/><polygon class="f" points="8 21.5 16 21.5 12 17.5"/><path d="M5 9l7 4 7-4"/>',
    apply: (s, lv) => { s.projectiles += lv; },
    text: (g) => `+${g} projectile${g > 1 ? 's' : ''} per shot, fired in a spread`,
  },
  {
    id: 'piercing', name: 'Piercing',
    icon: '<path d="M1.5 12h21"/><polygon class="f" points="22.5 12 14.5 7 16 12 14.5 17"/><rect x="5.5" y="4.5" width="2.5" height="15" rx=".8" class="f"/><rect x="9.5" y="6.5" width="2.5" height="11" rx=".8" opacity=".7"/><path d="M1.5 8h4M1.5 16h4"/>',
    apply: (s, lv) => { s.pierce += lv; },
    text: (g) => `Shots pass through ${g} more enem${g > 1 ? 'ies' : 'y'}`,
  },
  {
    id: 'projSpeed', name: 'Velocity',
    icon: '<circle class="f" cx="17.8" cy="12" r="3.6"/><path d="M14 12H1.5"/><path d="M12.5 7.8L3.5 5.8"/><path d="M12.5 16.2L3.5 18.2"/><polygon class="f" points="22.5 12 18 9.5 18 14.5"/><path d="M1 9.5h8M1 14.5h8"/>',
    apply: (s, lv, c) => { s.projSpeed *= 1 + c.perLevel * lv; },
    text: (g, c) => `+${pct(c.perLevel * g)}% projectile speed`,
  },
  {
    id: 'shockwave', name: 'Shockwave',
    icon: '<circle cx="12" cy="12" r="10.2" stroke-dasharray="3.5 2.5"/><circle cx="12" cy="12" r="6.8"/><polygon class="f" points="12 6.5 15.5 9.8 19 12 15.5 14.2 12 17.5 8.5 14.2 5 12 8.5 9.8"/><circle class="f" cx="12" cy="12" r="2.4"/><path d="M12 1v3M12 20v3M1 12h3M20 12h3"/>',
    apply: (s, lv, c) => {
      s.shockInterval = c.interval - c.intervalStep * (lv - 1);
      s.shockRadius = (c.radius + c.radiusStep * (lv - 1)) * (s.shockAmpMult || 1);
      s.shockDamageMult = c.damage + c.damageStep * (lv - 1);
      s.shockKnock = c.knock;
    },
    text: (g, c, from, to) => from === 0
      ? `Every ${fix(c.interval - c.intervalStep * (to - 1))}s a ring pushes back and damages nearby enemies`
      : `Pulse every ${fix(c.interval - c.intervalStep * (to - 1))}s, wider and stronger`,
  },
  {
    id: 'orbiters', name: 'Orbiters',
    icon: '<circle class="f" cx="12" cy="12" r="3.6"/><ellipse cx="12" cy="12" rx="10.2" ry="4.6" transform="rotate(-28 12 12)"/><ellipse cx="12" cy="12" rx="10.2" ry="4.6" transform="rotate(28 12 12)" opacity=".65"/><polygon class="f" points="20.5 7.5 22.8 9.2 20.8 11.2 18.8 9.5"/><polygon class="f" points="3.5 16.5 5.2 14.5 3.2 12.8 1.2 14.8"/>',
    apply: (s, lv, c) => {
      s.orbiters += lv;
      s.orbitRadius = c.radius + (s.awakened ? 6 : 0) + 2 * (s.orbiters - 1);
      s.orbitDamageMult = c.damage * (s.orbitAmpMult || 1);
    },
    text: (g) => `+${g} orbiting satellite${g > 1 ? 's' : ''} that damage enemies on contact`,
  },
  {
    id: 'shield', name: 'Shield',
    icon: '<path class="f" d="M12 2L20.2 5.2v6.4c0 5.1-3.5 9-8.2 10.6-4.7-1.6-8.2-5.5-8.2-10.6V5.2z"/><path d="M12 4.8l5.6 2.2v4.6c0 3.6-2.4 6.4-5.6 7.7-3.2-1.3-5.6-4.1-5.6-7.7V7z"/><polyline points="8.5 12 11 14.5 15.8 9.5"/><path d="M12 2v2.8M3.8 5.2L6.4 7M20.2 5.2L17.6 7"/>',
    eligible: (lv, ctx, levels) => lv < CONFIG.upgrades.shield.max && !(levels.corruptShield > 0),
    apply: (s, lv, c) => {
      s.shieldMax = 1;
      const baseRec = c.recharge[Math.min(lv, c.recharge.length) - 1];
      s.shieldRecharge = Math.max(1, baseRec - (s.aegisFast || 0));
    },
    text: (g, c, from, to) => from === 0
      ? `Blocks 1 hit. Recharges every ${c.recharge[to - 1]} waves`
      : `Recharges every ${c.recharge[Math.min(to, c.recharge.length) - 1]} waves`,
  },
  {
    id: 'heal', name: 'Repair',
    icon: '<circle cx="12" cy="12" r="9.6" stroke-dasharray="5 2.5"/><polygon points="12 3.8 19.2 8 19.2 16 12 20.2 4.8 16 4.8 8"/><path class="f" d="M10.2 7.2h3.6v3h3v3.6h-3v3h-3.6v-3h-3v-3.6h3z"/><circle cx="12" cy="12" r="1.4"/>',
    eligible: (lv, ctx) => ctx.hp < ctx.maxHp,
    noStart: true,
    instant: true,
    text: (g) => `Restore ${g} HP`,
  },
  {
    id: 'critical', name: 'Critical Hit',
    icon: '<circle cx="12" cy="12" r="9.2"/><circle cx="12" cy="12" r="5.6" stroke-dasharray="3 2"/><polygon class="f" points="12 8.2 15.8 12 12 15.8 8.2 12"/><circle class="f" cx="12" cy="12" r="1.6"/><path d="M12 1.2v4M12 18.8v4M1.2 12h4M18.8 12h4M4.5 4.5l2.2 2.2M17.3 17.3l2.2 2.2M19.5 4.5l-2.2 2.2M6.7 17.3l-2.2 2.2"/>',
    apply: (s, lv, c) => { s.critChance += c.perLevel * lv; },
    text: (g, c) => `+${pct(c.perLevel * g)}% critical hit chance`,
  },
  {
    id: 'slowField', name: 'Slow Field',
    icon: '<circle cx="12" cy="12" r="10" stroke-dasharray="4 3"/><polygon class="f" points="12 6.5 16.5 9.2 16.5 14.8 12 17.5 7.5 14.8 7.5 9.2"/><circle cx="12" cy="12" r="2.4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2.5 2.5M16.5 16.5l2.5 2.5M19 5l-2.5 2.5M7.5 16.5l-2.5 2.5"/>',
    apply: (s, lv, c) => {
      s.slowRadius = c.radius + c.radiusStep * (lv - 1);
      s.slowFactor = c.slow + c.slowStep * (lv - 1);
    },
    text: (g, c, from, to) => from === 0
      ? `Enemies near the Core move ${pct(c.slow)}% slower`
      : `Bigger field, ${pct(c.slow + c.slowStep * (to - 1))}% slowdown`,
  },
  {
    id: 'chain', name: 'Chain Lightning',
    icon: '<path class="f" d="M13.5 1.8L4.5 13.2h6.2l-1.5 9 10.2-12.8h-6.8z"/><circle cx="5" cy="13" r="1.5"/><circle cx="18" cy="10" r="1.5"/><path d="M2.5 7.5c2 1.5 2.8 3.5 2.8 5.5M21.5 5c-1.5 2-2 4-2 6" opacity=".7"/>',
    apply: (s, lv, c) => {
      s.chainChance += c.perLevel * lv;
      s.chainRange = c.range;
      s.chainDamageMult = c.damage * (s.orbitAmpMult || 1);
    },
    text: (g, c) => `+${pct(c.perLevel * g)}% chance to arc lightning to a nearby enemy`,
  },
  {
    id: 'blast', name: 'Nova Payload',
    icon: '<circle class="f" cx="12" cy="12" r="4.6"/><polygon points="12 4.2 14.5 8 19 8 16 11.5 17.5 16 13 14 12 18 11 14 6.5 16 8 11.5 5 8 9.5 8"/><circle cx="12" cy="12" r="10" stroke-dasharray="2.5 2.5"/><path d="M12 1v2M12 21v2M1 12h2M21 12h2"/>',
    apply: (s, lv, c) => {
      s.blastRadius = (c.radius + c.radiusStep * (lv - 1)) * (s.shockAmpMult || 1);
      s.blastDamageMult = c.damage + c.damageStep * (lv - 1);
    },
    text: (g, c, from, to) => from === 0
      ? `Shots detonate on impact for ${pct(c.damage + c.damageStep * (to - 1))}% AoE damage`
      : `Larger blast (${pct(c.damage + c.damageStep * (to - 1))}% AoE damage)`,
  },
  {
    id: 'ricochet', name: 'Ricochet',
    icon: '<path d="M2.5 18l7.5-11 5.5 8 6.5-9"/><polygon class="f" points="22.5 6 17 6.5 19.5 10.5"/><circle class="f" cx="10" cy="7" r="2.2"/><circle class="f" cx="15.5" cy="15" r="2.2"/><path d="M4 21h16" stroke-dasharray="2 3"/>',
    apply: (s, lv, c) => { s.bounce += lv; s.bounceRange = c.range; },
    text: (g) => `Shots ricochet to ${g} additional nearby enem${g > 1 ? 'ies' : 'y'}`,
  },
  {
    id: 'vamp', name: 'Siphon Matrix',
    icon: '<path class="f" d="M12 2.5C7.8 7.8 5 11.2 5 15.2a7 7 0 0 0 14 0C19 11.2 16.2 7.8 12 2.5z"/><polygon points="12 8 14.5 12.5 12 17 9.5 12.5"/><circle class="f" cx="12" cy="12.5" r="1.8"/><path d="M9.5 15.2h5M12 12.7v5"/>',
    apply: (s, lv, c) => { s.vampKills = c.killsNeeded[Math.min(lv, c.killsNeeded.length) - 1]; },
    text: (g, c, from, to) => `Restore 1 HP every ${c.killsNeeded[Math.min(to, c.killsNeeded.length) - 1]} kills`,
  },
  {
    id: 'execute', name: 'Executioner',
    icon: '<polygon class="f" points="6 2.5 18 18.5 15.5 21.5 3.5 5.5"/><polygon class="f" points="18 2.5 6 18.5 8.5 21.5 20.5 5.5"/><circle cx="12" cy="12" r="9.2" stroke-dasharray="3.5 2.5"/><circle class="f" cx="12" cy="12" r="2.4"/>',
    apply: (s, lv, c) => { s.executeThreshold = c.threshold + c.step * (lv - 1); },
    text: (g, c, from, to) => `Instantly shatter enemies below ${pct(c.threshold + c.step * (to - 1))}% HP`,
  },
  {
    id: 'overclock', name: 'Crit Overclock',
    icon: '<polygon class="f" points="12 1.5 15.2 8.2 22.5 9.2 17.2 14.2 18.5 21.5 12 18 5.5 21.5 6.8 14.2 1.5 9.2 8.8 8.2"/><polygon points="12 5.5 14 9.8 18.6 10.4 15.2 13.6 16 18.2 12 16 8 18.2 8.8 13.6 5.4 10.4 10 9.8"/><circle class="f" cx="12" cy="12.5" r="2.2"/>',
    apply: (s, lv, c) => { s.critChance += c.critBonus * lv; s.critMult += c.multStep * lv; },
    text: (g, c, from, to) => `+${pct(c.critBonus * g)}% crit chance & ${fix(CONFIG.upgrades.critical.mult + c.multStep * to)}× crit damage`,
  },
  {
    id: 'thorns', name: 'Counter-Pulse',
    icon: '<polygon class="f" points="12 1.8 15 8.2 22 9 16.8 13.8 18.2 20.8 12 17.2 5.8 20.8 7.2 13.8 2 9 9 8.2"/><circle cx="12" cy="12" r="9.8"/><circle class="f" cx="12" cy="12" r="2.8"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
    apply: (s, lv, c) => {
      const totalLv = lv + (s.thornsStartLv || 0);
      s.thornsRadius = c.radius * (s.shockAmpMult || 1);
      s.thornsDamageMult = c.damage + c.damageStep * (totalLv - 1);
      s.thornsKnock = c.knock;
    },
    text: (g, c, from, to) => `Taking or blocking a hit unleashes a ${fix(c.damage + c.damageStep * (to - 1))}× damage nova`,
  },
  {
    id: 'homing', name: 'Seeker Guidance',
    icon: '<path d="M3.5 20.5C6 11.5 11.5 6 20.5 3.5"/><polygon class="f" points="20.5 3.5 14.5 4.8 19.2 9.5"/><circle cx="16.5" cy="14.5" r="3.2" stroke-dasharray="2 2"/><circle class="f" cx="16.5" cy="14.5" r="1.4"/><path d="M2.5 15.5l5 5"/>',
    apply: (s, lv, c) => { s.homingTurn = c.turnRate * lv; s.homingRange = c.range; },
    text: (g) => `Shots curve toward nearby enemies in flight (+${g} guidance)`,
  },
  {
    id: 'scholar', name: 'Shard Harvester',
    icon: '<polygon class="f" points="12 1.8 20.2 9.2 12 22.2 3.8 9.2"/><polygon points="12 4.8 17 9.4 12 18.8 7 9.4"/><path d="M3.8 9.2h16.4M12 1.8v20.4M7 9.4L12 1.8l5 7.6"/><circle class="f" cx="12" cy="9.4" r="1.8"/>',
    apply: (s, lv, c) => { s.scoreMult *= 1 + c.perLevel * lv; },
    text: (g, c) => `+${pct(c.perLevel * g)}% score and shard yield from kills`,
  },

  /* ───────────────────────── 4 Mythic Synergy Evolutions ───────────────────────── */
  {
    id: 'evoPrism', name: 'Prism Matrix', synergy: true, noStart: true,
    icon: '<polygon class="f" points="12 1.5 21.8 19.5 2.2 19.5"/><polygon points="12 5.5 18 17 6 17"/><path d="M12 1.5v15.5M3.5 12l17-3M3.5 16l17 3"/><circle class="f" cx="12" cy="11.5" r="2.2"/>',
    eligible: (lv, ctx, levels) => lv < 1 && (levels.multiShot | 0) >= 2 && (levels.ricochet | 0) >= 2,
    apply: (s) => { s.evoPrism = true; s.bounce += 1; },
    text: () => 'SYNERGY: Ricochets split into a twin bolt on every bounce (+1 bounce)',
  },
  {
    id: 'evoTesla', name: 'Tesla Cage', synergy: true, noStart: true,
    icon: '<circle cx="12" cy="12" r="9.8" stroke-dasharray="3 2"/><polygon class="f" points="13.5 2.2 5.5 12.8 11.5 12.8 9.5 21.8 18.5 10.8 12.8 10.8"/><circle class="f" cx="12" cy="12" r="2.2"/><ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(45 12 12)"/>',
    eligible: (lv, ctx, levels) => lv < 1 && (levels.orbiters | 0) >= 2 && (levels.chain | 0) >= 2,
    apply: (s) => { s.evoTesla = true; s.orbiters += 1; },
    text: () => 'SYNERGY: Orbiters automatically zap nearby enemies with lightning (+1 orbiter)',
  },
  {
    id: 'evoCryo', name: 'Absolute Zero', synergy: true, noStart: true,
    icon: '<polygon class="f" points="12 1.5 14.8 8.8 22.5 12 14.8 15.2 12 22.5 9.2 15.2 1.5 12 9.2 8.8"/><circle cx="12" cy="12" r="9.5" stroke-dasharray="3 3"/><circle class="f" cx="12" cy="12" r="2.5"/><path d="M5.5 5.5l13 13M18.5 5.5l-13 13"/>',
    eligible: (lv, ctx, levels) => lv < 1 && (levels.shockwave | 0) >= 2 && (levels.slowField | 0) >= 2,
    apply: (s) => { s.evoCryo = true; s.slowFactor = Math.min(0.75, s.slowFactor + 0.15); },
    text: () => 'SYNERGY: Shockwaves deep-freeze enemies for 2.8s & take +25% damage',
  },
  {
    id: 'evoNova', name: 'Chain Reaction', synergy: true, noStart: true,
    icon: '<circle class="f" cx="12" cy="12" r="4.8"/><circle cx="12" cy="12" r="9.8" stroke-dasharray="2 3"/><polygon points="12 2 15 8 21 9 16.5 13.5 18 19.5 12 16.5 6 19.5 7.5 13.5 3 9 9 8"/><path d="M2 12h4M18 12h4M12 2v4M12 18v4"/>',
    eligible: (lv, ctx, levels) => lv < 1 && (levels.critical | 0) >= 2 && (levels.blast | 0) >= 2,
    apply: (s) => { s.evoNova = true; s.critChance += 0.08; },
    text: () => 'SYNERGY: Enemies killed by Critical Hits detonate in a secondary nova',
  },

  /* ───────────────────────── 4 Boss Relics (Wave 10 & Wave 15 Rewards) ───────────────────────── */
  {
    id: 'relicTwin', name: 'Twin Core Barrel', bossRelic: true, noStart: true,
    icon: '<rect class="f" x="5.5" y="2.5" width="4.5" height="19" rx="1.2"/><rect class="f" x="14" y="2.5" width="4.5" height="19" rx="1.2"/><path d="M3 8h18M3 16h18"/><circle cx="7.7" cy="4.5" r="1"/><circle cx="16.2" cy="4.5" r="1"/><path d="M10 12h4"/>',
    eligible: (lv, ctx) => lv < 1 && !!ctx.bossRelicWave,
    apply: (s) => { s.relicTwin = true; s.fireRate *= 1.15; },
    text: () => 'BOSS RELIC: Core fires from twin parallel barrels simultaneously (+15% fire rate)',
  },
  {
    id: 'relicBurn', name: 'Plasma Incinerator', bossRelic: true, noStart: true,
    icon: '<path class="f" d="M12 1.8c2.6 4.2 7 6.8 7 11.7a7 7 0 1 1-14 0c0-3.4 1.8-3.2 4.2-8.4 0 2.3 1.6 3.4 2.8 3.4s1.2-2.7 0-6.7z"/><path d="M12 8.5c1.5 2.2 3.6 3.6 3.6 6.2a3.6 3.6 0 1 1-7.2 0c0-1.8.9-3.2 2.1-4.3"/><circle class="f" cx="12" cy="15.2" r="1.8"/>',
    eligible: (lv, ctx) => lv < 1 && !!ctx.bossRelicWave,
    apply: (s) => { s.relicBurn = true; },
    text: () => 'BOSS RELIC: Shots ignite enemies for 3s, burning for 45% weapon damage/sec',
  },
  {
    id: 'relicChrono', name: 'Chrono Singularity', bossRelic: true, noStart: true,
    icon: '<circle cx="12" cy="12" r="9.8" stroke-dasharray="2.5 2.5"/><polygon class="f" points="6.5 3.5 17.5 3.5 12 12 17.5 20.5 6.5 20.5 12 12"/><path d="M5 3.5h14M5 20.5h14"/><circle class="f" cx="12" cy="12" r="1.8"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/>',
    eligible: (lv, ctx) => lv < 1 && !!ctx.bossRelicWave,
    apply: (s) => { s.relicChrono = true; },
    text: () => 'BOSS RELIC: Slows all enemies by 18% (doubles to 36% when Core HP is low)',
  },
  {
    id: 'relicTitan', name: 'Titan Breaker Core', bossRelic: true, noStart: true,
    icon: '<polygon class="f" points="7.5 2 16.5 2 22 7.5 22 16.5 16.5 22 7.5 22 2 16.5 2 7.5"/><rect x="6.5" y="6.5" width="11" height="11" rx="2"/><circle class="f" cx="12" cy="12" r="2.8"/><path d="M12 2v4.5M12 17.5V22M2 12h4.5M17.5 12H22"/>',
    eligible: (lv, ctx) => lv < 1 && !!ctx.bossRelicWave,
    apply: (s) => { s.relicTitan = true; s.damage *= 1.25; s.bossMult *= 1.45; },
    text: () => 'BOSS RELIC: +25% weapon damage & +45% bonus damage against Bosses and Elites',
  },

  /* ───────────────────────── 4 Corrupted Cards (High Power + Trade-off) ───────────────────────── */
  {
    id: 'corruptGlass', name: 'Void Overdrive', corrupted: true, noStart: true,
    icon: '<polygon class="f" points="12 1.5 21.5 12 12 22.5 2.5 12"/><polygon points="12 5.5 17.5 12 12 18.5 6.5 12"/><path d="M12 1.5v21M2.5 12h19"/><circle class="f" cx="12" cy="12" r="2.5"/>',
    eligible: (lv, ctx) => lv < CONFIG.upgrades.corruptGlass.max && ctx.wave >= 3,
    apply: (s, lv, c) => {
      s.damage *= Math.pow(1 + c.dmgBonus, lv);
      s.projRangeMult *= Math.pow(1 - c.rangePenalty, lv);
    },
    text: () => 'CORRUPTED: +100% Weapon Damage, but -30% Projectile Range',
  },
  {
    id: 'corruptShield', name: 'Aegis Sacrifice', corrupted: true, noStart: true,
    icon: '<path class="f" d="M12 2L20 5.5V12c0 5.2-3.5 9.1-8 10.5C7.5 21.1 4 17.2 4 12V5.5z"/><path d="M4.5 4.5l15 15M19.5 4.5l-15 15"/><circle class="f" cx="12" cy="12" r="2.8"/>',
    eligible: (lv, ctx) => lv < 1 && ctx.wave >= 3,
    apply: (s, lv, c) => {
      s.shieldMax = 0;
      s.shieldRecharge = 0;
      s.fireRate *= 1 + c.fireRateBonus;
    },
    text: () => 'CORRUPTED: Converts all Energy Shields into +85% Fire Rate permanently',
  },
  {
    id: 'corruptCaliber', name: 'Abyssal Tungsten', corrupted: true, noStart: true,
    icon: '<polygon class="f" points="22.5 12 11 5 13.5 12 11 19"/><polygon class="f" points="13 12 4 6.5 6.5 12 4 17.5"/><path d="M1.5 12h19"/>',
    eligible: (lv, ctx) => lv < CONFIG.upgrades.corruptCaliber.max && ctx.wave >= 3,
    apply: (s, lv, c) => {
      s.damage *= Math.pow(1 + c.dmgBonus, lv);
      s.pierce += c.pierceBonus * lv;
      s.fireRate *= Math.pow(1 - c.ratePenalty, lv);
    },
    text: () => 'CORRUPTED: +140% Damage & +2 Pierce, but -35% Fire Rate',
  },
  {
    id: 'corruptBlood', name: 'Crimson Pact', corrupted: true, noStart: true,
    icon: '<path class="f" d="M12 2.2C7.5 8 4.8 11.4 4.8 15.4a7.2 7.2 0 0 0 14.4 0c0-4-2.7-7.4-7.2-13.2z"/><polygon points="12 8.5 15 14 12 18.5 9 14"/><circle class="f" cx="12" cy="14" r="2"/>',
    eligible: (lv, ctx) => lv < CONFIG.upgrades.corruptBlood.max && ctx.maxHp > 1 && ctx.wave >= 3,
    apply: (s, lv, c) => {
      s.critChance += c.critChance * lv;
      s.critMult += c.critMult * lv;
      s.maxHp = Math.max(1, s.maxHp - c.hpPenalty * lv);
    },
    text: () => 'CORRUPTED: +20% Crit Chance & +0.75× Crit Damage, but -1 Max HP',
  },
];

export const UPGRADE_BY_ID = Object.fromEntries(UPGRADES.map((u) => [u.id, u]));

export const BONUS_CARD = {
  id: 'bonus', name: 'Score Burst',
  icon: '<polygon class="f" points="12 1.8 14.8 8.2 21.5 9 16.5 13.6 17.8 20.4 12 17 6.2 20.4 7.5 13.6 2.5 9 9.2 8.2"/><circle cx="12" cy="12" r="9.8" stroke-dasharray="2.5 2.5"/><circle class="f" cx="12" cy="12.4" r="2.6"/>',
};

const RARITIES = ['common', 'rare', 'epic'];

export function buildStats(
  levels,
  fx = {},
  chassis = null,
  chassisLv = 1,
  equippedRunes = [],
  runeLevels = {}
) {
  const C = CONFIG.core;
  const ch = chassis || CONFIG.chassis[0];
  const cLv = Math.max(1, Math.min(CONFIG.chassisMaxLevel || 5, chassisLv | 0));
  const lvStep = cLv - 1;
  const awakened = cLv >= (CONFIG.chassisMaxLevel || 5);

  const runeFx = {
    hp: 0, damage: 0, fireRate: 0, projSpeed: 0, critChance: 0, critMult: 0,
    pierce: 0, bounce: 0, orbiters: 0, orbitDmg: 0, knockback: 0, bossDmg: 0,
    scoreMult: 0, globalSlow: 0, extraProj: 0, burn: false,
  };
  const rMults = CONFIG.runeLevelMults || [1.0, 1.5, 2.0];
  if (Array.isArray(equippedRunes) && CONFIG.runes) {
    for (const rId of equippedRunes) {
      const r = CONFIG.runes.find((x) => x.id === rId);
      if (!r) continue;
      const rLv = Math.max(1, Math.min(CONFIG.runeMaxLevel || 3, (runeLevels && runeLevels[rId]) || 1));
      const m = rMults[rLv - 1] || 1;
      const intBonus = rLv - 1;
      if (r.hp) runeFx.hp += Math.round(r.hp * m);
      if (r.damage) runeFx.damage += r.damage * m;
      if (r.fireRate) runeFx.fireRate += r.fireRate * m;
      if (r.projSpeed) runeFx.projSpeed += r.projSpeed * m;
      if (r.critChance) runeFx.critChance += r.critChance * m;
      if (r.critMult) runeFx.critMult += r.critMult * m;
      if (r.pierce) runeFx.pierce += r.pierce + (rLv >= 3 ? 1 : 0);
      if (r.bounce) runeFx.bounce += r.bounce + (rLv >= 3 ? 1 : 0);
      if (r.orbiters) runeFx.orbiters += r.orbiters + intBonus;
      if (r.orbitDmg) runeFx.orbitDmg += r.orbitDmg * m;
      if (r.knockback) runeFx.knockback += r.knockback * m;
      if (r.bossDmg) runeFx.bossDmg += r.bossDmg * m;
      if (r.scoreMult) runeFx.scoreMult += r.scoreMult * m;
      if (r.globalSlow) runeFx.globalSlow += r.globalSlow * m;
      if (r.extraProj) runeFx.extraProj += r.extraProj + (rLv >= 3 ? 1 : 0);
      if (r.burn) runeFx.burn = true;
    }
  }

  const baseOrbs =
    (ch.orbiters || 0) +
    (awakened ? (ch.awkOrbiters || 0) : 0) +
    runeFx.orbiters +
    (fx.capInterceptor ? 1 : 0);

  const aegisLv = fx.aegisStart | 0;
  const thornsStartLv = fx.thornsStart | 0;
  const orbitAmpMult = (1 + (fx.orbitAmp || 0)) * (1 + lvStep * (ch.lvOrbitDmg || 0)) * (1 + runeFx.orbitDmg);
  const shockAmpMult = 1 + (fx.shockAmp || 0);
  const arenaAmpMult = 1 + (fx.arenaAmp || 0);

  const chDmgMult = (ch.damageMult || 1) * (1 + lvStep * (ch.lvDamage || 0));
  const chRateMult = (ch.fireRateMult || 1) * (1 + lvStep * (ch.lvFireRate || 0));
  const chSpdMult = (ch.projSpeedMult || 1) * (1 + lvStep * (ch.lvSpeed || 0));

  const s = {
    awakened,
    maxHp: Math.min(
      C.hpCap,
      C.baseHp + (fx.hp || 0) + (ch.hpBonus || 0) + (awakened ? (ch.awkHp || 0) : 0) + runeFx.hp
    ),
    fireRate: C.fireRate * (1 + (fx.fireRate || 0) + runeFx.fireRate) * chRateMult,
    damage: C.damage * (1 + (fx.damage || 0) + runeFx.damage) * chDmgMult,
    projectiles: 1 + runeFx.extraProj,
    pierce: (ch.pierce || 0) + (fx.overpierce || 0) + (awakened ? (ch.awkPierce || 0) : 0) + runeFx.pierce,
    projSpeed: chSpdMult * (1 + (fx.projVelocity || 0) + runeFx.projSpeed),
    projRangeMult: 1,
    knockbackMult: 1 + (fx.blastGuard || 0) + runeFx.knockback,
    aimMagnetMult: 1 + (fx.aimMagnet || 0),
    shockAmpMult,
    orbitAmpMult,
    arenaAmpMult,
    invulnMult: 1 + (fx.invulnBoost || 0),
    podRateMult: 1 + (fx.podRate || 0),
    bossMult: 1 + (fx.bossSlayer || 0) + runeFx.bossDmg,
    hullRegenEvery: fx.hullRegenEvery || 0,
    aegisFast: Math.max(0, aegisLv - 1),
    thornsStartLv,
    critChance: (fx.critRate || 0) + (awakened ? (ch.awkCrit || 0) : 0) + runeFx.critChance,
    critMult: CONFIG.upgrades.critical.mult + (fx.critDmg || 0) + (awakened ? (ch.awkCritMult || 0) : 0) + runeFx.critMult,
    shockInterval: 0, shockRadius: 0, shockDamageMult: 0, shockKnock: 0,
    orbiters: baseOrbs,
    orbitRadius: baseOrbs > 0 ? CONFIG.upgrades.orbiters.radius + (awakened ? 6 : 0) + 2 * (baseOrbs - 1) : 0,
    orbitDamageMult: baseOrbs > 0 ? CONFIG.upgrades.orbiters.damage * orbitAmpMult : 0,
    shieldMax: aegisLv > 0 ? 1 : 0,
    shieldRecharge: aegisLv > 0 ? Math.max(1, 4 - (aegisLv - 1)) : 0,
    slowRadius: 0, slowFactor: 0,
    chainChance: (ch.chainChance || 0) + lvStep * (ch.lvChain || 0),
    chainRange: CONFIG.upgrades.chain.range,
    chainDamageMult: CONFIG.upgrades.chain.damage * orbitAmpMult,
    blastRadius: 0, blastDamageMult: 0,
    bounce: runeFx.bounce + (fx.startBounce || 0),
    bounceRange: CONFIG.upgrades.ricochet.range,
    vampKills: 0,
    executeThreshold: 0,
    thornsRadius: 0, thornsDamageMult: 0, thornsKnock: 0,
    homingTurn: 0, homingRange: 0,
    scoreMult: (1 + (awakened ? (ch.awkScore || 0) : 0)) * (1 + runeFx.scoreMult) * (1 + (fx.singularityScoreBonus || 0)),
    runeSlow: runeFx.globalSlow,
    capOmega: !!fx.capOmega,
    capPhoenix: !!fx.capPhoenix,
    capInterceptor: !!fx.capInterceptor,
    capSingularity: !!fx.capSingularity,
    brVamp: !!fx.brVamp,
    brCryo: !!fx.brCryo,
    brSalvage: !!fx.brSalvage,
    brGolden: !!fx.brGolden,
    evoPrism: false,
    evoTesla: false,
    evoCryo: false,
    evoNova: false,
    relicTwin: false, relicBurn: runeFx.burn, relicChrono: false, relicTitan: false,
  };

  if (thornsStartLv > 0) {
    const tc = CONFIG.upgrades.thorns;
    s.thornsRadius = tc.radius * shockAmpMult;
    s.thornsDamageMult = tc.damage + tc.damageStep * (thornsStartLv - 1);
    s.thornsKnock = tc.knock;
  }

  if (awakened && ch.awkShock && !(levels.shockwave > 0)) {
    const sc = CONFIG.upgrades.shockwave;
    s.shockInterval = sc.interval;
    s.shockRadius = sc.radius * shockAmpMult;
    s.shockDamageMult = sc.damage;
    s.shockKnock = sc.knock;
  }

  for (const u of UPGRADES) {
    const lv = levels[u.id] | 0;
    if (lv > 0 && u.apply) u.apply(s, lv, CONFIG.upgrades[u.id]);
  }

  s.projectiles = Math.min(s.projectiles, 1 + CONFIG.upgrades.multiShot.max + runeFx.extraProj);
  return s;
}

function eligible(u, levels, ctx) {
  const cfg = CONFIG.upgrades[u.id];
  if (u.eligible) return u.eligible(levels[u.id] | 0, ctx, levels);
  return (levels[u.id] | 0) < cfg.max;
}

function rollRarity(wave, rnd) {
  const R = CONFIG.rarity;
  const shift = Math.min(R.maxShift, R.waveShift * wave);
  const w = {
    common: Math.max(10, R.weights.common - shift),
    rare: R.weights.rare + shift * 0.6,
    epic: R.weights.epic + shift * 0.4,
  };
  let r = rnd() * (w.common + w.rare + w.epic);
  if ((r -= w.common) < 0) return 'common';
  if ((r -= w.rare) < 0) return 'rare';
  return 'epic';
}

function makeCard(u, levels, ctx, rnd) {
  const cfg = CONFIG.upgrades[u.id];
  const level = levels[u.id] | 0;
  if (u.bossRelic) {
    return {
      id: u.id, name: u.name, icon: u.icon, rarity: 'mythic', gain: 1, level: 0, next: 1, max: 1,
      text: u.text(1, cfg, 0, 1, ctx),
      levelLabel: 'Boss Relic', nextLabel: 'Relic',
      isRelic: true,
    };
  }
  if (u.synergy) {
    return {
      id: u.id, name: u.name, icon: u.icon, rarity: 'mythic', gain: 1, level: 0, next: 1, max: 1,
      text: u.text(1, cfg, 0, 1, ctx),
      levelLabel: 'Synergy', nextLabel: 'Evo',
    };
  }
  if (u.corrupted) {
    const next = level + 1;
    return {
      id: u.id, name: u.name, icon: u.icon, rarity: 'corrupted', gain: 1, level, next, max: cfg.max,
      text: u.text(1, cfg, level, next, ctx),
      levelLabel: level === 0 ? 'Corrupted' : `Lv ${level}`,
      nextLabel: next >= cfg.max ? 'Max' : `Lv ${next}`,
      isCorrupted: true,
    };
  }
  let rarity = rollRarity(ctx.wave, rnd);
  const remaining = u.instant ? 99 : cfg.max - level;
  const gain = Math.max(1, Math.min(CONFIG.rarity.gain[rarity], remaining));
  rarity = RARITIES[gain - 1];
  const next = level + gain;
  return {
    id: u.id, name: u.name, icon: u.icon, rarity, gain, level, next,
    max: u.instant ? 0 : cfg.max,
    text: u.text(gain, cfg, level, next, ctx),
    levelLabel: u.instant ? `HP ${ctx.hp}/${ctx.maxHp}` : level === 0 ? 'New' : `Lv ${level}`,
    nextLabel: u.instant ? '' : next >= cfg.max ? 'Max' : `Lv ${next}`,
  };
}

export function rollCards(levels, ctx, count, rnd = Math.random) {
  const cards = [];

  if (ctx.bossRelicWave) {
    const relicBag = UPGRADES.filter((u) => u.bossRelic && eligible(u, levels, ctx));
    while (cards.length < count && relicBag.length) {
      const idx = (rnd() * relicBag.length) | 0;
      cards.push(makeCard(relicBag.splice(idx, 1)[0], levels, ctx, rnd));
    }
  }

  const weightOf = (u) => {
    const base = CONFIG.upgrades[u.id].weight;
    if (ctx.singularityDeck && (u.synergy || u.corrupted)) return base * 2.0;
    return base;
  };

  const bag = UPGRADES.filter((u) => !u.bossRelic && eligible(u, levels, ctx));
  while (cards.length < count && bag.length) {
    let total = 0;
    for (const u of bag) total += weightOf(u);
    let r = rnd() * total, idx = 0;
    for (; idx < bag.length - 1; idx++) { r -= weightOf(bag[idx]); if (r <= 0) break; }
    cards.push(makeCard(bag.splice(idx, 1)[0], levels, ctx, rnd));
  }
  while (cards.length < count) {
    cards.push({
      id: BONUS_CARD.id, name: BONUS_CARD.name, icon: BONUS_CARD.icon, rarity: 'common', gain: 1,
      level: 0, next: 0, max: 0, text: `+${200 * ctx.wave} points`, levelLabel: 'Bonus', nextLabel: '',
    });
  }
  return cards;
}

export function pickStarting(count, rnd = Math.random) {
  const bag = UPGRADES.filter((u) => !u.noStart && !u.bossRelic && !u.synergy && !u.corrupted);
  const out = [];
  while (out.length < count && bag.length) out.push(bag.splice((rnd() * bag.length) | 0, 1)[0].id);
  return out;
}