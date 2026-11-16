# Dopuna 63 (od Claude-a, 16. 11.): Marko bez topuza na vrhu Urvine

Stefan (16. 11.): „treba nam jedna animacija Marka bez topuza kada ga baci u more”.

Posle `marko-baca-topuz` Marko je bez topuza i peške se vraća do jele pod kojom legne. Igra sada crta njegov običan hod i stajanje, a u oba drži topuz. Trebaju dva klipa u kojima topuza nema nigde: ni u ruci, ni o pojasu.

Status piši u `art/world-pack-03/STATUS-D63.md` (napravi ga), red posle SVAKOG klipa, sa oznakom `D63`.

Ne diraj ništa od sledećeg:
- `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`;
- druge `STATUS-*` fajlove i tuđe foldere klipova;
- git (ne pravi commit).

## Uzori (`art/world-pack-03/uzori-d63/`)

- `marko-walk-kadar0.png`: **Marko u hodu**, kako izgleda u igri (profil, gleda udesno, topuz u desnoj ruci). Uzor lika i veličine za hod.
- `pokret-marko-walk.png`: svih 8 kadrova postojećeg hoda u meri igre. Novi hod ima **isti ritam i iste položaje nogu i ogrtača** u svakom kadru; razlika je samo što topuza nema.
- `marko-idle-2-kadar0.png`: Marko kako stoji u igri. Uzor lika i veličine za stajanje.
- `marko-prazne-ruke.png`: poslednji kadar bacanja: Marko praznih ruku. Pokazuje kako izgledaju njegove ruke bez topuza.
- `pokret-marko-idle-2.png`: postojeće stajanje, za ritam disanja.

Na uzorima: crna kosa i brada, crven ogrtač sa zlatnim vezom, ljuskast oklop, bela košulja sa crvenim vezom, smeđe čizme. Stojeći Marko je visok 383 px, stopala na y=488.

Svaki klip je **uređivanje uzora** (`image_gen` sa uzorom kao ulazom), ne crtež iz opisa:
- isti Marko, ista veličina (±5 %);
- stopala na y=488;
- gleda **udesno**;
- **nigde nema topuza**: desna šaka je prazna (opuštena ili blago stisnuta), na pojasu nema topuza ni drške.

## Zajednička pravila (ista kao u `DOPUNA-61.md`)

**Ćelija i izvoz:**
- Ćelija 512×512, sigurna margina 24 px, providna pozadina, bez teksta.
- Klip ide u `art/animation-pack-04/assets/<klip>/`. U folderu:
  - `atlas.png` (N ćelija u jednom redu);
  - `manifest.json` sa `frame_layout`;
  - `frames/motion/frame-N.png`, `preview.gif`, `qa.json`, `identity-size-comparison.png`.
- JSON bez BOM-a, ASCII opisi.
- Radni fajlovi idu u `art/animation-pack-04/sources/<klip>/attempt-N/`.
- Postupak izvoza i provere: `art/world-pack-03/export-dopuna61.py` i `verify-dopuna61.py` (prilagodi ih za D63 kao `export-dopuna63.py` i `verify-dopuna63.py`).

**Crtanje:**
- Jedan `image_gen` poziv crta mrežu (4×2 za 8 kadrova, 3×2 za 6) na ravnoj jarko zelenoj #00ff00.
- Jedan Marko po polju, bez ičega drugog.
- Iseci polja, skini zelenu, svaki kadar stavi u svoju ćeliju.
- Stopala na **y=488**. Marko je na istom mestu u ćeliji u svim kadrovima (hod je u mestu, kao `marko-walk`).

**Provera svakog kadra:**
- nijedan neprovidan piksel ne dodiruje ivicu;
- nema zelenih piksela;
- ruke, noge i ogrtač su celi;
- **nema topuza** ni u jednom kadru (pogledaj svaki kadar uvećan);
- lik je isti kao uzor (lice, brada, oklop, ogrtač) i iste visine kao u `pokret-marko-walk.png`.

**Najviše tri pokušaja po klipu.** Ako ni treći ne valja, NE izvozi; upiši šta ne valja i idi dalje.

## Klipovi (redom)

| Klip | Kadrova | Petlja | Uzor | Šta se vidi |
|---|---|---|---|---|
| `marko-hod-bez-topuza` | 8 | da | `marko-walk-kadar0.png` | Hod u mestu, profil udesno, isti koraci kao `pokret-marko-walk.png` kadar po kadar. Ruke se blago njišu uz telo, praznih šaka; glava malo pognuta, umoran i tih. Kadar 7 se pretapa u 0. |
| `marko-stoji-bez-topuza` | 6 | da | `marko-idle-2-kadar0.png` | Stoji mirno, praznih ruku spuštenih uz telo, gleda daleko udesno (ka moru); diše, ogrtač se lako njiše na vetru. Kadar 5 se pretapa u 0. |
