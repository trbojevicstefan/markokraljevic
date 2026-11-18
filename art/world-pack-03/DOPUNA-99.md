# Dopuna 99 (od Claude-a, 18. 11.): bedemi i kule od klesanog kamena

Stefan (18. 11.), o zidu `prop-zid-kamen`: „ova kula mi se sviđa, želim više ovoga, pogotovo za one zidove i kule. Može i da bude interaktivna, tj. da skačemo na nju, a može i za pozadinu da bude slična.”

Prave se novi delovi bedema (i jedno koplje, poslednja stavka) u **istom rukopisu kao `prop-zid-kamen.png`**: svetao topao klesani kamen nejednakih blokova, svetao malter, bršljan i jesenja loza, zupci po vrhu, topla svetlost sleva, jasna kontura. Igra će po njima moći da se skače i hoda (gornja ivica je ravna platforma), a slične će ići i u pozadinu.

Status piši u `art/world-pack-03/STATUS-D99.md` (napravi ga), red posle SVAKE stavke, sa oznakom `D99`.

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, druge `STATUS-*` fajlove, postojeće slike, tuđe foldere, git, fajlove `*dopuna41*`. Paralelno rade druge Codex sesije (D97, D98): ne diraj njihove fajlove; svoje skripte zovi `*-dopuna99.py`.

## Uzori (`art/world-pack-03/uzori-d99/`)

- `prop-zid-kamen.png`: **glavni uzor rukopisa, kamena, boja i svetla.** Svi novi delovi moraju izgledati kao da su iz istog bedema.
- `prop-kapija-tvrdjava.png`, `prop-strassarnica.png`, `prop-stub-kameni.png`, `prop-platforma-kamen.png`, `prop-ograda-kamen-rusevina.png`: drugi kameni delovi iz igre (format i kako stoje na dnu slike). **Bez srpskih barjaka, krstova i grbova** na novim delovima: bedemi služe raznim gradovima (i Varadinu, i turskim tvrđavama).

## Pravila

- Svaka slika **1536×1024**, providna pozadina oko oblika. Crta se na ravnoj **jarko ljubičastoj #ff00ff** i ključ skida ljubičastu. **Posle skidanja ključa skini i ljubičasti odsjaj** (piksel u kome su i crvena i plava jače od zelene vrati ka prirodnoj boji kamena). Pogledaj rezultat na plavoj I na beloj podlozi: bez ljubičastog ruba, bez roze senke, bez rupica u kamenu.
- Oblik stoji na dnu slike (dno kamena do donje ivice oblika, ravno). **Gornja ivica zidova i kula je vodoravna i ravna** (zupci po njoj su u istoj visini), jer igra po njoj hoda: u status upiši na kojoj je visini (u px od dna oblika) gornja površina po kojoj se hoda.
- Gledano spreda, blago odozgo, kao `prop-zid-kamen.png`. Bez ljudi, životinja, teksta, barjaka.
- Delovi moraju moći da se slažu jedan do drugog: `zid-sredina` levo-desno bez šava (proveri: dve kopije jedna do druge, sačuvaj kao `<ime>-proba.jpg`).

## Slike (u `art/world-pack-03/`)

| Ime | Šta se vidi |
|---|---|
| `prop-bedem-sredina` | Deo bedema bez kraja levo i desno (nastavlja se), zupci po vrhu, jedna puškarnica, malo bršljana. Nizak i dug: oblik oko 3:1 (širina : visina). |
| `prop-bedem-kula` | **Okrugla kula** od istog kamena, viša od zida (oblik oko 1:1,6), zupci po vrhu, dve uske puškarnice jedna iznad druge, pri vrhu venac od istaknutog kamena. |
| `prop-bedem-kula-cetvrtasta` | **Četvrtasta kula**, isti kamen, oblik oko 1:1,4, zupci, mali prozor sa lukom, loza uz ugao. |
| `prop-bedem-kapija` | Kapija u bedemu: luk od klesanog kamena, teška drvena vrata okovana gvožđem (zatvorena), iznad luka zupci; bez grbova i barjaka. Oblik oko 1,4:1. |
| `prop-bedem-srusen` | Isti bedem, delom srušen: jedna strana visoka sa zupcima, druga spuštena u gomilu kamenja (gornja ivica ide stepenasto nadole, svaka stepenica ravna, da se po njima penje). |
| `prop-bedem-stepenice` | Kamene stepenice uz bedem: zid kao `prop-zid-kamen`, a uz njegovu desnu polovinu strme kamene stepenice od zemlje do vrha (svaka stepenica ravna i vodoravna). |
| `prop-koplje-u-ledini` | **Markovo bojno koplje zabodeno u ledinu** (iz pesme: „pa udari koplje u ledinu, za koplje je privezao Šarina”): dugo koplje od tamnog jasena sa čeličnim šiljkom, malo nakrivljeno, zabodeno u busen trave; pri vrhu ispod šiljka crveno-zlatna resa; na pola visine **privezana uzda** (kožni kaiš u čvoru, slobodan kraj visi prema desno, gde stoji Šarac). Uzano i visoko: slika 1024×1536 umesto 1536×1024, koplje od dna do ~90 % visine. Dno (busen) na dnu slike. Ovo nije deo bedema: rukopis i svetlo isti, kamena nema. |

Najviše tri pokušaja po slici. U status upiši veličinu, visinu gornje površine, pokušaj koji je uzet i proveru odsjaja.
