from pathlib import Path
import json
R=Path(__file__).resolve().parent;A=R.parent/'animation-pack-04'
d=json.loads((R/'DELIVERY.json').read_text(encoding='utf8'))
groups='\n'.join(f"- Prioritet {g}: {d.get('group'+str(g),'pending')}." for g in range(1,8))
groups+='\n- Hitna DOPUNA-3: '+d.get('group8','pending')+'.'
block=('Generator je blokiran; obnova: '+str(d['quotaResetBelgrade'])+'.') if d.get('quotaResetBelgrade') else 'Nema prijavljene aktivne blokade generatora.'
(R/'README.md').write_text(f'''# Paket 03 — svet

Spremno je {d['worldAssetsReady']} elemenata sveta i {d['readyClips']} animacionih klipova / {d['readyFrames']} kadrova u susednom animation-pack-04. Katalog sadrži {d['catalogImages']} PNG slika, uključujući kadrove i preglede. Za najnoviji tok rada i odluke vidi STATUS.md; za tačan spisak nedostajućeg DELIVERY.json.

{groups}

Predmeti su providni PNG sa osnovom pri dnu platna. Lestve: 256×1024, stranice x=56/200, prečke 64+128n. Zidovi: 512×512, neprovidni, ponovljivi u oba smera. Stražarnica: deckY=341, deckX0=270, deckX1=684. Ispravljeno tlo Oranje: 1024×384, hodni rub y=64, sve iznad providno; završetak 192×384. Nema kuća, zidova ni ograda u traci tla. Dnevne pozadine nisu prepisivane pri pravljenju noćnih/olujnih varijanti.

catalog.json sadrži images: id, file (relativna putanja), size, bounds (desno/dole isključivo), kind i group, uz seamCheck / walkY / deck podatke gde treba. Pregledi: cuda-preview.png, razbi-preview.png, oranje-tlo-preview.png i oranje-varijante-preview.png.

Slike su nacrtane ugrađenim Imagegen generatorom. Tačni zahtevi su u plan-g*.json i *prompts.json. Plan nije dokaz da je slika gotova: samo postojeći fajlovi u katalogu su isporučeni. sources/ i cleaned/ su ignorisani za git. Izvoz priprema dimenzije, alfa kanal i spojeve; provera proverava stvarne fajlove i broj kadrova. {block}

Kod igre i dist/ nisu deo ove isporuke. Ranije slike nisu menjane osim izričito tražene ispravke dva komada tla. Međaš je obrađena kopija ranijeg putokaza; original ostaje netaknut.
''',encoding='utf8')
clips=json.loads((A/'catalog.json').read_text(encoding='utf8'))
rows='\n'.join(f"| {c['id']} | {c['frames']} | {c['fps']} | {'da' if c['loop'] else 'ne'} |" for c in clips)
(A/'README.md').write_text(f'''# Animacije — paket 04

Gotovo: {len(clips)} klipova / {sum(c['frames'] for c in clips)} kadrova. Stvarni gotovi klipovi su navedeni ispod i u catalog.json. Spisak preostalog i stanje generatora: ../world-pack-03/STATUS.md i DELIVERY.json.

U assets/<klip>/ su atlas.png, manifest.json, frames/motion/, preview.gif, reference.png i qa.json. Ćelije su 512×512, a volovi koriste 1024×512. Donja linija sadržaja je y=487. Veličina se vezuje za postojeći idle istog lika, uz prostor za oružje. Preview.png poredi prve kadrove sa ranijim likovima. Nove baze kopljanika, psa, tufekdžije i volova su u odgovarajućim assets/<lik>/base-source.png.

Izvoz: sprite-gen extract → compose-atlas → compose-gif. Mreže se pre ekstrakcije preslažu u red. Penjanje Marka ima četiri dodatne poze za smenu ruku; trkovi kopljanika i tufekdžije su precrtani radi različitih faza nogu. Opisi su u plan-g*.json i *prompts.json. sources/ ne ide u git. GIF se ponavlja radi pregleda; u igri koristiti loop i fps iz manifesta. Marko-kick se isporučuje samo jednom.

| Klip | Kadrovi | FPS | Petlja |
|---|---:|---:|---|
{rows}
''',encoding='utf8')
print('Updated delivery documentation from actual catalog.')
