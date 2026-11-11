# all background layers of a level in one picture: python tools/layers-sheet.py <level> [orig] -> .scout/layers-<level>.jpg
# rows sky/far/mid/near, columns day/night/storm; the "-rucno" layer is shown where the game would take it (pass "orig" to see the artist's).
import sys, os
from PIL import Image, ImageDraw
here = os.path.dirname(os.path.abspath(__file__))
ART = os.path.join(here, '..', 'dist', 'assets', 'world')
level = sys.argv[1]; orig = 'orig' in sys.argv[2:]
TW, TH = 1086, 362
sheet = Image.new('RGB', (3 * TW, 4 * TH), (40, 40, 40))
d = ImageDraw.Draw(sheet)
for r, layer in enumerate(['sky', 'far', 'mid', 'near']):
    for c, v in enumerate(['', '-night', '-storm']):
        cands = ([] if orig else [f'{level}-{layer}-rucno{v}']) + [f'{level}-{layer}{v}']
        f = next((n for n in cands if os.path.exists(os.path.join(ART, n + '.webp'))), None)
        if not f:
            continue
        im = Image.open(os.path.join(ART, f + '.webp')).convert('RGBA').resize((TW, TH), Image.LANCZOS)
        bg = Image.new('RGBA', (TW, TH), (255, 0, 255, 255) if r else (0, 0, 0, 255))
        sheet.paste(Image.alpha_composite(bg, im).convert('RGB'), (c * TW, r * TH))
        for xx in (.12, .88):
            d.line([(c * TW + xx * TW, r * TH), (c * TW + xx * TW, r * TH + 12)], fill='yellow', width=2)
        d.rectangle([c * TW, r * TH, c * TW + 260, r * TH + 16], fill='black'); d.text((c * TW + 4, r * TH + 2), f, fill='yellow')
o = os.path.join(here, '..', '.scout', f'layers-{level}{"-orig" if orig else ""}.jpg'); sheet.save(o, quality=85); print(o)
