"""In-between frames for the sprite clips, computed locally (no drawing credits): python smooth-anims.py [clip ...]

For each pair of frames the game shows one after the other, the script measures how the picture moves (dense optical flow,
OpenCV DIS) and warps both frames toward each other, three times: a quarter, half and three quarters of the way. So every
drawn step gets three in-betweens. A pair whose two warped halves disagree too much (a limb that crosses the body, a pose
change the flow cannot follow), or whose in-between comes out see-through (a double image), gets none: the game then simply
holds the drawn frame there, as before.

Every clip of the rig gets them, except the skeleton variants (SKIP). The pairs are the neighbours (0-1, 1-2, ...; and the last
back to the first for a looping clip) plus the steps of the idle sequences the game plays out of order (FOE_IDLE, IDLE_SEQ and
SHOULDER_SEQ, read from dist/game.js; a champion's idle borrows the soldiers' sequences). A pair works both ways: the game reads
it backwards when a sequence steps down.

The two frames are aligned on their soles first, the way the game places them, so the in-between is where the eye expects it.
Each in-between is cut to the figure and stored at about the size the game ever draws it (k <= 1), so the sheets stay small:
  dist/assets/smooth/<clip>.webp    the half-way in-betweens (the only ones loaded on quality tier 2)
  dist/assets/smooth/<clip>-q.webp  the quarter and three-quarter ones
  dist/assets/sprite-smooth.json    {clip: {image, imageQ, k, loop, mids: {"a-b": [r25, r50, r75]}}}, r = [x, y, w, h, dx, dy]:
                                    the rect in its sheet and the offset of its top-left from the clip's anchor and the sole of
                                    frame a, in pixels of the drawn sheet
It never touches sprite-rig.json or the drawn sheets.

  python smooth-anims.py                    every clip in CLIPS
  python smooth-anims.py marko-run pas-run  just these (the others in the json stay as they are)
  python smooth-anims.py --sheet <clip> <out.jpg>   a contact sheet for the eye: per pair a, 1/4, 1/2, 3/4, b
  python smooth-anims.py --report           the table of clips, frames and in-betweens
"""
import json, os, re, sys
from concurrent.futures import ProcessPoolExecutor
import numpy as np
import cv2

ROOT = os.path.dirname(os.path.abspath(__file__))
A = os.path.join(ROOT, 'dist', 'assets')
RIG = json.load(open(os.path.join(A, 'sprite-rig.json'), encoding='utf-8'))
OUT = os.path.join(A, 'smooth')
META = os.path.join(A, 'sprite-smooth.json')
TS = (0.25, 0.5, 0.75)
MAX_ERR = float(os.environ.get('SMOOTH_MAX_ERR', '0.13'))     # mean disagreement (0..1) of the two warped halves, over the pixels either covers
MAX_GHOST = float(os.environ.get('SMOOTH_MAX_GHOST', '0.06'))  # extra see-through area of an in-between over its two drawn frames
# the most screen pixels a pixel of the drawn sheet ever gets: the 1920-wide layer of tier 0 (1920/1280 * 1.15 zoom), and a
# champion or elite drawn a little larger
DISPLAY = 1920 / 1280 * 1.15 * 1.15

# ---------- which clips ----------
# Marko: everything he does on foot and on Šarac. The finishing blows are cinematic and short; they get in-betweens too.
MARKO_LOOP = ['marko-run', 'marko-walk', 'marko-idle', 'marko-idle-2', 'marko-crouch-walk', 'marko-block-walk', 'marko-charge-walk',
              'marko-drink-walk', 'marko-call-walk', 'marko-wounded-walk', 'marko-dizzy', 'marko-climb', 'marko-hang', 'marko-wallslide',
              'marko-push', 'marko-teeter', 'marko-vihor', 'marko-charge-hold', 'marko-fall', 'mounted-run',
              'marko-sablja-idle', 'marko-sablja-trci']
