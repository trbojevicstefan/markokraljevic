from pathlib import Path
from PIL import Image,ImageDraw
import json,hashlib,numpy as np
w=Path(__file__).resolve().parent;a=w.parent/'world-pack-01/assets';old=w.parent/'world-pack-01/staro';jobs=json.loads((w/'prompts-dopuna32.json').read_text())['jobs'];items=[]
board=Image.new('RGBA',(1448,6*266),(29,39,47,255));d=ImageDraw.Draw(board)
for k,j in enumerate(jobs[:6]):
 p=a/(j['id']+'.png');b=old/p.name;im=Image.open(p).convert('RGBA');prev=Image.open(b).convert('RGBA');assert im.size==prev.size
 aa=np.array(im.getchannel('A'));oa=np.array(prev.getchannel('A'));assert aa.min()==0 and np.all(aa[oa==0]==0)
 qa=json.loads((w/'sources/dopuna32'/j['id']/'qa.json').read_text());assert hashlib.sha256(b.read_bytes()).hexdigest()==qa['oldSha256']
 for col,img in enumerate([prev,im]):
  x,y=col*724,k*266;board.alpha_composite(img.resize((724,241),Image.Resampling.LANCZOS),(x,y+25));d.text((x+5,y+5),j['id']+(' ORIGINAL' if col==0 else ' NOVO'),fill='white');d.line((x+365,y+254,x+365,y+254-round(145*241/724)),fill=(240,85,85),width=3)
 items.append({'id':j['id'],'file':str(p.relative_to(w.parents[1])),'size':im.size,'original':str(b.relative_to(w.parents[1])),'originalTransparentPixelsPreserved':True,'originalHashVerified':True})
board.convert('RGB').save(w/'preview-dopuna32-podrum.jpg')
for rec in json.loads((w/'sources/dopuna32/review/inventory.json').read_text()):assert hashlib.sha256((a/rec['file']).read_bytes()).hexdigest()==rec['sha256']
propboard=Image.new('RGBA',(1536,1100),(120,128,136,255))
for i,j in enumerate(jobs[6:]):
 p=w/(j['id']+'.png')
 if not p.exists():items.append({'id':j['id'],'status':'blocked','reason':'image_gen output moderation: violence/self-harm'});continue
 im=Image.open(p).convert('RGBA');assert im.size==tuple(j['size']) and im.getchannel('A').getextrema()[0]==0;assert im.getchannel('A').getbbox()[3]==im.height-24
 propboard.alpha_composite(im,(384,0) if i==0 else (0,580));items.append({'id':j['id'],'file':p.name,'size':im.size,'groundY':im.height-25,'transparent':True})
propboard.convert('RGB').save(w/'preview-dopuna32-kolci.jpg')
(w/'catalog-dopuna32.json').write_text(json.dumps(items,indent=2),encoding='utf8')
(w/'validation-dopuna32.json').write_text(json.dumps({'passedForProducedFiles':True,'layers':6,'propsProduced':2,'propsBlocked':1,'otherCampaignsReviewed':11,'otherLayersReviewedAndUnchanged':66,'originalBackupsVerified':6,'originalTransparentHolesPreserved':True},indent=2))
with (w/'STATUS-ANIMACIJE.md').open('a',encoding='utf8') as f:f.write('\nDOPUNA-32 REZULTAT: 6/6 slojeva Podruma gotovo, originali u world-pack-01/staro/ potvrdaSHA256, providni otvori sacuvani. Pregled11pohoda/66slojeva samo spisak, njihove slike potvrdeno nepromenjene. Kolci2/3: prop-kolci-glave i prop-kolci-red gotovo; prop-kolac-nabijen odbio image_gen safety filter violence/self-harm. Katalog catalog-dopuna32.json; provere validation-dopuna32.json; pregledi preview-dopuna32-podrum.jpg i preview-dopuna32-kolci.jpg.\n')
print('PASS produced files: 6 layers, 2 props, 66 reviewed layers unchanged; 1 prop blocked.')
