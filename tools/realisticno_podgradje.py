"""Podgrađe: Prilep, Marko's town under the fortress hill, in the golden hour. Plus the cellars and the dungeon."""
import numpy as np

from realisticno_draw import Draft, MAG, barrel, crate, jitter, mix, rng, sky_gradient
from realisticno_common import LAYER, SKY, layer_prompt, sky_prompt, interior_prompt, back_prompt

LIGHT = ('warm golden hour light, low sun from the left, long soft shadows, honey-coloured light on stone, '
         'light atmospheric haze, Balkan summer evening')
INSIDE = ('dim underground light from a few torches, warm orange pools of light fading into deep shadow, '
          'dusty air, damp old stone')


# ------------------------------------------------------------------ outdoor
def sky():
    w, h = SKY
    d = sky_gradient(w, h, [(0, (58, 70, 116)), (0.3, (112, 104, 146)), (0.55, (214, 146, 116)),
                            (0.75, (248, 186, 118)), (1, (255, 214, 152))],
                     seed=11, glow=(w * 0.28, h * 0.8, w * 0.16, (255, 236, 186), 0.85),
                     clouds=[(h * 0.18, 34, (150, 112, 132), 7), (h * 0.36, 26, (226, 150, 120), 7),
                             (h * 0.55, 20, (255, 190, 130), 6), (h * 0.68, 14, (255, 214, 160), 4)])
    return d.finish(noise=3, blotch=6, seed=12, keep_magenta=False)


def far():
    w, h = LAYER
    d = Draft(w, h)
    d.shaded_ridge(h * 0.50, h * 0.11, 21, lit=(222, 176, 162), shadow=(126, 110, 150), haze=(206, 176, 170),
                   haze_amt=0.55, kmax=40)
    d.shaded_ridge(h * 0.64, h * 0.07, 22, lit=(210, 156, 118), shadow=(104, 90, 116), haze=(196, 164, 140),
                   haze_amt=0.5, kmax=30)
    # the fortress hill (Markove kule): granite knobs, walls along the crest
    cx = w * 0.60
    r = rng(23)
    from realisticno_draw import pnoise
    nz = pnoise(w, 26, kmin=8, kmax=90, power=0.8)
    prof = np.full(w, h + 2.0)
    for x in range(int(w * 0.36), int(w * 0.86)):
        t = (x - cx) / (w * 0.25)
        prof[x] = h * 0.36 + h * 0.34 * min(1, abs(t)) ** 1.5 + nz[x] * 7
    d.shaded_ridge(0, 0, 27, lit=(206, 150, 112), shadow=(110, 86, 100), haze=(190, 160, 140), haze_amt=0.35,
                   ridge=prof, gully=0.15, facing_gain=4)
    for i in range(18):
        bx = r.uniform(w * 0.42, w * 0.80)
        t = (bx - cx) / (w * 0.25)
        by = h * 0.36 + h * 0.34 * min(1, abs(t)) ** 1.5 + r.uniform(4, 40)
        d.boulder(bx, by, r.uniform(30, 70), r.uniform(16, 34), (150, 120, 118), lit=(190, 150, 128), seed=i)
    stone = (160, 128, 116)
    d.wall(w * 0.50, w * 0.72, h * 0.33, h * 0.44, stone, crenel=8, gap=7, merlon_h=7)
    for tx, top, tw in ((0.51, 0.24, 34), (0.57, 0.27, 26), (0.615, 0.17, 44), (0.67, 0.25, 30), (0.715, 0.28, 30)):
        d.tower(w * tx, tw, h * top, h * 0.42, stone, crenel=True, slit=True, windows=1)
    # the plain: strips of fields with hedgerows and lone trees, so nothing reads as a road
    for k, (y0, col) in enumerate(((0.80, (176, 152, 104)), (0.86, (150, 140, 84)), (0.92, (190, 160, 100)))):
        d.rect(0, h * y0, w, h, col)
    for i in range(150):
        x = r.uniform(0, w)
        y = h * r.choice([0.80, 0.86, 0.92]) + 2
        d.ellipse(x, y - 6, r.uniform(10, 26), r.uniform(6, 12), jitter((96, 96, 60), r, 10))
    return d.finish(noise=5, blotch=10, seed=25)


