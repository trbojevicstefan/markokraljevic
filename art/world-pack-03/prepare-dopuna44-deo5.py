from pathlib import Path
from PIL import Image,ImageDraw
import json
W=Path(__file__).resolve().parent;G=W.parents[1];R=W.parent/'animation-pack-04';S=R/'sources/dopuna44-deo5';S.mkdir(parents=True,exist_ok=True)
m=json.loads((G/'dist/assets/akindzija-idle.json').read_text());r=m['frame_layout']['rows']['motion'][0]
p=Image.open(G/'dist/assets/akindzija-idle.png').convert('RGBA').crop((r['x'],r['y'],r['x']+r['w'],r['y']+r['h']))
dest=S/'akindzija-idle/frames/motion/frame-0.png';dest.parent.mkdir(parents=True,exist_ok=True);p.save(dest)
for name in ['kostac-janicar','kostac-janicar-kraj']:
 board=Image.new('RGBA',(2048,1024),(34,42,49,255)); count=8 if name=='kostac-janicar' else 6
 for i in range(count):
  p=Image.open(R/f'assets/{name}/frames/motion/frame-{i}.png').convert('RGBA');p=p.resize((389,389),Image.Resampling.LANCZOS);c=Image.new('RGBA',(512,512));c.alpha_composite(p,(61,117));c.save(S/f'{name}-scaled-{i}.png');board.alpha_composite(c,((i%4)*512,(i//4)*512))
 board.save(S/f'{name}-scaled-board.png')
for enemy,ratio in [('akindzija',1),('kopljanik',.95)]:
 board=Image.new('RGBA',(1024,512),(34,42,49,255)); data=[]
 for idx,(n,path,h) in enumerate([('marko-idle-2',R/'assets/marko-idle-2/frames/motion/frame-0.png',306),(enemy,dest if enemy=='akindzija' else R/'assets/kopljanik-idle/frames/motion/frame-0.png',round(306*ratio))]):
  p=Image.open(path).convert('RGBA');b=p.getchannel('A').point(lambda v:255 if v>16 else 0).getbbox();f=h/(b[3]-b[1]);p=p.crop(b);p=p.resize((round(p.width*f),h),Image.Resampling.LANCZOS);board.alpha_composite(p,(idx*512+(512-p.width)//2,488-h));data.append({'id':n,'path':str(path),'height':h,'factor':f,'width':p.width})
 board.save(S/f'{enemy}-scale-target.png');(S/f'{enemy}-targets.json').write_text(json.dumps(data,indent=2));print(enemy,data)
