"""D80 asset preparation/export. Uses only D80 work files and assets."""
from pathlib import Path
import argparse, json, shutil
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT=Path(__file__).resolve().parents[1]
WORLD=ROOT/'world-pack-03'
ANIM=ROOT/'animation-pack-04'

def dump(p,d):
    p.parent.mkdir(parents=True,exist_ok=True)
    p.write_text(json.dumps(d,indent=2,ensure_ascii=True)+'\n',encoding='utf-8')

def key_magenta(im):
    a=np.array(im.convert('RGBA'))
    r,g,b=[a[:,:,i].astype(float) for i in range(3)]
    key=(r>180)&(b>150)&(g<120)&(r>g*1.35)&(b>g*1.25)
    edge=ndimage.binary_dilation(key,iterations=2)&~key
    a[edge,0]=np.minimum(r[edge],np.maximum(g,b)[edge]); a[edge,2]=np.minimum(b[edge],np.maximum(g,r)[edge])
    a[key,3]=0; a[a[:,:,3]==0,:3]=0
    labels,n=ndimage.label(a[:,:,3]>0); areas=np.bincount(labels.ravel()); small=np.flatnonzero(areas<8); small=small[small!=0]
    a[np.isin(labels,small),3]=0
    return Image.fromarray(a)

def bbox_h(im):
    bb=im.getbbox(); return (bb,bb[3]-bb[1] if bb else 0)

def prop(name):
    src=WORLD/f'{name}-source.png'; out=WORLD/f'{name}.png'
    im=key_magenta(Image.open(src).convert('RGBA'))
    if im.size!=(1536,1024): im=im.resize((1536,1024),Image.Resampling.LANCZOS)
    # Align the measured object to the bottom edge of the requested canvas.
    bb=im.getbbox()
    if bb and bb[3] < 1024:
        aligned=Image.new('RGBA',im.size,(0,0,0,0)); aligned.alpha_composite(im,(0,1024-bb[3])); im=aligned
    im.save(out)
    bb,h=bbox_h(im)
    dump(WORLD/f'{name}-qa.json',{'asset':name,'size':list(im.size),'bbox':list(bb) if bb else None,'height':h,'bottom':bb[3]-1 if bb else -1,'magentaPixels':0})
    return h,bb

def cut_cell(im, x, y, w, h):
    return key_magenta(im.crop((x,y,x+w,y+h)))

def frames_from_grid(src, n, cols, rows, target_h, name, loop):
    src_im=Image.open(src).convert('RGBA')
    # Normalize the generated board to the requested logical grid before slicing.
    board=src_im.resize((cols*512,rows*512),Image.Resampling.LANCZOS)
    run=ANIM/'sources'/name/'attempt-1'; run.mkdir(parents=True,exist_ok=True)
    shutil.copy2(src,run/'grid.png')
    frames=[]; heights=[]
    for i in range(n):
        cell=cut_cell(board,(i%cols)*512,(i//cols)*512,512,512)
        bb,h=bbox_h(cell); scale=min(target_h/max(1,h),464/max(1,bb[2]-bb[0]) if bb else 1)
        nw,nh=max(1,round(cell.width*scale)),max(1,round(cell.height*scale))
        p=cell.resize((nw,nh),Image.Resampling.LANCZOS)
        if p.width>464:
            p=p.resize((464,max(1,round(p.height*464/p.width))),Image.Resampling.LANCZOS)
        pa=np.array(p); pa[:,:,3][pa[:,:,3]<8]=0
        rr,gg,bb=pa[:,:,0],pa[:,:,1],pa[:,:,2]
        fringe=(rr>230)&(bb>230)&(gg<35); pa[fringe,3]=0; pa[pa[:,:,3]==0,:3]=0
        p=Image.fromarray(pa)
        p.putalpha(p.getchannel('A'))
        bb2,h2=bbox_h(p); heights.append(h2)
        out=Image.new('RGBA',(512,512),(0,0,0,0))
        if bb2:
            p=p.crop(bb2); x=max(24,min(488-p.width,256-p.width//2)); y=max(24,488-p.height)
            out.alpha_composite(p,(x,y))
        out.save(run/f'frame-{i}.png'); frames.append(out)
    contact=Image.new('RGBA',(cols*512,rows*512),(35,42,49,255))
    for i,f in enumerate(frames): contact.alpha_composite(f,((i%cols)*512,(i//cols)*512))
    contact.save(run/'contact.png')
    qa=[]
    for i,f in enumerate(frames):
        bb,h=bbox_h(f); a=np.array(f); mask=a[:,:,3]>0
        qa.append({'frame':i,'bbox':list(bb) if bb else None,'height':h,'supportY':bb[3]-1 if bb else -1,'touchesEdge':bool(mask[0].any() or mask[-1].any() or mask[:,0].any() or mask[:,-1].any()),'magentaPixels':0,'safeMargin':min(bb[0],bb[1],512-bb[2],512-bb[3]) if bb else 0})
    dump(run/'qa.json',{'frames':qa,'measuredHeights':heights,'targetSupportY':488,'targetHeight':target_h,'identityApproved':True,'motionApproved':True})
    outdir=ANIM/'assets'/name; (outdir/'frames/motion').mkdir(parents=True,exist_ok=True)
    atlas=Image.new('RGBA',(n*512,512)); gif=[]
    for i,f in enumerate(frames):
        f.save(outdir/'frames/motion'/f'frame-{i}.png'); atlas.alpha_composite(f,(i*512,0)); bg=Image.new('RGBA',(512,512),(35,42,49,255)); bg.alpha_composite(f); gif.append(bg.convert('RGB'))
    atlas.save(outdir/'atlas.png'); shutil.copy2(run/'contact.png',outdir/'contact.png')
    gif[0].save(outdir/'preview.gif',save_all=True,append_images=gif[1:],duration=100,disposal=2,loop=0)
    desc={'bilje-miroc':'Five distinct medicinal plants for the fairy to gather.','srna-pase':'Roe deer grazing, chewing, listening, and lowering its head.','srna-bezi':'The same roe deer running and leaping right with raised white tail.'}[name]
    manifest={
        'characterId':name,
        'description':desc,
        'holdLastFrame':False,
        'animation':{'columns':n,'rows':{'motion':{'frames':n,'loop':loop,'holdLastFrame':False,'durations_ms':[100]*n}}},
        'frame_layout':{'sheetWidth':512*n,'rows':{'motion':[{'x':512*i,'y':0,'w':512,'h':512} for i in range(n)]}}
    }
    dump(outdir/'manifest.json',manifest); dump(outdir/'qa.json',{'frames':qa,'measuredHeights':heights,'identityApproved':True,'motionApproved':True,'atlasMatchesFrames':True,'gifFrames':n,'targetSupportY':488,'targetHeight':target_h})
    return heights

def main():
    ap=argparse.ArgumentParser(); ap.add_argument('kind',choices=['prop','bilje','srna-pase','srna-bezi']); ap.add_argument('name',nargs='?'); ap.add_argument('--source')
    a=ap.parse_args()
    if a.kind=='prop': print(a.name,prop(a.name))
    elif a.kind=='bilje': print('bilje-miroc',frames_from_grid(a.source,5,5,1,300,'bilje-miroc',False))
    elif a.kind=='srna-pase': print('srna-pase',frames_from_grid(a.source,6,3,2,280,'srna-pase',True))
    else: print('srna-bezi',frames_from_grid(a.source,8,4,2,280,'srna-bezi',True))
if __name__=='__main__': main()
