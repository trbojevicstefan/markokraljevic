from pathlib import Path
import json, argparse, shutil
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage
BASE=Path(__file__).resolve().parents[1]/'animation-pack-04'; REF=Path(__file__).resolve().parent/'uzori-d95'
SPECS={'katana-idle':(6,True),'katana-run':(6,True),'katana-attack':(6,False),'katana-lunge':(6,False),'katana-hurt':(4,False),'katana-death':(6,False),'katana-jump':(6,False),'katana-omamljen':(6,True)}
def dump(p,v): p.write_text(json.dumps(v,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
def prepare(name,attempt):
 n,loop=SPECS[name]; run=BASE/'sources'/name/f'attempt-{attempt}'; grid=Image.open(run/'grid.png').convert('RGB'); ref=Image.open(REF/('pokret-sword-'+name.removeprefix('katana-')+'.png')).convert('RGBA'); cols=3 if n==6 else 2; rows=2
 refs=[ref.crop((i*512,0,(i+1)*512,512)) for i in range(n)]; cells=[]; qa=[]
 # One common scale preserves the relative height of all poses.
 scale=.78 if name=="katana-hurt" else .95
 for i in range(n):
  piece=grid.crop((round(i%cols*grid.width/cols),round(i//cols*grid.height/rows),round((i%cols+1)*grid.width/cols),round((i//cols+1)*grid.height/rows)))
  a=np.array(piece); key=(a[:,:,1]>190)&(a[:,:,0]<85)&(a[:,:,2]<85)&(a[:,:,1]>a[:,:,0]*1.8)&(a[:,:,1]>a[:,:,2]*1.8); rgba=np.dstack((a,np.where(key,0,255).astype('uint8'))); labels,k=ndimage.label(~key); sizes=np.bincount(labels.ravel()); small=np.flatnonzero(sizes<8); small=small[small!=0]; rgba[np.isin(labels,small),3]=0; rgba[rgba[:,:,3]==0,:3]=0
  edge=ndimage.binary_dilation(key,iterations=2)&~key; rgba[:,:,1][edge]=np.minimum(rgba[:,:,1][edge],np.maximum(rgba[:,:,0][edge],rgba[:,:,2][edge])); p=Image.fromarray(rgba); p=p.resize((round(p.width*scale),round(p.height*scale)),Image.Resampling.LANCZOS); bb=p.getbbox(); refbb=refs[i].getbbox(); x=round((refbb[0]+refbb[2]-bb[0]-bb[2])/2); x=max(24-bb[0],min(x,488-bb[2])); y=(488-bb[3]) if name not in ('katana-jump','katana-death') else (refbb[3]-bb[3]); cell=Image.new('RGBA',(512,512)); cell.alpha_composite(p,(x,y)); cells.append(cell)
  ar=np.array(cell); mask=ar[:,:,3]>8; bb=cell.getbbox(); refarea=int((np.array(refs[i])[:,:,3]>8).sum()); area=int(mask.sum()); qa.append({'frame':i,'bbox':list(bb),'height':bb[3]-bb[1],'supportY':bb[3]-1,'safeMargin':min(bb[0],bb[1],512-bb[2],512-bb[3]),'area':area,'referenceArea':refarea,'areaRatio':round(area/refarea,4)})
 board=Image.new('RGBA',(n*512,1024),(40,40,40,255))
 for i,(r,c) in enumerate(zip(refs,cells)): board.alpha_composite(r,(512*i,0)); board.alpha_composite(c,(512*i,512)); c.save(run/f'frame-{i}.png')
 board.save(run/'identity-size-comparison.png'); dump(run/'qa.json',{'frames':qa,'commonScale':scale,'reference':'pokret-sword-'+name.removeprefix('katana-')+'.png','targetHeight':426})
def export(name,attempt):
 n,loop=SPECS[name]; run=BASE/'sources'/name/f'attempt-{attempt}'; q=json.loads((run/'qa.json').read_text(encoding='utf-8')); assert all(f['safeMargin']>=24 and f['areaRatio']<=1.15 for f in q['frames']); assert (run/'review.json').exists() and json.loads((run/'review.json').read_text())['approved']; out=BASE/'assets'/name; assert not out.exists(); (out/'frames/motion').mkdir(parents=True); cells=[Image.open(run/f'frame-{i}.png').convert('RGBA') for i in range(n)]; atlas=Image.new('RGBA',(512*n,512)); gif=[]
 for i,c in enumerate(cells): c.save(out/f'frames/motion/frame-{i}.png'); atlas.alpha_composite(c,(i*512,0)); bg=Image.new('RGBA',(512,512),(40,40,40,255)); bg.alpha_composite(c); gif.append(bg.convert('RGB'))
 atlas.save(out/'atlas.png'); gif[0].save(out/'preview.gif',save_all=True,append_images=gif[1:],duration=100,loop=0,disposal=2,optimize=False); shutil.copy2(run/'identity-size-comparison.png',out/'identity-size-comparison.png'); dump(out/'manifest.json',{'characterId':name,'description':'Hungarian hussar '+name.removeprefix('katana-'),'holdLastFrame':False,'animation':{'columns':n,'rows':{'motion':{'frames':n,'loop':loop,'holdLastFrame':False,'durations_ms':[100]*n}}},'frame_layout':{'sheetWidth':512*n,'rows':{'motion':[{'x':512*i,'y':0,'w':512,'h':512} for i in range(n)]}}}); q.update(identityApproved=True,motionApproved=True,atlasMatchesFrames=True); dump(out/'qa.json',q)
p=argparse.ArgumentParser(); p.add_argument('mode',choices=['prepare','export']); p.add_argument('name',choices=SPECS); p.add_argument('attempt',type=int,choices=[1,2,3]); a=p.parse_args(); (prepare if a.mode=='prepare' else export)(a.name,a.attempt)



