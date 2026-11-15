"""Exports the D58 attempt that Codex held back, after review (Claude, 15. 11. 2026): python art/world-pack-03/export-dopuna58-claude.py
- milos-pada-s-konja attempt-3: the fall is right (hand to the chest, slides from the saddle, lies on his back by the bay);
  Codex rejected it because, aligned by the lowest pixel, the horse stood 12-13 px higher in frames 4-5 (there the lowest
  pixel is Miloš lying in front of the hooves). Measured by the tip of the horse's ears (y 204 in frames 0-3, 192/191 in 4/5),
  frames 4 and 5 are moved down 12 and 13 px so the horse stands still; Miloš then lies a little below the line of the hooves,
  which is the ground in front of the horse. The game draws the clip on the line of frame 0 (see drawPesmaVila).
Writes art/animation-pack-04/assets/milos-pada-s-konja/ in the shape of the other clips (atlas, frames, manifest, preview, qa)."""
import json, os
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PACK = os.path.join(ROOT, 'art', 'animation-pack-04')
CLIP, SHIFT = 'milos-pada-s-konja', {4: 12, 5: 13}
src = os.path.join(PACK, 'sources', CLIP, 'attempt-3')
frames = []
for i in range(6):
    f = Image.open(os.path.join(src, f'frame-{i}.png')).convert('RGBA')
    if i in SHIFT:
        g = Image.new('RGBA', f.size, (0, 0, 0, 0))
        g.alpha_composite(f, (0, SHIFT[i]))
        f = g
    frames.append(f)
out = os.path.join(PACK, 'assets', CLIP)
os.makedirs(os.path.join(out, 'frames', 'motion'), exist_ok=True)
atlas = Image.new('RGBA', (512 * 6, 512), (0, 0, 0, 0))
qa = []
for i, f in enumerate(frames):
    atlas.alpha_composite(f, (512 * i, 0))
    f.save(os.path.join(out, 'frames', 'motion', f'frame-{i}.png'))
    b = f.getchannel('A').point(lambda a: 255 if a > 40 else 0).getbbox()
    qa.append({'frame': i, 'bbox': list(b), 'touchesEdge': b[0] <= 0 or b[1] <= 0 or b[2] >= 512 or b[3] >= 512})
atlas.save(os.path.join(out, 'atlas.png'))
frames[0].save(os.path.join(out, 'preview.gif'), save_all=True, append_images=frames[1:], duration=120, loop=0, disposal=2)
m = json.loads(json.dumps(json.load(open(os.path.join(PACK, 'assets', 'milos-jase', 'manifest.json'), encoding='utf-8-sig'))))
m['characterId'] = CLIP
m['animation']['columns'] = 6
m['animation']['rows']['motion'].update({'frames': 6, 'durations_ms': [120] * 6, 'loop': False, 'holdLastFrame': True})
m['frame_layout'] = {'sheetWidth': 512 * 6, 'sheetHeight': 512, 'cellWidth': 512, 'cellHeight': 512,
                     'rows': {'motion': [{'x': 512 * i, 'y': 0, 'w': 512, 'h': 512} for i in range(6)]}}
m['holdLastFrame'] = True
m['description'] = ('Milos on his bay clutches his chest, slides from the saddle and lies on his back by the horse, which stands still. '
                    'No arrow, no blood. Exported by Claude from Codex attempt 3 (frames 4-5 moved down 12/13 px to the horse).')
json.dump(m, open(os.path.join(out, 'manifest.json'), 'w', encoding='utf-8'), indent=1, ensure_ascii=True)
json.dump({'frames': qa, 'acceptedBy': 'Claude review 2026-11-15', 'source': f'sources/{CLIP}/attempt-3', 'shift': SHIFT},
          open(os.path.join(out, 'qa.json'), 'w', encoding='utf-8'), indent=1)
print(CLIP, 6, 'frames', 'edge' if any(q['touchesEdge'] for q in qa) else 'ok')
