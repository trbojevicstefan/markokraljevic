from pathlib import Path
from PIL import Image,ImageDraw
import json,numpy as np
w=Path(__file__).resolve().parent
names=['sky','far','mid','near','vista'];qa=[]
board=Image.new('RGB',(1448,5*280),(32,38,48));d=ImageDraw.Draw(board)
for i,n in enumerate(names):
 im=Image.open(w/f'urvina-{n}.png').convert('RGBA');assert im.size==(2172,724)
 a=np.array(im);assert np.array_equal(a[:,0],a[:,-1])
 if n in ['far','mid','near']:
  assert im.getchannel('A').getextrema()==(0,255)
  assert float((a[:100,:,3]==0).mean())>.8
 else:assert im.getchannel('A').getextrema()==(255,255)
 qa.append({'name':'urvina-'+n,'size':list(im.size),'alpha':im.getchannel('A').getextrema(),'matchingEdgeRGBA':True})
 tile=im.resize((724,241),Image.Resampling.LANCZOS)
 for x in [0,724]:board.paste(tile,(x,i*280+30),tile)
 d.text((12,i*280+8),'urvina-'+n+' | repeated twice | join at center',fill='white')
board.save(w/'preview-urvina-tiles.jpg',quality=92)
composite=Image.open(w/'urvina-sky.png').convert('RGBA')
for n in ['far','mid','near']:composite.alpha_composite(Image.open(w/f'urvina-{n}.png').convert('RGBA'))
composite.convert('RGB').save(w/'preview-urvina-composite.jpg',quality=94)
(w/'validation-dopuna42-1.json').write_text(json.dumps({'items':qa,'audit':'seam-audit.py passed existing195; same audit math with PNG paths passed5Ur vin a layers','builtInGenerator':True},indent=2),encoding='utf8')
html='''<!doctype html><meta charset="utf-8"><title>Urvina — pozadine</title><style>body{background:#202630;color:#eee;font:18px system-ui;margin:32px}img{width:100%;display:block}a{color:#ecc491}section{margin:32px 0}.layer{background:repeating-conic-gradient(#374450 0% 25%,#28313b 0% 50%) 0/24px 24px}</style><h1>Urvina — pet slojeva u zoru</h1><p>2172×724 PNG. Providni far/mid/near; nebo i vista neprozirni. Horizontalni spojevi provereni.</p><section><h2>Složeni pregled</h2><img src="preview-urvina-composite.jpg"></section><section><h2>Vista</h2><img src="urvina-vista.png"></section>'''
for n in names:html+=f'<section><h2>urvina-{n}</h2><a href="urvina-{n}.png">PNG</a><div class="layer"><img src="urvina-{n}.png"></div></section>'
html+='<section><h2>Ponavljanje — spoj na sredini</h2><img src="preview-urvina-tiles.jpg"></section>'
(w/'preview-dopuna42-1.html').write_text(html,encoding='utf8')
with (w/'STATUS-ANIMACIJE.md').open('a',encoding='utf8') as f:f.write('\nDOPUNA-42 deo1: ZAVRSENO5/5 — urvina-sky/far/mid/near/vista.png; sve2172x724. Provera seam-audit.py PASS195 postojecih; isti audit nad novimPNG: PASS5 (crossfade12%). Direktno jednaki levi/desni RGBA rubovi; alfa i dimenzije prosle. Pregled preview-dopuna42-1.html, ponavljanje preview-urvina-tiles.jpg; izvori/promptovi/QA sources/dopuna42-1/. Bez gradjevina (na visti samo trazeni bunar), zora bez vidljivog sunca. Kod i dist nisu menjani.\n')
print('PASS5: size, alpha, horizontal edges; gallery and status saved')