def mid():
    w, h = LAYER
    d = Draft(w, h)
    r = rng(31)
    stone, lit, shade = (172, 136, 100), (214, 168, 116), (128, 100, 80)
    roof = (158, 72, 46)
    # rampart along the whole width
    d.wall(0, w, h * 0.44, h * 0.80, stone, crenel=16, gap=12, merlon_h=14)
    d.rect(0, h * 0.70, w, h * 0.80, shade)
    d.rect(0, h * 0.79, w, h, (128, 104, 70))                    # packed earth in front of the wall, no gaps
    towers = [(0.07, 0.20, 120, 'pyramid'), (0.31, 0.16, 170, None), (0.56, 0.22, 110, 'pyramid'),
              (0.80, 0.19, 130, None)]
    for tx, top, tw, rf in towers:
        x = w * tx
        d.tower(x, tw, h * top, h * 0.80, stone, roof=rf, roof_col=roof, roof_h=tw * 0.6, crenel=rf is None)
        d.rect(x - tw / 2, h * top, x - tw / 2 + tw * 0.22, h * 0.80, lit)   # sunlit left face
    # the gate in the big tower
    d.arch(w * 0.31 - 46, w * 0.31 + 46, h * 0.56, h * 0.80, (64, 44, 34))
    # houses of the podgrađe in front of the wall base
    x = w * 0.37
    while x < w * 1.25:
        hw = r.uniform(110, 210)
        if not (w * 1.0 + w * 0.31 - 80 < x + hw and x < w * 1.0 + w * 0.31 + 80):
            top = h * r.uniform(0.62, 0.68)
            wall = (226, 206, 168) if r.random() < 0.55 else (176, 142, 104)
            d.gable_house(x, x + hw, top, h * 0.88, r.uniform(34, 52), wall, jitter(roof, r, 10))
            d.rect(x, top, x + hw * 0.18, h * 0.88, mix(wall, (255, 230, 180), 0.35))
        x += hw + r.uniform(10, 50)
    for i in range(9):
        cx = r.uniform(0, w)
        hh = h * r.uniform(0.26, 0.40)
        d.cypress(cx, h * 0.86, hh, hh * 0.18, (44, 58, 36), seed=40 + i)
    for i in range(7):
        cx = r.uniform(0, w)
        d.round_tree(cx, h * 0.88, h * r.uniform(0.22, 0.3), h * r.uniform(0.18, 0.26), (78, 88, 44),
                     seed=60 + i, lit=(160, 140, 66))
    d.ridge(h * 0.88, h * 0.012, (122, 96, 58), seed=33, kmax=50)          # ground strip
    for i in range(10):
        d.boulder(r.uniform(0, w), h * 0.9, r.uniform(60, 140), r.uniform(26, 50), (150, 122, 98),
                  lit=(206, 166, 120))
    return d.finish(noise=6, blotch=12, seed=34)


