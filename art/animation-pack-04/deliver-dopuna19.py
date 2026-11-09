from pathlib import Path
from PIL import Image,ImageDraw
import sys,json,shutil,subprocess
root=Path(__file__).resolve().parent;game=root.parents[1]
name,source=sys.argv[1:3]
reexport='--reexport' in sys.argv
j=next(j for j in json.loads((root/'plan-dopuna19.json').read_text(encoding='utf-8-sig'))['jobs'] if j['id']==name)
out=root/'assets'/name;run=root/'sources'/name
assert not (out/'atlas.png').exists() or reexport, 'Existing output preserved'
run.mkdir(exist_ok=True)
if not reexport:shutil.copy2(source,run/'grid.png')
sg=game.parent/'tools/sprite-gen/.venv/Scripts/sprite-gen.exe'
subprocess.run([str(sg),'cutout',str(run/'grid.png'),'--out',str(run/'grid-alpha.png'),'--key','green','--decontam','palette'],check=True,stdout=subprocess.DEVNULL)
grid=Image.open(run/'grid-alpha.png').convert('RGBA')
def piece(i):
 x,y=i%j['cols'],i//j['cols']
 im=grid.crop((x*grid.width//j['cols']+4,y*grid.height//j['rows']+4,(x+1)*grid.width//j['cols']-4,(y+1)*grid.height//j['rows']-4))
 box=im.getchannel('A').point(lambda a:255 if a>16 else 0).getbbox();assert box
 return im.crop(box)
pieces=[piece(i) for i in range(j['frames'])];cal=piece(j['calibrationFrame'])
scale=min(383/cal.height,500/max(p.width for p in pieces),480/max(p.height for p in pieces))
reference=Image.open(game/j['reference']).convert('RGBA')
(out/'frames/motion').mkdir(parents=True,exist_ok=True)
atlas=Image.new('RGBA',(512*j['frames'],512));qa=[]
board=Image.new('RGBA',(2048,((j['frames']+1+3)//4)*512),(29,38,46,255));draw=ImageDraw.Draw(board)
board.alpha_composite(reference,(0,0));draw.text((10,10),'marko-idle reference',fill='white')
for i,p in enumerate(pieces):
 p=p.resize((max(1,round(p.width*scale)),max(1,round(p.height*scale))),Image.Resampling.LANCZOS)
 cell=Image.new('RGBA',(512,512));cell.alpha_composite(p,((512-p.width)//2,488-p.height));cell.save(out/f'frames/motion/frame-{i}.png');atlas.alpha_composite(cell,(i*512,0))
 assert cell.getchannel('A').getbbox()[3]==488 and cell.getchannel('A').getextrema()==(0,255)
 qa.append({'frame':i,'bounds':cell.getchannel('A').getbbox(),'footY':487})
 x,y=(i+1)%4*512,(i+1)//4*512;board.alpha_composite(cell,(x,y));draw.text((x+10,y+10),str(i+1),fill='white')
atlas.save(out/'atlas.png');reference.save(out/'reference.png');board.convert('RGB').save(out/'preview-idle-comparison.png')
cal.resize((round(cal.width*scale),round(cal.height*scale)),Image.Resampling.LANCZOS).save(run/'calibration-scaled.png')
m=json.loads((root/'assets/marko-walk/manifest.json').read_text())
m['characterId']=name;m['animation']['columns']=j['frames'];m['animation']['rows']['motion'].update(frames=j['frames'],fps=j['fps'],loop=j['loop'],durations_ms=[83]*j['frames'])
m['frame_layout'].update(sheetWidth=512*j['frames'],sheetHeight=512,rows={'motion':[dict(x=i*512,y=0,w=512,h=512) for i in range(j['frames'])]})
m['scaleReference']={'reference':j['reference'],'referenceHeight':383,'calibrationHeight':cal.height,'scaledCalibrationHeight':round(cal.height*scale),'uniformScale':scale,'footY':487}
m['sprite_sheet_alpha_report']=None
(out/'manifest.json').write_text(json.dumps(m,indent=2));(out/'frames/frames-manifest.json').write_text(json.dumps({'cellWidth':512,'cellHeight':512,'states':{'motion':{'frames':j['frames'],'fps':12,'loop':j['loop'],'files':[f'motion/frame-{i}.png' for i in range(j['frames'])]}}},indent=2))
subprocess.run([str(sg),'compose-gif',*[str(out/f'frames/motion/frame-{i}.png') for i in range(j['frames'])],'--output',str(out/'preview.gif'),'--delay-ticks','8','--loop-count','0'],check=True,stdout=subprocess.DEVNULL)
assert Image.open(out/'preview.gif').n_frames==j['frames']
for i in range(j['frames']):assert atlas.crop((512*i,0,512*(i+1),512)).tobytes()==Image.open(out/f'frames/motion/frame-{i}.png').convert('RGBA').tobytes()
(out/'qa.json').write_text(json.dumps({'frames':qa,'loop':j['loop'],'scaleReference':m['scaleReference'],'atlasMatchesFrames':True,'gifFrames':j['frames']},indent=2))
with (root.parent/'world-pack-03/STATUS-ANIMACIJE.md').open('a',encoding='utf8') as f:
 f.write(f"\nDOPUNA-19: {name} — GOTOVO; {j['frames']} kadrova, {'petlja' if j['loop'] else 'jednom'}, PNG RGBA512x512, oslonac y487, atlas/manifest sa frame_layout/frames/preview.gif/qa.json u art/animation-pack-04/assets/{name}/. Zum prema383px idle-u uz neutralnu kalibraciju ({round(cal.height*scale)}px); preview-idle-comparison.png. Ugradjeni image_gen, jedan pokusaj. Prompt: plan-dopuna19.json.\n")
print('Delivered:',name,'frames:',j['frames'],'calibrated idle height:',round(cal.height*scale))
