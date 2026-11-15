# Dopuna 54 (od Claude-a, 15. 11.): Miloš Obilić kao igrivi junak

Stefan (15. 11.): „gameplay sve što fali”. Miloš je igriv, ali ima samo 9 pokreta. Igra zato svih 116 Markovih pokreta prevodi na njih:
- svih 40 udaraca je jedan isti zamah;
- blok, čučanj i pijenje su samo stajanje;
- smrt je poslednji kadar „pogođen”.

Ova dopuna su pokreti koji se u igranju najviše vide.

Status piši u `art/world-pack-03/STATUS-D54.md` (napravi ga), red posle SVAKOG klipa, sa oznakom `D54`. Ne diraj ništa od sledećeg:
- `dist/`, `build-sprite-rig.py`, `sprite-rig.json`;
- druge `STATUS-*` fajlove i tuđe foldere klipova;
- git (ne pravi commit).

Paralelno rade dve druge Codex sesije (D55 protivnici, D56 konj): ne diraj njihove klipove i statuse.

## Uzori (pogledaj ih PRE crtanja; sve je u `art/world-pack-03/uzori-d54/`)

- `milos-idle-kadar0.png`: **ovo je Miloš**.
  - Svaki klip je **uređivanje ove slike** (`image_gen` sa ovom slikom kao ulazom), ne crtež iz opisa.
  - Isti čovek: svetlosmeđa kosa do ramena, kratka svetla brada, srebrna verižnjača preko tamnoplave tunike, kožni prsluk.
  - Tamnoplav ogrtač sa srebrnim obrubom, smeđe čizme, pravi dvosekli mač u desnoj ruci.
  - Ista visina: telo ~380 px u ćeliji 512, stopala na y=488.
- `pokret-<klip>.png`: trake kadrova postojećih klipova iz igre, u meri igre (ćelije 512 u jednom redu). One su **uzor pokreta i ritma**, ne lika: Marko nosi buzdovan, a Miloš mač, pa pokret prevedi na mač.
- `pokret-milos-attack.png` i `pokret-milos-jump.png` su Miloševi postojeći klipovi. Novi klipovi moraju se lepo nadovezati na njih: isti stav na početku i kraju kao kadar 0 iz `milos-idle-kadar0.png`.

## Zajednička pravila (ista kao u `DOPUNA-48.md`)

**Ćelija i izvoz:**
- Ćelija 512×512, sigurna margina 24 px, providna pozadina, bez teksta. Lik gleda **udesno**.
- Klip ide u `art/animation-pack-04/assets/<klip>/`: `atlas.png` (N ćelija u jednom redu), `manifest.json` sa `frame_layout`, `frames/motion/frame-N.png`, `preview.gif` i `qa.json`.
- JSON bez BOM-a, ASCII opisi. Uzor fajlova: `art/animation-pack-04/assets/milos-attack/`.
- Radni fajlovi idu u `art/animation-pack-04/sources/<klip>/`. Postupak izvoza je u `art/world-pack-03/export-dopuna44-*.py` i `verify-dopuna51.py`.

**Crtanje i provera:**
- Jedan `image_gen` poziv crta mrežu (3×2 za 6 kadrova, 4×2 za 8, 5×1 ili 3×2 za 5) na ravnoj jarko zelenoj #00ff00.
- JEDAN lik po polju. Iseci, skini zelenu, svaki kadar postavi u svoju ćeliju tako da oslonac stoji na **y=488** i da lik ne šeta po ćeliji.
- Za svaki kadar proveri:
  - nijedan neprovidan piksel ne dodiruje ivicu;
  - nema zelenih piksela;
  - jedna celina (mač ne sme biti odsečen ni odvojen od ruke);
  - oslonac na y=488 ±6, osim gde je u tabeli rečeno drugačije.
