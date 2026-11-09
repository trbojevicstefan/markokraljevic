"""Copies the artist's finished animation clips (art/animation-pack-04+) into dist/assets: python sync-anims.py
A clip is finished when its folder holds atlas.png and manifest.json. Run build-sprite-rig.py afterwards."""
import glob, os, shutil, json
ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, 'dist', 'assets')
n = 0
for pack in sorted(glob.glob(os.path.join(ROOT, 'art', 'animation-pack-0[4-9]'))):
    for clip in sorted(glob.glob(os.path.join(pack, 'assets', '*'))):
        name = os.path.basename(clip)
        atlas, manifest = os.path.join(clip, 'atlas.png'), os.path.join(clip, 'manifest.json')
        if not (os.path.exists(atlas) and os.path.exists(manifest)):
            continue
        if 'frame_layout' not in json.load(open(manifest, encoding='utf8')):
            print('preskačem (nema frame_layout):', name); continue
        if name.startswith('barjak-'):  # banner loops are world art: a light WebP strip, not part of the sprite rig
            from PIL import Image
            dst = os.path.join(OUT, 'world', name + '.webp')
            if not os.path.exists(dst) or os.path.getmtime(dst) < os.path.getmtime(atlas):
                Image.open(atlas).save(dst, 'WEBP', quality=84, method=5); n += 1; print('barjak', name)
            continue
        dst = os.path.join(OUT, name + '.png')
        if os.path.exists(dst) and os.path.getmtime(dst) >= os.path.getmtime(atlas):
            continue
        shutil.copyfile(atlas, dst); shutil.copyfile(manifest, os.path.join(OUT, name + '.json')); n += 1
        if name.startswith(('vila-', 'magija-')):  # a faint haze over the whole cell would show as a pale square in the game
            from PIL import Image
            import numpy as np
            a = np.array(Image.open(dst).convert('RGBA')); al = a[:, :, 3].astype(float)
            al = np.where(al < 14, 0, np.where(al < 40, (al - 14) / 26 * 40, al)); a[:, :, 3] = al.astype(np.uint8)
            Image.fromarray(a).save(dst)
        print('klip', name)
print(f'{n} novih klipova -> {OUT}')
