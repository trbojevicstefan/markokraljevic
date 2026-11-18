"""Read-only D69 validation."""
from pathlib import Path
import json, numpy as np
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]/'animation-pack-04'
SPECS={'kopljanik-basa-juris':(8,True),'kopljanik-basa-zaglavljen':(6,True),'kopljanik-basa-pcele':(6,True),'kopljanik-basa-poziv':(6,False),'kopljanik-basa-omamljen':(6,True),'fx-pcele':(6,True)}
for name,(n,loop) in SPECS.items():
    out=ROOT/'assets'/name; m=json.loads((out/'manifest.json').read_text()); qa=json.loads((out/'qa.json').read_text()); assert qa['identityApproved'] and qa['atlasMatchesFrames'] and m['description'].isascii(); row=m['animation']['rows']['motion']; assert row['frames']==n and row['loop']==loop
    atlas=Image.open(out/'atlas.png').convert('RGBA'); assert atlas.size==(512*n,512); gif=Image.open(out/'preview.gif'); assert gif.n_frames==n and gif.info.get('loop')==0
    for i in range(n):
        p=Image.open(out/f'frames/motion/frame-{i}.png').convert('RGBA'); assert p.size==(512,512) and atlas.crop((512*i,0,512*(i+1),512)).tobytes()==p.tobytes(); bb=p.getbbox(); assert min(bb[0],bb[1],512-bb[2],512-bb[3])>=24; a=np.array(p).astype(float); mask=a[:,:,3]>0; assert a[:,:,3].min()==0 and a[:,:,3].max()==255; assert not ((a[:,:,1]>120)&(a[:,:,1]>a[:,:,0]*1.35+20)&(a[:,:,1]>a[:,:,2]*1.35+20)&mask).any()
    print('PASS',name,n,'frames; measured heights',qa['measuredHeights'])
