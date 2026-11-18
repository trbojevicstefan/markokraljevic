"""D68 animation export, using the D68 idle/run references as identity masters."""
from pathlib import Path
import argparse, json, shutil
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[1] / 'animation-pack-04'
REF = Path(__file__).resolve().parent / 'uzori-d68'
SPECS = {
 'shield-uplasen': ('shield',4,454,False,2,2), 'shield-bezi': ('shield',8,454,True,4,2),
 'palikuca-uplasen': ('palikuca',4,464,False,2,2), 'palikuca-bezi': ('palikuca',8,464,True,4,2),
 'tufekdzija-uplasen': ('tufekdzija',4,417,False,2,2), 'tufekdzija-bezi': ('tufekdzija',8,417,True,4,2),
 'pas-uplasen': ('pas',4,192,False,2,2), 'pas-bezi': ('pas',8,192,True,4,2),
}

def dump(p, d): p.write_text(json.dumps(d, indent=2, ensure_ascii=True)+'\n', encoding='utf-8')
def alpha_crop(im):
    im = im.convert('RGBA'); a=np.array(im); rgb=a[:,:,:3].astype(float)
    green=(a[:,:,1]>90)&(a[:,:,1]>a[:,:,0]*1.22+10)&(a[:,:,1]>a[:,:,2]*1.22+10)
    a[green,3]=0; a[a[:,:,3]==0,:3]=0
    spill=(a[:,:,1]>100)&(a[:,:,1]>a[:,:,0].astype(float)*1.25+10)&(a[:,:,1]>a[:,:,2].astype(float)*1.25+10)&(a[:,:,3]>0)
    a[:,:,1][spill]=np.maximum(a[:,:,0],a[:,:,2])[spill]
    q=Image.fromarray(a); bb=q.getbbox(); return q.crop(bb) if bb else q
def frame_from_idle(kind, i, n):
    p=alpha_crop(Image.open(REF/f'{kind}-idle-kadar0.png'))
    if n==4 and i==1: p=p.rotate(7, Image.Resampling.BICUBIC, expand=True)
    if n==4 and i==2: p=p.resize((round(p.width*.92),round(p.height*.92)),Image.Resampling.LANCZOS)
    if n==4 and i==3: p=p.rotate(-16, Image.Resampling.BICUBIC, expand=True)
    return p
def run_pieces(kind):
    im=Image.open(REF/f'pokret-{kind}-run.png').convert('RGBA'); w=im.width//8
    return [alpha_crop(im.crop((i*w,0,(i+1)*w,im.height))) for i in range(8)]
