"""Background layers tile without a visible seam: python seam-audit.py
Rebuilds each layer as the stage draws it (the last SEAM of a tile crossfades into its start) and checks that the colour
jump across the join is no bigger than the image's own column-to-column detail."""
import glob, os, re, sys
import numpy as np
from PIL import Image
ROOT = os.path.dirname(os.path.abspath(__file__))
SEAM = float(re.search(r'const SEAM = ([.\d]+);', open(os.path.join(ROOT, 'dist', 'stage3d.js'), encoding='utf8').read()).group(1))
bad = []
n = 0
for f in sorted(glob.glob(os.path.join(ROOT, 'dist', 'assets', 'world', '*.webp'))):
    name = os.path.basename(f)[:-5]
    if not re.search(r'-(sky|far|mid|near|vista)(-night|-storm)?$', name):
        continue
    a = np.array(Image.open(f).convert('RGBA')).astype(float)
    c = a[..., :3] * a[..., 3:] / 255
    w = c.shape[1]; P = int(round(w * (1 - SEAM))); B = w - P
    k = np.linspace(0, 1, B)[None, :, None]; k = k * k * (3 - 2 * k)
    tile = c[:, :P].copy(); tile[:, :B] = c[:, P:] * (1 - k) + c[:, :B] * k
    strip = np.concatenate([tile, tile[:, :8]], axis=1)
    jump = np.abs(strip[:, P] - strip[:, P - 1]).mean()
    detail = np.percentile(np.abs(np.diff(tile, axis=1)).mean(axis=(0, 2)), 99)
    n += 1
    if jump > max(detail * 1.5, 2.0):
        bad.append(f'{name}: join {jump:.1f} vs detail {detail:.1f}')
if bad:
    print('\n'.join(bad)); sys.exit(1)
print(f'PASS {n} background layers tile without a seam (crossfade {SEAM:.0%})')
