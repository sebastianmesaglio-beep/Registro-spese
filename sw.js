/* Registro — service worker
   Tiene una copia dell'app sul dispositivo: funziona senza rete e non contatta
   mai nessun server esterno (i caratteri sono incorporati in index.html).
   Se modifichi index.html, cambia il numero di CACHE qui sotto. */

var CACHE = "registro-v5";
var FILES = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png",
  "./apple-touch-icon.png"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return c.addAll(FILES);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== CACHE) return caches.delete(k);
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;

  // I file dell'app: prima la copia salvata, così parte anche offline.
  e.respondWith(
    caches.match(req).then(function (hit) {
      if (hit) {
        fetch(req).then(function (res) {
          if (res && res.ok) {
            caches.open(CACHE).then(function (c) { c.put(req, res); });
          }
        }).catch(function () {});
        return hit;
      }
      return fetch(req).catch(function () {
        return caches.match("./index.html");
      });
    })
  );
});