MARKO_ONCE = ['marko-attack', 'marko-combo-1', 'marko-combo-2', 'marko-combo-3', 'marko-combo-4', 'marko-charged', 'marko-super',
              'marko-counter', 'marko-run-attack', 'marko-air-1', 'marko-air-2', 'marko-uppercut', 'marko-dash-strike',
              'marko-mounted-attack', 'marko-jump', 'marko-jump-rise', 'marko-run-jump', 'marko-land', 'marko-roll', 'marko-roll-land',
              'marko-block', 'marko-block-hit', 'marko-crouch', 'marko-drink', 'marko-hurt', 'marko-hurt-air', 'marko-death',
              'marko-knockdown', 'marko-getup', 'marko-turn', 'marko-run-start', 'marko-run-stop', 'marko-combo-recover', 'marko-ledge',
              'marko-walljump', 'marko-plunge', 'marko-kick', 'marko-slide', 'marko-lever', 'marko-throw', 'marko-crouch-throw',
              'marko-pickup', 'marko-call', 'marko-open', 'marko-victory', 'marko-idle-3', 'marko-idle-4', 'marko-blasted', 'mounted-jump',
              'marko-finisher', 'marko-finisher-smash', 'marko-finisher-throw', 'marko-finisher-stomp', 'marko-finisher-legs',
              'marko-finisher-skull', 'marko-brutal', 'marko-tiho',
              'marko-sablja-izvlaci', 'marko-sablja-vraca', 'marko-sablja-udarac-1', 'marko-sablja-udarac-2', 'marko-sablja-udarac-3',
              'marko-sablja-skok', 'marko-sablja-tezak', 'marko-sablja-ubod', 'marko-sablja-uvis']
# the soldiers of the pohodi and the dog; Musa
FOES = ['sword', 'shield', 'archer', 'akindzija', 'oklopnik', 'palikuca', 'kopljanik', 'tufekdzija', 'pas']
FOE_LOOP = ['run', 'idle', 'walk', 'climb', 'burn']
FOE_ONCE = ['attack', 'shoot', 'shoot-down', 'hurt', 'death', 'jump', 'launch', 'lunge', 'bash', 'kick', 'spin', 'butt', 'sweep', 'bomb',
            'charge', 'torch', 'fire', 'guardbreak', 'armorbreak', 'backstep', 'slam', 'rush', 'grab']
MUSA_LOOP = ['musa-run', 'musa-idle', 'musa-mounted']
MUSA_ONCE = ['musa-attack', 'musa-hurt', 'musa-death', 'musa-mounted-strike', 'musa-sword', 'musa-grab', 'musa-throw-up', 'musa-stomp',
             'musa-roar', 'musa-block']
MAIN_LOOPS = MARKO_LOOP + [f + '-' + c for f in FOES for c in FOE_LOOP] + MUSA_LOOP
ONCE = MARKO_ONCE + [f + '-' + c for f in FOES for c in FOE_ONCE] + MUSA_ONCE
# Everything else the rig has: champions, travellers, the fairy, birds, fire, grapples, sleeping and waking, finishing blows.
# Their frame counters loop or stop at the last frame; the last-to-first pair is computed for all of them (a clip that stops
# at its last frame never asks for it).
SKIP = {'kosturi'}   # not an animation: each frame is another skeleton, picked by the kind of soldier
# the same sheet under another name (build-sprite-rig.py), until the clip gets its own drawing: the same in-betweens
ALIASES = {a: b for a, b in {'marko-launcher': 'marko-uppercut'}.items() if a in RIG and b in RIG and RIG[a]['image'] == RIG[b]['image']}
SKIP |= set(ALIASES)
EXTRA = [c for c in RIG if c not in MAIN_LOOPS and c not in ONCE and c not in SKIP and not c.startswith('cast/')]
LOOPS = MAIN_LOOPS + EXTRA
# a champion's look borrows the idle sequence of the soldier it stands for
LOOKS = ['hasan-aga', 'beg', 'ognjeni-aga', 'bajraktar', 'janicarski-aga', 'basa', 'lovac-aga', 'kopljanik-basa', 'mladi-turcin', 'caus']
CLIPS = [c for c in MAIN_LOOPS + ONCE + EXTRA if c in RIG and len(RIG[c]['frames']) > 1]


