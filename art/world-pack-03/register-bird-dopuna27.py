import json,sys
from pathlib import Path
p=Path(__file__).with_name('prompts-dopuna27.json')
d=json.loads(p.read_text(encoding='utf-8-sig'))
j=next(j for j in d['jobs'] if j['id']==sys.argv[1])
j['bodyAnchors']=json.loads(sys.argv[2]);j['bodyLengthSource']=float(sys.argv[3])
p.write_text(json.dumps(d,indent=2),encoding='utf-8')
