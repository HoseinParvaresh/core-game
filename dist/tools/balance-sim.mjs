/**
 * balance-sim.mjs — run the real game logic headless with simple bots and print
 * how far each kind of player gets. Use it after editing js/config.js.
 *
 *   node tools/balance-sim.mjs            # all profiles, 6 runs each
 *   node tools/balance-sim.mjs 12         # 12 runs each
 *   node tools/balance-sim.mjs 8 skilled  # one profile
 *
 *   # try values without editing config.js (comma-separated, dotted paths):
 *   SET="waves.budget.linear=4,waves.hpScale.quad=0.02" node tools/balance-sim.mjs
 *   # print every wave of a single run (HP, damage/s, upgrades):
 *   TRACE=1 node tools/balance-sim.mjs 1 skilled
 */
import { CONFIG } from '../js/config.js';
import { Game } from '../js/game.js';
import { Fx } from '../js/renderer.js';
import { Input } from '../js/input.js';
import { Storage } from '../js/storage.js';
import { Meta } from '../js/meta.js';

for (const kv of (process.env.SET || '').split(',').filter(Boolean)) {
  const [path, val] = kv.split('=');
  const keys = path.split('.');
  let o = CONFIG;
  while (keys.length > 1) o = o[keys.shift()];
  o[keys[0]] = JSON.parse(val);
}

const runs = Number(process.argv[2]) || 6;
const only = process.argv[3] || '';

const quiet = new Proxy({}, { get: (_, k) => (k === 'pulse' ? () => 0 : () => { }) });

function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const gauss = () => { let s = 0; for (let i = 0; i < 6; i++) s += Math.random(); return (s - 3) / 0.7071; };

const PROFILES = {
  novice: { err: 0.22, react: 0.85, lead: false, smart: false, duty: 0.7, cards: 'random', meta: 0 },
  average: { err: 0.10, react: 0.38, lead: true, smart: true, duty: 0.9, cards: 'smart', meta: 0 },
  skilled: { err: 0.06, react: 0.25, lead: true, smart: true, duty: 0.97, cards: 'smart', meta: 0 },
  'average+meta2': { err: 0.10, react: 0.38, lead: true, smart: true, duty: 0.9, cards: 'smart', meta: 2 },
  'skilled+meta': { err: 0.06, react: 0.25, lead: true, smart: true, duty: 0.97, cards: 'smart', meta: 5 },
  'perfect+meta': { err: 0.02, react: 0.12, lead: true, smart: true, duty: 1, cards: 'smart', meta: 5 },
};

const CARD_PRIORITY = {
  relicTwin: 8, relicTitan: 7.5, relicBurn: 7, relicChrono: 6.5,
  evoPrism: 7, evoTesla: 6.8, evoNova: 6.5, evoCryo: 6.2,
  multiShot: 5, damage: 4.5, fireRate: 4, piercing: 3.2, ricochet: 3.2,
  shield: 2.8, shockwave: 3, orbiters: 2.5, critical: 2.4, overclock: 2.4,
  chain: 2.2, blast: 2.2, execute: 2.0, vamp: 2.0, homing: 1.8,
  thorns: 1.5, projSpeed: 1.5, slowField: 1.2, scholar: 1.0, heal: 0, bonus: 0.1,
};

function pickCard(cards, mode, game) {
  if (mode === 'random') return (Math.random() * cards.length) | 0;
  let best = 0, bs = -1;
  cards.forEach((c, i) => {
    let s = (CARD_PRIORITY[c.id] ?? 1) * (c.gain || 1);
    if (c.id === 'heal') s = game.core.hp < game.core.stats.maxHp ? 6 : 0.5;
    if (s > bs) { bs = s; best = i; }
  });
  return best;
}

