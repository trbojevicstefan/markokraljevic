"""Copies the artist's world packs into the game: python sync-world.py
Every finished PNG plus levels.json / catalog.json lands in dist/assets/world/. Missing art is simply skipped by the game."""
import glob, os, shutil
from PIL import Image
ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, 'dist', 'assets', 'world')
os.makedirs(OUT, exist_ok=True)
n = 0
for pack in sorted(glob.glob(os.path.join(ROOT, 'art', 'world-pack-*'))):
    # pack 01 keeps its art in assets/, later packs at the top of the pack; previews are not game art
    files = glob.glob(os.path.join(pack, 'assets', '*.png')) + glob.glob(os.path.join(pack, '*.png'))
    for f in (f for f in files if 'preview' not in os.path.basename(f)):
        dst = os.path.join(OUT, os.path.basename(f)[:-4] + '.webp')
        if os.path.exists(dst) and os.path.getmtime(dst) >= os.path.getmtime(f):
            continue  # already converted
        # WebP keeps the alpha channel at a fraction of the PNG size
        Image.open(f).save(dst, 'WEBP', quality=82, method=5); n += 1
    suffix = '' if pack.endswith('-01') else '-' + pack[-2:]  # catalog-02.json etc., so packs do not overwrite each other
    for meta in ('levels.json', 'catalog.json'):
        if os.path.exists(os.path.join(pack, meta)):
            shutil.copyfile(os.path.join(pack, meta), os.path.join(OUT, meta.replace('.json', suffix + '.json')))
import json
json.dump(sorted(f for f in os.listdir(OUT) if f.endswith('.webp')), open(os.path.join(OUT, 'files.json'), 'w'))
print(f'{n} novih slika -> {OUT}')
