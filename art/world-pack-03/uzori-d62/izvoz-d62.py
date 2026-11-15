"""D62: reproducible sizing and PNG/WebP export of generated artwork."""
from pathlib import Path
from PIL import Image

HERE = Path(__file__).resolve().parent
WORLD = HERE.parents[2] / 'dist' / 'assets' / 'world'


def prop(name, canvas, max_size, bottom):
    image = Image.open(HERE / f'{name}-imagegen.png').convert('RGBA')
    alpha = image.getchannel('A')
    # The generator leaves alpha=1 noise outside the visible artwork.
    # Discard only that effectively invisible export residue.
    image.putalpha(alpha.point(lambda value: 0 if value <= 1 else value))
    image = image.crop(image.getchannel('A').getbbox())
    scale = min(max_size[0] / image.width, max_size[1] / image.height)
    image = image.resize((round(image.width * scale), round(image.height * scale)), Image.Resampling.LANCZOS)
    output = Image.new('RGBA', canvas)
    output.alpha_composite(image, ((canvas[0] - image.width) // 2, bottom + 1 - image.height))
    output.save(HERE / f'{name}.png')
    output.save(WORLD / f'{name}.webp', lossless=True, method=6, exact=True)


if __name__ == '__main__':
    WORLD.mkdir(parents=True, exist_ok=True)
    prop('prop-slomljena-sablja', (1024, 512), (614, 160), 480)
    prop('prop-koplje-u-granama', (1024, 1024), (640, 420), 480)
    end = Image.open(HERE / 'kraj-urvina-imagegen.png').convert('RGB')
    end = end.resize((1920, 1080), Image.Resampling.LANCZOS)
    end.save(HERE / 'kraj-urvina.png')
    end.save(WORLD / 'kraj-urvina.webp', quality=90, method=6)
