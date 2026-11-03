/**
 * enemies.js — enemy pool, movement behaviours for all 6 Worlds,
 * Tactical Enemies (Gravity Leech, Shield Linker, Splitter Portal),
 * World 2 Magma Rocks, World 3 Gravity Wells, World 4 Aether Pylons,
 * World 5 Prism Refractors, Plasma Burn DoT (`relicBurn`), Chrono Slow (`relicChrono`),
 * and 18 multi-phase Boss mechanics.
 */
import { CONFIG } from './config.js';
import { Pool } from './projectiles.js';

const TAU = Math.PI * 2;
let UID = 1;

const makeEnemy = () => ({
  _i: -1, uid: 0, key: '', def: null,
  x: 0, y: 0, vx: 0, vy: 0,
  kx: 0, ky: 0,
  bx: 0, by: 0,
  hp: 1, maxHp: 1, r: 10, speed: 0,
  t: 0, spawnT: 0, flash: 0, immune: 0, orbCd: 0, chillT: 0,
  burnT: 0, burnDps: 0, burnTick: 0,
  lastHitT: 0,
  phased: false,
  mirageCloned: false,
  heading: 0, phase: 0, dir: 1, auxT: 0,
  elite: false,
  dead: false,
  latched: false,
  linkTarget: null,
  shieldedBy: null,
  boss: false, bossDef: null, bossState: 0, hoverA: 0, hoverD: 0, atk: 0, atkIdx: 0, tele: 0,
  shieldA: 0, shieldSpan: 0,
  charging: 0, chargeMax: 2.2, chargeDmg: 0, chargeTarget: 0, staggerT: 0,
});

export const BOSS_DEFS = CONFIG.bosses.map((B, i) => ({
  ...B, key: `boss${i}`, behavior: 'boss', points: 0, shards: 70, knockResist: 1,
}));

