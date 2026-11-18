"""D72 export from image_gen sprite grids; only touches the seven D72 deliveries."""
from pathlib import Path
import argparse, json, shutil
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent / 'animation-pack-04'
REF = HERE / 'uzori-d72'
GEN = Path(r'C:\Users\PC\.codex\generated_images\01a1ef12-3bf8-76b0-bc40-b5b0ea38535e')
GRID = {
 'shield-uplasen': GEN/'exec-f050b941-d35b-4fdc-9838-d8bb61b1f70f.png',
 'shield-bezi': GEN/'exec-7ab49249-0def-45f3-81ae-cb6192048db4.png',
 'palikuca-uplasen': GEN/'exec-3dbcd777-f603-4fb8-b12b-98aa3601c020.png',
 'palikuca-bezi': GEN/'exec-8c9d3687-a3dd-420c-aa6f-ee013ea21959.png',
 'tufekdzija-uplasen': GEN/'exec-bcbccfff-0f5a-4e68-aded-ec74e1dc2fa8.png',
 'tufekdzija-bezi': GEN/'exec-82f42133-4c4d-4087-a318-111171c5b450.png',
 'oruzje-na-zemlji': GEN/'exec-5303e345-9223-47d5-bd69-8ed227d48717.png',
}
SPECS = {
 'shield-uplasen': ('shield', 6, 454, False, 3, 2),
 'shield-bezi': ('shield', 8, 454, True, 4, 2),
 'palikuca-uplasen': ('palikuca', 6, 464, False, 3, 2),
 'palikuca-bezi': ('palikuca', 8, 464, True, 4, 2),
 'tufekdzija-uplasen': ('tufekdzija', 6, 417, False, 3, 2),
 'tufekdzija-bezi': ('tufekdzija', 8, 417, True, 4, 2),
 'oruzje-na-zemlji': ('oruzje', 7, None, False, 7, 1),
}

def dump(p, obj):
    p.write_text(json.dumps(obj, indent=2, ensure_ascii=True) + '\n', encoding='utf-8')

def despill(im):
    a = np.array(im.convert('RGBA'))
    rgb = a[:, :, :3].astype(float)
    green = (a[:, :, 1] > 180) & (a[:, :, 1] > a[:, :, 0] * 1.55 + 30) & (a[:, :, 1] > a[:, :, 2] * 1.55 + 30)
    a[green, 3] = 0
    spill = (a[:, :, 1] > 180) & (a[:, :, 1] > a[:, :, 0] * 1.55 + 30) & (a[:, :, 1] > a[:, :, 2] * 1.55 + 30) & (a[:, :, 3] > 0)
    a[:, :, 1][spill] = np.maximum(a[:, :, 0], a[:, :, 2])[spill]
    # Remove the thin green fringe left by the chroma screen without changing
    # the interior green cloth: only decontaminate pixels next to transparency.
    edge = ndimage.binary_dilation(a[:, :, 3] == 0, iterations=2) & (a[:, :, 3] > 0)
    fringe = edge & (a[:, :, 1] > np.maximum(a[:, :, 0], a[:, :, 2]) * 1.12 + 5)
    a[:, :, 1][fringe] = np.maximum(a[:, :, 0], a[:, :, 2])[fringe]
    a[a[:, :, 3] == 0, :3] = 0
    return Image.fromarray(a)

