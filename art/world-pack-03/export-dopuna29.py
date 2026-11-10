from pathlib import Path
from PIL import Image
import numpy as np,json,shutil,sys
w=Path(__file__).resolve().parent;name,source=sys.argv[1:3]
source=Path(source);run=w/'sources/dopuna29'/name;run.mkdir(parents=True,exist_ok=True)
raw=run/'generated.png';assert not raw.exists();shutil.copy2(source,raw)
out=w/(name+'.png');assert not out.exists()
im=Image.open(raw).convert('RGBA');assert im.getchannel('A').getextrema()[0]==0
size=(1536,512) if name.endswith('segment') else (512,768)
im=im.resize(size,Image.Resampling.LANCZOS)
report={'size':size,'nativeAlpha':True,'source':str(raw.relative_to(w))}
if name.endswith('segment'):
 # Technical periodic boundary registration in premultiplied alpha.
 # Preserve painted center; blend only 32px at each exported tile edge.
 a=np.array(im).astype(np.float32)/255;prem=a.copy();prem[:,:,:3]*=a[:,:,3:4]
 for d in range(32):
  left=prem[:,d].copy();right=prem[:,-1-d].copy();mean=(left+right)/2;weight=(1-d/32)**2
  prem[:,d]=left*(1-weight)+mean*weight;prem[:,-1-d]=right*(1-weight)+mean*weight
 alpha=prem[:,:,3:4];a[:,:,:3]=np.divide(prem[:,:,:3],alpha,out=np.zeros_like(prem[:,:,:3]),where=alpha>0);a[:,:,3:4]=alpha
 im=Image.fromarray(np.round(np.clip(a,0,1)*255).astype('uint8'))
 assert np.array_equal(np.array(im)[:,0],np.array(im)[:,-1])
 preview=Image.new('RGBA',(4608,512))
 for x in (0,1536,3072):preview.paste(im,(x,0))
 preview.save(w/'most-daske-segment-tiling-preview.png')
 report.update(seamMaxRgbaDifference=0,periodicEdgeBand=32,walkY=300,ropeYApprox=120)
im.save(out)
(run/'qa.json').write_text(json.dumps(report,indent=2),encoding='utf8')
print('Saved',out.name,size,'alpha',im.getchannel('A').getextrema())