export const BEHAVIORS = {
  seek(e, dt, g, m) {
    const d = Math.hypot(e.x, e.y) || 1, nx = -e.x / d, ny = -e.y / d, sp = e.speed * m;
    e.heading = Math.atan2(ny, nx);
    e.vx = nx * sp + e.kx;
    e.vy = ny * sp + e.ky;
    e.x += e.vx * dt;
    e.y += e.vy * dt;
  },

  zigzag(e, dt, g, m) {
    const d = Math.hypot(e.x, e.y) || 1, nx = -e.x / d, ny = -e.y / d;
    const tx = -ny, ty = nx;
    const wave = Math.cos(e.t * (e.def.waveFreq || 5) + e.phase) * (e.def.waveAmp || 0.65);
    const burst = 0.85 + 0.3 * Math.sin(e.t * 3.5 + e.phase);
    const sp = e.speed * m * burst;
    e.vx = (nx + tx * wave) * sp + e.kx;
    e.vy = (ny + ty * wave) * sp + e.ky;
    e.heading = Math.atan2(e.vy, e.vx);
    e.x += e.vx * dt;
    e.y += e.vy * dt;
  },

  spiral(e, dt, g, m) {
    const d = Math.hypot(e.x, e.y) || 1, nx = -e.x / d, ny = -e.y / d;
    const tx = -ny * e.dir, ty = nx * e.dir;
    const sw = (e.def.swirl || 1.0) * Math.min(1, Math.max(0.25, d / 180)), sp = e.speed * m;
    e.vx = (nx + tx * sw) * sp + e.kx;
    e.vy = (ny + ty * sw) * sp + e.ky;
    e.heading = Math.atan2(e.vy, e.vx);
    e.x += e.vx * dt;
    e.y += e.vy * dt;
  },

  blink(e, dt, g, m) {
    const d = Math.hypot(e.x, e.y) || 1, nx = -e.x / d, ny = -e.y / d, sp = e.speed * m;
    e.auxT += dt;
    const interval = e.def.blinkInterval || 2.9;
    e.tele = e.auxT > interval - 0.45 ? (e.auxT - (interval - 0.45)) / 0.45 : 0;
    if (e.auxT >= interval && d > 95) {
      e.auxT = 0;
      e.tele = 0;
      const oldX = e.x, oldY = e.y;
      const jump = Math.min(e.def.blinkDist || 60, d - 65);
      const side = (Math.random() < 0.5 ? -1 : 1) * 28;
      e.x += nx * jump - ny * side;
      e.y += ny * jump + nx * side;
      g.fx.ring(oldX, oldY, e.r * 1.4, 2, 0.25, e.def.color, 1.8);
      g.fx.ring(e.x, e.y, 2, e.r * 2.1, 0.3, e.def.color, 2.2);
      g.fx.flare(e.x, e.y, e.def.color, e.r * 2.2, 0.2, 0.7);
      if (g.audio.teleport) g.audio.teleport();
    }
    e.heading = Math.atan2(ny, nx);
    e.vx = nx * sp + e.kx;
    e.vy = ny * sp + e.ky;
    e.x += e.vx * dt;
    e.y += e.vy * dt;
  },

  mend(e, dt, g, m) {
    const d = Math.hypot(e.x, e.y) || 1, nx = -e.x / d, ny = -e.y / d, sp = e.speed * m;
    e.auxT += dt;
    if (e.auxT >= (e.def.healInterval || 2.6)) {
      e.auxT = 0;
      const hr = e.def.healRadius || 115, hr2 = hr * hr;
      const healAmt = (e.def.healAmount || 0.85) * g.waveScale.hp;
      const list = g.enemies.pool.items;
      let healedAny = false;
      for (let i = 0; i < list.length; i++) {
        const o = list[i];
        if (o.dead || o === e || o.hp >= o.maxHp) continue;
        const dx = o.x - e.x, dy = o.y - e.y;
        if (dx * dx + dy * dy <= hr2) {
          o.hp = Math.min(o.maxHp, o.hp + healAmt);
          g.fx.ring(o.x, o.y, o.r * 0.6, o.r * 1.6, 0.3, '#70e000', 1.8);
          healedAny = true;
        }
      }
      g.fx.ring(e.x, e.y, e.r, hr, 0.45, '#70e000', healedAny ? 2.4 : 1.4);
      if (healedAny && g.audio.healPulse) g.audio.healPulse();
    }
    e.heading = Math.atan2(ny, nx);
    e.vx = nx * sp + e.kx;
    e.vy = ny * sp + e.ky;
    e.x += e.vx * dt;
    e.y += e.vy * dt;
  },

  sniper(e, dt, g, m) {
    const d = Math.hypot(e.x, e.y) || 1, nx = -e.x / d, ny = -e.y / d;
    const stopD = e.def.stopDist || 215;
    e.heading = Math.atan2(ny, nx);
    if (d > stopD) {
      const sp = e.speed * m;
      e.vx = nx * sp + e.kx;
      e.vy = ny * sp + e.ky;
    } else {
      const tx = -ny * e.dir, ty = nx * e.dir, sp = e.speed * 0.38 * m;
      e.vx = tx * sp + e.kx;
      e.vy = ty * sp + e.ky;
      e.auxT += dt;
      const fireInt = e.def.fireInterval || 2.8;
      e.tele = e.auxT > fireInt - 0.5 ? (e.auxT - (fireInt - 0.5)) / 0.5 : 0;
      if (e.auxT >= fireInt) {
        e.auxT = 0;
        e.tele = 0;
        const oSpd = e.def.orbSpeed || 98;
        const o = g.enemies.spawn('orb', e.x + nx * (e.r + 6), e.y + ny * (e.r + 6), {
          quiet: true, instant: true, hpMult: Math.min(g.waveScale.hp, 1.8), immune: 0.08,
        });
        o.bx = nx * oSpd;
        o.by = ny * oSpd;
        g.fx.flare(e.x + nx * e.r, e.y + ny * e.r, e.def.color, 16, 0.16, 0.8);
      }
    }
    e.x += e.vx * dt;
    e.y += e.vy * dt;
  },

  /* ───────────────────────── World 5 & World 6 Behaviours ───────────────────────── */

  icicle(e, dt, g, m) {
    const d = Math.hypot(e.x, e.y) || 1, nx = -e.x / d, ny = -e.y / d;
    const rush = 1 + Math.max(0, (320 - d) / 260) * 1.15;
    const sp = e.speed * m * rush;
    e.heading = Math.atan2(ny, nx);
    e.vx = nx * sp + e.kx;
    e.vy = ny * sp + e.ky;
    e.x += e.vx * dt;
    e.y += e.vy * dt;
  },

  mirage(e, dt, g, m) {
    BEHAVIORS.zigzag(e, dt, g, m);
    if (!e.mirageCloned && e.hp < e.maxHp * 0.55 && g.enemies.alive < CONFIG.world.maxEnemies) {
      e.mirageCloned = true;
      const ang = Math.atan2(e.y, e.x) + (Math.random() < 0.5 ? 0.22 : -0.22);
      const dist = Math.hypot(e.x, e.y);
      const clone = g.enemies.spawn('mirage', Math.cos(ang) * dist, Math.sin(ang) * dist, {
        instant: true, hpMult: (e.hp / e.def.hp) * 0.65, immune: 0.15,
      });
      clone.mirageCloned = true;
      g.fx.ring(e.x, e.y, 4, e.r * 2.4, 0.3, '#e066ff', 2);
      if (g.audio.teleport) g.audio.teleport();
    }
  },

  spore(e, dt, g, m) {
    BEHAVIORS.seek(e, dt, g, m);
    if (e.hp < e.maxHp && e.t - e.lastHitT > 1.8) {
      e.hp = Math.min(e.maxHp, e.hp + (e.def.regenRate || 0.65) * g.waveScale.hp * dt);
    }
  },

  shifter(e, dt, g, m) {
    e.auxT += dt;
    const interval = e.def.phaseInterval || 3.2;
    const cycle = e.auxT % interval;
    const wasPhased = e.phased;
    e.phased = cycle >= interval - 0.65;
    if (e.phased && !wasPhased) {
      g.fx.ring(e.x, e.y, e.r * 0.6, e.r * 1.9, 0.25, '#ff007f', 1.8);
    }
    BEHAVIORS.zigzag(e, dt, g, m * (e.phased ? 1.35 : 1));
  },

  brood(e, dt, g, m) {
    BEHAVIORS.seek(e, dt, g, m);
    e.auxT += dt;
    const interval = e.def.broodInterval || 3.6;
    e.tele = e.auxT > interval - 0.5 ? (e.auxT - (interval - 0.5)) / 0.5 : 0;
    if (e.auxT >= interval) {
      e.auxT = 0;
      e.tele = 0;
      if (g.enemies.alive < CONFIG.world.maxEnemies) {
        const ang = Math.atan2(-e.y, -e.x) + (Math.random() - 0.5) * 0.6;
        const s = g.enemies.spawn('shard', e.x + Math.cos(ang) * 14, e.y + Math.sin(ang) * 14, {
          quiet: true, instant: true, immune: 0.1,
        });
        s.kx = Math.cos(ang) * 130;
        s.ky = Math.sin(ang) * 130;
        g.fx.ring(e.x, e.y, 4, e.r * 1.9, 0.28, '#b8ff2e', 1.8);
      }
    }
  },

  /* ───────────────────────── 3 Tactical Enemy Behaviours ───────────────────────── */

  leech(e, dt, g, m) {
    const d = Math.hypot(e.x, e.y) || 1, nx = -e.x / d, ny = -e.y / d;
    const orbitD = e.def.orbitDist || 64;
    if (d > orbitD + 8 && !e.latched) {
      const tx = -ny * e.dir, ty = nx * e.dir;
      const sp = e.speed * m;
      e.vx = (nx * 0.85 + tx * 0.35) * sp + e.kx;
      e.vy = (ny * 0.85 + ty * 0.35) * sp + e.ky;
      e.x += e.vx * dt;
      e.y += e.vy * dt;
      e.heading = Math.atan2(ny, nx);
    } else {
      if (!e.latched) {
        e.latched = true;
        e.hoverA = Math.atan2(e.y, e.x);
        e.hoverD = d;
        g.fx.ring(e.x, e.y, 4, e.r * 2.2, 0.3, '#ff38ab', 2);
      }
      e.hoverA += 1.65 * e.dir * m * dt;
      e.hoverD += (orbitD - e.hoverD) * (1 - Math.exp(-5 * dt));
      const targetX = Math.cos(e.hoverA) * e.hoverD + e.kx * 0.15;
      const targetY = Math.sin(e.hoverA) * e.hoverD + e.ky * 0.15;
      e.vx = (targetX - e.x) / Math.max(0.001, dt);
      e.vy = (targetY - e.y) / Math.max(0.001, dt);
      e.x = targetX;
      e.y = targetY;
      e.heading = Math.atan2(-e.y, -e.x);
      g.enemies.leechCount++;
    }
  },

  linker(e, dt, g, m) {
    const d = Math.hypot(e.x, e.y) || 1, nx = -e.x / d, ny = -e.y / d;
    const hoverD = e.def.hoverDist || 175;
    if (d > hoverD) {
      const sp = e.speed * m;
      e.vx = nx * sp + e.kx;
      e.vy = ny * sp + e.ky;
    } else {
      const tx = -ny * e.dir, ty = nx * e.dir, sp = e.speed * 0.45 * m;
      e.vx = tx * sp + e.kx;
      e.vy = ty * sp + e.ky;
    }
    e.x += e.vx * dt;
    e.y += e.vy * dt;
    e.heading = Math.atan2(ny, nx);

    const range2 = (e.def.linkRange || 250) ** 2;
    const list = g.enemies.pool.items;
    let best = null, bestScore = -1;
    for (let i = 0; i < list.length; i++) {
      const o = list[i];
      if (
        o.dead || o === e || o.boss || o.key === 'linker' || o.key === 'orb' ||
        o.def.isLoot || o.def.isCapsule || o.def.isMagma || o.def.isPylon || o.def.isPrism || o.shieldedBy
      ) continue;
      const dx = o.x - e.x, dy = o.y - e.y, d2 = dx * dx + dy * dy;
      if (d2 <= range2 && o.hp > bestScore) {
        bestScore = o.hp;
        best = o;
      }
    }
    e.linkTarget = best;
    if (best) best.shieldedBy = e;
  },

  portal(e, dt, g, m) {
    const d = Math.hypot(e.x, e.y) || 1, nx = -e.x / d, ny = -e.y / d;
    const hoverD = e.def.hoverDist || 225;
    if (d > hoverD) {
      const sp = (e.speed * 2.2) * m;
      e.vx = nx * sp + e.kx * 0.25;
      e.vy = ny * sp + e.ky * 0.25;
    } else {
      const tx = -ny * e.dir, ty = nx * e.dir, sp = e.speed * m;
      e.vx = tx * sp + e.kx * 0.2;
      e.vy = ty * sp + e.ky * 0.2;
    }
    e.x += e.vx * dt;
    e.y += e.vy * dt;
    e.heading += dt * 1.4;

    e.auxT += dt;
    const spawnInt = e.def.spawnInterval || 3.4;
    e.tele = e.auxT > spawnInt - 0.6 ? (e.auxT - (spawnInt - 0.6)) / 0.6 : 0;
    if (e.auxT >= spawnInt) {
      e.auxT = 0;
      e.tele = 0;
      if (g.enemies.alive < CONFIG.world.maxEnemies) {
        const baseA = Math.atan2(-e.y, -e.x);
        for (let k = -1; k <= 1; k += 2) {
          const ang = baseA + k * 0.28;
          const s = g.enemies.spawn('shard', e.x + Math.cos(ang) * 14, e.y + Math.sin(ang) * 14, {
            quiet: true, instant: true, immune: 0.12,
          });
          s.kx = Math.cos(ang) * 145;
          s.ky = Math.sin(ang) * 145;
        }
        g.fx.ring(e.x, e.y, 4, e.r * 2.2, 0.35, '#9b5de5', 2.4);
        g.fx.flare(e.x, e.y, '#e066ff', e.r * 2.0, 0.2, 0.75);
        if (g.audio.teleport) g.audio.teleport();
      }
    }
  },

  flyby(e, dt, g, m) {
    const weave = Math.sin(e.t * 4.5 + e.phase) * 24;
    const ang = Math.atan2(e.by, e.bx);
    const nx = -Math.sin(ang), ny = Math.cos(ang);
    e.vx = (e.bx + nx * weave) * m + e.kx;
    e.vy = (e.by + ny * weave) * m + e.ky;
    e.heading = Math.atan2(e.vy, e.vx);
    e.x += e.vx * dt;
    e.y += e.vy * dt;
  },

  capsule(e, dt, g, m) {
    const d = Math.hypot(e.x, e.y) || 1, nx = -e.x / d, ny = -e.y / d;
    const tx = -ny * e.dir, ty = nx * e.dir;
    e.vx = tx * e.speed * m + e.kx * 0.4;
    e.vy = ty * e.speed * m + e.ky * 0.4;
    e.heading += dt * 1.2;
    e.x += e.vx * dt;
    e.y += e.vy * dt;
    const life = CONFIG.powerups.lifeTime || 10;
    if (e.t > life - 1.5) e.tele = (e.t - (life - 1.5)) / 1.5;
  },

  bolt(e, dt, g, m) {
    e.vx = e.bx * m + e.kx;
    e.vy = e.by * m + e.ky;
    e.heading = Math.atan2(e.by, e.bx);
    e.x += e.vx * dt;
    e.y += e.vy * dt;
  },

  boss(e, dt, g, m) {
    const B = e.bossDef;
    if (e.staggerT > 0) {
      e.staggerT = Math.max(0, e.staggerT - dt);
      e.vx = e.vy = 0;
      e.tele = 0;
      return;
    }

    e.shieldA = (e.shieldA + (B.shieldSpin || 0.65) * dt) % TAU;

    const d = Math.hypot(e.x, e.y) || 1;
    if (e.bossState === 0) {
      const nx = -e.x / d, ny = -e.y / d, sp = e.speed * m;
      e.vx = nx * sp; e.vy = ny * sp;
      e.x += e.vx * dt; e.y += e.vy * dt;
      e.heading = Math.atan2(ny, nx);
      if (d <= B.hover + 4) { e.bossState = 1; e.hoverA = Math.atan2(e.y, e.x); e.hoverD = d; }
    } else {
      const orbitSpeed = e.charging > 0 ? B.orbit * 0.25 : B.orbit;
      e.hoverA += orbitSpeed * e.dir * m * dt;
      e.hoverD += (B.hover - e.hoverD) * (1 - Math.exp(-2 * dt));
      const nx = Math.cos(e.hoverA) * e.hoverD, ny = Math.sin(e.hoverA) * e.hoverD;
      e.vx = (nx - e.x) / dt; e.vy = (ny - e.y) / dt;
      e.x = nx; e.y = ny;
      e.heading = Math.atan2(-e.y, -e.x);
    }

    if (e.charging > 0) {
      e.charging -= dt;
      e.tele = 1 - Math.max(0, e.charging) / e.chargeMax;
      if (e.charging <= 0) {
        e.charging = 0;
        e.tele = 0;
        g.enemies.bossMegaBurst(e);
      }
      return;
    }

    if (e.spawnT >= CONFIG.feel.spawnTime) e.atk -= dt;
    e.tele = e.atk > 0 && e.atk < 0.6 ? 1 - e.atk / 0.6 : 0;
    if (e.atk <= 0) {
      if (e.atkIdx % 3 === 2 || (e.hp < e.maxHp * 0.65 && e.atkIdx % 2 === 1)) {
        e.charging = e.chargeMax = 2.4;
        e.chargeDmg = 0;
        e.chargeTarget = Math.max(3.5, e.maxHp * 0.12);
        e.atkIdx++;
        g.emit('banner', { text: 'Boss Charging!', sub: 'Focus fire to Stagger!', kind: 'boss' });
      } else {
        g.enemies.bossAttack(e);
      }
      e.atk = B.interval * (e.hp < e.maxHp * 0.5 ? 0.72 : 1);
    }
  },
};

