from pathlib import Path
from PIL import Image, ImageDraw
import json

root = Path(__file__).resolve().parent
jobs = json.loads((root / 'plan-dopuna13.json').read_text(encoding='utf8'))['jobs']
board = Image.new('RGBA', (1536, 1500), (28, 37, 45, 255))
draw = ImageDraw.Draw(board)
catalog = []
for k, job in enumerate(jobs):
    out = root / 'assets' / job['id']
    manifest = json.loads((out / 'manifest.json').read_text(encoding='utf8'))
    atlas = Image.open(out / 'atlas.png').convert('RGBA')
    n = job['frames']
    assert atlas.size == (512 * n, 512), job['id']
    assert Image.open(out / 'preview.gif').n_frames == n, job['id']
    assert manifest['animation']['rows']['motion']['loop'] == job['loop']
    for i in range(n):
        frame = Image.open(out / f'frames/motion/frame-{i}.png').convert('RGBA')
        assert frame.size == (512, 512)
        assert frame.getchannel('A').getextrema() == (0, 255)
        assert frame.getchannel('A').getbbox()[3] == 488
        assert atlas.crop((i*512, 0, (i+1)*512, 512)).tobytes() == frame.tobytes()
        assert manifest['frame_layout']['rows']['motion'][i] == {'x': i*512, 'y': 0, 'w': 512, 'h': 512}
    x, y = (k % 2)*768, (k // 2)*300
    draw.text((x+12, y+8), job['id'], fill='white')
    middle = job.get('impactFrame')
    if middle is None:
        middle = n//2
    for col, i in enumerate([0, middle, n-1]):
        frame = Image.open(out / f'frames/motion/frame-{i}.png').convert('RGBA')
        frame.thumbnail((256, 256), Image.Resampling.LANCZOS)
        board.alpha_composite(frame, (x+col*256, y+28))
        draw.text((x+col*256+10, y+280), str(i+1), fill='white')
    catalog.append({'id': job['id'], 'frames': n, 'loop': job['loop'], 'fps': job['fps'],
                    'atlas': f"assets/{job['id']}/atlas.png", 'manifest': f"assets/{job['id']}/manifest.json",
                    'verified': True})

assert len(catalog) == 10 and sum(j['frames'] for j in catalog) == 74
board.convert('RGB').save(root / 'preview-dopuna13.png')
(root / 'catalog-dopuna13.json').write_text(json.dumps(catalog, indent=2), encoding='utf8')
(root / 'validation-dopuna13.json').write_text(json.dumps({'clips':10,'frames':74,'checks':['RGBA transparency','512x512 frames','baseline 488','atlas pixel equality','frame_layout','GIF frame count','loop flags'], 'results':catalog}, indent=2), encoding='utf8')
with (root.parent / 'world-pack-03/STATUS-ANIMACIJE.md').open('a', encoding='utf8') as f:
    f.write('\n## DOPUNA-13 — ZAVRSENO\n10 klipova / 74 kadra. Tri zavrsna udarca, vino u hodu i sest klipova rvanja (janicar, oklopnik, pas; petlja i izlaz). Svi imaju atlas.png, manifest.json sa frame_layout, pojedinacne RGBA kadrove 512x512, preview.gif i qa.json. Provereni alfa, oslonac y487, atlas/kadrovi, raspored, broj GIF kadrova i loop oznake. Pregled: art/animation-pack-04/preview-dopuna13.png; katalog i validacija: catalog-dopuna13.json, validation-dopuna13.json; promptovi: plan-dopuna13.json. Ugradjeni image_gen: 11 generisanja, samo janicar ponovljen zbog ocigledno pogresnog kostima; prvi izvori i izvozi sacuvani. Nema preostalih stavki iz DOPUNA-13.\n')
print('Verified: 10 clips / 74 frames. Preview and catalog saved.')
