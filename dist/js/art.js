/**
 * art.js — ultra-detailed multi-layered vector recipes for all 24 World Enemies,
 * 3 Tactical Enemies (Shield Linker, Gravity Leech, Splitter Portal),
 * 18 World Bosses (across 6 Worlds), 4 Standard Core Chassis, 4 Awakened Core Chassis,
 * Orbiters, Supply Pods, Magma Rocks, Aether Pylons, and Prism Refractors.
 */

const PLUS = [
  [0.48, 0.13], [0.13, 0.13], [0.13, 0.48], [-0.13, 0.48], [-0.13, 0.13], [-0.48, 0.13],
  [-0.48, -0.13], [-0.13, -0.13], [-0.13, -0.48], [0.13, -0.48], [0.13, -0.13], [0.48, -0.13],
];
const Q = 0.785398; // π/4

export const ENEMY_ART = {
  /* ═══════════════════════ WORLD 1: CYBER NEXUS ═══════════════════════ */

  triangle: {
    artScale: 1.36, extent: 1.65, accent: '#ffe3fa', glow: 1.15,
    trail: { len: 2.6, w: 0.85, alpha: 0.68 },
    layers: [
      { kind: 'path', face: true, mirror: true, pts: [[1.15, 0], [0.82, 0.14], [0.96, 0.24], [-0.72, 0.96], [-0.94, 0.56], [-0.52, 0.24], [-0.82, 0]], fill: 0.22, width: 2.3 },
      { kind: 'path', face: true, mirror: true, pts: [[0.55, 0], [0.15, 0.34], [-0.58, 0.52], [-0.38, 0]], fill: 0.38, width: 1.3, color: 'accent', alpha: 0.85 },
      {
        kind: 'lines', face: true, color: 'accent', width: 0.95, alpha: 0.62, lines: [
          [0.95, 0, -0.5, 0], [0.32, 0.18, -0.68, 0.82], [0.32, -0.18, -0.68, -0.82],
          [-0.1, 0.28, -0.82, 0.52], [-0.1, -0.28, -0.82, -0.52],
        ]
      },
      { kind: 'dots', face: true, n: 2, ring: 0.88, r: 0.065, rot0: 2.22, color: 'accent', deco: true },
      { kind: 'dots', face: true, n: 2, ring: 0.88, r: 0.065, rot0: -2.22, color: 'accent', deco: true },
      { kind: 'core', face: true, at: [-0.66, 0], r: 0.2, color: 'accent', pulse: [0.28, 3.8] },
      { kind: 'core', face: true, at: [0.16, 0], r: 0.24, color: 'accent', pulse: [0.18, 2.4] },
    ],
  },

  square: {
    artScale: 1.26, extent: 1.6, accent: '#fff2c6', glow: 1.15, cracks: true,
    layers: [
      { kind: 'poly', sides: 4, rot0: Q, spin: 0.32, fill: 0.18, width: 2.8 },
      { kind: 'plates', spin: 0.32, n: 4, rIn: 0.72, rOut: 1.05, span: 0.58, rot0: Q, fill: 0.32, width: 1.6, color: 'accent' },
      { kind: 'poly', sides: 4, rot0: Q, spin: 0.32, scale: 0.76, width: 1.1, color: 'accent', alpha: 0.6 },
      {
        kind: 'lines', spin: 0.32, color: 'accent', width: 0.9, alpha: 0.5, lines: [
          [-0.7, -0.7, 0.7, 0.7], [-0.7, 0.7, 0.7, -0.7],
        ]
      },
      { kind: 'dots', spin: 0.32, n: 4, ring: 0.98, r: 0.11, shape: 'sq', rot0: Q, fill: 0.95, color: 'accent' },
      { kind: 'ring', spin: -0.95, r: 0.62, seg: 8, gap: 0.35, width: 1.4, color: 'accent', alpha: 0.75, deco: true },
      { kind: 'path', spin: -0.95, pts: PLUS, fill: 0.45, width: 1.5, color: 'accent' },
      { kind: 'core', r: 0.25, color: 'accent', pulse: [0.2, 1.7] },
    ],
  },

  diamond: {
    artScale: 1.28, extent: 1.78, accent: '#f8ffd8', glow: 1.15,
    trail: { len: 3.8, w: 0.52, alpha: 0.72 },
    layers: [
      { kind: 'path', face: true, mirror: true, pts: [[1.44, 0], [0.52, 0.24], [0.08, 0.62], [-0.65, 0.26], [-1.08, 0]], fill: 0.25, width: 2.3 },
      { kind: 'path', face: true, pts: [[-0.22, 0.32], [-1.05, 0.74], [-0.84, 0.18]], fill: 0.55, width: 1.3, color: 'accent' },
      { kind: 'path', face: true, pts: [[-0.22, -0.32], [-1.05, -0.74], [-0.84, -0.18]], fill: 0.55, width: 1.3, color: 'accent' },
      {
        kind: 'lines', face: true, color: 'accent', width: 0.95, alpha: 0.7, lines: [
          [1.44, 0, -1.08, 0], [0.52, 0.24, -0.2, 0], [0.52, -0.24, -0.2, 0],
          [0.08, 0.62, -0.2, 0], [0.08, -0.62, -0.2, 0], [0.08, 0.62, 0.92, 0], [0.08, -0.62, 0.92, 0],
        ]
      },
      { kind: 'core', face: true, at: [0.98, 0], r: 0.19, color: 'accent', pulse: [0.24, 3.6] },
      { kind: 'core', face: true, at: [-0.15, 0], r: 0.2, pulse: [0.16, 2.2] },
    ],
  },

  hexagon: {
    artScale: 1.25, extent: 1.58, accent: '#e0fbff', glow: 1.15, cracks: true,
    layers: [
      { kind: 'poly', sides: 6, spin: 0.38, fill: 0.16, width: 2.8 },
      { kind: 'plates', spin: 0.38, n: 6, rIn: 0.78, rOut: 1.03, span: 0.52, fill: 0.28, width: 1.3, color: 'accent' },
      { kind: 'hex', spin: 0.38, cell: 0.27, rings: 1, fill: 0.13, width: 0.95, color: 'accent', alpha: 0.75 },
      { kind: 'ring', spin: -0.95, r: 0.86, seg: 6, gap: 0.42, width: 1.7, color: 'accent', deco: true },
      { kind: 'path', spin: 1.35, pts: [[0.64, 0], [0.24, 0.2], [0.32, 0], [0.24, -0.2]], fill: 0.9, width: 1.1, color: 'accent' },
      { kind: 'path', spin: 1.35, pts: [[-0.64, 0], [-0.24, 0.2], [-0.32, 0], [-0.24, -0.2]], fill: 0.9, width: 1.1, color: 'accent' },
      { kind: 'core', r: 0.2, color: 'accent', pulse: [0.22, 2.1] },
    ],
  },

  /* ═══════════════════════ WORLD 2: CRIMSON FORGE ═══════════════════════ */

  pulsar: {
    artScale: 1.3, extent: 1.65, accent: '#ffe8cc', glow: 1.2,
    trail: { len: 2.4, w: 0.7, alpha: 0.58 },
    layers: [
      { kind: 'path', face: true, mirror: true, pts: [[1.05, 0], [0.55, 0.52], [-0.1, 0.88], [-0.75, 0.52], [-0.4, 0.18], [-0.72, 0]], fill: 0.22, width: 2.2 },
      { kind: 'arc', face: true, r: 1.08, span: 1.65, rot0: 0, width: 2.4, color: 'accent' },
      { kind: 'arc', face: true, r: 0.86, span: 1.35, rot0: Math.PI, width: 1.6, color: 'accent', alpha: 0.75 },
      { kind: 'ring', spin: -2.2, r: 0.58, seg: 4, gap: 0.38, width: 1.8, color: 'accent' },
      { kind: 'dots', spin: 2.2, n: 4, ring: 0.58, r: 0.08, color: 'accent' },
      { kind: 'core', r: 0.3, color: 'accent', pulse: [0.28, 3.4] },
    ],
  },

  crusher: {
    artScale: 1.28, extent: 1.65, accent: '#fff0c4', glow: 1.22, cracks: true,
    layers: [
      { kind: 'poly', sides: 6, spin: 0.25, fill: 0.2, width: 2.8 },
      { kind: 'blades', spin: -1.4, n: 6, pts: [[0.58, 0.1], [1.06, 0], [0.58, -0.1]], fill: 0.65, width: 1.4, color: 'accent' },
      { kind: 'path', face: true, mirror: true, pts: [[1.22, 0.18], [0.75, 0.68], [-0.55, 0.72], [-0.82, 0]], fill: 0.28, width: 2.2 },
      { kind: 'arc', face: true, r: 0.95, span: 1.3, rot0: 0, width: 2.6, color: 'accent' },
      { kind: 'core', r: 0.32, color: 'accent', pulse: [0.24, 1.9] },
    ],
  },

  mender: {
    artScale: 1.28, extent: 1.62, accent: '#e9ffdb', glow: 1.2, cracks: true,
    layers: [
      { kind: 'plates', spin: 0.65, n: 4, rIn: 0.62, rOut: 1.02, span: 0.56, fill: 0.22, width: 2.2 },
      { kind: 'dots', spin: 0.65, n: 4, ring: 0.84, r: 0.09, rot0: Q, color: 'accent' },
      { kind: 'ring', spin: -1.2, r: 0.56, seg: 6, gap: 0.32, width: 1.5, color: 'accent', alpha: 0.8 },
      { kind: 'path', spin: -0.35, pts: PLUS, scale: 0.92, fill: 0.78, width: 1.6, color: 'accent', pulse: [0.16, 2.2] },
      { kind: 'core', r: 0.24, color: 'accent', pulse: [0.22, 2.2] },
    ],
  },

  lancer: {
    artScale: 1.35, extent: 1.78, accent: '#ffe5e0', glow: 1.2,
    trail: { len: 2.0, w: 0.65, alpha: 0.5 },
    layers: [
      { kind: 'path', face: true, mirror: true, pts: [[0.25, 0.22], [-0.15, 0.78], [-0.85, 0.58], [-0.62, 0.2], [-0.95, 0]], fill: 0.25, width: 2.3 },
      { kind: 'path', face: true, pts: [[1.38, 0.14], [1.38, 0.28], [-0.35, 0.34], [-0.35, 0.14]], fill: 0.45, width: 1.8 },
      { kind: 'path', face: true, pts: [[1.38, -0.14], [1.38, -0.28], [-0.35, -0.34], [-0.35, -0.14]], fill: 0.45, width: 1.8 },
      {
        kind: 'lines', face: true, color: 'accent', width: 1.2, alpha: 0.85, lines: [
          [0.15, -0.14, 0.15, 0.14], [0.52, -0.14, 0.52, 0.14], [0.88, -0.14, 0.88, 0.14], [1.22, -0.14, 1.22, 0.14],
        ]
      },
      { kind: 'core', face: true, at: [1.26, 0], r: 0.18, color: 'accent', pulse: [0.32, 3.5] },
      { kind: 'core', face: true, at: [-0.28, 0], r: 0.24, pulse: [0.15, 1.8] },
    ],
  },

  /* ═══════════════════════ WORLD 3: VOID SINGULARITY ═══════════════════════ */

  spiral: {
    artScale: 1.28, extent: 1.6, accent: '#e2fff4', glow: 1.2,
    layers: [
      { kind: 'ring', spin: -0.8, r: 1.04, seg: 12, gap: 0.45, width: 1.3, color: 'accent', alpha: 0.55, deco: true },
      { kind: 'dots', spin: -0.8, n: 6, ring: 1.04, r: 0.065, shape: 'tri', color: 'accent', deco: true },
      { kind: 'spiral', spin: 2.7, arms: 3, turns: 0.9, r: 0.98, width: 2.6 },
      { kind: 'blades', spin: 2.7, n: 3, pts: [[0.25, 0.04], [0.72, 0.22], [0.52, -0.06]], fill: 0.45, width: 1.2, color: 'accent' },
      { kind: 'core', r: 0.24, color: 'accent', pulse: [0.22, 2.4] },
    ],
  },

  phantom: {
    artScale: 1.32, extent: 1.65, accent: '#ffd6ff', glow: 1.25,
    layers: [
      { kind: 'ring', spin: -1.6, r: 1.02, seg: 8, gap: 0.52, width: 1.4, color: 'accent', alpha: 0.65, deco: true },
      { kind: 'star', spin: 1.1, points: 4, inner: 0.34, scale: 1.05, rot0: Q, fill: 0.18, width: 2.1 },
      { kind: 'path', face: true, mirror: true, pts: [[1.12, 0], [0.35, 0.32], [-0.25, 0.86], [-0.45, 0.35], [-0.88, 0]], fill: 0.3, width: 2.0, color: 'accent' },
      { kind: 'eye', face: true, r: 0.24 },
    ],
  },

  specter: {
    artScale: 1.34, extent: 1.68, accent: '#e0ffff', glow: 1.25,
    trail: { len: 2.8, w: 0.72, alpha: 0.65 },
    layers: [
      { kind: 'path', face: true, mirror: true, pts: [[1.22, 0], [0.45, 0.62], [-0.55, 0.94], [-0.95, 0.42], [-0.42, 0.18], [-0.75, 0]], fill: 0.24, width: 2.2 },
      { kind: 'arc', face: true, r: 0.92, span: 2.1, rot0: 0, width: 2.0, color: 'accent' },
      { kind: 'star', spin: -1.8, points: 5, inner: 0.42, scale: 0.62, fill: 0.35, width: 1.3, color: 'accent' },
      { kind: 'core', face: true, at: [0.22, 0], r: 0.26, color: 'accent', pulse: [0.26, 3.6] },
    ],
  },

  colossus: {
    artScale: 1.24, extent: 1.6, accent: '#fff0d4', glow: 1.25, cracks: true,
    layers: [
      { kind: 'poly', sides: 8, spin: 0.2, rot0: 0.3927, fill: 0.2, width: 3.0 },
      { kind: 'plates', spin: 0.2, n: 8, rIn: 0.74, rOut: 1.06, span: 0.64, fill: 0.35, width: 1.8, color: 'accent' },
      { kind: 'blades', spin: -0.55, n: 6, pts: [[0.45, 0.08], [0.86, 0], [0.45, -0.08]], fill: 0.6, width: 1.2, color: 'accent' },
      { kind: 'poly', sides: 6, spin: -0.55, scale: 0.58, fill: 0.25, width: 1.8, color: 'accent' },
      { kind: 'dots', spin: 0.2, n: 8, ring: 0.92, r: 0.075, shape: 'sq', color: 'accent', deco: true },
      { kind: 'core', r: 0.32, color: 'accent', pulse: [0.22, 1.4] },
    ],
  },

  /* ═══════════════════════ WORLD 4: ASTRAL SANCTUM ═══════════════════════ */

  seraph: {
    artScale: 1.32, extent: 1.72, accent: '#faffd8', glow: 1.25,
    trail: { len: 3.2, w: 0.68, alpha: 0.62 },
    layers: [
      { kind: 'path', face: true, mirror: true, pts: [[1.22, 0], [0.72, 0.28], [0.35, 0.85], [-0.25, 0.95], [-0.85, 0.42], [-0.55, 0.15], [-0.85, 0]], fill: 0.24, width: 2.4 },
      { kind: 'blades', spin: 2.2, n: 4, pts: [[0.25, 0.08], [0.85, 0], [0.25, -0.08]], fill: 0.45, width: 1.4, color: 'accent' },
      { kind: 'ring', spin: -1.4, r: 0.65, seg: 6, gap: 0.35, width: 1.6, color: 'accent' },
      { kind: 'core', face: true, at: [0.25, 0], r: 0.28, color: 'accent', pulse: [0.25, 3.2] },
    ],
  },

  bastion: {
    artScale: 1.26, extent: 1.62, accent: '#fff8d4', glow: 1.25, cracks: true,
    layers: [
      { kind: 'poly', sides: 6, rot0: 0, spin: 0.18, fill: 0.22, width: 3.0 },
      { kind: 'plates', spin: 0.18, n: 6, rIn: 0.72, rOut: 1.08, span: 0.68, fill: 0.36, width: 1.8, color: 'accent' },
      { kind: 'star', spin: -0.65, points: 6, inner: 0.52, scale: 0.68, fill: 0.24, width: 1.6, color: 'accent' },
      { kind: 'ring', spin: 0.85, r: 0.48, seg: 6, gap: 0.25, width: 2.2, color: 'accent' },
      { kind: 'core', r: 0.3, color: 'accent', pulse: [0.2, 1.6] },
    ],
  },

  oracle: {
    artScale: 1.28, extent: 1.64, accent: '#dffeff', glow: 1.22, cracks: true,
    layers: [
      { kind: 'ring', spin: 0.6, r: 1.05, seg: 12, gap: 0.32, width: 1.8, color: 'accent', alpha: 0.7 },
      { kind: 'star', spin: -1.2, points: 8, inner: 0.62, scale: 0.94, fill: 0.22, width: 2.2 },
      { kind: 'path', spin: 0.45, pts: PLUS, scale: 0.85, fill: 0.7, width: 1.8, color: 'accent', pulse: [0.18, 2.4] },
      { kind: 'core', r: 0.26, color: 'accent', pulse: [0.24, 2.5] },
    ],
  },

  archon: {
    artScale: 1.35, extent: 1.75, accent: '#ffeacc', glow: 1.28,
    trail: { len: 2.4, w: 0.7, alpha: 0.55 },
    layers: [
      { kind: 'path', face: true, mirror: true, pts: [[1.4, 0], [0.45, 0.35], [-0.3, 0.85], [-0.85, 0.65], [-0.5, 0.2], [-0.95, 0]], fill: 0.26, width: 2.5 },
      { kind: 'arc', face: true, r: 1.02, span: 1.8, rot0: 0, width: 2.2, color: 'accent' },
      {
        kind: 'lines', face: true, color: 'accent', width: 1.2, alpha: 0.85, lines: [
          [1.35, 0, -0.6, 0], [0.5, -0.22, 0.5, 0.22], [0.9, -0.15, 0.9, 0.15],
        ]
      },
      { kind: 'core', face: true, at: [0.35, 0], r: 0.28, color: 'accent', pulse: [0.3, 3.4] },
    ],
  },

  /* ═══════════════════════ WORLD 5: CRYO-CHRONO LAB ═══════════════════════ */

  icicle: {
    artScale: 1.35, extent: 1.78, accent: '#e0faff', glow: 1.3,
    trail: { len: 3.4, w: 0.58, alpha: 0.72 },
    layers: [
      { kind: 'path', face: true, mirror: true, pts: [[1.46, 0], [0.45, 0.28], [-0.15, 0.65], [-0.55, 0.22], [-1.05, 0]], fill: 0.26, width: 2.3 },
      { kind: 'star', spin: 1.8, points: 6, inner: 0.4, scale: 0.62, fill: 0.4, width: 1.2, color: 'accent' },
      { kind: 'core', face: true, at: [0.85, 0], r: 0.22, color: 'accent', pulse: [0.28, 3.8] },
    ],
  },

  glacier: {
    artScale: 1.28, extent: 1.65, accent: '#ffffff', glow: 1.3, cracks: true,
    layers: [
      { kind: 'poly', sides: 6, spin: 0.22, fill: 0.24, width: 3.0 },
      { kind: 'star', spin: -0.45, points: 6, inner: 0.58, scale: 1.06, fill: 0.28, width: 1.8, color: 'accent' },
      { kind: 'spokes', spin: 0.22, n: 6, r0: 0.25, r1: 0.98, width: 1.4, color: 'accent' },
      { kind: 'core', r: 0.34, color: 'accent', pulse: [0.24, 1.8] },
    ],
  },

  mirage: {
    artScale: 1.32, extent: 1.68, accent: '#d8f8ff', glow: 1.3,
    trail: { len: 2.6, w: 0.7, alpha: 0.6 },
    layers: [
      { kind: 'path', face: true, mirror: true, pts: [[1.25, 0], [0.35, 0.78], [-0.75, 0.88], [-0.45, 0.2], [-0.88, 0]], fill: 0.24, width: 2.2 },
      { kind: 'ring', spin: -2.0, r: 0.78, seg: 4, gap: 0.38, width: 1.6, color: 'accent' },
      { kind: 'core', face: true, at: [0.2, 0], r: 0.28, color: 'accent', pulse: [0.3, 3.6] },
    ],
  },

  weaver: {
    artScale: 1.34, extent: 1.72, accent: '#e0ffff', glow: 1.35,
    layers: [
      { kind: 'ring', spin: 0.9, r: 1.06, seg: 8, gap: 0.3, width: 1.8, color: 'accent' },
      { kind: 'blades', spin: -1.4, n: 4, pts: [[0.35, 0.12], [1.05, 0], [0.35, -0.12]], fill: 0.55, width: 1.4, color: 'accent' },
      { kind: 'poly', spin: 0.9, sides: 4, rot0: Q, scale: 0.68, fill: 0.25, width: 2.0 },
      { kind: 'core', r: 0.3, color: 'accent', pulse: [0.26, 2.8] },
    ],
  },

  /* ═══════════════════════ WORLD 6: QUANTUM BIO-HIVE ═══════════════════════ */

  spore: {
    artScale: 1.3, extent: 1.65, accent: '#f4ffcf', glow: 1.3,
    layers: [
      { kind: 'ring', spin: 1.2, r: 0.98, seg: 6, gap: 0.32, width: 2.0 },
      { kind: 'dots', spin: -1.5, n: 6, ring: 0.88, r: 0.11, color: 'accent', glow: 1.6 },
      { kind: 'poly', spin: 0.6, sides: 6, scale: 0.68, fill: 0.32, width: 1.8, color: 'accent' },
      { kind: 'core', r: 0.34, color: 'accent', pulse: [0.28, 3.2] },
    ],
  },

  shifter: {
    artScale: 1.34, extent: 1.7, accent: '#ffd6eb', glow: 1.35,
    trail: { len: 2.8, w: 0.65, alpha: 0.65 },
    layers: [
      { kind: 'star', spin: 1.6, points: 4, inner: 0.38, scale: 1.08, fill: 0.24, width: 2.2 },
      { kind: 'star', spin: -1.6, points: 4, inner: 0.38, scale: 0.82, rot0: Q, fill: 0.3, width: 1.6, color: 'accent' },
      { kind: 'eye', face: true, r: 0.25 },
    ],
  },

  brood: {
    artScale: 1.28, extent: 1.66, accent: '#d8fff4', glow: 1.3, cracks: true,
    layers: [
      { kind: 'poly', sides: 6, spin: 0.3, fill: 0.2, width: 2.8 },
      { kind: 'hex', spin: 0.3, cell: 0.28, rings: 1, fill: 0.18, width: 1.1, color: 'accent' },
      { kind: 'plates', spin: -0.7, n: 6, rIn: 0.75, rOut: 1.05, span: 0.55, fill: 0.32, width: 1.5, color: 'accent' },
      { kind: 'core', r: 0.3, color: 'accent', pulse: [0.24, 2.2] },
    ],
  },

  juggernaut: {
    artScale: 1.26, extent: 1.66, accent: '#fff6cc', glow: 1.4, cracks: true,
    layers: [
      { kind: 'poly', sides: 8, spin: 0.16, fill: 0.24, width: 3.2 },
      { kind: 'plates', spin: 0.16, n: 8, rIn: 0.72, rOut: 1.08, span: 0.68, fill: 0.38, width: 2.0, color: 'accent' },
      { kind: 'blades', spin: -0.65, n: 8, pts: [[0.5, 0.1], [1.02, 0], [0.5, -0.1]], fill: 0.7, width: 1.4, color: 'accent' },
      { kind: 'core', r: 0.36, color: 'accent', pulse: [0.25, 1.6] },
    ],
  },

  /* ═══════════════════════ 3 TACTICAL ENEMIES ═══════════════════════ */

  leech: {
    artScale: 1.34, extent: 1.7, accent: '#ffd6f0', glow: 1.35,
    trail: { len: 2.5, w: 0.65, alpha: 0.65 },
    layers: [
      { kind: 'path', face: true, mirror: true, pts: [[1.28, 0.36], [0.75, 0.62], [0.12, 0.42], [-0.65, 0.72], [-0.92, 0]], fill: 0.28, width: 2.2 },
      { kind: 'arc', face: true, r: 0.88, span: 2.2, rot0: 0, width: 2.2, color: 'accent' },
      { kind: 'ring', spin: -2.6, r: 0.52, seg: 4, gap: 0.35, width: 1.8, color: 'accent' },
      { kind: 'core', face: true, at: [0.22, 0], r: 0.32, color: 'accent', pulse: [0.3, 4.2] },
    ],
  },

  linker: {
    artScale: 1.32, extent: 1.72, accent: '#e0ffff', glow: 1.4, cracks: true,
    layers: [
      { kind: 'ring', spin: -1.4, r: 1.08, seg: 6, gap: 0.32, width: 1.8, color: 'accent' },
      { kind: 'poly', spin: 0.8, sides: 3, scale: 0.92, fill: 0.22, width: 2.4 },
      { kind: 'poly', spin: -0.8, sides: 3, rot0: 1.047, scale: 0.92, fill: 0.22, width: 2.4, color: 'accent' },
      { kind: 'dots', spin: 1.4, n: 3, ring: 1.04, r: 0.09, color: 'accent', glow: 1.8 },
      { kind: 'core', r: 0.36, color: 'accent', pulse: [0.28, 3.4] },
    ],
  },

  portal: {
    artScale: 1.36, extent: 1.78, accent: '#f3d9ff', glow: 1.5, cracks: true,
    layers: [
      { kind: 'ring', spin: -1.2, r: 1.12, seg: 8, gap: 0.28, width: 2.2, color: 'accent' },
      { kind: 'spiral', spin: 2.4, arms: 4, turns: 0.85, r: 1.02, width: 2.5 },
      { kind: 'star', spin: -1.6, points: 6, inner: 0.45, scale: 0.86, fill: 0.28, width: 1.8, color: 'accent' },
      { kind: 'core', r: 0.44, color: 'accent', pulse: [0.32, 3.6] },
    ],
  },

  /* ═══════════════════════ SPECIAL & ARENA UNITS ═══════════════════════ */
  loot: {
    artScale: 1.35, extent: 1.7, accent: '#ffffff', glow: 1.45,
    trail: { len: 3.0, w: 0.75, alpha: 0.75 },
    layers: [
      { kind: 'ring', spin: -1.8, r: 1.05, seg: 6, gap: 0.35, width: 1.6, color: 'accent' },
      { kind: 'star', spin: 1.4, points: 6, inner: 0.52, scale: 0.92, fill: 0.28, width: 2.2 },
      { kind: 'poly', spin: -1.1, sides: 4, rot0: 0.7854, scale: 0.58, fill: 0.55, width: 1.6, color: 'accent' },
      { kind: 'dots', spin: 1.4, n: 6, ring: 0.96, r: 0.075, color: 'accent', glow: 1.8 },
      { kind: 'core', r: 0.32, color: 'accent', pulse: [0.28, 3.8] },
    ],
  },
  capsule: {
    artScale: 1.32, extent: 1.68, accent: '#ffffff', glow: 1.4,
    layers: [
      { kind: 'ring', spin: 1.6, r: 1.06, seg: 3, gap: 0.35, width: 2.0, color: 'accent' },
      { kind: 'poly', spin: -0.9, sides: 6, scale: 0.82, fill: 0.25, width: 2.2 },
      { kind: 'star', spin: 2.2, points: 4, inner: 0.42, scale: 0.65, fill: 0.75, width: 1.4, color: 'accent' },
      { kind: 'core', r: 0.36, color: 'accent', pulse: [0.3, 3.2] },
    ],
  },
  magmaRock: {
    artScale: 1.32, extent: 1.68, accent: '#ffe066', glow: 1.45, cracks: true,
    layers: [
      { kind: 'poly', spin: 0.45, sides: 7, fill: 0.28, width: 2.6 },
      { kind: 'star', spin: -0.85, points: 7, inner: 0.65, scale: 0.92, fill: 0.35, width: 1.6, color: 'accent' },
      { kind: 'dots', spin: 0.45, n: 5, ring: 0.68, r: 0.09, color: 'accent', glow: 1.8 },
      { kind: 'core', r: 0.44, color: 'accent', pulse: [0.32, 3.6] },
    ],
  },
  aetherPylon: {
    artScale: 1.34, extent: 1.7, accent: '#ffffff', glow: 1.5,
    layers: [
      { kind: 'poly', spin: 0.6, sides: 8, fill: 0.25, width: 2.4 },
      { kind: 'spokes', spin: -0.8, n: 8, r0: 0.45, r1: 1.15, width: 1.5, color: 'accent' },
      { kind: 'star', spin: 1.2, points: 4, inner: 0.4, scale: 0.85, fill: 0.55, width: 1.8, color: 'accent' },
      { kind: 'core', r: 0.42, color: 'accent', pulse: [0.34, 3.8] },
    ],
  },
  prismNode: {
    artScale: 1.36, extent: 1.72, accent: '#ffffff', glow: 1.55,
    layers: [
      { kind: 'poly', spin: 0.75, sides: 3, scale: 1.05, fill: 0.28, width: 2.4 },
      { kind: 'poly', spin: -0.75, sides: 3, rot0: 1.047, scale: 1.05, fill: 0.28, width: 2.4, color: 'accent' },
      { kind: 'ring', spin: 1.5, r: 1.12, seg: 6, gap: 0.35, width: 1.6, color: 'accent' },
      { kind: 'core', r: 0.44, color: 'accent', pulse: [0.35, 4.0] },
    ],
  },
  shard: {
    artScale: 1.38, extent: 1.55, accent: '#ffffff',
    trail: { len: 2.2, w: 0.8, alpha: 0.55 },
    layers: [
      { kind: 'path', face: true, mirror: true, pts: [[1.08, 0], [-0.68, 0.8], [-0.3, 0]], fill: 0.35, width: 2.0 },
      { kind: 'lines', face: true, color: 'accent', width: 0.9, alpha: 0.65, lines: [[0.8, 0, -0.3, 0]] },
      { kind: 'core', face: true, at: [-0.1, 0], r: 0.22, color: 'accent', pulse: [0.25, 4] },
    ],
  },
  orb: {
    artScale: 1.65, extent: 1.75, accent: '#fff2ee',
    layers: [
      { kind: 'ring', spin: 2.4, r: 1.02, seg: 4, gap: 0.35, width: 1.3, alpha: 0.8, color: 'accent' },
      { kind: 'core', r: 0.82, pulse: [0.14, 2.8] },
      { kind: 'core', r: 0.38, color: 'accent', pulse: [0.14, 2.8] },
    ],
  },
};

