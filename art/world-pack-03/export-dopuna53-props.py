"""D53 staging/export following D50: generated alpha, connected dust cleanup, uniform scale."""
from pathlib import Path
import argparse,json,hashlib
import numpy as np
from PIL import Image
from scipy import ndimage
ROOT=Path(__file__).resolve().parents[2]
REF=ROOT/'art/world-pack-03/uzori-d53'
NAME='prop-crkva-samodreza-presek'
FACADE=ROOT/'art/world-pack-03/uzori-d50/prop-crkva-samodreza.png'
def dump(p,v): p.write_text(json.dumps(v,indent=2,ensure_ascii=True)+'\n',encoding='utf8')
def prepare(attempt):
    run=REF/NAME/f'attempt-{attempt}'
    p=Image.open(run/'generated.png').convert('RGBA');a=np.array(p)
    labels,n=ndimage.label(a[:,:,3]>8);sizes=np.bincount(labels.ravel());keep=int(np.argmax(sizes[1:])+1)
    removed=int(((labels!=keep)&(a[:,:,3]>0)).sum());a[labels!=keep]=0
    p=Image.fromarray(a);crop=p.getbbox();p=p.crop(crop)
    p=p.resize((round(p.width*870/p.height),870),Image.Resampling.LANCZOS)
    cell=Image.new('RGBA',(1024,1024));cell.alpha_composite(p,((1024-p.width)//2,1001-p.height));cell.save(run/'prepared.png')
    f=Image.open(FACADE).convert('RGBA');Image.blend(f,cell,.5).save(run/'preklop.png')
    a=np.array(cell);m=a[:,:,3]>0;bb=cell.getbbox();fb=f.getbbox();delta=[bb[i]-fb[i] for i in range(4)]
    q={'size':list(cell.size),'bbox':list(bb),'facadeBBox':list(fb),'bboxDelta':delta,'boundsMatch':all(abs(d)<=8 for d in delta),'alphaRange':[int(a[:,:,3].min()),int(a[:,:,3].max())],'touchesEdge':bool(m[0].any() or m[-1].any() or m[:,0].any() or m[:,-1].any()),'components':int(ndimage.label(a[:,:,3]>32)[1]),'sourceCrop':list(crop),'removedDisconnectedPixels':removed,'visualApproved':False}
    dump(run/'qa.json',q);print(json.dumps(q))
def export(attempt):
    run=REF/NAME/f'attempt-{attempt}';q=json.loads((run/'qa.json').read_text());r=json.loads((run/'review.json').read_text())
    assert r['approved'] and q['visualApproved'] and q['boundsMatch'] and not q['touchesEdge']
    p=Image.open(run/'prepared.png').convert('RGBA');out=ROOT/'dist/assets/world'/f'{NAME}.webp';assert not out.exists(),'Refuse overwrite'
    p.save(out,format='WEBP',quality=90,method=6,exact=True)
    assert np.array_equal(np.array(p)[:,:,3],np.array(Image.open(out).convert('RGBA'))[:,:,3])
    p.save(REF/f'{NAME}.png');Image.open(run/'preklop.png').save(REF/'preklop.png');print('EXPORTED',out)
if __name__=='__main__':
    ap=argparse.ArgumentParser();ap.add_argument('mode',choices=['prepare','export']);ap.add_argument('attempt',type=int);x=ap.parse_args();assert 1<=x.attempt<=3
    (prepare if x.mode=='prepare' else export)(x.attempt)
