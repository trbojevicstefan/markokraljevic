"""D55-only staging, chroma extraction and export. Never touches other clips."""
from pathlib import Path
import json, sys, shutil
import numpy as np
from PIL import Image
from scipy import ndimage

BASE=Path(__file__).resolve().parents[2]
PACK=BASE/'art/animation-pack-04'
REF=BASE/'art/world-pack-03/uzori-d54'
STATUS=BASE/'art/world-pack-03/STATUS-D55.md'
NAMES=['kopljanik-spava','kopljanik-budi','akindzija-spava','akindzija-budi','palikuca-spava','palikuca-budi','oklopnik-spava','oklopnik-budi','shield-climb','kopljanik-climb','akindzija-climb','palikuca-climb','shield-tiho-pada','kopljanik-tiho-pada','akindzija-tiho-pada','palikuca-tiho-pada','oklopnik-tiho-pada','pas-jump','djemo-jump','pas-omamljen','arapin-omamljen','pas-drugi','archer-drugi','palikuca-drugi','tufekdzija-drugi']
def dump(p,obj): p.write_text(json.dumps(obj,indent=2,ensure_ascii=True),encoding='utf-8')
def settings(name):
    assert name in NAMES
    who,act=name.split('-',1)
    n=4 if act=='spava' else 5 if act=='budi' else 6
    return who,act,n,act in ('spava','climb','omamljen'),act in ('budi','tiho-pada')
def timing(name):
    act=settings(name)[1]
    refname='sword-'+act
    m=json.loads((PACK/'assets'/refname/'manifest.json').read_text(encoding='utf-8-sig'))
    row=m['animation']['rows']['motion']
    return row['fps'],row['durations_ms']
def gif_write(out,n,loop,durations):
    gifs=[]
    for i in range(n):
        f=Image.open(out/f'frames/motion/frame-{i}.png').convert('RGBA')
        rgb=Image.new('RGB',f.size,(255,0,255));rgb.paste(f,mask=f.getchannel('A'));p=rgb.quantize(colors=255);p.info['transparency']=p.getpixel((0,0));gifs.append(p)
    opts={'loop':0} if loop else {}
    total=0;prev=0;ticks=[]
    for ms in durations:
        total+=ms;now=round(total/10)*10;ticks.append(now-prev);prev=now
    gifs[0].save(out/'preview.gif',save_all=True,append_images=gifs[1:],duration=ticks,disposal=2,transparency=gifs[0].info['transparency'],optimize=False,**opts)
def fix_timing():
    for name in NAMES:
        out=PACK/'assets'/name
        if not out.exists():continue
        who,act,n,loop,hold=settings(name);fps,durations=timing(name)
        m=json.loads((out/'manifest.json').read_text());m['animation']['rows']['motion'].update(fps=fps,durations_ms=durations)
        dump(out/'manifest.json',m);gif_write(out,n,loop,durations)
        print(name,fps,durations)
def stage(name,attempt,src,prompt):
    settings(name)
    d=PACK/'sources'/name/f'attempt-{attempt}'
    assert 1<=int(attempt)<=3
    d.mkdir(parents=True,exist_ok=True)
    shutil.copy2(src,d/'grid.png')
    (d/'prompt.txt').write_text(prompt,encoding='utf-8')
    return d
