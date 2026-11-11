# Pozadine — izveštaj (11. 11. 2026)

Rađeno u grani `pozadine` (worktree `D:\projects\Marko Kraljevic\marko-pozadine`), bez novih crteža: sve je
složeno iz slojeva i rekvizita koji već postoje. Recepti su u `make-rucni-slojevi.py` (svaki sloj je jedna funkcija
i stavka u `SPEC`); igra sama uzima `-rucno` sliku kad je ima na spisku `files.json`.

## Šta je bio problem

1. **„Duhovi" i lebdeće krošnje.** Igra pretapa poslednjih 12 % pločice u prvih 12 % (`SEAM` u `stage3d.js`).
   Skoro svaki `near` sloj ima drvo, stenu ili zgradu baš na ivici, pa se na spoju vidi providno drvo ili krošnja
   koja visi sa vrha ekrana (Selo, Manastir, Tvrđava, Prevoj, Urvina, Pećina, Rudnik).
2. **Ista kuća i crkva na svaka dva ekrana**, često u tri-četiri sloja odjednom.
3. **Noć i oluja su druge slike, ne isti pejzaž noću.** Na primer, „noćno nebo" Šume je cela slika manastira na
   litici sa drvećem; noćno i olujno nebo Klisure i Pećine je ta ista scena. Zato je Šuma noću imala manastir u
   gornjem levom uglu, a Pećina noću otvoreno nebo sa mesecom.
4. **Stari način bojenja noćnih `-rucno` slojeva** (prepisivanje boje piksel po piksel sa slike drugačijeg
   sadržaja) davao je sivo-blatnjav sloj koji je odskakao od originala oko njega.

## Šta je urađeno (svuda)

- **Novo bojenje noći i oluje**: novi sloj dobija srednju boju i raspon (u Lab prostoru) umetnikove noćne/olujne
  slike istog sloja. Noćni `-rucno` slojevi sada imaju istu tamu i plavetnilo kao originali oko njih.
- **Čisto noćno nebo sa mesecom** gde je noćno „nebo" bila naslikana scena: oblaci iz olujnog neba nivoa u
  plavoj boji noćne slike, i mesec isečen sa te iste slike (Šuma, Selo, Manastir, Tvrđava, Prevoj). U Klisuri je i
  olujno nebo scena, pa su tamo i noć i oluja napravljeni od dnevnih oblaka (bez sunca).
- **Sađenje preko spoja**: `plant()` i nova `put()` lepe stvar i za jedan period igre (0,88 širine) levo i desno,
  pa stvar koja stoji na spoju izgleda isto u obe pretopljene trake: puna, ne providna. Tako je litica Manastira,
  jela u Urvini, zid pećine u Pećini i rudarska kuća u Rudniku ostala cela preko spoja.
- `patch()` (zakrpa iz drugog dela istog sloja) za neprozirne slojeve neba, gde se ne može samo obrisati.
- `tools/scout.mjs` čita port iz `SCOUT_PORT` (podrazumevano 4174) i ume da snima noć i oluju
  (`node tools/scout.mjs <nivo> [korak] [od] [do] [day|night|storm]` → `.scout/<nivo>.<varijanta>-<x>.png`).
- Novi alati: `tools/layers-sheet.py <nivo> [orig]` (sva četiri sloja × dan/noć/oluja u jednoj slici) i
  `tools/layer-grid.py <sloj> …` (sloj sa mrežom 0..1 za čitanje koordinata).

## Po nivoima

