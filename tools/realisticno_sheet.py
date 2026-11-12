"""Contact sheets of the drafts of a biome (for looking at them): sheet.py <biome> <out.jpg> <out2.jpg>"""
import glob, sys
from PIL import Image
b, o1, o2 = sys.argv[1:4]
fs = ['sky', 'far', 'mid', 'near', 'in-back', 'in-far', 'in-mid', 'in-near']
W = 1000
ims = [Image.open(f'art/realisticno/{b}/draft/{f}.png').convert('RGB') for f in fs]
ims = [i.resize((W, round(W * i.height / i.width))) for i in ims]
sh = Image.new('RGB', (W * 2 + 10, max(sum(i.height + 6 for i in ims[:4]), sum(i.height + 6 for i in ims[4:]))))
for col, group in ((0, ims[:4]), (W + 10, ims[4:])):
    y = 0
    for i in group:
        sh.paste(i, (col, y)); y += i.height + 6
sh.save(o1, quality=85)
fs = sorted(glob.glob(f'art/realisticno/{b}/draft/mat-*.png')) + sorted(glob.glob(f'art/realisticno/{b}/draft/prop-*.png'))
T = 260
sh = Image.new('RGB', (T * 5, T * ((len(fs) + 4) // 5)))
for k, f in enumerate(fs):
    i = Image.open(f).convert('RGB'); i.thumbnail((T - 6, T - 6)); sh.paste(i, ((k % 5) * T, (k // 5) * T))
sh.save(o2, quality=85)
