"""Uzori za DOPUNA-64 (Claude, 16. 11. 2026): zastava Srbije za barjake (checkpoint) i strelac koji puca uvis.

- zastava-srbije-ravna.png: ravna zastava 600x400 (trobojka crveno-plavo-belo, beli dvoglavi orao na crvenom štitu,
  pomeren ka koplju). Orao je isečen iz tkanina-barjak-srpski, da bude isti kao na starom barjaku.
- stari-barjak-kadrovi.png: 8 kadrova starog barjaka (ritam vijorenja, ivica uz koplje x=40).
- archer-uzor.png: strelac iz igre (archer-idle kadar 0, u meri igre); archer-rafal-kadar0.png: zum i ćelija novog klipa;
  pokret-archer-rafal.png i pokret-archer-shoot.png: kako strelac poteže i odapinje.

Stefan je posle tražio stari barjak iz Markovog doba umesto trobojke (v1), pa odbio i Dušanov carski barjak (v2, barjak-carski-ravan.png,
crveno-belo-crveno sa crvenim orlom, složen jednokratno iz istog orla);
prihvaćen je v3: barjak-meni-ravan.png, platno barjaka sa dugmeta glavnog menija (barjak3d.js clothTexture, bez natpisa, 600x400),
naslikano u bezglavom Edge-u istim kodom kao u meniju.

python art/world-pack-03/prepare-dopuna64.py
"""
import os, shutil, importlib.util
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.join(ROOT, 'art', 'world-pack-03', 'uzori-d64')
spec = importlib.util.spec_from_file_location('p57', os.path.join(os.path.dirname(__file__), 'prepare-dopuna57.py'))
p57 = importlib.util.module_from_spec(spec)
spec.loader.exec_module(p57)

RED, BLUE, WHITE = (198, 54, 60, 255), (12, 64, 118, 255), (244, 240, 230, 255)


def flat_flag():
    W, H = 600, 400
    f = Image.new('RGBA', (W, H))
    d = ImageDraw.Draw(f)
    for i, c in enumerate([RED, BLUE, WHITE]):
        d.rectangle((0, i * H // 3, W, (i + 1) * H // 3), fill=c)
    # a darker hem along the pole
    d.rectangle((0, 0, 14, H), fill=(120, 30, 34, 255))
    # the shield: red, gold edge, centred toward the pole
    cx, top, sw, sh = 214, 78, 150, 196
    shield = Image.new('L', (sw, sh), 0)
    sd = ImageDraw.Draw(shield)
    sd.rectangle((0, 0, sw, sh * .55), fill=255)
    sd.pieslice((0, sh * .1 - sh * .1, sw, sh - 1), 0, 180, fill=255)
    gold = Image.new('RGBA', (sw + 12, sh + 12), (0, 0, 0, 0))
    gold.paste((214, 168, 72, 255), (0, 0), shield.resize((sw + 12, sh + 12)))
    f.alpha_composite(gold, (cx - sw // 2 - 6, top - 6))
    red = Image.new('RGBA', (sw, sh), (0, 0, 0, 0))
    red.paste((176, 32, 38, 255), (0, 0), shield)
    f.alpha_composite(red, (cx - sw // 2, top))
    # the eagle from the old banner, without the red around it
    tk = Image.open(os.path.join(ROOT, 'dist', 'assets', 'world', 'tkanina-barjak-srpski.webp')).convert('RGBA')
    eag = tk.crop((195, 60, 605, 545))
    px = eag.load()
    for y in range(eag.height):
        for x in range(eag.width):
            r, g, b, a = px[x, y]
            if not ((r > 150 and g > 140 and b > 120) or (r > 170 and g > 110 and b < 110)):
                px[x, y] = (0, 0, 0, 0)
    eag = eag.resize((round(sw * .86), round(sw * .86 * eag.height / eag.width)), Image.LANCZOS)
    f.alpha_composite(eag, (cx - eag.width // 2, top + 4))
    # a small gold crown over the shield
    cr = ImageDraw.Draw(f)
    cy = top - 14
    cr.rectangle((cx - 34, cy, cx + 34, cy + 10), fill=(214, 168, 72, 255))
    for k in (-30, -15, 0, 15, 30):
        cr.polygon([(cx + k - 6, cy), (cx + k, cy - 16 - (6 if k == 0 else 0)), (cx + k + 6, cy)], fill=(214, 168, 72, 255))
    return f


def main():
    os.makedirs(OUT, exist_ok=True)
    flat_flag().save(os.path.join(OUT, 'zastava-srbije-ravna.png'))
    L = Image.open(os.path.join(ROOT, 'dist', 'assets', 'world', 'barjak-srpski-vijori.webp')).convert('RGBA')
    L.save(os.path.join(OUT, 'stari-barjak-kadrovi.png'))
    p57.rig_frame('archer-idle', 0).save(os.path.join(OUT, 'archer-uzor.png'))
    A = os.path.join(ROOT, 'art', 'animation-pack-04', 'assets')
    shutil.copyfile(os.path.join(A, 'archer-rafal', 'frames', 'motion', 'frame-0.png'), os.path.join(OUT, 'archer-rafal-kadar0.png'))
    shutil.copyfile(os.path.join(A, 'archer-rafal', 'atlas.png'), os.path.join(OUT, 'pokret-archer-rafal.png'))
    p57.rig_strip('archer-shoot').save(os.path.join(OUT, 'pokret-archer-shoot.png'))
    print('\n'.join(sorted(os.listdir(OUT))))


if __name__ == '__main__':
    main()
