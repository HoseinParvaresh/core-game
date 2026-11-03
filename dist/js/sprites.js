/**
 * sprites.js — the sprite engine. Turns the recipes in art.js into pre-rendered offscreen
 * canvases, builds 5 custom Bullet Skin styles, and renders World-specific space backdrops.
 */
import { CONFIG } from './config.js';

const TAU = Math.PI * 2;

export const rgb = (hex) => { const n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
export const rgba = (hex, a) => { const [r, g, b] = rgb(hex); return `rgba(${r},${g},${b},${a})`; };
export const lighten = (hex, k) => {
  if (hex[0] !== '#') return hex;
  const [r, g, b] = rgb(hex);
  return `rgb(${Math.round(r + (255 - r) * k)},${Math.round(g + (255 - g) * k)},${Math.round(b + (255 - b) * k)})`;
};

function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const hash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return h >>> 0; };

function makeCanvas(half, S) {
  const size = Math.ceil(half * 2 * S);
  const cv = document.createElement('canvas');
  cv.width = cv.height = size;
  const g = cv.getContext('2d');
  g.translate(size / 2, size / 2);
  g.scale(S, S);
  g.lineJoin = 'round';
  g.lineCap = 'round';
  return { cv, g, size };
}

function silhouette(src, size) {
  const f = document.createElement('canvas');
  f.width = f.height = size;
  const g = f.getContext('2d');
  g.drawImage(src, 0, 0);
  g.globalCompositeOperation = 'source-in';
  g.fillStyle = '#ffffff';
  g.fillRect(0, 0, size, size);
  return f;
}

const colourOf = (L, c) => (L.color === 'accent' ? c.accent : L.color && L.color !== 'main' ? L.color : c.main);

function paint(g, c, L, trace, closed = true) {
  const col = colourOf(L, c), a = L.alpha ?? 1, w = L.width ?? 2.2, fill = L.fill ?? 0;
  const prev = g.globalAlpha;
  g.globalAlpha = a;
  g.shadowColor = col;
  g.shadowBlur = (L.glow ?? 1) * c.glow * (4 + c.R * 0.28) * c.S;
  g.strokeStyle = col;
  g.lineWidth = w;
  trace();
  if (closed && fill > 0) { g.globalAlpha = a * fill; g.fillStyle = col; g.fill(); g.globalAlpha = a; }
  if (w > 0) g.stroke();
  g.shadowBlur = 0;
  if (w > 0) { g.strokeStyle = lighten(col, 0.62); g.lineWidth = Math.max(0.5, w * 0.38); trace(); g.stroke(); }
  g.globalAlpha = prev;
}

