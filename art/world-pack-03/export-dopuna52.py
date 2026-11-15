"""D52 green-grid staging and visually approved export, adapted from D48/D50.
No catalog, dist or rig writes. Kosovka body scale is about 330 px.
"""
from pathlib import Path
import argparse, json, shutil
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[1] / 'animation-pack-04'
REF = Path(__file__).resolve().parent / 'uzori-d48'
NAMES = ['kosovka-idle','kosovka-hoda']

def dump(path, data):
    path.write_text(json.dumps(data, indent=2, ensure_ascii=True)+'\n', encoding='utf-8')

def prepare(a):
    run=ROOT/'sources'/a.name/f'attempt-{a.attempt}'
    run.mkdir(parents=True, exist_ok=True)
    if Path(a.source).resolve() != (run/'grid.png').resolve():
        shutil.copy2(a.source,run/'grid.png')
    im=Image.open(run/'grid.png').convert('RGBA')
    count={'kosovka-idle':6,'kosovka-hoda':8}[a.name]
    cols=count//2
    pieces=[]
    for i in range(count):
        p=im.crop((round((i%cols)*im.width/cols),round((i//cols)*im.height/2),round((i%cols+1)*im.width/cols),round((i//cols+1)*im.height/2)))
        # A few generators add a thin sheet separator; never include it as art.
        p=p.crop((2,2,p.width-2,p.height-2))
        arr=np.array(p).astype(np.float32)
        r,g,b=arr[:,:,0],arr[:,:,1],arr[:,:,2]
        # Solid chroma background and mixed edge pixels. Herb interiors remain intact.
        key=(g>40)&(g>r*1.25+10)&(g>b*1.25+10)
        arr[key,3]=0
        # Remove chroma spill only on the cutout boundary.
        edge=ndimage.binary_dilation(key,iterations=2)&(~key)
        arr[:,:,1][edge]=np.minimum(g[edge],np.maximum(r,b)[edge])
        arr[arr[:,:,3]==0,:3]=0
        p=Image.fromarray(arr.astype('uint8'))
        bb=p.getbbox()
        if not bb: raise ValueError('Empty cell')
        pieces.append(p.crop(bb))
    # One constant scale across animation, so posture changes preserve anatomy.
    scale=a.height/pieces[a.scale_frame].height
    if max(p.width*scale for p in pieces)>464 or max(p.height*scale for p in pieces)>464:
        raise ValueError('Requested anatomical scale cannot fit 24px margins')
    cells=[]
    for i,p in enumerate(pieces):
        p=p.resize((round(p.width*scale),round(p.height*scale)),Image.Resampling.LANCZOS)
        ar=np.array(p); ar[ar[:,:,3]<8]=0
        spill=(ar[:,:,1]>120)&(ar[:,:,1]>ar[:,:,0].astype(float)*1.35+20)&(ar[:,:,1]>ar[:,:,2].astype(float)*1.35+20)
        ar[:,:,1][spill]=np.maximum(ar[:,:,0],ar[:,:,2])[spill]
        p=Image.fromarray(ar)
        # Grounded clips use the shared support line. Fall intentionally descends.
        bottom=488
        if a.name=='vila-pada': bottom=[410,420,440,460,480,488][i]
        cell=Image.new('RGBA',(512,512))
        yy,xx=np.where(np.array(p)[-16:,:,3]>32)
        x=(512-p.width)//2 if a.name in ['kosovka-hoda'] else 256-round((int(xx.min())+int(xx.max()))/2)
        if a.name=='kosovka-hoda':
            # Lock the head/torso horizontally; foot spread must not shift the body.
            hy,hx=np.where(np.array(p)[:45,:,3]>32)
            x=270-round((int(hx.min())+int(hx.max()))/2)
        if a.name=='kosovka-idle':
            yy,xx=np.where(np.array(p)[-16:,:,3]>32)
            x=256-round((int(xx.min())+int(xx.max()))/2)
        x=max(24,min(x,488-p.width))
        cell.alpha_composite(p,(x,bottom-p.height))
        cell.save(run/f'frame-{i}.png'); cells.append(cell)
    refs=a.refs.split(',')
    board=Image.new('RGBA',((len(refs)+1)*512,512),(35,42,49,255))
    for i,ref in enumerate(refs):
        q=Image.open(Path(ref) if Path(ref).is_absolute() else REF/ref).convert('RGBA');board.alpha_composite(q,(i*512,0))
    board.alpha_composite(cells[0],(len(refs)*512,0))
    ImageDraw.Draw(board).line((0,488,board.width,488),fill=(255,220,60),width=1)
    board.save(run/'identity-size-comparison.png')
    contact=Image.new('RGBA',(cols*512,1024),(35,42,49,255))
    for i,p in enumerate(cells):contact.alpha_composite(p,((i%cols)*512,(i//cols)*512))
    contact.save(run/'contact.png')
    qa=[]
    for i,p in enumerate(cells):
        ar=np.array(p);mask=ar[:,:,3]>0; bb=p.getbbox()
        labels,num=ndimage.label(ar[:,:,3]>32)
        sizes=np.bincount(labels.ravel())[1:]
        green=(ar[:,:,1]>120)&(ar[:,:,1]>ar[:,:,0].astype(float)*1.35+20)&(ar[:,:,1]>ar[:,:,2].astype(float)*1.35+20)&mask
        qa.append({'frame':i,'bbox':bb,'touchesEdge':bool(mask[0].any() or mask[-1].any() or mask[:,0].any() or mask[:,-1].any()),'components':int(num),'componentAreas':sorted(sizes.tolist(),reverse=True),'greenPixels':int(green.sum()),'supportY':bb[3]-1,'safeMargin':min(bb[0],bb[1],512-bb[2],512-bb[3])})
    dump(run/'qa.json',{'frames':qa,'scale':scale,'identityApproved':False,'notes':'Staged only; requires visual identity and motion review.'})
    print(run)

def export(a):
    run=ROOT/'sources'/a.name/f'attempt-{a.attempt}'
    out=ROOT/'assets'/a.name
    if out.exists(): raise ValueError('Existing destination; refuse overwrite')
    qa=json.loads((run/'qa.json').read_text())
    assert all(not f['touchesEdge'] and f['greenPixels']==0 and f['safeMargin']>=24 for f in qa['frames'])
    assert a.approval
    review=json.loads((run/'review.json').read_text())
    assert review['approved']
    a.approval=review['summary']
    count=len(qa['frames']);loop=a.name in ['kosovka-idle','kosovka-hoda'];hold=False
    (out/'frames/motion').mkdir(parents=True)
    cells=[Image.open(run/f'frame-{i}.png').convert('RGBA') for i in range(count)]
    atlas=Image.new('RGBA',(512*count,512))
    for i,p in enumerate(cells):
        p.save(out/f'frames/motion/frame-{i}.png');atlas.alpha_composite(p,(512*i,0))
    atlas.save(out/'atlas.png');cells[0].save(out/'reference.png')
    for file in ['identity-size-comparison.png','contact.png']:shutil.copy2(run/file,out/file)
    gif=[]
    for p in cells:
        bg=Image.new('RGBA',(512,512),(35,42,49,255));bg.alpha_composite(p);gif.append(bg.convert('RGB'))
    gif[0].save(out/'preview.gif',save_all=True,append_images=gif[1:],duration=100,disposal=2,**({'loop':0} if loop else {}))
    m=json.loads((ROOT/'assets/vila-let/manifest.json').read_text())
    m.update(characterId=a.name,frame_variant='painted',assetType='character-animation',base_image='reference.png',holdLastFrame=hold,renderAnchor={'x':256,'y':488},noFootAlignment=False,description=a.approval)
    m['animation']['columns']=count
    m['animation']['rows']['motion'].update(frames=count,fps=10,loop=loop,holdLastFrame=hold,durations_ms=[100]*count,frame_variant='painted')
    m['frame_layout'].update(sheetWidth=512*count,sheetHeight=512,rows={'motion':[{'x':512*i,'y':0,'w':512,'h':512} for i in range(count)]})
    dump(out/'manifest.json',m)
    qa.update(identityApproved=True,visualReview=a.approval,atlasMatchesFrames=all(atlas.crop((512*i,0,512*(i+1),512)).tobytes()==p.tobytes() for i,p in enumerate(cells)),gifFrames=Image.open(out/'preview.gif').n_frames)
    assert qa['gifFrames']==count
    qa['notes']='Exported after visual identity, size and motion approval.'
    dump(out/'qa.json',qa)
    print('EXPORTED',out)

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('mode',choices=['prepare','export']);p.add_argument('name',choices=NAMES);p.add_argument('attempt',type=int)
    p.add_argument('--source');p.add_argument('--height',type=int,default=330);p.add_argument('--scale-frame',type=int,default=0);p.add_argument('--refs',default='marko-idle-2-kadar0.png');p.add_argument('--approval')
    a=p.parse_args();(prepare if a.mode=='prepare' else export)(a)
