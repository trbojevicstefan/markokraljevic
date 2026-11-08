# Marko — Tri srca Kačanika

Igriv prvi nivo 2D epskog platformera na srpskom. Vanilla JavaScript; svet se crta u Canvas 2D sloj, a Three.js (lokalna kopija u `dist/vendor/three/`, bez CDN-a) ga sklapa u scenu sa dubinom, svetlom i post-efektima. Bez WebGL-a igra automatski prelazi na čist 2D prikaz. Grafika je generisana ugrađenim Imagegen alatom i obrađena lokalnim sprite-gen 4.0.0.

## Pokretanje

Online igra: https://trbojevicstefan.github.io/markokraljevic/

GitHub Pages objavljuje isključivo `dist/` kroz `.github/workflows/pages.yml`. Svaki push na `main` prvo proverava sintaksu, fiziku, animacije i prolazak nivoa, zatim objavljuje igru. Svi runtime resursi, uključujući Three.js, koriste relativne lokalne putanje.

Node.js 22 ili noviji:

```sh
npm start
```

Otvori http://127.0.0.1:4173. `dist/` je kompletna statička igra i može se servirati bilo kojim HTTP serverom. Pokretanje dvoklikom preko `file://` nije podržano zbog ES modula i JSON manifesta.

## Prikaz i razmere

- `dist/assets/sprite-rig.json` (pravi ga `python build-sprite-rig.py`): jedna razmera po liku za sve animacije, izvedena iz veličine glave u svakom listu, plus tačka stopala i sidro po kadru. Marko je 128 jedinica visok u svakoj pozi (stajanje, trk, udarac, skok, vino, Šarac); Turci su oko 90% njegove visine, Musa je džin.
- Stopala stoje na liniji mahovine kamenog druma; senke prate tlo i smanjuju se u skoku.
- `dist/stage3d.js`: oslikana pozadina sa sunčevim zracima, maglom u klisuri i bojom po poglavlju (sumrak i munje na megdanu), 3D lišće ispred i iza likova, prašina u svetlu, vilinske iskre, žar, dubina ponora, bloom samo na magiji i varnicama, talasi udara, hromatska aberacija na odbijanju, vinjeta i zrno.
- „Smanjeno podrhtavanje i efekti“ u podešavanjima gasi talase udara, aberaciju i deo čestica.

## Zvuk

- **Glasovi** (`dist/assets/voice/`, pravi ih `python make-voice-lines.py`, treba `ELEVENLABS_API_KEY`): ElevenLabs `eleven_v4`. Marko je glas „Tuco" (vulgaran, psuje, na R viče „Marš u pičku materinu, Turci!"), Musa je „Slobodan", Ravijojla „Ida" (ženski, srpski), Turci viču na turskom. Zamah topuza prati stenjanje („Hah!", „Aaaaahh!") umesto „swoosh" zvuka, a Marko dobacuje Turcima kad su blizu. Igra bira nasumičnu repliku iz grupe (`kill_*`, `hurt_*`…), jedan lik govori jednu repliku u isto vreme, a muzika se utiša dok neko priča.
- **Efekti** (`dist/assets/sfx/`): udarci, metal, štit, koraci, sablja i pad tela iz Kenney CC0 paketa „Impact Sounds" i „RPG Audio" (licenca u `KENNEY-LICENSE.txt`); zamah, luk, magija, grom, kopita, gutljaj i rog su sintetisani u `make-audio.py`.
- **Muzika** (`dist/assets/music/`): komponovana i renderovana kodom u `make-audio.py` (gusle, tapan, hor, gudači, rogovi, reverb), bez spoljnih servisa. „Drum" (92 BPM, d-mol harmonski, 94 s) za nivo i meni, „Megdan" (124 BPM, frigijski dominantni, 62 s) za Musu; obe se vrte bez šava.

## Paket animacija 02 u igri

- **Novi protivnici:** akindžija (brz, juriša ili skače dvema sabljama), oklopnik (lak udarac odbija oklop; udar čekićem u tlo ili nalet štitom), palikuća (baca zapaljene baklje koje pale tlo, izbliza bljuje vatru). Osam novih protivnika raspoređeno je kroz I, II, III i V deonicu.
- **Marko:** Vihor (F) koristi osam nacrtanih faza okreta; teški udarac (K) koristi `marko-charged`: drži K da zadržiš pun zamah: šteta raste do ~3,4× (pun zamah ubija i štitonošu). Ako punjeni udarac ili super (R) zada smrtni udarac, protivnik odleti kroz vazduh, vrteći se, i klizne po tlu ostavljajući trag krvi; Musa takođe odleti ako ga dokrajčiš tako.
- **Orlovi** lete nebom sa paralaksom; **mangali** gore duž II, V i VI deonice.
- **Krv** šiklja na svaki pogodak, kaplje i ostaje na tlu, a pod palima se širi bara. Isključuje se u podešavanjima („Krv“).
- **Mobilne kontrole:** ikonice; topuz u uglu, ostale akcije u dva luka oko njega; manje strelice za kretanje.

