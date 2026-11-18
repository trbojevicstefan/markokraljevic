# Dopuna 65 (od Claude-a, 18. 11.): prvi nivo, Kosovsko selo

Stefan (18. 11.): „Naruči još animacije od Codexa, šta god treba za prvi nivo da izgleda fenomenalno.”

Provera prvog nivoa u igri našla je pet praznina:
- megdandžija sela (Kopljanik-baša) preskače Marka, a nema crtež skoka;
- dok guslar (narator) govori, Marko sada staje i sluša, a nema pozu slušanja;
- na vašaru Marko hvata konja za rep, a nema taj pokret;
- selo je prazno: seljanka i starac koji već postoje u igri samo stoje, a treba da pozdrave Marka.

Status piši u `art/world-pack-03/STATUS-D65.md` (napravi ga), red posle SVAKOG klipa, sa oznakom `D65`.

Ne diraj ništa od sledećeg:
- `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`;
- druge `STATUS-*` fajlove i tuđe foldere klipova;
- git (ne pravi commit).

## Uzori (`art/world-pack-03/uzori-d65/`)

Svaki uzor je pravi kadar iz igre u ćeliji 512×512, stopala na y=488.

| Fajl | Šta je |
|---|---|
| `kopljanik-basa-idle-kadar0.png` | **Kopljanik-baša**: uzor lika i veličine za skok. Šlem sa belim turbanom, crveno-zlatna dolama, ljuskast oklop, okrugao bronzani štit na levoj ruci, dugo koplje sa crvenim barjačićem. Visok 410 px. |
| `pokret-kopljanik-basa-run.png`, `pokret-kopljanik-basa-attack.png` | isti baša u trku i napadu: kako mu stoje koplje, štit i barjačić u pokretu |
| `pokret-kopljanik-jump.png` | skok **običnog** kopljanika, 6 kadrova: uzor POKRETA za bašin skok (kadar po kadar) |
| `marko-idle-2-kadar0.png` | **Marko** kako stoji u igri: uzor lika i veličine. Crna kosa i brada, crven ogrtač sa zlatnim vezom, ljuskast oklop, bela košulja sa crvenim vezom, smeđe čizme, topuz šestoperac u desnoj ruci. Visok 383 px (sa ogrtačem 390). |
| `pokret-marko-idle-2.png` | postojeće Markovo stajanje, za ritam disanja i ogrtač |
| `pokret-marko-push.png` | Marko gura teret: kako mu izgledaju telo i noge kad se upire (za hvatanje repa je isto upiranje, samo unazad) |
| `sarac-stoji-kadar0.png` | konj u meri igre, samo da se vidi gde mu je rep (visina repa prema Marku). Konj se NE crta. |
| `putnica-idle-kadar0.png`, `pokret-putnica-idle.png` | **seljanka sa detetom**: uzor lika i veličine. Bela marama, bela košulja, smeđ prsluk, crvena tkana pregača; dečak u smeđoj košulji drži je za skut. Visoka 342 px. |
| `putnik-starac-idle-kadar0.png`, `pokret-putnik-starac-idle.png` | **starac**: uzor lika i veličine. Seda brada, tamna šubara, siv gunj, opanci, štap u desnoj ruci. Visok 314 px (pognut). |

Svaki klip je **uređivanje uzora** (`image_gen` sa kadrom 0 tog lika kao ulazom), ne crtež iz opisa:
- isti lik (lice, odeća, boje, oružje), ista veličina (±5 %);
- stopala na y=488 (osim u vazduhu, u skoku);
- gleda **udesno**, kao na uzoru.

## Zajednička pravila (ista kao u `DOPUNA-63.md`)

**Ćelija i izvoz:**
- Ćelija 512×512, sigurna margina 24 px, providna pozadina, bez teksta.
- Klip ide u `art/animation-pack-04/assets/<klip>/`. U folderu:
  - `atlas.png` (N ćelija u jednom redu);
  - `manifest.json` sa `frame_layout`;
  - `frames/motion/frame-N.png`, `preview.gif`, `qa.json`, `identity-size-comparison.png` (novi kadar pored uzora, ista razmera).
