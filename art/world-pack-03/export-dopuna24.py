from pathlib import Path
from PIL import Image,ImageDraw
import json,sys,shutil,subprocess,numpy as np
world=Path(__file__).resolve().parent;root=world.parent/'animation-pack-04';game=world.parents[1]
name,source=sys.argv[1:3];reexport='--reexport' in sys.argv;revision='--revision' in sys.argv or reexport
j=next(j for j in json.loads((world/'prompts-dopuna24.json').read_text(encoding='utf-8-sig'))['jobs'] if j['id']==name)
run=(root/'sources'/name) if j['type']=='clip' else world/'sources/dopuna24'/name
run.mkdir(parents=True,exist_ok=True);raw=run/j.get('sourceFile','grid.png')
if not reexport:
 assert not raw.exists();shutil.copy2(source,raw)
if j.get('matteKey'):
 sg=game.parent/'tools/sprite-gen/.venv/Scripts/sprite-gen.exe';cut=run/'grid-v2-alpha.png'
 subprocess.run([str(sg),'cutout',str(raw),'--out',str(cut),'--key',j['matteKey'],'--decontam','palette'],check=True,stdout=subprocess.DEVNULL)
 grid=Image.open(cut).convert('RGBA')
 if j['matteKey']=='magenta':
  # Secondary chroma-spill cleanup for semitransparent brown smoke edges.
  a=np.array(grid);rgb=a[:,:,:3].astype(float);r,g,b=rgb[:,:,0],rgb[:,:,1],rgb[:,:,2]
  excess=np.where(b>g*1.05,np.maximum(b-g*.75,0),0)
  rgb[:,:,0]=np.maximum(r-excess*.5,0);rgb[:,:,2]=np.maximum(b-excess,0)
  a[:,:,:3]=np.round(rgb).clip(0,255).astype('uint8');grid=Image.fromarray(a)
else:grid=Image.open(raw).convert('RGBA')
assert grid.getchannel('A').getextrema()[0]==0,'Missing transparency'
def piece(i):
 x,y=i%j['cols'],i//j['cols'];im=grid.crop((x*grid.width//j['cols']+2,y*grid.height//j['rows']+2,(x+1)*grid.width//j['cols']-2,(y+1)*grid.height//j['rows']-2))
 b=im.getchannel('A').point(lambda v:255 if v>16 else 0).getbbox();assert b;return im.crop(b)
if j['type']=='clip':
 out=root/'assets'/name;assert not (out/'atlas.png').exists() or revision;(out/'frames/motion').mkdir(parents=True,exist_ok=True)
 pieces=[piece(i) for i in range(8)];scale=min(j['maxSize'][0]/max(p.width for p in pieces),j['maxSize'][1]/max(p.height for p in pieces))
 atlas=Image.new('RGBA',(4096,512));board=Image.new('RGBA',(2048,1024),(29,38,46,255));d=ImageDraw.Draw(board);qa=[]
 for i,p in enumerate(pieces):
  p=p.resize((max(1,round(p.width*scale)),max(1,round(p.height*scale))),Image.Resampling.LANCZOS)
  cell=Image.new('RGBA',(512,512));cell.paste(p,((512-p.width)//2,488-p.height));cell.save(out/f'frames/motion/frame-{i}.png');atlas.paste(cell,(i*512,0))
  assert cell.getchannel('A').getbbox()[3]==488
  qa.append({'frame':i,'bounds':cell.getchannel('A').getbbox(),'bottomY':487,'alpha':cell.getchannel('A').getextrema()})
  board.alpha_composite(cell,((i%4)*512,(i//4)*512));d.text(((i%4)*512+8,(i//4)*512+8),str(i+1),fill='white')
 atlas.save(out/'atlas.png');board.convert('RGB').save(out/'preview.png')
 m=json.loads((root/'assets/marko-walk/manifest.json').read_text());m.update(characterId=name,assetType='ground-vfx',chroma_key=None,base_image=None)
 m['animation']['columns']=8;m['animation']['rows']['motion'].update(frames=8,fps=12,loop=j['loop'],durations_ms=[83]*8)
 m['frame_layout'].update(sheetWidth=4096,sheetHeight=512,rows={'motion':[dict(x=i*512,y=0,w=512,h=512) for i in range(8)]})
 m.pop('scaleReference',None);m['sprite_sheet_alpha_report']=None;m['renderAnchor']={'x':256,'y':488};m['vfxBoundsMax']=j['maxSize']
 (out/'manifest.json').write_text(json.dumps(m,indent=2));(out/'frames/frames-manifest.json').write_text(json.dumps({'cellWidth':512,'cellHeight':512,'states':{'motion':{'frames':8,'fps':12,'loop':j['loop'],'files':[f'motion/frame-{i}.png' for i in range(8)]}}},indent=2))
 sg=game.parent/'tools/sprite-gen/.venv/Scripts/sprite-gen.exe'
 subprocess.run([str(sg),'compose-gif',*[str(out/f'frames/motion/frame-{i}.png') for i in range(8)],'--output',str(out/'preview.gif'),'--delay-ticks','8','--loop-count','0'],check=True,stdout=subprocess.DEVNULL)
 assert Image.open(out/'preview.gif').n_frames==8
 for i in range(8):assert atlas.crop((i*512,0,(i+1)*512,512)).tobytes()==Image.open(out/f'frames/motion/frame-{i}.png').convert('RGBA').tobytes()
 (out/'qa.json').write_text(json.dumps({'frames':qa,'loop':j['loop'],'uniformScale':scale,'atlasMatchesFrames':True,'gifFrames':8},indent=2))
 message=f'8kadova512x512, dno y487, atlas4096x512, manifest/frame_layout, frames, preview.gif, preview.png, qa.json u art/animation-pack-04/assets/{name}/. '+('Petlja.' if j['loop'] else 'Jednom.')
elif j['type']=='bones':
 out=world/(name+'.png');assert not out.exists();final=Image.new('RGBA',(1536,256))
 for i in range(6):
  p=piece(i);p.thumbnail((220,220),Image.Resampling.LANCZOS);final.paste(p,(i*256+(256-p.width)//2,(256-p.height)//2))
 final.save(out);assert final.size==(1536,256)
 message='PNG RGBA1536x256, sest centriranih polja256x256 redom lobanja, vilica, rebra, femur, humerus, karlica; providnost proverena.'
else:
 out=world/(name+'.png');assert not out.exists();final=grid.resize((512,512),Image.Resampling.LANCZOS)
 # Consistent semitransparent screen overlay; preserve the source's relative opacity.
 a=np.array(final.getchannel('A')).astype(float);final.putalpha(Image.fromarray(np.round(a*.65).astype('uint8')));final.save(out)
 assert final.getchannel('A').getextrema()[0]==0 and final.getchannel('A').getextrema()[1]<=166
 message='PNG RGBA512x512, tamnocrvena mrlja sa kapima/prskotinama i curkom, poluprovidna alfa do65%, provereno.'
with (world/'STATUS-ANIMACIJE.md').open('a',encoding='utf8') as f:
 f.write(f'\nDOPUNA-24: {name} — GOTOVO; {message} Ugradjeni image_gen, {j.get("attempts",1)} pokusaj(a); prompt prompts-dopuna24.json, izvor sacuvan.\n')
print('Saved and logged:',name)
