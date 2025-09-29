/* Service Worker: Stale-While-Revalidate for hot API endpoints and static assets */
const SW_VERSION = 'v1.0.0';
const API_CACHE = 'api-cache-' + SW_VERSION;
const ASSET_CACHE = 'asset-cache-' + SW_VERSION;

// Hot endpoints to cache
const HOT_API_PATTERNS = [
  /\/api\/cabDetails(\?.*)?$/,
  /\/api\/assigncab(\?.*)?$/,
  /\/api\/servicing(\?.*)?$/,
  /\/api\/driver\/profile(\?.*)?$/,
  /\/api\/cabs\/cabExpensive(\?.*)?$/,
  /\/api\/notifications\/(list|getNotifications)(\?.*)?$/,
];

self.addEventListener('install', (event) => {
  // Activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Clean up old caches
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => ![API_CACHE, ASSET_CACHE].includes(k))
          .map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

function isHotApiRequest(url) {
  return HOT_API_PATTERNS.some((re) => re.test(url));
}

async function staleWhileRevalidate(cacheName, request) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkFetch = fetch(request)
    .then(async (res) => {
      try {
        // Only cache successful GETs
        if (request.method === 'GET' && res && res.status === 200) {
          await cache.put(request, res.clone());
        }
      } catch (e) {}
      return res;
    })
    .catch((err) => {
      // If offline and we have cache, return cached below
      return undefined;
    });

  // If we have cache, return it immediately; network refreshes it in background
  if (cached) return cached;

  // Otherwise wait for network
  return networkFetch;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = request.url;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Next.js asset/static files or fonts
  const isStaticAsset =
    url.includes('/_next/static/') || url.includes('/_next/image') || url.includes('/fonts') || url.endsWith('.css') || url.endsWith('.js');

  if (isStaticAsset) {
    event.respondWith(staleWhileRevalidate(ASSET_CACHE, request));
    return;
  }

  if (isHotApiRequest(url)) {
    // Respect explicit no-cache bypass from client (used to force refresh)
    const cc = request.headers.get('Cache-Control');
    if (cc && cc.includes('no-cache')) {
      event.respondWith(fetch(request));
      return;
    }
    event.respondWith(staleWhileRevalidate(API_CACHE, request));
  }
});
