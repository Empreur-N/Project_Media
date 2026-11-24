const CACHE_NAME = 'life-channel-v5';
const STATIC_ASSETS = [
  '/logo.png',
  '/manifest.json'
];

// Installation : Prise en charge immédiate
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activation : Nettoyage immédiat et intégral de tous les anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Interception des requêtes : Toujours Network-First, aucune mise en cache d'index.html
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Ignorer les requêtes non GET ou les flux continus audio/vidéo
  if (request.method !== 'GET' || request.url.includes('/stream') || request.url.includes('skyrock') || request.url.includes('youtube')) {
    return;
  }

  // Ne JAMAIS servir de HTML depuis le cache pour garantir que les bundles JS sont toujours à jour
  if (request.mode === 'navigate' || request.url.endsWith('/') || request.url.includes('.html')) {
    event.respondWith(
      fetch(request).catch(() => caches.match('/'))
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }
      })
  );
});

// Événement Push standard (Web Push API sans aucun emoji)
self.addEventListener('push', (event) => {
  let data = { title: 'ALERTE INFO — LIFE CHANNEL', message: 'Nouvelle alerte d\'actualité en direct', url: '/' };
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
    self.registration.showNotification(data.title || 'ALERTE FLASH INFO', options)
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
