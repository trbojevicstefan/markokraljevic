"""Builds dist/assets/sprite-rig.json: one consistent scale per character across all of its animations.

Every animation sheet was generated at a different zoom (e.g. Marko's run cycle is drawn 1.5x smaller
inside its cell than his idle pose). Head size does not change with pose, so each sheet's scale below was
derived by measuring the head (hair/helmet top to beard bottom) in source pixels and matching it to the
character's idle sprite. World units: Marko is 128 px tall standing.

For every frame the script also finds the sole row (lowest opaque pixel) so feet land exactly on the ground,
and a per-animation anchor so the character does not slide when switching animations or turning around.
Run:  python build-sprite-rig.py
"""
import json, os
import numpy as np
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dist', 'assets')

MARKO = 128 / 349  # cast/marko.png: hair top at y=20, sole at y=369
SCALES = {
    # name: (world px per source px, anchor mode)
    'cast/marko':    (MARKO,        'feet'),
    'marko-run':     (MARKO * 1.51, 'torso'),   # head 27.5 src px vs 41.5 idle
    'marko-attack':  (MARKO * 1.29, 'feet'),    # head 33 src px
    'marko-jump':    (MARKO * 1.03, 'torso'),
    'marko-drink':   (MARKO * 1.00, 'feet'),
    'cast/jump':     (MARKO * 1.00, 'torso'),
    'cast/attack':   (MARKO * 1.29, 'feet'),
    'mounted-jump':  (MARKO * 1.22, 'center'),  # rider head 34 src px
    'mounted-run':   (MARKO * 1.52, 'center'),  # rider head 27 src px
    'cast/sarac':    (MARKO * 1.01, 'center'),  # horse body length matched to mounted-jump
    'cast/sword':    (0.325, 'feet'),
    'sword-attack':  (0.325 * 1.30, 'feet'),
    'sword-run':     (0.325 * 1.03, 'torso'),
    'cast/shield':   (0.302, 'feet'),
    'shield-attack': (0.302 * 1.22, 'feet'),
    'shield-run':    (0.302 * 1.04, 'torso'),
    'cast/archer':   (0.372, 'feet'),
    'archer-shoot':  (0.372, 'feet'),
    'archer-run':    (0.372 * 0.94, 'torso'),
    'cast/musa':     (0.475, 'feet'),           # Musa's head is ~1.6x Marko's: he is the giant of the song
    'musa-attack':   (0.475 * 1.78, 'feet'),
    'musa-run':      (0.475, 'torso'),
    # animation pack 02 (scales matched by head size: turban/helmet top to beard bottom)
    'marko-vihor':   (0.40, 'feet'),            # 8-frame spin, upright pose ~128 high
    'marko-charged': (0.362, 'feet'),           # head 42 src px
    'akindzija-charge': (0.345, 'feet'),        # turban-to-chin 55 src px -> 19 world
    'akindzija-jump':   (0.345, 'feet'),
    'oklopnik-slam':    (0.36, 'feet'),         # helmet-to-beard 78 src px, the heavy of the squad
    'oklopnik-rush':    (0.312, 'feet'),        # same head drawn at 90 src px
    'palikuca-torch':   (0.267, 'feet'),        # turban-to-chin 75 src px -> 20 world
    'palikuca-fire':    (0.345, 'feet'),        # turban-to-chin 58 src px
    'orao-flight':      (0.3, 'center'),
    'cast/fairy':    (0.235, 'center'),
    'fairy-cast':    (0.235, 'center'),
}

SOLID = 150  # alpha threshold that ignores the soft glow some sprites carry


def analyse(cell):
    a = cell[:, :, 3] > SOLID
    rows = np.where(a.any(1))[0]
    cols = np.where(a.any(0))[0]
    top, sole = int(rows[0]), int(rows[-1] + 1)
    h = sole - top
    xs = np.arange(a.shape[1])
    feet = a[max(top, sole - 22):sole]
    feet_x = float((feet.sum(0) * xs).sum() / max(1, feet.sum()))
    band = a[top + int(h * .12):top + int(h * .45)]
    torso_x = float((band.sum(0) * xs).sum() / max(1, band.sum()))
    center_x = float(cols[0] + cols[-1] + 1) / 2
    return {'top': top, 'sole': sole, 'feet': feet_x, 'torso': torso_x, 'center': center_x}


# The opening defeat pose is nearly upright. Match its body height once;
# retain that fixed scale as the character kneels and lies down.
for character, height in {'marko': 125, 'sword': 110, 'shield': 103, 'archer': 115, 'musa': 161}.items():
    name = character + '-death'
    manifest = json.load(open(os.path.join(ROOT, name + '.json')))
    c = list(manifest['frame_layout']['rows'].values())[0][0]
    im = np.array(Image.open(os.path.join(ROOT, name + '.png')).convert('RGBA'))
    info = analyse(im[c['y']:c['y']+c['h'], c['x']:c['x']+c['w']])
    SCALES[name] = (height / (info['sole'] - info['top']), 'center')

for action in ['crouch', 'block', 'super']:
    name = 'marko-' + action
    manifest = json.load(open(os.path.join(ROOT, name + '.json')))
    c = list(manifest['frame_layout']['rows'].values())[0][5]  # upright return pose, no raised weapon
    im = np.array(Image.open(os.path.join(ROOT, name + '.png')).convert('RGBA'))
    info = analyse(im[c['y']:c['y']+c['h'], c['x']:c['x']+c['w']])
    SCALES[name] = (128 / (info['sole'] - info['top']), 'feet')

