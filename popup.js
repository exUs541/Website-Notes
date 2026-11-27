// popup.js
const I18n = window.WebNoteI18n;
const t = I18n.t;

async function updateStats() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const data = await chrome.storage.local.get(['notes', 'autoShowFAB', 'bubbleOpacity']);
  const notes = data.notes || [];
  
  const totalCount = notes.length;
  // The page itself knows which notes belong to it; a page WebNote is not running on gives no answer.
  const page = await chrome.tabs.sendMessage(tab.id, { action: 'GET_PAGE_COUNT' }).catch(() => null);
  const pageCount = page?.ok ? page.count : '–';
  
  document.getElementById('total-count').textContent = totalCount;
  document.getElementById('page-count').textContent = pageCount;
  document.getElementById('version').textContent = `v${chrome.runtime.getManifest().version}`;
  
  // Set toggle state (default true)
  const autoShow = data.autoShowFAB !== false;
  document.getElementById('auto-show-fab').checked = autoShow;

  // Set bubble opacity state (default 80)
  const bubbleOpacity = data.bubbleOpacity !== undefined ? data.bubbleOpacity : 80;
  document.getElementById('bubble-opacity-slider').value = bubbleOpacity;
  document.getElementById('bubble-opacity-val').textContent = `${bubbleOpacity}%`;
}

function isRestrictedTab(tab) {
  if (!tab || !tab.url) return false;
  const u = tab.url;
  return u.startsWith('chrome://') || u.startsWith('chrome-extension://') || u.startsWith('about:') || u.includes('chrome.google.com/webstore') || u.includes('chromewebstore.google.com');
}

document.getElementById('add-note').onclick = async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;
    if (isRestrictedTab(tab)) {
      alert(t('popup.restrictedPage'));
      return;
    }
    
    // Inject script manually just in case
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['i18n.js', 'content.js']
      });
    } catch (_) { }

    chrome.tabs.sendMessage(tab.id, { action: "ADD_NOTE" }, (response) => {
      if (chrome.runtime.lastError) {
        alert(t('popup.reloadHint'));
      } else if (response?.excluded) {
        alert(t('popup.excludedPage'));
      } else {
        window.close();
      }
    });
  } catch (err) {
    console.warn("Popup action skipped:", err.message);
  }
};

document.getElementById('toggle-toolbar').onclick = async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;
    if (isRestrictedTab(tab)) {
      alert(t('popup.restrictedPage'));
      return;
    }

    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['i18n.js', 'content.js']
      });
    } catch (_) { }

    chrome.tabs.sendMessage(tab.id, { action: "TOGGLE_TOOLBAR" }, (response) => {
      if (chrome.runtime.lastError) {
        alert(t('popup.reloadHint'));
      } else if (response?.excluded) {
        alert(t('popup.excludedPage'));
      } else {
        window.close();
      }
    });
  } catch (err) {
    console.warn("Popup action skipped:", err.message);
  }
};

document.getElementById('open-dashboard').onclick = () => {
  chrome.runtime.openOptionsPage();
};

const feedbackEl = document.getElementById('feedback-link');
if (feedbackEl) {
  feedbackEl.onclick = (e) => {
    e.preventDefault();
    window.open('https://github.com/exUs541/Website-Notes/issues', '_blank');
  };
}

document.getElementById('auto-show-fab').onchange = async (e) => {
  const autoShow = e.target.checked;
  await chrome.storage.local.set({ autoShowFAB: autoShow });
  
  // Notify current tab to show/hide if necessary
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) {
    chrome.tabs.sendMessage(tab.id, { action: "AUTO_SHOW_CHANGED", value: autoShow }).catch(() => {});
  }
};

document.getElementById('bubble-opacity-slider').oninput = async (e) => {
  const val = parseInt(e.target.value);
  document.getElementById('bubble-opacity-val').textContent = `${val}%`;
  await chrome.storage.local.set({ bubbleOpacity: val });
  
  // Notify active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) {
    chrome.tabs.sendMessage(tab.id, { action: "BUBBLE_OPACITY_CHANGED", value: val }).catch(() => {});
  }
};

