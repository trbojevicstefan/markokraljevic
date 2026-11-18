"""Read-only D86 validation."""
from pathlib import Path
import json
from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / 'animation-pack-04'
out = ROOT / 'assets' / 'mladi-turcin-budi'
m = json.loads((out / 'manifest.json').read_text(encoding='utf-8'))
q = json.loads((out / 'qa.json').read_text(encoding='utf-8'))
assert m['frame_layout']['sheetWidth'] == 3072 and q['atlasMatchesFrames']
atlas = Image.open(out / 'atlas.png').convert('RGBA'); assert atlas.size == (3072, 512)
gif = Image.open(out / 'preview.gif'); assert gif.n_frames == 6
expected = [294, 320, 350, 384, 408, 426]
assert q['measuredHeights'] == expected
for i in range(6):
    p = Image.open(out / f'frames/motion/frame-{i}.png').convert('RGBA')
    assert p.size == (512, 512) and atlas.crop((512*i, 0, 512*(i+1), 512)).tobytes() == p.tobytes()
    f = q['frames'][i]; assert f['supportY'] == 487 and f['safeMargin'] >= 24 and not f['touchesEdge'] and not f['greenPixels']
print('PASS mladi-turcin-budi 6 frames; measured heights', q['measuredHeights'])
