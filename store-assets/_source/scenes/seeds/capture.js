// Scene 4a: area screenshot in progress on the article.
window.__SEED = (href) => {
  const W = innerWidth;
  return {
    notes: [], drawings: [],
    highlights: [{ id: '3301', url: href, text: 'moved from a fragile short-term store into lasting memory', color: '#eab30880' }],
    toolbarState: { x: Math.round((W - 940) / 2), y: 60, min: false, vert: false, hidden: false },
    rules: { hiddenUrls: [] }, autoShowFAB: true, bubbleOpacity: 80,
  };
};
window.__AFTER_LOAD = async () => {
  const T = __WN, sh = document.querySelector('#webnote-shadow-host').shadowRoot, sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  sh.querySelector('.db-btn-screenshot').click();
  await sleep(300);
  const ov = sh.querySelector('.wn-ss-overlay');
  const a = T.text('Every evening your brain'), b = T.text('into lasting memory');
  const x1 = 42, y1 = a.y - 22 - scrollY, x2 = 765, y2 = b.y + b.h + 20 - scrollY;
  const ev = (type, x, y) => ov.dispatchEvent(new MouseEvent(type, { bubbles: true, clientX: x, clientY: y }));
  ev('mousedown', x1, y1); ev('mousemove', (x1 + x2) / 2, (y1 + y2) / 2); ev('mousemove', x2, y2);
  await sleep(200);
};
