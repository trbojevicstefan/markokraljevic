"""D71 sprite-sheet preparation and export."""
from pathlib import Path
import argparse, json, shutil
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

ROOT=Path(__file__).resolve().parents[1]/'animation-pack-04'
REFDIR=Path(__file__).resolve().parent/'uzori-d71'
SPECS={
 'sword-uplasen':('sword-idle-kadar0',6,426,False,3,2), 'sword-bezi':('sword-idle-kadar0',8,426,True,4,2),
 'archer-uplasen':('archer-idle-kadar0',6,456,False,3,2), 'archer-bezi':('archer-idle-kadar0',8,456,True,4,2),
 'akindzija-uplasen':('akindzija-idle-kadar0',6,370,False,3,2), 'akindzija-bezi':('akindzija-idle-kadar0',8,370,True,4,2),
 'kopljanik-uplasen':('kopljanik-idle-kadar0',6,410,False,3,2), 'kopljanik-bezi':('kopljanik-idle-kadar0',8,410,True,4,2),
}
def dump(p,d): p.write_text(json.dumps(d,indent=2,ensure_ascii=True)+'\n',encoding='utf-8')
def cut_green(p):
    ar=np.array(p.convert('RGBA')); r,g,b=[ar[:,:,j].astype(float) for j in range(3)]
    key=(g>35)&(g>r*1.22+12)&(g>b*1.22+12); ar[key,3]=0
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
    ref=Image.open(REFDIR/(refname+'.png')).convert('RGBA'); refbb=ref.getbbox(); refh=refbb[3]-refbb[1]; scale=target/max(1,pieces[0].height) if name.startswith('akindzija-') else target/max(p.height for p in pieces); cells=[]; heights=[]
    for i,p in enumerate(pieces):
        p=p.resize((round(p.width*scale),round(p.height*scale)),Image.Resampling.LANCZOS); ar=np.array(p); ar[ar[:,:,3]<8]=0
        spill=(ar[:,:,1]>100)&(ar[:,:,1]>ar[:,:,0].astype(float)*1.25+10)&(ar[:,:,1]>ar[:,:,2].astype(float)*1.25+10); ar[:,:,1][spill]=np.maximum(ar[:,:,0],ar[:,:,2])[spill]
        labels,num=ndimage.label(ar[:,:,3]>32); areas=np.bincount(labels.ravel()); tiny=np.flatnonzero(areas<=32); tiny=tiny[tiny!=0]; ar[np.isin(labels,tiny)]=0
        p=Image.fromarray(ar); bb=p.getbbox(); heights.append(bb[3]-bb[1] if bb else 0); x=round((refbb[0]+refbb[2])/2-p.width/2); x=max(24,min(x,488-p.width)); cell=Image.new('RGBA',(512,512)); cell.alpha_composite(p,(x,488-p.height)); cell.save(run/f'frame-{i}.png'); cells.append(cell)
    board=Image.new('RGBA',(1024,512),(35,42,49,255)); board.alpha_composite(ref); board.alpha_composite(cells[0],(512,0)); ImageDraw.Draw(board).line((0,488,1024,488),fill=(255,220,60)); board.save(run/'identity-size-comparison.png')
    contact=Image.new('RGBA',(cols*512,rows*512),(35,42,49,255))
    for i,p in enumerate(cells): contact.alpha_composite(p,(i%cols*512,i//cols*512))
    contact.save(run/'contact.png'); qa=[]
    for i,p in enumerate(cells):
        ar=np.array(p); mask=ar[:,:,3]>0; bb=p.getbbox(); labels,num=ndimage.label(ar[:,:,3]>32); sizes=np.bincount(labels.ravel())[1:]; green=(ar[:,:,1]>100)&(ar[:,:,1]>ar[:,:,0].astype(float)*1.25+10)&(ar[:,:,1]>ar[:,:,2].astype(float)*1.25+10)&mask
        qa.append(dict(frame=i,bbox=list(bb) if bb else None,touchesEdge=bool(mask[0].any() or mask[-1].any() or mask[:,0].any() or mask[:,-1].any()),components=int(num),componentAreas=sorted(sizes.tolist(),reverse=True),greenPixels=int(green.sum()),supportY=(bb[3]-1 if bb else -1),safeMargin=(min(bb[0],bb[1],512-bb[2],512-bb[3]) if bb else 0),height=(bb[3]-bb[1] if bb else 0)))
    dump(run/'qa.json',dict(frames=qa,scale=scale,identityApproved=False,motionApproved=False,reference=str(REFDIR/(refname+'.png')),targetSupportY=488,referenceHeight=refh,targetHeight=target,measuredHeights=heights))
def export(name,attempt):
    refname,n,target,loop,cols,rows=SPECS[name]; run=ROOT/'sources'/name/f'attempt-{attempt}'; out=ROOT/'assets'/name; out.mkdir(parents=True,exist_ok=True); (out/'frames/motion').mkdir(parents=True,exist_ok=True); qa=json.loads((run/'qa.json').read_text()); review=json.loads((run/'review.json').read_text()); assert review['approved']; assert all(not f['touchesEdge'] and not f['greenPixels'] and f['safeMargin']>=24 for f in qa['frames'])
    cells=[Image.open(run/f'frame-{i}.png').convert('RGBA') for i in range(n)]; atlas=Image.new('RGBA',(n*512,512)); gif=[]
    for i,p in enumerate(cells): p.save(out/f'frames/motion/frame-{i}.png'); atlas.alpha_composite(p,(i*512,0)); bg=Image.new('RGBA',(512,512),(35,42,49,255)); bg.alpha_composite(p); gif.append(bg.convert('RGB'))
    atlas.save(out/'atlas.png'); shutil.copy2(run/'identity-size-comparison.png',out/'identity-size-comparison.png'); shutil.copy2(run/'contact.png',out/'contact.png'); gif[0].save(out/'preview.gif',save_all=True,append_images=gif[1:],duration=100,disposal=2,loop=0)
    m={'characterId':name,'description':review['description'],'holdLastFrame':False,'animation':{'columns':n,'rows':{'motion':{'frames':n,'loop':loop,'holdLastFrame':False,'durations_ms':[100]*n}}},'frame_layout':{'sheetWidth':512*n,'rows':{'motion':[dict(x=512*i,y=0,w=512,h=512) for i in range(n)]}}}; dump(out/'manifest.json',m); qa.update(identityApproved=True,motionApproved=True,visualReview=review['description'],atlasMatchesFrames=True,gifFrames=n); dump(out/'qa.json',qa)
if __name__=='__main__':
    p=argparse.ArgumentParser(); p.add_argument('mode',choices=['prepare','export']); p.add_argument('name',choices=list(SPECS)); p.add_argument('attempt',type=int); p.add_argument('--source'); a=p.parse_args(); assert 1<=a.attempt<=3
    if a.mode=='prepare': prepare(a.name,a.attempt,Path(a.source))
    else: export(a.name,a.attempt)
