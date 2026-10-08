/* Agente Pro – service worker: app disponibile anche senza rete */
const VERSION = "v1-202610082132";
const APP = "app-" + VERSION, LIBS = "libs-v1", TILES = "tiles-v1";
const CORE = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png"];
const LIB_URLS = ["https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css", "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js", "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"];
self.addEventListener("install", e => { e.waitUntil((async () => { const c = await caches.open(APP); await c.addAll(CORE).catch(() => {}); const l = await caches.open(LIBS); for (const u of LIB_URLS) { try { const r = await fetch(u, { mode: "no-cors" }); await l.put(u, r); } catch {} } self.skipWaiting(); })()); });
self.addEventListener("activate", e => { e.waitUntil((async () => { for (const k of await caches.keys()) if (k.startsWith("app-") && k !== APP) await caches.delete(k); await self.clients.claim(); })()); });
async function trimTiles(){ const c = await caches.open(TILES), keys = await c.keys(); for (let i = 0; i < keys.length - 1500; i++) await c.delete(keys[i]); }
self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  const u = new URL(req.url);
  if (req.mode === "navigate" || (u.origin === location.origin && /\/(index\.html)?$/.test(u.pathname))) {
    e.respondWith((async () => { try { const r = await fetch(req.url, { cache: "no-cache", credentials: "same-origin" }); if (r.ok) { const c = await caches.open(APP); c.put("./index.html", r.clone()); } return r; } catch { return (await caches.match("./index.html")) || (await caches.match("./")) || Response.error(); } })());
    return;
  }
  if (u.origin === location.origin || u.hostname === "cdnjs.cloudflare.com" || u.hostname === "fonts.googleapis.com" || u.hostname === "fonts.gstatic.com") {
    e.respondWith((async () => { const hit = await caches.match(req); if (hit) return hit; try { const r = await fetch(req); if (r.ok || r.type === "opaque") (await caches.open(LIBS)).put(req, r.clone()); return r; } catch { return hit || Response.error(); } })());
    return;
  }
  if (/tile\.openstreetmap\.org$/.test(u.hostname)) {
    e.respondWith((async () => { const c = await caches.open(TILES), hit = await c.match(req); const net = fetch(req).then(r => { if (r.ok) { c.put(req, r.clone()); trimTiles(); } return r; }).catch(() => null); return hit || (await net) || Response.error(); })());
  }
});
self.addEventListener("notificationclick", e => { e.notification.close(); const url = (e.notification.data && e.notification.data.url) || "./"; e.waitUntil((async () => { const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true }); for (const c of all) { if ("focus" in c) { c.focus(); if (c.navigate) c.navigate(url); return; } } if (self.clients.openWindow) await self.clients.openWindow(url); })()); });
