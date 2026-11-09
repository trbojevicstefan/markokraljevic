from pathlib import Path
from PIL import Image
import sys,json,shutil
root=Path(__file__).resolve().parent
name,source=sys.argv[1:3];j=next(j for j in json.loads((root/'dopuna11-props-prompts.json').read_text())['jobs'] if j['id']==name)
out=root/(name+'.png');assert not out.exists(),'Existing art preserved'
src=root/'sources/dopuna11-props';src.mkdir(parents=True,exist_ok=True)
raw=src/(name+'.png');assert not raw.exists();shutil.copy2(source,raw)
im=Image.open(raw).convert('RGBA');assert im.getchannel('A').getextrema()[0]==0,'Missing native transparency'
im=im.resize(tuple(j['size']),Image.Resampling.LANCZOS);im.save(out)
a=im.getchannel('A');record={'file':out.name,'size':im.size,'alphaExtrema':a.getextrema(),'transparentPixels':a.histogram()[0],'bounds':a.getbbox()}
rep=root/'validation-dopuna11-props.json';records=json.loads(rep.read_text()) if rep.exists() else {};records[name]=record;rep.write_text(json.dumps(records,indent=2))
with (root/'STATUS-ANIMACIJE.md').open('a',encoding='utf8') as f:f.write('\nDOPUNA-11: '+out.name+' — GOTOVO; PNG 1024x1024 sa izvornom providnoscu u art/world-pack-03/. Proveren alfa kanal. Prompt: dopuna11-props-prompts.json; izvor: sources/dopuna11-props/.\n')
print('Delivered and logged:',out.name)
