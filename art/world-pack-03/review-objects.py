"""QA contact sheets, including a 40px silhouette/readability sample."""
from pathlib import Path
from PIL import Image,ImageDraw
import json,sys
R=Path(__file__).resolve().parent
part=sys.argv[1]
jobs=json.loads((R/'plan-g7.json').read_text(encoding='utf8'))['jobs']
if part=='7b':jobs=[j for j in jobs if j['id'].startswith('predmet-')];name='collectibles-preview.png'
elif part=='7c':jobs=[j for j in jobs if not j['id'].startswith(('predmet-','razbi-'))];name='puzzles-preview.png'
else:raise ValueError(part)
jobs=[j for j in jobs if (R/(j['id']+'.png')).exists()]
board=Image.new('RGBA',(1200,340*((len(jobs)+3)//4)),(35,43,42,255));d=ImageDraw.Draw(board)
for i,j in enumerate(jobs):
    x=(i%4)*300;y=(i//4)*340
    for gy in range(0,280,20):
        for gx in range(0,280,20):d.rectangle((x+10+gx,y+10+gy,x+29+gx,y+29+gy),fill=(58,64,63,255) if (gx//20+gy//20)%2 else (43,49,48,255))
    im=Image.open(R/(j['id']+'.png')).convert('RGBA');im=im.crop(im.getchannel('A').getbbox());small=im.copy();small.thumbnail((40,40),Image.Resampling.LANCZOS)
    im.thumbnail((260,260),Image.Resampling.LANCZOS);board.alpha_composite(im,(x+(300-im.width)//2,y+280-im.height))
    board.alpha_composite(small,(x+250,y+292));d.text((x+8,y+296),j['id'],fill='white')
board.save(R/name);print(name)
