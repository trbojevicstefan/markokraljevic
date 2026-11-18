"""D76 sprite-sheet preparation/export for generated green-screen grids."""
from pathlib import Path
import argparse, json, shutil
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

ROOT=Path(__file__).resolve().parents[1]/'animation-pack-04'
REFDIR=Path(__file__).resolve().parent/'uzori-d102'
SPECS={
 'posmatrac-seljanka':('milos-idle-kadar0',6,350,True,3,2),
 'posmatrac-decak':('milos-idle-kadar0',6,250,True,3,2),
 'posmatrac-starica':('milos-idle-kadar0',6,320,True,3,2),
 'posmatrac-ribar':('milos-idle-kadar0',6,370,True,3,2),
 'posmatrac-gradjanin':('milos-idle-kadar0',6,375,True,3,2),
 'katana-gard':('katana-idle-kadar0',4,426,True,2,2),
 'katana-gard-slomljen':('katana-idle-kadar0',6,426,False,3,2),
}
def dump(p,d): p.write_text(json.dumps(d,indent=2,ensure_ascii=True)+'\n',encoding='utf-8')
def cut_green(p):
    ar=np.array(p.convert('RGBA')); r,g,b=[ar[:,:,j].astype(float) for j in range(3)]
    candidate=(g>70)&(g>r*1.3+20)&(g>b*1.3+20); seed=np.zeros(candidate.shape,dtype=bool); seed[0,:]=candidate[0,:]; seed[-1,:]=candidate[-1,:]; seed[:,0]=candidate[:,0]; seed[:,-1]=candidate[:,-1]; key=ndimage.binary_propagation(seed,mask=candidate); ar[key,3]=0
    edge=ndimage.binary_dilation(key,iterations=2)&~key; ar[:,:,1][edge]=np.minimum(g[edge],np.maximum(r,b)[edge])
    labels,num=ndimage.label(ar[:,:,3]>0); areas=np.bincount(labels.ravel()); small=np.flatnonzero(areas<8); small=small[small!=0]
    ar[np.isin(labels,small),3]=0; ar[ar[:,:,3]==0,:3]=0
    q=Image.fromarray(ar); bb=q.getbbox(); return q.crop(bb),bb
