const CACHE = 'gastei-v1';
const FILES = ['./', './index.html', './style.css', './app.js', './manifest.json', './icon-192.png', './icon-512.png', './icon-180.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  // Ignora a query (?t=...) ao buscar no cache
  const key = new Request(url.origin + url.pathname);
  e.respondWith(
    fetch(e.request).then(r => { caches.open(CACHE).then(c => c.put(key, r.clone())); return r; })
      .catch(() => caches.match(key).then(r => r || caches.match('./index.html')))
  );
});
