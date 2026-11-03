/**
 * main.js — boots CORE with 6-World Campaign + Endless Mode browsing,
 * Interactive 33-Node Pannable/Zoomable Skill Tree (with Capstones & Bridges),
 * Core Armory (Awakened Chassis + 18 Upgradable Boss Runes),
 * Dedicated Tabbed 5-Category Shop Screen, and Minimal Pause.
 */
import { CONFIG } from './config.js';
import { Storage } from './storage.js';
import { Meta, META_DEFS, META_BY_ID } from './meta.js';
import { AudioEngine, Haptics } from './audio.js';
import { Fx, Renderer, easeOutCubic } from './renderer.js';
import { CHASSIS_ART, CHASSIS_AWAKENED_ART } from './art.js';
import { buildSet, drawSet, rgba } from './sprites.js';
import { Input } from './input.js';
import { Game } from './game.js';

const $ = (s, r = document) => r.querySelector(s);
const fmt = (n) => Math.round(n).toLocaleString('en-US');

const SHARD_SVG = `<svg class="shard-svg" viewBox="0 0 24 24" aria-hidden="true"><polygon class="f" points="12 2 19 9 12 22 5 9"/><polygon points="12 2 19 9 12 22 5 9"/><polyline points="5 9 12 12 19 9"/><line x1="12" y1="2" x2="12" y2="22"/><polyline points="8.5 5.5 12 9 15.5 5.5"/></svg>`;

/* ───────────────────────── boot ───────────────────────── */

const store = new Storage();
const settings = store.data.settings;
const meta = new Meta(store);
const audio = new AudioEngine(settings);
const haptics = new Haptics(settings);
const fx = new Fx();
const canvas = $('#game');
const renderer = new Renderer(canvas, fx);
const input = new Input(canvas, renderer);
input.attach();
const game = new Game({ audio, fx, input, haptics, store, meta, renderer });

const params = new URLSearchParams(location.search);
if (params.has('debug')) window.__core = { game, store, meta, audio, fx, renderer, input, CONFIG };

/* ───────────────────────── DOM handles ───────────────────────── */

const body = document.body;
const screens = {};
document.querySelectorAll('.screen').forEach((s) => { screens[s.id.replace('screen-', '')] = s; });
const FULL = Object.keys(screens).filter((k) => screens[k].classList.contains('full'));
const el = {
  hudWave: $('#hud-wave'),
  hudScore: $('#hud-score'),
  hudCombo: $('#hud-combo'),
  hudMult: $('#hud-mult'),
  hudBar: $('#hud-combo-bar'),
  banner: $('#banner'),
  bannerMain: $('#banner .banner-main'),
  bannerSub: $('#banner .banner-sub'),
  toast: $('#toast'),
  toastTitle: $('#toast .toast-title'),
  toastSub: $('#toast .toast-sub'),
  worldCode: $('#menu-world-code'),
  worldName: $('#menu-world-name'),
  worldSub: $('#menu-world-sub'),
  worldPrev: $('#btn-world-prev'),
  worldNext: $('#btn-world-next'),
  tierTabs: [...document.querySelectorAll('.tier-tab')],
  tierMeta: $('#menu-tier-meta'),
  unlockAllMenuBtn: $('#btn-unlock-all-menu'),
  playBtn: $('#btn-play'),
  cardsList: $('#cards-list'),
  rerollBtn: $('#btn-reroll'),
  rerollCount: $('#reroll-count'),
  upShards: $('#up-shards'),
  freeShardsBtn: $('#btn-free-shards'),
  unlockAllUpBtn: $('#btn-unlock-all-up'),
  upTabs: [...document.querySelectorAll('.up-tab')],
  upTreeView: $('#up-tree-view'),
  upArmoryView: $('#up-armory-view'),
  treeViewport: $('#tree-viewport'),
  treeBoard: $('#tree-board'),
  treeLines: $('#tree-lines'),
  treeNodes: $('#tree-nodes'),
  zoomInBtn: $('#btn-zoom-in'),
  zoomOutBtn: $('#btn-zoom-out'),
  zoomResetBtn: $('#btn-zoom-reset'),
  inspIco: $('#insp-ico'),
  inspName: $('#insp-name'),
  inspLv: $('#insp-lv'),
  inspDesc: $('#insp-desc'),
  inspPips: $('#insp-pips'),
  buyNodeBtn: $('#btn-buy-node'),
  armoryList: $('#armory-list'),
  runesEquippedCount: $('#runes-equipped-count'),
  runesList: $('#runes-list'),
  shopShards: $('#shop-shards'),
  freeShardsShopBtn: $('#btn-free-shards-shop'),
  shopTabs: [...document.querySelectorAll('.shop-tab')],
  shopPanes: [...document.querySelectorAll('.shop-pane')],
  shopScroll: $('#shop-scroll'),
  boostersList: $('#boosters-list'),
  bulletSkinsList: $('#bullet-skins-list'),
  killEffectsList: $('#kill-effects-list'),
  coreAurasList: $('#core-auras-list'),
  shockStylesList: $('#shock-styles-list'),
  statsList: $('#stats-list'),
  achList: $('#ach-list'),
  overBannerTxt: $('#over-banner-txt'),
  overUnlock: $('#over-unlock'),
  overScore: $('#over-score'),
  overWave: $('#over-wave'),
  overKills: $('#over-kills'),
  overShards: $('#over-shards'),
  overBest: $('#over-best'),
  dialog: $('#dialog-reset'),
};

function replay(node, cls) {
  if (!node) return;
  node.classList.remove(cls);
  void node.offsetWidth;
  node.classList.add(cls);
}

