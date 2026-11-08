# Zadatak za Codex — paket 03: penjanje, razbijanje, čuda, novi protivnici, nivo „Oranje”

Igra je u `marko-game/dist/`. Ti si nacrtao `art/world-pack-01`, `art/world-pack-02` i `art/animation-pack-03`. Crtaj u istom stilu: `art/world-pack-01/reference/style-reference.png` i isti uvod prompta kao u `art/world-pack-01/plan.json`.

**Pravila**
- Kod igre i `dist/` ne menjaj. Slike u igru ubacuje Claude.
- **Gde čuvaš:**
  - predmeti i pozadine idu u `marko-game/art/world-pack-03/`;
  - animacije idu u `marko-game/art/animation-pack-04/assets/<klip>/`, isto kao u paketu 03 (`atlas.png`, `manifest.json`, `frames/`, `preview.gif`), kroz `sprite-gen` (extract → compose-atlas → compose-gif).
- **Sirovi izvori** idu u `sources/` u svakom paketu. Ta fascikla ne ide u git.
- **Napredak:** posle svake završene grupe dopuni `art/world-pack-03/STATUS.md` (šta je gotovo, putanja, šta nije uspelo). Claude prati taj fajl i ubacuje slike čim su gotove, zato radi redom po prioritetima.
- **Odluke:** ne čekaj odgovor. Kad nešto nije jasno, odluči sam u duhu igre i zapiši to u STATUS.md.
- **Predmeti:** providan PNG, pogled sa strane, osnova predmeta na dnu platna. Bez senke-elipse ispod, bez slova, čiste alfa ivice.
- **Animacije:**
  - lik okrenut udesno, ćelija 512×512;
  - dno stopala na istoj visini u svim kadrovima;
  - lik iste veličine kao u postojećim klipovima tog lika;
  - noga ili ruka u pozadini malo tamnija.
- **Katalog:** za svaku sliku upiši u `world-pack-03/catalog.json` id, fajl, veličinu i granice sadržaja.

---

## Prioritet 1 — predmeti za mehaniku koja već ulazi u igru

### 1a. Predmeti koji se razbijaju
Platno 1024×1024, predmet visok 300–450 px. Igra ih seče na komade kad ih Marko razbije, zato neka budu puni i jasni.

| Fajl | Šta je |
|---|---|
| `razbi-sanduk` | drveni sanduk okovan gvozdenim trakama |
| `razbi-cup` | glineni ćup s dve drške, oslikan srpskim šarama |
| `razbi-bure` | bure za vino, hrastove duge, gvozdeni obruči |
| `razbi-korpa` | pletena korpa puna jabuka |
| `razbi-kovceg` | okovan kovčeg s blagom, zatvoren |
| `razbi-kovceg-otvoren` | isti kovčeg otvoren: zlatnici sijaju iz njega |

### 1b. Penjanje
- **`lestve`:** drvene lestve, 256×1024, providna pozadina.
  - Prečke na svakih 128 px.
  - Bez šava odozgo-nadole: igra slaže lestve jedne iznad drugih.
  - Stranice na x ≈ 56 i x ≈ 200.
- **`lestve-vrh`:** 256×256, vrh lestvi koji viri iznad ivice platforme (dve stranice sa zaobljenim krajem).
- **Zidovi za odskok:** 512×512, neprovidni, bez šava u oba pravca.
  - Proveri skriptom kao trake tla: leva i desna, kao i gornja i donja ivica.

  | Fajl | Zid | Ambijenti |
  |---|---|---|
  | `zid-kamen` | klesani kamen, malter | tvrđava, manastir, ruševine, selo |
  | `zid-stena` | prirodna stena, pukotine | klisura, prevoj, pećina, rudnik |
  | `zid-drvo` | palisada od oblica | šuma, močvara, reka |
  | `zid-cigla` | stara opeka | podrum |

- **`kula-strazara`:** drvena osmatračnica, 1024×1024 providno.
  - Četiri noge.
  - Na vrhu ravan pod s ogradom, na njemu stoji strelac.
  - Pod je otprilike na trećini visine od vrha.
  - U katalog upiši tačan y gornje ivice poda (`deckY`) i x-raspon poda (`deckX0`, `deckX1`).

