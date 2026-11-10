from pathlib import Path
from PIL import Image,ImageDraw
import json,sys,shutil,subprocess
world=Path(__file__).resolve().parent;root=world.parent/'animation-pack-04';game=world.parents[1]
name,source=sys.argv[1:3]
j=next(j for j in json.loads((world/'prompts-dopuna25.json').read_text(encoding='utf-8-sig'))['jobs'] if j['id']==name)
run=root/'sources'/name if j['type']=='clip' else world/'sources/dopuna25'/name
run.mkdir(parents=True,exist_ok=True);raw=run/'grid.png';assert not raw.exists();shutil.copy2(source,raw)
if j['type']=='cage':
 out=world/(name+'.png');assert not out.exists();im=Image.open(raw).convert('RGBA');assert im.getchannel('A').getextrema()[0]==0
 b=im.getchannel('A').point(lambda v:255 if v>16 else 0).getbbox();assert b;im=im.crop(b);im.thumbnail((748,724),Image.Resampling.LANCZOS)
 final=Image.new('RGBA',(768,768));final.paste(im,((768-im.width)//2,744-im.height));final.save(out)
 assert final.getchannel('A').getextrema()[0]==0 and final.getchannel('A').getbbox()[3]==744
 message='PNG RGBA768x768 na vrhu art/world-pack-03/, dno y743, providno, prazna unutrasnjost.'
else:
 out=root/'assets'/name;assert not (out/'atlas.png').exists();(out/'frames/motion').mkdir(parents=True,exist_ok=True)
 sg=game.parent/'tools/sprite-gen/.venv/Scripts/sprite-gen.exe';cut=run/'grid-alpha.png'
 subprocess.run([str(sg),'cutout',str(raw),'--out',str(cut),'--key','magenta','--decontam','palette'],check=True,stdout=subprocess.DEVNULL)
 grid=Image.open(cut).convert('RGBA')
 def piece(i):
  x,y=i%j['cols'],i//j['cols'];p=grid.crop((x*grid.width//j['cols']+3,y*grid.height//j['rows']+3,(x+1)*grid.width//j['cols']-3,(y+1)*grid.height//j['rows']-3))
  b=p.getchannel('A').point(lambda v:255 if v>16 else 0).getbbox();assert b;return p.crop(b)
 pieces=[piece(i) for i in range(j['frames'])];cal=piece(j['calibrationFrame'])
 scale=min(j['targetHeight']/cal.height,488/max(p.width for p in pieces),472/max(p.height for p in pieces))
 cellHeight=round(cal.height*scale);renderScale=j['targetHeight']/cellHeight
 atlas=Image.new('RGBA',(512*j['frames'],512));board=Image.new('RGBA',(2048,((j['frames']+4)//4)*512),(29,38,46,255));d=ImageDraw.Draw(board);qa=[]
 ref=Image.open(game/j['references'][0]).convert('RGBA');ref.save(out/'reference.png');board.alpha_composite(ref.resize((512,512)),(0,0));d.text((8,8),'reference',fill='white')
 for i,p in enumerate(pieces):
  p=p.resize((max(1,round(p.width*scale)),max(1,round(p.height*scale))),Image.Resampling.LANCZOS)
  cell=Image.new('RGBA',(512,512));cell.paste(p,((512-p.width)//2,488-p.height));cell.save(out/f'frames/motion/frame-{i}.png');atlas.paste(cell,(i*512,0))
  assert cell.getchannel('A').getbbox()[3]==488
  qa.append({'frame':i,'bounds':cell.getchannel('A').getbbox(),'footY':487})
  x,y=(i+1)%4*512,(i+1)//4*512;board.alpha_composite(cell,(x,y));d.text((x+8,y+8),str(i+1),fill='white')
 atlas.save(out/'atlas.png');board.convert('RGB').save(out/'preview-comparison.png')
 m=json.loads((root/'assets/marko-walk/manifest.json').read_text());m['characterId']=name
 m['animation']['columns']=j['frames'];m['animation']['rows']['motion'].update(frames=j['frames'],fps=12,loop=j['loop'],durations_ms=[83]*j['frames'])
 m['frame_layout'].update(sheetWidth=j['frames']*512,sheetHeight=512,rows={'motion':[dict(x=i*512,y=0,w=512,h=512) for i in range(j['frames'])]})
 m['chroma_key']={'name':'magenta','hex':'#FF00FF','rgb':[255,0,255]};m['sprite_sheet_alpha_report']=None
 m['scaleReference']={'referenceHeight':j['targetHeight'],'calibrationHeight':cal.height,'cellCalibrationHeight':cellHeight,'uniformScale':scale,'footY':487}
 m['renderScale']=renderScale;m['renderAnchor']={'x':256,'y':488};m['worldBodyHeight']=j['targetHeight']
 m['renderNote']='Apply renderScale about renderAnchor for actor scale matching passengers/janissaries; groups use a wider world footprint than one cell.'
 if name=='mladi-turcin-attack':m['impactFrame']=3;m['impactFrameOneBased']=4
 (out/'manifest.json').write_text(json.dumps(m,indent=2));(out/'frames/frames-manifest.json').write_text(json.dumps({'cellWidth':512,'cellHeight':512,'states':{'motion':{'frames':j['frames'],'fps':12,'loop':j['loop'],'files':[f'motion/frame-{i}.png' for i in range(j['frames'])]}}},indent=2))
 subprocess.run([str(sg),'compose-gif',*[str(out/f'frames/motion/frame-{i}.png') for i in range(j['frames'])],'--output',str(out/'preview.gif'),'--delay-ticks','8','--loop-count','0'],check=True,stdout=subprocess.DEVNULL)
 assert Image.open(out/'preview.gif').n_frames==j['frames']
 for i in range(j['frames']):assert atlas.crop((i*512,0,(i+1)*512,512)).tobytes()==Image.open(out/f'frames/motion/frame-{i}.png').convert('RGBA').tobytes()
 (out/'qa.json').write_text(json.dumps({'frames':qa,'loop':j['loop'],'atlasMatchesFrames':True,'gifFrames':j['frames'],'renderScale':renderScale},indent=2))
 message=f'{j["frames"]}kadova512x512, '+('petlja' if j['loop'] else 'jednom')+f', oslonac y487, atlas/manifest sa frame_layout/frames/preview.gif/qa.json u art/animation-pack-04/assets/{name}/. renderScale={renderScale:.4f} uz renderAnchor(256,488), svetska visina lika{j["targetHeight"]}px.'
with (world/'STATUS-ANIMACIJE.md').open('a',encoding='utf8') as f:
 f.write(f'\nDOPUNA-25: {name} — GOTOVO; {message} Ugradjeni image_gen, jedan pokusaj; prompt prompts-dopuna25.json, izvor sacuvan.\n')
print('Saved and logged:',name)
