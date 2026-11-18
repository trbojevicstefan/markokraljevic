from PIL import Image
import numpy as np,sys
from pathlib import Path
p=Path('art/world-pack-03'); name,src=sys.argv[1:]
im=Image.open(src).convert('RGB')
if name=='merdevine-vrh':
 im=im.resize((256,1774),Image.Resampling.LANCZOS)
 out=Image.new('RGB',(256,256),(255,0,255))
 for y0,y1,s0,s1 in [(0,60,0,342),(60,192,342,1490),(192,256,1490,1774)]: out.paste(im.crop((0,s0,256,s1)).resize((256,y1-y0),Image.Resampling.LANCZOS),(0,y0))
 im=out
else:
 im.thumbnail((1536,1024),Image.Resampling.LANCZOS)
 canvas=Image.new('RGB',(1536,1024),(255,0,255)); canvas.paste(im,((1536-im.width)//2,1024-im.height)); im=canvas
a=np.asarray(im).copy().astype(float); strength=np.minimum(a[:,:,0]-a[:,:,1],a[:,:,2]-a[:,:,1]); alpha=np.clip((150-strength)/100,0,1)
a[:,:,0]-=(1-alpha)*np.maximum(a[:,:,0]-a[:,:,1],0); a[:,:,2]-=(1-alpha)*np.maximum(a[:,:,2]-a[:,:,1],0)
a=np.dstack((np.clip(a,0,255),alpha*255)).astype('uint8')
if name=='merdevine-vrh':
 b=np.array(Image.open(p/'merdevine-telo.png').convert('RGBA'))
 for i in range(16):
  w=(i+1)/16; a[-16+i]=(a[-16+i].astype(float)*(1-w)+b[i].astype(float)*w).astype('uint8')
Image.fromarray(a,'RGBA').save(p/(name+'.png'))