const PAINTERS = {
  poly(g, L, c) {
    const r = c.R * (L.scale ?? 1), sx = L.stretch ?? 1, n = L.sides ?? 0, r0 = L.rot0 ?? 0;
    paint(g, c, L, () => {
      g.beginPath();
      if (!n) { g.arc(0, 0, r, 0, TAU); return; }
      for (let i = 0; i < n; i++) {
        const a = r0 + (i * TAU) / n, x = Math.cos(a) * r * sx, y = Math.sin(a) * r;
        if (i) g.lineTo(x, y); else g.moveTo(x, y);
      }
      g.closePath();
    });
  },

  path(g, L, c) {
    const R = c.R * (L.scale ?? 1);
    let pts = L.pts;
    if (L.mirror) pts = pts.concat(pts.slice(1, -1).reverse().map(([x, y]) => [x, -y]));
    const closed = L.closed !== false;
    paint(g, c, L, () => {
      g.beginPath();
      pts.forEach(([x, y], i) => (i ? g.lineTo(x * R, y * R) : g.moveTo(x * R, y * R)));
      if (closed) g.closePath();
    }, closed);
  },

  lines(g, L, c) {
    const R = c.R;
    paint(g, c, L, () => {
      g.beginPath();
      for (const [x1, y1, x2, y2] of L.lines) { g.moveTo(x1 * R, y1 * R); g.lineTo(x2 * R, y2 * R); }
    }, false);
  },

  ring(g, L, c) {
    const r = c.R * (L.r ?? 1), n = L.seg || 0, gap = L.gap ?? 0.3, r0 = L.rot0 ?? 0;
    paint(g, c, L, () => {
      g.beginPath();
      if (!n) { g.arc(0, 0, r, 0, TAU); return; }
      const step = TAU / n, len = step * (1 - gap);
      for (let i = 0; i < n; i++) {
        const a = r0 + i * step;
        g.moveTo(Math.cos(a) * r, Math.sin(a) * r);
        g.arc(0, 0, r, a, a + len);
      }
    }, false);
  },

  arc(g, L, c) {
    const r = c.R * (L.r ?? 1), span = L.span ?? 1.4, r0 = L.rot0 ?? 0;
    paint(g, c, L, () => {
      g.beginPath();
      g.arc(0, 0, r, r0 - span * 0.5, r0 + span * 0.5);
    }, false);
  },

  blades(g, L, c) {
    const R = c.R, n = L.n ?? 4, r0 = L.rot0 ?? 0, pts = L.pts || [[0.5, 0], [1, 0.12], [1, -0.12]];
    paint(g, c, L, () => {
      g.beginPath();
      for (let i = 0; i < n; i++) {
        const a = r0 + (i * TAU) / n, ca = Math.cos(a), sa = Math.sin(a);
        pts.forEach(([x, y], k) => {
          const px = (x * ca - y * sa) * R, py = (x * sa + y * ca) * R;
          if (k) g.lineTo(px, py); else g.moveTo(px, py);
        });
        g.closePath();
      }
    });
  },

  plates(g, L, c) {
    const R = c.R, n = L.n ?? 6, rin = R * (L.rIn ?? 0.6), rout = R * (L.rOut ?? 1), span = L.span ?? 0.8, r0 = L.rot0 ?? 0, step = TAU / n;
    paint(g, c, L, () => {
      g.beginPath();
      for (let i = 0; i < n; i++) {
        const a0 = r0 + i * step + (step * (1 - span)) / 2, a1 = a0 + step * span;
        g.moveTo(Math.cos(a0) * rin, Math.sin(a0) * rin);
        g.lineTo(Math.cos(a0) * rout, Math.sin(a0) * rout);
        g.lineTo(Math.cos(a1) * rout, Math.sin(a1) * rout);
        g.lineTo(Math.cos(a1) * rin, Math.sin(a1) * rin);
        g.closePath();
      }
    });
  },

  dots(g, L, c) {
    const R = c.R, n = L.n ?? 4, ring = R * (L.ring ?? 1), r = R * (L.r ?? 0.08), r0 = L.rot0 ?? 0, shape = L.shape || 'circle';
    paint(g, c, { ...L, fill: L.fill ?? 1, width: L.width ?? 1 }, () => {
      g.beginPath();
      for (let i = 0; i < n; i++) {
        const a = r0 + (i * TAU) / n, x = Math.cos(a) * ring, y = Math.sin(a) * ring;
        if (shape === 'circle') { g.moveTo(x + r, y); g.arc(x, y, r, 0, TAU); continue; }
        const corners = shape === 'sq' ? 4 : 3, base = shape === 'sq' ? a + Math.PI / 4 : a, rr = shape === 'sq' ? r * 1.41 : r * 1.5;
        for (let k = 0; k < corners; k++) {
          const aa = base + (k * TAU) / corners;
          if (k) g.lineTo(x + Math.cos(aa) * rr, y + Math.sin(aa) * rr); else g.moveTo(x + Math.cos(aa) * rr, y + Math.sin(aa) * rr);
        }
        g.closePath();
      }
    });
  },

  spokes(g, L, c) {
    const R = c.R, n = L.n ?? 6, r0 = R * (L.r0 ?? 0), r1 = R * (L.r1 ?? 1), a0 = L.rot0 ?? 0;
    paint(g, c, L, () => {
      g.beginPath();
      for (let i = 0; i < n; i++) {
        const a = a0 + (i * TAU) / n;
        g.moveTo(Math.cos(a) * r0, Math.sin(a) * r0);
        g.lineTo(Math.cos(a) * r1, Math.sin(a) * r1);
      }
    }, false);
  },

  hex(g, L, c) {
    const cell = c.R * (L.cell ?? 0.25), rings = L.rings ?? 1, centres = [];
    for (let q = -rings; q <= rings; q++) {
      for (let r = Math.max(-rings, -q - rings); r <= Math.min(rings, -q + rings); r++) {
        centres.push([cell * 1.5 * q, cell * Math.sqrt(3) * (r + q / 2)]);
      }
    }
    paint(g, c, L, () => {
      g.beginPath();
      for (const [cx, cy] of centres) {
        for (let k = 0; k < 6; k++) {
          const a = (k * TAU) / 6, x = cx + Math.cos(a) * cell * 0.9, y = cy + Math.sin(a) * cell * 0.9;
          if (k) g.lineTo(x, y); else g.moveTo(x, y);
        }
        g.closePath();
      }
    });
  },

  star(g, L, c) {
    const r = c.R * (L.scale ?? 1), n = L.points ?? 5, inner = L.inner ?? 0.45, r0 = L.rot0 ?? -Math.PI / 2;
    paint(g, c, L, () => {
      g.beginPath();
      for (let i = 0; i < n * 2; i++) {
        const a = r0 + (i * Math.PI) / n, rr = i % 2 ? r * inner : r;
        if (i) g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); else g.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
      }
      g.closePath();
    });
  },

  spiral(g, L, c) {
    const R = c.R, arms = L.arms ?? 1, turns = L.turns ?? 1, rr = R * (L.r ?? 1), N = 18, col = colourOf(L, c);
    const w = L.width ?? 2.4, prev = g.globalAlpha;
    for (let pass = 0; pass < 2; pass++) {
      for (let arm = 0; arm < arms; arm++) {
        const base = (arm * TAU) / arms;
        for (let i = 0; i < N; i++) {
          const t0 = i / N, t1 = (i + 1) / N;
          g.globalAlpha = (L.alpha ?? 1) * (1 - 0.65 * t0);
          if (pass === 0) { g.shadowColor = col; g.shadowBlur = (L.glow ?? 1) * c.glow * (4 + R * 0.28) * c.S; g.strokeStyle = col; g.lineWidth = w * (1 - 0.45 * t0); }
          else { g.shadowBlur = 0; g.strokeStyle = lighten(col, 0.62); g.lineWidth = Math.max(0.5, w * 0.38 * (1 - 0.45 * t0)); }
          g.beginPath();
          g.moveTo(Math.cos(base + t0 * turns * TAU) * rr * t0, Math.sin(base + t0 * turns * TAU) * rr * t0);
          g.lineTo(Math.cos(base + t1 * turns * TAU) * rr * t1, Math.sin(base + t1 * turns * TAU) * rr * t1);
          g.stroke();
        }
      }
    }
    g.globalAlpha = prev;
  },

  core(g, L, c) {
    const R = c.R, r = R * (L.r ?? 0.3), x = (L.at ? L.at[0] : 0) * R, y = (L.at ? L.at[1] : 0) * R, col = colourOf(L, c);
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, '#ffffff');
    gr.addColorStop(0.3, lighten(col, 0.72));
    gr.addColorStop(0.65, col);
    gr.addColorStop(1, rgba(col, 0));
    const prev = g.globalAlpha;
    g.globalAlpha = L.alpha ?? 1;
    g.shadowColor = col;
    g.shadowBlur = (L.glow ?? 1) * c.glow * (6 + r * 0.6) * c.S;
    g.fillStyle = gr;
    g.beginPath();
    g.arc(x, y, r, 0, TAU);
    g.fill();
    g.shadowBlur = 0;
    g.globalAlpha = prev;
  },

  eye(g, L, c) {
    const r = c.R * (L.r ?? 0.2), col = c.main, acc = c.accent;
    const gr = g.createRadialGradient(r * 0.25, 0, 0, 0, 0, r);
    gr.addColorStop(0, acc);
    gr.addColorStop(0.55, lighten(col, 0.35));
    gr.addColorStop(1, col);
    g.shadowColor = col;
    g.shadowBlur = c.glow * (6 + r * 0.5) * c.S;
    g.fillStyle = gr;
    g.beginPath();
    g.arc(0, 0, r, 0, TAU);
    g.fill();
    g.shadowBlur = 0;
    g.strokeStyle = acc;
    g.lineWidth = 1.2;
    g.stroke();
    g.fillStyle = '#05060d';
    g.beginPath();
    g.ellipse(r * 0.28, 0, r * 0.2, r * 0.62, 0, 0, TAU);
    g.fill();
    g.fillStyle = 'rgba(255,255,255,.9)';
    g.beginPath();
    g.arc(r * 0.05, -r * 0.32, r * 0.1, 0, TAU);
    g.fill();
  },
};