### 1c. Predmeti koje Marko baca i skuplja
- **`predmet-topuz`:** Markov buzdovan (topuz) sam, položen vodoravno, glava desno. 512×512 providno. Igra ga vrti dok leti.
- **`predmet-dukat`:** zlatni dukat. 256×256 providno, jasan i kad je mali (24 px).

### 1d. Dvanaest čuda iz pesama o Marku
Platno 512×512 providno, predmet oko 320 px. Lagan zlatan sjaj po ivici, ali bez velikog oreola: igra sama dodaje svetlo. Mora se prepoznati i kad je ikonica od 48 px.

| Fajl | Čudo | Pesma |
|---|---|---|
| `cudo-sarceva-potkova` | velika potkova Šarca | Šarac, Markov konj |
| `cudo-vilino-pero` | belo-zlatno pero vile Ravijojle | Marko Kraljević i vila |
| `cudo-orlovo-pero` | tamno orlovo pero | Marko Kraljević i orao |
| `cudo-pehar-vina` | srebrni pehar s rujnim vinom | Marko pije uz ramazan vino |
| `cudo-carska-knjiga` | carska povelja s pečatom, uvezana | Uroš i Mrnjavčevići |
| `cudo-zlatno-ralo` | malo zlatno ralo (plug) | Oranje Marka Kraljevića |
| `cudo-tri-kese-dukata` | tri kožne kese pune dukata | Smrt Marka Kraljevića |
| `cudo-oceva-sablja` | stara kraljevska sablja u koricama | Marko Kraljević poznaje očinu sablju |
| `cudo-buzdovan` | okovani buzdovan s rebrima | Marko Kraljević i Musa Kesedžija |
| `cudo-gusle` | gusle s gudalom, rezbarena glava konja | guslar |
| `cudo-kljuc-kule` | veliki gvozdeni ključ arapske kule | Marko Kraljević ukida svadbarinu |
| `cudo-musina-sablja` | kriva sablja Muse Kesedžije | Marko Kraljević i Musa Kesedžija |

Dodaj i `cuda-preview.png` (svih 12 u mreži).

---

## Prioritet 2 — animacije za penjanje i skokove

| Klip | Kadrova | Opis |
|---|---|---|
| `marko-climb` | 8, petlja | Marko se penje uz drvene lestve. Viđen 3/4 s leđa, ruke i noge se smenjuju, topuz okačen o pojas. Lestve se **ne** crtaju. Lik je na sredini ćelije po x. |
| `marko-wallslide` | 4, petlja | Zid je odmah desno od lika, kao da je desna ivica tela uz zid. Marko je okrenut ka zidu, dlan i đon pritisnuti uz zid, druga noga savijena, polako klizi. Zid se **ne** crta. |
| `marko-throw` | 8, jednom | Marko baca topuz napred. 1–3 zamah iznad ramena, 4 izbačaj (ruka ispružena, topuz napušta ruku), 5–6 praćenje, 7–8 povratak u gard praznom rukom, spreman da ga uhvati. Topuz se vidi samo u kadrovima 1–4. |
| `sword-jump` | 6, jednom | Janičar sa sabljom skače: 1 čučanj pred odraz, 2 odraz, 3 penjanje s podvijenim nogama, 4 vrh, 5 pad s nogama ka tlu, 6 doskok u čučanj. |
| `shield-jump` | 6, jednom | Isto, za štitonošu. Štit ostaje ispred tela. |
| `archer-jump` | 6, jednom | Isto, za strelca. Luk u ruci. |
| `palikuca-jump` | 6, jednom | Isto, za palikuću. Baklja u ruci. |
| `oklopnik-jump` | 6, jednom | Isto, za oklopnika: težak, nizak skok, težak doskok. |
| `archer-shoot-down` | 6, jednom | Kao `archer-shoot`, ali strelac stoji na visini i nišani nadole pod oko 35°. |

Referenca za svakog lika je njegov `base-source.png` u `art/animation-pack-03/sources/<lik>-idle/`, a za Marka `marko-idle`.

---

## Prioritet 3 — novi nivo „Oranje drumova”

Po pesmi „Oranje Marka Kraljevića”:
- Janičari oru careve drumove volovima i ralom.
- Nose tri tovara blaga.
- Marko ih zaustavlja.