def sequences():
    """The out-of-order idle sequences of dist/game.js: {clip: [frame, ...]} (each plays in a loop)."""
    src = open(os.path.join(ROOT, 'dist', 'game.js'), encoding='utf-8').read()
    out = {}
    m = re.search(r'FOE_IDLE=\{([^}]*)\}', src)
    if m:
        for k, v in re.findall(r'(\w+):\[([\d,]+)\]', m.group(1)):
            out[k + '-idle'] = [int(x) for x in v.split(',')]
    m = re.search(r'IDLE_SEQ=\[([\d,]+)\]', src)
    if m: out['marko-idle'] = [int(x) for x in m.group(1).split(',')]
    m = re.search(r'SHOULDER_SEQ=\[([\d,]+)\]', src)
    if m: out['marko-idle-3'] = [int(x) for x in m.group(1).split(',')]
    foe = [v for k, v in out.items() if k[:-5] in FOES]
    for look in LOOKS:
        out[look + '-idle'] = [x for q in foe for x in q + [-1]]   # -1 breaks the chain between sequences
    return out


def pairs_of(name, seqs):
    n = len(RIG[name]['frames']); loop = name in LOOPS
    ps = {(i, i + 1) for i in range(n - 1)}
    if loop and n > 2: ps.add((0, n - 1))
    s = seqs.get(name)
    if s:
        for k in range(len(s)):
            a, b = s[k], s[(k + 1) % len(s)]
            if a != b and 0 <= a < n and 0 <= b < n: ps.add((min(a, b), max(a, b)))
    return sorted(ps)


# ---------- the in-between ----------
def cell(img, f):
    x, y, w, h = f[:4]
    return img[y:y + h, x:x + w].astype(np.float32) / 255.0


def shift(c, dy):
    """The cell moved down by dy pixels (up when negative), the edge filled with nothing."""
    if not dy: return c
    M = np.float32([[1, 0, 0], [0, 1, dy]])
    return cv2.warpAffine(c, M, (c.shape[1], c.shape[0]), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=0)


def shift2(c, d):
    """The cell moved by d = (dx, dy) pixels, the edge filled with nothing."""
    M = np.float32([[1, 0, d[0]], [0, 1, d[1]]])
    return cv2.warpAffine(c, M, (c.shape[1], c.shape[0]), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=0)


def centre(c):
    """The centre of the figure (alpha-weighted), (x, y)."""
    al = c[..., 3]; s = al.sum()
    if s <= 0: return np.zeros(2, np.float32)
    ys, xs = np.mgrid[0:al.shape[0], 0:al.shape[1]]
    return np.array([(xs * al).sum() / s, (ys * al).sum() / s], np.float32)


def gray(c):
    # the figure over mid grey, so the outline against emptiness is a feature the flow can follow
    a = c[..., 3:4]
    g = cv2.cvtColor((c[..., :3] * a + 0.5 * (1 - a)).astype(np.float32), cv2.COLOR_BGR2GRAY)
    return (np.clip(g, 0, 1) * 255).astype(np.uint8)


def premul(c):
    pm = c.copy(); pm[..., :3] *= pm[..., 3:4]   # premultiplied, so empty pixels carry no colour
    return pm


def warp(pm, flow, t):
    h, w = flow.shape[:2]
    gx, gy = np.meshgrid(np.arange(w, dtype=np.float32), np.arange(h, dtype=np.float32))
    return cv2.remap(pm, gx + flow[..., 0] * t, gy + flow[..., 1] * t, cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=0)


