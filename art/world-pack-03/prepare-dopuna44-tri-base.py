from pathlib import Path
from PIL import Image, ImageDraw
import json
W=Path(__file__).resolve().parent
R=W.parent/'animation-pack-04'
S=R/'sources/dopuna44-tri-base'
S.mkdir(parents=True,exist_ok=True)
jobs={}
for enemy,ratio in [('basa',1.2),('kopljanik-basa',1.25),('beg',1.3)]:
    board=Image.new('RGBA',(512,512))
    refs=[]
    for n,height,cx,flip in [('marko-idle-2',306,140,False),(enemy+'-idle',round(306*ratio),365,True)]:
        path=R/f'assets/{n}/frames/motion/frame-0.png'
        p=Image.open(path).convert('RGBA')
        b=p.getchannel('A').point(lambda v:255 if v>16 else 0).getbbox()
        factor=height/(b[3]-b[1]);p=p.crop(b)
        p=p.resize((round(p.width*factor),height),Image.Resampling.LANCZOS)
        if flip:p=p.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
        board.alpha_composite(p,(cx-p.width//2,488-height))
        refs.append({'id':n,'path':str(path),'height':height,'factor':factor,'width':p.width})
    board.save(S/f'{enemy}-scale-target.png')
    jobs[enemy]={'ratio':ratio,'refs':refs}
(S/'targets.json').write_text(json.dumps(jobs,indent=2),encoding='utf8')
print(json.dumps(jobs,indent=2))
