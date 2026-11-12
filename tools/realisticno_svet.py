"""Realistic versions of the game's existing painted backdrops (dist/assets/world/<vista>-<layer>.webp).

The old layer itself is the draft: its last 12 % is crossfaded into its start (what stage3d.js does at run time),
so the draft already tiles; transparent parts go on magenta; then img2img at a moderate strength keeps the
composition and makes it photographic. Biome ids are 'svet-<vista>' so they never clash with the long greybox
biomes (podgradje, urvina, klisura); the manifest entry says which vista it replaces.
"""
import os

import numpy as np
from PIL import Image

from realisticno_common import LAYER, SKY, back_prompt, layer_prompt, sky_prompt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WORLD = os.path.join(ROOT, 'dist', 'assets', 'world')
SEAM = 0.12

# vista: (name, theme of the place, light, sky words, ground spec)
VISTAS = {
    'selo': ('Kosovsko selo', 'a medieval Kosovo village: stone and timber houses with red tile roofs, orchards, '
             'haystacks, fences, fields and a small stone church', 'warm golden morning light, soft haze',
             'a clear golden morning sky with light cumulus clouds',
             ('a dusty village dirt road with ruts, pebbles and tufts of grass', (126, 100, 70), (160, 138, 110),
              'stones', 'grass'), (150, 140, 70)),
    'klisura': ('Klisura Ibra', 'the gorge of the river Ibar: golden limestone cliffs, a turquoise river, pines on '
                'the ledges and an old fortress high on a crag', 'bright afternoon sun on golden rock, turquoise water',
                'a bright summer afternoon sky with tall white clouds',
                ('a riverside path of pale limestone pebbles and sand', (170, 156, 130), (200, 190, 170), 'stones',
                 'stones'), (110, 130, 70)),
    'suma': ('Ravijojlina šuma', 'the enchanted forest of the vila Ravijojla: huge old beeches and oaks, ferns, '
             'mossy rocks and glowing mist between the trunks', 'blue-green dusk, soft magical light, mist',
             'a calm blue-green dusk sky with thin luminous clouds',
             ('a forest path of dark earth, moss, fallen leaves and roots', (60, 62, 44), (110, 120, 80), 'stones',
              'grass'), (70, 118, 62)),
    'manastir': ('Manastirski vis', 'a medieval Serbian monastery on a hill: a stone and brick church with domes, '
                 'monastery walls, cypresses, vineyards and olive-grey hills', 'warm late afternoon light',
                 'a warm afternoon sky with soft golden clouds',
                 ('worn stone slabs of a monastery yard with grass in the joints', (140, 126, 104), (176, 164, 140),
                  'slabs', 'stones'), (130, 140, 70)),
    'tvrdjava': ('Opsednuta tvrđava', 'a besieged medieval fortress: massive stone walls and towers, banners, a '
                 'siege camp and smoke from fires', 'violet storm clouds lit by the glow of fires',
                 'a dramatic violet sky with heavy clouds lit orange from below by fires',
                 ('trampled earth and broken cobbles before a fortress gate', (96, 78, 66), (140, 124, 110), 'stones',
                  'stones'), (120, 100, 70)),
    'prevoj': ('Zimski prevoj', 'a high winter mountain pass: snowy fir forest, rocks, cliffs and peaks under snow',
               'cold blue winter light with pale gold on the snow', 'a cold pale blue winter sky with thin clouds',
               ('a snowy mountain path with trodden snow and stones', (200, 210, 222), (236, 240, 246), 'snow',
                'stones'), (190, 200, 210)),
    'pecina': ('Vilinska pećina', 'a vast fairy cave: stalactites, rock columns, underground pools and turquoise '
               'glowing crystals', 'turquoise underground glow, dark rock',
               'the dark vault of a huge cave with faint turquoise light',
               ('a cave floor of wet rock, small stones and puddles', (52, 62, 66), (90, 104, 108), 'stones',
                'stones'), (60, 110, 110)),
    'podrum': ('Zaboravljeni podrum', 'a forgotten cellar under an old fortress: stone vaults, arches, barrels, '
               'shelves and old timber', 'amber lamplight, damp stone, deep shadow',
               'the dark brick vault of a cellar lit by amber lamps',
               ('a cellar floor of old flagstones with dust and straw', (88, 74, 60), (128, 112, 94), 'slabs',
                'stones'), (120, 96, 60)),
    'mocvara': ('Noćna močvara', 'a swamp at night: reeds, dead twisted trees, still black water and low silver '
                'mist', 'moonlight, silver mist, deep blue night',
                'a deep blue night sky with a bright moon and silver clouds',
                ('a muddy swamp path with reeds, wet grass and puddles', (54, 58, 50), (90, 100, 84), 'grass',
                 'grass'), (70, 90, 70)),
    'rudnik': ('Stari rudnik', 'an old silver mine in the mountains: timber supports, rock faces, ore carts on '
               'wooden tracks, spoil heaps and lanterns', 'cool silver light on rock and warm lantern light',
               'a dark rocky vault of a mine with faint daylight',
               ('a mine floor of grey gravel and crushed rock', (82, 82, 84), (130, 130, 132), 'stones', 'stones'),
               (110, 104, 90)),
    'rusevine': ('Ruševine na brdu', 'ruins on a hill: broken stone arches, columns, toppled walls overgrown with '
                 'grass and ivy, a lone tower', 'violet dawn, soft pink light',
                 'a violet and pink dawn sky with long soft clouds',
                 ('broken old flagstones with grass and moss between them', (110, 104, 92), (150, 144, 130), 'slabs',
                  'grass'), (110, 130, 80)),
    'reka': ('Obala pred zoru', 'a river bank before dawn: a calm wide blue river, willows, reeds and a wooden water '
             'mill', 'pink dawn light and blue shadows', 'a pink and pale blue dawn sky with soft clouds',
             ('a sandy river bank with pebbles and wet grass', (150, 136, 112), (190, 178, 156), 'stones', 'grass'),
             (100, 130, 80)),
    'oranje': ('Oranje', 'the plain of Kosovo at ploughing time: ploughed furrows, pear trees, a farmstead with a '
               'fence and a fortress on a distant rock', 'warm clear daylight', 'a clear warm sky with light clouds',
               ('ploughed brown field earth with furrows and clods', (104, 78, 54), (140, 112, 84), 'stones',
                'grass'), (120, 130, 60)),
    'urvina': ('Urvina planina', 'the mountain Urvina: rocky peaks, steep cliffs, fir forests and alpine meadows',
               'clear cool mountain light', 'a clear cool mountain sky with white clouds',
               ('a rocky mountain path with grass and limestone', (120, 118, 100), (166, 166, 150), 'stones',
                'grass'), (90, 120, 60)),
}
ORDER = list(VISTAS)
UNDERGROUND = {'pecina': 'the far rock wall of a huge limestone cave with stalactites, pools and faintly glowing '
                         'turquoise crystals',
               'podrum': 'the back wall of an old vaulted stone cellar: brick arches, niches with barrels, oil lamps',
               'rudnik': 'the back wall of an old silver mine gallery: rough grey rock, timber supports, a wooden '
                         'ladder, ore carts and lanterns'}
