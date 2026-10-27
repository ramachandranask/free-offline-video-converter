const CACHE_NAME = 'video-engine-v1';

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

// Monetization Network Interceptor - Forces mobile/desktop ads to fetch live from servers
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // ⚡ AD NETWORK BYPASS RULES
  if (
    url.hostname.includes('adsterra') || 
    url.hostname.includes('display-ads') || 
    url.hostname.includes('exoclick') ||
    url.hostname.includes('highratecpm') ||
    url.hostname.includes('highrateperformance') ||
    url.hostname.includes('ypncdn')
  ) {
    return; // Bypass caching completely to let live ads pass through online
  }

  if (event.request.method !== 'GET' || url.protocol === 'blob:') {
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
