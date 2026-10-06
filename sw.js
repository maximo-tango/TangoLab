const CACHE_NAME = 'tango-lab-v2';
const APP_SHELL = [
  './',
  './index.html',
  './css/style.css',
  './css/competition-score.css',
  './css/responsive.css',
  './js/app.js',
  './manifest.webmanifest',
  './assets/images/maximo-tango.png',
  './assets/favicon/favicon.png',
  './assets/favicon/apple-touch-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys
      .filter(key => key !== CACHE_NAME)
      .map(key => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (!['http:', 'https:'].includes(url.protocol) || url.origin !== self.location.origin) return;

  const isDocument = request.mode === 'navigate' || request.destination === 'document';

  event.respondWith(
    (isDocument ? fetch(request).then(response => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(request, copy)).catch(() => {});
      return response;
    }).catch(() => caches.match(request)) : caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, copy)).catch(() => {});
        return response;
      }).catch(() => cached);
    }))
  );
});