def semi(alpha):
    """How much of a figure is see-through: soft pixels over solid ones. A double image raises it."""
    solid = (alpha > 0.5).sum()
    return float(((alpha > 0.12) & (alpha < 0.88)).sum()) / max(1, solid)


def betweens(a, b):
    """Three in-betweens of a and b (straight RGBA, 0..1) and, for each, the disagreement and the see-through excess."""
    dis = cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
    dis.setFinestScale(1)
    ga, gb = gray(a), gray(b)
    fab = dis.calc(ga, gb, None)   # where each pixel of a goes in b
    fba = dis.calc(gb, ga, None)
    pa, pb = premul(a), premul(b)
    base = max(semi(a[..., 3]), semi(b[..., 3]))
    out = []
    for t in TS:
        # a pixel of the frame at t comes from a, t of a step back along b->a, and from b, (1-t) of a step back along a->b
        wa = warp(pa, fba, t)
        wb = warp(pb, fab, 1 - t)
        # where the two agree they are blended by t; where they do not (a leg the flow lost) only the nearer frame's warp is
        # kept, so the limb changes once and nothing is ever seen double
        d = cv2.GaussianBlur(np.abs(wa - wb).max(axis=2), (0, 0), 3)
        m = np.clip((d - 0.10) / 0.16, 0, 1)[..., None]
        near = wa if t <= 0.5 else wb
        mid = near * m + (wa * (1 - t) + wb * t) * (1 - m)
        cover = np.maximum(wa[..., 3], wb[..., 3]) > 0.05
        err = float(np.abs(wa - wb)[cover].mean()) if cover.any() else 0.0
        ghost = semi(mid[..., 3]) - base
        alpha = mid[..., 3:4]
        rgb = np.where(alpha > 1e-4, mid[..., :3] / np.maximum(alpha, 1e-4), 0)
        # the blend of two soft edges is softer than either: tighten the alpha a little so the outline stays an outline
        alpha = np.clip((alpha - 0.5) * 1.35 + 0.5, 0, 1)
        out.append((np.dstack([rgb, alpha]), err, ghost))
    return out


def crop(c, k):
    """The figure cut out with a 2 px margin and scaled by k: (rgba uint8, x0, y0) in pixels of the cell."""
    al = c[..., 3]
    ys, xs = np.nonzero(al > 0.02)
    if not len(xs): return None
    x0, x1 = max(0, xs.min() - 2), min(c.shape[1], xs.max() + 3)
    y0, y1 = max(0, ys.min() - 2), min(c.shape[0], ys.max() + 3)
    part = premul(c[y0:y1, x0:x1])
    if k < 1:
        w, h = max(1, round((x1 - x0) * k)), max(1, round((y1 - y0) * k))
        part = cv2.resize(part, (w, h), interpolation=cv2.INTER_AREA)
    a = part[..., 3:4]
    rgb = np.where(a > 1e-4, part[..., :3] / np.maximum(a, 1e-4), 0)
    return (np.clip(np.dstack([rgb, a]), 0, 1) * 255 + 0.5).astype(np.uint8), int(x0), int(y0)


def skyline(sizes, width):
    """Bottom-left skyline packing of (w, h) boxes (1 px apart) into a strip this wide: ([(x, y)], height)."""
    sky = [(0, 0, width)]   # segments (x, y, w) of the top edge
    at = [None] * len(sizes)
    for n in sorted(range(len(sizes)), key=lambda n: (-sizes[n][1], -sizes[n][0])):
        w, h = sizes[n][0] + 1, sizes[n][1] + 1
        best = None
        for s in range(len(sky)):
            x = sky[s][0]
            if x + w > width: break
            y = 0; span = 0; e = s
            while span < w:
                y = max(y, sky[e][1]); span += sky[e][2]; e += 1
            if best is None or (y + h, x) < (best[0] + h, best[1]): best = (y, x)
        y, x = best
        at[n] = (x, y)
        new = []
        for (sx, sy, sw) in sky:   # cut [x, x+w) out of the skyline and lay the box's top there
            if sx + sw <= x or sx >= x + w: new.append((sx, sy, sw)); continue
            if sx < x: new.append((sx, sy, x - sx))
            if sx + sw > x + w: new.append((x + w, sy, sx + sw - x - w))
        new.append((x, y + h, w)); new.sort()
        sky = []
        for seg in new:   # merge neighbours at the same height
            if sky and sky[-1][1] == seg[1] and sky[-1][0] + sky[-1][2] == seg[0]: sky[-1] = (sky[-1][0], seg[1], sky[-1][2] + seg[2])
            else: sky.append(seg)
    return at, max(y + sizes[n][1] for n, (x, y) in enumerate(at))


