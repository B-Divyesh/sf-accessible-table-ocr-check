const VERSION = 'proof-desk-v6';
const SHELL = [
  /* BUILD_ASSETS */
  '/', '/index.html', '/offline.html', '/manifest.json', '/icon.svg',
  '/icons/icon-192.png', '/icons/icon-512.png', '/icons/apple-touch-icon.png', '/assets/proofing-table.webp', '/assets/proofing-table-640.webp', '/assets/social-preview.jpg', '/sample-table.svg',
  '/demo', '/privacy/', '/terms/', '/404.html', '/robots.txt', '/sitemap.xml'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== VERSION).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(VERSION);
      try {
        const response = await fetch(event.request);
        await cache.delete('/offline-state');
        await cache.put(event.request, response.clone());
        return response;
      } catch {
        await cache.put('/offline-state', new Response('offline'));
        return (await caches.match(event.request)) || (await caches.match('/')) || caches.match('/offline.html');
      }
    })());
    return;
  }
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
    if (response.ok) caches.open(VERSION).then((cache) => cache.put(event.request, response.clone()));
    return response;
  })));
});
