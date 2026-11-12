"""Urvina: the mountain of the vila Ravijojla in the morning fog. Cliffs, waterfalls, her forest; caves inside."""
import math

import numpy as np
from PIL import Image

from realisticno_draw import Draft, MAG, barrel, crate, jitter, mix, pnoise, rng, sky_gradient
from realisticno_common import LAYER, SKY, back_prompt, interior_prompt, layer_prompt, sky_prompt

LIGHT = ('cool early morning light, the sun just risen behind thin mist on the right, soft diffuse light, '
         'layers of white fog in the valleys, dew, fresh mountain air')
INSIDE = ('cold blue-green half-light inside a limestone cave, a faint shaft of daylight from a crack above, '
          'wet glistening rock, darkness at the edges')
FOG = (226, 230, 232)


def sky():
    w, h = SKY
    d = sky_gradient(w, h, [(0, (118, 152, 194)), (0.35, (168, 192, 212)), (0.65, (218, 222, 218)),
                            (1, (238, 232, 218))],
                     seed=111, glow=(w * 0.74, h * 0.42, w * 0.2, (255, 246, 222), 0.6),
                     clouds=[(h * 0.16, 30, (214, 222, 230), 6), (h * 0.34, 22, (236, 236, 232), 7),
                             (h * 0.56, 18, (244, 240, 230), 5)])
    return d.finish(noise=3, blotch=5, seed=112, keep_magenta=False)


def jagged(w, seed, base, amp, k=(1, 70), power=0.85):
    y = pnoise(w, seed, kmin=k[0], kmax=k[1], power=power)
    y = np.sign(y) * np.abs(y) ** 0.75
    return base - amp * y


def far():
    w, h = LAYER
    d = Draft(w, h)
    d.shaded_ridge(0, 0, 121, lit=(206, 214, 222), shadow=(118, 136, 160), haze=FOG, haze_amt=0.85,
                   ridge=jagged(w, 121, h * 0.40, h * 0.22), gully=0.25, facing_gain=1.6, sun=1, depth=h * 0.5)
    # snow / bright limestone on the highest crests
    d.shaded_ridge(0, 0, 122, lit=(176, 190, 198), shadow=(98, 118, 134), haze=FOG, haze_amt=0.9,
                   ridge=jagged(w, 122, h * 0.58, h * 0.11), gully=0.2, facing_gain=1.8, sun=1, depth=h * 0.35)
    d.ridge(h * 0.80, h * 0.03, FOG, seed=123, kmax=20)
    return d.finish(noise=4, blotch=8, seed=124)


def cliff_profile(w, h, seed):
    """Terraced cliff tops: flat shelves broken by steep drops."""
    n = pnoise(w, seed, kmin=1, kmax=14, power=1.2)
    steps = np.round(n * 3.2) / 3.2
    k = 15
    sm = np.convolve(np.concatenate([steps[-k:], steps, steps[:k]]), np.ones(2 * k + 1) / (2 * k + 1), 'same')[k:-k]
    fine = pnoise(w, seed + 1, kmin=40, kmax=200, power=0.7)
    return h * 0.34 - h * 0.13 * sm + fine * 5


def mid():
    w, h = LAYER
    d = Draft(w, h)
    r = rng(131)
    top = cliff_profile(w, h, 131)
    d.shaded_ridge(0, 0, 132, lit=(206, 202, 188), shadow=(104, 112, 118), haze=FOG, haze_amt=0.55,
                   ridge=top, gully=0.45, gully_k=(40, 260), facing_gain=3.0, sun=1, depth=h * 0.45)
    # fir forest along the cliff tops
    for i in range(70):
        x = r.uniform(0, w)
        y = top[int(x) % w] + 6
        hh = r.uniform(40, 90)
        d.fir(x, y, hh, hh * 0.42, jitter((44, 66, 54), r, 10), seed=i)
    # waterfalls
    for wx in (w * 0.27, w * 0.71):
        y0 = top[int(wx)] + 2
        ww = r.uniform(22, 34)
        d.poly([(wx - ww / 2, y0), (wx + ww / 2, y0), (wx + ww * 0.9, h * 0.86), (wx - ww * 0.9, h * 0.86)],
               (232, 240, 242))
        for k in range(5):
            xx = wx + r.normal() * ww * 0.2
            d.rect(xx - 2, y0, xx + 2, h * 0.86, (190, 206, 212))
        d.ellipse(wx, h * 0.86, ww * 3, 30, (240, 244, 244))
    # fog bank at the foot
    d.ridge(h * 0.84, h * 0.035, FOG, seed=133, kmax=24)
    return d.finish(noise=5, blotch=10, seed=134)


