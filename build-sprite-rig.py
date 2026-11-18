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
    manifest = json.load(open(os.path.join(ROOT, name + '.json'), encoding='utf-8-sig'))
    c = list(manifest['frame_layout']['rows'].values())[0][0]
    im = np.array(Image.open(os.path.join(ROOT, name + '.png')).convert('RGBA'))
    info = analyse(im[c['y']:c['y']+c['h'], c['x']:c['x']+c['w']])
    SCALES[name] = (height / (info['sole'] - info['top']), 'center')

for action in ['crouch', 'block', 'super']:
    name = 'marko-' + action
    manifest = json.load(open(os.path.join(ROOT, name + '.json'), encoding='utf-8-sig'))
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
    manifest = json.load(open(os.path.join(ROOT, name + '.json'), encoding='utf-8-sig'))
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
        manifest = json.load(open(os.path.join(ROOT, name + '.json'), encoding='utf-8-sig'))
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
    manifest = json.load(open(os.path.join(ROOT, who + '-idle.json'), encoding='utf-8-sig'))
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
    manifest = json.load(open(os.path.join(ROOT, name + '.json'), encoding='utf-8-sig'))
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
    manifest = json.load(open(os.path.join(ROOT, name + '.json'), encoding='utf-8-sig'))
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
# DOPUNA-24: fire and the cannonball's burst, standing on the ground (a flame cluster 78 world px wide at scale 1 in the game)
for name, k in [('plamen', .45), ('plamen-mali', .45), ('eksplozija', .55)]:
    if _have(name):
        SCALES[name] = (k, 'feet')
# DOPUNA-25: the wedding guests (sized by their tallest figure) and the young Turk (as tall as a janissary)
for name, height in [('svatovi-zarobljeni', 112), ('svatovi-kolo', 110)]:
    if _have(name):
        SCALES[name] = (height / max(body_height(c) for c in _cells(name)), 'feet')
if _have('mladi-turcin-idle'):
    s_ = 120 / max(body_height(c) for c in _cells('mladi-turcin-idle'))
    for k in ['idle', 'run', 'attack', 'hurt', 'death']:
        if _have(f'mladi-turcin-{k}'):
            SCALES[f'mladi-turcin-{k}'] = (s_, 'center' if k == 'death' else 'feet')
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

# DOPUNA-26: the eagle, about 170 world px from tail to beak in flight (the game anchors her by her body, cell row 300)
if _have('orao-let'):
    k_ = 170 / float(np.median([_width(c) for c in _cells('orao-let')]))
    for name in ['orao-let', 'orao-obrusavanje', 'orao-hlad']:
        if _have(name):
            SCALES[name] = (k_, 'center')
# DOPUNA-26: Lovac-aga, a champion as tall as the Arab's men (his idle 150 world px), one scale for all his clips
if _have('lovac-aga-idle'):
    s_ = 150 / max(body_height(c) for c in _cells('lovac-aga-idle'))
    for k in ['idle', 'run', 'attack', 'rog', 'hurt', 'death']:
        if _have(f'lovac-aga-{k}'):
            SCALES[f'lovac-aga-{k}'] = (s_, 'center' if k == 'death' else 'feet')
# DOPUNA-26: the guslar sits on his stone at the zoom of the old traveller (the stone is in the drawing)
for name in ['guslar-svira', 'guslar-ceka']:
    if _have(name) and 'putnik-starac-idle' in SCALES:
        SCALES[name] = (SCALES['putnik-starac-idle'][0], 'feet')

# DOPUNA-27: the falcon, smaller than the eagle (about 105 world px in flight); the wounded one sits on the ground
if _have('soko-let'):
    k_ = 105 / float(np.median([_width(c) for c in _cells('soko-let')]))
    for name in ['soko-let', 'soko-napad', 'soko-voda']:
        if _have(name):
            SCALES[name] = (k_, 'center')
    if _have('soko-ranjen'):
        SCALES['soko-ranjen'] = (k_, 'feet')
# DOPUNA-27: the Sultan's herald, his tall hat a little over a janissary (idle 158 world px)
if _have('caus-idle'):
    s_ = 158 / max(body_height(c) for c in _cells('caus-idle'))
    for k in ['idle', 'walk', 'ferman', 'hurt', 'death']:
        if _have(f'caus-{k}'):
            SCALES[f'caus-{k}'] = (s_, 'center' if k == 'death' else 'feet')

# DOPUNA-27: Ognjeni aga, the cellar's champion, a big man (idle 160 world px), one scale for all his clips
if _have('ognjeni-aga-idle'):
    s_ = 160 / max(body_height(c) for c in _cells('ognjeni-aga-idle'))
    for k in ['idle', 'run', 'attack', 'ulje', 'zadihan', 'hurt', 'death']:
        if _have(f'ognjeni-aga-{k}'):
            SCALES[f'ognjeni-aga-{k}'] = (s_, 'center' if k == 'death' else 'feet')

# DOPUNA-28: three more champions in their own drawings (idle 160 world px each), one scale per champion
for who, clips in [('hasan-aga', ['idle', 'run', 'attack', 'zalet', 'zaglavljen', 'hurt', 'death']),
                   ('bajraktar', ['idle', 'run', 'attack', 'poziv', 'hurt', 'death']),
                   ('janicarski-aga', ['idle', 'run', 'attack', 'skok', 'hurt', 'death'])]:
    if _have(f'{who}-idle'):
        s_ = 160 / max(body_height(c) for c in _cells(f'{who}-idle'))
        for k in clips:
            if _have(f'{who}-{k}'):
                SCALES[f'{who}-{k}'] = (s_, 'center' if k == 'death' else 'feet')

# DOPUNA-30: the bride and groom run off happy after the kolo; the poor by the road (an old woman and a boy).
# One scale per character, set by the clip where they stand tallest without the raised arm: the bride's jump
# lands back on both feet (frame 0), the groom crouches before his jump, so his run is used with the cap-hand removed.
def _fig_h(name, frames=None):
    cs = _cells(name)
    cs = [cs[i] for i in frames] if frames else cs
    return float(np.median([body_height(c) for c in cs]))
if _have('mlada-trci'):
    s_ = 101 / _fig_h('mlada-skok', [0]) if _have('mlada-skok') else 101 / _fig_h('mlada-trci')
    for k in ['trci', 'skok']:
        if _have(f'mlada-{k}'):
            SCALES[f'mlada-{k}'] = (s_, 'feet')
    print('mlada', round(s_, 4), [round(body_height(c) * s_) for c in _cells('mlada-trci')])
