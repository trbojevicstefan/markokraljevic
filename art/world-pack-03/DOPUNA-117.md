# Dopuna 117 (od Claude-a, 19. 11.): dvanaest delija i scena lova (sedmi pohod, „Lov Markov s Turcima”)

Stefan (19. 11.): „Da postoji svaki lik iz pesme i svaka animacija, do najsitnijeg detalja.”

U pesmi: „Lov lovio Murate vezire … sa svojijeh dvanaest delija … na zeleno u gori jezero, po kom plove utve zlatokrile … soko pade na jelu zelenu … Pusti Marko svojega sokola … pobjegoše po polju delije kao vrapci od kopca po trnju … a od mladih dvanaest delija on načini dvadest i četiri.” Prave se: delija (dušman, ceo komplet), Marko koji pušta sokola, utva koja plovi i vezirev soko koji sedi na grani.

Status piši u `art/world-pack-03/STATUS-D117.md` (napravi ga), red posle SVAKE stavke, sa oznakom `D117`. **Uradi sve stavke do kraja, ne staj i ne pitaj posle prve.**

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, druge `STATUS-*` fajlove, tuđe foldere klipova, git, fajlove `*dopuna41*`. Paralelno rade D116 i D118: ne diraj njihove fajlove.

## Uzori (`art/world-pack-03/uzori-d117/`)

- `katana-idle-kadar0.png`: katana iz igre, ćelija 512×512, stopala na y=488, visok 426 px, gleda udesno. **Uzor mere, tela i položaja u ćeliji** za deliju.
- `pokret-katana-idle.png`, `-run`, `-attack`, `-hurt`, `-death`: **uzor POKRETA** za klip istog imena (isti broj kadrova, isti tok, isti položaj u ćeliji, gleda udesno).
- `marko-stoji-kadar.png`: **Marko kako stoji u igri** (gleda udesno, 379 px): uzor lika, odeće i mere za `marko-pusta-sokola`.
- `soko-let-kadar0.png`: Markov sivi soko u letu; `utva-let-kadar0.png`: utva zlatokrila u letu (zlatna krila, zelena glava). **Uzor ptica i njihove mere.**

## Kako izgleda delija

Delija je turski laki konjanik, „ludo hrabar”, kićen da plaši: mlad, crni brkovi bez brade, **visoka kapa od leopardove kože sa dva orlova krila pričvršćena sa strane**, **preko ramena ogrnuta leopardova koža sa šapama vezanim na grudima**, crvena kratka dolama, široke plave čakšire, žute čizme sa mamuzama, o bedru kriva sablja, na leđima mali okrugli štit. Uspravan visok oko 426 px (kao katana), ali sa krilima na kapi sme do 460. Mora se odmah razlikovati od katane (zeleno-crveno, husar) i janičara.

## Pravila (ista kao u `DOPUNA-105.md`)

- Ćelija 512×512, sigurna margina 24 px (kod `-run`, `-bezi` i `-hurt` 8 px), providna pozadina, bez teksta, tla, senke, zvezdica i efekata.
- Jedan `image_gen` poziv crta mrežu (3×2 za 6 kadrova, 4×2 za 8, 2×2 za 4) na ravnoj jarko zelenoj #00ff00; iseci polja, skini zelenu, svaki kadar u svoju ćeliju. Bez okvira ćelije, linija mreže i komada susednog kadra. **Proveri i zatvorene praznine (između ruke i tela, između nogu): ni tu ne sme ostati zelena.** Utva ima zelenu glavu: nju crtaj na jarko ljubičastoj #ff00ff.
- Stopala na y=488 (±2 px); lik na istom mestu u ćeliji kao u uzoru pokreta.
- **Ne razvlači kadrove na istu visinu.** Ako je lik malo veći ili manji od traženog, smanji ili uvećaj ceo klip istom razmerom i izvezi (upiši `k=` u status).
- Klip ide u `art/animation-pack-04/assets/<klip>/`: `atlas.png`, `manifest.json` sa `frame_layout`, `frames/motion/frame-N.png`, `preview.gif`, `qa.json`. JSON bez BOM-a. Radni fajlovi u `art/animation-pack-04/sources/<klip>/attempt-N/`.
- Postupak: `art/world-pack-03/export-dopuna112.py` i `verify-dopuna112.py`, prilagođeni (svoje kopije zovi `export-dopuna117.py` i `verify-dopuna117.py`).
- **Prvo** napravi `delija-idle` kao uređivanje `katana-idle-kadar0.png` (presvuci ga u deliju; poza i mera iste). Njegov kadar 0 je uzor lika za ostale klipove delije.
- Najviše dva pokušaja po klipu (za Markov klip tri).

## Klipovi (redom)

| Klip | Kadrova | Petlja | Šta radi |
|---|---|---|---|
| `delija-idle` | 6 | da | po `pokret-katana-idle.png`: stoji sa sabljom, šepuri se, krila na kapi zatrepere |
| `delija-run` | 6 | da | po `pokret-katana-run.png`: trči u napad, sablja napred |
| `delija-attack` | 6 | ne | po `pokret-katana-attack.png` |
| `delija-hurt` | 4 | ne | po `pokret-katana-hurt.png` |
| `delija-death` | 6 | ne | po `pokret-katana-death.png`: pada na leđa, kapa sa krilima odleti |
| `delija-bezi` | 6 | da | **beži glavom bez obzira (udesno), sablja u koricama, ruke mlataraju, leopardova koža vijori, osvrće se preko ramena razrogačenih očiju** („kao vrapci od kopca po trnju”). Ista mera kao `delija-run`. |
| `marko-pusta-sokola` | 8 | ne | **Marko stoji kao u `marko-stoji-kadar.png` (ista odeća, topuz o pojasu), na podignutoj levoj ruci u kožnoj rukavici sedi njegov sivi soko**; 0–1: gleda sokola, kaže mu nešto; 2–3: spusti ruku pa je snažno izbaci napred-gore; 4–5: soko širi krila i odvaja se; 6–7: ruka ispružena uvis, sokola više nema u kadru, Marko gleda za njim i smeši se. Gleda udesno. Ista visina kao u uzoru (±3 %), stopala na y=488. |
| `utva-plovi` | 6 | da | **utva zlatokrila plovi po vodi, gledana s boka** (kao patka na jezeru): zlatna krila sklopljena uz telo, zelena glava, žut kljun; lagano se ljulja, zamahne krilima pa ih sklopi, zaroni kljun. Mala: dugačka oko 190 px, visoka oko 120 px; **donja ivica tela (linija vode) na y=488**, noge se ne vide. Gleda udesno. |
| `soko-vezirov-sedi` | 4 | da | **sivi soko sedi na kratkoj grani** (grana je deo klipa, vodoravna, dugačka oko 200 px), nakostrešen, pognute glave, ljutito se osvrće, protrese perje. Ptica visoka oko 150 px; grana na y oko 400, ništa ispod nje. Gleda ulevo. |
