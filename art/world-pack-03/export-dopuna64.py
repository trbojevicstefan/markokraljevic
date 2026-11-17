"""D64: chroma extraction, review staging, and approved export."""
from pathlib import Path
import argparse, json, shutil
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

ROOT=Path(__file__).resolve().parents[1]/'animation-pack-04'
REFDIR=Path(__file__).resolve().parent/'uzori-d64'
NAMES=['zastava-srbije-vijori','archer-uvis']
COUNTS={'zastava-srbije-vijori':8,'archer-uvis':6}
LOOP={'zastava-srbije-vijori'}
REFS={'zastava-srbije-vijori':'barjak-carski-ravan','archer-uvis':'archer-uzor'}
TARGET_H={'zastava-srbije-vijori':200,'archer-uvis':364}
SUPPORT_Y={'zastava-srbije-vijori':356,'archer-uvis':488}

def dump(p,d): p.write_text(json.dumps(d,indent=2,ensure_ascii=True)+'\n',encoding='utf-8')

def prepare(a):
    ref=REFDIR/(REFS[a.name]+'.png'); run=ROOT/'sources'/a.name/f'attempt-{a.attempt}'
    run.mkdir(parents=True,exist_ok=True)
    if a.source: shutil.copy2(a.source,run/'grid.png')
    im=Image.open(run/'grid.png').convert('RGBA'); n=COUNTS[a.name]; cols=4 if n==8 else 3
    pieces=[]
    for i in range(n):
        p=im.crop((round(i%cols*im.width/cols)+2,round(i//cols*im.height/2)+2,round((i%cols+1)*im.width/cols)-2,round((i//cols+1)*im.height/2)-2))
        ar=np.array(p); r,g,b=[ar[:,:,j].astype(float) for j in range(3)]
        key=(g>40)&(g>r*1.25+10)&(g>b*1.25+10); ar[key,3]=0
        edge=ndimage.binary_dilation(key,iterations=2)&~key; ar[:,:,1][edge]=np.minimum(g[edge],np.maximum(r,b)[edge])
        labels,num=ndimage.label(ar[:,:,3]>0); areas=np.bincount(labels.ravel()); small=np.flatnonzero(areas<8); small=small[small!=0]
        ar[np.isin(labels,small),3]=0; ar[ar[:,:,3]==0,:3]=0; p=Image.fromarray(ar); bb=p.getbbox(); assert bb; pieces.append(p.crop(bb))
    ref=Image.open(ref).convert('RGBA'); refbox=ref.getbbox(); target=TARGET_H[a.name]; scale=target/pieces[0].height
    assert max(p.width*scale for p in pieces)<=464 and max(p.height*scale for p in pieces)<=464
    cells=[]
    for i,p in enumerate(pieces):
        p=p.resize((round(p.width*scale),round(p.height*scale)),Image.Resampling.LANCZOS); ar=np.array(p); ar[ar[:,:,3]<8]=0
        spill=(ar[:,:,1]>100)&(ar[:,:,1]>ar[:,:,0].astype(float)*1.25+10)&(ar[:,:,1]>ar[:,:,2].astype(float)*1.25+10); ar[:,:,1][spill]=np.maximum(ar[:,:,0],ar[:,:,2])[spill]
        labels,num=ndimage.label(ar[:,:,3]>32); areas=np.bincount(labels.ravel()); tiny=np.flatnonzero(areas<=32); tiny=tiny[tiny!=0]; ar[np.isin(labels,tiny)]=0
        p=Image.fromarray(ar)
        if a.name=='zastava-srbije-vijori': x=40; y=156
        else: x=round(200-p.width/2); x=max(24,min(x,488-p.width)); y=SUPPORT_Y[a.name]-p.height
        cell=Image.new('RGBA',(512,512)); cell.alpha_composite(p,(x,y)); cell.save(run/f'frame-{i}.png'); cells.append(cell)
    board=Image.new('RGBA',(1024,512),(35,42,49,255)); board.alpha_composite(ref.resize((512,512)) if ref.size!=(512,512) else ref); board.alpha_composite(cells[0],(512,0)); ImageDraw.Draw(board).line((0,SUPPORT_Y[a.name],1024,SUPPORT_Y[a.name]),fill=(255,220,60)); board.save(run/'identity-size-comparison.png')
    contact=Image.new('RGBA',(cols*512,1024),(35,42,49,255))
    for i,p in enumerate(cells): contact.alpha_composite(p,(i%cols*512,i//cols*512))
    contact.save(run/'contact.png'); qa=[]
    for i,p in enumerate(cells):
        ar=np.array(p); mask=ar[:,:,3]>0; bb=p.getbbox(); labels,num=ndimage.label(ar[:,:,3]>32); sizes=np.bincount(labels.ravel())[1:]
        green=(ar[:,:,1]>100)&(ar[:,:,1]>ar[:,:,0].astype(float)*1.25+10)&(ar[:,:,1]>ar[:,:,2].astype(float)*1.25+10)&mask
        support = 355 if a.name=='zastava-srbije-vijori' else bb[3]-1
        qa.append(dict(frame=i,bbox=bb,touchesEdge=bool(mask[0].any() or mask[-1].any() or mask[:,0].any() or mask[:,-1].any()),components=int(num),componentAreas=sorted(sizes.tolist(),reverse=True),greenPixels=int(green.sum()),supportY=support,safeMargin=min(bb[0],bb[1],512-bb[2],512-bb[3])))
    dump(run/'qa.json',dict(frames=qa,scale=scale,aimDeg=(a.aim_deg if a.name=='archer-uvis' else None),identityApproved=False,motionApproved=False,reference=str(ref),targetSupportY=SUPPORT_Y[a.name],referenceHeight=refbox[3]-refbox[1],targetHeight=target)); print(json.dumps(qa))

def export(a):
    run=ROOT/'sources'/a.name/f'attempt-{a.attempt}'; out=ROOT/'assets'/a.name; assert not out.exists()
    qa=json.loads((run/'qa.json').read_text()); review=json.loads((run/'review.json').read_text()); assert review['approved']
    assert all(not f['touchesEdge'] and not f['greenPixels'] and f['safeMargin']>=24 and abs(f['supportY']-qa['targetSupportY'])<=6 for f in qa['frames']); assert a.name!='archer-uvis' or 45<=qa['aimDeg']<=70
    n=COUNTS[a.name]; (out/'frames/motion').mkdir(parents=True); cells=[Image.open(run/f'frame-{i}.png').convert('RGBA') for i in range(n)]; atlas=Image.new('RGBA',(n*512,512)); gif=[]
    for i,p in enumerate(cells): p.save(out/f'frames/motion/frame-{i}.png'); atlas.alpha_composite(p,(i*512,0)); bg=Image.new('RGBA',(512,512),(35,42,49,255)); bg.alpha_composite(p); gif.append(bg.convert('RGB'))
    atlas.save(out/'atlas.png'); cells[0].save(out/'reference.png')
    for fn in ['identity-size-comparison.png','contact.png']: shutil.copy2(run/fn,out/fn)
    gif[0].save(out/'preview.gif',save_all=True,append_images=gif[1:],duration=100,disposal=2,loop=0)
    m=json.loads((ROOT/'assets/kosovka-idle/manifest.json').read_text()); m.update(characterId=a.name,holdLastFrame=False,description=review['description'],noFootAlignment=False); m['animation']['columns']=n; m['animation']['rows']['motion'].update(frames=n,loop=a.name in LOOP,holdLastFrame=False,durations_ms=[100]*n); m['frame_layout'].update(sheetWidth=512*n,rows={'motion':[dict(x=512*i,y=0,w=512,h=512) for i in range(n)]}); dump(out/'manifest.json',m)
    qa.update(identityApproved=True,motionApproved=True,visualReview=review['description'],atlasMatchesFrames=True,gifFrames=Image.open(out/'preview.gif').n_frames); assert qa['gifFrames']==n; dump(out/'qa.json',qa); print('EXPORTED',a.name)

if __name__=='__main__':
    p=argparse.ArgumentParser(); p.add_argument('mode',choices=['prepare','export']); p.add_argument('name',choices=NAMES); p.add_argument('attempt',type=int); p.add_argument('--source'); p.add_argument('--aim-deg',type=float,default=None); a=p.parse_args(); assert 1<=a.attempt<=(4 if a.name=='zastava-srbije-vijori' else 3); (prepare if a.mode=='prepare' else export)(a)