Ambijent je carski drum kroz polja kod Prilepa, leti:
- zrelo žito, oranice i međe;
- usamljene kruške;
- u daljini Markove kule na steni iznad Prilepa.

### 3a. Pozadine
Iste veličine i iste uloge kao `selo-*` u world-pack-01:

| Fajl | Veličina | Šta je |
|---|---|---|
| `oranje-sky` | 1774×887, neprovidno | nebo |
| `oranje-far` | 2172×724, providno | daleka brda s Markovim kulama |
| `oranje-mid` | 2172×724, providno | polja, kruške, šatori |
| `oranje-near` | 2172×724, providno | žito i trska pri dnu |
| `oranje-vista` | 2172×724, neprovidno | sve zajedno |

Leva i desna ivica slojeva treba da se nastave, kao i ranije.

### 3b. Tlo i predmeti
- **Tlo:** `tlo-oranje` (1024×384) i `tlo-oranje-kraj` (192×384), po istim pravilima kao trake u world-pack-02: hodna linija y = 64, bez šava, dno skoro crno. Materijal je utaban zemljani drum, ivice izorane u brazde.
- **Predmeti:**
  - `prop-plast-sena`
  - `prop-kola-seno`
  - `prop-turski-sator`
  - `prop-medjas` (kamen međaš)
  - `prop-kruska` (usamljena kruška)
  - `prop-krst-raskrsce` (drveni krst na raskršću)
- **Cilj nivoa:**
  - `cilj-tovar-blaga`: tovarni samar s tri okovana sanduka punim zlata, spušten na zemlju;
  - `plug-slomljen`: polomljeno drveno ralo s jarmom.

### 3c. Animacije (u animation-pack-04)
- **`volovi-plug`:** 8 kadrova, petlja, ćelija **1024×512**.
  - Dva upregnuta vola vuku drveno ralo udesno. Bliži vo je jasan, dalji je tamniji i delom skriven.
  - Iza rala je janičar orač: drži ručice rala, u drugoj ruci prut.
  - Ralo zaseca zemlju.
  - Dno kopita i rala je na istoj liniji u svim kadrovima.
- **`volovi-beg`:** 8 kadrova, petlja, ćelija 1024×512. Ista dva vola sa prekinutim jarmom beže udesno, bez rala i orača.

---

## Prioritet 4 — novi protivnici

Svakom prvo napravi `base-source.png` u stilu postojećih janičara (`sword-idle` iz paketa 03), pa klipove:

| Lik | Klipovi | Opis |
|---|---|---|
| `kopljanik` | `idle` 6, `run` 8, `attack` 8, `hurt` 4, `death` 8, `jump` 6 | Janičar s dugim kopljem (duplo duže od sablje) i malim okruglim štitom. Napad: dug ubod napred s iskorakom. |
| `pas` | `idle` 4, `run` 8, `attack` 6, `hurt` 4, `death` 6 | Krupan ratni pas s kožnom ogrlicom s kopčama. Napad: skok i ugriz. Okrenut udesno, ćelija 512×512, ali je pas niži, oko 45% visine janičara. |
| `tufekdzija` | `idle` 6, `run` 8, `shoot` 8, `hurt` 4, `death` 8, `jump` 6 | Janičar s dugom puškom (tufek). Pucanj: 1–3 podizanje i nišanjenje, 4 plamen i dim na cevi, 5–8 trzaj i spuštanje. |

---

## Prioritet 5 — ako stigneš
- **Noć i oluja za Oranje:** `oranje-*-night` i `oranje-*-storm` (sky, far, mid, near, vista), kao kod drugih ambijenata.
- **`marko-kick`:** 6 kadrova. Marko nogom gura štit ili sanduk napred.

## Predaja
- **`world-pack-03/catalog.json`:** za trake tla `walkY` i proveru šava, za kulu `deckY`, `deckX0` i `deckX1`.
- **README:** `world-pack-03/README.md` i `animation-pack-04/README.md`, kratko, na srpskom.
- **Pregledi:**
  - `cuda-preview.png`;
  - `razbi-preview.png`;
  - `animation-pack-04/preview.png`: prvi kadar svakog klipa uz lik iz paketa 03, da se vidi da je veličina ista.
- **Na kraju:** spisak gotovog i šta nije uspelo.
