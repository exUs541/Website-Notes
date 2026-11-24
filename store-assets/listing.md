# WebNote – store listing

Copy-paste texts and field values for the **Chrome Web Store** and **Microsoft Edge Add-ons**. One text serves both stores; a heading says so when something applies to one store only. Images and file names: see [README.md](README.md).

## Name and short description

Both come from the package (`manifest.json`), do not enter them by hand. The name is unchanged on purpose: it already names the three things people search for (sticky notes, highlight, draw) and, at 39 characters, is not cut off in search results.

**Name**

```
WebNote: Draw, Highlight & Sticky Notes
```

**Short description** (130 characters, max. 132)

```
Sticky notes, text highlighter & drawing tools for any website. Annotate pages, capture screenshots. 100% private, stored locally.
```

## Description (both stores)

```
WebNote turns any web page into your personal notebook. Add sticky notes, highlight text, draw and annotate right on the page, and capture screenshots, all from one floating toolbar. Your notes stay on the page where you made them and are there again the next time you visit. Everything is stored on your device: no account, no cloud, no tracking.

Use WebNote to take notes while you research, mark up articles for studying, give visual feedback on a design or website, or keep reminders on the pages you use every day.

WHAT YOU CAN DO

STICKY NOTES ON ANY WEBSITE
Create notes anywhere on a page. Drag, resize and color them, add tags and format text in bold or italic. Pin a note to the page so it scrolls with the content, shrink it to a small floating icon, or duplicate it. Decide where a note shows up: on this exact page, on the same path, or on the whole website.

TEXT HIGHLIGHTER
Select text on a web page and highlight it in the color of your choice, or use the right-click menu. Highlights are saved automatically and restored when you come back. Remove one with the eraser.

DRAW AND ANNOTATE ON ANY PAGE
Draw freehand, add rectangles, circles, lines and arrows, and drop emoji stickers such as a star, check mark, warning or light bulb. Move and resize shapes, undo and redo, or clear the page.

BLUR AND REDACT
Hide names, email addresses or other private details with a frosted-glass blur or a solid black box before you share a screenshot.

SCREENSHOTS AND SCREEN RECORDING
Capture an area, a single element or the visible screen and copy it to the clipboard or save it as a PNG. Capture a whole page from top to bottom automatically, or a scrolling area you choose. Record your tab, window or screen as a video, with optional tab and microphone audio.

ALL YOUR NOTES IN ONE PLACE
The sidebar lists every note on the current page: search them, sort by date, alphabetically or by hand, group them by tag or month, and jump straight to a note. The dashboard shows the notes from all your websites: search, edit, change where a note appears, open the page, and export or import everything as a JSON backup.

MAKE IT YOUR OWN
Drag the toolbar anywhere, switch between horizontal and vertical, collapse it to a small button or hide it. Choose whether the button appears on new websites, set its opacity and exclude sites you never want to annotate. Create a note from selected text with the right-click menu. The icon badge shows how many notes the current page has. WebNote is available in English and German: switch the language with the globe icon in the popup.

PERFECT FOR
• Students and researchers who highlight articles and keep notes next to the source
• Writers and journalists who collect quotes and ideas while reading
• Designers, developers and testers who give visual feedback on web pages
• Anyone who wants reminders on the pages they use every day, such as a form, a dashboard or an online shop

HOW TO START
1. Add WebNote to your browser.
2. Open any web page, click the WebNote icon and choose "Add note to page". You can also right-click and choose "WebNote: Create Note".
3. Use the floating toolbar to highlight, draw, take screenshots or open the notes sidebar.

PRIVACY
• Notes, highlights, drawings and settings are stored locally in your browser.
• No account, no sign-up, no ads, no analytics, no tracking.
• WebNote makes no network requests and never sends your data anywhere.
• Removing the extension deletes its data.

PERMISSIONS EXPLAINED
• Access to all websites: shows your notes, highlights and drawings on any page you visit. WebNote does not send page content anywhere.
• storage: saves your notes and settings on your device.
• activeTab and scripting: start WebNote on the current page from the popup.
• contextMenus: adds the right-click actions.
• downloads: saves the screenshots and recordings you create.
• clipboardWrite: copies a screenshot to the clipboard when you choose to.

FREQUENTLY ASKED QUESTIONS

How do I add a sticky note to a website?
Click the WebNote icon and choose "Add note to page", click the + button on the toolbar, or right-click and choose "WebNote: Create Note".

How do I highlight text on a web page?
Pick the highlighter in the toolbar and select text, or select text, right-click and choose "WebNote: Highlight Text". Highlights are restored by matching the highlighted text, so they may not come back if the text on the page changes.

Can I draw on a web page?
Yes. Choose the pen, a shape or an arrow in the toolbar and draw directly on the page.

Do my notes sync between devices?
No. Notes are stored locally in your browser. To move them, export a JSON backup in the dashboard and import it on the other device.

Does WebNote work on every page?
It works on normal web pages. Browsers do not allow extensions on internal pages (such as chrome:// or edge:// pages) or on the extension stores.

Is my data private?
Yes. Everything stays on your device and WebNote has no server.

The source code is public: https://github.com/exUs541/Website-Notes
Questions, bugs or ideas? Open an issue on GitHub.
```

## Fields

| Field | Value |
|---|---|
| Category | Productivity |
| Language | English |
| Homepage / website | `https://github.com/exUs541/Website-Notes` |
| Support URL | `https://github.com/exUs541/Website-Notes/issues` |
| Privacy policy URL | `https://github.com/exUs541/Website-Notes/blob/main/docs/PRIVACY_POLICY.md` |
| Mature content / remote code | No / No |

## Keywords

