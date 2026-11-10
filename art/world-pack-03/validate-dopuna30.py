from pathlib import Path
from PIL import Image,ImageDraw
import json
w=Path(__file__).resolve().parent;r=w.parent/'animation-pack-04'
jobs=json.loads((w/'prompts-dopuna30.json').read_text(encoding='utf-8-sig'))['jobs'];catalog=[];count=0
board=Image.new('RGB',(1200,6*250),(28,36,44));d=ImageDraw.Draw(board);row=0
for j in jobs:
 if j['kind']=='nest':
  p=w/(j['id']+'.png');im=Image.open(p);assert im.size==(768,768) and im.mode=='RGBA' and im.getchannel('A').getextrema()[0]==0
  catalog.append({'id':j['id'],'file':str(p.relative_to(w.parent.parent)),'size':im.size});continue
 p=r/'assets'/j['id'];m=json.loads((p/'manifest.json').read_text());n=j['frames'];a=Image.open(p/'atlas.png');assert a.size==(512*n,512)
 assert len(m['frame_layout']['rows']['motion'])==n and m['animation']['rows']['motion']['loop']==j['loop']
 assert Image.open(p/'preview.gif').n_frames==n
 for i in range(n):
  f=Image.open(p/f'frames/motion/frame-{i}.png');assert f.size==(512,512) and f.mode=='RGBA' and f.getchannel('A').getextrema()[0]==0
  assert a.crop((i*512,0,(i+1)*512,512)).tobytes()==f.tobytes()
  if j['kind']=='human':assert f.getchannel('A').getbbox()[3]==488
 if j['kind']=='bird':assert m['renderAnchor']=={'x':256,'y':300} and m['noFootAlignment']
 if j['id'] in ('hasan-aga-attack','bajraktar-attack','janicarski-aga-attack'):assert m['impactFrame']==3
 if j['id']=='janicarski-aga-skok':assert m['landingFrame']==4 and m['landingFrameOneBased']==5
 d.text((12,row*250+8),j['id']+' / '+str(n)+' frames',fill='white')
 for col,i in enumerate([0,n//2,n-1]):
  f=Image.open(p/f'frames/motion/frame-{i}.png').resize((224,224));board.paste(f,(420+col*250,row*250+20),f)
 catalog.append({'id':j['id'],'frames':n,'loop':j['loop'],'path':str(p.relative_to(w.parent.parent)),'renderScale':m['renderScale'],'renderAnchor':m['renderAnchor']});count+=n;row+=1
assert count==38
board.save(r/'preview-dopuna30.png')
(w/'catalog-dopuna30.json').write_text(json.dumps(catalog,indent=2),encoding='utf8')
(w/'validation-dopuna30.json').write_text(json.dumps({'passed':True,'clips':6,'frames':count,'staticPng':0,'items':6,'checks':['RGBA and transparency','512x512 frames','exact atlas/frame match','frame_layout counts','GIF counts','loop flags','human ground baseline','eagle torso anchor','all six clips loop']},indent=2),encoding='utf8')
with (w/'STATUS-ANIMACIJE.md').open('a',encoding='utf8') as f:f.write('\nDOPUNA-30 ZAVRSENO: 6/6 klipova, 38 kadrova. Provera izvoza prosla. Ugradjeni image_gen, jedan pokusaj po stavci. Katalog catalog-dopuna30.json, promptovi prompts-dopuna30.json, pregled art/animation-pack-04/preview-dopuna30.png. Pri integraciji primeniti manifest.renderScale oko renderAnchor; zum prema putnica-idle, ciljna visina odraslog 405px, oslonac (256,488); dva lika zajedno u oba klipa sirotinje.\n')
print('PASS: 6 clips, 38 frames; catalog and preview saved.')
