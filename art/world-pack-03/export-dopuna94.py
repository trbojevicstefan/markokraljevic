from pathlib import Path
import sys,json,shutil
import numpy as np
from PIL import Image
from scipy import ndimage
root=Path(__file__).resolve().parents[1]/'animation-pack-04'; refs=Path(__file__).resolve().parent/'uzori-d94'
name=sys.argv[1]; attempt=int(sys.argv[2]); src=Path(sys.argv[3]); n={'mounted':8,'mounted-strike':6,'unhorsed':6,'run':8,'attack':6,'hvata':6,'hurt':4,'death':6}[name]; cols=4 if n==8 else 2 if n==4 else 3
run=root/'sources'/('vuca-'+name)/f'attempt-{attempt}'; run.mkdir(parents=True,exist_ok=True); shutil.copy2(src,run/'grid.png'); grid=Image.open(src).convert('RGBA'); ref=Image.open(refs/f'pokret-beg-{name}.png').convert('RGBA'); pieces=[]; refcells=[]
for i in range(n):
 x=i%cols; y=i//cols; p=grid.crop((round(x*grid.width/cols),round(y*grid.height/2),round((x+1)*grid.width/cols),round((y+1)*grid.height/2))); a=np.array(p); r,g,b=[a[:,:,j].astype(float) for j in range(3)]; key=(g>35)&(g>r*1.22+12)&(g>b*1.22+12); a[key,3]=0; edge=ndimage.binary_dilation(key,iterations=2)&~key; a[:,:,1][edge]=np.minimum(g[edge],np.maximum(r,b)[edge]); a[a[:,:,3]==0,:3]=0; p=Image.fromarray(a); bb=p.getbbox(); pieces.append(p.crop(bb)); refcells.append(ref.crop((i*512,0,(i+1)*512,512)))
# Uniform scale anchored to first frame; preserve generated relative pose dimensions.
rb=refcells[0].getbbox(); scale=(rb[3]-rb[1])/pieces[0].height
board=Image.new('RGBA',(n*512,1024),(35,42,49,255)); cells=[]; qa=[]
for i,(p,rc) in enumerate(zip(pieces,refcells)):
 p=p.resize((round(p.width*scale),round(p.height*scale)),Image.Resampling.LANCZOS); ar=np.array(p); ar[ar[:,:,3]<8]=0; ar[ar[:,:,3]==0,:3]=0; p=Image.fromarray(ar); rb=rc.getbbox(); x=round((rb[0]+rb[2]-p.width)/2); y=rb[3]-p.height; cell=Image.new('RGBA',(512,512)); cell.alpha_composite(p,(x,y)); cell.save(run/f'frame-{i}.png'); cells.append(cell); bb=cell.getbbox(); area=int((np.array(cell)[:,:,3]>127).sum()); ra=int((np.array(rc)[:,:,3]>127).sum()); qa.append({'frame':i,'bbox':bb,'height':bb[3]-bb[1],'supportY':bb[3]-1,'areaRatio':round(area/ra,3),'margin':min(bb[0],bb[1],512-bb[2],512-bb[3])}); board.alpha_composite(rc,(i*512,0)); board.alpha_composite(cell,(i*512,512))
board.save(run/'comparison.png'); (run/'qa.json').write_text(json.dumps({'frames':qa,'scale':scale},indent=2)+'\n',encoding='utf-8'); print(json.dumps(qa))
