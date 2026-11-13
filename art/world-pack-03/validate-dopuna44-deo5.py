from pathlib import Path
from PIL import Image
import json,hashlib
W=Path(__file__).resolve().parent;G=W.parents[1];R=W.parent/'animation-pack-04';reports=[]
for enemy in ['akindzija','kopljanik']:
    first=None
    for end in [False,True]:
        name=f'kostac-{enemy}'+('-kraj' if end else '');out=R/'assets'/name;n=6 if end else 8;m=json.loads((out/'manifest.json').read_text());atlas=Image.open(out/'atlas.png').convert('RGBA');gif=Image.open(out/'preview.gif');cells=[Image.open(out/f'frames/motion/frame-{i}.png').convert('RGBA') for i in range(n)]
        assert atlas.size==(n*512,512) and gif.n_frames==n
        assert m['characterId']==name and m['animation']['rows']['motion']['frames']==n and m['animation']['rows']['motion']['loop']==(not end)
        assert m['scaleReference']['sourceZoom']==.76 and m['scaleReference']['enemyToMarko']==(1 if enemy=='akindzija' else .95)
        assert all(p.endswith('/frames/motion/frame-0.png') and (G/p).exists() for p in m['identityReferences'])
        for i,c in enumerate(cells):
            b=c.getchannel('A').getbbox();assert c.size==(512,512) and b[3]==488 and b[0]>0 and b[2]<512 and b[1]>0 and c.getchannel('A').getextrema()==(0,255)
            assert atlas.crop((i*512,0,(i+1)*512,512)).tobytes()==c.tobytes()
        assert len({hashlib.sha256(c.tobytes()).hexdigest() for c in cells})==n
        if end:assert first.tobytes()==cells[0].tobytes() and m['holdLastFrame']
        else:first=cells[0]
        for f in ['size-overlay.png','identity-size-comparison.png','preview-comparison.png']:assert (out/f).exists()
        q=json.loads((out/'qa.json').read_text());reports.append({'clip':name,'frames':n,'atlasMatchesFrames':True,'gifFrames':gif.n_frames,'bounds':q['bounds'],'scaleComparison':q['targets']});print(name,'PASS',n,'frames')
(W/'validation-dopuna44-deo5.json').write_text(json.dumps(reports,indent=2),encoding='utf8')