function countUp(node, to, ms, format = fmt) {
  const token = (node._cu = (node._cu || 0) + 1);
  const t0 = performance.now();
  const tick = (now) => {
    if (node._cu !== token) return;
    const k = Math.min(1, (now - t0) / ms);
    node.textContent = format(to * easeOutCubic(k));
    if (k < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* ───────────────────────── wordmark ───────────────────────── */

const WORDMARK = `<svg class="wm" viewBox="8 8 274 84" role="img" aria-label="Core">
  <g fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
    <path pathLength="1" d="M58.4 31.6A26 26 0 1 0 58.4 68.4"/>
    <circle class="wm-o" pathLength="1" cx="118" cy="50" r="26"/>
    <path pathLength="1" d="M176 76V24H194A14 14 0 0 1 194 52H176M192 52L210 76"/>
    <path pathLength="1" d="M273 24H241V76H273M241 50H267"/>
  </g>
  <circle class="wm-dot" cx="118" cy="50" r="9"/>
</svg>`;
document.querySelectorAll('[data-wordmark]').forEach((n) => { n.innerHTML = WORDMARK; });

/* ───────────────────────── screens & 6-World Campaign Menu ───────────────────────── */

let returnTo = 'menu';

function applyCssWorldTheme(wDef) {
  if (!wDef) return;
  const root = document.documentElement;
  root.style.setProperty('--core', wDef.color);
  root.style.setProperty('--line', rgba(wDef.color, 0.34));
  root.style.setProperty('--faint', rgba(wDef.color, 0.13));
}

function show(name) {
  for (const k of FULL) screens[k].classList.toggle('active', k === name);
  body.dataset.screen = name || 'game';
  if (name === 'menu') refreshMenu();
}

function refreshMenu() {
  const wIdx = game.worldIdx;
  const tIdx = game.tierIdx;
  const wDef = game.worldDef;
  const tDef = game.tierDef;
  const worldUnlocked = game.isWorldUnlocked(wIdx);

  applyCssWorldTheme(wDef);

  if (el.worldCode) el.worldCode.textContent = wDef.code;
  if (el.worldName) el.worldName.textContent = wDef.name;
  if (el.worldSub) el.worldSub.textContent = wDef.mechanicDesc || wDef.subtitle;

  if (el.worldPrev) el.worldPrev.disabled = wIdx <= 0;
  if (el.worldNext) el.worldNext.disabled = wIdx >= CONFIG.worlds.length - 1;

  el.tierTabs.forEach((btn, idx) => {
    const tier = wDef.tiers[idx];
    if (!tier) return;
    const unlocked = game.isTierUnlocked(wIdx, idx);
    const active = idx === tIdx;

    btn.classList.toggle('active', active);
    btn.classList.toggle('locked', !unlocked);
    btn.disabled = !unlocked;
    btn.setAttribute('aria-selected', String(active));

    const nameSpan = btn.querySelector('.t-name');
    const wavesSpan = btn.querySelector('.t-waves');
    if (nameSpan) nameSpan.textContent = tier.name;
    if (wavesSpan) wavesSpan.textContent = tier.endless ? '∞ Waves' : `${tier.waves} Waves`;
  });

  const activeTierUnlocked = game.isTierUnlocked(wIdx, tIdx);
  if (el.tierMeta) {
    if (!worldUnlocked) {
      const prevW = CONFIG.worlds[wIdx - 1];
      el.tierMeta.textContent = `Complete ${prevW ? prevW.name : 'previous World'} on Hard to unlock`;
    } else if (tDef.endless) {
      const bestEnd = store.data.stats.endlessBestWave || 0;
      el.tierMeta.textContent = `Boss every 5 Waves · Hybrid Arena · Best: Wave ${bestEnd}`;
    } else {
      const bossList = tDef.bossWaves.map((w) => `W${w}`).join(', ');
      el.tierMeta.textContent = `Boss: ${bossList} · Clear Bonus: +${tDef.clearBonus} Shards`;
    }
  }

  if (el.playBtn) {
    el.playBtn.disabled = !activeTierUnlocked;
    el.playBtn.textContent = activeTierUnlocked ? 'Play' : 'Locked';
  }
}

el.worldPrev?.addEventListener('click', () => {
  if (game.setWorld(game.worldIdx - 1)) refreshMenu();
});

el.worldNext?.addEventListener('click', () => {
  if (game.setWorld(game.worldIdx + 1)) refreshMenu();
});

el.tierTabs.forEach((btn) => {
  btn.addEventListener('click', () => {
    const idx = Number(btn.dataset.tier);
    if (game.setTier(idx)) refreshMenu();
  });
});

function openSub(name, from) {
  returnTo = from;
  if (name === 'upgrades') {
    renderUpgrades();
    if (activeUpTab === 'tree') requestAnimationFrame(() => centerSkillTree(false));
    else startArmoryAnim();
  }
  if (name === 'shop') renderShop();
  if (name === 'stats') renderStats();
  if (name === 'settings') renderSettings();
  show(name);
}

document.querySelectorAll('[data-back]').forEach((b) => b.addEventListener('click', () => show(returnTo)));

document.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (b && !b.dataset.nosfx && !b.classList.contains('buy')) audio.click();
});

/* ───────────────────────── splash ───────────────────────── */

let splashDone = false;
function endSplash() {
  if (splashDone) return;
  splashDone = true;
  audio.unlock();
  show('menu');
}
show('splash');
setTimeout(endSplash, 1350);
screens.splash.addEventListener('pointerdown', endSplash);

/* ───────────────────────── HUD ───────────────────────── */

const shown = { score: -1, wave: -1, bar: -1 };
let dispScore = 0;

game.onFrame = () => {
  if (game.state === 'menu') return;

  const target = game.score;
  if (dispScore !== target) {
    dispScore = target < dispScore
      ? target
      : Math.min(target, dispScore + Math.max(1, Math.ceil((target - dispScore) * 0.3)));
  }
  if (dispScore !== shown.score) {
    el.hudScore.textContent = fmt(dispScore);
    shown.score = dispScore;
  }
  if (game.wave !== shown.wave) {
    el.hudWave.textContent = String(game.wave);
    shown.wave = game.wave;
  }

  if (game.state === 'play') {
    const bar = Math.round(game.comboTimeLeft() * 40);
    if (bar !== shown.bar) {
      el.hudBar.style.transform = `scaleX(${bar / 40})`;
      shown.bar = bar;
    }
  }
};

function syncCombo(m, pop) {
  el.hudCombo.dataset.m = m;
  el.hudMult.textContent = m;
  if (pop && m > 1) replay(el.hudCombo, 'pop');
}

function banner(main, sub, kind) {
  el.bannerMain.textContent = main;
  el.bannerSub.textContent = sub || '';
  el.banner.dataset.kind = kind || 'wave';
  replay(el.banner, 'show');
}

function toast(title, sub = '', kind = 'info') {
  if (el.toastTitle && el.toastSub) {
    el.toastTitle.textContent = title;
    el.toastSub.textContent = sub || '';
  } else {
    el.toast.textContent = sub ? `${title} · ${sub}` : title;
  }
  el.toast.dataset.kind = kind || 'info';
  replay(el.toast, 'show');
}

/* ───────────────────────── upgrade cards ───────────────────────── */

let picking = false;
let cardTimers = [];
const RARITY_NAME = {
  common: 'Common',
  rare: 'Rare',
  epic: 'Epic',
  mythic: 'Mythic',
  corrupted: 'Corrupted',
};

function clearCardTimers() {
  cardTimers.forEach(clearTimeout);
  cardTimers = [];
  picking = false;
}

function buildCards(cards) {
  clearCardTimers();
  const list = el.cardsList;
  list.innerHTML = '';
  list.dataset.n = cards.length;
  screens.cards.classList.remove('picked');
  list.classList.add('locked');
  cardTimers.push(setTimeout(() => list.classList.remove('locked'), 600));

  if (el.rerollBtn && el.rerollCount) {
    el.rerollCount.textContent = game.rerollsLeft;
    el.rerollBtn.disabled = game.rerollsLeft <= 0;
  }

  cards.forEach((c, i) => {
    const b = document.createElement('button');
    b.className = `card r-${c.rarity}`;
    b.dataset.nosfx = '1';
    b.style.setProperty('--i', i);
    const rarityLabel = c.isRelic
      ? 'Boss Relic'
      : c.isCorrupted
        ? 'Corrupted'
        : (RARITY_NAME[c.rarity] || 'Common');
    b.innerHTML =
      `<svg class="card-wm" viewBox="0 0 24 24" aria-hidden="true">${c.icon}</svg>` +
      `<span class="card-ico"><svg viewBox="0 0 24 24" aria-hidden="true">${c.icon}</svg></span>` +
      `<span class="card-body"><span class="card-name">${c.name}</span><span class="card-desc">${c.text}</span></span>` +
      `<span class="card-meta"><span class="card-rarity">${rarityLabel}</span>` +
      `<span class="card-lv">${c.levelLabel}${c.nextLabel ? ` → ${c.nextLabel}` : ''}</span></span>`;
    b.addEventListener('click', () => chooseCard(i, b));
    list.appendChild(b);
  });
  screens.cards.classList.add('active');
}

function chooseCard(i, btn) {
  if (picking) return;
  picking = true;
  audio.click();
  haptics.buzz(15);
  [...el.cardsList.children].forEach((c) => { if (c !== btn) c.classList.add('gone'); });
  btn.classList.add('chosen');
  screens.cards.classList.add('picked');
  cardTimers.push(setTimeout(() => {
    const r = btn.getBoundingClientRect();
    btn.style.setProperty('--dx', `${window.innerWidth / 2 - (r.left + r.width / 2)}px`);
    btn.style.setProperty('--dy', `${window.innerHeight / 2 - (r.top + r.height / 2)}px`);
    btn.classList.add('fly');
  }, 240));
  cardTimers.push(setTimeout(() => {
    game.pickCard(i);
    screens.cards.classList.remove('active');
    picking = false;
  }, 760));
}

/* ───────────────────────── game events ───────────────────────── */

game.on('state', (s) => {
  body.dataset.state = s;
  screens.pause.classList.toggle('active', s === 'paused');
  if (s === 'paused' && picking) {
    clearCardTimers();
    if (game.pendingCards) buildCards(game.pendingCards);
  }
  if (s === 'menu') { clearCardTimers(); screens.cards.classList.remove('active'); show('menu'); }
  else if (s === 'play') { clearCardTimers(); screens.cards.classList.remove('active'); show(null); }
  else if (s === 'cards') show(null);
  else if (s === 'over') { clearCardTimers(); screens.cards.classList.remove('active'); show(null); }
  if (s === 'play' && game.time === 0) {
    applyCssWorldTheme(game.worldDef);
    syncCombo(1, false);
    shown.bar = -1;
    shown.wave = -1;
  }
});

game.on('wave', ({ wave, boss, bossName }) => {
  banner(`Wave ${wave}`, bossName || '', boss ? 'boss' : 'wave');
});
game.on('banner', (b) => toast(b.text, b.sub || '', b.kind));
game.on('combo', (m) => syncCombo(m, true));
game.on('cards', buildCards);

game.on('over', (s) => {
  const showBanner = !!(s.victory || (s.newScore && s.score > 0));
  screens.over.classList.toggle('has-record', showBanner);
  if (el.overBannerTxt) {
    el.overBannerTxt.textContent = s.victory
      ? `${s.worldName.toUpperCase()} · ${s.tierName.toUpperCase()} CLEARED!`
      : 'NEW RECORD';
  }
  if (el.overUnlock) {
    el.overUnlock.textContent = s.unlockedNextLabel || '';
  }
  el.overBest.textContent = fmt(s.bestScore);
  el.overWave.textContent = String(s.wave);
  el.overWave.classList.toggle('gold', !!(s.victory || s.newWave));
  el.overKills.textContent = fmt(s.kills);
  countUp(el.overScore, s.score, 1000);
  countUp(el.overShards, s.shards, 900, (v) => `+${fmt(v)}`);
  show('over');
});

/* ───────────────────────── main, shop, test & pause buttons ───────────────────────── */

el.playBtn.addEventListener('click', () => {
  if (game.state === 'menu') game.startRun();
});

$('#btn-upgrades').addEventListener('click', () => openSub('upgrades', 'menu'));
$('#btn-shop').addEventListener('click', () => openSub('shop', 'menu'));
$('#btn-stats').addEventListener('click', () => openSub('stats', 'menu'));
$('#btn-settings').addEventListener('click', () => openSub('settings', 'menu'));

$('#btn-pause').addEventListener('click', () => game.pause());
$('#btn-resume').addEventListener('click', () => game.resume());
$('#btn-quit').addEventListener('click', () => {
  const s = game.quitToMenu();
  if (s && s.shards > 0) toast('Run Banked', `+${fmt(s.shards)} Shards`, 'perfect');
});

$('#btn-again').addEventListener('click', () => {
  if (game.state === 'over') game.startRun();
});
$('#btn-over-upgrades').addEventListener('click', () => openSub('upgrades', 'over'));
$('#btn-over-menu').addEventListener('click', () => { if (game.state === 'over') game.toMenu(); });

el.rerollBtn?.addEventListener('click', () => {
  if (!picking) game.rerollCards();
});

function handleAddFreeShards() {
  game.addFreeShards(1000);
  audio.buy();
  haptics.buzz(20);
  renderUpgrades();
  renderShop();
  toast('+1,000 Shards', 'Added to wallet', 'perfect');
}

el.freeShardsBtn?.addEventListener('click', handleAddFreeShards);
el.freeShardsShopBtn?.addEventListener('click', handleAddFreeShards);

function unlockAllStages() {
  store.data.campaignProgress = CONFIG.worlds.length * 3 - 1;
  for (const r of (CONFIG.runes || [])) {
    store.data.unlockedRunes[r.id] = 1;
  }
  store.save();
  audio.buy();
  haptics.buzz(25);
  refreshMenu();
  renderUpgrades();
  toast('All 6 Worlds & Runes Unlocked', 'All Stages, Endless & 18 Runes open', 'record');
}

el.unlockAllMenuBtn?.addEventListener('click', unlockAllStages);
el.unlockAllUpBtn?.addEventListener('click', unlockAllStages);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
    if (el.dialog.classList.contains('active')) el.dialog.classList.remove('active');
    else if (game.state === 'paused') game.resume();
    else game.pause();
  }
});

