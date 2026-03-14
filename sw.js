/* ══════════════════════════════════════════════
   SERVICE WORKER — Rifas Cifuentips
   Sprint 9B — PWA / Offline
   ══════════════════════════════════════════════ */

var CACHE_NAME = "rifas-cifuentips-v1";
var STATIC_ASSETS = [
  "/",
  "/index.html",
  "/app.js",
  "/styles.css",
  "/icon.svg",
  "/manifest.json"
];

// ── Install: pre-cache static assets ──────────
self.addEventListener("install", function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(STATIC_ASSETS);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

// ── Activate: delete old caches ───────────────
self.addEventListener("activate", function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// ── Fetch: cache-first para assets, network-first para el resto ──
self.addEventListener("fetch", function(e) {
  var url = new URL(e.request.url);

  // Solo manejar peticiones del mismo origen
  if (url.origin !== self.location.origin) return;

  // Ignorar peticiones no-GET
  if (e.request.method !== "GET") return;

  // Cache-first para assets estáticos conocidos
  var isStatic = STATIC_ASSETS.some(function(a) {
    return url.pathname === a || url.pathname === a + "index.html";
  }) || /\.(css|js|svg|png|jpg|ico|woff2?)(\?.*)?$/.test(url.pathname);

  if (isStatic) {
    e.respondWith(
      caches.match(e.request).then(function(cached) {
        if (cached) return cached;
        return fetch(e.request).then(function(response) {
          if (!response || response.status !== 200) return response;
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(c) { c.put(e.request, clone); });
          return response;
        });
      })
    );
    return;
  }

  // Network-first con fallback a caché para el resto
  e.respondWith(
    fetch(e.request).then(function(response) {
      if (!response || response.status !== 200) return response;
      var clone = response.clone();
      caches.open(CACHE_NAME).then(function(c) { c.put(e.request, clone); });
      return response;
    }).catch(function() {
      return caches.match(e.request).then(function(cached) {
        return cached || caches.match("/index.html");
      });
    })
  );
});