def near():
    w, h = LAYER
    d = Draft(w, h)
    r = rng(141)
    ground = h * 0.93
    d.rect(0, ground, w, h, (58, 60, 40))
    trunks = [(0.04, 70, 'beech'), (0.17, 46, 'fir'), (0.47, 30, 'beech'), (0.64, 84, 'beech'), (0.86, 52, 'fir')]
    for i, (tx, tw, kind) in enumerate(trunks):
        x = w * tx
        if kind == 'beech':
            d.trunk(x, ground + 6, -10, tw, (112, 116, 104), seed=i)
            d.rect(x - tw / 2, -10, x - tw / 2 + tw * 0.25, ground, (150, 156, 140))     # lit side
            for k in range(8):
                d.ellipse(x + r.normal() * tw * 0.2, ground - r.uniform(0, h * 0.8), tw * 0.35, tw * 0.12,
                          (78, 98, 60))                                                     # moss
            for k in range(10):
                cx = x + r.normal() * w * 0.05
                d.ellipse(cx, h * r.uniform(-0.02, 0.16), r.uniform(50, 100), r.uniform(30, 60),
                          jitter((62, 92, 46), r, 12))
        else:
            d.trunk(x, ground + 6, -10, tw, (82, 64, 50), seed=i)
            for k in range(9):
                yy = h * (0.02 + k * 0.07)
                ww = 50 + k * 14
                d.poly([(x - ww, yy + 40), (x, yy - 10), (x + ww, yy + 40)], jitter((36, 58, 44), r, 8))
    # ferns and mossy boulders on the forest floor
    for i in range(14):
        d.boulder(r.uniform(0, w), ground + 4, r.uniform(60, 160), r.uniform(30, 70), (92, 104, 76),
                  lit=(122, 140, 90))
    for i in range(30):
        cx = r.uniform(0, w)
        for k in range(7):
            a = math.pi * (0.15 + 0.7 * k / 6)
            ln = r.uniform(50, 90)
            d.line([(cx, ground), (cx - math.cos(a) * ln, ground - math.sin(a) * ln * 0.9)],
                   jitter((70, 112, 52), r, 10), width=9)
    return d.finish(noise=6, blotch=12, seed=142)


# ------------------------------------------------------------------ caves
def in_back():
    w, h = SKY
    d = Draft(w, h, bg=(36, 42, 46))
    r = rng(151)
    for _ in range(260):
        d.ellipse(r.uniform(0, w), r.uniform(0, h), r.uniform(30, 120), r.uniform(20, 80),
                  jitter((52, 60, 64), r, 14))
    for _ in range(22):     # flowstone streaks
        x = r.uniform(0, w)
        y0 = r.uniform(0, h * 0.3)
        d.poly([(x, y0), (x + r.uniform(20, 50), y0), (x + 14, y0 + r.uniform(h * 0.2, h * 0.5)),
                (x + 6, y0 + r.uniform(h * 0.2, h * 0.5))], jitter((88, 92, 86), r, 10))
    d.ridge(h * 0.86, h * 0.04, (44, 48, 46), seed=152, kmax=30)
    im = d.finish(noise=5, blotch=12, seed=153, keep_magenta=False)
    a = np.asarray(im, np.float32)
    yy, xx = np.mgrid[0:h, 0:w]
    gx = w * 0.6
    dx = np.minimum(np.abs(xx - gx), w - np.abs(xx - gx))
    shaft = np.exp(-(dx ** 2) / (2 * (w * 0.07) ** 2)) * np.clip(1 - yy / h, 0.2, 1)
    glow = np.exp(-(dx ** 2 + (yy - h * 0.15) ** 2) / (2 * (h * 0.3) ** 2))
    a = a * (0.7 + 0.8 * glow[..., None]) + shaft[..., None] * np.array([70, 100, 104])
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def stalactite(d, x, top, ln, wd, col):
    d.poly([(x - wd / 2, top), (x + wd / 2, top), (x + wd * 0.08, top + ln), (x - wd * 0.08, top + ln)], col)


