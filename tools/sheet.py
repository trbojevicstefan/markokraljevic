# contact sheets: python sheet.py <level> [cols=2] [rows=3] -> .scout/sheet-<level>-N.jpg
import sys, glob, os
from PIL import Image, ImageDraw
here = os.path.dirname(os.path.abspath(__file__))
level = sys.argv[1]; cols = int(sys.argv[2]) if len(sys.argv) > 2 else 2; rows = int(sys.argv[3]) if len(sys.argv) > 3 else 3
files = sorted(glob.glob(os.path.join(here, '..', '.scout', level + '-*.png')))
TW, TH = 800, 450
per = cols * rows
for n in range(0, len(files), per):
    chunk = files[n:n + per]
    sheet = Image.new('RGB', (cols * TW, ((len(chunk) + cols - 1) // cols) * TH), 'black')
    d = ImageDraw.Draw(sheet)
    for i, f in enumerate(chunk):
        im = Image.open(f).convert('RGB').resize((TW, TH), Image.LANCZOS)
        x, y = (i % cols) * TW, (i // cols) * TH
        sheet.paste(im, (x, y))
        d.rectangle([x, y, x + 90, y + 16], fill='black'); d.text((x + 4, y + 2), os.path.basename(f)[len(level) + 1:-4], fill='yellow')
    o = os.path.join(here, '..', '.scout', 'sheet-%s-%d.jpg' % (level, n // per + 1)); sheet.save(o, quality=88); print(o)
