// Layouts for every store image. Coordinates are CSS pixels on the canvas of that image.
const LOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="#86efac" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10" width="16" height="11" rx="2.5"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>';
const ART = 'lumen-science.com/brain/sleep-and-memory';

const headerItems = (chips) => [
  { type: 'brand', at: { left: 64, top: 44 } },
  { type: 'chips', at: { right: 64, top: 50 }, list: chips },
];

window.CONFIGS = {
  // ── 1 hero ────────────────────────────────────────────────────────────────────
  hero: { items: [
    ...headerItems(['Sticky notes', 'Highlighter', 'Drawing', 'Screenshots']),
    { type: 'h1', at: { left: 64, top: 100, fontSize: 54, width: 1100 }, html: 'Turn any web page into your notebook' },
    { type: 'window', bleed: true, at: { left: 64, top: 180, width: 1152, height: 640 }, url: ART, src: '/scenes/article.html?seed=hero&layout=left' },
  ] },

  // ── 2 notes ───────────────────────────────────────────────────────────────────
  notes: { items: [
    ...headerItems(['Color-coded notes', 'Tags', 'Pin to the page']),
    { type: 'h1', at: { left: 64, top: 100, fontSize: 54, width: 1100 }, html: 'Sticky notes that stay where you put them' },
    { type: 'window', bleed: true, at: { left: 64, top: 180, width: 1152, height: 640 }, url: ART, src: '/scenes/article.html?seed=notes&layout=left' },
  ] },

  // ── 3 markup ──────────────────────────────────────────────────────────────────
  markup: { items: [
    ...headerItems(['Shapes & arrows', 'Stickers', 'Blur & redact']),
    { type: 'h1', at: { left: 64, top: 100, fontSize: 54, width: 1150 }, html: 'Highlight, draw and blur anything on the page' },
    { type: 'window', bleed: true, at: { left: 64, top: 180, width: 1152, height: 640 }, url: 'orbit-app.io', src: '/scenes/landing.html?seed=markup' },
  ] },

  // ── 4 capture ─────────────────────────────────────────────────────────────────
  capture: { items: [
    ...headerItems(['Area, element or screen', 'Full-page', 'Screen recording']),
    { type: 'h1', at: { left: 64, top: 100, fontSize: 54, width: 1150 }, html: 'Capture screenshots and record your screen' },
    { type: 'window', bleed: true, at: { left: 64, top: 180, width: 1152, height: 640 }, url: ART, src: '/scenes/article.html?seed=capture&layout=left' },
    { type: 'crop', at: { left: 836, top: 462, width: 416, height: 317, borderRadius: 20 }, src: '/scenes/article.html?seed=capture-video', frame: { width: 1152, height: 588 }, offset: { x: 368, y: 136 } },
  ] },

  // ── 5 manage ──────────────────────────────────────────────────────────────────
  manage: { items: [
    ...headerItems(['Search & sort', 'Export & import', 'Exclude sites']),
    { type: 'h1', at: { left: 64, top: 100, fontSize: 54, width: 1150 }, html: 'Find and manage every note in one place' },
    { type: 'window', bleed: true, at: { left: 64, top: 180, width: 880, height: 640 }, url: 'WebNote dashboard', src: '/ext/dashboard.html?seed=dash' },
    { type: 'card', at: { left: 962, top: 214, width: 290, height: 440 }, src: '/ext/popup.html?seed=popup-card' },
    { type: 'badge', at: { right: 28, top: 690 }, html: LOCK + '100% local · no account' },
  ] },
};

// ── Promo tiles ────────────────────────────────────────────────────────────────
const HERO = '/scenes/article.html?seed=hero&layout=left';
Object.assign(window.CONFIGS, {
  // Chrome Web Store marquee / Edge large tile, 1400 x 560
  marquee: { dark: true, items: [
    { type: 'brand', size: 92, fontSize: 40, at: { left: 80, top: 78 } },
    { type: 'h1', at: { left: 80, top: 206, fontSize: 56, width: 600 }, html: 'Sticky notes, highlighter &amp; drawing for any website' },
    { type: 'sub', at: { left: 80, top: 408, fontSize: 24, width: 540 }, html: 'Annotate pages, capture screenshots and keep everything private on your device.' },
    { type: 'window', scale: 0.62, natural: { width: 1152, height: 588 }, url: 'lumen-science.com', at: { left: 700, top: 84, transform: 'rotate(-3deg)' }, src: HERO },
  ] },
  // Chrome Web Store small promo tile / Edge small tile, 440 x 280
  small: { dark: true, items: [
    { type: 'brand', size: 52, fontSize: 28, at: { left: 28, top: 26 } },
    { type: 'h1', at: { left: 28, top: 98, fontSize: 25, width: 250 }, html: 'Notes, highlights &amp; drawings on any website' },
    { type: 'crop', scale: 0.62, at: { left: 268, top: 112, width: 220, height: 142, transform: 'rotate(4deg)' }, src: HERO, frame: { width: 1152, height: 588 }, offset: { x: 702, y: 112 } },
    { type: 'crop', scale: 0.62, at: { left: 232, top: 190, width: 220, height: 116, transform: 'rotate(-3deg)' }, src: HERO, frame: { width: 1152, height: 588 }, offset: { x: 702, y: 330 } },
  ] },
});
