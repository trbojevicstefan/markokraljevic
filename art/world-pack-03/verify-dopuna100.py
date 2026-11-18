from pathlib import Path
import json
from PIL import Image
import numpy as np
out=Path(__file__).resolve().parents[1]/'animation-pack-04/assets/sarac-ritne'
m=json.loads((out/'manifest.json').read_text(encoding='utf8')); qa=json.loads((out/'qa.json').read_text(encoding='utf8'))
a=Image.open(out/'atlas.png').convert('RGBA'); assert a.size==(4096,512); assert not m['animation']['rows']['motion']['loop']
gif=Image.open(out/'preview.gif'); assert gif.n_frames==8 and 'loop' not in gif.info
for i in range(8):
 f=Image.open(out/f'frames/motion/frame-{i}.png').convert('RGBA'); assert f.size==(512,512) and f.tobytes()==a.crop((i*512,0,(i+1)*512,512)).tobytes(); b=f.getbbox(); assert min(b[0],b[1],512-b[2],512-b[3])>=24
 ar=np.array(f).astype(float); mask=ar[:,:,3]>0; assert not ((ar[:,:,1]>120)&(ar[:,:,1]>ar[:,:,0]*1.35+20)&(ar[:,:,1]>ar[:,:,2]*1.35+20)&mask).any()
assert max(x['area'] for x in qa['frames'])<=1.2*qa['frames'][0]['area']
print('PASS: 8 frames, atlas, non-looping GIF, margin, green removal and area')
