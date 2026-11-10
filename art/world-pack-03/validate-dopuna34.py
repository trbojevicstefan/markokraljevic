from pathlib import Path
from PIL import Image,ImageDraw
import json,numpy as np,math
w=Path(__file__).resolve().parent;jobs=json.loads((w/'prompts-dopuna34.json').read_text())['jobs'];catalog=[]
board=Image.new('RGBA',(1536,1536),(56,70,84,255));d=ImageDraw.Draw(board)
for i,j in enumerate(jobs):
 p=w/(j['id']+'.png');im=Image.open(p).convert('RGBA');assert im.size==tuple(j['size'])
 a=np.array(im.getchannel('A'));y=im.height-math.ceil(im.height*.22);assert np.all(a[y:]==255) and np.any(a[:y]==0)
 qa=json.loads((w/'sources/dopuna34'/j['id']/'qa.json').read_text());assert qa['upperAirHasTransparency']
 catalog.append(dict(id=j['id'],file=p.name,size=im.size,opaqueHillStartsY=y,opaqueBottomPercentMinimum=22,opaqueHillFullWidth=True,attempts=qa['attempts'],boundBodies=True if i else False))
 if i==0:im.thumbnail((768,900));pos=(0,0)
 elif i==1:im.thumbnail((1536,600));pos=(0,936)
 else:im.thumbnail((768,900));pos=(768,0)
 board.alpha_composite(im,pos);d.text((pos[0]+8,pos[1]+8),j['id'],fill='white')
board.convert('RGB').save(w/'preview-dopuna34.jpg')
(w/'catalog-dopuna34.json').write_text(json.dumps(catalog,indent=2),encoding='utf8')
(w/'validation-dopuna34.json').write_text(json.dumps({'passed':True,'files':3,'bottomHillFullWidthAlpha':255,'bottomHillMinPercent':22,'transparentAirAbove':True,'dimensionsExact':True,'generationAttempts':[2,1,2],'blockedRequests':0},indent=2),encoding='utf8')
with (w/'STATUS-ANIMACIJE.md').open('a',encoding='utf8') as f:f.write('\nDOPUNA-34 ZAVRSENO3/3: kolci-vitezovi-glave1024x1024, kolci-vitezovi-red1536x768, kolac-vitez768x1024. Srpski vitezovi u boji (nosnici/pancir/crveni plastevi), tela VEZANA uz stubove, bez krupnih krvavih detalja. Donjih22% alfa255 svuda (y798 za1024, y599 za768), vazduh iznad providan. Ugradjeni image_gen; pokusaji2/1/2, dve korekcije kompozicije zbog dodatnih elemenata, nijedan zahtev odbijen. Stare siluete nisu menjane. Katalog catalog-dopuna34.json, preview-dopuna34.jpg, validation-dopuna34.json.\n')
print('PASS:3PNG; exactdimensions, opaque bottom22% acrossfullwidth, transparent upperair. Attempts2/1/2; no refusals.')
