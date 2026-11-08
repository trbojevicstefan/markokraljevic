from pathlib import Path
from PIL import Image,ImageDraw
import numpy as np,json,subprocess,sys
ROOT=Path(__file__).resolve().parent
SG=ROOT.parents[2]/'tools/sprite-gen/.venv/Scripts/sprite-gen.exe'
def stitch(a,axis,j,radius=24):
    b=np.swapaxes(a,0,axis);n=len(b)
    for d in range(radius):
        l=(j-1-d)%n;r=(j+d)%n;w=(1+np.cos(np.pi*d/radius))/2;m=(b[l]+b[r])/2
        b[l]=b[l]*(1-w)+m*w;b[r]=b[r]*(1-w)+m*w
def periodic(im,axes):
    a=np.array(im.convert('RGBA')).astype(float);a[:,:,:3]*=a[:,:,3:4]/255
    for axis in axes:
        stitch(a,axis,0);stitch(a,axis,a.shape[axis]//2)
    alpha=a[:,:,3:4]/255;a[:,:,:3]=np.divide(a[:,:,:3],alpha,out=np.zeros_like(a[:,:,:3]),where=alpha>0)
    a=np.clip(np.rint(a),0,255).astype('uint8');a[a[:,:,3]==0,:3]=0
    return Image.fromarray(a)
def clean(src):
    if src.stem=='cudo-musina-sablja':
        a=np.array(Image.open(src).convert('RGBA'));a[:,:,3]=np.clip((a[:,:,3].astype(float)-128)*255/124,0,255).astype('uint8');a[a[:,:,3]==0,:3]=0
        return Image.fromarray(a)
    dst=ROOT/'cleaned'/src.name;dst.parent.mkdir(exist_ok=True)
    if not dst.exists():subprocess.run([str(SG),'cutout',str(src),'--out',str(dst),'--erode','1.4','--decontam','auto'],check=True,stdout=subprocess.DEVNULL)
    return Image.open(dst).convert('RGBA')
def ground(src,j):
    im=Image.open(src).convert('RGBA');l,t,r,b=im.getchannel('A').getbbox();pad=int((r-l)*.08);l+=pad;r-=pad
    a=np.array(im);coverage=(a[:,l:r,3]>240).mean(axis=1)
    ys=[y for y in range(t,b-8) if min(coverage[y:y+8])>.94];surface=ys[0] if ys else t+int((b-t)*.12)
    body=im.crop((l,surface,r,b)).resize((1024,320),Image.Resampling.LANCZOS)
    base=Image.new('RGBA',(1024,320),(11,15,16,255));base.alpha_composite(body)
    result=Image.new('RGBA',(1024,384));result.alpha_composite(base,(0,64))
    dh=min(40,round((surface-t)*1024/(r-l)))
    if dh:
        detail=im.crop((l,t,r,surface)).resize((1024,dh),Image.Resampling.LANCZOS);da=np.array(detail)
        for y in range(dh):
            if (da[y,:,3]>200).mean()>.85:da[y,:,3]=0
        result.alpha_composite(Image.fromarray(da),(0,64-dh))
    a=np.array(result).astype(float);fade=np.clip((np.arange(384)-200)/183,0,1)**1.3
    a[64:,:,:3]=a[64:,:,:3]*(1-fade[64:,None,None])+np.array([11,15,16])*fade[64:,None,None];a[-12:,:,:3]=[11,15,16];a[64:,:,3]=255
    # DOPUNA A: exact road line; omit optional tufts and extraction fringe above it.
    a[:64]=0
    result=periodic(Image.fromarray(np.rint(a).astype('uint8')),[1]);a=np.array(result)
    seam=float(abs(a[:,0].astype(float)-a[:,-1]).mean()/255);shift=np.roll(a,512,axis=1);offset=float(abs(shift[:,0].astype(float)-shift[:,-1]).mean()/255)
    walk=next(y for y in range(384) if (a[y,:,3]==255).mean()>=.95);assert walk==64 and seam<6/255 and offset<6/255
    result.save(ROOT/(j['id']+'.png'))
    cap=a[:,(np.arange(192)+1023)%1024].copy();yy=np.arange(384);edge=150-60*np.clip((yy-64)/320,0,1)+5*np.sin(yy*.08)+3*np.sin(yy*.21)
    cap[:,:,3]=(cap[:,:,3]*np.clip(edge[:,None]-np.arange(192)[None,:],0,1)).astype('uint8');cap[cap[:,:,3]==0,:3]=0
    cp=Image.fromarray(cap);cp.save(ROOT/(j['id']+'-kraj.png'));assert np.array_equal(cap[:,0],a[:,-1])
    preview=Image.new('RGBA',(3072,384),(25,37,36,255))
    for x in range(3):preview.alpha_composite(result,(1024*x,0))
    preview.save(ROOT/'oranje-tlo-preview.png')
    return [dict(id=j['id'],file=j['id']+'.png',size=[1024,384],bounds=result.getchannel('A').getbbox(),kind='ground',group=3,walkY=64,seamCheck={'horizontal':seam,'halfShift':offset,'passed':True}),dict(id=j['id']+'-kraj',file=j['id']+'-kraj.png',size=[192,384],bounds=cp.getchannel('A').getbbox(),kind='ground-end',group=3,walkY=64)]
jobs=[]
for p in sorted(ROOT.glob('plan-g*.json')):jobs.extend(json.loads(p.read_text(encoding='utf8'))['jobs'])
old={}
if (ROOT/'catalog.json').exists():old={e['id']:e for e in json.loads((ROOT/'catalog.json').read_text(encoding='utf8'))['images']}
entries=[]
for j in jobs:
    src=ROOT/j.get('source','sources/'+j['id']+'.png')
    if j['id']=='kula-strazara' and (ROOT/'sources/kula-strazara-key.png').exists():src=ROOT/'sources/kula-strazara-key.png'
    if not src.exists():continue
    if (ROOT/f"{j['id']}.png").exists() and j['id'] in old and j['id'] not in sys.argv[1:]:
        entries.append(old[j['id']]);continue
    kind=j['kind'];size=tuple(j['canvas']);extra={}
    if 'reusedFrom' in j:extra['reusedFrom']=j['reusedFrom']
    if 'orientation' in j:extra['orientation']=j['orientation']
    if kind=='ground':entries.extend(ground(src,j));continue
    if kind=='background':
        im=Image.open(src).convert('RGBA').resize(size,Image.Resampling.LANCZOS)
        if not j['alpha']:
            opaque=Image.new('RGBA',size,(11,15,16,255));opaque.alpha_composite(im);im=opaque
        im=periodic(im,[1]);a=np.array(im).astype(float);diff=float(abs(a[:,0]-a[:,-1]).mean()/255);assert diff<6/255
        extra['seamCheck']={'horizontal':diff,'threshold':6/255,'passed':True}
    elif kind=='overlay':
        im=Image.open(src).convert('RGBA').resize(size,Image.Resampling.LANCZOS)
    elif kind=='repeat-row':
        ob=clean(src);ob=ob.crop(ob.getchannel('A').getbbox()).resize((size[0],j['height']),Image.Resampling.LANCZOS)
        im=Image.new('RGBA',size);im.alpha_composite(ob,(0,size[1]-ob.height));im=periodic(im,[1])
        a=np.array(im).astype(float);diff=float(abs(a[:,0]-a[:,-1]).mean()/255);assert diff<6/255
        extra['seamCheck']={'horizontal':diff,'threshold':6/255,'passed':True}
    elif kind=='tile':
        im=Image.open(src).convert('RGB').resize(size,Image.Resampling.LANCZOS).convert('RGBA');im=periodic(im,[1,0])
        a=np.array(im).astype(float);sx=float(abs(a[:,0]-a[:,-1]).mean()/255);sy=float(abs(a[0]-a[-1]).mean()/255)
        assert sx<6/255 and sy<6/255
        extra['seamCheck']={'horizontal':sx,'vertical':sy,'threshold':6/255,'passed':True}
    elif kind=='ladder':
        ob=clean(src);ob=ob.crop(ob.getchannel('A').getbbox()).resize((256,128),Image.Resampling.LANCZOS)
        module=Image.new('RGBA',(256,128))
        for x,patch in [(44,ob.crop((0,0,32,128))),(188,ob.crop((224,0,256,128)))]:
            patch=patch.resize((24,128),Image.Resampling.LANCZOS);a=np.array(patch);mask=a[:,:,3]>100
            col=np.median(a[:,:,:3][mask],axis=0) if mask.any() else np.array([100,65,33])
            a[a[:,:,3]<100,:3]=col;a[:,:,3]=255;module.alpha_composite(Image.fromarray(a),(x,0))
        rung=ob.crop((16,48,240,80)).resize((144,18),Image.Resampling.LANCZOS);module.alpha_composite(rung,(56,55))
        module=periodic(module,[0]);im=Image.new('RGBA',(256,1024))
        for y in range(0,1024,128):im.alpha_composite(module,(0,y))
        a=np.array(im).astype(float);diff=float(abs(a[0]-a[-1]).mean()/255);assert diff<6/255
        extra.update(railCenters=[56,200],rungCenters=list(range(64,1024,128)),rungSpacing=128,seamCheck={'vertical':diff,'passed':True})
    else:
        ob=clean(src);box=ob.getchannel('A').getbbox()
        if not box:raise ValueError('Empty '+j['id'])
        ob=ob.crop(box)
        if kind=='ladder-top':target=(168,240);ob=ob.resize(target,Image.Resampling.LANCZOS)
        else:
            s=min(j['height']/ob.height,(size[0]-32)/ob.width)
            if 'widthReference' in j:
                ref=Image.open(ROOT.parents[1]/j['widthReference']).convert('RGBA');rb=ref.getchannel('A').getbbox()
                s=min((rb[2]-rb[0])/ob.width,(size[1]-8)/ob.height)
            ob=ob.resize((round(ob.width*s),round(ob.height*s)),Image.Resampling.LANCZOS)
        im=Image.new('RGBA',size);im.alpha_composite(ob,((size[0]-ob.width)//2,size[1]-ob.height))
        if kind=='tower' and not (ROOT/'tower-anchor.json').exists():
            im.save(ROOT/'sources/kula-candidate.png');continue
        if kind=='tower' and (ROOT/'tower-anchor.json').exists():
            anchor=json.loads((ROOT/'tower-anchor.json').read_text());old=anchor['sourceDeckY'];new=341
            top=im.crop((0,0,1024,old)).resize((1024,new),Image.Resampling.LANCZOS)
            low=im.crop((0,old,1024,1024)).resize((1024,1024-new),Image.Resampling.LANCZOS)
            im=Image.new('RGBA',(1024,1024));im.alpha_composite(top);im.alpha_composite(low,(0,new))
            extra.update(deckY=new,deckX0=anchor['deckX0'],deckX1=anchor['deckX1'])
        extra['baseline']=size[1]-1
        if kind in ['portal-open','portal-closed']:
            af=ROOT/'portal-anchors.json';anchors=json.loads(af.read_text(encoding='utf8')) if af.exists() else {}
            key=j.get('anchorReference',j['id']);anchor=anchors.get(key,{})
            xs=anchor.get('xScale',1)
            if xs!=1:
                box=im.getchannel('A').getbbox();ob=im.crop(box);nw=round(ob.width*xs)
                assert nw<=size[0]-16,'Portal horizontal normalization clips artwork'
                ob=ob.resize((nw,ob.height),Image.Resampling.LANCZOS);im=Image.new('RGBA',size);im.alpha_composite(ob,((size[0]-nw)//2,size[1]-ob.height))
            if not all(k in anchor for k in ['passX0','passX1','archY']):
                qa=ROOT/'sources/review';qa.mkdir(parents=True,exist_ok=True);im.save(qa/(j['id']+'-candidate.png'));print('Awaiting passage anchors:',j['id']);continue
            extra.update({k:anchor[k] for k in ['passX0','passX1','archY']});extra['normalizationXScale']=xs
            assert 220<=extra['passX1']-extra['passX0']<=300 and size[1]-extra['archY']>=420
            if kind=='portal-open':
                a=np.array(im);rect=a[extra['archY']:,extra['passX0']:extra['passX1'],3]
                assert (rect<64).mean()>.995,'Open passage is obstructed'
        if kind=='portcullis':
            box=im.getchannel('A').getbbox();extra.update(passX0=box[0],passX1=box[2],archY=box[1],anchorNote='archY is upper mounting line; standalone portcullis has no arch')
    dst=ROOT/f"{j['id']}.png";im.save(dst)
    entries.append(dict(id=j['id'],file=dst.name,size=list(im.size),bounds=im.getchannel('A').getbbox(),kind=kind,group=j['group'],**extra))
for prefix,name,columns in [('cudo-','cuda-preview.png',4),('razbi-','razbi-preview.png',3)]:
    if (ROOT/name).exists() and name[:-4] in old and not any(a.startswith(prefix) for a in sys.argv[1:]):
        entries.append(old[name[:-4]]);continue
    selected=[e for e in entries if e['id'].startswith(prefix)]
    if not selected:continue
    board=Image.new('RGBA',(columns*280,300*((len(selected)+columns-1)//columns)),(25,37,36,255));d=ImageDraw.Draw(board)
    for i,e in enumerate(selected):
        ob=Image.open(ROOT/e['file']).convert('RGBA');ob=ob.crop(ob.getchannel('A').getbbox());ob.thumbnail((250,240),Image.Resampling.LANCZOS)
        x=(i%columns)*280;y=(i//columns)*300;board.alpha_composite(ob,(x+(280-ob.width)//2,y+250-ob.height));d.text((x+8,y+267),e['id'],fill='white')
    board.save(ROOT/name);entries.append(dict(id=name[:-4],file=name,size=list(board.size),bounds=board.getchannel('A').getbbox(),kind='preview',group=1))
anim=ROOT.parent/'animation-pack-04';groups={}
for p in anim.glob('plan-g*.json'):
    groups.update({j['id']:j['group'] for j in json.loads(p.read_text(encoding='utf8'))['jobs']})
for folder in sorted((anim/'assets').glob('*')):
    for p in sorted(folder.rglob('*.png')):
        if p.name not in ['atlas.png','reference.png','base-source.png'] and not p.name.startswith('frame-'):continue
        im=Image.open(p).convert('RGBA');kind='animation-frame' if p.name.startswith('frame-') else 'animation-atlas' if p.name=='atlas.png' else 'animation-reference'
        entries.append(dict(id=folder.name+':'+p.stem,file='../animation-pack-04/'+p.relative_to(anim).as_posix(),size=list(im.size),bounds=im.getchannel('A').getbbox(),kind=kind,group=groups.get(folder.name,3 if folder.name=='volovi' else 4)))
for p in anim.glob('preview*.png'):
    im=Image.open(p).convert('RGBA');entries.append(dict(id='animations-'+p.stem,file='../animation-pack-04/'+p.name,size=list(im.size),bounds=im.getchannel('A').getbbox(),kind='preview',group=0))
merged={k:e for k,e in old.items() if (ROOT/e['file']).exists()};merged.update({e['id']:e for e in entries});entries=list(merged.values())
final={e['id']:e for e in entries}
for p in ROOT.glob('*preview.png'):
    im=Image.open(p).convert('RGBA')
    group=7 if p.stem in ['collectibles-preview','puzzles-preview','prepreke-spoj-preview'] else 3 if p.stem.startswith('oranje') else 1
    final[p.stem]=dict(id=p.stem,file=p.name,size=list(im.size),bounds=im.getchannel('A').getbbox(),kind='preview',group=group)
entries=list(final.values())
temp=ROOT/'catalog.json.tmp';temp.write_text(json.dumps({'generator':'built-in image_gen','images':entries},ensure_ascii=False,indent=2),encoding='utf8');temp.replace(ROOT/'catalog.json')
print('Published',len(entries),'images')
