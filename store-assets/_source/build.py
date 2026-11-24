"""Rebuilds the logo PNGs, the extension icons and all store images of WebNote.

    python store-assets/_source/build.py

Needs Microsoft Edge, Node 20+ and Python with Pillow (pip install pillow). See README.md.
Writes into icons/, store-assets/brand, store-assets/screenshots and store-assets/ (promo tiles).
"""
import json, os, shutil, subprocess, sys, tempfile, time, urllib.request
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.abspath(os.path.join(HERE, '..'))
REPO = os.path.abspath(os.path.join(ASSETS, '..'))
PORT = 8766
BASE = f'http://127.0.0.1:{PORT}'

SHOTS = ['screenshot-1-turn-any-page-into-a-notebook', 'screenshot-2-sticky-notes-tags-pinning', 'screenshot-3-highlight-draw-blur',
         'screenshot-4-screenshots-and-screen-recording', 'screenshot-5-dashboard-and-privacy']
# (layout name, width, height, file name)
IMAGES = [
    ('hero', 1280, 800, SHOTS[0]), ('notes', 1280, 800, SHOTS[1]), ('markup', 1280, 800, SHOTS[2]),
    ('capture', 1280, 800, SHOTS[3]), ('manage', 1280, 800, SHOTS[4]),
    ('marquee', 1400, 560, 'promo-marquee'), ('small', 440, 280, 'promo-small'),
]
# Backdrop blur (the blur tool in screenshot 3) does not render at device scale 2 in headless Edge.
SCALE_1X = {'markup'}


def shoot(tmp, jobs):
    jf = os.path.join(tmp, 'jobs.json')
    json.dump(jobs, open(jf, 'w'))
    r = subprocess.run(['node', '--experimental-websocket', os.path.join(HERE, 'shot.mjs'), jf], capture_output=True, text=True)
    print(r.stdout.strip())
    if r.returncode != 0 or 'EXC' in r.stdout:
        print(r.stderr.strip()); raise SystemExit('rendering failed')


def down(im, size):
    """Two-step downscale keeps the edges clean at tiny sizes."""
    t = im
    while t.width > size * 2:
        t = t.resize((max(size * 2, t.width // 2),) * 2, Image.LANCZOS)
    return t.resize((size, size), Image.LANCZOS)


def build(tmp):
    # ── logo and icons ─────────────────────────────────────────────────────────
    shoot(tmp, [{'url': f'{BASE}/scenes/render.raw.html?svg={n}&size=1024', 'out': os.path.join(tmp, f'{n}.png'), 'width': 1024, 'height': 1024, 'transparent': True}
                for n in ('logo', 'logo-small')])
    big = Image.open(os.path.join(tmp, 'logo.png')).convert('RGBA')
    small = Image.open(os.path.join(tmp, 'logo-small.png')).convert('RGBA')
    icons = os.path.join(REPO, 'icons')
    down(small, 16).save(os.path.join(icons, 'icon16.png'))
    down(small, 32).save(os.path.join(icons, 'icon32.png'))
    down(big, 48).save(os.path.join(icons, 'icon48.png'))
    canvas = Image.new('RGBA', (128, 128), (0, 0, 0, 0))     # 96 px artwork + 16 px padding (Chrome guidance)
    art = down(big, 96); canvas.paste(art, (16, 16), art)
    canvas.save(os.path.join(icons, 'icon128.png'))
    down(big, 500).save(os.path.join(icons, 'icon500.png'))
    down(big, 512).save(os.path.join(ASSETS, 'brand', 'logo-512.png'))
    big.save(os.path.join(ASSETS, 'brand', 'logo-1024.png'))
    down(big, 300).save(os.path.join(ASSETS, 'brand', 'logo-300x300.png'))

    # ── screenshots and promo tiles (the pages load the icons written above) ───
    shoot(tmp, [{'url': f'{BASE}/scenes/compose/compose.html?c={c}', 'out': os.path.join(tmp, f'{name}@raw.png'), 'width': w, 'height': h,
                 'scale': 1 if c in SCALE_1X else 2} for c, w, h, name in IMAGES])
    for c, w, h, name in IMAGES:
        im = Image.open(os.path.join(tmp, f'{name}@raw.png')).convert('RGB')
        if im.size != (w, h): im = im.resize((w, h), Image.LANCZOS)
        # one image set for both stores (the sizes are accepted by Chrome and Edge)
        fname = {'promo-marquee': 'promo-marquee-1400x560', 'promo-small': 'promo-small-440x280'}.get(name, name)
        sub = 'screenshots' if name.startswith('screenshot') else ''
        out = os.path.join(ASSETS, sub, fname + '.png')
        os.makedirs(os.path.dirname(out), exist_ok=True)
        im.save(out, optimize=True)
        print('ok', name, im.size)


if __name__ == '__main__':
    env = dict(os.environ, PORT=str(PORT))
    server = subprocess.Popen([sys.executable, os.path.join(HERE, 'server.py')], env=env)
    tmp = tempfile.mkdtemp(prefix='webnote-assets-')
    try:
        for _ in range(40):
            try: urllib.request.urlopen(BASE + '/mock/chrome.js'); break
            except Exception: time.sleep(0.25)
        build(tmp)
    finally:
        server.terminate()
        shutil.rmtree(tmp, ignore_errors=True)