// Master switch: while it is off WebNote adds nothing to any page.
const masterEnabled = document.getElementById('master-enabled');
function renderEnabled(on) {
  masterEnabled.checked = on;
  document.body.classList.toggle('ext-off', !on);
  document.getElementById('off-note').hidden = on;
  document.querySelector('.card').inert = !on;
  ['add-note', 'toggle-toolbar'].forEach((id) => { document.getElementById(id).disabled = !on; });
}
chrome.storage.local.get('extensionEnabled', (stored) => renderEnabled(stored.extensionEnabled !== false));
masterEnabled.onchange = () => chrome.storage.local.set({ extensionEnabled: masterEnabled.checked });
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.extensionEnabled) renderEnabled(changes.extensionEnabled.newValue !== false);
});

// ── Language switcher ───────────────────────────────────────────────────────
const langBtn = document.getElementById('lang-btn');
const langMenu = document.getElementById('lang-menu');
const langCode = document.getElementById('lang-code');
const CHECK_ICON = '<svg class="check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';

function buildLanguageMenu() {
  langMenu.replaceChildren(...I18n.languages.map(({ code, name }) => {
    const li = document.createElement('li');
    li.setAttribute('role', 'none');

    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'lang-item';
    item.setAttribute('role', 'menuitemradio');
    item.dataset.lang = code;
    item.lang = code; // every language is named in its own language

    const label = document.createElement('span');
    label.textContent = name;
    item.appendChild(label);
    item.insertAdjacentHTML('beforeend', CHECK_ICON);

    li.appendChild(item);
    return li;
  }));
}

function refreshLanguageMenu() {
  langCode.textContent = I18n.language.toUpperCase();
  langMenu.querySelectorAll('.lang-item').forEach(item => {
    item.setAttribute('aria-checked', String(item.dataset.lang === I18n.language));
  });
}

function setLanguageMenuOpen(open, { returnFocus = false } = {}) {
  langMenu.hidden = !open;
  langBtn.setAttribute('aria-expanded', String(open));
  if (open) {
    (langMenu.querySelector('.lang-item[aria-checked="true"]') || langMenu.querySelector('.lang-item'))?.focus();
  } else if (returnFocus) {
    langBtn.focus();
  }
}

langBtn.addEventListener('click', () => setLanguageMenuOpen(langMenu.hidden));
langBtn.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown' && langMenu.hidden) { e.preventDefault(); setLanguageMenuOpen(true); }
});

langMenu.addEventListener('click', async (e) => {
  const item = e.target.closest('.lang-item');
  if (!item) return;
  setLanguageMenuOpen(false, { returnFocus: true });
  await I18n.setLanguage(item.dataset.lang);
});

langMenu.addEventListener('keydown', (e) => {
  const items = [...langMenu.querySelectorAll('.lang-item')];
  const i = items.indexOf(document.activeElement);
  if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length].focus(); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
  else if (e.key === 'Home') { e.preventDefault(); items[0].focus(); }
  else if (e.key === 'End') { e.preventDefault(); items[items.length - 1].focus(); }
  else if (e.key === 'Escape') { e.preventDefault(); setLanguageMenuOpen(false, { returnFocus: true }); }
  else if (e.key === 'Tab') { setLanguageMenuOpen(false); }
});

// Click anywhere else closes the menu.
document.addEventListener('click', (e) => {
  if (!langMenu.hidden && !e.target.closest('.lang')) setLanguageMenuOpen(false);
});

I18n.onChange(() => {
  I18n.apply(document);
  refreshLanguageMenu();
});

// ── Start ───────────────────────────────────────────────────────────────────
(async () => {
  try {
    await I18n.init();
    I18n.apply(document);
    buildLanguageMenu();
    refreshLanguageMenu();
    await updateStats();
  } catch (err) {
    console.warn('Popup start-up issue:', err);
  } finally {
    document.documentElement.classList.remove('i18n-loading');
  }
})();
