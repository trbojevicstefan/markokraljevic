# Hand-composed background layers, made locally from art that is already in the pack (no new orders).
# The artist's "near" and "mid" layers carry the same village house and church in every level, so a forest,
# a cave, a marsh and a gorge all read as the same street. This script rubs those buildings out and plants
# the level's own things instead (trees, rocks, reeds, crystals), then writes
#   dist/assets/world/<level>-<layer>-rucno.webp  (+ -night, -storm, graded like the originals)
# The game prefers a "-rucno" layer when files.json lists one (see levelLayers in game.js).
# Run again if the source layers or props are ever redrawn:  python make-rucni-slojevi.py [level-layer ...]
import os, sys, json
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.abspath(__file__))
ART = os.path.join(ROOT, 'dist', 'assets', 'world')
W, H = 2172, 724
_cache = {}


def prop(name):
    if name not in _cache:
        im = Image.open(os.path.join(ART, name + '.webp')).convert('RGBA')
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


def erase(im, polys, feather=5):
    m = Image.new('L', im.size, 0)
    d = ImageDraw.Draw(m)
    for p in polys:
        d.polygon([(x * W, y * H) for x, y in p], fill=255)
    m = m.filter(ImageFilter.GaussianBlur(feather))
    a = np.asarray(im).copy()
    a[..., 3] = (a[..., 3].astype(np.float32) * (1 - np.asarray(m).astype(np.float32) / 255)).astype(np.uint8)
    return Image.fromarray(a, 'RGBA')


def plant(im, name, cx, base, h, flip=False, crop=None, **t):
    """Stand a prop on the layer: cx = centre (0..1 of the width), base = y of its foot in px, h = height in px."""
    src = name if isinstance(name, Image.Image) else prop(name)
    if crop:
        src = src.crop(crop)
    s = h / src.height
    p = src.resize((max(1, round(src.width * s)), max(1, round(h))), Image.LANCZOS)
    if flip:
        p = p.transpose(Image.FLIP_LEFT_RIGHT)
    if t:
        p = tone(p, **t)
    x = round(cx * W - p.width / 2)
    layer = Image.new('RGBA', im.size, (0, 0, 0, 0))
    layer.paste(p, (x, round(base - p.height)))
    # the layer tiles: what leaves one edge comes in at the other
    if x < 0:
        layer.paste(p, (x + W, round(base - p.height)))
    if x + p.width > W:
        layer.paste(p, (x - W, round(base - p.height)))
    return Image.alpha_composite(im, layer)


def grade(day_base, var_base, im):
    """Colour the new layer for night/storm the way the artist's variant differs from the day one."""
    a = np.asarray(day_base).astype(np.float32)
    b = np.asarray(var_base.resize(day_base.size)).astype(np.float32)
    ok = (a[..., 3] > 200) & (b[..., 3] > 200)
    x = a[ok][:, :3] / 255
    y = b[ok][:, :3] / 255
    lum = x.mean(axis=1, keepdims=True)
    A = np.hstack([x, lum * lum, np.ones((len(x), 1), np.float32)])
    M, *_ = np.linalg.lstsq(A[::7], y[::7], rcond=None)
    c = np.asarray(im).astype(np.float32)
    v = c[..., :3].reshape(-1, 3) / 255
    lv = v.mean(axis=1, keepdims=True)
    out = np.hstack([v, lv * lv, np.ones((len(v), 1), np.float32)]) @ M
    c[..., :3] = np.clip(out.reshape(c.shape[0], c.shape[1], 3) * 255, 0, 255)
    return Image.fromarray(c.astype(np.uint8), 'RGBA')


def edges(im, y, left=.125, right=.875):
    """The game crossfades the last 12 % of a tile into its first 12 %: a tall thing standing there shows as a ghost
    of two different things. Clear both strips above the ground (y, 0..1) and plant inside the tile instead."""
    return erase(im, [[(-.02, -.02), (left, -.02), (left, y), (-.02, y)], [(right, -.02), (1.02, -.02), (1.02, y), (right, y)]], 9)


G = 612  # where things stand in a near layer (the road's ground line hides what is below)
FAR = dict(bright=.93, haze=(150, 175, 185), amt=.2, sat=.85)   # the back row of a near layer


