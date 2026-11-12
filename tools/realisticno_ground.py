"""Walkable ground with depth (2.5D look) for every biome: groundTop, groundFront and foreground props.

groundTop   the top surface of the path seen from the side and ~30 degrees above: near edge at the bottom (big stones),
            far edge at the top (small, foreshortened). 2048x512 generated, 1024x256 final, tiles horizontally.
groundFront the front lip/face of the ground under that surface (grass overhang, curb stones, soil), same size,
            tiles horizontally; the old `ground` material (512x512, both ways) fills below it.
foreground  props drawn in front of Marko at the bottom of the screen: tufts, stones, roots, a fence piece.
"""
import math

import numpy as np

from realisticno_draw import Draft, MAG, jitter, pnoise, rng

GT = (2048, 512)
FINAL_GT = (1024, 256)


# The biome's own light words (fog, sunset sky, mist) make the model paint a horizon into the strip, so the ground
# gets a light that only describes light on a surface ('glight'), and the prompt says the surface fills the frame.
def gtop_prompt(surface, light):
    return (f'A close-up ground texture photograph looking down at about 60 degrees onto {surface}. The ground fills '
            f'the entire frame from the top edge to the bottom edge and continues seamlessly left and right; the '
            f'stones get gradually smaller towards the top edge of the image. {light}. Photorealistic, ultra detailed, '
            f'game texture for the walkable top of a path in a 2.5D side-scrolling game.')


def gfront_prompt(face, light):
    return (f'A close-up texture photograph, straight side view, of the cut edge of {face}. The material fills the '
            f'entire frame from the top edge to the bottom edge and continues seamlessly left and right. {light}. '
            f'Photorealistic, ultra detailed game texture for the front face of the ground in a 2.5D side-scrolling '
            f'game.')


def fg_prompt(what, light):
    return (f'A product photo of {what}, seen exactly from the side, whole object visible, standing on the bottom '
            f'edge, {light}. Photorealistic, ultra detailed. Isolated on a flat, solid, pure magenta (#FF00FF) studio '
            f'background.')


def draw_gtop(base, stone, seed, kind='stones', fill=0.75):
    """Rows of pieces whose size grows towards the bottom (near) edge; colour darkens slightly to the far edge."""
    w, h = GT
    d = Draft(w, h, bg=base)
    r = rng(seed)
    y = 0.0
    while y < h:
        t = y / h                                   # 0 far .. 1 near
        size = 14 + 70 * t ** 1.3
        row_h = size * 0.55
        x = r.uniform(0, size)
        while x < w + size:
            if r.random() < fill:
                if kind == 'stones':
                    d.ellipse(x, y + row_h / 2, size * r.uniform(0.38, 0.5), row_h * r.uniform(0.4, 0.5),
                              jitter(stone, r, 16))
                elif kind == 'grass':
                    for k in range(5):
                        a = math.pi * (0.25 + 0.5 * r.random())
                        ln = size * r.uniform(0.6, 1.2)
                        d.line([(x, y + row_h), (x - math.cos(a) * ln * 0.4, y + row_h - math.sin(a) * ln)],
                               jitter(stone, r, 14), width=max(2, int(size / 12)))
                elif kind == 'snow':
                    d.ellipse(x, y + row_h / 2, size * r.uniform(0.5, 0.8), row_h * 0.35, jitter(stone, r, 6))
                elif kind == 'slabs':
                    d.rect(x - size * 0.6, y + 2, x + size * 0.6, y + row_h - 2, jitter(stone, r, 12))
            x += size * r.uniform(0.9, 1.3)
        y += row_h
    a = np.asarray(d.im, np.float32)
    shade = (0.78 + 0.22 * np.linspace(0, 1, h))[:, None, None]
    from PIL import Image, ImageDraw
    d.im = Image.fromarray(np.clip(a * shade, 0, 255).astype(np.uint8))
    d.d = ImageDraw.Draw(d.im)
    return d.finish(noise=6, blotch=12, seed=seed + 1, keep_magenta=False)


def draw_gfront(lip, face, deep, seed, lip_kind='grass'):
    w, h = GT
    d = Draft(w, h, bg=face)
    r = rng(seed)
    d.rect(0, h * 0.55, w, h, deep)
    for _ in range(140):
        d.ellipse(r.uniform(0, w), r.uniform(h * 0.25, h), r.uniform(16, 60), r.uniform(10, 34),
                  jitter(tuple(int(v * 1.15) for v in face), r, 14))
    edge = h * 0.2 + pnoise(w, seed, kmin=4, kmax=80, power=0.8) * h * 0.05
    for x in range(0, w, 4):
        d.rect(x, 0, x + 4, edge[x], lip)
    if lip_kind == 'grass':
        for _ in range(500):
            x = r.uniform(0, w)
            y0 = edge[int(x) % w]
            d.line([(x, y0 - 4), (x + r.normal() * 6, y0 + r.uniform(10, 40))], jitter(lip, r, 14), width=3)
    elif lip_kind == 'stones':
        x = 0
        while x < w:
            bw = r.uniform(70, 140)
            d.ellipse(x + bw / 2, h * 0.17, bw / 2 - 3, h * 0.11, jitter(lip, r, 12))
            x += bw
    return d.finish(noise=6, blotch=12, seed=seed + 2, keep_magenta=False)


