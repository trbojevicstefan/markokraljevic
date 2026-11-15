"""Read-only verification of D57 exports; follows verify-dopuna51.py."""
from pathlib import Path
import json
import numpy as np
from PIL import Image

PACK=Path(__file__).resolve().parents[1]/'animation-pack-04'
COUNTS={'sarac-pije':6,'sarac-lupa':6,'sarac-propinje':6,'sarac-boli':4,'sarac-pada':6,'sarac-hod':6}
def read(p):
    raw=p.read_bytes();assert not raw.startswith(b'\xef\xbb\xbf'),p
    return json.loads(raw)
for clip,n in COUNTS.items():
    attempts=sorted((PACK/'sources'/clip).glob('attempt-*')); assert 1<=len(attempts)<=3
    for d in attempts:
        assert (d/'prompt.txt').is_file() and (d/'grid.png').is_file()
        assert (d/'identity-size-comparison.png').is_file()
        read(d/'review.json')
    out=PACK/'assets'/clip
    if not out.exists():
        assert all(not read(d/'review.json')['approved'] for d in attempts)
        print('NOT EXPORTED',clip,len(attempts));continue
    m=read(out/'manifest.json');qa=read(out/'qa.json');assert qa['identityApproved'] and qa['atlasMatchesFrames']
    assert qa['review']['approved'] and (out/'identity-size-comparison.png').is_file()
    loop=clip in ['sarac-pije','sarac-lupa','sarac-hod'];hold=clip=='sarac-pada'
    row=m['animation']['rows']['motion']
    assert row['frames']==n and row['loop']==loop and row['holdLastFrame']==hold
    assert m['holdLastFrame']==hold and m['description'].isascii()
    atlas=Image.open(out/'atlas.png').convert('RGBA');assert atlas.size==(512*n,512)
    gif=Image.open(out/'preview.gif');assert gif.n_frames==n
    assert (gif.info.get('loop')==0) if loop else ('loop' not in gif.info)
    for p in out.glob('*.json'):read(p)
    for i in range(n):
        f=Image.open(out/f'frames/motion/frame-{i}.png').convert('RGBA');assert f.size==(512,512)
        assert atlas.crop((512*i,0,512*(i+1),512)).tobytes()==f.tobytes()
        assert m['frame_layout']['rows']['motion'][i]==dict(x=512*i,y=0,w=512,h=512)
        b=f.getbbox();assert b[0]>0 and b[1]>0 and b[2]<512 and b[3]<512
        if clip!='sarac-propinje':assert min(b[0],b[1],512-b[2])>=24
        assert b[3]-1==488
        a=np.array(f).astype(float);mask=a[:,:,3]>0
        assert a[:,:,3].min()==0 and a[:,:,3].max()==255
        assert not ((a[:,:,1]>120)&(a[:,:,1]>a[:,:,0]*1.35+20)&(a[:,:,1]>a[:,:,2]*1.35+20)&mask).any()
        assert list(b)==qa['frames'][i]['bbox'] and not qa['frames'][i]['touchesEdge']
        assert qa['frames'][i]['greenPixels']==0 and 'components' in qa['frames'][i]
    print('PASS',clip,n,'frames',len(attempts),'attempts; alpha/green/edges/baseline/atlas/GIF/layout/JSON/review')
