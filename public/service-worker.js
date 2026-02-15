/* eslint-env serviceworker */
/* eslint-disable no-restricted-globals */

const CACHE_NAME = 'verbale-pallanuoto-v2';

// Installazione - cache solo file base
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aperta');
        return cache.addAll([
          '/',
          '/index.html',
          '/manifest.json',
          '/logo192.png',
          '/logo512.png'
        ]);
      })
      .then(() => self.skipWaiting())
      .catch(err => console.log('Errore cache:', err))
  );
});

// Attivazione - pulizia vecchie cache
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => {
            console.log('Elimino vecchia cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch - Network first, poi Cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('/index.html');
          }
          return null;
        });
      })
  );
});