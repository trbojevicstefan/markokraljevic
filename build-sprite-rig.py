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
