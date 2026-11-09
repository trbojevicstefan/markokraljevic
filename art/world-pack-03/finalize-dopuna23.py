from pathlib import Path
from PIL import Image,ImageDraw
import json
root=Path(__file__).resolve().parent;anim=root.parent/'animation-pack-04'
jobs=json.loads((root/'prompts-dopuna23.json').read_text(encoding='utf-8-sig'))['jobs'];records=[]
icons=Image.new('RGBA',(1280,704),(29,38,46,255));d=ImageDraw.Draw(icons)
for i,j in enumerate(jobs):
 p=root/(j['id']+'.png');im=Image.open(p).convert('RGBA');assert im.size==tuple(j['size']) and im.getchannel('A').getextrema()[0]==0
 if j['type']=='icon':
  b=im.getchannel('A').getbbox();assert b==(10,10,246,246),b
  icons.alpha_composite(im,((i%5)*256,(i//5)*300));d.text(((i%5)*256+10,(i//5)*300+265),j['id'],fill='white')
  small=im.resize((48,48),Image.Resampling.LANCZOS);icons.alpha_composite(small,(20+i*124,620));d.text((14+i*124,677),j['id'][6:],fill='white')
 records.append({'id':j['id'],'file':j['id']+'.png','size':list(im.size),'transparent':True,'attempts':1,'verified':True})
icons.convert('RGB').save(root/'preview-dopuna23-ikone.png')
ui=Image.new('RGBA',(1120,700),(29,38,46,255));dui=ImageDraw.Draw(ui)
panel=Image.open(root/'pauza-ram.png').convert('RGBA');panel.thumbnail((450,590),Image.Resampling.LANCZOS);ui.alpha_composite(panel,(20,35))
for k,name in enumerate(['dugme-ploca','dugme-ploca-aktivno']):
 im=Image.open(root/(name+'.png')).convert('RGBA');im.thumbnail((600,112),Image.Resampling.LANCZOS);ui.alpha_composite(im,(500,100+k*180));dui.text((510,70+k*180),name,fill='white')
ui.convert('RGB').save(root/'preview-dopuna23-pauza.png')
out=anim/'assets/pauza-logor';m=json.loads((out/'manifest.json').read_text());a=Image.open(out/'atlas.png').convert('RGBA');gif=Image.open(out/'preview.gif')
assert a.size==(6144,512) and gif.n_frames==8
assert m['cell']['width']==768 and m['cell']['height']==512 and m['animation']['rows']['motion']['loop'] is True
for i in range(8):
 im=Image.open(out/f'frames/motion/frame-{i}.png').convert('RGBA');assert im.size==(768,512) and im.getchannel('A').getextrema()==(255,255)
 assert a.crop((i*768,0,(i+1)*768,512)).tobytes()==im.tobytes()
 assert m['frame_layout']['rows']['motion'][i]==dict(x=i*768,y=0,w=768,h=512)
records.append({'id':'pauza-logor','atlas':'../animation-pack-04/assets/pauza-logor/atlas.png','cell':[768,512],'frames':8,'loop':True,'opaque':True,'gifSize':list(gif.size),'attempts':1,'verified':True})
(root/'catalog-dopuna23.json').write_text(json.dumps(records,indent=2))
(root/'validation-dopuna23.json').write_text(json.dumps({'staticImages':13,'clips':1,'frames':8,'imagegenCalls':14,'results':records},indent=2))
with (root/'STATUS-ANIMACIJE.md').open('a',encoding='utf8') as f:
 f.write('\nDOPUNA-23 — ZAVRSENO: 10 ikona256x256 (medaljoni236px), pauza-ram900x1180, dva dugmeta640x112 i pauza-logor8kadova768x512 (atlas6144x512). Sve14stavke redom, po jedan pokusaj ugradjenim image_gen generatorom. Proverene dimenzije, providnost statickih slika, neprovidnost logora, atlas/kadrovi, frame_layout, brojGIFkadova i loop. Pregledi: preview-dopuna23-ikone.png (ukljucuje48px prikaz), preview-dopuna23-pauza.png i ../animation-pack-04/assets/pauza-logor/preview.png. Katalog/validacija: catalog-dopuna23.json i validation-dopuna23.json. Promptovi: prompts-dopuna23.json i ../animation-pack-04/plan-dopuna23.json. Nema neuspelih stavki; kod igre i dist nisu menjani.\n')
print('Verified:13 PNGs + 8-frame scene; GIF size',gif.size)
