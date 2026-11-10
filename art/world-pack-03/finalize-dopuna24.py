from pathlib import Path
from PIL import Image,ImageDraw
import json,numpy as np
world=Path(__file__).resolve().parent;root=world.parent/'animation-pack-04'
jobs=json.loads((world/'prompts-dopuna24.json').read_text(encoding='utf-8-sig'))['jobs'];catalog=[]
board=Image.new('RGBA',(1536,1230),(29,38,46,255));d=ImageDraw.Draw(board)
for row,j in enumerate(jobs[:3]):
 out=root/'assets'/j['id'];m=json.loads((out/'manifest.json').read_text());atlas=Image.open(out/'atlas.png').convert('RGBA')
 assert atlas.size==(4096,512) and Image.open(out/'preview.gif').n_frames==8
 assert m['animation']['rows']['motion']['loop']==j['loop']
 sizes=[]
 for i in range(8):
  im=Image.open(out/f'frames/motion/frame-{i}.png').convert('RGBA');b=im.getchannel('A').getbbox()
  assert im.size==(512,512) and b[3]==488 and im.getchannel('A').getextrema()[0]==0
  assert atlas.crop((i*512,0,(i+1)*512,512)).tobytes()==im.tobytes()
  assert m['frame_layout']['rows']['motion'][i]==dict(x=i*512,y=0,w=512,h=512)
  sizes.append([b[2]-b[0],b[3]-b[1]])
 for col,i in enumerate([0,2,4,7]):
  im=Image.open(out/f'frames/motion/frame-{i}.png').convert('RGBA').resize((384,384),Image.Resampling.LANCZOS);board.alpha_composite(im,(col*384,row*410+20));d.text((col*384+8,row*410+4),j['id']+' '+str(i+1),fill='white')
 catalog.append({'id':j['id'],'frames':8,'cell':[512,512],'loop':j['loop'],'boundsMax':[max(w for w,h in sizes),max(h for w,h in sizes)],'atlas':f'../animation-pack-04/assets/{j["id"]}/atlas.png','attempts':j.get('attempts',1),'verified':True})
board.convert('RGB').save(root/'preview-dopuna24.png')
props=Image.new('RGBA',(1536,850),(120,128,128,255));dp=ImageDraw.Draw(props)
bones=Image.open(world/'kosti-delovi.png').convert('RGBA');assert bones.size==(1536,256) and bones.getchannel('A').getextrema()[0]==0
for i in range(6):
 b=bones.crop((i*256,0,(i+1)*256,256)).getchannel('A').getbbox();assert b and abs((b[0]+b[2])/2-128)<=1 and abs((b[1]+b[3])/2-128)<=1
props.alpha_composite(bones,(0,30));dp.text((8,8),'kosti-delovi: skull / jaw / ribs / femur / arm / pelvis',fill='white')
catalog.append({'id':'kosti-delovi','size':[1536,256],'cells':6,'transparent':True,'attempts':1,'verified':True})
for i in range(4):
 im=Image.open(world/f'krv-ekran-{i+1}.png').convert('RGBA');a=np.array(im.getchannel('A'))
 assert im.size==(512,512) and a.min()==0 and 0<a.max()<=166
 props.alpha_composite(im.resize((384,384),Image.Resampling.LANCZOS),(i*384,340));dp.text((i*384+8,745),f'krv-ekran-{i+1}',fill='white')
 catalog.append({'id':f'krv-ekran-{i+1}','size':[512,512],'alphaMax':int(a.max()),'transparent':True,'attempts':1,'verified':True})
props.convert('RGB').save(world/'preview-dopuna24-slike.png')
(world/'catalog-dopuna24.json').write_text(json.dumps(catalog,indent=2))
(world/'validation-dopuna24.json').write_text(json.dumps({'clips':3,'frames':24,'staticImages':5,'imagegenCalls':9,'results':catalog},indent=2))
with (world/'STATUS-ANIMACIJE.md').open('a',encoding='utf8') as f:
 f.write('\nDOPUNA-24 — ZAVRSENO: 3klipa/24kadra + kosti-delovi1536x256 + krv-ekran-1..4 po512x512. Sve8stavke proverene (dimenzije, alfa, dnoVFXy487, atlas/kadrovi, frame_layout, GIF8 i loop; kosti6 centriranih polja256, krv alfa do65%). Izvozi: art/animation-pack-04/assets/plamen/, plamen-mali/, eksplozija/ i slike na vrhu world-pack-03/. Pregledi: art/animation-pack-04/preview-dopuna24.png i art/world-pack-03/preview-dopuna24-slike.png. Katalog/provere: catalog-dopuna24.json i validation-dopuna24.json; promptovi prompts-dopuna24.json. Ugradjeni image_gen9generisanja: samo eksplozija ponovljena zbog svetle pravougaone magle; odabrani magentaizvor izdvojen sprite-gen alatom i ociscen preostali spill. Prvi izvor/izvoz sacuvani u sources/eksplozija/grid.png i export-before-matte-fix/. Nema neuspelih stavki; kod igre i dist nisu menjani.\n')
print('Verified 3 clips /24 frames +5 PNG images. Status complete.')
