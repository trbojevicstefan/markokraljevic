from pathlib import Path
from PIL import Image, ImageDraw
import json
w=Path(__file__).resolve().parent
root=w.parent/'animation-pack-04'
out=root/'sources/dopuna44-hasan-djemo-v2'
out.mkdir(parents=True,exist_ok=True)
for name,factor in [('hasan-aga',.93),('djemo',.84)]:
 refs=[]
 board=Image.new('RGBA',(1024,512),(36,43,49,255))
 for i,(n,f) in enumerate([('marko-idle-2',.8),(name+'-idle',factor)]):
  p=Image.open(root/f'assets/{n}/frames/motion/frame-0.png').convert('RGBA')
  b=p.getchannel('A').point(lambda a:255 if a>16 else 0).getbbox()
  p=p.resize((round(512*f),round(512*f)),Image.Resampling.LANCZOS)
  board.alpha_composite(p,(i*512+(512-p.width)//2,488-round(488*f)))
  refs.append({'id':n,'factor':f,'height':round((b[3]-b[1])*f),'width':round((b[2]-b[0])*f)})
 ImageDraw.Draw(board).line((0,488,1023,488),fill=(255,210,80),width=1)
 board.save(out/f'{name}-scale-target.png')
 (out/f'{name}-targets.json').write_text(json.dumps(refs,indent=2))
 print(name,refs)