if _have('mladozenja-trci'):
    s_ = (SCALES['mlada-trci'][0] * 1.06) if 'mlada-trci' in SCALES else 140 / _fig_h('mladozenja-trci')
    for k in ['trci', 'skok']:
        if _have(f'mladozenja-{k}'):
            SCALES[f'mladozenja-{k}'] = (s_, 'feet')
    print('mladozenja', round(s_, 4), [round(body_height(c) * s_) for c in _cells('mladozenja-trci')])
if _have('sirotinja-blagoslov'):
    s_ = 104 / max(body_height(c) for c in _cells('sirotinja-blagoslov'))
    for k in ['ceka', 'blagoslov']:
        if _have(f'sirotinja-{k}'):
            SCALES[f'sirotinja-{k}'] = (s_, 'feet')
    print('sirotinja', round(s_, 4))

# DOPUNA-33: Marko with his father's sabre. Codex drew all eight clips at the zoom of marko-idle-2, so they share one scale:
# the one that makes the standing sabre clip as tall as Marko (MARKO_H), sole to crown.
if _have('marko-sablja-idle'):
    s_ = MARKO_H / visible_px('marko-sablja-idle', 'median')
    for k in ['izvlaci', 'idle', 'trci', 'udarac-1', 'udarac-2', 'udarac-3', 'skok', 'vraca',
              'tezak', 'ubod', 'uvis', 'vihor', 'glava', 'proburazi', 'preseci', 'tiho']:  # DOPUNA-38 and 39
        if _have(f'marko-sablja-{k}'):
            SCALES[f'marko-sablja-{k}'] = (s_, 'feet')
    print('sablja', round(s_, 4), 'idle-2', round(SCALES.get('marko-idle-2', (0,))[0], 4))

# DOPUNA-38 and 40: Marko's silent kill and his beating share the zoom of marko-idle-2; the sleepers, the silent fall and
# the skeleton are drawn at the zoom of the sword-bearer's idle (the skeleton stands as tall as he does); the armoured skeleton at his.
for name, ref in [('marko-tiho', 'marko-idle-2'), ('marko-brutal', 'marko-idle-2'), ('sword-spava', 'sword-idle'), ('sword-budi', 'sword-idle'),
                  ('shield-spava', 'shield-idle'), ('shield-budi', 'shield-idle'), ('sword-tiho-pada', 'sword-idle'),
                  ('kostur-stoji', 'sword-idle'), ('kostur-pada', 'sword-idle'), ('oklopnik-kostur-pada', 'oklopnik-idle')]:
    if _have(name) and ref in SCALES:
        SCALES[name] = (SCALES[ref][0], 'feet')

# DOPUNA-42 and 43: Marko at rest, in chains and in the standing grapple at his own zoom; the merchant at his stall at his
# travelling zoom; the golden duck and the vizier's falcon like soko-let; Janja and Novak by their idle body height.
for name, ref in [('marko-pocinak', 'marko-idle-2'), ('marko-okovan', 'marko-walk'), ('kostac-stoji', 'marko-idle-2'),
                  ('kostac-stoji-kraj', 'marko-idle-2'), ('trgovac-tezga-idle', 'putnik-trgovac-idle')]:
    if _have(name) and ref in SCALES:
        SCALES[name] = (SCALES[ref][0], 'feet')
for name in ['utva-let', 'soko-vezirov-let']:
    if _have(name) and 'soko-let' in SCALES:
        SCALES[name] = (SCALES['soko-let'][0], 'center')
for who, height in {'janja': 112, 'novak': 112}.items():  # Novak is broad, not taller than Marko (about 130 world px)
    if _have(who + '-idle'):
        s_ = height / max(body_height(c) for c in _cells(who + '-idle'))
        for k in ['idle', 'toci', 'kuje']:
            if _have(f'{who}-{k}'):
                SCALES[f'{who}-{k}'] = (s_, 'feet')

# DOPUNA-45: Marko ploughs himself. marko-ore holds his fists about 60 world px above the ground (hip height, leaning
# into the plough), so the oxen without the ploughman are scaled until the plough handles (119 px above the sole in
# their cell) top out at 64 px: small Balkan oxen, horns about 0.8 of Marko. Only the plough team uses these oxen.
if _have('volovi-ralo'):
    SCALES['volovi-ralo'] = (64 / 119, 'center')
if _have('marko-ore') and 'marko-walk' in SCALES:
    SCALES['marko-ore'] = (SCALES['marko-walk'][0], 'feet')

# DOPUNA-44: the standing grapple with each champion. Both men share one cell, Marko on the left. The artist drew the
# champions shorter against Marko than they stand on the road, so the scale splits the difference (geometric mean of
# Marko's and the champion's road scale): both are off by the same few percent instead of one of them jumping.
# A clip in KOSTAC_CEKA is drawn wrong and waits for a redraw (the first ones came out as one plain Turk because the
# artist took reference.png, an old generic janissary, as the champion's look; GPT-6.1-Sol redrew them).
def _halves(name):
    cs = _cells(name)
    return float(np.median([body_height(c[:, :230]) for c in cs])), float(np.median([body_height(c[:, 290:]) for c in cs]))
def _road(name):
    return float(np.median([body_height(c) for c in _cells(name)])) * SCALES[name][0]
KOSTAC_LIK = {'hasan': 'hasan-aga', 'djemo': 'djemo', 'dzelat': 'dzelat', 'ognjeni': 'ognjeni-aga', 'bajraktar': 'bajraktar',
              'aga': 'janicarski-aga', 'arapin': 'arapin', 'lovac': 'lovac-aga', 'musa': 'musa', 'basa': 'basa',
              'kopljanik-basa': 'kopljanik-basa', 'beg': 'beg'}
KOSTAC_CEKA = set()
def _kostaci():  # run again after the three baše get their own scale below
    for kit, who in KOSTAC_LIK.items():
        clip = f'kostac-{kit}'
        if kit in KOSTAC_CEKA or clip in SCALES or not (_have(clip) and f'{who}-idle' in SCALES and 'marko-idle-2' in SCALES):
            continue
        m_, o_ = _halves(clip)
        s_ = float(np.sqrt(_road('marko-idle-2') / m_ * _road(f'{who}-idle') / o_))
        for n_ in [clip, clip + '-kraj']:
            if _have(n_):
                SCALES[n_] = (s_, 'feet')
        print(clip, round(s_, 4), 'marko', round(m_ * s_ / _road('marko-idle-2'), 2), 'protivnik', round(o_ * s_ / _road(f'{who}-idle'), 2))
_kostaci()
# The stunned soldier staggers bent over: as tall as his idle less the stoop (5%).
for t_ in ['sword', 'shield', 'archer', 'akindzija', 'oklopnik', 'palikuca', 'kopljanik', 'tufekdzija']:
    n_ = f'{t_}-omamljen'
    if _have(n_) and f'{t_}-idle' in SCALES:
        SCALES[n_] = (_road(f'{t_}-idle') * .95 / float(np.median([body_height(c) for c in _cells(n_)])), 'feet')
