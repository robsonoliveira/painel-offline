/* Painel Trabalho off-line: guarda o app e os dados cifrados no aparelho.
   dados.json e chave.json: rede primeiro (pega a versão nova quando há internet), cache se off-line.
   Demais arquivos: cache primeiro. */
const CACHE = "painel-off-v1";
const BASE = ["./", "index.html", "manifest.webmanifest", "icon.svg", "icon-180.png", "icon-192.png", "icon-512.png", "chave.json", "dados.json"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(CACHE).then(c => Promise.all(BASE.map(f => c.add(f).catch(() => {})))).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", (e) => {
  const r = e.request; if (r.method !== "GET") return;
  const u = new URL(r.url); if (u.origin !== location.origin) return;
  const dado = /\/(dados|chave)\.json$/.test(u.pathname) || r.mode === "navigate";
  if (dado) {
    e.respondWith(fetch(r, { cache: "no-cache" }).then(res => { if (res.ok) { const c = res.clone(); caches.open(CACHE).then(k => k.put(r.mode === "navigate" ? "./" : r, c)); } return res; })
      .catch(() => caches.match(r.mode === "navigate" ? "./" : r, { ignoreSearch: true })));
  } else {
    e.respondWith(caches.match(r, { ignoreSearch: true }).then(m => m || fetch(r).then(res => { if (res.ok) { const c = res.clone(); caches.open(CACHE).then(k => k.put(r, c)); } return res; })));
  }
});