/* ───────────────────────── Upgrades: Interactive 33-Node Skill Tree & Core Armory ───────────────────────── */

let activeUpTab = 'tree';
let selectedNodeId = 'damage';
const treeCam = { x: 0, y: 0, scale: 0.72, initialized: false };

el.upTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    activeUpTab = tab.dataset.upTab;
    el.upTabs.forEach((t) => {
      const on = t === tab;
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', String(on));
    });
    el.upTreeView?.classList.toggle('active', activeUpTab === 'tree');
    el.upArmoryView?.classList.toggle('active', activeUpTab === 'armory');
    if (activeUpTab === 'tree') {
      renderSkillTree();
      requestAnimationFrame(() => centerSkillTree(false));
    } else {
      renderArmory();
      startArmoryAnim();
    }
  });
});

function applyTreeTransform() {
  if (!el.treeBoard) return;
  el.treeBoard.style.transform = `translate(${treeCam.x}px, ${treeCam.y}px) scale(${treeCam.scale})`;
}

function centerSkillTree(forceReset = true) {
  if (!el.treeViewport) return;
  if (treeCam.initialized && !forceReset) {
    applyTreeTransform();
    return;
  }
  const rect = el.treeViewport.getBoundingClientRect();
  const vw = rect.width || 340, vh = rect.height || 380;
  treeCam.scale = Math.max(0.48, Math.min(0.84, Math.min(vw / 860, vh / 700)));
  treeCam.x = vw / 2 - 600 * treeCam.scale;
  treeCam.y = vh / 2 - 450 * treeCam.scale;
  treeCam.initialized = true;
  applyTreeTransform();
}

