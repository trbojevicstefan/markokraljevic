from pathlib import Path
import json
import numpy as np
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]/'animation-pack-04'
SPECS={'katana-idle':(6,True),'katana-run':(6,True),'katana-attack':(6,False),'katana-lunge':(6,False),'katana-hurt':(4,False),'katana-death':(6,False),'katana-jump':(6,False),'katana-omamljen':(6,True)}
for name,(n,loop) in SPECS.items():
 out=ROOT/'assets'/name
 m=json.loads((out/'manifest.json').read_text(encoding='utf-8')); q=json.loads((out/'qa.json').read_text(encoding='utf-8')); row=m['animation']['rows']['motion']; assert row['frames']==n and row['loop']==loop and q['identityApproved'] and q['motionApproved']; atlas=Image.open(out/'atlas.png').convert('RGBA'); assert atlas.size==(512*n,512); gif=Image.open(out/'preview.gif'); assert gif.n_frames==n
 for i,f in enumerate(q['frames']):
  p=Image.open(out/f'frames/motion/frame-{i}.png').convert('RGBA'); assert p.size==(512,512) and atlas.crop((i*512,0,(i+1)*512,512)).tobytes()==p.tobytes(); bb=p.getbbox(); assert bb and min(bb[0],bb[1],512-bb[2],512-bb[3])>=24; assert f['areaRatio']<=1.15; assert np.array(p)[:,:,3].min()==0
 print(name, 'PASS',n,'frames; heights',*[f['height'] for f in q['frames']])