/** 18 Distinct Bosses (3 per World across 6 Worlds) */
export const BOSS_ART = [
  /* ═══ WORLD 1 BOSSES (0, 1, 2) ═══ */
  {
    artScale: 1.2, extent: 1.5, accent: '#ffd8de', glow: 1.35, cracks: true,
    layers: [
      { kind: 'plates', spin: 0.08, n: 6, rIn: 0.62, rOut: 1.02, span: 0.82, fill: 0.22, width: 2.9 },
      { kind: 'plates', spin: 0.08, n: 6, rIn: 0.72, rOut: 0.92, span: 0.52, color: 'accent', width: 1.2, alpha: 0.7 },
      { kind: 'blades', spin: 0.08, n: 6, rot0: 0.5236, pts: [[0.82, 0.06], [1.14, 0], [0.82, -0.06]], fill: 0.7, width: 1.4, color: 'accent' },
      { kind: 'dots', spin: 0.08, pulse: [0.3, 1.2], n: 6, ring: 0.95, r: 0.06, fill: 1, color: 'accent', glow: 1.5 },
      { kind: 'ring', spin: -0.55, r: 0.52, seg: 12, gap: 0.42, width: 2.1, color: 'accent' },
      { kind: 'poly', spin: 0.32, sides: 6, scale: 0.38, fill: 0.28, width: 1.7, color: 'accent' },
      { kind: 'spokes', spin: 0.32, n: 6, r0: 0.14, r1: 0.38, width: 1.2, color: 'accent', alpha: 0.75 },
      { kind: 'eye', face: true, r: 0.22 },
    ],
  },
  {
    artScale: 1.2, extent: 1.58, accent: '#ebfcff', glow: 1.35, cracks: true,
    layers: [
      { kind: 'spokes', spin: 0.2, n: 12, r0: 0.52, r1: 1.32, width: 1.0, alpha: 0.38, color: 'accent', deco: true },
      { kind: 'poly', spin: 0.12, sides: 4, rot0: Q, fill: 0.15, width: 3.0 },
      { kind: 'blades', spin: 0.12, n: 4, rot0: Q, pts: [[0.72, 0.12], [1.18, 0], [0.72, -0.12]], fill: 0.4, width: 1.5, color: 'accent' },
      {
        kind: 'lines', spin: 0.12, color: 'accent', width: 1.0, alpha: 0.6, lines: [
          [0.7071, 0.7071, -0.7071, -0.7071], [-0.7071, 0.7071, 0.7071, -0.7071], [0.7071, 0, -0.7071, 0], [0, 0.7071, 0, -0.7071],
        ]
      },
      { kind: 'dots', spin: 0.12, pulse: [0.25, 1.1], n: 4, ring: 1.0, r: 0.1, rot0: Q, color: '#ff7be5', glow: 2 },
      { kind: 'poly', spin: 0.48, sides: 4, rot0: Q, scale: 0.7, fill: 0.12, width: 1.9, color: '#8be9ff' },
      { kind: 'poly', spin: -0.85, sides: 4, scale: 0.5, fill: 0.16, width: 1.9, color: '#ff7be5' },
      { kind: 'core', r: 0.24, color: 'accent', pulse: [0.22, 1.5] },
    ],
  },
  {
    artScale: 1.18, extent: 1.55, accent: '#e0fbff', glow: 1.4, cracks: true,
    layers: [
      { kind: 'poly', sides: 8, rot0: 0.3927, spin: 0.09, fill: 0.14, width: 3.0 },
      { kind: 'plates', spin: 0.09, n: 8, rIn: 0.8, rOut: 1.02, span: 0.65, fill: 0.25, width: 1.4, color: 'accent' },
      { kind: 'hex', spin: 0.09, cell: 0.2, rings: 2, fill: 0.12, width: 0.95, color: 'accent', alpha: 0.65 },
      { kind: 'poly', sides: 8, spin: -0.38, scale: 0.6, fill: 0.16, width: 1.8, color: 'accent' },
      { kind: 'dots', spin: 0.75, n: 8, ring: 1.14, r: 0.1, shape: 'tri', fill: 0.92, color: 'accent' },
      { kind: 'core', r: 0.3, color: 'accent', pulse: [0.2, 1.2] },
    ],
  },

  /* ═══ WORLD 2 BOSSES (3, 4, 5) ═══ */
  {
    artScale: 1.2, extent: 1.55, accent: '#ffe5b4', glow: 1.4, cracks: true,
    layers: [
      { kind: 'plates', spin: 0.12, n: 6, rIn: 0.65, rOut: 1.04, span: 0.75, fill: 0.26, width: 2.8 },
      { kind: 'blades', spin: -0.45, n: 6, pts: [[0.52, 0.12], [1.16, 0], [0.52, -0.12]], fill: 0.6, width: 1.5, color: 'accent' },
      { kind: 'ring', spin: 0.65, r: 0.58, seg: 6, gap: 0.3, width: 2.2, color: '#ffbe0b' },
      { kind: 'dots', spin: 0.12, pulse: [0.28, 1.4], n: 6, ring: 0.88, r: 0.075, shape: 'sq', color: 'accent', glow: 1.6 },
      { kind: 'core', r: 0.32, color: 'accent', pulse: [0.24, 1.6] },
    ],
  },
  {
    artScale: 1.22, extent: 1.6, accent: '#fff3cc', glow: 1.4, cracks: true,
    layers: [
      { kind: 'star', spin: 0.18, points: 5, inner: 0.56, scale: 1.06, fill: 0.2, width: 2.9 },
      { kind: 'blades', spin: 0.18, n: 5, pts: [[0.76, 0.1], [1.22, 0], [0.76, -0.1]], fill: 0.75, width: 1.5, color: 'accent' },
      { kind: 'ring', spin: -0.7, r: 0.68, seg: 10, gap: 0.38, width: 2.0, color: '#ff4d5e' },
      { kind: 'poly', spin: -0.35, sides: 5, scale: 0.46, fill: 0.25, width: 1.8, color: 'accent' },
      { kind: 'eye', face: true, r: 0.23 },
    ],
  },
  {
    artScale: 1.22, extent: 1.62, accent: '#ffd6e0', glow: 1.45, cracks: true,
    layers: [
      { kind: 'poly', sides: 8, spin: 0.07, fill: 0.18, width: 3.1 },
      { kind: 'plates', spin: 0.07, n: 8, rIn: 0.7, rOut: 1.05, span: 0.72, fill: 0.3, width: 2.2, color: 'accent' },
      { kind: 'blades', spin: -0.5, n: 8, pts: [[0.62, 0.09], [1.18, 0], [0.62, -0.09]], fill: 0.65, width: 1.5, color: '#ffbe0b' },
      { kind: 'ring', spin: 0.4, r: 0.56, seg: 8, gap: 0.32, width: 2.2, color: 'accent' },
      { kind: 'core', r: 0.34, color: 'accent', pulse: [0.25, 1.5] },
    ],
  },

  /* ═══ WORLD 3 BOSSES (6, 7, 8) ═══ */
  {
    artScale: 1.22, extent: 1.6, accent: '#f3d9ff', glow: 1.45, cracks: true,
    layers: [
      { kind: 'ring', spin: -0.4, r: 1.12, seg: 16, gap: 0.4, width: 1.5, color: 'accent', alpha: 0.65, deco: true },
      { kind: 'spiral', spin: 1.4, arms: 5, turns: 0.75, r: 1.08, width: 2.8 },
      { kind: 'star', spin: -0.65, points: 6, inner: 0.48, scale: 0.86, fill: 0.18, width: 2.2, color: 'accent' },
      { kind: 'ring', spin: 0.9, r: 0.56, seg: 6, gap: 0.3, width: 2.2, color: '#00f5d4' },
      { kind: 'dots', spin: -0.65, pulse: [0.28, 1.6], n: 6, ring: 0.86, r: 0.075, color: '#00f5d4', glow: 1.8 },
      { kind: 'core', r: 0.34, color: 'accent', pulse: [0.25, 1.8] },
    ],
  },
  {
    artScale: 1.22, extent: 1.6, accent: '#d8fff8', glow: 1.45, cracks: true,
    layers: [
      { kind: 'ring', spin: 0.25, r: 1.04, seg: 12, gap: 0.28, width: 2.6 },
      { kind: 'spokes', spin: 0.25, n: 12, r0: 0.62, r1: 1.04, width: 1.3, color: 'accent', alpha: 0.7 },
      { kind: 'star', spin: -0.75, points: 8, inner: 0.58, scale: 0.82, fill: 0.22, width: 2.0, color: '#c77dff' },
      { kind: 'ring', spin: 1.1, r: 0.48, seg: 4, gap: 0.35, width: 2.2, color: 'accent' },
      { kind: 'eye', face: true, r: 0.24 },
    ],
  },
  {
    artScale: 1.24, extent: 1.65, accent: '#ffe0f4', glow: 1.5, cracks: true,
    layers: [
      { kind: 'plates', spin: 0.08, n: 8, rIn: 0.68, rOut: 1.05, span: 0.76, fill: 0.26, width: 2.9 },
      { kind: 'blades', spin: 0.08, n: 8, pts: [[0.84, 0.09], [1.24, 0], [0.84, -0.09]], fill: 0.8, width: 1.6, color: 'accent' },
      { kind: 'spiral', spin: -1.1, arms: 4, turns: 0.65, r: 0.88, width: 2.2, color: '#00f5d4' },
      { kind: 'star', spin: 0.42, points: 8, inner: 0.6, scale: 0.56, fill: 0.3, width: 1.9, color: 'accent' },
      { kind: 'dots', spin: 0.08, pulse: [0.3, 1.5], n: 8, ring: 0.96, r: 0.07, shape: 'sq', color: '#ffd23d', glow: 1.8 },
      { kind: 'eye', face: true, r: 0.25 },
    ],
  },

  /* ═══ WORLD 4 BOSSES (9, 10, 11) ═══ */
  {
    artScale: 1.22, extent: 1.62, accent: '#ffffff', glow: 1.45, cracks: true,
    layers: [
      { kind: 'plates', spin: 0.14, n: 6, rIn: 0.7, rOut: 1.08, span: 0.78, fill: 0.25, width: 2.8 },
      { kind: 'blades', spin: -0.5, n: 6, pts: [[0.6, 0.12], [1.22, 0], [0.6, -0.12]], fill: 0.65, width: 1.6, color: 'accent' },
      { kind: 'ring', spin: 0.8, r: 0.58, seg: 8, gap: 0.28, width: 2.2, color: '#ffd23d' },
      { kind: 'dots', spin: 0.14, pulse: [0.26, 1.4], n: 6, ring: 0.92, r: 0.08, shape: 'tri', color: 'accent', glow: 1.6 },
      { kind: 'core', r: 0.32, color: 'accent', pulse: [0.24, 1.6] },
    ],
  },
  {
    artScale: 1.24, extent: 1.65, accent: '#fff8cc', glow: 1.5, cracks: true,
    layers: [
      { kind: 'star', spin: 0.2, points: 8, inner: 0.62, scale: 1.08, fill: 0.24, width: 3.0 },
      { kind: 'spokes', spin: -0.6, n: 16, r0: 0.45, r1: 1.2, width: 1.4, color: 'accent', alpha: 0.7 },
      { kind: 'ring', spin: 0.9, r: 0.62, seg: 8, gap: 0.3, width: 2.4, color: '#2eff9c' },
      { kind: 'dots', spin: 0.2, pulse: [0.28, 1.6], n: 8, ring: 0.88, r: 0.08, shape: 'sq', color: 'accent', glow: 1.8 },
      { kind: 'core', r: 0.36, color: 'accent', pulse: [0.26, 2.0] },
    ],
  },
  {
    artScale: 1.26, extent: 1.7, accent: '#e0ffff', glow: 1.55, cracks: true,
    layers: [
      { kind: 'poly', sides: 8, spin: 0.08, fill: 0.2, width: 3.2 },
      { kind: 'plates', spin: 0.08, n: 8, rIn: 0.72, rOut: 1.1, span: 0.75, fill: 0.32, width: 2.4, color: 'accent' },
      { kind: 'blades', spin: -0.6, n: 8, pts: [[0.7, 0.1], [1.28, 0], [0.7, -0.1]], fill: 0.85, width: 1.6, color: '#ffd23d' },
      { kind: 'ring', spin: 1.1, r: 0.52, seg: 8, gap: 0.28, width: 2.6, color: '#2eff9c' },
      { kind: 'star', spin: -0.4, points: 8, inner: 0.55, scale: 0.72, fill: 0.35, width: 2.0, color: 'accent' },
      { kind: 'eye', face: true, r: 0.26 },
    ],
  },

  /* ═══ WORLD 5 BOSSES (12, 13, 14) ═══ */
  {
    artScale: 1.24, extent: 1.65, accent: '#e0faff', glow: 1.5, cracks: true,
    layers: [
      { kind: 'star', spin: 0.16, points: 6, inner: 0.52, scale: 1.08, fill: 0.24, width: 2.9 },
      { kind: 'blades', spin: -0.55, n: 6, pts: [[0.65, 0.1], [1.24, 0], [0.65, -0.1]], fill: 0.75, width: 1.5, color: 'accent' },
      { kind: 'ring', spin: 0.75, r: 0.58, seg: 6, gap: 0.28, width: 2.2, color: '#8ff5ff' },
      { kind: 'core', r: 0.34, color: 'accent', pulse: [0.26, 1.8] },
    ],
  },
  {
    artScale: 1.25, extent: 1.68, accent: '#ffffff', glow: 1.52, cracks: true,
    layers: [
      { kind: 'plates', spin: 0.12, n: 8, rIn: 0.7, rOut: 1.08, span: 0.72, fill: 0.28, width: 2.8 },
      { kind: 'spokes', spin: -0.5, n: 12, r0: 0.4, r1: 1.18, width: 1.4, color: 'accent' },
      { kind: 'star', spin: 0.65, points: 8, inner: 0.54, scale: 0.76, fill: 0.32, width: 1.9, color: '#38b6ff' },
      { kind: 'eye', face: true, r: 0.25 },
    ],
  },
  {
    artScale: 1.28, extent: 1.72, accent: '#38b6ff', glow: 1.58, cracks: true,
    layers: [
      { kind: 'poly', sides: 8, spin: 0.08, fill: 0.22, width: 3.2 },
      { kind: 'blades', spin: -0.65, n: 8, pts: [[0.72, 0.11], [1.3, 0], [0.72, -0.11]], fill: 0.85, width: 1.6, color: '#ffffff' },
      { kind: 'star', spin: 0.38, points: 6, inner: 0.5, scale: 0.84, fill: 0.3, width: 2.0, color: 'accent' },
      { kind: 'core', r: 0.38, color: 'accent', pulse: [0.28, 2.0] },
    ],
  },

  /* ═══ WORLD 6 BOSSES (15, 16, 17) ═══ */
  {
    artScale: 1.24, extent: 1.66, accent: '#f4ffcf', glow: 1.52, cracks: true,
    layers: [
      { kind: 'plates', spin: 0.14, n: 6, rIn: 0.68, rOut: 1.08, span: 0.76, fill: 0.28, width: 2.9 },
      { kind: 'hex', spin: -0.35, cell: 0.22, rings: 2, fill: 0.16, width: 1.1, color: 'accent' },
      { kind: 'dots', spin: 0.8, n: 6, ring: 0.94, r: 0.09, color: '#ff007f', glow: 1.8 },
      { kind: 'core', r: 0.36, color: 'accent', pulse: [0.26, 1.9] },
    ],
  },
  {
    artScale: 1.26, extent: 1.7, accent: '#ffd6eb', glow: 1.55, cracks: true,
    layers: [
      { kind: 'spiral', spin: 1.4, arms: 6, turns: 0.75, r: 1.1, width: 2.8 },
      { kind: 'star', spin: -0.7, points: 8, inner: 0.52, scale: 0.88, fill: 0.26, width: 2.2, color: '#b8ff2e' },
      { kind: 'ring', spin: 1.1, r: 0.54, seg: 8, gap: 0.3, width: 2.4, color: 'accent' },
      { kind: 'eye', face: true, r: 0.26 },
    ],
  },
  {
    artScale: 1.28, extent: 1.74, accent: '#b8ff2e', glow: 1.6, cracks: true,
    layers: [
      { kind: 'poly', sides: 8, spin: 0.09, fill: 0.24, width: 3.3 },
      { kind: 'plates', spin: 0.09, n: 8, rIn: 0.72, rOut: 1.12, span: 0.76, fill: 0.34, width: 2.4, color: 'accent' },
      { kind: 'blades', spin: -0.65, n: 8, pts: [[0.72, 0.11], [1.3, 0], [0.72, -0.11]], fill: 0.85, width: 1.6, color: '#ff007f' },
      { kind: 'star', spin: 0.45, points: 8, inner: 0.56, scale: 0.74, fill: 0.35, width: 2.0, color: '#ffffff' },
      { kind: 'eye', face: true, r: 0.28 },
    ],
  },
];

