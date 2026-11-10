from pathlib import Path
from PIL import Image,ImageDraw
import json,numpy as np
world=Path(__file__).resolve().parent;root=world.parent/'animation-pack-04'
jobs=json.loads((world/'prompts-dopuna25.json').read_text(encoding='utf-8-sig'))['jobs'];clips=[j for j in jobs if j['type']=='clip'];records=[]
board=Image.new('RGBA',(1536,410*7),(29,38,46,255));draw=ImageDraw.Draw(board)
for row,j in enumerate(clips):
 out=root/'assets'/j['id'];m=json.loads((out/'manifest.json').read_text());atlas=Image.open(out/'atlas.png').convert('RGBA');n=j['frames']
 assert atlas.size==(512*n,512) and Image.open(out/'preview.gif').n_frames==n
 assert m['animation']['rows']['motion']['loop']==j['loop']
 assert abs(m['scaleReference']['cellCalibrationHeight']*m['renderScale']-j['targetHeight'])<.01
 for i in range(n):
  im=Image.open(out/f'frames/motion/frame-{i}.png').convert('RGBA');a=im.getchannel('A')
  assert im.size==(512,512) and a.getextrema()[0]==0 and a.getbbox()[3]==488
  assert atlas.crop((i*512,0,(i+1)*512,512)).tobytes()==im.tobytes()
  assert m['frame_layout']['rows']['motion'][i]==dict(x=i*512,y=0,w=512,h=512)
 if j['id']=='mladi-turcin-attack':assert m['impactFrame']==3 and m['impactFrameOneBased']==4
 paths=[out/'reference.png']+[out/f'frames/motion/frame-{i}.png' for i in [0,n//2,n-1]]
 for col,p in enumerate(paths):
  im=Image.open(p).convert('RGBA').resize((384,384),Image.Resampling.LANCZOS);board.alpha_composite(im,(col*384,row*410+20));draw.text((col*384+8,row*410+4),'reference' if col==0 else j['id']+' '+str([0,n//2,n-1][col-1]+1),fill='white')
 records.append({'id':j['id'],'frames':n,'loop':j['loop'],'atlas':f'../animation-pack-04/assets/{j["id"]}/atlas.png','manifest':f'../animation-pack-04/assets/{j["id"]}/manifest.json','worldBodyHeight':j['targetHeight'],'renderScale':m['renderScale'],'renderAnchor':m['renderAnchor'],'attempts':1,'verified':True})
board.convert('RGB').save(root/'preview-dopuna25.png')
cages=Image.new('RGBA',(1536,800),(120,128,128,255));d=ImageDraw.Draw(cages)
for i,name in enumerate(['kavez-svatovi','kavez-razbijen']):
 im=Image.open(world/(name+'.png')).convert('RGBA');assert im.size==(768,768) and im.getchannel('A').getextrema()[0]==0 and im.getchannel('A').getbbox()[3]==744
 a=np.array(im.getchannel('A'));openPct=float(np.mean(a[180:600,180:600]==0));assert openPct>.12
 cages.alpha_composite(im,(i*768,0));d.text((i*768+8,775),name,fill='white');records.append({'id':name,'file':name+'.png','size':[768,768],'transparentInteriorPct':round(openPct*100,2),'attempts':1,'verified':True})
cages.convert('RGB').save(world/'preview-dopuna25-kavezi.png')
assert len(clips)==7 and sum(j['frames'] for j in clips)==44
(world/'catalog-dopuna25.json').write_text(json.dumps(records,indent=2))
(world/'validation-dopuna25.json').write_text(json.dumps({'clips':7,'frames':44,'staticImages':2,'imagegenCalls':9,'results':records},indent=2))
scales={r['id']:r['renderScale'] for r in records if 'renderScale' in r and abs(r['renderScale']-1)>.001}
with (world/'STATUS-ANIMACIJE.md').open('a',encoding='utf8') as f:
 f.write('\nDOPUNA-25 — ZAVRSENO: svih9stavki redom, 7klipova/44kadra i2kaveza768x768. Po jedno generisanje ugradjenim image_gen. Provereni alfa,512x512kadri, oslonac y487, atlas/kadrovi, frame_layout, GIFbrojevi i loop; napad pogodak4. Kavezi imaju praznu providnu unutrasnjost. Pregledi: art/animation-pack-04/preview-dopuna25.png i art/world-pack-03/preview-dopuna25-kavezi.png; katalog/validacija: catalog-dopuna25.json/validation-dopuna25.json. Promptovi prompts-dopuna25.json. Pri ubacivanju koristiti renderScale iz svakog manifesta oko renderAnchor(256,488) za isti svetski zum (svatovi417px,mladiTurcin426px); bitno za siru grupu kola i dugacak polozaj pada. Pomocne neutralne kalibracione poze nisu u izvoznim klipovima. Nema neuspelih stavki, kod igre i dist nisu menjani.\n')
print('Verified:7clips/44frames+2cages. Non-unit render scales:',scales)
