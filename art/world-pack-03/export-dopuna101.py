from pathlib import Path
import json, sys
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage
ROOT=Path(__file__).resolve().parents[1]/'animation-pack-04'
REF=Path(__file__).resolve().parent/'uzori-d98/mounted-idle-kadar0.png'
run=ROOT/'sources/mounted-okret'/('attempt-'+sys.argv[1])
im=Image.open(run/'grid.png').convert('RGBA')
ref=Image.open(REF).convert('RGBA'); rb=ref.getbbox()
pieces=[]
for i in range(6):
 x=i%3; y=i//3
 a=np.array(im.crop((round(x*im.width/3)+2,round(y*im.height/2)+2,round((x+1)*im.width/3)-2,round((y+1)*im.height/2)-2)))
 r,g,b=[a[:,:,j].astype(float) for j in range(3)]; key=(g>35)&(g>r*1.22+12)&(g>b*1.22+12); a[key,3]=0
 edge=ndimage.binary_dilation(key,iterations=2)&~key; a[:,:,1][edge]=np.minimum(g[edge],np.maximum(r,b)[edge]); a[a[:,:,3]==0,:3]=0
 p=Image.fromarray(a); pieces.append(p.crop(p.getbbox()))
k=1.045
board=Image.new('RGBA',(512*4,512*2),(35,42,49,255)); cells=[]; qa=[]
for i,p in enumerate(pieces):
 p=p.resize((round(p.width*k),round(p.height*k)),Image.Resampling.LANCZOS)
 a=np.array(p); a[a[:,:,3]<8]=0; a[a[:,:,3]==0,:3]=0; p=Image.fromarray(a)
 cell=Image.new('RGBA',(512,512)); cell.alpha_composite(p,(round((rb[0]+rb[2])/2-p.width/2),488-p.height)); bb=cell.getbbox(); cells.append(cell)
 cell.save(run/f'frame-{i}.png'); board.alpha_composite(cell,((i%3+1)*512,(i//3)*512)); qa.append({'frame':i,'bbox':bb,'height':bb[3]-bb[1],'supportY':bb[3]-1,'safeMargin':min(bb[0],bb[1],512-bb[2],512-bb[3])})
for row in range(2): board.alpha_composite(ref,(0,row*512))
board.save(run/'identity-size-comparison.png')
(run/'qa.json').write_text(json.dumps({'scale':k,'frames':qa},indent=2),encoding='utf-8')
print(json.dumps({'scale':k,'frames':qa},indent=2))



