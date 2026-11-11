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
function renderNotes() {
  const grid = document.getElementById('notes-grid');
  const query = document.getElementById('search-notes').value.toLowerCase();
  grid.innerHTML = '';

  const filtered = notes.filter(n => String(n.content || '').toLowerCase().includes(query) || String(n.url || '').toLowerCase().includes(query));

  filtered.forEach(note => {
    const card = document.createElement('div');
    card.className = 'note-card';
    const hiddenBadge = note.hidden ? ' <span class="hidden-badge">Hidden</span>' : '';
    const scope = note.urlScope || 'exact';
    const baseUrl = safeUrl(note.url);
    const targetJumpUrl = baseUrl === '#' ? '#' : `${baseUrl}#webnote-jump=${encodeURIComponent(note.id)}`;

    card.innerHTML = `
      <div class="meta">
        <a href="${escapeHtml(targetJumpUrl)}" target="_blank" rel="noopener noreferrer" title="Open the page and jump to this note">${escapeHtml(note.url)}</a>
        ${hiddenBadge}
      </div>
      <div class="body" contenteditable="true" spellcheck="true" role="textbox" aria-multiline="true" aria-label="Note text" title="Click to edit">${sanitizeHtml(note.content)}</div>
      <div class="footer">
        <select class="dash-scope-select" aria-label="Where this note appears" title="Where this note appears">
          <option value="exact" ${scope === 'exact' ? 'selected' : ''}>This page</option>
          <option value="path" ${scope === 'path' ? 'selected' : ''}>Same path</option>
          <option value="domain" ${scope === 'domain' ? 'selected' : ''}>Whole site</option>
        </select>
        <a href="${escapeHtml(targetJumpUrl)}" target="_blank" rel="noopener noreferrer" class="jump-btn" title="Open the page and scroll to this note">Jump to note</a>
        <button class="delete-btn">Delete</button>
      </div>
    `;
    card.querySelector('.delete-btn').onclick = () => deleteNote(note.id);

    const scopeSel = card.querySelector('.dash-scope-select');
    scopeSel.onchange = async (e) => {
      const newScope = e.target.value;
      note.urlScope = newScope;
      await chrome.storage.local.set({ notes });
    };

    // Save inline editing changes on blur
    const bodyEl = card.querySelector('.body');
    bodyEl.onblur = async () => {
      const newContent = sanitizeHtml(bodyEl.innerHTML);
      if (newContent !== note.content) {
        note.content = newContent;
        await chrome.storage.local.set({ notes });
      }
    };

    grid.appendChild(card);
  });
}

document.getElementById('search-notes').oninput = renderNotes;

async function deleteNote(id) {
  notes = notes.filter(n => n.id !== id);
  await chrome.storage.local.set({ notes });
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
    remove.textContent = 'Remove';
    remove.setAttribute('aria-label', `Remove exclusion ${rule}`);
    remove.addEventListener('click', () => deleteRule(index));

    item.append(label, remove);
    list.appendChild(item);
  });
}

async function deleteRule(index) {
  rules.hiddenUrls.splice(index, 1);
  await chrome.storage.local.set({ rules });
  renderRules();
}

async function addRule() {
  const input = document.getElementById('new-rule');
  const value = input.value.trim();
  if (value && !rules.hiddenUrls.includes(value)) {
    rules.hiddenUrls.push(value);
    await chrome.storage.local.set({ rules });
    renderRules();
  }
  input.value = '';
}
document.getElementById('add-rule').onclick = addRule;
document.getElementById('new-rule').addEventListener('keydown', (e) => { if (e.key === 'Enter') addRule(); });

// Export / Import
document.getElementById('export-btn').onclick = () => {
  const data = JSON.stringify({ notes, rules }, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `webnote-export-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

document.getElementById('import-trigger').onclick = () => document.getElementById('import-file').click();

document.getElementById('import-file').onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async (event) => {
    try {
      const data = JSON.parse(event.target.result);
      // Check the shape first so a wrong file cannot replace the user's notes with garbage.
      if (data.notes !== undefined && !Array.isArray(data.notes)) throw new Error('notes must be a list');
      if (data.rules !== undefined && !(data.rules && Array.isArray(data.rules.hiddenUrls))) throw new Error('rules are malformed');
      if (!data.notes && !data.rules) throw new Error('nothing to import');
      if (data.notes) notes = data.notes;
      if (data.rules) rules = data.rules;
      await chrome.storage.local.set({ notes, rules });
      renderAll();
      alert('Import successful.');
    } catch (err) {
      alert('This file is not a valid WebNote export. Nothing was changed.');
    } finally {
      e.target.value = '';
    }
  };
  reader.readAsText(file);
};

loadData();