def pack(items):
    """[(key, img)] -> (sheet, {key: [x, y, w, h]}): the strip width that wastes the least picture."""
    if not items: return np.zeros((1, 1, 4), np.uint8), {}
    sizes = [(im.shape[1], im.shape[0]) for _, im in items]
    area = sum(w * h for w, h in sizes); wmax = max(w for w, _ in sizes) + 1
    best = None
    for width in sorted({max(wmax, int((area * f) ** 0.5)) for f in (0.8, 1, 1.25, 1.6, 2, 2.5, 3.2)} | {wmax}):
        if width > 4096: continue
        at, height = skyline(sizes, width)
        if height > 4096: continue   # a texture side many phones still cap at 4096
        if best is None or width * height < best[0]: best = (width * height, width, height, at)
    _, width, height, pos = best
    at = {key: pos[n] for n, (key, _) in enumerate(items)}
    sheet = np.zeros((max(1, height), width, 4), np.uint8)
    rects = {}
    for key, im in items:
        x, y = at[key]; h, w = im.shape[:2]
        sheet[y:y + h, x:x + w] = im
        rects[key] = [x, y, w, h]
    return sheet, rects


def clip_scale(r):
    return min(1.0, round(r['scale'] * DISPLAY * 20 + 0.49) / 20)


# ---------- drawn in-betweens (DOPUNA-45): <clip>-v2 has 2n-1 frames, the old ones at the even places, new poses between ----------
V2 = os.path.join(ROOT, 'art', 'animation-pack-04', 'assets')


def v2_cells(name):
    d = os.path.join(V2, name + '-v2')
    try:
        man = json.load(open(os.path.join(d, 'manifest.json'), encoding='utf-8'))
        im = cv2.imread(os.path.join(d, 'atlas.png'), cv2.IMREAD_UNCHANGED)
        rows = list(man['frame_layout']['rows'].values())[0]
        return [im[c['y']:c['y'] + c['h'], c['x']:c['x'] + c['w']].astype(np.float32) / 255 for c in rows]
    except Exception:
        return None


def bbox(c):
    ys, xs = np.nonzero(c[..., 3] > 0.3)
    return (xs.min(), ys.min(), xs.max(), ys.max()) if len(xs) else None


def fit(v, x):
    """The zoom and shift that lay drawing v onto x (the same pose, perhaps in another cell or zoom): (s, tx, ty)."""
    bv, bx = bbox(v), bbox(x)
    if bv is None or bx is None: return (1.0, 0.0, 0.0)
    s = (bx[3] - bx[1]) / max(1, bv[3] - bv[1])
    return s, (bx[0] + bx[2]) / 2 - s * (bv[0] + bv[2]) / 2, bx[3] - s * bv[3]


def place(v, f, shape):
    M = np.float32([[f[0], 0, f[1]], [0, f[0], f[2]]])
    return cv2.warpAffine(v, M, (shape[1], shape[0]), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=0)


