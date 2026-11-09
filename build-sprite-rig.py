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
    if not len(rows):  # a fading effect can end on an empty cell
        c = a.shape[1] / 2
        return {'top': a.shape[0] // 2, 'sole': a.shape[0] // 2, 'feet': c, 'torso': c, 'center': c}
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
PACK4_REF.update({'marko-kick': 'marko-idle', 'marko-slide': 'marko-idle', 'marko-hang': 'marko-idle', 'sword-climb': 'sword-idle'})
# Marko's 7d clips and the foes thrown into the air (DOPUNA-4)
PACK4_REF.update({f'marko-{k}': 'marko-idle' for k in ['combo-4', 'air-1', 'air-2', 'uppercut', 'dash-strike', 'charge-hold', 'push', 'lever']})
PACK4_REF.update({f'{c}-launch': f'{c}-idle' for c in ['sword', 'shield', 'archer', 'akindzija', 'palikuca', 'oklopnik']})
PACK4_REF.update({f'marko-{k}': 'marko-idle' for k in ['idle-2', 'crouch-walk', 'block-walk', 'charge-walk', 'dizzy', 'turn', 'run-start', 'land']})  # DOPUNA-5
PACK4_REF.update({f'marko-{k}': 'marko-idle' for k in ['walk', 'run-stop', 'fall', 'jump-rise', 'idle-3', 'run-attack', 'block-hit', 'hurt-air', 'combo-recover', 'roll-land', 'victory', 'open']})  # DOPUNA-8
PACK4_REF.update({'shield-guardbreak': 'shield-idle', 'oklopnik-armorbreak': 'oklopnik-idle', 'akindzija-backstep': 'akindzija-idle', 'palikuca-burn': 'palikuca-idle'})
for name, ref in PACK4_REF.items():
    if not os.path.exists(os.path.join(ROOT, name + '.json')):
        continue
    mode = 'center' if name in ('marko-climb', 'marko-wallslide') or name.startswith('volovi') or name.endswith('-launch') else 'feet'
    if ref:
        SCALES[name] = (SCALES[ref][0], mode)
    else:  # the oxen team: the tallest frame (yoke horns to hooves) stands 165 world px
        manifest = json.load(open(os.path.join(ROOT, name + '.json')))
        cells = list(manifest['frame_layout']['rows'].values())[0]
        im = np.array(Image.open(os.path.join(ROOT, name + '.png')).convert('RGBA'))
        tall = max(analyse(im[c['y']:c['y'] + c['h'], c['x']:c['x'] + c['w']])['sole'] - analyse(im[c['y']:c['y'] + c['h'], c['x']:c['x'] + c['w']])['top'] for c in cells)
        SCALES[name] = (165 / tall, mode)
# a few pack-4 clips came out at a closer zoom than the idle, so Marko grew while pushing a crate:
# head, boots and torso compared side by side with the idle
ZOOM_FIX = {'marko-push': .82, 'marko-throw': .88}
for name, k in ZOOM_FIX.items():
    if name in SCALES:
        SCALES[name] = (SCALES[name][0] * k, SCALES[name][1])
# new characters (spearman, hound, musketeer): their own clips, matched to their idle body height
NEW_FOES = {'kopljanik': 118, 'tufekdzija': 116, 'pas': 58}
for who, height in NEW_FOES.items():
    if not os.path.exists(os.path.join(ROOT, who + '-idle.json')):
        continue
    manifest = json.load(open(os.path.join(ROOT, who + '-idle.json')))
    cells = list(manifest['frame_layout']['rows'].values())[0]
    im = np.array(Image.open(os.path.join(ROOT, who + '-idle.png')).convert('RGBA'))
    scale = height / max(body_height(im[c['y']:c['y'] + c['h'], c['x']:c['x'] + c['w']]) for c in cells)
    for k in ['idle', 'run', 'attack', 'shoot', 'hurt', 'death', 'jump', 'launch']:
        if os.path.exists(os.path.join(ROOT, f'{who}-{k}.json')):
            SCALES[f'{who}-{k}'] = (scale, 'feet' if k not in ('death', 'launch') else 'center')

# Marko keeps one height: the standing frame of each clip is scaled so sole-to-crown is MARKO_H world px
# (idle used to be 136 and run 127, so Marko shrank when he started to run). Clips drawn at the idle zoom follow the idle.
MARKO_H = 128
MARKO_REF = {'marko-idle': 0, 'marko-idle-2': 'median', 'marko-block': 0, 'marko-crouch': 0, 'marko-drink': 0, 'marko-hurt': 0,
             'marko-combo-1': 0, 'marko-combo-2': 0, 'marko-combo-3': 5, 'marko-getup': 5, 'marko-jump': 0, 'marko-charged': 0, 'marko-kick': 0}  # run and attack are the user's calibration (128)
def visible_px(name, ref):
    manifest = json.load(open(os.path.join(ROOT, name + '.json')))
    cells = list(manifest['frame_layout']['rows'].values())[0]
    im = np.array(Image.open(os.path.join(ROOT, name + '.png')).convert('RGBA'))
    hs = [analyse(im[c['y']:c['y'] + c['h'], c['x']:c['x'] + c['w']]) for c in cells]
    hs = [h['sole'] - h['top'] for h in hs]
    return max(hs) if ref == 'max' else float(np.median(hs)) if ref == 'median' else hs[ref]
idle_factor = 1
for name, ref in MARKO_REF.items():
    if name not in SCALES:
        continue
    new = MARKO_H / visible_px(name, ref)
    if name == 'marko-idle':
        idle_factor = new / SCALES[name][0]
    SCALES[name] = (new, SCALES[name][1])
for name, ref in PACK4_REF.items():
    if ref == 'marko-idle' and name in SCALES and name not in MARKO_REF:
        SCALES[name] = (SCALES[name][0] * idle_factor, SCALES[name][1])
# the foes too: idle, run and the first attack frame stand equally tall (palikuca was 118 idle, 129 running)
FOE_H = {'sword': 118, 'shield': 112, 'archer': 120, 'akindzija': 120, 'palikuca': 124, 'oklopnik': 137, 'kopljanik': 125, 'tufekdzija': 122}
FOE_REF = {'idle': 'median', 'run': 'median', 'walk': 'median', 'attack': 0, 'shoot': 0, 'hurt': 0}
for who, height in FOE_H.items():
    factor, done = 1, set()
    for k, ref in FOE_REF.items():
        name = f'{who}-{k}'
        if name not in SCALES or name == 'kopljanik-attack':
            continue
        new = height / visible_px(name, ref)
        if k == 'idle':
            factor = new / SCALES[name][0]
        SCALES[name] = (new, SCALES[name][1]); done.add(name)
    for name in list(SCALES):
        follows = PACK4_REF.get(name) == f'{who}-idle' or (who in NEW_FOES and name.startswith(who + '-'))
        if follows and name not in done:
            SCALES[name] = (SCALES[name][0] * factor, SCALES[name][1])

# DOPUNA-10: Marko striking from Šarac, Musa's new stages, the beg on horseback, the travellers, the Arab
def _cells(name):
    manifest = json.load(open(os.path.join(ROOT, name + '.json')))
    im = np.array(Image.open(os.path.join(ROOT, name + '.png')).convert('RGBA'))
    return [im[c['y']:c['y'] + c['h'], c['x']:c['x'] + c['w']] for c in list(manifest['frame_layout']['rows'].values())[0]]
def _width(cell):
    cols = np.where((cell[:, :, 3] > SOLID).any(0))[0]
    return int(cols[-1] - cols[0] + 1)
def _have(name):
    return os.path.exists(os.path.join(ROOT, name + '.json'))
# DOPUNA-20: Ravijojla's own clips as tall as fairy-cast (she floats: anchored at the cell centre), and the magic
FAIRY_H = 84
for name in ['vila-let', 'vila-carolija', 'vila-isceljenje', 'vila-spreda']:
    if _have(name):
        hs = [analyse(c)['sole'] - analyse(c)['top'] for c in _cells(name)]
        SCALES[name] = (FAIRY_H / float(np.median(hs)), 'center')
for name, k in [('magija-bljesak', .4), ('magija-zrak', .5)]:
    if _have(name):
        SCALES[name] = (k, 'center')
# horse and rider: the horse as long as Šarac in mounted-run (Musa's black horse a fifth longer: he is the giant of the song)
if _have('mounted-run'):
    RIDE_W = float(np.median([_width(c) for c in _cells('mounted-run')])) * SCALES['mounted-run'][0]
    for name, k in {'marko-mounted-attack': 1.0, 'beg-mounted': 1.0}.items():
        if _have(name):
            SCALES[name] = (RIDE_W * k / float(np.median([_width(c) for c in _cells(name)])), 'center')
    # Musa's lance makes his picture long, so he is matched by height: a fifth taller than Marko on Šarac
    RIDE_H = float(np.median([body_height(c) for c in _cells('mounted-run')])) * SCALES['mounted-run'][0]
    if _have('musa-mounted'):
        SCALES['musa-mounted'] = (RIDE_H * 1.22 / float(np.median([body_height(c) for c in _cells('musa-mounted')])), 'center')
    for name, ref in {'musa-mounted-strike': 'musa-mounted', 'beg-mounted-strike': 'beg-mounted', 'beg-unhorsed': 'beg-mounted'}.items():
        if _have(name) and ref in SCALES:
            SCALES[name] = (SCALES[ref][0], 'center')
# Musa's sabre, grab and the grappling were drawn at the zoom of musa-idle
for name in ['musa-sword', 'musa-grab', 'megdan-kostac', 'megdan-noz']:
    if _have(name) and 'musa-idle' in SCALES:
        SCALES[name] = (SCALES['musa-idle'][0], 'feet' if name.startswith('musa') else 'center')
# the travellers and the Arab: their idle body height in world px; every clip of theirs shares that scale
for who, height in {'putnik-starac': 108, 'putnik-trgovac': 118, 'putnica': 114, 'putnik-kaluder': 118, 'arapin': 150,
                    'azdaja': 300, 'dzelat': 140, 'djemo': 142}.items():
    if not _have(who + '-idle'):
        continue
    scale = height / max(body_height(c) for c in _cells(who + '-idle'))
    for k in ['idle', 'walk', 'run', 'attack', 'throw', 'hurt', 'death', 'fire', 'bite']:
        if _have(f'{who}-{k}'):
            SCALES[f'{who}-{k}'] = (scale, 'center' if k == 'death' else 'feet')

# DOPUNA-11: Marko's finish, the skeletons, a new move for every foe, more of Musa (all drawn at their idle zoom)
if _have('marko-finisher'):
    SCALES['marko-finisher'] = (SCALES['marko-idle'][0], 'feet')
if _have('kosturi') and 'sword-death' in SCALES:
    SCALES['kosturi'] = (SCALES['sword-death'][0], 'center')
for name in ['sword-lunge', 'shield-bash', 'archer-kick', 'akindzija-spin', 'oklopnik-grab', 'tufekdzija-butt', 'kopljanik-sweep', 'palikuca-bomb',
             'musa-throw-up', 'musa-stomp', 'musa-roar', 'musa-block']:
    who = name.split('-')[0]
    if _have(name) and who + '-idle' in SCALES:
        SCALES[name] = (SCALES[who + '-idle'][0], 'feet')

# DOPUNA-12: the fairy stone (asleep, waking, awake) stands about 150 world px, one scale for its three clips
if _have('vilinski-kamen-spava'):
    k = 150 / max(body_height(c) for c in _cells('vilinski-kamen-spava'))
    for name in ['vilinski-kamen-spava', 'vilinski-kamen-budi', 'vilinski-kamen-budan']:
        if _have(name):
            SCALES[name] = (k, 'feet')
if _have('marko-crouch-throw') and 'marko-crouch' in SCALES:
    SCALES['marko-crouch-throw'] = (SCALES['marko-crouch'][0], 'feet')

# DOPUNA-13: three more finishes and drinking on the move, at Marko's idle zoom; the grapples on the ground at the
# zoom of Musa's (Marko lying full length is about as long in all of them)
for name in ['marko-finisher-smash', 'marko-finisher-throw', 'marko-finisher-stomp', 'marko-drink-walk', 'marko-finisher-legs','marko-finisher-skull','marko-run-jump','marko-call','marko-pickup','marko-teeter','marko-idle-4','marko-blasted','marko-call-walk','marko-wounded-walk']:
    if _have(name):
        SCALES[name] = (SCALES['marko-idle'][0], 'feet')
for who in ['janicar', 'oklopnik', 'pas']:
    for name in [f'kostac-{who}', f'kostac-{who}-kraj']:
        if _have(name):
            SCALES[name] = (0.37, 'center')

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
