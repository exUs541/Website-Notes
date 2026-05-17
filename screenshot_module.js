
// ── Screenshot Module ───────────────────────────────────────────────────────
function startScreenshotMode() {
  const container = document.querySelector('#webnote-shadow-host');
  if (!container) return;
  const shadow = container.shadowRoot;
  
  // Remove existing if any
  const old = shadow.querySelector('.wn-ss-overlay');
  if (old) old.remove();

  const overlay = document.createElement('div');
  overlay.className = 'wn-ss-overlay';
  overlay.style.pointerEvents = 'all'; // Crucial for catching events
  let mode = 'crop'; 
  let useClipboard = false;

  overlay.innerHTML = `
    <div class="wn-ss-tools">
      <button class="wn-ss-tool active" data-m="crop" title="Bereich auswählen">${ICONS.crop}</button>
      <button class="wn-ss-tool" data-m="target" title="Element auswählen">${ICONS.target}</button>
      <button class="wn-ss-tool" data-m="screen" title="Ganzes Fenster">${ICONS.monitor}</button>
      <div class="db-sep"></div>
      <button class="wn-ss-tool wn-ss-clip" title="In Zwischenablage kopieren">${ICONS.clipboard}</button>
      <div class="db-sep"></div>
      <button class="wn-ss-tool wn-ss-close" title="Abbrechen">${ICONS.close}</button>
    </div>
    <div class="wn-ss-hint">Bereich mit der Maus auswählen</div>
    <div class="wn-ss-area" style="display:none; position:absolute; border:2px solid #6366f1; background:rgba(99,102,241,0.1); pointer-events:none;"></div>
    <div class="wn-ss-target" style="display:none; position:absolute; border:2px solid #6366f1; background:rgba(99,102,241,0.2); pointer-events:none; z-index:2147483646;"></div>
  `;

  shadow.appendChild(overlay);

  const tools = overlay.querySelectorAll('.wn-ss-tool[data-m]');
  const hint = overlay.querySelector('.wn-ss-hint');
  const areaEl = overlay.querySelector('.wn-ss-area');
  const targetEl = overlay.querySelector('.wn-ss-target');
  const clipBtn = overlay.querySelector('.wn-ss-clip');

  clipBtn.onclick = (e) => {
    e.stopPropagation();
    useClipboard = !useClipboard;
    clipBtn.classList.toggle('active', useClipboard);
  };

  const setMode = (m) => {
    mode = m;
    tools.forEach(t => t.classList.toggle('active', t.dataset.m === m));
    hint.textContent = m === 'crop' ? 'Bereich mit der Maus auswählen' : 
                       m === 'target' ? 'Element anklicken' : 'Klicken für Vollbild';
    areaEl.style.display = 'none';
    targetEl.style.display = 'none';
  };

  tools.forEach(t => t.onclick = (e) => { e.stopPropagation(); setMode(t.dataset.m); });
  overlay.querySelector('.wn-ss-close').onclick = (e) => { e.stopPropagation(); overlay.remove(); };

  let isDragging = false, sX, sY;

  overlay.addEventListener('mousedown', (e) => {
    if (e.target !== overlay && e.target !== areaEl) return;
    if (mode === 'screen') { doCapture(); return; }
    if (mode === 'target') return;

    isDragging = true;
    sX = e.clientX; sY = e.clientY;
    areaEl.style.left = sX + 'px'; areaEl.style.top = sY + 'px';
    areaEl.style.width = '0px'; areaEl.style.height = '0px';
    areaEl.style.display = 'block';
  });

  overlay.addEventListener('mousemove', (e) => {
    if (mode === 'target') {
      overlay.style.pointerEvents = 'none';
      const el = document.elementFromPoint(e.clientX, e.clientY);
      overlay.style.pointerEvents = 'all';
      if (el && el.id !== 'webnote-shadow-host') {
        const r = el.getBoundingClientRect();
        targetEl.style.left = r.left + 'px'; targetEl.style.top = r.top + 'px';
        targetEl.style.width = r.width + 'px'; targetEl.style.height = r.height + 'px';
        targetEl.style.display = 'block';
      }
    }
    if (!isDragging) return;
    const curX = e.clientX, curY = e.clientY;
    const x = Math.min(sX, curX), y = Math.min(sY, curY);
    const w = Math.abs(curX - sX), h = Math.abs(curY - sY);
    areaEl.style.left = x + 'px'; areaEl.style.top = y + 'px';
    areaEl.style.width = w + 'px'; areaEl.style.height = h + 'px';
  });

  overlay.addEventListener('mouseup', (e) => {
    if (mode === 'target') {
      overlay.style.pointerEvents = 'none';
      const el = document.elementFromPoint(e.clientX, e.clientY);
      overlay.style.pointerEvents = 'all';
      if (el) {
        const r = el.getBoundingClientRect();
        doCapture(r.left, r.top, r.width, r.height);
      }
      return;
    }
    if (!isDragging) return;
    isDragging = false;
    const r = areaEl.getBoundingClientRect();
    if (r.width > 5 && r.height > 5) {
      doCapture(r.left, r.top, r.width, r.height);
    }
  });

  // Synchronously converts a dataURL to a Blob without calling fetch()
  // This completely bypasses webpage CSP constraints on data URIs.
  function dataURLToBlob(dataURL) {
    const parts = dataURL.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }
    return new Blob([uInt8Array], { type: contentType });
  }

  function doCapture(x, y, w, h) {
    overlay.remove();
    // Tiny delay to ensure overlay is gone from the screenshot
    setTimeout(() => {
      const isFullscreen = (x === undefined || y === undefined);
      const dpr = window.devicePixelRatio || 1;
      
      const msg = { action: 'CAPTURE_VISIBLE' };
      if (!isFullscreen) {
        msg.crop = { x, y, w, h, dpr };
      }

      chrome.runtime.sendMessage(msg, (res) => {
        if (!res || !res.dataUrl) {
          console.error('[WebNote] Capture failed or no dataUrl');
          return;
        }

        // All captures (fullscreen, crop, element) are now processed 
        // through the secure background/service worker pipeline.
        handleResult(res.dataUrl);
      });
    }, 150);
  }

  async function handleResult(dataUrl) {
    if (useClipboard) {
      window.focus();
      try {
        const blob = dataURLToBlob(dataUrl);
        const item = new ClipboardItem({ [blob.type]: blob });
        await navigator.clipboard.write([item]);
        showToast('In Zwischenablage kopiert!');
      } catch (err) {
        console.error('[WebNote] Clipboard error:', err);
        // Fallback: download if copy fails
        try {
          const blob = dataURLToBlob(dataUrl);
          downloadBlob(blob);
        } catch (_) {}
      }
    } else {
      try {
        const blob = dataURLToBlob(dataUrl);
        downloadBlob(blob);
      } catch (_) {}
    }
  }

  function downloadBlob(blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `webnote-ss-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  function showToast(msg) {
    const t = document.createElement('div');
    t.style.cssText = 'position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:#1e293b;color:white;padding:12px 24px;border-radius:100px;z-index:2147483647;font-size:14px;box-shadow:0 10px 30px rgba(0,0,0,0.3);';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => { t.style.opacity='0'; t.style.transition='0.3s'; setTimeout(()=>t.remove(), 300); }, 2000);
  }
}
