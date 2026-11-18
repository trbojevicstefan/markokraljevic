"""Read-only checks for the D98 export."""
from pathlib import Path
import json
import numpy as np
from PIL import Image

out=Path(__file__).resolve().parents[1]/'animation-pack-04/assets/mounted-ritne'
m=json.loads((out/'manifest.json').read_text(encoding='utf-8'))
qa=json.loads((out/'qa.json').read_text(encoding='utf-8'))
assert m['animation']['rows']['motion']['frames']==8 and not m['animation']['rows']['motion']['loop']
assert qa['k']==0.9 and all(f['bboxAreaRatio']<=1.2 for f in qa['frames'])
atlas=Image.open(out/'atlas.png').convert('RGBA'); assert atlas.size==(4096,512)
assert Image.open(out/'preview.gif').n_frames==8
for i in range(8):
    im=Image.open(out/f'frames/motion/frame-{i}.png').convert('RGBA')
    assert im.size==(512,512) and im.tobytes()==atlas.crop((512*i,0,512*(i+1),512)).tobytes()
    bb=im.getbbox(); assert min(bb[0],bb[1],512-bb[2],512-bb[3])>=24
    a=np.array(im).astype(float); mask=a[:,:,3]>0
    assert not ((a[:,:,1]>120)&(a[:,:,1]>a[:,:,0]*1.35+20)&(a[:,:,1]>a[:,:,2]*1.35+20)&mask).any()
print('PASS mounted-ritne: 8 frames, k=0.90, margins, area, alpha, atlas, GIF')
