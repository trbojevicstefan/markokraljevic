from pathlib import Path
from PIL import Image,ImageDraw
import json,numpy as np
w=Path(__file__).resolve().parent;r=w.parent/'animation-pack-04';jobs=json.loads((w/'prompts-dopuna31.json').read_text())['jobs'];items=[]
for j in jobs:
 p=w/(j['id']+'.png');im=Image.open(p);assert im.mode=='RGBA' and im.size==tuple(j['size'])
 if j.get('kind')=='clip':
  d=r/'assets/pauza-logor-16';m=json.loads((d/'manifest.json').read_text());assert m['animation']['rows']['motion']['frames']==16 and m['animation']['rows']['motion']['loop'];assert len(m['frame_layout']['rows']['motion'])==16
  assert Image.open(d/'preview.gif').n_frames==16 and im.getchannel('A').getextrema()==(255,255)
  for i in range(16):assert Image.open(d/f'frames/motion/frame-{i}.png').tobytes()==im.crop((i*768,0,(i+1)*768,512)).tobytes()
  items.append({'id':j['id'],'file':p.name,'size':im.size,'frames':16,'cell':[768,512],'loop':True,'fps':12,'animationFolder':'art/animation-pack-04/assets/pauza-logor-16/'})
 else:
  assert im.getchannel('A').getextrema()[0]==0
  if j['id'].startswith('ram-'):assert im.getpixel((im.width//2,im.height//2))[3]>240
  items.append({'id':j['id'],'file':p.name,'size':im.size,'transparent':True})
board=Image.new('RGBA',(1500,1100),(32,41,49,255));draw=ImageDraw.Draw(board)
for name,box in [('ram-kontrole',(0,0,900,600)),('ram-podesavanja',(920,0,580,760)),('polje-izbor',(40,800,640,72)),('klizac-staza',(40,920,640,28)),('klizac-dugme',(735,908,48,48))]:
 im=Image.open(w/(name+'.png'));im.thumbnail(box[2:],Image.Resampling.LANCZOS);board.alpha_composite(im,box[:2]);draw.text((box[0],box[1]+im.height+8),name,fill='white')
board.convert('RGB').save(w/'preview-dopuna31-ui.jpg')
(w/'catalog-dopuna31.json').write_text(json.dumps(items,indent=2),encoding='utf8')
(w/'validation-dopuna31.json').write_text(json.dumps({'passed':True,'clipFrames':16,'cellSize':[768,512],'atlasSize':[12288,512],'staticPng':5,'items':6,'checks':['exact dimensions','RGBA','native alpha outside UI','opaque felt centers','opaque scene','atlas exact frame match','manifest frame_layout count','16 GIF frames','loop flag']},indent=2),encoding='utf8')
with (w/'STATUS-ANIMACIJE.md').open('a',encoding='utf8') as f:f.write('\nDOPUNA-31 ZAVRSENO: 6/6 fajlova, logor16kad768x512 (traka12288x512) +5 UI PNG. Dimenzije/providnost/manifest/atlas/GIF provereni. Jedan image_gen pokusaj po fajlu. Katalog catalog-dopuna31.json, preview-dopuna31-ui.jpg; animacija art/animation-pack-04/assets/pauza-logor-16/preview.gif. Stariji8kad. klip netaknut.\n')
print('PASS: 16-frame camp scene + 5 UI PNG; catalog and previews saved.')
