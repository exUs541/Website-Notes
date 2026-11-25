// popup.js
async function updateStats() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const data = await chrome.storage.local.get(['notes', 'autoShowFAB', 'bubbleOpacity']);
  const notes = data.notes || [];
  
  const totalCount = notes.length;
  const pageCount = notes.filter(n => n.url === tab.url).length;
  
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
      alert("WebNote kann auf Chrome-Systemseiten oder im Web Store aus Sicherheitsgründen nicht verwendet werden.");
      return;
    }
    
    // Inject script manually just in case
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
    } catch (_) { }

    chrome.tabs.sendMessage(tab.id, { action: "ADD_NOTE" }, (response) => {
      if (chrome.runtime.lastError) {
        alert("Hinweis: Bitte laden Sie die Seite einmal neu, um WebNote zu aktivieren.");
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
      alert("WebNote kann auf Chrome-Systemseiten oder im Web Store aus Sicherheitsgründen nicht verwendet werden.");
      return;
    }

    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
    } catch (_) { }

    chrome.tabs.sendMessage(tab.id, { action: "TOGGLE_TOOLBAR" }, () => {
      if (chrome.runtime.lastError) {
        alert("Hinweis: Bitte laden Sie die Seite einmal neu, um WebNote zu aktivieren.");
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
    window.open('mailto:feedback@webnote.app?subject=WebNote%20Feedback', '_blank');
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

updateStats();
