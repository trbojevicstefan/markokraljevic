from pathlib import Path
import sys,json,shutil
import numpy as np
from PIL import Image
from scipy import ndimage
ROOT=Path(__file__).resolve().parents[1]/'animation-pack-04'
S={'velimir-idle':(6,True,3,400,24),'velimir-run':(6,True,3,400,8),'velimir-attack':(6,False,3,400,24),'velimir-hurt':(4,False,2,400,8),'velimir-death':(6,False,3,400,24),'velimir-jase':(8,True,4,342,24),'velimir-svezan':(4,True,2,150,24)}
def dump(p,x):p.write_text(json.dumps(x,indent=2)+'\n',encoding='utf-8')
def run(name,src):
 n,loop,cols,target,margin=S[name]; rows=2; work=ROOT/'sources'/name/'attempt-1'; work.mkdir(parents=True,exist_ok=True); shutil.copyfile(src,work/'grid.png'); im=Image.open(src).convert('RGBA'); pieces=[]
 for i in range(n):
  a=np.array(im.crop((round(i%cols*im.width/cols)+2,round(i//cols*im.height/rows)+2,round((i%cols+1)*im.width/cols)-2,round((i//cols+1)*im.height/rows)-2))); r,g,b=(a[:,:,j].astype(float) for j in range(3)); key=(g>35)&(g>r*1.22+12)&(g>b*1.22+12); a[key,3]=0; edge=ndimage.binary_dilation(key,iterations=2)&~key; a[:,:,1][edge]=np.minimum(g[edge],np.maximum(r,b)[edge]); a[a[:,:,3]==0,:3]=0; p=Image.fromarray(a); bb=p.getbbox(); pieces.append(p.crop(bb))
 k=target/pieces[0].height; k=min(k,min((512-2*margin)/p.width for p in pieces),min((488-margin)/p.height for p in pieces)); out=ROOT/'assets'/name; (out/'frames/motion').mkdir(parents=True,exist_ok=True); atlas=Image.new('RGBA',(512*n,512)); frames=[]; qa=[]
 for i,p in enumerate(pieces):
  p=p.resize((round(p.width*k),round(p.height*k)),Image.Resampling.LANCZOS); a=np.array(p); a[a[:,:,3]<8]=0; spill=(a[:,:,1]>100)&(a[:,:,1]>a[:,:,0].astype(float)*1.25+10)&(a[:,:,1]>a[:,:,2].astype(float)*1.25+10); a[spill,3]=0; a[a[:,:,3]==0,:3]=0; p=Image.fromarray(a); cell=Image.new('RGBA',(512,512)); cell.alpha_composite(p,((512-p.width)//2,489-p.height)); cell.save(work/f'frame-{i}.png'); cell.save(out/f'frames/motion/frame-{i}.png'); atlas.alpha_composite(cell,(512*i,0)); bg=Image.new('RGBA',(512,512),(35,42,49,255)); bg.alpha_composite(cell); frames.append(bg.convert('RGB')); bb=cell.getbbox(); qa.append({'frame':i,'bbox':bb,'height':bb[3]-bb[1],'width':bb[2]-bb[0],'supportY':bb[3]-1,'safeMargin':min(bb[0],bb[1],512-bb[2],512-bb[3])})
 atlas.save(out/'atlas.png'); frames[0].save(out/'preview.gif',save_all=True,append_images=frames[1:],duration=100,disposal=2,loop=0); dump(out/'manifest.json',{'characterId':name,'description':name,'animation':{'columns':n,'rows':{'motion':{'frames':n,'loop':loop,'holdLastFrame':not loop,'durations_ms':[100]*n}}},'frame_layout':{'sheetWidth':512*n,'rows':{'motion':[{'x':512*i,'y':0,'w':512,'h':512} for i in range(n)]}}}); dump(out/'qa.json',{'frames':qa,'scale':k,'targetHeight':target,'visualReview':'pending'}); print(name,'k=',k,'dimensions=',[(x['width'],x['height']) for x in qa])
if __name__=='__main__':run(sys.argv[1],sys.argv[2])
