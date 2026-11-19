from pathlib import Path
import json, shutil, sys
import numpy as np
from PIL import Image
from scipy import ndimage
root=Path(__file__).resolve().parents[1]/'animation-pack-04'
name,src,n,loop=sys.argv[1],Path(sys.argv[2]),int(sys.argv[3]),sys.argv[4]=='1'
run=root/'sources'/name/('attempt-'+(sys.argv[5] if len(sys.argv)>5 else '1')); out=root/'assets'/name
run.mkdir(parents=True,exist_ok=True); (out/'frames/motion').mkdir(parents=True,exist_ok=True); shutil.copy2(src,run/'grid.png')
im=Image.open(src).convert('RGBA'); cols=n//2; pieces=[]
for i in range(n):
 p=im.crop((round(i%cols*im.width/cols),round(i//cols*im.height/2),round((i%cols+1)*im.width/cols),round((i//cols+1)*im.height/2)))
 a=np.array(p); r,g,b=[a[:,:,j].astype(int) for j in range(3)]; key=(r>150)&(b>150)&(r>g*1.5+35)&(b>g*1.5+35); a[key,3]=0
 labels,num=ndimage.label(a[:,:,3]>0); sizes=np.bincount(labels.ravel()); a[np.isin(labels,np.flatnonzero((sizes<15)&(np.arange(len(sizes))>0))),3]=0; a[a[:,:,3]==0,:3]=0
 p=Image.fromarray(a); pieces.append(p.crop(p.getbbox()))
target=int(sys.argv[6]); k=min(target/pieces[0].width, 464/max(p.width for p in pieces), 464/max(p.height for p in pieces)); cells=[]; qa=[]
for i,p in enumerate(pieces):
 p=p.resize((round(p.width*k),round(p.height*k)),Image.Resampling.LANCZOS); cell=Image.new('RGBA',(512,512)); cell.alpha_composite(p,((512-p.width)//2,489-p.height)); bb=cell.getbbox(); cells.append(cell); qa.append({'frame':i,'bbox':bb,'height':bb[3]-bb[1],'supportY':bb[3]-1,'safeMargin':min(bb[0],bb[1],512-bb[2],512-bb[3])}); cell.save(run/f'frame-{i}.png'); cell.save(out/f'frames/motion/frame-{i}.png')
atlas=Image.new('RGBA',(512*n,512)); gif=[]
for i,p in enumerate(cells):
 atlas.alpha_composite(p,(512*i,0)); bg=Image.new('RGBA',(512,512),(35,42,49,255)); bg.alpha_composite(p); gif.append(bg.convert('RGB'))
atlas.save(out/'atlas.png'); gif[0].save(out/'preview.gif',save_all=True,append_images=gif[1:],duration=100,loop=0,disposal=2)
def dump(p,x): p.write_text(json.dumps(x,indent=2)+'\n',encoding='utf-8')
dump(out/'manifest.json',{'characterId':name,'description':name,'holdLastFrame':not loop,'animation':{'columns':n,'rows':{'motion':{'frames':n,'loop':loop,'holdLastFrame':not loop,'durations_ms':[100]*n}}},'frame_layout':{'sheetWidth':512*n,'rows':{'motion':[dict(x=512*i,y=0,w=512,h=512) for i in range(n)]}}})
dump(out/'qa.json',{'frames':qa,'scale':k,'targetWidth':target,'visualReview':'pending'}); print('k=',k,'QA=',qa)