function buildTrail(T, R, color, S) {
  const len = T.len * R, wid = T.w * R, h = Math.max(6, wid * 1.8);
  const w = Math.ceil(len * S), hh = Math.ceil(h * S);
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = hh;
  const g = cv.getContext('2d');
  const grad = g.createLinearGradient(0, 0, w, 0);
  grad.addColorStop(0, rgba(color, 0));
  grad.addColorStop(0.6, rgba(color, 0.35));
  grad.addColorStop(1, rgba(color, 0.9));
  g.fillStyle = grad;
  g.shadowColor = color;
  g.shadowBlur = 5 * S;
  const mid = hh / 2, half = (wid * S) / 2;
  g.beginPath();
  g.moveTo(0, mid);
  g.lineTo(w, mid - half);
  g.lineTo(w, mid + half);
  g.closePath();
  g.fill();
  return { img: cv, len, h: hh / S, alpha: T.alpha ?? 0.6, gap: R * 0.15 };
}

function buildCracks(R, half, S, c, seed, count) {
  const { cv, g } = makeCanvas(half, S), rnd = mulberry32(seed);
  g.strokeStyle = '#ffffff';
  g.shadowColor = c.accent;
  g.shadowBlur = 5 * S;
  g.lineWidth = 1.1;
  g.globalAlpha = 0.8;
  for (let i = 0; i < count; i++) {
    let a = rnd() * TAU, r = R * (0.9 + rnd() * 0.08);
    g.beginPath();
    g.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    const steps = 3 + ((rnd() * 3) | 0);
    for (let s = 0; s < steps; s++) {
      a += (rnd() - 0.5) * 0.7;
      r = Math.max(R * 0.12, r - R * (0.12 + rnd() * 0.16));
      g.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    g.stroke();
  }
  return cv;
}

export function buildSet(recipe, color, radius, S, key = '') {
  const R = radius * (recipe.artScale ?? 1.2);
  const c = { R, S, main: color, accent: recipe.accent || lighten(color, 0.75), glow: recipe.glow ?? 1 };
  const half = Math.ceil(R * (recipe.extent ?? 1.5) + 8 + (4 + R * 0.28) * c.glow * 0.8);
  const groups = [];
  for (const L of recipe.layers) {
    const sig = `${L.face ? 1 : 0}|${L.spin || 0}|${L.pulse ? L.pulse.join(',') : ''}`;
    let grp = groups[groups.length - 1];
    if (!grp || grp.sig !== sig) {
      grp = { sig, layers: [], spin: L.spin || 0, face: !!L.face, pulse: L.pulse || null, deco: true };
      groups.push(grp);
    }
    grp.layers.push(L);
    if (!L.deco) grp.deco = false;
  }
  let size = 0;
  for (const grp of groups) {
    const { cv, g, size: sz } = makeCanvas(half, S);
    size = sz;
    for (const L of grp.layers) PAINTERS[L.kind || (L.spiral ? 'spiral' : 'poly')](g, L, c);
    grp.img = cv;
    grp.flash = silhouette(cv, sz);
    delete grp.layers;
  }
  const set = { groups, u: size / S, half: size / S / 2, trail: null, cracks: null };
  if (recipe.trail) set.trail = buildTrail(recipe.trail, R, color, S);
  if (recipe.cracks) set.cracks = [buildCracks(R, half, S, c, hash(key || color), 4), buildCracks(R, half, S, c, hash(key || color), 9)];
  return set;
}

export function drawSet(v, set, x, y, heading, t, phase, k, alpha, flash, hpFrac, lite) {
  const ctx = v.ctx, S = v.S, px = v.ox + x * S, py = v.oy + y * S;
  const groups = set.groups, half = set.half, u = set.u;
  let hullRot = 0;

  if (set.trail && !lite) {
    const T = set.trail, ch = Math.cos(heading) * S * k, sh = Math.sin(heading) * S * k;
    ctx.globalAlpha = alpha * T.alpha * (0.7 + 0.3 * Math.sin(t * 26 + phase));
    ctx.setTransform(ch, sh, -sh, ch, px, py);
    ctx.drawImage(T.img, -T.len - T.gap, -T.h / 2, T.len, T.h);
  }
  ctx.globalAlpha = alpha;
  for (let i = 0; i < groups.length; i++) {
    const g = groups[i];
    const rot = g.face ? heading : g.spin * t + phase;
    if (i === 0) hullRot = rot;
    if (lite && g.deco) continue;
    const kk = g.pulse ? k * (1 + g.pulse[0] * Math.sin(t * g.pulse[1] * TAU + phase)) : k;
    const c = Math.cos(rot) * S * kk, s = Math.sin(rot) * S * kk;
    ctx.setTransform(c, s, -s, c, px, py);
    ctx.drawImage(flash ? g.flash : g.img, -half, -half, u, u);
  }
  if (set.cracks && hpFrac < 0.66) {
    const c = Math.cos(hullRot) * S * k, s = Math.sin(hullRot) * S * k;
    ctx.setTransform(c, s, -s, c, px, py);
    ctx.drawImage(set.cracks[hpFrac < 0.33 ? 1 : 0], -half, -half, u, u);
  }
}

/**
 * Builds a projectile sprite with 5 distinct cosmetic styles:
 * 'bolt' (default), 'laser' (Crimson Beam), 'star' (Solar Shuriken),
 * 'crescent' (Void Crescent), or 'diamond' (Aether Prism).
 */
export function buildBolt(S, color, style = 'bolt') {
  const len = style === 'laser' ? 48 : 40;
  const h = style === 'crescent' || style === 'star' ? 18 : 14;
  const w = Math.ceil((len + 10) * S), hh = Math.ceil(h * S), hx = len * S, mid = hh / 2;
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = hh;
  const g = cv.getContext('2d');

  const tail = g.createLinearGradient(0, 0, hx, 0);
  tail.addColorStop(0, rgba(color, 0));
  tail.addColorStop(0.55, rgba(color, 0.38));
  tail.addColorStop(1, rgba(color, 0.95));
  g.shadowColor = color;
  g.shadowBlur = 7 * S;
  g.fillStyle = tail;

  const tailHalf = (style === 'laser' ? 1.8 : 2.8) * S;
  g.beginPath();
  g.moveTo(0, mid);
  g.lineTo(hx, mid - tailHalf);
  g.lineTo(hx, mid + tailHalf);
  g.closePath();
  g.fill();

  g.shadowBlur = 0;
  const hot = g.createLinearGradient(hx * 0.25, 0, hx, 0);
  hot.addColorStop(0, 'rgba(255,255,255,0)');
  hot.addColorStop(1, 'rgba(255,255,255,1)');
  g.strokeStyle = hot;
  g.lineWidth = (style === 'laser' ? 2.2 : 1.7) * S;
  g.beginPath();
  g.moveTo(hx * 0.25, mid);
  g.lineTo(hx, mid);
  g.stroke();

  g.shadowColor = color;
  g.shadowBlur = 10 * S;
  g.fillStyle = '#ffffff';
  g.strokeStyle = color;

  if (style === 'star') {
    const rOut = 5.2 * S, rIn = 2.0 * S;
    g.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      const rr = i % 2 === 0 ? rOut : rIn;
      const px = hx + Math.cos(a) * rr, py = mid + Math.sin(a) * rr;
      if (i === 0) g.moveTo(px, py); else g.lineTo(px, py);
    }
    g.closePath();
    g.fill();
  } else if (style === 'crescent') {
    const r = 5.0 * S;
    g.beginPath();
    g.arc(hx - 1.5 * S, mid, r, -Math.PI * 0.48, Math.PI * 0.48, false);
    g.arc(hx - 4.2 * S, mid, r * 0.85, Math.PI * 0.42, -Math.PI * 0.42, true);
    g.closePath();
    g.fill();
  } else if (style === 'diamond') {
    g.beginPath();
    g.moveTo(hx + 5.5 * S, mid);
    g.lineTo(hx - 1.0 * S, mid - 3.8 * S);
    g.lineTo(hx - 5.5 * S, mid);
    g.lineTo(hx - 1.0 * S, mid + 3.8 * S);
    g.closePath();
    g.fill();
  } else if (style === 'laser') {
    g.beginPath();
    g.moveTo(hx + 5.0 * S, mid);
    g.lineTo(hx - 6.0 * S, mid - 2.0 * S);
    g.lineTo(hx - 6.0 * S, mid + 2.0 * S);
    g.closePath();
    g.fill();
  } else {
    g.beginPath();
    g.arc(hx, mid, 2.8 * S, 0, TAU);
    g.fill();
  }

  return { img: cv, u: w / S, h: hh / S, head: hx / S };
}

