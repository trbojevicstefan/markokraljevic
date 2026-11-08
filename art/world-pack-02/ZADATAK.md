# Zadatak za Codex — paket 02: tlo, Akindžijino trčanje, predmeti za ciljeve

Igra je u `marko-game/dist/`. Ti si nacrtao `art/world-pack-01` i `art/animation-pack-03`. Crtaj u istom stilu: `art/world-pack-01/reference/style-reference.png` i isti uvod prompta kao u `art/world-pack-01/plan.json`. Kod igre i `dist/` ne menjaj, njih povezujem ja (Claude). Slike čuvaj u `marko-game/art/world-pack-02/`. Animacija ide u `art/animation-pack-03/assets/akindzija-run-v2/`.

## 1. Tlo koje se nastavlja, za 12 ambijenata

`prop-tlo-*` iz prvog paketa su zaobljena ostrva i ne mogu da se ređaju jedno uz drugo. Svakom ambijentu treba traka tla koja se ponavlja bez šava.

Ambijenti: `selo`, `klisura`, `suma`, `manastir`, `tvrdjava`, `prevoj`, `pecina`, `podrum`, `mocvara`, `rudnik`, `rusevine`, `reka`.

Za svaki ambijent:

- **`tlo-<id>.png`**, tačno 1024×384, RGBA.
  - **Hodna linija:** gornja ivica tla, ravna, na y = 64 (± 4 px). Na njoj lik stoji.
  - **Iznad hodne linije:** sve providno. Trava, sneg ili kamenčići smeju da vire najviše 40 px.
  - **Ispod hodne linije:** presek tla do dna slike. Ka dnu je sve tamnije, a dno je skoro crno (#0b0f10) da se stopi sa ponorom.
  - **Bez šava vodoravno:** leva i desna ivica moraju da se nastave piksel na piksel.
    - Proveri skriptom: srednja razlika kolona x = 0 i x = 1023 manja od 6/255, plus test sa pomakom za pola širine.
    - Ako generator ne da traku bez šava, ispravi je sam (pomak za pola širine, pa retuš šava) i ponovi proveru.
- **`tlo-<id>-kraj.png`**, 192×384: desni kraj trake, kao rub litice. Hodna linija mu je ista (y = 64). Levi kraj dobijam ogledalom.

Materijal:

| Ambijent | Tlo |
|---|---|
| selo | trava, zemlja, kamenje |
| klisura | krečnjak |
| suma | mahovina, korenje |
| manastir | kamene ploče |
| tvrdjava | kaldrma, zid |
| prevoj | sneg preko stene |
| pecina | mokar kamen, tirkizni kristali |
| podrum | opeka, daske |
| mocvara | blato, trska |
| rudnik | šljunak, šine u tlu, drvene grede |
| rusevine | izlomljen kamen, bršljan |
| reka | pesak, oblutci, daske pristaništa |

Dovoljna je samo dnevna verzija, noć i oluju igra dobija senčenjem.

Dodaj i **`tlo-preview.png`**: svaka traka ponovljena 3 puta, da se vide eventualni šavovi.

## 2. Akindžija trči ponovo

U `art/animation-pack-03/assets/akindzija-run` (6 kadrova, 512×512) noge se ne smenjuju jasno i lik kao da kliže.

Nacrtaj ga ponovo:

- **Lik:** isti, po `art/animation-pack-03/sources/akindzija-run/base-source.png`, okrenut udesno.
- **Kadrovi:** 8 kadrova, ćelija 512×512.
- **Veličina i stopala:** lik iste veličine kao sada, a dno stopala na istom y kao u postojećim kadrovima.
- **Ciklus:** jasan trk. Za levu, pa za desnu nogu: kontakt, spuštanje, prolaz, odraz.
  - Noga u pozadini neka bude malo tamnija, da se noge razlikuju.
  - Telo poskakuje 6–10 px.
- **Izvoz:** kroz `sprite-gen` (extract → compose-atlas → compose-gif), u `assets/akindzija-run-v2/` (`atlas.png`, `manifest.json`, `frames/`). Stari klip ostavi.

## 3. Predmeti za ciljeve nivoa

Providni PNG, pogled sa strane, osnova predmeta na dnu slike. Bez senke-elipse ispod, bez slova, čiste alfa ivice. Platno 1024×1024, a za kapiju, portal i vodenicu može 1024×768 položeno. Predmet je visok 300–500 px, a kapija, portal i vodenica do 700.

| Fajl | Šta je | Nivo |
|---|---|---|
| `cilj-kapija-zatvorena`, `cilj-kapija-otvorena` | seoska drvena kapija s krovićem | selo |
| `cilj-bunar-svetli` | bunar sa zlatnim sjajem iz okna | selo |
| `cilj-poluga`, `cilj-poluga-povucena` | drvena poluga s lancem | klisura |
| `cilj-vilinski-kamen`, `cilj-vilinski-kamen-budan` | uspravan kamen s rezbarenim šarama; budan: šare svetle tirkizno-zlatno | suma (3 kom.) |
| `cilj-relikvija` | kovčežić s krstom na kamenom postolju | manastir |
| `cilj-opsadna-sprava`, `cilj-opsadna-sprava-srusena` | osmanski katapult, ceo i polomljen | tvrdjava |
| `cilj-kristal`, `cilj-kristal-svetli` | veliki kristal koji raste iz stene | pecina |
| `cilj-svetiljka`, `cilj-svetiljka-upaljena` | fenjer na drvenom stubu iz vode | mocvara (4 kom.) |
| `cilj-rudarski-izlaz-zatvoren`, `cilj-rudarski-izlaz-otvoren` | drveni portal rudnika s rešetkom | rudnik |
| `cilj-vodenica` | vodenica s točkom | reka |

## Predaja

- **`world-pack-02/catalog.json`:** za svaku sliku id, fajl, veličina i granice sadržaja. Za trake tla još `walkY` (stvarna hodna linija) i rezultat provere šava.
- **`world-pack-02/README.md`:** kratko, na srpskom.
- **Na kraju:** spisak gotovog i šta nije uspelo.
