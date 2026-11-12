# Sketches (img2img drafts) for the greybox's missing props, and the job file for the local Z-Image worker.
# Run from the repository root: python art/greybox/sketches.py
from PIL import Image, ImageDraw
from pathlib import Path
import json

M = (255, 0, 255)
OUT = Path('art/greybox/draft')
OUT.mkdir(parents=True, exist_ok=True)


def save(im, name):
    p = OUT / f'{name}.png'
    im.save(p)
    return p.resolve().as_posix()


# 1) the altar of a power: a carved limestone block with a round rune disc on its face
im = Image.new('RGB', (512, 384), M); d = ImageDraw.Draw(im)
d.rectangle([66, 300, 446, 360], fill=(150, 140, 120)); d.rectangle([96, 140, 416, 300], fill=(178, 168, 146)); d.rectangle([76, 110, 436, 145], fill=(165, 156, 134))
d.ellipse([206, 170, 306, 270], fill=(120, 150, 165), outline=(70, 90, 100), width=6); d.ellipse([236, 200, 276, 240], fill=(170, 215, 230))
for x in (110, 400):
    d.line([x, 150, x, 295], fill=(140, 130, 110), width=4)
oltar = save(im, 'gb-oltar')

# 2) the lever: an iron arm with a wooden grip on a squat stone base
im = Image.new('RGB', (384, 512), M); d = ImageDraw.Draw(im)
d.rectangle([92, 380, 292, 470], fill=(150, 142, 125)); d.rectangle([112, 350, 272, 385], fill=(135, 128, 112))
d.line([192, 365, 300, 120], fill=(60, 58, 60), width=26); d.ellipse([170, 340, 214, 384], fill=(80, 78, 80))
d.line([288, 148, 318, 82], fill=(120, 80, 45), width=34)
poluga = save(im, 'gb-poluga')

# 3) the switch: a low stone pressure plate in a frame, a carved rune on its front
im = Image.new('RGB', (512, 256), M); d = ImageDraw.Draw(im)
d.rectangle([36, 170, 476, 220], fill=(130, 124, 110)); d.rectangle([66, 120, 446, 175], fill=(176, 168, 150))
d.ellipse([226, 128, 286, 170], outline=(90, 120, 130), width=6); d.line([256, 132, 256, 166], fill=(90, 120, 130), width=4)
prekidac = save(im, 'gb-prekidac')


def prompt(what):
    return (f'A single {what}, seen exactly from the side (orthographic side view, no perspective), whole object visible and centered, '
            'standing upright. A realistic game prop, photorealistic, ultra detailed real materials, soft even lighting. Isolated on a flat, '
            'solid, pure magenta (#FF00FF) background, no ground, no cast shadow, no other objects, no people, no text.')


jobs = [
    {'name': 'gb-oltar', 'draft': oltar, 'w': 768, 'h': 576, 'strength': 0.78, 'steps': 10, 'seeds': [1, 2],
     'prompt': prompt('small medieval Balkan altar block carved from pale limestone, a round carved rune disc with a faint blue glow on its '
                      'front face, worn edges, a little moss in the cracks')},
    {'name': 'gb-poluga', 'draft': poluga, 'w': 576, 'h': 768, 'strength': 0.78, 'steps': 10, 'seeds': [1, 2],
     'prompt': prompt('medieval wrought iron lever on a squat carved stone base, the iron arm tilted to the right with a worn wooden handle at its end')},
    {'name': 'gb-prekidac', 'draft': prekidac, 'w': 768, 'h': 384, 'strength': 0.78, 'steps': 10, 'seeds': [1, 2],
     'prompt': prompt('low flat stone pressure plate set in a worn limestone frame, a carved rune circle on its front edge')},
]
Path('art/greybox/jobs.json').write_text(json.dumps(jobs, indent=1, ensure_ascii=False), encoding='utf-8')
print('\n'.join(j['draft'] for j in jobs))
