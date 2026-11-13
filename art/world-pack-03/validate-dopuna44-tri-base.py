from pathlib import Path
from PIL import Image
import json,hashlib
W=Path(__file__).resolve().parent;R=W.parent/'animation-pack-04';report=[]
for enemy in ['basa','kopljanik-basa','beg']:
    first=None
    for end in [False,True]:
        name='kostac-'+enemy+('-kraj' if end else '');out=R/'assets'/name;n=6 if end else 8
        m=json.loads((out/'manifest.json').read_text());atlas=Image.open(out/'atlas.png').convert('RGBA');gif=Image.open(out/'preview.gif')
        assert atlas.size==(512*n,512) and gif.n_frames==n
        assert m['characterId']==name and m['animation']['rows']['motion']['frames']==n and m['animation']['rows']['motion']['loop']==(not end)
        assert m['renderScale']==1 and m['renderAnchor']=={'x':256,'y':488}
        assert all('/frames/motion/frame-0.png' in p and not p.endswith('reference.png') for p in m['identityReferences'])
        cells=[Image.open(out/f'frames/motion/frame-{i}.png').convert('RGBA') for i in range(n)];bounds=[]
        for i,c in enumerate(cells):
            b=c.getchannel('A').getbbox();assert c.size==(512,512) and b and b[3]==488 and c.getchannel('A').getextrema()==(0,255)
            assert b[0]>0 and b[2]<512 and b[1]>0
            assert atlas.crop((i*512,0,(i+1)*512,512)).tobytes()==c.tobytes()
            bounds.append(b)
        assert len({hashlib.sha256(c.tobytes()).hexdigest() for c in cells})==n
        if not end:first=cells[0]
        else:assert first.tobytes()==cells[0].tobytes() and m['holdLastFrame']
        q=json.loads((out/'qa.json').read_text());item={'clip':name,'frames':n,'bounds':bounds,'gifFrames':gif.n_frames,'atlasMatchesFrames':True,'referenceFramesChecked':True,'openingMatchesLoop':end,'sizeMeasurement':q['targets']};report.append(item);print(name,'PASS',n,'frames')
(W/'validation-dopuna44-tri-base.json').write_text(json.dumps(report,indent=2),encoding='utf8')
