from pathlib import Path
from PIL import Image,ImageChops,ImageStat
import json
ROOT=Path(__file__).resolve().parents[2]
PACK=ROOT/'art/world-pack-03'
THEMES=['tvrdjava', 'prevoj', 'pecina', 'podrum', 'mocvara']
items=[];html=['<!doctype html><meta charset="utf-8"><title>DOPUNA36 B</title><style>body{background:#20252c;color:#ede1c7;font:18px system-ui;margin:30px}section{display:grid;grid-template-columns:1fr 1fr 1.5fr;gap:18px;margin:20px 0 48px}img{width:100%;border-radius:8px}a{color:#e9be6b}small{display:block}</style><h1>Scene između pohoda — deo B</h1>']
for t in THEMES:
    html.append(f'<h2>{t}</h2><section>')
    for n in [1,2]:
        name=f'prelaz-{t}-{n}';path=PACK/f'{name}.png';im=Image.open(path)
        assert im.size==(1024,1024)
        items.append({'file':str(path.relative_to(ROOT)),'size':im.size,'kind':'miniature'})
        html.append(f'<div><a href="{name}.png"><img src="{name}.png"></a><small>{name}</small></div>')
    name=f'prelaz-{t}-anim';path=PACK/f'{name}.png';im=Image.open(path)
    assert im.size==(9216,512)
    folder=ROOT/'art/animation-pack-04/assets'/name
    manifest=json.loads((folder/'manifest.json').read_text(encoding='utf-8'))
    gif=Image.open(folder/'preview.gif');assert gif.n_frames==12
    frames=[Image.open(folder/f'frames/motion/frame-{i}.png').convert('RGB') for i in range(12)]
    means=[sum(ImageStat.Stat(ImageChops.difference(frames[i],frames[(i+1)%12])).mean)/3 for i in range(12)]
    items.append({'file':str(path.relative_to(ROOT)),'size':im.size,'kind':'animated-scene','frames':12,'cell':[768,512],'fps':8,'adjacent_frame_mean_rgb_difference':means,'seam_difference':means[-1],'manifest':str((folder/'manifest.json').relative_to(ROOT))})
    link=f'../animation-pack-04/assets/{name}/preview.gif'
    html.append(f'<div><a href="{link}"><img src="{link}"></a><small>{name} —12×768×512</small><a href="{name}.png">Traka</a></div></section>')
(PACK/'preview-dopuna36-b.html').write_text(''.join(html),encoding='utf-8')
(PACK/'validation-dopuna36-b.json').write_text(json.dumps(items,indent=2),encoding='utf-8')
(PACK/'catalog-dopuna36-b.json').write_text(json.dumps({'scope':'DOPUNA36 B only','tool':'built-in image_gen','items':items,'prompts':'prompts-dopuna36-b.json'},indent=2),encoding='utf-8')
print(json.dumps({'miniatures':10,'animations':5,'frames':60,'gallery':'preview-dopuna36-b.html'}))
