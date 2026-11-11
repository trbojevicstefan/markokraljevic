# Hand-composed background layers, made locally from art that is already in the pack (no new orders).
# The artist's layers carry the same village house and church in nearly every level, and the night/storm paintings
# are whole different scenes (the forest's night "sky" is a monastery on a cliff). This script rubs the buildings out
# where they do not belong, plants the level's own things instead (trees, rocks, reeds, ruins), and writes
#   dist/assets/world/<level>-<layer>-rucno.webp  (+ -rucno-night, -rucno-storm)
# The game takes a "-rucno" file instead of the artist's one whenever files.json lists it (rucniSloj in game.js);
# day, night and storm are looked up separately, so a recipe may replace only the night sky, for example.
# Run again if the source layers or props are ever redrawn:  python make-rucni-slojevi.py [level-layer ...]
import os, sys, json, glob
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from skimage import color

ROOT = os.path.dirname(os.path.abspath(__file__))
ART = os.path.join(ROOT, 'dist', 'assets', 'world')
W, H = 2172, 724
P = round(.88 * W)   # what the game really repeats: the last 12 % of a tile is crossfaded into its first 12 % (SEAM in stage3d.js)
_cache = {}


def src(name):
    return Image.open(os.path.join(ART, name + '.webp')).convert('RGBA')


def prop(name):
    if name not in _cache:
        im = src(name)
        _cache[name] = im.crop(im.getbbox())
    return _cache[name]


def tone(im, bright=1.0, haze=None, amt=0.0, sat=1.0):
    a = np.asarray(im).astype(np.float32)
    rgb = a[..., :3]
    if sat != 1.0:
        g = rgb.mean(axis=2, keepdims=True)
        rgb = g + (rgb - g) * sat
    rgb = rgb * bright
    if haze is not None and amt:
        rgb = rgb * (1 - amt) + np.array(haze, np.float32) * amt
    a[..., :3] = np.clip(rgb, 0, 255)
    return Image.fromarray(a.astype(np.uint8), 'RGBA')


def mask(polys, feather):
    m = Image.new('L', (W, H), 0)
    d = ImageDraw.Draw(m)
    for p in polys:
        d.polygon([(x * W, y * H) for x, y in p], fill=255)
    return m.filter(ImageFilter.GaussianBlur(feather)) if feather else m


def erase(im, polys, feather=5):
    m = np.asarray(mask(polys, feather)).astype(np.float32) / 255
    a = np.asarray(im).copy()
    a[..., 3] = (a[..., 3].astype(np.float32) * (1 - m)).astype(np.uint8)
    return Image.fromarray(a, 'RGBA')


def box(x0, y0, x1, y1):
    return [(x0, y0), (x1, y0), (x1, y1), (x0, y1)]


def plant(im, name, cx, base, h, flip=False, crop=None, **t):
    """Stand a prop on the layer: cx = centre (0..1 of the width), base = y of its foot in px, h = height in px.
    It is also pasted one game period (0.88 of the width) to each side, so a thing standing on the seam comes out
    the same in both crossfaded strips: solid, not a ghost."""
    s_ = name if isinstance(name, Image.Image) else prop(name)
    if crop:
        s_ = s_.crop(crop)
    s = h / s_.height
    p = s_.resize((max(1, round(s_.width * s)), max(1, round(h))), Image.LANCZOS)
    if flip:
        p = p.transpose(Image.FLIP_LEFT_RIGHT)
    if t:
        p = tone(p, **t)
    x = round(cx * W - p.width / 2)
    layer = Image.new('RGBA', im.size, (0, 0, 0, 0))
    for dx in (0, -P, P):
        if x + dx < W and x + dx + p.width > 0:
            layer.paste(p, (x + dx, round(base - p.height)))
    return Image.alpha_composite(im, layer)