function zoomTreeBy(factor, cx = null, cy = null) {
  if (!el.treeViewport) return;
  const rect = el.treeViewport.getBoundingClientRect();
  const px = cx ?? rect.width / 2;
  const py = cy ?? rect.height / 2;
  const oldScale = treeCam.scale;
  const nextScale = Math.max(0.38, Math.min(1.45, oldScale * factor));
  if (nextScale === oldScale) return;
  const wx = (px - treeCam.x) / oldScale;
  const wy = (py - treeCam.y) / oldScale;
  treeCam.scale = nextScale;
  treeCam.x = px - wx * nextScale;
  treeCam.y = py - wy * nextScale;
  applyTreeTransform();
}

el.zoomInBtn?.addEventListener('click', () => zoomTreeBy(1.2));
el.zoomOutBtn?.addEventListener('click', () => zoomTreeBy(1 / 1.2));
el.zoomResetBtn?.addEventListener('click', () => centerSkillTree(true));

(() => {
  const vp = el.treeViewport;
  if (!vp) return;
  const pointers = new Map();
  let startX = 0, startY = 0, camStartX = 0, camStartY = 0;
  let moved = false;
  let captured = false;
  let downNode = null;
  let lastPinchDist = 0;

  vp.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.zoom-btn')) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 1) {
      startX = e.clientX;
      startY = e.clientY;
      camStartX = treeCam.x;
      camStartY = treeCam.y;
      moved = false;
      captured = false;
      downNode = e.target.closest('.tree-node');
    } else if (pointers.size === 2) {
      moved = true;
      const pts = [...pointers.values()];
      lastPinchDist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
    }
  });

  vp.addEventListener('pointermove', (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.size === 1) {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.hypot(dx, dy) > 8) {
        moved = true;
        if (!captured) {
          captured = true;
          try { vp.setPointerCapture(e.pointerId); } catch { /* ignore */ }
        }
      }
      if (moved) {
        treeCam.x = camStartX + dx;
        treeCam.y = camStartY + dy;
        applyTreeTransform();
      }
    } else if (pointers.size === 2) {
      moved = true;
      const pts = [...pointers.values()];
      const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
      if (lastPinchDist > 10 && dist > 10) {
        const rect = vp.getBoundingClientRect();
        const midX = (pts[0].x + pts[1].x) / 2 - rect.left;
        const midY = (pts[0].y + pts[1].y) / 2 - rect.top;
        zoomTreeBy(dist / lastPinchDist, midX, midY);
      }
      lastPinchDist = dist;
    }
  });

  const endPtr = (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.delete(e.pointerId);
    if (!moved && pointers.size === 0) {
      const nodeBtn =
        downNode ||
        e.target.closest?.('.tree-node') ||
        document.elementFromPoint(e.clientX, e.clientY)?.closest('.tree-node');
      if (nodeBtn && nodeBtn.dataset.id) {
        selectedNodeId = nodeBtn.dataset.id;
        renderSkillTree();
        audio.click();
      }
    }
    downNode = null;
    if (pointers.size === 1) {
      const remaining = [...pointers.values()][0];
      startX = remaining.x;
      startY = remaining.y;
      camStartX = treeCam.x;
      camStartY = treeCam.y;
    }
  };
  vp.addEventListener('pointerup', endPtr);
  vp.addEventListener('pointercancel', endPtr);

  vp.addEventListener('wheel', (e) => {
    e.preventDefault();
    const rect = vp.getBoundingClientRect();
    const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    zoomTreeBy(factor, e.clientX - rect.left, e.clientY - rect.top);
  }, { passive: false });
})();

function renderSkillTree() {
  if (!el.treeLines || !el.treeNodes) return;

  const edges = [];
  for (const d of META_DEFS) {
    const parentIds = Array.isArray(d.parents) ? d.parents : (d.parent ? [d.parent] : []);
    for (const pId of parentIds) {
      const p = META_BY_ID[pId];
      if (!p) continue;
      const unlocked = meta.isUnlocked(d.id);
      const active = meta.level(d.id) > 0;
      const cls = active ? 'tree-edge active' : unlocked ? 'tree-edge unlocked' : 'tree-edge';
      edges.push(
        `<line class="${cls}" x1="${p.x}" y1="${p.y}" x2="${d.x}" y2="${d.y}" style="color:${d.color};${active ? `stroke:${d.color}` : ''}"/>`
      );
    }
  }
  el.treeLines.innerHTML = edges.join('');

  el.treeNodes.innerHTML = META_DEFS.map((d) => {
    const lv = meta.level(d.id);
    const max = meta.maxLevelOf(d.id);
    const unlocked = meta.isUnlocked(d.id);
    const isRoot = d.id === 'coreAwaken';
    const isSel = d.id === selectedNodeId;
    const cls = [
      'tree-node',
      isRoot ? 'root' : '',
      d.capstone ? 'capstone' : '',
      d.bridge ? 'bridge' : '',
      !unlocked ? 'locked' : '',
      lv > 0 ? 'invested' : '',
      lv >= max ? 'maxed' : '',
      isSel ? 'selected' : '',
    ].filter(Boolean).join(' ');

    const lvLabel = isRoot ? 'CORE' : `${lv}/${max}`;
    return `<button class="${cls}" data-id="${d.id}" data-nosfx="1" style="left:${d.x}px;top:${d.y}px;--nc:${d.color}">
      <svg viewBox="0 0 24 24" aria-hidden="true">${d.icon}</svg>
      <span class="n-lv">${lvLabel}</span>
    </button>`;
  }).join('');

  renderNodeInspector();
}

