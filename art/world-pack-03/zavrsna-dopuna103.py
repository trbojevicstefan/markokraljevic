from PIL import Image
from pathlib import Path
import numpy as np
p=Path('art/world-pack-03')
for name in ('merdevine-telo','merdevine-vrh'):
 im=Image.open(p/(name+'.png')).convert('RGBA'); w,h=im.size
 im=im.resize((round(w*1.3),h),Image.Resampling.LANCZOS); im=im.crop(((im.width-w)//2,0,(im.width-w)//2+w,h)); im.save(p/(name+'.png'))
body=Image.open(p/'merdevine-telo.png').convert('RGBA'); a=np.array(Image.open(p/'merdevine-vrh.png').convert('RGBA')); b=np.array(body)
for i in range(16):
 w=(i+1)/16; a[-16+i]=(a[-16+i].astype(float)*(1-w)+b[0].astype(float)*w).astype('uint8')
Image.fromarray(a,'RGBA').save(p/'merdevine-vrh.png')
proba=Image.new('RGBA',(256,1536)); [proba.paste(body,(0,512*i)) for i in range(3)]; proba.save(p/'merdevine-telo-proba.png')
for name in ('prop-skela-dunav','prop-top-varadin','prop-barjak-varadin','prop-korpe-grozdja','prop-mreza-ribarska','prop-tulum-ledjen'):
 im=Image.open(p/(name+'.png')).convert('RGBA'); box=im.getchannel('A').getbbox(); dy=1024-box[3]
 shifted=Image.new('RGBA',im.size); shifted.alpha_composite(im,(0,dy)); shifted.save(p/(name+'.png'))
