"""Klisura: the Kačanik gorge at dusk under a storm. The river in the canyon, wooden bridges, Musa's tower;
the inside of the tower."""
import math

import numpy as np
from PIL import Image

from realisticno_draw import Draft, MAG, barrel, crate, jitter, mix, pnoise, rng, sky_gradient
from realisticno_common import LAYER, SKY, back_prompt, interior_prompt, layer_prompt, sky_prompt

LIGHT = ('dramatic dusk under a gathering thunderstorm: a band of deep red and orange sunset light low behind the '
         'mountains, heavy dark slate storm clouds above, the scenery mostly in cold blue-purple shadow with warm '
         'rim light on the edges, wet rock')
INSIDE = ('the inside of a stone tower at night during a storm: cold blue-grey light through narrow arrow slits, '
          'warm orange light from an iron lantern and a few candles, deep shadows')


def sky():
    w, h = SKY
    d = sky_gradient(w, h, [(0, (32, 34, 50)), (0.3, (60, 54, 74)), (0.55, (118, 70, 72)), (0.72, (206, 104, 60)),
                            (0.84, (236, 148, 82)), (1, (128, 72, 70))],
                     seed=211, glow=(w * 0.4, h * 0.8, w * 0.14, (255, 176, 96), 0.55),
                     clouds=[(h * 0.10, 60, (40, 40, 54), 9), (h * 0.26, 50, (52, 48, 64), 9),
                             (h * 0.44, 34, (96, 62, 70), 7), (h * 0.62, 18, (176, 92, 70), 6)])
    return d.finish(noise=4, blotch=8, seed=212, keep_magenta=False)


def far():
    w, h = LAYER
    d = Draft(w, h)
    d.shaded_ridge(h * 0.38, h * 0.16, 221, lit=(150, 96, 98), shadow=(58, 54, 80), haze=(112, 82, 94),
                   haze_amt=0.45, kmax=50, power=0.9, facing_gain=2.5, sun=1)
    d.shaded_ridge(h * 0.56, h * 0.10, 222, lit=(120, 80, 84), shadow=(44, 44, 64), haze=(90, 70, 84),
                   haze_amt=0.4, kmax=40, facing_gain=2.5, sun=1)
    return d.finish(noise=5, blotch=10, seed=223)


def mid():
    w, h = LAYER
    d = Draft(w, h)
    r = rng(231)
    # the far wall of the canyon, broken by a side ravine that the bridge spans
    base = pnoise(w, 232, kmin=2, kmax=40, power=1.0)
    top = h * 0.30 - h * 0.08 * base
    x = np.arange(w)
    gap = (x > w * 0.40) & (x < w * 0.54)
    edge = np.clip(np.minimum(x - w * 0.40, w * 0.54 - x) / 40, 0, 1)
    top = np.where(gap, top + (h * 0.84 - top) * edge, top)
    d.shaded_ridge(0, 0, 233, lit=(132, 96, 100), shadow=(48, 48, 64), haze=(70, 62, 80), haze_amt=0.35,
                   ridge=top, gully=0.4, gully_k=(30, 200), facing_gain=3, sun=1, depth=h * 0.4)
    # the wooden trestle bridge over the ravine
    by = h * 0.42
    d.rect(w * 0.38, by, w * 0.56, by + 16, (92, 66, 46))
    d.rect(w * 0.38, by - 40, w * 0.56, by - 34, (92, 66, 46))
    for k in range(10):
        xx = w * 0.38 + k * (w * 0.18 / 9)
        d.rect(xx - 3, by - 40, xx + 3, by, (92, 66, 46))
    for xx in (w * 0.43, w * 0.47, w * 0.51):
        d.line([(xx - 30, h * 0.84), (xx, by + 16)], (78, 56, 40), width=10)
        d.line([(xx + 30, h * 0.84), (xx, by + 16)], (78, 56, 40), width=10)
        d.rect(xx - 6, by + 16, xx + 6, h * 0.84, (82, 60, 42))
    # Musa's tower on the canyon rim
    tx = w * 0.78
    ty = top[int(tx)]
    d.poly([(tx - 120, ty + 40), (tx - 80, ty - 20), (tx + 90, ty - 30), (tx + 130, ty + 40)], (60, 56, 70))
    d.tower(tx, 110, h * 0.02, ty - 10, (88, 82, 92), roof='pyramid', roof_col=(50, 44, 50), roof_h=70,
            crenel=False, slit=True, windows=3, win_col=(30, 26, 30))
    d.rect(tx - 55, h * 0.02, tx - 40, ty - 10, (150, 98, 92))         # rim light
    d.rect(tx + 8, h * 0.16, tx + 26, h * 0.21, (255, 176, 90))         # lit window
    # the river along the bottom
    d.rect(0, h * 0.84, w, h, (46, 54, 66))
    for _ in range(40):
        xx = r.uniform(0, w)
        d.ellipse(xx, h * r.uniform(0.86, 0.97), r.uniform(30, 120), r.uniform(3, 7), (176, 186, 200))
    d.ridge(h * 0.84, h * 0.01, (150, 160, 176), seed=234, kmax=90)
    d.rect(0, h * 0.845, w, h * 0.86, (46, 54, 66))
    return d.finish(noise=6, blotch=12, seed=235)