def in_far():
    w, h = LAYER
    d = Draft(w, h)
    r = rng(161)
    col = (70, 86, 94)
    d.ridge(h * 0.08, h * 0.04, col, seed=162, kmax=40, bottom=0)       # ceiling edge (drawn upward)
    d.rect(0, 0, w, h * 0.06, col)
    for _ in range(40):
        stalactite(d, r.uniform(0, w), h * 0.05, r.uniform(40, 200), r.uniform(18, 50), jitter(col, r, 8))
    for cx in (w * 0.18, w * 0.52, w * 0.83):
        cw = r.uniform(70, 120)
        d.poly([(cx - cw * 0.5, 0), (cx + cw * 0.5, 0), (cx + cw * 0.25, h * 0.45), (cx + cw * 0.6, h),
                (cx - cw * 0.6, h), (cx - cw * 0.25, h * 0.45)], jitter((78, 92, 98), r, 6))
    for _ in range(18):
        x = r.uniform(0, w)
        ln = r.uniform(40, 150)
        wd = r.uniform(26, 60)
        d.poly([(x - wd / 2, h), (x - wd * 0.08, h - ln), (x + wd * 0.08, h - ln), (x + wd / 2, h)],
               jitter((64, 78, 84), r, 8))
    d.rect(0, h * 0.94, w, h, (60, 72, 76))
    return d.finish(noise=5, blotch=10, seed=163)


def in_mid():
    w, h = LAYER
    d = Draft(w, h)
    r = rng(171)
    floor = h * 0.92
    # a rock shelf on the left with an underground waterfall into a pool
    d.poly([(0, h * 0.30), (w * 0.10, h * 0.28), (w * 0.22, h * 0.36), (w * 0.26, h * 0.52), (w * 0.24, floor),
            (0, floor)], (66, 74, 76))
    d.poly([(w * 0.215, h * 0.36), (w * 0.24, h * 0.36), (w * 0.27, floor), (w * 0.20, floor)], (196, 222, 226))
    d.ellipse(w * 0.32, floor + 6, w * 0.10, 22, (36, 74, 80))
    d.ellipse(w * 0.32, floor + 2, w * 0.08, 8, (110, 160, 166))
    # flowstone curtains and mossy rocks near the light
    for cx in (w * 0.48, w * 0.58):
        for k in range(9):
            x = cx + k * 14
            d.poly([(x - 8, h * 0.16), (x + 8, h * 0.16), (x + 3, h * 0.16 + r.uniform(120, 260)),
                    (x - 3, h * 0.16 + r.uniform(120, 260))], jitter((150, 140, 116), r, 10))
    d.rect(w * 0.44, h * 0.10, w * 0.66, h * 0.17, (90, 94, 88))
    # a rock mass on the right with a ledge
    d.poly([(w * 0.74, floor), (w * 0.76, h * 0.50), (w * 0.84, h * 0.40), (w * 0.95, h * 0.36), (w * 1.0, h * 0.30),
            (w * 1.0, floor)], (60, 68, 70))
    for _ in range(12):
        d.boulder(r.uniform(0, w), floor + 4, r.uniform(50, 130), r.uniform(26, 56), (68, 84, 72),
                  lit=(84, 110, 80))
    d.rect(0, floor, w, h, (54, 60, 60))
    return d.finish(noise=6, blotch=12, seed=172)


def in_near():
    w, h = LAYER
    d = Draft(w, h)
    r = rng(181)
    col = (34, 38, 40)
    d.rect(0, 0, w, h * 0.04, col)
    for _ in range(14):
        stalactite(d, r.uniform(0, w), 0, r.uniform(90, 280), r.uniform(50, 110), jitter(col, r, 6))
    for x0, x1 in ((-w * 0.04, w * 0.08), (w * 0.60, w * 0.70)):
        d.poly([(x0, 0), (x1, 0), (x1 - 20, h * 0.3), (x1 + 10, h * 0.7), (x1 + 30, h), (x0 - 30, h)],
               jitter((40, 44, 46), r, 6))
        d.rect(x1 - 26, h * 0.1, x1 - 8, h * 0.9, (72, 92, 96))                  # wet rim light
    for _ in range(14):
        d.boulder(r.uniform(0, w), h + 6, r.uniform(60, 180), r.uniform(30, 70), (40, 44, 44))
    return d.finish(noise=5, blotch=10, seed=182)


