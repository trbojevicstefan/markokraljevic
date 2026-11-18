"""Read-only D66 validation."""
from pathlib import Path
import json
import numpy as np
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]; WORLD=ROOT/'world-pack-03'; ANIM=ROOT/'animation-pack-04'
for name in ['prop-kuca-brvnara','prop-vajat','prop-tezga','prop-ves','prop-djeram']:
    p=Image.open(WORLD/(name+'.png')).convert('RGBA'); a=np.array(p); bb=p.getbbox(); assert p.size==(1536,1024) and a[:,:,3].min()==0 and a[:,:,3].max()==255 and bb[3]==1024 and not (a[0].any() or a[:,0].any() or a[:,-1].any())
for name, n, loop in [('marko-daje',6,False),('kokoska-kljuca',6,True)]:
    out=ANIM/'assets'/name; m=json.loads((out/'manifest.json').read_text()); assert m['animation']['rows']['motion']['frames']==n and m['animation']['rows']['motion']['loop']==loop
    atlas=Image.open(out/'atlas.png').convert('RGBA'); assert atlas.size==(512*n,512); gif=Image.open(out/'preview.gif'); assert gif.n_frames==n and gif.info.get('loop')==0
    for i in range(n):
        p=Image.open(out/f'frames/motion/frame-{i}.png').convert('RGBA'); assert p.size==(512,512); assert atlas.crop((512*i,0,512*(i+1),512)).tobytes()==p.tobytes(); bb=p.getbbox(); assert min(bb[0],bb[1],512-bb[2],512-bb[3])>=24
print('PASS D66')
