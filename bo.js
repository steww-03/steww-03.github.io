/* Agente Pro \u{b7} lettore delle "Notizie da gestire" del gestionale Dove.it (caricato dal segnalibro) */
(async () => {
  const APP = "https://steww-03.github.io";
  if (window.__rzBoRunning) return; window.__rzBoRunning = true;
  const w = m => new Promise(r => setTimeout(r, m));
  const say = (h, ...btns) => {
    let d = document.getElementById("rz-bm");
    if (!d) { d = document.createElement("div"); d.id = "rz-bm"; d.style.cssText = "position:fixed;z-index:2147483647;left:50%;top:20px;transform:translateX(-50%);background:#fff;color:#111;border:3px solid #1d4ed8;border-radius:14px;padding:14px 18px;font:15px system-ui;box-shadow:0 10px 30px rgba(0,0,0,.3);max-width:92vw;display:flex;flex-wrap:wrap;gap:8px;align-items:center"; document.body.appendChild(d); }
    d.innerHTML = "<span>" + h + "</span>"; for (const b of btns) d.appendChild(b);
  };
  const btn = (txt, fn, alt) => { const b = document.createElement("button"); b.textContent = txt; b.style.cssText = "padding:9px 14px;border-radius:9px;border:0;font:700 14px system-ui;cursor:pointer;" + (alt ? "background:#e5e7eb;color:#111" : "background:#1d4ed8;color:#fff"); b.onclick = fn; return b; };
  const close = () => btn("Chiudi", () => { const d = document.getElementById("rz-bm"); if (d) d.remove(); }, true);
  try {
    if (!/(^|\.)backoffice\.dove\.it$/.test(location.hostname)) { alert("Apri il gestionale Dove.it (backoffice.dove.it) e premi di nuovo il segnalibro."); return; }
    say("\u{23f3} Leggo le notizie da gestire\u{2026}");
    const fib = el => { const k = Object.keys(el).find(k => k.startsWith("__reactFiber")); return k ? el[k] : null; };
    const rows = () => {
      const seen = {}, L = [];
      const add = v => { if (v && typeof v === "object" && v.rumor && v.rumor.id && !seen[v.rumor.id]) { seen[v.rumor.id] = 1; L.push(v); } };
      for (const el of document.querySelectorAll("body *")) {
        const f = fib(el), p = f && f.memoizedProps; if (!p || typeof p !== "object") continue;
        for (const v of Object.values(p)) { if (Array.isArray(v)) { for (const x of v) add(x); } else add(v); }
      }
      return L;
    };
    const grab = () => rows().map(x => ({ boId: String(x.rumor.id), addr: x.rumor.propertyAddress || "", nome: (x.contact && x.contact.name) || "", tel: (x.contact && x.contact.phoneNumber) || "", annuncio: (x.rumor.description || "").replace(/\s+/g, " ").slice(0, 160), stato: x.rumor.status || "", prom: (x.reminder && !x.reminder.resolved && x.reminder.startDate) || "", promNote: ((x.reminder && x.reminder.notes) || "").slice(0, 120), created: x.rumor.createdAt || "" }));
    const go = p => { history.pushState({}, "", "/rumors/explore?page=" + p); dispatchEvent(new PopStateEvent("popstate")); };
    const all = {}; let prevKey = "";
    for (let p = 1; p <= 30; p++) {
      go(p);
      let g = [], key = "";
      for (let t = 0; t < (p === 1 ? 14 : 7); t++) { await w(t ? 700 : 1200); g = grab(); key = g.map(r => r.boId).join(","); if (g.length && key !== prevKey) break; }
      if (!g.length || key === prevKey) break;
      const last = prevKey && g.length < prevKey.split(",").length;
      prevKey = key; let added = 0;
      for (const r of g) if (!all[r.boId]) { all[r.boId] = r; added++; }
      say("\u{23f3} Leggo le notizie da gestire\u{2026} " + Object.keys(all).length);
      if (!added || last) break;
    }
    go(1);
    const list = Object.values(all);
    if (!list.length) { say("\u{26a0}\u{fe0f} Non ho trovato notizie. Apri Notizie \u{2192} Da gestire, aspetta che compaia l'elenco e premi di nuovo il segnalibro.", close()); return; }
    const data = { rz: "notizie", list, at: Date.now() }, txt = JSON.stringify(data);
    let ok = false, timer = null;
    const done = n => { ok = true; clearInterval(timer); say("\u{2705} " + n + " notizie arrivate in Agente Pro. Puoi tornare sull'app.", close()); };
    window.addEventListener("message", e => { if (e.origin === APP && e.data && e.data.rz === "notizie-ok") done(e.data.n); });
    const pump = win => { let k = 0; clearInterval(timer); timer = setInterval(() => { if (ok || k++ > 60 || !win || win.closed) return clearInterval(timer); try { win.postMessage(data, APP); } catch (e) {} }, 500); try { win.postMessage(data, APP); } catch (e) {} };
    const copy = btn("\u{1f4cb} Copia", async () => { try { await navigator.clipboard.writeText(txt); copy.textContent = "\u{2713} Copiate: nell'app premi \u{201c}Incolla\u{201d}"; } catch (e) { prompt("Copia questo testo e incollalo nell'app:", txt); } }, true);
    const send = btn("\u{1f4e4} Manda ad Agente Pro", () => { const win = window.open(APP + "/#notizie", "agentepro"); if (!win) { say("\u{26a0}\u{fe0f} Il browser ha bloccato la finestra. Usa \u{201c}Copia\u{201d} e poi \u{201c}Incolla\u{201d} nell'app.", copy, close()); return; } say("\u{1f4e4} Invio " + list.length + " notizie ad Agente Pro\u{2026}", copy, close()); pump(win); });
    if (window.opener) { say("\u{1f4e4} Invio " + list.length + " notizie ad Agente Pro\u{2026}"); pump(window.opener); await w(2500); }
    if (!ok) say("\u{2705} Lette " + list.length + " notizie da gestire.", send, copy, close());
  } catch (e) {
    say("\u{26a0}\u{fe0f} Errore nella lettura: " + (e && e.message || e) + ". Ricarica la pagina e riprova.", close());
  } finally { window.__rzBoRunning = false; }
})();
