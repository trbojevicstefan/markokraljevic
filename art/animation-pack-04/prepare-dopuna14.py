from pathlib import Path
import json
root=Path(__file__).resolve().parent
plan=json.loads((root/'plan-dopuna13.json').read_text(encoding='utf8'))
job=plan['jobs'][0].copy()
job.update(id='marko-finisher-legs', impactFrame=3)
import sys
job['prompt']=sys.stdin.read()
(root/'plan-dopuna14.json').write_text(json.dumps({'generator':'built-in image_gen','jobs':[job]},indent=2),encoding='utf8')
script=(root/'deliver-dopuna13.py').read_text(encoding='utf8').replace('dopuna13','dopuna14').replace('DOPUNA-13','DOPUNA-14')
(root/'deliver-dopuna14.py').write_text(script,encoding='utf8')
