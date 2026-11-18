"""Read-only D78 validation."""
from pathlib import Path
import json
import numpy as np
from PIL import Image
ROOT = Path(__file__).resolve().parents[1] / 'animation-pack-04'
SPECS = {'mounted-hod': (8, True), 'sarac-hod-2': (8, True), 'milos-peva': (8, True), 'milos-pogodjen': (4, False), 'milos-hod': (8, True)}
def read(path):
    raw = path.read_bytes(); assert not raw.startswith(b'\xef\xbb\xbf'); return json.loads(raw)
for name, (n, loop) in SPECS.items():
    out = ROOT / 'assets' / name; manifest = read(out / 'manifest.json'); qa = read(out / 'qa.json')
    assert qa['identityApproved'] and qa['atlasMatchesFrames']; assert manifest['description'].isascii()
    row = manifest['animation']['rows']['motion']; assert row['frames'] == n and row['loop'] == loop and row['holdLastFrame'] is False
    atlas = Image.open(out / 'atlas.png').convert('RGBA'); assert atlas.size == (512 * n, 512)
    gif = Image.open(out / 'preview.gif'); assert gif.n_frames == n and gif.info.get('loop') == 0
    for i in range(n):
        frame = Image.open(out / f'frames/motion/frame-{i}.png').convert('RGBA'); assert frame.size == (512, 512)
        assert atlas.crop((512 * i, 0, 512 * (i + 1), 512)).tobytes() == frame.tobytes(); bb = frame.getbbox(); assert min(bb[0], bb[1], 512 - bb[2], 512 - bb[3]) >= 24
        ar = np.array(frame).astype(float); mask = ar[:, :, 3] > 0; assert ar[:, :, 3].max() == 255; assert not ((ar[:, :, 1] > 120) & (ar[:, :, 1] > ar[:, :, 0] * 1.35 + 20) & (ar[:, :, 1] > ar[:, :, 2] * 1.35 + 20) & mask).any(); assert list(bb) == qa['frames'][i]['bbox'] and not qa['frames'][i]['touchesEdge']
    print('PASS', name, n, 'frames; measured heights', qa['measuredHeights'])