# The champion's grab: the artist drew each one smaller than his idle, by the grapple factor of the brief, and wrote
# it in the manifest (scaleReference): the idle scale is enlarged by the same factor so he keeps his size.
def _grab_k(name):
    ref_ = json.load(open(os.path.join(ROOT, name + '.json'), encoding='utf8')).get('scaleReference') or {}
    return ref_['idleAlphaHeight'] / ref_['targetHeight'] if ref_.get('targetHeight') else 1
for who in ['hasan-aga', 'ognjeni-aga', 'lovac-aga', 'bajraktar', 'janicarski-aga', 'djemo', 'dzelat', 'arapin']:
    if _have(f'{who}-hvata') and f'{who}-idle' in SCALES:
        SCALES[f'{who}-hvata'] = (SCALES[f'{who}-idle'][0] * _grab_k(f'{who}-hvata'), 'feet')
# The three champions who were enlarged soldiers get their own figures at the size the game drew them so far
# (tufekdžija and kopljanik × 1.3, the akinji × 1.35): one scale per figure, from its idle; the grab follows it.
# A figure in BASA_CEKA waits for a redraw (the kopljanik-baša's and the bey's run and hurt first came out cut across
# the cell edges; redrawn).
BASA_CEKA = set()
for who, ref, k in [('basa', 'tufekdzija-idle', 1.3), ('kopljanik-basa', 'kopljanik-idle', 1.3), ('beg', 'akindzija-idle', 1.35)]:
    if who not in BASA_CEKA and _have(f'{who}-idle') and ref in SCALES:
        s_ = _road(ref) * k / float(np.median([body_height(c) for c in _cells(f'{who}-idle')]))
        for c_ in ['idle', 'run', 'attack', 'hurt', 'death', 'hvata']:
            if _have(f'{who}-{c_}'):
                SCALES[f'{who}-{c_}'] = (s_ * (_grab_k(f'{who}-{c_}') if c_ == 'hvata' else 1), 'center' if c_ == 'death' else 'feet')
        print(who, round(s_, 4), 'visina', round(_road(ref) * k))
_kostaci()  # the grapples with the baše, now that their figures have a scale
# The janissary who leaps on Marko's back: Marko stands alone in the last frame of the throw, so his height there
# (left part of the cell, the janissary lies to the right) makes him as tall as on the road.
if _have('kostac-ledja-kraj') and 'marko-idle-2' in SCALES:
    s_ = _road('marko-idle-2') / body_height(_cells('kostac-ledja-kraj')[-1][:, :300])
    for n_ in ['kostac-ledja', 'kostac-ledja-kraj']:
        if _have(n_):
            SCALES[n_] = (s_, 'feet')
    print('kostac-ledja', round(s_, 4))
# The second strike in a row came out at a closer zoom than the first; the soldier ends both back in his stance,
# so the last frames are made the same height.
for name, ref in [('sword-drugi', 'sword-attack'), ('shield-drugi', 'shield-attack'), ('akindzija-drugi', 'akindzija-spin'),
                  ('kopljanik-drugi', 'kopljanik-attack')]:
    if _have(name) and ref in SCALES:
        SCALES[name] = (SCALES[ref][0] * body_height(_cells(ref)[-1]) / body_height(_cells(name)[-1]), 'feet')
# The ground grapple with the akinji and the spearman: the same pose and place as kostac-janicar, drawn 0.76 as large
# (kostac-janicar itself came out 1.3 too large and the game shrinks it), so at its scale they are true size.
for n_ in ['kostac-akindzija', 'kostac-akindzija-kraj', 'kostac-kopljanik', 'kostac-kopljanik-kraj']:
    if _have(n_) and 'kostac-janicar' in SCALES:
        SCALES[n_] = (SCALES['kostac-janicar'][0], 'feet')
# Marko lifts plough and oxen (1024 cell). Marko is drawn broader here than in marko-ore (his head 15% wider at the
# old 0.367, seen in the game too), so the scale keeps Marko: 0.32. The oxen come out smaller than volovi-ralo while
# they are in his hands. The anchor goes on Marko's feet (cell x 270, below) so he stays where he ploughed.
if _have('marko-dize-ralo'):
    SCALES['marko-dize-ralo'] = (.32, 'feet')


# ===== noc-poliranje: the other session's own clips go only between these two lines (helpers such as _cells, _road
# and body_height are defined above). This session never writes here and puts its new blocks above this line. =====
# archer-rafal (DOPUNA-46): three arrows in a row. Drawn closer than archer-shoot; the man looses in the same wide stance
# in both, so the frame where he has just loosed is measured against the loosing frame of archer-shoot; the new drawing stands
# lower and broader (legs wide, body leaning), and seen beside an archer on the road its head matched at 0.78 of that.
if _have('archer-rafal') and 'archer-shoot' in SCALES:
    SCALES['archer-rafal'] = (SCALES['archer-shoot'][0] * body_height(_cells('archer-shoot')[3]) / body_height(_cells('archer-rafal')[1]) * .92, 'feet')   # 18. 11.: the drawing was squat; squeezed to 0.8 of its width, and a little taller (was .78)
# oklopnik-drugi (DOPUNA-46 v3): the low sweep after the hammer from above. He ends in the stance oklopnik-slam ends in,
# so the last frames are made the same height (the rule of the other -drugi clips).
if _have('oklopnik-drugi') and 'oklopnik-slam' in SCALES:
    SCALES['oklopnik-drugi'] = (SCALES['oklopnik-slam'][0] * body_height(_cells('oklopnik-slam')[-1]) / body_height(_cells('oklopnik-drugi')[-1]), 'feet')
# fx-potres (DOPUNA-46 v3): the tremor of his hammer along the ground, at the zoom of oklopnik-slam; no figure in it
if _have('fx-potres') and 'oklopnik-slam' in SCALES:
    SCALES['fx-potres'] = (SCALES['oklopnik-slam'][0], 'center')
# moc-* (DOPUNA-47): the animated signs of the powers that float over a shrine; no figure, drawn about their own middle.
# The drawing is some 150 px in a 512 cell and is shown some 70 to 130 px across over the shrine.
for _m in ('krilo', 'lanac', 'oko', 'trag', 'potres', 'nalet', 'kombo', 'gaz', 'zidotrk'):
    if _have('moc-' + _m):
        SCALES['moc-' + _m] = (.44, 'center')