def near():
    w, h = LAYER
    d = Draft(w, h)
    r = rng(41)
    # left: two-storey house, stone below, white plaster and timber above, a wooden balcony
    x0, x1 = w * 0.02, w * 0.25
    d.rect(x0, h * 0.50, x1, h * 0.94, (152, 120, 90))
    d.rect(x0 - 14, h * 0.24, x1 + 14, h * 0.50, (228, 210, 176))
    for k in range(7):
        xx = x0 - 14 + (x1 - x0 + 28) * k / 6
        d.rect(xx - 5, h * 0.24, xx + 5, h * 0.50, (78, 54, 36))
    d.rect(x0 - 14, h * 0.36, x1 + 14, h * 0.375, (78, 54, 36))
    d.poly([(x0 - 40, h * 0.24), (x0 + 60, h * 0.07), (x1 - 60, h * 0.07), (x1 + 40, h * 0.24)], (160, 72, 42))
    d.rect(x1 + 14, h * 0.40, x1 + 120, h * 0.43, (110, 76, 46))           # balcony floor
    for k in range(9):
        d.rect(x1 + 18 + k * 12, h * 0.33, x1 + 22 + k * 12, h * 0.40, (110, 76, 46))
    d.rect(x1 + 14, h * 0.33, x1 + 120, h * 0.345, (110, 76, 46))
    d.rect(x1 + 110, h * 0.43, x1 + 120, h * 0.94, (96, 66, 40))           # balcony post
    for k in range(3):
        d.rect(x0 + 50 + k * 140, h * 0.28, x0 + 90 + k * 140, h * 0.34, (60, 44, 32))   # windows
    d.arch(x0 + 170, x0 + 260, h * 0.64, h * 0.94, (152, 120, 90), hole=(70, 48, 34))    # door
    # middle: low stone garden wall with a wooden gate, bushes
    d.rect(w * 0.31, h * 0.78, w * 0.58, h * 0.94, (160, 130, 98))
    d.rect(w * 0.31, h * 0.76, w * 0.58, h * 0.79, (186, 152, 112))
    d.rect(w * 0.42, h * 0.70, w * 0.47, h * 0.94, (112, 78, 46))
    for i in range(8):
        cx = r.uniform(w * 0.28, w * 0.66)
        d.ellipse(cx, h * 0.80, r.uniform(30, 60), r.uniform(26, 40), jitter((76, 92, 44), r, 10))
    # right: a big walnut tree, and the corner of a stone tower across the seam
    d.trunk(w * 0.74, h * 0.96, h * 0.30, 60, (82, 64, 48), seed=42)
    for i in range(30):
        cx = w * 0.74 + np.clip(r.normal(), -1.6, 1.6) * w * 0.07
        cy = h * r.uniform(0.02, 0.42)
        rr = r.uniform(50, 110)
        d.ellipse(cx, cy, rr, rr * 0.75, jitter((66, 82, 38), r, 10))
    for i in range(10):
        cx = w * 0.70 + np.clip(r.normal(), -1.5, 1.5) * w * 0.04
        d.ellipse(cx, h * r.uniform(0.06, 0.32), r.uniform(26, 50), r.uniform(20, 36), jitter((150, 146, 66), r, 10))
    d.rect(w * 0.93, h * 0.0, w * 1.035, h * 0.95, (170, 134, 98))
    d.rect(w * 0.93, h * 0.0, w * 0.955, h * 0.95, (210, 166, 116))
    d.rect(w * 0.98, h * 0.30, w * 0.99, h * 0.40, (50, 36, 28))
    # wood pile and a hay stack
    for k in range(5):
        for j in range(3 - k // 2):
            d.ellipse(w * 0.62 + j * 34 + k * 6, h * 0.92 - k * 26, 18, 14, (130, 92, 56))
    d.ellipse(w * 0.86, h * 0.86, 70, 80, (196, 160, 82))
    d.rect(0, h * 0.92, w, h, (104, 78, 50))
    d.ridge(h * 0.93, h * 0.012, (96, 82, 44), seed=43, kmax=80)
    return d.finish(noise=7, blotch=14, seed=44)


# ------------------------------------------------------------------ cellars and dungeon
def in_back():
    w, h = SKY
    d = Draft(w, h, bg=(34, 28, 25))
    r = rng(51)
    rowh = 46
    y = 0
    row = 0
    while y < h:
        off = (row % 2) * 60
        x = -off
        while x < w:
            bw = r.uniform(90, 150)
            c = jitter((66, 54, 45), r, 9)
            d.rect(x + 3, y + 3, x + bw - 3, y + rowh - 3, c)
            x += bw
        y += rowh
        row += 1
    # blind arcade niches
    for k in range(4):
        cx = w * (k + 0.5) / 4
        d.arch(cx - 150, cx + 150, h * 0.26, h * 0.88, (40, 32, 28), hole=(22, 17, 15), thickness=34)
    d.rect(0, h * 0.88, w, h, (44, 37, 31))
    d.rect(0, 0, w, h * 0.08, (26, 21, 19))
    im = d.finish(noise=5, blotch=10, seed=52, keep_magenta=False)
    a = np.asarray(im, np.float32)
    yy, xx = np.mgrid[0:h, 0:w]
    glow = np.zeros((h, w), np.float32)
    for k in range(4):
        gx = w * k / 4
        dx = np.minimum(np.abs(xx - gx), w - np.abs(xx - gx))
        glow += np.exp(-(dx ** 2 + (yy - h * 0.48) ** 2) / (2 * (h * 0.2) ** 2))
    a = a * (0.55 + 0.9 * glow[..., None]) + glow[..., None] * np.array([60, 30, 8])
    from PIL import Image
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def in_far():
    w, h = LAYER
    d = Draft(w, h)
    brick = (92, 64, 48)
    d.rect(0, 0, w, h * 0.30, brick)
    n = 3
    for k in range(n):
        x = w * k / n
        d.rect(x - 52, 0, x + 52, h, (98, 72, 56))                      # pillar
        d.rect(x - 62, h * 0.30, x + 62, h * 0.34, (118, 90, 68))        # impost
        d.rect(x - 64, h * 0.95, x + 64, h, (84, 62, 48))                # base
    for k in range(n):
        x0, x1 = w * k / n + 52, w * (k + 1) / n - 52
        span = x1 - x0
        d.rect(x0, h * 0.30, x1, h, MAG)
        d.pieslice([x0, h * 0.30 - span * 0.42, x1, h * 0.30 + span * 0.42], 180, 360, MAG)
    return d.finish(noise=6, blotch=12, seed=61)


def in_mid():
    w, h = LAYER
    d = Draft(w, h)
    r = rng(71)
    floor = h * 0.93
    # barrel racks (barrel ends towards the viewer)
    d.rect(w * 0.04, h * 0.66, w * 0.36, h * 0.69, (92, 62, 36))
    d.rect(w * 0.04, floor - 10, w * 0.36, floor, (92, 62, 36))
    for k in range(6):
        cx = w * 0.07 + k * 120
        d.ellipse(cx, h * 0.82, 56, 56, (120, 76, 42))
        d.ellipse(cx, h * 0.82, 44, 44, (104, 66, 38))
        d.ellipse(cx, h * 0.82, 8, 8, (60, 40, 26))
    for k in range(5):
        cx = w * 0.07 + 60 + k * 120
        d.ellipse(cx, h * 0.57, 56, 56, (118, 74, 42))
        d.ellipse(cx, h * 0.57, 44, 44, (102, 64, 36))
    for x in (w * 0.04, w * 0.36):
        d.rect(x - 8, h * 0.45, x + 8, floor, (84, 56, 34))
    # a cell of the dungeon: stone frame, iron bars, dark inside
    d.rect(w * 0.50, h * 0.30, w * 0.80, floor, (74, 62, 52))
    d.rect(w * 0.53, h * 0.40, w * 0.77, floor, (16, 13, 12))
    for k in range(13):
        xx = w * 0.535 + k * (w * 0.23 / 12)
        d.rect(xx - 5, h * 0.40, xx + 5, floor, (52, 50, 50))
    d.rect(w * 0.53, h * 0.47, w * 0.77, h * 0.49, (52, 50, 50))
    d.rect(w * 0.53, h * 0.80, w * 0.77, h * 0.82, (52, 50, 50))
    # stone stairs up to the right (side view)
    steps = 9
    sx0 = w * 0.84
    for k in range(steps):
        d.rect(sx0 + k * 28, floor - (k + 1) * 34, w * 1.02, floor, (88, 74, 62))
    # chains on the wall
    for cx in (w * 0.44, w * 0.47):
        for k in range(14):
            d.ellipse(cx, h * 0.30 + k * 14, 5, 8, (60, 58, 56))
    d.rect(0, floor, w, h, (62, 50, 40))
    return d.finish(noise=6, blotch=12, seed=72)


def in_near():
    w, h = LAYER
    d = Draft(w, h)
    for x in (w * 0.16, w * 0.68):
        d.rect(x - 85, 0, x + 85, h, (56, 46, 39))
        d.rect(x - 85, 0, x - 55, h, (120, 78, 46))                      # torch-lit edge
        d.rect(x - 100, h * 0.92, x + 100, h, (50, 42, 36))
    d.rect(0, 0, w, h * 0.07, (60, 40, 28))                              # beam under the vault
    for cx, ln in ((w * 0.36, 18), (w * 0.41, 24), (w * 0.88, 14)):
        for k in range(ln):
            d.ellipse(cx, h * 0.07 + k * 15, 6, 9, (44, 42, 40))
    # a torch in a bracket on the right pillar
    tx = w * 0.68 - 100
    d.rect(tx - 6, h * 0.40, tx + 6, h * 0.52, (50, 40, 30))
    d.ellipse(tx, h * 0.37, 20, 34, (255, 170, 70))
    d.ellipse(tx, h * 0.38, 10, 18, (255, 236, 170))
    r = rng(81)
    for i in range(16):
        d.boulder(r.uniform(0, w), h, r.uniform(40, 120), r.uniform(18, 40), (62, 52, 44))
    return d.finish(noise=6, blotch=10, seed=82)


# ------------------------------------------------------------------ materials (seamless both ways)
def _tile(base, seed):
    d = Draft(1024, 1024, bg=base, wrap_x=True, wrap_y=True)
    return d, rng(seed)


def mat_ground():
    d, r = _tile((112, 86, 58), 91)
    for _ in range(170):
        x, y = r.uniform(0, 1024), r.uniform(0, 1024)
        rx = r.uniform(18, 54)
        d.ellipse(x, y, rx, rx * r.uniform(0.6, 0.9), jitter((150, 128, 104), r, 18))
    return d.finish(noise=8, blotch=16, seed=92, keep_magenta=False)


def mat_wall():
    d, r = _tile((96, 80, 64), 93)
    rows = 8
    for j in range(rows):
        y = j * 1024 / rows
        x = (j % 2) * 96
        k = 0
        while k < 6:
            bw = 1024 / 5
            d.rect(x + 5, y + 5, x + bw - 5, y + 1024 / rows - 5, jitter((182, 152, 116), r, 14))
            x += bw
            k += 1
    return d.finish(noise=8, blotch=14, seed=94, keep_magenta=False)


def mat_platform():
    d, r = _tile((70, 48, 30), 95)
    for j in range(6):
        y = j * 1024 / 6
        d.rect(-10, y + 4, 1034, y + 1024 / 6 - 4, jitter((134, 96, 60), r, 12))
        for k in range(3):
            d.ellipse(r.uniform(0, 1024), y + 1024 / 12, 6, 6, (60, 56, 52))
    return d.finish(noise=8, blotch=12, seed=96, keep_magenta=False)


def mat_beam():
    d, r = _tile((104, 72, 44), 97)
    for _ in range(120):
        y = r.uniform(0, 1024)
        d.rect(-10, y, 1034, y + r.uniform(2, 7), jitter((80, 54, 34), r, 10))
    return d.finish(noise=6, blotch=10, seed=98, keep_magenta=False)


def mat_ceiling():
    d, r = _tile((36, 28, 24), 99)
    rows = 16
    for j in range(rows):
        y = j * 1024 / rows
        x = (j % 2) * 40
        while x < 1024:
            d.rect(x + 3, y + 3, x + 80 - 3, y + 64 - 3, jitter((92, 60, 46), r, 12))
            x += 80
    return d.finish(noise=7, blotch=14, seed=100, keep_magenta=False)


# ------------------------------------------------------------------ props (on magenta)
def _prop(w=1024, h=1024):
    return Draft(w, h, wrap_x=False)


def p_sanduk():
    d = _prop()
    crate(d, 212, 300, 812, 900, (146, 106, 66))
    return d.finish(noise=6, blotch=10, seed=1)


def p_bacva():
    d = _prop()
    barrel(d, 512, 240, 930, 200, 50, (138, 90, 50))
    return d.finish(noise=6, blotch=10, seed=2)


def p_blok():
    d = _prop()
    d.poly([(190, 420), (240, 380), (820, 390), (850, 440), (840, 900), (180, 900)], (150, 134, 116))
    d.rect(190, 390, 840, 430, (186, 168, 142))
    return d.finish(noise=9, blotch=14, seed=3)


def p_greda():
    d = _prop(1536, 512)
    d.rect(60, 190, 1476, 330, (118, 82, 50))
    d.rect(60, 190, 1476, 210, (150, 110, 70))
    for x in (200, 760, 1320):
        d.rect(x, 180, x + 26, 340, (62, 58, 56))
    return d.finish(noise=7, blotch=10, seed=4)


def p_luk():
    d = _prop()
    d.arch(150, 870, 170, 940, (150, 128, 104), hole=MAG, thickness=120)
    d.poly([(700, 160), (870, 170), (870, 520), (800, 420), (760, 300)], MAG)    # broken top right
    d.rect(150, 900, 870, 940, (120, 104, 88))
    r = rng(5)
    for _ in range(6):
        d.boulder(r.uniform(200, 820), 940, r.uniform(40, 90), r.uniform(20, 40), (140, 120, 100))
    return d.finish(noise=9, blotch=14, seed=5)


def p_mangal():
    d = _prop()
    for a, b in (((380, 930), (470, 640)), ((644, 930), (554, 640)), ((512, 930), (512, 640))):
        d.line([a, b], (52, 48, 46), width=22)
    d.chord([330, 520, 694, 700], 0, 180, (64, 58, 54))
    d.ellipse(512, 470, 150, 120, (255, 160, 60))
    d.ellipse(512, 420, 80, 110, (255, 220, 140))
    d.ellipse(470, 330, 40, 70, (255, 190, 90))
    return d.finish(noise=5, blotch=8, seed=6)


def p_kapija():
    d = _prop()
    d.arch(140, 884, 100, 980, (158, 132, 104), hole=(110, 72, 42), thickness=90)
    for k in range(6):
        d.rect(240 + k * 92, 200, 244 + k * 92, 980, (82, 54, 32))
    for y in (420, 700):
        d.rect(230, y, 794, y + 26, (60, 56, 54))
    for k in range(5):
        for j in range(8):
            d.ellipse(280 + k * 120, 300 + j * 80, 7, 7, (70, 66, 62))
    return d.finish(noise=7, blotch=12, seed=7)


def p_cup():
    d = _prop()
    d.ellipse(512, 560, 270, 300, (176, 100, 64))
    d.rect(0, 900, 1024, 1024, MAG)
    d.rect(392, 230, 632, 300, (170, 96, 60))
    d.rect(372, 210, 652, 240, (188, 112, 72))
    d.poly([(400, 860), (624, 860), (580, 920), (444, 920)], (160, 90, 58))
    d.rect(250, 480, 774, 500, (150, 84, 54))
    return d.finish(noise=6, blotch=10, seed=8)


def p_bunar():
    d = _prop()
    d.rect(250, 640, 774, 940, (150, 130, 108))
    d.rect(236, 620, 788, 660, (176, 154, 126))
    for x in (290, 714):
        d.rect(x, 270, x + 24, 640, (100, 70, 44))
    d.poly([(200, 300), (512, 130), (824, 300), (800, 320), (512, 170), (224, 320)], (150, 72, 44))
    d.rect(300, 400, 724, 420, (100, 70, 44))
    d.rect(500, 420, 506, 560, (150, 130, 90))
    d.rect(470, 560, 540, 620, (110, 76, 46))
    return d.finish(noise=7, blotch=12, seed=9)


def p_kolica():
    d = _prop(1536, 1024)
    d.rect(260, 420, 1200, 600, (130, 92, 56))
    for k in range(4):
        d.rect(260, 420 + k * 45, 1200, 424 + k * 45, (90, 62, 36))
    d.line([(1200, 560), (1480, 640)], (110, 78, 46), width=26)
    for cx in (440, 1020):
        d.ellipse(cx, 740, 190, 190, (96, 66, 40))
        d.ellipse(cx, 740, 150, 150, MAG)
        for a in range(8):
            ang = a * np.pi / 4
            d.line([(cx, 740), (cx + 160 * np.cos(ang), 740 + 160 * np.sin(ang))], (110, 76, 46), width=16)
        d.ellipse(cx, 740, 30, 30, (80, 56, 34))
    return d.finish(noise=6, blotch=10, seed=10)


# ------------------------------------------------------------------ the biome
BIOME = {
    'id': 'podgradje',
    'layers': [
        {'id': 'sky', 'draw': sky, 'kind': 'sky', 'strength': 0.6,
         'prompt': sky_prompt('a wide golden hour sky over the Pelagonia plain: deep blue-violet at the top, '
                              'warm peach and gold towards the horizon, a low hazy sun glow on the left, '
                              'long soft cumulus and stratus clouds lit orange and pink from below', LIGHT)},
        {'id': 'far', 'draw': far, 'kind': 'far', 'strength': 0.74, 'v': 3,
         'prompt': layer_prompt('distant hazy Balkan mountain ridges in blue-violet atmospheric haze, and on a '
                                'rocky granite hill in the middle the far-away ruined medieval fortress of Prilep '
                                '(Markove kule): stone walls and square towers following the crest, rounded granite '
                                'boulders on the slopes, a flat golden plain at the bottom', LIGHT)},
        {'id': 'mid', 'draw': mid, 'kind': 'mid', 'strength': 0.74, 'v': 3,
         'prompt': layer_prompt('the medieval Serbian town of Prilep under its fortress: a long stone rampart with '
                                'crenellations and square towers, some with red tile pyramid roofs, an arched gate, '
                                'in front of the wall the houses of the podgrađe with whitewashed and stone walls and '
                                'red clay tile roofs, dark cypresses and walnut trees, rounded granite boulders, '
                                'a strip of dry golden grass at the bottom', LIGHT)},
        {'id': 'near', 'draw': near, 'kind': 'near', 'strength': 0.74, 'v': 3,
         'prompt': layer_prompt('close foreground of a medieval Balkan town street seen from the side: on the left a '
                                'two-storey house with a stone ground floor, whitewashed timber-framed upper floor, '
                                'a carved wooden balcony and a red tile roof; a low dry-stone garden wall with a '
                                'wooden gate and green bushes in the middle; a big old walnut tree on the right, '
                                'a stack of firewood, a haystack and the corner of a stone tower at the right edge; '
                                'packed earth ground at the bottom', LIGHT)},
    ],
    'interior': [
        {'id': 'in-back', 'draw': in_back, 'kind': 'sky', 'strength': 0.62,
         'prompt': back_prompt('the back wall of a medieval stone cellar under a fortress: rough masonry of '
                               'old limestone blocks, a row of four deep round-arched blind niches, a low dark '
                               'vault above, a packed earth floor, warm torchlight pools between the niches',
                               INSIDE)},
        {'id': 'in-far', 'draw': in_far, 'kind': 'far', 'strength': 0.7,
         'prompt': interior_prompt('a row of massive brick and stone pillars carrying round arches of a vaulted '
                                   'medieval cellar, old red bricks and limestone, the arch openings are empty',
                                   INSIDE)},
        {'id': 'in-mid', 'draw': in_mid, 'kind': 'mid', 'strength': 0.7,
         'prompt': interior_prompt('inside a medieval wine cellar and dungeon: oak wine barrels lying on wooden '
                                   'racks with their round ends facing the viewer, a prison cell with a stone frame and '
                                   'rusty iron bars with darkness behind them, iron chains hanging on the wall, worn '
                                   'stone stairs rising to the right, stone floor', INSIDE)},
        {'id': 'in-near', 'draw': in_near, 'kind': 'near', 'strength': 0.68, 'band': 110,
         'prompt': interior_prompt('dark foreground of a medieval dungeon: two massive rough stone pillars, a heavy '
                                   'wooden beam along the top, rusty iron chains hanging down, a burning torch in an '
                                   'iron bracket on a pillar, rubble on the floor', INSIDE)},
    ],
    'materials': {
        'ground': {'draw': mat_ground, 'prompt': 'packed brown earth with embedded rounded cobblestones and pebbles, '
                                                 'dry dusty medieval town street'},
        'wall': {'draw': mat_wall, 'prompt': 'medieval ashlar wall of large warm limestone blocks in running bond '
                                             'with worn mortar joints, weathered edges'},
        'platform': {'draw': mat_platform, 'prompt': 'weathered horizontal oak planks with iron nails, gaps between '
                                                     'boards, old wooden floor'},
        'beam': {'draw': mat_beam, 'prompt': 'hand-hewn oak timber beam surface, strong horizontal wood grain, '
                                             'adze marks, old dark wood'},
        'ceiling': {'draw': mat_ceiling, 'prompt': 'dark old brick vault surface of a cellar, small red-brown bricks '
                                                   'with soot and damp stains'},
    },
    'props': [
        {'id': 'sanduk', 'draw': p_sanduk, 'w': 64, 'h': 64, 'solid': True,
         'what': 'an old wooden crate made of rough oak planks with a diagonal brace and iron corners'},
        {'id': 'bacva', 'draw': p_bacva, 'w': 56, 'h': 72, 'solid': True,
         'what': 'an upright oak barrel with dark iron hoops'},
        {'id': 'kameni-blok', 'draw': p_blok, 'w': 84, 'h': 64, 'solid': True,
         'what': 'a rough-cut limestone building block with chipped edges'},
        {'id': 'greda', 'draw': p_greda, 'w': 300, 'h': 100, 'solid': True, 'size': (1536, 512),
         'what': 'a long heavy horizontal oak beam with three iron brackets'},
        {'id': 'rusevni-luk', 'draw': p_luk, 'w': 260, 'h': 260, 'solid': False,
         'what': 'a ruined medieval stone arch with the top right part broken off, fallen stones at its feet'},
        {'id': 'mangal', 'draw': p_mangal, 'w': 64, 'h': 92, 'solid': False,
         'what': 'a wrought iron brazier bowl on three legs with a burning fire and glowing coals'},
        {'id': 'kapija', 'draw': p_kapija, 'w': 170, 'h': 220, 'solid': False,
         'what': 'a closed heavy wooden town gate of vertical oak planks with iron bands and studs, set in a round '
                 'stone arch'},
        {'id': 'cup', 'draw': p_cup, 'w': 70, 'h': 80, 'solid': True,
         'what': 'a large terracotta storage jar (pithos) for wine or grain'},
        {'id': 'bunar', 'draw': p_bunar, 'w': 120, 'h': 130, 'solid': True,
         'what': 'a stone village well with a small red tile roof on two wooden posts, a crank and a wooden bucket'},
        {'id': 'kolica', 'draw': p_kolica, 'w': 170, 'h': 110, 'solid': True, 'size': (1536, 1024),
         'what': 'an old empty two-wheeled wooden hand cart with spoked wheels'},
    ],
}

BIOME['ground'] = {
    'light': LIGHT, 'glight': 'warm golden evening sunlight raking across the surface', 'seed': 510,
    'top': ('an old cobblestone street of rounded grey and honey-coloured stones with dust and dry grass in the '
            'joints', (120, 96, 66), (170, 150, 124), 'stones'),
    'front': ('the edge of a cobbled street: a row of worn curb stones on top, packed brown earth with pebbles and '
              'dry grass roots below', (168, 146, 118), (112, 86, 60), (84, 64, 46), 'stones'),
    'fg': {'busen': ('a tuft of tall dry golden grass and wild oats', (190, 160, 90)),
           'kamenje': ('a cluster of rounded granite boulders', (176, 156, 132)),
           'koren': ('gnarled roots of an old walnut tree rising out of the ground', (96, 72, 52)),
           'ograda': ('a short piece of an old woven wattle fence on wooden stakes', (122, 94, 62))},
}