def near():
    w, h = LAYER
    d = Draft(w, h)
    r = rng(241)
    ground = pnoise(w, 242, kmin=1, kmax=30) * h * 0.04 + h * 0.86
    d.shaded_ridge(0, 0, 243, lit=(96, 82, 92), shadow=(30, 30, 40), ridge=ground, gully=0.2, facing_gain=4,
                   sun=1, depth=h * 0.1)
    for i in range(12):
        bx = r.uniform(0, w)
        d.boulder(bx, ground[int(bx)] + 10, r.uniform(90, 220), r.uniform(40, 110), (44, 42, 54),
                  lit=(110, 82, 86))
    # a pine bent by the wind (leaning right)
    px = w * 0.14
    gy = ground[int(px)]
    pts = [(px + (k / 10) ** 1.6 * 160 + r.normal() * 4, gy - k * h * 0.075) for k in range(11)]
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        d.line([(x0, y0), (x1, y1)], (40, 34, 36), width=34)
    for k in range(5):
        x0, y0 = pts[5 + k]
        d.line([(x0, y0), (x0 + 120 + k * 20, y0 - 20)], (40, 34, 36), width=10)
        for j in range(6):
            d.ellipse(x0 + 40 + j * 24 + k * 6, y0 - 18 + r.normal() * 8, 34, 16, jitter((30, 44, 40), r, 6))
    # bridge posts with sagging ropes running off to the right
    for bx in (w * 0.56, w * 0.60):
        gy = ground[int(bx)]
        d.rect(bx - 14, gy - h * 0.40, bx + 14, gy + 10, (70, 52, 40))
        d.rect(bx - 14, gy - h * 0.40, bx - 6, gy + 10, (130, 90, 70))
    for k, yy in enumerate((0.48, 0.58)):
        x0, y0 = w * 0.60, ground[int(w * 0.60)] - h * (0.40 - 0.1 * k)
        pts = [(x0 + t * w * 0.28, y0 + math.sin(math.pi * t) * 60) for t in np.linspace(0, 1, 30)]
        d.line(pts, (96, 76, 56), width=7)
    # a broken wooden fence on the right
    for k in range(5):
        fx = w * 0.82 + k * 46
        gy = ground[int(fx) % w]
        d.rect(fx - 8, gy - r.uniform(70, 140), fx + 8, gy + 6, (64, 50, 42))
    d.line([(w * 0.81, ground[int(w * 0.81)] - 90), (w * 0.92, ground[int(w * 0.92) % w] - 60)], (64, 50, 42), width=10)
    return d.finish(noise=6, blotch=12, seed=244)