## Kontrole

| Taster | Radnja |
|---|---|
| A / D ili strelice | Kretanje |
| Space / W / gore | Skok |
| J | Brzi udarac topuzom |
| K | Teški udarac, razbijanje garda |
| L | Drži za blok; pritisni u pravom trenutku za odbijanje |
| S / strelica dole | Čučanj, sporije kretanje i izbegavanje strela |
| R | Super udarac pri 100 junačkog besa |
| Shift | Izmicanje |
| E | Ravijojla / aktiviranje kamena / uzjahivanje Šarca |
| F (drži) | Vihor: Marko se vrti sa topuzom i udara sve oko sebe; traži 25 besa i troši ga dok se vrti |
| Q | Vino: 12 s, +30% štete, 20% manje primljene štete, +18 zdravlja |
| Esc | Pauza |

Dodirne kontrole se pojavljuju na uređajima sa primarnim touch pokazivačem. Podešavanja nude lakši režim, jačinu zvuka i manje podrhtavanja. Igra se automatski pauzira pri gubitku fokusa. Kontrolne tačke i podešavanja čuvaju se u localStorage, bez naloga ili server baze.

## Sadržaj

Šest povezanih deonica: Drum junaka, Zatočena kapija, Vilinski trag, Šarčev zalet, Poslednji barjak i Tri srca Kačanika. Ukupno 55 čuvara kroz osnovne susrete i devet talasa pojačanja; tri vilinska mosta; upravljiv Šarac; tri opciona zapisa koji povećavaju maksimalno zdravlje; završni megdan sa tri faze, dva zamaha i talasom po tlu.

Osmanski odred je antagonistička vojska u ovoj fikcionalnoj priči. Musa je samostalan odmetnik. Igra koristi srednjovekovne crvene barjake i stilizovane bele dvoglave orlove, a nije precizna istorijska rekonstrukcija. Istorijski Marko bio je osmanski vazal; epika i autorske mehanike jasno su objašnjene u meniju „O legendi“.

## Provere

```sh
npm run check
npm test
node simulation-test.mjs
```

Devet testova obuhvata raspored nivoa, kontrolne tačke, sudare, oba stanja vilinskog mosta, skokove peške i na konju, jedinstvene ID-jeve i pristup kamenovima. Simulacija koristi stvarnu logiku igre sa ulazima testnog igrača, bez menjanja položaja ili zdravlja. Završeni prolazak: oko 5:35, 55 poraženih čuvara, svi delovi i boss završeni. To nije ljudski playtest niti garancija najbržeg mogućeg prolaska; prvi ljudski prolazak zavisi od veštine.

Browser provere: početni meni, kretanje, borba i ubistvo neprijatelja, vino, jahanje/skok, otključavanje mosta, vilinski bljesak nad Musom, pauza, vraćanje sa kontrolne tačke i mobilni meni bez horizontalnog prelivanja. U proveravanim putanjama nije bilo JavaScript izuzetaka.

## Grafika i ograničenja prve verzije

`dist/assets/gorge.png` — panorama klisure. `dist/assets/cast/` — likovi i modularni objekti. `dist/assets/marko-run.png` i JSON manifest — šest frejmova trčanja. `art/marko-run/` čuva referencu, izvorni strip, recept, izdvojene frejmove, atlas i izveštaj sprite-gen provere bez upozorenja. `art/sources/` čuva izvorne listove.

Markovo trčanje i zamah koriste po šest kadrova. Šarac sa Markom u sedlu koristi šest kadrova galopa i četiri poze mirovanja, odraza, leta i doskoka. Ravijojla ima šest kadrova pojavljivanja i čaranja, putanju do cilja i sinhronizovan efekat čarolije. Njeno puno telo se vidi na poziv E, a tokom odmora predstavlja je svetleća tačka. Priprema, aktivni deo i povratak zamaha odvojeni su: pogodak je moguć samo u aktivnom delu. Markov skok i vino, Musin zamah, napadi sabljaša i štitonoše, i ispaljivanje strele sada koriste zasebne sekvence od po šest kadrova. Hod neprijatelja koristi zasebne nacrtane cikluse; mirovanje, odbijanje i sporedni efekti koriste proceduralnu animaciju. Animacije nisu motion-capture niti produkcijski verifikovane kao savršene. Zvuk je proceduralan preko Web Audio; nema snimljenih glasova ili orkestarske muzike. Ovo je dovršen igriv prvi nivo, a ne završna produkcijska igra.

## Vizuelni promptovi i obrada

