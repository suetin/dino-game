const CACHE_NAME = 'dino-game-cache-v3';

const URLS = [
  '/images/favicon.ico',
  '/images/pwa-192x192.png',
  '/images/pwa-512x512.png',
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', event => {
  const { request } = event;

  if (!request.url.startsWith('http')) {
    return;
  }
  const url = new URL(request.url);

  if (request.method !== 'GET') {
    return;
  }
  const isApiUrl = url.pathname.startsWith('/api/');
  const isHtml = request.mode === 'navigate';
  const isStaticAsset =
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/images/') ||
    url.pathname === '/manifest.json' ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.woff2');

    if (isApiUrl) {
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
  if (!isStaticAsset) {
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
