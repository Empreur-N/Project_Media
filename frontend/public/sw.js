const CACHE_NAME = 'life-channel-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/logo.png',
  '/manifest.json'
];

// Installation : Mise en cache des assets statiques essentiels (App Shell)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activation : Nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Interception des requêtes : Stratégie Network-First avec repli Cache pour mode hors-ligne
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Ignorer les requêtes non GET ou les flux continus audio/vidéo
  if (request.method !== 'GET' || request.url.includes('/stream') || request.url.includes('skyrock') || request.url.includes('youtube')) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        // Mettre en cache la réponse fraîche pour consultation ultérieure hors-ligne
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        // Repli hors-ligne depuis le cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // Si page HTML introuvable hors-ligne, renvoyer l'index
        if (request.headers.get('accept') && request.headers.get('accept').includes('text/html')) {
          return caches.match('/');
        }
      })
  );
});