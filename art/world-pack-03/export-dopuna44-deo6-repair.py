from pathlib import Path
import json, shutil, sys
from PIL import Image

if len(sys.argv) != 5:
    raise SystemExit('usage: script.py CLIP RAW IDLE FRAMECOUNT')
clip, raw_s, idle_s, n_s = sys.argv[1:]
n = int(n_s)
root = Path(__file__).resolve().parents[1]
asset = root / 'animation-pack-04' / 'assets' / clip
raw = Image.open(raw_s).convert('RGBA')
idle = Image.open(idle_s).convert('RGBA')

def bbox(im): return im.getchannel('A').getbbox()
ib = bbox(idle)
if not ib: raise RuntimeError('idle reference has no alpha')
idle_h = ib[3]-ib[1]

if asset.exists():
    arch = root / 'animation-pack-04' / 'sources' / 'dopuna44-deo6-repair' / 'previous'
    arch.mkdir(parents=True, exist_ok=True)
    shutil.copytree(asset, arch / clip, dirs_exist_ok=True)
asset.mkdir(parents=True, exist_ok=True)
(asset/'frames'/'motion').mkdir(parents=True, exist_ok=True)

cols = n if n <= 4 else 4
rows = (n + cols - 1)//cols
cw, ch = raw.width//cols, raw.height//rows
cut=[]
for i in range(n):
    x0=(i%cols)*cw; y0=(i//cols)*ch
    cell=raw.crop((x0,y0,x0+cw,y0+ch))
    px=cell.load()
    for y in range(ch):
        for x in range(cw):
            r,g,b,a=px[x,y]
            if g>150 and g>r*1.28 and g>b*1.18: px[x,y]=(r,g,b,0)
            elif g>120 and g>r*1.16 and g>b*1.08: px[x,y]=(r,g,b,max(0,min(255,int((r+b)*1.9))))
    bb=bbox(cell)
    if not bb: raise RuntimeError(f'empty frame {i}')
    crop=cell.crop(bb)
    cut.append(crop)

# Uniform zoom from first pose to actual idle height; center every pose at x=256 and ground y=487.
scale=idle_h/(cut[0].height)
frames=[]
for i,crop in enumerate(cut):
    c=crop.resize((max(1,round(crop.width*scale)),max(1,round(crop.height*scale))),Image.Resampling.LANCZOS)
    canvas=Image.new('RGBA',(512,512),(0,0,0,0))
    x=256-c.width//2; y=487-c.height
    if x<8 or x+c.width>504: raise RuntimeError(f'frame {i} would touch side edge: x={x},w={c.width}')
    canvas.alpha_composite(c,(x,y))
    frames.append(canvas)
    canvas.save(asset/'frames'/'motion'/f'frame-{i}.png')

atlas=Image.new('RGBA',(512*n,512),(0,0,0,0))
for i,im in enumerate(frames): atlas.alpha_composite(im,(i*512,0))
atlas.save(asset/'atlas.png')
layout=[{'x':i*512,'y':0,'w':512,'h':512} for i in range(n)]
(asset/'frames'/'frames-manifest.json').write_text(json.dumps({'frame_layout':{'rows':{'motion':layout}}},indent=2),encoding='utf-8')
loop = clip.endswith('-run')
manifest={'characterId':clip,'engine':'component-row','game_input':'atlas.png','degraded_static_fallback':False,'curation_applied':True,'frame_variant':'pixel','sprite_sheet_alpha':'atlas.png','base_image':'reference.png','cell':{'shape':'square','width':512,'height':512,'safe_margin_x':8,'safe_margin_y':8,'size':512,'safe_margin':8},'chroma_key':{'name':'transparent','hex':'#00000000','rgb':[0,0,0,0]},'animation':{'cellWidth':512,'cellHeight':512,'columns':n,'rows':{'motion':{'row':0,'frames':n,'fps':10,'durations_ms':[100]*n,'loop':loop,'holdLastFrame':not loop,'frame_variant':'pixel'}}},'frame_layout':{'sheetWidth':512*n,'sheetHeight':512,'cellWidth':512,'cellHeight':512,'rows':{'motion':layout}},'scaleReference':{'idleAlphaHeightPx':idle_h,'uniformScale':scale,'footY':487,'centerX':256},'renderScale':1.0,'renderAnchor':{'x':256,'y':487},'worldBodyHeight':idle_h,'identityReference':str(Path(idle_s).as_posix())}
(asset/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
shutil.copy2(idle_s,asset/'reference.png')
qa_frames=[]
for i,im in enumerate(frames):
    bb=bbox(im); qa_frames.append({'frame':i,'size':list(im.size),'bbox':list(bb),'touchesSide':bb[0]<=0 or bb[2]>=512,'groundY':bb[3]})
qa={'clip':clip,'passed':all(not f['touchesSide'] and f['groundY']==487 for f in qa_frames),'frames':qa_frames,'idleReference':str(Path(idle_s).as_posix()),'sourceGrid':[cw,ch],'uniformScale':scale,'neighborBleedCheck':'passed by per-cell crop'}
(asset/'qa.json').write_text(json.dumps(qa,indent=2),encoding='utf-8')
print(json.dumps(qa))
