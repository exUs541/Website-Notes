// content.js - WebNote v3.1
'use strict';

const ICONS = {
  drag: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>`,
  vert: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/><path d="m13 16 4 4 4-4"/><path d="M17 20V4"/></svg>`,
  horiz: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 3-4 4 4 4"/><path d="M4 7h16"/><path d="m16 13 4 4-4 4"/><path d="M20 17H4"/></svg>`,
  list: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
  plus: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  cursor: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="m13 13 6 6"/></svg>`,
  pen: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>`,
  highlighter: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 11-6 6v3h9l3-3"/><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/></svg>`,
  brush: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 22 .71-7.12 6.13-6.13a3.5 3.5 0 0 0-4.95-4.95l-6.13 6.13L1 12Z"/><path d="m9 8 5 5"/></svg>`,
  rect: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/></svg>`,
  circle: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>`,
  line: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 22 20-20"/></svg>`,
  undo: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>`,
  redo: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/></svg>`,
  eraser: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.4 5.4c1 1 1 2.5 0 3.4L17 17"/><path d="m22 21H7"/><path d="m5 11 9 9"/></svg>`,
  minimize: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 15 6 6m-6-6v4.8m0-4.8h4.8M9 9 3 3m6 6V4.2M9 9H4.2"/></svg>`,
  left: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>`,
  up: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>`,
  close: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  pin: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/></svg>`,
  pinned: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/></svg>`,
  palette: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.92 0 1.7-.72 1.7-1.65 0-.44-.19-.84-.49-1.15-.3-.3-.49-.71-.49-1.2 0-.92.73-1.64 1.63-1.64h2.9c3.04 0 5.5-2.43 5.5-5.46C22 5.4 17.53 2 12 2z"/></svg>`,
  duplicate: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`,
  compact: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  expand: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg>`,
  trash: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`,
  refresh: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>`,
  tags: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`,
  camera: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>`,
  crop: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/></svg>`,
  monitor: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
  target: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>`,
  clipboard: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>`,
  download: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
};

// content.js - WebNote v3.1


// ── State ─────────────────────────────────────────────────────────────────────
let notes      = [];
let highlights = [];
let rules      = { hiddenUrls: [] };
let shadow     = null;
let sidebarSort = 'date-desc';
let sidebarGroup = 'none';

let drawings   = [];
let activeTool = 'cursor'; // cursor, highlight, draw, rect, ellipse
let activeColor = '#ef4444'; // default red
let selectedDrawingId = null;
let toolbarState = { x: null, y: 20, min: false, vert: false, hidden: false };

let undoStack = [];
let redoStack = [];
let isEraserDragging = false;

function saveDrawingSnapshot() {
  const cur = normUrl(location.href);
  undoStack.push(JSON.stringify(drawings.filter(d => normUrl(d.url) === cur)));
  redoStack = [];
}

function performUndo() {
  if (undoStack.length === 0) return;
  const cur = normUrl(location.href);
  redoStack.push(JSON.stringify(drawings.filter(d => normUrl(d.url) === cur)));
  const prevState = JSON.parse(undoStack.pop());
  drawings = drawings.filter(d => normUrl(d.url) !== cur).concat(prevState);
  saveDrawings();
  renderDrawings();
}

function performRedo() {
  if (redoStack.length === 0) return;
  const cur = normUrl(location.href);
  undoStack.push(JSON.stringify(drawings.filter(d => normUrl(d.url) === cur)));
  const nextState = JSON.parse(redoStack.pop());
  drawings = drawings.filter(d => normUrl(d.url) !== cur).concat(nextState);
  saveDrawings();
  renderDrawings();
}

const NOTE_COLORS = [
  { v: null,      bg: '#ffffff', label: 'Standard' },
  { v: '#fef9c3', bg: '#fef9c3', label: 'Gelb' },
  { v: '#dcfce7', bg: '#dcfce7', label: 'Grün' },
  { v: '#dbeafe', bg: '#dbeafe', label: 'Blau' },
  { v: '#fce7f3', bg: '#fce7f3', label: 'Rosa' },
  { v: '#ede9fe', bg: '#ede9fe', label: 'Lila' },
  { v: '#ffedd5', bg: '#ffedd5', label: 'Orange' },
  { v: '#f1f5f9', bg: '#f1f5f9', label: 'Grau' },
];
const TEXT_COLORS = ['#1e293b','#ef4444','#f97316','#eab308','#22c55e','#3b82f6','#a855f7','#ec4899','#ffffff'];
const HL_COLORS   = ['#fef08a','#bbf7d0','#bfdbfe','#fbcfe8','#ddd6fe','#fed7aa', null];

let activeHlColor = '#fef08a';

// ── URL Helpers ──────────────────────────────────────────────────────────────
function normUrl(u) {
  try { const x = new URL(u); x.hash = ''; return x.toString().replace(/\/$/, ''); }
  catch(_) { return u; }
}

// ── Note Migration (old schema → new schema) ──────────────────────────────────
function migrateNote(note) {
  // Tags
  if (!note.tags) note.tags = [];
  if (!note.title) note.title = 'Notiz';
  if (note.color === undefined) note.color = null;

  // Old notes had pinnedToSelector (element-pinning) - reset them to safe viewport coords
  if (note.pinnedToSelector !== undefined || note.pinned === undefined) {
    note.pinned = false;
    delete note.pinnedToSelector;
    // Old x/y were page-absolute → clamp to a safe visible viewport region
    note.x = Math.max(20, Math.min(note.x || 80, 500));
    note.y = Math.max(60, Math.min(note.y || 100, 400));
  }
  if (!note.pageX) note.pageX = (note.x || 80)  + (window.scrollX || 0);
  if (!note.pageY) note.pageY = (note.y || 100) + (window.scrollY || 0);

  // Normalize display mode (old: 'minimized' → just go 'full')
  if (!['full', 'compact'].includes(note.displayMode)) note.displayMode = 'full';

  return note;
}

// ── Init ──────────────────────────────────────────────────────────────────────
async function init() {
  try {
    const data = await chrome.storage.local.get(['notes','highlights','rules','sidebarSort','sidebarGroup','drawings','toolbarState']);
    notes      = (data.notes || []).map(migrateNote);
    highlights = data.highlights || [];
    rules      = data.rules      || { hiddenUrls: [] };
    sidebarSort  = data.sidebarSort  || 'date-desc';
    sidebarGroup = data.sidebarGroup || 'none';
    drawings   = data.drawings || [];
    toolbarState = data.toolbarState || { x: null, y: 20, min: false, vert: false, hidden: false };
    injectUI();
    renderPageNotes();
    restoreHighlights();
    renderDrawings();
    updateBadge();
    window.addEventListener('scroll', updatePinnedPositions, { passive: true });
    console.log(`[WebNote] v${chrome.runtime.getManifest().version} ready`);
  } catch(e) {
    console.error('[WebNote] init failed', e);
  }
}

// ── Pin Position System ────────────────────────────────────────────────────────
// Unpinned: note.x, note.y = viewport (screen) coordinates → stays on screen when scrolling
// Pinned:   note.pageX, note.pageY = absolute page coordinates → stays at page location

function updatePinnedPositions() {
  if (!shadow) return;
  notes.filter(n => n.url === location.href && n.pinned).forEach(note => {
    const el = shadow.querySelector(`#note-${note.id}`);
    if (el) {
      el.style.left = `${note.pageX - scrollX}px`;
      el.style.top  = `${note.pageY - scrollY}px`;
    }
  });
  const svg = shadow.querySelector('#webnote-drawing-board');
  if (svg) {
    svg.style.transform = `translate(${-scrollX}px, ${-scrollY}px)`;
  }
}

