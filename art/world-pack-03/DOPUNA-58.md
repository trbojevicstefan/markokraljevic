# Dopuna 58 (od Claude-a, 15. 11.): likovi iz pesama i vrač kao bos

Stefan (15. 11.): „Naruči nedostajuće animacije” i „koristi Vrača za novog bosa i novi nivo”. Vrač ima `vrac-idle`, `vrac-carolija`, `vrac-hurt` i `vrac-pojavljuje`. Za bosa mu fale udarac štapom i smrt.

Status piši u `art/world-pack-03/STATUS-D58.md` (napravi ga), red posle SVAKOG klipa, sa oznakom `D58`.

Ne diraj ništa od sledećeg:
- `dist/`, `build-sprite-rig.py`, `sprite-rig.json`;
- druge `STATUS-*` fajlove i tuđe foldere klipova;
- git (ne pravi commit).

Paralelno rade druge Codex sesije (D57 Šarac, D59 riznica): ne diraj njihove klipove i statuse.

## Uzori

Pogledaj ih PRE crtanja; sve je u `art/world-pack-03/uzori-d57/`. Uzor lika je uvek `<lik>-kadar0.png`, nikad `reference.png`:

| Lik | Uzor | Uz to |
|---|---|---|
| Vukašin | `vukasin-udara-kadar0.png` | isti kralj u `vukasin-trci-kadar0.png` |
| Kosovka devojka | `kosovka-idle-kadar0.png` | hod u `pokret-kosovka-hoda.png` |
| Đemo Brđanin | `djemo-idle-kadar0.png` | rana u `pokret-djemo-hurt.png`; ošamućenost drugog lika u `pokret-arapin-omamljen.png` |
| Miloš na doratu | `milos-jase-kadar0.png` | jahanje u `pokret-milos-jase.png`, smrt peške u `pokret-milos-smrt.png`, Miloš peške u `milos-idle-kadar0.png` |
| Vrač | `vrac-idle-kadar0.png` | čini u `pokret-vrac-carolija.png`, rana u `pokret-vrac-hurt.png` |

Opis vrača: starac sa dugom sedom kosom i bradom, pogrbljen, u pocepanoj tamnoj kabanici sa kapuljačom, sa ogrlicom od zuba i visokim štapom od kosti.

- `marko-idle-2-kadar0.png`: Marko peške, za meru.

Svaki klip je **uređivanje uzora**, ne crtež iz opisa:
- `image_gen` dobija uzor lika kao ulaz;
- isti lik, ista odeća, ista veličina;
- stopala na y=488;
- lik gleda **udesno**.

## Zajednička pravila (ista kao u `DOPUNA-56.md`)

**Ćelija i izvoz:**
- Ćelija 512×512, sigurna margina 24 px, providna pozadina, bez teksta.
- Klip ide u `art/animation-pack-04/assets/<klip>/`. U folderu:
  - `atlas.png` (N ćelija u jednom redu);
  - `manifest.json` sa `frame_layout`;
  - `frames/motion/frame-N.png`, `preview.gif`, `qa.json`.
- JSON bez BOM-a, ASCII opisi.
- Uzor fajlova: `art/animation-pack-04/assets/kosovka-idle/`.
- Radni fajlovi idu u `art/animation-pack-04/sources/<klip>/`.
- Postupak izvoza: `art/world-pack-03/export-dopuna56-claude.py` i `verify-dopuna51.py`.

**Crtanje:**
- Jedan `image_gen` poziv crta mrežu (3×2 za 6 kadrova) na ravnoj jarko zelenoj #00ff00.
- Jedan lik po polju (za Miloša: konj i jahač zajedno). Iseci polja, skini zelenu, svaki kadar stavi u svoju ćeliju.
- Stopala na **y=488**. Lik je na istom mestu u ćeliji u svim kadrovima, osim gde tabela kaže drugačije.

**Provera svakog kadra:**
- nijedan neprovidan piksel ne dodiruje ivicu;
- nema zelenih piksela;
- ruke, noge, štap i oružje su celi.

**Provera posle svakog klipa:**
- Napravi `identity-size-comparison.png`: tvoj kadar 0 pored uzora, u istoj razmeri.
- Promašaj je ako lik nije isti, ili je veći ili manji za više od 5 %.
- **Najviše tri pokušaja po klipu.** Ako ni treći ne valja, NE izvozi. Upiši šta ne valja i idi dalje.

## Klipovi (redom)

| Klip | Kadrova | Petlja | Šta se vidi |
|---|---|---|---|
| `vrac-stap` | 6 | ne | Vrač udara štapom iz blizine: 0 stoji kao u uzoru, 1 digne štap obema rukama iznad glave, 2 zamahne, 3 lupi vrhom štapa ispred sebe u zemlju (vrh štapa na y≈488 desno od lika), 4 iz štapa pukne zelenkasta iskra (mala), 5 vrati se u stav. |
| `vrac-smrt` | 6 | ne (`holdLastFrame=true`) | Vrač pada i nestaje u dimu: 0 trgne se, 1 klecne, 2 padne na kolena oslonjen na štap, 3 štap mu ispadne, 4 sruči se napred, 5 leži, a iz kabanice se diže siv dim. Bez krvi. |
| `vukasin-stoji` | 6 | da | Kralj Vukašin stoji u mestu, ponosno: diše, malo pomeri ruku na balčaku handžara, ogrtač se njiše, okrene glavu. Kadar 5 se pretapa u 0. |
| `kosovka-poji` | 6 | da | Kosovka devojka kleči (jedno koleno na zemlji) i poji ranjenika kog ne crtaš: drži bardak (zemljani krčag) obema rukama, nagne ga napred-desno, sipa, uspravi ga, pa ponovo. Kadar 5 se pretapa u 0. Visina klečanja oko 70 % visine njenog stava. |
| `djemo-omamljen` | 6 | da | Ošamućen Đemo tetura u mestu: glava mu klone, ruke opuštene, zanese se levo pa desno, uhvati se za glavu. Topuz drži labavo. Kadar 5 se pretapa u 0. |
| `milos-pada-s-konja` | 6 | ne (`holdLastFrame=true`) | Miloš na svom doratu (isti konj i Miloš kao u `milos-jase-kadar0.png`, konj stoji u mestu). 0 sedi u sedlu, 1 trgne se i uhvati za grudi (bez strele, bez krvi), 2 nagne se u stranu, 3 sklizne iz sedla, 4 padne na zemlju pored konja, 5 leži na leđima pored konja, konj stoji. Konj ostaje isti i na istom mestu u svim kadrovima. |

## Na kraju

Kratak pregled u `STATUS-D58.md`: šta je izvezeno, koliko pokušaja, šta nije i zašto.
