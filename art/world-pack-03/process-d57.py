"""D57 only: chroma extraction, candidate review sheets, reviewed export and QA."""
from pathlib import Path
import argparse, json
import numpy as np
from PIL import Image

ROOT=Path(__file__).resolve().parents[2]
PACK=ROOT/'art/animation-pack-04'
REF=ROOT/'art/world-pack-03/uzori-d57/sarac-stoji-kadar0.png'
COUNTS={'sarac-pije':6,'sarac-lupa':6,'sarac-propinje':6,'sarac-boli':4,'sarac-pada':6,'sarac-hod':6}
def write(p,obj): p.write_text(json.dumps(obj,indent=2,ensure_ascii=True)+'\n',encoding='utf-8')
def checks(im,i):
    a=np.array(im); mask=a[:,:,3]>0; b=im.getbbox()
    green=(a[:,:,1].astype(float)>120)&(a[:,:,1]>a[:,:,0].astype(float)*1.35+20)&(a[:,:,1]>a[:,:,2].astype(float)*1.35+20)&mask
    # Count connected opaque components without external dependencies.
    from scipy.ndimage import label
    labs,n=label(mask); sizes=np.bincount(labs.ravel())[1:]
    return dict(frame=i,bbox=list(b),touchesEdge=b[0]<=0 or b[1]<=0 or b[2]>=512 or b[3]>=512,greenPixels=int(green.sum()),components=[int(s) for s in sizes if s>=8],baseline=b[3]-1)
def prepare(clip,attempt,scale,dx=0):
    d=PACK/'sources'/clip/f'attempt-{attempt}'; n=COUNTS[clip]; cols=2 if n==4 else 3
    sheet=Image.open(d/'grid.png').convert('RGB'); w,h=sheet.size
    frames=[]
    for i in range(n):
        crop=sheet.crop((round(i%cols*w/cols),round(i//cols*h/2),round((i%cols+1)*w/cols),round((i//cols+1)*h/2))).resize((512,512),Image.Resampling.LANCZOS)
        a=np.array(crop).astype(float); r,g,b=a[:,:,0],a[:,:,1],a[:,:,2]
        key=(g>100)&(g>r*1.25+15)&(g>b*1.25+15)
        alpha=np.where(key,0,255).astype(np.uint8)
        # Remove residual green spill on visible warm-colored sprite edges.
        a[:,:,1]=np.where((g>r)&(g>b),np.maximum(r,b),g)
        out=Image.fromarray(np.dstack((a.astype(np.uint8),alpha)),'RGBA')
        bb=out.getbbox(); subject=out.crop(bb)
        if scale!=1: subject=subject.resize((round(subject.width*scale),round(subject.height*scale)),Image.Resampling.LANCZOS)
        pixels=np.array(subject); pixels[:,:,1]=np.minimum(pixels[:,:,1],np.maximum(pixels[:,:,0],pixels[:,:,2])); subject=Image.fromarray(pixels,'RGBA')
        dest=Image.new('RGBA',(512,512)); x=round(256+(bb[0]-256)*scale)+dx; y=489-subject.height
        dest.alpha_composite(subject,(x,y)); dest.save(d/f'candidate-{i}.png'); frames.append(dest)
    comparison=Image.new('RGBA',(1024,512)); comparison.alpha_composite(Image.open(REF).convert('RGBA'));comparison.alpha_composite(frames[0],(512,0));comparison.save(d/'identity-size-comparison.png')
    contact=Image.new('RGB',(512*cols,512*2),(65,65,65))
    for i,im in enumerate(frames): contact.paste(im,(i%cols*512,i//cols*512),im)
    contact.save(d/'contact-sheet.png'); write(d/'technical-qa.json',dict(frames=[checks(im,i) for i,im in enumerate(frames)],scale=scale))
    print(d)
def export(clip,attempt):
    d=PACK/'sources'/clip/f'attempt-{attempt}'; review=json.loads((d/'review.json').read_text(encoding='utf-8')); assert review['approved']
    n=COUNTS[clip]; frames=[Image.open(d/f'candidate-{i}.png').convert('RGBA') for i in range(n)]
    qa=[checks(im,i) for i,im in enumerate(frames)]
    assert all(not q['touchesEdge'] and q['greenPixels']==0 for q in qa)
    if clip!='sarac-propinje': assert all(min(q['bbox'][0],q['bbox'][1],512-q['bbox'][2])>=24 for q in qa)
    out=PACK/'assets'/clip; (out/'frames/motion').mkdir(parents=True,exist_ok=True)
    atlas=Image.new('RGBA',(512*n,512))
    for i,im in enumerate(frames): im.save(out/f'frames/motion/frame-{i}.png');atlas.alpha_composite(im,(512*i,0))
    atlas.save(out/'atlas.png')
    loop=clip in ['sarac-pije','sarac-lupa','sarac-hod'];hold=clip=='sarac-pada'
    gifargs=dict(save_all=True,append_images=frames[1:],duration=170,disposal=2)
    if loop:gifargs['loop']=0
    frames[0].save(out/'preview.gif',**gifargs)
    m=json.loads((PACK/'assets/sarac-stoji/manifest.json').read_text(encoding='utf-8-sig'))
    m.update(characterId=clip,holdLastFrame=hold,description=review['description'])
    m['animation']['columns']=n;m['animation']['rows']['motion'].update(frames=n,durations_ms=[170]*n,loop=loop,holdLastFrame=hold)
    m['frame_layout'].update(sheetWidth=512*n);m['frame_layout']['rows']['motion']=[dict(x=i*512,y=0,w=512,h=512) for i in range(n)]
    m['base_image']='frames/motion/frame-0.png';write(out/'manifest.json',m)
    Image.open(d/'identity-size-comparison.png').save(out/'identity-size-comparison.png')
    write(out/'qa.json',dict(frames=qa,identityApproved=True,atlasMatchesFrames=True,source=str(d.relative_to(PACK)).replace('\\','/'),review=review))
    assert Image.open(out/'preview.gif').n_frames==n
    for i,im in enumerate(frames):assert atlas.crop((512*i,0,512*(i+1),512)).tobytes()==im.tobytes()
    print('PASS',clip,n,'frames; alpha, green, edges, atlas, GIF, manifest checked')
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('mode',choices=['prepare','export']);p.add_argument('clip',choices=COUNTS);p.add_argument('attempt',type=int);p.add_argument('--scale',type=float,default=1);p.add_argument('--dx',type=int,default=0);a=p.parse_args()
    if a.mode=='prepare':prepare(a.clip,a.attempt,a.scale,a.dx)
    else:export(a.clip,a.attempt)
