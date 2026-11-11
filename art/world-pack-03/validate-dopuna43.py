from pathlib import Path
from PIL import Image
import json,hashlib
w=Path(__file__).resolve().parent;assets=w.parent/'animation-pack-04/assets'
names=[('utva-let',6,True),('soko-vezirov-let',8,True),('kostac-stoji',8,True),('kostac-stoji-kraj',6,False)]
items=[];html=['<!doctype html><meta charset="utf-8"><title>Ptice i koštac</title><style>body{background:#202630;color:#eee;font:18px system-ui;margin:32px}section{margin:32px 0}img{max-width:100%}a{color:#ecc491}.gif{background:#303d49}</style><h1>DOPUNA-43 — ptice i stojeći koštac</h1>']
for name,count,loop in names:
 folder=assets/name;a=Image.open(folder/'atlas.png').convert('RGBA');assert a.size==(count*512,512)
 m=json.loads((folder/'manifest.json').read_text());assert m['animation']['rows']['motion']['frames']==count;assert m['animation']['rows']['motion']['loop']==loop
 fs=[]
 for i in range(count):
  f=Image.open(folder/f'frames/motion/frame-{i}.png').convert('RGBA');assert f.size==(512,512);assert f.getchannel('A').getextrema()==(0,255)
  assert a.crop((i*512,0,(i+1)*512,512)).tobytes()==f.tobytes();assert m['frame_layout']['rows']['motion'][i]=={'x':i*512,'y':0,'w':512,'h':512};fs.append(f)
  if name.startswith('kostac'):assert f.getchannel('A').getbbox()[3]==488
 if name.startswith(('utva','soko')):assert m['noFootAlignment'] and m['worldWingspan']==345 and m['renderAnchor']=={'x':256,'y':300}
 if not loop:
  durations=[100]*5+[700];m['animation']['rows']['motion']['durations_ms']=durations;m['holdLastFrame']=True
  (folder/'manifest.json').write_text(json.dumps(m,indent=2),encoding='utf8')
  fm=folder/'frames/frames-manifest.json';d=json.loads(fm.read_text());d['states']['motion'].update(durations_ms=durations,holdLastFrame=True);fm.write_text(json.dumps(d,indent=2),encoding='utf8')
  fs[0].save(folder/'preview.gif',save_all=True,append_images=fs[1:],duration=durations,disposal=2,optimize=False)
  assert 'loop' not in Image.open(folder/'preview.gif').info
 assert Image.open(folder/'preview.gif').n_frames==count
 assert len({hashlib.sha256(f.tobytes()).hexdigest() for f in fs})==count
 items.append({'name':name,'frames':count,'cell':[512,512],'loop':loop,'atlasMatchesFrames':True,'renderScale':m['renderScale'],'renderAnchor':m['renderAnchor']})
 url='../animation-pack-04/assets/'+name
 html.append(f'<section><h2>{name} — {count} kadrova, '+('petlja' if loop else 'jednom')+f'</h2><a href="{url}/atlas.png">Atlas</a> · <a href="{url}/manifest.json">Manifest</a><p><img class="gif" src="{url}/preview.gif"></p><details><summary>Kadrovi i referenca</summary><img src="{url}/preview-comparison.png"></details></section>')
(w/'validation-dopuna43.json').write_text(json.dumps(items,indent=2),encoding='utf8')
(w/'preview-dopuna43.html').write_text(''.join(html),encoding='utf8')
with (w/'STATUS-ANIMACIJE.md').open('a',encoding='utf8') as f:f.write('\nDOPUNA-43 ptice/kostac ZAVRSENO4/4: utva-let6petlja, soko-vezirov-let8petlja, kostac-stoji8petlja, kostac-stoji-kraj6jednom. Provereno28RGBAkadrov a512x512, atlas=frames/frame_layout/GIF. Ptice: worldWingspan345 kao soko-let, telo-anchor256/300, bez poravnanja stopala; primeniti renderScale iz manifesta. Kostac:y487; kraj holdLastFrame=true i GIFjednom. Pregled preview-dopuna43.html, promptovi prompts-dopuna43.json, izvori animation-pack-04/sources/<klip>/. Ugradjeni image_gen; kod/dist nisu menjani.\n')
print('PASS4 clips /28frames; atlas, alpha, frame_layout, bird scale and one-shot GIF verified')
