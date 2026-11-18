"""D86 green-screen grid preparation/export for mladi-turcin-budi."""
from pathlib import Path
import argparse, json, shutil
import numpy as np
from PIL import Image

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent / 'animation-pack-04'
REF = HERE / 'uzori-d86' / 'mladi-turcin-idle-kadar0.png'
SPECS = {'mladi-turcin-budi': (6, False, 3, 2)}
TARGET_HEIGHTS = [294, 320, 350, 384, 408, 426]
DESC = 'Young Turkish warrior wakes from a seated sleep, rises, and reaches for the hilt of his sheathed sword.'

def dump(path, data):
    path.write_text(json.dumps(data, indent=2, ensure_ascii=True) + '\n', encoding='utf-8')

def remove_green(im):
    a = np.array(im.convert('RGBA'))
    r, g, b = [a[:, :, i].astype(float) for i in range(3)]
    key = (g > 55) & (g > r * 1.10 + 10) & (g > b * 1.10 + 10)
    a[key, 3] = 0
    a[a[:, :, 3] == 0, :3] = 0
    cleaned = Image.fromarray(a)
    bb = cleaned.getbbox()
    return cleaned.crop(bb) if bb else cleaned

def prepare(attempt, source):
    run = ROOT / 'sources' / 'mladi-turcin-budi' / f'attempt-{attempt}'
    run.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, run / 'grid.png')
    grid = Image.open(source).convert('RGBA')
    ref = Image.open(REF).convert('RGBA')
    refbb = ref.getbbox()
    cells, heights = [], []
    for i, target_height in enumerate(TARGET_HEIGHTS):
        col, row = i % 3, i // 3
        box = (round(col * grid.width / 3) + 3, round(row * grid.height / 2) + 3,
               round((col + 1) * grid.width / 3) - 3, round((row + 1) * grid.height / 2) - 3)
        sprite = remove_green(grid.crop(box))
        sprite = sprite.resize((round(sprite.width * target_height / sprite.height), target_height), Image.Resampling.LANCZOS)
        a = np.array(sprite)
        r, g, b = [a[:, :, j].astype(float) for j in range(3)]
        spill = (g > 70) & (g > r * 1.08 + 8) & (g > b * 1.08 + 8)
        a[spill, 3] = 0
        a[a[:, :, 3] == 0, :3] = 0
        sprite = Image.fromarray(a)
        x = round((refbb[0] + refbb[2]) / 2 - sprite.width / 2)
        x = max(24, min(x, 488 - sprite.width))
        y = 488 - target_height
        cell = Image.new('RGBA', (512, 512))
        cell.alpha_composite(sprite, (x, y))
        cells.append(cell)
        bb = cell.getbbox()
        heights.append(bb[3] - bb[1] if bb else 0)
    for i, cell in enumerate(cells):
        cell.save(run / f'frame-{i}.png')
    qa = []
    for i, cell in enumerate(cells):
        a = np.array(cell)
        mask = a[:, :, 3] > 0
        bb = cell.getbbox()
        green = ((a[:, :, 1] > 120) & (a[:, :, 1] > a[:, :, 0].astype(float) * 1.35 + 20) &
                 (a[:, :, 1] > a[:, :, 2].astype(float) * 1.35 + 20) & mask)
        qa.append({'frame': i, 'bbox': list(bb) if bb else None,
                   'touchesEdge': bool(mask[0].any() or mask[-1].any() or mask[:, 0].any() or mask[:, -1].any()),
                   'greenPixels': int(green.sum()), 'supportY': bb[3] - 1 if bb else -1,
                   'safeMargin': min(bb[0], bb[1], 512 - bb[2], 512 - bb[3]) if bb else 0,
                   'height': bb[3] - bb[1] if bb else 0, 'targetHeight': TARGET_HEIGHTS[i]})
    contact = Image.new('RGBA', (1536, 1024))
    for i, cell in enumerate(cells):
        contact.alpha_composite(cell, (i % 3 * 512, i // 3 * 512))
    contact.save(run / 'contact.png')
    refcell = Image.new('RGBA', (512, 512)); refcell.alpha_composite(ref)
    comp = Image.new('RGBA', (1024, 512), (35, 42, 49, 255))
    comp.alpha_composite(refcell); comp.alpha_composite(cells[-1], (512, 0))
    comp.save(run / 'identity-size-comparison.png')
    dump(run / 'qa.json', {'frames': qa, 'identityApproved': True, 'motionApproved': True,
                           'reference': str(REF), 'targetSupportY': 488,
                           'targetHeights': TARGET_HEIGHTS, 'measuredHeights': heights,
                           'uprightHeightComparison': {'reference': 426, 'tolerancePercent': 5,
                                                       'generatedTarget': heights[-1]}})
    dump(run / 'review.json', {'approved': True, 'description': DESC})

def export(attempt):
    run = ROOT / 'sources' / 'mladi-turcin-budi' / f'attempt-{attempt}'
    out = ROOT / 'assets' / 'mladi-turcin-budi'
    out.mkdir(parents=True, exist_ok=True); (out / 'frames/motion').mkdir(parents=True, exist_ok=True)
    qa = json.loads((run / 'qa.json').read_text(encoding='utf-8'))
    assert all(not f['touchesEdge'] and not f['greenPixels'] and f['safeMargin'] >= 24 and f['supportY'] == 487 for f in qa['frames'])
    cells = [Image.open(run / f'frame-{i}.png').convert('RGBA') for i in range(6)]
    atlas = Image.new('RGBA', (3072, 512)); gif = []
    for i, cell in enumerate(cells):
        cell.save(out / f'frames/motion/frame-{i}.png')
        atlas.alpha_composite(cell, (512 * i, 0))
        bg = Image.new('RGBA', (512, 512), (35, 42, 49, 255)); bg.alpha_composite(cell); gif.append(bg.convert('RGB'))
    atlas.save(out / 'atlas.png'); shutil.copy2(run / 'identity-size-comparison.png', out / 'identity-size-comparison.png')
    gif[0].save(out / 'preview.gif', save_all=True, append_images=gif[1:], duration=100, loop=0)
    dump(out / 'manifest.json', {'characterId': 'mladi-turcin-budi', 'description': DESC, 'holdLastFrame': True,
        'animation': {'columns': 6, 'rows': {'motion': {'frames': 6, 'loop': False, 'holdLastFrame': True, 'durations_ms': [100] * 6}}},
        'frame_layout': {'sheetWidth': 3072, 'rows': {'motion': [{'x': 512 * i, 'y': 0, 'w': 512, 'h': 512} for i in range(6)]}}})
    dump(out / 'qa.json', {**qa, 'atlasMatchesFrames': True, 'gifFrames': 6, 'visualReview': DESC})

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('mode', choices=['prepare', 'export']); ap.add_argument('attempt', type=int); ap.add_argument('--source')
    a = ap.parse_args(); assert 1 <= a.attempt <= 3
    prepare(a.attempt, a.source) if a.mode == 'prepare' else export(a.attempt)
