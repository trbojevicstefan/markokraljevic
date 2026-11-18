from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image


def verify(path: Path, expected: tuple[int, int], grille: bool) -> None:
    image = Image.open(path).convert("RGBA")
    alpha = image.getchannel("A")
    transparent = sum(1 for a in alpha.getdata() if a == 0) / (image.width * image.height)
    assert image.size == expected, f"{path.name}: {image.size}, expected {expected}"
    assert transparent > (0.40 if grille else 0.10), f"{path.name}: only {transparent:.1%} transparent"
    print(f"{path.name}: PASS size={image.width}x{image.height} transparent={transparent:.1%}")


if __name__ == "__main__":
    if len(sys.argv) != 4:
        raise SystemExit("usage: verify-dopuna73.py FILE WIDTHxHEIGHT grille|wall")
    w, h = (int(v) for v in sys.argv[2].lower().split("x", 1))
    verify(Path(sys.argv[1]), (w, h), sys.argv[3] == "grille")
