/**
 * core.js — the player's Core: HP, shield, weapon (including Twin Core Barrel relic
 * & Omega Railgun capstone), 5-Level Chassis & Awakened perks, Upgradable Boss Runes,
 * Corrupted Cards, Gravity Leech orbit drain, Interceptor Halo orb defense, and shockwaves.
 */
import { CONFIG } from './config.js';
import { buildStats, UPGRADE_BY_ID } from './upgrades.js';

const TAU = Math.PI * 2;
const angleDiff = (a, b) => { let d = a - b; while (d > Math.PI) d -= TAU; while (d < -Math.PI) d += TAU; return d; };

export class Core {
  constructor(game) {
    this.game = game;
    this.reset({});
  }

  /**
   * Start a fresh run.
   */
  reset(fx, chassis = null, chassisLv = 1, equippedRunes = [], runeLevels = {}) {
    this.fx = fx || {};
    this.chassis = chassis || CONFIG.chassis[0];
    this.chassisLv = chassisLv || 1;
    this.equippedRunes = equippedRunes || [];
    this.runeLevels = runeLevels || {};
    this.levels = {};
    this.stats = buildStats(
      this.levels,
      this.fx,
      this.chassis,
      this.chassisLv,
      this.equippedRunes,
      this.runeLevels
    );
    this.hp = this.stats.maxHp;
    this.shield = this.stats.shieldMax > 0 ? this.stats.shieldMax : 0;
    this.shieldCharge = 0;
    this.regenWaveCount = 0;
    this.vampCount = 0;
    this.shotCount = 0;
    this.phoenixUsed = false;
    this.cooldown = 0;
    this.invuln = 0;
    this.hurtT = 0;
    this.kick = 0;
    this.aim = -Math.PI / 2;
    this.aimShown = this.aim;
    this.firing = false;
    this.orbitA = 0;
    this.teslaT = 0;
    this.shockT = this.stats.shockInterval > 0 ? this.stats.shockInterval * 0.5 : 0;
    this.shocks = [];

    // Temporary battlefield buffs
    this.frenzyT = 0;
    this.surgeT = 0;
    this.salvageT = 0;
  }

  /** Rebuild stats after an in-run upgrade card. */
  recompute() {
    this.stats = buildStats(
      this.levels,
      this.fx,
      this.chassis,
      this.chassisLv,
      this.equippedRunes,
      this.runeLevels
    );
    this.hp = Math.min(this.hp, this.stats.maxHp);
    if (this.stats.shieldMax <= 0) this.shield = 0;
  }

  addUpgrade(id, gain = 1) {
    const u = UPGRADE_BY_ID[id];
    if (!u) return;
    if (u.instant) { this.heal(gain); return; }
    const before = this.levels[id] | 0;
    const hadShock = this.stats.shockInterval > 0;
    this.levels[id] = Math.min(CONFIG.upgrades[id].max, before + gain);
    this.recompute();
    if (id === 'shield' && before === 0 && this.stats.shieldMax > 0) this.shield = this.stats.shieldMax;
    if (id === 'corruptShield') this.shield = 0;
    if (id === 'shockwave' && !hadShock) this.shockT = this.stats.shockInterval * 0.5;
  }

  /** Restore HP (never above max HP). */
  heal(n = 1) {
    this.hp = Math.min(this.stats.maxHp, this.hp + n);
  }

  /** Trigger a reactive Counter-Pulse shockwave if `thorns` upgrade or `thornsStart` node is active. */
  triggerThorns() {
    const st = this.stats;
    if (!st.thornsRadius) return;
    this.shocks.push({
      r: CONFIG.core.radius,
      max: st.thornsRadius,
      dmgMult: st.thornsDamageMult,
      kb: st.thornsKnock,
      cryo: st.evoCryo,
      hit: new Set(),
    });
    this.game.audio.shockwave();
  }

  /** Apply a hit. Returns 'ignored' | 'blocked' | 'revived' | 'hit' | 'dead'. */
  hurt(amount = 1) {
    if (this.invuln > 0) return 'ignored';
    const invMul = this.stats.invulnMult || 1;
    if (this.shield > 0) {
      this.shield--;
      this.shieldCharge = 0;
      this.invuln = 0.5 * invMul;
      this.triggerThorns();
      return 'blocked';
    }
    this.hp -= amount;
    if (this.hp <= 0 && this.stats.capPhoenix && !this.phoenixUsed) {
      this.phoenixUsed = true;
      this.hp = Math.max(1, Math.ceil(this.stats.maxHp * 0.5));
      this.invuln = 1.6 * invMul;
      this.hurtT = 0.35;
      this.shocks.push({
        r: CONFIG.core.radius,
        max: 340,
        dmgMult: 4.0,
        kb: 520,
        cryo: true,
        hit: new Set(),
      });
      this.game.audio.shockwave();
      return 'revived';
    }
    this.invuln = CONFIG.core.invuln * invMul;
    this.hurtT = 0.3;
    if (this.hp > 0) this.triggerThorns();
    return this.hp <= 0 ? 'dead' : 'hit';
  }