| Nivo | Promena |
|---|---|
| **Šuma** | `near`, `mid` kao ranije (dorađeno: žbunje preko krovova koji su virili); noćno nebo bez manastira, sa mesecom; `far` noću i u oluji je dnevni pejzaž u noćnoj boji (originalni noćni/olujni imaju manastir). |
| **Pećina** | Kao ranije, plus: levi zid pećine obrisan, desni (sa rudarskim ulazom) prenet preko spoja. Noćno nebo više nije otvoreno nebo sa manastirom nego ista pećina u noćnoj boji. |
| **Močvara** | Nebo: manastir na brdu nad močvarom pretopljen u maglu i daleka brda (sloj ranije nije bio dirnut). Ostalo kao ranije, sa novim bojenjem noći. |
| **Klisura** | Kao ranije; noćno i olujno nebo više nisu scena manastira na litici nego oblaci. Utvrđenje na levoj litici srednjeg plana ostaje (straža klisure). |
| **Selo** | `near`: kuća ostaje, crkva zamenjena čempresima i plastom sena, ivični hrast (lebdeća krošnja) uklonjen, novi hrast unutar pločice. Crkva ostaje samo u srednjem planu. Čisto noćno nebo. |
| **Manastir** | `near`: zvonik i kapija ostaju, velika crkva (ima je srednji plan) zamenjena čempresima; ivični hrast uklonjen, desna litica prenesena preko spoja. `far`: manastir obrisan, ostaju brda. Čisto noćno nebo. |
| **Oranje** | `near` je sada samo donji pojas: strnjika, put, brazde i dve kruške; kuća, kapija i tvrđava na steni su već u slojevima iza. **U `dist/world.js` dodati `nightLayers`/`stormLayers` za Oranje** — ranije je noć i oluja u Oranju prikazivala dnevne slojeve sa suncem (noćni crteži su postojali, samo nisu bili navedeni). |
| **Tvrđava** | `near`: kapija sa dve kule ostaje, kupola crkve iza zida obrisana (crkva je u srednjem planu); ivični hrast uklonjen. Čisto noćno nebo. |
| **Podrum** | Danju nepromenjen. Noćni i olujni `far`/`mid`/`near` imaju crkvu sa kupolom usred podruma → zamenjeni dnevnim slojevima u noćnoj/olujnoj boji. |
| **Prevoj** | `near`: ivični jesenji hrast i stene uklonjeni, snežne jele unutar pločice. `mid`: manastir i kuća na levom grebenu zamenjeni snežnim jelama. `far` noću/u oluji: dnevni pejzaž (noćni ima manastir). Čisto noćno nebo. |
| **Ruševine** | `near`: Arapinova kula ostaje, cela crkva zamenjena slomljenim lukovima i stubom. `mid`: crkva i brvnara levo zamenjene ruševnim lukovima. Daleki plan i nebo (ruševine sa crkvom) ostali — ruševine zadužbina su tema nivoa. |
| **Rudnik** | Nebo: crkva u pećinskom svodu prekrivena stenom. `far`: crkva sa kućom na vrhu rudnika obrisana. `near`: rudarska kuća prenesena preko spoja, bunar-kuća sa druge ivice uklonjena. Noć i oluja svuda: dnevni slojevi u noćnoj boji (originalni noćni imaju crkve i otvoreno nebo). |
| **Reka** | Nebo: manastir na brdu i druga vodenica pretopljeni u brda. `far`: vodenica obrisana (ima je bliži plan). `near`: vodenica ostaje, crkva zamenjena vrbom i trskom. |
| **Urvina** | `near`: jela na spoju je bila providna; sada stoji cela preko spoja. |

## Provereno

- Table iz igre (`?scout`) za svih 14 nivoa danju i noću; oluja za Šumu, Klisuru, Selo, Tvrđavu, Ruševine i Reku.
- Sve `-rucno` slike prolaze proveru spoja (ista računica kao `seam-audit.py`, koja inače preskače `-rucno`).
- `npm test`, `node simulation-test.mjs` („victory"), `node animation-tests.mjs` — vidi dole.

## Šta nije rešeno bez novih crteža

- **Rudnik i Ruševine su i dalje gusti**: svaki sloj je pun zgrada (rudarska naselja, ruševine), samo su crkve i
  ivični duhovi skinuti. Mirniji Rudnik traži nove slojeve.
- **Srednji (`mid`) slojevi i dalje imaju blago pretapanje na spoju** (dva različita pejzaža se prelivaju kroz 12 %
  širine). Izgleda kao izmaglica i nije upadljivo kao kod `near`, ali nije potpuno čisto.
- **Podrum `near`** ima lukove na obe ivice koji se pretapaju; u igri se stapaju u isti zid podruma, pa nije dirano.
- Rekviziti (`prop-*`) su crtani čistijim potezom od slikanih slojeva; gde su posađeni (kruške u Oranju, hrastovi,
  snežne jele) vide se kao malo „ilustrovaniji". Bolje bi bilo da Codex dopuni slojeve, ali to nisam naručivao.
- Noćni srednji/daleki slojevi Sela, Manastira, Tvrđave, Klisure i Ruševina su originalni i imaju crkve/manastire
  — to odgovara tim nivoima, pa su ostavljeni.
- Urvina nema noćne crteže, pa noću ostaje zora (kao i ranije).

## Šta nije provereno

- Oluja u Manastiru, Oranju (novo), Podrumu, Prevoju, Rudniku, Pećini, Močvari i Urvini nije gledana iz igre
  (samo slojevi u tabli).
- San (`san`) koristi originalne slojeve Pećine preko `fallbackLayers`, mimo `-rucno` mehanizma; nije dirano.
- Igra je gledana samo kroz `?scout` (bez neprijatelja i HUD-a); brzina i prelaz nivoa nisu gledani.
