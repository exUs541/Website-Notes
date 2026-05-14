// background.js - WebNote v3
'use strict';

function setupMenus() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({ id: 'add-note',       title: 'WebNote: Notiz erstellen', contexts: ['all'] });
    chrome.contextMenus.create({ id: 'add-note-sel',   title: 'WebNote: Notiz zu Auswahl', contexts: ['selection'] });
    chrome.contextMenus.create({ id: 'add-highlight',  title: 'WebNote: Text markieren 🖊',  contexts: ['selection'] });
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
      sendResponse({ dataUrl });
    });
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
