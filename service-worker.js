
const CACHE_NAME = "ps1-emulator-v1";

const APP_FILES = [
  "./",
  "./index.html",
  "./PlayStation.htm",
  "./PlayStation.js",
  "./PlayStation.png",
  "./manifest.json",
  "./ps1-icon.svg",
  "./pwa.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key =>
            key.startsWith("ps1-emulator-") &&
            key !== CACHE_NAME
          )
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;

  if (request.method !== "GET") return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);

    if (cached) return cached;

    try {
      const response = await fetch(request);

      if (response.ok || response.type === "opaque") {
        try {
          await cache.put(request, response.clone());
        } catch (error) {
          console.warn("Could not cache:", request.url);
        }
      }

      return response;
    } catch (error) {
      if (request.mode === "navigate") {
        const fallback = await cache.match("./PlayStation.htm");
        if (fallback) return fallback;
      }

      return new Response(
        "This resource is not cached yet. Connect to Wi-Fi and open it first.",
        {
          status: 503,
          headers: {
            "Content-Type": "text/plain; charset=utf-8"
          }
        }
      );
    }
  })());
});
