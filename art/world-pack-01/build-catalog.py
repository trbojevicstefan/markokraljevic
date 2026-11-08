from pathlib import Path
from PIL import Image
import json
root=Path(__file__).resolve().parent
plan=json.loads((root/'plan.json').read_text(encoding='utf8'))
for supplement in sorted(root.glob('extra-plan*.json')): plan['jobs']+=json.loads(supplement.read_text(encoding='utf8'))
if (root/'extra-themes.json').exists(): plan['themes']+=json.loads((root/'extra-themes.json').read_text(encoding='utf8'))
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
        base_y=590 if n in [0,1,5] else 590-((i+n)%3)*30
        width=[440,360,390,415,400,420][n%6]+(20 if i%3==0 else 0)
        platforms.append({'x':x,'y':base_y,'w':width,'h':180,'kind':'stone'})
        if i%2==1 or n==2: platforms.append({'x':x+130,'y':450-(i%3)*25-n*5,'w':170,'h':28,'kind':'stone'})
        if n in [3,4] and i%3==0: platforms.append({'x':x+220,'y':320,'w':160,'h':35,'kind':'stone'})
    props=[{'id':'prop-barjak-srpski','x':150,'y':590,'height':175},{'id':'prop-barjak-srpski','x':6100,'y':590,'height':175}]
    themed=[['prop-taraba-ravna','prop-kuca','prop-bunar','prop-ambar','prop-kola'],['prop-stena-visoka','prop-most-drveni','prop-stena-luk','prop-trska'],['prop-drvo-hrast','prop-panj','prop-svetiliste','prop-run-kamen','prop-cvece'],['prop-ograda-manastir','prop-barjak-manastir','prop-kapija-tvrdjava','prop-krcag'],['prop-palisada','prop-sator','prop-strassarnica','prop-kapija-tvrdjava','prop-sanduci'],['prop-drvo-sneg','prop-platforma-sneg','prop-stena-visoka','prop-balvan'],['prop-kristal','prop-stena-mala','prop-stena-luk','prop-run-kamen'],['prop-bure','prop-luk-kameni','prop-baklja-drzac','prop-krcag'],['prop-trska','prop-most-uzad','prop-korenje','prop-balvan'],['prop-lanac','prop-stena-visoka','prop-sanduci','prop-svetiljka'],['prop-luk-kameni','prop-loza','prop-ograda-kamen-rusevina'],['prop-mlin','prop-dok','prop-trska','prop-tocak-vodeni']][n]
    for i in range(18): props.append({'id':themed[i%len(themed)],'x':300+i*320,'y':590,'height':[140,240,180,125][i%4]})
    ground=[p for p in platforms if p['h']==180]
    for prop in props:
        surface=next((p for p in ground if p['x']<=prop['x']<=p['x']+p['w']),None)
        if surface is None:
            surface=min(ground,key=lambda p:abs(p['x']+p['w']/2-prop['x']))
            prop['x']=surface['x']+surface['w']/2
        prop['y']=surface['y']
    levels.append({'id':theme,'name':title,'width':6240,'spawn':{'x':80,'y':ground[0]['y']},'goal':{'x':6100,'y':ground[-1]['y']},'palette':palette,'layers':[{'id':f'{theme}-{layer}','speed':speed} for layer,speed in [('sky',.04),('far',.16),('mid',.38),('near',.72)]],'platforms':platforms,'props':props,'status':'environment layout, not integrated into campaign'})
for level in levels:
    level['nightLayers']=[{**layer,'id':layer['id']+'-night'} for layer in level['layers']]
    level['stormLayers']=[{**layer,'id':layer['id']+'-storm'} for layer in level['layers']]
    if (root/'level-briefs.json').exists():
        level['design']=json.loads((root/'level-briefs.json').read_text(encoding='utf8'))[level['id']]
        level['implementationStatus']='layout-only; objectives and movement features require game integration'
(root/'levels.json').write_text(json.dumps(levels,ensure_ascii=False,indent=2),encoding='utf8')
(root/'catalog.json').write_text(json.dumps(assets,ensure_ascii=False,indent=2),encoding='utf8')
available={a['id'] for a in assets}
sets=[]
for theme,*_ in plan['themes']:
    for suffix,variant in [('', 'day'),('-night','night'),('-storm','storm')]:
        layers=[f'{theme}-{layer}{suffix}' for layer in ['sky','far','mid','near']]
        sets.append({'theme':theme,'variant':variant,'layers':sum(i in available for i in layers),'vista':f'{theme}-vista{suffix}' in available})
summary={'images':len(assets),'props':sum(a['kind']=='prop' for a in assets),'backgrounds':sum(a['kind']!='prop' for a in assets),'layouts':len(levels),'sets':sets,'notGenerated':[j['id'] for j in plan['jobs'] if j['id'] not in available]}
(root/'summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding='utf8')
(root/'catalog.js').write_text('const WORLD = '+json.dumps({'assets':assets,'levels':levels,'summary':summary},ensure_ascii=False)+';',encoding='utf8')
warnings=[a['id'] for a in assets if a['alpha'] and not a['hasTransparency']]
(root/'qa.json').write_text(json.dumps({'images':len(assets),'transparentRequestedButOpaque':warnings,'sizes':{a['id']:[a['width'],a['height']] for a in assets}},indent=2),encoding='utf8')
print('Catalog:',len(assets),'images; transparency warnings:',warnings)
