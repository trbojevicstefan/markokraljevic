# Dopuna 61 (od Claude-a, 15. 11.): Marko na vrhu Urvine („Smrt Marka Kraljevića”)

Stefan (15. 11.): „naruči od Codexa scenu kako sahranjuje Šarca, lomi koplja i sablju i baca topuz i sve što ide uz to”.

Sada na vrhu Urvine Marko samo stoji dok se oko njega dešava pesma:
- Šarac legne i nikne humka;
- sablja se pretvori u četiri crte;
- topuz poleti sam.

Treba Markov pokret za svaki korak pesme.

Status piši u `art/world-pack-03/STATUS-D61.md` (napravi ga), red posle SVAKOG klipa, sa oznakom `D61`.

Ne diraj ništa od sledećeg:
- `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`;
- druge `STATUS-*` fajlove i tuđe foldere klipova;
- git (ne pravi commit).

Paralelno radi D62 (rekviziti i slika za kraj): ne diraj njene fajlove.

## Uzori (`art/world-pack-03/uzori-d61/`)

- `marko-idle-2-kadar0.png`: **Marko** kako izgleda u igri. Uzor lika je uvek ovaj fajl, nikad `reference.png`. Na njemu:
  - crna kosa i brada;
  - crven ogrtač;
  - ljuskast oklop;
  - bela košulja;
  - bodljikav topuz;
  - visok 383 px, stopala na y=488.
- `marko-sablja-idle-kadar0.png`: Marko sa sabljom (izgled sablje).
- `sarac-stoji-kadar0.png`: Šarac, za meru (konj u igri stoji desno od Marka).
- Trake postojećih pokreta u meri igre, za ritam i veličinu:
  - `pokret-marko-throw.png` (bacanje topuza);
  - `pokret-marko-death.png` (Marko leži);
  - `pokret-marko-drink.png`, `pokret-marko-open.png`, `pokret-marko-odmor.png`.
- `minijatura-smrt.png`: Marko nad bunarom iz priče igre, za raspoloženje.

Svaki klip je **uređivanje uzora** (`image_gen` sa `marko-idle-2-kadar0.png` kao ulazom), ne crtež iz opisa:
- isti Marko, ista veličina (visina stojećeg Marka 383 px ±5 %);
- stopala na y=488;
- gleda **udesno**.

## Zajednička pravila (ista kao u `DOPUNA-58.md`)

**Ćelija i izvoz:**
- Ćelija 512×512, sigurna margina 24 px, providna pozadina, bez teksta.
- Klip ide u `art/animation-pack-04/assets/<klip>/`. U folderu:
  - `atlas.png` (N ćelija u jednom redu);
  - `manifest.json` sa `frame_layout`;
  - `frames/motion/frame-N.png`, `preview.gif`, `qa.json`, `identity-size-comparison.png`.
- JSON bez BOM-a, ASCII opisi.
- Radni fajlovi idu u `art/animation-pack-04/sources/<klip>/attempt-N/`.
- Postupak izvoza i provere: `art/world-pack-03/export-dopuna58.py` i `verify-dopuna58.py` (prilagodi ih za D61).

**Crtanje:**
- Jedan `image_gen` poziv crta mrežu (3×2 za 6 kadrova, 4×2 za 8) na ravnoj jarko zelenoj #00ff00.
- Jedan Marko po polju; konj, bunar, grob i more se NE crtaju (igra ih crta sama).
- Iseci polja, skini zelenu, svaki kadar stavi u svoju ćeliju.
- Stopala (ili koleno, ili telo kad leži) na **y=488**. Marko je na istom mestu u ćeliji u svim kadrovima.

**Provera svakog kadra:**
- nijedan neprovidan piksel ne dodiruje ivicu;
- nema zelenih piksela;
- ruke, noge, oružje i ogrtač su celi.

**Najviše tri pokušaja po klipu.** Ako ni treći ne valja, NE izvozi; upiši šta ne valja i idi dalje.

Nema krvi ni rana. Pesma je tužna i tiha.

## Klipovi (redom)

| Klip | Kadrova | Petlja | Šta se vidi |
|---|---|---|---|
| `marko-nad-bunarom` | 6 | ne (`holdLastFrame=true`) | Marko prilazi bunaru (bunar je desno, ivica mu je u visini kolena): 0 stoji, 1 klekne na jedno koleno, 2 obe ruke na ivicu bunara (desno, u visini y≈380), 3 nagne se i gleda dole u vodu, 4 trgne se: ugleda svoju smrt, 5 kleči uspravljen, ruka na grudima, glava pognuta. |
| `marko-oprasta` | 6 | da | Marko stoji uz Šarca (konj je desno, glava konja u visini Markove glave): desna ruka ispružena napred-gore, miluje konja po vratu; glava pognuta, ogrtač se lako njiše. Kadar 5 se pretapa u 0. |
| `marko-kopa` | 6 | da | Marko kopa grob drvenom lopatom okovanom gvožđem, desno od sebe: zabode lopatu u zemlju (y≈488 desno), nagazi je, podigne zemlju i baci je iza sebe (grudve zemlje). Topuz mu visi o pojasu. Kadar 5 se pretapa u 0. |
| `marko-lomi-sablju` | 6 | ne (`holdLastFrame=true`) | 0 drži sablju obema rukama vodoravno pred sobom, 1 digne levo koleno, 2 udari sečivom o koleno, 3 sablja prsne na dva dela, 4 lomi i polovine, 5 komadi padaju pred njim, Marko stoji praznih ruku, glava pognuta. |
| `marko-lomi-koplje` | 6 | ne (`holdLastFrame=true`) | 0 drži dugo bojno koplje uspravno, 1 spusti ga preko kolena, 2 prelomi ga, 3 lomi dalje (četiri-pet komada), 4 zamahne i baci komade gore-desno (u grane jele), 5 stoji praznih ruku i gleda gore-desno. |
| `marko-baca-topuz` | 6 | ne (`holdLastFrame=true`) | Poslednje bacanje: 0 drži topuz obema rukama, 1 zabaci ga visoko iza glave, 2 zakorači, 3 izbaci ga snažno gore-desno (daleko, u more), 4 topuz je otišao, ruka ispružena za njim, 5 spusti ruku, gleda daleko desno. U kadrovima 4–5 topuz se ne vidi. |
| `marko-lezi` | 8 | ne (`holdLastFrame=true`) | Poslednji počinak pod jelom: 0 skida crveni ogrtač, 1 prostire ga po zemlji, 2 stoji i krsti se desnom rukom, 3 klekne na ogrtač, 4 sedne, 5 legne na leđa, 6 ruke prekrsti na grudima, 7 leži mirno na ogrtaču, glava levo, oči sklopljene. U kadrovima 5–7 Marko leži celom dužinom ćelije (telo na y≈470–488), ne izlazi iz ćelije. |

## Na kraju

Kratak pregled u `STATUS-D61.md`: šta je izvezeno, koliko pokušaja, šta nije i zašto.