# ---------- foreground props (1024x1024 on magenta) ----------
def fg_busen(col, seed):
    d = Draft(1024, 1024, wrap_x=False)
    r = rng(seed)
    for k in range(60):
        a = math.pi * (0.12 + 0.76 * r.random())
        ln = r.uniform(250, 620)
        x0 = 512 + r.normal() * 90
        d.line([(x0, 1000), (x0 - math.cos(a) * ln * 0.6, 1000 - math.sin(a) * ln)], jitter(col, r, 16), width=10)
    return d.finish(noise=5, blotch=8, seed=seed)


def fg_kamenje(col, seed):
    d = Draft(1024, 1024, wrap_x=False)
    r = rng(seed)
    for cx, w_, h_ in ((380, 420, 300), (680, 300, 220), (240, 200, 140), (820, 160, 110)):
        d.chord([cx - w_ / 2, 1000 - h_, cx + w_ / 2, 1000 + h_], 180, 360, jitter(col, r, 10))
    return d.finish(noise=8, blotch=12, seed=seed)


def fg_koren(col, seed):
    d = Draft(1024, 1024, wrap_x=False)
    r = rng(seed)
    for k in range(6):
        pts = []
        x, y = 100 + k * 150, 1000
        for s in range(8):
            x += r.normal() * 40 + 30
            y -= r.uniform(30, 90)
            pts.append((x, y))
        d.line([(100 + k * 150, 1000)] + pts, jitter(col, r, 10), width=int(60 - k * 6))
    return d.finish(noise=6, blotch=10, seed=seed)


def fg_ograda(col, seed):
    d = Draft(1536, 1024, wrap_x=False)
    r = rng(seed)
    for k in range(6):
        x = 140 + k * 250
        top = 380 + r.uniform(-40, 40)
        d.rect(x - 22, top, x + 22, 1000, jitter(col, r, 10))
    for y in (480, 720):
        d.poly([(100, y), (1440, y + r.uniform(-20, 20)), (1440, y + 34), (100, y + 34)], jitter(col, r, 8))
    return d.finish(noise=6, blotch=10, seed=seed)


def ground_items(spec):
    """spec = {'light', 'top': (surface text, base, stone, kind), 'front': (face text, lip, face, deep, lip_kind),
    'fg': {'busen': (what, col), 'kamenje': ..., 'koren': ..., 'ograda': ...}, 'seed'}"""
    s = spec.get('seed', 500)
    gl = spec.get('glight', 'soft natural daylight')
    surf, base, stone, kind = spec['top']
    face_t, lip, face, deep, lip_kind = spec['front']
    out = [
        {'id': 'groundTop', 'key': 'mat-groundTop', 'group': 'materials', 'kind': 'gtop', 'size': GT,
         'draw': lambda: draw_gtop(base, stone, s, kind), 'prompt': gtop_prompt(surf, gl),
         'strength': 0.74, 'v': 2},
        {'id': 'groundFront', 'key': 'mat-groundFront', 'group': 'materials', 'kind': 'gtop', 'size': GT,
         'draw': lambda: draw_gfront(lip, face, deep, s + 10, lip_kind), 'prompt': gfront_prompt(face_t, gl),
         'strength': 0.76, 'v': 2},
    ]
    sizes = {'busen': (90, 70), 'kamenje': (120, 70), 'koren': (110, 80), 'ograda': (200, 110)}
    draws = {'busen': fg_busen, 'kamenje': fg_kamenje, 'koren': fg_koren, 'ograda': fg_ograda}
    for i, (pid, (what, col)) in enumerate(spec['fg'].items()):
        w, h = sizes[pid]
        out.append({'id': f'fg-{pid}', 'key': f'prop-fg-{pid}', 'group': 'props', 'kind': 'prop',
                    'size': (1536, 1024) if pid == 'ograda' else (1024, 1024),
                    'draw': (lambda f=draws[pid], c=col, sd=s + 20 + i: f(c, sd)),
                    'prompt': fg_prompt(what, gl), 'strength': 0.8, 'v': 2, 'w': w, 'h': h, 'solid': False,
                    'layer': 'foreground'})
    return out
