from pathlib import Path
import json
import numpy as np
from PIL import Image
root=Path(__file__).resolve().parents[1]/'animation-pack-04/assets'
spec={'velimirovica-idle':(6,360,True),'velimirovica-bezi':(6,360,True),'toplica-idle':(6,350,True),'kosancic-idle':(6,385,True),'knjigonosa-idle':(6,370,True),'knjigonosa-poklon':(8,370,False)}
for name,(n,target,loop) in spec.items():
 p=root/name; m=json.loads((p/'manifest.json').read_text(encoding='utf-8')); q=json.loads((p/'qa.json').read_text(encoding='utf-8')); atlas=Image.open(p/'atlas.png').convert('RGBA'); gif=Image.open(p/'preview.gif'); assert atlas.size==(512*n,512) and gif.n_frames==n; assert m['animation']['rows']['motion']['loop']==loop; assert abs(q['frames'][0]['height']-target)<=target*.05; areas=[]
 for i in range(n):
  c=Image.open(p/f'frames/motion/frame-{i}.png').convert('RGBA'); assert c.size==(512,512) and c.tobytes()==atlas.crop((i*512,0,(i+1)*512,512)).tobytes(); a=np.array(c); bb=c.getbbox(); assert bb and min(bb[0],bb[1],512-bb[2],512-bb[3])>=24 and bb[3]==488; areas.append(int((a[:,:,3]>0).sum())); assert not (((a[:,:,1].astype(float)>120)&(a[:,:,1]>a[:,:,0].astype(float)*1.35+20)&(a[:,:,1]>a[:,:,2].astype(float)*1.35+20))&(a[:,:,3]>0)).any()
 assert max(areas)<=areas[0]*1.15; print(name, 'PASS', 'height',q['frames'][0]['height'],'max area ratio',round(max(areas)/areas[0],3))
