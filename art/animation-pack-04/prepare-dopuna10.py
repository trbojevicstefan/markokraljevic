from pathlib import Path
from PIL import Image
import json
root=Path(__file__).resolve().parent;game=root.parents[1]
out=root/'sources/dopuna10-reference';out.mkdir(exist_ok=True)
report={}
for name in ['mounted-run','musa-idle','sword-idle','akindzija-idle','oklopnik-idle','marko-idle']:
    m=json.loads((game/f'dist/assets/{name}.json').read_text())
    b=m['frame_layout']['rows']['motion'][0]
    im=Image.open(game/f'dist/assets/{name}.png').convert('RGBA').crop((b['x'],b['y'],b['x']+b['w'],b['y']+b['h']))
    p=out/(name+'.png')
    if not p.exists():im.save(p)
    box=im.getchannel('A').getbbox();report[name]={'size':im.size,'height':box[3]-box[1],'bounds':box}
print(json.dumps(report))
