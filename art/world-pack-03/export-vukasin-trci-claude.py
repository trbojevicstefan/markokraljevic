"""vukasin-trci from Codex D50 attempt 3 (Claude, night of 14/15 Nov): of its eight frames the first four are a sound half
stride (contact, passing, push-off, flight) and the second four repeat the same leading leg, so the clip is those four, looped.
At the zoom it is shown (the king ~150 px tall, chasing round the church) the missing change of legs is hardly seen.
python art/world-pack-03/export-vukasin-trci-claude.py"""
import json, os
from PIL import Image
here = os.path.dirname(os.path.abspath(__file__))
root = os.path.dirname(os.path.dirname(here))
src = os.path.join(root, 'art', 'animation-pack-04', 'sources', 'vukasin-trci', 'attempt-3')
out = os.path.join(root, 'art', 'animation-pack-04', 'assets', 'vukasin-trci')
os.makedirs(out, exist_ok=True)
frames = [Image.open(os.path.join(src, f'frame-{i}.png')).convert('RGBA') for i in range(4)]
assert all(f.size == (512, 512) for f in frames)
atlas = Image.new('RGBA', (512 * len(frames), 512), (0, 0, 0, 0))
for i, f in enumerate(frames):
    atlas.paste(f, (512 * i, 0))
atlas.save(os.path.join(out, 'atlas.png'))
cells = [{'x': 512 * i, 'y': 0, 'w': 512, 'h': 512} for i in range(len(frames))]
manifest = {
    'characterId': 'vukasin-trci', 'engine': 'component-row', 'game_input': 'atlas.png', 'frame_variant': 'painted',
    'sprite_sheet_alpha': 'atlas.png', 'base_image': 'reference.png', 'chroma_key': None,
    'cell': {'shape': 'square', 'width': 512, 'height': 512, 'safe_margin_x': 24, 'safe_margin_y': 24, 'size': 512, 'safe_margin': 24},
    'animation': {'cellWidth': 512, 'cellHeight': 512, 'columns': len(frames),
                  'rows': {'motion': {'row': 0, 'frames': len(frames), 'fps': 12, 'durations_ms': [83] * len(frames), 'loop': True, 'frame_variant': 'painted'}}},
    'frame_layout': {'sheetWidth': 512 * len(frames), 'sheetHeight': 512, 'cellWidth': 512, 'cellHeight': 512, 'rows': {'motion': cells}},
    'assetType': 'character-animation', 'renderAnchor': {'x': 256, 'y': 488}, 'noFootAlignment': False, 'holdLastFrame': False,
    'description': 'King Vukašin running right, golden khanjar raised; four frames of D50 attempt 3 (one half stride), looped. Cut by Claude.',
}
json.dump(manifest, open(os.path.join(out, 'manifest.json'), 'w', encoding='utf-8'), indent=2, ensure_ascii=False)
print('ok', atlas.size)
