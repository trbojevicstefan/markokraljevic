"""Read-only verification confined to D54 clips and their source attempts."""
from pathlib import Path
import json
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT=Path(__file__).resolve().parents[1]/'animation-pack-04'
COUNTS=dict(zip(['milos-niz-2','milos-niz-3','milos-tezak','milos-vazduh','milos-blok','milos-cuci','milos-kotrlja','milos-penje','milos-pije','milos-smrt'],[6,6,6,5,6,6,6,8,6,6]))
HOLD={'milos-blok','milos-cuci','milos-smrt'}
def read(p):
    raw=p.read_bytes();assert not raw.startswith(bytes([239,187,191])),p;return json.loads(raw)
exported=frames=external=0
for name,n in COUNTS.items():
    attempts=sorted((ROOT/'sources'/name).glob('attempt-*'));assert 1<=len(attempts)<=3
    for d in attempts:
        assert (d/'prompt.txt').is_file() and (d/'grid.png').is_file()
        review=read(d/'review.json');assert isinstance(review['approved'],bool)
    out=ROOT/'assets'/name
    if not out.exists():
        assert len(attempts)==3 and all(not read(d/'review.json')['approved'] for d in attempts)
        assert any((d/'identity-size-comparison.png').is_file() for d in attempts)
        print('NOT EXPORTED',name,'3 rejected attempts');continue
    m=read(out/'manifest.json');q=read(out/'qa.json');row=m['animation']['rows']['motion'];loop=name=='milos-penje'
    if q.get('acceptedBy'):
        assert all(not read(d/'review.json')['approved'] for d in attempts)
        missing=[fn for fn in ['identity-size-comparison.png','reference.png'] if not (out/fn).is_file()]
        print('EXTERNAL EXPORT',name,'acceptedBy:',q['acceptedBy'],'; D54 source reviews remain rejected; missing files:',missing)
        external+=1;continue
    assert q['identityApproved'] and q['motionApproved'] and q['atlasMatchesFrames']
    assert any(read(d/'review.json')['approved'] for d in attempts)
    assert m['description'].isascii() and m['holdLastFrame']==(name in HOLD)
    assert row['frames']==n and row['loop']==loop and row['holdLastFrame']==(name in HOLD)
    assert row['durations_ms']==[100]*n and row['fps']==10
    assert m['cell']['width']==m['cell']['height']==512
    assert Image.open(out/'identity-size-comparison.png').size==(1024,512)
    atlas=Image.open(out/'atlas.png').convert('RGBA');assert atlas.size==(n*512,512)
    gif=Image.open(out/'preview.gif');assert gif.n_frames==n
    assert (gif.info.get('loop')==0) if loop else ('loop' not in gif.info)
    assert len(q['frames'])==n
    for p in out.glob('*.json'):read(p)
    for i in range(n):
        im=Image.open(out/f'frames/motion/frame-{i}.png').convert('RGBA');assert im.size==(512,512)
        assert atlas.crop((512*i,0,512*(i+1),512)).tobytes()==im.tobytes()
        assert m['frame_layout']['rows']['motion'][i]==dict(x=512*i,y=0,w=512,h=512)
        bb=im.getbbox();assert list(bb)==q['frames'][i]['bbox']
        assert min(bb[0],bb[1],512-bb[2],512-bb[3])>=24
        assert abs(bb[3]-1-(418 if name=='milos-vazduh' else 488))<=6
        ar=np.array(im).astype(float);mask=ar[:,:,3]>0
        assert ar[:,:,3].min()==0 and ar[:,:,3].max()==255
        assert not ((ar[:,:,1]>100)&(ar[:,:,1]>ar[:,:,0]*1.25+10)&(ar[:,:,1]>ar[:,:,2]*1.25+10)&mask).any()
        assert not (mask[0].any() or mask[-1].any() or mask[:,0].any() or mask[:,-1].any())
        _,components=ndimage.label(ar[:,:,3]>32);assert components==1 and q['frames'][i]['components']==1
    if name!='milos-vazduh':
        bb=Image.open(out/'frames/motion/frame-0.png').getbbox();assert 361<=bb[3]-bb[1]<=399
    if name=='milos-cuci':
        tops=[Image.open(out/f'frames/motion/frame-{i}.png').getbbox()[1] for i in (3,4,5)]
        assert all(228<=y<=254 for y in tops)
    exported+=1;frames+=n;print('PASS',name,n,'frames; alpha, components, green, margins, support, layout, atlas, GIF, loop/hold, JSON, review')
print('TOTAL VERIFIED',exported,'clips',frames,'frames;',external,'external exports not certified;',len(COUNTS)-exported-external,'not exported')
