from PIL import Image
import numpy as np
p=r'C:\Users\PC\.codex\generated_images\01a1f087-9a9a-7750-af14-497d223405ce\exec-e7bfb133-888e-4a7e-bcd0-cf650e84b925.png'
im=Image.open(p).convert('RGB').resize((1536,1024),Image.Resampling.LANCZOS)
a=np.asarray(im).astype(float); r,g,b=a[:,:,0],a[:,:,1],a[:,:,2]; m=np.minimum(r,b)-g
alpha=np.clip((150-m)/100,0,1); a[:,:,2]=np.minimum(b,g+np.maximum(0,(b-g)*(1-np.clip(m/120,0,1)))); a[:,:,0]=np.minimum(r,g+np.maximum(0,(r-g)*(1-np.clip((m-30)/150,0,1))))
out=np.dstack((a.astype('uint8'),(alpha*255).astype('uint8'))); sprite=Image.fromarray(out,'RGBA'); box=sprite.getbbox(); print('source bbox',box); canvas=Image.new('RGBA',(1536,1024)); canvas.paste(sprite,(0,1024-box[3])); canvas.save('art/world-pack-03/prop-bedem-srusen.png'); print('bbox',canvas.getbbox())
for color in ('white','blue'):
 bg=Image.new('RGB',canvas.size,color); bg.paste(canvas,mask=canvas.getchannel('A')); bg.save('art/world-pack-03/prop-bedem-srusen-'+color+'-dopuna99.jpg')

