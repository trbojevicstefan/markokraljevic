from pathlib import Path
from PIL import Image
import sys,json,shutil
root=Path(__file__).resolve().parent
name,source=sys.argv[1:3];j=next(j for j in json.loads((root/'dopuna12-props-prompts.json').read_text())['jobs'] if j['id']==name)
out=root/(name+'.png');assert not out.exists(),'Existing art preserved'
src=root/'sources/dopuna12-props';src.mkdir(parents=True,exist_ok=True)
raw=src/(name+'.png');assert not raw.exists();shutil.copy2(source,raw)
im=Image.open(raw).convert('RGBA');assert im.getchannel('A').getextrema()[0]==0,'Missing native transparency'
if j.get('kind')=='obstacle':
    box=im.getchannel('A').point(lambda a:255 if a>16 else 0).getbbox();im=im.crop(box);im.thumbnail((j['size'][0]-16,j['size'][1]-16),Image.Resampling.LANCZOS)
    canvas=Image.new('RGBA',tuple(j['size']));canvas.alpha_composite(im,((canvas.width-im.width)//2,canvas.height-im.height));im=canvas
elif j['id']=='most-vila-segment':
    im=im.crop(im.getchannel('A').point(lambda a:255 if a>16 else 0).getbbox());im=im.resize(tuple(j['size']),Image.Resampling.LANCZOS)
    import numpy as np
    pixels=np.array(im)
    for k in range(24):
        blend=(1+np.cos(np.pi*k/24))/2;left=pixels[:,k].astype(float);right=pixels[:,-1-k].astype(float);mean=(left+right)/2
        pixels[:,k]=np.rint(left*(1-blend)+mean*blend).astype('uint8');pixels[:,-1-k]=np.rint(right*(1-blend)+mean*blend).astype('uint8')
    im=Image.fromarray(pixels)
else:
    im.thumbnail(tuple(j['size']),Image.Resampling.LANCZOS)
    canvas=Image.new('RGBA',tuple(j['size']));canvas.alpha_composite(im,((canvas.width-im.width)//2,(canvas.height-im.height)//2));im=canvas
im.save(out)
a=im.getchannel('A');record={'file':out.name,'size':im.size,'alphaExtrema':a.getextrema(),'transparentPixels':a.histogram()[0],'bounds':a.getbbox()}
rep=root/'validation-dopuna12-props.json';records=json.loads(rep.read_text()) if rep.exists() else {};records[name]=record;rep.write_text(json.dumps(records,indent=2))
with (root/'STATUS-ANIMACIJE.md').open('a',encoding='utf8') as f:f.write('\nDOPUNA-12: '+out.name+' — GOTOVO; PNG '+str(im.width)+'x'+str(im.height)+' sa izvornom providnoscu u art/world-pack-03/. Proveren alfa kanal. Prompt: dopuna12-props-prompts.json; izvor: sources/dopuna12-props/.\n')
print('Delivered and logged:',out.name)
