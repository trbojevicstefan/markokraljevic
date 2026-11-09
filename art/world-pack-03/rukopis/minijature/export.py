from pathlib import Path
from PIL import Image
import sys, shutil, json
root=Path(__file__).resolve().parent
name,source=sys.argv[1:3]
out=root/(name+'.png')
assert not out.exists(), 'Preserving existing file'
(root/'sources').mkdir(exist_ok=True)
raw=root/'sources'/(name+'.png')
assert not raw.exists()
shutil.copy2(source,raw)
im=Image.open(raw).convert('RGBA').resize((768,768),Image.Resampling.LANCZOS)
bg=Image.new('RGBA',im.size,(191,150,65,255)); bg.alpha_composite(im); bg.convert('RGB').save(out)
with (root.parent.parent/'STATUS.md').open('a',encoding='utf8') as f:
    f.write('\n## DOPUNA-7 - '+name+' GOTOVO\nSacuvano u rukopis/minijature/'+name+'.png; 768x768 PNG, neprovidna zlatna podloga. Ugradjeni image_gen, prompt u minijature/prompts.json, izvor u minijature/sources/.\n')
print(name+' saved, 768x768 opaque PNG; STATUS appended')
