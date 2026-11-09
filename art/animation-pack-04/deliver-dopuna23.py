from pathlib import Path
from PIL import Image,ImageDraw
import json,sys,shutil,subprocess
root=Path(__file__).resolve().parent;game=root.parents[1];name='pauza-logor'
out=root/'assets'/name;run=root/'sources'/name
assert not (out/'atlas.png').exists(), 'Existing output preserved'
run.mkdir(exist_ok=True);shutil.copy2(sys.argv[1],run/'grid.png')
grid=Image.open(sys.argv[1]).convert('RGB');(out/'frames/motion').mkdir(parents=True,exist_ok=True)
atlas=Image.new('RGBA',(6144,512));board=Image.new('RGB',(1536,4*540),(25,30,33));draw=ImageDraw.Draw(board);qa=[]
for i in range(8):
 x,y=i%4,i//4
 # Tiny inset excludes any generator-drawn separator without changing camera framing.
 cell=grid.crop((x*grid.width//4+2,y*grid.height//2+2,(x+1)*grid.width//4-2,(y+1)*grid.height//2-2)).resize((768,512),Image.Resampling.LANCZOS).convert('RGBA')
 cell.save(out/f'frames/motion/frame-{i}.png');atlas.paste(cell,(i*768,0));board.paste(cell.convert('RGB'),((i%2)*768,(i//2)*540));draw.text(((i%2)*768+8,(i//2)*540+518),f'pauza-logor {i+1}',fill='white')
 assert cell.getchannel('A').getextrema()==(255,255)
 qa.append({'frame':i,'size':[768,512],'alpha':[255,255]})
atlas.save(out/'atlas.png');board.save(out/'preview.png')
m=json.loads((root/'assets/marko-walk/manifest.json').read_text())
m.update(characterId=name,assetType='animated-pause-scene',chroma_key=None,base_image=None)
m['cell'].update(width=768,height=512,shape='rectangle');m['cell'].pop('size',None)
m['animation'].update(cellWidth=768,cellHeight=512,columns=8)
m['animation']['rows']['motion'].update(frames=8,fps=10,loop=True,durations_ms=[100]*8)
m['frame_layout'].update(sheetWidth=6144,sheetHeight=512,cellWidth=768,cellHeight=512,rows={'motion':[dict(x=i*768,y=0,w=768,h=512) for i in range(8)]})
m.pop('scaleReference',None);m['sprite_sheet_alpha_report']=None;m['noFootAlignment']=True;m['opaqueBackground']=True
(out/'manifest.json').write_text(json.dumps(m,indent=2));(out/'frames/frames-manifest.json').write_text(json.dumps({'cellWidth':768,'cellHeight':512,'states':{'motion':{'frames':8,'fps':10,'loop':True,'files':[f'motion/frame-{i}.png' for i in range(8)]}}},indent=2))
sg=game.parent/'tools/sprite-gen/.venv/Scripts/sprite-gen.exe'
subprocess.run([str(sg),'compose-gif',*[str(out/f'frames/motion/frame-{i}.png') for i in range(8)],'--output',str(out/'preview.gif'),'--delay-ticks','10','--loop-count','0'],check=True,stdout=subprocess.DEVNULL)
assert Image.open(out/'preview.gif').n_frames==8
for i in range(8):assert atlas.crop((i*768,0,(i+1)*768,512)).tobytes()==Image.open(out/f'frames/motion/frame-{i}.png').convert('RGBA').tobytes()
(out/'qa.json').write_text(json.dumps({'frames':qa,'loop':True,'atlasMatchesFrames':True,'gifFrames':8,'opaque':True},indent=2))
with (root.parent/'world-pack-03/STATUS-ANIMACIJE.md').open('a',encoding='utf8') as f:
 f.write('\nDOPUNA-23: pauza-logor — GOTOVO; art/animation-pack-04/assets/pauza-logor/. 8 kadrova u petlji, celije768x512, atlas6144x512, manifest sa frame_layout, frames, preview.gif, preview.png i qa.json. Neprovidna nocna scena sa pozadinom; Marko kraj vatre, Sarac pase, mala Ravijojla lebdi. Dim, plamen i rep u razlicitim fazama. Provereni dimenzije, neprovidnost, atlas/kadrovi i GIF8. Ugradjeni image_gen, jedan pokusaj; prompt plan-dopuna23.json.\n')
print('Delivered pauza-logor:8x768x512, opaque, loop, atlas6144x512')
