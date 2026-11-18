"""Read-only D77 validation."""
from pathlib import Path
import json, numpy as np
from PIL import Image
ROOT = Path(__file__).resolve().parents[1] / 'animation-pack-04'
SPECS = {'vila-pogodjena': (4, False), 'vila-udarena': (4, False), 'vila-moli': (6, True), 'vila-ustaje': (6, False), 'vila-peva': (6, True)}
def read(p):
    raw = p.read_bytes(); assert not raw.startswith(b'\xef\xbb\xbf'); return json.loads(raw)
for name, (n, loop) in SPECS.items():
    out = ROOT / 'assets' / name; m = read(out / 'manifest.json'); qa = read(out / 'qa.json'); assert qa['identityApproved'] and qa['atlasMatchesFrames']
    assert m['description'].isascii() and m['holdLastFrame'] is False
    row = m['animation']['rows']['motion']; assert row['frames'] == n and row['loop'] == loop and row['holdLastFrame'] is False
    atlas = Image.open(out / 'atlas.png').convert('RGBA'); assert atlas.size == (512 * n, 512); gif = Image.open(out / 'preview.gif'); assert gif.n_frames == n and gif.info.get('loop') == 0
    for i in range(n):
        p = Image.open(out / 'frames/motion' / f'frame-{i}.png').convert('RGBA'); assert p.size == (512, 512); assert atlas.crop((512*i, 0, 512*(i+1), 512)).tobytes() == p.tobytes(); bb = p.getbbox(); assert min(bb[0], bb[1], 512-bb[2], 512-bb[3]) >= 24; a = np.array(p).astype(float); mask = a[:, :, 3] > 0; assert a[:, :, 3].max() == 255; assert not ((a[:, :, 1] > 120) & (a[:, :, 1] > a[:, :, 0] * 1.35 + 20) & (a[:, :, 1] > a[:, :, 2] * 1.35 + 20) & mask).any(); assert list(bb) == qa['frames'][i]['bbox'] and not qa['frames'][i]['touchesEdge']
    print('PASS', name, n, 'frames; measured heights', qa['measuredHeights'], 'supportY', [f['supportY'] for f in qa['frames']])