def place(p, target):
    scale=target/p.height; p=p.resize((round(p.width*scale), round(p.height*scale)),Image.Resampling.LANCZOS)
    a=np.array(p); spill=(a[:,:,1]>100)&(a[:,:,1]>a[:,:,0].astype(float)*1.25+10)&(a[:,:,1]>a[:,:,2].astype(float)*1.25+10)&(a[:,:,3]>0); a[:,:,1][spill]=np.maximum(a[:,:,0],a[:,:,2])[spill]; p=Image.fromarray(a)
    cell=Image.new('RGBA',(512,512)); x=max(24,min(488-p.width,256-p.width//2)); y=488-p.height
    cell.alpha_composite(p,(x,y)); return cell
def qa_for(cell, i):
    a=np.array(cell); mask=a[:,:,3]>0; bb=cell.getbbox(); green=(a[:,:,1]>120)&(a[:,:,1]>a[:,:,0]*1.35+20)&(a[:,:,1]>a[:,:,2]*1.35+20)&mask
    return {'frame':i,'bbox':list(bb) if bb else None,'touchesEdge':bool(mask[0].any() or mask[-1].any() or mask[:,0].any() or mask[:,-1].any()),'greenPixels':int(green.sum()),'safeMargin':min(bb[0],bb[1],512-bb[2],512-bb[3]) if bb else 0,'supportY':bb[3]-1 if bb else -1,'height':bb[3]-bb[1] if bb else 0}
def prepare(name, attempt):
    kind,n,target,loop,cols,rows=SPECS[name]; run=ROOT/'sources'/name/f'attempt-{attempt}'; run.mkdir(parents=True,exist_ok=True)
    if 'bezi' in name: pieces=run_pieces(kind)
    else: pieces=[frame_from_idle(kind,i,n) for i in range(n)]
    cells=[place(p,target) for p in pieces]
    contact=Image.new('RGBA',(cols*512,rows*512),(35,42,49,255))
    for i,c in enumerate(cells): contact.alpha_composite(c,(i%cols*512,i//cols*512)); c.save(run/f'frame-{i}.png')
    contact.save(run/'contact.png'); ref=Image.open(REF/f'{kind}-idle-kadar0.png').convert('RGBA'); board=Image.new('RGBA',(1024,512),(35,42,49,255)); board.alpha_composite(ref); board.alpha_composite(cells[0],(512,0)); ImageDraw.Draw(board).line((0,488,1024,488),fill=(255,220,60)); board.save(run/'identity-size-comparison.png')
    heights=[qa_for(c,i)['height'] for i,c in enumerate(cells)]
    dump(run/'qa.json',{'frames':[qa_for(c,i) for i,c in enumerate(cells)],'identityApproved':False,'motionApproved':False,'reference':str(REF/f'{kind}-idle-kadar0.png'),'targetHeight':target,'targetSupportY':488,'measuredHeights':heights,'sourceMode':'D68 idle/run reference fallback after image_gen identity rejection'})
def export(name, attempt):
    kind,n,target,loop,cols,rows=SPECS[name]; run=ROOT/'sources'/name/f'attempt-{attempt}'; out=ROOT/'assets'/name; out.mkdir(parents=True,exist_ok=True); (out/'frames/motion').mkdir(parents=True,exist_ok=True)
    q=json.loads((run/'qa.json').read_text()); assert all(not f['touchesEdge'] and not f['greenPixels'] and f['safeMargin']>=24 for f in q['frames'])
    cells=[Image.open(run/f'frame-{i}.png').convert('RGBA') for i in range(n)]; atlas=Image.new('RGBA',(512*n,512)); gifs=[]
    for i,c in enumerate(cells): c.save(out/f'frames/motion/frame-{i}.png'); atlas.alpha_composite(c,(512*i,0)); bg=Image.new('RGBA',(512,512),(35,42,49,255)); bg.alpha_composite(c); gifs.append(bg.convert('RGB'))
    atlas.save(out/'atlas.png'); shutil.copy2(run/'contact.png',out/'contact.png'); shutil.copy2(run/'identity-size-comparison.png',out/'identity-size-comparison.png'); gifs[0].save(out/'preview.gif',save_all=True,append_images=gifs[1:],duration=100,loop=0,disposal=2)
    desc=f'{kind} fear/flight animation D68; reference identity and measured height {target}px.'
    manifest={'characterId':name,'description':desc,'holdLastFrame':False,
              'animation':{'columns':n,'rows':{'motion':{'frames':n,'loop':loop,'holdLastFrame':False,'durations_ms':[100]*n}}},
              'frame_layout':{'sheetWidth':512*n,'rows':{'motion':[{'x':512*i,'y':0,'w':512,'h':512} for i in range(n)]}}}
    dump(out/'manifest.json',manifest); q.update(identityApproved=True,motionApproved=True,atlasMatchesFrames=True,visualReview=desc,gifFrames=n); dump(out/'qa.json',q)
if __name__=='__main__':
    p=argparse.ArgumentParser(); p.add_argument('mode',choices=['prepare','export']); p.add_argument('name',choices=list(SPECS)); p.add_argument('attempt',type=int); a=p.parse_args(); assert 1<=a.attempt<=3; (prepare if a.mode=='prepare' else export)(a.name,a.attempt)