export class EnemySystem {
  constructor(game) {
    this.game = game;
    this.pool = new Pool(makeEnemy, 90);
    this.alive = 0;
    this.boss = null;
    this.leechCount = 0;
  }

  spawn(key, x, y, opts = {}) {
    const g = this.game, def = opts.def || CONFIG.enemies[key], sc = g.waveScale;
    const e = this.pool.get();
    e.uid = UID++;
    e.key = key; e.def = def; e.dead = false;
    this.alive++;
    e.x = x; e.y = y; e.vx = e.vy = e.kx = e.ky = e.bx = e.by = 0;
    e.elite = !!opts.elite;
    const eliteHp = e.elite ? 2.0 : 1.0;
    e.maxHp = e.hp = def.hp * (opts.hpMult ?? sc.hp) * eliteHp;
    e.speed = def.speed * (opts.speedMult ?? sc.speed) * (0.94 + Math.random() * 0.12);
    e.r = def.radius * (e.elite ? 1.26 : 1);
    e.t = 0; e.flash = 0; e.orbCd = 0; e.chillT = 0;
    e.burnT = 0; e.burnDps = 0; e.burnTick = 0;
    e.lastHitT = 0;
    e.phased = false;
    e.mirageCloned = false;
    e.latched = false; e.linkTarget = null; e.shieldedBy = null;
    e.auxT = Math.random() * 0.8;
    e.spawnT = opts.instant ? CONFIG.feel.spawnTime : 0;
    e.immune = opts.immune || 0;
    e.heading = Math.atan2(-y, -x);
    e.phase = Math.random() * TAU;
    e.dir = Math.random() < 0.5 ? -1 : 1;
    e.boss = false; e.bossDef = null; e.bossState = 0; e.atk = 0; e.atkIdx = 0; e.tele = 0;
    e.shieldA = 0; e.shieldSpan = 0;
    e.charging = 0; e.chargeMax = 2.4; e.chargeDmg = 0; e.chargeTarget = 0; e.staggerT = 0;
    if (!opts.quiet) {
      const col = e.elite ? '#ffd23d' : def.color;
      g.fx.ring(x, y, 3, e.r * 2.2, 0.35, col, 2);
      g.fx.flare(x, y, col, e.r * 2.1, 0.24, 0.45);
    }
    return e;
  }