Smrt sada ima 30 posebnih kadrova: po šest za Marka, Musu, sabljaša, štitonošu i strelca. Pad se ne ponavlja; telo se smiruje na tlu. Ekrani poraza i pobede čekaju 1,55 sekundi da se završni kadar vidi. Čuvari ostaju na zemlji pa blede; Marko i Musa ostaju do promene ekrana. Pauza zamrzava animaciju i čestice. Šarac preživljava Markov poraz.

Čučanj, blok i super udarac imaju još 18 nacrtanih kadrova. Čučanj smanjuje koliziju sa 112 na 64 jedinice. Frontalni blok smanjuje štetu za 80%, troši gard i može da se slomi; napadi iza leđa ga zaobilaze. Bes se puni pogocima, primljenom štetom i preciznim odbijanjem. Super udarac troši 100 besa, ima zasebnu pripremu/kontakt/povratak, razbija gard i pravi zlatne varnice i prašinu. Vrednosti garda i besa prikazane su u HUD-u; nove radnje postoje i na dodirnim kontrolama.

Izvori za ovu doradu: `art/death-combat-prompts.json`, osam odgovarajućih direktorijuma u `art/`, PNG/JSON atlasi u `dist/assets/`. Generisano ugrađenim Imagegen alatom i obrađeno sprite-gen ekstraktorom bez upozorenja. `simulation-test.mjs` proverava smrt, prizemljenje, odložene ekrane, čučanj ispod strele, blok sprijeda/pozadi, lom garda i cenu/tajming super udarca.

Dorada kretanja: sabljaš, štitonoša, strelac i Musa imaju po šest različitih nacrtanih kadrova (`*-run.png`). Ciklus zavisi od pređene udaljenosti; staje pri zaustavljanju, omamljenosti i pripremi napada. Nema pomeranja cele slike gore-dole. Postojeće skale i sidra Marka, Šarca, Ravijojle i prethodnih animacija ostaju neizmenjeni. `node animation-tests.mjs` proverava 24 kadra i oslonac stopala. Mirovanje i reakcija na pogodak koriste proceduralne pokrete; pad koristi zasebne nacrtane kadrove.

Izvori novih ciklusa: `art/{sword,shield,archer,musa}-run/raw/run.png`, recepti `sprite-request.json`, promptovi u `art/locomotion-prompts.json`. Ugrađeni Imagegen → sprite-gen `prepare`, `extract`, `compose-atlas` → postojeći `build-sprite-rig.py`. Ekstraktor je za sva četiri ciklusa završio bez upozorenja.

Generisano ugrađenim Imagegen alatom, bez zasebnih API ključeva. Kreativni briefovi: (1) panoramska Kačanička klisura, oslikani/cel-shaded stil, zlatne hrastove krošnje, tirkizna reka, srednjovekovni manastir i crveni barjaci sa belim dvoglavim orlom; (2) transparentan list sa Markovim mirovanjem, napadom i skokom, Šarcem, Ravijojlom i Musom; (3) transparentan list sabljaša, štitonoše, strelca, hrasta, kamene platforme i orlovske kapije; (4) šest uzastopnih bočnih poza Marka u trku, uz istu referentnu ilustraciju, na čistoj zelenoj pozadini.

Obrada listova koristila je `sprite-gen slice-sheet --chroma-key none --alpha-floor 64 --grid 3x2 --cell-width 384 --cell-height 384 --baseline-y 370 --target-height 350 --fit contain`. Trčanje: `prepare` → ugrađeni Imagegen za jedan red → `extract` → `compose-atlas` → `inspect`. Generisanje reda je urađeno direktnim ugrađenim alatom umesto CLI `gen-set`; ekstrakcija i atlas koriste originalne sprite-gen faze. Runtime čita `frame_layout` iz manifesta.

## Izvori

- https://sr.wikisource.org/sr-el/Марко_Краљевић_и_Муса_кесеџија
- https://sr.wikisource.org/sr-el/Марко_Краљевић_и_вила
- https://www.enciklopedija.hr/clanak/kraljevic-marko
- https://github.com/aldegad/sprite-gen — Apache-2.0, lokalna alatka za obradu grafike; nije runtime zavisnost.

Nova animaciona grafika i izvorni promptovi: `art/animation-prompts.json`; atlasi `dist/assets/mounted-run.png`, `mounted-jump.png`, `fairy-cast.png`, `marko-attack.png` sa odgovarajućim manifestima. Svi su generisani ugrađenim Imagegen alatom, izdvojeni originalnim sprite-gen komponentnim ekstraktorom i poravnati opcijom centroid.

## Pokretanje dvoklikom

Na Windowsu otvori `Igraj.cmd`. Potreban je Node.js 22+. Launcher pokreće lokalni server i tek kada je spreman otvara browser; ako igra već radi, otvara postojeću instancu. Paket `Marko-Tri-srca-Kacanika.zip` sadrži igru i launcher. Za animacione izvore vidi `art/combat-animation-prompts.json`.
