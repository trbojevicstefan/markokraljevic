"""Read-only D72 delivery verifier."""
from pathlib import Path
import json, numpy as np
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]/'animation-pack-04'
S={'shield-uplasen':(6,False),'shield-bezi':(8,True),'palikuca-uplasen':(6,False),'palikuca-bezi':(8,True),'tufekdzija-uplasen':(6,False),'tufekdzija-bezi':(8,True),'oruzje-na-zemlji':(7,False)}
for n,(frames,loop) in S.items():
 o=ROOT/'assets'/n; m=json.loads((o/'manifest.json').read_text(encoding='utf-8')); q=json.loads((o/'qa.json').read_text(encoding='utf-8'))
 assert m['description'].isascii() and m['animation']['rows']['motion']['frames']==frames and m['animation']['rows']['motion']['loop']==loop and q['atlasMatchesFrames']
 a=Image.open(o/'atlas.png').convert('RGBA'); assert a.size==(512*frames,512); assert Image.open(o/'preview.gif').n_frames==frames
 for i in range(frames):
  p=Image.open(o/f'frames/motion/frame-{i}.png').convert('RGBA'); assert p.size==(512,512) and a.crop((512*i,0,512*(i+1),512)).tobytes()==p.tobytes(); bb=p.getbbox(); ar=np.array(p); mask=ar[:,:,3]>0; assert bb and min(bb[0],bb[1],512-bb[2],512-bb[3])>=24 and not mask[0].any() and not mask[-1].any() and not mask[:,0].any() and not mask[:,-1].any()
 print('PASS',n,'frames',frames,'measured',q['measuredHeights'])