# ------------------------------------------------------------------ inside the tower
def in_back():
    w, h = SKY
    d = Draft(w, h, bg=(40, 38, 42))
    r = rng(251)
    y = 0
    while y < h:
        x = -r.uniform(0, 80)
        rh = r.uniform(40, 70)
        while x < w:
            bw = r.uniform(60, 150)
            d.ellipse(x + bw / 2, y + rh / 2, bw / 2 - 3, rh / 2 - 3, jitter((70, 66, 72), r, 12))
            x += bw
        y += rh
    for k in range(4):
        sx = w * (k + 0.5) / 4
        d.rect(sx - 14, h * 0.22, sx + 14, h * 0.48, (118, 136, 166))       # arrow slits
        d.rect(sx - 26, h * 0.20, sx + 26, h * 0.22, (90, 86, 90))
    for fy in (0.10, 0.62):
        d.rect(0, h * fy, w, h * fy + 34, (58, 42, 30))                     # floor beams in section
        for k in range(12):
            d.rect(k * w / 12, h * fy + 34, k * w / 12 + 26, h * fy + 70, (58, 42, 30))
    d.rect(0, h * 0.92, w, h, (52, 40, 30))
    im = d.finish(noise=5, blotch=10, seed=252, keep_magenta=False)
    a = np.asarray(im, np.float32)
    yy, xx = np.mgrid[0:h, 0:w]
    glow = np.zeros((h, w), np.float32)
    for gx in (w * 0.0, w * 0.5):
        dx = np.minimum(np.abs(xx - gx), w - np.abs(xx - gx))
        glow += np.exp(-(dx ** 2 + (yy - h * 0.75) ** 2) / (2 * (h * 0.18) ** 2))
    a = a * (0.7 + 0.7 * glow[..., None]) + glow[..., None] * np.array([70, 34, 6])
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def in_far():
    w, h = LAYER
    d = Draft(w, h)
    wood = (92, 68, 48)
    # zigzag staircase with landings
    for k in range(3):
        x0 = w * (0.06 + k * 0.33)
        y0 = h * 0.92
        for s in range(10):
            d.rect(x0 + s * 30, y0 - (s + 1) * 26, x0 + s * 30 + 34, y0 - s * 26, wood)
        d.line([(x0, y0), (x0 + 300, y0 - 260)], (70, 50, 36), width=14)
        d.rect(x0 + 300, h * 0.92 - 270, x0 + 420, h * 0.92 - 250, wood)
        d.rect(x0 + 410, h * 0.92 - 270, x0 + 424, h * 0.92, (70, 50, 36))
    # scaffolding posts and a floor above
    d.rect(0, h * 0.20, w, h * 0.25, wood)
    for k in range(8):
        x = w * k / 8
        d.rect(x - 10, h * 0.25, x + 10, h, (78, 58, 40))
        d.line([(x + 10, h * 0.25 + 60), (x + 90, h * 0.25)], (78, 58, 40), width=10)
    return d.finish(noise=6, blotch=12, seed=261)


def in_mid():
    w, h = LAYER
    d = Draft(w, h)
    r = rng(271)
    floor = h * 0.93
    d.rect(0, floor, w, h, (70, 52, 38))
    # heavy door in a stone frame
    d.arch(w * 0.08, w * 0.20, h * 0.32, floor, (84, 80, 86), hole=(92, 64, 42), thickness=34)
    for k in range(5):
        d.rect(w * 0.095 + k * 40, h * 0.40, w * 0.095 + k * 40 + 4, floor, (60, 42, 28))
    for yy in (0.50, 0.78):
        d.rect(w * 0.095, h * yy, w * 0.185, h * yy + 14, (50, 48, 48))
    # a spear rack
    d.rect(w * 0.30, h * 0.50, w * 0.42, h * 0.53, (86, 62, 42))
    d.rect(w * 0.30, h * 0.80, w * 0.42, h * 0.83, (86, 62, 42))
    for k in range(7):
        x = w * 0.31 + k * 32
        d.rect(x - 3, h * 0.24, x + 3, floor, (110, 84, 56))
        d.poly([(x - 8, h * 0.24), (x, h * 0.16), (x + 8, h * 0.24)], (130, 130, 136))
    # chests and barrels
    crate(d, w * 0.50, h * 0.72, w * 0.60, floor, (100, 72, 48))
    barrel(d, w * 0.65, h * 0.68, floor, 44, 10, (96, 66, 44))
    barrel(d, w * 0.71, h * 0.70, floor, 42, 10, (90, 62, 42))
    # chains and a hook hanging from a beam
    d.rect(w * 0.76, h * 0.08, w * 1.0, h * 0.12, (78, 56, 40))
    for cx in (w * 0.82, w * 0.90):
        for k in range(20):
            d.ellipse(cx, h * 0.12 + k * 14, 5, 8, (60, 58, 58))
    return d.finish(noise=6, blotch=12, seed=272)


