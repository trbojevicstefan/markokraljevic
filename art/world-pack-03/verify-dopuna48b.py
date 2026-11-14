"""Read-only validation of D48 delivery."""
from pathlib import Path
import json
import numpy as np
from PIL import Image

root=Path(__file__).resolve().parents[1]/'animation-pack-04'
from importlib.machinery import SourceFileLoader
config=SourceFileLoader('d48b',str(Path(__file__).with_name('export-dopuna48b.py'))).load_module()
names=[name for name in config.NAMES if (root/'assets'/name).exists()]
for name in names:
    out=root/'assets'/name
    m=json.loads((out/'manifest.json').read_text(encoding='utf8'))
    qa=json.loads((out/'qa.json').read_text(encoding='utf8'))
    n=config.COUNTS[name]
    atlas=Image.open(out/'atlas.png').convert('RGBA')
    assert atlas.size==(512*n,512)
    assert Image.open(out/'preview.gif').n_frames==n
    assert m['animation']['rows']['motion']['frames']==n
    assert m['animation']['rows']['motion']['loop']==(name in config.LOOPS)
    assert m['holdLastFrame']==(name in config.HOLDS)
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
        expected=488
        if name=='milos-jump': expected=[488,448,408,378,438,488][i]
        if name=='milos-run': expected=[488,488,488,472,488,488,488,472][i]
        assert abs(bb[3]-1-expected)<=6
        assert qa['frames'][i]['bbox']==list(bb)
        assert not qa['frames'][i]['touchesEdge']
    assert qa['identityApproved']
    print(f'PASS {name}: {n} frames, alpha, margins, green, baseline, atlas, GIF, manifest, JSON and comparison')
for name in config.NAMES:
    attempts = sorted((root/'sources'/name).glob('attempt-*'))
    assert 1 <= len(attempts) <= 3, (name, 'attempt count')
    assert all((a/'prompt.txt').is_file() for a in attempts)
    if name not in names:
        assert not (root/'assets'/name).exists()
        print('NOT EXPORTED', name, '- retained attempts:',len(attempts))
print('D48B exported clips:',len(names))