def cut(im, bx, soft=(0, 0, 0, 0)):
    """A piece of a layer (box in 0..1) to plant elsewhere; soft = px of fade on its left, top, right, bottom edge."""
    x0, y0, x1, y1 = bx
    c = im.crop((round(x0 * W), round(y0 * H), round(x1 * W), round(y1 * H)))
    a = np.asarray(c).astype(np.float32)
    h, w = a.shape[:2]
    m = np.ones((h, w), np.float32)
    l, tp, r, b = soft
    if l: m[:, :l] *= np.linspace(0, 1, l)[None, :]
    if r: m[:, w - r:] *= np.linspace(1, 0, r)[None, :]
    if tp: m[:tp, :] *= np.linspace(0, 1, tp)[:, None]
    if b: m[h - b:, :] *= np.linspace(1, 0, b)[:, None]
    a[..., 3] *= m
    return Image.fromarray(a.astype(np.uint8), 'RGBA')


def patch(im, frm, to, soft=40, flip=False, **t):
    """Cover a part of an opaque layer (to = box 0..1) with another part of it (frm = box), faded at the edges;
    t = tone() settings for the piece (to set it back in the shadow, for example)."""
    x0, y0, x1, y1 = to
    c = cut(im, frm).resize((round((x1 - x0) * W), round((y1 - y0) * H)), Image.LANCZOS)
    if t:
        c = tone(c, **t)
    if flip:
        c = c.transpose(Image.FLIP_LEFT_RIGHT)
    a = np.asarray(c).astype(np.float32)
    h, w = a.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w]
    d = np.minimum.reduce([xx, w - 1 - xx, yy, h - 1 - yy]).astype(np.float32)
    a[..., 3] *= np.clip(d / soft, 0, 1) ** 1.5
    layer = Image.new('RGBA', im.size, (0, 0, 0, 0))
    layer.paste(Image.fromarray(a.astype(np.uint8), 'RGBA'), (round(x0 * W), round(y0 * H)))
    return Image.alpha_composite(im, layer)


def put(im, piece, x0, y0):
    """Paste a cut piece back at x0, y0 (0..1) and one game period to each side (see plant)."""
    layer = Image.new('RGBA', im.size, (0, 0, 0, 0))
    x = round(x0 * W)
    for dx in (0, -P, P):
        if x + dx < W and x + dx + piece.width > 0:
            layer.paste(piece, (x + dx, round(y0 * H)))
    return Image.alpha_composite(im, layer)


def fade_top(im, px):
    """A near layer stops below the top of the screen; whatever touches its top row shows a ruler-straight edge."""
    a = np.asarray(im).copy()
    a[:px, :, 3] = (a[:px, :, 3].astype(np.float32) * np.linspace(0, 1, px)[:, None] ** 1.5).astype(np.uint8)
    return Image.fromarray(a, 'RGBA')


def edges(im, y, left=.125, right=.875):
    """The game crossfades the last 12 % of a tile into its first 12 %: a tall thing standing there shows as a ghost
    of two different things. Clear both strips above y (0..1) and plant inside the tile, or with plant() across it."""
    return erase(im, [box(-.02, -.02, left, y), box(right, -.02, 1.02, y)], 9)


def soften(im, polys, radius=20, feather=30, tint=None, amt=0.0):
    """Lose a part of the furthest layer in the depth: blurred (and tinted) until it is only light on rock."""
    m = mask(polys, feather)
    b = im.filter(ImageFilter.GaussianBlur(radius))
    if tint is not None:
        b = tone(b, haze=tint, amt=amt)
    return Image.composite(b, im, m)