- Posle svakog klipa napravi `identity-size-comparison.png` (tvoj kadar 0 pored `milos-idle-kadar0.png`, ista razmera). Ako lik ili visina nisu isti (±5 %), to je promašaj.
- **Najviše tri pokušaja po klipu.** Ako ni treći ne valja, NE izvozi, upiši šta ne valja i idi dalje.
- Bez krvi.

## Klipovi (redom)

| Klip | Kadrova | Petlja | Šta se vidi (uzor pokreta) |
|---|---|---|---|
| `milos-niz-2` | 6 | ne | Drugi udarac niza, posle vodoravnog reza iz `milos-attack`: povratni kosi rez odozdo-sleva nagore-udesno, telo se okrene u kukovima. Kadar 3 je udarac (mač najdalje napred), kadrovi 4–5 povratak u stav. (`pokret-marko-combo-2.png`) |
| `milos-niz-3` | 6 | ne | Treći, završni udarac niza: iskorak desnom nogom i snažan ubod mačem pravo napred, obe ruke na balčaku. Kadar 3 mač potpuno ispružen napred, u visini grudi. Kraj u stavu. (`pokret-marko-combo-3.png`) |
| `milos-tezak` | 6 | ne | Teški udarac posle punjenja: mač obema rukama visoko iza glave (kadrovi 1–2), pa udar odozgo do zemlje ispred sebe (kadar 3: vrh mača kod zemlje, kolena savijena), pa se uspravi. (`pokret-marko-charged.png`) |
| `milos-vazduh` | 5 | ne | Udarac u skoku: telo kao u vrhu skoka (`pokret-milos-jump.png`, kadar 3: kolena podvijena), seče mačem odozgo nadole ispred sebe. Telo u vazduhu: stopala ~70 px iznad y=488 u svim kadrovima, isto mesto u ćeliji. (`pokret-marko-air-1.png`) |
| `milos-blok` | 6 | ne (`holdLastFrame=true`) | Odbrana: podigne mač vodoravno ispred grudi i lica, levom rukom pridržava sečivo pri vrhu, kolena savijena, težina napred. Kadrovi 0–2 dizanje, 3–5 drži blok i malo diše. (`pokret-marko-block.png`) |
| `milos-cuci` | 6 | ne (`holdLastFrame=true`) | Čučne: kadar 0 stav, 1–2 spuštanje, 3–5 čuči nisko na savijenim nogama (glava ~35 % niža nego u stavu), mač ispred sebe, pogled napred. (`pokret-marko-crouch.png`) |
| `milos-kotrlja` | 6 | ne | Kolut napred udesno preko ramena: zgrči se, prevrne, ogrtač se umota oko njega, mač uz telo, kadar 5 se diže u stav. Oslonac na zemlji (telo dodiruje y=488) u svim kadrovima. (`pokret-marko-roll.png`) |
| `milos-penje` | 8 | da | Penje se uz stenu ili merdevine, viđen sa strane i malo s leđa: ruke i noge se smenjuju (leva ruka gore dok je desna noga gore, pa obrnuto), mač u kanijama o pojasu, ogrtač visi. Telo ostaje na istom mestu u ćeliji. Kadar 7 se pretapa u 0. (`pokret-marko-climb.png`) |
| `milos-pije` | 6 | ne | Skine drvenu čuturicu sa pojasa levom rukom, nagne je i otpije (kadrovi 2–3), obriše brk nadlanicom, vrati je za pojas. Mač u desnoj ruci uperen dole. (`pokret-marko-drink.png`) |
| `milos-smrt` | 6 | ne (`holdLastFrame=true`) | Pogođen nasmrt: posrne, padne na kolena, pa na leđa (ulevo). Mač mu ispadne iz ruke i ostane pored njega. Poslednji kadar leži na leđima, ceo u ćeliji, telo na y=488. Bez krvi. (`pokret-marko-death.png`) |

## Na kraju

Kratak pregled u `STATUS-D54.md`: šta je izvezeno, koliko pokušaja, šta nije i zašto.
