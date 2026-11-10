from pathlib import Path
from PIL import Image,ImageDraw
import json,hashlib
w=Path(__file__).resolve().parent;a=w.parent/'world-pack-01/assets';out=w/'sources/dopuna32/review';out.mkdir(parents=True,exist_ok=True)
themes=sorted({p.name.split('-')[0] for p in a.glob('*-near.png')}-{'podrum'});records=[]
for group in range(3):
 batch=themes[group*4:(group+1)*4];board=Image.new('RGBA',(1448,len(batch)*3*266),(29,39,47,255));d=ImageDraw.Draw(board)
 for ti,t in enumerate(batch):
  for vi,v in enumerate(['','-night','-storm']):
   for col,layer in enumerate(['near','mid']):
    p=a/(t+'-'+layer+v+'.png');im=Image.open(p).convert('RGBA');records.append({'file':p.name,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'size':im.size})
    x,y=col*724,(ti*3+vi)*266;im=im.resize((724,241),Image.Resampling.LANCZOS);board.alpha_composite(im,(x,y+25));d.text((x+8,y+5),p.name,fill='white')
    # Comparison ruler: Marko145 near,87 mid at original724-height.
    h=round((145 if layer=='near' else 87)*241/724);d.line((x+700,y+256,x+700,y+256-h),fill=(240,70,70),width=2)
 board.convert('RGB').save(out/f'overview-{group+1}.jpg')
(out/'inventory.json').write_text(json.dumps(records,indent=2))
print(len(themes),'themes;',len(records),'layers inventoried')
