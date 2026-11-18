"""Uzori za D93-D96 (Pod Varadinom, pesma „Marko Kraljević i Vuča dženeral"): letnji teren umesto zimskog prevoja,
Vuča dženeral na bedeviji, katane, Velimirovica, vojvode i knjigonoša."""
import os, shutil
from PIL import Image
R = r'D:\projects\Marko Kraljevic'
W = os.path.join(R, 'dist', 'assets', 'world')
A = os.path.join(R, 'art', 'animation-pack-04', 'assets')
D = os.path.join(R, 'art', 'world-pack-03')
SHOT = r'C:\Users\PC\AppData\Local\Temp\claude\eee582e4706d57f8\c5b64c3c-4cdb-4688-bbd7-bd7c93f9aba9\scratchpad\prevoj0.jpg'


def out(n):
    p = os.path.join(D, 'uzori-d%d' % n); os.makedirs(p, exist_ok=True); return p


def png(src, dst, blue=False):
    im = Image.open(src).convert('RGBA'); im.save(dst)
    if blue:
        bg = Image.new('RGBA', im.size, (70, 120, 200, 255)); bg.alpha_composite(im)
        bg.convert('RGB').save(dst[:-4] + '-na-plavom.jpg', quality=88)


def sheet(clip, dst):
    fr = os.path.join(A, clip, 'frames', 'motion')
    fs = sorted([f for f in os.listdir(fr) if f.endswith('.png')], key=lambda s: int(s.split('-')[1].split('.')[0]))
    ims = [Image.open(os.path.join(fr, f)).convert('RGBA') for f in fs]
    S = Image.new('RGBA', (512 * len(ims), 512), (0, 0, 0, 0))
    for i, im in enumerate(ims): S.alpha_composite(im, (512 * i, 0))
    S.save(dst)


# D93: teren
o = out(93)
for n in ['prevoj-sky', 'prevoj-far', 'prevoj-mid-rucno', 'prevoj-near-rucno', 'prevoj-vista']:
    png(os.path.join(W, n + '.webp'), os.path.join(o, 'sada-' + n + '.png'), blue=True)
for n in ['oranje-far', 'oranje-mid', 'oranje-near-b', 'selo-near', 'selo-mid', 'klisura-near']:
    f = os.path.join(W, n + '.webp')
    if os.path.exists(f): png(f, os.path.join(o, 'stil-leto-' + n + '.png'), blue=True)
for n in ['tlo-prevoj', 'tlo-prevoj-kraj', 'tlo-oranje', 'tlo-selo', 'tlo-klisura']:
    png(os.path.join(W, n + '.webp'), os.path.join(o, ('sada-' if 'prevoj' in n else 'stil-') + n + '.png'))
for n in ['prelaz-prevoj-1', 'prelaz-prevoj-2', 'prelaz-oranje-1', 'prelaz-oranje-2']:
    Image.open(os.path.join(W, n + '.webp')).convert('RGB').save(os.path.join(o, ('sada-' if 'prevoj' in n else 'stil-') + n + '.jpg'), quality=90)
an = Image.open(os.path.join(W, 'prelaz-oranje-anim.webp')).convert('RGB'); an.save(os.path.join(o, 'stil-prelaz-oranje-anim.jpg'), quality=88)
shutil.copy(SHOT, os.path.join(o, 'sada-u-igri-prevoj.jpg'))

# D94: Vuča dženeral (kit akindžijskog bega)
o = out(94)
Image.open(os.path.join(A, 'beg-idle', 'frames', 'motion', 'frame-0.png')).save(os.path.join(o, 'beg-idle-kadar0.png'))
Image.open(os.path.join(A, 'beg-mounted', 'frames', 'motion', 'frame-0.png')).save(os.path.join(o, 'beg-mounted-kadar0.png'))
for c in ['beg-idle', 'beg-mounted', 'beg-mounted-strike', 'beg-unhorsed', 'beg-hvata', 'beg-run', 'beg-attack', 'beg-hurt', 'beg-death']:
    sheet(c, os.path.join(o, 'pokret-' + c + '.png'))
Image.open(os.path.join(A, 'marko-idle-2', 'frames', 'motion', 'frame-0.png')).save(os.path.join(o, 'marko-kadar0-za-meru.png')) if os.path.exists(os.path.join(A, 'marko-idle-2')) else None

# D95: katana (husar), model sabljaša
o = out(95)
Image.open(os.path.join(A, 'zlatni-janicar-idle', 'frames', 'motion', 'frame-0.png')).save(os.path.join(o, 'sword-idle-kadar0.png'))
for c in ['zlatni-janicar-run', 'zlatni-janicar-attack', 'zlatni-janicar-lunge', 'zlatni-janicar-hurt', 'zlatni-janicar-death', 'zlatni-janicar-jump', 'zlatni-janicar-omamljen', 'zlatni-janicar-idle']:
    sheet(c, os.path.join(o, 'pokret-' + c.replace('zlatni-janicar', 'sword') + '.png'))

# D96: Velimirovica, Toplica, Kosančić, knjigonoša
o = out(96)
Image.open(os.path.join(A, 'milos-idle', 'frames', 'motion', 'frame-0.png')).save(os.path.join(o, 'milos-idle-kadar0.png'))
sheet('milos-idle', os.path.join(o, 'pokret-milos-idle.png'))
for c in ['putnica-idle', 'putnik-kaluder-idle', 'seljak-idle', 'sword-bezi']:
    if os.path.exists(os.path.join(A, c, 'frames', 'motion')):
        Image.open(os.path.join(A, c, 'frames', 'motion', 'frame-0.png')).save(os.path.join(o, c + '-kadar0.png'))
        sheet(c, os.path.join(o, 'pokret-' + c + '.png'))
print('ok')
