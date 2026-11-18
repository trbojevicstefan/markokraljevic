from PIL import Image, ImageDraw
import numpy as np, json, pathlib, sys
from scipy import ndimage
root=pathlib.Path(__file__).resolve().parent
name=sys.argv[1]; attempt=sys.argv[2]
run=root.parent/'animation-pack-04'/'sources'/name/('attempt-'+attempt)
im=Image.open(run/'grid.png').convert('RGBA'); ref=Image.open(root/'uzori-d100/sarac-stoji-kadar0.png').convert('RGBA')
cells=[]; boxes=[]
for i in range(8):
 x0=round(i%4*im.width/4); x1=round((i%4+1)*im.width/4); y0=round(i//4*im.height/2); y1=round((i//4+1)*im.height/2)
 a=np.array(im.crop((x0,y0,x1,y1))); r,g,b=[a[:,:,j].astype(float) for j in range(3)]; key=(g>35)&(g>r*1.22+12)&(g>b*1.22+12); a[key,3]=0; edge=ndimage.binary_dilation(key,iterations=2)&~key; a[:,:,1][edge]=np.minimum(g[edge],np.maximum(r,b)[edge]); a[a[:,:,3]==0,:3]=0
 p=Image.fromarray(a); cells.append(p); boxes.append(p.getbbox())
print('grid',im.size,'boxes',boxes)
# Uniform scaling and fixed horizontal placement, grounded to observed baseline.
left=min(bb[0] for bb in boxes); right=max(bb[2] for bb in boxes); scale=min(454/(right-left),1.3)
board=Image.new('RGBA',(512*5,512*2),(35,42,49,255)); report=[]
for i,p in enumerate(cells):
 bb=boxes[i]; p=p.resize((round(p.width*scale),round(p.height*scale)),Image.Resampling.LANCZOS); bb=p.getbbox(); x=round(256-(left+right)*scale/2); y=488-bb[3]; cell=Image.new('RGBA',(512,512)); cell.alpha_composite(p,(x,y)); cell.save(run/f'frame-{i}.png'); ar=np.array(cell); mask=ar[:,:,3]>8; ys,xs=np.where(mask); box=[int(xs.min()),int(ys.min()),int(xs.max()+1),int(ys.max()+1)]; report.append({'frame':i,'bbox':box,'height':box[3]-box[1],'area':int(mask.sum())}); board.alpha_composite(cell,((i%4+1)*512,(i//4)*512))
board.alpha_composite(ref,(0,0)); board.alpha_composite(ref,(0,512)); board.save(run/'identity-size-comparison.png'); (run/'measurements.json').write_text(json.dumps({'scale_grid':scale,'reference_height':382,'reference_width':398,'frames':report},indent=2),encoding='utf8'); print(json.dumps(report))
