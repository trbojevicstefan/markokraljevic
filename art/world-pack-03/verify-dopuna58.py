"""Read-only D58 validation; export rules inherited from D48/D50."""
from pathlib import Path
import json
import numpy as np
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]/'animation-pack-04'
COUNTS={n:6 for n in ['vrac-stap','vrac-smrt','vukasin-stoji','kosovka-poji','djemo-omamljen','milos-pada-s-konja']}
def read(p):
    raw=p.read_bytes(); assert not raw.startswith(b'\xef\xbb\xbf'); return json.loads(raw)
for name,n in COUNTS.items():
    attempts=list((ROOT/'sources'/name).glob('attempt-*')); assert 1<=len(attempts)<=3
    for d in attempts: assert (d/'prompt.txt').is_file() and (d/'review.json').is_file()
    out=ROOT/'assets'/name
    if not out.exists():
        assert all(not read(d/'review.json')['approved'] for d in attempts)
        print('NOT EXPORTED',name,len(attempts),'reviewed attempts');continue
    m=read(out/'manifest.json');qa=read(out/'qa.json');loop=name in ['vukasin-stoji','kosovka-poji','djemo-omamljen'];hold=name in ['vrac-smrt','milos-pada-s-konja']
    assert qa['identityApproved'] and qa['atlasMatchesFrames']
    assert (out/'identity-size-comparison.png').is_file()
    assert m['description'].isascii() and m['holdLastFrame']==hold
    row=m['animation']['rows']['motion']; assert row['frames']==n and row['loop']==loop and row['holdLastFrame']==hold
    atlas=Image.open(out/'atlas.png').convert('RGBA'); assert atlas.size==(512*n,512)
    gif=Image.open(out/'preview.gif');assert gif.n_frames==n
    assert (gif.info.get('loop')==0) if loop else ('loop' not in gif.info)
    for p in out.glob('*.json'):read(p)
    for i in range(n):
        p=Image.open(out/f'frames/motion/frame-{i}.png').convert('RGBA');assert p.size==(512,512)
        assert atlas.crop((512*i,0,512*(i+1),512)).tobytes()==p.tobytes()
        assert m['frame_layout']['rows']['motion'][i]==dict(x=512*i,y=0,w=512,h=512)
        bb=p.getbbox();assert min(bb[0],bb[1],512-bb[2],512-bb[3])>=24
        assert abs(bb[3]-1-488)<=6
        a=np.array(p).astype(float);mask=a[:,:,3]>0
        assert a[:,:,3].min()==0 and a[:,:,3].max()==255
        assert not ((a[:,:,1]>120)&(a[:,:,1]>a[:,:,0]*1.35+20)&(a[:,:,1]>a[:,:,2]*1.35+20)&mask).any()
        assert list(bb)==qa['frames'][i]['bbox'] and not qa['frames'][i]['touchesEdge']
        assert 'components' in qa['frames'][i]
    print('PASS',name,n,'frames: alpha, scale/margins, baseline, green, atlas, GIF, layout, loop/hold, JSON, visual approval')
