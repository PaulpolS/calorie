const CACHE_NAME = 'calorie-pwa-v8';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './logo_cinnamoroll_diet.jpg',
  './logo_pompompurin_fit.jpg',
  './cinnamoroll_hero.jpg',
  './pompompurin_hero.jpg',
  './cinnamoroll_avatar.jpg',
  './pompompurin_avatar.jpg',
  './kuromi_hero.jpg',
  './kuromi_avatar.jpg',
  './littletwinstars_hero.jpg',
  './littletwinstars_avatar.jpg',
  './mymelody_hero.jpg',
  './mymelody_avatar.jpg',
  './allstars_hero.jpg',
  './allstars_avatar.jpg',
  './halloween_hero.jpg',
  './halloween_avatar.jpg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (url.pathname.startsWith('/api/')) {
    return;
  }
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then((cached) => {
      const fetchPromise = fetch(e.request)
        .then((networkResp) => {
          if (networkResp && networkResp.status === 200 && url.origin === self.location.origin) {
            const copy = networkResp.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy));
          }
          return networkResp;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
