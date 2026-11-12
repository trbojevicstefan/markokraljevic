from pathlib import Path
from PIL import Image
import json,subprocess,shutil,sys,hashlib,os
os.environ["OPENBLAS_NUM_THREADS"]="1"
os.environ["OMP_NUM_THREADS"]="1"
ROOT=Path(__file__).resolve().parent
SG=Path('D:/projects/Marko Kraljevic/tools/sprite-gen/.venv/Scripts/sprite-gen.exe')
name,n,cols,loop=sys.argv[1],int(sys.argv[2]),int(sys.argv[3]),sys.argv[4]=='true'
run=ROOT/'sources'/name;out=ROOT/'assets'/name
ref=ROOT/'assets/marko-idle-2/reference.png'
assert not (out/'qa.json').exists(),'Preserve completed delivery'
def sg(*a):
 p=subprocess.run([str(SG),*map(str,a)],capture_output=True,text=True)
 (run/(a[0]+'.log')).write_text(p.stdout+'\n'+p.stderr,encoding='utf8')
 if p.returncode:raise RuntimeError(p.stdout+p.stderr)
sg('prepare','--out-dir',run,'--force','--character-id',name,'--base-image',ref,'--cell-size','512','--safe-margin','24','--no-fit-pixel-unfake','--fit-align-y','bottom','--request-json',json.dumps({'states':{'motion':{'frames':n,'fps':12,'loop':loop,'action':name}}}))
im=Image.open(run/'grid.png').convert('RGBA')
if im.getchannel('A').getextrema()[0]>200 or os.environ.get('SPRITE_FORCE_CHROMA')=='1':
 sys.path.insert(0,'D:/projects/Marko Kraljevic/tools/sprite-gen')
 from sprite_gen.frames.extract import remove_chroma_background
 key=(0,255,0) if im.getpixel((0,0))[1]>im.getpixel((0,0))[0]+80 else (255,255,255)
 im=remove_chroma_background(im,key,60 if key[0]==0 else 45,110,30)
 im.save(run/'keyed-source.png')
rows=(n+cols-1)//cols;w,h=im.width//cols,im.height//rows
cw=w
boundaries=json.loads(os.environ["SPRITE_X_BOUNDS"]) if "SPRITE_X_BOUNDS" in os.environ else None
if boundaries:w=max(b-a for a,b in zip(boundaries,boundaries[1:]))
if name=='marko-air-3':w+=16
strip=Image.new('RGBA',(w*n,h))
for i in range(n):
 box=(i%cols*cw,i//cols*h,(i%cols+1)*cw,(i//cols+1)*h)
 if boundaries:box=(boundaries[i],0,boundaries[i+1],h)
 if name=='marko-air-3' and i==3:box=(0,h,370,2*h)
 if name=='marko-air-3' and i==4:box=(370,h,724,2*h)
 cell=im.crop(box);inner=cell.crop((1,3,cell.width-1,cell.height-3));cell=Image.new('RGBA',(w,h));cell.paste(inner,(1,3));strip.paste(cell,(i*w,0))
(run/'raw').mkdir(exist_ok=True);strip.resize((512*n,512),Image.Resampling.LANCZOS).save(run/'raw/motion.png')
sg('extract','--run-dir',run,'--allow-slot-fallback','--decontam','off')
# Preserve generated alpha and shared anatomical scale; trim only near-invisible alpha noise.
parts=[]
for i in range(n):
 cell=strip.crop((i*w,0,(i+1)*w,h));a=cell.getchannel('A');a=a.point(lambda v:0 if v<8 else v);cell.putalpha(a)
 if os.environ.get('SPRITE_CLEAN_FRAGMENTS')=='1':
  import numpy as np
  from scipy.ndimage import label
  ar=np.array(a);labels,count=label(ar>0);sizes=np.bincount(labels.ravel());sizes[0]=0;ar[sizes[labels]<sizes.max()*0.03]=0;a=Image.fromarray(ar);cell.putalpha(a)
 b=a.getbbox();assert b;parts.append(cell.crop(b))
target=435 if name=='marko-air-3' else 450 if name=='marko-kuka-let' else 383
scale=min(float(os.environ['SPRITE_BODY_HEIGHT'])/parts[int(os.environ.get('SPRITE_BODY_FRAME','0'))].height,480/max(p.width for p in parts),480/max(p.height for p in parts)) if 'SPRITE_BODY_HEIGHT' in os.environ else min(target/max(p.height for p in parts),480/max(p.width for p in parts))
qa=[]
for i,p in enumerate(parts):
 p=p.resize((round(p.width*scale),round(p.height*scale)),Image.Resampling.LANCZOS)
 b=p.getchannel('A').getbbox();p=p.crop(b)
 cell=Image.new('RGBA',(512,512));cell.alpha_composite(p,((512-p.width)//2,488-p.height));cell.save(run/f'frames/motion/frame-{i}.png')
 if name=='marko-nalet-kraj' and i in (0,2):
  src='marko-nalet' if i==0 else 'marko-fall';cell=Image.open(ROOT/f'assets/{src}/atlas.png').convert('RGBA').crop((0,0,512,512));cell.save(run/f'frames/motion/frame-{i}.png')
 if name=='marko-odmor-ustaje' and i in (0,3):
  src='marko-odmor' if i==0 else 'marko-idle-2';si=5 if i==0 else 0;cell=Image.open(ROOT/f'assets/{src}/atlas.png').convert('RGBA').crop((si*512,0,(si+1)*512,512));cell.save(run/f'frames/motion/frame-{i}.png')
 qa.append({'frame':i,'bounds':cell.getchannel('A').getbbox(),'footY':487,'sha256':hashlib.sha256(cell.tobytes()).hexdigest()})
sg('compose-atlas','--run-dir',run)
out.mkdir(parents=True,exist_ok=True);shutil.copytree(run/'frames',out/'frames',dirs_exist_ok=True);shutil.copy2(run/'sprite-sheet-alpha.png',out/'atlas.png');shutil.copy2(ref,out/'reference.png')
m=json.loads((run/'manifest.json').read_text());m.update(game_input='atlas.png',sprite_sheet_alpha='atlas.png',base_image='reference.png',holdLastFrame=not loop)
m['animation']['rows']['motion']['holdLastFrame']=not loop
m['scaleReference']={'character':'marko','referenceHeight':383,'footY':487,'scale':scale,'method':'shared source scale; no per-frame stretching'}
(out/'manifest.json').write_text(json.dumps(m,indent=2),encoding='utf8')
sg('compose-gif',*[out/f'frames/motion/frame-{i}.png' for i in range(n)],'--output',out/'preview.gif','--delay-ticks','8','--loop-count','0' if loop else '1')
atlas=Image.open(out/'atlas.png').convert('RGBA');assert atlas.size==(n*512,512)
for i in range(n):assert atlas.crop((i*512,0,(i+1)*512,512)).tobytes()==Image.open(out/f'frames/motion/frame-{i}.png').convert('RGBA').tobytes()
assert Image.open(out/'preview.gif').n_frames==n
(out/'qa.json').write_text(json.dumps({'frames':qa,'atlasMatchesFrames':True,'gifFrames':n,'loop':loop,'holdLastFrame':not loop,'generator':'built-in image_gen','pipeline':['extract','compose-atlas','compose-gif'],'alphaNoiseFloor':8,'scale':scale,'visualReview':'pending'},indent=2))
print(str(out))
