"""Stopgap for a ground strip whose walk line is not at y=64: python fix-strip.py <id> <walkY>
Moves the strip up so the road surface sits on y=64 and clears what stands above it (here: houses drawn behind the road).
Writes only dist/assets/world/<id>.webp; the artist's PNG stays as delivered, and a newer PNG replaces this on sync."""
import sys, os
import numpy as np
from PIL import Image
ROOT = os.path.dirname(os.path.abspath(__file__))
name, walk = sys.argv[1], int(sys.argv[2])
for n in (name, name + '-kraj'):
    src = os.path.join(ROOT, 'art', 'world-pack-03', n + '.png')
    a = np.array(Image.open(src).convert('RGBA'))
    h = a.shape[0]
    out = np.zeros_like(a)
    rows = h - walk
    out[64:64 + rows] = a[walk:]
    out[64 + rows:] = a[-1]
    # a soft lip of the old rows just above the road: keep only grass-coloured pixels
    lip = a[walk - 14:walk].copy()
    green = (lip[:, :, 1] > lip[:, :, 0] * .85) & (lip[:, :, 1] > 70)
    lip[~green, 3] = 0
    out[50:64] = lip
    Image.fromarray(out).save(os.path.join(ROOT, 'dist', 'assets', 'world', n + '.webp'), 'WEBP', quality=86)
    print('popravljeno', n)
