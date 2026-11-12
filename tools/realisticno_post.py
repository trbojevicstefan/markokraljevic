"""Post-processing for the realistic layers, tiles and props (CPU only, low RAM).

Functions used by tools/realisticno.py:
  key_layer(raw, draft)   magenta background -> alpha, guided by the draft's silhouette, edges un-mixed from magenta
  resize_wrap(img, size)  resample a horizontally tiling image so it still tiles (3 copies, resize, middle copy)
  resize_wrap_xy(img, s)  same for an image that tiles both ways
  seam_score(img, axis)   how much the wrap seam differs from an ordinary neighbouring column (1.0 = invisible)
  seam_strip(img)         two copies side by side around the seam, for looking at it
  save_webp(img, path)    WebP under ~1 MB (quality steps down until it fits)
  birefnet_alpha(img)     BiRefNet (rembg's ONNX) foreground mask, used for props
"""
import io, os

import numpy as np
from PIL import Image, ImageFilter

MAGENTA = np.array([255, 0, 255], np.float32)
BIREFNET = r'D:\projects\Videos\_models\rembg\birefnet-general.onnx'


def _wrap_filter(a, flt, pad=48, wrap_x=True):
    """Apply a PIL filter to an L-mode array with wrapped left/right margins."""
    if wrap_x:
        a2 = np.concatenate([a[:, -pad:], a, a[:, :pad]], axis=1)
    else:
        a2 = np.pad(a, ((0, 0), (pad, pad)), mode='edge')
    out = np.asarray(Image.fromarray(a2).filter(flt))
    return out[:, pad:-pad]


