// Scene 4b: the recording dialog (cropped to the card in the layout).
window.__SEED = () => ({ notes: [], drawings: [], highlights: [], toolbarState: { x: 60, y: 60, min: false, vert: false, hidden: false }, rules: { hiddenUrls: [] }, autoShowFAB: true, bubbleOpacity: 80 });
window.__AFTER_LOAD = async () => {
  const sh = document.querySelector('#webnote-shadow-host').shadowRoot, sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  sh.querySelector('.db-btn-video').click();
  await sleep(300);
  const cb = sh.querySelector('#wn-rec-mic-audio-cb'); if (cb) cb.checked = true;
};