# ------------------------------------------------------------------ materials
def _tile(base, seed):
    return Draft(1024, 1024, bg=base, wrap_x=True, wrap_y=True), rng(seed)


def mat_ground():
    d, r = _tile((70, 62, 46), 191)
    for _ in range(140):
        rx = r.uniform(16, 50)
        d.ellipse(r.uniform(0, 1024), r.uniform(0, 1024), rx, rx * 0.7, jitter((128, 126, 116), r, 16))
    for _ in range(60):
        rx = r.uniform(30, 90)
        d.ellipse(r.uniform(0, 1024), r.uniform(0, 1024), rx, rx * 0.6, jitter((74, 100, 50), r, 12))
    return d.finish(noise=8, blotch=14, seed=192, keep_magenta=False)


def mat_wall():
    d, r = _tile((150, 150, 142), 193)
    for _ in range(90):
        x = r.uniform(0, 1024)
        d.rect(x, r.uniform(-200, 1024), x + r.uniform(6, 30), r.uniform(0, 1224), jitter((176, 174, 164), r, 12))
    for _ in range(30):
        x, y = r.uniform(0, 1024), r.uniform(0, 1024)
        d.line([(x, y), (x + r.normal() * 60, y + r.uniform(60, 200))], (84, 84, 80), width=4)
    return d.finish(noise=8, blotch=16, seed=194, keep_magenta=False)


def mat_platform():
    d, r = _tile((132, 130, 120), 195)
    for j in range(4):
        y = j * 256
        d.rect(-10, y + 8, 1034, y + 248, jitter((158, 156, 144), r, 10))
    for _ in range(50):
        rx = r.uniform(30, 90)
        d.ellipse(r.uniform(0, 1024), r.uniform(0, 1024), rx, rx * 0.5, jitter((82, 110, 56), r, 10))
    return d.finish(noise=8, blotch=14, seed=196, keep_magenta=False)


def mat_beam():
    d, r = _tile((88, 70, 54), 197)
    for _ in range(140):
        y = r.uniform(0, 1024)
        x = r.uniform(0, 1024)
        d.rect(x, y, x + r.uniform(60, 300), y + r.uniform(6, 18), jitter((62, 48, 38), r, 10))
    return d.finish(noise=8, blotch=12, seed=198, keep_magenta=False)


def mat_ceiling():
    d, r = _tile((40, 46, 48), 199)
    for _ in range(160):
        rx = r.uniform(20, 90)
        d.ellipse(r.uniform(0, 1024), r.uniform(0, 1024), rx, rx * 0.8, jitter((58, 66, 68), r, 14))
    return d.finish(noise=7, blotch=14, seed=200, keep_magenta=False)


# ------------------------------------------------------------------ props
def _prop(w=1024, h=1024):
    return Draft(w, h, wrap_x=False)


def p_sanduk():
    d = _prop()
    crate(d, 212, 300, 812, 900, (120, 104, 78))
    r = rng(1)
    for _ in range(10):
        d.ellipse(r.uniform(230, 800), r.choice([310, 890]), r.uniform(30, 70), 18, (80, 110, 56))
    return d.finish(noise=6, blotch=10, seed=1)


def p_bacva():
    d = _prop()
    barrel(d, 512, 240, 930, 200, 50, (112, 96, 72), hoop=(70, 60, 50))
    return d.finish(noise=6, blotch=10, seed=2)


def p_blok():
    d = _prop()
    d.poly([(170, 450), (230, 380), (830, 400), (860, 470), (850, 900), (170, 900)], (166, 164, 152))
    d.ellipse(420, 400, 260, 50, (88, 118, 60))
    return d.finish(noise=9, blotch=14, seed=3)


def p_greda():
    d = _prop(1536, 512)
    d.poly([(40, 230), (1500, 210), (1500, 330), (40, 350)], (96, 76, 58))
    d.ellipse(40, 290, 40, 62, (150, 120, 90))
    d.ellipse(40, 290, 22, 36, (120, 90, 64))
    for _ in range(8):
        d.ellipse(rng(4).uniform(200, 1400), 222, 70, 16, (80, 110, 56))
    return d.finish(noise=7, blotch=10, seed=4)


