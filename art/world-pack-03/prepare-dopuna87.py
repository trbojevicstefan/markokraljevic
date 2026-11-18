"""Uzori za DOPUNA-87..92 (Claude, 18. 11. 2026, šesta tura): naslovna scena (Marko i Šarac dele vino pred krčmom),
naslikane stepenice, nove pozadine Manastirskog visa i Oranja (varijante bližih slojeva i prednji sloj), ljudi na ta
dva pohoda (kaluđeri, žetelice, kosac) i zlatni janičari, megdan Oranja.

python art/world-pack-03/prepare-dopuna87.py
"""
import os, importlib.util, shutil
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
spec = importlib.util.spec_from_file_location('p76', os.path.join(HERE, 'prepare-dopuna76.py'))
p76 = importlib.util.module_from_spec(spec)
spec.loader.exec_module(p76)
out, frame, strip, world = p76.out, p76.frame, p76.strip, p76.world
W = os.path.join(ROOT, 'dist', 'assets', 'world')
SHOTS = r'C:\Users\PC\AppData\Local\Temp\claude\eee582e4706d57f8\c5b64c3c-4cdb-4688-bbd7-bd7c93f9aba9\scratchpad'


def on_blue(name, o, label=None):
    """A layer with a transparent sky shown on flat blue, so the edge of the painting is plain to see."""
    im = Image.open(os.path.join(W, name + '.webp')).convert('RGBA')
    im.save(os.path.join(o, f'sloj-{label or name}.png'))
    bg = Image.new('RGBA', im.size, (40, 90, 200, 255)); bg.alpha_composite(im)
    bg.convert('RGB').save(os.path.join(o, f'sloj-{label or name}-na-plavom.jpg'), quality=88)


def shot(src, o, name):
    p = os.path.join(SHOTS, src)
    if os.path.exists(p):
        shutil.copyfile(p, os.path.join(o, name))


if __name__ == '__main__':
    o = out('uzori-d87')   # the title scene
    for n in ('prelaz-selo-1', 'prelaz-selo-2', 'prelaz-oranje-1'):
        Image.open(os.path.join(W, n + '.webp')).convert('RGB').save(os.path.join(o, f'lik-{n}.jpg'), quality=90)
    frame(o, 'sarac-stoji'); frame(o, 'sarac-pije')
    Image.open(os.path.join(ROOT, 'dist', 'assets', 'gorge.png')).convert('RGB').save(os.path.join(o, 'stil-meni-sada-pozadina.jpg'), quality=88)
    shot('menu0/menu1.jpg', o, 'sadasnji-pocetni-ekran.jpg')
    for n in ('manastir-far-rucno', 'oranje-sky'):
        Image.open(os.path.join(W, n + '.webp')).convert('RGB').save(os.path.join(o, f'stil-{n}.jpg'), quality=88)

    o = out('uzori-d88')   # painted stairs
    shot('tour-man/t06.jpg', o, 'sada-stepenice-manastir.jpg')
    shot('tour-ora2/t05.jpg', o, 'sada-stepenice-oranje.jpg')
    on_blue('manastir-near-rucno', o); on_blue('oranje-near-rucno', o); on_blue('tvrdjava-near', o)
    for n in ('tlo-manastir', 'tlo-oranje', 'tlo-tvrdjava'):
        if os.path.exists(os.path.join(W, n + '.webp')):
            Image.open(os.path.join(W, n + '.webp')).convert('RGBA').save(os.path.join(o, f'stil-{n}.png'))

    o = out('uzori-d89')   # Manastirski vis, the layers
    for n in ('manastir-sky', 'manastir-far-rucno', 'manastir-mid', 'manastir-near-rucno'):
        on_blue(n, o)
    shot('tour-man.jpg', o, 'sada-u-igri-manastir.jpg')

    o = out('uzori-d90')   # Oranje, the layers
    for n in ('oranje-sky', 'oranje-far', 'oranje-mid', 'oranje-near-rucno'):
        on_blue(n, o)
    shot('tour-ora2.jpg', o, 'sada-u-igri-oranje.jpg')

    o = out('uzori-d91')   # people of the monastery and the fields
    frame(o, 'putnik-kaluder-idle'); frame(o, 'putnica-idle'); frame(o, 'seljak-idle'); frame(o, 'marko-idle-2')
    for c in ('putnik-kaluder-walk', 'putnica-walk', 'seljak-klice'):
        strip(o, c)

    o = out('uzori-d92')   # the golden janissaries of Oranje
    frame(o, 'sword-idle')
    for c in ('sword-run', 'sword-attack', 'sword-lunge', 'sword-hurt', 'sword-death', 'sword-jump', 'sword-omamljen'):
        strip(o, c)
    print('gotovo')
