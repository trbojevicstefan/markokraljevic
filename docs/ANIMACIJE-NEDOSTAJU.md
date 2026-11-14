# Animacije koje nedostaju

Stanje na dan 13. 11. 2026, grana `noc-poliranje` (isto što i `main`, commit 0090026). Spisak je napravljen iz `dist/assets/sprite-rig.json` (440 klipova) i iz mesta u `dist/game.js` gde igra za neki potez traži klip pa, kad ga nema, uzme tuđi ili ga nadomesti kodom.

- **Nijedan klip koji kod imenuje ne nedostaje.** Sve ispod su potezi koji danas rade, ali sa zamenskim crtežom.
- **A**: zamena se vidi u igri (tuđe oružje u ruci, zaleđen kadar, klip trčanja na lestvama).
- **B**: obogaćenje; igra bez toga izgleda ispravno.
- Broj kadrova i način puštanja su predlog po uzoru na postojeće klipove (ćelija 512×512, oslonac y=487, lik gleda udesno).
- Referentna slika je kadar 0 klipa stajanja, isečen iz lista koji igra učitava. To je uzor za lik i odeću koji se daje Codexu.

Ukupno: **77 klipova** (39 oznake A, 38 oznake B) kod 28 likova.

## Pregled

| Lik | Referentna slika | A | B |
|---|---|---|---|
| [Marko (topuz)](#marko) | [slika](reference/likovi/marko.png) |  | 1 |
| [Marko sa očevom sabljom](#marko-sablja) | [slika](reference/likovi/marko-sablja.png) | 9 | 7 |
| [Marko na Šarcu](#marko-na-sarcu) | [slika](reference/likovi/marko-na-sarcu.png) | 2 | 1 |
| [Šarac](#sarac) | [slika](reference/likovi/sarac.png) | 1 | 1 |
| [Vila Ravijojla](#vila) | [slika](reference/likovi/vila.png) | 3 | 1 |
| [Miloš, Markov pobratim](#milos) | nema | 1 | 1 |
| [Musa Kesedžija](#musa) | [slika](reference/likovi/musa.png) | 3 | 2 |
| [Janičar sabljaš](#sword) | [slika](reference/likovi/sword.png) |  |  |
| [Štitonoša](#shield) | [slika](reference/likovi/shield.png) | 1 | 2 |
| [Strelac](#archer) | [slika](reference/likovi/archer.png) | 1 | 3 |
| [Akindžija](#akindzija) | [slika](reference/likovi/akindzija.png) | 1 | 3 |
| [Oklopnik](#oklopnik) | [slika](reference/likovi/oklopnik.png) | 1 | 1 |
| [Palikuća](#palikuca) | [slika](reference/likovi/palikuca.png) | 1 | 1 |
| [Kopljanik](#kopljanik) | [slika](reference/likovi/kopljanik.png) | 1 | 3 |
| [Tufekdžija](#tufekdzija) | [slika](reference/likovi/tufekdzija.png) | 1 | 1 |
| [Pas](#pas) | [slika](reference/likovi/pas.png) | 1 | 1 |
| [Hasan-aga Oklopnik](#hasan-aga) | [slika](reference/likovi/hasan-aga.png) | 1 |  |
| [Janičarski aga](#janicarski-aga) | [slika](reference/likovi/janicarski-aga.png) | 1 |  |
| [Ognjeni aga](#ognjeni-aga) | [slika](reference/likovi/ognjeni-aga.png) | 1 |  |
| [Lovac-aga](#lovac-aga) | [slika](reference/likovi/lovac-aga.png) | 1 |  |
| [Kopljanik-baša](#kopljanik-basa) | [slika](reference/likovi/kopljanik-basa.png) | 1 | 2 |
| [Arapin](#arapin) | [slika](reference/likovi/arapin.png) | 1 |  |
| [Bajraktar](#bajraktar) | [slika](reference/likovi/bajraktar.png) | 1 |  |
| [Tufekdžija-baša](#basa) | [slika](reference/likovi/basa.png) | 1 | 1 |
| [Akindžijski beg](#beg) | [slika](reference/likovi/beg.png) | 1 |  |
| [Đemo Brđanin](#djemo) | [slika](reference/likovi/djemo.png) | 1 | 1 |
| [Dželat](#dzelat) | [slika](reference/likovi/dzelat.png) | 1 | 1 |
| [Mladi Turčin sa očevom sabljom](#mladi-turcin) | [slika](reference/likovi/mladi-turcin.png) | 1 | 3 |
| [Aždaja](#azdaja) | [slika](reference/likovi/azdaja.png) |  | 1 |
| [Carev čauš](#caus) | [slika](reference/likovi/caus.png) |  |  |
| [Vrač](#vrac) | [slika](reference/likovi/vrac.png) |  |  |
| [Kostur](#kostur) | [slika](reference/likovi/kostur.png) |  |  |
| [Guslar](#guslar) | [slika](reference/likovi/guslar.png) |  |  |
| [Kovač Novak](#novak) | [slika](reference/likovi/novak.png) |  |  |
| [Krčmarica Janja](#janja) | [slika](reference/likovi/janja.png) |  |  |
| [Putnik starac](#putnik-starac) | [slika](reference/likovi/putnik-starac.png) |  |  |
| [Putnik trgovac](#putnik-trgovac) | [slika](reference/likovi/putnik-trgovac.png) |  |  |
| [Putnik kaluđer](#putnik-kaluder) | [slika](reference/likovi/putnik-kaluder.png) |  |  |
| [Putnica](#putnica) | [slika](reference/likovi/putnica.png) |  |  |
| [Sirotinja](#sirotinja) | [slika](reference/likovi/sirotinja.png) |  |  |
| [Trgovac za tezgom](#trgovac) | [slika](reference/likovi/trgovac.png) |  |  |
| [Svatovi](#svatovi) | [slika](reference/likovi/svatovi.png) |  |  |
| [Mlada](#mlada) | [slika](reference/likovi/mlada.png) |  |  |
| [Mladoženja](#mladozenja) | [slika](reference/likovi/mladozenja.png) |  |  |
| [Soko](#soko) | [slika](reference/likovi/soko.png) |  |  |
| [Orao](#orao) | [slika](reference/likovi/orao.png) |  |  |
| [Volovi sa ralom](#volovi) | [slika](reference/likovi/volovi.png) |  |  |
| [Utva zlatokrila](#utva) | [slika](reference/likovi/utva.png) |  |  |

## Likovi kojima nešto nedostaje

<a id="marko"></a>
### Marko (topuz)

![Marko (topuz)](reference/likovi/marko.png)

Referentna slika: [reference/likovi/marko.png](reference/likovi/marko.png) (iz `dist/assets/marko-idle-2.png`, klip `marko-idle-2`, kadar 0)

Ima 98 klipova: `marko-air-1`, `marko-air-2`, `marko-air-3`, `marko-attack`, `marko-blasted`, `marko-block`, `marko-block-hit`, `marko-block-walk`, `marko-brutal`, `marko-call`, `marko-call-walk`, `marko-charge-hold`, `marko-charge-walk`, `marko-charged`, `marko-climb`, `marko-combo-1`, `marko-combo-2`, `marko-combo-3`, `marko-combo-4`, `marko-combo-recover`, `marko-counter`, `marko-crouch`, `marko-crouch-throw`, `marko-crouch-walk`, `marko-dash-strike`, `marko-death`, `marko-dize-ralo`, `marko-dizzy`, `marko-drink`, `marko-drink-walk`, `marko-fall`, `marko-finisher`, `marko-finisher-legs`, `marko-finisher-skull`, `marko-finisher-smash`, `marko-finisher-stomp`, `marko-finisher-throw`, `marko-getup`, `marko-hang`, `marko-hurt`, `marko-hurt-air`, `marko-idle`, `marko-idle-2`, `marko-idle-3`, `marko-idle-4`, `marko-jump`, `marko-jump-rise`, `marko-kick`, `marko-klizanje`, `marko-knockdown`, `marko-krilo`, `marko-kuka-baci`, `marko-kuka-let`, `marko-lanac-trgne`, `marko-lanac-vuce`, `marko-land`, `marko-launcher`, `marko-ledge`, `marko-lever`, `marko-mounted-attack`, `marko-nalet`, `marko-nalet-kraj`, `marko-odmor`, `marko-odmor-ustaje`, `marko-oko`, `marko-okovan`, `marko-open`, `marko-ore`, `marko-pickup`, `marko-plunge`, `marko-pocinak`, `marko-potres`, `marko-push`, `marko-roll`, `marko-roll-land`, `marko-run`, `marko-run-attack`, `marko-run-jump`, `marko-run-start`, `marko-run-stop`, `marko-slide`, `marko-super`, `marko-teeter`, `marko-throw`, `marko-tiho`, `marko-trag-ostavi`, `marko-trag-povratak`, `marko-turn`, `marko-uppercut`, `marko-victory`, `marko-vihor`, `marko-walk`, `marko-walljump`, `marko-wallslide`, `marko-wounded-walk`, `marko-zid-trk`, `marko-zid-trk-vodoravno`, `marko-zvizduk`.

| Klip | Kadrova | Puštanje | Šta se vidi | Šta igra sada radi | |
|---|---|---|---|---|---|
| `marko-prima-moc` | 6 | jednom | Pruža ruku ka znaku moći nad oltarom, znak mu uleti u grudi, on stegne pesnicu. | Nema poze: Marko stoji ili hoda dok znak uleće u njega. | B |

<a id="marko-sablja"></a>
### Marko sa očevom sabljom

![Marko sa očevom sabljom](reference/likovi/marko-sablja.png)

Referentna slika: [reference/likovi/marko-sablja.png](reference/likovi/marko-sablja.png) (iz `dist/assets/marko-sablja-idle.png`, klip `marko-sablja-idle`, kadar 0)

Ima 16 klipova: `marko-sablja-glava`, `marko-sablja-idle`, `marko-sablja-izvlaci`, `marko-sablja-preseci`, `marko-sablja-proburazi`, `marko-sablja-skok`, `marko-sablja-tezak`, `marko-sablja-tiho`, `marko-sablja-trci`, `marko-sablja-ubod`, `marko-sablja-udarac-1`, `marko-sablja-udarac-2`, `marko-sablja-udarac-3`, `marko-sablja-uvis`, `marko-sablja-vihor`, `marko-sablja-vraca`.

| Klip | Kadrova | Puštanje | Šta se vidi | Šta igra sada radi | |
|---|---|---|---|---|---|
| `marko-sablja-prolet` | 6 | jednom | K: zalet nisko, prolazi kroz protivnika sa sabljom ispruženom u stranu, izlazi mu za leđa i okreće se. | Koristi `marko-sablja-ubod` (ubod u mestu), pa prolazak izgleda kao klizanje. | A |
| `marko-sablja-blok` | 4 | drži poslednji | L: sablja poprečno pred licem, druga ruka iza leđa. | Crta se `marko-block` (topuz i štit u ruci, sablje nema). | A |
| `marko-sablja-blok-udarac` | 4 | jednom | Primljen udarac na sablju, odstupi pola koraka. | Crta se `marko-block-hit` sa topuzom. | A |
| `marko-sablja-kontra` | 6 | jednom | Riposta posle savršenog odbijanja: odbije sabljom nagore i poseče preko grudi. | Crta se `marko-counter` sa topuzom. | A |
| `marko-sablja-pogodjen` | 4 | jednom | Trzaj unazad sa sabljom u ruci. | Crta se `marko-hurt` sa topuzom. | A |
| `marko-sablja-hoda` | 8 | petlja | Hod sa sabljom spuštenom uz nogu. | Koristi se trk (`marko-sablja-trci`) i pri sporom hodu. | A |
| `marko-sablja-vazduh-1` | 5 | jednom | Prvi rez u skoku, vodoravno. | Jedan klip `marko-sablja-skok` služi za skok, pad i sva tri udarca u vazduhu. | A |
| `marko-sablja-vazduh-2` | 5 | jednom | Drugi rez u skoku, odozdo nagore. | Isto kao gore. | A |
| `marko-sablja-vazduh-3` | 6 | jednom | Treći rez u skoku, odozgo nadole, zakucava. | Isto kao gore. | A |
| `marko-sablja-cucanj` | 4 | drži poslednji | Čučanj sa sabljom preko kolena. | Crta se `marko-crouch` sa topuzom. | B |
| `marko-sablja-cucanj-hoda` | 6 | petlja | Hod u čučnju sa sabljom. | Crta se `marko-crouch-walk` sa topuzom. | B |
| `marko-sablja-kolut` | 6 | jednom | Kolut sa sabljom uz telo. | Crta se `marko-roll` sa topuzom. | B |
| `marko-sablja-nadole` | 5 | jednom | S + J u skoku: sablja vrhom nadole. | Crta se `marko-plunge` sa topuzom. | B |
| `marko-sablja-pad` | 6 | jednom | Oboren na leđa, sablja ostaje u ruci. | Crta se `marko-knockdown` sa topuzom. | B |
| `marko-sablja-ustaje` | 6 | jednom | Ustaje oslonjen na sablju. | Crta se `marko-getup` sa topuzom. | B |
| `marko-sablja-smrt` | 6 | jednom, drži poslednji | Pada, sablja mu ispada iz ruke. | Crta se `marko-death` sa topuzom. | B |

<a id="marko-na-sarcu"></a>
### Marko na Šarcu

![Marko na Šarcu](reference/likovi/marko-na-sarcu.png)

Referentna slika: [reference/likovi/marko-na-sarcu.png](reference/likovi/marko-na-sarcu.png) (iz `dist/assets/mounted-run.png`, klip `mounted-run`, kadar 0)

Ima 2 klipova: `mounted-jump`, `mounted-run`.

Postoje i `marko-mounted-attack` (udarac sa sedla) i `marko-zvizduk`.

| Klip | Kadrova | Puštanje | Šta se vidi | Šta igra sada radi | |
|---|---|---|---|---|---|
| `mounted-idle` | 6 | petlja | Sedi u sedlu, Šarac premešta težinu i maše repom. | Kadar 0 klipa `mounted-jump`, nepomičan. | A |
| `mounted-baca` | 6 | jednom | U galopu zamahne i baci topuz napred i uvis (potera za vilom, I). | Nema poze: topuz poleti dok Marko jaše kao da ništa nije bilo. | A |
| `mounted-pogodjen` | 4 | jednom | Trzaj u sedlu kad ga pogodi strela ili udari balvan. | Nema poze, samo bljesak. | B |

<a id="sarac"></a>
### Šarac

![Šarac](reference/likovi/sarac.png)

Referentna slika: [reference/likovi/sarac.png](reference/likovi/sarac.png) (iz `dist/assets/cast/sarac.png`, klip `cast/sarac`, kadar 0)

Ima 1 klipova: `sarac-galop`.

| Klip | Kadrova | Puštanje | Šta se vidi | Šta igra sada radi | |
|---|---|---|---|---|---|
| `sarac-ceka` | 6 | petlja | Stoji osedlan, kopa kopitom, trese grivom. | Nepomična slika `cast/sarac.png` dok čeka Marka (šuma, megdan). | A |
| `sarac-propinje` | 6 | jednom | Propne se kad Marko uzjaše. | Nema: Marko se samo pojavi u sedlu. | B |

<a id="vila"></a>
### Vila Ravijojla

![Vila Ravijojla](reference/likovi/vila.png)

Referentna slika: [reference/likovi/vila.png](reference/likovi/vila.png) (iz `dist/assets/vila-let.png`, klip `vila-let`, kadar 0)

Ima 4 klipova: `vila-carolija`, `vila-isceljenje`, `vila-let`, `vila-spreda`.

Stari jednokadarni `fairy-cast` se više ne koristi kad postoji `vila-let`.

| Klip | Kadrova | Puštanje | Šta se vidi | Šta igra sada radi | |
|---|---|---|---|---|---|
| `vila-strelja` | 6 | jednom | U letu se okrene preko ramena i odapne strelu unazad. | Strela poleti iz klipa `vila-let`, vila se ne okreće. | A |
| `vila-pogodjena` | 6 | jednom, drži poslednji | Topuz je pogađa među pleći, krila klonu, pada. | Klip `vila-let` zarotiran za 50 stepeni. | A |
| `vila-moli` | 6 | petlja | Kleči na zemlji sklopljenih ruku („Bogom brate, Kraljeviću Marko”). | Isti zarotirani `vila-let` leži na zemlji. | A |
| `vila-vida` | 8 | jednom | Nadnesena nad ranjenikom, stavlja bilje na ranu, svetlost iz ruku. | Nema: samo poruka na ekranu. | B |

<a id="milos"></a>
### Miloš, Markov pobratim

Nema referentne slike, jer lik još nije nacrtan. Uzor za odeću: Marko (isti stalež, bez plašta), `reference/likovi/marko.png`.

| Klip | Kadrova | Puštanje | Šta se vidi | Šta igra sada radi | |
|---|---|---|---|---|---|
| `milos-ranjen` | 4 | petlja | Leži kraj druma sa strelom u grlu i u srcu, diše teško. | Lik ne postoji: pesma ga pominje u tekstu, na ekranu ga nema. | A |
| `milos-ustaje` | 6 | jednom | Posle vilinog bilja pridiže se i ustaje. | Isto: lik ne postoji. | B |

<a id="musa"></a>
### Musa Kesedžija

![Musa Kesedžija](reference/likovi/musa.png)

Referentna slika: [reference/likovi/musa.png](reference/likovi/musa.png) (iz `dist/assets/musa-idle.png`, klip `musa-idle`, kadar 0)

Ima 11 klipova: `musa-attack`, `musa-block`, `musa-death`, `musa-grab`, `musa-hurt`, `musa-idle`, `musa-roar`, `musa-run`, `musa-stomp`, `musa-sword`, `musa-throw-up`.

Na konju ima `musa-mounted` i `musa-mounted-strike`.

| Klip | Kadrova | Puštanje | Šta se vidi | Šta igra sada radi | |
|---|---|---|---|---|---|
| `musa-drugi` | 6 | jednom | Drugi zamah odmah posle prvog, s druge strane. | Kadar 2 klipa `musa-attack`, zaleđen. | A |
| `musa-skok` | 6 | jednom | Čučne, skoči sa topuzom nad glavom, doskoči udarcem. | Kadrovi 0, 2 i 3 klipa `musa-attack`, spljošteni i podignuti kodom. | A |
| `musa-zaglavljen` | 4 | petlja | Topuz zariven u zemlju, vuče ga i ne može da ga izvuče. | Kadar 4 klipa `musa-attack` koji podrhtava. | A |
| `musa-juris` | 6 | petlja | Juriš sa spuštenim ramenom i topuzom iza sebe. | Obično trčanje (`musa-run`) nagnuto kodom. | B |
| `musa-omamljen` | 4 | petlja | Zaslepljen Ravijojlinim bljeskom, zaklanja oči, tetura se. | Nisam proverio koji se kadar tada vidi; svog klipa nema. | B |

<a id="shield"></a>
### Štitonoša

![Štitonoša](reference/likovi/shield.png)

Referentna slika: [reference/likovi/shield.png](reference/likovi/shield.png) (iz `dist/assets/shield-idle.png`, klip `shield-idle`, kadar 0)

Ima 13 klipova: `shield-attack`, `shield-bash`, `shield-budi`, `shield-death`, `shield-drugi`, `shield-guardbreak`, `shield-hurt`, `shield-idle`, `shield-jump`, `shield-launch`, `shield-omamljen`, `shield-run`, `shield-spava`.

| Klip | Kadrova | Puštanje | Šta se vidi | Šta igra sada radi | |
|---|---|---|---|---|---|
| `shield-climb` | 6 | petlja | Penje se uz lestve, oružje zadenuto za pojas ili na leđima. | Na lestvama se vrti klip trčanja (samo sabljaš ima `sword-climb`). | A |
| `shield-tiho-pada` | 5 | jednom, drži poslednji | Tihi pad posle udarca s leđa: klone na kolena pa na stranu, bez zamaha. | Obična smrt (`-death`), kao u otvorenom boju. | B |
| `shield-straza` | 4 | petlja | U tandemu sa strelcem: čuči iza štita na jednom kolenu i čeka. | Stoji u `shield-idle` pred strelcem. | B |

<a id="archer"></a>
### Strelac

![Strelac](reference/likovi/archer.png)

Referentna slika: [reference/likovi/archer.png](reference/likovi/archer.png) (iz `dist/assets/archer-idle.png`, klip `archer-idle`, kadar 0)

Ima 11 klipova: `archer-death`, `archer-hurt`, `archer-idle`, `archer-jump`, `archer-kick`, `archer-launch`, `archer-omamljen`, `archer-rafal`, `archer-run`, `archer-shoot`, `archer-shoot-down`.

| Klip | Kadrova | Puštanje | Šta se vidi | Šta igra sada radi | |
|---|---|---|---|---|---|
| `archer-climb` | 6 | petlja | Penje se uz lestve, oružje zadenuto za pojas ili na leđima. | Na lestvama se vrti klip trčanja (samo sabljaš ima `sword-climb`). | A |
| `archer-tiho-pada` | 5 | jednom, drži poslednji | Tihi pad posle udarca s leđa: klone na kolena pa na stranu, bez zamaha. | Obična smrt (`-death`), kao u otvorenom boju. | B |
| `archer-spava` | 4 | petlja | Spava kraj vatre, sedeći ili na boku. | Ovaj lik nikad ne spava: u logorima spavaju samo sabljaš i štitonoša. | B |
| `archer-budi` | 6 | jednom | Trgne se iz sna, dohvati oružje i ustane. | Kao gore, ide uz `-spava`. | B |

<a id="akindzija"></a>
### Akindžija

![Akindžija](reference/likovi/akindzija.png)

Referentna slika: [reference/likovi/akindzija.png](reference/likovi/akindzija.png) (iz `dist/assets/akindzija-idle.png`, klip `akindzija-idle`, kadar 0)

Ima 11 klipova: `akindzija-backstep`, `akindzija-charge`, `akindzija-death`, `akindzija-drugi`, `akindzija-hurt`, `akindzija-idle`, `akindzija-jump`, `akindzija-launch`, `akindzija-omamljen`, `akindzija-run`, `akindzija-spin`.

| Klip | Kadrova | Puštanje | Šta se vidi | Šta igra sada radi | |
|---|---|---|---|---|---|
| `akindzija-climb` | 6 | petlja | Penje se uz lestve, oružje zadenuto za pojas ili na leđima. | Na lestvama se vrti klip trčanja (samo sabljaš ima `sword-climb`). | A |
| `akindzija-tiho-pada` | 5 | jednom, drži poslednji | Tihi pad posle udarca s leđa: klone na kolena pa na stranu, bez zamaha. | Obična smrt (`-death`), kao u otvorenom boju. | B |
| `akindzija-spava` | 4 | petlja | Spava kraj vatre, sedeći ili na boku. | Ovaj lik nikad ne spava: u logorima spavaju samo sabljaš i štitonoša. | B |
| `akindzija-budi` | 6 | jednom | Trgne se iz sna, dohvati oružje i ustane. | Kao gore, ide uz `-spava`. | B |

<a id="oklopnik"></a>
### Oklopnik

![Oklopnik](reference/likovi/oklopnik.png)

Referentna slika: [reference/likovi/oklopnik.png](reference/likovi/oklopnik.png) (iz `dist/assets/oklopnik-idle.png`, klip `oklopnik-idle`, kadar 0)

Ima 13 klipova: `oklopnik-armorbreak`, `oklopnik-death`, `oklopnik-drugi`, `oklopnik-grab`, `oklopnik-hurt`, `oklopnik-idle`, `oklopnik-jump`, `oklopnik-kostur-pada`, `oklopnik-launch`, `oklopnik-omamljen`, `oklopnik-rush`, `oklopnik-slam`, `oklopnik-walk`.

| Klip | Kadrova | Puštanje | Šta se vidi | Šta igra sada radi | |
|---|---|---|---|---|---|
| `oklopnik-climb` | 6 | petlja | Penje se uz lestve, oružje zadenuto za pojas ili na leđima. | Na lestvama se vrti klip trčanja (samo sabljaš ima `sword-climb`). | A |
| `oklopnik-tiho-pada` | 5 | jednom, drži poslednji | Tihi pad posle udarca s leđa: klone na kolena pa na stranu, bez zamaha. | Obična smrt (`-death`), kao u otvorenom boju. | B |

<a id="palikuca"></a>
### Palikuća

![Palikuća](reference/likovi/palikuca.png)

Referentna slika: [reference/likovi/palikuca.png](reference/likovi/palikuca.png) (iz `dist/assets/palikuca-idle.png`, klip `palikuca-idle`, kadar 0)

Ima 11 klipova: `palikuca-bomb`, `palikuca-burn`, `palikuca-death`, `palikuca-fire`, `palikuca-hurt`, `palikuca-idle`, `palikuca-jump`, `palikuca-launch`, `palikuca-omamljen`, `palikuca-run`, `palikuca-torch`.

| Klip | Kadrova | Puštanje | Šta se vidi | Šta igra sada radi | |
|---|---|---|---|---|---|
| `palikuca-climb` | 6 | petlja | Penje se uz lestve, oružje zadenuto za pojas ili na leđima. | Na lestvama se vrti klip trčanja (samo sabljaš ima `sword-climb`). | A |
| `palikuca-tiho-pada` | 5 | jednom, drži poslednji | Tihi pad posle udarca s leđa: klone na kolena pa na stranu, bez zamaha. | Obična smrt (`-death`), kao u otvorenom boju. | B |

<a id="kopljanik"></a>
### Kopljanik

![Kopljanik](reference/likovi/kopljanik.png)

Referentna slika: [reference/likovi/kopljanik.png](reference/likovi/kopljanik.png) (iz `dist/assets/kopljanik-idle.png`, klip `kopljanik-idle`, kadar 0)

Ima 10 klipova: `kopljanik-attack`, `kopljanik-death`, `kopljanik-drugi`, `kopljanik-hurt`, `kopljanik-idle`, `kopljanik-jump`, `kopljanik-launch`, `kopljanik-omamljen`, `kopljanik-run`, `kopljanik-sweep`.

| Klip | Kadrova | Puštanje | Šta se vidi | Šta igra sada radi | |
|---|---|---|---|---|---|
| `kopljanik-climb` | 6 | petlja | Penje se uz lestve, oružje zadenuto za pojas ili na leđima. | Na lestvama se vrti klip trčanja (samo sabljaš ima `sword-climb`). | A |
| `kopljanik-tiho-pada` | 5 | jednom, drži poslednji | Tihi pad posle udarca s leđa: klone na kolena pa na stranu, bez zamaha. | Obična smrt (`-death`), kao u otvorenom boju. | B |
| `kopljanik-spava` | 4 | petlja | Spava kraj vatre, sedeći ili na boku. | Ovaj lik nikad ne spava: u logorima spavaju samo sabljaš i štitonoša. | B |
| `kopljanik-budi` | 6 | jednom | Trgne se iz sna, dohvati oružje i ustane. | Kao gore, ide uz `-spava`. | B |

<a id="tufekdzija"></a>
### Tufekdžija

![Tufekdžija](reference/likovi/tufekdzija.png)

Referentna slika: [reference/likovi/tufekdzija.png](reference/likovi/tufekdzija.png) (iz `dist/assets/tufekdzija-idle.png`, klip `tufekdzija-idle`, kadar 0)

Ima 9 klipova: `tufekdzija-butt`, `tufekdzija-death`, `tufekdzija-hurt`, `tufekdzija-idle`, `tufekdzija-jump`, `tufekdzija-launch`, `tufekdzija-omamljen`, `tufekdzija-run`, `tufekdzija-shoot`.

| Klip | Kadrova | Puštanje | Šta se vidi | Šta igra sada radi | |
|---|---|---|---|---|---|
| `tufekdzija-climb` | 6 | petlja | Penje se uz lestve, oružje zadenuto za pojas ili na leđima. | Na lestvama se vrti klip trčanja (samo sabljaš ima `sword-climb`). | A |
| `tufekdzija-tiho-pada` | 5 | jednom, drži poslednji | Tihi pad posle udarca s leđa: klone na kolena pa na stranu, bez zamaha. | Obična smrt (`-death`), kao u otvorenom boju. | B |

<a id="pas"></a>
### Pas

![Pas](reference/likovi/pas.png)

Referentna slika: [reference/likovi/pas.png](reference/likovi/pas.png) (iz `dist/assets/pas-idle.png`, klip `pas-idle`, kadar 0)

Ima 6 klipova: `pas-attack`, `pas-death`, `pas-hurt`, `pas-idle`, `pas-launch`, `pas-run`.

| Klip | Kadrova | Puštanje | Šta se vidi | Šta igra sada radi | |
|---|---|---|---|---|---|
| `pas-omamljen` | 4 | petlja | Ošamućen, tetura se i trese glavom. | Stoji u običnoj pozi, samo nagnut. | A |
| `pas-jump` | 5 | jednom | Skok na Marka i doskok. | Svog klipa za skok nema; u vazduhu se vidi klip trčanja ili `pas-launch`. | B |

<a id="hasan-aga"></a>
### Hasan-aga Oklopnik

![Hasan-aga Oklopnik](reference/likovi/hasan-aga.png)

Referentna slika: [reference/likovi/hasan-aga.png](reference/likovi/hasan-aga.png) (iz `dist/assets/hasan-aga-idle.png`, klip `hasan-aga-idle`, kadar 0)

Ima 8 klipova: `hasan-aga-attack`, `hasan-aga-death`, `hasan-aga-hurt`, `hasan-aga-hvata`, `hasan-aga-idle`, `hasan-aga-run`, `hasan-aga-zaglavljen`, `hasan-aga-zalet`.

| Klip | Kadrova | Puštanje | Šta se vidi | Šta igra sada radi | |
|---|---|---|---|---|---|
| `hasan-aga-omamljen` | 4 | petlja | Ošamućen: tetura se, glava mu klone. | Megdandžija nema svoj klip: ostaje u poslednjoj pozi, nagnut za nekoliko stepeni, sa zvezdicama. | A |

<a id="janicarski-aga"></a>
### Janičarski aga

![Janičarski aga](reference/likovi/janicarski-aga.png)

Referentna slika: [reference/likovi/janicarski-aga.png](reference/likovi/janicarski-aga.png) (iz `dist/assets/janicarski-aga-idle.png`, klip `janicarski-aga-idle`, kadar 0)

Ima 7 klipova: `janicarski-aga-attack`, `janicarski-aga-death`, `janicarski-aga-hurt`, `janicarski-aga-hvata`, `janicarski-aga-idle`, `janicarski-aga-run`, `janicarski-aga-skok`.

| Klip | Kadrova | Puštanje | Šta se vidi | Šta igra sada radi | |
|---|---|---|---|---|---|
| `janicarski-aga-omamljen` | 4 | petlja | Ošamućen: tetura se, glava mu klone. | Megdandžija nema svoj klip: ostaje u poslednjoj pozi, nagnut za nekoliko stepeni, sa zvezdicama. | A |

<a id="ognjeni-aga"></a>
### Ognjeni aga

![Ognjeni aga](reference/likovi/ognjeni-aga.png)

Referentna slika: [reference/likovi/ognjeni-aga.png](reference/likovi/ognjeni-aga.png) (iz `dist/assets/ognjeni-aga-idle.png`, klip `ognjeni-aga-idle`, kadar 0)

Ima 8 klipova: `ognjeni-aga-attack`, `ognjeni-aga-death`, `ognjeni-aga-hurt`, `ognjeni-aga-hvata`, `ognjeni-aga-idle`, `ognjeni-aga-run`, `ognjeni-aga-ulje`, `ognjeni-aga-zadihan`.

| Klip | Kadrova | Puštanje | Šta se vidi | Šta igra sada radi | |
|---|---|---|---|---|---|
| `ognjeni-aga-omamljen` | 4 | petlja | Ošamućen: tetura se, glava mu klone. | Megdandžija nema svoj klip: ostaje u poslednjoj pozi, nagnut za nekoliko stepeni, sa zvezdicama. | A |

<a id="lovac-aga"></a>
### Lovac-aga

![Lovac-aga](reference/likovi/lovac-aga.png)

Referentna slika: [reference/likovi/lovac-aga.png](reference/likovi/lovac-aga.png) (iz `dist/assets/lovac-aga-idle.png`, klip `lovac-aga-idle`, kadar 0)

Ima 7 klipova: `lovac-aga-attack`, `lovac-aga-death`, `lovac-aga-hurt`, `lovac-aga-hvata`, `lovac-aga-idle`, `lovac-aga-rog`, `lovac-aga-run`.

| Klip | Kadrova | Puštanje | Šta se vidi | Šta igra sada radi | |
|---|---|---|---|---|---|
| `lovac-aga-omamljen` | 4 | petlja | Ošamućen: tetura se, glava mu klone. | Megdandžija nema svoj klip: ostaje u poslednjoj pozi, nagnut za nekoliko stepeni, sa zvezdicama. | A |

<a id="kopljanik-basa"></a>
### Kopljanik-baša

![Kopljanik-baša](reference/likovi/kopljanik-basa.png)

Referentna slika: [reference/likovi/kopljanik-basa.png](reference/likovi/kopljanik-basa.png) (iz `dist/assets/kopljanik-basa-idle.png`, klip `kopljanik-basa-idle`, kadar 0)

Ima 6 klipova: `kopljanik-basa-attack`, `kopljanik-basa-death`, `kopljanik-basa-hurt`, `kopljanik-basa-hvata`, `kopljanik-basa-idle`, `kopljanik-basa-run`.

| Klip | Kadrova | Puštanje | Šta se vidi | Šta igra sada radi | |
|---|---|---|---|---|---|
| `kopljanik-basa-omamljen` | 4 | petlja | Ošamućen: tetura se, glava mu klone. | Megdandžija nema svoj klip: ostaje u poslednjoj pozi, nagnut za nekoliko stepeni, sa zvezdicama. | A |
| `kopljanik-basa-baca` | 6 | jednom | Baca koplje izdaleka. | Po opisu megdana koristi `kopljanik-basa-attack`; koji se kadar vidi nisam gledao. | B |
| `kopljanik-basa-skok` | 6 | jednom | Preskače Marka kad mu priđe. | Svog klipa nema. | B |

<a id="arapin"></a>
### Arapin

![Arapin](reference/likovi/arapin.png)

Referentna slika: [reference/likovi/arapin.png](reference/likovi/arapin.png) (iz `dist/assets/arapin-idle.png`, klip `arapin-idle`, kadar 0)

Ima 7 klipova: `arapin-attack`, `arapin-death`, `arapin-hurt`, `arapin-hvata`, `arapin-idle`, `arapin-run`, `arapin-throw`.

| Klip | Kadrova | Puštanje | Šta se vidi | Šta igra sada radi | |
|---|---|---|---|---|---|
| `arapin-omamljen` | 4 | petlja | Ošamućen: tetura se, glava mu klone. | Megdandžija nema svoj klip: ostaje u poslednjoj pozi, nagnut za nekoliko stepeni, sa zvezdicama. | A |

<a id="bajraktar"></a>
### Bajraktar

![Bajraktar](reference/likovi/bajraktar.png)

Referentna slika: [reference/likovi/bajraktar.png](reference/likovi/bajraktar.png) (iz `dist/assets/bajraktar-idle.png`, klip `bajraktar-idle`, kadar 0)

Ima 7 klipova: `bajraktar-attack`, `bajraktar-death`, `bajraktar-hurt`, `bajraktar-hvata`, `bajraktar-idle`, `bajraktar-poziv`, `bajraktar-run`.

| Klip | Kadrova | Puštanje | Šta se vidi | Šta igra sada radi | |
|---|---|---|---|---|---|
| `bajraktar-omamljen` | 4 | petlja | Ošamućen: tetura se, glava mu klone. | Megdandžija nema svoj klip: ostaje u poslednjoj pozi, nagnut za nekoliko stepeni, sa zvezdicama. | A |

<a id="basa"></a>
### Tufekdžija-baša

![Tufekdžija-baša](reference/likovi/basa.png)

Referentna slika: [reference/likovi/basa.png](reference/likovi/basa.png) (iz `dist/assets/basa-idle.png`, klip `basa-idle`, kadar 0)

Ima 6 klipova: `basa-attack`, `basa-death`, `basa-hurt`, `basa-hvata`, `basa-idle`, `basa-run`.

| Klip | Kadrova | Puštanje | Šta se vidi | Šta igra sada radi | |
|---|---|---|---|---|---|
| `basa-omamljen` | 4 | petlja | Ošamućen: tetura se, glava mu klone. | Megdandžija nema svoj klip: ostaje u poslednjoj pozi, nagnut za nekoliko stepeni, sa zvezdicama. | A |
| `basa-nisani` | 4 | drži poslednji | Nišani sa kule (dok je crvena linija na ekranu). | Svog klipa nema; puca iz `basa-attack`. | B |

<a id="beg"></a>
### Akindžijski beg

![Akindžijski beg](reference/likovi/beg.png)

Referentna slika: [reference/likovi/beg.png](reference/likovi/beg.png) (iz `dist/assets/beg-idle.png`, klip `beg-idle`, kadar 0)

Ima 9 klipova: `beg-attack`, `beg-death`, `beg-hurt`, `beg-hvata`, `beg-idle`, `beg-mounted`, `beg-mounted-strike`, `beg-run`, `beg-unhorsed`.

| Klip | Kadrova | Puštanje | Šta se vidi | Šta igra sada radi | |
|---|---|---|---|---|---|
| `beg-omamljen` | 4 | petlja | Ošamućen: tetura se, glava mu klone. | Megdandžija nema svoj klip: ostaje u poslednjoj pozi, nagnut za nekoliko stepeni, sa zvezdicama. | A |

<a id="djemo"></a>
### Đemo Brđanin

![Đemo Brđanin](reference/likovi/djemo.png)

Referentna slika: [reference/likovi/djemo.png](reference/likovi/djemo.png) (iz `dist/assets/djemo-idle.png`, klip `djemo-idle`, kadar 0)

Ima 7 klipova: `djemo-attack`, `djemo-death`, `djemo-hurt`, `djemo-hvata`, `djemo-idle`, `djemo-run`, `djemo-throw`.

| Klip | Kadrova | Puštanje | Šta se vidi | Šta igra sada radi | |
|---|---|---|---|---|---|
| `djemo-omamljen` | 4 | petlja | Ošamućen: tetura se, glava mu klone. | Megdandžija nema svoj klip: ostaje u poslednjoj pozi, nagnut za nekoliko stepeni, sa zvezdicama. | A |
| `djemo-bez-buzdovana` | 4 | petlja | Stoji praznih ruku dok mu je buzdovan u letu. | Svog klipa nema; stoji u `djemo-idle` sa buzdovanom u ruci. | B |

<a id="dzelat"></a>
### Dželat

![Dželat](reference/likovi/dzelat.png)

Referentna slika: [reference/likovi/dzelat.png](reference/likovi/dzelat.png) (iz `dist/assets/dzelat-idle.png`, klip `dzelat-idle`, kadar 0)

Ima 6 klipova: `dzelat-attack`, `dzelat-death`, `dzelat-hurt`, `dzelat-hvata`, `dzelat-idle`, `dzelat-run`.

| Klip | Kadrova | Puštanje | Šta se vidi | Šta igra sada radi | |
|---|---|---|---|---|---|
| `dzelat-omamljen` | 4 | petlja | Ošamućen: tetura se, glava mu klone. | Megdandžija nema svoj klip: ostaje u poslednjoj pozi, nagnut za nekoliko stepeni, sa zvezdicama. | A |
| `dzelat-zaglavljen` | 4 | petlja | Sekira zabijena u gredu, vuče je. | Svog klipa nema; koristi kadrove `dzelat-attack`. | B |

<a id="mladi-turcin"></a>
### Mladi Turčin sa očevom sabljom

![Mladi Turčin sa očevom sabljom](reference/likovi/mladi-turcin.png)

Referentna slika: [reference/likovi/mladi-turcin.png](reference/likovi/mladi-turcin.png) (iz `dist/assets/mladi-turcin-idle.png`, klip `mladi-turcin-idle`, kadar 0)

Ima 5 klipova: `mladi-turcin-attack`, `mladi-turcin-death`, `mladi-turcin-hurt`, `mladi-turcin-idle`, `mladi-turcin-run`.

| Klip | Kadrova | Puštanje | Šta se vidi | Šta igra sada radi | |
|---|---|---|---|---|---|
| `mladi-turcin-omamljen` | 4 | petlja | Ošamućen: tetura se, glava mu klone. | Megdandžija nema svoj klip: ostaje u poslednjoj pozi, nagnut za nekoliko stepeni, sa zvezdicama. | A |
| `mladi-turcin-hvata` | 6 | jednom | Hvata Marka u koštac. | Nema hvata, pa sa njim nema ni koštaca. | B |
| `kostac-mladi-turcin` | 8 | petlja | Koštac Marka i mladog Turčina. | Nema. | B |
| `kostac-mladi-turcin-kraj` | 6 | jednom | Kraj koštaca. | Nema. | B |

<a id="azdaja"></a>
### Aždaja

![Aždaja](reference/likovi/azdaja.png)

Referentna slika: [reference/likovi/azdaja.png](reference/likovi/azdaja.png) (iz `dist/assets/azdaja-idle.png`, klip `azdaja-idle`, kadar 0)

Ima 5 klipova: `azdaja-bite`, `azdaja-death`, `azdaja-fire`, `azdaja-hurt`, `azdaja-idle`.

| Klip | Kadrova | Puštanje | Šta se vidi | Šta igra sada radi | |
|---|---|---|---|---|---|
| `azdaja-zaglavljena` | 4 | petlja | Glava zarivena u zemlju posle ujeda. | Svog klipa nema; koristi kadrove `azdaja-bite`. | B |

## Likovi kojima ne nedostaje ništa

<a id="sword"></a>
### Janičar sabljaš

![Janičar sabljaš](reference/likovi/sword.png)

Referentna slika: [reference/likovi/sword.png](reference/likovi/sword.png) (iz `dist/assets/sword-idle.png`, klip `sword-idle`, kadar 0)

Ima 14 klipova: `sword-attack`, `sword-budi`, `sword-climb`, `sword-death`, `sword-drugi`, `sword-hurt`, `sword-idle`, `sword-jump`, `sword-launch`, `sword-lunge`, `sword-omamljen`, `sword-run`, `sword-spava`, `sword-tiho-pada`.

Ne nedostaje ništa što igra danas traži.

<a id="caus"></a>
### Carev čauš

![Carev čauš](reference/likovi/caus.png)

Referentna slika: [reference/likovi/caus.png](reference/likovi/caus.png) (iz `dist/assets/caus-idle.png`, klip `caus-idle`, kadar 0)

Ima 5 klipova: `caus-death`, `caus-ferman`, `caus-hurt`, `caus-idle`, `caus-walk`.

Ne nedostaje ništa što igra danas traži.

<a id="vrac"></a>
### Vrač

![Vrač](reference/likovi/vrac.png)

Referentna slika: [reference/likovi/vrac.png](reference/likovi/vrac.png) (iz `dist/assets/vrac-idle.png`, klip `vrac-idle`, kadar 0)

Ima 4 klipova: `vrac-carolija`, `vrac-hurt`, `vrac-idle`, `vrac-pojavljuje`.

Ne nedostaje ništa što igra danas traži.

<a id="kostur"></a>
### Kostur

![Kostur](reference/likovi/kostur.png)

Referentna slika: [reference/likovi/kostur.png](reference/likovi/kostur.png) (iz `dist/assets/kostur-stoji.png`, klip `kostur-stoji`, kadar 0)

Ima 4 klipova: `kostur-hurt`, `kostur-napad`, `kostur-pada`, `kostur-stoji`.

Ne nedostaje ništa što igra danas traži.

<a id="guslar"></a>
### Guslar

![Guslar](reference/likovi/guslar.png)

Referentna slika: [reference/likovi/guslar.png](reference/likovi/guslar.png) (iz `dist/assets/guslar-svira.png`, klip `guslar-svira`, kadar 0)

Ima 2 klipova: `guslar-ceka`, `guslar-svira`.

Ne nedostaje ništa što igra danas traži.

<a id="novak"></a>
### Kovač Novak

![Kovač Novak](reference/likovi/novak.png)

Referentna slika: [reference/likovi/novak.png](reference/likovi/novak.png) (iz `dist/assets/novak-idle.png`, klip `novak-idle`, kadar 0)

Ima 2 klipova: `novak-idle`, `novak-kuje`.

Ne nedostaje ništa što igra danas traži.

<a id="janja"></a>
### Krčmarica Janja

![Krčmarica Janja](reference/likovi/janja.png)

Referentna slika: [reference/likovi/janja.png](reference/likovi/janja.png) (iz `dist/assets/janja-idle.png`, klip `janja-idle`, kadar 0)

Ima 2 klipova: `janja-idle`, `janja-toci`.

Ne nedostaje ništa što igra danas traži.

<a id="putnik-starac"></a>
### Putnik starac

![Putnik starac](reference/likovi/putnik-starac.png)

Referentna slika: [reference/likovi/putnik-starac.png](reference/likovi/putnik-starac.png) (iz `dist/assets/putnik-starac-idle.png`, klip `putnik-starac-idle`, kadar 0)

Ima 2 klipova: `putnik-starac-idle`, `putnik-starac-walk`.

Ne nedostaje ništa što igra danas traži.

<a id="putnik-trgovac"></a>
### Putnik trgovac

![Putnik trgovac](reference/likovi/putnik-trgovac.png)

Referentna slika: [reference/likovi/putnik-trgovac.png](reference/likovi/putnik-trgovac.png) (iz `dist/assets/putnik-trgovac-idle.png`, klip `putnik-trgovac-idle`, kadar 0)

Ima 2 klipova: `putnik-trgovac-idle`, `putnik-trgovac-walk`.

Ne nedostaje ništa što igra danas traži.

<a id="putnik-kaluder"></a>
### Putnik kaluđer

![Putnik kaluđer](reference/likovi/putnik-kaluder.png)

Referentna slika: [reference/likovi/putnik-kaluder.png](reference/likovi/putnik-kaluder.png) (iz `dist/assets/putnik-kaluder-idle.png`, klip `putnik-kaluder-idle`, kadar 0)

Ima 2 klipova: `putnik-kaluder-idle`, `putnik-kaluder-walk`.

Ne nedostaje ništa što igra danas traži.

<a id="putnica"></a>
### Putnica

![Putnica](reference/likovi/putnica.png)

Referentna slika: [reference/likovi/putnica.png](reference/likovi/putnica.png) (iz `dist/assets/putnica-idle.png`, klip `putnica-idle`, kadar 0)

Ima 2 klipova: `putnica-idle`, `putnica-walk`.

Ne nedostaje ništa što igra danas traži.

<a id="sirotinja"></a>
### Sirotinja

![Sirotinja](reference/likovi/sirotinja.png)

Referentna slika: [reference/likovi/sirotinja.png](reference/likovi/sirotinja.png) (iz `dist/assets/sirotinja-ceka.png`, klip `sirotinja-ceka`, kadar 0)

Ima 2 klipova: `sirotinja-blagoslov`, `sirotinja-ceka`.

Ne nedostaje ništa što igra danas traži.

<a id="trgovac"></a>
### Trgovac za tezgom

![Trgovac za tezgom](reference/likovi/trgovac.png)

Referentna slika: [reference/likovi/trgovac.png](reference/likovi/trgovac.png) (iz `dist/assets/trgovac-tezga-idle.png`, klip `trgovac-tezga-idle`, kadar 0)

Ima 1 klipova: `trgovac-tezga-idle`.

Ne nedostaje ništa što igra danas traži.

<a id="svatovi"></a>
### Svatovi

![Svatovi](reference/likovi/svatovi.png)

Referentna slika: [reference/likovi/svatovi.png](reference/likovi/svatovi.png) (iz `dist/assets/svatovi-zarobljeni.png`, klip `svatovi-zarobljeni`, kadar 0)

Ima 2 klipova: `svatovi-kolo`, `svatovi-zarobljeni`.

Ne nedostaje ništa što igra danas traži.

<a id="mlada"></a>
### Mlada

![Mlada](reference/likovi/mlada.png)

Referentna slika: [reference/likovi/mlada.png](reference/likovi/mlada.png) (iz `dist/assets/mlada-trci.png`, klip `mlada-trci`, kadar 0)

Ima 2 klipova: `mlada-skok`, `mlada-trci`.

Ne nedostaje ništa što igra danas traži.

<a id="mladozenja"></a>
### Mladoženja

![Mladoženja](reference/likovi/mladozenja.png)

Referentna slika: [reference/likovi/mladozenja.png](reference/likovi/mladozenja.png) (iz `dist/assets/mladozenja-trci.png`, klip `mladozenja-trci`, kadar 0)

Ima 2 klipova: `mladozenja-skok`, `mladozenja-trci`.

Ne nedostaje ništa što igra danas traži.

<a id="soko"></a>
### Soko

![Soko](reference/likovi/soko.png)

Referentna slika: [reference/likovi/soko.png](reference/likovi/soko.png) (iz `dist/assets/soko-let.png`, klip `soko-let`, kadar 0)

Ima 7 klipova: `soko-let`, `soko-napad`, `soko-pad`, `soko-pogodjen`, `soko-ranjen`, `soko-vezirov-let`, `soko-voda`.

Ne nedostaje ništa što igra danas traži.

<a id="orao"></a>
### Orao

![Orao](reference/likovi/orao.png)

Referentna slika: [reference/likovi/orao.png](reference/likovi/orao.png) (iz `dist/assets/orao-let.png`, klip `orao-let`, kadar 0)

Ima 4 klipova: `orao-flight`, `orao-hlad`, `orao-let`, `orao-obrusavanje`.

Ne nedostaje ništa što igra danas traži.

<a id="volovi"></a>
### Volovi sa ralom

![Volovi sa ralom](reference/likovi/volovi.png)

Referentna slika: [reference/likovi/volovi.png](reference/likovi/volovi.png) (iz `dist/assets/volovi-ralo.png`, klip `volovi-ralo`, kadar 0)

Ima 3 klipova: `volovi-beg`, `volovi-plug`, `volovi-ralo`.

Ne nedostaje ništa što igra danas traži.

<a id="utva"></a>
### Utva zlatokrila

![Utva zlatokrila](reference/likovi/utva.png)

Referentna slika: [reference/likovi/utva.png](reference/likovi/utva.png) (iz `dist/assets/utva-let.png`, klip `utva-let`, kadar 0)

Ima 1 klipova: `utva-let`.

Ne nedostaje ništa što igra danas traži.

## Šta nije pokriveno

- Megdandžije: posebne poteze (bacanje koplja, zaglavljena sekira, nišanjenje) sam popisao po opisu megdana u kodu. Koji se kadar tada stvarno vidi nisam gledao u igri, pa su svi označeni B.
- Koštaci: svaki megdandžija sa hvatom ima svoj par klipova (`kostac-<lik>`, `kostac-<lik>-kraj`); fale samo za mladog Turčina.
- Efekti bez lika (krv, prašina, pucanje tla pod Šarcem, napukli zid, kapije u preseku) crtaju se kodom i nisu u ovom spisku.
- Tandemi i krvarenje od sablje ne traže nove klipove; jedini predlog je `shield-straza`.
