// Scene 3: design feedback on a landing page - shapes, arrows, blur/redact, stickers, a note.
window.__SEED = (href) => {
  const W = innerWidth, T = __WN;
  const cta = T.rect('#cta'), email = T.rect('#email'), nm = T.rect('#name'), sub = T.text('so your team always knows what comes next'), h1 = T.rect('#h1');
  const plan = T.rect('.plan:nth-child(3)');
  const id = T.id;
  const note = { id: '2201', url: href, urlScope: 'exact', title: 'Feedback', content: '<strong>Make this button bigger</strong> and keep it above the fold.', tags: ['design'], x: cta.x - 30, y: cta.y + 96, pageX: cta.x - 30, pageY: cta.y + 96, width: 400, height: 170, displayMode: 'full', color: '#fef9c3', pinned: true };
  return {
    notes: [note],
    highlights: [{ id: '3201', url: href, text: 'so your team always knows what comes next', color: '#eab30880' }],
    drawings: [
      { id: id(), url: href, type: 'rect', color: '#ef4444', x: String(cta.x - 8), y: String(cta.y - 8), w: String(cta.w + 16), h: String(cta.h + 16) },
      { id: id(), url: href, type: 'arrow', color: '#ef4444', x1: String(cta.x + 62), y1: String(cta.y + 90), x2: String(cta.x + 62), y2: String(cta.y + cta.h + 16) },
      { id: id(), url: href, type: 'path', color: '#22c55e', data: T.underline(h1.x + 2, h1.x + h1.w * 0.55, h1.y + h1.h + 6, 3, 4) },
      { id: id(), url: href, type: 'censor-solid', x: String(email.x + 4), y: String(email.y + 4), w: String(email.w - 8), h: String(email.h - 8) },
      { id: id(), url: href, type: 'censor-glass', x: String(nm.x - 8), y: String(nm.y - 4), w: String(nm.w + 16), h: String(nm.h + 8) },
      { id: id(), url: href, type: 'sticker', text: '✅', x: String(plan.x + plan.w - 30), y: String(plan.y + 28), size: 34 },
      { id: id(), url: href, type: 'sticker', text: '💡', x: String(sub.x + sub.w + 28), y: String(sub.y + 10), size: 34 },
    ],
    toolbarState: { x: Math.round((W - 940) / 2), y: 62, min: false, vert: false, hidden: false },
    rules: { hiddenUrls: [] }, autoShowFAB: true, bubbleOpacity: 80,
  };
};
window.__AFTER_LOAD = async () => {
  const sh = document.querySelector('#webnote-shadow-host').shadowRoot, sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  sh.querySelector('#db-shape-menu').click();   // show the shapes menu (incl. blur and redact)
  await sleep(300);
};
