from pathlib import Path
import json, shutil, sys
import numpy as np
from PIL import Image,ImageDraw
from scipy import ndimage
root=Path(__file__).resolve().parents[1]/'animation-pack-04'; ref=Path(__file__).parent/'uzori-d96/milos-idle-kadar0.png'
spec={'velimirovica-idle':(6,360,True),'velimirovica-bezi':(6,360,True),'toplica-idle':(6,350,True),'kosancic-idle':(6,385,True),'knjigonosa-idle':(6,370,True),'knjigonosa-poklon':(8,370,False)}
def dump(p,v): p.write_text(json.dumps(v,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
def prepare(name,attempt,source):
 n,target,loop=spec[name]; cols=n//2; run=root/'sources'/name/f'attempt-{attempt}'; run.mkdir(parents=True,exist_ok=True); shutil.copy2(source,run/'grid.png'); im=Image.open(source).convert('RGB'); parts=[]
 for i in range(n):
  p=im.crop((round(i%cols*im.width/cols),round(i//cols*im.height/2),round((i%cols+1)*im.width/cols),round((i//cols+1)*im.height/2))); a=np.array(p.convert('RGBA')); rgb=a[:,:,:3].astype(float); r,g,b=rgb[:,:,0],rgb[:,:,1],rgb[:,:,2]; key=(g>45)&(g>r*1.22+12)&(g>b*1.22+12); a[key,3]=0; edge=ndimage.binary_dilation(key,iterations=2)&~key; a[:,:,1][edge]=np.minimum(g[edge],np.maximum(r,b)[edge]); a[a[:,:,3]==0,:3]=0; p=Image.fromarray(a); bb=p.getbbox(); parts.append(p.crop(bb))
 scale=target/parts[0].height; cells=[]; stats=[]; rb=Image.open(ref).getbbox(); center=(rb[0]+rb[2])/2
 for i,p in enumerate(parts):
  p=p.resize((round(p.width*scale),round(p.height*scale)),Image.Resampling.LANCZOS); a=np.array(p); a[a[:,:,3]<8]=0; a[a[:,:,3]==0,:3]=0; p=Image.fromarray(a); cell=Image.new('RGBA',(512,512)); cell.alpha_composite(p,(round(center-p.width/2),488-p.height)); bb=cell.getbbox(); a=np.array(cell); mask=a[:,:,3]>0; stats.append({'frame':i,'bbox':bb,'height':bb[3]-bb[1],'supportY':bb[3]-1,'area':int(mask.sum()),'margin':min(bb[0],bb[1],512-bb[2],512-bb[3])}); cells.append(cell); cell.save(run/f'frame-{i}.png')
 board=Image.new('RGBA',((n+1)*512,512),(35,42,49,255)); board.alpha_composite(Image.open(ref).convert('RGBA')); [board.alpha_composite(c,(512*(i+1),0)) for i,c in enumerate(cells)]; board.save(run/'identity-size-comparison.png'); dump(run/'qa.json',{'targetHeight':target,'frames':stats,'areaRatios':[round(x['area']/stats[0]['area'],3) for x in stats]}); print(json.dumps(stats)); print('ratios', [round(x['area']/stats[0]['area'],3) for x in stats])
def export(name,attempt):
 n,target,loop=spec[name]; run=root/'sources'/name/f'attempt-{attempt}'; out=root/'assets'/name; q=json.loads((run/'qa.json').read_text(encoding='utf-8')); assert abs(q['frames'][0]['height']-target)<=target*.05; assert all(x['margin']>=24 for x in q['frames']); assert max(q['areaRatios'])<=1.15; out.mkdir(parents=True,exist_ok=False); (out/'frames/motion').mkdir(parents=True); cells=[Image.open(run/f'frame-{i}.png').convert('RGBA') for i in range(n)]; atlas=Image.new('RGBA',(n*512,512)); gifs=[]
 for i,c in enumerate(cells):
  c.save(out/f'frames/motion/frame-{i}.png'); atlas.alpha_composite(c,(512*i,0)); b=Image.new('RGBA',(512,512),(35,42,49,255)); b.alpha_composite(c); gifs.append(b.convert('RGB'))
 atlas.save(out/'atlas.png'); gifs[0].save(out/'preview.gif',save_all=True,append_images=gifs[1:],duration=100,disposal=2,**({'loop':0} if loop else {})); shutil.copy2(run/'identity-size-comparison.png',out/'identity-size-comparison.png'); dump(out/'manifest.json',{'characterId':name,'description':name,'holdLastFrame':not loop,'animation':{'columns':n,'rows':{'motion':{'frames':n,'loop':loop,'holdLastFrame':not loop,'durations_ms':[100]*n}}},'frame_layout':{'sheetWidth':512*n,'rows':{'motion':[{'x':i*512,'y':0,'w':512,'h':512} for i in range(n)]}}}); q.update(identityApproved=True,motionApproved=True,atlasMatchesFrames=True,gifFrames=n); dump(out/'qa.json',q)
if __name__=='__main__':
 mode,name,attempt,*rest=sys.argv[1:]; (prepare(name,int(attempt),Path(rest[0])) if mode=='prepare' else export(name,int(attempt)))

