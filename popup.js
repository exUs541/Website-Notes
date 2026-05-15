// popup.js
async function updateStats() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const data = await chrome.storage.local.get(['notes', 'autoShowFAB']);
  const notes = data.notes || [];
  
  const totalCount = notes.length;
  const pageCount = notes.filter(n => n.url === tab.url).length;
  
  document.getElementById('total-count').textContent = totalCount;
  document.getElementById('page-count').textContent = pageCount;
  document.getElementById('version').textContent = `v${chrome.runtime.getManifest().version}`;
  
  // Set toggle state (default true)
  const autoShow = data.autoShowFAB !== false;
  document.getElementById('auto-show-fab').checked = autoShow;
}

document.getElementById('add-note').onclick = async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Inject script manually just in case
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });

    chrome.tabs.sendMessage(tab.id, { action: "ADD_NOTE" }, (response) => {
      if (chrome.runtime.lastError) {
        alert("Fehler: Konnte Seite nicht erreichen. Bitte Seite neu laden.");
      } else {
        window.close();
      }
    });
  } catch (err) {
    console.error("Popup error:", err);
  }
};

document.getElementById('toggle-toolbar').onclick = async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });

    chrome.tabs.sendMessage(tab.id, { action: "TOGGLE_TOOLBAR" }, () => {
      window.close();
    });
  } catch (err) {
    console.error("Popup error:", err);
  }
};

document.getElementById('open-dashboard').onclick = () => {
  chrome.runtime.openOptionsPage();
};

document.getElementById('auto-show-fab').onchange = async (e) => {
  const autoShow = e.target.checked;
  await chrome.storage.local.set({ autoShowFAB: autoShow });
  
  // Notify current tab to show/hide if necessary
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) {
    chrome.tabs.sendMessage(tab.id, { action: "AUTO_SHOW_CHANGED", value: autoShow }).catch(() => {});
  }
};

updateStats();
