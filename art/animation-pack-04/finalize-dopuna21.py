from pathlib import Path
from PIL import Image,ImageDraw
import json
root=Path(__file__).resolve().parent;world=root.parent/'world-pack-03';mini=world/'rukopis/minijature'
mini_jobs=json.loads((mini/'prompts-dopuna21.json').read_text(encoding='utf-8-sig'))['jobs']
jobs=json.loads((root/'plan-dopuna21.json').read_text(encoding='utf-8-sig'))['jobs'];records=[]
for j in mini_jobs:
 p=mini/(j['id']+'.png');im=Image.open(p)
 assert im.size==(768,768) and im.convert('RGBA').getchannel('A').getextrema()==(255,255)
 records.append({'id':j['id'],'kind':'miniature','size':[768,768],'attempts':2 if j.get('revisionPrompt') else 1,'verified':True})
board=Image.new('RGBA',(1536,820),(29,38,46,255));draw=ImageDraw.Draw(board)
for k,j in enumerate(jobs):
 out=root/'assets'/j['id'];m=json.loads((out/'manifest.json').read_text());atlas=Image.open(out/'atlas.png').convert('RGBA')
 assert atlas.size==(4096,512) and Image.open(out/'preview.gif').n_frames==8
 assert m['animation']['rows']['motion']['loop'] is True
 if j['kind']=='marko':assert m['scaleReference']['scaledCalibrationHeight']==383
 else:assert m['noFootAlignment'] and m['renderAnchor']=={'x':256,'y':256}
 for i in range(8):
  im=Image.open(out/f'frames/motion/frame-{i}.png').convert('RGBA')
  assert im.size==(512,512) and im.getchannel('A').getextrema()==(0,255)
  assert atlas.crop((i*512,0,(i+1)*512,512)).tobytes()==im.tobytes()
  assert m['frame_layout']['rows']['motion'][i]==dict(x=i*512,y=0,w=512,h=512)
  if j['kind']=='marko':assert im.getchannel('A').getbbox()[3]==488
 paths=[out/'reference.png']+[out/f'frames/motion/frame-{i}.png' for i in [0,3,7]]
 for col,p in enumerate(paths):
  im=Image.open(p).convert('RGBA').resize((384,384),Image.Resampling.LANCZOS);board.alpha_composite(im,(col*384,k*410+20))
  draw.text((col*384+8,k*410+5),'reference' if col==0 else j['id']+' '+str([0,3,7][col-1]+1),fill='white')
 records.append({'id':j['id'],'kind':'animation','frames':8,'loop':True,'atlas':f"assets/{j['id']}/atlas.png",'manifest':f"assets/{j['id']}/manifest.json",'attempts':1,'verified':True})
board.convert('RGB').save(root/'preview-dopuna21.png')
(root/'catalog-dopuna21.json').write_text(json.dumps(records,indent=2))
(root/'validation-dopuna21.json').write_text(json.dumps({'miniatures':6,'clips':2,'frames':16,'imagegenCalls':11,'checks':['opaque768x768 miniatures','RGBA512x512 animation frames','atlas4096x512','atlas pixel equality','frame_layout','GIF counts','loop flags','idle calibration383px','floating fairy no foot anchor'],'results':records},indent=2))
with (world/'STATUS.md').open('a',encoding='utf8') as f:
 f.write('\nDOPUNA-21 A — ZAVRSENO: svih6 minijatura PNG768x768 provereno, zlatna neprovidna podloga. Pregled rukopis/minijature/preview-dopuna21.png. Drum, kapija i trag ispravljeni po josjednom zbog likova koji su pogresno preneti iz reference; prvi izvori sacuvani u sources/dopuna21/ uz v2. Ostale3 po jednim pokusajem. Stari preview.png i stare minijature nisu menjani.\n')
with (world/'STATUS-ANIMACIJE.md').open('a',encoding='utf8') as f:
 f.write('\nDOPUNA-21 B — ZAVRSENO: marko-wounded-walk i vila-spreda, po8 kadrova u petlji (16ukupno), po jedno generisanje. Provereni atlas4096x512, pojedinacniRGBA512x512, frame_layout, brojGIFkadova, loop, alfa; Marko neutralna kalibracija383px i y487, Ravijojla spreda sa istim kostimom kao fairy-cast/vila-let bez oslonca na stopala. Pregled art/animation-pack-04/preview-dopuna21.png, katalog i validacija catalog-dopuna21.json/validation-dopuna21.json. DOPUNA-21 ukupno6 slika+2klipa zavrseno; nema neuspelih stavki. Kod igre i dist nisu menjani.\n')
print('Verified: 6 miniatures + 2 clips / 16 frames. All status entries saved.')
