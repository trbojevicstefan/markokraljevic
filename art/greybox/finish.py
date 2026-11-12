# The greybox's generated props: cut out (BiRefNet mask, magenta keyed away), cropped to the object, saved at 2x their drawn
# height into dist/assets/greybox/. Run with the image tools' python from the repository root:
#   D:/projects/Videos/_tools/zimg/Scripts/python.exe art/greybox/finish.py <raw dir> oltar=1 poluga=2 prekidac=1
import sys
from pathlib import Path
import numpy as np
from PIL import Image

sys.path.insert(0, 'tools')
from realisticno_post import birefnet_alpha, save_webp, magentaness  # noqa: E402

DRAWN_H = {'oltar': 58, 'poluga': 80, 'prekidac': 24}   # world pixels, as greybox-svet.js draws them
raw = Path(sys.argv[1])
out = Path('dist/assets/greybox'); out.mkdir(parents=True, exist_ok=True)
for arg in sys.argv[2:]:
    name, seed = arg.split('=')
    img = Image.open(raw / f'gb-{name}_s{seed}.png').convert('RGB')
    a = np.asarray(birefnet_alpha(img), np.float32) / 255.0                      # the object's mask
    m = np.clip((magentaness(np.asarray(img, np.float32)) - 60) / 120, 0, 1)     # 1 on the magenta background
    a = np.clip(a * (1 - m), 0, 1)
    rgba = np.dstack([np.asarray(img, np.uint8), (a * 255).astype(np.uint8)])
    im = Image.fromarray(rgba, 'RGBA')
    box = im.getchannel('A').point(lambda v: 255 if v > 24 else 0).getbbox()
    im = im.crop(box)
    h = DRAWN_H[name] * 2
    im = im.resize((max(1, round(im.width * h / im.height)), h), Image.LANCZOS)
    save_webp(im, str(out / f'{name}.webp'))
    print(name, seed, im.size)
