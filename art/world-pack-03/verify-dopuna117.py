from pathlib import Path
import json
import numpy as np
from PIL import Image
root=Path(__file__).resolve().parents[1]/'animation-pack-04'/'assets'
spec={'delija-idle':(6,True),'delija-run':(6,True),'delija-attack':(6,False),'delija-hurt':(4,False),'delija-death':(6,False),'delija-bezi':(6,True),'marko-pusta-sokola':(8,False),'utva-plovi':(6,True),'soko-vezirov-sedi':(4,True)}
for name,(n,loop) in spec.items():
 d=root/name; m=json.loads((d/'manifest.json').read_text(encoding='utf-8-sig')); q=json.loads((d/'qa.json').read_text(encoding='utf-8-sig')); atlas=Image.open(d/'atlas.png').convert('RGBA'); gif=Image.open(d/'preview.gif')
 assert atlas.size==(512*n,512) and gif.n_frames==n and m['animation']['rows']['motion']['loop']==loop
 issues=[]
 for i in range(n):
  p=Image.open(d/f'frames/motion/frame-{i}.png').convert('RGBA'); assert p.size==(512,512) and atlas.crop((512*i,0,512*(i+1),512)).tobytes()==p.tobytes()
  b=p.getbbox(); a=np.asarray(p).astype(int); r,g,bl=[a[:,:,j] for j in range(3)]; opaque=a[:,:,3]>0
  spill=((r>180)&(bl>180)&(r>g*1.5+25)&(bl>g*1.5+25)) if name=='utva-plovi' else ((g>180)&(g>r*1.7+25)&(g>bl*1.7+25))
  count=int((spill&opaque).sum()); margin=8 if name in ('delija-run','delija-hurt','delija-bezi') else 24
  if b[0]<margin or b[1]<margin or b[2]>512-margin or (name!='soko-vezirov-sedi' and b[3]-1 not in range(486,491)) or count: issues.append((i,b,count))
 print(name,'heights=',q['measuredHeights'],'key/margin issues=',issues)
