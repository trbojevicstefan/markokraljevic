from pathlib import Path
from PIL import Image
import json
root=Path(__file__).resolve().parent;game=root.parents[1]
out=root/'sources/dopuna11-reference';out.mkdir(exist_ok=True)
report={}
for name in ['sword-idle','shield-idle','archer-idle','akindzija-idle','oklopnik-idle','tufekdzija-idle','kopljanik-idle','palikuca-idle','musa-idle','marko-idle','sword-death']:
    m=json.loads((game/f'dist/assets/{name}.json').read_text())
    b=next(iter(m['frame_layout']['rows'].values()))[-1 if name=='sword-death' else 0]
    im=Image.open(game/f'dist/assets/{name}.png').convert('RGBA').crop((b['x'],b['y'],b['x']+b['w'],b['y']+b['h']))
    p=out/(name+'.png')
    if not p.exists():im.save(p)
    box=im.getchannel('A').getbbox();report[name]={'size':im.size,'height':box[3]-box[1],'bounds':box}
print(json.dumps(report))