def _dilate(mask, r, wrap_x=True):
    m = (mask.astype(np.uint8) * 255)
    for _ in range(max(1, r // 4)):
        m = _wrap_filter(m, ImageFilter.MaxFilter(9 if r >= 4 else 3), wrap_x=wrap_x)
    return m > 127


def _erode(mask, r, wrap_x=True):
    return ~_dilate(~mask, r, wrap_x)


def magentaness(rgb):
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    return np.minimum(r, b) - g - 0.35 * np.abs(r - b)


def key_layer(raw, draft=None, band=56, lo=70, hi=150, wrap_x=True, spill_band=24):
    """raw: RGB image on a magenta background. draft: the draft it was made from (same size or resized here).
    Inside the draft's silhouette (shrunk by `band`) the layer is opaque, outside it (grown by `band`) it is
    empty, and in between the magenta key decides, so whatever the model added close to the silhouette stays."""
    rgb = np.asarray(raw.convert('RGB'), np.float32)
    m = magentaness(rgb)
    if draft is not None:
        d = np.asarray(draft.convert('RGB').resize(raw.size, Image.NEAREST), np.float32)
        fg = magentaness(d) < 120
        core = _erode(fg, band, wrap_x)
        out = ~_dilate(fg, band, wrap_x)
        # The model's magenta is not always pure (a second pass returns it paler): put the upper threshold just
        # under the background it actually painted, so a pale background still keys out completely.
        if out.any():
            m_bg = float(np.percentile(m[out], 10))
            hi = min(hi, m_bg - 12)
            lo = min(lo, hi - 45)
    a = 1 - np.clip((m - lo) / max(1.0, hi - lo), 0, 1)
    if draft is not None:
        a[core & (m < 110)] = 1           # holes in foliage inside the silhouette still show magenta: keep them keyed
        a[out] = 0
    a8 = (a * 255).astype(np.uint8)
    a8 = _wrap_filter(a8, ImageFilter.MedianFilter(5), wrap_x=wrap_x)
    a = a8.astype(np.float32) / 255
    # un-mix the edge from magenta: I = a*C + (1-a)*M  ->  C = (I - (1-a)*M) / a
    edge = (a > 0.02) & (a < 0.98)
    c = rgb.copy()
    aa = np.clip(a[..., None], 0.15, 1)
    c[edge] = np.clip((rgb[edge] - (1 - aa[edge]) * MAGENTA) / aa[edge], 0, 255)
    # remaining magenta tint on opaque pixels near the edge
    # Magenta light the model baked into edges and into foliage full of small holes: where both red and blue
    # exceed green (natural greens, stone and roof reds never do) pull them down to green. Fades out over the band.
    near = _dilate(a < 0.98, spill_band, wrap_x) & (a > 0)
    spill = np.clip(np.minimum(c[..., 0], c[..., 2]) - c[..., 1], 0, None)
    for ch in (0, 2):
        c[..., ch] = np.where(near, c[..., ch] - spill * 0.9, c[..., ch])
    c = np.clip(c, 0, 255)
    # Half-transparent mist and glow over magenta un-mix to a false green or purple when alpha is a little off:
    # take most of their colour away (they are light and haze, their hue comes from the layers behind).
    soft = (a > 0.02) & (a < 0.9)
    luma = (c[..., 0] * 0.3 + c[..., 1] * 0.55 + c[..., 2] * 0.15)[..., None]
    c = np.where(soft[..., None], c * 0.3 + luma * 0.7, c)
    rgba = np.dstack([c, a * 255]).round().astype(np.uint8)
    return Image.fromarray(rgba, 'RGBA')


def resize_wrap(img, size):
    w, h = img.size
    W, H = size
    t = Image.new(img.mode, (w * 3, h))
    for i in range(3):
        t.paste(img, (i * w, 0))
    t = t.resize((W * 3, H), Image.LANCZOS)
    return t.crop((W, 0, 2 * W, H))


def resize_wrap_xy(img, size):
    w, h = img.size
    W, H = size
    t = Image.new(img.mode, (w * 3, h * 3))
    for i in range(3):
        for j in range(3):
            t.paste(img, (i * w, j * h))
    t = t.resize((W * 3, H * 3), Image.LANCZOS)
    return t.crop((W, H, 2 * W, 2 * H))


def seam_score(img, axis='x'):
    """Mean colour step across the wrap seam divided by the mean step between neighbouring columns (rows).
    About 1 means the seam looks like any other column boundary."""
    a = np.asarray(img.convert('RGBA'), np.float32)
    if axis == 'y':
        a = a.transpose(1, 0, 2)
    rgb = a[..., :3] * (a[..., 3:4] / 255)
    steps = np.abs(np.diff(rgb, axis=1)).mean(axis=(0, 2))
    seam = np.abs(rgb[:, 0] - rgb[:, -1]).mean()
    return float(seam / (np.mean(steps) + 1e-6))


def seam_strip(img, half=360, bg=(255, 0, 255)):
    w, h = img.size
    two = Image.new('RGBA', (w * 2, h), bg + (255,))
    im = img.convert('RGBA')
    two.alpha_composite(im, (0, 0))
    two.alpha_composite(im, (w, 0))
    return two.crop((w - half, 0, w + half, h)).convert('RGB')


def save_webp(img, path, max_bytes=1_000_000, q0=90):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    for q in range(q0, 40, -4):
        buf = io.BytesIO()
        img.save(buf, 'WEBP', quality=q, method=6, alpha_quality=90)
        if buf.tell() <= max_bytes:
            break
    with open(path, 'wb') as f:
        f.write(buf.getvalue())
    return q, buf.tell()


_sess = None


def birefnet_alpha(img):
    global _sess
    import onnxruntime as ort
    if _sess is None:
        so = ort.SessionOptions()
        so.intra_op_num_threads = 4
        _sess = ort.InferenceSession(BIREFNET, so, providers=['CPUExecutionProvider'])
    inp = _sess.get_inputs()[0]
    x = np.asarray(img.convert('RGB').resize((1024, 1024), Image.BICUBIC), np.float32) / 255
    x = (x - [0.485, 0.456, 0.406]) / [0.229, 0.224, 0.225]
    x = x.transpose(2, 0, 1)[None].astype(np.float32)
    y = _sess.run(None, {inp.name: x})[0][0, 0]
    y = 1 / (1 + np.exp(-y)) if y.min() < 0 or y.max() > 1 else y
    m = Image.fromarray((np.clip(y, 0, 1) * 255).astype(np.uint8)).resize(img.size, Image.BICUBIC)
    return m
