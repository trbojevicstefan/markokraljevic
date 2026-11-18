"""Read-only D80 validation."""
from pathlib import Path
import json, numpy as np
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]/'animation-pack-04'
SPECS={'bilje-miroc':(5,False),'srna-pase':(6,True),'srna-bezi':(8,True)}
for name,(n,loop) in SPECS.items():
    out=ROOT/'assets'/name; m=json.loads((out/'manifest.json').read_text()); q=json.loads((out/'qa.json').read_text())
    assert m['animation']['rows']['motion']['frames']==n and m['animation']['rows']['motion']['loop']==loop
    atlas=Image.open(out/'atlas.png').convert('RGBA'); assert atlas.size==(512*n,512)
    gif=Image.open(out/'preview.gif'); assert gif.n_frames==n and gif.info.get('loop')==0
    for i in range(n):
        p=Image.open(out/f'frames/motion/frame-{i}.png').convert('RGBA'); assert p.size==(512,512)
        assert atlas.crop((512*i,0,512*(i+1),512)).tobytes()==p.tobytes()
        bb=p.getbbox(); assert bb and min(bb[0],bb[1],512-bb[2],512-bb[3])>=24
        # The baseline is y=488; bbox uses an exclusive lower edge, so the last opaque pixel is y=487.
        assert bb[3]==488 and q['frames'][i]['height']==bb[3]-bb[1]
        a=np.array(p); mask=a[:,:,3]>8; mag=(a[:,:,0]>240)&(a[:,:,2]>240)&(a[:,:,1]<20)&mask; assert not mag.any()
    print('PASS',name,'measured heights',q['measuredHeights'])
