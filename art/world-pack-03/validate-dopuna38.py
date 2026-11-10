from pathlib import Path
from PIL import Image
import json,hashlib
ROOT=Path(__file__).resolve().parents[2]
PACK=ROOT/'art/world-pack-03'
jobs=json.loads((PACK/'prompts-dopuna38.json').read_text(encoding='utf-8'))['jobs']
results=[]
html=['<!doctype html><meta charset="utf-8"><title>DOPUNA38</title><style>body{background:#202933;color:#eee;font:18px system-ui;margin:28px}section{display:grid;grid-template-columns:repeat(3,minmax(200px,1fr));gap:18px}img{width:100%;background:#29343d}a{color:#eac580}p{margin:4px}</style><h1>Prikradanje — DOPUNA38</h1><p>512×512; oslonac y487. Pri integraciji primeni renderScale oko renderAnchor iz manifesta.</p><section>']
for j in jobs:
    out=ROOT/'art/animation-pack-04/assets'/j['id']
    m=json.loads((out/'manifest.json').read_text());atlas=Image.open(out/'atlas.png').convert('RGBA')
    assert atlas.size==(j['frames']*512,512)
    assert m['animation']['rows']['motion']['frames']==j['frames']
    assert m['animation']['rows']['motion']['loop']==j['loop']
    assert len(m['frame_layout']['rows']['motion'])==j['frames']
    assert abs(m['scaleReference']['cellCalibrationHeight']*m['renderScale']-j['targetHeight'])<.01
    bounds=[];hashes=[]
    for i in range(j['frames']):
        im=Image.open(out/f'frames/motion/frame-{i}.png').convert('RGBA');b=im.getchannel('A').getbbox()
        assert im.size==(512,512) and b and b[3]==488 and b[0]>0 and b[2]<512
        assert im.getchannel('A').getextrema()==(0,255)
        assert atlas.crop((i*512,0,(i+1)*512,512)).tobytes()==im.tobytes()
        bounds.append(b);hashes.append(hashlib.sha256(im.tobytes()).hexdigest())
    gif=Image.open(out/'preview.gif');assert gif.n_frames==j['frames']
    results.append({'id':j['id'],'frames':j['frames'],'loop':j['loop'],'fps':j['fps'],'bounds':bounds,'renderScale':m['renderScale'],'standingWorldHeight':j['targetHeight'],'allGroundY487':True,'uniqueFrames':len(set(hashes)),'gifFrames':gif.n_frames,'imagegenAttempts':2 if j['id']=='marko-tiho' else 1})
    prefix='../animation-pack-04/assets/'+j['id']
    html.append(f'<article><h2>{j["id"]}</h2><a href="{prefix}/preview.gif"><img src="{prefix}/preview.gif"></a><p>{j["frames"]} kadrova · {j["fps"]} FPS · {"petlja" if j["loop"] else "jednom"}</p><a href="{prefix}/manifest.json">Manifest</a> · <a href="{prefix}/preview-comparison.png">Poređenje sa referencom</a></article>')
html.append('</section>')
(PACK/'preview-dopuna38.html').write_text(''.join(html),encoding='utf-8')
(PACK/'validation-dopuna38.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
(PACK/'catalog-dopuna38.json').write_text(json.dumps({'tool':'built-in image_gen','clips':results,'prompts':'prompts-dopuna38.json','renderNote':'Use renderScale about renderAnchor to preserve source-idle world zoom; all cell-ground anchors y487.','corrections':'marko-tiho cell3 forward hand corrected in second built-in edit; detached horizontal ground props registered during export.'},indent=2),encoding='utf-8')
status=PACK/'STATUS-ANIMACIJE.md';lines=status.read_text(encoding='utf-8').splitlines();seen=set();clean=[]
for line in reversed(lines):
    if line.startswith('DOPUNA-38:'):
        key=line.split(' — ')[0]
        if key in seen:continue
        seen.add(key)
        if key=='DOPUNA-38: marko-tiho':line=line.replace('jedan pokusaj','dva pokusaja (ispravka ruke)')
    clean.append(line)
status.write_text('\n'.join(reversed(clean))+'\n',encoding='utf-8')
assert len(results)==7 and sum(q['frames'] for q in results)==38
print(json.dumps({'clips':7,'frames':38,'groundY487':True,'atlasFramesMatch':True,'gallery':'preview-dopuna38.html'}))
