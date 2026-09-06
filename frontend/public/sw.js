/* Offline shell for the recipe book.
 *
 * The rule that matters is below: an asset is served from the cache and
 * refreshed in the background at the same time. The previous version served
 * from the cache and stopped there, which is fine for a file whose name
 * changes every build and wrong for everything else — an image at a steady
 * address, once cached, was that image for good. A page could end up holding
 * this week's markup over last week's pictures, which looks like the site is
 * broken rather than stale.
 */
const CACHE = "recipeapp-v6";
const PRECACHE = ["/", "/manifest.json", "/icon-192", "/icon-512"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE).catch(() => {})));
  self.skipWaiting();
});

// Anything cached under an older name is thrown away, so bumping CACHE above
// is enough to give every visitor a clean start.
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
  );
  self.clients.claim();
});

/** Only a complete, same-origin, successful answer is worth keeping. */
const worthCaching = (res) => res && res.ok && res.type === "basic";

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  // Pages: always from the network, with the cache as the offline fallback.
  if (e.request.headers.get("accept")?.includes("text/html")) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          if (worthCaching(res)) {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Everything else: answer from the cache at once, and replace it with
  // whatever the network says in the background. A visitor sees a stale asset
  // at most once, and never has to be told to clear anything.
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const fresh = fetch(e.request)
        .then((res) => {
          if (worthCaching(res)) {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() => cached);
      return cached || fresh;
    })
  );
});
