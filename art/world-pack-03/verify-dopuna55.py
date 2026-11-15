"""Read-only D55 deliverable verification, scoped to the requested 25 clips."""
import importlib.util,json,sys
sys.dont_write_bytecode=True
import numpy as np
from PIL import Image
from pathlib import Path
spec=importlib.util.spec_from_file_location('d55',Path(__file__).with_name('d55-work.py'))
d55=importlib.util.module_from_spec(spec);spec.loader.exec_module(d55)
total=attempts=exported=0
def read(p):
    raw=p.read_bytes();assert not raw.startswith(b'\xef\xbb\xbf'),p
    return json.loads(raw)
for name in d55.NAMES:
    who,act,n,loop,hold=d55.settings(name);out=d55.PACK/'assets'/name
    tries=sorted((d55.PACK/'sources'/name).glob('attempt-*'));assert 1<=len(tries)<=3
    attempts+=len(tries)
    for t in tries:
        assert (t/'prompt.txt').is_file(),t
        review=read(t/'review.json')
        if review['approved']:assert (t/'grid.png').is_file()
    if not out.exists():
        assert len(tries)==3 and all(not read(t/'review.json')['approved'] for t in tries)
        print('NOT EXPORTED',name,'3 attempts, no approved image');continue
    exported+=1;total+=n
    m=read(out/'manifest.json');qa=read(out/'qa.json');row=m['animation']['rows']['motion']
    assert m['description'].isascii() and m['holdLastFrame']==hold
    assert row['frames']==n and row['loop']==loop and row['holdLastFrame']==hold
    fps,durations=d55.timing(name);assert row['fps']==fps and row['durations_ms']==durations
    assert qa['identityApproved'] and qa['weaponApproved'] and qa['motionApproved'] and qa['atlasMatchesFrames']
    assert Image.open(out/'identity-size-comparison.png').size==(1024,512)
    atlas=Image.open(out/'atlas.png').convert('RGBA');assert atlas.size==(512*n,512)
    gif=Image.open(out/'preview.gif');assert gif.n_frames==n
    assert (gif.info.get('loop')==0) if loop else ('loop' not in gif.info)
    gifduration=0
    for i in range(n):gif.seek(i);gifduration+=gif.info['duration']
    assert abs(gifduration-sum(durations))<=5
    hashes=[]
    for i in range(n):
        p=Image.open(out/f'frames/motion/frame-{i}.png').convert('RGBA');assert p.size==(512,512)
        assert atlas.crop((512*i,0,512*(i+1),512)).tobytes()==p.tobytes()
        assert m['frame_layout']['rows']['motion'][i]==dict(x=512*i,y=0,w=512,h=512)
        bb=p.getbbox();assert min(bb[0],bb[1],512-bb[2],512-bb[3])>=24,(name,i,bb)
        if act=='jump' and i in (1,2,3,4):assert bb[3]-1<482
        elif name=='pas-drugi' and i in (2,3):assert bb[3]-1<482
        else:assert abs(bb[3]-1-488)<=6
        a=np.array(p).astype(float);mask=a[:,:,3]>0
        assert a[:,:,3].min()==0 and a[:,:,3].max()==255
        assert not ((a[:,:,1]>120)&(a[:,:,1]>a[:,:,0]*1.35+20)&(a[:,:,1]>a[:,:,2]*1.35+20)&mask).any()
        assert list(bb)==qa['frames'][i]['bbox'] and not qa['frames'][i]['touchesEdge']
        assert 'components' in qa['frames'][i]
        hashes.append(p.tobytes())
    assert len(set(hashes))==n,(name,'duplicated frame')
    for p in out.glob('*.json'):read(p)
    print('PASS',name,n,'frames',fps,'FPS')
print('TOTAL',exported,'exported clips',total,'frames',attempts,'attempts; one clip rejected after cap')
