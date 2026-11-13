from pathlib import Path
from PIL import Image,ImageDraw
import json,hashlib
w=Path(__file__).resolve().parent;root=w.parent/'animation-pack-04';results=[]
for n in ['kostac-ognjeni','kostac-ognjeni-kraj','kostac-bajraktar','kostac-bajraktar-kraj']:
 out=root/'assets'/n;count=6 if n.endswith('-kraj') else 8
 m=json.loads((out/'manifest.json').read_text());a=Image.open(out/'atlas.png').convert('RGBA')
 assert a.size==(count*512,512)
 assert m['animation']['rows']['motion']['loop']==(count==8)
 assert m['holdLastFrame']==(count==6)
 assert m['renderScale']==1 and m['renderAnchor']=={'x':256,'y':488}
 hashes=[]
 for i in range(count):
  p=Image.open(out/f'frames/motion/frame-{i}.png').convert('RGBA')
  assert p.size==(512,512) and p.getchannel('A').getextrema()==(0,255)
  assert p.getchannel('A').getbbox()[3]==488
  assert a.crop((i*512,0,(i+1)*512,512)).tobytes()==p.tobytes()
  assert m['frame_layout']['rows']['motion'][i]=={'x':512*i,'y':0,'w':512,'h':512}
  hashes.append(hashlib.sha256(p.tobytes()).hexdigest())
 assert len(set(hashes))==count
 assert Image.open(out/'preview.gif').n_frames==count
 Image.open(out/'frames/motion/frame-0.png').save(out/'reference.png')
 board=Image.new('RGBA',(2048,1024),(34,42,49,255));draw=ImageDraw.Draw(board)
 for i in range(count):
  x=i%4*512;y=i//4*512;p=Image.open(out/f'frames/motion/frame-{i}.png').convert('RGBA');board.alpha_composite(p,(x,y));draw.text((x+8,y+8),str(i+1),fill='white')
 board.save(out/'preview-comparison.png')
 assert all('frames/motion/frame-0.png' in p for p in m['identityReferences'])
 results.append({'clip':n,'frames':count,'RGBA':True,'atlasMatchesFrames':True,'holdLastFrame':m['holdLastFrame'],'actualIdleReferences':m['identityReferences'],'identityComparison':'identity-size-comparison.png','overlay':'size-overlay.png'})
(w/'validation-dopuna44-ognjeni-bajraktar-v2.json').write_text(json.dumps(results,indent=2))
print('PASS: 4 clips, 28 distinct RGBA frames, atlas/frame_layout/GIF, ground and holdLastFrame')
