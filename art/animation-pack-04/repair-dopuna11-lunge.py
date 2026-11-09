from pathlib import Path
from PIL import Image
import cv2,numpy as np,json,shutil,subprocess
root=Path(__file__).resolve().parent;out=root/'assets/sword-lunge';run=root/'sources/sword-lunge'
backup=run/'export-before-blade-fix';assert not backup.exists();shutil.copytree(out,backup)
a=np.array(Image.open(run/'grid-alpha.png').convert('RGBA'))
n,labels,stats,centers=cv2.connectedComponentsWithStats((a[:,:,3]>8).astype('uint8'),8)
groups=[[] for _ in range(6)]
for k in range(1,n):
    if stats[k,cv2.CC_STAT_AREA]<9:continue
    x,y=centers[k];slot=min(1,int(y*2/a.shape[0]))*3+min(2,int(x*3/a.shape[1]));groups[slot].append(k)
pieces=[]
for g in groups:
    mask=np.isin(labels,g);ys,xs=np.where(mask);b=[xs.min(),ys.min(),xs.max()+1,ys.max()+1];pix=a[b[1]:b[3],b[0]:b[2]].copy();pix[:,:,3]*=mask[b[1]:b[3],b[0]:b[2]];pieces.append(Image.fromarray(pix))
scale=min(426/max(im.height for im in pieces),500/max(im.width for im in pieces),480/max(im.height for im in pieces))
atlas=Image.new('RGBA',(3072,512));qa=[]
for i,im in enumerate(pieces):
    im=im.resize((round(im.width*scale),round(im.height*scale)),Image.Resampling.LANCZOS);cell=Image.new('RGBA',(512,512));cell.alpha_composite(im,((512-im.width)//2,488-im.height));cell.save(out/f'frames/motion/frame-{i}.png');atlas.alpha_composite(cell,(512*i,0));qa.append({'frame':i,'bounds':cell.getchannel('A').getbbox(),'footY':487})
atlas.save(out/'atlas.png');(out/'qa.json').write_text(json.dumps({'frames':qa,'loop':False,'scale':scale,'note':'Recovered complete connected saber across source grid seam; no redraw.'},indent=2))
m=json.loads((out/'manifest.json').read_text());m['scaleReference']['actualMaxHeight']=max(q['bounds'][3]-q['bounds'][1] for q in qa);m['scaleReference']['uniformScale']=scale;(out/'manifest.json').write_text(json.dumps(m,indent=2))
sg=root.parents[2]/'tools/sprite-gen/.venv/Scripts/sprite-gen.exe';subprocess.run([str(sg),'compose-gif',*[str(out/f'frames/motion/frame-{i}.png') for i in range(6)],'--output',str(out/'preview.gif'),'--delay-ticks','8','--loop-count','0'],check=True,stdout=subprocess.DEVNULL)
with (root.parent/'world-pack-03/STATUS-ANIMACIJE.md').open('a',encoding='utf8') as f:f.write('\nDOPUNA-11: sword-lunge — popravljen izvoz cele sablje koja je prelazila granicu izvorne celije. Bez novog generisanja; stari izvoz u sources/sword-lunge/export-before-blade-fix/.\n')
print('Recovered full saber in sword-lunge')
