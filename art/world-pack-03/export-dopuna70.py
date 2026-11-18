from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).parent
GREEN = (0, 255, 0)


def key_green(im: Image.Image, tolerance: int = 95) -> Image.Image:
    rgba = im.convert("RGBA")
    px = rgba.load()
    for y in range(rgba.height):
        for x in range(rgba.width):
            r, g, b, a = px[x, y]
            if g >= 150 and g > r * 1.35 and g > b * 1.35 and (g - r) + (g - b) >= tolerance:
                px[x, y] = (r, g, b, 0)
    return rgba


def wall_mask(im: Image.Image) -> Image.Image:
    im = key_green(im)
    w, h = im.size
    sx, sy = w / 832.0, h / 1664.0
    px = im.load()
    for y in range(h):
        yy = y / sy
        for x in range(w):
            xx = x / sx
            # Exact 624px-wide opening: x=104..728, crown y=780, spring y=920.
            if 104 <= xx <= 728:
                if yy >= 920 or (780 <= yy < 920 and yy >= 780 + 140 * ((1 - ((xx - 416) / 312) ** 2) ** 0.5)):
                    px[x, y] = (0, 255, 0, 0)
            # Keep the intentional central 88px groove opaque above the arch.
            if 372 <= xx < 460 and yy < 780:
                if px[x, y][3] == 0:
                    px[x, y] = (35, 35, 35, 255)
    return im


def save(src: Path, name: str, size: tuple[int, int], *, wall=False, keyed=False) -> dict:
    im = Image.open(src).convert("RGBA")
    if wall:
        im = wall_mask(im)
    elif keyed:
        im = key_green(im)
    im = im.resize(size, Image.Resampling.LANCZOS)
    out = ROOT / f"{name}.png"
    im.save(out, "PNG", optimize=True)
    return {"name": name, "size": im.size, "mode": im.mode, "path": str(out)}


if __name__ == "__main__":
    if len(sys.argv) < 4:
        raise SystemExit("usage: export-dopuna70.py SOURCE NAME WIDTH HEIGHT [wall|keyed]")
    src, name, width, height = Path(sys.argv[1]), sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
    flags = set(sys.argv[5:])
    print(save(src, name, (width, height), wall="wall" in flags, keyed="keyed" in flags))
