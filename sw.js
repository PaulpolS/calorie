const CACHE_NAME = 'calorie-pwa-v24';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './logo_cleanfit_blue.jpg',
  './logo_cinnamoroll_diet.jpg',
  './logo_pompompurin_fit.jpg',
  './pompom_muscle_hero.jpg',
  './pompom_muscle_avatar.jpg',
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
  './halloween_avatar.jpg',
  './wk_situp.gif',
  './wk_squat.gif',
  './wk_pushup.gif',
  './wk_bicycle.gif',
  './wk_jumpingjack.gif',
  './wk_db_curl.gif',
  './wk_db_press.gif',
  './wk_db_squat.gif',
  './wk_db_row.gif',
  './wk_db_twist.gif',
  './wk_highknees.gif',
  './wk_waisttwist.gif',
  './wk_boxing.gif',
  './wk_skater.gif',
  './wk_plank.gif',
  './wk_legswall.gif',
  './wk_glutebridge.gif',
  './wk_catcow.gif',
  './wk_kneehug.gif',
  './wk_butterfly.gif'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(
        ASSETS.map((asset) =>
          fetch(new Request(asset, { cache: 'reload' }))
            .then((resp) => (resp.ok ? cache.put(asset, resp) : null))
            .catch(() => null)
        )
      )
    )
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
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) {
    return;
  }
  if (e.request.method !== 'GET') return;

  // Network-First for HTML navigation so updates show up immediately when online,
  // with 100% offline fallback to cache when there is no internet!
  const isHTML =
    e.request.mode === 'navigate' ||
    url.pathname.endsWith('/') ||
    url.pathname.endsWith('/index.html');

  if (isHTML) {
    e.respondWith(
      fetch(e.request, { cache: 'no-store' })
        .then((networkResp) => {
          if (networkResp && networkResp.status === 200) {
            const copy = networkResp.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy));
          }
          return networkResp;
        })
        .catch(() => caches.match(e.request).then((c) => c || caches.match('./index.html')))
    );
    return;
  }

  // Cache-First for images & static assets for instant speed
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
