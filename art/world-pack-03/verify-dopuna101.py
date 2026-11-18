from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]/'animation-pack-04/sources/mounted-okret'
for run in sorted(root.glob('attempt-*')):
 q=json.loads((run/'qa.json').read_text(encoding='utf-8'))
 h=[f['height'] for f in q['frames']]
 print(run.name, 'heights:', h, 'front-minus-first:',h[3]-h[0], 'margins:',[f['safeMargin'] for f in q['frames']])
