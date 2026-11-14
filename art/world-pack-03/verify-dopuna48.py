"""Read-only validation of D48 delivery."""
from pathlib import Path
import json
import numpy as np
from PIL import Image

root=Path(__file__).resolve().parents[1]/'animation-pack-04'
names=['milos-idle','vila-strela','vila-pada','vila-bere','marko-dremlje']
for name in names:
    out=root/'assets'/name
    m=json.loads((out/'manifest.json').read_text(encoding='utf8'))
    qa=json.loads((out/'qa.json').read_text(encoding='utf8'))
    n=6 if name=='vila-pada' else 8
    atlas=Image.open(out/'atlas.png').convert('RGBA')
    assert atlas.size==(512*n,512)
    assert Image.open(out/'preview.gif').n_frames==n
    assert m['animation']['rows']['motion']['frames']==n
    assert m['animation']['rows']['motion']['loop']==(name not in ['vila-strela','vila-pada'])
    assert m['holdLastFrame']==(name=='vila-pada')
    assert len(m['frame_layout']['rows']['motion'])==n
    assert (out/'identity-size-comparison.png').is_file()
    for file in out.glob('*.json'):
        raw=file.read_bytes(); assert not raw.startswith(b'\xef\xbb\xbf')
        json.loads(raw)
    assert m['description'].isascii()
    for i in range(n):
        p=Image.open(out/f'frames/motion/frame-{i}.png').convert('RGBA')
        assert p.size==(512,512)
        assert atlas.crop((512*i,0,512*(i+1),512)).tobytes()==p.tobytes()
        bb=p.getbbox(); assert min(bb[0],bb[1],512-bb[2],512-bb[3])>=24
        ar=np.array(p).astype(float)
        green=(ar[:,:,3]>0)&(ar[:,:,1]>120)&(ar[:,:,1]>ar[:,:,0]*1.35+20)&(ar[:,:,1]>ar[:,:,2]*1.35+20)
        assert not green.any()
        if name!='vila-pada' or i==5: assert abs(bb[3]-1-488)<=6
        assert qa['frames'][i]['bbox']==list(bb)
        assert not qa['frames'][i]['touchesEdge']
    assert qa['identityApproved']
    print(f'PASS {name}: {n} frames, alpha, margins, green, baseline, atlas, GIF, manifest, JSON and comparison')
assert not (root/'assets/marko-bije-vilu').exists()
print('PASS marko-bije-vilu: rejected staging only, no export')
