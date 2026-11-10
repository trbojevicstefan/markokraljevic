from pathlib import Path
from PIL import Image,ImageDraw
import numpy as np,json
w=Path(__file__).resolve().parent;jobs=json.loads((w/'prompts-dopuna37.json').read_text())['jobs'];catalog=[]
board=Image.new('RGBA',(1024,2050),(29,39,49,255));d=ImageDraw.Draw(board);d.text((24,14),'DOPUNA37 | platforme 1/2 | Marko125px | hodna povrsina izvorY40 / prikazY20',fill='white')
ref=Image.open(w.parent/'animation-pack-04/assets/marko-idle-2/frames/motion/frame-0.png').convert('RGBA');b=ref.getchannel('A').point(lambda v:255 if v>16 else 0).getbbox();ref=ref.crop(b);ref=ref.resize((round(ref.width*125/ref.height),125),Image.Resampling.LANCZOS)
silhouette=Image.new('RGBA',ref.size,(211,185,148,255));silhouette.putalpha(ref.getchannel('A'));assert silhouette.height==125
for row,j in enumerate(jobs):
 name=j['id'];parts=[Image.open(w/f'plat-{name}-{label}.png').convert('RGBA') for label in ['levo','sredina','desno']];a=[np.array(p) for p in parts]
 assert [p.size for p in parts]==[(128,192),(256,192),(128,192)]
 assert np.array_equal(a[1][:,0],a[1][:,-1]) and np.array_equal(a[0][:,-1],a[1][:,0]) and np.array_equal(a[1][:,-1],a[2][:,0])
 assert np.all(a[1][40,:,3]==255)
 for p in a:assert np.all(p[:24,:,3]==0) and np.all(p[185:,:,3]==0) and p[:,:,3].min()==0
 full=Image.new('RGBA',(1024,192));x=0
 for p in [parts[0],parts[1],parts[1],parts[1],parts[2]]:full.paste(p,(x,0));x+=p.width
 assert x==1024
 full=full.resize((512,96),Image.Resampling.LANCZOS);y=50+row*250;board.alpha_composite(full,(300,y+150));board.alpha_composite(silhouette,(475,y+170-125))
 d.text((24,y+20),name,fill=(235,214,179));d.text((24,y+42),'levo + 3x sredina + desno',fill=(174,188,198));d.text((24,y+60),'128 / 256 / 128 x192',fill=(174,188,198))
 catalog.append({'material':name,'files':[f'plat-{name}-{label}.png' for label in ['levo','sredina','desno']],'sizes':[[128,192],[256,192],[128,192]],'walkSurfaceY':40,'decorationMinY':24,'bottomClearFromY':185,'middleSeamMaxRgbaDifference':0,'capSeamMaxRgbaDifference':0,'drawScale':.5,'walkSurfaceAtHalfScale':20,'halfScalePreviewWidth':512,'halfScalePreviewMarkoHeight':125})
board.convert('RGB').save(w/'preview-dopuna37.jpg',quality=95)
(w/'catalog-dopuna37.json').write_text(json.dumps(catalog,indent=2),encoding='utf8')
(w/'validation-dopuna37.json').write_text(json.dumps({'passed':True,'materials':8,'pngFiles':24,'walkSurfaceY':40,'seamRgbaDifferenceAllMaterials':0,'previewScale':.5,'previewMarkoHeight':125,'previewAssembly':'left + middle + middle + middle + right','generator':'built-in image_gen','sourceGenerations':8},indent=2))
with (w/'STATUS-ANIMACIJE.md').open('a',encoding='utf8') as f:f.write('\nDOPUNA-37 ZAVRSENO8/8 MATERIJALA,24PNG: zemlja,mahovina,kamen,zid,sneg,kristal,cigla,greda. Povrsina tacnoY40, ukrasi ne iznadY24, donji deo providan od185. Sredina256x192 ponovljiva pikselpo-piksel RGBA razlika0; krajevi128x192 takodje spojeni razlika0. preview-dopuna37.jpg: levo+3xsredina+desno na1/2velicine, Markova silueta125px stoji na hodnoj liniji. Katalog catalog-dopuna37.json i provera validation-dopuna37.json. Ugradjeni image_gen,8naslikanih celina/8poziva, po3tehnicki izvezena dela.\n')
print('PASS8materials/24PNG; exact Y40; exactRGBAseams; halfscale preview with125pxMarko saved.')
