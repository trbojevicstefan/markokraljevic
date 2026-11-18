from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).parent

def seamless_body(src: Path, dst: Path):
    im = Image.open(src).convert("RGB")
    side = min(im.size)
    left = (im.width - side) // 2
    top = (im.height - side) // 2
    im = im.crop((left, top, left + side, top + side)).resize((256, 256), Image.Resampling.LANCZOS)
    fx = ImageOps.mirror(im)
    fy = ImageOps.flip(im)
    fxy = ImageOps.flip(fx)
    out = Image.new("RGB", (512, 512))
    out.paste(im, (0, 0)); out.paste(fx, (256, 0))
    out.paste(fy, (0, 256)); out.paste(fxy, (256, 256))
    out.save(dst, optimize=True)

def top_tile(src: Path, dst: Path, crop_y: int):
    im = Image.open(src).convert("RGB")
    # Keep the tread, bright front edge, and the full stair face in one 128px strip.
    band = im.crop((0, crop_y, im.width, crop_y + max(1, int(im.width * 128 / 1024))))
    band = band.resize((1024, 128), Image.Resampling.LANCZOS)
    # Mirror-repeat horizontally so the tile has identical values at both edges.
    half = band.crop((0, 0, 512, 128))
    out_rgb = Image.new("RGB", (1024, 128))
    out_rgb.paste(half, (0, 0)); out_rgb.paste(ImageOps.mirror(half), (512, 0))
    out_rgb.save(dst, optimize=True)

def probe_body(src: Path, dst: Path):
    im = Image.open(src).convert("RGB")
    out = Image.new("RGB", (1536, 1536))
    for y in range(3):
        for x in range(3):
            out.paste(im, (x * 512, y * 512))
    out.save(dst, optimize=True)

def probe_top(src: Path, dst: Path):
    im = Image.open(src).convert("RGB")
    out = Image.new("RGB", (4096, 128))
    for x in range(4):
        out.paste(im, (x * 1024, 0))
    out.save(dst, optimize=True)

items = [
    ("kamen",  "stepenik-kamen-vrh",  "vrh",  "stepenik-kamen-vrh.gen.png",  300),
    ("kamen",  "stepenik-kamen-telo", "telo", "stepenik-kamen-telo.gen.png", 0),
    ("zemlja", "stepenik-zemlja-vrh",  "vrh",  "stepenik-zemlja-vrh.gen.png",  200),
    ("zemlja", "stepenik-zemlja-telo", "telo", "stepenik-zemlja-telo.gen.png", 0),
    ("tvrdjava","stepenik-tvrdjava-vrh","vrh",  "stepenik-tvrdjava-vrh.gen.png",  180),
    ("tvrdjava","stepenik-tvrdjava-telo","telo", "stepenik-tvrdjava-telo.gen.png", 0),
]

for _theme, name, kind, gen, crop_y in items:
    src = ROOT / gen
    dst = ROOT / f"{name}.png"
    if kind == "vrh":
        top_tile(src, dst, crop_y)
        probe_top(dst, ROOT / f"stepenik-{_theme}-proba.png")
    else:
        seamless_body(src, dst)
        probe_body(dst, ROOT / f"stepenik-{_theme}-proba.png")

print("processed", len(items), "tiles")
