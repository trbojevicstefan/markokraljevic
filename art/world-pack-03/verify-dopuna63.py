"""Read-only D63 validation."""
from pathlib import Path
import json
import numpy as np
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]/'animation-pack-04'; NAMES=['marko-hod-bez-topuza','marko-stoji-bez-topuza']; COUNTS={'marko-hod-bez-topuza':8,'marko-stoji-bez-topuza':6}
def read(p):
    raw=p.read_bytes(); assert not raw.startswith(b'\xef\xbb\xbf'); return json.loads(raw)
for name,n in COUNTS.items():
    attempts=list((ROOT/'sources'/name).glob('attempt-*')); assert 1<=len(attempts)<=3
    for d in attempts: assert (d/'prompt.txt').is_file() and (d/'review.json').is_file()
    out=ROOT/'assets'/name; assert out.exists(); m=read(out/'manifest.json'); qa=read(out/'qa.json'); assert qa['identityApproved'] and qa['atlasMatchesFrames']
    assert (out/'identity-size-comparison.png').is_file(); assert m['description'].isascii() and m['holdLastFrame'] is False
    row=m['animation']['rows']['motion']; assert row['frames']==n and row['loop'] is True and row['holdLastFrame'] is False
    atlas=Image.open(out/'atlas.png').convert('RGBA'); assert atlas.size==(512*n,512); gif=Image.open(out/'preview.gif'); assert gif.n_frames==n and gif.info.get('loop')==0
    for p in out.glob('*.json'): read(p)
    for i in range(n):
        p=Image.open(out/f'frames/motion/frame-{i}.png').convert('RGBA'); assert p.size==(512,512); assert atlas.crop((512*i,0,512*(i+1),512)).tobytes()==p.tobytes(); assert m['frame_layout']['rows']['motion'][i]==dict(x=512*i,y=0,w=512,h=512)
        bb=p.getbbox(); assert min(bb[0],bb[1],512-bb[2],512-bb[3])>=24 and abs(bb[3]-1-488)<=6; a=np.array(p).astype(float); mask=a[:,:,3]>0; assert a[:,:,3].min()==0 and a[:,:,3].max()==255; assert not ((a[:,:,1]>120)&(a[:,:,1]>a[:,:,0]*1.35+20)&(a[:,:,1]>a[:,:,2]*1.35+20)&mask).any(); assert list(bb)==qa['frames'][i]['bbox'] and not qa['frames'][i]['touchesEdge']
    print('PASS',name,n,'frames: alpha, scale/margins, baseline, green, atlas, GIF, layout, loop, JSON')
