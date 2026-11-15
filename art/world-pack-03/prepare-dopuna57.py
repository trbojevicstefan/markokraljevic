"""Uzori za DOPUNA-57/58/59 (Claude, 15. 11. 2026): kadar 0 svakog lika, trake postojećih pokreta i mera riznice.

Lik (identitet, veličina) se uzima iz pravog kadra igre: art/animation-pack-04/assets/<klip>/frames/motion/frame-0.png,
a gde ga nema, iz dist/assets preko sprite-rig.json (u meri igre: Marko 383 px u ćeliji 512, oslonac y=488).

python art/world-pack-03/prepare-dopuna57.py
"""
import json, os, shutil
from PIL import Image, ImageDraw

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.join(ROOT, 'art', 'world-pack-03', 'uzori-d57')
RIG = json.load(open(os.path.join(ROOT, 'dist', 'assets', 'sprite-rig.json'), encoding='utf-8'))
CELL, SOLE = 512, 488
PX_PER_UNIT = 383 / 128
_sheets = {}


def sheet(name):
    if name not in _sheets:
        _sheets[name] = Image.open(os.path.join(ROOT, 'dist', 'assets', name)).convert('RGBA')
    return _sheets[name]


def rig_frame(clip, i):
    r = RIG[clip]
    f = r['frames'][min(i, len(r['frames']) - 1)]
    sx, sy, w, h, sole = f[0], f[1], f[2], f[3], f[4]
    crop = sheet(r['image']).crop((sx, sy, sx + w, sy + h))
    k = r['scale'] * PX_PER_UNIT
    crop = crop.resize((max(1, round(w * k)), max(1, round(h * k))), Image.LANCZOS)
    cell = Image.new('RGBA', (CELL, CELL), (0, 0, 0, 0))
    cell.alpha_composite(crop, (round(256 - r['anchor'] * k), round(SOLE - sole * k)))
    return cell


def rig_strip(clip):
    n = len(RIG[clip]['frames'])
    strip = Image.new('RGBA', (CELL * n, CELL), (0, 0, 0, 0))
    for i in range(n):
        strip.alpha_composite(rig_frame(clip, i), (i * CELL, 0))
    return strip


def pack_frame0(clip):
    f = os.path.join(ROOT, 'art', 'animation-pack-04', 'assets', clip, 'frames', 'motion', 'frame-0.png')
    return f if os.path.exists(f) else None


def kadar0(clip):
    dst = os.path.join(OUT, f'{clip}-kadar0.png')
    src = pack_frame0(clip)
    if src:
        shutil.copyfile(src, dst)
    else:
        rig_frame(clip, 0).save(dst)
    return dst


def riznica_mera():
    """Mera za naslikanu riznicu: 1536x1024 slika pokriva sobu od x0-90 do x0+690 (780 jedinica sveta)."""
    k = 1536 / 780
    img = Image.new('RGBA', (1536, 1024), (236, 226, 204, 255))
    d = ImageDraw.Draw(img)
    floor = round(440 * k)
    wall = round(90 * k)
    d.rectangle([0, 0, wall, floor], fill=(150, 120, 90, 255))
    d.rectangle([1536 - wall, 0, 1536, floor], fill=(150, 120, 90, 255))
    d.rectangle([0, floor, 1536, 1024], fill=(120, 96, 72, 255))
    door = round((90 + 70) * k)
    d.rectangle([door - 75, floor - 300, door + 75, floor], outline=(40, 30, 20, 255), width=4)
    # Marko u meri (128 jedinica) i zona gde igra sama crta kovčege i pehare (x0+190 .. x0+560)
    mx = round((90 + 130) * k)
    d.rectangle([mx - 40, floor - round(128 * k), mx + 40, floor], outline=(200, 30, 30, 255), width=4)
    d.rectangle([round((90 + 190) * k), floor - 130, round((90 + 560) * k), floor], outline=(30, 90, 200, 255), width=4)
    d.text((wall + 10, 10), 'zid (presek)', fill=(0, 0, 0, 255))
    d.text((door - 60, floor - 320), 'izlaz (luk)', fill=(0, 0, 0, 255))
    d.text((mx - 40, floor - round(128 * k) - 18), 'Marko 128', fill=(200, 30, 30, 255))
    d.text((round((90 + 200) * k), floor - 150), 'igra ovde crta kovcege i pehare: pod prazan', fill=(30, 90, 200, 255))
    d.text((10, floor + 10), f'pod: y={floor}', fill=(255, 255, 255, 255))
    img.save(os.path.join(OUT, 'riznica-mera.png'))


def main():
    os.makedirs(OUT, exist_ok=True)
    for clip in ['cast/sarac', 'sarac-stoji', 'sarac-galop', 'marko-idle-2', 'vukasin-udara', 'kosovka-idle', 'djemo-idle',
                 'milos-jase', 'milos-idle', 'vrac-idle', 'vrac-carolija']:
        if clip == 'cast/sarac':
            rig_frame(clip, 0).save(os.path.join(OUT, 'cast-sarac-kadar0.png'))
        else:
            kadar0(clip)
    rig_frame('vukasin-trci', 0).save(os.path.join(OUT, 'vukasin-trci-kadar0.png'))
    for clip in ['sarac-stoji', 'sarac-galop', 'kosovka-hoda', 'arapin-omamljen', 'djemo-hurt', 'milos-jase', 'milos-smrt',
                 'vrac-carolija', 'vrac-hurt', 'vrac-pojavljuje', 'marko-uzjase', 'marko-death', 'marko-drink']:
        if clip in RIG:
            rig_strip(clip).save(os.path.join(OUT, f'pokret-{clip}.png'))
    riznica_mera()
    # dosadašnji izgled: zid riznice i baklja, i stil predmeta (unutrašnjost crkve kao presek)
    for src, dst in [('dist/assets/world/prop-crkva-samodreza-presek.webp', 'stil-crkva-presek.png'),
                     ('dist/assets/world/prop-kovceg.webp', 'stil-kovceg.png'),
                     ('dist/assets/world/prop-baklja-drzac.webp', 'stil-baklja.png')]:
        p = os.path.join(ROOT, src)
        if os.path.exists(p):
            Image.open(p).save(os.path.join(OUT, dst))
    print('\n'.join(sorted(os.listdir(OUT))))


if __name__ == '__main__':
    main()
