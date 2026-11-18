from pathlib import Path
from PIL import Image
import numpy as np,json
root=Path('art/animation-pack-04/assets')
for name,n in [('idle',6),('mounted',8),('mounted-strike',6),('unhorsed',6),('run',8),('attack',6),('hvata',6),('hurt',4),('death',6)]:
 p=root/('vuca-'+name); m=json.loads((p/'manifest.json').read_text(encoding='utf-8')); qa=json.loads((p/'qa.json').read_text(encoding='utf-8')); a=Image.open(p/'atlas.png').convert('RGBA'); assert a.size==(512*n,512); assert len(m['frame_layout']['rows']['motion'])==n; gif=Image.open(p/'preview.gif'); assert gif.n_frames==n
 greens=0
 for i in range(n):
  im=Image.open(p/f'frames/motion/frame-{i}.png').convert('RGBA'); assert im.size==(512,512) and a.crop((i*512,0,(i+1)*512,512)).tobytes()==im.tobytes(); ar=np.array(im).astype(float); mask=ar[:,:,3]>0; greens+=int(((ar[:,:,1]>120)&(ar[:,:,1]>ar[:,:,0]*1.35+20)&(ar[:,:,1]>ar[:,:,2]*1.35+20)&mask).sum())
 print(name,'frames',n,'green pixels',greens)
