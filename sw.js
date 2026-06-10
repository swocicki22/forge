// ════════════════════════════════
// FORGE SERVICE WORKER
// Bump CACHE on every deploy or browsers will keep serving the old build.
// ════════════════════════════════
const CACHE = 'forge-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './forge-icon-192.png',
  './forge-icon-512.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(ASSETS); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) {
        return k !== CACHE && k !== 'forge-fonts';
      }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  // App shell: cache-first, refill cache on network fetch
  if (url.origin === location.origin) {
    e.respondWith(
      caches.match(e.request).then(function (cached) {
        if (cached) return cached;
        return fetch(e.request).then(function (resp) {
          if (resp && resp.status === 200) {
            const copy = resp.clone();
            caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
          }
          return resp;
        });
      })
    );
    return;
  }

  // Google Fonts (Orbitron / Rajdhani / Share Tech Mono): stale-while-revalidate
  // so the HALO theme renders correctly offline after first load
  if (url.hostname.indexOf('fonts.googleapis.com') >= 0 ||
      url.hostname.indexOf('fonts.gstatic.com') >= 0) {
    e.respondWith(
      caches.open('forge-fonts').then(function (c) {
        return c.match(e.request).then(function (cached) {
          const network = fetch(e.request).then(function (resp) {
            if (resp && resp.status === 200) c.put(e.request, resp.clone());
            return resp;
          }).catch(function () { return cached; });
          return cached || network;
        });
      })
    );
  }
});