// ── UI Shell ──────────────────────────────────────────────────────────────────
function injectUI() {
  const ex = document.querySelector('#webnote-shadow-host');
  let host;
  if (ex) {
    host = ex;
    shadow = ex.shadowRoot || ex.attachShadow({ mode: 'open' });
  } else {
    host = document.createElement('div');
    host.id = 'webnote-shadow-host';
    host.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:2147483647;pointer-events:none;';
    document.body.appendChild(host);
    shadow = host.attachShadow({ mode: 'open' });
  }

  if (shadow.querySelector('#webnote-drawbar')) return;

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = chrome.runtime.getURL('content.css');
  shadow.appendChild(link);

  // SVG Drawing Overlay
  const svgNS = "http://www.w3.org/2000/svg";
  const svgOverlay = document.createElementNS(svgNS, "svg");
  svgOverlay.id = 'webnote-drawing-board';
  svgOverlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:2147483646;';
  shadow.appendChild(svgOverlay);

  // Drawing Toolbar
  const drawBar = document.createElement('div');
  drawBar.id = 'webnote-drawbar';
  drawBar.className = `webnote-drawbar ${toolbarState.vert ? 'vertical' : ''} ${toolbarState.min ? 'minimized' : ''}`;
  drawBar.style.pointerEvents = 'all';
  if (toolbarState.x !== null && toolbarState.y !== null) {
    drawBar.style.left = `${toolbarState.x}px`;
    drawBar.style.top = `${toolbarState.y}px`;
    drawBar.style.transform = 'none';
  }
  if (toolbarState.hidden) {
    drawBar.style.display = 'none';
  }

  drawBar.innerHTML = `
    <div class="db-min-icon" title="Open WebNote">${ICONS.highlighter}</div>
    <div class="db-full">
      <div class="db-drag-handle" title="Drag to Move">${ICONS.drag}</div>
      <button class="db-tool db-toggle-dir" title="Change Orientation">${toolbarState.vert ? ICONS.horiz : ICONS.vert}</button>
      <div class="db-sep"></div>
      <button class="db-tool db-btn-list" title="All Notes (Sidebar)">${ICONS.list}</button>
      <button class="db-tool db-btn-new" title="New Note">${ICONS.plus}</button>
      <div class="db-sep"></div>
      <button class="db-tool active" data-tool="cursor" title="Mouse (Normal)">${ICONS.cursor}</button>
      <button class="db-tool" data-tool="highlight" title="Highlight Text">${ICONS.highlighter}</button>
      <div class="db-sep"></div>
      <button class="db-tool" data-tool="draw" title="Freehand Drawing">${ICONS.pen}</button>
      <button class="db-tool" data-tool="rect" title="Rectangle">${ICONS.rect}</button>
      <button class="db-tool" data-tool="ellipse" title="Circle">${ICONS.circle}</button>
      <button class="db-tool" data-tool="line" title="Line">${ICONS.line}</button>
      <div class="db-sep"></div>
      <div class="db-colors">
        <div class="db-color active" data-c="#ef4444" style="background:#ef4444;"></div>
        <div class="db-color" data-c="#3b82f6" style="background:#3b82f6;"></div>
        <div class="db-color" data-c="#22c55e" style="background:#22c55e;"></div>
        <div class="db-color" data-c="#eab308" style="background:#eab308;"></div>
        <div class="db-color" data-c="#1e293b" style="background:#1e293b;"></div>
      </div>
      <div class="db-sep"></div>
      <button class="db-tool db-btn-undo" title="Undo">${ICONS.undo}</button>
      <button class="db-tool db-btn-redo" title="Redo">${ICONS.redo}</button>
      <div class="db-sep"></div>
      <button class="db-tool" data-tool="eraser" title="Eraser">${ICONS.eraser}</button>
      <button class="db-tool db-btn-clear" title="Clear all on this page">${ICONS.trash}</button>
      <div class="db-sep"></div>
      <button class="db-tool db-btn-screenshot" title="Capture Screenshot">${ICONS.camera}</button>
      <button class="db-tool db-btn-min" title="Minimize">${toolbarState.vert ? ICONS.up : ICONS.left}</button>
      <button class="db-tool db-btn-close" title="Hide Toolbar">${ICONS.close}</button>
    </div>
  `;
  shadow.appendChild(drawBar);

  // Sidebar
  const sb = document.createElement('div');
  sb.id = 'webnote-sidebar';
  sb.className = 'webnote-sidebar hidden';
  sb.style.pointerEvents = 'all';
  const v = chrome.runtime.getManifest().version;
  sb.innerHTML = `
    <div class="sb-header">
      <div class="sb-title">WebNotes <span class="ver-tag">v${v}</span></div>
      <div class="sb-actions">
        <button class="icon-btn sb-refresh" title="Refresh">${ICONS.refresh}</button>
        <button class="icon-btn sb-close" title="Close">${ICONS.close}</button>
      </div>
    </div>
    <div class="sb-search-wrap">
      <input class="sb-search" placeholder="Search…" type="text">
      <div class="sb-controls">
        <select class="sb-sort-sel" title="Sort by">
          <option value="date-desc">Newest first</option>
          <option value="date-asc">Oldest first</option>
          <option value="alpha">Alphabetical</option>
          <option value="manual">Manual (Drag & Drop)</option>
        </select>
        <select class="sb-group-sel" title="Group by">
          <option value="none">No Group</option>
          <option value="tags">By Tags</option>
          <option value="month">By Month</option>
        </select>
      </div>
    </div>
    <div class="sb-notes"></div>
    <div class="sb-footer">
      <button class="new-note-btn">+ New Note</button>
    </div>`;
  shadow.appendChild(sb);

  // Set initial selected options
  sb.querySelector('.sb-sort-sel').value = sidebarSort;
  sb.querySelector('.sb-group-sel').value = sidebarGroup;

  sb.querySelector('.sb-refresh').onclick  = () => updateSidebarList(sb.querySelector('.sb-search').value);
  sb.querySelector('.sb-close').onclick    = toggleSidebar;
  sb.querySelector('.new-note-btn').onclick = () => createNote({ x: 60, y: 120 });
  sb.querySelector('.sb-search').oninput   = (e) => updateSidebarList(e.target.value);
  sb.querySelector('.sb-sort-sel').onchange = (e) => { sidebarSort = e.target.value; saveNotes(); updateSidebarList(sb.querySelector('.sb-search').value); };
  sb.querySelector('.sb-group-sel').onchange = (e) => { sidebarGroup = e.target.value; saveNotes(); updateSidebarList(sb.querySelector('.sb-search').value); };

  setupDrawingBoard(svgOverlay, drawBar);
}

// ── Note Creation ─────────────────────────────────────────────────────────────
function createNote(opts = {}) {
  const vx = Math.max(20, Math.min(opts.x ?? 60, (window.innerWidth  || 800) - 310));
  const vy = Math.max(60, Math.min(opts.y ?? 120, (window.innerHeight || 600) - 250));
  const note = {
    id:          Date.now().toString(),
    url:         normUrl(location.href),
    title:       opts.title   || 'New Note',
    content:     opts.content || '',
    tags:        opts.tags    || [],
    x:  vx, y:  vy,
    pageX: vx + scrollX, pageY: vy + scrollY,
    width:  opts.width  || 280,
    height: opts.height || 220,
    displayMode: 'full',
    color:  opts.color || null,
    pinned: false,
  };
  notes.push(note);
  saveNotes();
  renderNote(note);
  updateSidebarList();
  updateBadge();
}

// ── Render ────────────────────────────────────────────────────────────────────
function renderNote(note) {
  if (!shadow || shadow.querySelector(`#note-${note.id}`)) return;
  const el = document.createElement('div');
  el.id = `note-${note.id}`;
  el.style.pointerEvents = 'all';
  el.innerHTML = noteHTML(note);
  shadow.appendChild(el);
  applyStyle(el, note);
  positionNote(el, note);
  bindEvents(el, note);
}

