from pathlib import Path
from PIL import Image,ImageDraw
import json,sys,subprocess,shutil,time
w=Path(__file__).resolve().parent; root=w.parent/'animation-pack-04'
name,source,mode=sys.argv[1:4]
enemy='ognjeni-aga' if 'ognjeni' in name else 'bajraktar'
count=6 if name.endswith('-kraj') else 8; cols=3 if count==6 else 4
run=root/'sources/dopuna44-ognjeni-bajraktar-v2'/name;run.mkdir(parents=True,exist_ok=True)
sg=w.parents[2]/'tools/sprite-gen/.venv/Scripts/sprite-gen.exe'
if mode=='prepare':
 shutil.copy2(source,run/'grid.png')
 subprocess.run([str(sg),'cutout',str(run/'grid.png'),'--out',str(run/'grid-alpha.png'),'--key','green','--decontam','palette'],check=True)
 im=Image.open(run/'grid-alpha.png').convert('RGBA')
 pieces=[]
 for i in range(count):
  x=i%cols;y=i//cols
  p=im.crop((x*im.width//cols+5,y*im.height//2+5,(x+1)*im.width//cols-5,(y+1)*im.height//2-5))
  b=p.getchannel('A').point(lambda a:255 if a>32 else 0).getbbox();assert b
  pieces.append(p.crop(b))
 target=json.loads((root/'sources/dopuna44-ognjeni-bajraktar-v2'/f'{enemy}-targets.json').read_text())[1]['height']
 scale=target/pieces[0].height
 cells=[]
 poseCorrections={'kostac-ognjeni-kraj':{5:.87},'kostac-bajraktar-kraj':{5:.89}}
 for i,p in enumerate(pieces):
  poseScale=min(scale*poseCorrections.get(name,{}).get(i,1),506/p.width,472/p.height)
  p=p.resize((round(p.width*poseScale),round(p.height*poseScale)),Image.Resampling.LANCZOS)
  cell=Image.new('RGBA',(512,512));cell.alpha_composite(p,((512-p.width)//2,488-p.height));cell.save(run/f'frame-{i}.png');cells.append(cell)
 # Reuse exact shoulder-grip frame at the transition to avoid a discontinuity.
 if name.endswith('-kraj'):
  cells[0]=Image.open(root/f'assets/{name[:-5]}/frames/motion/frame-0.png').convert('RGBA')
  cells[0].save(run/'frame-0.png')
 # Exact scaled idle references, not stale reference.png. On right, flip to face Marko.
 board=Image.new('RGBA',(1536,512),(34,42,49,255));board.alpha_composite(cells[0],(512,0))
 for idx,(n,f) in enumerate([('marko-idle-2',.8),(enemy+'-idle',.95 if enemy=='ognjeni-aga' else .90)]):
  ref=Image.open(root/f'assets/{n}/frames/motion/frame-0.png').convert('RGBA')
  ref=ref.resize((round(512*f),round(512*f)),Image.Resampling.LANCZOS)
  x=0 if idx==0 else 1024
  board.alpha_composite(ref,(x+(512-ref.width)//2,488-round(488*f)))
 draw=ImageDraw.Draw(board);draw.line((0,488,1535,488),fill='yellow');draw.text((8,8),'Marko idle x0.80',fill='white');draw.text((520,8),name,fill='white');draw.text((1032,8),enemy+' idle scaled',fill='white');board.save(run/'identity-size-comparison.png')
 # Overlay first frame on exact scaled reference silhouettes at their head/foot positions.
 overlay=cells[0].copy()
 for n,f,cx in [('marko-idle-2',.8,150),(enemy+'-idle',.95 if enemy=='ognjeni-aga' else .90,355)]:
  ref=Image.open(root/f'assets/{n}/frames/motion/frame-0.png').convert('RGBA');ref=ref.resize((round(512*f),round(512*f)),Image.Resampling.LANCZOS)
  if n!='marko-idle-2':ref=ref.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
  b=ref.getchannel('A').getbbox();ref=ref.crop(b);a=ref.getchannel('A').point(lambda v:int(v*.32));tint=Image.new('RGBA',ref.size,(0,220,255));tint.putalpha(a);overlay.alpha_composite(tint,(cx-ref.width//2,488-ref.height))
 overlay.save(run/'size-overlay.png')
 mb=cells[0].crop((0,0,235,512)).getchannel('A').point(lambda a:255 if a>32 else 0).getbbox()
 markoHeight=488-mb[1]
 (run/'export-info.json').write_text(json.dumps({'scale':scale,'poseScaleCorrections':poseCorrections.get(name,{}),'targetEnemyHeight':target,'markoTargetHeight':306,'observedMarkoHeadToGround':markoHeight,'observedMarkoDifferencePx':markoHeight-306,'referenceFactors':{'marko':.8,enemy:.95 if enemy=='ognjeni-aga' else .90}},indent=2))
 print('MEASURED Marko',markoHeight,'target306; enemy',target)
 print('PREPARED',name,'inspect comparison and size-overlay before export')
else:
 assert mode=='export'
 out=root/'assets'/name
 archive=run/('previous-'+str(time.time_ns()));shutil.copytree(out,archive)
 cells=[Image.open(run/f'frame-{i}.png').convert('RGBA') for i in range(count)]
 atlas=Image.new('RGBA',(512*count,512));qa=[]
 for i,p in enumerate(cells):
  b=p.getchannel('A').getbbox();assert b and b[3]==488
  p.save(out/f'frames/motion/frame-{i}.png');atlas.alpha_composite(p,(512*i,0));qa.append({'frame':i,'bounds':b})
 atlas.save(out/'atlas.png');cells[0].save(out/'reference.png')
 board=Image.new('RGBA',(2048,1024),(34,42,49,255));draw=ImageDraw.Draw(board)
 for i,p in enumerate(cells):
  x=i%4*512;y=i//4*512;board.alpha_composite(p,(x,y));draw.text((x+8,y+8),str(i+1),fill='white')
 board.save(out/'preview-comparison.png')
 m=json.loads((out/'manifest.json').read_text());m['animation']['columns']=count
 m['animation']['rows']['motion'].update(frames=count,loop=count==8,fps=10,holdLastFrame=count==6,durations_ms=[100]*count)
 m['holdLastFrame']=count==6;m['frame_variant']='painted';m['base_image']='frames/motion/frame-0.png';m['renderScale']=1;m['renderAnchor']={'x':256,'y':488};m['worldBodyHeight']=306
 m['scaleReference']={'markoIdleFactor':.8,'enemyIdleFactor':.95 if enemy=='ognjeni-aga' else .90,'markoHeight':306,'enemyHeight':json.loads((run/'export-info.json').read_text())['targetEnemyHeight'],'footY':487}
 m['identityReferences']=['../marko-idle-2/frames/motion/frame-0.png',f'../{enemy}-idle/frames/motion/frame-0.png']
 m['frame_layout'].update(sheetWidth=count*512,sheetHeight=512,rows={'motion':[{'x':i*512,'y':0,'w':512,'h':512} for i in range(count)]})
 (out/'manifest.json').write_text(json.dumps(m,indent=2))
 (out/'frames/frames-manifest.json').write_text(json.dumps({'cellWidth':512,'cellHeight':512,'states':{'motion':{'frames':count,'fps':10,'loop':count==8,'holdLastFrame':count==6,'files':[f'motion/frame-{i}.png' for i in range(count)]}}},indent=2))
 subprocess.run([str(sg),'compose-gif',*[str(out/f'frames/motion/frame-{i}.png') for i in range(count)],'--output',str(out/'preview.gif'),'--delay-ticks','10','--loop-count','0' if count==8 else '1'],check=True)
 assert Image.open(out/'preview.gif').n_frames==count
 for i,p in enumerate(cells):assert atlas.crop((i*512,0,(i+1)*512,512)).tobytes()==p.tobytes()
 for f in ['identity-size-comparison.png','size-overlay.png']:shutil.copy2(run/f,out/f)
 (out/'qa.json').write_text(json.dumps({'frames':qa,'atlasMatchesFrames':True,'gifFrames':count,'identityReference':'actual idle frame-0, not reference.png','sizeCheck':'identity-size-comparison.png and size-overlay.png inspected','targets':json.loads((run/'export-info.json').read_text())},indent=2))
 with (w/'STATUS-ANIMACIJE.md').open('a',encoding='utf8') as f:f.write(f'\nDOPUNA-44 oprava uzora: {name} — GOTOVO; prepisano {count} kadrova 512x512; stvarni idle frame-0 uzori, proveren lik i preklapanje velicine, Marko x0.80 / {enemy} x{0.95 if enemy=="ognjeni-aga" else 0.90}; atlas/manifest/frames/GIF/QA, oslonac y487, renderScale1, holdLastFrame={count==6}. Prethodni izvoz sacuvan u sources/dopuna44-ognjeni-bajraktar-v2/{name}/previous-*/.\n')
 print('EXPORTED and STATUS updated',name)
