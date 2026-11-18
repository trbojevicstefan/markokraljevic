from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image


def clean_alpha(image: Image.Image) -> Image.Image:
    image = image.convert("RGBA")
    pixels = image.load()
    for y in range(image.height):
        for x in range(image.width):
            r, g, b, a = pixels[x, y]
            # Remove the low-alpha matte and the neon chroma fringe left by
            # transparent-background generation, while keeping painted edges.
            if a < 230:
                pixels[x, y] = (r, g, b, 0)
            elif (r > 205 and g < 115 and b < 115) or (r > 210 and g > 175 and b < 120):
                pixels[x, y] = (r, g, b, 0)
    return image


def export(source: Path, target: Path, size: tuple[int, int]) -> None:
    image = clean_alpha(Image.open(source))
    image = image.resize(size, Image.Resampling.LANCZOS)
    image.save(target, "PNG", optimize=True)
    print(f"{target.name}: {image.width}x{image.height} RGBA")


if __name__ == "__main__":
    if len(sys.argv) != 4:
        raise SystemExit("usage: export-dopuna73.py SOURCE TARGET WIDTHxHEIGHT")
    w, h = (int(v) for v in sys.argv[3].lower().split("x", 1))
    export(Path(sys.argv[1]), Path(sys.argv[2]), (w, h))
