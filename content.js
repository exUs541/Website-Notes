// content.js - WebNote v3.1
'use strict';

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
let toolbarState = { x: null, y: 20, min: false, vert: false };

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
    toolbarState = data.toolbarState || { x: null, y: 20, min: false, vert: false };
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
  const ex = document.getElementById('webnote-shadow-host');
  if (ex) { shadow = ex.shadowRoot; return; }

  const host = document.createElement('div');
  host.id = 'webnote-shadow-host';
  host.style.cssText = 'position:fixed;top:0;left:0;width:0;height:0;z-index:2147483647;pointer-events:none;';
  document.body.appendChild(host);
  shadow = host.attachShadow({ mode: 'open' });

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

  drawBar.innerHTML = `
    <div class="db-min-icon" title="WebNote öffnen">📝</div>
    <div class="db-full">
      <div class="db-drag-handle" title="Verschieben">⋮⋮</div>
      <button class="db-tool db-toggle-dir" title="Ausrichtung ändern">${toolbarState.vert ? '↔️' : '↕️'}</button>
      <div class="db-sep"></div>
      <button class="db-tool db-btn-list" title="Alle Notizen (Sidebar)">📋</button>
      <button class="db-tool db-btn-new" title="Neue Notiz">➕</button>
      <div class="db-sep"></div>
      <button class="db-tool active" data-tool="cursor" title="Maus (Normal)">🖱️</button>
      <button class="db-tool" data-tool="highlight" title="Text markieren">🖊️</button>
      <div class="db-sep"></div>
      <button class="db-tool" data-tool="draw" title="Freihand zeichnen">🖌️</button>
      <button class="db-tool" data-tool="rect" title="Rechteck">⬜</button>
      <button class="db-tool" data-tool="ellipse" title="Kreis">⭕</button>
      <button class="db-tool" data-tool="line" title="Linie">📏</button>
      <div class="db-sep"></div>
      <div class="db-colors">
        <div class="db-color" data-c="#ef4444" style="background:#ef4444; border: 2px solid #1e293b;"></div>
        <div class="db-color" data-c="#3b82f6" style="background:#3b82f6;"></div>
        <div class="db-color" data-c="#22c55e" style="background:#22c55e;"></div>
        <div class="db-color" data-c="#eab308" style="background:#eab308;"></div>
        <div class="db-color" data-c="#1e293b" style="background:#1e293b;"></div>
      </div>
      <div class="db-sep"></div>
      <button class="db-tool" data-tool="eraser" title="Radiergummi (Klick auf Zeichnung)">🧽</button>
      <div class="db-sep"></div>
      <button class="db-tool db-btn-min" title="Minimieren">🔽</button>
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
      <div class="sb-title">📝 WebNotes <span class="ver-tag">v${v}</span></div>
      <div class="sb-actions">
        <button class="icon-btn sb-refresh" title="Neu laden">🔄</button>
        <button class="icon-btn sb-close" title="Schließen">×</button>
      </div>
    </div>
    <div class="sb-search-wrap">
      <input class="sb-search" placeholder="Suchen…" type="text">
      <div class="sb-controls">
        <select class="sb-sort-sel" title="Sortieren nach">
          <option value="date-desc">Neueste zuerst</option>
          <option value="date-asc">Älteste zuerst</option>
          <option value="alpha">Alphabetisch</option>
          <option value="manual">Manuell (Drag & Drop)</option>
        </select>
        <select class="sb-group-sel" title="Gruppieren nach">
          <option value="none">Keine Gruppe</option>
          <option value="tags">Nach Tags</option>
          <option value="month">Nach Monat</option>
        </select>
      </div>
    </div>
    <div class="sb-notes"></div>
    <div class="sb-footer">
      <button class="new-note-btn">+ Neue Notiz</button>
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
    title:       opts.title   || 'Neue Notiz',
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
      <span class="dh">⋮⋮</span>
      <button class="icon-btn p-btn ${note.pinned?'pinned':''}" title="${note.pinned?'Loslösen (fixiert auf Seite)':'Auf Seite fixieren'}">${note.pinned?'\u{1F4CD}':'\u{1F4CC}'}</button>
      <input class="t-inp" value="${note.title.replace(/"/g,'&quot;')}" placeholder="Titel…">
    </div>
    <div class="nh-r">
      <div class="dp-wrap">
        <button class="icon-btn c-btn" title="Hintergrundfarbe">🎨</button>
        <div class="dp nc-dp hidden">${nc}</div>
      </div>
      <button class="icon-btn dup-btn" title="Duplizieren">⧉</button>
      <button class="icon-btn cp-btn" title="Kompakt (nur Titel)">—</button>
      <button class="icon-btn ex-btn" title="Vergrößern / Vollbild">□</button>
      <button class="icon-btn dl-btn" title="Löschen">×</button>
    </div>
  </div>
  <div class="fmt-bar">
    <button class="fb-btn b-btn" title="Fett"><b>B</b></button>
    <button class="fb-btn i-btn" title="Kursiv"><i>I</i></button>
    <div class="fmt-sep"></div>
    <button class="fb-btn tg-btn" title="Tags">🏷️</button>
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
      q('.ex-btn').title = 'Vergrößern';
    } else {
      note._baseW = note.width || 280; note._baseH = note.height || 220;
      note.width  = Math.max(note._baseW, 480); note.height = Math.max(note._baseH, 380);
      note._expanded = true; note.displayMode = 'full';
      q('.ex-btn').title = 'Auf Originalgröße zurück';
    }
    applyStyle(el, note); positionNote(el, note); saveNotes();
  };

  // ── Pin ──
  const pb = q('.p-btn');
  pb.onclick = () => {
    note.pinned = !note.pinned;
    if (note.pinned) {
      // Calculate current page position from current viewport position
      note.pageX = parseInt(el.style.left) + scrollX;
      note.pageY = parseInt(el.style.top)  + scrollY;
      pb.textContent = '📍';
      pb.title = 'Loslösen (fixiert auf Seite)';
      pb.classList.add('pinned');
    } else {
      // Stay at current viewport position
      note.x = parseInt(el.style.left);
      note.y = parseInt(el.style.top);
      pb.textContent = '📌';
      pb.title = 'Auf Seite fixieren';
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
  try {
    const mark = makeHighlightEl(hl);
    try {
      range.surroundContents(mark);
    } catch(_) {
      // Cross-element: extract then wrap
      const frag = range.extractContents();
      mark.appendChild(frag);
      range.insertNode(mark);
    }
    mark.onclick = () => removeHighlight(hl.id);
  } catch(e) {
    console.warn('[WebNote] Highlight failed, trying text search:', e);
    paintHighlight(hl);
  }
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
  const mark = document.createElement('mark');
  mark.className = 'webnote-hl';
  mark.style.cssText = `background:${hl.color}!important;border-radius:2px;cursor:pointer;padding:0 1px;box-decoration-break:clone;`;
  mark.dataset.wn = hl.id;
  mark.title = 'WebNote Markierung – Klicken zum Entfernen';
  return mark;
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
    list.innerHTML = `<div class="empty-hint">${q ? 'Keine Treffer.' : 'Keine Notizen auf dieser Seite.'}</div>`;
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
    groups['Alle Notizen'] = visible;
  } else if (sidebarGroup === 'tags') {
    visible.forEach(n => {
      if (!n.tags || n.tags.length === 0) {
        if (!groups['Ohne Tag']) groups['Ohne Tag'] = [];
        groups['Ohne Tag'].push(n);
      } else {
        n.tags.forEach(t => {
          const key = `#${t}`;
          if (!groups[key]) groups[key] = [];
          groups[key].push(n);
        });
      }
    });
  } else if (sidebarGroup === 'month') {
    const formatter = new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric' });
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
      const preview = note.content.replace(/<[^>]+>/g,'').substring(0, 50) || '(leer)';
      const cbg     = note.color ? `background:${note.color}33;border-left:3px solid ${note.color};` : '';
      item.innerHTML = `
        <div class="sb-item-actions">
          <div class="sb-item-action edit" title="Bearbeiten">✏️</div>
          <div class="sb-item-action del" title="Löschen">🗑️</div>
        </div>
        <div class="sb-item-title" style="${cbg}">${note.pinned?'📍':'📌'} ${note.title||'Unbenannt'}</div>
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
    
    // Eraser interaction
    el.addEventListener('mousedown', (e) => {
      if (activeTool === 'eraser') {
        e.stopPropagation();
        drawings = drawings.filter(x => x.id !== d.id);
        saveDrawings();
        el.remove();
      }
    });
    
    svg.appendChild(el);
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
  svg.style.background = 'rgba(0,0,0,0.001)'; // Invisible but catches pointer events

  // Toolbar events
  const tools = bar.querySelectorAll('.db-tool[data-tool]');
  tools.forEach(btn => {
    btn.onclick = () => {
      tools.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeTool = btn.dataset.tool;
      svg.style.pointerEvents = ['draw','rect','ellipse','eraser'].includes(activeTool) ? 'all' : 'none';
      if (activeTool === 'eraser') svg.style.cursor = 'crosshair';
      else if (activeTool !== 'cursor' && activeTool !== 'highlight') svg.style.cursor = 'crosshair';
      else svg.style.cursor = 'default';
    };
  });

  // Action Buttons
  bar.querySelector('.db-min-icon').onclick = () => {
    toolbarState.min = false;
    bar.classList.remove('minimized');
    chrome.storage.local.set({ toolbarState });
  };
  bar.querySelector('.db-btn-min').onclick = () => {
    toolbarState.min = true;
    bar.classList.add('minimized');
    chrome.storage.local.set({ toolbarState });
  };
  bar.querySelector('.db-toggle-dir').onclick = (e) => {
    toolbarState.vert = !toolbarState.vert;
    e.target.textContent = toolbarState.vert ? '↔️' : '↕️';
    bar.classList.toggle('vertical', toolbarState.vert);
    chrome.storage.local.set({ toolbarState });
  };
  bar.querySelector('.db-btn-list').onclick = () => toggleSidebar();
  bar.querySelector('.db-btn-new').onclick = () => createNote({ x: 60, y: 120 });

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
      bar.querySelectorAll('.db-color').forEach(s => s.style.border = 'none');
      sw.style.border = '2px solid #1e293b';
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
      svg.style.pointerEvents = 'none';
      const elUnder = document.elementFromPoint(e.clientX, e.clientY);
      svg.style.pointerEvents = 'all';
      if (elUnder && elUnder.classList.contains('webnote-hl')) {
        removeHighlight(elUnder.dataset.wn);
      }
      return;
    }
    
    if (!['draw','rect','ellipse','line'].includes(activeTool)) return;
    isDrawing = true;
    startX = e.pageX;
    startY = e.pageY;

    currentShape = document.createElementNS("http://www.w3.org/2000/svg", activeTool === 'draw' ? 'path' : activeTool);
    currentShape.setAttribute('stroke', activeColor);
    currentShape.setAttribute('stroke-width', '4');
    currentShape.setAttribute('fill', activeTool === 'draw' ? 'none' : 'transparent');
    
    if (activeTool === 'draw') {
      currentShape.setAttribute('stroke-linecap', 'round');
      currentShape.setAttribute('stroke-linejoin', 'round');
      pathData = `M ${startX} ${startY}`;
      currentShape.setAttribute('d', pathData);
    } else if (activeTool === 'line') {
      currentShape.setAttribute('stroke-linecap', 'round');
      currentShape.setAttribute('x1', startX);
      currentShape.setAttribute('y1', startY);
      currentShape.setAttribute('x2', startX);
      currentShape.setAttribute('y2', startY);
    }
    svg.appendChild(currentShape);
  });

  svg.addEventListener('mousemove', e => {
    if (!isDrawing || !currentShape) return;
    const cx = e.pageX;
    const cy = e.pageY;
    
    if (activeTool === 'draw') {
      pathData += ` L ${cx} ${cy}`;
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
    } else if (activeTool === 'line') {
      currentShape.setAttribute('x2', cx);
      currentShape.setAttribute('y2', cy);
    }
  });

  window.addEventListener('mouseup', () => {
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
      d.x1 = currentShape.getAttribute('x1'); d.y1 = currentShape.getAttribute('y1');
      d.x2 = currentShape.getAttribute('x2'); d.y2 = currentShape.getAttribute('y2');
      const dist = Math.hypot(d.x2 - d.x1, d.y2 - d.y1);
      if (dist < 5) { currentShape.remove(); return; }
    }
    
    currentShape.remove(); // let renderDrawings re-add it with events
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
