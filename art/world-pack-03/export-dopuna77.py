"""D77 sprite-sheet preparation/export; only touches D77 sources and assets."""
from pathlib import Path
import argparse, json, shutil
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[1] / 'animation-pack-04'
REF = Path(__file__).resolve().parent / 'uzori-d77' / 'vila-let-kadar0.png'
SPECS = {
    'vila-pogodjena': (4, False, 2, 2, 377),
    'vila-udarena': (4, False, 2, 2, 377),
    'vila-moli': (6, True, 3, 2, 377),
    'vila-ustaje': (6, False, 3, 2, 377),
    'vila-peva': (6, True, 3, 2, 377),
}

def dump(path, data):
    path.write_text(json.dumps(data, indent=2, ensure_ascii=True) + '\n', encoding='utf-8')

def cut_green(im):
    a = np.array(im.convert('RGBA'))
    r, g, b = [a[:, :, i].astype(float) for i in range(3)]
    key = (g > 35) & (g > r * 1.22 + 12) & (g > b * 1.22 + 12)
    a[key, 3] = 0
    edge = ndimage.binary_dilation(key, iterations=2) & ~key
    a[:, :, 1][edge] = np.maximum(a[:, :, 0], a[:, :, 2])[edge]
    labels, count = ndimage.label(a[:, :, 3] > 0)
    areas = np.bincount(labels.ravel())
    tiny = np.flatnonzero(areas < 8); tiny = tiny[tiny != 0]
    a[np.isin(labels, tiny), 3] = 0
    a[a[:, :, 3] == 0, :3] = 0
    q = Image.fromarray(a)
    return q.crop(q.getbbox())

