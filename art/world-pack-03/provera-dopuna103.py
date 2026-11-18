from PIL import Image,ImageDraw
from pathlib import Path
p=Path('art/world-pack-03'); names=['merdevine-telo','merdevine-vrh','prop-skela-dunav','prop-top-varadin','prop-barjak-varadin','prop-korpe-grozdja','prop-mreza-ribarska','prop-tulum-ledjen']
sheet=Image.new('RGB',(1200,1600),'#777777'); d=ImageDraw.Draw(sheet)
for i,n in enumerate(names):
 im=Image.open(p/(n+'.png')).convert('RGBA'); print(n,im.size,'bbox',im.getchannel('A').getbbox()); im.thumbnail((575,170))
 for j,c in enumerate(['white','#3783ca']):
  x=j*600; y=i*200; bg=Image.new('RGBA',(600,195),c); bg.alpha_composite(im,((600-im.width)//2,20)); sheet.paste(bg.convert('RGB'),(x,y)); d.text((x+5,y+2),n,fill='black')
sheet.save(p/'provera-dopuna103.png')
