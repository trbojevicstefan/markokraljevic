"""Uzori za DOPUNA-76..80 (Claude, 18. 11. 2026, četvrta tura): megdandžija sela (nove faze), vila i Miloš u Ravijojlinoj
šumi, jahanje hodom, novi Markov udarac, šumski aseti.

Sve izvorni kadrovi sa lista (klip deli razmeru svog uzora), osim Marka peške (mera igre, kao u D65).

python art/world-pack-03/prepare-dopuna76.py
"""
import os, importlib.util, shutil
from PIL import Image

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


def frame(o, clip, i=0, name=None):
    im = p65.native_frame(clip, i)
    im.save(os.path.join(o, name or f'{clip}-kadar{i}.png'))
    b = im.getbbox()
    print(f'{os.path.basename(o)}: {clip} kadar {i}: visina {b[3] - b[1]} px, sirina {b[2] - b[0]} px, dno y={b[3]}')


def strip(o, clip):
    p65.native_strip(clip).save(os.path.join(o, f'pokret-{clip}.png'))


def world(o, name):
    Image.open(os.path.join(ROOT, 'dist', 'assets', 'world', name + '.webp')).convert('RGBA').save(os.path.join(o, 'stil-' + name + '.png'))


if __name__ == '__main__':
    o = out('uzori-d76')   # the bashi
    frame(o, 'kopljanik-basa-idle')
    for c in ('run', 'attack', 'jump', 'juris', 'zaglavljen', 'omamljen'):
        strip(o, f'kopljanik-basa-{c}')
    o = out('uzori-d77')   # the vila
    frame(o, 'vila-let'); frame(o, 'vila-pada', 5); frame(o, 'marko-nad-vilom', 1)
    for c in ('vila-let', 'vila-pada', 'vila-strela', 'marko-nad-vilom'):
        strip(o, c)
    o = out('uzori-d78')   # Miloš and the horses at a walk
    frame(o, 'milos-jase'); frame(o, 'milos-idle'); frame(o, 'mounted-idle'); frame(o, 'sarac-stoji')
    for c in ('milos-jase', 'milos-run', 'marko-dremlje', 'mounted-idle', 'sarac-hod', 'milos-pada-s-konja'):
        strip(o, c)
    o = out('uzori-d79')   # Marko's new blow
    for f in ('marko-idle-2-kadar0.png', 'pokret-marko-idle-2.png'):
        shutil.copyfile(os.path.join(HERE, 'uzori-d65', f), os.path.join(o, f))
    for c in ('marko-charged', 'marko-uppercut', 'marko-combo-3'):
        p65.p57.rig_strip(c).save(os.path.join(o, f'pokret-{c}.png'))
    o = out('uzori-d80')   # forest things
    for n in ('prop-drvo-hrast', 'prop-svetiliste', 'prop-run-kamen', 'prop-panj', 'prop-pecurke', 'prop-paprat'):
        if os.path.exists(os.path.join(ROOT, 'dist', 'assets', 'world', n + '.webp')):
            world(o, n)
    frame(o, 'pas-idle'); frame(o, 'sarac-stoji')
    print('gotovo')
