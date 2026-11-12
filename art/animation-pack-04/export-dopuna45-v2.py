from pathlib import Path
from PIL import Image
import os,sys,json,subprocess,shutil,hashlib
ROOT=Path(__file__).resolve().parent
REPO=ROOT.parent.parent
SG=Path('D:/projects/Marko Kraljevic/tools/sprite-gen/.venv/Scripts/sprite-gen.exe')
base=sys.argv[1];cols=sys.argv[2];name=base+'-v2'
rig=json.loads((REPO/'dist/assets/sprite-rig.json').read_text())[base]
src=Image.open(REPO/'dist/assets'/rig['image']).convert('RGBA')
originals=[src.crop((x,y,x+w,y+h)) for x,y,w,h,*_ in rig['frames']]
n=len(originals);cw,ch=originals[0].size
assert all(im.size==(cw,ch) for im in originals)
run=ROOT/'sources'/name;out=ROOT/'assets'/name
assert not (out/'qa.json').exists(),'Preserve completed delivery'
# Reuse requested exporter for extraction and intermediate atlas/GIF.
exporter=ROOT/'export-dopuna45.py'
code=exporter.read_text().replace("out=ROOT/'assets'/name","out=ROOT/'sources'/name/'intermediate'")
os.environ['SPRITE_BODY_HEIGHT']=str(originals[0].getchannel('A').getbbox()[3]-originals[0].getchannel('A').getbbox()[1])
os.environ['SPRITE_BODY_FRAME']=str(n-2) if base=='marko-combo-4' else os.environ.get('SPRITE_BODY_FRAME','0')
os.environ['SPRITE_CLEAN_FRAGMENTS']='1'
if int(cols)==n-1:
 import numpy as np
 grid=Image.open(run/'grid.png').convert('RGBA')
 mass=(np.array(grid)[:,:,3]>40).sum(axis=0);gw=grid.width;cuts=[0];count=n-1
 for i in range(1,count):
  lo=int((i-.25)*gw/count);hi=int((i+.25)*gw/count);v=mass[lo:hi];ids=np.where(v==v.min())[0];cuts.append(lo+int(ids[len(ids)//2]))
 cuts.append(gw);os.environ['SPRITE_X_BOUNDS']=json.dumps(cuts)

sys.argv=[str(exporter),name,str(n-1),str(cols),'false']
if not (run/'intermediate/qa.json').exists():exec(compile(code,str(exporter),'exec'),{'__file__':str(exporter),'__name__':'__main__'})
mid=run/'intermediate'
frames=[]
for i,orig in enumerate(originals):
 frames.append(orig)
 if i<n-1:
  im=Image.open(mid/f'frames/motion/frame-{i}.png').convert('RGBA')
  if (cw,ch)!=(512,512):im=im.resize((cw,ch),Image.Resampling.LANCZOS)
  # Align new pose midway between the two unchanged source positions.
  b=im.getchannel('A').getbbox();a=orig.getchannel('A').getbbox();z=originals[i+1].getchannel('A').getbbox()
  targetx=round((a[0]+a[2]+z[0]+z[2])/4);bottom=round((a[3]+z[3])/2)
  part=im.crop(b);canvas=Image.new('RGBA',(cw,ch));canvas.alpha_composite(part,(max(0,min(cw-part.width,targetx-part.width//2)),bottom-part.height));frames.append(canvas)
total=len(frames)
request=json.loads((run/'sprite-request.json').read_text())
request['states']['motion']['frames']=total
# prepare refreshes manifest metadata for final frame count; then install exact frames.
def sg(*args):
 p=subprocess.run([str(SG),*map(str,args)],capture_output=True,text=True)
 (run/(str(args[0])+'-v2.log')).write_text(p.stdout+'\n'+p.stderr,encoding='utf8')
 if p.returncode:raise RuntimeError(p.stdout+p.stderr)
sg('prepare','--out-dir',run,'--force','--character-id',name,'--base-image',ROOT/'assets/marko-idle-2/reference.png','--cell-size',cw,'--safe-margin','24','--no-fit-pixel-unfake','--fit-align-y','bottom','--request-json',json.dumps({'states':{'motion':{'frames':total,'fps':24,'loop':False,'action':name}}}))
fd=run/'frames/motion';fd.mkdir(parents=True,exist_ok=True)
for i,im in enumerate(frames):im.save(fd/f'frame-{i}.png')
fm=json.loads((run/'frames/frames-manifest.json').read_text())
fm['cell'].update(width=cw,height=ch,size=cw)
row=fm['rows'][0];row.update(frames=total,files=[f'frames/motion/frame-{i}.png' for i in range(total)],frame_records=[{'index':i,'bbox':im.getchannel('A').getbbox()} for i,im in enumerate(frames)])
(run/'frames/frames-manifest.json').write_text(json.dumps(fm))
sg('compose-atlas','--run-dir',run)
out.mkdir(parents=True,exist_ok=True)
shutil.copytree(run/'frames',out/'frames',dirs_exist_ok=True)
shutil.copy2(run/'sprite-sheet-alpha.png',out/'atlas.png')
shutil.copy2(mid/'reference.png',out/'reference.png')
m=json.loads((run/'manifest.json').read_text())
m.update(game_input='atlas.png',sprite_sheet_alpha='atlas.png',base_image='reference.png',holdLastFrame=True,sourceClip=base,sourceRig=rig,evenFramesPixelExact=True)
m['animation']['rows']['motion']['holdLastFrame']=True
(out/'manifest.json').write_text(json.dumps(m,indent=2),encoding='utf8')
sg('compose-gif',*[fd/f'frame-{i}.png' for i in range(total)],'--output',out/'preview.gif','--delay-ticks','4','--loop-count','1')
# Keep RGB bytes beneath fully transparent source pixels as well.
atlas=Image.new('RGBA',(cw*total,ch))
for i,im in enumerate(frames):atlas.paste(im,(i*cw,0))
atlas.save(out/'atlas.png')
atlas.save(run/'sprite-sheet-alpha.png')
assert atlas.size==(cw*total,ch)
for i,im in enumerate(frames):
 assert atlas.crop((i*cw,0,(i+1)*cw,ch)).tobytes()==im.tobytes()
for i,im in enumerate(originals):assert frames[2*i].tobytes()==im.tobytes()
q={'atlasMatchesFrames':True,'evenFramesPixelExact':True,'frameCount':total,'sourceClip':base,'cell':[cw,ch],'generator':'built-in image_gen','pipeline':['extract','compose-atlas','compose-gif'],'visualReview':'pending','frames':[{'frame':i,'bounds':im.getchannel('A').getbbox(),'sha256':hashlib.sha256(im.tobytes()).hexdigest()} for i,im in enumerate(frames)]}
(out/'qa.json').write_text(json.dumps(q,indent=2))
print(str(out))
