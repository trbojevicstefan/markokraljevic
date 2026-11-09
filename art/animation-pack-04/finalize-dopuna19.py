from pathlib import Path
from PIL import Image,ImageDraw
import json
root=Path(__file__).resolve().parent
jobs=json.loads((root/'plan-dopuna19.json').read_text(encoding='utf-8-sig'))['jobs']
board=Image.new('RGBA',(1536,6*410),(29,38,46,255));draw=ImageDraw.Draw(board);catalog=[]
for k,j in enumerate(jobs):
 out=root/'assets'/j['id'];m=json.loads((out/'manifest.json').read_text());atlas=Image.open(out/'atlas.png').convert('RGBA')
 n=j['frames'];assert atlas.size==(n*512,512) and Image.open(out/'preview.gif').n_frames==n
 assert m['animation']['rows']['motion']['loop']==j['loop'] and m['scaleReference']['scaledCalibrationHeight']<=383
 for i in range(n):
  im=Image.open(out/f'frames/motion/frame-{i}.png').convert('RGBA')
  assert im.size==(512,512) and im.getchannel('A').getextrema()==(0,255) and im.getchannel('A').getbbox()[3]==488
  assert atlas.crop((i*512,0,(i+1)*512,512)).tobytes()==im.tobytes()
  assert m['frame_layout']['rows']['motion'][i]==dict(x=i*512,y=0,w=512,h=512)
 paths=[root.parents[1]/j['reference']]+[out/f'frames/motion/frame-{i}.png' for i in [0,n//2,n-1]]
 for col,p in enumerate(paths):
  im=Image.open(p).convert('RGBA').resize((384,384),Image.Resampling.LANCZOS);board.alpha_composite(im,(col*384,k*410+20))
  draw.text((col*384+8,k*410+5),'idle reference' if col==0 else j['id']+' '+str([0,n//2,n-1][col-1]+1),fill='white')
 catalog.append(dict(id=j['id'],frames=n,loop=j['loop'],atlas=f"assets/{j['id']}/atlas.png",manifest=f"assets/{j['id']}/manifest.json",verified=True))
assert len(catalog)==6 and sum(j['frames'] for j in catalog)==44
board.convert('RGB').save(root/'preview-dopuna19.png')
(root/'catalog-dopuna19.json').write_text(json.dumps(catalog,indent=2))
(root/'validation-dopuna19.json').write_text(json.dumps(dict(clips=6,frames=44,generationAttempts=6,checks=['alpha','cell512x512','baseline487','atlas pixel equality','frame_layout','GIF frame counts','loop flags','idle calibration <=383px'],results=catalog),indent=2))
with (root.parent/'world-pack-03/STATUS-ANIMACIJE.md').open('a',encoding='utf8') as f:
 f.write('\nDOPUNA-19 — ZAVRSENO: 6 klipova, 44 kadra, redom iz tabele. Po jedno generisanje za svaki klip. Svi izvozi provereni: alfa, atlas/pojedinacni kadrovi, frame_layout, broj GIF kadrova, loop zastavice i oslonac y487. Neutralna kalibracija383px prema idle referenci; pomocne poze nisu u atlasima. Poredjenje sa idle-om za svaki klip: preview-idle-comparison.png; zajednicki pregled art/animation-pack-04/preview-dopuna19.png. Katalog/validacija: catalog-dopuna19.json i validation-dopuna19.json. marko-call ponovo izvezen iz istog crteza nakon uklanjanja granicnih linija mreze; nije ponovo generisan. Kod igre i dist nisu menjani.\n')
print('Verified: 6 clips, 44 frames, 6 generations.')
