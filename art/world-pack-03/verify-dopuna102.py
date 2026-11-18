"""Read-only D76 validation."""
from pathlib import Path
import json,numpy as np
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]/'animation-pack-04'
SPECS={'posmatrac-seljanka':(6,True),'posmatrac-decak':(6,True),'posmatrac-starica':(6,True),'posmatrac-ribar':(6,True),'posmatrac-gradjanin':(6,True),'katana-gard':(4,True),'katana-gard-slomljen':(6,False)}
for name,(n,loop) in SPECS.items():
 out=ROOT/'assets'/name; m=json.loads((out/'manifest.json').read_text()); qa=json.loads((out/'qa.json').read_text()); assert qa['identityApproved'] and qa['atlasMatchesFrames'] and m['description'].isascii(); row=m['animation']['rows']['motion']; assert row['frames']==n and row['loop']==loop
 atlas=Image.open(out/'atlas.png').convert('RGBA'); assert atlas.size==(512*n,512); gif=Image.open(out/'preview.gif'); assert gif.n_frames==n and (gif.info.get('loop')==0 if loop else 'loop' not in gif.info)
 for i in range(n):
  p=Image.open(out/f'frames/motion/frame-{i}.png').convert('RGBA'); assert p.size==(512,512) and atlas.crop((512*i,0,512*(i+1),512)).tobytes()==p.tobytes(); bb=p.getbbox(); assert min(bb[0],bb[1],512-bb[2],512-bb[3])>=24; a=np.array(p).astype(float); mask=a[:,:,3]>0; assert a[:,:,3].min()==0 and a[:,:,3].max()==255; assert not ((a[:,:,1]>200)&(a[:,:,0]<30)&(a[:,:,2]<30)&mask).any()
 print('PASS',name,n,'frames; measured heights',qa['measuredHeights'])