/** 4 Standard Playable Core Chassis visual recipes */
export const CHASSIS_ART = {
  aegis: {
    artScale: 1, extent: 1.5, accent: '#ffffff', glow: 1.15,
    layers: [
      { kind: 'ring', spin: 0.35, r: 1, seg: 8, gap: 0.28, width: 3 },
      { kind: 'dots', spin: 0.35, n: 8, ring: 1, r: 0.05, fill: 1, color: 'accent', rot0: 0.3927 },
      { kind: 'ring', spin: -0.7, r: 0.76, seg: 3, gap: 0.5, width: 2.2, color: 'accent', alpha: 0.9 },
      { kind: 'core', r: 0.62, pulse: [0.05, 1.1] },
      { kind: 'poly', spin: 1.4, sides: 3, scale: 0.3, width: 1.2, color: 'main' },
    ],
  },
  lancer: {
    artScale: 1.05, extent: 1.55, accent: '#fff0f2', glow: 1.2,
    layers: [
      { kind: 'plates', spin: 0.25, n: 4, rIn: 0.78, rOut: 1.04, span: 0.62, rot0: Q, fill: 0.28, width: 2.6 },
      { kind: 'blades', spin: -0.6, n: 4, pts: [[0.55, 0.08], [1.08, 0], [0.55, -0.08]], fill: 0.7, width: 1.4, color: 'accent' },
      { kind: 'poly', spin: 0.9, sides: 4, rot0: Q, scale: 0.58, width: 2.0, color: 'accent' },
      { kind: 'core', r: 0.58, pulse: [0.07, 1.4] },
    ],
  },
  nexus: {
    artScale: 1.04, extent: 1.55, accent: '#e6fff5', glow: 1.2,
    layers: [
      { kind: 'poly', spin: 0.28, sides: 6, fill: 0.14, width: 2.8 },
      { kind: 'hex', spin: 0.28, cell: 0.26, rings: 1, width: 1.0, color: 'accent', alpha: 0.75 },
      { kind: 'dots', spin: -1.1, n: 6, ring: 0.96, r: 0.07, shape: 'tri', color: 'accent' },
      { kind: 'core', r: 0.56, pulse: [0.06, 1.2] },
    ],
  },
  volt: {
    artScale: 1.05, extent: 1.55, accent: '#f6e8ff', glow: 1.25,
    layers: [
      { kind: 'ring', spin: -0.9, r: 1.02, seg: 12, gap: 0.4, width: 2.2, color: 'accent' },
      { kind: 'star', spin: 0.55, points: 8, inner: 0.64, scale: 0.92, fill: 0.2, width: 2.2 },
      { kind: 'spokes', spin: -1.4, n: 8, r0: 0.3, r1: 0.85, width: 1.2, color: 'accent' },
      { kind: 'core', r: 0.62, pulse: [0.08, 2.0] },
    ],
  },
};

