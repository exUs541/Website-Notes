// Scene 1: the whole toolbox on a research article.
window.__SEED = (href) => {
  const W = innerWidth, T = __WN;
  const h2 = T.text('The hippocampus replays your day');
  const intro = T.text('moved from a fragile short-term store into lasting memory');
  const spindles = T.text('slow oscillations and sleep spindles');
  const replay = T.text('replays patterns of activity');
  const n = (o) => ({ urlScope: 'exact', tags: [], displayMode: 'full', width: 400, height: 190, pinned: false, color: null, ...o, url: href, pageX: o.x, pageY: o.y });
  return {
    notes: [
      n({ id: '2001', title: 'Exam tip', color: '#fef9c3', tags: ['study'], x: W - 450, y: 112, pinned: true,
          content: '<strong>Review before bed</strong><br>Replay the 3 key ideas right before sleep – it makes them stick.' }),
      n({ id: '2002', title: 'Source for essay', color: '#dbeafe', tags: ['research', 'essay'], x: W - 450, y: 330, width: 400, height: 170, pinned: true,
          content: 'Look up the sleep-spindle study and add it to the bibliography.' }),
    ],
    highlights: [
      { id: '3001', url: href, text: 'moved from a fragile short-term store into lasting memory', color: '#eab30880' },
      { id: '3002', url: href, text: 'slow oscillations and sleep spindles', color: '#22c55e80' },
      { id: '3003', url: href, text: 'replays patterns of activity', color: '#3b82f680' },
    ],
    drawings: [
      { id: '4001', url: href, type: 'path', color: '#ef4444', data: T.loop(h2, 6, 3) },
      { id: '4002', url: href, type: 'sticker', text: '⭐', x: String(h2.x + h2.w + 34), y: String(h2.y + h2.h / 2 + 2), size: 34 },
    ],
    toolbarState: { x: Math.round((W - 940) / 2), y: 60, min: false, vert: false, hidden: false },
    rules: { hiddenUrls: [] }, autoShowFAB: true, bubbleOpacity: 80,
  };
};
