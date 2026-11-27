// Scene 5: the popup on the article page.
window.__PAGE_URL = 'https://lumen-science.com/brain/sleep-and-memory';
window.__SEED = () => {
  const notes = [];
  for (let i = 0; i < 18; i++) notes.push({ id: String(1 + i), url: i < 3 ? 'https://lumen-science.com/brain/sleep-and-memory' : 'https://example.org/p' + i, content: '', tags: [] });
  return { notes, autoShowFAB: true, bubbleOpacity: 80 };
};