function renderNodeInspector() {
  const d = META_BY_ID[selectedNodeId] || META_DEFS[0];
  const lv = meta.level(d.id);
  const max = meta.maxLevelOf(d.id);
  const unlocked = meta.isUnlocked(d.id);
  const cost = meta.cost(d.id);

  if (el.inspIco) {
    el.inspIco.style.borderColor = d.color;
    el.inspIco.style.color = d.color;
    el.inspIco.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${d.icon}</svg>`;
  }
  if (el.inspName) el.inspName.textContent = d.name;
  if (el.inspLv) {
    el.inspLv.style.color = d.color;
    el.inspLv.textContent = d.id === 'coreAwaken' ? 'ONLINE' : `Lv ${lv} / ${max}`;
  }
  if (el.inspDesc) {
    if (!unlocked) {
      const parentIds = Array.isArray(d.parents) ? d.parents : (d.parent ? [d.parent] : []);
      const pNames = parentIds.map((pId) => META_BY_ID[pId]?.name || pId).join(' & ');
      el.inspDesc.textContent = `Requires ${pNames} Lv ${d.reqLv || 1} to unlock.`;
    } else if (lv >= max) {
      el.inspDesc.textContent = d.now(lv);
    } else {
      el.inspDesc.textContent = `${d.now(lv)} → Next: ${d.now(lv + 1)}`;
    }
  }
  if (el.inspPips) {
    el.inspPips.innerHTML = d.id === 'coreAwaken'
      ? ''
      : Array.from({ length: max }, (_, i) => `<i class="${i < lv ? 'on' : ''}" style="${i < lv ? `background:${d.color};box-shadow:0 0 6px ${d.color}` : ''}"></i>`).join('');
  }

  if (el.buyNodeBtn) {
    if (lv >= max) {
      el.buyNodeBtn.className = 'buy maxed';
      el.buyNodeBtn.disabled = true;
      el.buyNodeBtn.innerHTML = 'Maxed';
    } else if (!unlocked) {
      el.buyNodeBtn.className = 'buy poor';
      el.buyNodeBtn.disabled = true;
      el.buyNodeBtn.innerHTML = 'Locked';
    } else {
      const can = meta.canBuy(d.id);
      el.buyNodeBtn.className = `buy ${can ? '' : 'poor'}`;
      el.buyNodeBtn.disabled = false;
      el.buyNodeBtn.innerHTML = `${SHARD_SVG}${fmt(cost)}`;
    }
  }
}

el.buyNodeBtn?.addEventListener('click', () => {
  if (meta.buy(selectedNodeId)) {
    audio.buy();
    haptics.buzz(20);
    game.refreshCoreLoadout();
    if (meta.totalUpgradesBought() >= 10) game.unlockAchievement('tree10');
    renderUpgrades();
  } else {
    replay(el.buyNodeBtn, 'nope');
    audio.hit();
  }
});

/* ───────────────────────── Core Armory (Chassis + Rune Mastering) ───────────────────────── */

let armoryPreviews = [];
let armoryRaf = 0;

function renderArmory() {
  if (!el.armoryList) return;
  el.armoryList.innerHTML = '';
  armoryPreviews = [];
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const size = Math.round(74 * dpr);
  const maxLv = CONFIG.chassisMaxLevel || 5;

  CONFIG.chassis.forEach((ch, idx) => {
    const unlocked = game.isChassisUnlocked(idx);
    const equipped = game.chassisIdx === idx;
    const lv = game.getChassisLevel(idx);
    const awakened = unlocked && lv >= maxLv;
    const upCost = game.getChassisUpgradeCost(idx);
    const canUp = game.canUpgradeChassis(idx);

    const art = awakened
      ? (CHASSIS_AWAKENED_ART[ch.id] || CHASSIS_ART[ch.id] || CHASSIS_ART.aegis)
      : (CHASSIS_ART[ch.id] || CHASSIS_ART.aegis);
    const R = CONFIG.core.radius * (art.artScale ?? 1.05);
    const half = Math.ceil(R * (art.extent ?? 1.55) + 12);
    const S = (size / (2 * half)) * 1.2;

    const row = document.createElement('div');
    row.className = `armory-card${equipped ? ' equipped' : ''}${awakened ? ' awakened' : ''}`;
    const cv = document.createElement('canvas');
    cv.className = 'armory-cv';
    cv.width = cv.height = size;

    const pips = unlocked
      ? `<div class="pips">${Array.from({ length: maxLv }, (_, i) => `<i class="${i < lv ? 'on' : ''}" style="${i < lv ? `background:${awakened ? '#ffd23d' : ch.color}` : ''}"></i>`).join('')}</div>`
      : '';

    let actionsHtml = '';
    if (!unlocked) {
      const canUnlock = store.data.shards >= ch.cost;
      actionsHtml = `<div class="armory-actions">
        <button class="buy ${canUnlock ? '' : 'poor'}" data-unlock="${idx}">${SHARD_SVG}${fmt(ch.cost)}</button>
      </div>`;
    } else {
      const equipBtn = equipped
        ? '<button class="buy equipped-btn" disabled>Active</button>'
        : `<button class="buy" data-equip="${idx}">Equip</button>`;
      const upBtn = lv >= maxLv
        ? '<button class="buy maxed" disabled>★ Max</button>'
        : `<button class="buy ${canUp ? '' : 'poor'}" data-upgrade="${idx}">Lv ${lv + 1} · ${SHARD_SVG}${fmt(upCost)}</button>`;
      actionsHtml = `<div class="armory-actions">${equipBtn}${upBtn}</div>`;
    }

    const dispName = awakened ? (ch.awakenedName || ch.name) : ch.name;
    const lvBadge = unlocked
      ? `<span class="ch-lv-badge ${awakened ? 'awk' : ''}">${awakened ? '★ AWAKENED' : `Lv ${lv}/${maxLv}`}</span>`
      : '<span class="ch-lv-badge">Locked</span>';

    row.append(cv);
    row.insertAdjacentHTML('beforeend', `
      <div class="armory-body">
        <div class="armory-title-row">
          <b style="color:${awakened ? '#ffd23d' : ch.color}">${dispName}</b>
          ${lvBadge}
        </div>
        <span>${ch.desc}</span>
        ${ch.awakenedDesc ? `<span class="armory-awk-desc">${ch.awakenedDesc}</span>` : ''}
        ${pips}
      </div>
      ${actionsHtml}
    `);
    el.armoryList.append(row);

    armoryPreviews.push({
      ctx: cv.getContext('2d'),
      set: buildSet(art, ch.color, CONFIG.core.radius, S, `armory_${ch.id}_${awakened ? 5 : 1}`),
      S,
      size,
      phase: idx * 1.4,
    });
  });

  renderBossRunes();
}

function renderBossRunes() {
  if (!el.runesList) return;
  const eq = game.equippedRunes;
  const cap = game.maxEquippedRunes;
  const maxLv = CONFIG.runeMaxLevel || 3;
  if (el.runesEquippedCount) {
    el.runesEquippedCount.textContent = `Equipped: ${eq.length} / ${cap}`;
  }

  el.runesList.innerHTML = (CONFIG.runes || []).map((r) => {
    const unlocked = game.isRuneUnlocked(r.id);
    const equipped = game.isRuneEquipped(r.id);
    const lv = game.getRuneLevel(r.id);
    const upCost = game.getRuneUpgradeCost(r.id);
    const canUp = game.canUpgradeRune(r.id);
    const cls = `rune-card${!unlocked ? ' locked' : ''}${equipped ? ' equipped' : ''}`;

    const pips = unlocked
      ? `<div class="pips">${Array.from({ length: maxLv }, (_, i) => `<i class="${i < lv ? 'on' : ''}" style="${i < lv ? `background:${r.color}` : ''}"></i>`).join('')}</div>`
      : '';

    let actionsHtml = '';
    if (!unlocked) {
      actionsHtml = '<div class="rune-actions"><button class="buy poor" disabled>Boss Drop</button></div>';
    } else {
      const eqBtn = equipped
        ? `<button class="buy equipped-btn" data-rune="${r.id}">Equipped ✓</button>`
        : `<button class="buy" data-rune="${r.id}">Equip</button>`;
      const upBtn = lv >= maxLv
        ? '<button class="buy maxed" disabled>★ Lv 3</button>'
        : `<button class="buy ${canUp ? '' : 'poor'}" data-rune-up="${r.id}">Lv ${lv + 1} · ${SHARD_SVG}${fmt(upCost)}</button>`;
      actionsHtml = `<div class="rune-actions">${eqBtn}${upBtn}</div>`;
    }

    const multPct = Math.round(((CONFIG.runeLevelMults?.[lv - 1] || 1) - 1) * 100);
    const lvTag = unlocked ? `<span class="ch-lv-badge">Lv ${lv}/${maxLv}${multPct > 0 ? ` (+${multPct}%)` : ''}</span>` : '';

    return `<div class="${cls}">
      <span class="rune-ico" style="--rc:${r.color}"><svg viewBox="0 0 24 24" aria-hidden="true">${r.icon}</svg></span>
      <div class="rune-info">
        <div class="armory-title-row">
          <b style="color:${unlocked ? r.color : 'var(--dim)'}">${r.name}</b>
          ${lvTag}
        </div>
        <small>${r.bossName}</small>
        <span>${r.desc}</span>
        ${pips}
      </div>
      ${actionsHtml}
    </div>`;
  }).join('');
}

function animateArmory() {
  if (!screens.upgrades.classList.contains('active') || activeUpTab !== 'armory') {
    armoryRaf = 0;
    return;
  }
  const t = performance.now() / 1000;
  for (const p of armoryPreviews) {
    const c = p.ctx;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, p.size, p.size);
    c.globalCompositeOperation = 'lighter';
    drawSet({ ctx: c, S: p.S, ox: p.size / 2, oy: p.size / 2 }, p.set, 0, 0, t * 0.4, t, p.phase, 1, 1, false, 1, false);
  }
  armoryRaf = requestAnimationFrame(animateArmory);
}

function startArmoryAnim() {
  if (!armoryRaf) armoryRaf = requestAnimationFrame(animateArmory);
}

el.armoryList?.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.dataset.equip !== undefined) {
    const idx = Number(b.dataset.equip);
    if (game.setChassis(idx)) {
      audio.pick();
      renderArmory();
      startArmoryAnim();
    }
  } else if (b.dataset.unlock !== undefined) {
    const idx = Number(b.dataset.unlock);
    if (game.unlockChassis(idx)) {
      audio.buy();
      haptics.buzz(25);
      renderUpgrades();
      startArmoryAnim();
      toast(`${CONFIG.chassis[idx].name}`, 'Unlocked & Equipped!', 'perfect');
    } else {
      replay(b, 'nope');
      audio.hit();
    }
  } else if (b.dataset.upgrade !== undefined) {
    const idx = Number(b.dataset.upgrade);
    if (game.upgradeChassis(idx)) {
      const lv = game.getChassisLevel(idx);
      const ch = CONFIG.chassis[idx];
      audio.buy();
      haptics.buzz(30);
      renderUpgrades();
      startArmoryAnim();
      if (lv >= (CONFIG.chassisMaxLevel || 5)) {
        toast(`${ch.awakenedName || ch.name}`, '★ AWAKENED FORM UNLOCKED!', 'record');
      } else {
        toast(`${ch.name} → Lv ${lv}`, 'Chassis upgraded!', 'perfect');
      }
    } else {
      replay(b, 'nope');
      audio.hit();
    }
  }
});

el.runesList?.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.dataset.rune) {
    if (game.toggleRune(b.dataset.rune)) {
      audio.pick();
      haptics.buzz(15);
      renderBossRunes();
    }
  } else if (b.dataset.runeUp) {
    const runeId = b.dataset.runeUp;
    if (game.upgradeRune(runeId)) {
      const r = CONFIG.runes.find((x) => x.id === runeId);
      const lv = game.getRuneLevel(runeId);
      audio.buy();
      haptics.buzz(25);
      renderUpgrades();
      toast(`${r ? r.name : 'Rune'} → Lv ${lv}`, 'Rune power amplified!', 'perfect');
    } else {
      replay(b, 'nope');
      audio.hit();
    }
  }
});

function renderUpgrades() {
  if (el.upShards) el.upShards.textContent = fmt(meta.shards);
  renderSkillTree();
  renderArmory();
}

/* ───────────────────────── Dedicated Tabbed 5-Category Shop Screen ───────────────────────── */

let activeShopTab = 'boosters';

el.shopTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    activeShopTab = tab.dataset.shopTab;
    el.shopTabs.forEach((t) => {
      const on = t === tab;
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', String(on));
    });
    el.shopPanes.forEach((pane) => {
      pane.classList.toggle('active', pane.dataset.shopPane === activeShopTab);
    });
    if (el.shopScroll) el.shopScroll.scrollTop = 0;
  });
});

function renderShop() {
  if (el.shopShards) el.shopShards.textContent = fmt(meta.shards);

  // 1. Tactical Run Boosters
  if (el.boostersList) {
    el.boostersList.innerHTML = (CONFIG.cosmetics?.boosters || []).map((bo) => {
      const active = game.isBoosterActive(bo.id);
      const canBuy = store.data.shards >= bo.cost;
      const col = bo.color || 'var(--gold)';
      const btn = active
        ? '<button class="buy equipped-btn" disabled>Armed ✓</button>'
        : `<button class="buy ${canBuy ? '' : 'poor'}" data-buy-booster="${bo.id}">${SHARD_SVG}${fmt(bo.cost)}</button>`;
      return `<div class="cosmetic-card${active ? ' equipped' : ''}">
        <span class="cosmetic-dot" style="background:${col};box-shadow:0 0 10px ${col}"></span>
        <div class="cosmetic-info">
          <b style="color:${col}">${bo.name}</b>
          <span>${bo.desc}</span>
        </div>
        ${btn}
      </div>`;
    }).join('');
  }

  // 2. Bullet Trails & Skins
  if (el.bulletSkinsList) {
    const activeSkin = game.equippedBulletSkin;
    el.bulletSkinsList.innerHTML = (CONFIG.cosmetics?.bulletSkins || []).map((sk) => {
      const unlocked = game.isBulletSkinUnlocked(sk.id);
      const equipped = activeSkin === sk.id;
      const canBuy = store.data.shards >= sk.cost;
      const col = sk.color || 'var(--core)';
      let btn = '';
      if (!unlocked) {
        btn = `<button class="buy ${canBuy ? '' : 'poor'}" data-buy-skin="${sk.id}">${SHARD_SVG}${fmt(sk.cost)}</button>`;
      } else if (equipped) {
        btn = '<button class="buy equipped-btn" disabled>Active</button>';
      } else {
        btn = `<button class="buy" data-equip-skin="${sk.id}">Equip</button>`;
      }
      return `<div class="cosmetic-card${equipped ? ' equipped' : ''}">
        <span class="cosmetic-dot" style="background:${col};box-shadow:0 0 10px ${col}"></span>
        <div class="cosmetic-info">
          <b style="color:${col}">${sk.name}</b>
          <span>${sk.desc}</span>
        </div>
        ${btn}
      </div>`;
    }).join('');
  }

  // 3. Core Halos & Auras
  if (el.coreAurasList) {
    const activeAura = game.equippedCoreAura;
    el.coreAurasList.innerHTML = (CONFIG.cosmetics?.coreAuras || []).map((au) => {
      const unlocked = game.isCoreAuraUnlocked(au.id);
      const equipped = activeAura === au.id;
      const canBuy = store.data.shards >= au.cost;
      const col = au.color || 'var(--core)';
      let btn = '';
      if (!unlocked) {
        btn = `<button class="buy ${canBuy ? '' : 'poor'}" data-buy-aura="${au.id}">${SHARD_SVG}${fmt(au.cost)}</button>`;
      } else if (equipped) {
        btn = '<button class="buy equipped-btn" disabled>Active</button>';
      } else {
        btn = `<button class="buy" data-equip-aura="${au.id}">Equip</button>`;
      }
      return `<div class="cosmetic-card${equipped ? ' equipped' : ''}">
        <span class="cosmetic-dot" style="background:${col};box-shadow:0 0 10px ${col}"></span>
        <div class="cosmetic-info">
          <b style="color:${col}">${au.name}</b>
          <span>${au.desc}</span>
        </div>
        ${btn}
      </div>`;
    }).join('');
  }

  // 4. Enemy Shatter Effects
  if (el.killEffectsList) {
    const activeFx = game.equippedKillEffect;
    el.killEffectsList.innerHTML = (CONFIG.cosmetics?.killEffects || []).map((ef) => {
      const unlocked = game.isKillEffectUnlocked(ef.id);
      const equipped = activeFx === ef.id;
      const canBuy = store.data.shards >= ef.cost;
      const col = ef.color || 'var(--core)';
      let btn = '';
      if (!unlocked) {
        btn = `<button class="buy ${canBuy ? '' : 'poor'}" data-buy-kfx="${ef.id}">${SHARD_SVG}${fmt(ef.cost)}</button>`;
      } else if (equipped) {
        btn = '<button class="buy equipped-btn" disabled>Active</button>';
      } else {
        btn = `<button class="buy" data-equip-kfx="${ef.id}">Equip</button>`;
      }
      return `<div class="cosmetic-card${equipped ? ' equipped' : ''}">
        <span class="cosmetic-dot" style="background:${col};box-shadow:0 0 10px ${col}"></span>
        <div class="cosmetic-info">
          <b style="color:${col}">${ef.name}</b>
          <span>${ef.desc}</span>
        </div>
        ${btn}
      </div>`;
    }).join('');
  }

  // 5. Shockwave Styles
  if (el.shockStylesList) {
    const activeShock = game.equippedShockStyle;
    el.shockStylesList.innerHTML = (CONFIG.cosmetics?.shockStyles || []).map((st) => {
      const unlocked = game.isShockStyleUnlocked(st.id);
      const equipped = activeShock === st.id;
      const canBuy = store.data.shards >= st.cost;
      const col = st.color || 'var(--core)';
      let btn = '';
      if (!unlocked) {
        btn = `<button class="buy ${canBuy ? '' : 'poor'}" data-buy-shock="${st.id}">${SHARD_SVG}${fmt(st.cost)}</button>`;
      } else if (equipped) {
        btn = '<button class="buy equipped-btn" disabled>Active</button>';
      } else {
        btn = `<button class="buy" data-equip-shock="${st.id}">Equip</button>`;
      }
      return `<div class="cosmetic-card${equipped ? ' equipped' : ''}">
        <span class="cosmetic-dot" style="background:${col};box-shadow:0 0 10px ${col}"></span>
        <div class="cosmetic-info">
          <b style="color:${col}">${st.name}</b>
          <span>${st.desc}</span>
        </div>
        ${btn}
      </div>`;
    }).join('');
  }
}

el.boostersList?.addEventListener('click', (e) => {
  const b = e.target.closest('button[data-buy-booster]');
  if (!b) return;
  if (game.buyBooster(b.dataset.buyBooster)) {
    audio.buy();
    haptics.buzz(20);
    renderShop();
    toast('Tactical Booster Armed', 'Active for your next run!', 'perfect');
  } else {
    replay(b, 'nope');
    audio.hit();
  }
});

el.bulletSkinsList?.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.dataset.buySkin) {
    if (game.unlockBulletSkin(b.dataset.buySkin)) {
      audio.buy();
      haptics.buzz(20);
      renderShop();
      toast('Bullet Trail Unlocked', 'Equipped automatically', 'perfect');
    } else {
      replay(b, 'nope');
      audio.hit();
    }
  } else if (b.dataset.equipSkin) {
    if (game.setBulletSkin(b.dataset.equipSkin)) {
      audio.pick();
      renderShop();
    }
  }
});

el.coreAurasList?.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.dataset.buyAura) {
    if (game.unlockCoreAura(b.dataset.buyAura)) {
      audio.buy();
      haptics.buzz(20);
      renderShop();
      toast('Core Aura Unlocked', 'Equipped automatically', 'perfect');
    } else {
      replay(b, 'nope');
      audio.hit();
    }
  } else if (b.dataset.equipAura) {
    if (game.setCoreAura(b.dataset.equipAura)) {
      audio.pick();
      renderShop();
    }
  }
});

el.killEffectsList?.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.dataset.buyKfx) {
    if (game.unlockKillEffect(b.dataset.buyKfx)) {
      audio.buy();
      haptics.buzz(20);
      renderShop();
      toast('Kill Effect Unlocked', 'Equipped automatically', 'perfect');
    } else {
      replay(b, 'nope');
      audio.hit();
    }
  } else if (b.dataset.equipKfx) {
    if (game.setKillEffect(b.dataset.equipKfx)) {
      audio.pick();
      renderShop();
    }
  }
});

el.shockStylesList?.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.dataset.buyShock) {
    if (game.unlockShockStyle(b.dataset.buyShock)) {
      audio.buy();
      haptics.buzz(20);
      renderShop();
      toast('Shockwave Style Unlocked', 'Equipped automatically', 'perfect');
    } else {
      replay(b, 'nope');
      audio.hit();
    }
  } else if (b.dataset.equipShock) {
    if (game.setShockStyle(b.dataset.equipShock)) {
      audio.pick();
      renderShop();
    }
  }
});

/* ───────────────────────── Stats & 18 Achievements ───────────────────────── */

function renderStats() {
  const s = store.data.stats;
  const rows = [
    ['Best score', fmt(s.bestScore)],
    ['Best wave', s.bestWave],
    ['Endless best wave', s.endlessBestWave || 0],
    ['Tiers conquered', fmt(s.stagesCleared || 0)],
    ['Perfect waves', fmt(s.perfectWaves || 0)],
    ['Bosses defeated', fmt(s.bossKills || 0)],
    ['Total runs', fmt(s.totalRuns)],
    ['Enemies destroyed', fmt(s.totalKills)],
    ['Shards earned', fmt(s.totalShards)],
  ];
  el.statsList.innerHTML = rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');

  if (el.achList) {
    const achMap = store.data.achievements || {};
    el.achList.innerHTML = CONFIG.achievements.map((a) => {
      const done = !!achMap[a.id];
      return `<div class="ach-row ${done ? 'done' : ''}">
        <div class="ach-info"><b>${done ? '✓ ' : ''}${a.name}</b><span>${a.desc}</span></div>
        <span class="ach-reward">${SHARD_SVG}+${fmt(a.reward)}</span>
      </div>`;
    }).join('');
  }
}

/* ───────────────────────── Settings ───────────────────────── */

const SETTING_KEYS = ['sound', 'music', 'vibration', 'damageNumbers'];

function renderSettings() {
  for (const k of SETTING_KEYS) {
    const btn = $(`#set-${k}`);
    if (btn) btn.setAttribute('aria-checked', String(settings[k] !== false));
  }
}

