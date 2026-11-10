from pathlib import Path
from PIL import Image
import json,sys,shutil,hashlib,numpy as np
w=Path(__file__).resolve().parent;root=w.parents[1];name,source=sys.argv[1:3]
j=next(j for j in json.loads((w/'prompts-dopuna32.json').read_text())['jobs'] if j['id']==name)
run=w/'sources/dopuna32'/name;run.mkdir(parents=True,exist_ok=True);raw=run/'generated.png';assert not raw.exists();shutil.copy2(source,raw)
im=Image.open(raw).convert('RGBA');assert im.getchannel('A').getextrema()[0]==0
if j['kind']=='layer':
 out=w.parent/'world-pack-01/assets'/(name+'.png');old=Image.open(out).convert('RGBA');size=old.size
 im=im.resize(size,Image.Resampling.LANCZOS)
 # Keep all previously transparent holes clear after canvas registration.
 alpha=np.minimum(np.array(im.getchannel('A')),np.array(old.getchannel('A')));im.putalpha(Image.fromarray(alpha))
 backup=w.parent/'world-pack-01/staro'/(name+'.png');assert out.resolve().is_relative_to(root.resolve()) and backup.resolve().is_relative_to(root.resolve())
 assert not backup.exists(),'Never overwrite archived original';backup.parent.mkdir(parents=True,exist_ok=True)
 oldhash=hashlib.sha256(out.read_bytes()).hexdigest();out.replace(backup);assert hashlib.sha256(backup.read_bytes()).hexdigest()==oldhash
 im.save(out);assert np.all(np.array(im.getchannel('A'))[np.array(old.getchannel('A'))==0]==0)
 (run/'qa.json').write_text(json.dumps({'size':size,'oldSha256':oldhash,'oldFile':str(backup.relative_to(root)),'originalTransparentPixelsPreserved':True},indent=2))
 message=f'nov sloj{size[0]}x{size[1]} u art/world-pack-01/assets/{name}.png; original premesten u art/world-pack-01/staro/{name}.png (SHA256 potvrda); originalni providni otvori sacuvani. Bure cilj do '+('80px near.' if '-near' in name else '48px mid.')
else:
 out=w/(name+'.png');assert not out.exists();b=im.getchannel('A').point(lambda v:255 if v>16 else 0).getbbox();im=im.crop(b);size=tuple(j['size']);im.thumbnail((size[0]-24,size[1]-40),Image.Resampling.LANCZOS)
 final=Image.new('RGBA',size);final.paste(im,((size[0]-im.width)//2,size[1]-24-im.height));final.save(out);im=final
 message=f'PNG RGBA{size[0]}x{size[1]}, tamna udaljena silueta bez krvavih detalja, oslonac dole u sredini y{size[1]-25}, art/world-pack-03/{name}.png.'
with (w/'STATUS-ANIMACIJE.md').open('a',encoding='utf8') as f:f.write(f'\nDOPUNA-32: {name} — GOTOVO; {message} Ugradjeni image_gen; prompts-dopuna32.json; izvor sources/dopuna32/{name}/.\n')
print('Saved and logged:',name)