const glowCache = new Map();
export function getGlow(color) {
  let cv = glowCache.get(color);
  if (!cv) {
    cv = document.createElement('canvas');
    cv.width = cv.height = 64;
    const g = cv.getContext('2d');
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, lighten(color, 0.55));
    gr.addColorStop(0.25, rgba(color, 0.55));
    gr.addColorStop(1, rgba(color, 0));
    g.fillStyle = gr;
    g.fillRect(0, 0, 64, 64);
    glowCache.set(color, cv);
  }
  return cv;
}

export function buildShield(S) {
  const Rs = CONFIG.core.radius + 10, { cv, g, size } = makeCanvas(Rs + 8, S);
  const gr = g.createRadialGradient(0, 0, Rs * 0.5, 0, 0, Rs);
  gr.addColorStop(0, 'rgba(130,205,255,0)');
  gr.addColorStop(1, 'rgba(130,205,255,0.3)');
  g.fillStyle = gr;
  g.beginPath(); g.arc(0, 0, Rs, 0, TAU); g.fill();
  g.save();
  g.beginPath(); g.arc(0, 0, Rs - 1, 0, TAU); g.clip();
  g.strokeStyle = 'rgba(165,222,255,0.5)';
  g.lineWidth = 0.8;
  g.beginPath();
  const cell = 7.5;
  for (let q = -6; q <= 6; q++) {
    for (let r = -6; r <= 6; r++) {
      const cx = cell * 1.5 * q, cy = cell * Math.sqrt(3) * (r + q / 2);
      if (cx * cx + cy * cy > (Rs + cell) * (Rs + cell)) continue;
      for (let k = 0; k < 6; k++) {
        const a = (k * TAU) / 6, x = cx + Math.cos(a) * cell, y = cy + Math.sin(a) * cell;
        if (k) g.lineTo(x, y); else g.moveTo(x, y);
      }
      g.closePath();
    }
  }
  g.stroke();
  g.restore();
  g.shadowColor = '#82cdff';
  g.shadowBlur = 8 * S;
  g.strokeStyle = 'rgba(175,228,255,0.95)';
  g.lineWidth = 2;
  g.beginPath(); g.arc(0, 0, Rs, 0, TAU); g.stroke();
  return { img: cv, u: size / S, half: size / S / 2 };
}