function noteHTML(note) {
  const nc = NOTE_COLORS.map((c,i) =>
    `<div class="sw ns" data-c="${c.v ?? ''}" style="background:${c.bg};${i===0?'border:2px solid #d1d5db':''}" title="${c.label}"></div>`
  ).join('');
  const chips = note.tags.map(t =>
    `<span class="tag-chip">${t}<button class="tag-rm" data-t="${t}">×</button></span>`
  ).join('');

  return `
  <div class="nh">
    <div class="nh-l">
      <span class="dh">${ICONS.drag}</span>
      <button class="icon-btn p-btn ${note.pinned?'pinned':''}" title="${note.pinned?'Unpin':'Pin'}">${note.pinned?ICONS.pinned:ICONS.pin}</button>
      <input class="t-inp" value="${note.title.replace(/"/g,'&quot;')}" placeholder="Title…">
    </div>
    <div class="nh-r">
      <div class="dp-wrap">
        <button class="icon-btn c-btn" title="Background Color">${ICONS.palette}</button>
        <div class="dp nc-dp hidden">${nc}</div>
      </div>
      <button class="icon-btn dup-btn" title="Duplicate">${ICONS.duplicate}</button>
      <button class="icon-btn cp-btn" title="Compact">${ICONS.compact}</button>
      <button class="icon-btn ex-btn" title="Expand">${ICONS.expand}</button>
      <button class="icon-btn dl-btn" title="Delete">${ICONS.trash}</button>
    </div>
  </div>
  <div class="fmt-bar">
    <button class="fb-btn b-btn" title="Bold"><b>B</b></button>
    <button class="fb-btn i-btn" title="Italic"><i>I</i></button>
    <div class="fmt-sep"></div>
    <button class="fb-btn tg-btn" title="Tags">${ICONS.tags}</button>
  </div>
  <div class="nb-wrap">
    <div class="nb" contenteditable="true" spellcheck="true">${note.content}</div>
  </div>
  <div class="tags-row hidden">
    <div class="tags-chips">${chips}</div>
    <input class="tag-inp" placeholder="#tag + Enter" type="text">
  </div>
  <div class="rz"></div>`;
}

function applyStyle(el, note) {
  el.className = ['webnote-sticky', `m-${note.displayMode}`, note.pinned ? 'pinned' : ''].filter(Boolean).join(' ');
  el.style.background = note.color || '';
}

function positionNote(el, note) {
  if (note.pinned) {
    el.style.left = `${note.pageX - scrollX}px`;
    el.style.top  = `${note.pageY - scrollY}px`;
  } else {
    el.style.left = `${note.x}px`;
    el.style.top  = `${note.y}px`;
  }
  if (note.displayMode === 'full') {
    el.style.width = `${note.width}px`; el.style.height = `${note.height}px`;
  } else {
    el.style.width = ''; el.style.height = '';
  }
}

// ── Events ────────────────────────────────────────────────────────────────────
function bindEvents(el, note) {
  const q  = s => el.querySelector(s);
  const qa = s => el.querySelectorAll(s);

  // Title
  q('.t-inp').oninput = e => { note.title = e.target.value; saveNotes(); };

  // Body
  const nb = q('.nb');
  let savedRange = null;
  nb.oninput = () => { note.content = nb.innerHTML; saveNotes(); };

  // ── Track selection robustly via selectionchange ──
  // ── Track selection (three event sources for maximum reliability) ──
  const trackSel = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    // nb.contains() works within the same shadow tree
    const anchor = range.commonAncestorContainer;
    if (nb.contains(anchor) || nb === anchor) {
      savedRange = range.cloneRange();
    }
  };
  document.addEventListener('selectionchange', trackSel);
  nb.addEventListener('mouseup',  trackSel);
  nb.addEventListener('keyup',    trackSel);
  // Fallback: catch mouseup anywhere in the shadow host
  document.addEventListener('mouseup', trackSel);

  // ── Apply format via Range API ──
  // KEY: sel.addRange() with shadow DOM ranges is unreliable in Chrome.
  // Instead, use the saved range DIRECTLY for DOM manipulation.
  // A cloned Range holds valid references to shadow DOM nodes until DOM changes.
  function applyFmt(type, value) {
    if (!savedRange) return;
    if (savedRange.collapsed) { savedRange = null; return; }

    // Verify the range is still inside our note body
    const anchor = savedRange.commonAncestorContainer;
    if (!nb.contains(anchor) && nb !== anchor) { savedRange = null; return; }

    try {
      let tag = 'span';
      if (type === 'bold')   tag = 'strong';
      if (type === 'italic') tag = 'em';
      const wrap = document.createElement(tag);
      if (type === 'color')     wrap.style.color      = value;
      if (type === 'highlight') wrap.style.background = value;

      try {
        savedRange.surroundContents(wrap);
      } catch(_) {
        // Cross-element selection (e.g. selection spans multiple elements)
        const frag = savedRange.extractContents();
        wrap.appendChild(frag);
        savedRange.insertNode(wrap);
      }
      note.content = nb.innerHTML;
      saveNotes();
    } catch(e) {
      console.error('[WebNote] applyFmt error:', e);
    }
    savedRange = null;
  }

  // ── B / I: mousedown+preventDefault keeps focus+selection in contenteditable ──
  q('.b-btn').onmousedown = e => { e.preventDefault(); applyFmt('bold'); };
  q('.i-btn').onmousedown = e => { e.preventDefault(); applyFmt('italic'); };

  // ── Background Color (no selection needed) ──
  q('.c-btn').onclick = e => { e.stopPropagation(); closeDropdowns(); q('.nc-dp').classList.toggle('hidden'); };
  qa('.ns').forEach(sw => sw.onclick = e => {
    e.stopPropagation();
    note.color = sw.dataset.c || null;
    applyStyle(el, note);
    q('.nc-dp').classList.add('hidden');
    saveNotes();
  });

  // ── Tags ──
  q('.tg-btn').onclick = e => { e.stopPropagation(); q('.tags-row').classList.toggle('hidden'); };
  const tagInp = q('.tag-inp');
  tagInp.onkeydown = e => {
    if ((e.key === 'Enter' || e.key === ',') && tagInp.value.trim()) {
      e.preventDefault();
      const t = tagInp.value.trim().replace(/^#/, '');
      if (t && !note.tags.includes(t)) {
        note.tags.push(t); saveNotes(); renderTags(el, note);
      }
      tagInp.value = '';
    }
  };
  bindTagRemove(el, note);

  // ── Duplicate ──
  q('.dup-btn').onclick = () => {
    const copy = JSON.parse(JSON.stringify(note));
    copy.id = Date.now().toString();
    copy.x += 24; copy.y += 24;
    copy.pageX += 24; copy.pageY += 24;
    notes.push(copy);
    saveNotes(); renderNote(copy); updateSidebarList(); updateBadge();
  };

  // ── Compact ──
  q('.cp-btn').onclick = () => {
    note.displayMode = note.displayMode === 'compact' ? 'full' : 'compact';
    applyStyle(el, note); positionNote(el, note); saveNotes();
  };

  // ── □ Expand / Restore toggle ──
  q('.ex-btn').onclick = () => {
    if (note.displayMode === 'compact') {
      note.displayMode = 'full';
    } else if (note._expanded) {
      note.width  = note._baseW || 280; note.height = note._baseH || 220;
      note._expanded = false; note.displayMode = 'full';
      q('.ex-btn').title = 'Expand';
    } else {
      note._baseW = note.width || 280; note._baseH = note.height || 220;
      note.width  = Math.max(note._baseW, 480); note.height = Math.max(note._baseH, 380);
      note._expanded = true; note.displayMode = 'full';
      q('.ex-btn').title = 'Restore original size';
    }
    applyStyle(el, note); positionNote(el, note); saveNotes();
  };

  // ── Pin ──
  const pb = q('.p-btn');
  pb.onclick = () => {
    note.pinned = !note.pinned;
    if (note.pinned) {
      note.pageX = parseInt(el.style.left) + scrollX;
      note.pageY = parseInt(el.style.top)  + scrollY;
      pb.innerHTML = ICONS.pinned;
      pb.title = 'Unpin (fixed on page)';
      pb.classList.add('pinned');
    } else {
      note.x = parseInt(el.style.left);
      note.y = parseInt(el.style.top);
      pb.innerHTML = ICONS.pin;
      pb.title = 'Pin to page';
      pb.classList.remove('pinned');
    }
    applyStyle(el, note);
    saveNotes();
  };

  // ── Delete ──
  q('.dl-btn').onclick = () => {
    notes = notes.filter(n => n.id !== note.id);
    el.remove(); saveNotes(); updateSidebarList(); updateBadge();
  };

  // ── Drag ──
  drag(el, note, q('.dh'));

  // ── Resize ──
  resize(el, note, q('.rz'));

  // Close dropdowns on click inside
  el.addEventListener('click', () => closeDropdowns());
}

