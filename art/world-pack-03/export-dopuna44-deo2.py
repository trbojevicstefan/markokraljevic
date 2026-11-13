from pathlib import Path
from PIL import Image,ImageDraw
import json,sys,shutil,subprocess
world=Path(__file__).resolve().parent;root=world.parent/'animation-pack-04';game=world.parents[1]
name,source=sys.argv[1:3]
j=next(j for j in json.loads((world/'prompts-dopuna44-deo2.json').read_text(encoding='utf-8-sig'))['jobs'] if j['id']==name)
run=root/'sources'/name if j['kind']!='nest' else world/'sources/dopuna40'/name
run.mkdir(parents=True,exist_ok=True);raw=run/'grid.png';replaceGenerated='--replace-generated' in sys.argv;assert not raw.exists() or replaceGenerated
if raw.exists():
 archive=run/'grid-first-attempt.png';assert not archive.exists();raw.replace(archive)
shutil.copy2(source,raw)
if j['kind']=='nest':
 out=world/(name+'.png');assert not out.exists();im=Image.open(raw).convert('RGBA');assert im.getchannel('A').getextrema()[0]==0
 b=im.getchannel('A').point(lambda v:255 if v>16 else 0).getbbox();assert b;im=im.crop(b);im.thumbnail((748,724),Image.Resampling.LANCZOS)
 final=Image.new('RGBA',(768,768));final.paste(im,((768-im.width)//2,(768-im.height)//2));final.save(out)
 message='PNG RGBA768x768 na vrhu art/world-pack-03/, bacva vina na nogaru, providnost proverena.'
else:
 out=root/'assets'/name;assert not (out/'atlas.png').exists() or replaceGenerated;(out/'frames/motion').mkdir(parents=True,exist_ok=True)
 sg=game.parent/'tools/sprite-gen/.venv/Scripts/sprite-gen.exe';cut=run/'grid-alpha.png'
 subprocess.run([str(sg),'cutout',str(raw),'--out',str(cut),'--key','green','--decontam','palette'],check=True,stdout=subprocess.DEVNULL)
 grid=Image.open(cut).convert('RGBA')
 def slot(i):
  x,y=i%j['cols'],i//j['cols'];inset=10 if j['kind']=='human' else 3;return grid.crop((x*grid.width//j['cols']+inset,y*grid.height//j['rows']+inset,(x+1)*grid.width//j['cols']-inset,(y+1)*grid.height//j['rows']-inset))
 def trim(p):
  # Register a detached horizontal ground prop to the BODY ground line.
  # This is export alignment, not new painted content or per-pose resizing.
  alpha=p.getchannel('A').point(lambda v:255 if v>16 else 0)
  b=alpha.getbbox();assert b
  rows=[alpha.crop((0,y,p.width,y+1)).getbbox() is not None for y in range(b[1],b[3])]
  k=len(rows)-1
  while k>=0 and rows[k]:k-=1
  if k>len(rows)*.65:
   lowStart=b[1]+k+1
   lower=p.crop((0,lowStart,p.width,b[3]));lb=lower.getchannel('A').getbbox()
   upper=p.crop((0,0,p.width,lowStart));ub=upper.getchannel('A').getbbox()
   if lb and ub and (lb[2]-lb[0])>6*(lb[3]-lb[1]) and lower.height<.15*(b[3]-b[1]):
    fixed=Image.new('RGBA',(p.width,ub[3]));fixed.paste(upper.crop((0,0,p.width,ub[3])),(0,0));fixed.alpha_composite(lower,(0,ub[3]-lower.height));p=fixed
  b=p.getchannel('A').point(lambda v:255 if v>16 else 0).getbbox();assert b;return p.crop(b)
 if j['kind']=='bird':
  sources=[slot(i).resize((512,512),Image.Resampling.LANCZOS) for i in range(j['frames'])]
  anchors=[(a[0]*512,a[1]*512) for a in j['bodyAnchors']]
  extents=[]
  for p,(bx,by) in zip(sources,anchors):
   b=p.getchannel('A').point(lambda v:255 if v>16 else 0).getbbox();assert b
   extents.append((bx-b[0],b[2]-bx,by-b[1],b[3]-by))
  scale=min(236/max(e[0] for e in extents),236/max(e[1] for e in extents),284/max(e[2] for e in extents),192/max(e[3] for e in extents))
  cells=[p.transform((512,512),Image.Transform.AFFINE,(1/scale,0,bx-256/scale,0,1/scale,by-300/scale),Image.Resampling.BICUBIC) for p,(bx,by) in zip(sources,anchors)]
  span=max(p.getchannel('A').getbbox()[2]-p.getchannel('A').getbbox()[0] for p in cells)
  bodyLength=j['bodyLengthSource']*512*scale
  if name in ('soko-let','utva-let','soko-vezirov-let'):renderScale=345/span;worldBodyLength=bodyLength*renderScale
  else:
   fm=json.loads((root/'assets/soko-let/manifest.json').read_text());worldBodyLength=fm['worldBodyLength'];renderScale=worldBodyLength/bodyLength
  scaleInfo={'bodyAnchorsSource':j['bodyAnchors'],'sourceBodyLength':j['bodyLengthSource'],'cellBodyLength':bodyLength,'uniformScale':scale}
  anchor={'x':256,'y':300}
 else:
  pieces=[trim(slot(i)) for i in range(j['frames'])];cal=trim(slot(j['calibrationFrame']))
  scale=min(j['targetHeight']/cal.height,488/max(p.width for p in pieces),472/max(p.height for p in pieces));cellHeight=round(cal.height*scale);renderScale=j['targetHeight']/cellHeight
  cells=[]
  for p in pieces:
   p=p.resize((max(1,round(p.width*scale)),max(1,round(p.height*scale))),Image.Resampling.LANCZOS);cell=Image.new('RGBA',(512,512));cell.paste(p,((512-p.width)//2,488-p.height));cells.append(cell)
  scaleInfo={'referenceHeight':j['targetHeight'],'cellCalibrationHeight':cellHeight,'uniformScale':scale,'footY':487};anchor={'x':256,'y':488}
 atlas=Image.new('RGBA',(512*j['frames'],512));board=Image.new('RGBA',(2048,((j['frames']+4)//4)*512),(29,38,46,255));d=ImageDraw.Draw(board);qa=[]
 ref=Image.open(game/j['references'][0]).convert('RGBA');ref.save(out/'reference.png');board.alpha_composite(ref.resize((512,512)),(0,0));d.text((8,8),'reference',fill='white')
 for i,cell in enumerate(cells):
  cell.save(out/f'frames/motion/frame-{i}.png');atlas.paste(cell,(i*512,0));assert cell.getchannel('A').getextrema()[0]==0
  if j['kind']=='human':assert cell.getchannel('A').getbbox()[3]==488
  qa.append({'frame':i,'bounds':cell.getchannel('A').getbbox(),'anchor':anchor});x,y=(i+1)%4*512,(i+1)//4*512;board.alpha_composite(cell,(x,y));d.text((x+8,y+8),str(i+1),fill='white')
 atlas.save(out/'atlas.png');board.convert('RGB').save(out/'preview-comparison.png')
 m=json.loads((root/'assets/marko-walk/manifest.json').read_text());m['characterId']=name;m['animation']['columns']=j['frames'];m['animation']['rows']['motion'].update(frames=j['frames'],fps=j['fps'],loop=j['loop'],durations_ms=[round(1000/j['fps'])]*j['frames'])
 m['frame_layout'].update(sheetWidth=j['frames']*512,sheetHeight=512,rows={'motion':[dict(x=i*512,y=0,w=512,h=512) for i in range(j['frames'])]})
 
 if 'impactFrame' in j:m['impactFrame']=j['impactFrame'];m['impactFrameOneBased']=j['impactFrame']+1
 if 'impactFrames' in j:m['impactFrames']=j['impactFrames'];m['impactFramesOneBased']=[i+1 for i in j['impactFrames']]
 if 'releaseFrame' in j:m['releaseFrame']=j['releaseFrame'];m['releaseFrameOneBased']=j['releaseFrame']+1
 m['chroma_key']={'name':'green','hex':'#00FF00','rgb':[0,255,0]};m['sprite_sheet_alpha_report']=None;m['scaleReference']=scaleInfo;m['renderScale']=renderScale;m['renderAnchor']=anchor
 if j['kind']=='bird':m.update(assetType='flying-bird',noFootAlignment=True,worldWingspan=345,worldBodyLength=worldBodyLength)
 else:m['worldBodyHeight']=j['targetHeight']
 m['renderNote']='Apply renderScale about renderAnchor; birds use torso center y300, humans use ground y488.'
 if name in ('marko-sablja-udarac-1','marko-sablja-udarac-2','marko-sablja-udarac-3'):m['impactFrame']=3;m['impactFrameOneBased']=4
 if name=='marko-sablja-skok':m['landingFrame']=5;m['landingFrameOneBased']=6
 (out/'manifest.json').write_text(json.dumps(m,indent=2));(out/'frames/frames-manifest.json').write_text(json.dumps({'cellWidth':512,'cellHeight':512,'states':{'motion':{'frames':j['frames'],'fps':j['fps'],'loop':j['loop'],'files':[f'motion/frame-{i}.png' for i in range(j['frames'])]}}},indent=2))
 subprocess.run([str(sg),'compose-gif',*[str(out/f'frames/motion/frame-{i}.png') for i in range(j['frames'])],'--output',str(out/'preview.gif'),'--delay-ticks',str(round(100/j['fps'])),'--loop-count','0'],check=True,stdout=subprocess.DEVNULL)
 assert Image.open(out/'preview.gif').n_frames==j['frames']
 for i in range(j['frames']):assert atlas.crop((i*512,0,(i+1)*512,512)).tobytes()==cells[i].tobytes()
 (out/'qa.json').write_text(json.dumps({'frames':qa,'loop':j['loop'],'atlasMatchesFrames':True,'gifFrames':j['frames'],'renderScale':renderScale},indent=2))
 message=f'{j["frames"]}kadova512x512, '+('petlja' if j['loop'] else 'jednom')+f', atlas/manifest/frame_layout/frames/preview.gif/qa.json u art/animation-pack-04/assets/{name}/. renderScale={renderScale:.4f}, renderAnchor={anchor}.'
with (world/'STATUS-ANIMACIJE.md').open('a',encoding='utf8') as f:
 f.write(f'\nDOPUNA-44 deo 2: {name} — GOTOVO; {message} Ugradjeni image_gen, izvor i kalibracija sacuvani; prompt prompts-dopuna44-deo2.json, izvor sacuvan.\n')
print('Saved and logged:',name)
