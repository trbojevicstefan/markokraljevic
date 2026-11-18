from __future__ import annotations

from pathlib import Path
from PIL import Image

ROOT = Path(__file__).parent
EXPECTED = {
    "kapija-zid-kamen": (832, 1664, True),
    "kapija-zid-drvo": (832, 1664, True),
    "kapija-pozadi-kamen": (624, 840, False),
    "kapija-pozadi-drvo": (624, 840, False),
    "kapija-resetka": (256, 1024, True),
    "kapija-resetka-drvo": (256, 1024, True),
}

for name, (w, h, alpha) in EXPECTED.items():
    p = ROOT / f"{name}.png"
    if not p.exists():
        print(f"D70 FAIL {name}: missing")
        continue
    im = Image.open(p).convert("RGBA")
    ok = im.size == (w, h)
    if alpha:
        ok = ok and im.getextrema()[3][0] == 0
    else:
        ok = ok and im.getextrema()[3][0] == 255
    # wall geometry checks in final pixel coordinates
    if name.startswith("kapija-zid-"):
        ok = ok and im.getpixel((416, 1200))[3] == 0
        ok = ok and im.getpixel((416, 600))[3] > 0
    print(f"D70 {'OK' if ok else 'FAIL'} {name}: {im.size}, alpha_min={im.getextrema()[3][0]}")
