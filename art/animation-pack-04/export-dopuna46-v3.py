"""Prepare review candidates, then explicitly publish reviewed DOPUNA-46 v3 clips."""
from pathlib import Path
from PIL import Image, ImageDraw
import numpy as np
import json, shutil, subprocess, sys, hashlib, time

GAME=Path(__file__).resolve().parents[2]
PACK=GAME/'art/animation-pack-04'
SG=GAME.parent/'tools/sprite-gen/.venv/Scripts/sprite-gen.exe'
def write(p,data):
    p.write_text(json.dumps(data,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
def bounds(im,threshold=0):
    return im.getchannel('A').point(lambda a:255 if a>threshold else 0).getbbox()
def bg(im):
    c=Image.new('RGBA',im.size,(32,38,43,255));c.alpha_composite(im);return c
def prepare(name,source,attempt):
    run=PACK/'sources'/name/'v3';run.mkdir(parents=True,exist_ok=True)
    shutil.copy2(source,run/f'attempt-{attempt}.png')
    cut=run/f'attempt-{attempt}-alpha.png'
    subprocess.run([str(SG),'cutout',str(source),'--out',str(cut),'--key','green','--decontam','palette'],check=True,stdout=subprocess.DEVNULL)
    grid=Image.open(cut).convert('RGBA');cells=[];records=[]
    if name=='fx-potres':
        # Chroma-edge decontamination only: suppress reflected key green at dust fringe.
        a=np.array(grid).astype(float)
        fringe=(a[:,:,1]>a[:,:,0]*.95)&(a[:,:,3]>0)
        a[:,:,3][fringe]*=np.clip((255-a[:,:,1][fringe])/np.maximum(1,255-a[:,:,0][fringe]),0,1)
        a[:,:,1][fringe]=np.minimum(a[:,:,1][fringe],a[:,:,0][fringe]*.72)
        a[:,:,3][a[:,:,3]<3]=0
        grid=Image.fromarray(a.astype('uint8'),'RGBA')
    candidate=run/'candidate';candidate.mkdir(exist_ok=True)
    for i in range(6):
        x,y=i%3,i//3
        tile=grid.crop((x*grid.width//3,y*grid.height//2,(x+1)*grid.width//3,(y+1)*grid.height//2))
        b=bounds(tile,16);assert b
        crop=tile.crop(b)
        if name=='fx-potres':
            # Normalize one isolated wave per cell; never resize a whole six-frame sheet.
            left,right=[(35,165),(90,310),(90,510),(90,730),(90,965),(90,980)][i]
            height=100
            # Keep the generated dark ground fissure as an eight-pixel baseline band.
            ground=min(4,crop.height//5)
            upper=crop.crop((0,0,crop.width,crop.height-ground)).resize((right-left,92),Image.Resampling.LANCZOS)
            lower=crop.crop((0,crop.height-ground,crop.width,crop.height)).resize((right-left,8),Image.Resampling.LANCZOS)
            cell=Image.new('RGBA',(1024,512));cell.alpha_composite(upper,(left,388));cell.alpha_composite(lower,(left,480))
        else:
            # Uniform scale, same camera framing; alpha bbox is not stretched to a square.
            tile=tile.resize((512,512),Image.Resampling.LANCZOS)
            bb=bounds(tile,16)
            factor=min(0.94,440/(bb[2]-bb[0]))
            tile=tile.resize((round(512*factor),round(512*factor)),Image.Resampling.LANCZOS)
            bb=bounds(tile)
            cell=Image.new('RGBA',(512,512))
            # Front sole anchors the camera; fixed reference stance used verbatim at end.
            arr=np.array(tile.getchannel('A'))
            band=arr[max(0,bb[3]-5):bb[3],:]
            cols=np.where((band>32).any(axis=0))[0]
            rightfoot=int(cols[cols>=(bb[0]+bb[2])//2].mean()) if len(cols) else bb[2]-40
            dx=333-rightfoot;dy=488-bb[3]
            assert dx+bb[0]>=24 and dx+bb[2]<=488,(i,'weapon margin',bb,dx)
            cell.alpha_composite(tile,(dx,dy))
            if i<5:
                # Register the two planted sole centers to the actual slam endpoint.
                # Coordinates are measured on the pre-registration candidate review.
                rear,front=[(122,316),(125,334),(122,335),(125,334),(108,334)][i]
                sx=210/(front-rear);tx=142-sx*rear
                cell=cell.transform((512,512),Image.Transform.AFFINE,(1/sx,0,-tx/sx,0,1,0),Image.Resampling.BICUBIC)
                records_note={'rearFootX':142,'frontFootX':352,'soleY':487,'registrationScaleX':sx}
            else:records_note={}
        cells.append(cell)
        records.append({'frame':i,'sourceGridCell':[x,y],'sourceBounds':b})
        if name=='oklopnik-drugi' and i<5:records[-1].update(records_note)
    if name=='oklopnik-drugi':
        # Exact source endpoint prevents a different pose/height on the transition.
        end=Image.open(run/'uzor-kraj.png').convert('RGBA')
        eb=bounds(end);assert eb[0]>=24 and eb[2]<=488
        cells[5]=end
    for i,c in enumerate(cells):
        c.save(candidate/f'frame-{i}.png')
        b=bounds(c);touches=b[0]==0 or b[1]==0 or b[2]==c.width or b[3]==c.height
        records[i].update(bounds=list(b),left=b[0],right=b[2]-1,top=b[1],bottom=b[3]-1,height=b[3]-b[1],touchesEdge=touches,minMargin=min(b[0],b[1],c.width-b[2],c.height-b[3]))
        opaque=bounds(c,127)
        records[i]['opaqueBounds']=list(opaque)
        records[i]['opaqueHeight']=opaque[3]-opaque[1]
        if name=='fx-potres':
            arr=np.array(c)
            records[i]['opaqueCorePixels']=int((arr[:,:,3]==255).sum())
            dark=((arr[480:488,:,0]<85)&(arr[480:488,:,1]<60)&(arr[480:488,:,3]>128)).any(axis=1)
            records[i]['darkCrackThicknessPixels']=int(dark.sum())
            assert 90<=records[i]['opaqueHeight']<=110,records[i]
            assert 6<=records[i]['darkCrackThicknessPixels']<=10
        assert not touches
        if name=='oklopnik-drugi':assert records[i]['minMargin']>=24
        else:assert 90<=records[i]['height']<=110 and b[3]==488
    if name=='fx-potres':assert all(records[i]['right']<records[i+1]['right'] for i in range(4))
    w=cells[0].width;board=Image.new('RGBA',(w*3,1080),(32,38,43,255));d=ImageDraw.Draw(board)
    for i,c in enumerate(cells):
        x,y=i%3*w,i//3*540;board.alpha_composite(c,(x,y));d.text((x+8,y+8),f'{i}: {records[i]["bounds"]}',fill='white')
    board.save(candidate/'review.png')
    if name=='oklopnik-drugi':
        idle=Image.open(run/'uzor.png').convert('RGBA');zoom=Image.open(run/'uzor-zum.png').convert('RGBA');end=Image.open(run/'uzor-kraj.png').convert('RGBA')
        comp=Image.new('RGBA',(1536,550),(32,38,43,255));dc=ImageDraw.Draw(comp)
        for j,(im,label) in enumerate([(idle,'Actual idle identity'),(cells[0],'v3 frame 0'),(end,'Actual slam final = v3 frame 5')]):
            comp.alpha_composite(im,(512*j,28));dc.text((512*j+8,8),label,fill='white')
        comp.save(candidate/'identity-size-comparison.png')
        overlay=bg(zoom)
        tint=cells[0].copy();tint.putalpha(tint.getchannel('A').point(lambda a:round(a*.5)))
        overlay.alpha_composite(tint);overlay.save(candidate/'size-overlay.png')
        endpoint=Image.new('RGBA',(1024,512),(32,38,43,255));endpoint.alpha_composite(end,(0,0));endpoint.alpha_composite(cells[5],(512,0));endpoint.save(candidate/'endpoint-comparison.png')
    else:
        cells[0].save(candidate/'reference.png')
    write(candidate/'measurements.json',{'clip':name,'version':'v3','attempts':int(attempt),'frames':records,'endpointExactSource':name=='oklopnik-drugi'})
    print(json.dumps(records))

def publish(name):
    run=PACK/'sources'/name/'v3';candidate=run/'candidate'
    q=json.loads((candidate/'measurements.json').read_text('utf-8'))
    cells=[Image.open(candidate/f'frame-{i}.png').convert('RGBA') for i in range(6)]
    out=PACK/'assets'/name
    if out.exists() and not (out/'qa.json').exists():
        assert out.resolve().parent==(PACK/'assets').resolve()
        out.rename(run/f'failed-export-{time.time_ns()}')
    assert not out.exists(),'Existing delivery preserved; inspect before replacing'
    (out/'frames/motion').mkdir(parents=True)
    w=cells[0].width;atlas=Image.new('RGBA',(w*6,512))
    for i,c in enumerate(cells):c.save(out/f'frames/motion/frame-{i}.png');atlas.paste(c,(i*w,0))
    atlas.save(out/'atlas.png');shutil.copy2(candidate/'review.png',out/'preview.png')
    if name=='oklopnik-drugi':
        for f in ['identity-size-comparison.png','size-overlay.png','endpoint-comparison.png']:shutil.copy2(candidate/f,out/f)
        shutil.copy2(run/'uzor.png',out/'reference.png')
    else:shutil.copy2(candidate/'reference.png',out/'reference.png')
    m=json.loads((PACK/'assets/sword-drugi/manifest.json').read_text('utf-8'))
    m.update(characterId=name,holdLastFrame=True,renderScale=1,renderAnchor={'x':w//2,'y':488},chroma_key={'name':'green','hex':'#00FF00','rgb':[0,255,0]})
    m['cell'].update(width=w,height=512,shape='rectangle' if w==1024 else 'square');m['cell'].pop('size',None)
    m['animation'].update(cellWidth=w,cellHeight=512,columns=6)
    m['animation']['rows']['motion'].update(frames=6,fps=12,loop=False,holdLastFrame=True,durations_ms=[83,83,84,83,83,84])
    m['frame_layout']={'sheetWidth':w*6,'sheetHeight':512,'cellWidth':w,'cellHeight':512,'rows':{'motion':[{'x':i*w,'y':0,'w':w,'h':512} for i in range(6)]}}
    m.pop('scaleReference',None);m.pop('worldBodyHeight',None)
    m['renderNote']='v3; fixed ground y487. Endpoint is exact final oklopnik-slam reference.' if w==512 else 'v3; one shockwave per 1024x512 cell; ground y487.'
    write(out/'manifest.json',m)
    write(out/'frames/frames-manifest.json',{'cellWidth':w,'cellHeight':512,'states':{'motion':{'frames':6,'fps':12,'loop':False,'files':[f'motion/frame-{i}.png' for i in range(6)]}}})
    subprocess.run([str(SG),'compose-gif',*[str(out/f'frames/motion/frame-{i}.png') for i in range(6)],'--output',str(out/'preview.gif'),'--delay-ticks','8','--loop-count','0'],check=True,stdout=subprocess.DEVNULL)
    q.update(atlasMatchesFrames=all(atlas.crop((i*w,0,(i+1)*w,512)).tobytes()==cells[i].tobytes() for i in range(6)),gifFrames=Image.open(out/'preview.gif').n_frames,loop=False,holdLastFrame=True,visualReviewPassed=True)
    if name=='oklopnik-drugi':
        q['endpointMatchesSlamPixels']=cells[5].tobytes()==Image.open(run/'uzor-kraj.png').convert('RGBA').tobytes()
        assert q['endpointMatchesSlamPixels']
    assert q['atlasMatchesFrames'] and q['gifFrames']==6
    write(out/'qa.json',q)
    for f in ['qa.json','manifest.json']:assert not (out/f).read_bytes().startswith(b'\xef\xbb\xbf')
    print('Published',name,q['gifFrames'],'frames')

if __name__=='__main__':
    if sys.argv[1]=='prepare':prepare(*sys.argv[2:])
    elif sys.argv[1]=='publish':publish(sys.argv[2])
    elif sys.argv[1]=='protected':
        hashes=json.loads((PACK/'sources/oklopnik-drugi/v3/protected-hashes.json').read_text('utf-8'))
        changed=[n for n,h in hashes.items() if hashlib.sha256((GAME/n).read_bytes()).hexdigest()!=h]
        assert not changed,changed
        print('Protected files unchanged:',len(hashes))