function simulate(profile, seed, maxWave) {
  const rng = mulberry32(seed);
  const realRandom = Math.random;
  const origWaves = CONFIG.worlds[0].tiers[0].waves;
  CONFIG.worlds[0].tiers[0].waves = maxWave;
  Math.random = rng;
  try {
    const store = new Storage('sim');
    store.data = new Storage('sim').data;
    for (const id of Object.keys(store.data.meta)) {
      const cap = CONFIG.meta[id]?.max ?? CONFIG.meta.maxLevel;
      store.data.meta[id] = id === 'coreAwaken' ? 1 : Math.min(cap, profile.meta);
    }
    const meta = new Meta(store);
    const input = new Input(null, { cx: 0, cy: 0, scale: 1 });
    const game = new Game({ audio: quiet, haptics: quiet, fx: new Fx(), input, store, meta });
    game.on('cards', (cards) => game.pickCard(pickCard(cards, profile.cards, game)));
    let summary = null;
    game.on('over', (s) => { summary = s; });
    if (process.env.TRACE) {
      game.on('wave', (w) => {
        const c = game.core, st = c.stats;
        console.log(`  w${String(w.wave).padStart(2)} t=${game.time.toFixed(0).padStart(4)}s hp=${c.hp}/${st.maxHp} dps=${(st.fireRate * st.projectiles * st.damage).toFixed(1)} fr=${st.fireRate.toFixed(1)} dmg=${st.damage.toFixed(1)} n=${st.projectiles} pierce=${st.pierce} kills=${game.kills} hpScale=${game.waveScale.hp.toFixed(2)} alive=${game.enemies.alive} lv=${JSON.stringify(c.levels)}`);
      });
    }

    game.startRun();
    let retarget = 0, target = null, err = 0, steps = 0, maxAlive = 0;
    const DT = 1 / 60, t0 = process.hrtime.bigint();
    while (!summary && steps < 60 * 60 * 40) {
      if (game.state === 'play') {
        retarget -= DT;
        if (retarget <= 0 || !target || target.dead) {
          retarget = profile.react * (0.7 + Math.random() * 0.6);
          err = gauss() * profile.err;
          target = null;
          let best = 1e9;
          for (const e of game.enemies.pool.items) {
            if (e.dead) continue;
            const d = Math.hypot(e.x, e.y);
            const score = profile.smart ? (d - 30) / (e.speed + 1) : d;
            if (score < best) { best = score; target = e; }
          }
        }
        if (target && !target.dead) {
          const lead = profile.lead ? Math.hypot(target.x, target.y) / (CONFIG.core.projectileSpeed * game.core.stats.projSpeed) : 0;
          const px = target.x + target.vx * lead, py = target.y + target.vy * lead;
          const a = Math.atan2(py, px) + err;
          input.aimX = Math.cos(a) * 300; input.aimY = Math.sin(a) * 300; input.hasAim = true;
          input.firing = Math.sin(game.time * 2.1) < (profile.duty - 0.5) * 2;
        } else input.firing = false;
      }
      game.step(DT);
      steps++;
      if (game.enemies.alive > maxAlive) maxAlive = game.enemies.alive;
      if (game.state === 'play' && game.wave >= maxWave && !game.dying) {
        summary = game.finalizeRun() || { wave: game.wave, score: game.score, kills: game.kills, shards: 0, capped: true };
        summary.wave = game.wave;
        summary.capped = true;
      }
    }
    const ms = Number(process.hrtime.bigint() - t0) / 1e6;
    const pooled = (pool) => pool.items.length + pool.free.length;
    return {
      ...summary, maxAlive, simSeconds: steps / 60, msPerStep: ms / Math.max(1, steps),
      pools: [pooled(game.enemies.pool), pooled(game.projectiles.pool), pooled(game.fx.parts)].join('/'),
    };
  } finally {
    Math.random = realRandom;
    CONFIG.worlds[0].tiers[0].waves = origWaves;
  }
}

const median = (a) => { const s = [...a].sort((x, y) => x - y); return s[(s.length / 2) | 0]; };
const avg = (a) => a.reduce((x, y) => x + y, 0) / a.length;

console.log(`CORE balance sim — ${runs} runs per profile\n`);
console.log('profile           waves (min/med/max)   avg score   avg shards   peak enemies   ms/step   pool objects (enemy/shot/particle)');
for (const [name, p] of Object.entries(PROFILES)) {
  if (only && name !== only) continue;
  const res = [];
  for (let i = 0; i < runs; i++) res.push(simulate(p, 1000 + i * 7919, 60));
  const waves = res.map((r) => r.wave);
  console.log(
    name.padEnd(17),
    `${Math.min(...waves)}/${median(waves)}/${Math.max(...waves)}`.padEnd(22),
    String(Math.round(avg(res.map((r) => r.score)))).padEnd(11),
    String(Math.round(avg(res.map((r) => r.shards || 0)))).padEnd(12),
    String(Math.max(...res.map((r) => r.maxAlive))).padEnd(14),
    avg(res.map((r) => r.msPerStep)).toFixed(3).padEnd(9),
    res[res.length - 1].pools,
  );
}
console.log('\nTargets: novice → wave 5-8 · skilled with permanent upgrades → wave 30+');