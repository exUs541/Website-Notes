// background.js - WebNote v3
'use strict';

importScripts('i18n.js');
const I18n = self.WebNoteI18n;

// Context-menu titles follow the language chosen in the popup. Calls are chained so that a
// language change during start-up cannot interleave two remove/create rounds.
let menuQueue = Promise.resolve();

function setupMenus() {
  menuQueue = menuQueue.then(buildMenus).catch((e) => console.warn('[WebNote] context menu setup failed', e));
  return menuQueue;
}

async function buildMenus() {
  await I18n.init();
  await new Promise((resolve) => chrome.contextMenus.removeAll(() => {
    if (chrome.runtime.lastError) { /* ignore */ }
    resolve();
  }));
  const ignoreErr = () => { if (chrome.runtime.lastError) {} };
  chrome.contextMenus.create({ id: 'add-note',       title: I18n.t('ctx.createNote'),          contexts: ['all'] }, ignoreErr);
  chrome.contextMenus.create({ id: 'add-note-sel',   title: I18n.t('ctx.noteFromSelection'),   contexts: ['selection'] }, ignoreErr);
  chrome.contextMenus.create({ id: 'add-highlight',  title: I18n.t('ctx.highlight'),           contexts: ['selection'] }, ignoreErr);
}

// ── Master switch ─────────────────────────────────────────────────────────────
// `extensionEnabled` (popup toggle, chrome.storage.local, on by default). While it is off the
// right-click entries are removed and the toolbar badge shows OFF instead of a note count.
async function applyEnabledState(enabled) {
  if (enabled) setupMenus(); else chrome.contextMenus.removeAll();
  chrome.action.setBadgeText({ text: enabled ? '' : 'OFF' });
  if (!enabled) chrome.action.setBadgeBackgroundColor({ color: '#6b7280' });
  const tabs = await chrome.tabs.query({});
  tabs.forEach(t => refreshTabBadge(t.id, t.url));
}

async function isEnabled() {
  const { extensionEnabled } = await chrome.storage.local.get('extensionEnabled');
  return extensionEnabled !== false;
}

// Badge of one tab: OFF while the extension is off, otherwise the number of its notes.
async function refreshTabBadge(tabId, url) {
  try {
    const data = await chrome.storage.local.get(['notes', 'extensionEnabled']);
    if (data.extensionEnabled === false) {
      chrome.action.setBadgeText({ text: 'OFF', tabId });
      chrome.action.setBadgeBackgroundColor({ color: '#6b7280', tabId });
      return;
    }
    const notes = data.notes || [];
    const count = notes.filter(n => n.url === url).length;
    chrome.action.setBadgeText({ text: count > 0 ? String(count) : '', tabId });
    chrome.action.setBadgeBackgroundColor({ color: '#6366f1', tabId });
  } catch (_) {}
}

chrome.runtime.onInstalled.addListener(async () => applyEnabledState(await isEnabled()));
chrome.runtime.onStartup.addListener(async () => applyEnabledState(await isEnabled()));
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.extensionEnabled) applyEnabledState(changes.extensionEnabled.newValue !== false);
});
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.language) isEnabled().then((on) => { if (on) setupMenus(); });
});

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

// Convert a Blob to dataURL in a call stack size safe way
async function blobToDataURL(blob) {
  if (typeof FileReader !== 'undefined') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
  // Fallback chunked conversion with stack-safe chunk size (8192)
  const arrayBuffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';
  const chunkSize = 8192;
  const len = bytes.byteLength;
  for (let i = 0; i < len; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, chunk);
  }
  return `data:${blob.type};base64,${btoa(binary)}`;
}

// ── Messages & Badge ────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'UPDATE_BADGE') {
    const tabId = sender.tab?.id;
    if (!tabId) return;
    const text = msg.count > 0 ? String(msg.count) : '';
    chrome.storage.local.get('extensionEnabled').then(({ extensionEnabled }) => {
      if (extensionEnabled === false) return; // switched off: the badge keeps saying OFF
      chrome.action.setBadgeText({ text, tabId });
      chrome.action.setBadgeBackgroundColor({ color: '#6366f1', tabId });
    });
  }

  // The content script styles its shadow root with this text, see loadStyles() in content.js.
  if (msg.action === 'GET_CONTENT_CSS') {
    fetch(chrome.runtime.getURL('content.css'))
      .then((r) => r.text())
      .then((css) => sendResponse({ css }), (e) => sendResponse({ error: String(e) }));
    return true; // async
  }

  if (msg.action === 'DOWNLOAD_FILE') {
    chrome.downloads.download({
      url: msg.url,
      filename: msg.filename,
      saveAs: true
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      } else {
        sendResponse({ success: true, downloadId });
      }
    });
    return true; // async
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
            const croppedDataUrl = await blobToDataURL(croppedBlob);
            
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
        const stitchedDataUrl = await blobToDataURL(resultBlob);
        sendResponse({ dataUrl: stitchedDataUrl });
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
    const tab = await chrome.tabs.get(tabId);
    refreshTabBadge(tabId, tab.url);
  } catch(_) {}
});

chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  if (info.status !== 'complete') return;
  refreshTabBadge(tabId, tab.url);
});
