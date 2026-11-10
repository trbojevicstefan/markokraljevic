from pathlib import Path
from PIL import Image
import json, subprocess, sys
w=Path(__file__).resolve().parent
p=w/'prompts-dopuna36-b.json';data=json.loads(p.read_text(encoding='utf-8-sig'))
for name,promptfile,refs in [
 ('prelaz-pecina-anim','pecina-ispravka-prompt.txt',['art/animation-pack-04/assets/marko-idle-2/frames/motion/frame-0.png','dist/assets/fairy-cast.png','art/world-pack-03/sources/dopuna36-a/layout-4x3.png']),
 ('prelaz-podrum-anim','podrum-anim-prompt.txt',['art/animation-pack-04/assets/marko-idle-2/frames/motion/frame-0.png','art/world-pack-03/sources/dopuna36-a/layout-4x3.png']),
 ('prelaz-mocvara-anim','mocvara-anim-prompt.txt',['art/animation-pack-04/assets/soko-let/frames/motion/frame-0.png','art/world-pack-03/sources/dopuna36-a/layout-4x3.png'])]:
 j=next(j for j in data['jobs'] if j['name']==name)
 j['prompt']=(w/'sources/dopuna36-b'/promptfile).read_text(encoding='utf8');j['refs']=refs
j=next(j for j in data['jobs'] if j['name']=='prelaz-mocvara-2')
j['prompt']+=' Focus composition ONLY Marko and the falcon among reeds; style reference supplies palette and brushwork, do not copy its crowd, archers or other characters.'
p.write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf8')
for theme in ['pecina','podrum','mocvara']:
 name='prelaz-'+theme+'-anim';folder=w.parent/'animation-pack-04/assets'/name
 atlas=Image.open(folder/'atlas.png').convert('RGB')
 assert atlas.size==(9216,512)
 assert Image.open(w/(name+'.png')).convert('RGB').tobytes()==atlas.tobytes()
 m=json.loads((folder/'manifest.json').read_text());assert m['animation']['rows']['motion']['frames']==12 and m['animation']['rows']['motion']['loop']
 assert abs(m['source_layout']['raw_width']/m['source_layout']['raw_height']-2)<.05
 for i in range(12):
  f=Image.open(folder/f'frames/motion/frame-{i}.png').convert('RGB');assert f.size==(768,512);assert f.tobytes()==atlas.crop((768*i,0,768*(i+1),512)).tobytes()
  assert m['frame_layout']['rows']['motion'][i]=={'x':768*i,'y':0,'w':768,'h':512}
 assert Image.open(folder/'preview.gif').n_frames==12
subprocess.run([sys.executable,str(w/'validate-dopuna36-b.py')],check=True)
with (w/'STATUS-ANIMACIJE.md').open('a',encoding='utf8') as f:f.write('\nDOPUNA-36 B: ZAVRSENO — podrum i mocvara po 2 minijature 1024x1024 i 1 scena od 12 kadrova; pecina-anim ponovo nacrtana prema novoj specifikaciji. Provereni 36 novih/ispravljenih kadrova 768x512, atlas=frames, root PNG=atlas, frame_layout, 12-kadarski GIF i izvorni odnos 2:1. Pregled preview-dopuna36-b.html; katalog/validation azurirani. Kod igre i dist nisu menjani.\n')
print('PASS: four miniatures and three scenes delivered; atlas/frame/manifest checks passed')