# DOPUNA-48 („Marko Kraljević i vila”): Miloš on foot at Marko's zoom (his body 380 px against Marko's 383 in marko-idle-2);
# Ravijojla's new clips at the zoom and anchor of vila-let; riders (Marko asleep on Šarac, Miloš on his bay) as long as
# Šarac in mounted-run, like marko-mounted-attack; Marko over the vila at Marko's zoom.
for _n in ('milos-idle', 'milos-attack', 'milos-hurt', 'milos-ranjen', 'milos-ustaje', 'marko-nad-vilom'):
    if _have(_n) and 'marko-idle-2' in SCALES:
        SCALES[_n] = (SCALES['marko-idle-2'][0], 'feet')
for _n in ('milos-run', 'milos-jump'):   # in the air or between strides the body holds still and the feet move, as marko-run and marko-jump
    if _have(_n) and 'marko-idle-2' in SCALES:
        SCALES[_n] = (SCALES['marko-idle-2'][0], 'torso')
for _n in ('vila-strela', 'vila-pada', 'vila-bere'):
    if _have(_n) and 'vila-let' in SCALES:
        SCALES[_n] = SCALES['vila-let']
for _n in ('marko-dremlje', 'milos-jase', 'milos-galop', 'milos-strela'):
    if _have(_n) and 'marko-mounted-attack' in SCALES:
        SCALES[_n] = (RIDE_W / float(np.median([_width(c) for c in _cells(_n)])), 'center')
# DOPUNA-50 („Uroš i Mrnjavčevići”): King Vukašin is as tall as Marko (his body 380 px against Marko's 383); the strike stands
# on its feet, the run holds the body and moves the feet, as marko-run.
if _have('vukasin-udara') and 'marko-idle-2' in SCALES:
    SCALES['vukasin-udara'] = (SCALES['marko-idle-2'][0], 'feet')
if _have('vukasin-trci') and 'marko-idle-2' in SCALES:
    SCALES['vukasin-trci'] = (SCALES['marko-idle-2'][0], 'torso')
# DOPUNA-51 („Marko Kraljević i Filip Madžarin”): Filip a little shorter than Marko (his body ~370 px against Marko's 383), at
# Marko's zoom; he stands on his feet, and in the run the body holds and the feet move, as marko-run.
for _n in ('filip-idle', 'filip-attack', 'filip-hurt', 'filip-death'):   # lying dead, held by his middle (as mladi-turcin-death)
    if _have(_n) and 'marko-idle-2' in SCALES:
        SCALES[_n] = (SCALES['marko-idle-2'][0], 'center' if _n == 'filip-death' else 'feet')
if _have('filip-run') and 'marko-idle-2' in SCALES:
    SCALES['filip-run'] = (SCALES['marko-idle-2'][0], 'torso')
# DOPUNA-52 („Marko Kraljević ukida svadbarinu”): the Kosovo maiden, smaller than Marko (her body ~330 px against his 383),
# at Marko's zoom; she stands on her feet, and walking the body holds and the feet move.
if _have('kosovka-idle') and 'marko-idle-2' in SCALES:
    SCALES['kosovka-idle'] = (SCALES['marko-idle-2'][0], 'feet')
if _have('kosovka-hoda') and 'marko-idle-2' in SCALES:
    SCALES['kosovka-hoda'] = (SCALES['marko-idle-2'][0], 'torso')
# DOPUNA-54 (Miloš as the playable hero): drawn at Marko's zoom like his D48 clips (his body 380 px against Marko's 383).
# Standing blows, block, crouch and drink stand on the feet; the cut in the air holds the torso (as milos-jump); rolling,
# climbing and lying dead are held by the middle (as marko-roll, marko-climb and filip-death).
for _n, _m in [('milos-niz-2', 'feet'), ('milos-niz-3', 'feet'), ('milos-tezak', 'feet'), ('milos-blok', 'feet'), ('milos-cuci', 'feet'),
               ('milos-pije', 'feet'), ('milos-vazduh', 'torso'), ('milos-kotrlja', 'center'), ('milos-penje', 'center'), ('milos-smrt', 'center')]:
    if _have(_n) and 'marko-idle-2' in SCALES:
        SCALES[_n] = (SCALES['marko-idle-2'][0], _m)
# DOPUNA-55: the sword-bearer's moves for the other foot soldiers. Codex drew each one at the size of the man's frame it was
# given (art/world-pack-03/prepare-dopuna54.py): for the six men of pack 3 that frame was cut from the game at 383/128 px per
# world px (Marko 383 px in a 512 cell), for the others it is their own idle frame 0, so the new clip shares that zoom. Measured:
# every -budi ends as tall as the man's idle within 3 %. (Measuring by height made the climbers, with an arm up, 15-20 % big.)
_UZOR_3D = 128 / 383
def _uzor_zoom(name, who):
    if _have(name) and f'{who}-idle' in SCALES:
        SCALES[name] = (_UZOR_3D if who in ('sword', 'shield', 'archer', 'akindzija', 'oklopnik', 'palikuca') else SCALES[f'{who}-idle'][0], 'feet')
for _who in ['kopljanik', 'akindzija', 'palikuca', 'oklopnik']:
    _uzor_zoom(f'{_who}-spava', _who)
    _uzor_zoom(f'{_who}-budi', _who)
for _who in ['shield', 'kopljanik', 'akindzija', 'palikuca']:
    _uzor_zoom(f'{_who}-climb', _who)
for _who in ['shield', 'kopljanik', 'akindzija', 'palikuca', 'oklopnik']:
    _uzor_zoom(f'{_who}-tiho-pada', _who)
for _n in ['pas-jump', 'pas-omamljen', 'djemo-jump']:
    _ref = _n.split('-')[0] + '-idle'
    if _have(_n) and _ref in SCALES:
        SCALES[_n] = (SCALES[_ref][0], 'feet')
if _have('arapin-omamljen') and 'arapin-idle' in SCALES:   # staggering bent over: his idle less the stoop, as the others' -omamljen
    SCALES['arapin-omamljen'] = (_road('arapin-idle') * .95 / float(np.median([body_height(c) for c in _cells('arapin-omamljen')])), 'feet')
for _n, _ref in [('pas-drugi', 'pas-attack'), ('archer-drugi', 'archer-kick'), ('palikuca-drugi', 'palikuca-torch'), ('tufekdzija-drugi', 'tufekdzija-butt')]:
    if _have(_n) and _ref in SCALES:   # the second blow ends in the stance the first one ends in (the rule of the other -drugi clips)
        SCALES[_n] = (SCALES[_ref][0] * body_height(_cells(_ref)[-1]) / body_height(_cells(_n)[-1]), 'feet')
