from pathlib import Path
from PIL import Image
import json, subprocess, sys
w=Path(__file__).resolve().parent
for t in ['rudnik','rusevine','reka','oranje']:
 for n in [1,2]:assert Image.open(w/f'prelaz-{t}-{n}.png').size==(1024,1024)
 name=f'prelaz-{t}-anim';folder=w.parent/'animation-pack-04/assets'/name
 atlas=Image.open(folder/'atlas.png').convert('RGB');assert atlas.size==(9216,512)
 assert Image.open(w/(name+'.png')).convert('RGB').tobytes()==atlas.tobytes()
 m=json.loads((folder/'manifest.json').read_text());assert m['animation']['rows']['motion']['frames']==12 and m['animation']['rows']['motion']['loop']
 assert abs(m['source_layout']['raw_width']/m['source_layout']['raw_height']-2)<.05
 assert Image.open(folder/'preview.gif').n_frames==12
 for i in range(12):
  f=Image.open(folder/f'frames/motion/frame-{i}.png').convert('RGB');assert f.size==(768,512);assert f.tobytes()==atlas.crop((768*i,0,768*(i+1),512)).tobytes()
  assert m['frame_layout']['rows']['motion'][i]=={'x':768*i,'y':0,'w':768,'h':512}
subprocess.run([sys.executable,str(w/'validate-dopuna36-c.py')],check=True)
p=w/'catalog-dopuna36-c.json';d=json.loads(p.read_text());d['prompts']='prompts-dopuna36-c-final.json';p.write_text(json.dumps(d,indent=2),encoding='utf8')
with (w/'STATUS-ANIMACIJE.md').open('a',encoding='utf8') as f:f.write('\nDOPUNA-36 C: ZAVRSENO — rudnik, rusevine, reka i oranje: 8 minijatura 1024x1024 + 4 ozivljene scene po 12 kadrova 768x512 (48 kadrova). Provereni atlas=rootPNG=frames, frame_layout, GIF12, petlja, izvorna srazmera2:1. Pregled preview-dopuna36-c.html; validation/catalog-dopuna36-c.json. Tacan skup promptova prompts-dopuna36-c-final.json; ugradjeni image_gen. Kod igre, dist i ostali delovi nisu menjani.\n')
print('PASS: 8 miniatures, 4 animated scenes, 48 frames; all atlas/manifest/GIF checks passed')
