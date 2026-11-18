from pathlib import Path
from PIL import Image


ROOT = Path(__file__).resolve().parent


def export_frame(source: Path, target: Path) -> tuple[int, int]:
    with Image.open(source) as im:
        im = im.convert("RGB")
        ratio = 16 / 9
        width, height = im.size
        if width / height > ratio:
            crop_width = int(height * ratio)
            left = (width - crop_width) // 2
            im = im.crop((left, 0, left + crop_width, height))
        else:
            crop_height = int(width / ratio)
            top = (height - crop_height) // 2
            im = im.crop((0, top, width, top + crop_height))
        im = im.resize((1536, 864), Image.Resampling.LANCZOS)
        im.save(target, format="PNG")
        return im.size


def export_small(source: Path, target: Path) -> tuple[int, int]:
    with Image.open(source) as im:
        im = im.convert("RGB").resize((640, 360), Image.Resampling.LANCZOS)
        im.save(target, format="JPEG", quality=92, optimize=True)
        return im.size


if __name__ == "__main__":
    import sys

    if len(sys.argv) != 4:
        raise SystemExit("usage: obradi-dopuna87.py SOURCE MAIN.png SMALL.jpg")
    source, main, small = map(Path, sys.argv[1:])
    print("main", export_frame(source, main))
    print("small", export_small(main, small))
