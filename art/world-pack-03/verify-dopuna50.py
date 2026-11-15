"""Read-only D50 verification, following D48 frame/export checks."""
from pathlib import Path
import json
import numpy as np
from PIL import Image

ROOT=Path(__file__).resolve().parents[2]
ANIM=ROOT/'art/animation-pack-04'
REF=ROOT/'art/world-pack-03/uzori-d50'

def read(p):
    raw=p.read_bytes();assert not raw.startswith(b'\xef\xbb\xbf');return json.loads(raw)

out=ANIM/'assets/vukasin-udara';m=read(out/'manifest.json');qa=read(out/'qa.json')
atlas=Image.open(out/'atlas.png').convert('RGBA');assert atlas.size==(3072,512)
gif=Image.open(out/'preview.gif');assert gif.n_frames==6 and 'loop' not in gif.info
assert m['holdLastFrame'] and not m['animation']['rows']['motion']['loop']
assert m['animation']['rows']['motion']['frames']==6
assert m['description'].isascii() and qa['identityApproved'] and qa['atlasMatchesFrames']
assert (out/'identity-size-comparison.png').is_file()
for i in range(6):
    p=Image.open(out/f'frames/motion/frame-{i}.png').convert('RGBA');assert p.size==(512,512)
    assert atlas.crop((512*i,0,512*(i+1),512)).tobytes()==p.tobytes()
    assert m['frame_layout']['rows']['motion'][i]==dict(x=512*i,y=0,w=512,h=512)
    bb=p.getbbox();assert min(bb[0],bb[1],512-bb[2],512-bb[3])>=24
    assert abs(bb[3]-1-488)<=6
    a=np.array(p).astype(float);mask=a[:,:,3]>0
    assert not ((a[:,:,1]>120)&(a[:,:,1]>a[:,:,0]*1.35+20)&(a[:,:,1]>a[:,:,2]*1.35+20)&mask).any()
    assert qa['frames'][i]['bbox']==list(bb) and not qa['frames'][i]['touchesEdge']
    assert 'components' in qa['frames'][i]
print('PASS vukasin-udara: 6 frames, identity approval, 512 cells, margins, alpha, green, baseline, atlas, GIF, layout, loop/hold, JSON')
assert not (ANIM/'assets/vukasin-trci').exists()
for i in range(1,4):
    run=ANIM/f'sources/vukasin-trci/attempt-{i}'
    assert not read(run/'review.json')['approved']
    assert len(read(run/'qa.json')['frames'])==8
    assert (run/'identity-size-comparison.png').is_file() and (run/'prompt.txt').is_file()
assert len(list((ANIM/'sources/vukasin-trci').glob('attempt-*')))==3
print('PASS vukasin-trci: 3 rejected attempts retained; no export')
for name,attempt,size in [('prop-crkva-samodreza',1,(1024,1024)),('bilje-miroc',2,(1280,256))]:
    run=REF/name/f'attempt-{attempt}';q=read(run/'qa.json');assert q['visualApproved'] and read(run/'review.json')['approved']
    p=Image.open(REF/f'{name}.png').convert('RGBA');w=Image.open(ROOT/f'dist/assets/world/{name}.webp').convert('RGBA')
    assert p.size==size==w.size
    a=np.array(p);assert a[:,:,3].min()==0 and a[:,:,3].max()==255
    assert np.array_equal(a[:,:,3],np.array(w)[:,:,3])
    mask=a[:,:,3]>0;assert not(mask[0].any() or mask[-1].any() or mask[:,0].any() or mask[:,-1].any())
    assert list(p.getbbox())==q['bbox']
    if name=='prop-crkva-samodreza':
        bb=p.getbbox();assert bb[3]-1==1000 and 0.84<=(bb[3]-bb[1])/1024<=0.86
    else:
        for i in range(5):
            bb=p.crop((256*i,0,256*(i+1),256)).getbbox();assert bb[3]-1==247
            assert bb[0]>=16 and bb[2]<=240 and bb[1]>=16
            assert list(bb)==q['fields'][i]
    print(f'PASS {name}: size, alpha, WebP alpha equality, bounds, visual approval and positioning')
print('PASS D50: all delivered assets verified; rejected run remains sources only')
