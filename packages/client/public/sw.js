const CACHE_NAME = 'dino-game-cache-v2';

const URLS = [
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
  const { request } = event;

  if (!request.url.startsWith('http')) {
    return;
  }

  const isApiUrl = request.url.includes('/api/');
  const isHtml = request.mode === 'navigate';

  if (isApiUrl) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response && response.status === 200 && response.type === 'basic') {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          
          if (isApiUrl) {
             return new Response(JSON.stringify({ message: 'Нет подключения к интернету' }), {
               status: 503,
               statusText: 'Service Unavailable',
               headers: { 'Content-Type': 'application/json' }
             });
          }

        })
    );
    return;
  }

  if (isHtml) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          `
          <!DOCTYPE html>
          <html lang="ru">
            <head>
              <meta charset="UTF-8">
              <title>Вы оффлайн</title>
              <style>
                body { font-family: sans-serif; text-align: center; padding: 50px; background-color: #11121D}
                h1 { color: #EEF1FA; }
              </style>
            </head>
            <body>
              <h1>Нет подключения к интернету</h1>
              <p>Пожалуйста, проверьте ваше соединение и обновите страницу.</p>
            </body>
          </html>
          `,
          {
            status: 200,
            headers: { 'Content-Type': 'text/html' }
          }
        );
      })
    );
    return;
  }

  event.respondWith(
    caches.match(request)
      .then(response => {
        if (response) {
          return response;
        }

        const fetchRequest = request.clone();
        return fetch(fetchRequest)
          .then(response => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(request, responseToCache);
              });
            return response;
          });
      })
  );
});
