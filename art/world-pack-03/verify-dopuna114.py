from pathlib import Path
import json
from PIL import Image
import numpy as np
root=Path(__file__).resolve().parents[1]/'animation-pack-04'/'assets'
for name,n,loop in [('kadune-kolo',8,True),('hodza-odbija',6,True),('hodza-pije',6,True),('hadzija-odbija',6,True),('hadzija-pije',6,True),('marko-igra-kolo',8,True),('marko-udara-kupom',8,False)]:
 d=root/name; m=json.loads((d/'manifest.json').read_text(encoding='utf-8')); a=Image.open(d/'atlas.png').convert('RGBA'); g=Image.open(d/'preview.gif'); assert a.size==(512*n,512) and g.n_frames==n and m['animation']['rows']['motion']['loop']==loop
 for i in range(n):
  p=Image.open(d/f'frames/motion/frame-{i}.png').convert('RGBA'); assert p.size==(512,512) and a.crop((512*i,0,512*(i+1),512)).tobytes()==p.tobytes(); b=p.getbbox(); assert b and b[0]>=24 and b[1]>=24 and b[2]<=488 and 486<=b[3]-1<=490
  x=np.asarray(p).astype(int); mask=x[:,:,3]>32; green=(x[:,:,1]>200)&(x[:,:,1]>x[:,:,0]*1.8+25)&(x[:,:,1]>x[:,:,2]*1.8+25)&mask
  print(name,i,'height',b[3]-b[1],'key-green',int(green.sum()))
 print('STRUCTURE PASS',name)
