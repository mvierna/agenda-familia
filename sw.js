// Service worker de Agenda Familia: abrir la app sin conexión. Primero la red (para recibir versiones nuevas) y, si falla, la copia guardada.
const VERSION = 'agenda-v1';
const ARCHIVOS = ['./', 'index.html', 'manifest.json', 'icono-192.png', 'icono-512.png'];
self.addEventListener('install', e => e.waitUntil(caches.open(VERSION).then(c => Promise.all(ARCHIVOS.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(n => Promise.all(n.filter(x => x !== VERSION).map(x => caches.delete(x)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
    const url = new URL(e.request.url);
    if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
    e.respondWith(fetch(e.request, { cache: 'no-cache' }).then(r => {
        if (r.ok && !url.search) { const copia = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copia)); }
        return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(g => g || Response.error())));
});
