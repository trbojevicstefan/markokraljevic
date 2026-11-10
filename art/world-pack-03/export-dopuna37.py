from pathlib import Path
from PIL import Image,ImageDraw
import json,sys,shutil,numpy as np
w=Path(__file__).resolve().parent;name,source,walk=sys.argv[1:4];walk=int(walk)
run=w/'sources/dopuna37'/name;run.mkdir(parents=True,exist_ok=True);raw=run/'generated.png';assert not raw.exists();shutil.copy2(source,raw)
im=Image.open(raw).convert('RGBA');b=im.getchannel('A').point(lambda v:255 if v>16 else 0).getbbox();assert b and b[1]<walk<b[3]
canvas=Image.new('RGBA',(512,192));upper=im.crop((b[0],b[1],b[2],walk)).resize((512,16),Image.Resampling.LANCZOS);lower=im.crop((b[0],walk,b[2],b[3])).resize((512,142),Image.Resampling.LANCZOS)
canvas.paste(upper,(0,24));canvas.paste(lower,(0,40))
a=np.array(canvas);a[:24,:,3]=0;a[185:,:,3]=0
# Register the flat collision surface; decorations occupy only y24..39.
a[40,16:496,3]=255
parts=[a[:,:128].copy(),a[:,128:384].copy(),a[:,384:].copy()]
def prem(p):
 p=p.astype(float)/255;p[:,:,:3]*=p[:,:,3:4];return p
def straight(p):
 alpha=p[:,:,3:4];rgb=np.divide(p[:,:,:3],alpha,out=np.zeros_like(p[:,:,:3]),where=alpha>0);return np.round(np.clip(np.concatenate([rgb,alpha],axis=2),0,1)*255).astype('uint8')
left,mid,right=[prem(p) for p in parts]
# Periodic texture/alpha boundary registration; painted center is untouched.
for d in range(16):
 l=mid[:,d].copy();r=mid[:,-1-d].copy();mean=(l+r)/2;t=(1-d/16)**2;mid[:,d]=l*(1-t)+mean*t;mid[:,-1-d]=r*(1-t)+mean*t
for d in range(16):
 t=(1-d/16)**2;left[:,-1-d]=left[:,-1-d]*(1-t)+mid[:,0]*t;right[:,d]=right[:,d]*(1-t)+mid[:,-1]*t
parts=[straight(p) for p in [left,mid,right]]
for label,p in zip(['levo','sredina','desno'],parts):
 out=w/f'plat-{name}-{label}.png';assert not out.exists();Image.fromarray(p).save(out)
assert np.array_equal(parts[1][:,0],parts[1][:,-1]);assert np.array_equal(parts[0][:,-1],parts[1][:,0]);assert np.array_equal(parts[1][:,-1],parts[2][:,0])
assert np.all(parts[1][40,:,3]==255) and all(np.all(p[:24,:,3]==0) and np.all(p[185:,:,3]==0) for p in parts)
qa={'material':name,'sizes':[[128,192],[256,192],[128,192]],'walkSurfaceY':40,'sourceWalkY':walk,'sourceBounds':b,'decorationMinY':24,'bottomTransparentFromY':185,'middleRgbaEdgeDifference':0,'capJoinRgbaDifference':0,'periodicRegistrationBand':16,'generator':'built-in image_gen','attempts':1}
(run/'qa.json').write_text(json.dumps(qa,indent=2),encoding='utf8')
with (w/'STATUS-ANIMACIJE.md').open('a',encoding='utf8') as f:f.write(f'\nDOPUNA-37: {name} — GOTOVO3/3: plat-{name}-levo.png128x192, plat-{name}-sredina.png256x192, plat-{name}-desno.png128x192 u art/world-pack-03/. Povrsina y40, ukrasi y24..39, donja ivica do y181/providno od185. Levi/desni RGBA rub sredine i spojevi sa krajevima identicni piksel po piksel (razlika0), provera prosla. Ugradjeni image_gen, jedan spojen naslikan izvor podeljen na tri registrovana dela; prompts-dopuna37.json, sources/dopuna37/{name}/qa.json.\n')
print('Saved and logged',name,'3 PNG; surface40; exact RGBA seams.')
