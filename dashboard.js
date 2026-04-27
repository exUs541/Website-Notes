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

  const filtered = notes.filter(n => n.content.toLowerCase().includes(query) || n.url.toLowerCase().includes(query));

  filtered.forEach(note => {
    const card = document.createElement('div');
    card.className = 'note-card';
    card.innerHTML = `
      <div class="meta">${note.url}</div>
      <div class="body">${note.content || '<i>Empty note</i>'}</div>
      <div class="footer">
        <button class="delete-btn" data-id="${note.id}">Delete</button>
      </div>
    `;
    card.querySelector('.delete-btn').onclick = () => deleteNote(note.id);
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
function renderRules() {
  const list = document.getElementById('rules-list');
  list.innerHTML = '';
  rules.hiddenUrls.forEach((rule, index) => {
    const item = document.createElement('li');
    item.className = 'rule-item';
    item.innerHTML = `
      <span>${rule}</span>
      <button class="delete-btn" onclick="deleteRule(${index})">Remove</button>
    `;
    list.appendChild(item);
  });
}

window.deleteRule = async (index) => {
  rules.hiddenUrls.splice(index, 1);
  await chrome.storage.local.set({ rules });
  renderRules();
};

document.getElementById('add-rule').onclick = async () => {
  const input = document.getElementById('new-rule');
  if (input.value) {
    rules.hiddenUrls.push(input.value);
    await chrome.storage.local.set({ rules });
    input.value = '';
    renderRules();
  }
};

// Export / Import
document.getElementById('export-btn').onclick = () => {
  const data = JSON.stringify({ notes, rules }, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `webnote-export-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
};

document.getElementById('import-trigger').onclick = () => document.getElementById('import-file').click();

document.getElementById('import-file').onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async (event) => {
    try {
      const data = JSON.parse(event.target.result);
      if (data.notes) notes = data.notes;
      if (data.rules) rules = data.rules;
      await chrome.storage.local.set({ notes, rules });
      renderAll();
      alert('Import successful!');
    } catch (err) {
      alert('Error parsing file.');
    }
  };
  reader.readAsText(file);
};

loadData();
