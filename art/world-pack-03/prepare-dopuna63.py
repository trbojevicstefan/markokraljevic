"""Uzori za DOPUNA-63 (Claude, 16. 11. 2026): Marko bez topuza, posle bacanja u more na vrhu Urvine.
Marko iz pravih kadrova igre (marko-walk i marko-idle-2, kadar 0), poslednji kadar bacanja (prazne ruke), traka hoda u meri igre.

python art/world-pack-03/prepare-dopuna63.py
"""
import os, shutil, importlib.util

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.join(ROOT, 'art', 'world-pack-03', 'uzori-d63')
spec = importlib.util.spec_from_file_location('p57', os.path.join(os.path.dirname(__file__), 'prepare-dopuna57.py'))
p57 = importlib.util.module_from_spec(spec)
spec.loader.exec_module(p57)


def main():
    os.makedirs(OUT, exist_ok=True)
    A = os.path.join(ROOT, 'art', 'animation-pack-04', 'assets')
    shutil.copyfile(os.path.join(A, 'marko-walk', 'frames', 'motion', 'frame-0.png'), os.path.join(OUT, 'marko-walk-kadar0.png'))
    shutil.copyfile(os.path.join(A, 'marko-idle-2', 'frames', 'motion', 'frame-0.png'), os.path.join(OUT, 'marko-idle-2-kadar0.png'))
    shutil.copyfile(os.path.join(A, 'marko-baca-topuz', 'frames', 'motion', 'frame-5.png'), os.path.join(OUT, 'marko-prazne-ruke.png'))
    for clip in ['marko-walk', 'marko-idle-2']:
        p57.rig_strip(clip).save(os.path.join(OUT, f'pokret-{clip}.png'))
    print('\n'.join(sorted(os.listdir(OUT))))


if __name__ == '__main__':
    main()
