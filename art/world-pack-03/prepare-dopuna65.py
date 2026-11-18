"""Uzori za DOPUNA-65 (Claude, 18. 11. 2026): prvi nivo (Kosovsko selo).
Skok Kopljanik-baše, Marko koji sluša guslara, Marko koji hvata konja za rep, seljanka i starac koji pozdravljaju Marka.

Lik se uzima iz pravog kadra igre. Marko, seljanka i starac su u meri igre (rig_frame: Marko 383 px, oslonac y=488);
Kopljanik-baša je megdandžija veći od ćelije u meri igre, pa je njegov uzor izvorni kadar (ista ćelija kao kopljanik-basa-idle).

python art/world-pack-03/prepare-dopuna65.py
"""
import os, importlib.util
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.join(ROOT, 'art', 'world-pack-03', 'uzori-d65')
spec = importlib.util.spec_from_file_location('p57', os.path.join(os.path.dirname(__file__), 'prepare-dopuna57.py'))
p57 = importlib.util.module_from_spec(spec)
spec.loader.exec_module(p57)
CELL = 512


def native_frame(clip, i):
    """Kadar kako stoji na listu (bez mere igre), u ćeliji 512."""
    r = p57.RIG[clip]
    f = r['frames'][min(i, len(r['frames']) - 1)]
    crop = p57.sheet(r['image']).crop((f[0], f[1], f[0] + f[2], f[1] + f[3]))
    cell = Image.new('RGBA', (CELL, CELL), (0, 0, 0, 0))
    cell.alpha_composite(crop, (0, 0))
    return cell


def native_strip(clip):
    n = len(p57.RIG[clip]['frames'])
    strip = Image.new('RGBA', (CELL * n, CELL), (0, 0, 0, 0))
    for i in range(n):
        strip.alpha_composite(native_frame(clip, i), (i * CELL, 0))
    return strip


def bbox_h(im):
    b = im.getbbox()
    return (b[3] - b[1], b[3]) if b else (0, 0)


def main():
    os.makedirs(OUT, exist_ok=True)
    mere = []
    # megdandžija: izvorni kadrovi
    native_frame('kopljanik-basa-idle', 0).save(os.path.join(OUT, 'kopljanik-basa-idle-kadar0.png'))
    native_strip('kopljanik-basa-run').save(os.path.join(OUT, 'pokret-kopljanik-basa-run.png'))
    native_strip('kopljanik-basa-attack').save(os.path.join(OUT, 'pokret-kopljanik-basa-attack.png'))
    native_strip('kopljanik-jump').save(os.path.join(OUT, 'pokret-kopljanik-jump.png'))
    mere.append(('kopljanik-basa-idle-kadar0.png',) + bbox_h(native_frame('kopljanik-basa-idle', 0)))
    # likovi u meri igre
    for clip in ['marko-idle-2', 'putnica-idle', 'putnik-starac-idle']:
        im = p57.rig_frame(clip, 0)
        im.save(os.path.join(OUT, f'{clip}-kadar0.png'))
        mere.append((f'{clip}-kadar0.png',) + bbox_h(im))
        p57.rig_strip(clip).save(os.path.join(OUT, f'pokret-{clip}.png'))
    p57.rig_strip('marko-push').save(os.path.join(OUT, 'pokret-marko-push.png'))
    p57.rig_frame('sarac-stoji', 0).save(os.path.join(OUT, 'sarac-stoji-kadar0.png'))
    for name, h, sole in mere:
        print(f'{name}: visina {h} px, stopala y={sole}')
    print('\n'.join(sorted(os.listdir(OUT))))


if __name__ == '__main__':
    main()