export function buildField(S) {
  const Rf = 200, { cv, g, size } = makeCanvas(Rf + 10, S);
  const gr = g.createRadialGradient(0, 0, 0, 0, 0, Rf);
  gr.addColorStop(0, 'rgba(90,160,255,0)');
  gr.addColorStop(0.7, 'rgba(90,160,255,0.03)');
  gr.addColorStop(1, 'rgba(90,160,255,0.11)');
  g.fillStyle = gr;
  g.beginPath(); g.arc(0, 0, Rf, 0, TAU); g.fill();
  g.shadowColor = '#78c0ff';
  g.shadowBlur = 6 * S;
  g.strokeStyle = 'rgba(130,200,255,0.6)';
  g.lineWidth = 2;
  g.setLineDash([10, 9]);
  g.beginPath(); g.arc(0, 0, Rf, 0, TAU); g.stroke();
  g.shadowBlur = 0;
  g.strokeStyle = 'rgba(130,200,255,0.3)';
  g.lineWidth = 1.2;
  g.setLineDash([3, 8]);
  g.beginPath(); g.arc(0, 0, Rf - 13, 0, TAU); g.stroke();
  g.setLineDash([]);
  g.strokeStyle = 'rgba(150,215,255,0.34)';
  g.lineWidth = 1.2;
  g.beginPath();
  for (let i = 0; i < 72; i++) {
    const a = (i * TAU) / 72, r0 = Rf - 30, r1 = Rf - (i % 6 === 0 ? 20 : 25);
    g.moveTo(Math.cos(a) * r0, Math.sin(a) * r0);
    g.lineTo(Math.cos(a) * r1, Math.sin(a) * r1);
  }
  g.stroke();
  return { img: cv, u: size / S, half: size / S / 2 };
}