for (const k of SETTING_KEYS) {
  $(`#set-${k}`)?.addEventListener('click', () => {
    settings[k] = !(settings[k] !== false);
    store.save();
    audio.applySettings();
    renderSettings();
    if (k === 'vibration' && settings.vibration) haptics.buzz(40);
  });
}

$('#btn-reset').addEventListener('click', () => el.dialog.classList.add('active'));
$('#btn-reset-no').addEventListener('click', () => el.dialog.classList.remove('active'));
$('#btn-reset-yes').addEventListener('click', () => {
  store.reset();
  game.worldIdx = 0;
  game.tierIdx = 0;
  game.chassisIdx = 0;
  treeCam.initialized = false;
  game.syncWorldTheme();
  game.refreshCoreLoadout();
  el.dialog.classList.remove('active');
  refreshMenu();
  toast('Progress Reset', 'All stats & worlds reset', 'info');
});

/* ───────────────────────── Android APK & lifecycle ───────────────────────── */

audio.unlock();
const unlockEvents = ['pointerdown', 'pointermove', 'pointerup', 'touchstart', 'touchend', 'click', 'keydown'];
function onFirstInteraction() {
  audio.unlock();
  if (audio.ctx && audio.ctx.state === 'running') {
    for (const t of unlockEvents) window.removeEventListener(t, onFirstInteraction);
  }
}
for (const t of unlockEvents) {
  window.addEventListener(t, onFirstInteraction, { passive: true });
}

