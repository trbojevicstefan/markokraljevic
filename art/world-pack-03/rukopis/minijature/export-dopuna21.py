from pathlib import Path
from PIL import Image,ImageDraw
import json,sys,shutil
root=Path(__file__).resolve().parent;world=root.parents[1]
name,source=sys.argv[1:3]
jobs=json.loads((root/'prompts-dopuna21.json').read_text(encoding='utf-8-sig'))['jobs']
assert name in [j['id'] for j in jobs] and not (root/(name+'.png')).exists()
folder=root/'sources/dopuna21';folder.mkdir(exist_ok=True)
shutil.copy2(source,folder/(name+'.png'))
im=Image.open(source).convert('RGB').resize((768,768),Image.Resampling.LANCZOS);im.save(root/(name+'.png'))
assert Image.open(root/(name+'.png')).size==(768,768)
preview=Image.new('RGB',(1152,816),(43,32,23));draw=ImageDraw.Draw(preview)
for i,j in enumerate(jobs):
 p=root/(j['id']+'.png')
 if p.exists():
  im=Image.open(p).convert('RGB').resize((384,384),Image.Resampling.LANCZOS);preview.paste(im,(i%3*384,i//3*408));draw.text((i%3*384+8,i//3*408+388),j['id'],fill='white')
preview.save(root/'preview-dopuna21.png')
with (world/'STATUS.md').open('a',encoding='utf8') as f:
 f.write(f'\nDOPUNA-21 A: {name}.png — GOTOVO; rukopis/minijature/{name}.png, PNG768x768, zlatna neprovidna podloga, stil i likovi prema minijatura-musa.png. Ugradjeni image_gen, jedan pokusaj. Prompt: rukopis/minijature/prompts-dopuna21.json. Izvor sacuvan u sources/dopuna21/. Pregled: preview-dopuna21.png.\n')
print('Saved and logged:',name)
