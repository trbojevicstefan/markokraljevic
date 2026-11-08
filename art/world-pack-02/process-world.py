"""User-requested canvas normalization and wrap/half-offset seam retouch."""
from pathlib import Path
from PIL import Image, ImageDraw
import numpy as np, json, subprocess
ROOT=Path(__file__).resolve().parent
W,H,Y=1024,384,64
BLACK=np.array([11,15,16.],dtype=float)
def retouch(a,j,radius=32):
    # Blend in premultiplied RGBA on both sides of the offset join.
    for d in range(radius):
        l=(j-1-d)%a.shape[1];r=(j+d)%a.shape[1]
        weight=(1+np.cos(np.pi*d/radius))/2
        mean=(a[:,l]+a[:,r])/2
        a[:,l]=a[:,l]*(1-weight)+mean*weight
        a[:,r]=a[:,r]*(1-weight)+mean*weight
def image_entry(p,kind,**extra):
    im=Image.open(p).convert('RGBA')
    return dict(id=p.stem,file=p.name,size=list(im.size),bounds=im.getchannel('A').getbbox(),kind=kind,**extra)
entries=[];terrain=[];objects=[]
for src in sorted((ROOT/'sources').glob('tlo-*.png')):
    im=Image.open(src).convert('RGBA');bbox=im.getchannel('A').getbbox()
    if not bbox: raise ValueError('Empty source '+src.name)
    l,t,r,b=bbox;pad=max(2,int((r-l)*.08));l+=pad;r-=pad
    arr=np.array(im);coverage=(arr[:,l:r,3]>240).mean(axis=1)
    candidates=[y for y in range(t,b-8) if np.min(coverage[y:y+8])>.94]
    surface=candidates[0] if candidates else t+int((b-t)*.12)
    body=im.crop((l,surface,r,b)).resize((W,H-Y),Image.Resampling.LANCZOS)
    base=Image.new('RGBA',(W,H-Y),tuple(BLACK.astype(int))+(255,));base.alpha_composite(body)
    out=Image.new('RGBA',(W,H));out.alpha_composite(base,(0,Y))
    # Keep only sparse top detail, never a second broad opaque walking surface.
    detail_h=min(40,round((surface-t)*W/(r-l)))
    if detail_h>0:
        detail=im.crop((l,t,r,surface)).resize((W,detail_h),Image.Resampling.LANCZOS)
        da=np.array(detail)
        for row in range(detail_h):
            if (da[row,:,3]>200).mean()>.85:da[row,:,3]=0
        out.alpha_composite(Image.fromarray(da),(0,Y-detail_h))
    a=np.array(out).astype(float)
    fade=np.clip((np.arange(H)-200)/(H-1-200),0,1)**1.3
    a[Y:,:,:3]=a[Y:,:,:3]*(1-fade[Y:,None,None])+BLACK*fade[Y:,None,None]
    a[-12:,:,:3]=BLACK;a[Y:,:,3]=255
    # Offset half-width, retouch the old wrap in the middle, then restore.
    a[:,:,:3]*=a[:,:,3:4]/255
    shifted=np.roll(a,W//2,axis=1);retouch(shifted,W//2);a=np.roll(shifted,-W//2,axis=1)
    # Retouch the second join exposed by the requested half-offset test too.
    retouch(a,W//2)
    alpha=a[:,:,3:4]/255
    a[:,:,:3]=np.divide(a[:,:,:3],alpha,out=np.zeros_like(a[:,:,:3]),where=alpha>0)
    a=np.clip(np.rint(a),0,255).astype('uint8')
    a[a[:,:,3]==0,:3]=0
    out=Image.fromarray(a,'RGBA');dest=ROOT/src.name;out.save(dest)
    rolled=np.roll(a,W//2,axis=1)
    seam=float(np.abs(a[:,0].astype(float)-a[:,-1]).mean()/255)
    offset=float(np.abs(rolled[:,0].astype(float)-rolled[:,-1]).mean()/255)
    actual=next(y for y in range(H) if (a[y,:,3]==255).mean()>=.95)
    assert out.size==(1024,384) and actual==64 and seam<6/255 and offset<6/255
    assert not a[:24,:,3].any() and np.all(a[-1,:,:3]==BLACK)
    report={'meanDifference':seam,'halfShiftMeanDifference':offset,'threshold':6/255,'passed':True,'retouch':'32px premultiplied wrap blend after half-width offset; second offset join retouched'}
    entries.append(image_entry(dest,'ground',walkY=actual,seamCheck=report))
    terrain.append((src.stem,out))
    # Connected right cliff cap from the same material, with exact matching left column.
    cap=a[:,(np.arange(192)+W-1)%W].copy()
    yy=np.arange(H);edge=150-60*np.clip((yy-Y)/(H-Y),0,1)+5*np.sin(yy*.08)+3*np.sin(yy*.21)
    mask=np.clip(edge[:,None]-np.arange(192)[None,:],0,1)
    cap[:,:,3]=(cap[:,:,3]*mask).astype('uint8');cap[cap[:,:,3]==0,:3]=0
    cp=ROOT/(src.stem+'-kraj.png');Image.fromarray(cap,'RGBA').save(cp)
    assert np.array_equal(cap[:,0],a[:,-1])
    entries.append(image_entry(cp,'ground-end',walkY=64,joinToStripPassed=True))
for src in sorted((ROOT/'sources').glob('cilj-*.png')):
    cleaned=ROOT/'cleaned'/src.name;cleaned.parent.mkdir(exist_ok=True)
    if not cleaned.exists():
        sg=ROOT.parents[2]/'tools/sprite-gen/.venv/Scripts/sprite-gen.exe'
        subprocess.run([str(sg),'cutout',str(src),'--out',str(cleaned),'--erode','1.4','--decontam','auto'],check=True,stdout=subprocess.DEVNULL)
    im=Image.open(cleaned).convert('RGBA');box=im.getchannel('A').getbbox()
    if not box:raise ValueError('Empty object '+src.name)
    wide=src.stem in ['cilj-kapija-zatvorena','cilj-kapija-otvorena','cilj-rudarski-izlaz-zatvoren','cilj-rudarski-izlaz-otvoren','cilj-vodenica']
    canvas=(1024,768 if wide else 1024);obj=im.crop(box)
    target=650 if wide else 440
    scale=min(target/obj.height,960/obj.width)
    obj=obj.resize((round(obj.width*scale),round(obj.height*scale)),Image.Resampling.LANCZOS)
    out=Image.new('RGBA',canvas);out.alpha_composite(obj,((1024-obj.width)//2,canvas[1]-obj.height))
    dest=ROOT/src.name;out.save(dest)
    entries.append(image_entry(dest,'objective',baseline=canvas[1]-1))
    objects.append((src.stem,out))
if objects:
    board=Image.new('RGBA',(1200,300*((len(objects)+3)//4)),(28,38,37,255));bd=ImageDraw.Draw(board)
    for i,(name,im) in enumerate(objects):
        ob=im.crop(im.getchannel('A').getbbox());ob.thumbnail((280,240),Image.Resampling.LANCZOS)
        x=(i%4)*300;y=(i//4)*300
        board.alpha_composite(ob,(x+(300-ob.width)//2,y+250-ob.height));bd.text((x+8,y+265),name,fill='white')
    board.save(ROOT/'predmeti-preview.png');entries.append(image_entry(ROOT/'predmeti-preview.png','preview'))
if terrain:
    preview=Image.new('RGBA',(W*3,len(terrain)*(H+32)),(26,32,33,255));d=ImageDraw.Draw(preview)
    offset_preview=preview.copy();od=ImageDraw.Draw(offset_preview)
    for i,(name,im) in enumerate(terrain):
        y=i*(H+32);d.text((12,y+8),name,fill='white');od.text((12,y+8),name+' / offset 512',fill='white')
        rolled=Image.fromarray(np.roll(np.array(im),512,axis=1))
        for x in range(3):preview.alpha_composite(im,(x*W,y+32));offset_preview.alpha_composite(rolled,(x*W,y+32))
    preview.save(ROOT/'tlo-preview.png');offset_preview.save(ROOT/'tlo-offset-preview.png')
    entries.extend([image_entry(ROOT/'tlo-preview.png','preview'),image_entry(ROOT/'tlo-offset-preview.png','preview')])
(ROOT/'catalog.json').write_text(json.dumps({'generator':'built-in image_gen + requested technical normalization','images':entries},ensure_ascii=False,indent=2),encoding='utf8')
print('Exported:',len(terrain),'ground strips,',len(terrain),'caps,',sum(e['kind']=='objective' for e in entries),'objects; all seam tests passed')
