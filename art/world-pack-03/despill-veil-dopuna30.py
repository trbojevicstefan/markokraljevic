from pathlib import Path
from PIL import Image
import numpy as np,shutil,subprocess
w=Path(__file__).resolve().parent;r=w.parent/'animation-pack-04';sg=w.parents[2]/'tools/sprite-gen/.venv/Scripts/sprite-gen.exe'
for name,n in [('mlada-trci',8),('mlada-skok',6)]:
 p=r/'assets'/name;backup=r/'sources'/name/'before-veil-despill';backup.mkdir(exist_ok=False)
 atlas=Image.new('RGBA',(n*512,512))
 for i in range(n):
  f=p/f'frames/motion/frame-{i}.png';shutil.copy2(f,backup/f.name);a=np.array(Image.open(f));rgb=a[:,:,:3].astype(float);red,green,blue=rgb[:,:,0],rgb[:,:,1],rgb[:,:,2]
  mask=(red>140)&(blue>100)&(blue>green*1.06)&(red>blue*.95)&(red<blue*1.8)&(a[:,:,3]>0)
  # Chroma-spill removal only: restore warm ivory veil colors.
  neutral=np.maximum(green,(red+blue)*.46);rgb[:,:,1][mask]=neutral[mask];rgb[:,:,2][mask]=np.minimum(blue[mask],neutral[mask]*.87)
  a[:,:,:3]=np.clip(rgb,0,255).astype('uint8');im=Image.fromarray(a);im.save(f);atlas.paste(im,(i*512,0))
 shutil.copy2(p/'atlas.png',backup/'atlas.png');shutil.copy2(p/'preview.gif',backup/'preview.gif');atlas.save(p/'atlas.png')
 subprocess.run([str(sg),'compose-gif',*[str(p/f'frames/motion/frame-{i}.png') for i in range(n)],'--output',str(p/'preview.gif'),'--delay-ticks','8','--loop-count','0'],check=True,stdout=subprocess.DEVNULL)
print('Veil chroma spill cleaned; originals retained.')
