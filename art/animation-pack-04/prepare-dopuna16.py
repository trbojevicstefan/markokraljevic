from pathlib import Path
import json
r=Path('art/animation-pack-04');j=json.loads((r/'plan-dopuna14.json').read_text())['jobs'][0]
j.update(id='marko-finisher-skull',impactFrame=4,neutralFrame=7)
import sys
j['prompt']=sys.stdin.read()
(r/'plan-dopuna16.json').write_text(json.dumps(dict(generator='built-in image_gen',jobs=[j]),indent=2),encoding='utf8')
s=(r/'deliver-dopuna13.py').read_text(encoding='utf8').replace('dopuna13','dopuna16').replace('DOPUNA-13','DOPUNA-16')
(r/'deliver-dopuna16.py').write_text(s,encoding='utf8')