def in_near():
    w, h = LAYER
    d = Draft(w, h)
    wood = (54, 40, 30)
    d.rect(0, 0, w, h * 0.08, wood)
    for x in (w * 0.10, w * 0.62):
        d.rect(x - 60, 0, x + 60, h, wood)
        d.rect(x - 60, 0, x - 44, h, (120, 80, 50))
        d.line([(x + 60, h * 0.25), (x + 200, h * 0.08)], wood, width=30)
        d.line([(x - 60, h * 0.25), (x - 200, h * 0.08)], wood, width=30)
    # a hanging iron lantern and ropes
    lx = w * 0.36
    d.line([(lx, h * 0.08), (lx, h * 0.26)], (40, 38, 38), width=5)
    d.rect(lx - 26, h * 0.26, lx + 26, h * 0.36, (46, 42, 40))
    d.rect(lx - 18, h * 0.275, lx + 18, h * 0.35, (255, 186, 96))
    d.poly([(lx - 32, h * 0.26), (lx, h * 0.22), (lx + 32, h * 0.26)], (46, 42, 40))
    for rx in (w * 0.82, w * 0.86):
        d.line([(rx, h * 0.08), (rx + 10, h * 0.7)], (110, 90, 64), width=7)
    r = rng(281)
    for _ in range(10):
        d.boulder(r.uniform(0, w), h + 4, r.uniform(50, 130), r.uniform(20, 40), (46, 40, 36))
    return d.finish(noise=6, blotch=10, seed=282)


# ------------------------------------------------------------------ materials
def _tile(base, seed):
    return Draft(1024, 1024, bg=base, wrap_x=True, wrap_y=True), rng(seed)


def mat_ground():
    d, r = _tile((46, 46, 52), 291)
    for _ in range(220):
        rx = r.uniform(10, 40)
        d.ellipse(r.uniform(0, 1024), r.uniform(0, 1024), rx, rx * 0.75, jitter((92, 90, 98), r, 18))
    return d.finish(noise=8, blotch=14, seed=292, keep_magenta=False)


def mat_wall():
    d, r = _tile((44, 42, 46), 293)
    y = 0
    while y < 1024:
        rh = 1024 / 9
        x = r.uniform(0, 60)
        while x < 1024 + 60:
            bw = r.uniform(90, 180)
            d.ellipse(x + bw / 2, y + rh / 2, bw / 2 - 5, rh / 2 - 5, jitter((96, 92, 98), r, 16))
            x += bw
        y += rh
    return d.finish(noise=8, blotch=14, seed=294, keep_magenta=False)


def mat_platform():
    d, r = _tile((36, 28, 24), 295)
    for k in range(8):
        x = k * 128
        d.rect(x + 6, -10, x + 122, 1034, jitter((86, 66, 50), r, 12))
    return d.finish(noise=8, blotch=12, seed=296, keep_magenta=False)


def mat_beam():
    d, r = _tile((58, 44, 34), 297)
    for _ in range(120):
        y = r.uniform(0, 1024)
        d.rect(-10, y, 1034, y + r.uniform(2, 6), jitter((40, 30, 24), r, 8))
    for x in (200, 712):
        for k in range(8):
            d.rect(x - 30, -10, x + 30, 1034, (110, 92, 66))
            d.rect(x - 30, k * 128, x + 30, k * 128 + 6, (80, 66, 48))
    return d.finish(noise=7, blotch=10, seed=298, keep_magenta=False)