def p_luk():
    d = _prop()
    d.arch(150, 870, 170, 940, (150, 150, 140), hole=MAG, thickness=120)
    d.poly([(150, 170), (330, 170), (240, 420), (150, 520)], MAG)
    r = rng(5)
    for _ in range(26):
        d.ellipse(r.uniform(160, 860), r.uniform(200, 900), r.uniform(20, 50), r.uniform(14, 30),
                  jitter((70, 104, 52), r, 10))
    return d.finish(noise=9, blotch=14, seed=5)


def p_baklja():
    d = _prop()
    d.rect(492, 420, 532, 960, (96, 70, 46))
    d.rect(472, 400, 552, 470, (70, 60, 50))
    d.ellipse(512, 320, 70, 120, (255, 150, 50))
    d.ellipse(512, 340, 36, 70, (255, 226, 150))
    return d.finish(noise=5, blotch=8, seed=6)


def p_vrata():
    d = _prop()
    d.poly([(120, 980), (130, 300), (260, 150), (520, 90), (780, 150), (900, 300), (910, 980)], (110, 112, 104))
    d.arch(300, 724, 260, 980, (104, 74, 46))
    for k in range(5):
        d.rect(330 + k * 84, 300, 334 + k * 84, 980, (70, 50, 32))
    for y in (480, 780):
        d.rect(300, y, 724, y + 22, (60, 56, 52))
    return d.finish(noise=8, blotch=12, seed=7)


def p_panj():
    d = _prop()
    d.poly([(300, 940), (330, 520), (360, 470), (660, 470), (700, 520), (730, 940)], (98, 78, 58))
    d.poly([(240, 940), (330, 820), (420, 940)], (98, 78, 58))
    d.poly([(620, 940), (700, 820), (800, 940)], (98, 78, 58))
    d.ellipse(512, 480, 170, 36, (170, 136, 96))
    for k in range(5):
        d.ellipse(380 + k * 60, 620 + (k % 2) * 60, 30, 14, (200, 176, 140))
    d.ellipse(400, 760, 90, 40, (80, 110, 56))
    return d.finish(noise=7, blotch=12, seed=8)


def p_paprat():
    d = _prop()
    r = rng(9)
    for k in range(13):
        a = math.pi * (0.1 + 0.8 * k / 12)
        ln = r.uniform(330, 470)
        x1, y1 = 512 - math.cos(a) * ln, 930 - math.sin(a) * ln
        d.line([(512, 930), ((512 + x1) / 2, (930 + y1) / 2 - 40), (x1, y1)], jitter((70, 118, 50), r, 10), width=34)
    return d.finish(noise=6, blotch=10, seed=9)


def p_stena():
    d = _prop()
    d.chord([150, 380, 874, 1420], 180, 360, (140, 140, 132))
    d.chord([200, 380, 700, 760], 180, 330, (82, 116, 60))
    return d.finish(noise=9, blotch=14, seed=10)


