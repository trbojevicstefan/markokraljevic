from pathlib import Path
from PIL import Image
import json, hashlib

GAME=Path(__file__).resolve().parents[2]
PACK=GAME/'art/animation-pack-04'
rig=json.loads((GAME/'dist/assets/sprite-rig.json').read_text('utf-8'))
run=PACK/'sources/oklopnik-drugi/v3'
run.mkdir(parents=True,exist_ok=True)
for name,key,index in [('uzor','oklopnik-idle',0),('uzor-zum','oklopnik-slam',0),('uzor-kraj','oklopnik-slam',-1),('uzor-udar','oklopnik-slam',4)]:
    x,y,w,h,*_=rig[key]['frames'][index]
    Image.open(GAME/'dist/assets'/rig[key]['image']).crop((x,y,x+w,y+h)).save(run/f'{name}.png')
checks={}
for folder in ['dist','art/animation-pack-04/assets/archer-rafal']:
    for p in (GAME/folder).rglob('*'):
        if p.is_file(): checks[str(p.relative_to(GAME))]=hashlib.sha256(p.read_bytes()).hexdigest()
for name in ['build-sprite-rig.py','art/world-pack-03/STATUS-ANIMACIJE.md']:
    p=GAME/name
    if p.exists():checks[name]=hashlib.sha256(p.read_bytes()).hexdigest()
(run/'protected-hashes.json').write_text(json.dumps(checks),encoding='utf-8')
print('Prepared exact rig cells and protected-file hashes',len(checks))