def prepare(name, attempt, source):
    n, loop, cols, rows, target = SPECS[name]
    run = ROOT / 'sources' / name / f'attempt-{attempt}'
    run.mkdir(parents=True, exist_ok=True)
    if source.resolve() != (run / 'grid.png').resolve():
        shutil.copy2(source, run / 'grid.png')
    grid = Image.open(source).convert('RGBA')
    pieces = []
    for i in range(n):
        x0 = round(i % cols * grid.width / cols) + 2
        y0 = round(i // cols * grid.height / rows) + 2
        x1 = round((i % cols + 1) * grid.width / cols) - 2
        y1 = round((i // cols + 1) * grid.height / rows) - 2
        pieces.append(cut_green(grid.crop((x0, y0, x1, y1))))
    ref = Image.open(REF).convert('RGBA'); rb = ref.getbbox()
    scale = target / max(p.height for p in pieces)
    cells, heights = [], []
    for i, p in enumerate(pieces):
        p = p.resize((round(p.width * scale), round(p.height * scale)), Image.Resampling.LANCZOS)
        a = np.array(p); a[a[:, :, 3] < 8] = 0
        spill = (a[:, :, 1] > 100) & (a[:, :, 1] > a[:, :, 0].astype(float) * 1.25 + 10) & (a[:, :, 1] > a[:, :, 2].astype(float) * 1.25 + 10)
        a[:, :, 1][spill] = np.maximum(a[:, :, 0], a[:, :, 2])[spill]
        p = Image.fromarray(a); bb = p.getbbox(); heights.append(bb[3] - bb[1] if bb else 0)
        cell = Image.new('RGBA', (512, 512))
        x = max(24, min(round((rb[0] + rb[2]) / 2 - p.width / 2), 488 - p.width))
        flight = (name in ('vila-pogodjena', 'vila-peva')) or (name == 'vila-ustaje' and i >= 4)
        y = (437 if flight else 488) - p.height
        cell.alpha_composite(p, (x, y)); cell.save(run / f'frame-{i}.png'); cells.append(cell)
    board = Image.new('RGBA', (1024, 512), (35, 42, 49, 255)); board.alpha_composite(ref); board.alpha_composite(cells[0], (512, 0)); ImageDraw.Draw(board).line((0, 488, 1024, 488), fill=(255, 220, 60)); board.save(run / 'identity-size-comparison.png')
    contact = Image.new('RGBA', (cols * 512, rows * 512), (35, 42, 49, 255))
    for i, c in enumerate(cells): contact.alpha_composite(c, (i % cols * 512, i // cols * 512))
    contact.save(run / 'contact.png')
    qa = []
    for i, c in enumerate(cells):
        a = np.array(c); mask = a[:, :, 3] > 0; bb = c.getbbox(); labels, count = ndimage.label(a[:, :, 3] > 32)
        green = (a[:, :, 1] > 100) & (a[:, :, 1] > a[:, :, 0].astype(float) * 1.25 + 10) & (a[:, :, 1] > a[:, :, 2].astype(float) * 1.25 + 10) & mask
        qa.append({'frame': i, 'bbox': list(bb) if bb else None, 'touchesEdge': bool(mask[0].any() or mask[-1].any() or mask[:, 0].any() or mask[:, -1].any()), 'components': int(count), 'greenPixels': int(green.sum()), 'supportY': bb[3] - 1 if bb else -1, 'safeMargin': min(bb[0], bb[1], 512 - bb[2], 512 - bb[3]) if bb else 0, 'height': bb[3] - bb[1] if bb else 0})
    dump(run / 'qa.json', {'frames': qa, 'scale': scale, 'identityApproved': False, 'motionApproved': False, 'reference': str(REF), 'targetSupportY': 488, 'referenceHeight': 377, 'targetHeight': target, 'measuredHeights': heights})

def export(name, attempt, description):
    n, loop, cols, rows, target = SPECS[name]; run = ROOT / 'sources' / name / f'attempt-{attempt}'; out = ROOT / 'assets' / name
    review = json.loads((run / 'review.json').read_text(encoding='utf-8')); assert review['approved']
    qa = json.loads((run / 'qa.json').read_text(encoding='utf-8')); assert all(not f['touchesEdge'] and not f['greenPixels'] and f['safeMargin'] >= 24 for f in qa['frames'])
    out.mkdir(parents=True, exist_ok=True); (out / 'frames/motion').mkdir(parents=True, exist_ok=True)
    cells = [Image.open(run / f'frame-{i}.png').convert('RGBA') for i in range(n)]; atlas = Image.new('RGBA', (n * 512, 512)); gif = []
    for i, p in enumerate(cells): p.save(out / 'frames/motion' / f'frame-{i}.png'); atlas.alpha_composite(p, (i * 512, 0)); bg = Image.new('RGBA', (512, 512), (35, 42, 49, 255)); bg.alpha_composite(p); gif.append(bg.convert('RGB'))
    atlas.save(out / 'atlas.png'); shutil.copy2(run / 'identity-size-comparison.png', out / 'identity-size-comparison.png'); shutil.copy2(run / 'contact.png', out / 'contact.png')
    gif[0].save(out / 'preview.gif', save_all=True, append_images=gif[1:], duration=100, disposal=2, loop=0)
    dump(out / 'manifest.json', {'characterId': name, 'description': description, 'holdLastFrame': False, 'animation': {'columns': n, 'rows': {'motion': {'frames': n, 'loop': loop, 'holdLastFrame': False, 'durations_ms': [100] * n}}}, 'frame_layout': {'sheetWidth': 512 * n, 'rows': {'motion': [{'x': 512 * i, 'y': 0, 'w': 512, 'h': 512} for i in range(n)]}}})
    qa.update(identityApproved=True, motionApproved=True, visualReview=description, atlasMatchesFrames=True, gifFrames=n); dump(out / 'qa.json', qa)

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('mode', choices=['prepare', 'export']); ap.add_argument('name', choices=list(SPECS)); ap.add_argument('attempt', type=int); ap.add_argument('--source'); ap.add_argument('--description', default='D77 approved motion')
    a = ap.parse_args(); assert 1 <= a.attempt <= 3
    prepare(a.name, a.attempt, Path(a.source)) if a.mode == 'prepare' else export(a.name, a.attempt, a.description)