function handleBackNavigation() {
  if (el.dialog.classList.contains('active')) {
    el.dialog.classList.remove('active');
    return true;
  }
  const activeScreen = body.dataset.screen;
  if (['upgrades', 'shop', 'stats', 'settings'].includes(activeScreen)) {
    show(returnTo);
    return true;
  }
  if (game.state === 'play' || game.state === 'cards') {
    game.pause();
    return true;
  }
  if (game.state === 'paused') {
    game.resume();
    return true;
  }
  return false;
}

window.history.pushState({ core: true }, '');
window.addEventListener('popstate', () => {
  if (handleBackNavigation()) window.history.pushState({ core: true }, '');
});
document.addEventListener('backbutton', (e) => {
  if (handleBackNavigation()) e.preventDefault();
}, false);

let wakeLock = null;
async function requestWakeLock() {
  if ('wakeLock' in navigator && !document.hidden) {
    try { wakeLock = await navigator.wakeLock.request('screen'); } catch { /* ignore */ }
  }
}

function onHidden() { game.autoPause(); audio.setHidden(true); }
function onVisible() {
  audio.setHidden(false);
  game.last = performance.now() / 1000;
  game.acc = 0;
  requestWakeLock();
}
document.addEventListener('visibilitychange', () => (document.hidden ? onHidden() : onVisible()));
window.addEventListener('pagehide', onHidden);
window.addEventListener('pageshow', (e) => { if (e.persisted) onVisible(); });
window.addEventListener('blur', () => game.autoPause());
requestWakeLock();

if ('serviceWorker' in navigator) {
  if (params.has('nosw')) {
    navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => r.unregister()));
  } else if (window.isSecureContext) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js').catch(() => { }));
  }
}

game.start();