BIOME = {
    'id': 'urvina',
    'layers': [
        {'id': 'sky', 'draw': sky, 'kind': 'sky', 'strength': 0.6,
         'prompt': sky_prompt('a pale early morning mountain sky, soft blue at the top fading to warm cream at the '
                              'horizon, thin wisps of high cloud, a bright hazy glow where the sun rises on the right',
                              LIGHT)},
        {'id': 'far', 'draw': far, 'kind': 'far', 'strength': 0.75,
         'prompt': layer_prompt('distant jagged limestone mountain peaks of the high Balkan range in cool blue morning '
                                'haze, layered ridges one behind another, rock faces and scree, the valleys between '
                                'them filled with a sea of white fog', LIGHT)},
        {'id': 'mid', 'draw': mid, 'kind': 'mid', 'strength': 0.75,
         'prompt': layer_prompt('high pale limestone cliffs of Urvina mountain with vertical rock faces and terraced '
                                'ledges, dark fir forest along the cliff tops, two long thin waterfalls plunging down '
                                'the cliff faces into white morning fog at the bottom', LIGHT)},
        {'id': 'near', 'draw': near, 'kind': 'near', 'strength': 0.72,
         'prompt': layer_prompt('the edge of an ancient enchanted beech and fir forest, the forest of the vila: huge '
                                'grey beech trunks covered in moss, dark fir trunks with drooping branches, leafy '
                                'canopy at the top edge, ferns and moss-covered boulders on the forest floor, '
                                'soft mist between the trunks', LIGHT)},
    ],
    'interior': [
        {'id': 'in-back', 'draw': in_back, 'kind': 'sky', 'strength': 0.62,
         'prompt': back_prompt('the back wall of a large limestone cave: wet dark rock with mineral streaks and '
                               'flowstone, a soft shaft of daylight falling from a crack high above, a rocky floor',
                               INSIDE)},
        {'id': 'in-far', 'draw': in_far, 'kind': 'far', 'strength': 0.72,
         'prompt': interior_prompt('the depths of a limestone cave: rows of stalactites hanging from the ceiling, '
                                   'three tall natural rock columns from floor to ceiling, stalagmites rising from '
                                   'the floor, hazy and blue with distance', INSIDE)},
        {'id': 'in-mid', 'draw': in_mid, 'kind': 'mid', 'strength': 0.72,
         'prompt': interior_prompt('inside a cave: a rock shelf on the left with a small underground waterfall '
                                   'pouring into a dark green pool, cream-coloured flowstone curtains hanging from a '
                                   'ledge, a big rock mass with a ledge on the right, moss on the rocks near the light',
                                   INSIDE)},
        {'id': 'in-near', 'draw': in_near, 'kind': 'near', 'strength': 0.68,
         'prompt': interior_prompt('dark wet cave foreground: big stalactites hanging from the top edge, two massive '
                                   'rock pillars, boulders at the bottom, cold light glinting on wet rock', INSIDE)},
    ],
    'materials': {
        'ground': {'draw': mat_ground, 'prompt': 'dark mountain soil with grey limestone stones and patches of green '
                                                 'moss'},
        'wall': {'draw': mat_wall, 'prompt': 'pale grey limestone cliff rock face with vertical striations and cracks'},
        'platform': {'draw': mat_platform, 'prompt': 'flat weathered limestone slabs with patches of moss and lichen'},
        'beam': {'draw': mat_beam, 'prompt': 'rough fir log bark, deeply furrowed, running horizontally'},
        'ceiling': {'draw': mat_ceiling, 'prompt': 'wet dark cave rock with mineral stains and drips'},
    },
    'props': [
        {'id': 'sanduk', 'draw': p_sanduk, 'w': 64, 'h': 64, 'solid': True,
         'what': 'an old weathered wooden crate, grey from rain, with moss growing on its edges'},
        {'id': 'bacva', 'draw': p_bacva, 'w': 56, 'h': 72, 'solid': True,
         'what': 'an old weathered upright wooden barrel with rusty iron hoops and a little moss'},
        {'id': 'kameni-blok', 'draw': p_blok, 'w': 84, 'h': 64, 'solid': True,
         'what': 'a block of grey limestone with a cushion of green moss on top'},
        {'id': 'oboreno-stablo', 'draw': p_greda, 'w': 300, 'h': 100, 'solid': True, 'size': (1536, 512),
         'what': 'a long fallen fir trunk lying horizontally, rough bark, a cut end on the left, moss on top'},
        {'id': 'rusevni-luk', 'draw': p_luk, 'w': 260, 'h': 260, 'solid': False,
         'what': 'a ruined old stone arch overgrown with ivy and moss, its top left corner broken off'},
        {'id': 'baklja', 'draw': p_baklja, 'w': 40, 'h': 110, 'solid': False,
         'what': 'a burning wooden torch on a wooden pole, wrapped in pitch-soaked cloth, bright flame'},
        {'id': 'vrata', 'draw': p_vrata, 'w': 150, 'h': 170, 'solid': False,
         'what': 'a closed rough wooden door with iron bands set into a frame of natural grey rock'},
        {'id': 'panj', 'draw': p_panj, 'w': 90, 'h': 80, 'solid': True,
         'what': 'an old tree stump with roots, moss and small mushrooms, the cut top showing growth rings'},
        {'id': 'paprat', 'draw': p_paprat, 'w': 110, 'h': 90, 'solid': False,
         'what': 'a lush green fern bush with long arching fronds'},
        {'id': 'stena', 'draw': p_stena, 'w': 150, 'h': 100, 'solid': True,
         'what': 'a big rounded grey boulder partly covered in thick green moss'},
    ],
}