def suma_near(im):
    # the stone house, the arch and their fence go; what was a village street is a forest again
    im = erase(im, [[(.385, 0), (.805, 0), (.805, .60), (.83, .70), (.86, .835), (.385, .835)]], 7)
    im = edges(im, .70)
    im = erase(im, [[(-.02, -.02), (.27, -.02), (.27, .62), (-.02, .62)], [(.84, -.02), (1.02, -.02), (1.02, .62), (.84, .62)]], 9)   # their crowns reach further in
    for a in [('prop-drvo-bukva', .165, G - 12, 420, False), ('prop-drvo-jela', .375, G - 12, 400, True), ('prop-drvo-jela', .615, G - 12, 370, False), ('prop-drvo-jela', .845, G - 12, 400, True)]:
        im = plant(im, *a, **FAR)
    for a in [('prop-drvo-hrast', .255, G, 470, False), ('prop-drvo-bukva', .475, G, 585, True), ('prop-drvo-hrast', .765, G + 4, 450, True)]:
        im = plant(im, *a, bright=.97)
    for a in [('prop-korenje', .585, G + 6, 140, False), ('prop-paprat', .185, G + 8, 92, False), ('prop-panj', .385, G + 6, 86, True), ('prop-pecurke', .69, G + 6, 62, False), ('prop-paprat', .655, G + 8, 84, True), ('prop-zbun', .33, G + 8, 96, False)]:
        im = plant(im, *a)
    return im


MID = dict(bright=.96, sat=.9)                                  # things planted into a mid layer
CAVE = dict(bright=.9, haze=(70, 140, 150), amt=.2, sat=.85)     # rock standing in the cave's teal light


def cut(im, box, soft=(0, 0, 0, 0)):
    """A piece of a layer (box in 0..1) to plant elsewhere; soft = px of fade on its left, top, right, bottom edge."""
    x0, y0, x1, y1 = box
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


def suma_mid(im):
    # the hamlets on the far bank are overgrown: the vila's wood has no street in it
    for a in [('prop-drvo-hrast', .235, 628, 300, False), ('prop-drvo-jela', .16, 622, 250, True), ('prop-drvo-bukva', .315, 626, 290, False),
              ('prop-drvo-jela', .755, 612, 290, False), ('prop-drvo-hrast', .845, 618, 290, True), ('prop-drvo-bukva', .925, 614, 300, True), ('prop-drvo-jela', .805, 610, 220, True)]:
        im = plant(im, *a, **MID)
    return im


def pecina_near(im):
    # no house and no church inside the mountain: stalagmites, crystals and a stone arch
    im = erase(im, [[(.10, .22), (.385, .22), (.385, .78), (.35, .845), (.12, .845), (.10, .62)],
                    [(.64, .06), (.848, .06), (.848, .575), (.815, .60), (.815, .80), (.79, .835), (.64, .835)]], 6)
    for a in [('prop-stena-visoka', .305, G + 4, 300, True), ('prop-stena-visoka', .665, G + 2, 330, False)]:
        im = plant(im, *a, bright=.82, haze=(60, 130, 145), amt=.3, sat=.8)
    for a in [('prop-stena-visoka', .19, G + 10, 430, False), ('prop-stena-luk', .745, G + 12, 290, False), ('prop-kristal', .255, G + 14, 150, False),
              ('prop-kristal', .70, G + 16, 130, True), ('prop-stena-mala', .145, G + 16, 120, True), ('prop-stena-mala', .825, G + 14, 150, False)]:
        im = plant(im, *a, **CAVE)
    return im


def pecina_mid(im):
    # the little town in the cave wall is taken out; the wall opens onto the deeper cave behind it
    return erase(im, [[(-.01, .40), (.275, .40), (.275, .70), (.20, .74), (.115, .70), (-.01, .78)],
                      [(.845, .42), (.965, .42), (.965, .80), (.845, .80)]], 14)


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


def klisura_near(im):
    # a gorge: rock needles and firs on the ledges where the house and the church stood
    im = erase(im, [[(.075, .17), (.318, .17), (.318, .70), (.30, .765), (.24, .805), (.088, .805), (.075, .60)],
                    [(.732, .03), (.905, .03), (.905, .38), (.95, .40), (.957, .728), (.732, .728)]], 6)
    im = edges(im, .66)
    im = erase(im, [[(-.02, -.02), (.25, -.02), (.25, .56), (-.02, .56)], [(.86, -.02), (1.02, -.02), (1.02, .62), (.86, .62)]], 9)
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