def mat_ceiling():
    d, r = _tile((40, 30, 24), 299)
    for k in range(10):
        y = k * 102.4
        d.rect(-10, y + 3, 1034, y + 99, jitter((74, 56, 42), r, 10))
    for x in (0, 512):
        d.rect(x - 50, -10, x + 50, 1034, (52, 38, 28))
    return d.finish(noise=7, blotch=12, seed=300, keep_magenta=False)


# ------------------------------------------------------------------ props
def _prop(w=1024, h=1024):
    return Draft(w, h, wrap_x=False)


def p_sanduk():
    d = _prop()
    crate(d, 212, 300, 812, 900, (92, 72, 56))
    d.rect(212, 560, 812, 590, (140, 116, 80))       # rope around it
    return d.finish(noise=6, blotch=10, seed=1)


def p_bacva():
    d = _prop()
    barrel(d, 512, 240, 930, 200, 50, (70, 54, 42), hoop=(48, 46, 46))
    return d.finish(noise=6, blotch=10, seed=2)


def p_blok():
    d = _prop()
    d.poly([(180, 430), (260, 380), (800, 390), (850, 450), (840, 900), (170, 900)], (78, 76, 84))
    d.rect(200, 600, 820, 610, (56, 54, 60))
    return d.finish(noise=9, blotch=14, seed=3)


def p_most():
    d = _prop(1536, 512)
    d.rect(40, 300, 1496, 340, (92, 68, 50))
    for k in range(24):
        d.rect(40 + k * 61, 300, 44 + k * 61, 340, (60, 44, 34))
    for x in (60, 760, 1460):
        d.rect(x - 12, 120, x + 12, 360, (74, 56, 42))
    for yy in (150, 230):
        pts = [(60 + t * 1400, yy + math.sin(math.pi * ((t * 2) % 1)) * 30) for t in np.linspace(0, 1, 60)]
        d.line(pts, (140, 116, 80), width=8)
    return d.finish(noise=7, blotch=10, seed=4)


def p_luk():
    d = _prop()
    d.arch(150, 870, 170, 940, (80, 78, 88), hole=MAG, thickness=120)
    d.poly([(560, 160), (870, 170), (870, 640), (760, 420), (640, 260)], MAG)
    r = rng(5)
    for _ in range(6):
        d.boulder(r.uniform(200, 820), 940, r.uniform(40, 90), r.uniform(20, 40), (70, 68, 76))
    return d.finish(noise=9, blotch=14, seed=5)


def p_baklja():
    d = _prop()
    d.rect(440, 520, 600, 560, (50, 48, 50))
    d.poly([(470, 520), (554, 520), (530, 760), (494, 760)], (56, 52, 52))
    d.rect(440, 760, 584, 790, (50, 48, 50))
    d.ellipse(512, 420, 70, 120, (255, 150, 50))
    d.ellipse(512, 440, 34, 70, (255, 226, 150))
    return d.finish(noise=5, blotch=8, seed=6)


def p_vrata():
    d = _prop()
    d.arch(120, 904, 80, 990, (86, 82, 90), hole=(70, 50, 36), thickness=110)
    for k in range(6):
        d.rect(240 + k * 92, 220, 244 + k * 92, 990, (48, 34, 24))
    for y in (380, 620, 860):
        d.rect(230, y, 794, y + 30, (44, 42, 44))
        for k in range(7):
            d.ellipse(270 + k * 80, y + 15, 9, 9, (90, 88, 86))
    d.ellipse(700, 560, 30, 30, (60, 58, 58))
    return d.finish(noise=7, blotch=12, seed=7)


def p_cekrk():
    d = _prop()
    for x in (300, 724):
        d.poly([(x - 60, 930), (x - 20, 400), (x + 20, 400), (x + 60, 930)], (90, 68, 48))
    d.rect(250, 470, 774, 560, (110, 84, 58))
    for k in range(8):
        d.rect(300 + k * 56, 470, 336 + k * 56, 560, (150, 128, 90))     # rope turns
    d.ellipse(830, 515, 110, 110, (84, 62, 44))
    d.ellipse(830, 515, 80, 80, MAG)
    for a in range(6):
        ang = a * math.pi / 3
        d.line([(830, 515), (830 + 100 * math.cos(ang), 515 + 100 * math.sin(ang))], (84, 62, 44), width=18)
    return d.finish(noise=6, blotch=10, seed=8)