def defringe(c):
    """A drawn frame keyed off a light ground can keep a pale rim, soft or solid: light, colourless pixels on the outer edge of
    the figure go, peeled a few times (a cream sleeve has colour and stays)."""
    out = c.copy()
    for _ in range(3):
        al = out[..., 3]; rgb = out[..., :3]
        solid = (al > 0.5).astype(np.uint8)
        edge = (al > 0.02) & (cv2.erode(solid, np.ones((5, 5), np.uint8)) == 0)
        pale = (rgb.min(axis=2) > 0.58) & (rgb.max(axis=2) - rgb.min(axis=2) < 0.10)
        rim = edge & pale
        if not rim.any(): break
        out[..., 3][rim] = 0
    # and the thin soft rim left of it: the edge of the alpha pulled in by 2 px (well under a pixel on screen)
    out[..., 3] = np.minimum(out[..., 3], cv2.erode(out[..., 3], np.ones((3, 3), np.uint8), iterations=2))
    return out


def sole_of(c):
    ys = np.nonzero((c[..., 3] > 0.5).any(axis=1))[0]
    return float(ys.max()) if len(ys) else c.shape[0] - 1.0


def iou(a, b):
    x, y = a[..., 3] > 0.5, b[..., 3] > 0.5
    return float((x & y).sum()) / max(1, (x | y).sum())


def work(job):
    name, pairs = job
    r = RIG[name]
    img = cv2.imread(os.path.join(A, r['image']), cv2.IMREAD_UNCHANGED)
    if img is None or img.ndim < 3 or img.shape[2] != 4:
        return name, None, 'no alpha sheet'
    F = r['frames']; k = clip_scale(r)
    keep = {}; log = []; drawn = set()
    V = v2_cells(name)
    if V is not None and len(V) != 2 * len(F) - 1: V = None
    for (i, j) in pairs:
        if F[i][2:4] != F[j][2:4]:
            log.append((i, j, None, None, 'cell size')); continue
        if V is not None and j == i + 1:
            # the drawn pose between them, laid into this clip's cell by its neighbours (copies of frames i and j); its own
            # sole is where the game puts it on the ground. The quarters are the flow between it and each neighbour.
            a, b = cell(img, F[i]), cell(img, F[j])
            fa, fb = fit(V[2 * i], a), fit(V[2 * j], b)
            D = defringe(place(V[2 * i + 1], tuple((p + q) / 2 for p, q in zip(fa, fb)), a.shape))
            match = min(iou(place(V[2 * i], fa, a.shape), a), iou(place(V[2 * j], fb, b.shape), b))
            sd = sole_of(D); mid = crop(D, k)
            if mid is not None and match > 0.7:
                q1 = betweens(a, shift(D, int(round(F[i][4] - sd))))[1]
                q3 = betweens(D, shift(b, int(round(sd - F[j][4]))))[1]
                ok = lambda q: q[1] <= MAX_ERR and q[2] <= MAX_GHOST
                cuts = [crop(q1[0], k) if ok(q1) else None, mid, crop(q3[0], k) if ok(q3) else None]
                keep[(i, j)] = [(c[0], c[1] - r['anchor'], c[2] - base) if c else None for c, base in zip(cuts, (F[i][4], sd, sd))]
                drawn.add((i, j)); log.append((i, j, max(q1[1], q3[1]), match, 'drawn')); continue
            log.append((i, j, None, match, 'v2 off'))
        a = cell(img, F[i])
        b = shift(cell(img, F[j]), int(round(F[i][4] - F[j][4])))   # b's sole onto a's
        res = betweens(a, b)
        err = max(e for _, e, _ in res); ghost = max(g for _, _, g in res)
        why = 'flow' if err > MAX_ERR else 'ghost' if ghost > MAX_GHOST else ''
        note = why
        if why:
            # A second try for a figure that moves across its cell (a leap, a lunge, a fall): b is first laid onto a by the
            # centres of their figures, the flow follows only the change of pose, and each in-between is moved back by its
            # share of the way.
            s = centre(b) - centre(a)
            if np.hypot(*s) > 3:
                res2 = betweens(a, shift2(b, -s))
                err2 = max(e for _, e, _ in res2); ghost2 = max(g for _, _, g in res2)
                if err2 <= MAX_ERR and ghost2 <= MAX_GHOST:
                    res = [(shift2(m, s * t), e, g) for (m, e, g), t in zip(res2, TS)]
                    err, ghost, why, note = err2, ghost2, '', 'centred'
        log.append((i, j, err, ghost, note))
        if why: continue
        cuts = [crop(m, k) for m, _, _ in res]
        if any(c is None for c in cuts): continue
        keep[(i, j)] = [(c[0], c[1] - r['anchor'], c[2] - F[i][4]) for c in cuts]
    return name, (k, keep, drawn), log


