const CACHE_NAME = 'novaconvert-v2';

const ASSETS = [
  '/',
  '/index.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// ⚡ REVENUE PROTECTION NETWORK INTERCEPTOR
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Broad-spectrum whitelist to allow all anti-adblock delivery network assets pass
  if (
    url.hostname.includes('bauval.org') || 
    url.hostname.includes('abscloud.org') ||
    url.hostname.includes('adsterra') ||
    url.hostname.includes('highratecpm') ||
    url.hostname.includes('highrateperformance')
  ) {
    return; // Stop interception completely and let the browser fetch fresh live ads online
  }

  // Handle local processing blobs seamlessly
  if (event.request.method !== 'GET' || url.protocol === 'blob:') {
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
