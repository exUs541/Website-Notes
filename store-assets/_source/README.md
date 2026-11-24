# _source

Generator for the logo PNGs, the extension icons and all store images. The screenshots are real captures: the real `content.js`, `popup.html` and `dashboard.html` of this repository run in headless Edge with a `chrome.*` stand-in, on two demo pages with made-up content.

```
python store-assets/_source/build.py
```

Needs Microsoft Edge (set `EDGE_PATH` if it is not in the default folder), Node 20+ and Python 3 with Pillow (`pip install pillow`). Run it again after any change to the popup, dashboard, toolbar, notes or logo.

It writes `icons/icon*.png`, `store-assets/brand/logo-*.png`, `store-assets/brand/logo-300x300.png`, `store-assets/screenshots/` and the two promo tiles in `store-assets/`. The Edge package ZIP and the listing texts are not touched.

| Path | What |
|---|---|
| `build.py` | renders everything and writes the files |
| `server.py` | local server for the pages (extension at `/ext`, logo at `/brand`) |
| `shot.mjs` | headless Edge over the DevTools protocol, takes the PNGs |
| `mock/chrome.js` | stand-in for `chrome.storage`, `tabs`, `runtime`; also runs a scene's actions (open a menu, start a capture) |
| `scenes/article.html`, `landing.html` | the two demo websites (fictional) |
| `scenes/seeds/*.js` | what each screenshot shows: notes, highlights, drawings, toolbar state, actions |
| `scenes/compose/` | headline, chips and browser frame around each scene (`configs.js` has the texts) |

The logo itself is `store-assets/brand/logo.svg` (and `logo-small.svg` for 16 and 32 px). Change the SVG and run the build to update every size.
