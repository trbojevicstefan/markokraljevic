"""Half-size copies of the sprite sheets for phones and the fast quality tier.

Every sheet named in dist/assets/sprite-rig.json (assets/<name>.png) gets a copy at half width and half height in
dist/assets/pola/<name>.webp. The game (dist/game.js, the loader near the top) reads a copy with the frame rectangles of the
full sheet times 0.5, so the copy must be exactly half: an odd side is padded by one transparent pixel first.

Run from the repository root:  python tools/pola_sprites.py   (only sheets that are missing or older than their PNG are made)
"""
import json, os, sys
from concurrent.futures import ProcessPoolExecutor
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'dist', 'assets')


def half(src):
    full = os.path.join(ROOT, src)
    out = os.path.join(ROOT, 'pola', os.path.splitext(src)[0] + '.webp')
    if os.path.exists(out) and os.path.getmtime(out) >= os.path.getmtime(full):
        return src, 0
    im = Image.open(full).convert('RGBA')
    w, h = im.size
    if w % 2 or h % 2:
        pad = Image.new('RGBA', (w + w % 2, h + h % 2), (0, 0, 0, 0))
        pad.paste(im, (0, 0))
        im = pad
        w, h = im.size
    small = im.resize((w // 2, h // 2), Image.LANCZOS)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    small.save(out, 'WEBP', quality=90, alpha_quality=100, method=6)
    return src, os.path.getsize(out)


def main():
    rig = json.load(open(os.path.join(ROOT, 'sprite-rig.json'), encoding='utf8'))
    sheets = sorted({r['image'] for r in rig.values() if os.path.exists(os.path.join(ROOT, r['image']))})
    made = total = 0
    with ProcessPoolExecutor() as ex:
        for src, size in ex.map(half, sheets):
            if size:
                made += 1
                total += size
    print(f'{len(sheets)} sheets, {made} copies made ({total / 1e6:.1f} MB)')


if __name__ == '__main__':
    sys.exit(main())
