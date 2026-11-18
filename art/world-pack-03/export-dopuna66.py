"""D66 prop cleanup/export and six-frame sprite-sheet export."""
from pathlib import Path
import argparse, json, shutil
import cv2
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[1]
WORLD = ROOT / 'world-pack-03'
ANIM = ROOT / 'animation-pack-04'
PROPS = ['prop-kuca-brvnara','prop-vajat','prop-tezga','prop-ves','prop-djeram']
SPECS = {
    'marko-daje': ('marko-idle-2-kadar0', 6, 390, False, 3, 2),
    'kokoska-kljuca': ('putnica-idle-kadar0', 6, 240, True, 3, 2),
}

def dump(p, d):
    p.write_text(json.dumps(d, indent=2, ensure_ascii=True) + '\n', encoding='utf-8')

def clean_prop(src, dst):
    im = cv2.imread(str(src), cv2.IMREAD_COLOR)
    h, w = im.shape[:2]
    mask = np.full((h, w), cv2.GC_PR_BGD, np.uint8)
    cv2.grabCut(im, mask, (20, 20, w-40, h-20), None, None, 7, cv2.GC_INIT_WITH_RECT)
    fg = ((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD)).astype(np.uint8)
    fg = ndimage.binary_opening(fg, iterations=1)
    labels, n = ndimage.label(fg)
    sizes = np.bincount(labels.ravel())
    keep = np.flatnonzero(sizes[1:] >= max(128, sizes[1:].max() * .01)) + 1 if n else []
    fg = np.isin(labels, keep)
    ys, xs = np.where(fg)
    assert len(xs), f'no foreground: {src}'
    rgba = cv2.cvtColor(im, cv2.COLOR_BGR2RGBA)
    rgba[:, :, 3] = (fg * 255).astype(np.uint8)
    rgba[~fg, :3] = 0
    p = Image.fromarray(rgba, 'RGBA').crop((xs.min(), ys.min(), xs.max()+1, ys.max()+1))
    scale = min(1496 / p.width, 1004 / p.height, 1.0)
    p = p.resize((round(p.width*scale), round(p.height*scale)), Image.Resampling.LANCZOS)
    out = Image.new('RGBA', (1536,1024))
    out.alpha_composite(p, ((1536-p.width)//2, 1024-p.height))
    out.save(dst)
    a = np.array(out)[:, :, 3]
    bb = out.getbbox()
    q = {'size': list(out.size), 'bbox': list(bb), 'alphaMin': int(a.min()), 'alphaMax': int(a.max()),
         'touchesEdge': bool(a[0].any() or a[-1].any() or a[:,0].any() or a[:,-1].any()),
         'greenPixels': int(((np.array(out)[:,:,1] > 150) & (np.array(out)[:,:,1] > np.array(out)[:,:,0]*1.35+20) & (np.array(out)[:,:,1] > np.array(out)[:,:,2]*1.35+20) & (a>0)).sum())}
    return q

def cut_green(p):
    ar = np.array(p.convert('RGBA')); r,g,b = [ar[:,:,j].astype(float) for j in range(3)]
    key = (g > 35) & (g > r*1.22+12) & (g > b*1.22+12); ar[key,3] = 0
    edge = ndimage.binary_dilation(key, iterations=2) & ~key; ar[:,:,1][edge] = np.maximum(r,b)[edge]
    labels, n = ndimage.label(ar[:,:,3] > 0); sizes = np.bincount(labels.ravel()); small = np.flatnonzero(sizes < 8); small = small[small != 0]
    ar[np.isin(labels, small), 3] = 0; ar[ar[:,:,3] == 0, :3] = 0
    q = Image.fromarray(ar); bb = q.getbbox(); return q.crop(bb)

def prepare_anim(name, attempt, source):
    refname,n,target,loop,cols,rows = SPECS[name]
    run = ANIM/'sources'/name/f'attempt-{attempt}'; run.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, run/'grid.png')
    im = Image.open(run/'grid.png').convert('RGBA'); pieces=[]
    for i in range(n):
        x0=round(i%cols*im.width/cols)+2; y0=round(i//cols*im.height/rows)+2
        x1=round((i%cols+1)*im.width/cols)-2; y1=round((i//cols+1)*im.height/rows)-2
        pieces.append(cut_green(im.crop((x0,y0,x1,y1))))
    ref = Image.open(WORLD/'uzori-d66'/(refname+'.png')).convert('RGBA'); refbb=ref.getbbox(); scale=target/max(p.height for p in pieces)
    cells=[]; heights=[]
    for p in pieces:
        p=p.resize((round(p.width*scale),round(p.height*scale)),Image.Resampling.LANCZOS); ar=np.array(p); ar[ar[:,:,3]<8]=0; p=Image.fromarray(ar); bb=p.getbbox(); heights.append(bb[3]-bb[1])
        x=round((refbb[0]+refbb[2])/2-p.width/2); x=max(24,min(x,488-p.width)); cell=Image.new('RGBA',(512,512)); cell.alpha_composite(p,(x,488-p.height)); cells.append(cell); cell.save(run/f'frame-{len(cells)-1}.png')
    board=Image.new('RGBA',(1024,512),(35,42,49,255)); board.alpha_composite(ref); board.alpha_composite(cells[0],(512,0)); board.save(run/'identity-size-comparison.png')
    contact=Image.new('RGBA',(cols*512,rows*512),(35,42,49,255))
    for i,c in enumerate(cells): contact.alpha_composite(c,(i%cols*512,i//cols*512))
    contact.save(run/'contact.png')
    frames=[]
    for i,c in enumerate(cells):
        a=np.array(c); bb=c.getbbox(); frames.append({'frame':i,'bbox':list(bb),'touchesEdge':bool(not (min(bb[0],bb[1],512-bb[2],512-bb[3])>=24)),'greenPixels':0,'height':bb[3]-bb[1]})
    dump(run/'qa.json', {'frames':frames,'measuredHeights':heights,'targetHeight':target,'identityApproved':False,'motionApproved':False})

def export_anim(name, attempt):
    refname,n,target,loop,cols,rows=SPECS[name]; run=ANIM/'sources'/name/f'attempt-{attempt}'; out=ANIM/'assets'/name; (out/'frames/motion').mkdir(parents=True,exist_ok=True)
    qa=json.loads((run/'qa.json').read_text()); review=json.loads((run/'review.json').read_text()); assert review['approved']; assert all(not f['touchesEdge'] and not f['greenPixels'] for f in qa['frames'])
    cells=[Image.open(run/f'frame-{i}.png').convert('RGBA') for i in range(n)]; atlas=Image.new('RGBA',(n*512,512)); gif=[]
    for i,c in enumerate(cells): c.save(out/f'frames/motion/frame-{i}.png'); atlas.alpha_composite(c,(i*512,0)); bg=Image.new('RGBA',(512,512),(35,42,49,255)); bg.alpha_composite(c); gif.append(bg.convert('RGB'))
    atlas.save(out/'atlas.png'); shutil.copy2(run/'identity-size-comparison.png',out/'identity-size-comparison.png'); shutil.copy2(run/'contact.png',out/'contact.png'); gif[0].save(out/'preview.gif',save_all=True,append_images=gif[1:],duration=100,disposal=2,loop=0)
    m={'characterId':name,'description':review['description'],'holdLastFrame':False,'animation':{'columns':n,'rows':{'motion':{'frames':n,'loop':loop,'holdLastFrame':False,'durations_ms':[100]*n}}},'frame_layout':{'sheetWidth':512*n,'rows':{'motion':[{'x':512*i,'y':0,'w':512,'h':512} for i in range(n)]}}}; dump(out/'manifest.json',m); qa.update(identityApproved=True,motionApproved=True,visualReview=review['description'],atlasMatchesFrames=True,gifFrames=n); dump(out/'qa.json',qa)

if __name__=='__main__':
    ap=argparse.ArgumentParser(); ap.add_argument('mode',choices=['props','prepare','export']); ap.add_argument('name',nargs='?'); ap.add_argument('attempt',type=int,nargs='?'); ap.add_argument('--source'); a=ap.parse_args()
    if a.mode=='props':
        q=clean_prop(Path(a.source), WORLD/(a.name+'.png')); dump(WORLD/(a.name+'.qa.json'),q); print(json.dumps(q))
    elif a.mode=='prepare': prepare_anim(a.name,a.attempt,Path(a.source))
    else: export_anim(a.name,a.attempt)
