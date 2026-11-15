# Dopuna 56 (od Claude-a, 15. 11.): Šarac, Marko na konju i Milošev konj

Stefan (15. 11.): „gameplay sve što fali”. Šarac ima samo galop: kad stoji, igra crta jednu nepomičnu sliku koja „diše”.
- Uzjahivanje su dve nepomične slike koje se pretapaju.
- Kad Marko stoji na konju, igra crta jedan kadar skoka.
- Milošev konj ne postoji: crta se Šarac obojen u braon.

Status piši u `art/world-pack-03/STATUS-D56.md` (napravi ga), red posle SVAKOG klipa, sa oznakom `D56`. Ne diraj ništa od sledećeg:
- `dist/`, `build-sprite-rig.py`, `sprite-rig.json`;
- druge `STATUS-*` fajlove i tuđe foldere klipova;
- git (ne pravi commit).

Paralelno rade dve druge Codex sesije (D54 Miloš, D55 protivnici): ne diraj njihove klipove i statuse.

## Uzori (pogledaj ih PRE crtanja; sve je u `art/world-pack-03/uzori-d54/`)

- `cast-sarac-kadar0.png`: **Šarac** kako stoji u igri, crveno-beli šarac. Oprema:
  - crven čaprak sa vezom i resama;
  - sedlo;
  - zlatasta griva.
- `sarac-galop-kadar0.png`: isti Šarac u galopu.
- `mounted-run-kadar0.png`, `marko-mounted-attack-kadar0.png`, `mounted-jump-kadar0.png`: **Marko na Šarcu**. `mounted-jump-kadar0.png` je Marko kako sedi na Šarcu koji stoji: to je stav za `mounted-idle`.
- `marko-idle-2-kadar0.png`: Marko peške (telo 383 px, stopala na y=488).
- `milos-jase-kadar0.png`: **Milošev konj** pod Milošem. Dorat:
  - tamnosmeđ, crna griva i rep;
  - crven čaprak sa belim dvoglavim orlom;
  - smeđe sedlo, uzengije.
- `milos-konj-video.jpg`: isti konj bez jahača.
- `pokret-mounted-run.png`, `pokret-mounted-jump.png`, `pokret-milos-jase.png`, `pokret-marko-dremlje.png`: trake postojećih klipova, za veličinu i položaj konja u ćeliji.

Svaki klip je **uređivanje uzora** (`image_gen` sa uzorom kao ulazom), ne crtež iz opisa:
- isti konj i isti Marko;
- ista veličina konja kao u `mounted-run-kadar0.png`;
- kopita na y=488.

## Zajednička pravila (ista kao u `DOPUNA-48.md`)

**Ćelija i izvoz:**
- Ćelija 512×512, sigurna margina 24 px, providna pozadina, bez teksta. Konj i jahač gledaju **udesno**.
- Klip ide u `art/animation-pack-04/assets/<klip>/`: `atlas.png` (N ćelija u jednom redu), `manifest.json` sa `frame_layout`, `frames/motion/frame-N.png`, `preview.gif` i `qa.json`.
- JSON bez BOM-a, ASCII opisi. Uzor fajlova: `art/animation-pack-04/assets/marko-dremlje/`.
- Radni fajlovi idu u `art/animation-pack-04/sources/<klip>/`. Postupak izvoza je u `art/world-pack-03/export-dopuna44-*.py` i `verify-dopuna51.py`.

**Crtanje i provera:**
- Jedan `image_gen` poziv crta mrežu (3×2 za 6 kadrova) na ravnoj jarko zelenoj #00ff00.
- Jedan konj (sa jahačem ili bez) po polju. Iseci, skini zelenu, svaki kadar u svoju ćeliju.
- Kopita na **y=488** i konj na istom mestu u ćeliji u svim kadrovima (stoji u mestu).
- Za svaki kadar proveri:
  - nijedan neprovidan piksel ne dodiruje ivicu;
  - nema zelenih piksela;
  - rep, griva i noge su celi.
- Posle svakog klipa napravi `identity-size-comparison.png` (tvoj kadar 0 pored uzora, ista razmera). Ako konj ili Marko nisu isti, ili je konj veći ili manji za više od 5 %, to je promašaj.
- **Najviše tri pokušaja po klipu.** Ako ni treći ne valja, NE izvozi, upiši šta ne valja i idi dalje.

## Klipovi (redom)

| Klip | Kadrova | Petlja | Šta se vidi |
|---|---|---|---|
| `sarac-stoji` | 6 | da | Šarac bez jahača stoji u mestu, osedlan kao u `cast-sarac-kadar0.png`: maše repom, spusti glavu pa je digne i frkne, jednom tapne prednjim kopitom. Kadar 5 se pretapa u 0. |
| `mounted-idle` | 6 | da | Marko sedi na Šarcu koji stoji u mestu (kao `mounted-jump-kadar0.png`): Šarac maše repom, pomeri glavu, prestupi; Marko sedi uspravno, buzdovan u desnoj ruci, ogrtač se malo njiše. Kadar 5 se pretapa u 0. |
| `marko-uzjase` | 6 | ne (`holdLastFrame=true`) | Šarac stoji u mestu (kao `cast-sarac-kadar0.png`), isti u svim kadrovima. Marko (kao `marko-idle-2-kadar0.png`, iste visine): 0 stoji uz konja kod sedla, 1 uhvati sedlo levom rukom, 2 odrazi se, 3 prebaci desnu nogu preko konja, 4 sedne, 5 sedi uspravno sa buzdovanom kao u `mounted-jump-kadar0.png`. |
| `milos-konj` | 6 | da | Milošev dorat bez jahača, osedlan kao u `milos-jase-kadar0.png` (crven čaprak sa belim dvoglavim orlom), stoji u mestu: maše repom, spusti glavu, frkne. Ista veličina kao konj u `milos-jase-kadar0.png`. |

## Na kraju

Kratak pregled u `STATUS-D56.md`: šta je izvezeno, koliko pokušaja, šta nije i zašto.
