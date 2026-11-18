from PIL import Image,ImageChops
import numpy as np
from pathlib import Path
p=Path('art/world-pack-03')
src=Image.open(r'C:\Users\PC\.codex\generated_images\01a1f0b1-dec7-7881-88cd-024086cdf7af\exec-c81928b9-cb73-4127-bf07-2bfd9e3f6a71.png').convert('RGB')
a=np.asarray(src.crop((0,140,1024,1420)).resize((256,512),Image.Resampling.LANCZOS)).copy().astype(float)
# remove magenta key and spill, preserving antialiasing
strength=np.minimum(a[:,:,0]-a[:,:,1],a[:,:,2]-a[:,:,1]); alpha=np.clip((150-strength)/100,0,1)
a[:,:,0]-=(1-alpha)*np.maximum(a[:,:,0]-a[:,:,1],0); a[:,:,2]-=(1-alpha)*np.maximum(a[:,:,2]-a[:,:,1],0)
a=np.dstack((np.clip(a,0,255),alpha*255)).astype('uint8')
# make edge pixels match with a brief crossfade
for i in range(12):
 w=(12-i)/24; top=a[i].astype(float); bot=a[-1-i].astype(float); avg=(top+bot)/2
 a[i]=(top*(1-w*2)+avg*w*2).astype('uint8'); a[-1-i]=(bot*(1-w*2)+avg*w*2).astype('uint8')
im=Image.fromarray(a,'RGBA'); im.save(p/'merdevine-telo.png')
proba=Image.new('RGBA',(256,1536)); [proba.paste(im,(0,y*512)) for y in range(3)]; proba.save(p/'merdevine-telo-proba.png')