// ── Formatting ────────────────────────────────────────────────────────────────
function applyFormatRange(range, type, value) {
  try {
    let tag;
    if      (type === 'bold')      tag = 'strong';
    else if (type === 'italic')    tag = 'em';
    else                           tag = 'span';

    const wrapper = document.createElement(tag);
    if (type === 'color')     wrapper.style.color      = value;
    if (type === 'highlight') wrapper.style.background = value;

    // surroundContents fails if selection crosses element boundaries
    try {
      range.surroundContents(wrapper);
    } catch(_) {
      const fragment = range.extractContents();
      wrapper.appendChild(fragment);
      range.insertNode(wrapper);
    }
  } catch(e) {
    console.warn('[WebNote] Format failed:', e);
  }
}

function renderTags(el, note) {
  const chips = el.querySelector('.tags-chips');
  chips.innerHTML = note.tags.map(t =>
    `<span class="tag-chip">${t}<button class="tag-rm" data-t="${t}">×</button></span>`
  ).join('');
  bindTagRemove(el, note);
}

function bindTagRemove(el, note) {
  el.querySelectorAll('.tag-rm').forEach(btn => {
    btn.onclick = () => {
      note.tags = note.tags.filter(t => t !== btn.dataset.t);
      saveNotes(); renderTags(el, note);
    };
  });
}

function closeDropdowns() {
  if (!shadow) return;
  shadow.querySelectorAll('.dp:not(.hidden)').forEach(d => d.classList.add('hidden'));
}

// ── Drag ──────────────────────────────────────────────────────────────────────
function drag(el, note, handle) {
  let sX, sY, oL, oT;
  handle.onmousedown = e => {
    e.preventDefault();
    sX = e.clientX; sY = e.clientY; oL = el.offsetLeft; oT = el.offsetTop;
    const mv = me => {
      const nx = oL + (me.clientX - sX), ny = oT + (me.clientY - sY);
      el.style.left = `${nx}px`; el.style.top = `${ny}px`;
      if (note.pinned) {
        note.pageX = nx + scrollX; note.pageY = ny + scrollY;
      } else {
        note.x = nx; note.y = ny;
      }
    };
    const up = () => { saveNotes(); document.removeEventListener('mousemove', mv); document.removeEventListener('mouseup', up); };
    document.addEventListener('mousemove', mv); document.addEventListener('mouseup', up);
  };
}

// ── Resize ────────────────────────────────────────────────────────────────────
function resize(el, note, rz) {
  if (!rz) return;
  rz.onmousedown = e => {
    e.preventDefault();
    const sW = el.offsetWidth, sH = el.offsetHeight, sX = e.clientX, sY = e.clientY;
    const mv = me => {
      note.width  = Math.max(200, sW + (me.clientX - sX));
      note.height = Math.max(120, sH + (me.clientY - sY));
      el.style.width = `${note.width}px`; el.style.height = `${note.height}px`;
    };
    const up = () => { saveNotes(); document.removeEventListener('mousemove', mv); document.removeEventListener('mouseup', up); };
    document.addEventListener('mousemove', mv); document.addEventListener('mouseup', up);
  };
}

// ── Website Text Highlighting ─────────────────────────────────────────────────
// Save the selection range on right-click (before context menu clears it)
let lastTarget    = null;
let lastPageRange = null;

document.addEventListener('contextmenu', e => {
  lastTarget = e.target;
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
    lastPageRange = sel.getRangeAt(0).cloneRange();
  } else {
    lastPageRange = null;
  }
}, true);

function addHighlight(text) {
  if (!text) return;
  const id = Date.now().toString();
  // Use toolbar color, add opacity (e.g. 50% = 80 in hex) so text is readable
  let color = activeColor;
  if (color.length === 7) color += '80'; 
  
  const hl = { id, url: location.href, text, color };
  highlights.push(hl);
  saveHighlights();

  if (lastPageRange) {
    applyHighlightRange(lastPageRange, hl);
  } else {
    // Fallback: text search
    paintHighlight(hl);
  }
}

