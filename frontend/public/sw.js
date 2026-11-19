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

// Événement Push standard (Web Push API pour Chrome Desktop & Mobile Android)
self.addEventListener('push', (event) => {
  let data = { title: '🔴 ALERTE INFO — LIFE CHANNEL', message: 'Nouvelle alerte d\'actualité en direct', url: '/' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.message = event.data.text();
    }
  }

  const options = {
    body: data.message || data.body || 'Flash information en direct de Kinshasa et provinces.',
    icon: '/logo.png',
    badge: '/logo.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || (data.articleId ? `/articles/${data.articleId}` : '/') },
    actions: [
      { action: 'read', title: 'Lire l\'alerte' },
      { action: 'close', title: 'Fermer' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || '🔴 ALERTE FLASH INFO', options)
  );
});

// Clic sur la notification native
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) ? event.notification.data.url : '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
