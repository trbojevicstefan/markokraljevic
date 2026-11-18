# Dopuna 70 (od Claude-a, 18. 11.): lepše kapije

Stefan (18. 11., uz snimak kapije iz igre): „naruči lepše kapije od ovoga, mnogo je ravno, savršene ivice itd. Kamen nije savršeno ravan. Takođe onaj gornji deo, materijal jako loše izgleda, a i sama metalna kapija nije dobra: treba da vidimo iz profila, ali da vidimo oba kraja kapije pod nekim blagim uglom, recimo 75 stepeni. Ovako pod 90 deluje kao da je jedna šipka, a ne kapija.”

Kapija u igri je **presek zida** (uzor: Prince of Persia: The Lost Crown): drum ide sleva nadesno kroz debeo zid koji je presečen i gledan sa strane. U podnožju je zasvođen prolaz kroz koji Marko prolazi, a u sredini prolaza visi rešetka koja se diže u žleb u zidu. Sada to igra crta sama, ravnim pravougaonicima. Trebaju naslikani delovi.

Status piši u `art/world-pack-03/STATUS-D70.md` (napravi ga), red posle SVAKE slike, sa oznakom `D70`.

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, `sync-world.py`, druge `STATUS-*` fajlove, postojeće slike, git. Paralelno rade druge Codex sesije (D67, D68, D69): ne diraj njihove fajlove; svoje skripte zovi `export-dopuna70.py` i `verify-dopuna70.py`.

## Uzori (`art/world-pack-03/uzori-d70/`)

- `kapija-zid-mera.png` (832×1664): **mera zida**. Poštuj je tačno, igra slaže delove po njoj:
  - plavo = prolaz (624 px širok, 840 px visok, sa plitkim lukom na vrhu): na gotovoj slici **potpuno providno**;
  - tamna uspravna traka u sredini (88 px široka, od vrha luka do vrha slike) = žleb u koji se diže rešetka: na gotovoj slici taman, dubok prorez u zidu;
  - smeđe = zid; levo i desno od prolaza po 104 px zida do ivice slike;
  - crven okvir (gornjih 416 px) = deo koji igra ponavlja naviše: tu samo zid i žleb, bez ičeg posebnog;
  - crven pravougaonik dole = Marko u meri (512 px visok), samo za osećaj veličine kamena.
- `kapija-resetka-mera.png` (256×1024): **mera rešetke**: rešetka gledana skoro iz profila, pod uglom od oko 75° (ne 90°): bliža ivica levo, dalja desno, vide se oba kraja i sve uspravne šipke jedna iza druge, zbijene perspektivom.
- `stil-resetka.png`: postojeća rešetka gledana spreda: uzor kako izgledaju šipke, okovi i šiljci.
- `stil-zid-kamen.png`: kamen iz igre (boja i veličina kamena). `stil-prop-palisada.png` i `stil-prop-kuca-brvnara.png`: drvo iz igre (brvna, okovi).

## Zajedničko

- Slikano, mat, toplo svetlo sleva, jasna tamna kontura, **bez crnih senki**, isti rukopis kao uzori.
- **Ništa nije savršeno ravno**: spoljne ivice zida su neravne (kamenovi vire i uvlače se po 5–20 px), kamenje je različite veličine, sa malterom, pukotinama, mahovinom u spojevima; ivica luka je od klesanih kamenova (klinasti kamenovi svoda), svaki malo drugačiji.
- Pogled: iz profila pod blagim uglom (oko 75°). Vidi se **lice preseka** (ono zauzima skoro celu širinu), a uz **levu ivicu** uska osvetljena traka spoljnog lica zida (oko 40–60 px) sa ugaonim kamenovima, da se vidi da zid ima debljinu.
- Svaka slika se crta na ravnoj jarko zelenoj #00ff00 pozadini, pa se zelena skida (i u prolazu). Na kraju pogledaj sliku na plavoj podlozi: ne sme ostati ni zelena ni tamni oreol.
- Slike idu u `art/world-pack-03/<ime>.png`. Najviše tri `image_gen` pokušaja po slici; ako ni treći ne valja, NE izvozi.

## Slike (redom)

| Ime | Veličina | Šta se vidi |
|---|---|---|
| `kapija-zid-kamen` | 832×1664, providno oko zida i u prolazu | Zid od tesanog i lomljenog kamena po `kapija-zid-mera.png`: masa zida iznad prolaza, sa svodom od klinastih kamenova, žlebom rešetke u sredini i po 104 px zida levo i desno od prolaza do dna. U preseku se vidi i punjenje zida (sitniji kamen i malter između dva lica). Gornja ivica slike seče zid (zid se nastavlja naviše, nema krova ni zubaca). |
| `kapija-zid-drvo` | 832×1664, isto | Seoska kapija po istoj meri: do visine svoda kamen kao gore, a iznad svoda masa od debelih tesanih brvana složenih vodoravno (vide se čela brvana i godovi na levoj ivici), sa gvozdenim okovima i klinovima; žleb rešetke u sredini. Toplo smeđe drvo, ne crne daske. |
| `kapija-pozadi-kamen` | 624×840, neprovidno | Zadnji zid prolaza (ono što se vidi iza Marka dok prolazi): kameni zid u blagoj senci, svetliji pri dnu gde pada svetlo sa druma, sa gvozdenim držačem baklje (bez plamena) i alkom. Ravan pod se NE crta. |
| `kapija-pozadi-drvo` | 624×840, neprovidno | Isto za seosku kapiju: zadnji zid od brvana i kamenog temelja (donja trećina kamen), u blagoj senci. |
| `kapija-resetka` | 256×1024, providno između šipki | Gvozdena rešetka po `kapija-resetka-mera.png`: uspravne šipke i vodoravne trake sa zakivcima, na dnu šiljci; tamno gvožđe sa svetlim ivicama, mestimično rđa. Vide se oba kraja rešetke i prostor između šipki je providan. |
| `kapija-resetka-drvo` | 256×1024, providno između greda | Ista rešetka od hrastovih greda okovanih gvožđem, sa gvozdenim šiljcima na dnu. |

Provera svake slike: tačna veličina; kod zida je prolaz providan tačno po meri (ivica prolaza na x=104 i x=728, vrh luka na oko y=780 od vrha slike, bokovi luka na y=920); žleb u sredini; ništa posebno u gornjih 416 px.
