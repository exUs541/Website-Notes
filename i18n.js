// i18n.js - WebNote language support
//
// One small module shared by every part of the extension: the popup, the dashboard,
// the background service worker and the content script. The chosen language lives in
// chrome.storage.local under "language", so a change made in the popup reaches every
// open page and the context menu without a reload.
//
// To add a language: add an entry to LANGUAGES and a matching block in MESSAGES.
// Keys missing from a language fall back to English, then to the key itself.
//
// Markup helpers (see apply()):
//   data-i18n="key"                 -> element text
//   data-i18n-title="key"           -> title attribute
//   data-i18n-placeholder="key"     -> placeholder attribute
//   data-i18n-aria-label="key"      -> aria-label attribute
//   data-i18n-alt="key"             -> alt attribute
(function (root) {
  'use strict';
  if (root.WebNoteI18n) return;

  const STORAGE_KEY = 'language';
  const DEFAULT_LANGUAGE = 'en';

  const LANGUAGES = [
    { code: 'en', name: 'English', locale: 'en-US' },
    { code: 'de', name: 'Deutsch', locale: 'de-DE' },
  ];

  const MESSAGES = {
    en: {
      // ── Shared ──────────────────────────────────────────────────────────────
      'common.close': 'Close',
      'common.cancel': 'Cancel',
      'common.delete': 'Delete',

      // ── Popup ───────────────────────────────────────────────────────────────
      'popup.overview': 'Overview and settings',
      'popup.pageNotes': 'Notes on this page',
      'popup.allNotes': 'All notes',
      'popup.showIcon': 'Show icon on new sites',
      'popup.iconOpacity': 'Icon opacity',
      'popup.addNote': 'Add note to page',
      'popup.toggleToolbar': 'Show or hide toolbar',
      'popup.openDashboard': 'Open dashboard',
      'popup.feedback': 'Feedback',
      'popup.language': 'Language',
      'popup.masterToggle': 'Turn WebNote on or off',
      'popup.offNote': 'WebNote is off. Pages stay exactly as they are.',
      'popup.restrictedPage': 'WebNote cannot be used on Chrome system pages or in the Web Store for security reasons.',
      'popup.reloadHint': 'Please reload the page once to activate WebNote.',

      // ── Dashboard ───────────────────────────────────────────────────────────
      'dashboard.sections': 'Sections',
      'dashboard.navAllNotes': 'All Notes',
      'dashboard.navUrlRules': 'URL Rules',
      'dashboard.navSettings': 'Settings',
      'dashboard.notes': 'Notes',
      'dashboard.searchNotes': 'Search notes',
      'dashboard.exportJson': 'Export JSON',
      'dashboard.importJson': 'Import JSON',
      'dashboard.rulesTitle': 'URL Rules',
      'dashboard.rulesIntro': 'Control where WebNote appears. You can exclude specific domains or subpages.',
      'dashboard.rulePlaceholder': 'e.g. google.com or /search',
      'dashboard.ruleAria': 'Domain or path to exclude',
      'dashboard.addExclusion': 'Add exclusion',
      'dashboard.settingsTitle': 'Settings',
      'dashboard.cloudSync': 'Cloud Sync',
      'dashboard.cloudSyncDesc': 'Sync notes across your browser profiles. Limited to 100 KB in total.',
      'dashboard.cloudSyncAria': 'Cloud sync',
      'dashboard.hidden': 'Hidden',
      'dashboard.openAndJump': 'Open the page and jump to this note',
      'dashboard.noteText': 'Note text',
      'dashboard.clickToEdit': 'Click to edit',
      'dashboard.scopeLabel': 'Where this note appears',
      'dashboard.scopeExact': 'This page',
      'dashboard.scopePath': 'Same path',
      'dashboard.scopeDomain': 'Whole site',
      'dashboard.jumpToNote': 'Jump to note',
      'dashboard.jumpTitle': 'Open the page and scroll to this note',
      'dashboard.remove': 'Remove',
      'dashboard.removeExclusion': 'Remove exclusion {rule}',
      'dashboard.importOk': 'Import successful.',
      'dashboard.importFail': 'This file is not a valid WebNote export. Nothing was changed.',

      // ── Context menu ────────────────────────────────────────────────────────
      'ctx.createNote': 'WebNote: Create Note',
      'ctx.noteFromSelection': 'WebNote: Note from Selection',
      'ctx.highlight': 'WebNote: Highlight Text 🖊',

      // ── Toolbar ─────────────────────────────────────────────────────────────
      'toolbar.open': 'Open WebNote',
      'toolbar.drag': 'Drag to Move',
      'toolbar.orientation': 'Change Orientation',
      'toolbar.allNotes': 'All Notes (Sidebar)',
      'toolbar.newNote': 'New Note',
      'toolbar.cursor': 'Mouse (Normal)',
      'toolbar.highlight': 'Highlight Text',
      'toolbar.draw': 'Freehand Drawing',
      'toolbar.shapes': 'Shapes',
      'toolbar.rect': 'Rectangle',
      'toolbar.circle': 'Circle',
      'toolbar.line': 'Line',
      'toolbar.arrow': 'Arrow',
      'toolbar.blur': 'Frosted Glass Blur',
      'toolbar.redact': 'Redacted Blackout',
      'toolbar.stickers': 'Stickers',
      'toolbar.colors': 'Color Palette',
      'toolbar.undo': 'Undo',
      'toolbar.redo': 'Redo',
      'toolbar.eraser': 'Eraser',
      'toolbar.clearAll': 'Clear all on this page',
      'toolbar.screenshot': 'Capture Screenshot',
      'toolbar.video': 'Record Video',
      'toolbar.fullPage': 'Full-Page Auto Screenshot',
      'toolbar.scrollCrop': 'Scrollable Crop Screenshot',
      'toolbar.minimize': 'Minimize',
      'toolbar.hide': 'Hide Toolbar',
      'sticker.star': 'Star',
      'sticker.thumb': 'Thumbs Up',
      'sticker.heart': 'Heart',
      'sticker.check': 'Checkmark',
      'sticker.cross': 'Cross',
      'sticker.warn': 'Warning',
      'sticker.idea': 'Idea',
      'sticker.rocket': 'Rocket',
      'confirm.clearPage': 'Do you really want to delete all drawings and highlights on this page?',
      'highlight.tooltip': 'WebNote Highlight – Use Eraser tool to remove',

      // ── Sidebar ─────────────────────────────────────────────────────────────
      'sidebar.refresh': 'Refresh',
      'sidebar.search': 'Search…',
      'sidebar.sortBy': 'Sort by',
      'sidebar.sortNewest': 'Newest first',
      'sidebar.sortOldest': 'Oldest first',
      'sidebar.sortAlpha': 'Alphabetical',
      'sidebar.sortManual': 'Manual (Drag & Drop)',
      'sidebar.groupBy': 'Group by',
      'sidebar.groupNone': 'No Group',
      'sidebar.groupTags': 'By Tags',
      'sidebar.groupMonth': 'By Month',
      'sidebar.newNote': '+ New Note',
      'sidebar.noResults': 'No results found.',
      'sidebar.noNotes': 'No notes on this page.',
      'sidebar.groupAll': 'All Notes',
      'sidebar.groupNoTags': 'No Tags',
      'sidebar.empty': '(empty)',
      'sidebar.hiddenBadge': '(Hidden)',
      'sidebar.unhide': 'Unhide',
      'sidebar.edit': 'Edit',
      'sidebar.jump': 'Jump to placement',

      // ── Notes ───────────────────────────────────────────────────────────────
      'note.newTitle': 'New Note',
      'note.fallbackTitle': 'Note',
      'note.untitled': 'Untitled',
      'note.titlePlaceholder': 'Title…',
      'note.pin': 'Pin to page',
      'note.unpin': 'Unpin (fixed on page)',
      'note.bgColor': 'Background Color',
      'note.scopeTitle': 'URL Scope: {scope}',
      'note.scopeExactShort': 'Exact',
      'note.scopePathShort': 'Path',
      'note.scopeDomainShort': 'Domain',
      'note.scopeExact': 'Exact Page',
      'note.scopePath': 'Same Path',
      'note.scopeDomain': 'Entire Domain',
      'note.duplicate': 'Duplicate',
      'note.compact': 'Compact',
      'note.expand': 'Expand',
      'note.restoreSize': 'Restore original size',
      'note.hide': 'Hide',
      'note.bold': 'Bold',
      'note.italic': 'Italic',
      'note.tags': 'Tags',
      'note.tagPlaceholder': '#tag + Enter',
      'color.default': 'Default',
      'color.yellow': 'Yellow',
      'color.green': 'Green',
      'color.blue': 'Blue',
      'color.pink': 'Pink',
      'color.purple': 'Purple',
      'color.orange': 'Orange',
      'color.gray': 'Gray',

      // ── Screenshot / recording ──────────────────────────────────────────────
      'capture.selectArea': 'Select Area',
      'capture.selectElement': 'Select Element',
      'capture.fullScreen': 'Full Screen',
      'capture.copyClipboard': 'Copy to Clipboard',
      'capture.saveFile': 'Save as File',
      'capture.hintArea': 'Select an area with the mouse',
      'capture.hintElement': 'Click on an element',
      'capture.hintScreen': 'Click for full screen',
      'capture.destination': 'Destination',
      'toast.copied': 'Copied to clipboard!',

      'rec.title': 'Video Recording',
      'rec.sub': 'Chrome opens a dialog to choose what to record (tab, window or screen).',
      'rec.audioSettings': 'Audio Settings',
      'rec.browserAudio': 'Browser / Tab Audio',
      'rec.micAudio': 'Microphone Audio',
      'rec.start': 'Start Recording',
      'rec.stopTitle': 'Stop recording',
      'rec.stop': 'Stop',
      'toast.recSaved': 'Recording saved ✓',

      'fullpage.title': 'Full-Page Screenshot',
      'fullpage.sub': 'The entire page is captured automatically from top to bottom and stitched into one image.',
      'fullpage.start': 'Start Screenshot',
      'fullpage.progress': 'Full-Page Screenshot… {percent}%',
      'toast.fullpageCopied': 'Full-Page Screenshot copied to clipboard ✓',
      'toast.fullpageSaved': 'Full-Page Screenshot saved ✓',

      'scroll.title': 'Scrollable Screenshot',
      'scroll.sub': 'Drag an area with the mouse. It is then scrolled down piece by piece and captured.',
      'scroll.hint': 'Drag an area with the mouse (ESC to cancel)',
      'scroll.waiting': 'Waiting for first capture…',
      'scroll.stats_one': '{count} part captured ({height}px tall)',
      'scroll.stats_other': '{count} parts captured ({height}px tall)',
      'scroll.next': 'Next Part',
      'scroll.end': 'End reached',
      'scroll.save': 'Save',
      'scroll.preview': 'Preview',
      'toast.scrollFirstFail': 'First capture failed ❌',
      'toast.scrollNextFail': 'Failed to capture the next part ❌',
      'toast.scrollCopied': 'Scroll Screenshot copied to clipboard ✓',
      'toast.scrollSaved': 'Scroll Screenshot saved ✓',
    },

    de: {
      // ── Shared ──────────────────────────────────────────────────────────────
      'common.close': 'Schließen',
      'common.cancel': 'Abbrechen',
      'common.delete': 'Löschen',

      // ── Popup ───────────────────────────────────────────────────────────────
      'popup.overview': 'Übersicht und Einstellungen',
      'popup.pageNotes': 'Notizen auf dieser Seite',
      'popup.allNotes': 'Alle Notizen',
      'popup.showIcon': 'Symbol auf neuen Seiten anzeigen',
      'popup.iconOpacity': 'Deckkraft des Symbols',
      'popup.addNote': 'Notiz zur Seite hinzufügen',
      'popup.toggleToolbar': 'Werkzeugleiste ein- oder ausblenden',
      'popup.openDashboard': 'Dashboard öffnen',
      'popup.feedback': 'Feedback',
      'popup.language': 'Sprache',
      'popup.masterToggle': 'WebNote ein- oder ausschalten',
      'popup.offNote': 'WebNote ist aus. Webseiten bleiben unverändert.',
      'popup.restrictedPage': 'WebNote kann auf Chrome-Systemseiten oder im Web Store aus Sicherheitsgründen nicht verwendet werden.',
      'popup.reloadHint': 'Bitte lade die Seite einmal neu, um WebNote zu aktivieren.',

      // ── Dashboard ───────────────────────────────────────────────────────────
      'dashboard.sections': 'Bereiche',
      'dashboard.navAllNotes': 'Alle Notizen',
      'dashboard.navUrlRules': 'URL-Regeln',
      'dashboard.navSettings': 'Einstellungen',
      'dashboard.notes': 'Notizen',
      'dashboard.searchNotes': 'Notizen durchsuchen',
      'dashboard.exportJson': 'JSON exportieren',
      'dashboard.importJson': 'JSON importieren',
      'dashboard.rulesTitle': 'URL-Regeln',
      'dashboard.rulesIntro': 'Lege fest, wo WebNote angezeigt wird. Du kannst bestimmte Domains oder Unterseiten ausschließen.',
      'dashboard.rulePlaceholder': 'z. B. google.com oder /search',
      'dashboard.ruleAria': 'Auszuschließende Domain oder Pfad',
      'dashboard.addExclusion': 'Ausschluss hinzufügen',
      'dashboard.settingsTitle': 'Einstellungen',
      'dashboard.cloudSync': 'Cloud-Synchronisierung',
      'dashboard.cloudSyncDesc': 'Synchronisiere Notizen über deine Browserprofile hinweg. Insgesamt auf 100 KB begrenzt.',
      'dashboard.cloudSyncAria': 'Cloud-Synchronisierung',
      'dashboard.hidden': 'Ausgeblendet',
      'dashboard.openAndJump': 'Seite öffnen und zu dieser Notiz springen',
      'dashboard.noteText': 'Notiztext',
      'dashboard.clickToEdit': 'Zum Bearbeiten klicken',
      'dashboard.scopeLabel': 'Wo diese Notiz erscheint',
      'dashboard.scopeExact': 'Diese Seite',
      'dashboard.scopePath': 'Gleicher Pfad',
      'dashboard.scopeDomain': 'Gesamte Website',
      'dashboard.jumpToNote': 'Zur Notiz springen',
      'dashboard.jumpTitle': 'Seite öffnen und zu dieser Notiz scrollen',
      'dashboard.remove': 'Entfernen',
      'dashboard.removeExclusion': 'Ausschluss {rule} entfernen',
      'dashboard.importOk': 'Import erfolgreich.',
      'dashboard.importFail': 'Diese Datei ist kein gültiger WebNote-Export. Es wurde nichts geändert.',

      // ── Context menu ────────────────────────────────────────────────────────
      'ctx.createNote': 'WebNote: Notiz erstellen',
      'ctx.noteFromSelection': 'WebNote: Notiz aus Auswahl',
      'ctx.highlight': 'WebNote: Text markieren 🖊',

      // ── Toolbar ─────────────────────────────────────────────────────────────
      'toolbar.open': 'WebNote öffnen',
      'toolbar.drag': 'Zum Verschieben ziehen',
      'toolbar.orientation': 'Ausrichtung ändern',
      'toolbar.allNotes': 'Alle Notizen (Seitenleiste)',
      'toolbar.newNote': 'Neue Notiz',
      'toolbar.cursor': 'Maus (normal)',
      'toolbar.highlight': 'Text markieren',
      'toolbar.draw': 'Freihandzeichnen',
      'toolbar.shapes': 'Formen',
      'toolbar.rect': 'Rechteck',
      'toolbar.circle': 'Kreis',
      'toolbar.line': 'Linie',
      'toolbar.arrow': 'Pfeil',
      'toolbar.blur': 'Milchglas-Unschärfe',
      'toolbar.redact': 'Schwärzen',
      'toolbar.stickers': 'Sticker',
      'toolbar.colors': 'Farbpalette',
      'toolbar.undo': 'Rückgängig',
      'toolbar.redo': 'Wiederholen',
      'toolbar.eraser': 'Radierer',
      'toolbar.clearAll': 'Alles auf dieser Seite löschen',
      'toolbar.screenshot': 'Screenshot aufnehmen',
      'toolbar.video': 'Video aufnehmen',
      'toolbar.fullPage': 'Automatischer Screenshot der ganzen Seite',
      'toolbar.scrollCrop': 'Scrollender Ausschnitt-Screenshot',
      'toolbar.minimize': 'Minimieren',
      'toolbar.hide': 'Werkzeugleiste ausblenden',
      'sticker.star': 'Stern',
      'sticker.thumb': 'Daumen hoch',
      'sticker.heart': 'Herz',
      'sticker.check': 'Häkchen',
      'sticker.cross': 'Kreuz',
      'sticker.warn': 'Warnung',
      'sticker.idea': 'Idee',
      'sticker.rocket': 'Rakete',
      'confirm.clearPage': 'Möchtest du wirklich alle Zeichnungen und Markierungen auf dieser Seite löschen?',
      'highlight.tooltip': 'WebNote-Markierung – zum Entfernen das Radierer-Werkzeug verwenden',

      // ── Sidebar ─────────────────────────────────────────────────────────────
      'sidebar.refresh': 'Aktualisieren',
      'sidebar.search': 'Suchen…',
      'sidebar.sortBy': 'Sortieren nach',
      'sidebar.sortNewest': 'Neueste zuerst',
      'sidebar.sortOldest': 'Älteste zuerst',
      'sidebar.sortAlpha': 'Alphabetisch',
      'sidebar.sortManual': 'Manuell (Drag & Drop)',
      'sidebar.groupBy': 'Gruppieren nach',
      'sidebar.groupNone': 'Keine Gruppierung',
      'sidebar.groupTags': 'Nach Tags',
      'sidebar.groupMonth': 'Nach Monat',
      'sidebar.newNote': '+ Neue Notiz',
      'sidebar.noResults': 'Keine Ergebnisse gefunden.',
      'sidebar.noNotes': 'Keine Notizen auf dieser Seite.',
      'sidebar.groupAll': 'Alle Notizen',
      'sidebar.groupNoTags': 'Keine Tags',
      'sidebar.empty': '(leer)',
      'sidebar.hiddenBadge': '(Ausgeblendet)',
      'sidebar.unhide': 'Einblenden',
      'sidebar.edit': 'Bearbeiten',
      'sidebar.jump': 'Zur Position springen',

      // ── Notes ───────────────────────────────────────────────────────────────
      'note.newTitle': 'Neue Notiz',
      'note.fallbackTitle': 'Notiz',
      'note.untitled': 'Ohne Titel',
      'note.titlePlaceholder': 'Titel…',
      'note.pin': 'An Seite anheften',
      'note.unpin': 'Lösen (auf der Seite fixiert)',
      'note.bgColor': 'Hintergrundfarbe',
      'note.scopeTitle': 'URL-Bereich: {scope}',
      'note.scopeExactShort': 'Exakt',
      'note.scopePathShort': 'Pfad',
      'note.scopeDomainShort': 'Domain',
      'note.scopeExact': 'Genaue Seite',
      'note.scopePath': 'Gleicher Pfad',
      'note.scopeDomain': 'Gesamte Domain',
      'note.duplicate': 'Duplizieren',
      'note.compact': 'Kompakt',
      'note.expand': 'Erweitern',
      'note.restoreSize': 'Ursprüngliche Größe wiederherstellen',
      'note.hide': 'Ausblenden',
      'note.bold': 'Fett',
      'note.italic': 'Kursiv',
      'note.tags': 'Tags',
      'note.tagPlaceholder': '#tag + Eingabetaste',
      'color.default': 'Standard',
      'color.yellow': 'Gelb',
      'color.green': 'Grün',
      'color.blue': 'Blau',
      'color.pink': 'Rosa',
      'color.purple': 'Lila',
      'color.orange': 'Orange',
      'color.gray': 'Grau',

      // ── Screenshot / recording ──────────────────────────────────────────────
      'capture.selectArea': 'Bereich auswählen',
      'capture.selectElement': 'Element auswählen',
      'capture.fullScreen': 'Ganzer Bildschirm',
      'capture.copyClipboard': 'In die Zwischenablage kopieren',
      'capture.saveFile': 'Als Datei speichern',
      'capture.hintArea': 'Bereich mit der Maus auswählen',
      'capture.hintElement': 'Element anklicken',
      'capture.hintScreen': 'Klicken für Vollbild',
      'capture.destination': 'Ziel',
      'toast.copied': 'In die Zwischenablage kopiert!',

      'rec.title': 'Videoaufnahme',
      'rec.sub': 'Chrome öffnet einen Dialog zur Auswahl des aufzunehmenden Inhalts (Tab, Fenster oder Bildschirm).',
      'rec.audioSettings': 'Audio-Einstellungen',
      'rec.browserAudio': 'Browser-/Tab-Audio',
      'rec.micAudio': 'Mikrofon-Audio',
      'rec.start': 'Aufnahme starten',
      'rec.stopTitle': 'Aufnahme stoppen',
      'rec.stop': 'Stopp',
      'toast.recSaved': 'Aufnahme gespeichert ✓',

      'fullpage.title': 'Screenshot der ganzen Seite',
      'fullpage.sub': 'Die gesamte Seite wird automatisch von oben nach unten aufgenommen und zu einem Bild zusammengesetzt.',
      'fullpage.start': 'Screenshot starten',
      'fullpage.progress': 'Screenshot der ganzen Seite… {percent}%',
      'toast.fullpageCopied': 'Screenshot der ganzen Seite in die Zwischenablage kopiert ✓',
      'toast.fullpageSaved': 'Screenshot der ganzen Seite gespeichert ✓',

      'scroll.title': 'Scrollender Screenshot',
      'scroll.sub': 'Ziehe mit der Maus einen Bereich auf. Er wird dann Stück für Stück nach unten gescrollt und aufgenommen.',
      'scroll.hint': 'Bereich mit der Maus aufziehen (Esc zum Abbrechen)',
      'scroll.waiting': 'Warte auf erste Aufnahme…',
      'scroll.stats_one': '{count} Teil erfasst ({height}px hoch)',
      'scroll.stats_other': '{count} Teile erfasst ({height}px hoch)',
      'scroll.next': 'Nächster Teil',
      'scroll.end': 'Ende erreicht',
      'scroll.save': 'Speichern',
      'scroll.preview': 'Vorschau',
      'toast.scrollFirstFail': 'Erste Aufnahme fehlgeschlagen ❌',
      'toast.scrollNextFail': 'Nächster Teil konnte nicht erfasst werden ❌',
      'toast.scrollCopied': 'Scroll-Screenshot in die Zwischenablage kopiert ✓',
      'toast.scrollSaved': 'Scroll-Screenshot gespeichert ✓',
    },
  };

  let current = DEFAULT_LANGUAGE;
  let initPromise = null;
  const listeners = new Set();

  const normalize = (code) => (LANGUAGES.some((l) => l.code === code) ? code : DEFAULT_LANGUAGE);

  function t(key, params) {
    let template;
    if (params && typeof params.count === 'number') {
      // Optional plural forms: "key_one" / "key_other" (any Intl.PluralRules category).
      let rule = 'other';
      try { rule = new Intl.PluralRules(current).select(params.count); } catch (_) { /* keep "other" */ }
      template = MESSAGES[current][`${key}_${rule}`] ?? MESSAGES[DEFAULT_LANGUAGE][`${key}_${rule}`];
    }
    template = template ?? MESSAGES[current][key] ?? MESSAGES[DEFAULT_LANGUAGE][key] ?? key;
    if (!params) return template;
    return template.replace(/\{(\w+)\}/g, (match, name) => (name in params ? String(params[name]) : match));
  }

  const TEXT_ATTRS = [
    ['data-i18n-title', 'title'],
    ['data-i18n-placeholder', 'placeholder'],
    ['data-i18n-aria-label', 'aria-label'],
    ['data-i18n-alt', 'alt'],
  ];
  const APPLY_SELECTOR = '[data-i18n],' + TEXT_ATTRS.map(([from]) => `[${from}]`).join(',');

  // Translates every marked element below `scope` (a Document, ShadowRoot or Element).
  function apply(scope) {
    const rootNode = scope || document;
    rootNode.querySelectorAll(APPLY_SELECTOR).forEach((el) => {
      if (el.hasAttribute('data-i18n')) el.textContent = t(el.getAttribute('data-i18n'));
      for (const [from, to] of TEXT_ATTRS) {
        if (el.hasAttribute(from)) el.setAttribute(to, t(el.getAttribute(from)));
      }
    });
    if (rootNode === document) document.documentElement.lang = current;
  }

  function notify() {
    listeners.forEach((cb) => { try { cb(current); } catch (e) { console.error('[WebNote] language listener failed', e); } });
  }

  // Registered synchronously at load so a sleeping service worker is woken for it too.
  try {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== 'local' || !changes[STORAGE_KEY]) return;
      const next = normalize(changes[STORAGE_KEY].newValue);
      if (next === current) return;
      current = next;
      notify();
    });
  } catch (_) { /* storage not available (e.g. a plain page) - the default language is used */ }

  // Loads the saved language. Safe to call from several places; the lookup runs once.
  function init() {
    if (!initPromise) {
      initPromise = (async () => {
        try {
          const data = await chrome.storage.local.get(STORAGE_KEY);
          current = normalize(data[STORAGE_KEY]);
        } catch (_) {
          current = DEFAULT_LANGUAGE;
        }
        return current;
      })();
    }
    return initPromise;
  }

  async function setLanguage(code) {
    const next = normalize(code);
    const changed = next !== current;
    current = next;
    if (changed) notify();
    try { await chrome.storage.local.set({ [STORAGE_KEY]: next }); } catch (e) { console.warn('[WebNote] could not save language', e); }
    return current;
  }

  function onChange(cb) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  }

  root.WebNoteI18n = {
    languages: LANGUAGES.map(({ code, name }) => ({ code, name })),
    get language() { return current; },
    get locale() { return LANGUAGES.find((l) => l.code === current).locale; },
    init, setLanguage, onChange, apply, t,
  };
})(typeof self !== 'undefined' ? self : this);
