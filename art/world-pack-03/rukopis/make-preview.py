from PIL import Image, ImageOps
from pathlib import Path
import json,sys,math
root=Path(__file__).resolve().parent
if len(sys.argv)>1: root=root/'minijature'
jobs=json.loads((root/'prompts.json').read_text(encoding='utf8'))['jobs']
files=[root/(j['id']+'.png') for j in jobs]
assert all(p.exists() for p in files)
out=root/'preview.png'; assert not out.exists()
cols=4; cell=384
board=Image.new('RGB',(cols*cell,math.ceil(len(files)/cols)*cell),(234,222,192))
for i,p in enumerate(files):
    im=Image.open(p).convert('RGBA'); im.thumbnail((cell-24,cell-24),Image.Resampling.LANCZOS)
    board.paste(im,((i%cols)*cell+(cell-im.width)//2,(i//cols)*cell+(cell-im.height)//2),im)
board.save(out)
print(str(out))
