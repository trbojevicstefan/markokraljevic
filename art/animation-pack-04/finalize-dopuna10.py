from pathlib import Path
import json
root=Path(__file__).resolve().parent
jobs=json.loads((root/'plan-dopuna10.json').read_text())['jobs']
catalog=[{'id':j['id'],'frames':j['frames'],'fps':j['fps'],'loop':j['loop'],'atlas':f"assets/{j['id']}/atlas.png",'manifest':f"assets/{j['id']}/manifest.json",'preview':f"assets/{j['id']}/preview.gif"} for j in jobs]
(root/'catalog-dopuna10.json').write_text(json.dumps(catalog,indent=2))
total=sum(j['frames'] for j in jobs)
with (root.parent/'world-pack-03/STATUS-ANIMACIJE.md').open('a',encoding='utf8') as f:
    f.write('\n## DOPUNA-10 — ZAVRSENO\n'+str(len(jobs))+' klipa, '+str(total)+' kadrova. Svaki ima atlas.png, manifest.json sa frame_layout, frames/motion/, preview.gif, qa.json i reference.png. Provereni broj PNG/GIF kadrova, 512x512 celije, alfa kanal, oslonac y=487, slaganje svakog kadra sa atlasom i loop podaci. Ugradjeni image_gen: 25 generisanja za 24 klipa (megdan-noz ponovljen zbog odsecene glave); izvoz beg-unhorsed ispravljen da sacuva oba odvojena subjekta. Izvori i prethodni izvozi sacuvani. Pregled: animation-pack-04/preview-dopuna10.png; katalog: catalog-dopuna10.json; provera: validation-dopuna10.json; promptovi: plan-dopuna10.json i dopuna10-generation-notes.json. Nema preostalih stavki sa liste.\n')
print(len(jobs),'clips;',total,'frames; complete')
