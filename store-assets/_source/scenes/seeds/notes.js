// Scene 2: notes (tags, URL scope, floating icon) with the toolbar collapsed to its round button.
window.__SEED = (href) => {
  const W = innerWidth, T = __WN;
  const timing = T.rect('#p-timing');
  const base = { urlScope: 'exact', tags: [], displayMode: 'full', width: 350, height: 200, width: 400, pinned: true, color: null, url: href };
  const n = (o) => ({ ...base, ...o, pageX: o.x, pageY: o.y });
  return {
    notes: [
      n({ id: '2101', title: 'To do tonight', color: '#fef9c3', tags: ['study', 'sleep'], x: W - 450, y: timing.y - 40, height: 240,
          content: '<strong>Before bed</strong><br>• Review the 3 key ideas<br>• Phone away by 11 pm<br>• Alarm for 7:00' }),
      n({ id: '2102', title: 'Question for class', color: '#fce7f3', tags: ['question'], urlScope: 'domain', x: W - 450, y: timing.y + 230, height: 190,
          content: '<br><br><br>Do naps count too?' }),
      n({ id: '2103', title: 'Chart idea', color: '#dcfce7', displayMode: 'icon', x: 470, y: T.rect('#h-timing').y - 6, content: 'Use this chart in the slides.' }),
    ],
    highlights: [
      { id: '3101', url: href, text: 'sleeping soon after studying improves recall the next day', color: '#eab30880' },
      { id: '3102', url: href, text: 'Review the key ideas shortly before bed.', color: '#22c55e80' },
    ],
    drawings: [],
    toolbarState: { x: W - 96, y: 64, min: true, vert: false, hidden: false },
    rules: { hiddenUrls: [] }, autoShowFAB: true, bubbleOpacity: 100,
  };
};
window.__AFTER_LOAD = async () => {
  const T = __WN, sh = document.querySelector('#webnote-shadow-host').shadowRoot, sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  scrollTo(0, Math.max(0, T.rect('#h-timing').y - 110));
  await sleep(300);
  // open the tag row on the first note and the URL-scope menu on the second
  sh.querySelector('#note-2101 .tg-btn').click();
  sh.querySelector('#note-2102 .scope-btn-toggle').click();
  await sleep(200);
};
