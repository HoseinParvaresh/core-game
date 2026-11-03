/**
 * renderer.js — everything that touches the canvas across all 6 Worlds & Endless Mode.
 * Visuals: Data Gateways, Magma Rocks, Gravity Wells, Aether Pylons, Prism Refractors,
 * Twin Quantum Wormholes, Tactical Enemies (Shield Linker beams, Gravity Leech tethers),
 * Shop Cosmetics (7 Bullet Skins, 6 Core Auras, 5 Shockwave Styles), Omega Railgun bolts,
 * Awakened Core Halos, Radar, and Damage Numbers.
 */
import { CONFIG } from './config.js';
import { Pool } from './projectiles.js';
import { ENEMY_ART, BOSS_ART, CORE_ART, CHASSIS_ART, CHASSIS_AWAKENED_ART, ORBITER_ART } from './art.js';
import { buildSet, drawSet, buildBolt, buildShield, buildField, buildBackdrop, getGlow, rgba } from './sprites.js';

const TAU = Math.PI * 2;
export const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
export const easeOutBack = (t, s = 1.70158) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2);

export const CORE_COLOR = '#8ff5ff';

/* ═════════════════════════════════ Fx ═════════════════════════════════ */

export class Fx {
  constructor() {
    this.parts = new Pool(() => ({ _i: -1, x: 0, y: 0, vx: 0, vy: 0, rot: 0, vr: 0, size: 1, life: 1, max: 1, color: '#fff', drag: 2, kind: 0 }), 160);
    this.rings = new Pool(() => ({ _i: -1, x: 0, y: 0, r0: 0, r1: 0, life: 1, max: 1, color: '#fff', width: 2 }), 16);
    this.bolts = new Pool(() => ({ _i: -1, pts: [], alt: [], life: 1, max: 1, color: '#fff' }), 8);
    this.flares = new Pool(() => ({ _i: -1, x: 0, y: 0, r: 10, a: 1, color: '#fff', life: 1, max: 1 }), 24);
    this.texts = new Pool(() => ({ _i: -1, x: 0, y: 0, vy: -42, str: '', color: '#fff', scale: 1, life: 0.55, max: 0.55 }), 36);
    this.density = 1;
    this.shakeAmt = 0;
    this.hurt = 0;
    this.white = 0;
  }

  burst(x, y, color, count, speed = 170, size = 4.5, life = 0.65) {
    const n = Math.max(1, Math.round(count * this.density));
    const cap = CONFIG.render.maxParticles;
    for (let i = 0; i < n && this.parts.items.length < cap; i++) {
      const p = this.parts.get(), a = Math.random() * TAU, s = speed * (0.35 + Math.random() * 0.8);
      p.x = x; p.y = y;
      p.vx = Math.cos(a) * s; p.vy = Math.sin(a) * s;
      p.rot = Math.random() * TAU; p.vr = (Math.random() - 0.5) * 14;
      p.size = size * (0.55 + Math.random() * 0.7);
      p.max = p.life = life * (0.6 + Math.random() * 0.7);
      p.color = color; p.drag = 2.4; p.kind = 0;
    }
  }

  sparks(x, y, dir, color, count = 3, spread = 1.7) {
    const n = Math.max(1, Math.round(count * this.density));
    const cap = CONFIG.render.maxParticles;
    for (let i = 0; i < n && this.parts.items.length < cap; i++) {
      const p = this.parts.get(), a = (spread >= TAU ? 0 : dir + Math.PI) + (Math.random() - 0.5) * spread, s = 130 + Math.random() * 200;
      p.x = x; p.y = y;
      p.vx = Math.cos(a) * s; p.vy = Math.sin(a) * s;
      p.rot = 0; p.vr = 0;
      p.size = 1.1 + Math.random() * 1.1;
      p.max = p.life = 0.14 + Math.random() * 0.18;
      p.color = color; p.drag = 3.2; p.kind = 1;
    }
  }

  ring(x, y, r0, r1, life, color, width = 2) {
    const r = this.rings.get();
    r.x = x; r.y = y; r.r0 = r0; r.r1 = r1; r.max = r.life = life; r.color = color; r.width = width;
  }

  flare(x, y, color, r, life = 0.2, a = 1) {
    if (this.flares.items.length >= 40) return;
    const f = this.flares.get();
    f.x = x; f.y = y; f.r = r; f.color = color; f.a = a; f.max = f.life = life;
  }

  text(x, y, str, color = '#e8f3ff', scale = 1) {
    if (this.texts.items.length >= 32 || this.density < 0.6) return;
    const t = this.texts.get();
    t.x = x;
    t.y = y;
    t.vy = -34 - scale * 8;
    t.str = str;
    t.color = color;
    t.scale = scale;
    t.max = t.life = 0.5;
  }

  bolt(x1, y1, x2, y2, color = '#bfe9ff', life = 0.2) {
    const b = this.bolts.get(), pts = b.pts, alt = b.alt;
    pts.length = 0; alt.length = 0;
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len, n = 7;
    pts.push(x1, y1);
    for (let i = 1; i < n; i++) {
      const t = i / n, j = (Math.random() - 0.5) * 18;
      pts.push(x1 + dx * t + nx * j, y1 + dy * t + ny * j);
    }
    pts.push(x2, y2);
    const k = 2 * (2 + ((Math.random() * 3) | 0)), side = Math.random() < 0.5 ? -1 : 1;
    let bx = pts[k], by = pts[k + 1];
    alt.push(bx, by);
    for (let i = 1; i <= 3; i++) {
      bx += (dx / len) * len * 0.1 + nx * side * 12 + (Math.random() - 0.5) * 10;
      by += (dy / len) * len * 0.1 + ny * side * 12 + (Math.random() - 0.5) * 10;
      alt.push(bx, by);
    }
    b.color = color; b.max = b.life = life;
  }

