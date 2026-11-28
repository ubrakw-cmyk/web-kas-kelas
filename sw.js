// Service worker: cache file statis supaya web cepat, bisa dibuka offline, dan memenuhi syarat "Instal aplikasi".
const V = 'kas-kelas-v7b';
const FILES = ['./', 'index.html', 'style.css', 'app.js', 'config.js', 'manifest.json',
  'img/icon-192.png', 'img/icon-512.png', 'img/favicon.png', 'img/krabs.webp', 'img/bill.webp', 'img/rain.webp'];

self.addEventListener('install', e => {
  // satu file gagal tidak boleh menggagalkan pemasangan
  e.waitUntil(caches.open(V).then(c => Promise.allSettled(FILES.map(f => c.add(f)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== location.origin) return;            // Supabase & font: lewat jaringan biasa
  e.respondWith(caches.open(V).then(async c => {
    const hit = await c.match(r, { ignoreSearch: true });
    const net = fetch(r).then(res => { if (res.ok) c.put(r, res.clone()); return res; })
      .catch(async () => hit || (r.mode === 'navigate' ? await c.match('index.html') : Response.error()));
    return hit || net;
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: 'window' }).then(l => l.length ? l[0].focus() : clients.openWindow('./#/bayar')));
});
