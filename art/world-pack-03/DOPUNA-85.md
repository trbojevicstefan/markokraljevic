# Dopuna 85 (od Claude-a, 18. 11.): strelac i oklopnik u tvrđavi, trnje Miroča

Stefan (18. 11.): „naručuj od Codexa sve što ti treba za naredna tri nivoa; potrebne su nam sve animacije”.

U Opsednutoj tvrđavi strelci se penju uz lestve na bedeme, a oklopnik nema običan udarac (ima samo tresak). U Ravijojlinoj šumi vila bere bilje preko trnja, koje se sada crta kodom.

Status piši u `art/world-pack-03/STATUS-D85.md` (napravi ga), red posle SVAKE stavke, sa oznakom `D85`.

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, druge `STATUS-*` fajlove, tuđe foldere klipova, git, fajlove `*dopuna41*`. Paralelno rade druge Codex sesije (D81–D85): ne diraj njihove fajlove.

## Uzori (`art/world-pack-03/uzori-d85/`)

- `archer-idle-kadar0.png`: **strelac**, ćelija 512×512, stopala na y=488, gleda udesno, visok 456 px. Crvena kapa sa belim turbanom, žuto-plava dolama, tobolac sa strelama na leđima, luk u levoj ruci, strela u desnoj. **Uzor lika i veličine za `archer-climb`.**
- `oklopnik-idle-kadar0.png`: **oklopnik**, ista ćelija, visok 428 px. Šlem sa verižnjačom, ljuskast zlatni oklop, crvena prošivena dolama, ratni čekić preko ramena, okrugao štit. **Uzor lika i veličine za `oklopnik-attack`.**
- `pokret-sword-climb.png`: kako se u igri penje janičar (uzor POKRETA). `pokret-archer-run.png`, `pokret-archer-jump.png`, `pokret-oklopnik-slam.png`, `-walk.png`, `-grab.png`: isti likovi u pokretima koje već imaju.

## Pravila (ista kao u `DOPUNA-76.md`)

- Ćelija 512×512, sigurna margina 24 px, providna pozadina, bez teksta, tla, senke, zvezdica i efekata. Oružje mora stati u ćeliju (ako treba, ukoso ili uspravno).
- Jedan `image_gen` poziv crta mrežu (3×2 za 6 kadrova, 4×2 za 8) na ravnoj jarko zelenoj #00ff00; iseci polja, skini zelenu, svaki kadar u svoju ćeliju. U izvozu ne sme ostati okvir ćelije ni linije mreže, ni komad susednog kadra.
- Stopala na y=488 (osim u skoku); lik na istom mestu u ćeliji u svim kadrovima.
- Klip ide u `art/animation-pack-04/assets/<klip>/`: `atlas.png`, `manifest.json` sa `frame_layout`, `frames/motion/frame-N.png`, `preview.gif`, `qa.json`, `identity-size-comparison.png`. JSON bez BOM-a. Radni fajlovi u `art/animation-pack-04/sources/<klip>/attempt-N/`.
- Postupak: `art/world-pack-03/export-dopuna76.py` i `verify-dopuna76.py`, prilagođeni (svoje kopije zovi `export-dopuna85.py` i `verify-dopuna85.py`).
- Visinu uspravnog kadra **izmeri** i uporedi sa uzorom (456 za strelca, 428 za oklopnika px, ±5 %). Najviše tri pokušaja po klipu; ako ni treći ne valja, NE izvozi.
- Svaki klip je **uređivanje uzora** `archer-idle-kadar0.png (za strelca) i oklopnik-idle-kadar0.png (za oklopnika)` (`image_gen` sa tim kadrom kao ulazom): isti čovek, ista odeća i oružje, isto lice, ista veličina tela.

## Deo 2: trnje (slika 1536×1024, providna pozadina, `art/world-pack-03/prop-trnje.png`)

Crta se na ravnoj **jarko ljubičastoj #ff00ff** pozadini (zelena bi pojela lišće) i ključ skida ljubičastu. Posle skidanja pogledaj sliku na plavoj I na beloj podlozi: ne sme ostati ljubičast rub, a u predmetu ne sme biti rupica. Uzor rukopisa, boja i svetla su `stil-prop-zbun.png`, `stil-prop-paprat.png`, `stil-prop-korenje.png` (topla svetlost sleva, slikano, mat, jasna tamna kontura). Predmet gledan sa strane, zauzima skoro ceo okvir, donja ivica leži na dnu okvira; bez tla, senke, ljudi i teksta. Najviše tri pokušaja.

| Ime | Šta se vidi |
|---|---|
| `prop-trnje` | Gust, nizak i širok grm kupine i gloga na planini: isprepletene tamne grane pune oštrog trnja, nešto zelenog i crvenkastog lišća, po neka crna kupina i crven glog. Grane štrče na sve strane, kao zid od trnja. Tri puta širi nego visok. |

## Klipovi (redom)

| Klip | Kadrova | Petlja | Šta se vidi |
|---|---|---|---|
| `archer-climb` | 8 | da | Penje se uz lestve kao janičar u `pokret-sword-climb.png` (lestve se NE crtaju): okrenut leđima ka nama, ruke i noge naizmenično hvataju prečke iznad, luk preko leđa uz tobolac. Kadar 7 se pretapa u 0. |
| `oklopnik-attack` | 6 | ne | Udarac čekićem napred (vodoravno, nije tresak o zemlju). 0: stoji; 1: štit napred, čekić povučen unazad preko ramena; 2: široko zamahne udesno u visini grudi; 3: čekić ispružen napred na kraju zamaha; 4: telo ide za zamahom; 5: vraća se u stav. |