# ---------- colour: night and storm in the artist's own light ----------
def _lab_stats(a, region=None):
    if region is not None:
        x0, y0, x1, y1 = region
        a = a[round(y0 * a.shape[0]):round(y1 * a.shape[0]), round(x0 * a.shape[1]):round(x1 * a.shape[1])]
    ok = a[..., 3] > 200
    px = a[ok][:, :3]
    px = px[::max(1, len(px) // 200000)]
    lab = color.rgb2lab(px[None] / 255.0)[0]
    return lab.mean(0), lab.std(0) + 1e-6


def grade(day_base, var_base, im, region=None, lstd=(.7, 1.15), cmin=.4):
    """Give the new layer the light of the artist's night/storm painting: match the mean and spread of each Lab
    channel. The variant paintings are different scenes, so a pixel-to-pixel fit would turn them to mud."""
    ms, ss = _lab_stats(np.asarray(day_base))
    mt, st = _lab_stats(np.asarray(var_base.resize(day_base.size)), region)
    r = st / ss
    r[0] = np.clip(r[0], *lstd)
    r[1:] = np.clip(r[1:], cmin, 1.1)
    c = np.asarray(im).astype(np.float32)
    lab = color.rgb2lab(c[..., :3] / 255.0)
    lab = (lab - ms) * r + mt
    c[..., :3] = np.clip(color.lab2rgb(lab), 0, 1) * 255
    return Image.fromarray(c.astype(np.uint8), 'RGBA')


MOON = {'klisura': (.130, .110, 26), 'suma': (.586, .124, 32), 'selo': (.134, .182, 35), 'manastir': (.122, .112, 26), 'tvrdjava': (.151, .163, 32),
        'prevoj': (.146, .188, 29), 'reka': (.105, .175, 29), 'rusevine': (.181, .134, 30)}


def night_sky(level):
    """A night sky with nothing standing in it: the level's storm clouds in the blue of its night painting's sky,
    with the painting's own moon (the night 'sky' pictures are whole landscapes with a monastery on a cliff)."""
    storm, night = src(level + '-sky-storm'), src(level + '-sky-night')
    return moon(grade(storm, night, storm, region=(.3, 0, .72, .18), lstd=(.75, 1.0)), night, level)


def clean_sky(level, v, sun=None):
    """For a level whose storm sky is a painted scene too: the day clouds (sun taken out) in the night/storm light."""
    day, var = src(level + '-sky'), src(f'{level}-sky-{v}')
    if sun:
        day = patch(day, sun[0], sun[1], soft=70)
    out = grade(day, var, day, region=(.3, 0, .72, .13), lstd=(.6, .9), cmin=.12)
    return moon(out, var, level) if v == 'night' else out


def moon(out, night, level):
    mx, my, r = MOON[level]
    cx, cy = round(mx * W), round(my * H)
    R = min(int(r * 3.2), cx, cy)
    m = night.crop((cx - R, cy - R, cx + R, cy + R))
    yy, xx = np.mgrid[-R:R, -R:R]
    d = np.sqrt(xx ** 2 + yy ** 2)
    a = np.asarray(m).astype(np.float32)
    a[..., 3] = 255 * np.clip((R - d) / (R - r * 1.25), 0, 1) ** 2
    base = np.asarray(out).astype(np.float32)
    seg = base[cy - R:cy + R, cx - R:cx + R]
    k = a[..., 3:4] / 255
    seg[..., :3] = np.maximum(seg[..., :3], seg[..., :3] * (1 - k) + a[..., :3] * k)
    base[cy - R:cy + R, cx - R:cx + R] = seg
    return Image.fromarray(base.astype(np.uint8), 'RGBA')


G = 612  # where things stand in a near layer (the road's ground line hides what is below)
FAR = dict(bright=.93, haze=(150, 175, 185), amt=.2, sat=.85)   # the back row of a near layer
MID = dict(bright=.96, sat=.9)                                  # things planted into a mid layer
CAVE = dict(bright=.9, haze=(70, 140, 150), amt=.2, sat=.85)     # rock standing in the cave's teal light


# ================= Šuma =================
def suma_near(im):
    # the stone house, the arch and their fence go; what was a village street is a forest again
    im = erase(im, [[(.385, 0), (.805, 0), (.805, .60), (.83, .70), (.86, .835), (.385, .835)]], 7)
    im = edges(im, .70)
    im = erase(im, [box(-.02, -.02, .27, .62), box(.84, -.02, 1.02, .62)], 9)   # their crowns reach further in
    for a in [('prop-drvo-bukva', .165, G - 12, 420, False), ('prop-drvo-jela', .375, G - 12, 400, True), ('prop-drvo-jela', .615, G - 12, 370, False), ('prop-drvo-jela', .845, G - 12, 400, True)]:
        im = plant(im, *a, **FAR)
    for a in [('prop-drvo-hrast', .255, G, 470, False), ('prop-drvo-bukva', .475, G, 585, True), ('prop-drvo-hrast', .765, G + 4, 450, True)]:
        im = plant(im, *a, bright=.97)
    for a in [('prop-korenje', .585, G + 6, 140, False), ('prop-paprat', .185, G + 8, 92, False), ('prop-panj', .385, G + 6, 86, True), ('prop-pecurke', .69, G + 6, 62, False), ('prop-paprat', .655, G + 8, 84, True), ('prop-zbun', .33, G + 8, 96, False)]:
        im = plant(im, *a)
    return im


def suma_mid(im):
    # the hamlets on the far bank are overgrown: the vila's wood has no street in it
    for a in [('prop-drvo-hrast', .235, 628, 300, False), ('prop-drvo-jela', .16, 622, 250, True), ('prop-drvo-bukva', .315, 626, 290, False),
              ('prop-drvo-jela', .755, 612, 290, False), ('prop-drvo-hrast', .845, 618, 290, True), ('prop-drvo-bukva', .925, 614, 300, True), ('prop-drvo-jela', .805, 610, 220, True)]:
        im = plant(im, *a, **MID)
    # the roofs that still peeked through the leaves
    for a in [(.275, 606, 100), (.185, 532, 60), (.705, 584, 70), (.88, 612, 85)]:
        im = plant(im, 'prop-zbun', a[0], a[1], a[2], **MID)
    return im


# ================= Pećina =================
def pecina_near(im):
    # no house and no church inside the mountain: stalagmites, crystals and a stone arch.
    # The cave walls framed both edges and crossfaded into a ghost: the right wall with the mine adit is kept whole
    # and carried across the seam, the left one goes.
    wall = cut(im, (.85, 0, 1.0, .86), soft=(10, 50, 60, 0))   # (the top fades: the layer stops below the screen top)
    im = erase(im, [box(-.02, -.02, .13, .86), box(.85, -.02, 1.02, .86)], 8)
    im = put(im, wall, .85, 0)
    im = erase(im, [[(.10, .22), (.385, .22), (.385, .78), (.35, .845), (.12, .845), (.10, .62)],
                    [(.64, .06), (.848, .06), (.848, .575), (.815, .60), (.815, .80), (.79, .835), (.64, .835)]], 6)
    for a in [('prop-stena-visoka', .305, G + 4, 300, True), ('prop-stena-visoka', .665, G + 2, 330, False)]:
        im = plant(im, *a, bright=.82, haze=(60, 130, 145), amt=.3, sat=.8)
    for a in [('prop-stena-visoka', .19, G + 10, 430, False), ('prop-stena-luk', .745, G + 12, 290, False), ('prop-kristal', .255, G + 14, 150, False),
              ('prop-kristal', .70, G + 16, 130, True), ('prop-stena-mala', .145, G + 16, 120, True), ('prop-stena-mala', .825, G + 14, 150, False)]:
        im = plant(im, *a, **CAVE)
    return fade_top(im, 70)


def pecina_mid(im):
    # the little town in the cave wall is taken out; the wall opens onto the deeper cave behind it
    return erase(im, [[(-.01, .40), (.275, .40), (.275, .70), (.20, .74), (.115, .70), (-.01, .78)],
                      [(.845, .42), (.965, .42), (.965, .80), (.845, .80)]], 14)


def pecina_sky(im):
    # the painted towns on both sides of the cave are covered by the cave's own walls: the clean cliff faces under
    # them, raised and set back in the teal shadow, so the light stays in the deep tunnel in the middle
    # (an earlier blur left shapeless smudges there)
    shade = dict(bright=.78, haze=(30, 95, 105), amt=.3, sat=.85)
    im = patch(im, (.0, .58, .34, .93), (-.01, .12, .47, .67), soft=60, **shade)
    im = patch(im, (.83, .52, 1.0, .92), (.765, .12, 1.01, .63), soft=60, flip=True, **shade)
    im = patch(im, (.235, .08, .29, .22), (.155, .07, .215, .23), soft=14)   # the church cross still showed through
    return im.filter(ImageFilter.GaussianBlur(.8))


def pecina_far(im):
    im = erase(im, [[(.078, .33), (.375, .33), (.385, .60), (.365, .80), (.30, .845), (.10, .845), (.078, .70)],
                    [(.735, .53), (.957, .53), (.957, .80), (.90, .815), (.735, .80)]], 9)
    for a in [('prop-stena-visoka', .13, 628, 250, False), ('prop-stena-visoka', .245, 622, 300, True), ('prop-stena-luk', .325, 618, 170, False), ('prop-kristal', .19, 626, 110, False),
              ('prop-stena-visoka', .80, 598, 230, True), ('prop-stena-visoka', .895, 600, 280, False), ('prop-kristal', .85, 600, 100, True)]:
        im = plant(im, *a, bright=.86, haze=(60, 135, 145), amt=.32, sat=.8)
    return im


# ================= Močvara =================
def mocvara_near(im):
    # the house and church on the bank go; willows and reeds take the marsh back
    vrba = cut(im, (.695, .15, .885, .87), soft=(30, 0, 60, 30))
    im = erase(im, [[(-.01, .03), (.232, .03), (.232, .755), (.15, .80), (-.01, .83)]], 7)
    im = edges(im, .80, left=.02)
    im = plant(im, vrba, .255, .87 * H, .62 * H, flip=True)
    for a in [('prop-trska', .40, G + 22, 150, False), ('prop-trska', .60, G + 22, 135, True)]:
        im = plant(im, *a)
    for a in [('prop-trska', .455, G + 8, 105, True), ('prop-trska', .12, G + 14, 120, False)]:
        im = plant(im, *a, **FAR)
    return plant(im, 'prop-panj', .52, G + 18, 78, False)


def mocvara_mid(im):
    vrba = cut(im, (.0, .33, .158, .87), soft=(0, 0, 40, 30))
    im = plant(im, vrba, .21, .87 * H, .52 * H, flip=True)
    im = plant(im, vrba, .85, .80 * H, .44 * H, flip=False)
    return plant(im, 'prop-trska', .285, .83 * H, 90, False, **MID)


def mocvara_far(im):
    # willows over the monastery hill and the hamlet: the marsh is water, mist and trees
    vrba = cut(im, (.0, .33, .172, .90), soft=(0, 0, 40, 30))
    tone_far = dict(bright=.95, haze=(120, 160, 170), amt=.28, sat=.85)
    for a in [(.215, .66 * H, .36 * H, True), (.30, .665 * H, .30 * H, False), (.355, .66 * H, .25 * H, True), (.80, .655 * H, .27 * H, False), (.755, .66 * H, .2 * H, True)]:
        im = plant(im, vrba, a[0], a[1], a[2], flip=a[3], **tone_far)
    return im


# ================= Klisura =================
def klisura_near(im):
    # a gorge: rock needles and firs on the ledges where the house and the church stood
    im = erase(im, [[(.075, .17), (.318, .17), (.318, .70), (.30, .765), (.24, .805), (.088, .805), (.075, .60)],
                    [(.732, .03), (.905, .03), (.905, .38), (.95, .40), (.957, .728), (.732, .728)]], 6)
    im = edges(im, .66)
    im = erase(im, [box(-.02, -.02, .25, .56), box(.86, -.02, 1.02, .62)], 9)
    for a in [('prop-drvo-jela', .255, 584, 360, False), ('prop-drvo-jela', .775, 528, 330, True)]:
        im = plant(im, *a, **FAR)
    for a in [('prop-stena-visoka', .155, 592, 440, False), ('prop-stena-mala', .225, 590, 120, True), ('prop-drvo-jela', .835, 532, 430, False),
              ('prop-stena-visoka', .70, 560, 300, True), ('prop-stena-mala', .79, 536, 110, False)]:
        im = plant(im, *a, bright=.97)
    return im


def klisura_mid(im):
    # the hold on the left cliff stays (a gorge needs its watch); the village on the right is pine and rock
    for a in [('prop-drvo-jela', .715, 590, 240, False), ('prop-drvo-hrast', .79, 592, 230, True), ('prop-drvo-jela', .865, 588, 260, True),
              ('prop-stena-visoka', .925, 596, 250, False), ('prop-drvo-jela', .755, 584, 190, True)]:
        im = plant(im, *a, **MID)
    return im


def klisura_sky():
    return dict(night=lambda: clean_sky('klisura', 'night', KLISURA_SUN), storm=lambda: clean_sky('klisura', 'storm', KLISURA_SUN))


KLISURA_SUN = ((.45, .02, .72, .42), (-.01, .02, .26, .42))


def mocvara_sky(im):
    # the monastery on the hill over the marsh goes into the mist and the far hills
    return patch(im, (.40, .17, .76, .56), (-.01, .17, .35, .56), soft=60)


# ================= Selo =================
def selo_near(im):
    # the village keeps its house; the church (the mid layer has the village church) gives way to cypresses and hay
    cyp = cut(im, (.882, .30, .942, .74), soft=(10, 0, 10, 40))
    im = erase(im, [[(.678, .10), (.875, .10), (.875, .775), (.80, .80), (.745, .835), (.72, .87), (.678, .87)]], 5)
    im = edges(im, .80)
    im = erase(im, [box(-.02, -.02, .235, .80)], 9)       # the old oak's crown reached in past the strip
    im = plant(im, cyp, .745, .865 * H, .52 * H)
    im = plant(im, cyp, .80, .845 * H, .42 * H, flip=True)
    im = plant(im, 'prop-plast-sena', .695, .885 * H, 120)
    im = plant(im, 'prop-drvo-hrast', .225, .875 * H, 330, flip=True, bright=.97)
    im = plant(im, 'prop-stena-mala', .14, .89 * H, 70)
    return im


# ================= Manastir =================
def manastir_near(im):
    # bell tower and gate stay at the near wall; the big church is in the middle ground already, so cypresses here
    # the cliff on the right stays whole: cut out, the seam strips cleared, and put back across the seam
    cliff = cut(im, (.83, .16, 1.0, .95), soft=(0, 20, 70, 0))
    cyp = cut(im, (.91, .25, .947, .60), soft=(6, 0, 6, 40))
    im = erase(im, [[(.592, .14), (.845, .14), (.845, .80), (.592, .80)]], 5)
    im = edges(im, .80)
    im = erase(im, [box(-.02, -.02, .215, .80)], 9)
    im = put(im, cliff, .83, .16)
    im = plant(im, cyp, .655, .815 * H, .46 * H)
    im = plant(im, cyp, .685, .82 * H, .34 * H, flip=True)
    im = plant(im, cyp, .72, .82 * H, .28 * H)
    im = plant(im, 'prop-drvo-hrast', .155, .86 * H, 330, bright=.97)
    return im


def manastir_far(im):
    # one monastery is enough: the far hills are hills
    im = erase(im, [[(-.02, .28), (.31, .28), (.31, .74), (.24, .74), (.20, .69), (.10, .67), (-.02, .70)]], 12)
    for a in [(.04, .705, 70, False), (.11, .695, 85, True), (.19, .705, 60, False), (.255, .75, 55, True)]:
        im = plant(im, 'prop-drvo-bukva' if a[3] else 'prop-zbun', a[0], a[1] * H, a[2], flip=a[3], bright=.92, haze=(120, 160, 170), amt=.25, sat=.85)
    return im


# ================= Oranje =================
def oranje_near(im):
    # the plough's field: no farmhouse in front of every furrow, only wheat, the path and a pear tree
    # the layer keeps only its lower band (stubble, the path, the furrows); the hills, the castle rock and the
    # farmhouse are already in the layers behind it
    im = patch(im, (.58, .60, .985, .90), (.14, .60, .59, .90), soft=45)
    im = erase(im, [box(-.02, -.02, 1.02, .655)], 18)
    im = plant(im, 'prop-kruska', .30, .80 * H, 330, bright=.97)
    im = plant(im, 'prop-kruska', .80, .755 * H, 190, flip=True, bright=.93, sat=.9)
    im = plant(im, 'prop-snopovi', .44, .85 * H, 95)
    return im


# ================= Tvrđava =================
def tvrdjava_near(im):
    # the gate and its two towers; the church dome behind the wall belongs to the middle ground's fortress
    im = erase(im, [[(.545, .04), (.715, .04), (.715, .425), (.545, .425)]], 4)
    im = edges(im, .78)
    im = erase(im, [box(-.02, -.02, .215, .78), box(.86, -.02, 1.02, .78)], 9)
    im = plant(im, 'prop-drvo-hrast', .17, .86 * H, 360, bright=.95)
    im = plant(im, 'prop-stena-mala', .90, .87 * H, 140, bright=.95)
    return im


# ================= Podrum =================
# the cellar's day layers are all cellar; the night and storm ones have a domed church standing in it.
# Those take the day picture in the night/storm light instead (recipes with day=None below).


# ================= Prevoj =================
def prevoj_near(im):
    # the watchtower holds the pass; the autumn oak at the seam goes, snowy firs stand in the cleared strips
    im = edges(im, .82)
    im = erase(im, [box(-.02, -.02, .245, .82), box(.79, -.02, 1.02, .82)], 9)
    for a in [(.16, .86, 380, False), (.235, .87, 250, True), (.835, .86, 400, True), (.915, .865, 300, False)]:
        im = plant(im, 'prop-drvo-sneg', a[0], a[1] * H, a[2], flip=a[3])
    return im


def prevoj_mid(im):
    # the monastery and the house on the left ledge: snowed-in firs instead (the pass is a pass)
    # (the far layer's mountains show through the gap; firs stand on both cut edges of the ridge)
    im = erase(im, [box(.19, .38, .405, .80)], 6)
    for a in [(.195, .81, 230, False), (.26, .80, 160, True), (.325, .805, 190, False), (.40, .81, 240, True)]:
        im = plant(im, 'prop-drvo-sneg', a[0], a[1] * H, a[2], flip=a[3], **MID)
    return im


# ================= Ruševine =================
def rusevine_near(im):
    # Arapin's tower stays; where a whole church stood, the broken arches of an old zadužbina
    luk = cut(im, (.37, .58, .55, .90), soft=(6, 0, 6, 10))
    im = erase(im, [[(.10, .08), (.358, .08), (.358, .885), (.10, .885)]], 6)
    im = edges(im, .82)
    im = plant(im, luk, .235, .895 * H, .38 * H, flip=True)
    im = plant(im, 'prop-stub-kameni', .125, .89 * H, 250)
    return plant(im, 'prop-zbun', .33, .90 * H, 70)


def rusevine_mid(im):
    # the church and the timber house on the left go; the ruin is a ruin
    luk = cut(im, (.755, .40, .955, .84), soft=(8, 0, 8, 12))
    im = erase(im, [[(.135, .30), (.29, .30), (.29, .78), (.135, .78)]], 8)
    return plant(im, luk, .21, .82 * H, .40 * H, flip=True)


# ================= Rudnik =================
def rudnik_sky(im):
    # the cavern over the mine has no church hanging in it: bare rock there
    return patch(im, (.0, .0, .12, .52), (.125, .0, .27, .50), soft=40, flip=True)


def rudnik_far(im):
    drvo = cut(im, (.915, .27, 1.0, .53), soft=(8, 0, 8, 20))
    im = erase(im, [[(.02, .06), (.24, .06), (.24, .46), (.15, .50), (.02, .47)]], 8)
    im = plant(im, drvo, .075, .52 * H, .24 * H)
    return plant(im, drvo, .175, .51 * H, .20 * H, flip=True)


def rudnik_near(im):
    # the mine house with its adit stood on one edge and the well-house on the other, and the seam crossfaded them
    # into one ghost: the mine house stays whole across the seam, the well-house goes (the mid layer has its own)
    kuca = cut(im, (0, 0, .31, .87), soft=(60, 0, 0, 0))
    im = erase(im, [box(-.02, -.02, .31, .87), box(.73, -.02, 1.02, .87)], 8)
    return fade_top(put(im, kuca, 0, 0), 70)


# ================= Reka =================
def reka_sky(im):
    # the hill monastery and the second mill melt into the morning haze over the hills
    im = patch(im, (.28, .27, .55, .58), (.0, .26, .26, .58), soft=50)
    im = patch(im, (.60, .42, .76, .66), (.82, .44, .97, .70), soft=40)
    return im


def reka_far(im):
    # one mill is enough: it is in the near layer
    im = erase(im, [box(-.02, .40, .215, .93)], 3)
    im = patch(im, (.22, .38, .465, .95), (-.02, .38, .225, .95), soft=10)
    return plant(im, 'prop-trska', .12, .93 * H, 80, bright=.95)


def reka_near(im):
    # the mill stays at the water; the church on the far bank is willows and reeds
    vrba = cut(src('mocvara-near'), (.70, .15, .87, .87), soft=(80, 0, 80, 30))
    im = erase(im, [[(.655, .12), (.876, .12), (.876, .80), (.80, .84), (.655, .84)]], 6)
    im = edges(im, .80)
    im = plant(im, vrba, .765, .86 * H, .46 * H)
    im = plant(im, 'prop-trska', .68, .885 * H, 130)
    im = plant(im, 'prop-stena-mala', .915, .88 * H, 120, bright=.95)
    return im


# ================= Urvina =================
def urvina_near(im):
    # the fir standing on the seam showed as a fading ghost; it stands whole now, the same on both sides of the seam
    jela = cut(im, (.84, .02, .965, .80), soft=(6, 0, 6, 0))
    im = edges(im, .80)
    return plant(im, jela, .9025, .80 * H, .78 * H)


class R:
    """day: function on the artist's day layer (None = keep the artist's day layer);
    night/storm: 'grade' = the (new) day layer in the artist's night/storm light, a function, or None = keep the artist's."""
    def __init__(self, day=None, night='grade', storm='grade'):
        self.day, self.night, self.storm = day, night, storm


SPEC = {
    'suma-near': R(suma_near), 'suma-mid': R(suma_mid), 'suma-far': R(), 'suma-sky': R(night=lambda: night_sky('suma'), storm=None),
    'pecina-near': R(pecina_near), 'pecina-mid': R(pecina_mid), 'pecina-sky': R(pecina_sky), 'pecina-far': R(pecina_far),
    'mocvara-far': R(mocvara_far), 'mocvara-near': R(mocvara_near), 'mocvara-mid': R(mocvara_mid),
    'klisura-near': R(klisura_near), 'klisura-mid': R(klisura_mid), 'klisura-sky': R(**klisura_sky()), 'mocvara-sky': R(mocvara_sky),
    'selo-near': R(selo_near), 'selo-sky': R(night=lambda: night_sky('selo'), storm=None),
    'manastir-near': R(manastir_near), 'manastir-far': R(manastir_far), 'manastir-sky': R(night=lambda: night_sky('manastir'), storm=None),
    'oranje-near': R(oranje_near),
    'tvrdjava-near': R(tvrdjava_near), 'tvrdjava-sky': R(night=lambda: night_sky('tvrdjava'), storm=None),
    'podrum-far': R(), 'podrum-mid': R(), 'podrum-near': R(),
    'prevoj-near': R(prevoj_near), 'prevoj-mid': R(prevoj_mid), 'prevoj-far': R(), 'prevoj-sky': R(night=lambda: night_sky('prevoj'), storm=None),
    'rusevine-near': R(rusevine_near), 'rusevine-mid': R(rusevine_mid),
    'rudnik-sky': R(rudnik_sky), 'rudnik-far': R(rudnik_far), 'rudnik-mid': R(), 'rudnik-near': R(rudnik_near),
    'reka-sky': R(reka_sky), 'reka-far': R(reka_far), 'reka-near': R(reka_near),
    'urvina-near': R(urvina_near, night=None, storm=None),
}


def build(key):
    r = SPEC[key]
    for f in glob.glob(os.path.join(ART, key + '-rucno*.webp')):
        os.remove(f)
    base = Image.open(os.path.join(ART, key + '.webp'))
    opaque = base.mode == 'RGB'
    base = base.convert('RGBA')
    save = lambda im, f: (im.convert('RGB') if opaque else im).save(os.path.join(ART, f), quality=92, method=int(os.environ.get('WEBP_METHOD', 6)))
    out = r.day(base.copy()) if r.day else base
    if r.day:
        save(out, key + '-rucno.webp')
    made = ['day'] if r.day else []
    for v in ('night', 'storm'):
        how, f = getattr(r, v), os.path.join(ART, f'{key}-{v}.webp')
        if how is None or not os.path.exists(f):
            continue
        im = grade(base, Image.open(f).convert('RGBA'), out) if how == 'grade' else how()
        save(im, f'{key}-rucno-{v}.webp')
        made.append(v)
    return made


if __name__ == '__main__':
    keys = [k for k in sys.argv[1:] if k in SPEC] or list(SPEC)
    for k in keys:
        print('made', k + '-rucno', '+'.join(build(k)))
    # the game only asks for art that files.json lists
    fj = os.path.join(ART, 'files.json')
    have = sorted(f for f in os.listdir(ART) if f.endswith('.webp'))
    json.dump(have, open(fj, 'w', encoding='utf-8'), ensure_ascii=False)
    print('files.json:', len(have), 'entries')