  shake(a) { this.shakeAmt = Math.min(28, Math.max(this.shakeAmt, a) + a * 0.25); }
  flashHurt(a = 1) { this.hurt = Math.max(this.hurt, a); }
  flashWhite(a = 1) { this.white = Math.max(this.white, a); }

  update(dt) {
    const P = this.parts.items;
    for (let i = P.length - 1; i >= 0; i--) {
      const p = P[i];
      if ((p.life -= dt) <= 0) { this.parts.release(p); continue; }
      const k = Math.exp(-p.drag * dt);
      p.vx *= k; p.vy *= k;
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.rot += p.vr * dt;
    }
    const T = this.texts.items;
    for (let i = T.length - 1; i >= 0; i--) {
      const t = T[i];
      if ((t.life -= dt) <= 0) { this.texts.release(t); continue; }
      t.y += t.vy * dt;
      t.vy *= Math.exp(-3.5 * dt);
    }
    for (const pool of [this.rings, this.bolts, this.flares]) {
      const it = pool.items;
      for (let i = it.length - 1; i >= 0; i--) if ((it[i].life -= dt) <= 0) pool.release(it[i]);
    }
    this.shakeAmt *= Math.exp(-CONFIG.feel.shake.decay * dt);
    if (this.shakeAmt < 0.05) this.shakeAmt = 0;
    this.hurt = Math.max(0, this.hurt - dt * 1.8);
    this.white = Math.max(0, this.white - dt * 2.6);
  }

  clear() {
    this.parts.clear(); this.rings.clear(); this.bolts.clear(); this.flares.clear(); this.texts.clear();
    this.shakeAmt = this.hurt = this.white = 0;
  }
}

/* ═════════════════════════════════ Renderer ═════════════════════════════════ */

export class Renderer {
  constructor(canvas, fx) {
    this.canvas = canvas;
    this.fx = fx;
    this.ctx = canvas ? canvas.getContext('2d', { alpha: false }) : null;
    this.w = 360; this.h = 640;
    this.cx = 180; this.cy = 320;
    this.dpr = 1;
    this.scale = 1;
    this.S = 1;
    this.W = 360; this.H = 640;
    this.ox = 0; this.oy = 0;
    this.sets = {};
    this.chassisSets = {};
    this.chassisAwakenedSets = {};
    this.bulletSkins = {};
    this.critSkins = {};
    this.ambient = [];
    this.dust = [];
    this.worldDef = CONFIG.worlds[0];
    this.themeColor = this.worldDef.color || CORE_COLOR;
    this.pending = false;
    this.dprCap = CONFIG.render.maxDpr;
    if (canvas) {
      this.resize();
      const queue = () => {
        if (this.pending) return;
        this.pending = true;
        requestAnimationFrame(() => { this.pending = false; this.resize(); });
      };
      window.addEventListener('resize', queue);
      window.addEventListener('orientationchange', queue);
      if (window.visualViewport) window.visualViewport.addEventListener('resize', queue);
    }
  }

  setWorldTheme(worldDef) {
    if (!worldDef) return;
    const changed = this.worldDef?.id !== worldDef.id;
    this.worldDef = worldDef;
    this.themeColor = worldDef.color || CORE_COLOR;
    if (this.canvas && changed) {
      this.buildThemeCaches();
    }
  }

  resize() {
    const w = Math.max(1, window.innerWidth), h = Math.max(1, window.innerHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, this.dprCap);
    if (w === this.w && h === this.h && dpr === this.dpr && Object.keys(this.sets).length > 0) return;
    this.w = w; this.h = h; this.dpr = dpr;
    this.cx = w / 2; this.cy = h / 2;
    this.canvas.width = this.W = Math.round(w * dpr);
    this.canvas.height = this.H = Math.round(h * dpr);
    this.scale = Math.min(w, h) / CONFIG.world.shortSide;
    this.S = this.scale * dpr;
    this.buildCaches();
  }

  lowerResolution() {
    if (this.dprCap <= 1 || this.dpr <= 1) return false;
    this.dprCap = Math.max(1, Math.min(this.dprCap, this.dpr) - 0.5);
    this.resize();
    return true;
  }

  buildCaches() {
    const S = this.S;
    this.sets = {};
    for (const [key, def] of Object.entries(CONFIG.enemies)) {
      const recipe = ENEMY_ART[key] || { artScale: 1.15, extent: 1.5, layers: def.shape || [{ kind: 'poly', sides: 5, fill: 0.2 }] };
      this.sets[key] = buildSet(recipe, def.color, def.radius, S, key);
    }
    CONFIG.bosses.forEach((B, i) => {
      this.sets[`boss${i}`] = buildSet(BOSS_ART[i % BOSS_ART.length], B.color, B.radius, S, `boss${i}`);
    });

    this.coreHurt = buildSet(CORE_ART, '#ff4d5e', CONFIG.core.radius, S, 'coreHurt');
    this.crit = buildBolt(S, '#ffd23d', 'bolt');
    this.omegaBolt = buildBolt(S, '#ff2a55', 'laser');
    this.shield = buildShield(S);
    this.field = buildField(S);

    this.buildThemeCaches();

    if (!this.dust.length) {
      for (let i = 0; i < 44; i++) {
        this.dust.push({ a: Math.random() * TAU, r0: Math.random() * 380, v: 5 + Math.random() * 11, s: 0.7 + Math.random() * 1.1 });
      }
    }
  }