  /** Called when a wave is cleared. Handles Skill Tree hull regen and Shield recharge. */
  onWaveCleared() {
    const st = this.stats;
    if (st.hullRegenEvery > 0) {
      if (++this.regenWaveCount >= st.hullRegenEvery) {
        this.regenWaveCount = 0;
        if (this.hp < st.maxHp) this.heal(1);
      }
    }
    if (!st.shieldMax || this.shield >= st.shieldMax) return false;
    if (++this.shieldCharge >= st.shieldRecharge) {
      this.shield = st.shieldMax;
      this.shieldCharge = 0;
      return true;
    }
    return false;
  }

  update(dt, playing) {
    const g = this.game, st = this.stats, inp = g.input;
    if (this.cooldown > 0) this.cooldown = Math.max(0, this.cooldown - dt);
    if (this.invuln > 0) this.invuln -= dt;
    if (this.hurtT > 0) this.hurtT -= dt;
    if (this.frenzyT > 0) this.frenzyT = Math.max(0, this.frenzyT - dt);
    if (this.surgeT > 0) this.surgeT = Math.max(0, this.surgeT - dt);
    if (this.salvageT > 0) this.salvageT = Math.max(0, this.salvageT - dt);
    this.kick = Math.max(0, this.kick - dt * 7);

    if (inp.hasAim) {
      const target = Math.atan2(inp.aimY, inp.aimX);
      this.aimShown += angleDiff(target, this.aimShown) * (1 - Math.exp(-26 * dt));
      this.aim = this.aimShown;
    }

    const leeches = g.enemies?.leechCount || 0;
    const leechMul = leeches > 0 ? Math.max(0.45, 1 - leeches * (CONFIG.enemies.leech?.drainRate || 0.16)) : 1;
    const salvageMul = this.salvageT > 0 ? 1.35 : 1.0;

    const effectiveFireRate = st.fireRate * (this.frenzyT > 0 ? 2.0 : 1.0) * salvageMul * leechMul;
    this.firing = playing && inp.firing;
    if (playing && this.cooldown <= 0 && (inp.firing || inp.peekTap())) {
      this.shoot();
      this.cooldown = 1 / effectiveFireRate;
    }

    if (playing) {
      this.updateOrbiters(dt, leechMul);
      this.updateShock(dt);
    }
  }

  shoot() {
    const g = this.game, st = this.stats, inp = g.input;
    inp.consumeTap();
    let a = this.aim;
    if (inp.hasAim && inp.aimX * inp.aimX + inp.aimY * inp.aimY > 100) a = Math.atan2(inp.aimY, inp.aimX);
    a = this.assist(a);
    const n = st.projectiles, spread = CONFIG.core.spread;
    const twinOffset = st.relicTwin ? (CONFIG.upgrades.relicTwin.offset || 6.5) : 0;

    this.shotCount++;
    const isOmegaShot = st.capOmega && this.shotCount % 6 === 0;

    for (let i = 0; i < n; i++) {
      const ang = a + (i - (n - 1) / 2) * spread;
      const centerBolt = i === ((n / 2) | 0);
      const omega = isOmegaShot && centerBolt;
      const crit = omega || this.surgeT > 0 || (st.critChance > 0 && Math.random() < st.critChance);
      if (twinOffset > 0) {
        g.projectiles.fire(ang, crit, st, -twinOffset, omega);
        g.projectiles.fire(ang, crit, st, twinOffset, omega);
      } else {
        g.projectiles.fire(ang, crit, st, 0, omega);
      }
    }
    this.aim = a;
    this.kick = isOmegaShot ? 1.35 : 1;
    g.audio.shoot();
  }

