# Dopuna 57 (od Claude-a, 15. 11.): Šarac u scenama iz pesama

Stefan (15. 11.): „Naruči nedostajuće animacije”. Šarac sada ima `sarac-stoji` i `sarac-galop`. U scenama iz pesama igra drugde crta nepomičnu sliku koja se trese ili naginje:
- pod Varadinom Šarac pije vodu i lupa kopitom;
- u mehani ne pušta Filipa na vrata, a Filip ga bije;
- na vrhu Urvine Marko oplače Šarca i sahrani ga.

Status piši u `art/world-pack-03/STATUS-D57.md` (napravi ga), red posle SVAKOG klipa, sa oznakom `D57`.

Ne diraj ništa od sledećeg:
- `dist/`, `build-sprite-rig.py`, `sprite-rig.json`;
- druge `STATUS-*` fajlove i tuđe foldere klipova;
- git (ne pravi commit).

Paralelno rade druge Codex sesije (D58 likovi, D59 riznica): ne diraj njihove klipove i statuse.

## Uzori

Pogledaj ih PRE crtanja; sve je u `art/world-pack-03/uzori-d57/`:
- `sarac-stoji-kadar0.png`: **Šarac** kako stoji u igri, crveno-beli šarac. Oprema:
  - crven čaprak sa vezom i resama;
  - sedlo;
  - zlatasta griva.
- `cast-sarac-kadar0.png`: isti Šarac, druga slika.
- `pokret-sarac-stoji.png` i `pokret-sarac-galop.png`: trake postojećih klipova. Iz njih uzmi veličinu i položaj konja u ćeliji.
- `marko-idle-2-kadar0.png`: Marko peške, za meru.

Svaki klip je **uređivanje uzora**, ne crtež iz opisa:
- `image_gen` dobija `sarac-stoji-kadar0.png` kao ulaz;
- isti konj, ista oprema, ista veličina kao u `sarac-stoji-kadar0.png`;
- kopita na y=488;
- konj gleda **udesno**.

## Zajednička pravila (ista kao u `DOPUNA-56.md`)

**Ćelija i izvoz:**
- Ćelija 512×512, sigurna margina 24 px, providna pozadina, bez teksta.
- Klip ide u `art/animation-pack-04/assets/<klip>/`. U folderu:
  - `atlas.png` (N ćelija u jednom redu);
  - `manifest.json` sa `frame_layout`;
  - `frames/motion/frame-N.png`, `preview.gif`, `qa.json`.
- JSON bez BOM-a, ASCII opisi.
- Uzor fajlova: `art/animation-pack-04/assets/sarac-stoji/`.
- Radni fajlovi idu u `art/animation-pack-04/sources/<klip>/`.
- Postupak izvoza: `art/world-pack-03/export-dopuna56-claude.py` i `verify-dopuna51.py`.

**Crtanje:**
- Jedan `image_gen` poziv crta mrežu (3×2 za 6 kadrova, 2×2 za 4) na ravnoj jarko zelenoj #00ff00.
- Jedan konj po polju. Iseci polja, skini zelenu, svaki kadar stavi u svoju ćeliju.
- Kopita koja stoje na zemlji su na **y=488**. Konj je na istom mestu u ćeliji u svim kadrovima, osim gde tabela kaže drugačije.

**Provera svakog kadra:**
- nijedan neprovidan piksel ne dodiruje ivicu;
- nema zelenih piksela;
- rep, griva i noge su celi.

**Provera posle svakog klipa:**
- Napravi `identity-size-comparison.png`: tvoj kadar 0 pored `sarac-stoji-kadar0.png`, u istoj razmeri.
- Promašaj je ako konj nije isti, ili je veći ili manji za više od 5 %.
- **Najviše tri pokušaja po klipu.** Ako ni treći ne valja, NE izvozi. Upiši šta ne valja i idi dalje.

## Klipovi (redom)

| Klip | Kadrova | Petlja | Šta se vidi |
|---|---|---|---|
| `sarac-pije` | 6 | da | Šarac stoji u mestu i pije: spusti glavu skroz do zemlje (njuška na y≈470, kao da pije iz reke), pa je malo digne i opet spusti. Rep maše. Kadar 5 se pretapa u 0. |
| `sarac-lupa` | 6 | da | Nestrpljiv Šarac stoji u mestu i kopa desnim prednjim kopitom: digne nogu, udari o zemlju, digne glavu i frkne. Kadar 5 se pretapa u 0. |
| `sarac-propinje` | 6 | ne (`holdLastFrame=false`, igra ga pušta u krug) | Šarac ne pušta nikog na vrata. Kadrovi: 0 stoji, 1 spusti glavu, 2–3 propne se na zadnje noge (prednje noge u vazduhu, glava gore, zadnja kopita ostaju na y=488), 4 spusti se, 5 ritne zadnjim nogama unazad (prednja kopita na zemlji). Konj ne sme da izađe iz ćelije: smanji margine ako treba, ali zadrži meru konja. |
| `sarac-boli` | 4 | ne | Udaren konj: 0 stoji, 1 trgne se i zabaci glavu, 2 spusti glavu i ugne se, 3 stoji pognute glave. Bez krvi. |
| `sarac-pada` | 6 | ne (`holdLastFrame=true`) | Šarac umire mirno (Marko ga sahranjuje): 0 stoji pognute glave, 1 klecne prednjim nogama, 2 klekne na prednje noge, 3 spusti zadnji deo, 4 legne na bok, 5 leži mirno na boku, glava na zemlji. Bez krvi i bez rane. Ležeći konj je širi: neka stane u ćeliju, kopita i bok na y≈488. |
| `sarac-hod` | 6 | da | Šarac bez jahača hoda korakom udesno (u mestu, kao traka trka): četvorotakt, glava se blago klati. Kadar 5 se pretapa u 0. |

## Na kraju

Kratak pregled u `STATUS-D57.md`: šta je izvezeno, koliko pokušaja, šta nije i zašto.
