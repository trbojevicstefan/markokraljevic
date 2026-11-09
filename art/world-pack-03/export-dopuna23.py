from pathlib import Path
from PIL import Image,ImageDraw
import sys,json,shutil
root=Path(__file__).resolve().parent
name,source=sys.argv[1:3]
j=next(j for j in json.loads((root/'prompts-dopuna23.json').read_text(encoding='utf-8-sig'))['jobs'] if j['id']==name)
out=root/(name+'.png');assert not out.exists(),'Existing output preserved'
folder=root/'sources/dopuna23';folder.mkdir(parents=True,exist_ok=True);shutil.copy2(source,folder/(name+'.png'))
im=Image.open(source).convert('RGBA');assert im.getchannel('A').getextrema()[0]==0,'Missing transparency'
b=im.getchannel('A').point(lambda v:255 if v>16 else 0).getbbox();assert b
im=im.crop(b);im.putalpha(im.getchannel('A').point(lambda v:0 if v<=8 else v))
size=tuple(j['size'])
if j['type']=='icon':
 im=im.resize((236,236),Image.Resampling.LANCZOS);final=Image.new('RGBA',size);final.alpha_composite(im,(10,10))
elif j['type']=='panel':
 im=im.resize((884,1164),Image.Resampling.LANCZOS);final=Image.new('RGBA',size);final.alpha_composite(im,(8,8))
else:final=im.resize(size,Image.Resampling.LANCZOS)
final.save(out);assert final.size==size and final.getchannel('A').getextrema()[0]==0
with (root/'STATUS-ANIMACIJE.md').open('a',encoding='utf8') as f:
 f.write(f'\nDOPUNA-23: {name}.png — GOTOVO; art/world-pack-03/{name}.png, PNG RGBA{size[0]}x{size[1]}, providnost proverena. Ugradjeni image_gen, jedan pokusaj. Prompt: prompts-dopuna23.json; izvor sources/dopuna23/.\n')
print('Saved and logged:',name,size)
