// background.js - WebNote v3
'use strict';

function setupMenus() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({ id: 'add-note',       title: 'WebNote: Create Note', contexts: ['all'] });
    chrome.contextMenus.create({ id: 'add-note-sel',   title: 'WebNote: Note from Selection', contexts: ['selection'] });
    chrome.contextMenus.create({ id: 'add-highlight',  title: 'WebNote: Highlight Text 🖊',  contexts: ['selection'] });
  });
}

chrome.runtime.onInstalled.addListener(setupMenus);
chrome.runtime.onStartup.addListener(setupMenus);

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const msgMap = {
    'add-note':      { action: 'ADD_NOTE',      text: info.selectionText || '' },
    'add-note-sel':  { action: 'ADD_NOTE',      text: info.selectionText || '' },
    'add-highlight': { action: 'ADD_HIGHLIGHT', text: info.selectionText || '' },
  };
  const msg = msgMap[info.menuItemId];
  if (msg) chrome.tabs.sendMessage(tab.id, msg).catch(() => {});
});

// Helper to convert data URL to Blob in service worker
function dataURLToBlob(dataURL) {
  const parts = dataURL.split(';base64,');
  const contentType = parts[0].split(':')[1];
  const raw = atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);
  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }
  return new Blob([uInt8Array], { type: contentType });
}

// ── Messages & Badge ────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'UPDATE_BADGE') {
    const tabId = sender.tab?.id;
    if (!tabId) return;
    const text = msg.count > 0 ? String(msg.count) : '';
    chrome.action.setBadgeText({ text, tabId });
    chrome.action.setBadgeBackgroundColor({ color: '#6366f1', tabId });
  }

  if (msg.action === 'CAPTURE_VISIBLE') {
    chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
      if (!dataUrl) {
        sendResponse({ error: 'Failed to capture tab' });
        return;
      }
      
      if (msg.crop) {
        (async () => {
          try {
            const { x, y, w, h, dpr } = msg.crop;
            const blob = dataURLToBlob(dataUrl);
            const bitmap = await createImageBitmap(blob);
            
            const rx = Math.round(x * dpr);
            const ry = Math.round(y * dpr);
            const rw = Math.round(w * dpr);
            const rh = Math.round(h * dpr);
            
            const canvas = new OffscreenCanvas(rw, rh);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(bitmap, rx, ry, rw, rh, 0, 0, rw, rh);
            
            const croppedBlob = await canvas.convertToBlob({ type: 'image/png' });
            const arrayBuffer = await croppedBlob.arrayBuffer();
            const bytes = new Uint8Array(arrayBuffer);
            let binary = '';
            const len = bytes.byteLength;
            const chunkSize = 65536;
            for (let i = 0; i < len; i += chunkSize) {
              const chunk = bytes.subarray(i, i + chunkSize);
              binary += String.fromCharCode.apply(null, chunk);
            }
            const base64 = btoa(binary);
            const croppedDataUrl = `data:image/png;base64,${base64}`;
            
            sendResponse({ dataUrl: croppedDataUrl });
          } catch (e) {
            console.error('[WebNote] Offscreen crop error:', e);
            sendResponse({ dataUrl }); // Fallback to full screen if crop fails
          }
        })();
      } else {
        sendResponse({ dataUrl });
      }
    });
    return true; // async
  }

  if (msg.action === 'STITCH_SCREENSHOTS') {
    (async () => {
      try {
        const { frames, totalH, viewH, viewW, dpr } = msg;
        const canvasW = Math.round(viewW * dpr);
        const canvasH = Math.round(totalH * dpr);
        const canvas = new OffscreenCanvas(canvasW, canvasH);
        const ctx = canvas.getContext('2d');

        for (const frame of frames) {
          const blob = dataURLToBlob(frame.dataUrl);
          const bitmap = await createImageBitmap(blob);

          // How much of this frame is "new" content (avoid double-drawing the overlap
          // on the last strip which may be shorter than a full viewport)
          const drawH = Math.min(viewH, totalH - frame.offsetY);
          const srcH = Math.round(drawH * dpr);
          const destY = Math.round(frame.offsetY * dpr);

          ctx.drawImage(
            bitmap,
            0, 0, canvasW, srcH,      // source: full width, only the valid strip
            0, destY, canvasW, srcH   // dest: correct Y position
          );
          bitmap.close();
        }

        const resultBlob = await canvas.convertToBlob({ type: 'image/png' });
        const arrayBuffer = await resultBlob.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        const len = bytes.byteLength;
        const chunkSize = 65536;
        for (let i = 0; i < len; i += chunkSize) {
          binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
        }
        const base64 = btoa(binary);
        sendResponse({ dataUrl: `data:image/png;base64,${base64}` });
      } catch (e) {
        console.error('[WebNote] Stitch error:', e);
        sendResponse({ error: String(e) });
      }
    })();
    return true; // async
  }
});

// Update badge when switching tabs
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  try {
    const tab  = await chrome.tabs.get(tabId);
    const data = await chrome.storage.local.get('notes');
    const notes = data.notes || [];
    const count = notes.filter(n => n.url === tab.url).length;
    chrome.action.setBadgeText({ text: count > 0 ? String(count) : '', tabId });
    chrome.action.setBadgeBackgroundColor({ color: '#6366f1', tabId });
  } catch(_) {}
});

chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  if (info.status !== 'complete') return;
  try {
    const data  = await chrome.storage.local.get('notes');
    const notes = data.notes || [];
    const count = notes.filter(n => n.url === tab.url).length;
    chrome.action.setBadgeText({ text: count > 0 ? String(count) : '', tabId });
    chrome.action.setBadgeBackgroundColor({ color: '#6366f1', tabId });
  } catch(_) {}
});
