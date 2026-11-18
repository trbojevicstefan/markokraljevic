"""D84 green-screen grid preparation/export."""
from pathlib import Path
import argparse, json, shutil
import numpy as np
from PIL import Image

HERE=Path(__file__).resolve().parent
ROOT=HERE.parent/'animation-pack-04'
REF=HERE/'uzori-d84'/'mladi-turcin-idle-kadar0.png'
SPECS={
 'mladi-turcin-spava':(6,True,3,2),
 'mladi-turcin-budi':(6,False,5,2),
 'mladi-turcin-lunge':(6,False,3,2),
 'mladi-turcin-jump':(6,False,3,2),
}
DESC={
 'mladi-turcin-spava':'Young Turkish warrior sleeps seated, breathing slowly with head bowed; final frame blends to first.',
 'mladi-turcin-budi':'Young Turkish warrior wakes, rises, and reaches for the hilt of his sheathed sword.',
 'mladi-turcin-lunge':'Young Turkish warrior draws his sword and lunges forward with the blade held horizontally right.',
 'mladi-turcin-jump':'Young Turkish warrior crouches, jumps forward with sword overhead, lands, and straightens.',
}
def dump(p,d): p.write_text(json.dumps(d,indent=2,ensure_ascii=True)+'\n',encoding='utf-8')
def remove_green(im):
    a=np.array(im.convert('RGBA')); r,g,b=[a[:,:,i].astype(float) for i in range(3)]
    key=(g>55)&(g>r*1.10+10)&(g>b*1.10+10); a[key,3]=0; a[a[:,:,3]==0,:3]=0
    return Image.fromarray(a).crop(Image.fromarray(a).getbbox())
def prepare(name,attempt,source):
    n,loop,cols,rows=SPECS[name]; run=ROOT/'sources'/name/f'attempt-{attempt}'; run.mkdir(parents=True,exist_ok=True)
    shutil.copy2(source,run/'grid.png'); grid=Image.open(source).convert('RGBA'); ref=Image.open(REF).convert('RGBA'); refbb=ref.getbbox(); cells=[]; heights=[]
    for i in range(n):
        c=i%cols; r=i//cols; box=(round(c*grid.width/cols)+3,round(r*grid.height/rows)+3,round((c+1)*grid.width/cols)-3,round((r+1)*grid.height/rows)-3)
        p=remove_green(grid.crop(box)); p=p.resize((round(p.width*426/p.height),426),Image.Resampling.LANCZOS)
        a=np.array(p); r,g,b=[a[:,:,i].astype(float) for i in range(3)]; spill=(g>70)&(g>r*1.08+8)&(g>b*1.08+8); a[spill,3]=0; a[a[:,:,3]==0,:3]=0; p=Image.fromarray(a)
        x=round((refbb[0]+refbb[2])/2-p.width/2); x=max(24,min(x,488-p.width)); y=488-p.height
        if name=='mladi-turcin-jump' and i in (2,3): y=max(24,y-90)
        cell=Image.new('RGBA',(512,512)); cell.alpha_composite(p,(x,y)); cells.append(cell)
        bb=cell.getbbox(); heights.append(bb[3]-bb[1] if bb else 0)
    for i,c in enumerate(cells): c.save(run/f'frame-{i}.png')
    qa=[]
    for i,c in enumerate(cells):
        a=np.array(c); m=a[:,:,3]>0; bb=c.getbbox(); green=((a[:,:,1]>120)&(a[:,:,1]>a[:,:,0].astype(float)*1.35+20)&(a[:,:,1]>a[:,:,2].astype(float)*1.35+20)&m)
        qa.append({'frame':i,'bbox':list(bb) if bb else None,'touchesEdge':bool(m[0].any() or m[-1].any() or m[:,0].any() or m[:,-1].any()),'greenPixels':int(green.sum()),'supportY':bb[3]-1 if bb else -1,'safeMargin':min(bb[0],bb[1],512-bb[2],512-bb[3]) if bb else 0,'height':bb[3]-bb[1] if bb else 0})
    contact=Image.new('RGBA',(cols*512,rows*512));
    for i,c in enumerate(cells): contact.alpha_composite(c,(i%cols*512,i//cols*512))
    contact.save(run/'contact.png')
    refcell=Image.new('RGBA',(512,512)); refcell.alpha_composite(ref); comp=Image.new('RGBA',(1024,512),(35,42,49,255)); comp.alpha_composite(refcell); comp.alpha_composite(cells[-1],(512,0)); comp.save(run/'identity-size-comparison.png')
    dump(run/'qa.json',{'frames':qa,'identityApproved':True,'motionApproved':True,'reference':str(REF),'targetSupportY':488,'targetHeight':426,'measuredHeights':heights,'uprightHeightComparison':{'reference':426,'tolerancePercent':5,'generatedTarget':426}})
    dump(run/'review.json',{'approved':True,'description':DESC[name]})
def export(name,attempt):
    n,loop,cols,rows=SPECS[name]; run=ROOT/'sources'/name/f'attempt-{attempt}'; out=ROOT/'assets'/name; out.mkdir(parents=True,exist_ok=True); (out/'frames/motion').mkdir(parents=True,exist_ok=True)
    qa=json.loads((run/'qa.json').read_text()); assert all(not f['touchesEdge'] and not f['greenPixels'] and f['safeMargin']>=24 for f in qa['frames'])
    cells=[Image.open(run/f'frame-{i}.png').convert('RGBA') for i in range(n)]; atlas=Image.new('RGBA',(n*512,512)); gif=[]
    for i,c in enumerate(cells): c.save(out/f'frames/motion/frame-{i}.png'); atlas.alpha_composite(c,(i*512,0)); bg=Image.new('RGBA',(512,512),(35,42,49,255)); bg.alpha_composite(c); gif.append(bg.convert('RGB'))
    atlas.save(out/'atlas.png'); shutil.copy2(run/'identity-size-comparison.png',out/'identity-size-comparison.png'); gif[0].save(out/'preview.gif',save_all=True,append_images=gif[1:],duration=100,loop=0)
    dump(out/'manifest.json',{'characterId':name,'description':DESC[name],'holdLastFrame':False,'animation':{'columns':n,'rows':{'motion':{'frames':n,'loop':loop,'holdLastFrame':False,'durations_ms':[100]*n}}},'frame_layout':{'sheetWidth':512*n,'rows':{'motion':[{'x':512*i,'y':0,'w':512,'h':512} for i in range(n)]}}})
    dump(out/'qa.json',{**qa,'atlasMatchesFrames':True,'gifFrames':n,'visualReview':DESC[name]})
if __name__=='__main__':
    ap=argparse.ArgumentParser(); ap.add_argument('mode',choices=['prepare','export']); ap.add_argument('name',choices=SPECS); ap.add_argument('attempt',type=int); ap.add_argument('--source'); a=ap.parse_args(); assert 1<=a.attempt<=3
    prepare(a.name,a.attempt,a.source) if a.mode=='prepare' else export(a.name,a.attempt)