def soften(im, polys, radius=20, feather=30, tint=None, amt=0.0):
    """Lose a part of the furthest layer in the depth: blurred (and tinted) until it is only light on rock."""
    m = Image.new('L', im.size, 0)
    d = ImageDraw.Draw(m)
    for p in polys:
        d.polygon([(x * W, y * H) for x, y in p], fill=255)
    m = m.filter(ImageFilter.GaussianBlur(feather))
    b = im.filter(ImageFilter.GaussianBlur(radius))
    if tint is not None:
        b = tone(b, haze=tint, amt=amt)
    return Image.composite(b, im, m)


def pecina_sky(im):
    # the painted town in the depth of the cave melts into glowing rock: a fairy cave is stone, water and light
    im = soften(im, [[(-.02, .13), (.47, .13), (.47, .60), (.30, .66), (-.02, .66)], [(.775, .14), (1.02, .14), (1.02, .62), (.775, .60)]], 26, 34, (40, 120, 130), .38)
    return im.filter(ImageFilter.GaussianBlur(1.2))


def pecina_far(im):
    im = erase(im, [[(.078, .33), (.375, .33), (.385, .60), (.365, .80), (.30, .845), (.10, .845), (.078, .70)],
                    [(.735, .53), (.957, .53), (.957, .80), (.90, .815), (.735, .80)]], 9)
    for a in [('prop-stena-visoka', .13, 628, 250, False), ('prop-stena-visoka', .245, 622, 300, True), ('prop-stena-luk', .325, 618, 170, False), ('prop-kristal', .19, 626, 110, False),
              ('prop-stena-visoka', .80, 598, 230, True), ('prop-stena-visoka', .895, 600, 280, False), ('prop-kristal', .85, 600, 100, True)]:
        im = plant(im, *a, bright=.86, haze=(60, 135, 145), amt=.32, sat=.8)
    return im


def mocvara_far(im):
    # willows over the monastery hill and the hamlet: the marsh is water, mist and trees
    vrba = cut(im, (.0, .33, .172, .90), soft=(0, 0, 40, 30))
    tone_far = dict(bright=.95, haze=(120, 160, 170), amt=.28, sat=.85)
    for a in [(.215, .66 * H, .36 * H, True), (.30, .665 * H, .30 * H, False), (.355, .66 * H, .25 * H, True), (.80, .655 * H, .27 * H, False), (.755, .66 * H, .2 * H, True)]:
        im = plant(im, vrba, a[0], a[1], a[2], flip=a[3], **tone_far)
    return im


SPEC = {'suma-near': suma_near, 'suma-mid': suma_mid, 'pecina-near': pecina_near, 'pecina-mid': pecina_mid,
        'pecina-sky': pecina_sky, 'pecina-far': pecina_far, 'mocvara-far': mocvara_far,
        'mocvara-near': mocvara_near, 'mocvara-mid': mocvara_mid, 'klisura-near': klisura_near, 'klisura-mid': klisura_mid}



def build(key):
    base = Image.open(os.path.join(ART, key + '.webp'))
    opaque = base.mode == 'RGB'
    base = base.convert('RGBA')
    out = SPEC[key](base.copy())
    save = lambda im, f: (im.convert('RGB') if opaque else im).save(os.path.join(ART, f), quality=92, method=6)
    save(out, key + '-rucno.webp')
    for v in ('night', 'storm'):
        f = os.path.join(ART, f'{key}-{v}.webp')
        if os.path.exists(f):
            save(grade(base, Image.open(f).convert('RGBA'), out), f'{key}-rucno-{v}.webp')
    return out


if __name__ == '__main__':
    keys = [k for k in sys.argv[1:] if k in SPEC] or list(SPEC)
    for k in keys:
        build(k)
        print('made', k + '-rucno (+night, +storm)')
    # the game only asks for art that files.json lists
    fj = os.path.join(ART, 'files.json')
    have = sorted(f for f in os.listdir(ART) if f.endswith('.webp'))
    json.dump(have, open(fj, 'w', encoding='utf-8'), ensure_ascii=False)
    print('files.json:', len(have), 'entries')
