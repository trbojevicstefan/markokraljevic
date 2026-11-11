from pathlib import Path
from PIL import Image
import numpy as np
import json, shutil, sys
w=Path(__file__).resolve().parent
name,raw=sys.argv[1:3]
assert name in ['urvina-sky','urvina-far','urvina-mid','urvina-near','urvina-vista']
out=w/(name+'.png');assert not out.exists(),out
src=w/'sources/dopuna42-1';src.mkdir(parents=True,exist_ok=True)
shutil.copy2(raw,src/(name+'-raw.png'))
im=Image.open(raw).convert('RGBA').resize((2172,724),Image.Resampling.LANCZOS)
transparent=name in ['urvina-far','urvina-mid','urvina-near']
if transparent:assert im.getchannel('A').getextrema()==(0,255), 'Expected genuine generated transparent background'
else:im.putalpha(255)
# Technical periodic wrap registration, no new artwork: smooth overlap of
# generated trailing/leading192px, then resample the shorter repeating period.
a=np.array(im).astype(np.float32)/255
a[:,:,:3]*=a[:,:,3:4]
b=192;p=a.shape[1]-b
k=np.linspace(0,1,b,dtype=np.float32)[None,:,None];k=k*k*(3-2*k)
t=a[:,:p].copy();t[:,:b]=a[:,p:]*(1-k)+a[:,:b]*k
np.divide(t[:,:,:3],t[:,:,3:4],out=t[:,:,:3],where=t[:,:,3:4]>0)
t[:,:,:3][t[:,:,3]==0]=0
final=Image.fromarray(np.uint8(np.clip(t,0,1)*255+.5),'RGBA').resize((2172,724),Image.Resampling.LANCZOS)
# Boundary texels share the same sample; neighboring texture remains painted.
arr=np.array(final);edge=((arr[:,0].astype(np.uint16)+arr[:,-1].astype(np.uint16))//2).astype(np.uint8);arr[:,0]=edge;arr[:,-1]=edge
final=Image.fromarray(arr,'RGBA');final.save(out)
assert np.array_equal(arr[:,0],arr[:,-1])
qa={'file':out.name,'size':[2172,724],'alpha_extrema':final.getchannel('A').getextrema(),'wrap_edge_rgba_equal':True,'source':str((src/(name+'-raw.png')).relative_to(w)),'technical_export':'192px smooth premultiplied-alpha periodic overlap; normalized2172x724; matching edge texels','generator':'built-in image_gen'}
(src/(name+'-qa.json')).write_text(json.dumps(qa,indent=2),encoding='utf8')
with (w/'STATUS-ANIMACIJE.md').open('a',encoding='utf8') as f:f.write(f'\nDOPUNA-42 deo1: {name} GOTOVO — PNG2172x724, '+('RGBA/providno iznad obrisa' if transparent else 'neprozirno')+', zora pre sunca, bez gradjevina; vodoravni spoj registrovan, rubni RGBA pikseli jednaki. Izvor i QA sources/dopuna42-1/; ugradjeni image_gen.\n')
print(json.dumps(qa))
