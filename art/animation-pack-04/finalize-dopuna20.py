from pathlib import Path
from PIL import Image,ImageDraw
import json,numpy as np
root=Path(__file__).resolve().parent
jobs=json.loads((root/'plan-dopuna20.json').read_text(encoding='utf-8-sig'))['jobs']
board=Image.new('RGBA',(1536,2460),(29,38,46,255));draw=ImageDraw.Draw(board);catalog=[]
for k,j in enumerate(jobs):
 out=root/'assets'/j['id'];m=json.loads((out/'manifest.json').read_text());atlas=Image.open(out/'atlas.png').convert('RGBA')
 assert atlas.size==(4096,512) and Image.open(out/'preview.gif').n_frames==8
 assert m['animation']['rows']['motion']['loop']==j['loop']
 if j['kind']=='marko':assert m['scaleReference']['scaledCalibrationHeight']<=383
 else:assert m['noFootAlignment'] and 'scaleReference' not in m
 records=[]
 for i in range(8):
  im=Image.open(out/f'frames/motion/frame-{i}.png').convert('RGBA');a=np.array(im.getchannel('A'))
  assert im.size==(512,512) and a.min()==0 and a.max()>0
  assert atlas.crop((i*512,0,(i+1)*512,512)).tobytes()==im.tobytes()
  assert m['frame_layout']['rows']['motion'][i]==dict(x=i*512,y=0,w=512,h=512)
  if j['kind']=='marko':assert im.getchannel('A').getbbox()[3]==488
  if j['kind']=='magic':assert ((a>0)&(a<255)).any()
  records.append({'frame':i,'alphaMin':int(a.min()),'alphaMax':int(a.max()),'softAlphaPixels':int(((a>0)&(a<255)).sum())})
 paths=[out/'reference.png' if j['reference'] else out/'frames/motion/frame-0.png']+[out/f'frames/motion/frame-{i}.png' for i in [0,3,7]]
 for col,p in enumerate(paths):
  im=Image.open(p).convert('RGBA').resize((384,384),Image.Resampling.LANCZOS);board.alpha_composite(im,(col*384,k*410+20))
  draw.text((col*384+8,k*410+5),('reference' if j['reference'] else 'frame 1') if col==0 else j['id']+' '+str([0,3,7][col-1]+1),fill='white')
 catalog.append({'id':j['id'],'frames':8,'loop':j['loop'],'atlas':f"assets/{j['id']}/atlas.png",'manifest':f"assets/{j['id']}/manifest.json",'attempts':j.get('attempts',1),'verified':True,'alphaChecks':records})
assert len(catalog)==6
board.convert('RGB').save(root/'preview-dopuna20.png')
(root/'catalog-dopuna20.json').write_text(json.dumps(catalog,indent=2))
(root/'validation-dopuna20.json').write_text(json.dumps({'clips':6,'frames':48,'generationAttempts':8,'results':catalog},indent=2))
with (root.parent/'world-pack-03/STATUS-ANIMACIJE.md').open('a',encoding='utf8') as f:
 f.write('\nDOPUNA-20 — ZAVRSENO: 6 klipova / 48 kadrova, redom iz tabele. Izvozi u art/animation-pack-04/assets/<klip>/. Provereni PNG512x512, atlas4096x512, jednakost atlas/kadrovi, frame_layout, 8GIF kadrova, loop zastavice i alfa. Marko kalibrisan na383px idle i y487; Ravijojla prema dist/assets/fairy-cast.png, centrirane pune celije bez oslonca na stopala; magija ima meku alfa providnost. Pregled: art/animation-pack-04/preview-dopuna20.png. Katalog/validacija: catalog-dopuna20.json, validation-dopuna20.json. Ugradjeni image_gen: 8generisanja — isceljenje ponovljeno zbog prejakog oreola (blag oreol je ostao), zrak zbog bele magle. Drugi zrak vracen na beloj podlozi: alfa izdvojena sprite-gen white cutout-om i uklonjeni neutralni ostaci matiranja; nije izvorna alfa. Prvi crtezi i izvozi sacuvani u sources/vila-isceljenje/export-before-glow-fix/ i sources/magija-zrak/export-before-fog-fix/. Nema preostalih stavki. Kod igre i dist nisu menjani.\n')
print('Verified 6 clips / 48 frames. Two justified retries, originals retained.')
