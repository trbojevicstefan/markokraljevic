from pathlib import Path
from PIL import Image,ImageDraw
R=Path(__file__).resolve().parent
board=Image.new('RGBA',(1440,1350),(25,37,36,255));d=ImageDraw.Draw(board)
for row,layer in enumerate(['sky','far','mid','near','vista']):
    for col,time in enumerate(['night','storm']):
        id=f'oranje-{layer}-{time}'
        p=R/(id+'.png')
        if not p.exists():continue
        im=Image.open(p).convert('RGBA');im.thumbnail((700,240),Image.Resampling.LANCZOS)
        board.alpha_composite(im,(col*720+10,row*270+20));d.text((col*720+10,row*270+3),id,fill='white')
board.save(R/'oranje-varijante-preview.png')
