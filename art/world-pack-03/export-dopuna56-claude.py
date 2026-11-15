"""Exports the D56 attempt that Codex held back, after review (Claude, 15. 11. 2026): python art/world-pack-03/export-dopuna56-claude.py
- marko-uzjase attempt-3: Marko on foot is some 5.5 % shorter than marko-idle-2 (the rule asked 5 %) and the horse's hind legs
  move a little between frames. The mount lasts 0.55 s in the game and ends in mounted-idle: accepted.
Writes art/animation-pack-04/assets/<clip>/ in the shape of the other clips (atlas, frames, manifest, preview, qa)."""
import json, os
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PACK = os.path.join(ROOT, 'art', 'animation-pack-04')
JOBS = [('marko-uzjase', 'attempt-3', 'candidate-{}.png', False, True,
         'Marko mounts Sarac standing still: takes the saddle, springs, swings the right leg over and sits upright with the mace. '
         'Exported by Claude from Codex attempt 3 (Marko on foot ~5.5 % short of marko-idle-2).')]
base = json.load(open(os.path.join(PACK, 'assets', 'milos-idle', 'manifest.json'), encoding='utf-8-sig'))
for clip, attempt, pattern, loop, hold, desc in JOBS:
    src = os.path.join(PACK, 'sources', clip, attempt)
    frames = [Image.open(os.path.join(src, pattern.format(i))).convert('RGBA') for i in range(8) if os.path.exists(os.path.join(src, pattern.format(i)))]
    n = len(frames)
    out = os.path.join(PACK, 'assets', clip)
    os.makedirs(os.path.join(out, 'frames', 'motion'), exist_ok=True)
    atlas = Image.new('RGBA', (512 * n, 512), (0, 0, 0, 0))
    qa = []
    for i, f in enumerate(frames):
        assert f.size == (512, 512), f.size
        atlas.alpha_composite(f, (512 * i, 0))
        f.save(os.path.join(out, 'frames', 'motion', f'frame-{i}.png'))
        b = f.getchannel('A').point(lambda a: 255 if a > 40 else 0).getbbox()
        qa.append({'frame': i, 'bbox': list(b), 'touchesEdge': b[0] <= 0 or b[1] <= 0 or b[2] >= 512 or b[3] >= 512})
    atlas.save(os.path.join(out, 'atlas.png'))
    frames[0].save(os.path.join(out, 'preview.gif'), save_all=True, append_images=frames[1:], duration=100, loop=0, disposal=2)
    m = json.loads(json.dumps(base))
    m['characterId'] = clip
    m['animation']['columns'] = n
    m['animation']['rows']['motion'].update({'frames': n, 'durations_ms': [100] * n, 'loop': loop, 'holdLastFrame': hold})
    m['frame_layout'] = {'sheetWidth': 512 * n, 'sheetHeight': 512, 'cellWidth': 512, 'cellHeight': 512, 'rows': {'motion': [{'x': 512 * i, 'y': 0, 'w': 512, 'h': 512} for i in range(n)]}}
    m['holdLastFrame'] = hold
    m['description'] = desc
    json.dump(m, open(os.path.join(out, 'manifest.json'), 'w', encoding='utf-8'), indent=1, ensure_ascii=True)
    json.dump({'frames': qa, 'acceptedBy': 'Claude review 2026-11-15', 'source': f'sources/{clip}/{attempt}'}, open(os.path.join(out, 'qa.json'), 'w', encoding='utf-8'), indent=1)
    print(clip, n, 'frames', 'edge' if any(q['touchesEdge'] for q in qa) else 'ok')
