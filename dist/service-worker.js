/**
 * service-worker.js — precaches every file so Core plays fully offline.
 *
 * Deploying an update? Bump VERSION. The new worker precaches the new files, takes over,
 * and deletes the old cache, so players get the update on their next launch.
 *
 * On localhost the worker is network-first, so edits show up without bumping VERSION.
 */
const VERSION = 'core-v2';

const CACHE_NAME = 'core-game-v2';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/main.js',
  './js/game.js',
  './js/renderer.js',
  './js/input.js',
  './js/audio.js',
  './js/meta.js',
  './js/storage.js',
  './js/art.js',
  './js/sprites.js',
  './fonts/Orbitron-VariableFont_wght.ttf',
  './fonts/Rajdhani-Light.ttf',
  './fonts/Rajdhani-Regular.ttf',
  './fonts/Rajdhani-Medium.ttf',
  './fonts/Rajdhani-SemiBold.ttf',
  './fonts/Rajdhani-Bold.ttf'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});

const DEV = ['localhost', '127.0.0.1', '[::1]'].includes(self.location.hostname);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION)
      .then((cache) => cache.addAll(ASSETS.map((u) => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('core-') && k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  const fromCache = () => caches.match(req, { ignoreSearch: true });
  const fromNetwork = () => fetch(req).then((res) => {
    if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
    return res;
  });

  event.respondWith(
    (DEV ? fromNetwork().catch(fromCache) : fromCache().then((hit) => hit || fromNetwork()))
      .catch(() => (req.mode === 'navigate' ? caches.match('./index.html') : Response.error())),
  );
});
