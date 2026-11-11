/* Funzionamento offline: conserva in cache i file dello strumento.
   Nessun dato delle pratiche passa da qui: restano nel browser del dispositivo.
   Ad ogni aggiornamento dello strumento, aumentare il numero di VERSIONE. */
const VERSIONE = "colloquio-v1";
const FILE = ["./", "index.html", "manifest.webmanifest", "icona-192.png", "icona-512.png", "icona-maskable-512.png", "apple-touch-icon.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSIONE).then(c => c.addAll(FILE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== VERSIONE).map(n => caches.delete(n)))).then(() => self.clients.claim()));
});
/* prima la rete (per ricevere gli aggiornamenti), poi la copia salvata se offline */
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(r => { const c = r.clone(); caches.open(VERSIONE).then(x => x.put(e.request, c)); return r; })
      .catch(() => caches.match(e.request, {ignoreSearch: true}).then(r => r || caches.match("index.html")))
  );
});
