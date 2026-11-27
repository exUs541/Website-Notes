const I18n = window.WebNoteI18n;
const t = I18n.t;

let notes = [];
let rules = { hiddenUrls: [] };

async function loadData() {
  const data = await chrome.storage.local.get(['notes', 'rules']);
  notes = data.notes || [];
  rules = data.rules || { hiddenUrls: [] };
  renderAll();
}

function renderAll() {
  renderNotes();
  renderRules();
}

// Writes carry a stamp: the dashboard skips its own changes, open web pages pick them up.
const WRITER = Math.random().toString(36).slice(2);
let writes = 0;
function store(items) { return chrome.storage.local.set({ ...items, lastWrite: { by: WRITER, n: ++writes } }); }

// ── Safe rendering helpers ───────────────────────────────────────────────
// Note URLs, rules and note bodies can come from an imported file, so none of
// them is placed into the page as trusted markup.
function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Only web pages can be opened from a note; anything else (javascript:, data:, ...) is dropped.
function safeUrl(url) {
  try {
    const u = new URL(String(url));
    return (u.protocol === 'http:' || u.protocol === 'https:') ? u.href : '#';
  } catch {
    return '#';
  }
}

// Notes hold the user's rich text. Keep the formatting, remove anything executable or remote.
const BLOCKED_TAGS = 'script, style, iframe, object, embed, link, meta, base, form, svg, math';
function sanitizeHtml(html) {
  const doc = new DOMParser().parseFromString(String(html ?? ''), 'text/html');
  doc.body.querySelectorAll(BLOCKED_TAGS).forEach(el => el.remove());
  doc.body.querySelectorAll('*').forEach(el => {
    for (const attr of [...el.attributes]) {
      const name = attr.name.toLowerCase();
      const value = attr.value.trim().toLowerCase();
      if (name.startsWith('on')) el.removeAttribute(attr.name);
      else if ((name === 'href' || name === 'src' || name === 'xlink:href') &&
               !(value.startsWith('http:') || value.startsWith('https:') || value.startsWith('data:image/') || value.startsWith('#'))) {
        el.removeAttribute(attr.name);
      }
    }
    if (el.tagName === 'A') { el.setAttribute('target', '_blank'); el.setAttribute('rel', 'noopener noreferrer'); }
  });
  return doc.body.innerHTML;
}

// Tab Switching
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  };
});

// Notes Render
const plainText = (html) => new DOMParser().parseFromString(String(html ?? ''), 'text/html').body.textContent;
const tagsOf = (note) => (Array.isArray(note.tags) ? note.tags.map(String) : []);

function renderNotes() {
  const grid = document.getElementById('notes-grid');
  const query = document.getElementById('search-notes').value.toLowerCase();
  grid.innerHTML = '';

  const filtered = notes.filter(n => [n.title || '', plainText(n.content), n.url || '', ...tagsOf(n).map(tag => `#${tag}`)]
    .join('\n').toLowerCase().includes(query));

  const empty = document.getElementById('notes-empty');
  empty.hidden = filtered.length > 0;
  empty.textContent = t(notes.length ? 'dashboard.noMatches' : 'dashboard.emptyNotes');

  filtered.forEach(note => {
    const card = document.createElement('div');
    card.className = 'note-card';
    const hiddenBadge = note.hidden ? ` <span class="hidden-badge">${escapeHtml(t('dashboard.hidden'))}</span>` : '';
    const scope = note.urlScope || 'exact';
    const baseUrl = safeUrl(note.url);
    const targetJumpUrl = baseUrl === '#' ? '#' : `${baseUrl}#webnote-jump=${encodeURIComponent(note.id)}`;

    const title = String(note.title || t('note.untitled'));
    const tags = tagsOf(note).map(tag => `<span class="tag">#${escapeHtml(tag)}</span>`).join('');

    card.innerHTML = `
      <h3 class="title" title="${escapeHtml(title)}">${escapeHtml(title)}</h3>
      <div class="meta">
        <a href="${escapeHtml(targetJumpUrl)}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(t('dashboard.openAndJump'))}">${escapeHtml(note.url)}</a>
        ${hiddenBadge}
      </div>
      <div class="body" contenteditable="true" spellcheck="true" role="textbox" aria-multiline="true" aria-label="${escapeHtml(t('dashboard.noteText'))}" title="${escapeHtml(t('dashboard.clickToEdit'))}">${sanitizeHtml(note.content)}</div>
      ${tags ? `<div class="tags">${tags}</div>` : ''}
      <div class="footer">
        <select class="dash-scope-select" aria-label="${escapeHtml(t('dashboard.scopeLabel'))}" title="${escapeHtml(t('dashboard.scopeLabel'))}">
          <option value="exact" ${scope === 'exact' ? 'selected' : ''}>${escapeHtml(t('dashboard.scopeExact'))}</option>
          <option value="path" ${scope === 'path' ? 'selected' : ''}>${escapeHtml(t('dashboard.scopePath'))}</option>
          <option value="domain" ${scope === 'domain' ? 'selected' : ''}>${escapeHtml(t('dashboard.scopeDomain'))}</option>
        </select>
        <a href="${escapeHtml(targetJumpUrl)}" target="_blank" rel="noopener noreferrer" class="jump-btn" title="${escapeHtml(t('dashboard.jumpTitle'))}">${escapeHtml(t('dashboard.jumpToNote'))}</a>
        <button class="delete-btn">${escapeHtml(t('common.delete'))}</button>
      </div>
    `;
    card.querySelector('.delete-btn').onclick = () => deleteNote(note.id);

    const scopeSel = card.querySelector('.dash-scope-select');
    scopeSel.onchange = async (e) => {
      const current = notes.find(n => n.id === note.id); // the list may have been reloaded meanwhile
      if (!current) return;
      current.urlScope = e.target.value;
      await store({ notes });
    };

    // Save inline editing changes on blur
    const bodyEl = card.querySelector('.body');
    const shownContent = bodyEl.innerHTML;
    bodyEl.onblur = async () => {
      if (bodyEl.innerHTML === shownContent) return; // not edited: keep what is stored
      const current = notes.find(n => n.id === note.id);
      if (!current) return;
      current.content = sanitizeHtml(bodyEl.innerHTML);
      await store({ notes });
    };

    grid.appendChild(card);
  });
}