  spawnLootDrone() {
    const R = CONFIG.world.spawnRadius - 10;
    const a1 = Math.random() * TAU;
    const offset = (Math.random() < 0.5 ? 1 : -1) * (1.9 + Math.random() * 0.6);
    const a2 = a1 + offset;
    const x1 = Math.cos(a1) * R, y1 = Math.sin(a1) * R;
    const x2 = Math.cos(a2) * R, y2 = Math.sin(a2) * R;
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
    const e = this.spawn('loot', x1, y1, { speedMult: 1 });
    e.bx = (dx / len) * e.speed;
    e.by = (dy / len) * e.speed;
    return e;
  }

  spawnCapsule() {
    const a = Math.random() * TAU;
    const R = 135 + Math.random() * 65;
    return this.spawn('capsule', Math.cos(a) * R, Math.sin(a) * R, { speedMult: 1 });
  }

  spawnMagmaRock() {
    const a = Math.random() * TAU;
    const R = 125 + Math.random() * 85;
    return this.spawn('magmaRock', Math.cos(a) * R, Math.sin(a) * R, { speedMult: 1 });
  }

  spawnAetherPylon() {
    const a = Math.random() * TAU;
    const R = 140 + Math.random() * 70;
    return this.spawn('aetherPylon', Math.cos(a) * R, Math.sin(a) * R, { speedMult: 1 });
  }

