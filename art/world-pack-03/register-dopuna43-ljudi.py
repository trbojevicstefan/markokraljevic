from pathlib import Path
import json,sys
w=Path(__file__).resolve().parent
p=w/'prompts-dopuna43-ljudi.json';d=json.loads(p.read_text(encoding='utf8'))
j=json.loads(Path(sys.argv[1]).read_text(encoding='utf8'))
assert not any(x['id']==j['id'] for x in d['jobs'])
d['jobs'].append(j);p.write_text(json.dumps(d,ensure_ascii=False,indent=2),encoding='utf8')
print('Registered',j['id'])
