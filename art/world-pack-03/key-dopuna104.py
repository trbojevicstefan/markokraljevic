from PIL import Image
import numpy as np, sys
im=Image.open(sys.argv[1]).convert('RGBA'); a=np.array(im).astype(np.float32); r,g,b=a[:,:,0],a[:,:,1],a[:,:,2]
mag=np.minimum(r,b)-g
alpha=np.clip((90-mag)/75,0,1); a[:,:,3]*=alpha
# remove magenta spill, retaining neutral and warm colors
excess=np.maximum(0,np.minimum(r,b)-g); a[:,:,0]-=excess*0.55; a[:,:,2]-=excess
Image.fromarray(np.uint8(np.clip(a,0,255))).save(sys.argv[2])