# Animation pack 03: every clip was generated separately, so its zoom differs. Each sheet is scaled so the
# character's most upright frame (thin raised weapons ignored) matches that character's standing height.
STANDING = {'marko': 128, 'sword': 115, 'shield': 108, 'archer': 116, 'musa': 168, 'akindzija': 120, 'oklopnik': 132, 'palikuca': 112}


def body_height(cell):
    a = cell[:, :, 3] > SOLID
    w = a.sum(1)
    rows = np.where(w > 0)[0]
    wide = np.where(w >= .35 * np.median(w[rows]))[0]
    return rows[-1] + 1 - wide[0]


PACK3 = ['marko-idle', 'marko-combo-1', 'marko-combo-2', 'marko-combo-3', 'marko-roll', 'marko-hurt', 'marko-knockdown', 'marko-getup',
         'marko-counter', 'marko-plunge', 'marko-ledge', 'marko-walljump'] +         [f'{c}-{k}' for c in ['sword', 'shield', 'archer', 'akindzija', 'oklopnik', 'palikuca', 'musa'] for k in ['hurt', 'idle']] +         ['akindzija-run', 'akindzija-death', 'oklopnik-walk', 'oklopnik-death', 'palikuca-run', 'palikuca-death']
PACK3_FIX = {'marko-combo-3': 1.25, 'marko-counter': 1.2, 'marko-plunge': 1.1, 'marko-knockdown': .82, 'marko-roll': .95, 'palikuca-run': 1.12, 'oklopnik-death': .92}  # visual review vs. the idle reference
for name in PACK3:
    if not os.path.exists(os.path.join(ROOT, name + '.json')):
        continue
    who = name.split('-')[0]
    manifest = json.load(open(os.path.join(ROOT, name + '.json')))
    cells = list(manifest['frame_layout']['rows'].values())[0]
    im = np.array(Image.open(os.path.join(ROOT, name + '.png')).convert('RGBA'))
    tallest = max(body_height(im[c['y']:c['y'] + c['h'], c['x']:c['x'] + c['w']]) for c in cells)
    SCALES[name] = (STANDING[who] / tallest * PACK3_FIX.get(name, 1), 'feet' if not name.endswith(('ledge', 'walljump', 'roll')) else 'center')

# Animation pack 04 and later: the artist draws each new clip at the same zoom as that character's idle clip
# (art/animation-pack-04/preview.png compares them side by side), so it shares the idle scale.
PACK4_REF = {'marko-climb': 'marko-idle', 'marko-wallslide': 'marko-idle', 'marko-throw': 'marko-idle',
             'archer-shoot-down': 'archer-idle', 'volovi-plug': None, 'volovi-beg': None}
PACK4_REF.update({f'{c}-jump': f'{c}-idle' for c in ['sword', 'shield', 'archer', 'palikuca', 'oklopnik']})
for name, ref in PACK4_REF.items():
    if not os.path.exists(os.path.join(ROOT, name + '.json')):
        continue
    mode = 'center' if name in ('marko-climb', 'marko-wallslide') or name.startswith('volovi') else 'feet'
    SCALES[name] = (SCALES[ref][0] if ref else 0.62, mode)
# new characters (spearman, hound, musketeer): their own clips, matched to their idle body height
NEW_FOES = {'kopljanik': 118, 'tufekdzija': 116, 'pas': 58}
for who, height in NEW_FOES.items():
    if not os.path.exists(os.path.join(ROOT, who + '-idle.json')):
        continue
    manifest = json.load(open(os.path.join(ROOT, who + '-idle.json')))
    cells = list(manifest['frame_layout']['rows'].values())[0]
    im = np.array(Image.open(os.path.join(ROOT, who + '-idle.png')).convert('RGBA'))
    scale = height / max(body_height(im[c['y']:c['y'] + c['h'], c['x']:c['x'] + c['w']]) for c in cells)
    for k in ['idle', 'run', 'attack', 'shoot', 'hurt', 'death', 'jump']:
        if os.path.exists(os.path.join(ROOT, f'{who}-{k}.json')):
            SCALES[f'{who}-{k}'] = (scale, 'feet' if k != 'death' else 'center')

rig = {}
for name, (scale, mode) in SCALES.items():
    if name.startswith('cast/'):
        image = name + '.png'
        im = np.array(Image.open(os.path.join(ROOT, image)).convert('RGBA'))
        cells = [{'x': 0, 'y': 0, 'w': im.shape[1], 'h': im.shape[0]}]
    else:
        image = name + '.png'
        manifest = json.load(open(os.path.join(ROOT, name + '.json')))
        im = np.array(Image.open(os.path.join(ROOT, image)).convert('RGBA'))
        cells = list(manifest['frame_layout']['rows'].values())[0]
    frames, anchors = [], []
    for c in cells:
        info = analyse(im[c['y']:c['y'] + c['h'], c['x']:c['x'] + c['w']])
        frames.append([c['x'], c['y'], c['w'], c['h'], info['sole'], info['top']])
        anchors.append(info[mode])
    rig[name] = {
        'image': image,
        'scale': round(scale, 5),
        'anchor': round(float(np.median(anchors)), 1),
        'frames': frames,
    }
    heights = [round((f[4] - f[5]) * scale) for f in frames]
    print(f'{name:14s} scale {scale:.3f} anchor {rig[name]["anchor"]:6.1f}  world heights {heights}')

with open(os.path.join(ROOT, 'sprite-rig.json'), 'w') as f:
    json.dump(rig, f, separators=(',', ':'))
print('wrote', os.path.join(ROOT, 'sprite-rig.json'))
