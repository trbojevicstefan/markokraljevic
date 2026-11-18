# Dopuna 91 (od Claude-a, 18. 11.): ljudi Manastirskog visa i Oranja

Stefan (18. 11.): „pojačaj animacije … ljude i asete za svaki nivo”.

Na Manastirskom visu nema kaluđera koji nešto rade, a u Oranju u njivama nema nikoga osim volova. Prave se ljudi koji rade svoj posao dok Marko prolazi.

Status piši u `art/world-pack-03/STATUS-D91.md` (napravi ga), red posle SVAKE stavke, sa oznakom `D91`.

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, druge `STATUS-*` fajlove, tuđe foldere klipova, git, fajlove `*dopuna41*`. Paralelno rade druge Codex sesije (D87–D90, D92): ne diraj njihove fajlove.

## Uzori (`art/world-pack-03/uzori-d91/`)

- `putnik-kaluder-idle-kadar0.png`: **kaluđer** iz igre, ćelija 512×512, stopala na y=488, visok 401 px. Crna ryasa i kamilavka, sedobrad, brojanica. **Uzor lika i veličine za oba kaluđerska klipa.** `pokret-putnik-kaluder-walk.png`: kako hoda.
- `putnica-idle-kadar0.png`: **žena** iz igre, visoka 407 px: uzor rukopisa, mere i lica za žetelicu (ali obučena za njivu, vidi dole). `pokret-putnica-walk.png`: kako hoda.
- `seljak-idle-kadar0.png`: **seljak** iz igre, visok 340 px: uzor lika i veličine za kosca. `pokret-seljak-klice.png`.
- `marko-idle-2-kadar0.png`: Marko u istoj meri (383 px), da ljudi ne ispadnu veći od njega.

## Pravila (ista kao u `DOPUNA-76.md`)

- Ćelija 512×512, sigurna margina 24 px, providna pozadina, bez teksta, tla, senke, zvezdica i efekata. Alat (srp, kosa, uže) mora stati u ćeliju.
- Jedan `image_gen` poziv crta mrežu (3×2 za 6 kadrova, 4×2 za 8) na ravnoj jarko zelenoj #00ff00; iseci polja, skini zelenu, svaki kadar u svoju ćeliju. U izvozu ne sme ostati okvir ćelije ni linije mreže, ni komad susednog kadra. (Ako je u kadru mnogo zelenog, crtaj na ljubičastoj #ff00ff.)
- Stopala na y=488; lik na istom mestu u ćeliji u svim kadrovima; gleda udesno.
- Klip ide u `art/animation-pack-04/assets/<klip>/`: `atlas.png`, `manifest.json` sa `frame_layout`, `frames/motion/frame-N.png`, `preview.gif`, `qa.json`, `identity-size-comparison.png`. JSON bez BOM-a. Radni fajlovi u `art/animation-pack-04/sources/<klip>/attempt-N/`.
- Postupak: `art/world-pack-03/export-dopuna76.py` i `verify-dopuna76.py`, prilagođeni (svoje kopije zovi `export-dopuna91.py` i `verify-dopuna91.py`).
- Visinu uspravnog kadra **izmeri** i uporedi sa uzorom (±5 %). Najviše tri pokušaja po klipu; ako ni treći ne valja, NE izvozi. Pre izvoza napravi tablu svih kadrova pored uzora u istoj razmeri i pogledaj je: lik isti, ništa isečeno ivicom.
- Kaluđerski klipovi su **uređivanje** `putnik-kaluder-idle-kadar0.png`; kosac je uređivanje `seljak-idle-kadar0.png`. Za žetelicu prvo napravi `zetelica-zanje` po uzoru `putnica-idle-kadar0.png` (ista mera i rukopis), pa njen kadar 0 koristi kao uzor lika za `zetelica-nosi`.

## Klipovi (redom)

| Klip | Kadrova | Petlja | Šta se vidi |
|---|---|---|---|
| `putnik-kaluder-moli` | 6 | da | Kaluđer stoji i moli se: krsti se desnom rukom (čelo, grudi, desno rame, levo rame), pa se pokloni do pojasa i uspravi. Kadar 5 se pretapa u 0. |
| `putnik-kaluder-zvoni` | 8 | da | Kaluđer obema rukama vuče debelo konopče zvona koje visi odozgo (konopac ide od gornje ivice ćelije do njegovih ruku): povuče naniže i čučne malo, konopac ga povuče gore na prste, pa opet. Kadar 7 se pretapa u 0. |
| `zetelica-zanje` | 8 | da | Žetelica u njivi: bela lanena košulja sa crvenim vezom, tkana pregača, marama na glavi, bosa ili u opancima. Pogne se, levom rukom zahvati rukovet klasja (klasje se vidi samo u njenoj ruci), desnom srpom preseče, uspravi se i odloži rukovet iza sebe. Kadar 7 se pretapa u 0. |
| `zetelica-nosi` | 8 | da | Ista žetelica hoda udesno sa snopom žita na glavi, pridržava ga jednom rukom, druga ruka se njiše. Hod kao u `pokret-putnica-walk.png`. Kadar 7 se pretapa u 0. |
| `kosac-kosi` | 8 | da | Kosac (seljak iz uzora, šešir ili šubara, bela košulja, crven pojas) kosi kosom: zamah sleva nadesno nisko uz zemlju, korak napred, vraća kosu, opet zamah. Kosa (dugačak drveni kosište i zakrivljeno sečivo) cela u ćeliji. Kadar 7 se pretapa u 0. |