document.getElementById('search-notes').oninput = renderNotes;

async function deleteNote(id) {
  if (!confirm(t('dashboard.deleteNoteConfirm'))) return;
  notes = notes.filter(n => n.id !== id);
  await store({ notes });
  renderNotes();
}

// Rules Render
// (Event listeners instead of inline onclick="": extension pages forbid inline handlers
// through their content security policy, so the old Remove button did nothing.)
function renderRules() {
  const list = document.getElementById('rules-list');
  list.innerHTML = '';
  rules.hiddenUrls.forEach((rule, index) => {
    const item = document.createElement('li');
    item.className = 'rule-item';

    const label = document.createElement('span');
    label.textContent = rule;
    label.title = rule;

    const remove = document.createElement('button');
    remove.className = 'delete-btn';
    remove.textContent = t('dashboard.remove');
    remove.setAttribute('aria-label', t('dashboard.removeExclusion', { rule }));
    remove.addEventListener('click', () => deleteRule(index));

    item.append(label, remove);
    list.appendChild(item);
  });
}

async function deleteRule(index) {
  rules.hiddenUrls.splice(index, 1);
  await store({ rules });
  renderRules();
}

async function addRule() {
  const input = document.getElementById('new-rule');
  const value = input.value.trim();
  if (value && !rules.hiddenUrls.includes(value)) {
    rules.hiddenUrls.push(value);
    await store({ rules });
    renderRules();
  }
  input.value = '';
}
document.getElementById('add-rule').onclick = addRule;
document.getElementById('new-rule').addEventListener('keydown', (e) => { if (e.key === 'Enter') addRule(); });

// ── Settings ─────────────────────────────────────────────────────────────
const byId = (id) => document.getElementById(id);

async function renderSettings() {
  const s = await chrome.storage.local.get(['extensionEnabled', 'autoShowFAB', 'bubbleOpacity']);
  byId('set-enabled').checked = s.extensionEnabled !== false;
  byId('set-autoshow').checked = s.autoShowFAB !== false;
  const opacity = s.bubbleOpacity ?? 80;
  byId('set-opacity').value = opacity;
  byId('set-opacity-val').textContent = `${opacity}%`;
  byId('set-language').value = I18n.language;
}

byId('set-language').replaceChildren(...I18n.languages.map(({ code, name }) => {
  const option = new Option(name, code);
  option.lang = code; // every language is named in its own language
  return option;
}));
byId('set-language').onchange = (e) => I18n.setLanguage(e.target.value);
byId('set-enabled').onchange = (e) => store({ extensionEnabled: e.target.checked });
byId('set-autoshow').onchange = (e) => store({ autoShowFAB: e.target.checked });
byId('set-opacity').oninput = (e) => {
  byId('set-opacity-val').textContent = `${e.target.value}%`;
  store({ bubbleOpacity: Number(e.target.value) });
};

// ── Backup, restore, delete ──────────────────────────────────────────────
const DATA_KEYS = ['notes', 'highlights', 'drawings'];
const DRAWING_TYPES = /^(path|rect|ellipse|line|arrow|sticker|blur|censor-[a-z]+)$/;
const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

