from pathlib import Path
import json, sys
name, attempt, review = sys.argv[1:]
folder = Path(__file__).resolve().parents[1]/'animation-pack-04'/'sources'/name/f'attempt-{attempt}'
p = folder/'qa.json'
qa = json.loads(p.read_text())
qa.update(identityApproved=True, motionApproved=True, visualReview=review)
p.write_text(json.dumps(qa,indent=2)+'\n',encoding='utf8')