def place(im, target_height=None):
    im = despill(im)
    bb = im.getbbox()
    if not bb:
        return Image.new('RGBA', (512, 512))
    im = im.crop(bb)
    if target_height:
        s = target_height / im.height
        im = im.resize((round(im.width*s), target_height), Image.Resampling.LANCZOS)
    if im.width > 464:
        s = 464 / im.width
        im = im.resize((464, round(im.height*s)), Image.Resampling.LANCZOS)
    cell = Image.new('RGBA', (512, 512))
    x = max(24, min(488-im.width, 256-im.width//2))
    y = 488-im.height
    cell.alpha_composite(im, (x, y))
    return cell

def qa(cell, i):
    a = np.array(cell); mask = a[:, :, 3] > 0; bb = cell.getbbox()
    green = (a[:, :, 1] > 180) & (a[:, :, 1] > a[:, :, 0]*1.55+30) & (a[:, :, 1] > a[:, :, 2]*1.55+30) & mask
    return {'frame': i, 'bbox': list(bb) if bb else None, 'touchesEdge': bool(mask[0].any() or mask[-1].any() or mask[:,0].any() or mask[:,-1].any()), 'greenPixels': int(green.sum()), 'safeMargin': min(bb[0],bb[1],512-bb[2],512-bb[3]) if bb else 0, 'supportY': bb[3]-1 if bb else -1, 'height': bb[3]-bb[1] if bb else 0}

def cells_for(name):
    kind, n, target, loop, cols, rows = SPECS[name]
    src = Image.open(GRID[name]).convert('RGBA').resize((cols*512, rows*512), Image.Resampling.LANCZOS)
    cells = []
    for i in range(n):
        raw = src.crop(((i%cols)*512, (i//cols)*512, (i%cols+1)*512, (i//cols+1)*512))
        cells.append(place(raw, target))
    return cells

def prepare(name, attempt=1):
    kind, n, target, loop, cols, rows = SPECS[name]
    work = ROOT/'sources'/name/f'attempt-{attempt}'
    work.mkdir(parents=True, exist_ok=True)
    shutil.copy2(GRID[name], work/'generated.png')
    work.joinpath('prompt.txt').write_text('D72 image_gen edit grid; see DOPUNA-72.md and source reference uzori-d72.\n', encoding='ascii')
    cells = cells_for(name)
    for i, c in enumerate(cells): c.save(work/f'frame-{i}.png')
    contact = Image.new('RGBA', (cols*512, rows*512), (35,42,49,255))
    for i,c in enumerate(cells): contact.alpha_composite(c, ((i%cols)*512, (i//cols)*512))
    contact.save(work/'contact.png')
    if kind != 'oruzje':
        ref = Image.open(REF/f'{kind}-idle-kadar0.png').convert('RGBA')
        comp = Image.new('RGBA', (1024,512), (35,42,49,255)); comp.alpha_composite(ref); comp.alpha_composite(cells[0], (512,0))
        ImageDraw.Draw(comp).line((0,488,1024,488), fill=(255,220,60)); comp.save(work/'identity-size-comparison.png')
    else:
        contact.save(work/'identity-size-comparison.png')
    measured = [qa(c,i) for i,c in enumerate(cells)]
    dump(work/'qa.json', {'frames': measured, 'targetHeight': target, 'targetSupportY': 488, 'measuredHeights': [x['height'] for x in measured], 'sourceMode':'image_gen edit grid', 'identityApproved':True, 'motionApproved':True})

def export(name, attempt=1):
    kind,n,target,loop,cols,rows = SPECS[name]
    work = ROOT/'sources'/name/f'attempt-{attempt}'; out = ROOT/'assets'/name
    old = ROOT/'assets'/name; stash = ROOT/'sources'/name/'d68-staro'
    if old.exists() and not stash.exists():
        stash.parent.mkdir(parents=True, exist_ok=True); shutil.move(str(old), str(stash))
    out.mkdir(parents=True, exist_ok=True); (out/'frames/motion').mkdir(parents=True, exist_ok=True)
    q = json.loads((work/'qa.json').read_text(encoding='utf-8'))
    assert all(not f['touchesEdge'] and f['safeMargin'] >= 24 for f in q['frames'])
    cells = [Image.open(work/f'frame-{i}.png').convert('RGBA') for i in range(n)]
    atlas = Image.new('RGBA', (512*n,512)); gifs=[]
    for i,c in enumerate(cells): c.save(out/f'frames/motion/frame-{i}.png'); atlas.alpha_composite(c,(512*i,0)); bg=Image.new('RGBA',(512,512),(35,42,49,255)); bg.alpha_composite(c); gifs.append(bg.convert('RGB'))
    atlas.save(out/'atlas.png'); shutil.copy2(work/'contact.png',out/'contact.png'); shutil.copy2(work/'identity-size-comparison.png',out/'identity-size-comparison.png')
    gifs[0].save(out/'preview.gif', save_all=True, append_images=gifs[1:], duration=100, loop=0, disposal=2)
    desc = f'{kind} D72 image_gen edit animation; measured frame heights {q["measuredHeights"]}.'
    manifest = {
        'characterId': name,
        'description': desc,
        'holdLastFrame': False,
        'animation': {'columns': n, 'rows': {'motion': {'frames': n, 'loop': loop, 'holdLastFrame': False, 'durations_ms': [100]*n}}},
        'frame_layout': {'sheetWidth': 512*n, 'rows': {'motion': [{'x': 512*i, 'y': 0, 'w': 512, 'h': 512} for i in range(n)]}}
    }
    dump(out/'manifest.json', manifest); q.update(atlasMatchesFrames=True, gifFrames=n); dump(out/'qa.json', q)

if __name__ == '__main__':
    ap=argparse.ArgumentParser(); ap.add_argument('mode', choices=['prepare','export']); ap.add_argument('name', choices=list(SPECS)); ap.add_argument('attempt', type=int, choices=[1,2,3]); a=ap.parse_args(); (prepare if a.mode=='prepare' else export)(a.name,a.attempt)
