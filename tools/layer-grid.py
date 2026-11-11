# one layer with a 0..1 grid, to read coordinates for make-rucni-slojevi.py: python tools/layer-grid.py <layer-id> [...] -> .scout/grid.jpg
import sys, os
from PIL import Image, ImageDraw
here = os.path.dirname(os.path.abspath(__file__))
ART = os.path.join(here, '..', 'dist', 'assets', 'world')
TW, TH = 1448, 483
ids = sys.argv[1:]
sheet = Image.new('RGB', (TW, TH * len(ids)), (40, 40, 40))
d = ImageDraw.Draw(sheet)
for r, i in enumerate(ids):
    im = Image.open(os.path.join(ART, i + '.webp')).convert('RGBA').resize((TW, TH), Image.LANCZOS)
    bg = Image.new('RGBA', (TW, TH), (255, 0, 255, 255))
    sheet.paste(Image.alpha_composite(bg, im).convert('RGB'), (0, r * TH))
    for k in range(1, 20):
        x = k * TW / 20; col = (255, 255, 0) if k % 2 == 0 else (0, 255, 255)
        d.line([(x, r * TH), (x, r * TH + TH)], fill=col, width=1)
        d.text((x + 2, r * TH + 18), f'{k/20:.2f}'[1:], fill=col)
    for k in range(1, 10):
        y = r * TH + k * TH / 10
        d.line([(0, y), (TW, y)], fill=(0, 255, 0), width=1)
        d.text((2, y + 1), f'{k/10:.1f}', fill=(0, 255, 0))
    d.rectangle([0, r * TH, 220, r * TH + 14], fill='black'); d.text((3, r * TH + 1), i, fill='yellow')
o = os.path.join(here, '..', '.scout', 'grid.jpg'); sheet.save(o, quality=88); print(o)