/** 4 Awakened (Lv 5 Maxed) Core Chassis visual recipes */
export const CHASSIS_AWAKENED_ART = {
  aegis: {
    artScale: 1.12, extent: 1.68, accent: '#fff6c2', glow: 1.45,
    layers: [
      { kind: 'ring', spin: -0.5, r: 1.18, seg: 6, gap: 0.32, width: 2.2, color: 'accent' },
      { kind: 'blades', spin: 0.45, n: 6, pts: [[0.82, 0.08], [1.26, 0], [0.82, -0.08]], fill: 0.75, width: 1.5, color: 'accent' },
      { kind: 'ring', spin: 0.35, r: 0.95, seg: 8, gap: 0.25, width: 3 },
      { kind: 'star', spin: -0.9, points: 6, inner: 0.52, scale: 0.78, fill: 0.28, width: 1.8, color: 'accent' },
      { kind: 'core', r: 0.68, pulse: [0.08, 1.6] },
    ],
  },
  lancer: {
    artScale: 1.14, extent: 1.7, accent: '#ffe066', glow: 1.45,
    layers: [
      { kind: 'plates', spin: 0.3, n: 4, rIn: 0.82, rOut: 1.14, span: 0.66, rot0: Q, fill: 0.34, width: 2.8 },
      { kind: 'blades', spin: -0.75, n: 8, pts: [[0.58, 0.09], [1.24, 0], [0.58, -0.09]], fill: 0.8, width: 1.5, color: 'accent' },
      { kind: 'star', spin: 1.1, points: 4, inner: 0.45, scale: 0.82, fill: 0.3, width: 2.0, color: 'accent' },
      { kind: 'core', r: 0.64, pulse: [0.09, 1.8] },
    ],
  },
  nexus: {
    artScale: 1.12, extent: 1.68, accent: '#ffffff', glow: 1.45,
    layers: [
      { kind: 'ring', spin: 0.65, r: 1.18, seg: 6, gap: 0.28, width: 2.2, color: 'accent' },
      { kind: 'poly', spin: -0.32, sides: 6, scale: 1.02, fill: 0.2, width: 2.8 },
      { kind: 'hex', spin: 0.32, cell: 0.26, rings: 1, fill: 0.18, width: 1.2, color: 'accent', alpha: 0.85 },
      { kind: 'dots', spin: -1.4, n: 6, ring: 1.14, r: 0.09, shape: 'tri', color: 'accent', glow: 1.8 },
      { kind: 'core', r: 0.62, pulse: [0.08, 1.5] },
    ],
  },
  volt: {
    artScale: 1.14, extent: 1.7, accent: '#8ff5ff', glow: 1.5,
    layers: [
      { kind: 'ring', spin: -1.1, r: 1.16, seg: 12, gap: 0.35, width: 2.4, color: 'accent' },
      { kind: 'star', spin: 0.65, points: 8, inner: 0.56, scale: 1.06, fill: 0.26, width: 2.4 },
      { kind: 'blades', spin: -0.65, n: 8, pts: [[0.68, 0.07], [1.22, 0], [0.68, -0.07]], fill: 0.75, width: 1.3, color: 'accent' },
      { kind: 'spokes', spin: 1.6, n: 8, r0: 0.32, r1: 0.94, width: 1.4, color: 'accent' },
      { kind: 'core', r: 0.68, pulse: [0.1, 2.4] },
    ],
  },
};

export const CORE_ART = CHASSIS_ART.aegis;

export const ORBITER_ART = {
  artScale: 1.4, extent: 1.85, accent: '#ffffff',
  layers: [
    { kind: 'poly', spin: 2.4, sides: 4, rot0: Q, fill: 0.5, width: 1.6 },
    { kind: 'ring', spin: -1.8, r: 1.05, seg: 3, gap: 0.4, width: 1.1, color: 'accent', alpha: 0.8 },
    { kind: 'lines', spin: 2.4, color: 'accent', width: 1, alpha: 0.7, lines: [[-0.9, 0, 0.9, 0], [0, -0.9, 0, 0.9]] },
    { kind: 'core', r: 0.42, color: 'accent', pulse: [0.2, 3] },
  ],
};