const CACHE_NAME = "portfolio-pwa-v1";
const FILES = [
  "./",
  "./index.html",
  "./style.css",
  "./index.js",
  "./Data/MockData.js",
  "./Entities/Security.js",
  "./Midlayer/Midlayer.js",
  "./Utilities/util.js",
  "./manifest.json"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