  buildThemeCaches() {
    const S = this.S;
    const tCol = this.themeColor || CORE_COLOR;

    this.chassisSets = {};
    this.chassisAwakenedSets = {};
    for (const ch of CONFIG.chassis) {
      const recipe = (CHASSIS_ART && CHASSIS_ART[ch.id]) || CORE_ART;
      const awkRecipe = (CHASSIS_AWAKENED_ART && CHASSIS_AWAKENED_ART[ch.id]) || recipe;
      const col = ch.id === 'aegis' ? tCol : ch.color;
      this.chassisSets[ch.id] = buildSet(recipe, col, CONFIG.core.radius, S, `core_${ch.id}_${this.worldDef.id}`);
      this.chassisAwakenedSets[ch.id] = buildSet(awkRecipe, col, CONFIG.core.radius, S, `core_awk_${ch.id}_${this.worldDef.id}`);
    }
    this.coreSet = this.chassisSets.aegis || buildSet(CORE_ART, tCol, CONFIG.core.radius, S, 'core');
    this.orbSet = buildSet(ORBITER_ART, tCol, CONFIG.upgrades.orbiters.size, S, 'orbiter');
    this.bolt = buildBolt(S, tCol, 'bolt');

    this.bulletSkins = {};
    this.critSkins = {};
    for (const sk of (CONFIG.cosmetics?.bulletSkins || [])) {
      const col = sk.color || tCol;
      this.bulletSkins[sk.id] = buildBolt(S, col, sk.style || 'bolt');
      this.critSkins[sk.id] = buildBolt(S, '#ffd23d', sk.style || 'bolt');
    }

    this.backdrop = buildBackdrop(this.W, this.H, this.dpr, this.worldDef);

    const cx = this.W / 2, cy = this.H / 2, far = Math.hypot(cx, cy);
    const gc = document.createElement('canvas');
    gc.width = this.W; gc.height = this.H;
    const g = gc.getContext('2d');
    const step = CONFIG.world.gridStep * S;
    g.strokeStyle = this.worldDef?.gridColor || 'rgba(110,150,255,0.3)';
    g.lineWidth = Math.max(1, this.dpr * 0.9);
    g.beginPath();
    for (let x = cx % step; x < this.W; x += step) { const px = Math.round(x) + 0.5; g.moveTo(px, 0); g.lineTo(px, this.H); }
    for (let y = cy % step; y < this.H; y += step) { const py = Math.round(y) + 0.5; g.moveTo(0, py); g.lineTo(this.W, py); }
    g.stroke();
    g.globalCompositeOperation = 'destination-in';
    const mask = g.createRadialGradient(cx, cy, 0, cx, cy, far);
    mask.addColorStop(0, 'rgba(0,0,0,1)');
    mask.addColorStop(0.5, 'rgba(0,0,0,0.55)');
    mask.addColorStop(1, 'rgba(0,0,0,0.2)');
    g.fillStyle = mask;
    g.fillRect(0, 0, this.W, this.H);
    this.gridCv = gc;

    const keys = this.worldDef?.enemies || ['triangle', 'square', 'diamond', 'hexagon'];
    if (!this.ambient.length) {
      for (let i = 0; i < 12; i++) {
        this.ambient.push({
          key: keys[i % keys.length],
          a: Math.random() * TAU,
          rad: 130 + Math.random() * 200,
          w: (Math.random() < 0.5 ? -1 : 1) * (0.04 + Math.random() * 0.1),
          ph: Math.random() * TAU,
          k: 0.7 + Math.random() * 0.5,
        });
      }
    } else {
      for (let i = 0; i < this.ambient.length; i++) {
        this.ambient[i].key = keys[i % keys.length];
      }
    }
  }

  world() { this.ctx.setTransform(this.S, 0, 0, this.S, this.ox, this.oy); }