# DOPUNA-56: a standing horse is measured by height, hooves to ears or to the rider's head (a galloping horse is longer, so the
# width of mounted-run would make him too big). Šarac standing: his first, neutral frame as tall as the still Šarac (cast/sarac).
# Marko on Šarac standing still as tall as in the standing frame of mounted-jump; mounting ends in that same seat.
# Miloš's bay (no rider) as long as the horse under Miloš in milos-jase.
# The whole picture is measured, ears or rider's head to hooves (body_height skips the narrow top rows, which here are the
# rider's head and differ from drawing to drawing).
def _full_h(cell):
    r_ = np.where((cell[:, :, 3] > SOLID).any(1))[0]
    return int(r_[-1] + 1 - r_[0])
if _have('sarac-stoji') and 'cast/sarac' in SCALES:
    _h = _full_h(np.array(Image.open(os.path.join(ROOT, 'cast/sarac.png')).convert('RGBA'))) * SCALES['cast/sarac'][0]
    SCALES['sarac-stoji'] = (_h / _full_h(_cells('sarac-stoji')[0]), 'center')
_SEAT = _full_h(_cells('mounted-jump')[0]) * SCALES['mounted-jump'][0] if 'mounted-jump' in SCALES else None
if _have('mounted-idle') and _SEAT:
    SCALES['mounted-idle'] = (_SEAT / float(np.median([_full_h(c) for c in _cells('mounted-idle')])), 'center')
if _have('marko-uzjase') and _SEAT:
    SCALES['marko-uzjase'] = (_SEAT / _full_h(_cells('marko-uzjase')[-1]), 'center')
if _have('milos-konj') and 'milos-jase' in SCALES:
    _w = float(np.median([_width(c) for c in _cells('milos-jase')])) * SCALES['milos-jase'][0]
    SCALES['milos-konj'] = (_w / float(np.median([_width(c) for c in _cells('milos-konj')])), 'center')
# marko-uzjase is drawn wider (Marko beside the horse), so the centre of its picture is not the horse's: the anchor is moved so
# its front hoof stands where mounted-idle's does (measured: 48.1 against 41.9 world px), applied after ANCHOR_FIX below.
NOC_ANCHOR_FIX = {'marko-uzjase': 17.7}
# DOPUNA-57/58 (15. 11.): each clip was drawn as an edit of its model's frame 0 at that frame's size and place in the cell
# (Šarac from sarac-stoji, the sorcerer from vrac-idle, Kosovka from kosovka-idle, Đemo from djemo-idle, Vukašin from
# vukasin-udara), so it shares that clip's zoom. Where the figure leaves its standing outline (the horse rears, lies down,
# the maiden kneels, the old man falls) the median centre of the clip would move him aside, so those take the anchor of
# the clip they were drawn from (NOC_ANCHOR_SAME, applied after the anchors are measured).
for _n in ('sarac-pije', 'sarac-lupa', 'sarac-propinje', 'sarac-boli', 'sarac-pada', 'sarac-hod'):
    if _have(_n) and 'sarac-stoji' in SCALES:
        SCALES[_n] = SCALES['sarac-stoji']
for _n, _m in (('vrac-stap', 'feet'), ('vrac-smrt', 'center')):   # vrac-idle is set below (DOPUNA-45) at the sword-bearer's zoom
    if _have(_n) and 'sword-idle' in SCALES:
        SCALES[_n] = (SCALES['sword-idle'][0], _m)
if _have('vukasin-stoji') and 'marko-idle-2' in SCALES:
    SCALES['vukasin-stoji'] = (SCALES['marko-idle-2'][0], 'feet')
if _have('kosovka-poji') and 'kosovka-idle' in SCALES:
    SCALES['kosovka-poji'] = (SCALES['kosovka-idle'][0], 'feet')
if _have('djemo-omamljen') and 'djemo-idle' in SCALES:
    SCALES['djemo-omamljen'] = (SCALES['djemo-idle'][0], 'feet')
# DOPUNA-61 (15. 11.): Marko on the summit of Urvina, each clip an edit of marko-idle-2 frame 0 at its size and place in the cell,
# so at Marko's zoom and with the anchor of marko-idle-2 (he kneels, digs, lies down, and stays where he stood).
for _n in ('marko-nad-bunarom', 'marko-oprasta', 'marko-kopa', 'marko-lomi-sablju', 'marko-lomi-koplje', 'marko-baca-topuz', 'marko-lezi'):
    if _have(_n) and 'marko-idle-2' in SCALES:
        SCALES[_n] = (SCALES['marko-idle-2'][0], 'feet')
if _have('milos-pada-s-konja') and 'milos-jase' in SCALES:   # drawn from milos-jase frame 0, the bay standing where it stood
    SCALES['milos-pada-s-konja'] = SCALES['milos-jase']
NOC_ANCHOR_SAME = {'sarac-pije': 'sarac-stoji', 'sarac-lupa': 'sarac-stoji', 'sarac-propinje': 'sarac-stoji', 'sarac-boli': 'sarac-stoji',
                   'sarac-pada': 'sarac-stoji', 'sarac-hod': 'sarac-stoji', 'vrac-stap': 'vrac-idle', 'vrac-smrt': 'vrac-idle',
                   'kosovka-poji': 'kosovka-idle', 'milos-pada-s-konja': 'milos-jase',
                   **{_n: 'marko-idle-2' for _n in ('marko-nad-bunarom', 'marko-oprasta', 'marko-kopa', 'marko-lomi-sablju', 'marko-lomi-koplje', 'marko-baca-topuz', 'marko-lezi')}}
# DOPUNA-63 (16. 11.): Marko without his mace after he throws it into the sea, each an edit of the clip it replaces (marko-walk and
# marko-idle-2, frame 0), so at that clip's zoom and anchor: he walks and stands exactly where the clip with the mace had him
if _have('marko-hod-bez-topuza') and 'marko-walk' in SCALES:
    SCALES['marko-hod-bez-topuza'] = (SCALES['marko-walk'][0], 'feet')
    NOC_ANCHOR_SAME['marko-hod-bez-topuza'] = 'marko-walk'
if _have('marko-stoji-bez-topuza') and 'marko-idle-2' in SCALES:
    SCALES['marko-stoji-bez-topuza'] = (SCALES['marko-idle-2'][0], 'feet')
    NOC_ANCHOR_SAME['marko-stoji-bez-topuza'] = 'marko-idle-2'
# DOPUNA-64 (17. 11.): the archer who looses his rain of arrows upward, an edit of archer-idle at its size in the game; frame 0
# stands like archer-idle frame 0, so the body is measured against it
if _have('archer-uvis') and 'archer-idle' in SCALES:
    SCALES['archer-uvis'] = (SCALES['archer-idle'][0] * body_height(_cells('archer-idle')[0]) / body_height(_cells('archer-uvis')[0]), 'feet')
