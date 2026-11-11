from pathlib import Path
from PIL import Image,ImageDraw
import json,hashlib
w=Path(__file__).resolve().parent;assets=w.parent/'animation-pack-04/assets'
jobs=json.loads((w/'prompts-dopuna43-ljudi.json').read_text(encoding='utf8'))['jobs'];assert len(jobs)==6
items=[];html=['<!doctype html><meta charset="utf-8"><title>Ljudi iz pesama</title><style>body{background:#202630;color:#eee;font:18px system-ui;margin:32px}section{margin:32px 0}img{max-width:100%}a{color:#ecc491}.gif{background:#303d49}</style><h1>DOPUNA-43 — ljudi iz pesama</h1>']
board=Image.new('RGB',(1536,1088),(29,38,46));draw=ImageDraw.Draw(board)
for n,j in enumerate(jobs):
 name=j['id'];folder=assets/name;count=j['frames'];m=json.loads((folder/'manifest.json').read_text());a=Image.open(folder/'atlas.png').convert('RGBA');assert a.size==(count*512,512)
 assert m['animation']['rows']['motion']['frames']==count and m['animation']['rows']['motion']['loop']
 assert m['worldBodyHeight']==j['targetHeight']
 fs=[]
 for i in range(count):
  f=Image.open(folder/f'frames/motion/frame-{i}.png').convert('RGBA');assert f.size==(512,512);assert f.getchannel('A').getextrema()==(0,255);assert f.getchannel('A').getbbox()[3]==488
  assert a.crop((512*i,0,512*(i+1),512)).tobytes()==f.tobytes();assert m['frame_layout']['rows']['motion'][i]=={'x':i*512,'y':0,'w':512,'h':512};fs.append(f)
 assert len({hashlib.sha256(f.tobytes()).hexdigest() for f in fs})==count
 assert Image.open(folder/'preview.gif').n_frames==count
 items.append({'name':name,'frames':count,'cell':[512,512],'loop':True,'atlasMatchesFrames':True,'groundY':487,'worldBodyHeight':m['worldBodyHeight'],'renderScale':m['renderScale'],'renderAnchor':m['renderAnchor']})
 x=n%3*512;y=n//3*544;board.paste(fs[2] if name=='novak-kuje' else fs[0],(x,y+28),fs[2] if name=='novak-kuje' else fs[0]);draw.text((x+12,y+8),name,fill='white')
 url='../animation-pack-04/assets/'+name;html.append(f'<section><h2>{name} — {count} kadrova, petlja</h2><a href="{url}/atlas.png">Atlas</a> · <a href="{url}/manifest.json">Manifest</a><p><img class="gif" src="{url}/preview.gif"></p><details><summary>Svi kadrovi i referenca</summary><img src="{url}/preview-comparison.png"></details></section>')
board.save(w/'preview-dopuna43-ljudi.jpg',quality=94)
(w/'validation-dopuna43-ljudi.json').write_text(json.dumps(items,indent=2),encoding='utf8')
(w/'preview-dopuna43-ljudi.html').write_text(''.join(html),encoding='utf8')
with (w/'STATUS-ANIMACIJE.md').open('a',encoding='utf8') as f:f.write('\nDOPUNA-43 ljudi ZAVRSENO6/6: janja-idle6, janja-toci6, marko-okovan8, novak-idle6, novak-kuje8, trgovac-tezga-idle6 — ukupno40RGBAkadova512x512, svepetlje. Provereni alpha/y487/atlas=frames/frame_layout/GIF. Marko383px; novi ljudi i trgovac426px; primeniti renderScale/renderAnchor iz manifesta. Kovanje: impactFrames[2,6] (kadrovi3i7). Pregled preview-dopuna43-ljudi.html; validation-dopuna43-ljudi.json; tacni promptovi prompts-dopuna43-ljudi.json. Ugradjeni image_gen, izvori animation-pack-04/sources/<klip>/. Kod i dist nisu menjani.\n')
print('PASS6 clips /40frames; alpha, y487, scale, atlas, frame_layout and GIF counts verified')
