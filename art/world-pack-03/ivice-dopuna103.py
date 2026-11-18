from PIL import Image
import numpy as np
from scipy.ndimage import distance_transform_edt
from pathlib import Path
p=Path('art/world-pack-03')
names=['merdevine-telo','merdevine-vrh','prop-skela-dunav','prop-top-varadin','prop-barjak-varadin','prop-korpe-grozdja','prop-mreza-ribarska','prop-tulum-ledjen']
for n in names:
 im=Image.open(p/(n+'.png')).convert('RGBA'); a=np.array(im); rgb=a[:,:,:3].astype(float); dist=distance_transform_edt(a[:,:,3]>10); mask=(dist<=5)&(rgb[:,:,0]>rgb[:,:,1]+8)&(rgb[:,:,2]>rgb[:,:,1]+8)
 rgb[:,:,2][mask]=np.minimum(rgb[:,:,2][mask],rgb[:,:,1][mask]+5); a[:,:,:3]=rgb.astype('uint8'); Image.fromarray(a).save(p/(n+'.png'))
im=Image.open(p/'merdevine-telo.png'); out=Image.new('RGBA',(256,1536)); [out.paste(im,(0,i*512)) for i in range(3)]; out.save(p/'merdevine-telo-proba.png')
