/**
 * projectiles.js — object pool + player shots with Pierce, Ricochet, Seeker Homing,
 * Prism Matrix split-bounce, Twin Barrel lateral offsets, Omega Railgun bolts,
 * World 1 Data Gateways, World 5 Prism Refraction, and World 6 Quantum Wormhole teleportation.
 */
import { CONFIG } from './config.js';

const TAU = Math.PI * 2;
const angleDiff = (a, b) => { let d = a - b; while (d > Math.PI) d -= TAU; while (d < -Math.PI) d += TAU; return d; };

export class Pool {
  constructor(factory, warm = 0) {
    this.factory = factory;
    this.items = [];
    this.free = [];
    for (let i = 0; i < warm; i++) this.free.push(factory());
  }
  get() {
    const o = this.free.length ? this.free.pop() : this.factory();
    o._i = this.items.length;
    this.items.push(o);
    return o;
  }
  release(o) {
    const i = o._i;
    if (i < 0) return;
    const last = this.items.pop();
    if (last !== o) { this.items[i] = last; last._i = i; }
    o._i = -1;
    this.free.push(o);
  }
  clear() {
    while (this.items.length) {
      const o = this.items.pop();
      o._i = -1;
      this.free.push(o);
    }
  }
}

export class ProjectileSystem {
  constructor(game) {
    this.game = game;
    this.pool = new Pool(() => ({
      _i: -1, x: 0, y: 0, vx: 0, vy: 0,
      dmg: 1, crit: false, amp: false, warped: false, omega: false, homingOverride: 0,
      pierce: 0, bounce: 0, life: 0, hit: new Set(),
    }), 64);
  }

  /**
   * Fire a bolt at angle `a`.
   */
  fire(a, crit, stats, perpOffset = 0, omega = false) {
    const C = CONFIG.core, p = this.pool.get();
    const sp = C.projectileSpeed * stats.projSpeed * (omega ? 1.25 : 1);
    const muzzle = C.radius + 6;
    const ca = Math.cos(a), sa = Math.sin(a);
    const nx = -sa, ny = ca;
    p.x = ca * muzzle + nx * perpOffset;
    p.y = sa * muzzle + ny * perpOffset;
    p.vx = ca * sp;
    p.vy = sa * sp;
    p.dmg = stats.damage * (omega ? 2.5 : (crit ? stats.critMult : 1));
    p.crit = crit || omega;
    p.amp = false;
    p.warped = false;
    p.omega = omega;
    p.homingOverride = 0;
    p.pierce = stats.pierce + (omega ? 10 : 0);
    p.bounce = stats.bounce || 0;
    const rangeMult = (stats.projRangeMult || 1) * (stats.projSpeed > 1 ? 1.1 : 1);
    p.life = (C.projectileRange * rangeMult) / sp;
    p.hit.clear();
  }

  /** Spawn a child bolt directly at (x, y) — used by Prism Matrix synergy & World 5 Prism Refractor. */
  spawnSplit(x, y, a, src, stats, forceHoming = false, dmgRatio = 0.65) {
    if (this.pool.items.length >= 150) return;
    const p = this.pool.get();
    const sp = CONFIG.core.projectileSpeed * stats.projSpeed;
    p.x = x; p.y = y;
    p.vx = Math.cos(a) * sp;
    p.vy = Math.sin(a) * sp;
    p.dmg = (src ? src.dmg : stats.damage) * dmgRatio;
    p.crit = src ? src.crit : true;
    p.amp = src ? src.amp : true;
    p.warped = true;
    p.omega = false;
    p.homingOverride = forceHoming ? 4.8 : 0;
    p.pierce = forceHoming ? 1 : 0;
    p.bounce = 0;
    p.life = (forceHoming ? 0.75 : 0.45) * (stats.projRangeMult || 1);
    p.hit.clear();
    if (src && src.hit) {
      for (const id of src.hit) p.hit.add(id);
    }
  }

