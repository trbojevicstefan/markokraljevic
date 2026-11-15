"""Uzori za DOPUNA-54/55/56 (Claude, 15. 11. 2026): kadar 0 svakog lika i uzori pokreta, sve u ćeliji 512 sa osloncem y=488.

Lik (identitet, veličina) se uvek uzima iz pravog kadra igre: art/animation-pack-04/assets/<klip>/frames/motion/frame-0.png
ili, za likove iz paketa 3, iz dist/assets (preko sprite-rig.json), nikad iz reference.png.
Uzori pokreta (traka kadrova) se prave iz dist/assets istim putem, u meri igre (Marko 383 px u ćeliji 512).

python art/world-pack-03/prepare-dopuna54.py
"""
import json, os, shutil
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.join(ROOT, 'art', 'world-pack-03', 'uzori-d54')
RIG = json.load(open(os.path.join(ROOT, 'dist', 'assets', 'sprite-rig.json'), encoding='utf-8'))
CELL, SOLE = 512, 488
# Marko u igri: 128 jedinica sveta = 383 px u ćeliji 512 (animation-tests: upright marko-crouch*scale = 128)
PX_PER_UNIT = 383 / 128

_sheets = {}


def sheet(name):
    if name not in _sheets:
        _sheets[name] = Image.open(os.path.join(ROOT, 'dist', 'assets', name)).convert('RGBA')
    return _sheets[name]


def rig_frame(clip, i):
    """Kadar i klipa iz dist/assets, u ćeliji 512, oslonac na y=488, sidro na x=256, u meri igre."""
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
    for pk in ('04', '03'):
        f = os.path.join(ROOT, 'art', f'animation-pack-{pk}', 'assets', clip, 'frames', 'motion', 'frame-0.png')
        if os.path.exists(f):
            return f
    return None


def main():
    os.makedirs(OUT, exist_ok=True)
    made = []
    # 1) identitet i veličina: kadar 0 iz pravog klipa igre
    pack3 = {'sword', 'shield', 'archer', 'akindzija', 'oklopnik', 'palikuca'}
    for who in ['milos', 'kopljanik', 'akindzija', 'palikuca', 'shield', 'oklopnik', 'pas', 'archer', 'tufekdzija', 'djemo', 'arapin', 'sword']:
        dst = os.path.join(OUT, f'{who}-idle-kadar0.png')
        src = None if who in pack3 else pack_frame0(f'{who}-idle')
        if src:
            shutil.copyfile(src, dst)
        else:
            rig_frame(f'{who}-idle', 0).save(dst)
        made.append(dst)
    for clip in ['milos-jase', 'mounted-run', 'marko-mounted-attack', 'sarac-galop', 'marko-idle-2', 'mounted-jump']:
        dst = os.path.join(OUT, f'{clip}-kadar0.png')
        src = pack_frame0(clip)
        if src:
            shutil.copyfile(src, dst)
        else:
            rig_frame(clip, 0).save(dst)
        made.append(dst)
    rig_frame('cast/sarac', 0).save(os.path.join(OUT, 'cast-sarac-kadar0.png'))
    shutil.copyfile(os.path.join(ROOT, 'art', 'world-pack-03', 'uzori-d48', 'milos-konj-video.jpg'), os.path.join(OUT, 'milos-konj-video.jpg'))
    # 2) uzori pokreta: trake kadrova postojećih klipova (pokret, ritam, broj kadrova)
    guides = ['sword-climb', 'sword-spava', 'sword-budi', 'sword-tiho-pada', 'sword-jump', 'sword-omamljen', 'sword-drugi',
              'kopljanik-drugi', 'pas-attack', 'pas-launch', 'archer-kick', 'archer-shoot', 'palikuca-torch', 'tufekdzija-butt',
              'tufekdzija-shoot', 'djemo-run', 'arapin-hurt',
              'marko-combo-2', 'marko-combo-3', 'marko-charged', 'marko-air-1', 'marko-block', 'marko-crouch', 'marko-roll',
              'marko-climb', 'marko-drink', 'marko-death', 'marko-attack', 'milos-attack', 'milos-jump',
              'mounted-run', 'mounted-jump', 'marko-dremlje', 'milos-jase']
    for g in guides:
        dst = os.path.join(OUT, f'pokret-{g}.png')
        rig_strip(g).save(dst)
        made.append(dst)
    for m in made:
        print(os.path.relpath(m, ROOT), Image.open(m).size)


if __name__ == '__main__':
    main()
