"""Read-only D68 validation."""
from pathlib import Path
import json, numpy as np
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]/'animation-pack-04'
S={'shield-uplasen':(4,False),'shield-bezi':(8,True),'palikuca-uplasen':(4,False),'palikuca-bezi':(8,True),'tufekdzija-uplasen':(4,False),'tufekdzija-bezi':(8,True),'pas-uplasen':(4,False),'pas-bezi':(8,True)}
for n,(frames,loop) in S.items():
 o=ROOT/'assets'/n; m=json.loads((o/'manifest.json').read_text(encoding='utf-8')); q=json.loads((o/'qa.json').read_text(encoding='utf-8')); assert m['description'].isascii() and q['identityApproved'] and q['atlasMatchesFrames']; assert m['animation']['rows']['motion']['frames']==frames and m['animation']['rows']['motion']['loop']==loop
 a=Image.open(o/'atlas.png').convert('RGBA'); assert a.size==(512*frames,512); g=Image.open(o/'preview.gif'); assert g.n_frames==frames
 for i in range(frames):
  p=Image.open(o/f'frames/motion/frame-{i}.png').convert('RGBA'); assert p.size==(512,512) and a.crop((512*i,0,512*(i+1),512)).tobytes()==p.tobytes(); bb=p.getbbox(); ar=np.array(p); mask=ar[:,:,3]>0; assert bb and min(bb[0],bb[1],512-bb[2],512-bb[3])>=24 and not mask[0].any() and not mask[-1].any() and not mask[:,0].any() and not mask[:,-1].any(); assert not ((ar[:,:,1]>120)&(ar[:,:,1]>ar[:,:,0]*1.35+20)&(ar[:,:,1]>ar[:,:,2]*1.35+20)&mask).any()
 print('PASS',n,frames,'frames; measured heights',q['measuredHeights'])
