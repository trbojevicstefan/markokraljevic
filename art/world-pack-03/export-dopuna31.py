from pathlib import Path
from PIL import Image,ImageDraw
import json,sys,shutil,subprocess
w=Path(__file__).resolve().parent;r=w.parent/'animation-pack-04';name,source=sys.argv[1:3]
j=next(j for j in json.loads((w/'prompts-dopuna31.json').read_text())['jobs'] if j['id']==name)
run=w/'sources/dopuna31'/name;run.mkdir(parents=True,exist_ok=True);raw=run/'generated.png';assert not raw.exists();shutil.copy2(source,raw)
out=w/(name+'.png');assert not out.exists();im=Image.open(raw).convert('RGBA')
if j.get('kind')=='clip':
 p=r/'assets/pauza-logor-16';assert not p.exists();(p/'frames/motion').mkdir(parents=True)
 cells=[im.crop((i%4*im.width//4,i//4*im.height//4,(i%4+1)*im.width//4,(i//4+1)*im.height//4)).convert('RGB').convert('RGBA').resize((768,512),Image.Resampling.LANCZOS) for i in range(16)]
 atlas=Image.new('RGBA',(12288,512));board=Image.new('RGB',(1536,1024))
 for i,c in enumerate(cells):c.save(p/f'frames/motion/frame-{i}.png');atlas.paste(c,(i*768,0));board.paste(c.resize((384,256)),(i%4*384,i//4*256))
 atlas.save(out);atlas.save(p/'atlas.png');board.save(p/'preview.png');shutil.copy2(w.parents[1]/j['references'][0],p/'reference.png')
 m=json.loads((r/'assets/pauza-logor/manifest.json').read_text());m['characterId']='pauza-logor';m['animation']['columns']=16;m['animation']['rows']['motion'].update(frames=16,fps=12,loop=True,durations_ms=[83]*16)
 m['frame_layout'].update(sheetWidth=12288,sheetHeight=512,rows={'motion':[dict(x=i*768,y=0,w=768,h=512) for i in range(16)]});m.update(opaqueBackground=True,noFootAlignment=True)
 for f in [p/'manifest.json',w/'pauza-logor.json']:f.write_text(json.dumps(m,indent=2),encoding='utf8')
 (p/'frames/frames-manifest.json').write_text(json.dumps({'cellWidth':768,'cellHeight':512,'states':{'motion':{'frames':16,'fps':12,'loop':True,'files':[f'motion/frame-{i}.png' for i in range(16)]}}},indent=2))
 sg=w.parents[2]/'tools/sprite-gen/.venv/Scripts/sprite-gen.exe'
 subprocess.run([str(sg),'compose-gif',*[str(p/f'frames/motion/frame-{i}.png') for i in range(16)],'--output',str(p/'preview.gif'),'--delay-ticks','8','--loop-count','0'],check=True,stdout=subprocess.DEVNULL)
 assert Image.open(p/'preview.gif').n_frames==16
 for i in range(16):assert atlas.crop((i*768,0,(i+1)*768,512)).tobytes()==cells[i].tobytes()
 message='16 kadrova768x512, traka12288x512 na vrhu paketa; atlas/manifest/frame_layout/frames/preview.gif u art/animation-pack-04/assets/pauza-logor-16/. Prethodni klip8kad. sacuvan. Petlja12fps.'
else:
 assert im.getchannel('A').getextrema()[0]==0
 b=im.getchannel('A').point(lambda v:255 if v>16 else 0).getbbox();assert b;im=im.crop(b)
 size=tuple(j['size']);final=Image.new('RGBA',size)
 margin=4 if name.startswith('ram-') else (1 if name=='klizac-dugme' else 0)
 im=im.resize((size[0]-2*margin,size[1]-2*margin),Image.Resampling.LANCZOS);final.paste(im,(margin,margin));final.save(out)
 assert final.size==size and final.getchannel('A').getextrema()[0]==0
 message=f'PNG RGBA{size[0]}x{size[1]}, providnost van siluete, prazan prostor za tekst; stil tamni orah/zlatni detalji, slikano mat.'
with (w/'STATUS-ANIMACIJE.md').open('a',encoding='utf8') as f:f.write(f'\nDOPUNA-31: {name}.png — GOTOVO; art/world-pack-03/{name}.png. {message} Ugradjeni image_gen, jedan pokusaj; prompts-dopuna31.json, izvor sources/dopuna31/{name}/.\n')
print('Saved and logged:',name)