NOC_ANCHOR_AT = {}
# DOPUNA-65 (18. 11.): the first pohod, Kosovsko selo. The bashi's leap is an edit of kopljanik-basa-idle frame 0 as it lies on
# the sheet, so at that clip's zoom and anchor. Marko listening (both hands on the mace, its head on the ground), Marko taking a
# horse by the tail, the mother with her child who waves and the old man who bows are edits of their model's frame 0 at its size
# in the game: frame 0 stands like the model's frame 0, so the body is measured against it, and they stay where the model stands.
if _have('kopljanik-basa-jump') and 'kopljanik-basa-idle' in SCALES:
    SCALES['kopljanik-basa-jump'] = (SCALES['kopljanik-basa-idle'][0], 'feet')
    NOC_ANCHOR_SAME['kopljanik-basa-jump'] = 'kopljanik-basa-idle'
for _n, _m in (('marko-slusa', 'marko-idle-2'), ('marko-hvata-rep', 'marko-idle-2'), ('putnica-pozdrav', 'putnica-idle'), ('putnik-starac-klanja', 'putnik-starac-idle'),
               ('marko-daje', 'marko-idle-2')):   # DOPUNA-66: Marko holds out a handful of ducats
    if _have(_n) and _m in SCALES:
        SCALES[_n] = (SCALES[_m][0] * body_height(_cells(_m)[0]) / body_height(_cells(_n)[0]), 'feet')
        NOC_ANCHOR_AT[_n] = 256   # the model was set into the cell with its anchor at the middle (prepare-dopuna57.rig_frame)
# DOPUNA-66 (18. 11.): a village hen, drawn large (about 240 px) for its detail; in the game it stands 24 units high, a fifth of Marko
if _have('kokoska-kljuca'):
    SCALES['kokoska-kljuca'] = (24 / _full_h(_cells('kokoska-kljuca')[0]), 'feet')
# DOPUNA-67/68 (18. 11., the third round): fear and flight. Each soldier starts back (<type>-uplasen) and runs looking over his
# shoulder (<type>-bezi), edits of his idle frame 0 as it lies on the sheet: his idle's zoom and anchor.
for _t in ('sword', 'archer', 'akindzija', 'kopljanik', 'shield', 'palikuca', 'tufekdzija', 'pas'):
    for _c in ('uplasen', 'bezi'):
        _n = f'{_t}-{_c}'
        if _have(_n) and f'{_t}-idle' in SCALES:
            SCALES[_n] = (SCALES[f'{_t}-idle'][0], 'feet')
            NOC_ANCHOR_SAME[_n] = f'{_t}-idle'
# DOPUNA-69: the duel of Kosovsko selo. The bashi charges, tugs at his spear stuck in the hay, beats off the bees, blows his
# horn, stands dazed: edits of kopljanik-basa-idle frame 0, at its zoom and anchor. The swarm of bees is about 70 units high.
for _c in ('juris', 'zaglavljen', 'pcele', 'poziv', 'omamljen'):
    _n = 'kopljanik-basa-' + _c
    if _have(_n) and 'kopljanik-basa-idle' in SCALES:
        SCALES[_n] = (SCALES['kopljanik-basa-idle'][0], 'feet')
        NOC_ANCHOR_SAME[_n] = 'kopljanik-basa-idle'
if _have('fx-pcele'):
    SCALES['fx-pcele'] = (0.33, 'center')
# DOPUNA-72: the weapons a frightened man throws down, seven different things in one strip, at the size the soldiers carry them.
if _have('oruzje-na-zemlji') and 'sword-idle' in SCALES:
    SCALES['oruzje-na-zemlji'] = (SCALES['sword-idle'][0], 'feet')
    NOC_ANCHOR_AT['oruzje-na-zemlji'] = 256   # each thing lies in the middle of its cell
# DOPUNA-74: Marko drinks from the bucket at the well and takes a loaf from the stall (edits of marko-idle-2 at its size in
# the game, like marko-daje); the villager who cheers is a new figure drawn at the size of the game (350 px for 117 units).
for _n in ('marko-pije-vodu', 'marko-uzima'):
    if _have(_n) and 'marko-idle-2' in SCALES:
        SCALES[_n] = (SCALES['marko-idle-2'][0] * body_height(_cells('marko-idle-2')[0]) / body_height(_cells(_n)[0]), 'feet')
        NOC_ANCHOR_AT[_n] = 256
for _n in ('seljak-idle', 'seljak-klice'):
    if _have(_n):
        SCALES[_n] = (128 / 383, 'feet')
if _have('seljak-klice') and _have('seljak-idle'):
    NOC_ANCHOR_SAME['seljak-klice'] = 'seljak-idle'
# DOPUNA-76..80 (18. 11., the fourth round). Each clip is an edit of its model's frame 0 as it lies on the sheet, so it takes
# that clip's zoom and anchor: the bashi's new moves (the whirl, the thrust from above, the spear in the ground, the shield, the
# rage), the vila struck, beaten, begging, rising and singing, Marko awake in the saddle at a walk, Šarac's new step, Miloš
# singing, struck, and walking.
for _n, _m in [('kopljanik-basa-' + _c, 'kopljanik-basa-idle') for _c in ('vitlo', 'ubod-odozgo', 'u-zemlji', 'stit', 'bes')] + \
        [('vila-' + _c, 'vila-let') for _c in ('pogodjena', 'udarena', 'moli', 'ustaje', 'peva')] + \
        [('mounted-hod', 'mounted-idle'), ('sarac-hod-2', 'sarac-stoji'), ('milos-peva', 'milos-jase'), ('milos-pogodjen', 'milos-jase'), ('milos-hod', 'milos-idle')]:
    if _have(_n) and _m in SCALES:
        SCALES[_n] = (SCALES[_m][0], 'feet')
        NOC_ANCHOR_SAME[_n] = _m
# on her knees the vila was painted a fifth larger than in flight (measured on the board against vila-ustaje, whose first
# frames kneel at the flying size)
for _n in ('vila-udarena', 'vila-moli'):
    if _n in SCALES:
        SCALES[_n] = (SCALES[_n][0] * .8, 'feet')
# Marko's backhand (K J) and his two poses for the menu, at his size in the game: measured on a frame in which he stands
for _n, _i in (('marko-povratni', -1), ('marko-odmerava', 0), ('marko-raduje', 0)):
    if _have(_n) and 'marko-idle-2' in SCALES:
        SCALES[_n] = (SCALES['marko-idle-2'][0] * body_height(_cells('marko-idle-2')[0]) / body_height(_cells(_n)[_i]), 'feet')
        NOC_ANCHOR_AT[_n] = 256