  render(game, alphaT) {
    const ctx = this.ctx;
    if (!ctx) return;
    const { W, H, S, dpr, fx } = this;
    const now = performance.now() / 1000;
    const core = game.core, stats = core.stats, state = game.state;
    const pulse = game.audio.pulse();
    const lite = fx.density < 0.6;
    const tCol = this.themeColor || CORE_COLOR;

    const sa = fx.shakeAmt * dpr;
    const sx = sa ? (Math.random() * 2 - 1) * sa : 0, sy = sa ? (Math.random() * 2 - 1) * sa : 0;
    this.ox = W / 2 + sx;
    this.oy = H / 2 + sy;

    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const bd = this.backdrop;
    ctx.drawImage(bd.cv, -bd.m + Math.sin(now * 0.05) * bd.m * 0.6 + sx * 0.4, -bd.m + Math.cos(now * 0.04) * bd.m * 0.6 + sy * 0.4);
    const gk = 1 + 0.012 * pulse;
    ctx.setTransform(gk, 0, 0, gk, (W / 2) * (1 - gk) + sx, (H / 2) * (1 - gk) + sy);
    ctx.globalAlpha = 0.6 + 0.35 * pulse;
    ctx.drawImage(this.gridCv, 0, 0);
    ctx.globalAlpha = 1;

    this.world();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = rgba(tCol, 0.08);
    ctx.setLineDash([4, 10]);
    ctx.beginPath(); ctx.arc(0, 0, CONFIG.world.spawnRadius, 0, TAU); ctx.stroke();
    ctx.setLineDash([]);

    ctx.globalCompositeOperation = 'lighter';

    if (!lite) {
      ctx.fillStyle = rgba(tCol, 0.55);
      for (const d of this.dust) {
        const r = (d.r0 + now * d.v) % 400, fade = Math.sin((r / 400) * Math.PI);
        ctx.globalAlpha = 0.5 * fade;
        ctx.fillRect(Math.cos(d.a) * r - d.s / 2, Math.sin(d.a) * r - d.s / 2, d.s, d.s);
      }
      ctx.globalAlpha = 1;
    }

    if (state === 'menu') {
      for (const a of this.ambient) {
        const set = this.sets[a.key];
        if (!set) continue;
        const ang = a.a + a.w * now;
        drawSet(this, set, Math.cos(ang) * a.rad, Math.sin(ang) * a.rad, ang + Math.PI / 2, now, a.ph, a.k, 0.35, false, 1, true);
      }
      this.world();
    }

    // — World 1 & Endless Arena: Data Amplifier Gateways —
    if (state !== 'menu' && (game.worldIdx === 0 || game.isEndless) && game.gatewayAngles?.length) {
      const GW = CONFIG.arena.gateways;
      ctx.lineCap = 'round';
      for (let i = 0; i < game.gatewayAngles.length; i++) {
        const ga = game.gatewayAngles[i], half = GW.span * 0.5;
        ctx.strokeStyle = 'rgba(143, 245, 255, 0.26)';
        ctx.lineWidth = 8;
        ctx.beginPath(); ctx.arc(0, 0, GW.radius, ga - half, ga + half); ctx.stroke();
        ctx.strokeStyle = '#8ff5ff';
        ctx.lineWidth = 2.4;
        ctx.beginPath(); ctx.arc(0, 0, GW.radius, ga - half, ga + half); ctx.stroke();
      }
    }

    // — World 3 & Endless Arena: Swirling Gravity Well —
    if (state !== 'menu' && game.gravityWell && game.gravityWell.life > 0) {
      const gw = game.gravityWell, fade = Math.min(1, gw.life * 2);
      ctx.strokeStyle = rgba('#c77dff', 0.45 * fade);
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 8]);
      ctx.beginPath(); ctx.arc(gw.x, gw.y, gw.r, 0, TAU); ctx.stroke();
      ctx.setLineDash([]);
      const innerR = (gw.r * (1 - ((now * 1.4) % 1)));
      ctx.strokeStyle = rgba('#00f5d4', 0.55 * fade);
      ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.arc(gw.x, gw.y, innerR, 0, TAU); ctx.stroke();
      ctx.drawImage(getGlow('#c77dff'), gw.x - 42, gw.y - 42, 84, 84);
    }

    // — World 6 & Endless Arena: Twin Quantum Wormholes —
    if (state !== 'menu' && (game.worldIdx === 5 || (game.isEndless && game.wave >= 10)) && game.wormholes?.length === 2) {
      const w0 = game.wormholes[0], w1 = game.wormholes[1];
      const pr = CONFIG.arena.wormhole.portalRadius || 24;
      ctx.strokeStyle = 'rgba(184, 255, 46, 0.16)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 8]);
      ctx.beginPath(); ctx.moveTo(w0.x, w0.y); ctx.lineTo(w1.x, w1.y); ctx.stroke();
      ctx.setLineDash([]);

      [w0, w1].forEach((wh, idx) => {
        const col = idx === 0 ? '#b8ff2e' : '#ff007f';
        ctx.drawImage(getGlow(col), wh.x - pr * 1.6, wh.y - pr * 1.6, pr * 3.2, pr * 3.2);
        ctx.strokeStyle = col;
        ctx.lineWidth = 2.2;
        ctx.beginPath(); ctx.arc(wh.x, wh.y, pr, now * 2, now * 2 + Math.PI * 1.5); ctx.stroke();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.3;
        ctx.beginPath(); ctx.arc(wh.x, wh.y, pr * 0.55, -now * 3, -now * 3 + Math.PI * 1.3); ctx.stroke();
      });
    }

    if (stats.slowRadius > 0 && state !== 'menu') {
      const k = stats.slowRadius / 200, f = this.field, c = Math.cos(now * 0.15) * S * k, s = Math.sin(-now * 0.15) * S * k;
      ctx.globalAlpha = 0.9;
      ctx.setTransform(c, s, -s, c, this.ox, this.oy);
      ctx.drawImage(f.img, -f.half, -f.half, f.u, f.u);
      ctx.globalAlpha = 1;
      this.world();
    }

    // — Shop Cosmetic Shockwave Styles —
    const shocks = core.shocks;
    if (shocks.length > 0) {
      const shockStyle = game.equippedShockStyle || 'default';
      let sCol1 = tCol, sCol2 = '#ffffff';
      if (shockStyle === 'gold') { sCol1 = '#ffd23d'; sCol2 = '#ffffff'; }
      else if (shockStyle === 'crimson') { sCol1 = '#ff4d5e'; sCol2 = '#ffbe0b'; }
      else if (shockStyle === 'void') { sCol1 = '#c77dff'; sCol2 = '#00f5d4'; }
      else if (shockStyle === 'prismatic') {
        const pal = ['#ff388c', '#8ff5ff', '#ffd23d', '#2eff9c', '#c77dff'];
        sCol1 = pal[Math.floor(now * 9) % pal.length];
        sCol2 = pal[(Math.floor(now * 9) + 2) % pal.length];
      }
      for (let i = 0; i < shocks.length; i++) {
        const s = shocks[i], k = Math.min(1, s.r / s.max);
        ctx.strokeStyle = sCol1;
        ctx.globalAlpha = (1 - k * 0.85) * 0.38;
        ctx.lineWidth = 16 * (1 - k) + 3;
        ctx.beginPath(); ctx.arc(0, 0, s.r, 0, TAU); ctx.stroke();
        ctx.globalAlpha = 1 - k * 0.85;
        ctx.lineWidth = 5 * (1 - k) + 1;
        ctx.beginPath(); ctx.arc(0, 0, s.r, 0, TAU); ctx.stroke();
        if (shockStyle !== 'default' && s.r > 14) {
          ctx.strokeStyle = sCol2;
          ctx.globalAlpha = (1 - k * 0.85) * 0.65;
          ctx.lineWidth = 2.2 * (1 - k) + 0.8;
          ctx.beginPath(); ctx.arc(0, 0, s.r * 0.86, 0, TAU); ctx.stroke();
        }
      }
    }

    const rings = fx.rings.items;
    for (let i = 0; i < rings.length; i++) {
      const r = rings[i], k = 1 - r.life / r.max;
      ctx.globalAlpha = (1 - k) * 0.9;
      ctx.lineWidth = r.width * (1 - k * 0.6);
      ctx.strokeStyle = r.color;
      ctx.beginPath(); ctx.arc(r.x, r.y, r.r0 + (r.r1 - r.r0) * easeOutCubic(k), 0, TAU); ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // — Tactical Beams (Shield Linker & Gravity Leech) + Enemies —
    const spawnTime = CONFIG.feel.spawnTime, enemies = game.enemies.pool.items;
    this.world();
    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      if (e.dead) continue;
      if (e.key === 'linker' && e.linkTarget && !e.linkTarget.dead) {
        const t = e.linkTarget;
        ctx.strokeStyle = 'rgba(0, 245, 212, 0.32)';
        ctx.lineWidth = 6;
        ctx.beginPath(); ctx.moveTo(e.x, e.y); ctx.lineTo(t.x, t.y); ctx.stroke();
        ctx.strokeStyle = '#00f5d4';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.beginPath(); ctx.moveTo(e.x, e.y); ctx.lineTo(t.x, t.y); ctx.stroke();
        ctx.setLineDash([]);
      } else if (e.key === 'leech' && e.latched) {
        ctx.strokeStyle = 'rgba(255, 56, 171, 0.42)';
        ctx.lineWidth = 2.6;
        ctx.setLineDash([4, 5]);
        ctx.beginPath(); ctx.moveTo(e.x, e.y); ctx.lineTo(0, 0); ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      if (e.dead) continue;
      const set = this.sets[e.key];
      if (!set) continue;
      const ex = e.x + e.vx * alphaT, ey = e.y + e.vy * alphaT;
      let k = e.elite ? 1.26 : 1, a = e.phased ? 0.32 : 1;
      if (e.spawnT < spawnTime) { const s = e.spawnT / spawnTime; k *= 0.3 + 0.7 * easeOutBack(s); a *= Math.min(1, s * 1.8); }
      if (e.tele > 0) k *= 1 + 0.09 * Math.sin(e.tele * 14) * e.tele + 0.05 * e.tele;
      drawSet(this, set, ex, ey, e.heading, e.t, e.phase, k, a, e.flash > 0, e.hp / e.maxHp, lite && !e.boss);

      if (e.elite || e.chillT > 0 || e.burnT > 0 || e.shieldedBy || e.phased || e.boss) {
        this.world();
        if (e.phased) {
          ctx.strokeStyle = 'rgba(255, 0, 127, 0.65)';
          ctx.lineWidth = 1.6;
          ctx.setLineDash([4, 4]);
          ctx.beginPath(); ctx.arc(ex, ey, e.r * 1.22, 0, TAU); ctx.stroke();
          ctx.setLineDash([]);
        }
        if (e.shieldedBy && !e.shieldedBy.dead) {
          ctx.strokeStyle = '#00f5d4';
          ctx.lineWidth = 2.4;
          ctx.beginPath(); ctx.arc(ex, ey, e.r * 1.35, 0, TAU); ctx.stroke();
          ctx.fillStyle = 'rgba(0, 245, 212, 0.14)';
          ctx.fill();
        }
        if (e.elite) {
          ctx.strokeStyle = 'rgba(255, 210, 61, 0.65)';
          ctx.lineWidth = 1.6;
          ctx.beginPath(); ctx.arc(ex, ey, e.r * 1.25, 0, TAU); ctx.stroke();
        }
        if (e.chillT > 0) {
          ctx.strokeStyle = 'rgba(143, 245, 255, 0.75)';
          ctx.lineWidth = 1.8;
          ctx.beginPath(); ctx.arc(ex, ey, e.r * 1.15, 0, TAU); ctx.stroke();
        }
        if (e.burnT > 0) {
          ctx.strokeStyle = 'rgba(255, 107, 74, 0.8)';
          ctx.lineWidth = 1.8;
          ctx.beginPath(); ctx.arc(ex, ey, e.r * 1.18, 0, TAU); ctx.stroke();
        }
        if (e.boss) {
          if (e.staggerT <= 0 && e.shieldSpan > 0) {
            const sr = e.r * 1.32, span = e.shieldSpan;
            ctx.strokeStyle = rgba(tCol, 0.85);
            ctx.lineWidth = 4.2;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.arc(ex, ey, sr, e.shieldA - span * 0.5, e.shieldA + span * 0.5);
            ctx.stroke();
          }
          if (e.charging > 0) {
            const prog = Math.max(0, e.charging / (e.chargeMax || 2.4));
            const cr = e.r * (1.1 + prog * 1.3);
            ctx.strokeStyle = '#ff4d5e';
            ctx.lineWidth = 3 * (1 - prog * 0.5);
            ctx.beginPath(); ctx.arc(ex, ey, cr, 0, TAU); ctx.stroke();
          }
          if (e.staggerT > 0) {
            ctx.strokeStyle = 'rgba(255, 210, 61, 0.8)';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 6]);
            ctx.beginPath(); ctx.arc(ex, ey, e.r * 1.28, 0, TAU); ctx.stroke();
            ctx.setLineDash([]);
          }
        }
      }
    }
    this.world();
    ctx.globalAlpha = 1;

    if (stats.orbiters > 0) {
      const base = core.orbitA + CONFIG.upgrades.orbiters.speed * alphaT, glow = getGlow(tCol);
      for (let k = 0; k < stats.orbiters; k++) {
        const a = base + (k * TAU) / stats.orbiters;
        if (!lite) {
          for (let j = 1; j <= 5; j++) {
            const ta = a - j * 0.13, rr = 9 - j, tx = Math.cos(ta) * stats.orbitRadius, ty = Math.sin(ta) * stats.orbitRadius;
            ctx.globalAlpha = 0.55 - j * 0.1;
            ctx.setTransform(S, 0, 0, S, this.ox + tx * S, this.oy + ty * S);
            ctx.drawImage(glow, -rr, -rr, rr * 2, rr * 2);
          }
          ctx.globalAlpha = 1;
        }
        drawSet(this, this.orbSet, Math.cos(a) * stats.orbitRadius, Math.sin(a) * stats.orbitRadius, a + Math.PI / 2, now, k, 1, 1, false, 1, lite);
      }
      this.world();
    }

    // — Player Projectiles with Active Cosmetic Bullet Skin & Omega Railgun —
    const skinId = game.equippedBulletSkin || 'default';
    const normalBolt = this.bulletSkins[skinId] || this.bolt;
    const critBolt = this.critSkins[skinId] || this.crit;
    const shots = game.projectiles.pool.items;
    for (let i = 0; i < shots.length; i++) {
      const p = shots[i];
      const b = p.omega ? (this.omegaBolt || critBolt) : (p.crit ? critBolt : normalBolt);
      const ang = Math.atan2(p.vy, p.vx);
      const scaleMul = p.omega ? 1.45 : 1;
      const c = Math.cos(ang) * S * scaleMul, s = Math.sin(ang) * S * scaleMul;
      ctx.setTransform(c, s, -s, c, this.ox + (p.x + p.vx * alphaT) * S, this.oy + (p.y + p.vy * alphaT) * S);
      ctx.drawImage(b.img, -b.head, -b.h / 2, b.u, b.h);
    }
    this.world();

    const bolts = fx.bolts.items;
    for (let i = 0; i < bolts.length; i++) {
      const b = bolts[i], fade = Math.min(1, (b.life / b.max) * 1.4);
      ctx.strokeStyle = b.color;
      for (let pass = 0; pass < 2; pass++) {
        ctx.lineWidth = pass ? 1.6 : 6;
        ctx.globalAlpha = fade * (pass ? 1 : 0.32);
        for (const pts of [b.pts, b.alt]) {
          if (pts.length < 4) continue;
          ctx.beginPath();
          ctx.moveTo(pts[0], pts[1]);
          for (let j = 2; j < pts.length; j += 2) ctx.lineTo(pts[j], pts[j + 1]);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;

    if (!game.coreDead) this.drawCore(game, now);

    const flares = fx.flares.items;
    for (let i = 0; i < flares.length; i++) {
      const f = flares[i], k = f.life / f.max, r = f.r * (0.55 + 0.9 * (1 - k));
      ctx.globalAlpha = f.a * Math.min(1, k * 1.3);
      ctx.drawImage(getGlow(f.color), f.x - r, f.y - r, r * 2, r * 2);
    }
    ctx.globalAlpha = 1;

    const parts = fx.parts.items;
    let lastColor = '';
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i], k = p.life / p.max;
      if (p.color !== lastColor) { ctx.fillStyle = p.color; ctx.strokeStyle = p.color; lastColor = p.color; }
      ctx.globalAlpha = k;
      const x = p.x + p.vx * alphaT * 0.5, y = p.y + p.vy * alphaT * 0.5;
      if (p.kind === 1) {
        ctx.lineWidth = p.size * (0.5 + 0.5 * k);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - p.vx * 0.04, y - p.vy * 0.04);
        ctx.stroke();
        continue;
      }
      const sz = p.size * (0.35 + 0.65 * k), c = Math.cos(p.rot) * sz, s = Math.sin(p.rot) * sz;
      ctx.beginPath();
      ctx.moveTo(x + c, y + s);
      ctx.lineTo(x - c * 0.5 - s * 0.87, y - s * 0.5 + c * 0.87);
      ctx.lineTo(x - c * 0.5 + s * 0.87, y - s * 0.5 - c * 0.87);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

    // — Sci-Fi Floating Damage Numbers —
    const texts = fx.texts.items;
    if (texts.length > 0) {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let i = 0; i < texts.length; i++) {
        const t = texts[i], k = t.life / t.max;
        ctx.globalAlpha = Math.min(1, k * 1.6);
        ctx.font = `700 ${Math.round(11 * t.scale)}px 'Orbitron', 'Rajdhani', monospace, sans-serif`;
        ctx.fillStyle = t.color;
        ctx.fillText(t.str, t.x, t.y);
      }
      ctx.globalAlpha = 1;
    }

    // — boss health & charge interrupt bars —
    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      if (!e.boss || e.dead) continue;
      const w = 96, h = 5, x = e.x + e.vx * alphaT - w / 2, y = e.y + e.vy * alphaT - e.r * 1.2 - 16, f = Math.max(0, e.hp / e.maxHp);
      ctx.fillStyle = 'rgba(5,6,13,0.7)';
      ctx.fillRect(x - 1.5, y - 1.5, w + 3, h + 3);
      ctx.fillStyle = 'rgba(255,255,255,0.14)';
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = e.staggerT > 0 ? '#ffd23d' : e.def.color;
      ctx.fillRect(x, y, w * f, h);
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.fillRect(x, y, w * f, 1.4);
      ctx.fillStyle = 'rgba(5,6,13,0.9)';
      for (let q = 1; q < 4; q++) ctx.fillRect(x + (w * q) / 4 - 0.5, y, 1, h);

      if (e.charging > 0 && e.chargeTarget > 0) {
        const cf = Math.max(0, 1 - e.chargeDmg / e.chargeTarget);
        ctx.fillStyle = 'rgba(5,6,13,0.8)';
        ctx.fillRect(x, y + 7, w, 3);
        ctx.fillStyle = '#ff4d5e';
        ctx.fillRect(x, y + 7, w * cf, 3);
      }
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (fx.hurt > 0.01) {
      const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.2, W / 2, H / 2, Math.hypot(W, H) * 0.55);
      g.addColorStop(0, 'rgba(255,40,70,0)');
      g.addColorStop(1, `rgba(255,40,70,${0.6 * fx.hurt})`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = `rgba(255,30,60,${0.12 * fx.hurt})`;
      ctx.fillRect(0, 0, W, H);
    }
    if (fx.white > 0.01) {
      ctx.fillStyle = `rgba(255,255,255,${0.4 * fx.white})`;
      ctx.fillRect(0, 0, W, H);
    }
  }

  drawCoreAura(ctx, auraId, R, now, fallbackCol) {
    if (!auraId || auraId === 'default') return;
    ctx.save();
    if (auraId === 'runic') {
      const col = '#8ff5ff';
      ctx.strokeStyle = rgba(col, 0.55);
      ctx.lineWidth = 1.5;
      const r = R + 15;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = now * 0.7 + (i * TAU) / 6;
        const px = Math.cos(a) * r, py = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.strokeStyle = rgba(col, 0.32);
      ctx.beginPath();
      ctx.arc(0, 0, r + 3, 0, TAU);
      ctx.stroke();
    } else if (auraId === 'binary') {
      const col = '#00f5d4';
      ctx.strokeStyle = rgba(col, 0.65);
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 8]);
      ctx.beginPath();
      ctx.arc(0, 0, R + 14, now * 1.1, now * 1.1 + TAU);
      ctx.stroke();
      ctx.strokeStyle = rgba(col, 0.4);
      ctx.lineWidth = 1.4;
      ctx.setLineDash([3, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, R + 19, -now * 0.8, -now * 0.8 + TAU);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (auraId === 'solar') {
      const col = '#ffd23d';
      ctx.strokeStyle = rgba(col, 0.65);
      ctx.lineWidth = 1.6;
      const pts = 16, rIn = R + 12, rOut = R + 19;
      ctx.beginPath();
      for (let i = 0; i < pts; i++) {
        const a = now * 0.6 + (i * TAU) / pts;
        const rr = i % 2 === 0 ? rOut : rIn;
        const px = Math.cos(a) * rr, py = Math.sin(a) * rr;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    } else if (auraId === 'void') {
      ctx.strokeStyle = 'rgba(199, 125, 255, 0.65)';
      ctx.lineWidth = 2;
      for (let k = 0; k < 3; k++) {
        const a0 = -now * 1.8 + (k * TAU) / 3;
        ctx.beginPath();
        ctx.arc(0, 0, R + 15, a0, a0 + 1.15);
        ctx.stroke();
      }
    } else if (auraId === 'seraph') {
      const col = '#2eff9c';
      ctx.strokeStyle = rgba(col, 0.55);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, R + 16, 0, TAU);
      ctx.stroke();
      ctx.fillStyle = '#ffd23d';
      for (let k = 0; k < 4; k++) {
        const a = now * 1.2 + (k * TAU) / 4;
        const px = Math.cos(a) * (R + 16), py = Math.sin(a) * (R + 16);
        ctx.beginPath();
        ctx.arc(px, py, 2.6, 0, TAU);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  drawCore(game, now) {
    const ctx = this.ctx, S = this.S, core = game.core, st = core.stats, R = CONFIG.core.radius;
    const ch = game.chassis || CONFIG.chassis[0];
    const isAwakened = game.chassisLevel >= (CONFIG.chassisMaxLevel || 5);
    const tCol = this.themeColor || CORE_COLOR;
    const chColor = ch.id === 'aegis' ? tCol : (ch.color || tCol);
    const setMap = isAwakened ? this.chassisAwakenedSets : this.chassisSets;
    const activeSet = (setMap && setMap[ch.id]) || this.coreSet;
    const breathe = 1 + 0.05 * Math.sin(now * 2.3) + core.kick * 0.1, hurt = core.hurtT > 0;

    const ar = (isAwakened ? 118 : 104) * breathe;
    ctx.globalAlpha = 0.5 + 0.1 * Math.sin(now * 2.3 + 1) + core.kick * 0.2;
    this.world();
    ctx.drawImage(getGlow(hurt ? '#ff4d5e' : chColor), -ar, -ar, ar * 2, ar * 2);
    ctx.globalAlpha = 1;

    if (!hurt) {
      this.drawCoreAura(ctx, game.equippedCoreAura, R, now, chColor);
    }

    drawSet(this, hurt ? this.coreHurt : activeSet, 0, 0, 0, now, 0, breathe, 0.95 + 0.05 * Math.sin(now * 2.3 + 1), false, 1, false);
    this.world();

    if (isAwakened && !hurt) {
      ctx.strokeStyle = 'rgba(255, 210, 61, 0.45)';
      ctx.lineWidth = 1.4;
      ctx.setLineDash([3, 7]);
      ctx.beginPath();
      ctx.arc(0, 0, R + 9, now * 0.6, now * 0.6 + TAU);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (core.frenzyT > 0 || core.surgeT > 0 || core.salvageT > 0) {
      ctx.strokeStyle = core.frenzyT > 0 ? '#ff4fd8' : core.surgeT > 0 ? '#ffd23d' : '#2eff9c';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.65 + 0.25 * Math.sin(now * 16);
      ctx.beginPath();
      ctx.arc(0, 0, R + 12 + Math.sin(now * 12) * 2, 0, TAU);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    const playing = game.state === 'play' || game.state === 'cards' || game.state === 'paused';
    if (!playing) return;
    const a = core.aimShown, ca = Math.cos(a), sa = Math.sin(a);

    const enemies = game.enemies.pool.items;
    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      if (
        e.dead ||
        (!e.boss && !e.def.isLoot && !e.def.isCapsule && !e.def.isMagma && !e.def.isPylon && !e.def.isPrism && !e.def.isTactical)
      ) continue;
      const dist = Math.hypot(e.x, e.y);
      if (dist < 110) continue;
      const ang = Math.atan2(e.y, e.x);
      const rc = Math.cos(ang), rs = Math.sin(ang);
      const rr = R + 34;
      ctx.fillStyle = e.def.color;
      ctx.globalAlpha = 0.65 + 0.25 * Math.sin(now * 10);
      ctx.beginPath();
      ctx.moveTo(rc * (rr + 6), rs * (rr + 6));
      ctx.lineTo(rc * rr - rs * 4, rs * rr + rc * 4);
      ctx.lineTo(rc * rr + rs * 4, rs * rr - rc * 4);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    if (core.firing) {
      ctx.strokeStyle = rgba(chColor, 0.18);
      ctx.lineWidth = 1.5;
      ctx.setLineDash([2, 9]);
      ctx.beginPath();
      ctx.moveTo(ca * (R + 22), sa * (R + 22));
      ctx.lineTo(ca * (R + 130), sa * (R + 130));
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.fillStyle = '#d9fbff';
    ctx.beginPath();
    ctx.moveTo(ca * (R + 16), sa * (R + 16));
    ctx.lineTo(ca * (R + 7) - sa * 5.5, sa * (R + 7) + ca * 5.5);
    ctx.lineTo(ca * (R + 10.5), sa * (R + 10.5));
    ctx.lineTo(ca * (R + 7) + sa * 5.5, sa * (R + 7) - ca * 5.5);
    ctx.fill();
    if (core.kick > 0.15) {
      const fr = 10 + core.kick * 12;
      ctx.globalAlpha = core.kick;
      ctx.drawImage(getGlow('#bff8ff'), ca * (R + 15) - fr, sa * (R + 15) - fr, fr * 2, fr * 2);
      ctx.globalAlpha = 1;
    }

    if (core.shield > 0) {
      const sh = this.shield, rot = now * 0.4, c = Math.cos(rot) * S, s = Math.sin(rot) * S;
      ctx.globalAlpha = 0.78 + 0.2 * Math.sin(now * 5);
      ctx.setTransform(c, s, -s, c, this.ox, this.oy);
      ctx.drawImage(sh.img, -sh.half, -sh.half, sh.u, sh.u);
      ctx.globalAlpha = 1;
      this.world();
    }

    ctx.globalCompositeOperation = 'source-over';
    const n = st.maxHp, low = core.hp <= 1;
    for (let i = 0; i < n; i++) {
      const ang = -Math.PI / 2 + (i * TAU) / n, x = Math.cos(ang) * (R + 20), y = Math.sin(ang) * (R + 20);
      if (i < core.hp) {
        const col = low ? '#ff4d5e' : chColor;
        ctx.fillStyle = rgba(col, low ? 0.2 + 0.15 * Math.sin(now * 9) : 0.22);
        ctx.beginPath(); ctx.arc(x, y, 6.5, 0, TAU); ctx.fill();
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(x, y, 3.4, 0, TAU); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.beginPath(); ctx.arc(x - 0.9, y - 0.9, 1.1, 0, TAU); ctx.fill();
      } else {
        ctx.strokeStyle = rgba(chColor, 0.3);
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(x, y, 3, 0, TAU); ctx.stroke();
      }
    }
    ctx.globalCompositeOperation = 'lighter';
  }
}