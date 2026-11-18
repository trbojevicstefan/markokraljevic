"""Uzori za DOPUNA-75 (Claude, 18. 11. 2026): kapija gledana pod uglom, kao na Stefanovoj slici.

Stefan je poslao sliku kamene kapije sa gvozdenim vratima gledane u tri četvrtine: vidi se lice kapije (ono sa vratima),
skraćeno u perspektivi, i bok kamenog okvira. „Ne želim ovakvu kapiju, ali želim da bude pod ovim uglom.”

Mera je nacrtana kosom projekcijom, da igra tačno zna gde je šta:
  dubina (preko druma)  -> ulevo i naviše  (0,6 i 0,3 po jedinici)
  duž druma             -> udesno
  visina                -> naviše
K px po jedinici sveta. Izlaz: uzori-d75/kapija3-mera.png, kapija3-resetka-mera.png, kapija3-mera.json (mnogouglovi za igru).

python art/world-pack-03/prepare-dopuna75.py
"""
import os, json
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'uzori-d75')
os.makedirs(OUT, exist_ok=True)
K = 3.4
W, H = 832, 2080
DX, DY = .6, .3            # one unit of depth on the screen: left and up
JAMB, OPEN, T = 36, 190, 70   # jamb width and opening width (in depth), wall thickness (along the road)
D = JAMB * 2 + OPEN        # 262
SPRING, ARCH = 196, 44     # the opening: straight to SPRING, the arch rises ARCH more
LINTEL = 34                # stone between the arch and the housing
HOUSE = 250                # the housing of the grate above
CAP = 30
HT = SPRING + ARCH + LINTEL + HOUSE + CAP   # 554
OX = W - 40 - T * K        # screen x of the near bottom corner of the face
OY = H - 30                # screen y of the near bottom corner


def P(d, x, z):
    return (round(OX + x * K - d * K * DX, 1), round(OY - z * K - d * K * DY, 1))


def arch_pts(d0, d1, x, n=14):
    """the opening in the face plane: straight sides to SPRING, then half an ellipse"""
    import math
    pts = [P(d0, x, 0), P(d0, x, SPRING)]
    cx, rx = (d0 + d1) / 2, (d1 - d0) / 2
    for i in range(1, n):
        a = math.pi * i / n
        pts.append(P(cx - rx * math.cos(a), x, SPRING + ARCH * math.sin(a)))
    pts += [P(d1, x, SPRING), P(d1, x, 0)]
    return pts


def main():
    im = Image.new('RGBA', (W, H), (0, 255, 0, 255))
    d = ImageDraw.Draw(im)
    d0, d1 = JAMB, JAMB + OPEN
    hz0, hz1 = SPRING + ARCH + LINTEL, SPRING + ARCH + LINTEL + HOUSE
    # the top, the near end of the wall (toward us), the face with the opening
    d.polygon([P(0, 0, HT), P(D, 0, HT), P(D, T, HT), P(0, T, HT)], fill=(214, 204, 186, 255), outline=(40, 30, 20, 255))
    d.polygon([P(0, 0, 0), P(0, T, 0), P(0, T, HT), P(0, 0, HT)], fill=(120, 104, 88, 255), outline=(40, 30, 20, 255))
    d.polygon([P(0, 0, 0), P(D, 0, 0), P(D, 0, HT), P(0, 0, HT)], fill=(176, 158, 134, 255), outline=(40, 30, 20, 255))
    # the housing of the grate: a recess in the face
    house = [P(d0, 0, hz0), P(d1, 0, hz0), P(d1, 0, hz1), P(d0, 0, hz1)]
    d.polygon(house, fill=(74, 58, 46, 255), outline=(255, 220, 120, 255))
    # the opening: see-through; inside it, the inner side of the far jamb and the underside of the vault
    opening = arch_pts(d0, d1, 0)
    d.polygon(opening, fill=(60, 200, 255, 255), outline=(40, 30, 20, 255))
    far_in = [P(d1, 0, 0), P(d1, T, 0), P(d1, T, SPRING), P(d1, 0, SPRING)]
    d.polygon(far_in, fill=(96, 82, 70, 255), outline=(40, 30, 20, 255))
    d.text((P(D, 0, HT)[0] + 6, P(D, 0, HT)[1] + 26), 'LICE KAPIJE (ka Marku)', fill=(0, 0, 0, 255))
    d.text((P(0, 4, HT - 60)[0], P(0, 4, HT - 60)[1]), 'BOK', fill=(255, 255, 255, 255))
    d.text((house[1][0] + 8, house[2][1] + 14), 'LEZISTE RESETKE (uvuceno, tamnije)', fill=(255, 255, 255, 255))
    d.text((opening[-1][0] + 8, P(d1, 0, 120)[1]), 'OTVOR: PROVIDNO', fill=(0, 0, 0, 255))
    # Marko, for the size of the stones
    m = P(D / 2, -60, 0)
    d.rectangle([m[0] - 30 * K, m[1] - 128 * K, m[0] + 30 * K, m[1]], outline=(200, 30, 30, 255), width=4)
    d.text((m[0] - 30 * K, m[1] - 128 * K - 16), 'Marko', fill=(200, 30, 30, 255))
    im.save(os.path.join(OUT, 'kapija3-mera.png'))

    # the grate: the same plane, as large as the opening
    g = Image.new('RGBA', (W, H), (0, 255, 0, 255))
    d = ImageDraw.Draw(g)
    d.polygon(opening, fill=(200, 200, 206, 255), outline=(30, 30, 30, 255))
    for i in range(1, 9):
        dd = d0 + OPEN * i / 9
        d.line([P(dd, 0, 0), P(dd, 0, SPRING + ARCH * (1 - abs(2 * i / 9 - 1) ** 2) ** .5)], fill=(30, 30, 30, 255), width=9)
    for j in range(1, 6):
        z = SPRING * j / 5.4
        d.line([P(d0, 0, z), P(d1, 0, z)], fill=(30, 30, 30, 255), width=9)
    g.save(os.path.join(OUT, 'kapija3-resetka-mera.png'))

    far_jamb = [P(d1, 0, 0), P(D, 0, 0), P(D, 0, SPRING + 10), P(d1, 0, SPRING + 10)]
    meta = {'K': K, 'W': W, 'H': H, 'OX': OX, 'OY': OY, 'DX': DX, 'DY': DY, 'JAMB': JAMB, 'OPEN': OPEN, 'T': T, 'SPRING': SPRING, 'ARCH': ARCH,
            'rise': hz0 - 0 + 6, 'opening': opening, 'house': house, 'far_jamb': far_jamb, 'far_in': far_in,
            'road_mid': P(D / 2, 0, 0)}
    json.dump(meta, open(os.path.join(OUT, 'kapija3-mera.json'), 'w'))
    print('mera', W, H, 'sredina praga', meta['road_mid'], 'rise', meta['rise'])
    for f in ('kapija2-zid-kamen', 'kapija2-zid-drvo', 'kapija2-resetka', 'kapija2-resetka-drvo'):
        src = os.path.join(HERE, f + '.png')
        if os.path.exists(src):
            Image.open(src).save(os.path.join(OUT, 'rukopis-' + f + '.png'))
    print('\n'.join(sorted(os.listdir(OUT))))


if __name__ == '__main__':
    main()
