from pathlib import Path
from PIL import Image
import cv2,numpy as np,json
root=Path(__file__).resolve().parent
report=[]
for j in json.loads((root/'plan-dopuna11.json').read_text())['jobs']:
    a=np.array(Image.open(root/'sources'/j['id']/'grid-alpha.png').convert('RGBA'))
    n,labels,stats,centers=cv2.connectedComponentsWithStats((a[:,:,3]>16).astype('uint8'),8)
    for k in range(1,n):
        x,y,w,h,area=stats[k]
        if area<200:continue
        cx,cy=centers[k];col=min(j['cols']-1,int(cx*j['cols']/a.shape[1]));row=min(j['rows']-1,int(cy*j['rows']/a.shape[0]))
        x0=col*a.shape[1]//j['cols'];x1=(col+1)*a.shape[1]//j['cols'];y0=row*a.shape[0]//j['rows'];y1=(row+1)*a.shape[0]//j['rows']
        if x<x0-3 or x+w>x1+3 or y<y0-3 or y+h>y1+3:report.append({'clip':j['id'],'component':k,'slot':row*j['cols']+col,'bounds':[int(x),int(y),int(w),int(h)]})
(root/'spills-dopuna11.json').write_text(json.dumps(report,indent=2));print(json.dumps(report))
