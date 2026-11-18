"""Read-only D84 validation."""
from pathlib import Path
import json, numpy as np
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]/'animation-pack-04'
for name in ('mladi-turcin-spava','mladi-turcin-budi','mladi-turcin-lunge','mladi-turcin-jump'):
 out=ROOT/'assets'/name; m=json.loads((out/'manifest.json').read_text(encoding='utf-8')); q=json.loads((out/'qa.json').read_text(encoding='utf-8')); n=m['animation']['rows']['motion']['frames']; assert m['frame_layout']['sheetWidth']==512*n and q['atlasMatchesFrames']
 atlas=Image.open(out/'atlas.png').convert('RGBA'); assert atlas.size==(512*n,512); gif=Image.open(out/'preview.gif'); assert gif.n_frames==n
 for i in range(n):
  p=Image.open(out/f'frames/motion/frame-{i}.png').convert('RGBA'); assert p.size==(512,512) and atlas.crop((512*i,0,512*(i+1),512)).tobytes()==p.tobytes(); bb=p.getbbox(); assert bb and min(bb[0],bb[1],512-bb[2],512-bb[3])>=24
 print('PASS',name,n,'frames; measured heights',q['measuredHeights'])
