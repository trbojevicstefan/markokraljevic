from pathlib import Path
from PIL import Image,ImageDraw
R=Path(__file__).resolve().parent
board=Image.new('RGBA',(1536,440),(25,37,36,255));d=ImageDraw.Draw(board)
for row,id in enumerate(['kolje','siljci']):
    im=Image.open(R/(id+'.png')).convert('RGBA')
    for x in range(3):board.alpha_composite(im,(x*512,row*220+22))
    d.text((8,row*220+5),id+' / 3 repeats',fill='white')
board.save(R/'prepreke-spoj-preview.png')
