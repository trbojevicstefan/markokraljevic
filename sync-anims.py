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
        if 'frame_layout' not in json.load(open(manifest, encoding='utf-8-sig')):
            print('preskačem (nema frame_layout):', name); continue
        if name.endswith('-v2'):  # DOPUNA-45: the drawn in-betweens of a clip; smooth-anims.py reads them from art/ itself
            continue
        if name == 'pauza-logor-16':  # the same 16-frame camp ships from art/world-pack-03/pauza-logor.png (sync-world.py)
            continue
        if name.startswith(('barjak-', 'pauza-', 'prelaz-')):  # banner loops, the pause scene and the scenes between pohodi are world art: a light WebP strip, not part of the sprite rig
            from PIL import Image
            dst = os.path.join(OUT, 'world', name + '.webp')
            if not os.path.exists(dst) or os.path.getmtime(dst) < os.path.getmtime(atlas):
                Image.open(atlas).save(dst, 'WEBP', quality=84, method=5); n += 1; print('barjak', name)
            continue
        dst = os.path.join(OUT, name + '.png')
        if os.path.exists(dst) and os.path.getmtime(dst) >= os.path.getmtime(atlas):
            continue
        shutil.copyfile(atlas, dst); n += 1
        with open(manifest, 'rb') as f:  # the artist sometimes writes a BOM, which json.load in the rig builder chokes on
            raw = f.read()
        with open(os.path.join(OUT, name + '.json'), 'wb') as f:
            f.write(raw[3:] if raw.startswith(b'\xef\xbb\xbf') else raw)
        if name.startswith(('vila-', 'magija-')):  # a faint haze over the whole cell would show as a pale square in the game
            from PIL import Image
            import numpy as np
            a = np.array(Image.open(dst).convert('RGBA')); al = a[:, :, 3].astype(float)
            al = np.where(al < 14, 0, np.where(al < 40, (al - 14) / 26 * 40, al)); a[:, :, 3] = al.astype(np.uint8)
            Image.fromarray(a).save(dst)
        if name.startswith(('kostur-', 'oklopnik-kostur')):  # the magenta key shows between the ribs: those pixels are cleared
            from PIL import Image
            import numpy as np
            a = np.array(Image.open(dst).convert('RGBA')); r, g, b = (a[:, :, i].astype(int) for i in range(3))
            a[(r > 90) & (b > 70) & (g < r - 30) & (g < b - 20), 3] = 0; Image.fromarray(a).save(dst)
        print('klip', name)
print(f'{n} novih klipova -> {OUT}')