function applyHighlightRange(range, hl) {
  const nodes = [];
  const walker = document.createTreeWalker(
    range.commonAncestorContainer,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: n => {
        if (!range.intersectsNode(n)) return NodeFilter.FILTER_REJECT;
        const p = n.parentElement;
        if (p && (['SCRIPT','STYLE','NOSCRIPT'].includes(p.tagName) || p.closest('#webnote-shadow-host'))) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );
  while (walker.nextNode()) nodes.push(walker.currentNode);

  nodes.forEach(node => {
    const r = document.createRange();
    const start = (node === range.startContainer) ? range.startOffset : 0;
    const end = (node === range.endContainer) ? range.endOffset : node.textContent.length;
    if (start >= end) return;
    r.setStart(node, start);
    r.setEnd(node, end);
    const mark = makeHighlightEl(hl);
    try {
      r.surroundContents(mark);
      mark.onclick = (e) => { e.stopPropagation(); removeHighlight(hl.id); };
    } catch(e) {}
  });
}

function paintHighlight(hl) {
  // Text-search based fallback (used for restoration on reload)
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: n => {
      const p = n.parentElement;
      if (!p) return NodeFilter.FILTER_REJECT;
      if (['SCRIPT','STYLE','NOSCRIPT'].includes(p.tagName)) return NodeFilter.FILTER_REJECT;
      if (p.closest && p.closest('#webnote-shadow-host')) return NodeFilter.FILTER_REJECT;
      if (p.dataset && p.dataset.wn) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  let node;
  while ((node = walker.nextNode())) {
    const idx = node.textContent.indexOf(hl.text);
    if (idx === -1) continue;
    try {
      const range = document.createRange();
      range.setStart(node, idx); range.setEnd(node, idx + hl.text.length);
      const mark = makeHighlightEl(hl);
      range.surroundContents(mark);
      mark.onclick = () => removeHighlight(hl.id);
      return;
    } catch(_) {}
  }
}

function makeHighlightEl(hl) {
  const span = document.createElement('span');
  span.className = 'webnote-hl';
  span.style.backgroundColor = hl.color;
  span.dataset.wn = hl.id;
  span.title = 'WebNote Highlight – Click to remove';
  return span;
}

function removeHighlight(id) {
  highlights = highlights.filter(h => h.id !== id);
  saveHighlights();
  document.querySelectorAll(`[data-wn="${id}"]`).forEach(s => s.replaceWith(...s.childNodes));
}

function restoreHighlights() {
  setTimeout(() => {
    highlights.filter(h => h.url === location.href).forEach(paintHighlight);
  }, 700);
}

function saveHighlights() { chrome.storage.local.set({ highlights }); }

// ── Sidebar ───────────────────────────────────────────────────────────────────
function toggleSidebar() {
  const sb = shadow.querySelector('#webnote-sidebar');
  if (!sb.classList.contains('animated')) {
    void sb.offsetWidth; // force reflow
    sb.classList.add('animated');
  }
  const h  = sb.classList.toggle('hidden');
  if (!h) updateSidebarList();
}

function updateSidebarList(query = '') {
  if (!shadow) return;
  const list = shadow.querySelector('.sb-notes');
  if (!list) return;
  const q    = query.toLowerCase();
  const cur  = normUrl(location.href);
  let visible = notes.filter(n => normUrl(n.url) === cur && (
    !q ||
    n.title.toLowerCase().includes(q) ||
    n.content.replace(/<[^>]+>/g,'').toLowerCase().includes(q) ||
    n.tags.some(t => t.toLowerCase().includes(q))
  ));
  
  if (!visible.length) {
    list.innerHTML = `<div class="empty-hint">${q ? 'No results found.' : 'No notes on this page.'}</div>`;
    return;
  }

  // 1. Sort
  if (sidebarSort === 'date-desc') {
    visible.sort((a,b) => parseInt(b.id) - parseInt(a.id));
  } else if (sidebarSort === 'date-asc') {
    visible.sort((a,b) => parseInt(a.id) - parseInt(b.id));
  } else if (sidebarSort === 'alpha') {
    visible.sort((a,b) => (a.title||'').localeCompare(b.title||''));
  } else if (sidebarSort === 'manual') {
    visible.sort((a,b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  }

  // 2. Group
  let groups = {};
  if (sidebarGroup === 'none') {
    groups['All Notes'] = visible;
  } else if (sidebarGroup === 'tags') {
    visible.forEach(n => {
      if (!n.tags || n.tags.length === 0) {
        if (!groups['No Tags']) groups['No Tags'] = [];
        groups['No Tags'].push(n);
      } else {
        n.tags.forEach(t => {
          const key = `#${t}`;
          if (!groups[key]) groups[key] = [];
          groups[key].push(n);
        });
      }
    });
  } else if (sidebarGroup === 'month') {
    const formatter = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });
    visible.forEach(n => {
      const d = new Date(parseInt(n.id));
      const key = formatter.format(d);
      if (!groups[key]) groups[key] = [];
      groups[key].push(n);
    });
  }

  list.innerHTML = '';
  // Only allow Drag & Drop if sorted manually, no groups, and no search query
  const dndEnabled = (sidebarSort === 'manual' && sidebarGroup === 'none' && !q);

  Object.keys(groups).forEach(gKey => {
    if (sidebarGroup !== 'none') {
      const h = document.createElement('div');
      h.className = 'sb-group-header';
      h.textContent = gKey;
      list.appendChild(h);
    }

    groups[gKey].forEach(note => {
      const item = document.createElement('div');
      item.className = 'sb-item';
      
      if (dndEnabled) {
        item.draggable = true;
        item.dataset.nid = note.id;
        item.ondragstart = (e) => { e.dataTransfer.setData('text/plain', note.id); item.classList.add('dragging'); };
        item.ondragend = () => item.classList.remove('dragging');
        item.ondragover = (e) => { e.preventDefault(); item.style.borderTop = '2px solid #6366f1'; };
        item.ondragleave = () => item.style.borderTop = '';
        item.ondrop = (e) => {
          e.preventDefault();
          item.style.borderTop = '';
          const dragId = e.dataTransfer.getData('text/plain');
          if (dragId === note.id) return;
          // Reorder visible notes
          const dragIdx = visible.findIndex(n => n.id === dragId);
          const dropIdx = visible.findIndex(n => n.id === note.id);
          const [dragNote] = visible.splice(dragIdx, 1);
          visible.splice(dropIdx, 0, dragNote);
          // Save order indices
          visible.forEach((n, i) => n.orderIndex = i);
          saveNotes();
          updateSidebarList(query);
        };
      }

      const tags    = note.tags.map(t => `<span class="sb-tag">#${t}</span>`).join(' ');
      const preview = note.content.replace(/<[^>]+>/g,'').substring(0, 50) || '(empty)';
      const cbg     = note.color ? `background:${note.color}33;border-left:3px solid ${note.color};` : '';
      item.innerHTML = `
        <div class="sb-item-actions">
          <div class="sb-item-action edit" title="Edit">${ICONS.pen}</div>
          <div class="sb-item-action del" title="Delete">${ICONS.trash}</div>
        </div>
        <div class="sb-item-title" style="${cbg}">${note.pinned?ICONS.pinned:ICONS.pin} ${note.title||'Untitled'}</div>
        ${tags ? `<div class="sb-item-tags">${tags}</div>` : ''}
        <div class="sb-item-preview">${preview}…</div>`;
      
      item.onclick = (e) => {
        if (e.target.closest('.sb-item-action')) return;
        if (note.displayMode !== 'full') {
          note.displayMode = 'full';
          const el = shadow.querySelector(`#note-${note.id}`);
          if (el) { applyStyle(el, note); positionNote(el, note); } saveNotes();
        }
        const el = shadow.querySelector(`#note-${note.id}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      };

      item.querySelector('.edit').onclick = (e) => {
        e.stopPropagation();
        if (note.displayMode !== 'full') {
          note.displayMode = 'full';
          saveNotes();
          const el = shadow.querySelector(`#note-${note.id}`);
          if (el) { applyStyle(el, note); positionNote(el, note); }
        }
        const el = shadow.querySelector(`#note-${note.id}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const titleInp = el.querySelector('.t-inp');
          if (titleInp) {
            titleInp.focus();
            const len = titleInp.value.length;
            titleInp.setSelectionRange(len, len);
          }
        }
      };

      item.querySelector('.del').onclick = (e) => {
        e.stopPropagation();
        notes = notes.filter(n => n.id !== note.id);
        const el = shadow.querySelector(`#note-${note.id}`);
        if (el) el.remove();
        saveNotes();
        updateSidebarList(query);
        updateBadge();
      };

      list.appendChild(item);
    });
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function renderPageNotes() {
  const cur = normUrl(location.href);
  notes.filter(n => normUrl(n.url) === cur).forEach(renderNote);
}

function saveNotes() { chrome.storage.local.set({ notes, rules, sidebarSort, sidebarGroup }); }

function updateBadge() {
  const cur   = normUrl(location.href);
  const count = notes.filter(n => normUrl(n.url) === cur).length;
  chrome.runtime.sendMessage({ action: 'UPDATE_BADGE', count }).catch(() => {});
}

function selector(el) {
  if (!el || el === document.body) return 'body';
  if (el.id) return `#${el.id}`;
  const path = [];
  while (el && el.parentElement && el.tagName !== 'BODY') {
    const i = Array.from(el.parentElement.children).indexOf(el) + 1;
    path.unshift(`${el.tagName.toLowerCase()}:nth-child(${i})`);
    el = el.parentElement;
  }
  return path.join(' > ');
}

// ── Drawing Board ─────────────────────────────────────────────────────────────
function saveDrawings() { chrome.storage.local.set({ drawings }); }

function renderDrawings() {
  const svg = shadow.querySelector('#webnote-drawing-board');
  if (!svg) return;
  svg.innerHTML = '';
  const cur = normUrl(location.href);
  drawings.filter(d => normUrl(d.url) === cur).forEach(d => {
    const el = document.createElementNS("http://www.w3.org/2000/svg", d.type);
    el.setAttribute('stroke', d.color);
    el.setAttribute('stroke-width', '4');
    el.setAttribute('fill', d.type === 'path' ? 'none' : 'transparent');
    el.style.pointerEvents = 'all';
    el.dataset.id = d.id;
    if (d.type === 'path') {
      el.setAttribute('stroke-linecap', 'round');
      el.setAttribute('stroke-linejoin', 'round');
      el.setAttribute('d', d.data);
    } else if (d.type === 'rect') {
      el.setAttribute('x', d.x); el.setAttribute('y', d.y);
      el.setAttribute('width', d.w); el.setAttribute('height', d.h);
    } else if (d.type === 'ellipse') {
      el.setAttribute('cx', d.cx); el.setAttribute('cy', d.cy);
      el.setAttribute('rx', d.rx); el.setAttribute('ry', d.ry);
    } else if (d.type === 'line') {
      el.setAttribute('stroke-linecap', 'round');
      el.setAttribute('x1', d.x1); el.setAttribute('y1', d.y1);
      el.setAttribute('x2', d.x2); el.setAttribute('y2', d.y2);
    }
    
    const eraseSelf = () => {
      saveDrawingSnapshot();
      drawings = drawings.filter(x => x.id !== d.id);
      saveDrawings();
      el.remove();
    };

    el.addEventListener('mouseenter', () => {
      if (activeTool === 'eraser' && isEraserDragging) {
        eraseSelf();
      }
    });

    // Eraser interaction
    el.addEventListener('mousedown', (e) => {
      if (activeTool === 'eraser') {
        e.stopPropagation();
        eraseSelf();
      } else if (activeTool === 'cursor') {
        // Drag logic
        e.stopPropagation();
        let sX = e.pageX, sY = e.pageY;
        const initialD = JSON.parse(JSON.stringify(d)); // Deep copy

        const mv = (me) => {
          const dx = me.pageX - sX, dy = me.pageY - sY;
          if (d.type === 'path') {
            const parts = initialD.data.split(' ');
            for (let i = 1; i < parts.length; i += 3) {
              if (!isNaN(parts[i])) parts[i] = (parseFloat(initialD.data.split(' ')[i]) + dx).toFixed(1);
              if (!isNaN(parts[i+1])) parts[i+1] = (parseFloat(initialD.data.split(' ')[i+1]) + dy).toFixed(1);
            }
            d.data = parts.join(' ');
            el.setAttribute('d', d.data);
          } else if (d.type === 'rect') {
            d.x = (parseFloat(initialD.x) + dx).toFixed(1);
            d.y = (parseFloat(initialD.y) + dy).toFixed(1);
            el.setAttribute('x', d.x); el.setAttribute('y', d.y);
          } else if (d.type === 'ellipse') {
            d.cx = (parseFloat(initialD.cx) + dx).toFixed(1);
            d.cy = (parseFloat(initialD.cy) + dy).toFixed(1);
            el.setAttribute('cx', d.cx); el.setAttribute('cy', d.cy);
          } else if (d.type === 'line') {
            d.x1 = (parseFloat(initialD.x1) + dx).toFixed(1);
            d.y1 = (parseFloat(initialD.y1) + dy).toFixed(1);
            d.x2 = (parseFloat(initialD.x2) + dx).toFixed(1);
            d.y2 = (parseFloat(initialD.y2) + dy).toFixed(1);
            el.setAttribute('x1', d.x1); el.setAttribute('y1', d.y1);
            el.setAttribute('x2', d.x2); el.setAttribute('y2', d.y2);
          }
        };

        const up = () => {
          saveDrawings();
          window.removeEventListener('mousemove', mv);
          window.removeEventListener('mouseup', up);
        };

        if (selectedDrawingId !== d.id) {
          selectedDrawingId = d.id;
          renderDrawings();
        }

        window.addEventListener('mousemove', mv);
        window.addEventListener('mouseup', up);
      }
    });
    
    svg.appendChild(el);

    // Render Selection & Resize Handles
    if (activeTool === 'cursor' && d.id === selectedDrawingId && (d.type === 'rect' || d.type === 'ellipse')) {
      const handle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
      handle.setAttribute('fill', '#fff');
      handle.setAttribute('stroke', '#6366f1');
      handle.setAttribute('stroke-width', '2');
      handle.setAttribute('r', '6');
      handle.style.cursor = 'nwse-resize';
      handle.style.pointerEvents = 'all';

      const updateHandlePos = () => {
        if (d.type === 'rect') {
          handle.setAttribute('cx', parseFloat(d.x) + parseFloat(d.w));
          handle.setAttribute('cy', parseFloat(d.y) + parseFloat(d.h));
        } else if (d.type === 'ellipse') {
          handle.setAttribute('cx', parseFloat(d.cx) + parseFloat(d.rx));
          handle.setAttribute('cy', parseFloat(d.cy) + parseFloat(d.ry));
        }
      };
      updateHandlePos();

      handle.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        let sX = e.pageX, sY = e.pageY;
        const initialD = JSON.parse(JSON.stringify(d));

        const mv = (me) => {
          const dx = me.pageX - sX, dy = me.pageY - sY;
          if (d.type === 'rect') {
            d.w = Math.max(10, parseFloat(initialD.w) + dx).toFixed(1);
            d.h = Math.max(10, parseFloat(initialD.h) + dy).toFixed(1);
            el.setAttribute('width', d.w); el.setAttribute('height', d.h);
          } else {
            d.rx = Math.max(5, parseFloat(initialD.rx) + dx).toFixed(1);
            d.ry = Math.max(5, parseFloat(initialD.ry) + dy).toFixed(1);
            el.setAttribute('rx', d.rx); el.setAttribute('ry', d.ry);
          }
          updateHandlePos();
        };

        const up = () => {
          saveDrawings();
          window.removeEventListener('mousemove', mv);
          window.removeEventListener('mouseup', up);
        };
        window.addEventListener('mousemove', mv);
        window.addEventListener('mouseup', up);
      });
      svg.appendChild(handle);
    }

    // Line Endpoint Handles
    if (activeTool === 'cursor' && d.id === selectedDrawingId && d.type === 'line') {
      [1, 2].forEach(i => {
        const h = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
        h.setAttribute('fill', '#fff'); h.setAttribute('stroke', '#6366f1'); h.setAttribute('stroke-width', '2'); h.setAttribute('r', '6');
        h.style.cursor = 'move'; h.style.pointerEvents = 'all';
        h.setAttribute('cx', d[`x${i}`]); h.setAttribute('cy', d[`y${i}`]);

        h.addEventListener('mousedown', (e) => {
          e.stopPropagation();
          let sX = e.pageX, sY = e.pageY;
          const initValX = parseFloat(d[`x${i}`]), initValY = parseFloat(d[`y${i}`]);
          const mv = (me) => {
            d[`x${i}`] = (initValX + (me.pageX - sX)).toFixed(1);
            d[`y${i}`] = (initValY + (me.pageY - sY)).toFixed(1);
            h.setAttribute('cx', d[`x${i}`]); h.setAttribute('cy', d[`y${i}`]);
            el.setAttribute(`x${i}`, d[`x${i}`]); el.setAttribute(`y${i}`, d[`y${i}`]);
          };
          const up = () => { saveDrawings(); window.removeEventListener('mousemove', mv); window.removeEventListener('mouseup', up); };
          window.addEventListener('mousemove', mv); window.addEventListener('mouseup', up);
        });
        svg.appendChild(h);
      });
    }
  });
}

function setupDrawingBoard(svg, bar) {
  // Update SVG size
  const updateSvgSize = () => {
    svg.style.width = Math.max(document.body.scrollWidth, document.documentElement.scrollWidth, window.innerWidth) + 'px';
    svg.style.height = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight, window.innerHeight) + 'px';
  };
  window.addEventListener('resize', updateSvgSize);
  new MutationObserver(updateSvgSize).observe(document.body, { childList: true, subtree: true });
  updateSvgSize();
  svg.style.pointerEvents = 'none';

  // Toolbar events
  const tools = bar.querySelectorAll('.db-tool[data-tool]');
  const setTool = (toolName) => {
    activeTool = toolName;
    tools.forEach(b => {
      if (b.dataset.tool === toolName) b.classList.add('active');
      else b.classList.remove('active');
    });
    const needsSurface = ['draw','rect','ellipse','line','eraser'].includes(activeTool);
    svg.style.pointerEvents = needsSurface ? 'all' : 'none';
    svg.style.userSelect = needsSurface ? 'none' : 'auto';
    svg.style.cursor = (activeTool === 'cursor') ? 'default' : (activeTool === 'highlight' ? 'text' : 'crosshair');
  };

  tools.forEach(btn => {
    btn.onclick = () => setTool(btn.dataset.tool);
  });

  // ESC to reset to cursor & Delete to remove selected
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;

    if (e.key === 'Escape' && activeTool !== 'cursor') {
      setTool('cursor');
    }
    if (e.key === 'Delete' && selectedDrawingId) {
      saveDrawingSnapshot();
      drawings = drawings.filter(d => d.id !== selectedDrawingId);
      selectedDrawingId = null;
      saveDrawings();
      renderDrawings();
    }
  });

  // Action Buttons
  bar.querySelector('.db-min-icon').onclick = () => {
    toolbarState.min = false;
    bar.classList.remove('minimized');
    chrome.storage.local.set({ toolbarState });
  };
  bar.querySelector('.db-btn-clear').onclick = () => {
    if (confirm('Do you really want to delete all drawings and highlights on this page?')) {
      saveDrawingSnapshot();
      drawings = drawings.filter(d => normUrl(d.url) !== normUrl(location.href));
      const highlights = document.querySelectorAll('.webnote-hl');
      highlights.forEach(h => removeHighlight(h.dataset.wn));
      saveDrawings();
      renderDrawings();
    }
  };
  bar.querySelector('.db-btn-min').onclick = () => {
    toolbarState.min = true;
    bar.classList.add('minimized');
    chrome.storage.local.set({ toolbarState });
  };
  bar.querySelector('.db-toggle-dir').onclick = () => {
    toolbarState.vert = !toolbarState.vert;
    bar.querySelector('.db-toggle-dir').innerHTML = toolbarState.vert ? ICONS.horiz : ICONS.vert;
    bar.classList.toggle('vertical', toolbarState.vert);
    bar.querySelector('.db-btn-min').innerHTML = toolbarState.vert ? ICONS.up : ICONS.left;
    chrome.storage.local.set({ toolbarState });
  };
  bar.querySelector('.db-btn-list').onclick = () => toggleSidebar();
  bar.querySelector('.db-btn-new').onclick = () => createNote({ x: 60, y: 120 });
  bar.querySelector('.db-btn-undo').onclick = performUndo;
  bar.querySelector('.db-btn-redo').onclick = performRedo;
  bar.querySelector('.db-btn-screenshot').onclick = () => {
    startScreenshotMode();
  };
  bar.querySelector('.db-btn-close').onclick = () => {
    toolbarState.hidden = true;
    chrome.storage.local.set({ toolbarState });
    bar.style.display = 'none';
  };

  // Toolbar Drag Logic
  const handle = bar.querySelector('.db-drag-handle');
  const minIcon = bar.querySelector('.db-min-icon');
  
  const setupDrag = (dragEl) => {
    let sX, sY, oL, oT;
    dragEl.onmousedown = e => {
      e.preventDefault();
      sX = e.clientX; sY = e.clientY; 
      oL = bar.offsetLeft; oT = bar.offsetTop;
      const mv = me => {
        const nx = oL + (me.clientX - sX), ny = oT + (me.clientY - sY);
        bar.style.left = `${nx}px`; bar.style.top = `${ny}px`;
        toolbarState.x = nx; toolbarState.y = ny;
      };
      const up = () => { 
        chrome.storage.local.set({ toolbarState });
        document.removeEventListener('mousemove', mv); 
        document.removeEventListener('mouseup', up); 
      };
      document.addEventListener('mousemove', mv); document.addEventListener('mouseup', up);
    };
  };
  setupDrag(handle);
  setupDrag(minIcon); // allow dragging by the minimized icon too

  bar.querySelectorAll('.db-color').forEach(sw => {
    sw.onclick = () => {
      bar.querySelectorAll('.db-color').forEach(s => s.classList.remove('active'));
      sw.classList.add('active');
      activeColor = sw.dataset.c;
    };
  });

  // Highlighting Mode: listen on document for selection
  document.addEventListener('mouseup', () => {
    if (activeTool === 'highlight') {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
        lastPageRange = sel.getRangeAt(0).cloneRange();
        addHighlight(sel.toString());
        sel.removeAllRanges();
      }
    }
  });

  // Drawing logic
  let isDrawing = false;
  let currentShape = null;
  let startX = 0, startY = 0;
  let pathData = '';

  svg.addEventListener('mousedown', e => {
    if (activeTool === 'eraser') {
      isEraserDragging = true;
      svg.style.pointerEvents = 'none';
      const elUnder = document.elementFromPoint(e.clientX, e.clientY);
      svg.style.pointerEvents = 'all';
      if (elUnder && elUnder.classList.contains('webnote-hl')) {
        removeHighlight(elUnder.dataset.wn);
      }
      return;
    }

    if (activeTool === 'cursor') {
      if (selectedDrawingId) {
        selectedDrawingId = null;
        renderDrawings();
      }
      return;
    }
    
    if (!['draw','rect','ellipse','line'].includes(activeTool)) return;
    isDrawing = true;
    startX = e.pageX;
    startY = e.pageY;

    currentShape = document.createElementNS("http://www.w3.org/2000/svg", (activeTool === 'draw' || activeTool === 'line') ? 'path' : activeTool);
    currentShape.setAttribute('stroke', activeColor);
    currentShape.setAttribute('stroke-width', '4');
    currentShape.setAttribute('fill', (activeTool === 'draw' || activeTool === 'line') ? 'none' : 'transparent');
    
    if (activeTool === 'draw' || activeTool === 'line') {
      currentShape.setAttribute('stroke-linecap', 'round');
      currentShape.setAttribute('stroke-linejoin', 'round');
      pathData = `M ${startX} ${startY}`;
      if (activeTool === 'line') pathData += ` L ${startX} ${startY}`;
      currentShape.setAttribute('d', pathData);
    }
    svg.appendChild(currentShape);
  });

  svg.addEventListener('mousemove', e => {
    if (activeTool === 'eraser' && isEraserDragging) {
      svg.style.pointerEvents = 'none';
      const elUnder = document.elementFromPoint(e.clientX, e.clientY);
      svg.style.pointerEvents = 'all';
      if (elUnder && elUnder.classList.contains('webnote-hl')) {
        removeHighlight(elUnder.dataset.wn);
      }
      return;
    }

    if (!isDrawing || !currentShape) return;
    const cx = e.pageX;
    const cy = e.pageY;
    
    if (activeTool === 'draw') {
      pathData += ` L ${cx} ${cy}`;
      currentShape.setAttribute('d', pathData);
    } else if (activeTool === 'line') {
      pathData = `M ${startX} ${startY} L ${cx} ${cy}`;
      currentShape.setAttribute('d', pathData);
    } else if (activeTool === 'rect') {
      const x = Math.min(startX, cx);
      const y = Math.min(startY, cy);
      const w = Math.abs(cx - startX);
      const h = Math.abs(cy - startY);
      currentShape.setAttribute('x', x); currentShape.setAttribute('y', y);
      currentShape.setAttribute('width', w); currentShape.setAttribute('height', h);
    } else if (activeTool === 'ellipse') {
      const rx = Math.abs(cx - startX) / 2;
      const ry = Math.abs(cy - startY) / 2;
      const cx_center = Math.min(startX, cx) + rx;
      const cy_center = Math.min(startY, cy) + ry;
      currentShape.setAttribute('cx', cx_center); currentShape.setAttribute('cy', cy_center);
      currentShape.setAttribute('rx', rx); currentShape.setAttribute('ry', ry);
    }
  });

  window.addEventListener('mouseup', () => {
    isEraserDragging = false;
    if (!isDrawing) return;
    isDrawing = false;
    if (!currentShape) return;
    
    const d = { id: Date.now().toString(), url: location.href, color: activeColor, type: activeTool === 'draw' ? 'path' : activeTool };
    
    if (activeTool === 'draw') {
      if (!pathData.includes('L')) { currentShape.remove(); return; } // just a dot
      d.data = pathData;
    } else if (activeTool === 'rect') {
      d.x = currentShape.getAttribute('x'); d.y = currentShape.getAttribute('y');
      d.w = currentShape.getAttribute('width'); d.h = currentShape.getAttribute('height');
      if (d.w < 5 && d.h < 5) { currentShape.remove(); return; }
    } else if (activeTool === 'ellipse') {
      d.cx = currentShape.getAttribute('cx'); d.cy = currentShape.getAttribute('cy');
      d.rx = currentShape.getAttribute('rx'); d.ry = currentShape.getAttribute('ry');
      if (d.rx < 5 && d.ry < 5) { currentShape.remove(); return; }
    } else if (activeTool === 'line') {
      d.type = 'line';
      const pts = pathData.split(' ');
      d.x1 = pts[1]; d.y1 = pts[2];
      d.x2 = pts[4]; d.y2 = pts[5];
      if (d.x1 === d.x2 && d.y1 === d.y2) { currentShape.remove(); return; }
    }
    
    currentShape.remove(); // let renderDrawings re-add it with events
    saveDrawingSnapshot();
    drawings.push(d);
    saveDrawings();
    renderDrawings();
    currentShape = null;
  });
}

