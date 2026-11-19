from pathlib import Path
import json, shutil, sys
import numpy as np
from PIL import Image
from scipy import ndimage
root=Path(__file__).resolve().parents[1]/'animation-pack-04'
name,src,target,loop=sys.argv[1],Path(sys.argv[2]),int(sys.argv[3]),sys.argv[4]=='1'
run=root/'sources'/name/'attempt-1'; out=root/'assets'/name
run.mkdir(parents=True,exist_ok=True); (out/'frames/motion').mkdir(parents=True,exist_ok=True); shutil.copy2(src,run/'grid.png')
im=Image.open(src).convert('RGBA'); pieces=[]
for i in range(6):
 p=im.crop((round(i%3*im.width/3),round(i//3*im.height/2),round((i%3+1)*im.width/3),round((i//3+1)*im.height/2)))
 a=np.array(p); r,g,b=[a[:,:,j].astype(float) for j in range(3)]; key=(g>140)&(g>r*1.7+25)&(g>b*1.7+25); a[key,3]=0
 labels,n=ndimage.label(a[:,:,3]>0); sizes=np.bincount(labels.ravel()); a[np.isin(labels,np.flatnonzero((sizes<15)&(np.arange(len(sizes))>0))),3]=0
 if name=='car-daje' and i==5:
  largest=1+np.argmax(sizes[1:]); a[(labels!=largest),3]=0
 a[a[:,:,3]==0,:3]=0
 p=Image.fromarray(a); bb=p.getbbox(); pieces.append(p.crop(bb))
k=target/pieces[0].height
cells=[]; qa=[]
for i,p in enumerate(pieces):
 p=p.resize((round(p.width*k),round(p.height*k)),Image.Resampling.LANCZOS); a=np.array(p); a[a[:,:,3]<8]=0; rr,gg,bb=[a[:,:,j].astype(float) for j in range(3)]; spill=(gg>180)&(gg>rr*1.7+25)&(gg>bb*1.7+25); a[spill,3]=0; a[a[:,:,3]==0,:3]=0; p=Image.fromarray(a); cell=Image.new('RGBA',(512,512)); cell.alpha_composite(p,((512-p.width)//2,489-p.height)); bb=cell.getbbox(); cells.append(cell); qa.append({'frame':i,'bbox':bb,'height':bb[3]-bb[1],'supportY':bb[3]-1,'safeMargin':min(bb[0],bb[1],512-bb[2],512-bb[3])}); cell.save(run/f'frame-{i}.png'); cell.save(out/f'frames/motion/frame-{i}.png')
atlas=Image.new('RGBA',(3072,512)); contact=Image.new('RGBA',(1536,1024),(35,42,49,255)); gif=[]
for i,p in enumerate(cells):
 atlas.alpha_composite(p,(512*i,0)); contact.alpha_composite(p,(512*(i%3),512*(i//3))); bg=Image.new('RGBA',(512,512),(35,42,49,255)); bg.alpha_composite(p); gif.append(bg.convert('RGB'))
atlas.save(out/'atlas.png'); contact.save(run/'contact.png'); gif[0].save(out/'preview.gif',save_all=True,append_images=gif[1:],duration=100,loop=0,disposal=2)
def dump(p,x): p.write_text(json.dumps(x,indent=2,ensure_ascii=True)+'\n',encoding='utf-8')
dump(out/'manifest.json',{'characterId':name,'description':name,'holdLastFrame':not loop,'animation':{'columns':6,'rows':{'motion':{'frames':6,'loop':loop,'holdLastFrame':not loop,'durations_ms':[100]*6}}},'frame_layout':{'sheetWidth':3072,'rows':{'motion':[dict(x=512*i,y=0,w=512,h=512) for i in range(6)]}}})
dump(out/'qa.json',{'frames':qa,'measuredHeights':[q['height'] for q in qa],'scale':k,'targetHeight':target,'visualReview':'pending'}); print(name,'k=',k,'QA=',qa)


