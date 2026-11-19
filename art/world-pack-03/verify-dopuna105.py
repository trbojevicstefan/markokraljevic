from pathlib import Path
import json
import numpy as np
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]/'animation-pack-04/assets'
S={'velimir-idle':(6,True,24),'velimir-run':(6,True,8),'velimir-attack':(6,False,24),'velimir-hurt':(4,False,8),'velimir-death':(6,False,24),'velimir-jase':(8,True,24),'velimir-svezan':(4,True,24)}
for name,(n,loop,margin) in S.items():
 out=ROOT/name; m=json.loads((out/'manifest.json').read_text(encoding='utf-8')); qa=json.loads((out/'qa.json').read_text(encoding='utf-8')); atlas=Image.open(out/'atlas.png').convert('RGBA'); gif=Image.open(out/'preview.gif'); assert atlas.size==(512*n,512) and gif.n_frames==n and m['animation']['rows']['motion']['loop']==loop
 for i in range(n):
  p=Image.open(out/f'frames/motion/frame-{i}.png').convert('RGBA'); assert p.size==(512,512) and p.tobytes()==atlas.crop((i*512,0,(i+1)*512,512)).tobytes(); b=p.getbbox(); assert b and min(b[0],b[1],512-b[2])>=margin and 512-b[3]>=23 and abs((b[3]-1)-488)<=2; a=np.asarray(p).astype(float); green=(a[:,:,1]>120)&(a[:,:,1]>a[:,:,0]*1.35+20)&(a[:,:,1]>a[:,:,2]*1.35+20)&(a[:,:,3]>0); assert not green.any(),(name,i,int(green.sum()))
 print('PASS',name,'k=',qa['scale'],'sizes=',[(f['width'],f['height']) for f in qa['frames']])

