from pathlib import Path
from PIL import Image,ImageDraw
import json
w=Path(__file__).resolve().parent;root=w.parent/'animation-pack-04';game=w.parents[1]
source=root/'sources/dopuna44-lovac-musa-v2';source.mkdir(parents=True,exist_ok=True)
m=json.loads((game/'dist/assets/musa-idle.json').read_text());r=m['frame_layout']['rows']['motion'][0]
p=Image.open(game/'dist/assets/musa-idle.png').convert('RGBA').crop((r['x'],r['y'],r['x']+r['w'],r['y']+r['h']))
mp=source/'musa-idle/frames/motion/frame-0.png';mp.parent.mkdir(parents=True,exist_ok=True);p.save(mp)
for enemy,factor in [('lovac-aga',.77),('musa',.89)]:
 board=Image.new('RGBA',(1024,512),(36,43,49,255));targets=[]
 for i,(n,f,path) in enumerate([('marko-idle-2',.8,root/'assets/marko-idle-2/frames/motion/frame-0.png'),(enemy,factor,mp if enemy=='musa' else root/'assets/lovac-aga-idle/frames/motion/frame-0.png')]):
  p=Image.open(path).convert('RGBA');b=p.getchannel('A').point(lambda a:255 if a>16 else 0).getbbox()
  p=p.resize((round(512*f),round(512*f)),Image.Resampling.LANCZOS);board.alpha_composite(p,(i*512+(512-p.width)//2,488-round(488*f)))
  targets.append({'id':n,'factor':f,'height':round((b[3]-b[1])*f),'width':round((b[2]-b[0])*f),'reference':str(path)})
 ImageDraw.Draw(board).line((0,488,1023,488),fill='yellow');board.save(source/f'{enemy}-scale-target.png');(source/f'{enemy}-targets.json').write_text(json.dumps(targets,indent=2));print(enemy,targets)
p=Image.open(root/'assets/megdan-kostac/frames/motion/frame-0.png').convert('RGBA')
b=p.getchannel('A').point(lambda a:255 if a>16 else 0).getbbox();p=p.crop(b);scale=306/393
p=p.resize((round(p.width*scale),round(p.height*scale)),Image.Resampling.LANCZOS);target=Image.new('RGBA',(512,512));tx,ty=(512-p.width)//2,488-p.height;target.alpha_composite(p,(tx,ty));target.save(source/'musa-transition-target.png')
(source/'musa-transition.json').write_text(json.dumps({'targetClip':'megdan-kostac','targetFrame':0,'sourceScale':scale,'sourceMarkoLengthPx':393,'targetMarkoLengthPx':306,'nextClipRequiredScale':scale,'nextClipSourceOffset':{'x':tx-b[0]*scale,'y':ty-b[1]*scale},'note':'Apply scale and source offset to next clip for the same ground and placement. Original megdan-kostac is unchanged.'},indent=2))
export=w/'export-dopuna44-lovac-musa-v2.py'
if not export.exists():
 s=(w/'export-dopuna44-aga-arapin-v2.py').read_text(encoding='utf8').replace('aga-arapin','lovac-musa')
 s=s.replace("enemy='arapin' if 'arapin' in name else 'janicarski-aga'", "enemy='musa' if 'musa' in name else 'lovac-aga'")
 s=s.replace(".85 if enemy=='arapin' else .83", ".89 if enemy=='musa' else .77").replace('0.85 if enemy=="arapin" else 0.83','0.89 if enemy=="musa" else 0.77')
 s=s.replace("  if name=='kostac-aga-kraj' and i in (4,5):bounds[2 if i==4 else 0]=round(im.width*992/1536)\n",'')
 s=s.replace("name,source,mode=sys.argv[1:4]", "name,source,mode=sys.argv[1:4]\ndef refpath(n):\n return root/'sources/dopuna44-lovac-musa-v2/musa-idle/frames/motion/frame-0.png' if n=='musa-idle' else root/f'assets/{n}/frames/motion/frame-0.png'")
 s=s.replace("Image.open(root/f'assets/{n}/frames/motion/frame-0.png')", "Image.open(refpath(n))")
 s=s.replace(" m['identityReferences']=['../marko-idle-2/frames/motion/frame-0.png',f'../{enemy}-idle/frames/motion/frame-0.png']", " m['identityReferences']=['../marko-idle-2/frames/motion/frame-0.png','../../sources/dopuna44-lovac-musa-v2/musa-idle/frames/motion/frame-0.png' if enemy=='musa' else '../lovac-aga-idle/frames/motion/frame-0.png']")
 export.write_text(s,encoding='utf8')
 s=(w/'validate-dopuna44-aga-arapin-v2.py').read_text(encoding='utf8').replace('aga-arapin','lovac-musa').replace('kostac-aga','kostac-lovac').replace('kostac-arapin','kostac-musa')
 (w/'validate-dopuna44-lovac-musa-v2.py').write_text(s,encoding='utf8')