- JSON bez BOM-a, ASCII opisi.
- Radni fajlovi idu u `art/animation-pack-04/sources/<klip>/attempt-N/`.
- Postupak izvoza i provere: `art/world-pack-03/export-dopuna63.py` i `verify-dopuna63.py` (prilagodi ih za D65 kao `export-dopuna65.py` i `verify-dopuna65.py`).

**Crtanje:**
- Jedan `image_gen` poziv crta mrežu (4×2 za 8 kadrova, 3×2 za 6) na ravnoj jarko zelenoj #00ff00.
- Jedan lik po polju (seljanka i dete su jedan lik, kao na uzoru), bez ičega drugog: bez tla, senke, konja, drugih ljudi.
- Iseci polja, skini zelenu, svaki kadar stavi u svoju ćeliju.
- Lik je na istom mestu u ćeliji u svim kadrovima (ne šeta levo-desno). U skoku se menja samo visina.

**Provera svakog kadra:**
- nijedan neprovidan piksel ne dodiruje ivicu;
- nema zelenih piksela;
- ruke, noge, oružje i odeća su celi (koplje i barjačić celi u ćeliji);
- lik je isti kao uzor i iste visine: izmeri visinu uspravnog kadra i uporedi sa brojem iz tabele uzora. **Meri sam, ne procenjuj.**

**Najviše tri pokušaja po klipu.** Ako ni treći ne valja, NE izvozi; upiši šta ne valja i idi dalje. Odbijene pokušaje ostavi u `sources/`.

## Klipovi (redom)

| Klip | Kadrova | Petlja | Uzor lika | Šta se vidi |
|---|---|---|---|---|
| `kopljanik-basa-jump` | 6 | ne | `kopljanik-basa-idle-kadar0.png` | Baša skače sa mesta, isti pokret kao `pokret-kopljanik-jump.png` kadar po kadar: 0 čučne i skupi se, 1 odraz, 2 u vazduhu sa skupljenim kolenima, 3 vrh skoka, 4 pada sa ispruženim nogama, 5 doskok u čučanj. Koplje drži vodoravno obema rukama, vrh udesno, štit na levoj ruci, barjačić leprša. U kadrovima 2–4 stopala su iznad y=488 (najviše oko 90 px), u 0, 1 i 5 na y=488. |
| `marko-slusa` | 8 | da | `marko-idle-2-kadar0.png` | Marko stoji i sluša pesmu. Glava topuza je spuštena na zemlju ispred njega, drška uspravna; obe šake počivaju na vrhu drške, jedna preko druge. Težina na jednoj nozi, glava malo nagnuta u stranu i blago klima u ritmu, pogled udesno. Ogrtač se lako njiše. Miran, pažljiv, ne umoran. Kadar 7 se pretapa u 0. |
| `marko-hvata-rep` | 6 | ne | `marko-idle-2-kadar0.png` | Marko hvata konja za rep i zamahne. U rukama NEMA topuza (ni o pojasu). 0: zakorači i pruži obe ruke napred u visini struka; 1: obe šake se stisnu jedna do druge ispred tela, u visini struka, kao oko debelog konopca koji ide vodoravno udesno; 2–3: upre se nogama i zabaci telo unazad (ulevo), ruke ispružene, vuče iz sve snage, zubi stisnuti; 4: trzaj, najjače zabačen; 5: pušta, uspravlja se, šake se otvaraju. Rep i konj se NE crtaju: šake stežu prazan vazduh. Stopala ostaju na y=488 i na istom mestu. |
| `putnica-pozdrav` | 6 | da | `putnica-idle-kadar0.png` | Seljanka sa detetom pozdravlja Marka. Žena se uspravi, osmehne se, podigne desnu ruku iznad glave i maše (šaka levo-desno kroz kadrove 1–4), pa je spusti. Dete uz nju maše jednom rukom i poskoči u kadrovima 2–3. Ista žena i isto dete kao na uzoru. Kadar 5 se pretapa u 0. |
| `putnik-starac-klanja` | 6 | da | `putnik-starac-idle-kadar0.png` | Starac se klanja Marku. 0: stoji oslonjen na štap; 1: levom rukom skine šubaru; 2–3: pokloni se duboko, šubara na grudima, štap u desnoj ruci; 4: uspravlja se; 5: vraća šubaru na glavu. Kadar 5 se pretapa u 0. |
