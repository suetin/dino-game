const SHELL_CACHE_NAME = 'dino-game-shell-v5';
const ASSET_CACHE_NAME = 'dino-game-assets-v4';
const APP_SHELL_URL = '/';

const PUBLIC_DOCUMENT_PATHS = new Set([
  '/',
  '/login',
  '/register',
  '/500',
]);

const PRECACHE_URLS = [
  APP_SHELL_URL,
  '/login',
  '/register',
  '/500',
  '/manifest.json',
  '/images/favicon.ico',
  '/images/pwa-192x192.png',
  '/images/pwa-512x512.png',
];

const OFFLINE_HTML = `
<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Нет сети</title>
    <style>
      body {
        margin: 0;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        background-color: #11121d;
        color: #eef1fa;
        font-family: Inter, system-ui, sans-serif;
        text-align: center;
      }

      main {
        max-width: 420px;
      }

      h1 {
        margin: 0 0 12px;
        font-size: 28px;
      }

      p {
        margin: 0;
        line-height: 1.5;
        color: #c7cfdd;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Нет сети</h1>
      <p>Данные недоступны офлайн. После первого онлайн-открытия приложение загрузит кешированный shell и статику, но динамические данные требуют интернет.</p>
    </main>
  </body>
</html>
`;

function isHttpRequest(request) {
  return request.url.startsWith('http');
}

function isApiRequest(url) {
  return url.pathname.startsWith('/api/');
}

function isNavigationRequest(request) {
  return request.mode === 'navigate';
}

function isPublicDocumentPath(pathname) {
  return PUBLIC_DOCUMENT_PATHS.has(pathname);
}

function isStaticAssetRequest(url) {
  if (url.pathname === '/sw.js') {
    return false;
  }

  return (
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
    url.pathname.endsWith('.woff2')
  );
}

async function addPrecacheEntry(cache, url) {
  try {
    const response = await fetch(url, { cache: 'no-cache' });

    if (response.ok) {
      await cache.put(url, response.clone());
    }
  } catch (error) {
    return undefined;
  }
}

async function cacheStaticResponse(request, response) {
  if (!response || response.status !== 200 || response.type !== 'basic') {
    return response;
  }

  const cache = await caches.open(ASSET_CACHE_NAME);
  await cache.put(request, response.clone());

  return response;
}

async function cachePublicDocumentResponse(request, response) {
  if (!response || !response.ok) {
    return response;
  }

  const url = new URL(request.url);

  if (!isPublicDocumentPath(url.pathname)) {
    return response;
  }

  const cache = await caches.open(SHELL_CACHE_NAME);
  await cache.put(request, response.clone());

  return response;
}

function createOfflineResponse() {
  return new Response(OFFLINE_HTML, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=UTF-8' },
  });
}

async function getNavigationFallback(request) {
  const shellCache = await caches.open(SHELL_CACHE_NAME);
  const cachedResponse = await shellCache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  const cachedShell = await shellCache.match(APP_SHELL_URL);
  return cachedShell || null;
}

async function handleNavigationRequest(request) {
  try {
    const networkResponse = await fetch(request);
    return await cachePublicDocumentResponse(request, networkResponse);
  } catch (error) {
    const cachedResponse = await getNavigationFallback(request);
    return cachedResponse || createOfflineResponse();
  }
}

async function handleStaticAssetRequest(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    return await cacheStaticResponse(request, networkResponse);
  } catch (error) {
    return Response.error();
  }
}

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(SHELL_CACHE_NAME).then(cache =>
      Promise.allSettled(PRECACHE_URLS.map(url => addPrecacheEntry(cache, url)))
    )
  );
});

self.addEventListener('activate', event => {
  const allowedCacheNames = [SHELL_CACHE_NAME, ASSET_CACHE_NAME];

  event.waitUntil(
    caches
      .keys()
      .then(cacheNames =>
        Promise.all(
          cacheNames
            .filter(name => !allowedCacheNames.includes(name))
            .map(name => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;

  if (request.method !== 'GET' || !isHttpRequest(request)) {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin || isApiRequest(url)) {
    return;
  }

  if (isNavigationRequest(request)) {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  if (!isStaticAssetRequest(url)) {
    return;
  }

  event.respondWith(handleStaticAssetRequest(request));
});