// ── Messages ──────────────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg, _sender, reply) => {
  if (msg.action === 'ADD_NOTE') {
    const t = lastTarget || document.body;
    const r = t.getBoundingClientRect();
    createNote({
      x: r.left + 10, y: r.top + 10,
      content: msg.text || '',
    });
  }
  if (msg.action === 'ADD_HIGHLIGHT') {
    addHighlight(msg.text);
  }
  if (msg.action === 'TOGGLE_TOOLBAR') {
    toolbarState.hidden = !toolbarState.hidden;
    chrome.storage.local.set({ toolbarState });
    const bar = shadow?.querySelector('#webnote-drawbar');
    if (bar) bar.style.display = toolbarState.hidden ? 'none' : 'flex';
  }
  reply({ ok: true });
});

// ── SPA Watch ─────────────────────────────────────────────────────────────────
let lastUrl = location.href;
setInterval(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    if (shadow) shadow.querySelectorAll('.webnote-sticky').forEach(n => n.remove());
    renderPageNotes(); restoreHighlights(); renderDrawings(); updateBadge();
  }
}, 1000);

// ── Boot ──────────────────────────────────────────────────────────────────────
init();

// ── Screenshot Module ───────────────────────────────────────────────────────
function startScreenshotMode() {
  const container = document.querySelector('#webnote-shadow-host');
  if (!container) return;
  const shadow = container.shadowRoot;
  
  const old = shadow.querySelector('.wn-ss-overlay');
  if (old) old.remove();

  const overlay = document.createElement('div');
  overlay.className = 'wn-ss-overlay';
  overlay.style.pointerEvents = 'all';
  let mode = 'crop'; 
  let dest = 'clipboard'; // 'clipboard' or 'download'

  overlay.innerHTML = `
    <div class="wn-ss-tools">
      <button class="wn-ss-tool active" data-m="crop" title="Select Area">${ICONS.crop}</button>
      <button class="wn-ss-tool" data-m="target" title="Select Element">${ICONS.target}</button>
      <button class="wn-ss-tool" data-m="screen" title="Full Screen">${ICONS.monitor}</button>
      <div class="db-sep"></div>
      <button class="wn-ss-tool wn-ss-dest active" data-d="clipboard" title="Copy to Clipboard">${ICONS.clipboard}</button>
      <button class="wn-ss-tool wn-ss-dest" data-d="download" title="Save as File">${ICONS.download}</button>
      <div class="db-sep"></div>
      <button class="wn-ss-tool wn-ss-close" title="Cancel">${ICONS.close}</button>
    </div>
    <div class="wn-ss-hint">Select an area with the mouse</div>
    <div class="wn-ss-area" style="display:none; position:absolute; border:2px solid #6366f1; background:rgba(99,102,241,0.1); pointer-events:none;"></div>
    <div class="wn-ss-target" style="display:none; position:absolute; border:2px solid #6366f1; background:rgba(99,102,241,0.2); pointer-events:none; z-index:2147483646;"></div>
  `;

  shadow.appendChild(overlay);

  const tools = overlay.querySelectorAll('.wn-ss-tool[data-m]');
  const hint = overlay.querySelector('.wn-ss-hint');
  const areaEl = overlay.querySelector('.wn-ss-area');
  const targetEl = overlay.querySelector('.wn-ss-target');
  const destBtns = overlay.querySelectorAll('.wn-ss-dest');

  destBtns.forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      dest = btn.dataset.d;
      destBtns.forEach(b => b.classList.toggle('active', b.dataset.d === dest));
    };
  });

  const setMode = (m) => {
    mode = m;
    tools.forEach(t => t.classList.toggle('active', t.dataset.m === m));
    hint.textContent = m === 'crop' ? 'Select an area with the mouse' : 
                       m === 'target' ? 'Click on an element' : 'Click for full screen';
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

  function doCapture(x, y, w, h) {
    overlay.remove();
    setTimeout(() => {
      chrome.runtime.sendMessage({ action: 'CAPTURE_VISIBLE' }, (res) => {
        if (!res || !res.dataUrl) return;
        if (!x && !y) {
          handleResult(res.dataUrl);
        } else {
          const img = new Image();
          img.onload = () => {
            const dpr = window.devicePixelRatio || 1;
            const canvas = document.createElement('canvas');
            canvas.width = w * dpr; canvas.height = h * dpr;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, x * dpr, y * dpr, w * dpr, h * dpr, 0, 0, w * dpr, h * dpr);
            handleResult(canvas.toDataURL('image/png'));
          };
          img.src = res.dataUrl;
        }
      });
    }, 150);
  }

  async function handleResult(dataUrl) {
    if (dest === 'clipboard') {
      try {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        showToast('Copied to clipboard!');
      } catch (err) {
        console.error('Clipboard error:', err);
        download(dataUrl);
      }
    } else {
      download(dataUrl);
    }
  }

  function download(dataUrl) {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `webnote-ss-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function showToast(msg) {
    const t = document.createElement('div');
    t.style.cssText = 'position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:#1e293b;color:white;padding:12px 24px;border-radius:100px;z-index:2147483647;font-size:14px;box-shadow:0 10px 30px rgba(0,0,0,0.3);';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => { t.style.opacity='0'; t.style.transition='0.3s'; setTimeout(()=>t.remove(), 300); }, 2000);
  }
}
