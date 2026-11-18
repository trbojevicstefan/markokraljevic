"""Uzori za DOPUNA-73 (Claude, 18. 11. 2026): kapije, drugi put, po Stefanovom crtežu.
Prolaz je širi (220 jedinica), rešetka je široka kao prolaz, a iznad svoda je ležište u kom se dignuta rešetka vidi.
1 jedinica sveta = 4 px. Zid 1152x2048 (288x512 jedinica), rešetka 880x920.

python art/world-pack-03/prepare-dopuna73.py
"""
import os, shutil
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'uzori-d73')
os.makedirs(OUT, exist_ok=True)
K, W, H = 4, 1152, 2048
PW, PH, ARCH = 220 * K, 210 * K, 24 * K          # prolaz 880 x 840, luk 96
x0, x1 = (W - PW) // 2, (W + PW) // 2             # 136 .. 1016
top = H - PH                                      # 1208: visina bokova luka je top+ARCH
im = Image.new('RGBA', (W, H), (150, 120, 90, 255))
d = ImageDraw.Draw(im)
# ležište rešetke iznad svoda: široko kao prolaz, visoko 232 jedinice
lez_top = top - 232 * K                           # 280
d.rectangle([x0, lez_top, x1, top + ARCH], fill=(70, 56, 46, 255), outline=(255, 220, 120, 255), width=6)
# prolaz (providan)
d.rectangle([x0, top + ARCH, x1, H], fill=(60, 200, 255, 255))
d.pieslice([x0, top - 52, x1, top + 244], 180, 360, fill=(60, 200, 255, 255))
# traka koja se ponavlja naviše
d.rectangle([0, 0, W, 256], outline=(255, 60, 60, 255), width=6)
d.text((14, 14), 'gornjih 256 px: samo zid, igra ga ponavlja navise', fill=(255, 255, 255, 255))
d.text((x0 + 16, lez_top + 16), 'LEZISTE RESETKE 880x928 px: uvuceno, tamnije polje u licu zida, sa okvirom od klesanog kamena (greda)', fill=(255, 255, 255, 255))
d.text((x0 + 16, top + 200), 'PROLAZ 880x840 px (220x210 jedinica): PROVIDNO', fill=(0, 0, 0, 255))
d.text((8, H - 30), 'stub 136 px', fill=(255, 255, 255, 255))
d.text((x1 + 8, H - 30), 'stub 136 px', fill=(255, 255, 255, 255))
cx = W // 2
d.rectangle([cx - 300, H - 128 * K, cx - 220, H], outline=(200, 30, 30, 255), width=5)
d.text((cx - 300, H - 128 * K - 20), 'Marko 512 px', fill=(200, 30, 30, 255))
im.save(os.path.join(OUT, 'kapija-zid-mera.png'))
# rešetka: skoro spreda, blago iskošena (bliža ivica levo je malo viša)
r = Image.new('RGBA', (880, 920), (236, 226, 204, 255))
d = ImageDraw.Draw(r)
P = [(20, 10), (860, 40), (860, 880), (20, 910)]
d.polygon(P, outline=(30, 30, 30, 255), fill=(200, 200, 206, 255))
for i in range(1, 9):
    x = 20 + i * 840 // 9
    d.line([(x, 10 + i * 30 // 9), (x, 910 - i * 30 // 9)], fill=(30, 30, 30, 255), width=14)
for j in range(1, 6):
    d.line([(20, 10 + j * 900 // 6), (860, 40 + j * 840 // 6)], fill=(30, 30, 30, 255), width=14)
d.text((30, 14), 'resetka siroka kao prolaz; bliza ivica levo (malo visa), dalja desno; siljci na dnu', fill=(0, 0, 0, 255))
r.save(os.path.join(OUT, 'kapija-resetka-mera.png'))
for f in ('kapija-zid-kamen', 'kapija-zid-drvo', 'kapija-resetka', 'kapija-resetka-drvo'):
    shutil.copyfile(os.path.join(HERE, f + '.png'), os.path.join(OUT, 'prvi-pokusaj-' + f + '.png'))
print('\n'.join(sorted(os.listdir(OUT))))
