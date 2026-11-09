from pathlib import Path
from PIL import Image,ImageDraw
import json
root=Path(__file__).resolve().parent
jobs=json.loads((root/'plan-dopuna8.json').read_text())['jobs'][4:]
board=Image.new('RGBA',(1536,len(jobs)*280),(30,38,42,255))
draw=ImageDraw.Draw(board)
report=[]
for row,j in enumerate(jobs):
    out=root/'assets'/j['id']; m=json.loads((out/'manifest.json').read_text())
    frames=[Image.open(out/f'frames/motion/frame-{i}.png').convert('RGBA') for i in range(j['frames'])]
    assert len(frames)==j['frames'] and Image.open(out/'preview.gif').n_frames==j['frames']
    atlas=Image.open(out/'atlas.png').convert('RGBA')
    assert atlas.size==(j['frames']*512,512)
    for i,im in enumerate(frames):
        assert im.size==(512,512) and im.getchannel('A').getextrema()==(0,255)
        assert im.getchannel('A').getbbox()[3]==488
        assert im.tobytes()==atlas.crop((i*512,0,(i+1)*512,512)).tobytes()
    assert m['animation']['rows']['motion']['loop']==j['loop']
    for col,i in enumerate([0,j['frames']//2,j['frames']-1]):
        im=frames[i].resize((256,256),Image.Resampling.LANCZOS);board.alpha_composite(im,(col*384+64,row*280))
    draw.text((10,row*280+260),j['id'],fill='white')
    report.append({'clip':j['id'],'frames':len(frames),'firstHeight':frames[0].getchannel('A').getbbox()[3]-frames[0].getchannel('A').getbbox()[1],'verified':True})
board.convert('RGB').save(root/'preview-dopuna8.png')
(root/'validation-dopuna8.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report))