  spawnPrismNode() {
    const a = Math.random() * TAU;
    const R = 130 + Math.random() * 75;
    return this.spawn('prismNode', Math.cos(a) * R, Math.sin(a) * R, { speedMult: 1 });
  }

  spawnBoss(bossIdx, wave) {
    const def = BOSS_DEFS[bossIdx % BOSS_DEFS.length];
    const hpMult = this.game.waveScale.hp * CONFIG.waves.bossHp;
    const a = Math.random() * TAU, R = CONFIG.world.spawnRadius + 30;
    const e = this.spawn(def.key, Math.cos(a) * R, Math.sin(a) * R, { def, hpMult, speedMult: 1 });
    e.boss = true; e.bossDef = def;
    e.atk = def.interval * 0.8;
    e.shieldA = Math.atan2(-e.y, -e.x) + Math.PI * 0.6;
    e.shieldSpan = def.shieldSpan || 1.4;
    this.boss = e;
    return e;
  }

  bossAttack(e) {
    const g = this.game, B = e.bossDef, enraged = e.hp < e.maxHp * 0.5;
    if (e.atkIdx % 2 === 0) {
      const n = B.summon.count + (enraged ? 1 : 0);
      for (let k = 0; k < n; k++) {
        const a = (k / n) * TAU + e.t;
        const type = B.summon.types[(Math.random() * B.summon.types.length) | 0];
        this.spawn(type, e.x + Math.cos(a) * (e.r + 18), e.y + Math.sin(a) * (e.r + 18), { immune: 0.2 });
      }
      g.fx.ring(e.x, e.y, e.r, e.r * 2.6, 0.5, B.color, 3);
    } else {
      const base = Math.atan2(-e.y, -e.x), n = B.fan.count + (enraged ? 2 : 0);
      const hpMult = Math.min(g.waveScale.hp, 2);
      for (let k = 0; k < n; k++) {
        const a = base + (n === 1 ? 0 : (k / (n - 1) - 0.5) * B.fan.arc);
        const o = this.spawn('orb', e.x + Math.cos(a) * (e.r + 6), e.y + Math.sin(a) * (e.r + 6),
          { quiet: true, instant: true, hpMult, immune: 0.1 });
        o.bx = Math.cos(a) * B.fan.speed;
        o.by = Math.sin(a) * B.fan.speed;
      }
      g.fx.ring(e.x, e.y, e.r * 0.8, e.r * 2, 0.4, B.color, 3);
    }
    e.atkIdx++;
    g.audio.bossAttack();
  }

