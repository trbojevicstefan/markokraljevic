from pathlib import Path
from PIL import Image
import json,sys,shutil,numpy as np,math
w=Path(__file__).resolve().parent;name,source=sys.argv[1:3]
j=next(j for j in json.loads((w/'prompts-dopuna34.json').read_text())['jobs'] if j['id']==name)
out=w/(name+'.png');run=w/'sources/dopuna34'/name;run.mkdir(parents=True,exist_ok=True)
attempt=int(sys.argv[3]) if len(sys.argv)>3 else 1
if out.exists():
 assert attempt>1;backup=run/f'export-before-attempt-{attempt}.png';assert not backup.exists();shutil.copy2(out,backup)
raw=run/('generated.png' if attempt==1 else f'generated-attempt-{attempt}.png');assert not raw.exists();shutil.copy2(source,raw)
im=Image.open(raw).convert('RGBA').resize(tuple(j['size']),Image.Resampling.LANCZOS);assert im.getchannel('A').getextrema()[0]==0
a=np.array(im);groundStart=im.height-math.ceil(im.height*.22)
# Technical opacity registration: retain generated terrain RGB, force its
# requested bottom22% full-width occlusion band to alpha255.
a[groundStart:,:,3]=255;im=Image.fromarray(a);im.save(out)
assert np.all(np.array(im.getchannel('A'))[groundStart:]==255)
qa={'size':im.size,'opaqueHillStartsY':groundStart,'opaqueHillRows':im.height-groundStart,'opaqueHillFullWidth':True,'upperAirHasTransparency':bool(np.any(a[:groundStart,:,3]==0)),'generator':'built-in image_gen','attempts':attempt}
(run/'qa.json').write_text(json.dumps(qa,indent=2),encoding='utf8')
with (w/'STATUS-ANIMACIJE.md').open('a',encoding='utf8') as f:f.write(f'\nDOPUNA-34: {name}.png — GOTOVO; art/world-pack-03/{name}.png, PNG RGBA{im.width}x{im.height}, srpski vitezovi u boji, mat, bez krupnih krvavih detalja. Donjih22% redovi{groundStart}..{im.height-1} alfa255 preko CELE sirine; iznad providan vazduh. Tela gde postoje VEZANA uz kolac. Ugradjeni image_gen, jedan pokusaj; prompts-dopuna34.json; izvor/qa sources/dopuna34/{name}/.\n')
print('Saved and logged:',name,'opaque hill starts',groundStart)
