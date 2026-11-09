from pathlib import Path
from PIL import Image,ImageDraw
import json,sys,shutil,subprocess
import numpy as np
root=Path(__file__).resolve().parent;game=root.parents[1]
name,source=sys.argv[1:3]
reexport='--reexport' in sys.argv
j=next(j for j in json.loads((root/'plan-dopuna21.json').read_text(encoding='utf-8-sig'))['jobs'] if j['id']==name)
out=root/'assets'/name;run=root/'sources'/name
assert not (out/'atlas.png').exists() or reexport, 'Existing output preserved'
run.mkdir(exist_ok=True)
raw=run/j.get('sourceFile','grid.png')
if not reexport:shutil.copy2(source,raw)
sg=game.parent/'tools/sprite-gen/.venv/Scripts/sprite-gen.exe'
if j['kind']=='marko':
 subprocess.run([str(sg),'cutout',str(raw),'--out',str(run/'grid-alpha.png'),'--key','green','--decontam','palette'],check=True,stdout=subprocess.DEVNULL)
 grid=Image.open(run/'grid-alpha.png').convert('RGBA')
else:
 grid=Image.open(raw).convert('RGBA');assert grid.getchannel('A').getextrema()[0]==0,'Missing native alpha'
def slot(i):
 x,y=i%j['cols'],i//j['cols']
 return grid.crop((x*grid.width//j['cols'],y*grid.height//j['rows'],(x+1)*grid.width//j['cols'],(y+1)*grid.height//j['rows']))
reference=Image.open(game/j['reference']).convert('RGBA') if j['reference'] else None
pieces=[slot(i) for i in range(8)];scaleinfo=None
if j['kind']=='marko':
 def trim(p):
  p=p.crop((4,4,p.width-4,p.height-4));b=p.getchannel('A').point(lambda v:255 if v>16 else 0).getbbox();assert b;return p.crop(b)
 pieces=[trim(p) for p in pieces];cal=trim(slot(8))
 scale=min(383/cal.height,500/max(p.width for p in pieces),480/max(p.height for p in pieces))
 scaleinfo={'referenceHeight':383,'calibrationHeight':cal.height,'scaledCalibrationHeight':round(cal.height*scale),'uniformScale':scale,'footY':487}
atlas=Image.new('RGBA',(4096,512));board=Image.new('RGBA',(1536,1536),(29,38,46,255));draw=ImageDraw.Draw(board)
(out/'frames/motion').mkdir(parents=True,exist_ok=True);qa=[]
if reference:
 reference.save(out/'reference.png');board.alpha_composite(reference.resize((512,512)),(0,0));draw.text((8,8),'reference',fill='white')
for i,p in enumerate(pieces):
 if j['kind']=='marko':
  p=p.resize((round(p.width*scale),round(p.height*scale)),Image.Resampling.LANCZOS)
  cell=Image.new('RGBA',(512,512));cell.alpha_composite(p,((512-p.width)//2,488-p.height));assert cell.getchannel('A').getbbox()[3]==488
 else:
  # Keep shared full-cell coordinates; never align a fairy/effect to its bounding box.
  cell=p.resize((512,512),Image.Resampling.LANCZOS)
  if j.get('alphaExtracted')=='white':
   # Remove neutral matte residue left by the supplied white background,
   # retaining the colored mint/gold filaments and their soft alpha.
   a=np.array(cell);rgb=a[:,:,:3].astype(float)
   chroma=rgb.max(axis=2)-rgb.min(axis=2)
   weight=np.clip((chroma-8)/24,0,1)
   yy,xx=np.mgrid[:512,:512]
   weight*=np.clip(np.minimum(xx,511-xx)/48,0,1)
   weight*=np.clip((95-np.abs(yy-256))/20,0,1)
   a[:,:,3]=np.round(a[:,:,3]*weight).astype('uint8');cell=Image.fromarray(a)
  if j['kind']=='fairy':
   floating=Image.new('RGBA',(512,512));floating.paste(cell.resize((460,460),Image.Resampling.LANCZOS),(26,26));cell=floating
 assert cell.getchannel('A').getextrema()[0]==0
 cell.save(out/f'frames/motion/frame-{i}.png');atlas.paste(cell,(i*512,0))
 qa.append({'frame':i,'bounds':cell.getchannel('A').getbbox(),'alpha':cell.getchannel('A').getextrema()})
 x,y=(i+1)%3*512,(i+1)//3*512;board.alpha_composite(cell,(x,y));draw.text((x+8,y+8),str(i+1),fill='white')
atlas.save(out/'atlas.png');board.convert('RGB').save(out/'preview-comparison.png')
m=json.loads((root/'assets/marko-walk/manifest.json').read_text());m['characterId']=name
m['animation']['columns']=8;m['animation']['rows']['motion'].update(frames=8,fps=12,loop=j['loop'],durations_ms=[83]*8)
m['frame_layout'].update(sheetWidth=4096,sheetHeight=512,rows={'motion':[dict(x=i*512,y=0,w=512,h=512) for i in range(8)]})
m['sprite_sheet_alpha_report']=None
if j['kind']=='marko':m['scaleReference']=scaleinfo
else:
 m['chroma_key']=None;m['base_image']='reference.png' if reference else None
 m['assetType']='floating-fairy' if j['kind']=='fairy' else 'fairy-magic-effect';m['renderAnchor']={'x':256,'y':256};m['noFootAlignment']=True
 m.pop('scaleReference',None)
(out/'manifest.json').write_text(json.dumps(m,indent=2));(out/'frames/frames-manifest.json').write_text(json.dumps({'cellWidth':512,'cellHeight':512,'states':{'motion':{'frames':8,'fps':12,'loop':j['loop'],'files':[f'motion/frame-{i}.png' for i in range(8)]}}},indent=2))
subprocess.run([str(sg),'compose-gif',*[str(out/f'frames/motion/frame-{i}.png') for i in range(8)],'--output',str(out/'preview.gif'),'--delay-ticks','8','--loop-count','0'],check=True,stdout=subprocess.DEVNULL)
assert Image.open(out/'preview.gif').n_frames==8
for i in range(8):assert atlas.crop((512*i,0,512*(i+1),512)).tobytes()==Image.open(out/f'frames/motion/frame-{i}.png').convert('RGBA').tobytes()
(out/'qa.json').write_text(json.dumps({'frames':qa,'loop':j['loop'],'scaleReference':scaleinfo,'nativeAlpha':j['kind']!='marko' and not j.get('alphaExtracted'),'alphaExtraction':j.get('alphaExtracted'),'fullCellCoordinates':j['kind']!='marko','atlasMatchesFrames':True,'gifFrames':8},indent=2))
with (root.parent/'world-pack-03/STATUS-ANIMACIJE.md').open('a',encoding='utf8') as f:
 f.write(f"\nDOPUNA-21: {name} — GOTOVO; 8 kadrova, {'petlja' if j['loop'] else 'jednom'}, PNG RGBA512x512, atlas/manifest sa frame_layout/frames/preview.gif/qa.json/preview-comparison.png u art/animation-pack-04/assets/{name}/. {'Marko: zum kalibrisan prema383px idle-u, oslonac y487.' if j['kind']=='marko' else 'Izvorna providnost, zajednicke koordinate celija, bez oslonca na stopala.'} Ugradjeni image_gen, {j.get('attempts',1)} pokusaj(a). Prompt: plan-dopuna21.json.\n")
print('Delivered:',name,'8 frames; native alpha:',j['kind']!='marko')