  update(dt) {
    const g = this.game, shots = this.pool.items, enemies = g.enemies.pool.items;
    const pr = CONFIG.core.projectileRadius, st = g.core.stats;
    const baseHomingTurn = st.homingTurn || 0, baseHomingRange2 = (st.homingRange || 0) ** 2;
    const bRange2 = (st.bounceRange || 145) ** 2;
    const arenaMult = st.arenaAmpMult || 1;
    const hasGateways = (g.worldIdx === 0 || g.isEndless) && g.gatewayAngles?.length > 0;
    const hasWormholes = (g.worldIdx === 5 || (g.isEndless && g.wave >= 10)) && g.wormholes?.length === 2;
    const GW = CONFIG.arena.gateways;
    const WH = CONFIG.arena.wormhole;

    for (let i = shots.length - 1; i >= 0; i--) {
      const p = shots[i];
      p.life -= dt;
      if (p.life <= 0) { this.pool.release(p); continue; }

      // Soft homing steering toward nearest non-hit enemy
      const hTurn = Math.max(baseHomingTurn, p.homingOverride || 0);
      const hRange2 = p.homingOverride > 0 ? 240 * 240 : baseHomingRange2;
      if (hTurn > 0) {
        let best = null, bd2 = hRange2;
        for (let j = 0; j < enemies.length; j++) {
          const e = enemies[j];
          if (e.dead || e.immune > 0 || e.phased || p.hit.has(e.uid)) continue;
          const dx = e.x - p.x, dy = e.y - p.y, d2 = dx * dx + dy * dy;
          if (d2 < bd2) { bd2 = d2; best = e; }
        }
        if (best) {
          const curA = Math.atan2(p.vy, p.vx);
          const targetA = Math.atan2(best.y - p.y, best.x - p.x);
          const da = angleDiff(targetA, curA);
          const maxStep = hTurn * dt;
          const nextA = curA + Math.max(-maxStep, Math.min(maxStep, da));
          const sp = Math.hypot(p.vx, p.vy);
          p.vx = Math.cos(nextA) * sp;
          p.vy = Math.sin(nextA) * sp;
        }
      }

      const prevD = Math.hypot(p.x, p.y);
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      const newD = Math.hypot(p.x, p.y);

      // Data Amplifier Gateways (World 1 & Endless Hybrid Arena)
      if (hasGateways && !p.amp && prevD <= GW.radius && newD >= GW.radius) {
        const ang = Math.atan2(p.y, p.x);
        for (let k = 0; k < g.gatewayAngles.length; k++) {
          if (Math.abs(angleDiff(ang, g.gatewayAngles[k])) <= GW.span * 0.5) {
            p.amp = true;
            p.crit = true;
            p.dmg *= 1 + (GW.dmgMult - 1) * arenaMult;
            p.vx *= GW.speedMult;
            p.vy *= GW.speedMult;
            g.fx.flare(p.x, p.y, '#8ff5ff', 14, 0.14, 0.85);
            break;
          }
        }
      }

      // Twin Quantum Wormholes (World 6 & Endless Hybrid Arena)
      if (hasWormholes && !p.warped) {
        const w0 = g.wormholes[0], w1 = g.wormholes[1];
        const pr2 = (WH.portalRadius || 24) ** 2;
        const d0 = (p.x - w0.x) ** 2 + (p.y - w0.y) ** 2;
        const d1 = (p.x - w1.x) ** 2 + (p.y - w1.y) ** 2;
        if (d0 <= pr2 || d1 <= pr2) {
          const exit = d0 <= pr2 ? w1 : w0;
          p.warped = true;
          p.crit = true;
          p.dmg *= 1 + (WH.dmgMult - 1) * arenaMult;
          p.pierce += WH.extraPierce || 1;
          p.x = exit.x;
          p.y = exit.y;
          p.life = Math.max(p.life, 0.55);
          let targetA = Math.atan2(exit.y, exit.x);
          let bestD2 = 1e9;
          for (let j = 0; j < enemies.length; j++) {
            const e = enemies[j];
            if (e.dead || e.immune > 0) continue;
            const d2 = (e.x - exit.x) ** 2 + (e.y - exit.y) ** 2;
            if (d2 < bestD2) {
              bestD2 = d2;
              targetA = Math.atan2(e.y - exit.y, e.x - exit.x);
            }
          }
          const sp = Math.hypot(p.vx, p.vy) * 1.15;
          p.vx = Math.cos(targetA) * sp;
          p.vy = Math.sin(targetA) * sp;
          g.fx.ring(exit.x, exit.y, 4, 28, 0.22, '#b8ff2e', 2.2);
          g.fx.flare(exit.x, exit.y, '#ff007f', 18, 0.16, 0.85);
        }
      }

      for (let j = enemies.length - 1; j >= 0; j--) {
        const e = enemies[j];
        if (e.dead || e.immune > 0 || e.phased || p.hit.has(e.uid)) continue;
        const dx = e.x - p.x, dy = e.y - p.y, rr = e.r + pr + (p.omega ? 4 : 0);
        if (dx * dx + dy * dy > rr * rr) continue;
        p.hit.add(e.uid);
        g.hitEnemy(e, p);

        if (p.bounce > 0) {
          let nextE = null, nd2 = bRange2;
          for (let k = 0; k < enemies.length; k++) {
            const o = enemies[k];
            if (o.dead || o.immune > 0 || o.phased || p.hit.has(o.uid)) continue;
            const odx = o.x - e.x, ody = o.y - e.y, d2 = odx * odx + ody * ody;
            if (d2 < nd2) { nd2 = d2; nextE = o; }
          }
          if (nextE) {
            p.bounce--;
            const sp = Math.hypot(p.vx, p.vy);
            const ba = Math.atan2(nextE.y - e.y, nextE.x - e.x);
            p.x = e.x; p.y = e.y;
            p.vx = Math.cos(ba) * sp;
            p.vy = Math.sin(ba) * sp;
            p.dmg *= 0.85;
            p.life = Math.max(p.life, 0.45);
            if (st.evoPrism) this.spawnSplit(e.x, e.y, ba + 0.32, p, st);
            break;
          }
        }

        if (p.pierce > 0) {
          p.pierce--;
          if (!p.omega) p.dmg *= 0.85;
        } else {
          this.pool.release(p);
          break;
        }
      }
    }
  }

  clear() { this.pool.clear(); }
}