GLIGHT = {'selo': 'warm morning sunlight', 'klisura': 'bright afternoon sunlight', 'suma': 'soft green forest light',
          'manastir': 'warm afternoon sunlight', 'tvrdjava': 'warm firelight', 'prevoj': 'cold bright winter daylight',
          'pecina': 'dim turquoise cave light', 'podrum': 'dim amber lamplight', 'mocvara': 'cold blue moonlight',
          'rudnik': 'dim warm lantern light', 'rusevine': 'soft pink dawn light', 'reka': 'soft pink dawn light',
          'oranje': 'warm clear daylight', 'urvina': 'clear cool mountain daylight'}


def world_file(vista, kind):
    for name in (f'{vista}-{kind}-rucno.webp', f'{vista}-{kind}.webp'):
        p = os.path.join(WORLD, name)
        if os.path.exists(p):
            return p
    raise FileNotFoundError(f'{vista}-{kind}')


def seamless(im):
    """Crossfade the last 12 % into the start like stage3d.js, so the result tiles at 88 % of the width."""
    a = np.asarray(im.convert('RGBA'), np.float32) / 255
    w = a.shape[1]
    P = round(w * (1 - SEAM))
    S = round(w * SEAM)
    out = a[:, :P].copy()
    t = np.clip(np.arange(S) / S, 0, 1)
    t = (t * t * (3 - 2 * t))[None, :, None]
    pm = lambda x: np.concatenate([x[..., :3] * x[..., 3:], x[..., 3:]], -1)
    blend = pm(a[:, P:P + S]) * (1 - t) + pm(a[:, :S]) * t
    alpha = blend[..., 3:]
    blend[..., :3] = np.where(alpha > 1e-4, blend[..., :3] / np.maximum(alpha, 1e-4), 0)
    out[:, :S] = blend
    return Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8), 'RGBA')


def draft_from_world(vista, kind, size):
    im = seamless(Image.open(world_file(vista, kind)))
    if kind != 'sky':
        bg = Image.new('RGBA', im.size, (255, 0, 255, 255))
        bg.alpha_composite(im)
        im = bg
    from realisticno_post import resize_wrap
    return resize_wrap(im.convert('RGB'), size)


def make_biome(vista):
    name, theme, light, skyw, ground, fgcol = VISTAS[vista]
    surface, base, stone, kind, lip_kind = ground
    desc = {'far': f'the far distance of {theme}: hills, mountains and distant shapes in atmospheric haze',
            'mid': f'the middle distance of {theme}', 'near': f'the close foreground of {theme}'}
    layers = [{'id': 'sky', 'kind': 'sky', 'strength': 0.86, 'v': 2, 'draw': (lambda: draft_from_world(vista, 'sky', SKY)),
               'prompt': sky_prompt(skyw, light)}]
    if vista in UNDERGROUND:      # their 'sky' is the back wall of a cave, cellar or mine: never clouds
        layers[0].update(strength=0.8, v=3, prompt=back_prompt(UNDERGROUND[vista], light))
    for k in ('far', 'mid', 'near'):
        layers.append({'id': k, 'kind': k, 'strength': 0.76,
                       'draw': (lambda kk=k: draft_from_world(vista, kk, LAYER)), 'prompt': layer_prompt(desc[k], light)})
    lip = tuple(int(v * 1.1) for v in stone)
    return {
        'id': f'svet-{vista}', 'vista': vista, 'name': name, 'layers': layers, 'interior': [], 'materials': {},
        'props': [],
        'ground': {'light': light, 'glight': GLIGHT[vista], 'seed': 600 + ORDER.index(vista) * 10,
                   'top': (surface, base, stone, kind),
                   'front': (f'the edge of {surface}: its lip on top, earth and stones below', lip,
                             tuple(int(v * 0.8) for v in base), tuple(int(v * 0.6) for v in base), lip_kind),
                   'fg': {'busen': (f'a tuft of wild grass and weeds from {theme.split(":")[0]}', fgcol),
                          'kamenje': ('a cluster of weathered rocks', stone),
                          'koren': ('gnarled old tree roots rising out of the ground', (92, 72, 54)),
                          'ograda': ('a short piece of an old rustic wooden fence', (110, 88, 64))}},
    }


BIOMES = {f'svet-{v}': make_biome(v) for v in VISTAS}