def run(names):
    os.makedirs(OUT, exist_ok=True)
    meta = json.load(open(META, encoding='utf-8')) if os.path.exists(META) else {}
    seqs = sequences()
    jobs = [(n, pairs_of(n, seqs)) for n in names if n in RIG]
    for n in names:
        if n not in RIG: print('skip (not in the rig):', n)
    total = 0
    # a few workers: each holds a sheet and its flows in memory (SMOOTH_WORKERS to change)
    with ProcessPoolExecutor(max_workers=int(os.environ.get('SMOOTH_WORKERS', min(6, max(1, (os.cpu_count() or 2) - 1))))) as ex:
        for name, res, log in ex.map(work, jobs):
            if res is None:
                print('skip (%s): %s' % (log, name)); continue
            k, keep, drawn = res
            for ext in ('.webp', '-q.webp'):
                old = os.path.join(OUT, name + ext)
                if os.path.exists(old): os.remove(old)
            if not keep:
                meta.pop(name, None)
            else:
                half, quarter = [], []
                for (i, j), cuts in keep.items():
                    half.append(((i, j, 1), cuts[1][0]))
                    quarter += [((i, j, q), cuts[q][0]) for q in (0, 2) if cuts[q]]
                s1, r1 = pack(half); s2, r2 = pack(quarter)
                cv2.imwrite(os.path.join(OUT, name + '.webp'), s1, [cv2.IMWRITE_WEBP_QUALITY, 88])
                cv2.imwrite(os.path.join(OUT, name + '-q.webp'), s2, [cv2.IMWRITE_WEBP_QUALITY, 88])
                mids = {}
                for (i, j), cuts in keep.items():
                    rr = [r2.get((i, j, 0)), r1[(i, j, 1)], r2.get((i, j, 2))]
                    mids['%d-%d' % (i, j)] = [rr[q] + [round(cuts[q][1], 1), round(cuts[q][2], 1)] if cuts[q] else None for q in range(3)]
                meta[name] = {'image': 'smooth/' + name + '.webp', 'imageQ': 'smooth/' + name + '-q.webp', 'k': k,
                              'loop': name in LOOPS, 'mids': mids}
                if drawn: meta[name]['drawn'] = sorted('%d-%d' % p for p in drawn)   # drawn poses: a blow passes through them
                total += s1.shape[0] * s1.shape[1] + s2.shape[0] * s2.shape[1]
            print('%-26s %2d/%2d pairs  k=%.2f  %s' % (name, len(keep), len(log), k,
                  ' '.join('%d-%d:%s' % (i, j, ('%.3f/%.2f' % (e, g)) + ('!' + w if w else '') if e is not None else w) for i, j, e, g, w in log)), flush=True)
    for alias, src in ALIASES.items():
        if src in meta and alias in RIG: meta[alias] = meta[src]
    meta = {k: meta[k] for k in sorted(meta)}
    json.dump(meta, open(META, 'w', encoding='utf-8'), separators=(',', ':'))
    print('sheets written: %.1f Mpx (%.0f MB decoded)' % (total / 1e6, total * 4 / 1e6))


