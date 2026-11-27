// chrome.* stand-in so the real extension pages and content script run in a normal tab.
// Scenes describe their data in /scenes/seeds/<name>.js (?seed=<name>). Nothing is persisted.
(function () {
  const q = new URLSearchParams(location.search);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  window.__READY = false;
  window.__WAIT = true;

  const seedName = q.get('seed');
  if (seedName) {
    const x = new XMLHttpRequest();
    x.open('GET', '/scenes/seeds/' + seedName + '.js', false);
    x.send();
    if (x.status !== 200) console.error('seed not found: ' + seedName);
    else (0, eval)(x.responseText + '\n//# sourceURL=seed-' + seedName + '.js');
  }

  // ── helpers for seeds (page coordinates of DOM things) ───────────────────────
  const page = (r) => ({ x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height });
  window.__WN = {
    rect(sel) { const el = document.querySelector(sel); if (!el) throw new Error('no element ' + sel); return page(el.getBoundingClientRect()); },
    text(phrase, nth = 0) {
      const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let n, seen = 0;
      while ((n = w.nextNode())) {
        const i = n.textContent.indexOf(phrase);
        if (i < 0 || n.parentElement.closest('#webnote-shadow-host')) continue;
        if (seen++ < nth) continue;
        const r = document.createRange(); r.setStart(n, i); r.setEnd(n, i + phrase.length);
        const rects = [...r.getClientRects()].map(page);
        return { ...page(r.getBoundingClientRect()), lines: rects };
      }
      throw new Error('text not found: ' + phrase);
    },
    // hand-drawn looking loop around a box
    loop(b, pad = 8, seed = 1) {
      const cx = b.x + b.w / 2, cy = b.y + b.h / 2, rx = b.w / 2 + pad + 6, ry = b.h / 2 + pad;
      let s = seed * 9301 + 49297; const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
      const pts = [], N = 44;
      for (let i = 0; i <= N; i++) {
        const t = -0.5 + (i / N) * 2.18 * Math.PI;           // a bit more than one turn
        const k = 1 + 0.035 * Math.sin(t * 2 + seed) + (rnd() - 0.5) * 0.02 + (i / N) * 0.05;
        pts.push([cx + Math.cos(t) * rx * k, cy + Math.sin(t) * ry * k]);
      }
      return 'M ' + pts.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L ');
    },
    underline(x1, x2, y, amp = 3, seed = 2) {
      const pts = []; const N = Math.max(8, Math.round((x2 - x1) / 10));
      for (let i = 0; i <= N; i++) pts.push([x1 + ((x2 - x1) * i) / N, y + Math.sin(i * 1.3 + seed) * amp * (i % 2 ? 1 : 0.4)]);
      return 'M ' + pts.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L ');
    },
    // smooth curve through points, drawn as a polyline (the extension stores freehand paths this way)
    curve(points, steps = 14) {
      const out = [];
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[Math.max(0, i - 1)], p1 = points[i], p2 = points[i + 1], p3 = points[Math.min(points.length - 1, i + 2)];
        for (let t = 0; t < 1; t += 1 / steps) {
          const t2 = t * t, t3 = t2 * t;
          out.push([0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
                    0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)]);
        }
      }
      out.push(points[points.length - 1]);
      return 'M ' + out.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L ');
    },
    id: (() => { let n = 1700000000000; return () => String(n++); })(),
  };

  // ── storage ───────────────────────────────────────────────────────────────────
  const listeners = [];
  const clone = (v) => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));
  let store = null;
  const ensure = () => {
    if (store) return store;
    const s = typeof window.__SEED === 'function' ? window.__SEED(location.href) : (window.__SEED || {});
    store = clone(s);
    return store;
  };
  const read = (keys) => {
    const st = ensure();
    if (keys == null) return clone(st);
    if (typeof keys === 'string') keys = [keys];
    const out = {};
    if (Array.isArray(keys)) keys.forEach((k) => { if (k in st) out[k] = clone(st[k]); });
    else Object.keys(keys).forEach((k) => { out[k] = k in st ? clone(st[k]) : keys[k]; });
    return out;
  };
  const local = {
    // like the real API: answers a callback if one is given, and returns a promise
    async get(keys, callback) {
      const out = read(keys);
      if (typeof callback === 'function') setTimeout(() => callback(out), 0);
      return out;
    },
    async set(items) {
      const st = ensure();
      const changes = {};
      for (const [k, v] of Object.entries(items)) { changes[k] = { oldValue: clone(st[k]), newValue: clone(v) }; st[k] = clone(v); }
      setTimeout(() => listeners.forEach((cb) => cb(changes, 'local')), 0);
    },
  };
  const pageUrl = () => window.__PAGE_URL || location.href;

  window.__sent = [];
  window.chrome = {
    storage: { local, onChanged: { addListener: (cb) => listeners.push(cb) } },
    runtime: {
      getManifest: () => ({ version: '2.3.0' }),
      getURL: (p) => '/ext/' + p,
      sendMessage: (msg, cb) => {
        window.__sent.push(msg);
        // the content script gets its stylesheet from the background worker
        const reply = msg.action === 'GET_CONTENT_CSS' ? fetch('/ext/content.css').then((r) => r.text()).then((css) => ({ css })) : Promise.resolve({});
        if (typeof cb === 'function') reply.then((v) => setTimeout(() => cb(v), 0));
        return reply;
      },
      onMessage: { addListener() {} },
      openOptionsPage() {},
      lastError: undefined,
    },
    tabs: {
      query: async () => [{ id: 1, url: pageUrl() }],
      // the popup asks the page how many notes it shows
      sendMessage: (id, msg) => Promise.resolve(msg && msg.action === 'GET_PAGE_COUNT'
        ? { ok: true, count: (ensure().notes || []).filter((n) => n.url === pageUrl()).length } : {}),
    },
    scripting: { executeScript: async () => {} },
  };

  // ── readiness: wait for the content script UI, run the scene's actions, then flag done ──
  window.addEventListener('load', async () => {
    const hasContent = !!document.querySelector('script[src$="content.js"]');
    const t0 = Date.now();
    if (hasContent) {
      while (Date.now() - t0 < 8000) {
        const h = document.getElementById('webnote-shadow-host');
        if (h && h.shadowRoot && h.shadowRoot.querySelector('#webnote-drawbar')) break;
        await sleep(100);
      }
      await sleep(1200); // highlights are restored 700 ms after start
    } else {
      await sleep(500);
    }
    try { if (window.__AFTER_LOAD) await window.__AFTER_LOAD(); } catch (e) { console.error('AFTER_LOAD failed: ' + e.message); }
    await sleep(700);
    window.__READY = true;
  });
})();