def prepare(name,attempt,source):
    refname,n,target,loop,cols,rows=SPECS[name]; run=ROOT/'sources'/name/f'attempt-{attempt}'; run.mkdir(parents=True,exist_ok=True); shutil.copy2(source,run/'grid.png')
    im=Image.open(run/'grid.png').convert('RGBA'); pieces=[]
    for i in range(n):
        x0=round(i%cols*im.width/cols)+2; y0=round(i//cols*im.height/rows)+2; x1=round((i%cols+1)*im.width/cols)-2; y1=round((i//cols+1)*im.height/rows)-2
        pieces.append(cut_green(im.crop((x0,y0,x1,y1)))[0])
    if (name=='posmatrac-ribar' and attempt==2) or (name=='posmatrac-gradjanin' and attempt==1): pieces=[p.transpose(Image.Transpose.FLIP_LEFT_RIGHT) for p in pieces]
    ref=Image.open(REFDIR/(refname+'.png')).convert('RGBA'); refbb=ref.getbbox(); cells=[]; heights=[]
    k=target/pieces[0].height
    for i,p in enumerate(pieces):
        p=p.resize((round(p.width*k),round(p.height*k)),Image.Resampling.LANCZOS) if p.height else p
        ar=np.array(p); ar[ar[:,:,3]<8]=0; neon=(ar[:,:,1]>200)&(ar[:,:,0]<30)&(ar[:,:,2]<30); ar[neon,3]=0;  ar[ar[:,:,3]==0,:3]=0; p=Image.fromarray(ar); bb=p.getbbox(); heights.append(bb[3]-bb[1] if bb else 0)
        x=round((refbb[0]+refbb[2])/2-p.width/2); x=max(24,min(x,488-p.width)); y=488-p.height
        if name=='kopljanik-basa-ubod-odozgo' and i in (2,3): y=max(24,y-100)
        cell=Image.new('RGBA',(512,512)); cell.alpha_composite(p,(x,y)); cells.append(cell)
    board=Image.new('RGBA',(1024,512),(35,42,49,255)); board.alpha_composite(ref); board.alpha_composite(cells[0],(512,0)); ImageDraw.Draw(board).line((0,488,1024,488),fill=(255,220,60)); board.save(run/'identity-size-comparison.png')
    contact=Image.new('RGBA',(cols*512,rows*512),(35,42,49,255))
    for i,p in enumerate(cells): p.save(run/f'frame-{i}.png'); contact.alpha_composite(p,(i%cols*512,i//cols*512))
    contact.save(run/'contact.png'); qa=[]
    for i,p in enumerate(cells):
        ar=np.array(p); mask=ar[:,:,3]>0; bb=p.getbbox(); green=(ar[:,:,1]>200)&(ar[:,:,0]<30)&(ar[:,:,2]<30)&mask
        qa.append(dict(frame=i,bbox=list(bb) if bb else None,touchesEdge=bool(mask[0].any() or mask[-1].any() or mask[:,0].any() or mask[:,-1].any()),greenPixels=int(green.sum()),supportY=(bb[3]-1 if bb else -1),safeMargin=(min(bb[0],bb[1],512-bb[2],512-bb[3]) if bb else 0),height=(bb[3]-bb[1] if bb else 0)))
    dump(run/'qa.json',dict(frames=qa,identityApproved=False,motionApproved=False,reference=str(REFDIR/(refname+'.png')),targetSupportY=488,targetHeight=target,measuredHeights=heights,scale=k))
def export(name,attempt):
    refname,n,target,loop,cols,rows=SPECS[name]; run=ROOT/'sources'/name/f'attempt-{attempt}'; out=ROOT/'assets'/name; out.mkdir(parents=True,exist_ok=True); (out/'frames/motion').mkdir(parents=True,exist_ok=True); qa=json.loads((run/'qa.json').read_text()); review=json.loads((run/'review.json').read_text()); assert review['approved']; assert all(not f['touchesEdge'] and not f['greenPixels'] and f['safeMargin']>=24 for f in qa['frames'])
    cells=[Image.open(run/f'frame-{i}.png').convert('RGBA') for i in range(n)]; atlas=Image.new('RGBA',(n*512,512)); gif=[]
    for i,p in enumerate(cells): p.save(out/f'frames/motion/frame-{i}.png'); atlas.alpha_composite(p,(i*512,0)); bg=Image.new('RGBA',(512,512),(35,42,49,255)); bg.alpha_composite(p); gif.append(bg.convert('RGB'))
    atlas.save(out/'atlas.png'); shutil.copy2(run/'identity-size-comparison.png',out/'identity-size-comparison.png'); shutil.copy2(run/'contact.png',out/'contact.png'); gif[0].save(out/'preview.gif',save_all=True,append_images=gif[1:],duration=100,disposal=2,**({'loop':0} if loop else {}))
    dump(out/'manifest.json',{'characterId':name,'description':review['description'],'holdLastFrame':not loop,'animation':{'columns':n,'rows':{'motion':{'frames':n,'loop':loop,'holdLastFrame':not loop,'durations_ms':[100]*n}}},'frame_layout':{'sheetWidth':512*n,'rows':{'motion':[dict(x=512*i,y=0,w=512,h=512) for i in range(n)]}}})
    qa.update(identityApproved=True,motionApproved=True,visualReview=review['description'],atlasMatchesFrames=True,gifFrames=n); dump(out/'qa.json',qa)
if __name__=='__main__':
    p=argparse.ArgumentParser(); p.add_argument('mode',choices=['prepare','export']); p.add_argument('name',choices=list(SPECS)); p.add_argument('attempt',type=int); p.add_argument('--source'); a=p.parse_args(); assert 1<=a.attempt<=3
    prepare(a.name,a.attempt,Path(a.source)) if a.mode=='prepare' else export(a.name,a.attempt)
