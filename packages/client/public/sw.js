const CACHE_NAME = 'dino-game-cache-v1';

const URLS = [
  '/',
  '/index.html',
  '/images/favicon.ico',
  '/images/pwa-192x192.png',
  '/images/pwa-512x512.png',
];

self.addEventListener("install", event => {
  console.log("install");
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log("Opened cache");
        return cache.addAll(URLS);
      })
      .catch(err => {
        console.log(err);
        throw err;
      })
  );
});

self.addEventListener("activate", event => {
  console.log("activate");
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      )
    })
  );
});

self.addEventListener('fetch', event => {
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }

        const fetchRequest = event.request.clone();
        return fetch(fetchRequest)
          .then(response => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            return response;
          })
          .catch(() => {
            if (event.request.url.includes('/api/')) {
               return new Response(JSON.stringify({ message: 'Нет подключения к интернету' }), {
                 status: 503,
                 statusText: 'Service Unavailable',
                 headers: { 'Content-Type': 'application/json' }
               });
            }
          });
      })
  );
});
