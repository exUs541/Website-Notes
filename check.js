const fs = require('fs');
const code = fs.readFileSync('content.js', 'utf8');
const css  = fs.readFileSync('content.css', 'utf8');
const bg   = fs.readFileSync('background.js', 'utf8');
const mf   = fs.readFileSync('manifest.json', 'utf8');

const checks = [
  // Formatting: mousedown to preserve selection
  ['Format-Buttons nutzen onmousedown (kein Fokus-Verlust)',   code.includes("'.b-btn').onmousedown") && code.includes("preventDefault")],
  ['savedRange speichert Selektion aus contenteditable',       code.includes('savedRange = sel.getRangeAt(0).cloneRange()')],
  ['applyFormatRange hat surround + extractContents Fallback', code.includes('surroundContents') && code.includes('extractContents')],

  // Pin system
  ['Pin speichert pageX/pageY (absolute Seitenkoordinaten)',   code.includes('note.pageX') && code.includes('note.pageY')],
  ['scrollX/scrollY Berechnung beim Pinnen',                   code.includes('note.pageX - scrollX') && code.includes('note.pageY - scrollY')],
  ['updatePinnedPositions als scroll-Listener registriert',    code.includes('updatePinnedPositions') && code.includes("addEventListener('scroll'")],
  ['Drag aktualisiert pageX wenn gerpinnt',                    code.includes('note.pageX = nx + scrollX')],

  // Website Highlights
  ['Rechtsklick speichert lastPageRange',                      code.includes('lastPageRange = sel.getRangeAt(0).cloneRange()')],
  ['addHighlight nutzt applyHighlightRange (direkte Range)',   code.includes('applyHighlightRange(lastPageRange')],
  ['paintHighlight Fallback per TreeWalker',                   code.includes('TreeWalker') && code.includes('paintHighlight')],
  ['Markierung wird auf Klick entfernt',                       code.includes('removeHighlight') && code.includes('replaceWith')],
  ['Highlights werden beim Seitenaufruf wiederhergestellt',    code.includes('restoreHighlights') && code.includes('setTimeout')],

  // Dark mode entfernt
  ['dk-btn (Dark Mode Button) NICHT mehr vorhanden',           !code.includes('dk-btn')],
  ['.webnote-sticky.dark NICHT mehr im CSS',                   !css.includes('.webnote-sticky.dark')],

  // Visual: Pinned ring
  ['.webnote-sticky.pinned Ring-Shadow im CSS',                css.includes('.webnote-sticky.pinned')],

  // Modes
  ['m-compact blendet nb-wrap aus',                            css.includes('m-compact .nb-wrap')],
  ['m-compact blendet fmt-bar aus',                            css.includes('m-compact .fmt-bar')],
  ['m-icon zeigt p-btn als ein Symbol',                        css.includes('m-icon .p-btn')],

  // Tags
  ['Tags in note.tags gespeichert und gerendert',              code.includes('note.tags.push')],
  ['Tags in Sidebar angezeigt',                                code.includes('sb-tag')],

  // Sidebar
  ['Sidebar Suche filtert Ergebnisse',                         code.includes('sb-search') && code.includes('updateSidebarList(e.target.value')],

  // Duplicate
  ['Duplizieren kopiert alle note-Properties',                 code.includes('JSON.parse(JSON.stringify(note))')],

  // Badge
  ['Badge per Nachricht an background aktualisiert',           code.includes("action: 'UPDATE_BADGE'")],
  ['background.js behandelt UPDATE_BADGE',                     bg.includes('UPDATE_BADGE')],
  ['Badge beim Tab-Wechsel aktualisiert',                      bg.includes('tabs.onActivated')],

  // Context menu
  ['Kontextmenu: Text markieren vorhanden',                    bg.includes('add-highlight') && bg.includes('Text markieren')],
  ['Kontextmenu: Notiz erstellen vorhanden',                   bg.includes('add-note')],

  // Manifest
  ['Manifest Version 2.0.0',                                   mf.includes('"version": "2.0.0"')],
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
console.log('Ergebnis: ' + pass + '/' + (pass+fail) + ' bestanden');
if (failed.length) {
  console.log('\nFehlgeschlagene Tests:');
  failed.forEach(f => console.log('  - ' + f));
}
