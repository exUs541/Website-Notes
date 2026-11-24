# Store assets – WebNote

Everything for the store listings of WebNote in one place: images, logo sources and the store texts, for the Chrome Web Store and Microsoft Edge Add-ons at once. One image set serves both stores (the sizes are accepted by both).

This folder is not part of the extension package. The packager (`.github/scripts/package-extension.mjs`) skips `store-assets/`, and changes here do not start a release.

## Contents

```
store-assets/
├─ listing.md                          store texts and field values (both stores; store-only parts are marked)
├─ screenshots/                        5 × 1280×800
├─ promo-small-440x280.png             small promo tile
├─ promo-marquee-1400x560.png          large promo tile (Chrome "marquee", Edge "large")
├─ brand/
│  ├─ logo.svg                         full logo (use from 48 px up)
│  ├─ logo-small.svg                   simplified version for 16 and 32 px
│  ├─ logo-300x300.png                 Edge logo
│  ├─ logo-512.png
│  └─ logo-1024.png
├─ _source/                            generator for the icons and images (see its README)
└─ WebNote-<version>.zip               built package (git-ignored)
```

## Which file goes where

| Store field | File | Chrome | Edge |
|---|---|---|---|
| Extension icon 128 × 128 | `../icons/icon128.png` (inside the package) | store icon | automatic |
| Logo 300 × 300 | `brand/logo-300x300.png` | – | logo |
| Screenshots | `screenshots/screenshot-1-…` to `screenshot-5-…`, upload in this order | up to 5 | up to 6, with optional captions |
| Small tile 440 × 280 | `promo-small-440x280.png` | required | required |
| Large tile 1400 × 560 | `promo-marquee-1400x560.png` | optional (marquee) | optional (large) |
| Package | `WebNote-<version>.zip` | built by the release pipeline | upload by hand the first time, pipeline afterwards |

Screenshot order and captions (the caption field is optional in Edge):

1. `screenshot-1-turn-any-page-into-a-notebook.png` – "Sticky notes, highlights and drawings on any web page"
2. `screenshot-2-sticky-notes-tags-pinning.png` – "Color-coded, taggable notes pinned to the page"
3. `screenshot-3-highlight-draw-blur.png` – "Highlight, draw, add stickers and blur private details"
4. `screenshot-4-screenshots-and-screen-recording.png` – "Capture screenshots and record your screen"
5. `screenshot-5-dashboard-and-privacy.png` – "Notes dashboard with search, export and URL rules"

## File naming

Files that apply to one store only carry the store in their name (`…-chrome.…` or `…-edge.…`). Everything without such a suffix is shared by both stores.

## The icons in the extension

`icons/icon16.png`, `icon32.png`, `icon48.png`, `icon128.png` and the store art `icons/icon500.png` are rendered from `brand/logo.svg` (16 and 32 px from `logo-small.svg`). `icon128.png` has 16 px of transparent padding around the 96 px artwork, as Chrome recommends.

## Regenerate the images

Rebuild the logo PNGs, the icons and all images with `python store-assets/_source/build.py` (needs Edge, Node 20 and Pillow) after any UI or logo change.

The screenshots are real captures: the real `content.js`, popup and dashboard running on two demo pages made for this purpose (a fictional science article site and a fictional landing page), with a headline and a browser frame around them. No third-party brands or logos appear in them.

## Notes

- The texts describe only features that exist in the code. The "Cloud Sync" switch in the dashboard has no function yet, so it is not advertised anywhere.
