from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image


MAGENTA = (255, 0, 255)
TARGET_SIZE = (2172, 724)


def key_magenta(source: Path, target: Path) -> None:
    image = Image.open(source).convert("RGBA")
    if image.size != TARGET_SIZE:
        image = image.resize(TARGET_SIZE, Image.Resampling.LANCZOS)
    pixels = image.load()
    for y in range(image.height):
        for x in range(image.width):
            r, g, b, a = pixels[x, y]
            distance = ((r - MAGENTA[0]) ** 2 + (g - MAGENTA[1]) ** 2 + (b - MAGENTA[2]) ** 2) ** 0.5
            magenta_hue = r > 180 and b > 80 and g < 150 and r - g > 50 and b - g > 10
            # Keep a firm matte around the saturated key color. A hard outer
            # cutoff is preferable here to a pink halo on blue/white gameplay.
            if distance < 96 or magenta_hue:
                pixels[x, y] = (r, g, b, 0)
            elif distance < 118:
                alpha = int(255 * (distance - 96) / 22)
                pixels[x, y] = (r, g, b, min(a, alpha))
    target.parent.mkdir(parents=True, exist_ok=True)
    image.save(target, "PNG")


def preview(source: Path, target: Path, background: tuple[int, int, int]) -> None:
    fg = Image.open(source).convert("RGBA")
    bg = Image.new("RGBA", fg.size, (*background, 255))
    bg.alpha_composite(fg)
    bg.convert("RGB").save(target, "JPEG", quality=92)


if __name__ == "__main__":
    src, dst, blue, white = map(Path, sys.argv[1:5])
    key_magenta(src, dst)
    preview(dst, blue, (48, 105, 190))
    preview(dst, white, (255, 255, 255))