def p_konopac():
    d = _prop()
    for k in range(7):
        d.ellipse(512, 860 - k * 52, 330 - k * 12, 60, (150, 124, 84))
        d.ellipse(512, 860 - k * 52, 300 - k * 12, 40, (120, 98, 64))
    d.ellipse(512, 540, 200, 34, (90, 72, 48))
    d.line([(700, 520), (820, 420), (880, 300)], (150, 124, 84), width=30)
    return d.finish(noise=6, blotch=10, seed=9)


def p_kolje():
    d = _prop(1536, 1024)
    r = rng(10)
    for k in range(9):
        x = 120 + k * 160
        top = 260 + r.uniform(-60, 80)
        d.poly([(x - 40, 960), (x - 40, top + 90), (x, top), (x + 40, top + 90), (x + 40, 960)],
               jitter((96, 74, 54), r, 10))
    d.rect(80, 560, 1460, 600, (80, 62, 46))
    d.rect(80, 780, 1460, 820, (80, 62, 46))
    return d.finish(noise=7, blotch=12, seed=10)


BIOME = {
    'id': 'klisura',
    'layers': [
        {'id': 'sky', 'draw': sky, 'kind': 'sky', 'strength': 0.6,
         'prompt': sky_prompt('a dramatic stormy dusk sky: heavy dark slate-blue thunderclouds filling the upper part, '
                              'lower down bruised purple clouds, and near the horizon a glowing band of deep red and '
                              'orange sunset light breaking under the storm', LIGHT)},
        {'id': 'far', 'draw': far, 'kind': 'far', 'strength': 0.74,
         'prompt': layer_prompt('distant steep mountains of a deep Balkan gorge seen against the sunset, dark '
                                'blue-purple silhouettes with warm red rim light on the crests, two ranges one behind '
                                'the other, faint mist between them', LIGHT)},
        {'id': 'mid', 'draw': mid, 'kind': 'mid', 'strength': 0.74,
         'prompt': layer_prompt('the Kačanik gorge: the far wall of a deep rocky canyon with steep wet cliffs, cut by a '
                                'narrow side ravine spanned by an old wooden trestle bridge with a railing; on the '
                                'canyon rim on the right stands Musa\'s tower, a tall grim medieval stone tower with a '
                                'dark pyramid roof and one lit window; a fast foaming river runs along the bottom',
                                LIGHT)},
        {'id': 'near', 'draw': near, 'kind': 'near', 'strength': 0.72,
         'prompt': layer_prompt('the dark wet rocky bank of a mountain river in a gorge: big boulders, a twisted pine '
                                'bent sideways by the wind, two wooden posts anchoring a rope bridge with sagging '
                                'ropes, a broken wooden fence, all in deep shadow with warm sunset rim light', LIGHT)},
    ],
    'interior': [
        {'id': 'in-back', 'draw': in_back, 'kind': 'sky', 'strength': 0.62,
         'prompt': back_prompt('the inner wall of an old stone tower: rough dark grey fieldstone masonry, four tall '
                               'narrow arrow slits with cold stormy light, two heavy timber floor beams crossing the '
                               'wall, warm lantern glow on the stones', INSIDE)},
        {'id': 'in-far', 'draw': in_far, 'kind': 'far', 'strength': 0.72,
         'prompt': interior_prompt('the wooden inner structure of a tall tower: zig-zag timber staircases with '
                                   'landings, rows of wooden posts with diagonal braces, a plank floor above', INSIDE)},
        {'id': 'in-mid', 'draw': in_mid, 'kind': 'mid', 'strength': 0.72,
         'prompt': interior_prompt('a guard room inside a medieval stone tower: a heavy iron-banded wooden door in a '
                                   'stone arch, a wooden rack of spears, a wooden chest and two barrels, iron chains '
                                   'and a hook hanging from a beam, plank floor', INSIDE)},
        {'id': 'in-near', 'draw': in_near, 'kind': 'near', 'strength': 0.68,
         'prompt': interior_prompt('dark foreground inside a tower: two thick wooden posts with diagonal braces '
                                   'holding a heavy beam along the top, a black iron lantern hanging with a warm flame, '
                                   'two hanging ropes, rubble on the floor', INSIDE)},
    ],
    'materials': {
        'ground': {'draw': mat_ground, 'prompt': 'wet dark grey river gravel and slate pebbles'},
        'wall': {'draw': mat_wall, 'prompt': 'rough dark grey fieldstone masonry of an old tower, irregular stones '
                                             'with deep mortar joints'},
        'platform': {'draw': mat_platform, 'prompt': 'wet dark weathered wooden planks laid side by side, a bridge '
                                                     'deck'},
        'beam': {'draw': mat_beam, 'prompt': 'dark tarred timber with two bands of rope lashing'},
        'ceiling': {'draw': mat_ceiling, 'prompt': 'dark old wooden plank ceiling with two heavy timber joists'},
    },
    'props': [
        {'id': 'sanduk', 'draw': p_sanduk, 'w': 64, 'h': 64, 'solid': True,
         'what': 'a dark wet wooden crate tied with a rope'},
        {'id': 'bacva', 'draw': p_bacva, 'w': 56, 'h': 72, 'solid': True,
         'what': 'an upright dark tarred wooden barrel with black iron hoops'},
        {'id': 'kameni-blok', 'draw': p_blok, 'w': 84, 'h': 64, 'solid': True,
         'what': 'a block of dark grey slate stone with a crack across it'},
        {'id': 'most', 'draw': p_most, 'w': 300, 'h': 100, 'solid': True, 'size': (1536, 512),
         'what': 'a section of an old wooden rope bridge: a plank deck on three posts with two sagging rope rails'},
        {'id': 'rusevni-luk', 'draw': p_luk, 'w': 260, 'h': 260, 'solid': False,
         'what': 'a ruined dark stone arch with its upper right part collapsed, fallen stones at its feet'},
        {'id': 'baklja', 'draw': p_baklja, 'w': 50, 'h': 90, 'solid': False,
         'what': 'a burning torch in a black wrought iron wall sconce'},
        {'id': 'vrata', 'draw': p_vrata, 'w': 170, 'h': 220, 'solid': False,
         'what': 'a closed heavy tower door of dark oak planks with iron bands and rivets and a ring handle, set in '
                 'a round arch of dark stone'},
        {'id': 'cekrk', 'draw': p_cekrk, 'w': 130, 'h': 110, 'solid': True,
         'what': 'an old wooden winch with a drum wound with rope between two wooden trestles and a spoked wheel'},
        {'id': 'konopac', 'draw': p_konopac, 'w': 80, 'h': 50, 'solid': False,
         'what': 'a big coil of thick hemp rope lying in a pile, one end hanging off'},
        {'id': 'kolje', 'draw': p_kolje, 'w': 200, 'h': 130, 'solid': False, 'size': (1536, 1024),
         'what': 'a palisade of sharpened wooden stakes tied together with two cross rails'},
    ],
}

BIOME['ground'] = {
    'light': LIGHT, 'glight': 'cold dim dusk light with a faint red glow on wet surfaces', 'seed': 530,
    'top': ('a wet path of dark slate slabs and river gravel with puddles reflecting the red sky', (52, 50, 58),
            (96, 92, 104), 'slabs'),
    'front': ('the edge of a rocky path above a river: broken dark slate on top, wet dark rock and gravel below',
              (90, 86, 96), (58, 54, 62), (36, 34, 40), 'stones'),
    'fg': {'busen': ('a clump of dry grass bent sideways by the storm wind', (122, 104, 72)),
           'kamenje': ('a cluster of sharp wet dark slate rocks', (74, 72, 82)),
           'koren': ('exposed twisted roots of a mountain pine clinging to rock', (70, 54, 44)),
           'ograda': ('a short broken wooden railing with a frayed rope tied between two posts', (84, 64, 48))},
}