  /** Pull the shot toward the enemy it nearly hits (amplified by Skill Tree `aimMagnet`). */
  assist(a) {
    const A = CONFIG.core.aimAssist;
    if (!A.strength) return a;
    const magnetRange = A.range * (this.stats.aimMagnetMult || 1);
    const enemies = this.game.enemies.pool.items;
    let best = 1e9, bestDa = 0;
    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      if (e.dead) continue;
      const d = Math.hypot(e.x, e.y);
      if (d < 40) continue;
      const da = angleDiff(Math.atan2(e.y, e.x), a);
      if (da > 0.5 || da < -0.5) continue;
      const miss = Math.abs(Math.sin(da)) * d;
      if (miss < e.r + magnetRange && miss < best) { best = miss; bestDa = da; }
    }
    return best === 1e9 ? a : a + bestDa * A.strength;
  }

  updateOrbiters(dt, leechMul = 1) {
    const st = this.stats;
    if (!st.orbiters) return;
    const C = CONFIG.upgrades.orbiters, g = this.game, enemies = g.enemies.pool.items;
    this.orbitA += C.speed * leechMul * dt;
    const dmg = st.damage * st.orbitDamageMult;
    for (let k = 0; k < st.orbiters; k++) {
      const a = this.orbitA + (k * TAU) / st.orbiters;
      const ox = Math.cos(a) * st.orbitRadius, oy = Math.sin(a) * st.orbitRadius;
      for (let i = 0; i < enemies.length; i++) {
        const e = enemies[i];
        if (e.dead || e.orbCd > 0 || e.immune > 0) continue;
        const dx = e.x - ox, dy = e.y - oy, rr = e.r + C.size + (st.capInterceptor && e.key === 'orb' ? 4 : 0);
        if (dx * dx + dy * dy > rr * rr) continue;

        if (st.capInterceptor && e.key === 'orb') {
          g.fx.sparks(e.x, e.y, 0, '#2effb4', 5, TAU);
          g.enemies.markDead(e);
          continue;
        }

        e.orbCd = C.cooldown;
        const d = Math.hypot(e.x, e.y) || 1;
        g.damageEnemy(e, dmg, { dx: e.x / d, dy: e.y / d, kb: 150, crit: false });
      }
    }

    if (st.evoTesla) {
      this.teslaT -= dt;
      if (this.teslaT <= 0) {
        this.teslaT = CONFIG.upgrades.evoTesla.arcInterval;
        const range2 = CONFIG.upgrades.evoTesla.arcRange ** 2;
        for (let k = 0; k < st.orbiters; k++) {
          const a = this.orbitA + (k * TAU) / st.orbiters;
          const ox = Math.cos(a) * st.orbitRadius, oy = Math.sin(a) * st.orbitRadius;
          let best = null, bd2 = range2;
          for (let i = 0; i < enemies.length; i++) {
            const e = enemies[i];
            if (e.dead || e.immune > 0) continue;
            const dx = e.x - ox, dy = e.y - oy, d2 = dx * dx + dy * dy;
            if (d2 < bd2) { bd2 = d2; best = e; }
          }
          if (best) {
            const d = Math.sqrt(bd2) || 1;
            g.fx.bolt(ox, oy, best.x, best.y, '#8ff5ff', 0.16);
            g.damageEnemy(best, st.damage * 0.55 * (st.orbitAmpMult || 1), {
              dx: (best.x - ox) / d, dy: (best.y - oy) / d, kb: 35, crit: false,
            });
          }
        }
      }
    }
  }

  updateShock(dt) {
    const st = this.stats, g = this.game;
    if (st.shockInterval > 0) {
      this.shockT -= dt;
      if (this.shockT <= 0) {
        if (g.enemies.alive > 0) {
          this.shocks.push({
            r: CONFIG.core.radius, max: st.shockRadius,
            dmgMult: st.shockDamageMult, kb: st.shockKnock, cryo: st.evoCryo, hit: new Set(),
          });
          this.shockT = st.shockInterval;
          g.audio.shockwave();
          g.fx.shake(2.5);
        } else this.shockT = 0;
      }
    }
    if (!this.shocks.length) return;
    const U = CONFIG.upgrades.shockwave, enemies = g.enemies.pool.items;
    for (let s = this.shocks.length - 1; s >= 0; s--) {
      const ring = this.shocks[s];
      ring.r += U.speed * dt;
      const dmg = st.damage * (ring.dmgMult ?? st.shockDamageMult);
      const kb = ring.kb ?? st.shockKnock;
      for (let i = 0; i < enemies.length; i++) {
        const e = enemies[i];
        if (e.dead || ring.hit.has(e.uid)) continue;
        const d = Math.hypot(e.x, e.y);
        if (d - e.r > ring.r) continue;
        ring.hit.add(e.uid);
        if (ring.cryo) e.chillT = CONFIG.upgrades.evoCryo.chillDur;
        g.damageEnemy(e, dmg, { dx: e.x / (d || 1), dy: e.y / (d || 1), kb, crit: false });
      }
      if (ring.r >= ring.max) this.shocks.splice(s, 1);
    }
  }
}