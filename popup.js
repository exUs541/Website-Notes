// popup.js
async function updateStats() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const data = await chrome.storage.local.get('notes');
  const notes = data.notes || [];
  
  const totalCount = notes.length;
  const pageCount = notes.filter(n => n.url === tab.url).length;
  
  document.getElementById('total-count').textContent = totalCount;
  document.getElementById('page-count').textContent = pageCount;
  document.getElementById('version').textContent = `v${chrome.runtime.getManifest().version}`;
}

document.getElementById('add-note').onclick = async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Inject script manually just in case
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });

    chrome.tabs.sendMessage(tab.id, { action: "CONTEXT_MENU_CLICKED" }, (response) => {
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

updateStats();
