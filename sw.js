// Nanjicore Service Worker (PWA Offline & Asset Cache)
const CACHE_NAME = 'nanjicore-v2.6.3';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/favicon.ico',
  '/favicon-32x32.png',
  '/favicon-16x16.png',
  '/apple-touch-icon.png',
  '/i18n.js',
  '/game.js',
  '/music.js',
  '/auth.js',
  '/profile.js',
  '/leaderboard.js',
  '/achievements.js',
  '/dialogs.js',
  '/backup_crypto.js',
  '/cloud_sync.js',
  '/admin.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Пропускаем внешние API и Firebase запросы
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Network-First стратегия для HTML и JS чтобы обновления всегда были свежими
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
