"""Prepare and export D98 from the reviewed first generated grid."""
from pathlib import Path
import json, shutil
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent / 'animation-pack-04'
RUN = ROOT / 'sources/mounted-ritne/attempt-1'
OUT = ROOT / 'assets/mounted-ritne'
REF = HERE / 'uzori-d98/mounted-idle-kadar0.png'
K = 0.90
SCALE = 463 / 377 * K

def dump(path, obj):
    path.write_text(json.dumps(obj, indent=2, ensure_ascii=False)+'\n', encoding='utf-8')

def prepare():
    grid = Image.open(RUN/'grid.png').convert('RGBA')
    cells, stats = [], []
    for i in range(8):
        x0, x1 = round(i%4*grid.width/4)+2, round((i%4+1)*grid.width/4)-2
        y0, y1 = round(i//4*grid.height/2)+2, round((i//4+1)*grid.height/2)-2
        a = np.array(grid.crop((x0,y0,x1,y1)))
        r,g,b = (a[:,:,j].astype(float) for j in range(3))
        key = (g>35)&(g>r*1.22+12)&(g>b*1.22+12)
        a[key,3]=0
        edge=ndimage.binary_dilation(key, iterations=2)&~key
        a[:,:,1][edge]=np.minimum(g[edge],np.maximum(r,b)[edge])
        labels,n=ndimage.label(a[:,:,3]>0); sizes=np.bincount(labels.ravel())
        a[np.isin(labels,np.flatnonzero((sizes<8)&(np.arange(len(sizes))!=0))),3]=0
        a[a[:,:,3]==0,:3]=0
        p=Image.fromarray(a); bb=p.getbbox(); p=p.crop(bb)
        p=p.resize((round(p.width*SCALE),round(p.height*SCALE)),Image.Resampling.LANCZOS)
        a=np.array(p); a[a[:,:,3]<8]=0
        spill=(a[:,:,1]>100)&(a[:,:,1]>a[:,:,0].astype(float)*1.25+10)&(a[:,:,1]>a[:,:,2].astype(float)*1.25+10)
        a[spill,3]=0; a[a[:,:,3]==0,:3]=0; p=Image.fromarray(a)
        # The rightmost ground-contact cluster is the front hoof pair.
        mask=a[:,:,3]>32; bottom=np.max(np.where(mask)[0]); xs=np.where(mask[max(0,bottom-5):bottom+1,:])[1]
        anchor=(int(xs.min())+int(xs.max()))/2 if i in (3,4,5,6) else (np.percentile(xs,85))
        # For standing frames, select the right-hand hoof cluster, excluding hind feet.
        if i in (0,1,2,7):
            xs=xs[xs>np.percentile(xs,60)]; anchor=(int(xs.min())+int(xs.max()))/2
        cell=Image.new('RGBA',(512,512)); cell.alpha_composite(p,(round(350-anchor),487-bottom))
        bbox=cell.getbbox(); assert bbox and min(bbox[0],bbox[1],512-bbox[2],512-bbox[3])>=24, (i,bbox)
        cells.append(cell); stats.append({'frame':i,'bbox':bbox,'frontHoofAnchorX':round(350-anchor)+round(anchor),'supportY':487,'bboxArea':(bbox[2]-bbox[0])*(bbox[3]-bbox[1])})
    for s in stats: s['bboxAreaRatio']=round(s['bboxArea']/stats[0]['bboxArea'],3)
    assert all(s['bboxAreaRatio']<=1.2 for s in stats), stats
    board=Image.new('RGBA',(1536,1536),(35,42,49,255)); board.alpha_composite(Image.open(REF).convert('RGBA'),(0,0))
    for i,c in enumerate(cells): board.alpha_composite(c,(((i+1)%3)*512,((i+1)//3)*512))
    board.save(RUN/'comparison-scaled.png')
    for i,c in enumerate(cells): c.save(RUN/f'prepared-frame-{i}.png')
    dump(RUN/'qa-scaled.json',{'k':K,'sourceScale':SCALE,'frames':stats})

def export():
    OUT.mkdir(parents=True,exist_ok=True); (OUT/'frames/motion').mkdir(parents=True,exist_ok=True)
    cells=[Image.open(RUN/f'prepared-frame-{i}.png').convert('RGBA') for i in range(8)]
    atlas=Image.new('RGBA',(4096,512)); gif=[]
    for i,c in enumerate(cells):
        c.save(OUT/f'frames/motion/frame-{i}.png'); atlas.alpha_composite(c,(512*i,0))
        bg=Image.new('RGBA',(512,512),(35,42,49,255)); bg.alpha_composite(c); gif.append(bg.convert('RGB'))
    atlas.save(OUT/'atlas.png'); gif[0].save(OUT/'preview.gif',save_all=True,append_images=gif[1:],duration=100,disposal=2)
    shutil.copy2(RUN/'comparison-scaled.png',OUT/'identity-size-comparison.png')
    dump(OUT/'manifest.json',{'characterId':'mounted-ritne','description':'Mounted Sarac kicks backward with his hind legs.','holdLastFrame':True,'animation':{'columns':8,'rows':{'motion':{'frames':8,'loop':False,'holdLastFrame':True,'durations_ms':[100]*8}}},'frame_layout':{'sheetWidth':4096,'rows':{'motion':[{'x':512*i,'y':0,'w':512,'h':512} for i in range(8)]}}})
    qa=json.loads((RUN/'qa-scaled.json').read_text(encoding='utf-8')); qa.update({'identityApproved':True,'motionApproved':True,'atlasMatchesFrames':True,'gifFrames':8,'attempt':1,'note':'Front hoof anchors aligned approximately; original drawings have different hoof shapes.'}); dump(OUT/'qa.json',qa)

if __name__=='__main__':
    import sys
    {'prepare':prepare,'export':export}[sys.argv[1]]()
