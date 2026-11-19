# Dopuna 113 (od Claude-a, 19. 11.): slike za pesmu „Marko pije uz ramazan vino” (šesti pohod, Zaboravljeni podrum)

Stefan (19. 11.): „idemo nivo po nivo da bi sve izgledalo savršeno”. Šesti pohod ide po pesmi:

> Car Sulejman jasak učinio: da s’ ne pije uz ramazan vino, da s’ ne nose zelene dolame, da s’ ne pašu sablje okovane, da s’ ne igra kolom uz kadune. Marko igra kolom uz kadune, Marko paše sablju okovanu, Marko nosi zelenu dolamu, Marko pije uz ramazan vino, još nagoni odže i adžije da i oni s njime piju vino. … Kad dođoše Kraljeviću Marku, ali Marko pod šatorom pije, pred njim kupa od dvanaest oka.

Ceo pohod je u starom vinskom podrumu od cigle i kamena, pod svodovima, pri svetlu baklji (`uzori-d113/sada-podrum-1.jpg`, `-2.jpg`). Trebaju četiri slike mesta iz pesme.

Status piši u `art/world-pack-03/STATUS-D113.md` (napravi ga), red posle SVAKE stavke, sa oznakom `D113`. **Uradi sve stavke do kraja, ne staj i ne pitaj posle prve.**

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, druge `STATUS-*` fajlove, postojeće slike, tuđe foldere, git, fajlove `*dopuna41*`. Paralelno radi D114: ne diraj njegove fajlove; svoje skripte zovi `*-dopuna113.py`. Slike idu u `art/world-pack-03/<ime>.png`.

## Uzori (`art/world-pack-03/uzori-d113/`)

- `prop-cador-bok.png`, `prop-perilo-marica.png`: slike iz igre gledane **tačno s boka**. **Uzor ugla gledanja, rukopisa, konture i količine detalja**: sve stoji na jednoj vodoravnoj liniji (dno slike), pod se ne vidi, ništa ne ide u dubinu.
- `sada-podrum-1.jpg`, `sada-podrum-2.jpg`: kako pohod izgleda; Marko je visok oko 150 px. Slike moraju da se vide u polumraku: **svetle, tople boje, jasna kontura**.
- `bacva-puna.png`: bačva iz igre (rukopis drveta i obruča).

## Pravila

- **Pravi bočni pogled (elevacija), bez perspektive**: nema poda koji se vidi odozgo, nema ćilima u dubinu; sve stoji na ISTOJ vodoravnoj liniji = donja ivica slike.
- Crta se na ravnoj **jarko ljubičastoj #ff00ff** i ključ skida ljubičastu; **posle skidanja skini i ljubičasti odsjaj**. Pogledaj na plavoj I na beloj podlozi: bez ljubičastog ruba, bez roze senke, bez rupica.
- Oblik stoji na dnu slike, bez tla, neba i senke na tlu. Bez ljudi, životinja, teksta i slova (ni arapskih).

## Stavke

| Ime | Veličina | Šta se vidi |
|---|---|---|
| `prop-jasak-tabla` | 1024×1536 | **Careva tabla sa zabranama (jasak)**: visok drveni stub sa dve noge, na njemu velika daska sa krovićem, o stub okačen carski pečat (tugra kao ukras bez slova) i crvena kićanka. Na dasci **četiri naslikane sličice jedna ispod druge, svaka precrtana debelim crvenim krstom**: (1) krčag i čaša crvenog vina, (2) zelena dolama (kaput), (3) kriva sablja u okovanim koricama, (4) tri žene u kolu koje se drže za ruke. Sličice krupne i čitke i kad se slika smanji na trećinu. Visina oblika oko 1450 px, širina oko 620 px. |
| `prop-zelena-dolama` | 1024×1024 | **Zelena dolama na drvenom krojačkom stalku** (krst od dve letve na tronošcu): duga, jarko zelena čoja, **zlatan gajtan i zlatna dugmad niz prsa**, crvena postava se vidi na izvrnutom rukavu; visi raširenih rukava da se vidi ceo kroj. Pored stalka niska klupica sa makazama i klupkom zlatnog gajtana. Visina stalka sa dolamom oko 760 px. |
| `prop-sablje-okovane` | 1024×1024 | **Stalak sa zaplenjenim sabljama**: drvena polica uza zid (dve uspravne grede i dve prečke), na njoj vodoravno obešene **tri krive sablje u okovanim koricama** (srebro i zlato, drago kamenje na balčaku), preko svega **debeo gvozdeni lanac sa velikim katancem i crvenim voštanim pečatom**. Visina oko 620 px, širina oko 700 px. |
| `prop-markov-sator` | 1536×1024 | **Markov šator razapet u podrumu, gledan s boka kao presek** (kao `prop-cador-bok.png`, ali skroman, vojnički): **krov od belog i crvenog prugastog platna razapet na dva drvena stuba**, leva i desna strana otvorene (krila podvezana), zadnja strana je ravno belo platno. Unutra, na dnu, sleva nadesno: **mešina vina naslonjena na stub, niska okrugla sofra (sto na tri noge, visok oko 110 px) i na njoj OGROMNA bakrena kupa sa dve drške („kupa od dvanaest oka”: široka kao ljudski grudni koš, visoka oko 190 px), pored sofre na zemlji ovčija koža za sedenje gledana s boka (tanka, do 30 px)**; o desni stub okačen kalpak i buzdovan šestoperac. Unutrašnja visina (od dna do krova) najmanje 520 px, da čovek visok 300 px stane ispod. Ceo šator visok oko 820 px, širok oko 1400 px. **Sofra sa kupom stoji u levoj trećini, sredina i desna trećina na dnu su prazne** (tu stoje ljudi). |

Najviše tri pokušaja po slici. Ako pokušaj pokazuje pod odozgo ili stvari u dubinu, odbij ga. U status upiši veličinu, proveru odsjaja i za šator: **x i visinu sofre sa kupom, x levog i desnog stuba, unutrašnju visinu**.
