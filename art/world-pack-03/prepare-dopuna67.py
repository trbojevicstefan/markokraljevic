"""Uzori za DOPUNA-67..70 (Claude, 18. 11. 2026, treća tura): strah i beg neprijatelja, megdandžija sela, kapije.

Protivnici i megdandžija: izvorni kadrovi sa lista (klip deli razmeru svog -idle klipa).
Kapije: mera preseka zida, prolaza i rešetke (igra: SEC_W=156, GATE_PASS=210, luk 24), i postojeći zid kao uzor rukopisa.

python art/world-pack-03/prepare-dopuna67.py
"""
import os, importlib.util
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
spec = importlib.util.spec_from_file_location('p65', os.path.join(HERE, 'prepare-dopuna65.py'))
p65 = importlib.util.module_from_spec(spec)
spec.loader.exec_module(p65)
RIG = p65.p57.RIG


def out(d):
    o = os.path.join(HERE, d)
    os.makedirs(o, exist_ok=True)
    return o


def foes(d, types):
    o = out(d)
    for t in types:
        im = p65.native_frame(f'{t}-idle', 0)
        im.save(os.path.join(o, f'{t}-idle-kadar0.png'))
        b = im.getbbox()
        print(f'{d}: {t}-idle-kadar0.png visina {b[3] - b[1]} px, stopala y={b[3]}')
        for c in ('run', 'hurt'):
            if f'{t}-{c}' in RIG:
                p65.native_strip(f'{t}-{c}').save(os.path.join(o, f'pokret-{t}-{c}.png'))


def basa():
    o = out('uzori-d69')
    p65.native_frame('kopljanik-basa-idle', 0).save(os.path.join(o, 'kopljanik-basa-idle-kadar0.png'))
    for c in ('run', 'attack', 'hurt', 'jump'):
        p65.native_strip(f'kopljanik-basa-{c}').save(os.path.join(o, f'pokret-kopljanik-basa-{c}.png'))
    for f in ('razbi-kosnica', 'prop-kola-seno'):
        Image.open(os.path.join(ROOT, 'dist', 'assets', 'world', f + '.webp')).convert('RGBA').save(os.path.join(o, 'stil-' + f + '.png'))


def kapije():
    o = out('uzori-d70')
    # 1 jedinica sveta = 4 px. Slika zida 832x1664 (208x416 jedinica): prolaz 156x210 sa lukom, žleb rešetke 22, traka koja se ponavlja naviše.
    K, W, H = 4, 832, 1664
    im = Image.new('RGBA', (W, H), (236, 226, 204, 255))
    d = ImageDraw.Draw(im)
    x0, x1 = (W - 156 * K) // 2, (W + 156 * K) // 2
    top = H - 210 * K
    d.rectangle([0, 0, W, H], fill=(150, 120, 90, 255))
    # prolaz (providan na gotovoj slici)
    d.rectangle([x0, top + 24 * K, x1, H], fill=(60, 200, 255, 255))
    d.pieslice([x0, top - 13 * K, x1, top + 61 * K], 180, 360, fill=(60, 200, 255, 255))
    # žleb rešetke
    cx = W // 2
    d.rectangle([cx - 11 * K, 0, cx + 11 * K, top], fill=(40, 40, 46, 255))
    # traka koja se ponavlja naviše
    d.rectangle([0, 0, W, 104 * K], outline=(255, 60, 60, 255), width=6)
    d.text((12, 12), 'gornjih 416 px: traka koja se ponavlja navise (gore i dole isti red kamena)', fill=(255, 255, 255, 255))
    d.text((x0 + 12, top + 120), 'PROLAZ 624x840 px (156x210 jedinica): PROVIDNO', fill=(0, 0, 0, 255))
    d.text((cx - 40, top - 200), 'zleb 88 px', fill=(255, 255, 255, 255))
    d.text((8, H - 30), 'grub kamen, 104 px', fill=(255, 255, 255, 255))
    d.text((x1 + 8, H - 30), 'grub kamen, 104 px', fill=(255, 255, 255, 255))
    # Marko u meri
    d.rectangle([cx - 150, H - 128 * K, cx - 70, H], outline=(200, 30, 30, 255), width=5)
    d.text((cx - 150, H - 128 * K - 20), 'Marko 512 px', fill=(200, 30, 30, 255))
    im.save(os.path.join(o, 'kapija-zid-mera.png'))
    # rešetka pod uglom: 192x888 jedinica*4 -> 48x222 jedinice
    r = Image.new('RGBA', (256, 1024), (236, 226, 204, 255))
    d = ImageDraw.Draw(r)
    d.polygon([(40, 60), (216, 20), (216, 1000), (40, 940)], outline=(30, 30, 30, 255), fill=(190, 190, 196, 255))
    for i in range(1, 5):
        x = 40 + i * 176 // 5
        yt = 60 - i * 40 // 5
        yb = 940 + i * 60 // 5
        d.line([(x, yt), (x, yb)], fill=(30, 30, 30, 255), width=10)
    for j in range(1, 7):
        d.line([(40, 60 + j * 880 // 7), (216, 20 + j * 980 // 7)], fill=(30, 30, 30, 255), width=10)
    d.text((6, 4), 'blizi kraj levo (uzi), dalji desno', fill=(0, 0, 0, 255))
    r.save(os.path.join(o, 'kapija-resetka-mera.png'))
    for f in ('zid-kamen', 'resetka', 'prop-palisada', 'prop-kuca-brvnara'):
        p = os.path.join(ROOT, 'dist', 'assets', 'world', f + '.webp')
        if os.path.exists(p):
            Image.open(p).convert('RGBA').save(os.path.join(o, 'stil-' + f + '.png'))
    print('\n'.join(sorted(os.listdir(o))))


if __name__ == '__main__':
    foes('uzori-d67', ['sword', 'archer', 'akindzija', 'kopljanik'])
    foes('uzori-d68', ['shield', 'palikuca', 'tufekdzija', 'pas'])
    basa()
    kapije()
