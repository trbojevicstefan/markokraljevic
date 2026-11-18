"""Uzori za DOPUNA-81..85 (Claude, 18. 11. 2026, peta tura): sve što fali za Ravijojlinu šumu i za naredna tri pohoda
(Manastirski vis, Oranje, Opsednuta tvrđava).

D81 Lovac-aga (šuma), D82 Dželat (manastir), D83 Hasan-aga (tvrđava), D84 mladi Turčin (tvrđava), D85 strelac i oklopnik
(tvrđava) i trnje (šuma). Svi kadrovi su izvorni sa lista, pa klip deli razmeru svog uzora.

python art/world-pack-03/prepare-dopuna81.py
"""
import os, importlib.util
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
spec = importlib.util.spec_from_file_location('p76', os.path.join(HERE, 'prepare-dopuna76.py'))
p76 = importlib.util.module_from_spec(spec)
spec.loader.exec_module(p76)
out, frame, strip, world = p76.out, p76.frame, p76.strip, p76.world

if __name__ == '__main__':
    o = out('uzori-d81')   # Lovac-aga
    frame(o, 'lovac-aga-idle')
    for c in ('run', 'attack', 'rog', 'hurt'):
        strip(o, f'lovac-aga-{c}')
    o = out('uzori-d82')   # Dželat
    frame(o, 'dzelat-idle')
    for c in ('run', 'attack', 'hvata', 'hurt'):
        strip(o, f'dzelat-{c}')
    o = out('uzori-d83')   # Hasan-aga
    frame(o, 'hasan-aga-idle')
    for c in ('run', 'attack', 'zalet', 'zaglavljen', 'hurt'):
        strip(o, f'hasan-aga-{c}')
    o = out('uzori-d84')   # mladi Turčin
    frame(o, 'mladi-turcin-idle')
    for c in ('run', 'attack', 'hurt', 'death'):
        strip(o, f'mladi-turcin-{c}')
    for c in ('sword-spava', 'sword-budi'):
        strip(o, c)
    o = out('uzori-d85')   # the archer and the armoured man of the fortress, the brambles of Miroč
    frame(o, 'archer-idle'); frame(o, 'oklopnik-idle')
    for c in ('archer-run', 'archer-jump', 'sword-climb', 'oklopnik-slam', 'oklopnik-walk', 'oklopnik-grab'):
        strip(o, c)
    for n in ('prop-zbun', 'prop-paprat', 'prop-korenje'):
        world(o, n)
