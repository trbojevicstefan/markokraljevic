from pathlib import Path
from PIL import Image, ImageDraw
import numpy as np
import json, sys, shutil, subprocess
root=Path(__file__).resolve().parent
name, source=sys.argv[1:3]
out=root/'assets'/name; run=root/'sources'/name
assert not (out/'atlas.png').exists(), 'Existing output preserved'
run.mkdir(parents=True,exist_ok=True);shutil.copy2(source,run/'grid.png')
grid=Image.open(source).convert('RGBA');assert grid.getchannel('A').getextrema()[0]==0
(out/'frames/motion').mkdir(parents=True,exist_ok=True)
atlas=Image.new('RGBA',(4096,512));board=Image.new('RGBA',(1024,512),(30,39,46,255));draw=ImageDraw.Draw(board);qa=[]
for i in range(8):
    x,y=i%4,i//4
    f=grid.crop((x*grid.width//4,y*grid.height//2,(x+1)*grid.width//4,(y+1)*grid.height//2))
    bounds=f.getchannel('A').point(lambda v:255 if v>32 else 0).getbbox();assert bounds
    f=f.crop(bounds);a=np.array(f.getchannel('A'))
    # Locate the straight hoist at the extreme left, independently of moving tips.
    col=min(3,f.width-1);ys=np.where(a[:,col]>128)[0];assert len(ys)>10
    y0,y1=int(ys[0]),int(ys[-1])+1
    sy=181/(y1-y0);sx=420/f.width
    w,h=420,round(f.height*sy)
    f=f.resize((w,h),Image.Resampling.LANCZOS)
    cell=Image.new('RGBA',(512,512));cell.alpha_composite(f,(40,150-round(y0*sy)))
    cell.save(out/f'frames/motion/frame-{i}.png');atlas.alpha_composite(cell,(i*512,0))
    thumb=cell.resize((256,256),Image.Resampling.LANCZOS);board.alpha_composite(thumb,((i%4)*256,(i//4)*256));draw.text(((i%4)*256+8,(i//4)*256+8),str(i+1),fill='white')
    aa=np.array(cell.getchannel('A'));yy=np.where(aa[:,43]>128)[0]
    assert abs(int(yy[0])-150)<=1 and abs(int(yy[-1])-330)<=1,(i,yy[0],yy[-1])
    assert cell.getchannel('A').getextrema()[0]==0 and not aa[:,:40].any()
    qa.append({'frame':i,'hoistX':40,'hoistY0':int(yy[0]),'hoistY1':int(yy[-1]),'bounds':cell.getchannel('A').getbbox()})
atlas.save(out/'atlas.png');board.convert('RGB').save(out/'preview.png')
reference=root.parent/'world-pack-03'/('tkanina-barjak-'+('srpski' if 'srpski' in name else 'turski')+'.png');shutil.copy2(reference,out/'reference.png')
m=json.loads((root/'assets/marko-finisher-skull/manifest.json').read_text())
m.update(characterId=name,assetType='animated-banner',chroma_key=None)
for key in ['scaleReference','impactFrame','impactFrameOneBased']:m.pop(key,None)
m['animation']['rows']['motion'].update(loop=True,fps=12)
m['attachmentAnchor']={'x':40,'y':150,'edgeX':40,'edgeY0':150,'edgeY1':330,'fixed':True}
m['renderAnchor']={'x':40,'y':240};m['renderNote']='Attach fixed left hoist segment to pole. No foot/bottom alignment.'
(out/'manifest.json').write_text(json.dumps(m,indent=2))
(out/'frames/frames-manifest.json').write_text(json.dumps({'cellWidth':512,'cellHeight':512,'states':{'motion':{'frames':8,'fps':12,'loop':True,'files':[f'motion/frame-{i}.png' for i in range(8)]}}},indent=2))
sg=root.parents[2]/'tools/sprite-gen/.venv/Scripts/sprite-gen.exe'
subprocess.run([str(sg),'compose-gif',*[str(out/f'frames/motion/frame-{i}.png') for i in range(8)],'--output',str(out/'preview.gif'),'--delay-ticks','8','--loop-count','0'],check=True,stdout=subprocess.DEVNULL)
assert Image.open(out/'preview.gif').n_frames==8
for i in range(8):
    im=Image.open(out/f'frames/motion/frame-{i}.png').convert('RGBA');assert atlas.crop((i*512,0,(i+1)*512,512)).tobytes()==im.tobytes()
(out/'qa.json').write_text(json.dumps({'frames':qa,'loop':True,'anchorVerified':True,'atlasMatchesFrames':True,'gifFrames':8},indent=2))
with (root.parent/'world-pack-03/STATUS-ANIMACIJE.md').open('a',encoding='utf8') as status:
    status.write(f'\nDOPUNA-17: {name} — GOTOVO; 8 kadrova, petlja, 512x512, providni PNG, atlas 4096x512, manifest/frame_layout, frames, preview.gif, preview.png i qa.json u art/animation-pack-04/assets/{name}/. Ivica uz koplje fiksirana x40, y150–330 (provera alfa +/-1px), duzina oko420px; bez oslonca stopala. Ugradjeni image_gen, jedan pokusaj. Prompt: plan-dopuna17.json.\n')
print('Delivered and verified:',name)
