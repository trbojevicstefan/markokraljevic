"""Drawing kit for the img2img drafts: flat side-view shapes that wrap around the left/right border.

Every draft is a strict orthographic side elevation: a level horizon, silhouettes at their true heights,
colour zones for the time of day and nothing that leads into depth. Shapes drawn near a border are drawn again one
width to the left and right, so the draft (and the layer made from it) continues seamlessly across the border.
"""
import math

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

MAG = (255, 0, 255)


def rng(seed):
    return np.random.default_rng(seed)


def pnoise(n, seed, kmin=1, kmax=32, power=1.1):
    """Periodic 1D noise over n samples (sum of whole-period sines), scaled to [-1, 1]."""
    r = rng(seed)
    x = np.arange(n) / n
    y = np.zeros(n)
    for k in range(kmin, kmax + 1):
        y += r.normal() / k ** power * np.sin(2 * np.pi * (k * x + r.random()))
    return y / (np.abs(y).max() + 1e-9)


def mix(c1, c2, t):
    return tuple(int(round(a + (b - a) * t)) for a, b in zip(c1, c2))


def jitter(c, r, amt=10):
    """Mostly a change of lightness, with a little hue drift (independent channels give rainbow stones)."""
    l = r.normal() * amt
    return tuple(int(np.clip(v * (1 + l / 128) + r.normal() * amt * 0.2, 0, 255)) for v in c)