export function buildBackdrop(W, H, dpr, worldDef = null) {
  const m = Math.round(26 * dpr), w = W + 2 * m, h = H + 2 * m;
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const g = cv.getContext('2d');
  const cx = w / 2, cy = h / 2, far = Math.hypot(cx, cy);
  const stops = worldDef?.bgStops || ['#0b1230', '#070a1c', '#05060d'];
  const bg = g.createRadialGradient(cx, cy, 0, cx, cy, far);
  bg.addColorStop(0, stops[0]);
  bg.addColorStop(0.5, stops[1]);
  bg.addColorStop(1, stops[2]);
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);

  const rnd = mulberry32(1337 + ((worldDef?.id || 0) * 777));
  const blobs = worldDef?.nebulae || [
    [0.2, 0.22, 0.55, '60,110,255', 0.11],
    [0.84, 0.7, 0.5, '255,70,210', 0.06],
    [0.5, 0.92, 0.6, '46,255,180', 0.045],
  ];
  for (const [fx, fy, fr, col, a] of blobs) {
    const bx = fx * w, by = fy * h, br = fr * Math.max(w, h);
    const gr = g.createRadialGradient(bx, by, 0, bx, by, br);
    gr.addColorStop(0, `rgba(${col},${a})`);
    gr.addColorStop(1, `rgba(${col},0)`);
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
  }

  const n = Math.round((w * h) / (dpr * dpr * 2600));
  for (let i = 0; i < n; i++) {
    const x = rnd() * w, y = rnd() * h, big = rnd() < 0.05;
    const r = (big ? 1.3 : 0.45 + rnd() * 0.7) * dpr, a = big ? 0.85 : 0.14 + rnd() * 0.5;
    g.fillStyle = `rgba(${200 + ((rnd() * 55) | 0)},${220 + ((rnd() * 35) | 0)},255,${a})`;
    g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
    if (big) {
      const gr = g.createRadialGradient(x, y, 0, x, y, r * 6);
      gr.addColorStop(0, 'rgba(190,225,255,0.35)');
      gr.addColorStop(1, 'rgba(190,225,255,0)');
      g.fillStyle = gr;
      g.fillRect(x - r * 6, y - r * 6, r * 12, r * 12);
    }
  }
  return { cv, m };
}