# the doe of Miroč, about 75 units to the ears (the five herbs the vila gathers are a world picture: assets/world/bilje-miroc.webp)
for _n in ('srna-pase', 'srna-bezi'):
    if _have(_n):
        SCALES[_n] = (0.27, 'feet')
# DOPUNA-81..85 (18. 11., the fifth round): the next pohodi. Each clip is an edit of its model's frame 0 as it lies on the
# sheet, so it takes that model's zoom and anchor: the Hunter (lunge, jump, daze, rage), the Executioner (the axe buried, the
# whirl, the leap, the rage, the daze), Hasan-aga (lunge, jump, the mace to the ground, rage, daze), the young Turk with the
# father's sabre (asleep, waking, lunge, jump), the archer on a ladder, the armoured man's level blow.
D81_MODEL = {
  "lovac-aga-lunge": "lovac-aga-idle",
  "lovac-aga-jump": "lovac-aga-idle",
  "lovac-aga-omamljen": "lovac-aga-idle",
  "lovac-aga-bes": "lovac-aga-idle",
  "dzelat-zabio": "dzelat-idle",
  "dzelat-vitla": "dzelat-idle",
  "dzelat-skok": "dzelat-idle",
  "dzelat-bes": "dzelat-idle",
  "dzelat-omamljen": "dzelat-idle",
  "hasan-aga-lunge": "hasan-aga-idle",
  "hasan-aga-jump": "hasan-aga-idle",
  "hasan-aga-tresak": "hasan-aga-idle",
  "hasan-aga-bes": "hasan-aga-idle",
  "hasan-aga-omamljen": "hasan-aga-idle",
  "mladi-turcin-spava": "mladi-turcin-idle",
  "mladi-turcin-budi": "mladi-turcin-idle",
  "mladi-turcin-lunge": "mladi-turcin-idle",
  "mladi-turcin-jump": "mladi-turcin-idle",
  "archer-climb": "archer-idle",
  "oklopnik-attack": "oklopnik-idle"
 }
for _n, _m in D81_MODEL.items():
    if _have(_n) and _m in SCALES:
        SCALES[_n] = (SCALES[_m][0], 'feet')
        NOC_ANCHOR_SAME[_n] = _m
# the young Turk asleep was painted sitting as tall as he stands: a sitting soldier is 0.69 of his standing height (sword-spava)
# waking (D86, ordered again: the D84 one was cut off) starts sitting at that size and stands at his own
if 'mladi-turcin-spava' in SCALES:
    SCALES['mladi-turcin-spava'] = (SCALES['mladi-turcin-spava'][0] * .69, 'feet')
# DOPUNA-91..92 (18. 11., the sixth round): the golden janissaries of Oranje (the trio, look 'zlatni-janicar') and the people at
# work on Manastirski vis and in the fields of Oranje (a monk praying, a monk at the bell rope, a reaper, a reaper carrying a
# sheaf, a mower). Each is an edit of its model's frame 0, so it takes that model's zoom and anchor.
D91_MODEL = {
  "zlatni-janicar-idle": "sword-idle",
  "zlatni-janicar-run": "sword-idle",
  "zlatni-janicar-attack": "sword-idle",
  "zlatni-janicar-lunge": "sword-idle",
  "zlatni-janicar-hurt": "sword-idle",
  "zlatni-janicar-death": "sword-idle",
  "zlatni-janicar-jump": "sword-idle",
  "zlatni-janicar-omamljen": "sword-idle",
  "putnik-kaluder-moli": "putnik-kaluder-idle",
  "putnik-kaluder-zvoni": "putnik-kaluder-idle",
  "zetelica-zanje": "putnica-idle",
  "zetelica-nosi": "putnica-idle",
  "kosac-kosi": "seljak-idle"
 }
for _n, _m in D91_MODEL.items():
    if _have(_n) and _m in SCALES:
        SCALES[_n] = (SCALES[_m][0], 'feet')
        NOC_ANCHOR_SAME[_n] = _m
# DOPUNA-94..96 (18. 11., Pod Varadinom, „Marko Kraljević i Vuča dženeral”): Vuča dženeral on his bedevija (the akindžija beg's
# moves, look 'vuca'), the katane (the sabre-man's moves, look 'katana'), and the people of the song drawn at Miloš's measure:
# Velimirovica, old Toplica, Kosančić Ivan and the post-carrier. Each is an edit of its model's frame 0.
D94_MODEL = {f"vuca-{k}": f"beg-{k}" for k in ['idle', 'mounted', 'mounted-strike', 'unhorsed', 'run', 'attack', 'hvata', 'hurt', 'death']}
D94_MODEL.update({f"katana-{k}": "sword-idle" for k in ['idle', 'run', 'attack', 'lunge', 'hurt', 'death', 'jump', 'omamljen']})
D94_MODEL.update({"mounted-ritne": "mounted-idle"})
D94_MODEL.update({c: "milos-idle" for c in ['posmatrac-seljanka', 'posmatrac-decak', 'posmatrac-starica', 'posmatrac-ribar', 'posmatrac-gradjanin']})   # D102 onlookers
D94_MODEL.update({c: "sword-idle" for c in ['katana-gard', 'katana-gard-slomljen']})   # D102 the katana's guard   # D98: Šarac kicks with his hind legs (drawn at 0.90, given back below)
D94_MODEL.update({c: "milos-idle" for c in ['velimirovica-idle', 'velimirovica-bezi', 'toplica-idle', 'kosancic-idle', 'knjigonosa-idle', 'knjigonosa-poklon']})
for _n, _m in D94_MODEL.items():
    if _have(_n) and _m in SCALES:
        SCALES[_n] = (SCALES[_m][0] / (.90 if _n == 'mounted-ritne' else 1), SCALES[_m][1] if _m.startswith('beg-') else 'feet')
        if _n != 'mounted-ritne':
            NOC_ANCHOR_SAME[_n] = _m
# ===== end of the noc-poliranje block =====

# DOPUNA-45: Marko's powers at the zoom of marko-idle-2 (in the air anchored at the torso, like marko-jump); the new foes at the
# sword-bearer's zoom, the falcon like soko-let, the skeleton like kostur-stoji, and Ala by her height (two Markos).
for name in ['marko-krilo', 'marko-nalet', 'marko-nalet-kraj', 'marko-air-3', 'marko-kuka-let', 'marko-zid-trk', 'marko-zid-trk-vodoravno']:
    if _have(name) and 'marko-idle-2' in SCALES:
        SCALES[name] = (SCALES['marko-idle-2'][0], 'torso')