Chrome has no keyword field: search uses the name, the short description and the description, so the important phrases appear in all three, written as normal sentences (Google treats repeated keywords as spam). Edge has a search-term field, see below.

| Phrase people search for | Where it appears |
|---|---|
| sticky notes (on websites) | name, summary, description heading, FAQ |
| highlight text / text highlighter | name, summary, description heading, FAQ |
| draw on a web page / annotate | name, summary, description heading, FAQ |
| screenshot / screen recording | summary, description heading |
| web notes, notebook, research | description opening and "Perfect for" |
| private, local, no account | summary, description opening, privacy section |

Only features that exist in the code are described. Deliberately **not** claimed: cloud sync (the toggle in the dashboard does nothing yet), sync between devices, PDF annotation, ratings or "best" claims.

## Chrome Web Store only: Privacy practices

Paste into the Developer Dashboard, tab "Privacy practices" (limit 1,000 characters each). The texts describe only what the code does (`content.js`, `background.js`, `popup.js`, `dashboard.js`, `manifest.json`).

**Single purpose**

```
WebNote has one purpose: it lets users take notes directly on web pages. Users can add sticky notes, highlight text, draw shapes and arrows, blur or cover private details, and capture screenshots or screen recordings of the page they are viewing. Notes, highlights and drawings are saved locally and shown again when the user revisits the page. A sidebar and a dashboard list the saved notes. The extension has no account, no server and no analytics.
```

**storage**

```
The extension uses chrome.storage.local to keep the user's own data on their device so it is still there after the browser restarts: notes, highlights, drawings, the position of the toolbar, and settings (icon visibility, opacity, language, excluded websites). The data is not synced, not sent to any server and not shared. Without this permission all notes and settings would be lost on every restart.
```

**activeTab**

```
When the user clicks "Add note to page" or "Show or hide toolbar" in the popup, the extension needs access to the tab the user is looking at, to start WebNote on that page and show the note or the toolbar. It is only used on the current tab after a click in the popup.
```

**scripting**

```
chrome.scripting.executeScript is used from the popup to start the WebNote content script on the current tab when the user asks for a note or the toolbar and the page was opened before the extension was installed or updated. No remote code is loaded; only files from the extension package are injected.
```

**contextMenus**

```
Adds three right-click entries: "WebNote: Create Note", "WebNote: Note from Selection" and "WebNote: Highlight Text". They let the user create a note or highlight the selected text without opening the toolbar. The titles follow the language chosen in the popup (English or German).
```

**downloads**

```
Used only to save files the user creates with an explicit click: a screenshot (PNG), a full-page or scrolling screenshot (PNG) and a screen recording (WebM). The content script sends the finished file to the background service worker, which calls chrome.downloads.download() once per file with the Save As dialog enabled, so the user chooses where it is saved. It is also the fallback when copying a screenshot to the clipboard fails. Nothing is downloaded automatically, and the extension does not download any other files or read the download history.
```

**clipboardWrite**

```
Used only when the user chooses "Copy to clipboard" in the screenshot tool. The captured image is written to the clipboard so it can be pasted into another app. Nothing is copied automatically.
```

**Host permission (`<all_urls>`)**

```
Users take notes, highlight text and draw on any website they visit, so the content script has to run on all web pages. It shows the user's own notes, highlights and drawings for the current page, adds the toolbar, and lets the user select text to highlight. Page content is only used locally to place highlights. It is never sent anywhere, and the extension makes no network requests.
```

**Remote code**

```
No. All code is in the extension package. No remote scripts, no eval of downloaded code.
```

**Data usage:** tick none of the listed categories. The extension sends nothing to the developer or to any server; notes, highlights and drawings are stored only in `chrome.storage.local` on the device. Tick all three confirmations at the end (no sale of user data, no use outside the single purpose, no use for creditworthiness).

## Microsoft Edge only

**Search terms** (up to 7 terms, each at most 30 characters, together at most 21 words; enter each term separately with "Add term". 7 terms, 17 words, longest term 17 characters)

```
sticky notes
web highlighter
annotate web page
draw on web page
website notes
screenshot tool
research notes
```

Why these: they are the phrases people type ("sticky notes", "web highlighter", "draw on web page") and each describes a feature that exists. Left out on purpose: names of other products, and "best" or "free" claims.

**Notes for certification**

```
No account or login is needed. WebNote stores everything locally with chrome.storage.local and makes no network requests.

How to test: open any web page, click the WebNote icon in the toolbar and choose "Add note to page" (or right-click and choose "WebNote: Create Note"). Type something in the note. Pick the highlighter in the floating toolbar and select some text, or pick the pen to draw. Click the camera icon to take a screenshot. Click the list icon to open the notes sidebar. In the popup, "Open dashboard" shows all notes with search, export and import. The globe icon in the popup switches the language between English and German.

Single purpose: let users create sticky notes, highlight text, draw and capture screenshots directly on web pages, saved locally.

Permissions
- storage: save notes, highlights, drawings, toolbar position and settings on the device.
- activeTab and scripting: start the note and drawing interface on the page the user is on when they use the popup.
- contextMenus: create a note or highlight selected text from the right-click menu.
- downloads: save a screenshot or screen recording the user creates.
- clipboardWrite: copy a captured screenshot to the clipboard when the user chooses to.
- Host access (all sites): users take notes on any website they visit. Nothing is read for any other purpose or sent anywhere.
```

## Maintainer notes

- The "Cloud Sync" switch in the dashboard has no function yet, so it is not advertised anywhere. Add it to the texts and a screenshot once it works.
- A new name or summary goes live only with a higher `version` in `manifest.json`. Rebuild the Edge package after the bump: `store-kit\Build-EdgePackages.ps1 -Only WebNote -Local`.
