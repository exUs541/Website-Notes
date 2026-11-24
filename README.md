<p align="center"><img src="icons/icon128.png" width="96" alt="WebNote logo"></p>

<h1 align="center">WebNote: Draw, Highlight & Sticky Notes</h1>

<p align="center"><b>Sticky notes, a text highlighter, drawing tools and screenshots on any web page.<br>Everything stays on your device: no account, no cloud, no tracking.</b></p>

<p align="center">
  <a href="https://chromewebstore.google.com/detail/iackibmejkkglddhagppoeifbfgchlni"><img alt="Chrome Web Store" src="https://img.shields.io/badge/Chrome%20Web%20Store-Install-4285F4?logo=googlechrome&logoColor=white"></a>
  <a href="https://microsoftedge.microsoft.com/addons/detail/webnote-draw-highlight-/lkmoaolmckolcikghcafiilfgnohibce"><img alt="Microsoft Edge Add-ons" src="https://img.shields.io/badge/Edge%20Add--ons-Install-0078D4?logo=microsoftedge&logoColor=white"></a>
  <a href="https://exus541.github.io/portfolio/details/webnote.html"><img alt="Website" src="https://img.shields.io/badge/Website-exus541.github.io-111827"></a>
  <img alt="Manifest V3" src="https://img.shields.io/badge/Manifest-V3-34A853">
</p>

<p align="center"><img src="store-assets/screenshots/screenshot-1-turn-any-page-into-a-notebook.png" alt="WebNote on a web page: toolbar, sticky notes, highlights and a drawing" width="760"></p>

## Features

- **Sticky notes on any website**: drag, resize, color and tag them, pin them to the page, collapse them to a floating icon. Choose whether a note shows on this page, on the same path or on the whole site.
- **Text highlighter**: highlight text in several colors; highlights are saved and restored automatically.
- **Draw and annotate**: freehand pen, rectangles, circles, lines, arrows and emoji stickers, with undo and redo.
- **Blur and redact**: cover private details with a frosted-glass blur or a solid box before you share a screenshot.
- **Screenshots and screen recording**: capture an area, an element, the visible screen, a full page or a scrolling area; record a tab, a window or the screen with optional audio.
- **Sidebar and dashboard**: search, sort and group your notes, jump back to a note, export and import a JSON backup, exclude websites.
- **Your toolbar, your way**: drag it, switch between horizontal and vertical, minimize or hide it.
- **English and German**: switch the language with the globe icon in the popup.

| | |
|---|---|
| ![Sticky notes](store-assets/screenshots/screenshot-2-sticky-notes-tags-pinning.png) | ![Highlight, draw and blur](store-assets/screenshots/screenshot-3-highlight-draw-blur.png) |
| ![Screenshots and recording](store-assets/screenshots/screenshot-4-screenshots-and-screen-recording.png) | ![Dashboard](store-assets/screenshots/screenshot-5-dashboard-and-privacy.png) |

## Install

- **Chrome, Brave and other Chromium browsers:** [Chrome Web Store](https://chromewebstore.google.com/detail/iackibmejkkglddhagppoeifbfgchlni)
- **Microsoft Edge:** [Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/webnote-draw-highlight-/lkmoaolmckolcikghcafiilfgnohibce)
- **From source:** see [Development](#development).

## Getting started

1. Open any web page, click the WebNote icon and choose **Add note to page**. You can also right-click and choose **WebNote: Create Note**.
2. Use the floating toolbar to highlight text, draw, take screenshots or open the notes sidebar.
3. Click the icon and **Open dashboard** to see the notes from all your websites.

WebNote does not run on internal browser pages (`chrome://`, `edge://`) or in the extension stores.

## Permissions and privacy

Notes, highlights, drawings and settings stay in `chrome.storage.local` on your device. WebNote has no server and makes no network requests. Read the [privacy policy](docs/PRIVACY_POLICY.md).

| Permission | Why it is needed |
|---|---|
| Access to all websites | show your notes, highlights and drawings on any page you visit |
| `storage` | save your notes and settings on your device |
| `activeTab`, `scripting` | start WebNote on the current page from the popup |
| `contextMenus` | the right-click actions |
| `downloads` | save the screenshots and recordings you create |
| `clipboardWrite` | copy a screenshot to the clipboard when you choose to |

## Support

- Questions, bugs or ideas: [open an issue](https://github.com/exUs541/Website-Notes/issues).
- More about WebNote and the other extensions: [exus541.github.io/portfolio](https://exus541.github.io/portfolio/index.html), with a [feedback form](https://exus541.github.io/portfolio/feedback.html).

## Development

The extension runs straight from this folder, there is no build step.

1. Clone the repository.
2. Open `chrome://extensions` (or `edge://extensions`) and switch on **Developer mode**.
3. Choose **Load unpacked** and select the repository folder.

| Path | Purpose |
|---|---|
| `manifest.json` | extension manifest (Manifest V3) |
| `background.js` | service worker: context menus, downloads, badge |
| `content.js`, `content.css` | everything on the page: toolbar, notes, highlights, drawing, capture |
| `popup.html`, `popup.js`, `popup.css` | toolbar popup |
| `dashboard.html`, `dashboard.js`, `dashboard.css` | notes dashboard |
| `i18n.js` | English and German strings |
| `icons/` | extension icons |
| `store-assets/` | store texts, screenshots, logo sources and their generator, see its [README](store-assets/README.md) |
| `docs/` | privacy policy |
| `tests/` | `node tests/check.js` runs the source checks |
| `.github/` | release pipeline, see [RELEASING.md](.github/RELEASING.md) |
