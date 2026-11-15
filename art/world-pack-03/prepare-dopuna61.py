"""Uzori za DOPUNA-61/62 (Claude, 15. 11. 2026): vrh Urvine i kraj igre.
Marko iz pravog kadra igre (art/animation-pack-04/assets/marko-idle-2/frames/motion/frame-0.png), trake postojećih
pokreta u meri igre (Marko 383 px u ćeliji 512, oslonac y=488), Šarac, sablja i rekviziti vrha za stil i meru.

python art/world-pack-03/prepare-dopuna61.py
"""
import os, shutil, importlib.util
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.join(ROOT, 'art', 'world-pack-03', 'uzori-d61')
spec = importlib.util.spec_from_file_location('p57', os.path.join(os.path.dirname(__file__), 'prepare-dopuna57.py'))
p57 = importlib.util.module_from_spec(spec)
spec.loader.exec_module(p57)


def main():
    os.makedirs(OUT, exist_ok=True)
    shutil.copyfile(os.path.join(ROOT, 'art', 'animation-pack-04', 'assets', 'marko-idle-2', 'frames', 'motion', 'frame-0.png'),
                    os.path.join(OUT, 'marko-idle-2-kadar0.png'))
    for clip in ['marko-sablja-idle', 'sarac-stoji']:
        p57.rig_frame(clip, 0).save(os.path.join(OUT, f'{clip}-kadar0.png'))
    for clip in ['marko-throw', 'marko-death', 'marko-drink', 'marko-open', 'marko-odmor', 'sarac-pada']:
        p57.rig_strip(clip).save(os.path.join(OUT, f'pokret-{clip}.png'))
    for src, dst in [('dist/assets/world/prop-bunar.webp', 'stil-bunar.png'), ('dist/assets/world/prop-drvo-jela.webp', 'stil-jela.png'),
                     ('dist/assets/world/prop-sarac-humka.webp', 'stil-humka.png'), ('dist/assets/world/riznica-unutra.webp', 'stil-riznica.png'),
                     ('dist/assets/world/urvina-far.webp', 'stil-urvina-daleko.png'), ('dist/assets/world/urvina-mid.webp', 'stil-urvina-sredina.png'),
                     ('dist/assets/ui/minijature/hd/minijatura-smrt.webp', 'minijatura-smrt.png'),
                     ('dist/assets/ui/minijature/hd/minijatura-spava.webp', 'minijatura-spava.png')]:
        p = os.path.join(ROOT, src)
        if os.path.exists(p):
            Image.open(p).save(os.path.join(OUT, dst))
    print('\n'.join(sorted(os.listdir(OUT))))


if __name__ == '__main__':
    main()
