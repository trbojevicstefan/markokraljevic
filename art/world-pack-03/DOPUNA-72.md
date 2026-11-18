# Dopuna 72 (od Claude-a, 18. 11.): strah i beg, drugi put (štitonoša, palikuća, tufekdžija) i bačeno oružje

Stefan je pogledao zamisao iz DOPUNA-68 i rekao: „kada su u strahu i beže moraju da bace oružje i da dignu ruke uvis i beže sa otvorenim i uplašenim ustima i izbečenim očima, pomalo karikaturistično”.

Zato se oba klipa tri čoveka crtaju ponovo, pod ISTIM imenima kao u D68 (`<tip>-uplasen`, `<tip>-bezi`). Stare foldere tih šest klipova u `art/animation-pack-04/assets/` zameni novim (staro premesti u `art/animation-pack-04/sources/<klip>/d68-staro/`). **Psa ne diraj** (`pas-uplasen` i `pas-bezi` ostaju).

Status piši u `art/world-pack-03/STATUS-D72.md` (napravi ga), red posle SVAKOG klipa, sa oznakom `D72`.

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, druge `STATUS-*` fajlove, tuđe foldere klipova (osim šest navedenih), git. Paralelno rade druge Codex sesije (D71, D73): ne diraj njihove fajlove; svoje skripte zovi `export-dopuna72.py` i `verify-dopuna72.py`.

## Uzori (`art/world-pack-03/uzori-d72/`)

Za svaki tip `<tip>` (`shield`, `palikuca`, `tufekdzija`):
- `<tip>-idle-kadar0.png`: lik kako stoji u igri, ćelija 512×512, stopala na y=488, gleda udesno. **Uzor lika i veličine.** Visine: shield 454 px, palikuca 464 px (sa bakljom; telo oko 400 px), tufekdzija 417 px.
- `pokret-<tip>-run.png`: njegov trk (uzor za noge i odeću u trku).

Svaki klip čoveka je **uređivanje kadra 0 tog lika** (`image_gen` sa `<tip>-idle-kadar0.png` kao ulazom): isti čovek, ista odeća i boje, ista veličina tela (±5 %; visina se meri od stopala do temena, bez podignutih ruku).

## Izraz (važno)

Pomalo karikaturalno, kao u crtanom filmu, ali isti rukopis i isti lik:
- **oči izbečene**, okrugle, beonjače se vide svuda oko zenice;
- **usta širom otvorena** u kriku, vide se zubi;
- obrve visoko, turban ili kapa mu se nakrivila.

## Pravila (ista kao u `DOPUNA-65.md`)

- Ćelija 512×512, sigurna margina 24 px, providna pozadina, bez teksta, tla i senke. Podignute ruke moraju stati u ćeliju.
- Jedan `image_gen` poziv crta mrežu (3×2 za 6 kadrova, 4×2 za 8) na ravnoj jarko zelenoj #00ff00; iseci polja, skini zelenu, svaki kadar u svoju ćeliju.
- Stopala na y=488; lik na istom mestu u ćeliji u svim kadrovima (trči u mestu).
- Klip ide u `art/animation-pack-04/assets/<klip>/`: `atlas.png`, `manifest.json` sa `frame_layout`, `frames/motion/frame-N.png`, `preview.gif`, `qa.json`, `identity-size-comparison.png`. JSON bez BOM-a, ASCII opisi. Radni fajlovi u `art/animation-pack-04/sources/<klip>/attempt-N/`.
- Postupak: `art/world-pack-03/export-dopuna68.py` i `verify-dopuna68.py` (ili `-65`), prilagođeni za D72.
- Najviše tri pokušaja po klipu. Ako ni treći ne valja, NE izvozi (tada vrati stari folder iz `d68-staro`).

## Klipovi (redom)

| Klip | Kadrova | Petlja | Šta se vidi |
|---|---|---|---|
| `<tip>-uplasen` | 6 | ne | Uplaši se i baci oružje. 0: stoji kao na uzoru; 1: trgne se, oči se izbeče, usta se otvore; 2: **baca oružje od sebe** (ispada mu iz ruku i vidi se u vazduhu ispred njega, pada); 3: oružja više nema u rukama, **obe ruke diže uvis**; 4: ruke visoko iznad glave, dlanovi otvoreni, kolena mu klecaju, lice ka nama u kriku; 5: okreće se da beži udesno, ruke i dalje uvis. Šta baca: štitonoša štit i sablju; palikuća baklju (pada i gasi se); tufekdžija pušku. |
| `<tip>-bezi` | 8 | da | Beži **udesno** (noge kao u `pokret-<tip>-run.png`), **bez oružja, obe ruke visoko podignute iznad glave** i mlataraju, a glavu je okrenuo unazad ka nama preko ramena: izbečene oči, širom otvorena usta. Telo nagnuto napred, peševi lete za njim. Kadar 7 se pretapa u 0. |
| `oruzje-na-zemlji` | 7 | ne | BEZ ljudi: sedam ćelija, u svakoj jedno bačeno oružje kako leži na zemlji (dno predmeta na y=488, predmet na sredini ćelije, u veličini u kojoj ga likovi nose na uzorima): 0 turska sablja; 1 luk; 2 dve ukrštene sablje; 3 koplje sa crvenim barjačićem i okrugao štit preko njega; 4 veliki okrugao bronzani štit i sablja; 5 ugašena baklja iz koje se još dimi; 6 duga puška. Rukopis kao oružje na uzorima likova. Ovo nije animacija: svaka ćelija je druga stvar. |

Ukupno 7 stavki: `shield-uplasen`, `shield-bezi`, `palikuca-uplasen`, `palikuca-bezi`, `tufekdzija-uplasen`, `tufekdzija-bezi`, `oruzje-na-zemlji`.
