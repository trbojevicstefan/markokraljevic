"""D50 prop staging/export; preserves generated alpha, no repainting."""
from pathlib import Path
import argparse, shutil, json
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT=Path(__file__).resolve().parents[2]
REF=ROOT/'art/world-pack-03/uzori-d50'

def dump(p,v):
    p.write_text(json.dumps(v,indent=2,ensure_ascii=True)+'\n',encoding='utf8')

def main():
    a=argparse.ArgumentParser();a.add_argument('mode',choices=['prepare','export']);a.add_argument('name',choices=['prop-crkva-samodreza','bilje-miroc']);a.add_argument('attempt',type=int);a.add_argument('--source');x=a.parse_args()
    run=REF/x.name/f'attempt-{x.attempt}';run.mkdir(parents=True,exist_ok=True)
    if x.mode=='export':
        assert json.loads((run/'review.json').read_text())['approved']
        out=ROOT/'dist/assets/world'/f'{x.name}.webp'
        assert not out.exists(), 'Refuse overwrite'
        p=Image.open(run/'prepared.png').convert('RGBA');p.save(out,format='WEBP',quality=90,method=6,exact=True)
        p.save(REF/f'{x.name}.png')
        assert Image.open(out).size==p.size
        assert np.array_equal(np.array(Image.open(out).convert('RGBA'))[:,:,3],np.array(p)[:,:,3])
        print('EXPORTED',out);return
    shutil.copy2(x.source,run/'generated.png')
    p=Image.open(run/'generated.png').convert('RGBA')
    if x.name=='prop-crkva-samodreza':
        arr=np.array(p);labels,n=ndimage.label(arr[:,:,3]>8);sizes=np.bincount(labels.ravel());keep=int(np.argmax(sizes[1:])+1)
        # Remove only disconnected generator dust, preserving all main-building alpha.
        arr[labels!=keep]=0;p=Image.fromarray(arr);p=p.crop(p.getbbox())
        p=p.resize((round(p.width*870/p.height),870),Image.Resampling.LANCZOS)
        cell=Image.new('RGBA',(1024,1024));cell.alpha_composite(p,((1024-p.width)//2,1001-p.height));p=cell
    else:
        # Equal five source fields, one common scale, five 256px destination fields.
        pieces=[]
        for i in range(5):
            q=p.crop((round(i*p.width/5),0,round((i+1)*p.width/5),p.height))
            ar=np.array(q);labels,n=ndimage.label(ar[:,:,3]>8);sizes=np.bincount(labels.ravel());keep=int(np.argmax(sizes[1:])+1);ar[labels!=keep]=0;q=Image.fromarray(ar)
            assert q.getbbox();pieces.append(q.crop(q.getbbox()))
        scale=min(218/max(q.width for q in pieces),218/max(q.height for q in pieces))
        p=Image.new('RGBA',(1280,256))
        for i,q in enumerate(pieces):
            q=q.resize((round(q.width*scale),round(q.height*scale)),Image.Resampling.LANCZOS);p.alpha_composite(q,(i*256+(256-q.width)//2,248-q.height))
    p.save(run/'prepared.png')
    arr=np.array(p);mask=arr[:,:,3]>0;bb=p.getbbox()
    qa={'size':list(p.size),'bbox':bb,'alphaRange':[int(arr[:,:,3].min()),int(arr[:,:,3].max())],'touchesEdge':bool(mask[0].any() or mask[-1].any() or mask[:,0].any() or mask[:,-1].any()),'components':int(ndimage.label(arr[:,:,3]>32)[1]),'visualApproved':False}
    if x.name=='bilje-miroc':qa['fields']=[p.crop((i*256,0,(i+1)*256,256)).getbbox() for i in range(5)]
    dump(run/'qa.json',qa);print(qa)

if __name__=='__main__':main()
