const fs = require('fs');
const code = fs.readFileSync('content.js', 'utf8');
const css  = fs.readFileSync('content.css', 'utf8');
const bg   = fs.readFileSync('background.js', 'utf8');
const mf   = fs.readFileSync('manifest.json', 'utf8');

const checks = [
  // Formatting: mousedown to preserve selection
  ['Format buttons use onmousedown (no focus loss)',   code.includes("'.b-btn').onmousedown") && code.includes("preventDefault")],
  ['savedRange stores the selection from contenteditable',  code.includes('savedRange = range.cloneRange()')],
  ['applyFormatRange has surround + extractContents fallback', code.includes('surroundContents') && code.includes('extractContents')],

  // Pin system
  ['Pin stores pageX/pageY (absolute page coordinates)',   code.includes('note.pageX') && code.includes('note.pageY')],
  ['scrollX/scrollY calculation when pinning',                   code.includes('note.pageX - scrollX') && code.includes('note.pageY - scrollY')],
  ['updatePinnedPositions registered as scroll listener',    code.includes('updatePinnedPositions') && code.includes("addEventListener('scroll'")],
  ['Drag updates pageX when pinned',                    code.includes('note.pageX = nx + scrollX')],

  // Website Highlights
  ['Right-click stores lastPageRange',                      code.includes('lastPageRange = sel.getRangeAt(0).cloneRange()')],
  ['addHighlight uses applyHighlightRange (direct range)',   code.includes('applyHighlightRange(lastPageRange')],
  ['paintHighlight fallback via TreeWalker',                   code.includes('TreeWalker') && code.includes('paintHighlight')],
  ['Highlight is removed on click',                       code.includes('removeHighlight') && code.includes('replaceWith')],
  ['Highlights are restored on page load',    code.includes('restoreHighlights') && code.includes('setTimeout')],

  // Dark mode entfernt
  ['dk-btn (dark mode button) is gone',           !code.includes('dk-btn')],
  ['.webnote-sticky.dark is gone from the CSS',                   !css.includes('.webnote-sticky.dark')],

  // Visual: Pinned ring
  ['.webnote-sticky.pinned ring shadow in the CSS',                css.includes('.webnote-sticky.pinned')],

  // Modes
  ['Old compact notes are shown at full size',              code.includes("['full', 'icon'].includes(note.displayMode)")],
  ['m-icon shows the floating note icon',                   css.includes('.webnote-sticky.m-icon .note-float-icon')],

  // Tags
  ['Tags stored in note.tags and rendered',              code.includes('note.tags.push')],
  ['Tags shown in the sidebar',                                code.includes('sb-tag')],

  // Sidebar
  ['Sidebar search filters results',                         code.includes('sb-search') && code.includes('updateSidebarList(e.target.value')],

  // Duplicate
  ['Duplicate copies all note properties',                 code.includes('JSON.parse(JSON.stringify(note))')],

  // Badge
  ['Badge updated via message to background',           code.includes("action: 'UPDATE_BADGE'")],
  ['background.js handles UPDATE_BADGE',                     bg.includes('UPDATE_BADGE')],
  ['Badge updated on tab switch',                      bg.includes('tabs.onActivated')],

  // Context menu
  ['Context menu: highlight text entry present',                    bg.includes('add-highlight')],
  ['Context menu: create note entry present',                   bg.includes('add-note')],

  // Manifest
  ['Popup version placeholder matches the manifest',        fs.readFileSync('popup.html', 'utf8').includes(`>v${JSON.parse(mf).version}<`)],
  ['contextMenus Permission',                                   mf.includes('"contextMenus"')],
  ['storage Permission',                                       mf.includes('"storage"')],
];

let pass = 0, fail = 0;
const failed = [];
checks.forEach(([name, result]) => {
  const icon = result ? 'PASS' : 'FAIL';
  if (!result) failed.push(name);
  console.log((result ? '[+]' : '[x]') + ' ' + icon + ' - ' + name);
  result ? pass++ : fail++;
});

console.log('\n' + '='.repeat(60));
console.log('Result: ' + pass + '/' + (pass+fail) + ' passed');
if (failed.length) {
  console.log('\nFailed checks:');
  failed.forEach(f => console.log('  - ' + f));
}
