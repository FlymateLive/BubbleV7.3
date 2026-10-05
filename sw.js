const CACHE = 'bubble-live-v13';
const CORE = [
  "./bubble-v7-social-brain.js",
  "./bubble-v7-realtime-gameplay.css",
  "./bubble-v7-realtime-gameplay.js",'./', './index.html', './connection-config.js', './manifest.webmanifest', './bubble-icon.png', './bubble-v5.js', './bubble-v5.css', './bubble-v5-shorts.js', './bubble-v6-star.js', './bubble-v6-gameplay.js', './bubble-v6-gameplay.css', './bubble-v7-living.js', './bubble-v7-living.css', './bubble-v7-fixes.js', './bubble-v7-fixes.css'];
const OWN_CACHES = /^bubble-(?:iphone|live)-v\d+$/;
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE && OWN_CACHES.test(key)).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request, url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    // Network first makes GitHub Pages updates available to installed phone PWAs.
    try {
      const response = await fetch(request);
      if (response.ok && response.type === 'basic') await cache.put(request, response.clone());
      return response;
    } catch (error) {
      const cached = await cache.match(request);
      if (cached) return cached;
      // A missing script, style or image must never receive an HTML fallback.
      if (request.mode === 'navigate') return (await cache.match('./index.html')) || Response.error();
      return Response.error();
    }
  })());
});
