from pathlib import Path
from PIL import Image, ImageDraw
import json, sys, shutil, numpy as np
ROOT=Path(__file__).resolve().parent
jobs=json.loads((ROOT/'prompts.json').read_text(encoding='utf8'))['jobs']
if len(sys.argv)>2:
    name,source=sys.argv[1:3]; j=next(x for x in jobs if x['id']==name)
    out=ROOT/(name+'.png'); assert not out.exists(), 'Existing deliverable preserved: '+str(out)
    sources=ROOT/'sources'; sources.mkdir(exist_ok=True)
    raw=sources/(name+'.png'); assert not raw.exists(), 'Existing source preserved: '+str(raw)
    shutil.copy2(source,raw); im=Image.open(raw).convert('RGBA'); size=tuple(j['size'])
    if j['alpha']:
        alpha=im.getchannel('A'); assert alpha.getextrema()[0]==0, 'Missing native alpha'
        box=alpha.point(lambda a:255 if a>16 else 0).getbbox(); ob=im.crop(box)
        ob.thumbnail((size[0]-8,size[1]-8),Image.Resampling.LANCZOS)
        im=Image.new('RGBA',size); im.alpha_composite(ob,((size[0]-ob.width)//2,(size[1]-ob.height)//2))
    else:
        im=im.resize(size,Image.Resampling.LANCZOS); bg=Image.new('RGBA',size,(229,211,173,255)); bg.alpha_composite(im); im=bg
    if name=='rukopis-pergament':
        a=np.array(im).astype(float)
        for axis in (0,1):
            b=np.swapaxes(a,0,axis)
            for d in range(24):
                weight=(1+np.cos(np.pi*d/24))/2; mean=(b[d]+b[-1-d])/2
                b[d]=b[d]*(1-weight)+mean*weight; b[-1-d]=b[-1-d]*(1-weight)+mean*weight
        im=Image.fromarray(np.rint(a).astype('uint8'))
    im.save(out)
    a=np.array(im); data={'id':name,'size':list(im.size),'transparent':j['alpha'],'alphaZeroPixels':int((a[:,:,3]==0).sum()),'bounds':im.getchannel('A').getbbox()}
    if name=='rukopis-pergament':
        data['horizontalSeamMax']=int(np.abs(a[:,0].astype(int)-a[:,-1]).max()); data['verticalSeamMax']=int(np.abs(a[0].astype(int)-a[-1]).max())
        assert data['horizontalSeamMax']==0 and data['verticalSeamMax']==0
    records=ROOT/'validation.json'; report=json.loads(records.read_text()) if records.exists() else {}; report[name]=data; records.write_text(json.dumps(report,indent=2),encoding='utf8')
    with (ROOT.parent/'STATUS.md').open('a',encoding='utf8') as f:
        f.write('\n## DOPUNA-6 - '+name+' GOTOVO\nPNG '+str(size[0])+'x'+str(size[1])+', '+('providna pozadina' if j['alpha'] else 'neprovidna podloga')+'. Sacuvan u rukopis/'+name+'.png; izvor u rukopis/sources/. Ugradjeni image_gen; prompt sacuvan u rukopis/prompts.json. Proverene dimenzije i alfa kanal.'+(' Horizontalni i vertikalni spoj: 0 razlike.' if name=='rukopis-pergament' else '')+'\n')
    print(json.dumps(data))