for name in ['marko-trag-ostavi', 'marko-trag-povratak', 'marko-kuka-baci', 'marko-odmor', 'marko-odmor-ustaje', 'marko-klizanje', 'marko-launcher',
             'marko-lanac-vuce', 'marko-lanac-trgne', 'marko-potres', 'marko-zvizduk', 'marko-oko']:   # DOPUNA-46 too
    if _have(name) and 'marko-idle-2' in SCALES:
        SCALES[name] = (SCALES['marko-idle-2'][0], 'feet')
# DOPUNA-100: Šarac held by the tail at the fair (bracing) and a riderless kick; drawn smaller than sarac-stoji: as tall as he is
if _have('sarac-stoji') and 'sarac-stoji' in SCALES:
    _h_sarac = body_height(_cells('sarac-stoji')[0]) * SCALES['sarac-stoji'][0]
    for _n in ['sarac-rep-upire', 'sarac-ritne']:
        if _have(_n):
            SCALES[_n] = (_h_sarac / body_height(_cells(_n)[0]), 'feet')
# DOPUNA-101: Šarac turns round under Marko (cut from Terra's third attempt): as tall as mounted-idle
if _have('mounted-okret') and 'mounted-idle' in SCALES:
    SCALES['mounted-okret'] = (SCALES['mounted-idle'][0] * body_height(_cells('mounted-idle')[0]) / body_height(_cells('mounted-okret')[0]), 'feet')
# DOPUNA-97: Marko on the ground gives Šarac wine, then drinks (cut from Terra's grids at a size of their own): as tall in the
# game as the seated Marko of marko-odmor's last frame
if _have('marko-odmor') and 'marko-odmor' in SCALES:
    _h_sedi = body_height(_cells('marko-odmor')[-1]) * SCALES['marko-odmor'][0]
    for _n in ['marko-sedi-poji', 'marko-sedi-pije']:
        if _have(_n):
            SCALES[_n] = (_h_sedi / body_height(_cells(_n)[0]), 'feet')
if _have('sarac-galop') and 'mounted-run' in SCALES:   # DOPUNA-46: Šarac alone, the horse of mounted-run
    SCALES['sarac-galop'] = (SCALES['mounted-run'][0], 'center')
for name in ['soko-pogodjen', 'soko-pad']:
    if _have(name) and 'soko-let' in SCALES:
        SCALES[name] = (SCALES['soko-let'][0], 'center')
for name in ['kostur-napad', 'kostur-hurt']:
    if _have(name) and 'kostur-stoji' in SCALES:
        SCALES[name] = (SCALES['kostur-stoji'][0], 'feet')
for name in ['vrac-idle', 'vrac-carolija', 'vrac-nestaje', 'vrac-pojavljuje', 'vrac-hurt', 'vrac-death', 'sarka-puzi', 'sarka-napad', 'sarka-death']:
    if _have(name) and 'sword-idle' in SCALES:
        SCALES[name] = (SCALES['sword-idle'][0], 'feet')
# vrac-pojavljuje came drawn a third larger in its cells than vrac-idle: the old man whole again (its last frame) at his idle height
if _have('vrac-pojavljuje') and _have('vrac-idle') and 'vrac-idle' in SCALES:
    SCALES['vrac-pojavljuje'] = (SCALES['vrac-idle'][0] * float(np.median([body_height(c) for c in _cells('vrac-idle')]))
                                 / body_height(_cells('vrac-pojavljuje')[-1]), 'feet')
if _have('ala-let'):
    s_ = 250 / max(body_height(c) for c in _cells('ala-let'))
    for k in ['let', 'obrusavanje', 'oluja', 'hurt', 'pad']:
        if _have('ala-' + k):
            SCALES['ala-' + k] = (s_, 'center')

rig = {}
for name, (scale, mode) in SCALES.items():
    if name.startswith('cast/'):
        image = name + '.png'
        im = np.array(Image.open(os.path.join(ROOT, image)).convert('RGBA'))
        cells = [{'x': 0, 'y': 0, 'w': im.shape[1], 'h': im.shape[0]}]
    else:
        image = name + '.png'
        manifest = json.load(open(os.path.join(ROOT, name + '.json'), encoding='utf-8-sig'))
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

# A champion's grapple ending keeps the anchor of its loop: Marko stays where he stood while he throws the man
# (the feet of the man lying on the ground would otherwise pull the anchor aside and the pair would jump).
if 'marko-dize-ralo' in rig:  # Marko's feet, not the middle of the team
    rig['marko-dize-ralo']['anchor'] = 270.0
for kit in list(KOSTAC_LIK) + ['ledja', 'akindzija', 'kopljanik']:
    loop, end = f'kostac-{kit}', f'kostac-{kit}-kraj'
    if loop in rig and end in rig:
        rig[end]['anchor'] = rig[loop]['anchor']

# DOPUNA-45: the torso of a new drawing lands where the torso of the clips around it is (the median of a whole clip is pulled
# aside by a cloak spread like wings or a leg slid far forward), measured on the frames where one clip hands over to the next.
ANCHOR_FIX = {"marko-krilo": 36.1, "marko-air-3": -68.6, "marko-klizanje": -163.5, "marko-nalet-kraj": 21.1, "marko-trag-ostavi": 9.1, "marko-kuka-baci": -14.5, "marko-kuka-let": 28.8, "marko-zid-trk": 18.7, "marko-odmor": 10.5, "marko-odmor-ustaje": 18.7, "marko-potres": -6.4, "marko-lanac-trgne": -9.4, "marko-zvizduk": 14.0, "marko-oko": -6.6, "marko-zid-trk-vodoravno": -24.1, "marko-launcher": 25.3}
for name, d in ANCHOR_FIX.items():
    if name in rig:
        rig[name]['anchor'] = round(rig[name]['anchor'] + d, 1)
for name, d in NOC_ANCHOR_FIX.items():   # the noc-poliranje block's own (see there)
    if name in rig:
        rig[name]['anchor'] = round(rig[name]['anchor'] + d, 1)
for name, src in NOC_ANCHOR_SAME.items():   # the noc-poliranje block's own (see there)
    if name in rig and src in rig:
        rig[name]['anchor'] = rig[src]['anchor']
for name, x in NOC_ANCHOR_AT.items():   # the noc-poliranje block's own (see there)
    if name in rig:
        rig[name]['anchor'] = x
# The launcher (Lost Crown, W+K) has no drawing of its own yet: it is the cut upward, the same sheet and frames.
for alias, src in {'marko-launcher': 'marko-uppercut'}.items():
    if alias not in rig and src in rig:
        rig[alias] = rig[src]

with open(os.path.join(ROOT, 'sprite-rig.json'), 'w') as f:
    json.dump(rig, f, separators=(',', ':'))
print('wrote', os.path.join(ROOT, 'sprite-rig.json'))
