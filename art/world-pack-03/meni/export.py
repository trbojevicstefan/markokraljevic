from pathlib import Path
from PIL import Image
import shutil,json
r=Path(__file__).resolve().parent
p=json.loads((r/'prompt.json').read_text())
if not (r/'meni-tlo.png').exists():
    if not (r/'meni-tlo-source.png').exists(): shutil.copy2(p['source'],r/'meni-tlo-source.png')
    im=Image.open(r/'meni-tlo-source.png').convert('RGBA').resize((1800,560),Image.Resampling.LANCZOS)
    assert im.getchannel('A').getextrema()[0]==0
    im.save(r/'meni-tlo.png')
im=Image.open(r/'meni-tlo.png').convert('RGBA')
bg=Image.open(r.parents[2]/'dist/assets/gorge.png').convert('RGBA')
ledge=im.copy(); ledge.thumbnail((int(bg.width*.64),int(bg.height*.33)),Image.Resampling.LANCZOS)
bg.alpha_composite(ledge,(bg.width-ledge.width,bg.height-ledge.height))
assert not (r/'preview.png').exists()
bg.convert('RGB').save(r/'preview.png')
with (r.parent/'STATUS.md').open('a',encoding='utf8') as f:
    f.write('\n## DOPUNA-9 - meni-tlo GOTOVO\nSacuvano meni/meni-tlo.png, 1800x560 RGBA sa providnom pozadinom; stenovita izbočina, trava i jesenje zbunje, topla magla. Jedan pokusaj ugradjenim image_gen, referenca dist/assets/gorge.png. Kompozitni pregled meni/preview.png, prompt u meni/prompt.json. Proverene dimenzije i alfa kanal.\n')
print('Saved meni-tlo.png 1800x560 RGBA; preview.png; STATUS appended')
