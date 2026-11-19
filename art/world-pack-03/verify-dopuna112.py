from pathlib import Path
import json
import numpy as np
from PIL import Image
root=Path(__file__).resolve().parents[1]/'animation-pack-04'/'assets'
spec={'tabor-kuvar':True,'tabor-bubnjar':True,'tabor-dervis':True,'mustafagina-majka':True}
for name,loop in spec.items():
 d=root/name; m=json.loads((d/'manifest.json').read_text(encoding='utf-8')); q=json.loads((d/'qa.json').read_text(encoding='utf-8')); atlas=Image.open(d/'atlas.png').convert('RGBA'); gif=Image.open(d/'preview.gif'); assert atlas.size==(3072,512) and gif.n_frames==6 and m['animation']['rows']['motion']['loop']==loop
 for i in range(6):
  p=Image.open(d/f'frames/motion/frame-{i}.png').convert('RGBA'); assert p.size==(512,512) and atlas.crop((i*512,0,(i+1)*512,512)).tobytes()==p.tobytes(); b=p.getbbox(); assert b and b[0]>=24 and b[1]>=24 and b[2]<=488 and 486<=b[3]-1<=490
  a=np.array(p).astype(int); mask=a[:,:,3]>0; green=(a[:,:,1]>180)&(a[:,:,1]>a[:,:,0]*1.7+25)&(a[:,:,1]>a[:,:,2]*1.7+25)&mask
  print(name,i,'height',b[3]-b[1],'green',int(green.sum()))
 print('PASS',name)
