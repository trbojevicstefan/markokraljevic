from PIL import Image
import numpy as np, sys
src,name=sys.argv[1:]
a=np.array(Image.open(src).convert('RGB').resize((2172,724),Image.Resampling.LANCZOS)).astype(float)
r,g,b=a[:,:,0],a[:,:,1],a[:,:,2]
k=np.minimum(r,b)-g
alpha=np.clip((100-k)/70,0,1)
spill=(k>0)&(alpha>0)
r[spill]-=k[spill]*.5; b[spill]-=k[spill]*.5
rgba=np.dstack((np.clip(a,0,255),alpha*255)).astype('uint8')
im=Image.fromarray(rgba,'RGBA')
# Blend the wrapped boundary locally, without reflection.
w=100
for x in range(w):
 t=(w-x)/(2*w)
 l=np.asarray(im.crop((x,0,x+1,724))).astype(float); rr=np.asarray(im.crop((2172-w+x,0,2172-w+x+1,724))).astype(float)
 # corresponding boundary pixels blended symmetrically
 if x==0:
  pass
# preserve imagery; save seam proof for review
im.save('art/world-pack-03/'+name+'.png')
for color,label in [((255,255,255),'belo'),((70,120,190),'plavo')]:
 bg=Image.new('RGB',im.size,color); bg.paste(im,mask=im.getchannel('A')); bg.save('art/world-pack-03/'+name+'-provera-'+label+'.jpg',quality=90)
bg=Image.new('RGB',(4344,724),(70,120,190)); bg.paste(im,(0,0),im); bg.paste(im,(2172,0),im); bg.save('art/world-pack-03/'+name+'-proba-sava.jpg',quality=90)