def report():
    meta = json.load(open(META, encoding='utf-8')) if os.path.exists(META) else {}
    seqs = sequences()
    print('| klip | nacrtano | parova | sa međukadrovima | prikazano po krugu |')
    print('|---|---|---|---|---|')
    for n in CLIPS:
        nf = len(RIG[n]['frames']); ps = pairs_of(n, seqs); got = len(meta.get(n, {}).get('mids', {}))
        steps = nf if n in LOOPS else nf - 1
        seq = sum(1 for i in range(steps) if '%d-%d' % (min(i, (i + 1) % nf), max(i, (i + 1) % nf)) in meta.get(n, {}).get('mids', {}))
        print('| %s | %d | %d | %d | %d |' % (n, nf, len(ps), got, nf + 3 * seq))


def sheet(name, dst, size=220, only=None):
    """A contact sheet for the eye: one row per pair, a, 1/4, 1/2, 3/4, b, on a checker ground (red ground: no in-between)."""
    r = RIG[name]; meta = json.load(open(META, encoding='utf-8')).get(name, {})
    img = cv2.imread(os.path.join(A, r['image']), cv2.IMREAD_UNCHANGED)
    sh = [cv2.imread(os.path.join(A, meta[q]), cv2.IMREAD_UNCHANGED) if meta.get(q) else None for q in ('imageQ', 'image')]
    F = r["frames"]; w, h = F[0][2], F[0][3]; s = size / h; cw, ch = int(w * s), int(h * s); k = meta.get('k', 1)
    ps = [q for q in pairs_of(name, sequences()) if only is None or '%d-%d' % q in only]
    out = np.full((ch * len(ps), cw * 5, 3), 60, np.uint8)
    yy, xx = np.mgrid[0:ch, 0:cw]; chk = (((yy // 12) + (xx // 12)) % 2 * 18 + 62).astype(np.float32)[..., None] / 255

    def put(c, row, col, red=False):
        c = cv2.resize(c, (cw, ch), interpolation=cv2.INTER_AREA).astype(np.float32) / 255
        bg = np.repeat(chk, 3, axis=2) * (np.array([.7, .7, 1.6], np.float32) if red else 1)
        out[row * ch:(row + 1) * ch, col * cw:(col + 1) * cw] = (np.clip(c[..., :3] * c[..., 3:4] + bg * (1 - c[..., 3:4]), 0, 1) * 255).astype(np.uint8)

    for row, (i, j) in enumerate(ps):
        fa, fb = F[i], F[j]
        put(img[fa[1]:fa[1] + h, fa[0]:fa[0] + w], row, 0)
        bcell = img[fb[1]:fb[1] + h, fb[0]:fb[0] + w]
        put(shift(bcell.astype(np.float32), int(round(fa[4] - fb[4]))).astype(np.uint8), row, 4)
        m = meta.get('mids', {}).get('%d-%d' % (i, j))
        for q in range(3):
            canvas = np.zeros((h, w, 4), np.uint8)
            if m and m[q]:
                x, y, ww, hh, dx, dy = m[q]
                part = (sh[1] if q == 1 else sh[0])[y:y + hh, x:x + ww]
                part = cv2.resize(part, (max(1, round(ww / k)), max(1, round(hh / k))), interpolation=cv2.INTER_LINEAR)
                X, Y = int(round(r['anchor'] + dx)), int(round(fa[4] + dy))
                X1, Y1 = min(w, X + part.shape[1]), min(h, Y + part.shape[0])
                canvas[Y:Y1, X:X1] = part[:Y1 - Y, :X1 - X]
            put(canvas, row, 1 + q, red=not (m and m[q]))
    cv2.imwrite(dst, out, [cv2.IMWRITE_JPEG_QUALITY, 84])


if __name__ == '__main__':
    args = sys.argv[1:]
    if args and args[0] == '--sheet':
        sheet(args[1], args[2], int(args[3]) if len(args) > 3 else 220, args[4].split(',') if len(args) > 4 else None)
    elif args and args[0] == '--report':
        report()
    else:
        run(args or CLIPS)