def extract(name,attempt):
    who,act,n,loop,hold=settings(name)
    d=PACK/'sources'/name/f'attempt-{attempt}'
    grid=Image.open(d/'grid.png').convert('RGB'); cols=2 if n==4 else 3
    a=np.array(grid).astype(float)
    # Key and despill only; no painting or synthesizing motion.
    r,g,b=a[:,:,0],a[:,:,1],a[:,:,2]
    green=(g>100)&(g>r*1.25+15)&(g>b*1.25+15)
    alpha=np.where(green,0,255).astype('uint8')
    a[:,:,1]=np.where((g>r*1.12)&(g>b*1.12),np.minimum(g,np.maximum(r,b)),g)
    rgba=Image.fromarray(np.dstack((a.astype('uint8'),alpha)))
    pieces=[]
    for i in range(n):
        x0=round((i%cols)*grid.width/cols); x1=round((i%cols+1)*grid.width/cols)
        y0=round((i//cols)*grid.height/2); y1=round((i//cols+1)*grid.height/2)
        p=rgba.crop((x0,y0,x1,y1)); bb=p.getbbox()
        assert bb, 'empty cell'
        pieces.append(p.crop(bb))
    ref=Image.open(REF/f'{who}-idle-kadar0.png').convert('RGBA'); rb=ref.getbbox(); rh=rb[3]-rb[1]
    target=rh*(0.72 if act=='spava' else 0.75 if act=='jump' else 1)
    if name=='palikuca-drugi':target=348 # Source body height excludes overhead idle flame.
    anchor= n-1 if act in ('budi','drugi') else 0
    # Single uniform scale for the entire clip, keeps articulation and body size.
    scale=target/pieces[anchor].height
    scale=min(scale,min(464/p.width for p in pieces),min(464/p.height for p in pieces))
    cells=[]; qa=[]
    for i,p in enumerate(pieces):
        q=p.resize((max(1,round(p.width*scale)),max(1,round(p.height*scale))),Image.Resampling.LANCZOS)
        bottom=488 # Last opaque row487: full24px bottom margin, within y488 +/-6.
        if act=='jump' and 1<=i<=4:
            bottom=([489,450,395,365,425,489] if who=='pas' else [489,470,440,415,450,489])[i]
        if name=='pas-drugi' and i in (2,3):bottom=465
        c=Image.new('RGBA',(512,512)); c.alpha_composite(q,((512-q.width)//2,bottom-q.height))
        ca=np.array(c); cr,cg,cb=[ca[:,:,j].astype(float) for j in range(3)]
        spill=(cg>120)&(cg>cr*1.35+20)&(cg>cb*1.35+20)
        ca[:,:,1]=np.where(spill,np.maximum(cr,cb),cg).astype('uint8')
        c=Image.fromarray(ca)
        cells.append(c)
        bb=c.getbbox(); ar=np.array(c); mask=ar[:,:,3]>0
        labs,count=ndimage.label(mask); sizes=np.bincount(labs.ravel())[1:]
        qa.append({'frame':i,'bbox':list(bb),'touchesEdge':bb[0]==0 or bb[1]==0 or bb[2]==512 or bb[3]==512,'components':int(sum(sizes>=8)),'greenPixels':int(((ar[:,:,1]>120)&(ar[:,:,1]>ar[:,:,0].astype(float)*1.35+20)&(ar[:,:,1]>ar[:,:,2].astype(float)*1.35+20)&mask).sum()),'supportY':bb[3]-1})
    (d/'frames/motion').mkdir(parents=True,exist_ok=True)
    atlas=Image.new('RGBA',(512*n,512))
    for i,c in enumerate(cells): c.save(d/f'frames/motion/frame-{i}.png'); atlas.alpha_composite(c,(512*i,0))
    atlas.save(d/'atlas.png')
    board=Image.new('RGBA',(1024,512),(40,40,40,255));board.alpha_composite(ref,(0,0));board.alpha_composite(cells[0],(512,0));board.save(d/'identity-size-comparison.png')
    thumb=Image.new('RGBA',(512*cols,1024),(40,40,40,255))
    for i,c in enumerate(cells):thumb.alpha_composite(c,(512*(i%cols),512*(i//cols)))
    thumb.save(d/'contact.png')
    dump(d/'qa.json',{'clip':name,'identityApproved':False,'atlasMatchesFrames':True,'scale':scale,'referenceHeight':rh,'frames':qa})
    print(d.as_posix()); print(json.dumps(qa))
def export(name,attempt,review):
    who,act,n,loop,hold=settings(name);d=PACK/'sources'/name/f'attempt-{attempt}';out=PACK/'assets'/name
    qa=json.loads((d/'qa.json').read_text());assert all(not f['touchesEdge'] and not f['greenPixels'] for f in qa['frames'])
    assert not out.exists(), 'Do not overwrite existing assets'
    dump(d/'review.json',{'approved':True,'identityApproved':True,'weaponApproved':True,'motionApproved':True,'notes':review})
    out.mkdir(parents=True); shutil.copytree(d/'frames',out/'frames')
    for f in ['atlas.png','identity-size-comparison.png']:shutil.copy2(d/f,out/f)
    shutil.copy2(REF/f'{who}-idle-kadar0.png',out/'reference.png')
    qa.update(identityApproved=True,weaponApproved=True,motionApproved=True,review=review)
    dump(out/'qa.json',qa)
    template=json.loads((PACK/'assets/sword-climb/manifest.json').read_text(encoding='utf-8-sig'))
    fps,durations=timing(name)
    motion=template['animation']['rows']['motion'];motion.update(frames=n,fps=fps,loop=loop,holdLastFrame=hold,durations_ms=durations)
    template.update(characterId=name,description=f'{who} {act} animation; D55 identity reference edit.',holdLastFrame=hold,base_image='reference.png',identityReferences=[f'art/world-pack-03/uzori-d54/{who}-idle-kadar0.png'])
    template['animation']['columns']=n
    template['frame_layout']={'sheetWidth':512*n,'sheetHeight':512,'cellWidth':512,'cellHeight':512,'rows':{'motion':[dict(x=512*i,y=0,w=512,h=512) for i in range(n)]}}
    template['scaleReference']={'identityIdle':template['identityReferences'][0],'referenceHeight':qa['referenceHeight'],'appliedUniformScale':qa['scale'],'footY':487,'requestedBaselineY':488,'baselineTolerancePixels':6}
    template.pop('sprite_sheet_alpha_report',None)
    dump(out/'manifest.json',template)
    gif_write(out,n,loop,durations)
    with STATUS.open('a',encoding='utf-8') as f:f.write(f'\n- D55 {name}: IZVEZENO; {n} kadrova; pokusaji {attempt}/3; identitet, razmera, oslonac, celo oruzje i alfa pregledani. {review}\n')
    print('EXPORTED',name)
def refresh():
    for name in NAMES:
        out=PACK/'assets'/name
        if not out.exists():continue
        approved=[t for t in (PACK/'sources'/name).glob('attempt-*') if json.loads((t/'review.json').read_text())['approved']]
        assert len(approved)==1
        d=approved[0];extract(name,d.name.split('-')[1])
        old=json.loads((out/'qa.json').read_text());qa=json.loads((d/'qa.json').read_text())
        qa.update({k:old[k] for k in ['identityApproved','weaponApproved','motionApproved','review']})
        qa.update(safeMarginPixels=24,groundSupportY=487,baselineTolerancePixels=6)
        for f in ['atlas.png','identity-size-comparison.png']:shutil.copy2(d/f,out/f)
        for p in (d/'frames/motion').glob('frame-*.png'):shutil.copy2(p,out/'frames/motion'/p.name)
        dump(out/'qa.json',qa)
        m=json.loads((out/'manifest.json').read_text());m['scaleReference']['footY']=487
        m['scaleReference']['requestedBaselineY']=488;m['scaleReference']['baselineTolerancePixels']=6
        dump(out/'manifest.json',m)
    fix_timing()
if __name__=='__main__':
    if sys.argv[1:] == ['refresh']:
        refresh();sys.exit(0)
    if sys.argv[1:] == ['fix-timing']:
        fix_timing();sys.exit(0)
    cmd,name,attempt,*args=sys.argv[1:]
    if cmd=='stage':stage(name,attempt,*args)
    elif cmd=='extract':extract(name,attempt)
    elif cmd=='export':export(name,attempt,*args)