byId('export-btn').onclick = async () => {
  const data = await chrome.storage.local.get([...DATA_KEYS, 'rules']);
  const backup = {
    app: 'WebNote',
    version: chrome.runtime.getManifest().version,
    exportedAt: new Date().toISOString(),
    notes: data.notes || [],
    highlights: data.highlights || [],
    drawings: data.drawings || [],
    rules: data.rules || { hiddenUrls: [] },
  };
  const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `webnote-backup-${backup.exportedAt.slice(0, 10)}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

// Checks the shape first, so a wrong file cannot replace the user's data with garbage, and cleans
// note bodies, because those are shown as HTML on web pages. Throws if the file is not usable.
function readBackup(text) {
  const data = JSON.parse(text);
  if (!isObject(data)) throw new Error('not a backup');
  const parts = {};
  for (const key of DATA_KEYS) {
    if (data[key] === undefined) continue; // older exports hold notes and rules only
    if (!Array.isArray(data[key]) || !data[key].every(isObject)) throw new Error(`${key} must be a list`);
    parts[key] = data[key];
  }
  if (data.rules !== undefined) {
    if (!(isObject(data.rules) && Array.isArray(data.rules.hiddenUrls))) throw new Error('rules are malformed');
    parts.rules = { ...data.rules, hiddenUrls: data.rules.hiddenUrls.map(String) };
  }
  if (!Object.keys(parts).length) throw new Error('nothing to import');
  if (parts.notes) {
    parts.notes = parts.notes.map((n) => ({
      ...n,
      id: String(n.id ?? crypto.randomUUID()),
      title: String(n.title ?? ''),
      content: sanitizeHtml(n.content),
      tags: tagsOf(n),
    }));
  }
  if (parts.drawings) parts.drawings = parts.drawings.filter((d) => typeof d.type === 'string' && DRAWING_TYPES.test(d.type));
  return parts;
}

function describe(parts) {
  const lines = [];
  if (parts.notes) lines.push(t('dashboard.partNotes', { n: parts.notes.length }));
  if (parts.highlights) lines.push(t('dashboard.partHighlights', { n: parts.highlights.length }));
  if (parts.drawings) lines.push(t('dashboard.partDrawings', { n: parts.drawings.length }));
  if (parts.rules) lines.push(t('dashboard.partRules', { n: parts.rules.hiddenUrls.length }));
  return lines.join('\n');
}

byId('import-trigger').onclick = () => byId('import-file').click();

byId('import-file').onchange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const parts = readBackup(await file.text());
    if (!confirm(`${t('dashboard.restoreConfirm')}\n\n${describe(parts)}`)) return;
    if (parts.notes) notes = parts.notes;
    if (parts.rules) rules = parts.rules;
    await store(parts);
    renderAll();
    alert(t('dashboard.importOk'));
  } catch (err) {
    alert(t('dashboard.importFail'));
  } finally {
    e.target.value = '';
  }
};

byId('delete-all').onclick = async () => {
  const data = await chrome.storage.local.get(DATA_KEYS);
  const count = Object.fromEntries(DATA_KEYS.map((key) => [key, (data[key] || []).length]));
  if (!DATA_KEYS.some((key) => count[key])) { alert(t('dashboard.nothingToDelete')); return; }
  if (!confirm(t('dashboard.deleteAllConfirm', count))) return;
  notes = [];
  await store({ notes: [], highlights: [], drawings: [] });
  renderNotes();
};

// ── Live updates ─────────────────────────────────────────────────────────
// Changes made on web pages or in the popup appear here at once. While a note is being edited the
// list is redrawn only after the cursor has left it.
let stale = false;
const editing = () => Boolean(document.activeElement?.closest('.note-card .body'));
function refresh() {
  if (editing()) stale = true;
  else renderAll();
}
byId('notes-grid').addEventListener('focusout', () => setTimeout(() => {
  if (stale && !editing()) { stale = false; renderAll(); }
}, 0));

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local' || changes.lastWrite?.newValue?.by === WRITER) return;
  if (changes.extensionEnabled || changes.autoShowFAB || changes.bubbleOpacity) renderSettings();
  if (changes.notes) notes = changes.notes.newValue || [];
  if (changes.rules) rules = changes.rules.newValue || { hiddenUrls: [] };
  if (changes.notes || changes.rules) refresh();
});

// A language picked here or in the popup is applied straight away.
I18n.onChange(() => {
  I18n.apply(document);
  renderAll();
  renderSettings();
});

(async () => {
  try {
    await I18n.init();
    I18n.apply(document);
    byId('app-version').textContent = `WebNote v${chrome.runtime.getManifest().version}`;
    await Promise.all([loadData(), renderSettings()]);
  } finally {
    document.documentElement.classList.remove('i18n-loading');
  }
})();
