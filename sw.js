const CACHE_NAME = 'video-engine-v2';

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

// Network Interceptor - Correctly routes monetization networks and app scripts
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // ⚡ LIVE PASSTHROUGH RULES (Ads, Cloud Services, Blobs, Forms)
  if (
    url.hostname.includes('adsterra') || 
    url.hostname.includes('display-ads') || 
    url.hostname.includes('exoclick') ||
    url.hostname.includes('highratecpm') ||
    url.hostname.includes('highrateperformance') ||
    url.hostname.includes('ypncdn') ||
    url.hostname.includes('bauval.org') ||
    url.hostname.includes('abscloud.org') ||
    event.request.method !== 'GET' || 
    url.protocol === 'blob:'
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Network-first strategy for UI assets ensures layout code updates flawlessly 
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.status === 200 && ASSETS.includes(url.pathname)) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
