from pathlib import Path
from PIL import Image
import json
root=Path(__file__).resolve().parent
plan=json.loads((root/'plan.json').read_text(encoding='utf8'))
assets=[]
for job in plan['jobs']:
    p=root/'assets'/f"{job['id']}.png"
    if not p.exists(): continue
    im=Image.open(p)
    alpha=im.getchannel('A') if im.mode=='RGBA' else None
    assets.append({**{k:v for k,v in job.items() if k!='prompt'},'file':f'assets/{p.name}','width':im.width,'height':im.height,'hasTransparency':bool(alpha and alpha.getextrema()[0]<255),'bounds':alpha.getbbox() if alpha else [0,0,im.width,im.height]})
levels=[]
for n,(theme,title,scene,palette) in enumerate(plan['themes']):
    platforms=[]
    for i in range(12):
        x=i*520
        platforms.append({'x':x,'y':590,'w':400 if i%3 else 460,'h':180,'kind':'stone'})
        if i%2==1: platforms.append({'x':x+130,'y':450-(i%3)*25,'w':170,'h':28,'kind':'stone'})
    props=[{'id':'prop-barjak-srpski','x':150,'y':590,'height':175},{'id':'prop-barjak-srpski','x':6100,'y':590,'height':175}]
    themed=[['prop-taraba-ravna','prop-kuca','prop-bunar','prop-ambar','prop-kola'],['prop-stena-visoka','prop-most-drveni','prop-stena-luk','prop-trska'],['prop-drvo-hrast','prop-panj','prop-svetiliste','prop-run-kamen','prop-cvece'],['prop-ograda-manastir','prop-barjak-manastir','prop-kapija-tvrdjava','prop-krcag'],['prop-palisada','prop-sator','prop-strassarnica','prop-kapija-tvrdjava','prop-sanduci'],['prop-drvo-sneg','prop-platforma-sneg','prop-stena-visoka','prop-balvan']][n]
    for i in range(18): props.append({'id':themed[i%len(themed)],'x':300+i*320,'y':590,'height':[140,240,180,125][i%4]})
    levels.append({'id':theme,'name':title,'width':6240,'spawn':{'x':80,'y':590},'goal':{'x':6100,'y':590},'palette':palette,'layers':[{'id':f'{theme}-{layer}','speed':speed} for layer,speed in [('sky',.04),('far',.16),('mid',.38),('near',.72)]],'platforms':platforms,'props':props,'status':'environment layout, not integrated into campaign'})
(root/'levels.json').write_text(json.dumps(levels,ensure_ascii=False,indent=2),encoding='utf8')
(root/'catalog.json').write_text(json.dumps(assets,ensure_ascii=False,indent=2),encoding='utf8')
(root/'catalog.js').write_text('const WORLD = '+json.dumps({'assets':assets,'levels':levels},ensure_ascii=False)+';',encoding='utf8')
warnings=[a['id'] for a in assets if a['alpha'] and not a['hasTransparency']]
(root/'qa.json').write_text(json.dumps({'images':len(assets),'transparentRequestedButOpaque':warnings,'sizes':{a['id']:[a['width'],a['height']] for a in assets}},indent=2),encoding='utf8')
print('Catalog:',len(assets),'images; transparency warnings:',warnings)
