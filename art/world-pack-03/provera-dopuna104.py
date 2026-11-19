from PIL import Image,ImageDraw
names=['prop-tamnica-varadin','prop-krcma-beograd','prop-markova-kula','prop-karuce-zlatne','kapija-34-kamen','kapija-34-resetka']
out=Image.new('RGB',(1000,1800),'gray'); d=ImageDraw.Draw(out)
for i,n in enumerate(names):
 im=Image.open('art/world-pack-03/'+n+'.png').convert('RGBA'); im.thumbnail((480,270))
 for j,bg in enumerate(['white','#2164ba']):
  x=j*500; y=i*300; tile=Image.new('RGBA',(500,300),bg); tile.alpha_composite(im,((500-im.width)//2,20)); out.paste(tile.convert('RGB'),(x,y)); d.text((x+5,y+2),n,fill='black')
out.save('art/world-pack-03/provera-dopuna104.jpg')