class Draft:
    def __init__(self, w, h, bg=MAG, wrap_x=True, wrap_y=False):
        self.w, self.h = w, h
        self.im = Image.new('RGB', (w, h), bg)
        self.d = ImageDraw.Draw(self.im)
        self.wrap_x, self.wrap_y = wrap_x, wrap_y

    def _offs(self):
        xs = (-self.w, 0, self.w) if self.wrap_x else (0,)
        ys = (-self.h, 0, self.h) if self.wrap_y else (0,)
        return [(ox, oy) for ox in xs for oy in ys]

    def poly(self, pts, fill):
        for ox, oy in self._offs():
            self.d.polygon([(x + ox, y + oy) for x, y in pts], fill=fill)

    def rect(self, x0, y0, x1, y1, fill):
        self.poly([(x0, y0), (x1, y0), (x1, y1), (x0, y1)], fill)

    def ellipse(self, cx, cy, rx, ry, fill):
        for ox, oy in self._offs():
            self.d.ellipse([cx - rx + ox, cy - ry + oy, cx + rx + ox, cy + ry + oy], fill=fill)

    def line(self, pts, fill, width=1):
        for ox, oy in self._offs():
            self.d.line([(x + ox, y + oy) for x, y in pts], fill=fill, width=width)

    def chord(self, box, start, end, fill):
        x0, y0, x1, y1 = box
        for ox, oy in self._offs():
            self.d.chord([x0 + ox, y0 + oy, x1 + ox, y1 + oy], start, end, fill=fill)

    def pieslice(self, box, start, end, fill):
        x0, y0, x1, y1 = box
        for ox, oy in self._offs():
            self.d.pieslice([x0 + ox, y0 + oy, x1 + ox, y1 + oy], start, end, fill=fill)

    # ---------- landscape ----------
    def ridge(self, base, amp, fill, seed, kmax=32, power=1.1, step=4, bottom=None, sharp=0.0):
        n = self.w // step
        y = pnoise(n, seed, kmax=kmax, power=power)
        if sharp:
            y = np.sign(y) * np.abs(y) ** (1 - sharp)
        pts = [(i * step, base - amp * y[i]) for i in range(n)] + [(self.w, base - amp * y[0])]
        b = self.h if bottom is None else bottom
        self.poly([(0, b)] + pts + [(self.w, b)], fill)
        return lambda x: base - amp * y[int(x % self.w) // step]

    def shaded_ridge(self, base, amp, seed, lit, shadow, haze=None, haze_amt=0.0, kmax=40, power=1.0,
                     gully=0.2, gully_k=(30, 220), depth=None, bottom=None, sun=-1, facing_gain=2.2, ridge=None):
        """A mountain/hill mass whose colour follows its own slopes: faces turned to the sun (sun=-1: from the
        left) are lit, the others in shadow, with vertical gullies and haze gathering towards the bottom.
        Returns the crest line y(x) as an array."""
        w, h = self.w, self.h
        if ridge is None:
            y = base - amp * pnoise(w, seed, kmax=kmax, power=power)
        else:
            y = np.asarray(ridge, np.float64)
        b = h if bottom is None else bottom
        slope = (np.roll(y, -3) - np.roll(y, 3)) / 6
        facing = np.clip(sun * slope * facing_gain, -1, 1)
        k = 9
        facing = np.convolve(np.concatenate([facing[-k:], facing, facing[:k]]), np.ones(2 * k + 1) / (2 * k + 1),
                             'same')[k:-k]
        g = pnoise(w, seed + 7, kmin=gully_k[0], kmax=gully_k[1], power=0.55)
        yy = np.arange(h)[:, None].astype(np.float64)
        dscale = depth or max(40.0, (b - y.min()) * 0.6)
        dd = np.clip((yy - y[None, :]) / dscale, 0, None)
        bright = 0.5 + 0.42 * facing[None, :] * np.exp(-dd * 0.7) + gully * g[None, :] * np.exp(-dd * 2.2)
        bright = np.clip(bright, 0, 1)[..., None]
        col = np.array(shadow, np.float64) * (1 - bright) + np.array(lit, np.float64) * bright
        if haze is not None and haze_amt:
            t = np.clip(dd, 0, 1)[..., None] * haze_amt
            col = col * (1 - t) + np.array(haze, np.float64) * t
        mask = (yy >= y[None, :]) & (yy < b)
        a = np.asarray(self.im, np.float64)
        a = np.where(mask[..., None], col, a)
        self.im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
        self.d = ImageDraw.Draw(self.im)
        return y

    def vgrad_mask(self, mask, top_col, bot_col, y0, y1):
        """Recolour the pixels in mask with a vertical gradient between y0 (top_col) and y1 (bot_col)."""
        a = np.asarray(self.im, np.float32)
        t = np.clip((np.arange(self.h) - y0) / max(1, y1 - y0), 0, 1)[:, None, None]
        g = np.array(top_col, np.float32) * (1 - t) + np.array(bot_col, np.float32) * t
        g = np.broadcast_to(g, a.shape)
        a = np.where(mask[..., None], g, a)
        self.im = Image.fromarray(a.astype(np.uint8))
        self.d = ImageDraw.Draw(self.im)

    def layer_mask(self):
        a = np.asarray(self.im).astype(np.int16)
        return ~((a[..., 0] > 245) & (a[..., 1] < 10) & (a[..., 2] > 245))

    # ---------- architecture ----------
    def wall(self, x0, x1, top, bottom, fill, crenel=18, gap=14, merlon_h=16, shade=None):
        self.rect(x0, top, x1, bottom, fill)
        if crenel:
            x = x0
            while x < x1:
                self.rect(x, top - merlon_h, min(x + crenel, x1), top, fill)
                x += crenel + gap
        if shade:
            self.rect(x0, bottom - (bottom - top) * 0.12, x1, bottom, shade)

    def tower(self, xc, width, top, bottom, fill, roof=None, roof_col=None, roof_h=None, crenel=True,
              windows=None, win_col=(30, 22, 20), slit=True):
        x0, x1 = xc - width / 2, xc + width / 2
        self.rect(x0, top, x1, bottom, fill)
        if roof == 'pyramid':
            rh = roof_h or width * 0.7
            self.poly([(x0 - width * 0.08, top), (xc, top - rh), (x1 + width * 0.08, top)], roof_col)
        elif roof == 'cone':
            rh = roof_h or width * 1.1
            self.poly([(x0 - width * 0.06, top), (xc, top - rh), (x1 + width * 0.06, top)], roof_col)
        elif crenel:
            m = width / 7
            for i in range(4):
                self.rect(x0 + i * 2 * m, top - m * 0.9, x0 + i * 2 * m + m, top, fill)
        if slit:
            h = bottom - top
            for k in range(windows or max(1, int(h // 90))):
                yy = top + h * (0.18 + 0.6 * k / max(1, (windows or max(1, int(h // 90)))))
                self.rect(xc - width * 0.04, yy, xc + width * 0.04, yy + width * 0.22, win_col)

    def gable_house(self, x0, x1, wall_top, bottom, roof_h, wall_col, roof_col, timber=None, upper=None,
                    win_col=(40, 30, 25), overhang=10):
        self.rect(x0, wall_top, x1, bottom, wall_col)
        if upper is not None:  # upper floor in another colour (plaster over stone)
            self.rect(x0 - 6, wall_top, x1 + 6, upper, timber or wall_col)
        self.poly([(x0 - overhang, wall_top), (x0 + (x1 - x0) * 0.18, wall_top - roof_h),
                   (x1 - (x1 - x0) * 0.18, wall_top - roof_h), (x1 + overhang, wall_top)], roof_col)
        w = x1 - x0
        n = max(1, int(w // 70))
        for i in range(n):
            cx = x0 + w * (i + 0.5) / n
            yy = wall_top + (bottom - wall_top) * 0.3
            self.rect(cx - 9, yy, cx + 9, yy + 22, win_col)

    def arch(self, x0, x1, top, bottom, fill, hole=None, thickness=None):
        """A round arch (solid) with an optional opening coloured `hole`."""
        w = x1 - x0
        t = thickness or w * 0.16
        self.rect(x0, top + w / 2, x1, bottom, fill)
        self.pieslice([x0, top, x1, top + w], 180, 360, fill)
        if hole is not None:
            ix0, ix1 = x0 + t, x1 - t
            iw = ix1 - ix0
            self.rect(ix0, top + w / 2, ix1, bottom, hole)
            self.pieslice([ix0, top + w / 2 - iw / 2, ix1, top + w / 2 + iw / 2], 180, 360, hole)

    # ---------- vegetation ----------
    def cypress(self, xc, base, h, w, fill, seed=0):
        r = rng(seed)
        self.ellipse(xc, base - h * 0.5, w / 2, h / 2, fill)
        for _ in range(6):
            yy = base - h * r.uniform(0.15, 0.85)
            self.ellipse(xc + r.normal() * w * 0.12, yy, w * 0.35, h * 0.12, jitter(fill, r, 8))

    def round_tree(self, xc, base, h, w, fill, trunk=(60, 45, 35), seed=0, lit=None):
        r = rng(seed)
        self.rect(xc - w * 0.05, base - h * 0.45, xc + w * 0.05, base, trunk)
        for _ in range(14):
            cx = xc + r.normal() * w * 0.22
            cy = base - h * r.uniform(0.45, 0.85)
            rr = w * r.uniform(0.16, 0.28)
            self.ellipse(cx, cy, rr, rr * 0.85, jitter(fill, r, 9))
        if lit:
            for _ in range(6):
                cx = xc - w * 0.12 + r.normal() * w * 0.1
                cy = base - h * r.uniform(0.6, 0.9)
                rr = w * r.uniform(0.08, 0.14)
                self.ellipse(cx, cy, rr, rr * 0.8, jitter(lit, r, 8))

    def fir(self, xc, base, h, w, fill, seed=0, trunk=(55, 40, 30)):
        r = rng(seed)
        self.rect(xc - w * 0.04, base - h * 0.15, xc + w * 0.04, base, trunk)
        tiers = 7
        for i in range(tiers):
            t = i / tiers
            yb = base - h * (0.1 + 0.85 * t)
            ww = w * (1 - t) * 0.55 + w * 0.06
            self.poly([(xc - ww, yb), (xc, yb - h * 0.22), (xc + ww, yb)], jitter(fill, r, 6))

    def trunk(self, xc, base, top, w, fill, seed=0, roots=True):
        r = rng(seed)
        pts_l = [(xc - w / 2 + r.normal() * 3, y) for y in np.linspace(top, base, 12)]
        pts_r = [(xc + w / 2 + r.normal() * 3, y) for y in np.linspace(base, top, 12)]
        self.poly(pts_l + pts_r, fill)
        if roots:
            self.poly([(xc - w * 1.2, base), (xc - w / 2, base - w * 0.9), (xc + w / 2, base - w * 0.9),
                       (xc + w * 1.2, base)], fill)

    def boulder(self, xc, base, w, h, fill, lit=None, seed=0):
        self.chord([xc - w / 2, base - h, xc + w / 2, base + h], 180, 360, fill)
        if lit:
            self.chord([xc - w * 0.42, base - h * 0.95, xc + w * 0.1, base + h * 0.2], 180, 300, lit)

    # ---------- finishing ----------
    def finish(self, noise=7, blotch=16, seed=0, blur=0.6, keep_magenta=True):
        """Grain and low-frequency colour blotches on the painted part, so img2img has texture to grow."""
        r = rng(seed)
        a = np.asarray(self.im, np.float32)
        m = self.layer_mask() if keep_magenta else np.ones(a.shape[:2], bool)
        small = r.normal(size=(max(2, self.h // 48), max(2, self.w // 48), 1)).astype(np.float32)
        small = np.repeat(small, 3, axis=2) + r.normal(size=small.shape[:2] + (3,)).astype(np.float32) * 0.15
        tile = Image.fromarray(((small - small.min()) / (np.ptp(small) + 1e-6) * 255).astype(np.uint8))
        big = np.asarray(_resize_wrap(tile, (self.w, self.h), self.wrap_x, self.wrap_y), np.float32) / 255 - 0.5
        grain = r.normal(size=a.shape[:2] + (1,)) * noise + r.normal(size=a.shape) * noise * 0.2
        a2 = a * (1 + big * 2 * blotch / 128) + grain
        a = np.where(m[..., None], a2, a)
        im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
        if blur:
            b = im.filter(ImageFilter.GaussianBlur(blur))
            im = Image.composite(b, im, Image.fromarray((m * 255).astype(np.uint8)))
        self.im = im
        self.d = ImageDraw.Draw(self.im)
        return self.im


def _resize_wrap(img, size, wx=True, wy=False):
    w, h = img.size
    W, H = size
    nx, ny = (3 if wx else 1), (3 if wy else 1)
    t = Image.new(img.mode, (w * nx, h * ny))
    for i in range(nx):
        for j in range(ny):
            t.paste(img, (i * w, j * h))
    t = t.resize((W * nx, H * ny), Image.BICUBIC)
    return t.crop((W * (nx // 2), H * (ny // 2), W * (nx // 2) + W, H * (ny // 2) + H))


def sky_gradient(w, h, stops, seed=0, glow=None, clouds=None):
    """Opaque sky: vertical colour stops [(t, rgb)], optional sun glow (cx, cy, radius, rgb, strength) and
    cloud bands [(y, thickness, rgb, count)]. Everything is periodic in x."""
    y = np.linspace(0, 1, h)
    a = np.zeros((h, w, 3), np.float32)
    ts = [s[0] for s in stops]
    for c in range(3):
        col = np.interp(y, ts, [s[1][c] for s in stops])
        a[..., c] = col[:, None]
    if glow:
        cx, cy, rad, gc, st = glow
        xx = np.arange(w)[None, :]
        dx = np.minimum(np.abs(xx - cx), w - np.abs(xx - cx))
        dy = np.arange(h)[:, None] - cy
        g = np.exp(-(dx ** 2 + dy ** 2) / (2 * rad ** 2))[..., None] * st
        a = a * (1 - g) + np.array(gc, np.float32) * g
    im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    d = Draft(w, h)
    d.im = im
    d.d = ImageDraw.Draw(im)
    r = rng(seed)
    for (cy, th, col, cnt) in (clouds or []):
        for _ in range(cnt):
            cx = r.uniform(0, w)
            ln = r.uniform(120, 420)
            for _ in range(5):
                d.ellipse(cx + r.normal() * ln * 0.3, cy + r.normal() * th * 0.3, ln * r.uniform(0.3, 0.6),
                          th * r.uniform(0.3, 0.6), jitter(col, r, 8))
    d.im = d.im.filter(ImageFilter.GaussianBlur(6))
    d.d = ImageDraw.Draw(d.im)
    return d


# ---------- props shared by the biomes ----------
def barrel(d, cx, top, bottom, halfw, bulge, col, hoop=(62, 58, 54), stave=None):
    ys = np.linspace(top, bottom, 40)
    half = [halfw + bulge * math.sin(math.pi * (y - top) / (bottom - top)) for y in ys]
    d.poly([(cx - hw, y) for hw, y in zip(half, ys)] + [(cx + hw, y) for hw, y in zip(half[::-1], ys[::-1])], col)
    stave = stave or tuple(int(v * 0.78) for v in col)
    for k in range(-3, 4):
        pts = [(cx + hw * k / 4.2, y) for hw, y in zip(half, ys)]
        d.line(pts, stave, width=4)
    for t in (0.1, 0.24, 0.76, 0.9):
        y = top + (bottom - top) * t
        hw = halfw + bulge * math.sin(math.pi * t)
        d.rect(cx - hw, y - 11, cx + hw, y + 11, hoop)


def crate(d, x0, y0, x1, y1, col, dark=None, brace=True):
    dark = dark or tuple(int(v * 0.7) for v in col)
    d.rect(x0, y0, x1, y1, col)
    n = 5
    for k in range(1, n):
        y = y0 + (y1 - y0) * k / n
        d.rect(x0, y - 4, x1, y + 4, dark)
    fw = (x1 - x0) * 0.07
    for x in (x0, x1 - fw):
        d.rect(x, y0, x + fw, y1, tuple(int(v * 0.85) for v in col))
    d.rect(x0, y0, x1, y0 + fw, tuple(int(v * 0.85) for v in col))
    d.rect(x0, y1 - fw, x1, y1, tuple(int(v * 0.85) for v in col))
    if brace:
        d.poly([(x0 + fw, y1 - fw * 1.6), (x0 + fw * 2.4, y1 - fw), (x1 - fw, y0 + fw * 1.6), (x1 - fw * 2.4, y0 + fw)],
               tuple(int(v * 0.85) for v in col))
