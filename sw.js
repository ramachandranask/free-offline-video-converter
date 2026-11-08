const CACHE_NAME = 'video-engine-v10'; // Forced new version number to break browser locks

const ASSETS = [
  '/',
  '/index.html'
];

// Installs and bypasses old waiting service workers instantly
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Clears and destroys ALL old cached page versions from your phone/desktop disk
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

// Network-First configuration loop: Makes sure your browser fetches live changes first!
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Directly bypasses cache completely for your ad scripts and video domains
  if (
    url.hostname.includes('adsterra') || 
    url.hostname.includes('highrateperformance') ||
    url.hostname.includes('googleapis') ||
    event.request.method !== 'GET' || 
    url.protocol === 'blob:'
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
