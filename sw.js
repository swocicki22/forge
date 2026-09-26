// ════════════════════════════════
// FORGE SERVICE WORKER
// Bump CACHE on every deploy or browsers will keep serving the old build.
// Every js/css URL carries ?v=N matching CACHE (index.html and ASSETS below).
// The page is fetched network-first but assets cache-first, so without the
// version a fresh index.html would run against the PREVIOUS deploy's cached
// scripts. Versioned URLs make a new page request files no cache holds.
// To deploy: bump CACHE, then run the same ?v= bump over index.html and sw.js.
// v20 = weeks per phase + weekly rep wave; rest workouts tick off; programmed reps beat old rep floors
// ════════════════════════════════
const CACHE = 'forge-v20';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './forge-icon-192.png',
  './forge-icon-512.png',
  './css/base.css?v=20',
  './css/auth.css?v=20',
  './css/workout.css?v=20',
  './css/analytics.css?v=20',
  './css/health.css?v=20',
  './css/nutrition.css?v=20',
  './js/core.js?v=20',
  './js/storage.js?v=20',
  './js/state.js?v=20',
  './js/library.js?v=20',
  './js/programs.js?v=20',
  './js/hardwood.js?v=20',
  './js/custom.js?v=20',
  './js/catalog.js?v=20',
  './js/periodization.js?v=20',
  './js/workout.js?v=20',
  './js/editor.js?v=20',
  './js/history.js?v=20',
  './js/analytics.js?v=20',
  './js/vitals.js?v=20',
  './js/peptides.js?v=20',
  './js/nutrition.js?v=20',
  './js/migrate.js?v=20',
  './js/programs-ui.js?v=20',
  './js/backup.js?v=20',
  './js/splash.js?v=20',
  './js/boot.js?v=20'
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

  if (url.origin === location.origin) {
    // Navigations: network-first so a fresh deploy shows up on the next launch
    // instead of waiting for the old cached shell to be evicted. Falls back to
    // cache the moment the network is unavailable, so offline still works.
    if (e.request.mode === 'navigate') {
      e.respondWith(
        fetch(e.request).then(function (resp) {
          if (resp && resp.status === 200) {
            const copy = resp.clone();
            caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
          }
          return resp;
        }).catch(function () {
          return caches.match(e.request).then(function (cached) {
            return cached || caches.match('./index.html');
          });
        })
      );
      return;
    }

    // Everything else (icons, manifest): cache-first, refill on miss
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