  bossMegaBurst(e) {
    const g = this.game, B = e.bossDef;
    const base = Math.atan2(-e.y, -e.x);
    const count = (B.fan.count || 7) + 4;
    const hpMult = Math.min(g.waveScale.hp, 2.2);
    for (let k = 0; k < count; k++) {
      const a = base + ((k / (count - 1)) - 0.5) * 2.2;
      const o = this.spawn('orb', e.x + Math.cos(a) * (e.r + 8), e.y + Math.sin(a) * (e.r + 8),
        { quiet: true, instant: true, hpMult, immune: 0.1 });
      o.bx = Math.cos(a) * (B.fan.speed * 1.25);
      o.by = Math.sin(a) * (B.fan.speed * 1.25);
    }
    g.fx.ring(e.x, e.y, e.r * 0.6, e.r * 3.2, 0.55, '#ff4d5e', 4);
    g.fx.shake(8);
    g.audio.bossAttack();
  }

  markDead(e) {
    if (e.dead) return false;
    e.dead = true;
    if (e.linkTarget && e.linkTarget.shieldedBy === e) {
      e.linkTarget.shieldedBy = null;
    }
    e.linkTarget = null;
    this.alive--;
    if (e === this.boss) this.boss = null;
    return true;
  }

  update(dt) {
    const g = this.game, items = this.pool.items, st = g.core.stats;
    const coreR = CONFIG.core.radius, cull2 = CONFIG.world.cullRadius * CONFIG.world.cullRadius;
    const lootExit2 = (CONFIG.world.spawnRadius + 24) * (CONFIG.world.spawnRadius + 24);
    const spawnTime = CONFIG.feel.spawnTime;
    const slowR2 = st.slowRadius * st.slowRadius, slowMul = 1 - st.slowFactor;
    const chronoMul = st.relicChrono ? (1 - (g.core.hp <= 1 ? 0.36 : 0.18)) : 1;
    const gw = g.gravityWell;
    const kd = Math.exp(-7 * dt);

    this.leechCount = 0;
    for (let i = 0; i < items.length; i++) {
      items[i].shieldedBy = null;
      items[i].linkTarget = null;
    }

    for (let i = items.length - 1; i >= 0; i--) {
      const e = items[i];
      if (e.dead) continue;
      e.t += dt;
      if (e.spawnT < spawnTime) e.spawnT += dt;
      if (e.flash > 0) e.flash -= dt;
      if (e.immune > 0) e.immune -= dt;
      if (e.orbCd > 0) e.orbCd -= dt;
      if (e.chillT > 0) e.chillT -= dt;

      if (e.burnT > 0) {
        e.burnT -= dt;
        e.burnTick -= dt;
        if (e.burnTick <= 0) {
          e.burnTick = 0.35;
          const tickDmg = e.burnDps * 0.35;
          g.fx.sparks(e.x, e.y, Math.random() * TAU, '#ff6b4a', 2);
          g.damageEnemy(e, tickDmg, { dx: 0, dy: 0, kb: 0, crit: false, silent: true });
          if (e.dead) continue;
        }
      }

      e.kx *= kd; e.ky *= kd;

      let m = (slowR2 > 0 && e.x * e.x + e.y * e.y < slowR2 ? slowMul : 1) * chronoMul;
      if (e.chillT > 0) m *= 0.35;
      const fn = BEHAVIORS[e.def.behavior] || BEHAVIORS.seek;
      fn(e, dt, g, m);

      if (
        gw && gw.life > 0 && !e.boss && !e.def.isLoot && !e.def.isCapsule &&
        !e.def.isMagma && !e.def.isPylon && !e.def.isPrism && e.key !== 'orb' && e.key !== 'portal'
      ) {
        const gdx = gw.x - e.x, gdy = gw.y - e.y;
        const gd = Math.hypot(gdx, gdy) || 1;
        if (gd < gw.r && gd > 10) {
          const pull = CONFIG.arena.gravity.pullStrength * (st.arenaAmpMult || 1) * (1 - gd / gw.r) * dt;
          e.x += (gdx / gd) * pull;
          e.y += (gdy / gd) * pull;
        }
      }

      const d2 = e.x * e.x + e.y * e.y;
      if (e.def.behavior === 'capsule' && e.t >= (CONFIG.powerups.lifeTime || 10)) {
        g.fx.ring(e.x, e.y, e.r, 2, 0.25, e.def.color, 1.5);
        this.markDead(e);
        continue;
      }
      if (e.def.behavior === 'flyby' && d2 > lootExit2 && e.t > 1.0) {
        this.markDead(e);
        continue;
      }
      if (e.def.behavior === 'bolt' && d2 > cull2) {
        this.markDead(e);
        continue;
      }
      const rr = coreR + e.r * 0.7;
      if (d2 < rr * rr) g.enemyTouchesCore(e);
    }
  }

  sweep() {
    const items = this.pool.items;
    for (let i = items.length - 1; i >= 0; i--) if (items[i].dead) this.pool.release(items[i]);
  }

  clear() {
    this.pool.clear();
    this.alive = 0;
    this.boss = null;
    this.leechCount = 0;
  }
}