// Systems Sprint service worker. Scope: /sprint/app/ only.
// Network-first for the app page so updates show up right away; offline falls back to the last copy.
// Never touches Firebase, Google, or any cross-origin request.
const CACHE = "sprint-app-v1";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith("sprint-app-") && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  if (req.mode !== "navigate") return;
  e.respondWith(
    fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put("./", copy)); }
      return res;
    }).catch(() => caches.match("./").then((r) => r || Response.error()))
  );
});
