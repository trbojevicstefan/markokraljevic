# Glasovi: popis svih replika

Napravljeno 2026-11-18 alatom `node tools/popis-replika.mjs --md`, iz `dist/game.js`, `dist/world.js` i greybox nivoa. Isti popis za mašinu je u `art/glasovi/replike.json` (svaka replika ima stalni id, iz njega se prave glasovi), a ko kojim glasom govori je u `art/glasovi/glasovi.json`.

## Ukratko

- U igri ima **366 tekstova** koji se pojavljuju u okviru za razgovor ili na pričama između pesama: **41.967 znakova**.
- Za ozvučavanje predlažem **273 replika, 31.329 znakova**: oko **47 minuta** govora. Sa oznakama za ton ([tiho], [ljutito]…) to je oko **34.605 kredita** (eleven_v4 = 1 kredit po znaku).
- Ne predlažem ozvučavanje: uputstava sa tasterima (65; na džojstiku tasteri imaju druga imena), greybox probnih nivoa i prečica za razvoj.
- Već postoji 209 kratkih replika u borbi (`make-voice-lines.py`, `dist/assets/voice/`): Marko, Musa, Ravijojla, age, Turci, putnici. One ostaju.
- Novi nalog ima 40.000 kredita mesečno (vraćaju se 16. 12.). Stari nalog dobija 121.215 kredita 27. 11.

## Plan i cena

| Tura | Šta | Replika | Kredita (najviše) | Gde |
|---|---|---:|---:|---|
| 1 | Svi postojeći dijalozi, uvodi nivoa i prelazi između pesama (sve iz ovog popisa što se ozvučava) | 273 | 34.605 | novi nalog, odmah |
| 2 | Miloš peva: 3 stiha Miloša i 3 vilina, po 3–4 pokušaja dok pesma ne legne | 6 | oko 1.500 | novi nalog |
| 3 | Nove replike za sve nivoe: oko 10 po nivou (Marko 5, Ravijojla 2, ljudi sa nivoa 3) | 170 | 9.690 | ostatak novog naloga, pa stari od 27. 11. |
| | Ukupno | 449 | 45.795 | |

Ovo je gornja granica: računa 1 kredit po znaku i oznake za ton. Proba od 16. 11. (64 znaka) potrošila je samo 26 kredita, pa je stvarna cena možda i upola manja. Proverava se na prvih dvadesetak replika ture 1, pre nego što se pusti ostatak.

Pevanje: ElevenLabs govor ume da „zapeva“ uz oznaku [sings], ali to nije prava pesma. Zato tura 2 počinje jednim stihom za probu; ako ne valja, Miloševa pesma ostaje uz gusle iz igre, a govori se samo ono što Miloš kaže.

### Nove replike po nivoima (predlog, tekstovi se pišu posle dogovora)

| Nivo | Ko bi još govorio |
|---|---|
| Kačanik · Musa Kesedžija (prvi pohod) | Marko i Ravijojla, plus putnici (starac, trgovac, majka sa detetom), Musa |
| selo · Kosovsko selo | Marko i Ravijojla, plus seljanke i starci iz crkve, konjušar, sirotinja |
| suma · Miroč-planina | Marko i Ravijojla, plus Miloš na putu i dok peva |
| manastir · Manastirski vis | Marko i Ravijojla, plus kaluđeri, kralj Vukašin, carević Uroš |
| oranje · Oranje drumova · Oranje Markovo | Marko i Ravijojla, plus majka Jevrosima, janičari na drumu |
| tvrdjava · Opsednuta tvrđava | Marko i Ravijojla, plus branioci na bedemu, Mustaf-aga |
| podrum · Ramazan | Marko i Ravijojla, plus čauši, sultan |
| mocvara · Ranjeni soko | Marko i Ravijojla, plus vezir, lovci |
| pecina · Vilinska pećina | Marko i Ravijojla, plus odjek pećine, duhovi starih junaka |
| prevoj · Musa Kesedžija | Marko i Ravijojla, plus Velimir, Vuča dženeral, tri vojvode |
| klisura · Klisura Ibra | Marko i Ravijojla, plus guslari, Đemo Brđanin, krčmarica Janja |
| rusevine · Svadbarina | Marko i Ravijojla, plus Kosovka devojka, svatovi, Arapin |
| rudnik · Tri kese dukata | Marko i Ravijojla, plus rudari |
| reka · Obala pred zoru | Marko i Ravijojla, plus Filip Madžarin, putnici na skeli |
| vracara · Vračeva jaruga | Marko i Ravijojla, plus Crni vrač, ljudi od senki |
| urvina · Urvina planina · Smrt Marka Kraljevića | Marko i Ravijojla, plus Šarac, vila sa vrha |
| san · San Kraljevića Marka | Marko i Ravijojla, plus vila sa guslama, glasovi iz odaja |

## Po vrsti

| Vrsta | Replika | Znakova | Minuta | Ozvučiti |
|---|---:|---:|---:|---|
| pripovedanje | 59 | 8.373 | 13 | da |
| uputstvo | 65 | 6.312 | 10 | ne |
| prelaz između pesama | 45 | 3.887 | 6 | da |
| dijalog | 33 | 3.830 | 6 | da |
| razgovor u sceni | 30 | 3.643 | 6 | da |
| greybox (probni nivoi) | 19 | 3.245 | 5 | ne |
| priča u sceni | 23 | 3.240 | 5 | da |
| uvod nivoa | 17 | 2.185 | 3 | da |
| savet | 17 | 1.485 | 2 | da |
| zapis | 14 | 1.342 | 2 | da |
| zagonetka | 12 | 1.286 | 2 | da |
| samo za razvoj | 9 | 1.081 | 2 | ne |
| uvod igre | 7 | 759 | 1 | da |
| vodič | 6 | 501 | 1 | da |
| odbrana: uvod | 5 | 479 | 1 | da |
| odbrana: kraj | 5 | 319 | 0 | da |

## Ko govori i kojim glasom

Samo replike predložene za ozvučavanje. „Predlog“ znači da glas još nije potvrđen: lako se menja u `art/glasovi/glasovi.json`.

| Lik | Replika | Znakova | Minuta | Glas | Stanje |
|---|---:|---:|---:|---|---|
| GUSLAR | 196 | 22.919 | 34.7 | David – Movie Trailer Narrator | predlog: epski trejler narator (Stefan 16. 11.: ne Vuk, nego glas iz filmskih trejlera); zamena Helmut – German Epic Trailer (g1jpii0iyvtRs8fqXsd1) |
| RAVIJOJLA | 30 | 2.688 | 4.1 | Ida – Clear, Confident Serbian | isti glas kao do sada |
| MARKO | 21 | 2.231 | 3.4 | Tuco (klon) | Tuco klon iz novog naloga; latinica i jedna jednostavna oznaka + [gruff] (16. 11.: ćirilica i duge oznake su mu davale čudan naglasak) |
| MILOŠ | 6 | 697 | 1.1 | Adnan – Energetic | predlog |
| KOSOVKA DEVOJKA | 3 | 483 | 0.7 | Maja – Engaging, Narrative | predlog |
| GLAS IZ CRKVE | 2 | 343 | 0.5 | Dylan – Profesional, Warm | predlog |
| VUČA DŽENERAL | 2 | 278 | 0.4 | Nikola – Authoritative, Deep | predlog |
| MUSTAF-AGA | 2 | 245 | 0.4 | Eric (glas janičarskog age) | predlog: Turci govore srpski sa stranim naglaskom |
| VELIMIROVICA | 1 | 217 | 0.3 | Sara – Sharp & Professional | predlog |
| ŠARAC | 1 | 209 | 0.3 | Luka – Calm, Narrative | predlog |
| DVA MLADA ČAUŠA | 1 | 202 | 0.3 | Liam (glas strelaca) | predlog |
| ČAUŠ | 1 | 147 | 0.2 | Brian (glas bajraktara) | predlog |
| KRČMARICA JANJA | 1 | 138 | 0.2 | Milena – Female Balkan | predlog |
| MILOŠ OD POCERJA | 1 | 121 | 0.2 | Tomislav – Calm, Clear | predlog |
| GOSPODA (Orid, Vučitrn, Zvečan) | 1 | 112 | 0.2 | Fran – Calm, Narrative | predlog |
| KONJUŠAR | 1 | 101 | 0.2 | Davor – Conversational | predlog |
| KRALJ VUKAŠIN | 1 | 85 | 0.1 | Marko – Deep, Calm | predlog |
| STARAC | 1 | 84 | 0.1 | Nikola – Balkan | isti kao putnik starac |
| JANIČARI | 1 | 29 | 0.0 | Harry (glas janičara) | predlog |

Guslar nosi najviše teksta. Od toga je 45 replika (7.261 znakova) priča sa citatom u kojoj neko drugi govori („…“). Te replike mogu da se podele: guslar čita priču, a citat izgovara lik čiji je (Arapin, Filip, Vuča, Đemo, Šarac…). Tako se u igri čuje više ljudi, a cena ostaje ista.

## Po nivou

| Nivo | Replika | Znakova | Minuta |
|---|---:|---:|---:|
| Kačanik · Musa Kesedžija (prvi pohod) | 30 | 3.563 | 5.4 |
| selo · Kosovsko selo | 9 | 1.019 | 1.5 |
| suma · Miroč-planina | 35 | 3.701 | 5.6 |
| manastir · Manastirski vis | 12 | 1.746 | 2.6 |
| oranje · Oranje drumova · Oranje Markovo | 10 | 809 | 1.2 |
| tvrdjava · Opsednuta tvrđava | 14 | 1.722 | 2.6 |
| podrum · Ramazan | 14 | 1.900 | 2.9 |
| mocvara · Ranjeni soko | 7 | 700 | 1.1 |
| pecina · Vilinska pećina | 5 | 367 | 0.6 |
| prevoj · Musa Kesedžija | 16 | 2.334 | 3.5 |
| klisura · Klisura Ibra | 18 | 2.197 | 3.3 |
| rusevine · Svadbarina | 14 | 1.822 | 2.8 |
| rudnik · Tri kese dukata | 5 | 452 | 0.7 |
| reka · Obala pred zoru | 18 | 2.075 | 3.1 |
| vracara · Vračeva jaruga | 1 | 143 | 0.2 |
| urvina · Urvina planina · Smrt Marka Kraljevića | 16 | 2.220 | 3.4 |
| san · San Kraljevića Marka | 17 | 1.961 | 3.0 |
| azak · Azačka kula | 1 | 137 | 0.2 |
| Kroz celu igru | 31 | 2.461 | 3.7 |

## Sve replike, nivo po nivo

Svaka stavka: **lik** · broj znakova · tekst. Iza teksta je mesto u kodu. Replike koje se ne ozvučavaju su na kraju.

### Kačanik · Musa Kesedžija (prvi pohod)

**Uvod igre** · 7 replika · 759 znakova

- **GUSLAR** · 127 · Kažu da Kraljević Marko nije umro. Spava u pećini, Šarac kraj njega jede mahovinu, a sablja mu se malo-pomalo izvlači iz stene.  
  <sub>`d8da638d829` · uvod igre · INTRO 1 · Kaže pesma… · na srpskom ga čita narator (ranije lokalni model)</sub>
- **GUSLAR** · 133 · U to vreme Musa Kesedžija zatvori drumove i primorje. Topuz baca u oblake i dočekuje ga u bele ruke, a klisurom niko ne sme da prođe.  
  <sub>`de4a95b1c14` · uvod igre · INTRO 2 · Klisura Kačanika · na srpskom ga čita narator (ranije lokalni model)</sub>
- **GUSLAR** · 90 · Na obali podiže kulu sa gvozdenim čengelama. Otima carevo blago, a putnike drži u ropstvu.  
  <sub>`d1686082ae1` · uvod igre · INTRO 3 · Kula kraj mora · na srpskom ga čita narator (ranije lokalni model)</sub>
- **GUSLAR** · 104 · Kad caru dodijaše tužbe, iz tamnice izvede jedinog junaka koga se Musa ne bi uplašio — Kraljevića Marka.  
  <sub>`d90c11e2551` · uvod igre · INTRO 4 · Pred sultanom · na srpskom ga čita narator (ranije lokalni model)</sub>
- **GUSLAR** · 97 · Tri godine tamnice slomile su mu snagu. Vraćala mu se polako, kao ranjeniku pod sokolovim krilom.  
  <sub>`d4ea4781fbf` · uvod igre · INTRO 5 · Tri godine tamnice · na srpskom ga čita narator (ranije lokalni model)</sub>
- **GUSLAR** · 73 · Car mu nudi vojsku i blago. Marko uzima samo Šarca, topuz i očevu sablju.  
  <sub>`d81c66e8f50` · uvod igre · INTRO 6 · Bez vojske · na srpskom ga čita narator (ranije lokalni model)</sub>
- **GUSLAR** · 135 · Na izvoru pod planinom javi mu se posestrima, vila Ravijojla: „Idi, brate. Ja ću biti uz tebe.” Tako počinje pesma o tri srca Kačanika.  
  <sub>`da695e26cc1` · uvod igre · INTRO 7 · Vila Ravijojla · na srpskom ga čita narator (ranije lokalni model)</sub>

**Kačanik: poglavlja** · 6 replika · 606 znakova

- **GUSLAR** · 140 · Musa Kesedžija zatvorio je drum kroz Kačanik. Tri godine niko ne prođe: ni kaluđer, ni trgovac, ni majka sa detetom. Marko ide da ga otvori.  
  <sub>`d96543876bd` · priča u sceni · 0 1 · Klisura Kačanika</sub>
- **GUSLAR** · 83 · Na kapiji Musini ljudi drže putnike kao roblje. Hrastova vrata čekaju Markov topuz.  
  <sub>`dcb04815a96` · priča u sceni · 1 1 · Zatočena kapija</sub>
- **GUSLAR** · 97 · Gde drum propade u provaliju, Ravijojla budi stare kamenove. Preko ponora niče most od svetlosti.  
  <sub>`dc86243c3ea` · priča u sceni · 2 1 · Vilinski trag</sub>
- **GUSLAR** · 97 · Šarac je čekao svog gospodara. Gde drum pukne pod nogama, šareni konj ga preskače u jednom skoku.  
  <sub>`d0743210aeb` · priča u sceni · 3 1 · Šarčev zalet</sub>
- **GUSLAR** · 91 · Pod zidinama juriša turska horda, a s bedema grmi top. Još jedan barjak deli Marka od Muse.  
  <sub>`dd5def571bd` · priča u sceni · 4 1 · Poslednji barjak</sub>
- **GUSLAR** · 98 · U klisuri čeka Musa, div sa tri srca. Na trećem mu spava zmija. Megdan se bije dok jedan ne padne.  
  <sub>`d0573966db5` · priča u sceni · 5 1 · Tri srca Kačanika</sub>

**Kačanik: početak** · 3 replika · 476 znakova

- **GUSLAR** · 156 · Sedi, brate, da ti pevam o Kraljeviću Marku: kako je Šarca potkovao, kako je po pravdi presudio, kako je careve drumove orao i kako je s Musom megdan delio.  
  <sub>`d6d1c93a94f` · priča u sceni · pocetak 1 · Kaže guslar…</sub>
- **GUSLAR** · 152 · Beše sin kralja Vukašina i majke Jevrosime. Majka ga je učila: „Nemoj, sine, govoriti krivo, ni po babu, ni po stričevima, već po pravdi Boga istinoga.”  
  <sub>`daa34c0365f` · priča u sceni · pocetak 2 · Prilep</sub>
- **GUSLAR** · 168 · Konje je birao tako što ih je hvatao za rep i okretao oko sebe. Samo jedno šareno, bolesno ždrebe nije mogao da pomeri. Njega je vinom othranio, i s njim počinje pesma.  
  <sub>`de17a143b32` · priča u sceni · pocetak 3 · Šarac</sub>

**Megdan sa Musom** · 7 replika · 1.137 znakova

- **GUSLAR** · 214 · Nosiše se letnji dan do podne, i Musa obori Marka u zelenu travu. Ali procvile Kraljeviću Marko: „Đe si danas, posestrimo vilo?” Javi mu se iz oblaka vila, a dok Musa gleda brdu i oblaku, Marko mače nože iz potaje.  
  <sub>`d0f9c33ba88` · priča u sceni · end 1 · Vila iz oblaka</sub>
- **GUSLAR** · 139 · A kad stade Marko premetati, al’ u Musi tri srca junačka: jedno mu se srce umorilo, a drugo se jako razigralo, na trećemu ljuta guja spava.  
  <sub>`dbcc3f1b6bc` · priča u sceni · end 2 · Tri srca junačka</sub>
- **GUSLAR** · 158 · Kad se guja probudila, još je Marku govorila: „Moli Boga, Kraljeviću Marko, đe se nisam probudila bila dok je Musa u životu bio: od tebe bi trista jada bilo.”  
  <sub>`d0c284362e7` · priča u sceni · end 3 · Guja progovara</sub>
- **GUSLAR** · 113 · Kad to viđe Kraljeviću Marko, proli suze niz bijelo lice: „Jaoh mene do Boga miloga, đe pogubih od sebe boljega!”  
  <sub>`db319e36849` · priča u sceni · end 4 · Od sebe boljega</sub>
- **GUSLAR** · 127 · Ranjen, ali živ, Marko ide niz klisuru. Šarac korača pored njega, a drum kroz Kačanik ponovo je slobodan. Tako se peva i danas.  
  <sub>`d349666f4c2` · priča u sceni · end 5 · Posle megdana</sub>
- **GUSLAR** · 169 · „Bože mili, na svem tebi hvala, kad brž’ ode sa junaka glava!” Četiri sluge Marko ostavi za pravdu, da kazuju kako j’ bilo Arapu i Marku. Svadbarine na Kosovu više nema.  
  <sub>`d41f5aefd94` · pripovedanje · slay · game.js:286</sub>
- **GUSLAR** · 217 · „Bogom brate, Kraljeviću Marko, evo tebe tri tovara blaga.” Marko neće da uzima blaga, već on njima tri tovara vrati, što su dali Đemu Brđaninu. Pa uze ribe od Orida i ode bijelu Prilipu, te on slavi svoga svetitelja.  
  <sub>`d7bfe97e465` · pripovedanje · slay · game.js:286</sub>

**Kačanik: odbrana kapije** · 3 replika · 224 znakova

- **RAVIJOJLA** · 75 · Musina straža zove pojačanje! Tri talasa dolaze, a putnici čekaju iza tebe.  
  <sub>`d9c9d4936e4` · vodič · DEF_TEXT.0</sub>
- **RAVIJOJLA** · 93 · Putnici beže kroz kapiju! Zadrži pojačanje dok svi ne pređu. Tri talasa dolaze sa obe strane.  
  <sub>`da85d22f841` · vodič · DEF_TEXT.1</sub>
- **RAVIJOJLA** · 56 · Obruč se steže oko poslednjeg barjaka! Odbij tri talasa.  
  <sub>`d2a302d0315` · vodič · DEF_TEXT.4</sub>

**Kačanik: putnici** · 1 replika · 84 znakova

- **STARAC** · 84 · Tri godine niko ne prođe ovim drumom. Musa Kesedžija zatvorio je drumove i primorje.  
  <sub>`d83512a99cf` · dijalog · updateTravelers · game.js:366</sub>

**Kačanik: Ravijojla vodi** · 3 replika · 277 znakova

- **RAVIJOJLA** · 98 · Marko, Musini ljudi su zatvorili drum, a putnici čekaju da ih provedeš. Prati naše crvene barjake.  
  <sub>`d4a97636a3a` · vodič · world.js:4</sub>
- **RAVIJOJLA** · 89 · Još jedan odred čuva prilaz Musi. Vino daje snagu — Q. Sačuvaj gutljaj za završni megdan.  
  <sub>`d70f6286fae` · vodič · world.js:8</sub>
- **RAVIJOJLA** · 90 · Musa ima tri srca. Posle njegovog napada gard se otvara. L za odbijanje, E za moj bljesak.  
  <sub>`dc347f59123` · vodič · world.js:9</sub>

### selo · Kosovsko selo

**Prelaz pred pesmu** · 3 replika · 298 znakova

- **GUSLAR** · 104 · U kosovskom selu kovač potkiva Šarca. Jedna potkova ostade na nakovnju, i po njoj se selo i danas pamti.  
  <sub>`d42c16c689f` · prelaz između pesama · selo 1 · Kosovsko selo</sub>
- **GUSLAR** · 98 · Ali turski odred opkoli selo. Žene sklanjaju decu, a Marko izjahuje kroz kapiju sa topuzom u ruci.  
  <sub>`d0ca4f71ff1` · prelaz između pesama · selo 2 · Opsada</sub>
- **GUSLAR** · 96 · Šarac korača drumom u zoru. Iza Marka se vije barjak, a pred njim je selo koje treba osloboditi.  
  <sub>`d1050298bd9` · prelaz između pesama · selo 3 · Na drumu</sub>

**Uvod nivoa** · 1 replika · 136 znakova

- **GUSLAR** · 136 · Kažu da je ovde potkovan Šarac i da je jedna potkova ostala u selu. Selo je pod opsadom: oteraj odred i stigni do barjaka na kraju puta.  
  <sub>`d6b64c7cf32` · uvod nivoa · selo</sub>

**Zapis legende** · 1 replika · 105 znakova

- **GUSLAR** · 105 · Pod Prilepom pričaju: mladi Marko napojio je vilu u žegi, a vila mu za uzvrat dade snagu kakvu niko nema.  
  <sub>`dfb1959e8ab` · zapis · ZAPISI.selo</sub>

**Vašar konja** · 4 replika · 480 znakova

- **GUSLAR** · 161 · „Taj je šugav, Marko, sirotinjsko ždrebe!” A Marko mu da vina: pola pije, pola Šarcu daje. Spade šuga, a ždrebe se razigra, šareno kao goveče, a hitro kao vihor.  
  <sub>`d1e4708269c` · pripovedanje · useVasar · game.js:3563</sub>
- **MARKO** · 110 · Uhvati Marko šareno ždrebe za rep, zamahnu njime, a ždrebe se ni s mesta ne pomače. „Ovo je, brate, moj konj!”  
  <sub>`df0c4e29f11` · dijalog · useVasar · game.js:3568 · mešovito: priča + citat</sub>
- **KONJUŠAR** · 101 · „E, nije taj, Marko!” smeju se ljudi na vašaru. Konja koji će tebe nositi ni junak ne može da pomeri.  
  <sub>`dafe0efd698` · dijalog · useVasar · game.js:3570</sub>
- **GUSLAR** · 108 · Novak kovač potkova Šarca, a jedna potkova osta u selu, da se pamti. Šarac te čeka; ti oteraj odred iz sela.  
  <sub>`d232113ed55` · pripovedanje · updateVasar · game.js:3579</sub>

### suma · Miroč-planina

**Prelaz pred pesmu** · 4 replika · 409 znakova

- **GUSLAR** · 125 · Jahali su Marko i pobratim Miloš preko Miroča. Miloš zapeva, a peva lepše od vile. Ravijojla ga zato ustreli u grlo i u srce.  
  <sub>`d66cce03485` · prelaz između pesama · suma 1 · Miroč-planina</sub>
- **GUSLAR** · 124 · „Jao Šaro, moje desno krilo, dostigni mi vilu Ravijojlu!” Koga Marko stigne, taj mu postaje ili mrtav dušmanin ili pobratim.  
  <sub>`d6b30ab6834` · prelaz između pesama · suma 2 · Potera</sub>
- **GUSLAR** · 97 · Palikuće potpališe bukvu na kojoj orlušina ima gnezdo. Orlići pište, a plamen se penje uz stablo.  
  <sub>`d2f12e04245` · prelaz između pesama · suma 3 · Palikuće</sub>
- **GUSLAR** · 63 · Orlušina kruži nad šumom i čeka junaka koji će joj spasti decu.  
  <sub>`d31672ed419` · prelaz između pesama · suma 4 · Orlušina</sub>

**Uvod nivoa** · 1 replika · 151 znakova

- **GUSLAR** · 151 · Miroč-planina. Jašeš uz pobratima Miloša, sve konj do konja. Ovo je vilina gora, Marko: pazi šta se u njoj peva. *(18. 11.: nov tekst, bez snimka; stari je odavao pesmu)*  
  <sub>`d391f56272c` · uvod nivoa · suma</sub>

**Marko i vila (Miroč)** · 29 replika · 3.046 znakova

- **GUSLAR** · 109 · Pojezdiše do dva pobratima preko krasna Miroča planine: jedno je Kraljeviću Marko, a drugo je vojvoda Milošu.  
  <sub>`d5354a00567` · razgovor u sceni · PV_STIH 1</sub>
- **GUSLAR** · 118 · Napoporedo jezde dobre konje, napoporedo nose koplja bojna, jedan drugom belo lice ljubi, od miloste do dva pobratima.  
  <sub>`d11a1152f6b` · razgovor u sceni · PV_STIH 2</sub>
- **MARKO** · 88 · „A moj brate, vojvoda Milošu, teško me je sanak obrvao. Pevaj, brate, te me razgovaraj!”  
  <sub>`d7a69f9dd74` · razgovor u sceni · PV_STIH 3</sub>
- **MILOŠ** · 191 · „Ja bih tebe, brate, popevao, al’ sam sinoć mnogo pio vino u planini s vilom Ravijojlom, pak je mene zapretila vila: ako mene čuje da popevam, hoće mene ona ustreliti i u grlo i u srce živo.”  
  <sub>`d8b01daa2d6` · razgovor u sceni · PV_STIH 4</sub>
- **MARKO** · 116 · „Pevaj, brate, ti se ne boj vile dok je mene, Kraljevića Marka, i mojega vidovita Šarca, i mojega šestopera zlatna!”  
  <sub>`d8c224c6375` · razgovor u sceni · PV_STIH 5</sub>
- **RAVIJOJLA** · 61 · „Ne pevaj mi, Milošu, kroz goru, gora moja, i pesma je moja!”  
  <sub>`d1e96925820` · razgovor u sceni · PV_VILA 1</sub>
- **RAVIJOJLA** · 57 · „Lepše grlo u vile planinke, nego u svih junaka carevih!”  
  <sub>`d37afba0313` · razgovor u sceni · PV_VILA 2</sub>
- **RAVIJOJLA** · 57 · „Kad ne ćutiš, ja ću te ućutati, i u grlo i u srce živo!”  
  <sub>`ddde937a74a` · razgovor u sceni · PV_VILA 3</sub>
- **MILOŠ** · 91 · „Pevam, braćo, od starih kraljeva, kako j’ koji držô kraljevinu po čestitoj po Maćedoniji.”  
  <sub>`d70122f8ef0` · razgovor u sceni · PV_MILOS 1</sub>
- **MILOŠ** · 96 · „Kralj Milutin Nagoričino zida, a Vukašin Markov manastir gradi, zadužbinu za dušu i za spomen.”  
  <sub>`d35691cd959` · razgovor u sceni · PV_MILOS 2</sub>
- **MILOŠ** · 84 · „Car Dušan je Svete Arhanđele, što ih vide i gora i voda; svaki sebe ima zadužbinu.”  
  <sub>`d56c6340476` · razgovor u sceni · PV_MILOS 3</sub>
- **GUSLAR** · 129 · Miloš je kroz Miroč zapevao lepše od vile, pa ga je Ravijojla ustrelila u grlo i u srce. Eno ti Šarca, Marko: uzjaši i stigni je!  
  <sub>`d6632c9974e` · pripovedanje · updatePotera · game.js:3616</sub>
- **GUSLAR** · 161 · „Bogom brate, Kraljeviću Marko! Pusti me u planinu živu, da naberem po Miroču bilja, da zagasim rane na junaku.” Marko je pusti, i od tada mu je vila posestrima.  
  <sub>`de9cc382ec8` · pripovedanje · updatePotera · game.js:3624</sub>
- **MILOŠ** · 106 · „Gusta je gora, pobratime: konje ćemo voditi, a sablje u ruke.” Miloš ide peške uz tebe i bije se sabljom.  
  <sub>`d08ca526805` · dijalog · updateJahanje · game.js:3704</sub>
- **GUSLAR** · 83 · Rasrdi se vila Ravijojla, pak odskoči u Miroč planinu, zape luka i dve bele strele.  
  <sub>`de9d5323fc9` · pripovedanje · pvStreleTick · game.js:3756</sub>
- **MILOŠ** · 129 · „Jao moja majko! Jao Marko, Bogom pobratime! Jao brate, vila me ustreli! A nisam li tebe besedio da ne pevam kroz Miroč planinu?”  
  <sub>`d985e4aae5e` · dijalog · pvStreleTick · game.js:3763</sub>
- **MARKO** · 206 · „Jao Šaro, moje desno krilo, dostigni mi vilu Ravijojlu! Čistim ću te srebrom potkovati, čistim srebrom i žeženim zlatom; pokriću te svilom do kolena, od kolena kite do kopita; grivu ću ti izmešati zlatom.”  
  <sub>`da9530c913c` · dijalog · pvStreleTick · game.js:3767</sub>
- **MARKO** · 172 · „Ako li mi ne dostigneš vile, oba ću ti oka izvaditi, sve četiri noge podlomiti, pa ću t’ ovde tako ostaviti, te se tuci od jele do jele, k’o ja, Marko, bez mog pobratima.”  
  <sub>`df9ea67e36c` · dijalog · pvStreleTick · game.js:3768</sub>
- **MARKO** · 61 · „Zašto, vilo, da te Bog ubije! Zašt’ ustreli pobratima moga?”  
  <sub>`ddf1e9ab852` · dijalog · pvBije · game.js:3776</sub>
- **GUSLAR** · 91 · Pak je stade biti buzdovanom, prevrće je s desne na lijevu, pak je bije šestoperom zlatnim.  
  <sub>`d8c0aa4d23f` · dijalog · pvBije · game.js:3776</sub>
- **MARKO** · 57 · „Daj ti bilje onome junaku, jer se nećeš nanositi glave.”  
  <sub>`d11690063ef` · dijalog · pvBije · game.js:3776</sub>
- **RAVIJOJLA** · 149 · „Bogom brate, Kraljeviću Marko, višnjim Bogom i Svetim Jovanom! Daj me puštaj u planinu živu, da naberem po Miroču bilja, da zagasim rane na junaku.”  
  <sub>`da0d730d279` · dijalog · pvBije · game.js:3779</sub>
- **GUSLAR** · 127 · Al’ je Marko milostiv na Boga, a žalostiv na srcu junačkom: pusti vilu u planinu živu. Sada si ti vila: naberi bilje po Miroču.  
  <sub>`d2b746ac825` · pripovedanje · pvBije · game.js:3780</sub>
- **GUSLAR** · 87 · Bilje bere po Miroču vila, bilje bere, često se odziva: „Sad ću doći, Bogom pobratime!”  
  <sub>`d763d6aaefe` · pripovedanje · pvBiljeTick · game.js:3794</sub>
- **MARKO** · 32 · „Vilo! Gde si, vilo? Odzovi se!”  
  <sub>`d962e320021` · dijalog · pvBiljeTick · game.js:3796</sub>
- **MARKO** · 65 · „Rekoh ti, vilo, da se odzivaš! Natrag, dok ti glavu nisam uzeo!”  
  <sub>`db73b50afe9` · dijalog · pvBiljeTick · game.js:3798</sub>
- **GUSLAR** · 139 · I zagasi rane na junaku: lepše grlo u Miloša carsko, jeste lepše nego što je bilo, a zdravije srce u junaku, baš zdravije nego što je bilo.  
  <sub>`d94f7950afb` · pripovedanje · pvLeciTick · game.js:3824</sub>
- **GUSLAR** · 101 · Ode vila u Miroč planinu, ode Marko s pobratimom svojim. Jašite dalje, a Turci lovci čekaju na drumu.  
  <sub>`d278f8f5cf5` · pripovedanje · pvLeciTick · game.js:3829</sub>
- **GUSLAR** · 83 · Vila leti po vrhu planine, Šarac jezdi po sredi planine: nigde vile čuti ni videti.  
  <sub>`de206f7eb32` · pripovedanje · pvTrka · game.js:3910</sub>

**Zapis legende** · 1 replika · 95 znakova

- **GUSLAR** · 95 · Orao je Marku čuvao san u gori, raširenih krila nad njim, jer ga je Marko nekad spasao od žeđi.  
  <sub>`dafedc256d0` · zapis · ZAPISI.suma</sub>

### manastir · Manastirski vis

**Prelaz pred pesmu** · 3 replika · 262 znakova

- **GUSLAR** · 87 · Pred manastirom se svađaju carevići čije je carstvo. Niko ne sme da presudi, sem Marka.  
  <sub>`d932c3ba533` · prelaz između pesama · manastir 1 · Manastirski vis</sub>
- **GUSLAR** · 97 · Marko pred carskom knjigom presudi po pravdi: carstvo je Uroševo. Ni ocu za ljubav ne reče krivo.  
  <sub>`d83deb3006a` · prelaz između pesama · manastir 2 · Pravda</sub>
- **GUSLAR** · 78 · Zazvoniše zvona manastirska. Oklopnici čuvaju prilaz, a Marko se penje stazom.  
  <sub>`de74369a674` · prelaz između pesama · manastir 3 · Zvona</sub>

**Uvod nivoa** · 1 replika · 138 znakova

- **GUSLAR** · 138 · Kraljevi se svađaju čije je carstvo, a carska knjiga čuva se u manastiru. Oklopnici čuvaju prilaz. Probij se, Marko, pa presudi po pravdi.  
  <sub>`d6a769dd58c` · uvod nivoa · manastir</sub>

**Zapis legende** · 1 replika · 87 znakova

- **GUSLAR** · 87 · Marko je krunu presudio Urošu po pravdi, iako je znao da će se otac Vukašin razgneviti.  
  <sub>`d84444afd67` · zapis · ZAPISI.manastir</sub>

**Uroš i Mrnjavčevići (Samodreža)** · 7 replika · 1.259 znakova

- **GUSLAR** · 232 · „Knjiga kaže: na Urošu carstvo!” Kad to začu Vukašine kralju, skoči kralju od zemlje na noge, pa potrže zlaćena handžara da ubode svoga sina Marka. Bježi Marko ispred roditelja, jer se njemu ne pristoji sa svojim se biti roditeljem.  
  <sub>`dc609e949ea` · pripovedanje · crkvaBeg · game.js:3477</sub>
- **GLAS IZ CRKVE** · 231 · Dok su triput kolo sastavili oko b’jele Samodreže crkve, gotovo ga bješe sustigao, al’ iz crkve nešto progovara: „Bjež’ u crkvu, Kraljeviću Marko! Vidiš đe ćeš danas poginuti, poginuti od svog roditelja, a za pravdu Boga istinoga.”  
  <sub>`d5336ae74df` · dijalog · updateCrkva · game.js:3490 · mešovito: priča + citat</sub>
- **GUSLAR** · 83 · Kralj dopade na crkvena vrata, po direku udari handžarom, iz direka krvca pokapala.  
  <sub>`d643396e893` · pripovedanje · updateCrkva · game.js:3496</sub>
- **KRALJ VUKAŠIN** · 85 · Tad se kralje bio pokajao: „Lele mene, do Boga jednoga, đe pogubih svoga sina Marka!”  
  <sub>`d3b953eb8d7` · dijalog · updateCrkva · game.js:3498 · mešovito: priča + citat</sub>
- **GLAS IZ CRKVE** · 112 · Al’ iz crkve nešto progovara: „A čuješ li, Vukašine kralju, ti nisi posjekao Marka, već posječe božjega anđela.”  
  <sub>`d40ec573579` · dijalog · updateCrkva · game.js:3499 · mešovito: priča + citat</sub>
- **GUSLAR** · 300 · Na Marka je vrlo žao kralju, te ga ljuto kune i proklinje: „Ti nemao groba ni poroda! I da bi ti duša ne ispala dok turskoga cara ne dvorio!” Kralj ga kune, car ga blagosilja: „Kume Marko, Bog ti pomogao! Tvoje lice svjetlo na divanu, tvoja sablja sjekla na mejdanu!” Što su rekli, tako mu se steklo.  
  <sub>`d832ecc90f0` · pripovedanje · presudaBlagoslov · game.js:3930</sub>
- **GUSLAR** · 216 · „Knjiga kaže: na Urošu carstvo!” Kralj ga kune: „Ti nemao groba ni poroda, i da bi ti duša ne ispala dok turskoga cara ne dvorio!” A car ga blagosilja: „Tvoje lice svijetlo na divanu, tvoja sablja sjekla na mejdanu!”  
  <sub>`d2cce3e3496` · pripovedanje · presudaBlagoslov · game.js:3931</sub>

### oranje · Oranje drumova · Oranje Markovo

**Prelaz pred pesmu** · 3 replika · 195 znakova

- **GUSLAR** · 72 · Majka moli Marka da ostavi četovanje i da ore, jer je dosta krvi prolio.  
  <sub>`d7888ee4ae7` · prelaz između pesama · oranje 1 · Oranje Markovo</sub>
- **GUSLAR** · 75 · Marko posluša majku, ali ne ore ni brda ni doline, nego ore careve drumove.  
  <sub>`df18ddd3359` · prelaz između pesama · oranje 2 · Ore drumove</sub>
- **GUSLAR** · 48 · Volovi vuku plug, a ptice slede brazdu po drumu.  
  <sub>`d4458e77798` · prelaz između pesama · oranje 3 · Brazda</sub>

**Zapis legende** · 1 replika · 123 znakova

- **GUSLAR** · 123 · Majka reče Marku da ostavi boj i ore; Marko zaora careve drumove, a janičarima što mu pogaziše oranje uze tri tovara blaga.  
  <sub>`d5a48372e00` · zapis · ZAPISI.oranje</sub>

**Oranje Markovo i strela** · 6 replika · 491 znakova

- **JANIČARI** · 29 · „More Marko, ne ori drumova!”  
  <sub>`db9e21e3301` · dijalog · updatePlows · game.js:2384</sub>
- **MARKO** · 31 · „More Turci, ne gaz’te oranja!”  
  <sub>`d48c31b6f93` · dijalog · updatePlows · game.js:2385</sub>
- **MARKO** · 27 · „To sam tebe danas izorao.”  
  <sub>`dd3f03c7df2` · dijalog · updatePlows · game.js:2387</sub>
- **GUSLAR** · 110 · Carev Alil-aga sa trideset janičara stoji nasred druma i hvata te za skut dolame. Neće te pustiti bez megdana.  
  <sub>`d1fc8ecb37f` · pripovedanje · updateStrela · game.js:3952</sub>
- **GUSLAR** · 219 · „Bogom brate, Kraljeviću Marko! Na čast tebi moji beli dvori, tek me nemoj, brate, obesiti!” A Marko: „Sve bih ti, brate, oprostio, ali si mi izdr’o dolamu: već daj mene tri tovara blaga.” Od tada krajinu brane zajedno.  
  <sub>`dce37290cce` · pripovedanje · updateStrela · game.js:3962</sub>
- **GUSLAR** · 75 · Stiže ti strela Tataranka, sa devet belih sokolovih pera. Zategni do kraja!  
  <sub>`d8519899d46` · pripovedanje · updateStrela · game.js:3963</sub>

### tvrdjava · Opsednuta tvrđava

**Prelaz pred pesmu** · 3 replika · 242 znakova

- **GUSLAR** · 72 · Tvrđava gori pod turskom opsadom, a katapulti bacaju vatru preko bedema.  
  <sub>`d2861bbad40` · prelaz između pesama · tvrdjava 1 · Opsednuta tvrđava</sub>
- **GUSLAR** · 108 · U turskom taboru mladi Turčin nosi sablju sa tri zlatna balčaka. To je sablja kralja Vukašina, Markovog oca.  
  <sub>`d787fd435e2` · prelaz između pesama · tvrdjava 2 · Očeva sablja</sub>
- **GUSLAR** · 62 · Marko sa brda gleda kako tvrđava gori. Sablju će uzeti natrag.  
  <sub>`d4f7fee59b3` · prelaz između pesama · tvrdjava 3 · Pred bedemima</sub>

**Uvod nivoa** · 1 replika · 169 znakova

- **GUSLAR** · 169 · Tvrđava gori pod opsadom. U turskom taboru, kažu, mladi Turčin za pojasom nosi sablju sa tri zlatna balčaka: sablju Markovog oca. Probij se kroz opsadu i uzmi je natrag.  
  <sub>`dcf9a89df2a` · uvod nivoa · tvrdjava</sub>

**Marko poznaje očinu sablju** · 9 replika · 1.220 znakova

- **GUSLAR** · 163 · Dođe ferman od cara turskoga Mustaf-agi da ide na vojsku. Ode Mujo na carevu vojsku, pripasao sablju okovanu; gleda sablju malo i veliko, nikome se izvaditi ne da.  
  <sub>`dbaa066eda6` · razgovor u sceni · SABLJA_RAZGOVOR 1</sub>
- **MARKO** · 139 · „Oj Boga ti, tursko momče mlado! Otkud tebe ova britka sablja? Ili si je za blago kupio? Ili si je u boju dobio? Ili ti je od baba ostala?”  
  <sub>`d8566d65e6c` · razgovor u sceni · SABLJA_RAZGOVOR 2</sub>
- **MUSTAF-AGA** · 188 · „Kad me pitaš, pravo ću ti kazat’: na Marici, na vodi studenoj, sestra mi je izvadila ranjena junaka. Na junaku rana sedamnaest, o bedri mu sablja okovana. Ja mu manuh, odsjekoh mu glavu.”  
  <sub>`d9090986abb` · razgovor u sceni · SABLJA_RAZGOVOR 3</sub>
- **MARKO** · 106 · „Zašto, Ture, da od Boga nađeš! Nisi mu rane izvidao? Danas bih ti dao agaluke kod našega cara čestitoga.”  
  <sub>`d852b8c5274` · razgovor u sceni · SABLJA_RAZGOVOR 4</sub>
- **MUSTAF-AGA** · 57 · „Be ne luduj, kaurine Marko! Već daj amo sablju okovanu.”  
  <sub>`d138e9ed752` · razgovor u sceni · SABLJA_RAZGOVOR 5</sub>
- **GUSLAR** · 74 · Pozna Marko očinu sablju: tri balčaka, tri zlatna. Ne nosi je Turčin više.  
  <sub>`df4413a1360` · pripovedanje · dropSablja · game.js:289</sub>
- **GUSLAR** · 179 · Sama mu se sablja izvadila. Kad je Marko sablju zagledao, al’ na sablji tri slova hrišćanska: jedno slovo Novaka kovača, drugo slovo Vukašina kralja, treće slovo Kraljevića Marka.  
  <sub>`dfc35d6e1de` · pripovedanje · collectCudo · game.js:2216</sub>
- **GUSLAR** · 162 · Kad se Marku veće dosadilo, on prigrnu ćurak naopako, a uzima tešku topuzinu, pa otide caru pod čadora. Car s’ odmiče, a Marko primiče, dok doćera cara do duvara.  
  <sub>`daba26cc649` · pripovedanje · updateSabljaPesma · game.js:3460</sub>
- **GUSLAR** · 152 · Car se maši u džepove rukom, te izvadi stotinu dukata: „Idi, Marko, napij mi se vina!” A Marko: „Ne pitaj me, care poočime! Poznao sam sablju baba mog.”  
  <sub>`d5362512a11` · pripovedanje · updateSabljaPesma · game.js:3461</sub>

**Zapis legende** · 1 replika · 91 znakova

- **GUSLAR** · 91 · Po zlatnim balčacima Marko je prepoznao očevu sablju na tuđem pojasu i tražio račun za oca.  
  <sub>`de8ec7e51a7` · zapis · ZAPISI.tvrdjava</sub>

### podrum · Ramazan

**Prelaz pred pesmu** · 3 replika · 244 znakova

- **GUSLAR** · 73 · Car zabrani vino uz ramazan, a Marko ga pije javno, pred carevim čaušima.  
  <sub>`d110df1c85b` · prelaz između pesama · podrum 1 · Ramazan</sub>
- **GUSLAR** · 117 · Car pozva Marka na odgovor. Marko dođe pred cara sa topuzom, a car mu umesto kazne dade sto dukata da se napije vina.  
  <sub>`da382e84790` · prelaz između pesama · podrum 2 · Pred carem</sub>
- **GUSLAR** · 54 · U podrumu baklje trepere, a bačve su pune rujnog vina.  
  <sub>`dd39747644c` · prelaz između pesama · podrum 3 · Podrum</sub>

**Priča posle scene** · 4 replika · 660 znakova

- **GUSLAR** · 139 · Ode Marko caru na divana, sede caru do desna kolena, samur-kalpak na oči namiče, a buzdovan uza se privlači, britku sablju na krilo namiče.  
  <sub>`d8c6ac42269` · priča u sceni · podrum-divan 1 · Na carevom divanu</sub>
- **GUSLAR** · 156 · „Moj posinko, Kraljeviću Marko! Dobri ljudi o zlu govoriše. Za što kalpak na oči namičeš? Što l’ buzdovan uza se privlačiš? Što li sablju na krilo namičeš?”  
  <sub>`d101a8f3074` · priča u sceni · podrum-divan 2 · Car Sulejman</sub>
- **GUSLAR** · 156 · „Ako pijem uz ramazan vino, vera mi donosi; ako nosim zelenu dolamu, mlad sam junak i dolikuje mi; ako kalpak na oči namičem, čelo gori, s carem se govori.”  
  <sub>`d073c2ab8b5` · priča u sceni · podrum-divan 3 · Kraljević Marko</sub>
- **GUSLAR** · 209 · „Ja se bojim da ne bude kavge; ako bi se zametnula kavga, teško onom tko j’ najbliže Marka!” Gledi care na četiri strane: najbliže je care Sulejmane. Car s’ odmiče, Marko se primiče, dok dotera cara do duvara.  
  <sub>`d4de3f0fb16` · priča u sceni · podrum-divan 4 · Teško onom ko j’ najbliže Marka</sub>

**Uvod nivoa** · 1 replika · 145 znakova

- **GUSLAR** · 145 · Car je zabranio vino uz ramazan, a ti ga piješ javno, Marko. Carevi čauši idu da ti proliju bačve. Stigni ih pre nego što izbiju slavine, pa pij.  
  <sub>`d4fed90d502` · uvod nivoa · podrum</sub>

**Zapis legende** · 1 replika · 92 znakova

- **GUSLAR** · 92 · Marko je za ramazan pio vino javno; kad su ga tužili caru, reče da mu stare rane traže vina.  
  <sub>`d10c7a9a722` · zapis · ZAPISI.podrum</sub>

**Marko pije uz ramazan vino** · 5 replika · 759 znakova

- **GUSLAR** · 161 · Marko igra kolom uz kadune, Marko paše sablju okovanu, Marko nosi zelenu dolamu, Marko pije uz ramazan vino, još nagoni odže i adžije da i oni s njime piju vino.  
  <sub>`d0d91511f0e` · pripovedanje · useBacva · game.js:4522</sub>
- **ČAUŠ** · 147 · Car Sulejman jasak učinio: da s’ ne pije uz ramazan vino, da s’ ne nose zelene dolame, da s’ ne pašu sablje okovane, da s’ ne igra kolom uz kadune.  
  <sub>`dfc5ceddbbe` · dijalog · updateBacve · game.js:4528</sub>
- **DVA MLADA ČAUŠA** · 202 · Kad je care razumeo reči, on pošilje dva svoja čauša. Kad dođoše Kraljeviću Marku, ali Marko pod šatorom pije, pred njim kupa od dvanaest oka: „Da čuješ li, Kraljeviću Marko! Tebe care na divan zaziva.”  
  <sub>`d41a69f41cd` · dijalog · updateBacve · game.js:4532 · mešovito: priča + citat</sub>
- **GUSLAR** · 135 · Rasrdi se Kraljeviću Marko, pak dovati onu kupu s vinom, pa udara careva čauša: pršte kupa, a pršte i glava, i proli se i krvca i vino.  
  <sub>`d282c048b71` · pripovedanje · updateBacve · game.js:4536</sub>
- **GUSLAR** · 114 · Car se maša rukom u džepove, on izvadi stotinu dukata, pa i daje Kraljeviću Marku: „Idi, Marko, te se napij vina.”  
  <sub>`d2e37243bdd` · pripovedanje · updateBacve · game.js:4538</sub>

### mocvara · Ranjeni soko

**Prelaz pred pesmu** · 3 replika · 186 znakova

- **GUSLAR** · 59 · Turci strelama gađaju sokola nad trskom i slomiše mu krilo.  
  <sub>`dcaaf257f45` · prelaz između pesama · mocvara 1 · Ranjeni soko</sub>
- **GUSLAR** · 64 · Marko pronađe sokola i previ mu krilo. Soko ne zaboravlja dobro.  
  <sub>`ddb7576418d` · prelaz između pesama · mocvara 2 · Dobro se pamti</sub>
- **GUSLAR** · 63 · Soko leti nad močvarom pod mesecom, a strelci vrebaju iz trske.  
  <sub>`dc45ff863c3` · prelaz između pesama · mocvara 3 · Noćna močvara</sub>

**Uvod nivoa** · 1 replika · 136 znakova

- **GUSLAR** · 136 · Kroz ovu trsku Turci su jurili sokola i slomili mu krilo. Nađi ga i previj mu krilo: soko ne zaboravlja dobro. Strelci vrebaju iz trske.  
  <sub>`dca8a0ff4b5` · uvod nivoa · mocvara</sub>

**Zapis legende** · 1 replika · 93 znakova

- **GUSLAR** · 93 · Dok je Marko ležao ranjen kraj druma, soko mu je doneo vode u kljunu i krilom mu pravio hlad.  
  <sub>`d8b6888f562` · zapis · ZAPISI.mocvara</sub>

**Ranjeni soko** · 2 replika · 285 znakova

- **GUSLAR** · 156 · Vezirev soko ima lošu navadu: da otima lov od drugoga. Izmakni mu se kad nasrne, pa se obruši na njega dok je umoran. Markov soko je joguna, kao i gospodar.  
  <sub>`d536f9779ef` · pripovedanje · updateLov · game.js:4436</sub>
- **GUSLAR** · 129 · „Teško mene i tebe, sokole, lov loveći s Turci bez Srbalja!” Soko je pao u trsku. Nađi ga, Marko, oteraj Turke i previj mu krilo.  
  <sub>`d528965a674` · pripovedanje · updateLov · game.js:4450</sub>

### pecina · Vilinska pećina

**Prelaz pred pesmu** · 3 replika · 198 znakova

- **GUSLAR** · 67 · Ravijojla vodi Marka u pećinu, gde kristali svetle plavim plamenom.  
  <sub>`d4d31d3299a` · prelaz između pesama · pecina 1 · Vilinska pećina</sub>
- **GUSLAR** · 67 · I tu su se zavukli Turci, sa bakljama, da pljačkaju vilinsko blago.  
  <sub>`d3a48cf4a5d` · prelaz između pesama · pecina 2 · Uljezi</sub>
- **GUSLAR** · 64 · Kristali trepere, a kapi padaju u jezerce. Prolaz pokazuje vila.  
  <sub>`d93991b8da9` · prelaz između pesama · pecina 3 · Kristali</sub>

**Uvod nivoa** · 1 replika · 82 znakova

- **GUSLAR** · 82 · Ovo je moja pećina, Marko. Kristali pokazuju prolaz, a Turci su se zavukli i ovde.  
  <sub>`dc8b8780ff5` · uvod nivoa · pecina</sub>

**Zapis legende** · 1 replika · 87 znakova

- **GUSLAR** · 87 · Vila Ravijojla bila je Markova posestrima; kad ga savlada muka, dozove je i ona doleti.  
  <sub>`df1c6e1bd83` · zapis · ZAPISI.pecina</sub>

### prevoj · Musa Kesedžija

**Prelaz pred pesmu** · 3 replika · 221 znakova

- **GUSLAR** · 93 · Musa Kesedžija baca topuz u oblake i dočekuje ga u bele ruke. Drumove i primorje zatvorio je.  
  <sub>`db53c8b193e` · prelaz između pesama · prevoj 1 · Musa Kesedžija</sub>
- **GUSLAR** · 68 · Prevoj je zaleđen, a na vrhu, kraj kule, čeka Musin poslednji odred.  
  <sub>`deff959f585` · prelaz između pesama · prevoj 2 · Zimski prevoj</sub>
- **GUSLAR** · 60 · Marko vodi Šarca kroz mećavu. Sneg veje, ali junak ne staje.  
  <sub>`d1b9bad6884` · prelaz između pesama · prevoj 3 · Mećava</sub>

**Uvod nivoa** · 1 replika · 104 znakova

- **GUSLAR** · 104 · Musa Kesedžija je zatvorio drumove i primorje. Prevoj je zaleđen, a njegov poslednji odred čeka na vrhu.  
  <sub>`de27c3964ef` · uvod nivoa · prevoj</sub>

**Zapis legende** · 1 replika · 86 znakova

- **GUSLAR** · 86 · Musa Kesedžija je zatvorio drumove i primorje; samo je Marko smeo da izađe pred njega.  
  <sub>`d3e7c68cb5e` · zapis · ZAPISI.prevoj</sub>

**Marko i Vuča dženeral (Varadin)** · 11 replika · 1.923 znakova

- **GUSLAR** · 240 · Iz tamnice Varadina piše Miloš od Pocerja, krvlju knjigu zapečati: „Izbavljaj me, pobratime Marko, jal’ za blago, jali na junaštvo!” Marko okrenu Šarca od Prilipa, a za Dunavom skela ne dočeka: naćera Šarca na Dunavo, ode pravo pod Varadin.  
  <sub>`dae5bf53c7b` · pripovedanje · updateVaradin · game.js:3251</sub>
- **GUSLAR** · 197 · Tu ustavi Šarca od megdana, pa udari koplje u ledinu, za koplje je privezao Šarina, pa on sjede piti mrko vino: ne pije ga čim se vino pije, već leđenom od dvanaest oka; pola pije, pola Šarcu daje.  
  <sub>`d21a50f67e7` · pripovedanje · updateVaradin · game.js:3263</sub>
- **VELIMIROVICA** · 217 · Pošetala Velimirovica po bedemu grada Varadina, u polju je opazila Marka: „Sjedi junak u polju širokom, konj mu nije kakvino su konji, veće šaren kako i goveče; nešto crno drži u zubima, kolik’ jagnje od pola godine.”  
  <sub>`d71052598e6` · dijalog · updateVaradin · game.js:3267 · mešovito: priča + citat</sub>
- **VUČA DŽENERAL** · 107 · „Velimire, moje čedo drago! Uzmi, sine, za trista katana, idi dole u polje široko, dovedi mi onoga junaka.”  
  <sub>`ddd8aecdac0` · dijalog · updateVaradin · game.js:3268</sub>
- **GUSLAR** · 110 · Marko sjedi, pije mrko vino, al’ katane Šarac opazio: poče nogam’ o zemljicu tući, primiče se svome gospodaru.  
  <sub>`dca345274cb` · pripovedanje · updateVaradin · game.js:3274</sub>
- **GUSLAR** · 158 · Popi Marko leđenicu vina, baci leđen u zelenu travu, pa se turi na ramena Šarcu. Da je kome pogledati bilo: kad udari u katane Marko, kako soko među golubove!  
  <sub>`d4e824444de` · pripovedanje · updateVaradin · game.js:3276</sub>
- **GUSLAR** · 179 · Pobježe mu Velimir dijete, ćera njega na Šarinu Marko, dostiže ga, dovati ga malo topuzinom: pade dite u zelenu travu. Marko mu savezao i noge i ruke, pa g’ objesi Šarcu o unkašu.  
  <sub>`d58e8714510` · pripovedanje · updateVaradin · game.js:3279</sub>
- **VUČA DŽENERAL** · 171 · „Sad ćeš viđet’, dok se starac krene!” Vuča drmnu na gradu topove, sastavi katane, opkoliše Marka sa četiri strane. Sablja mu je u desnici ruci, u zubima dizgen od Šarina!  
  <sub>`d52e52243d6` · dijalog · updateVaradin · game.js:3282</sub>
- **GUSLAR** · 213 · Pobježe mu Vuča dženerale na tankoj bedeviji. Ljuljnu Marko tešku topuzinu, pa je pušta za njim preko polja: udari ga sapom od topuza, pade Vuča u zelenu travu. Sveza Vuči ruke naopako, pa odvede obojicu u Prilip.  
  <sub>`d68d901d1e4` · pripovedanje · updateVaradin · game.js:3286</sub>
- **GUSLAR** · 210 · Knjigu piše dženeralovica: „Ne gubi mi Vuče dženerala i mojega sina Velimira!” Marko joj piše: „Pusti mene do tri pobratima, i podaj im tri tovara blaga.” Ona otvori prokletu tavnicu i izvadi tri vojvode mlade.  
  <sub>`d0050895fed` · pripovedanje · updateVaradin · game.js:3288</sub>
- **MILOŠ OD POCERJA** · 121 · „Bog ti platio, pobratime Marko, kad nas izbavi iz Vučine tavnice!” I u b’jelo izljubiše lice, svaki Marka u bijelu ruku.  
  <sub>`db311e856c1` · dijalog · updateVaradin · game.js:3289</sub>

### klisura · Klisura Ibra

**Prelaz pred pesmu** · 3 replika · 233 znakova

- **GUSLAR** · 94 · Niz Ibar, pod starim hrastom, sede guslari i pevaju o Kraljeviću Marku. Narod sluša i ne diše.  
  <sub>`df92aaf519e` · prelaz između pesama · klisura 1 · Klisura Ibra</sub>
- **GUSLAR** · 84 · Turci dođoše da polome gusle i ućutkaju pesmu. Stari guslar ih zakloni svojim telom.  
  <sub>`dacc8ccd7cb` · prelaz između pesama · klisura 2 · Polomljene gusle</sub>
- **GUSLAR** · 55 · Dok se gusle čuju, pesma živi. Marko ide da je odbrani.  
  <sub>`dece8109527` · prelaz između pesama · klisura 3 · Pesma</sub>

**Uvod nivoa** · 1 replika · 201 znakova

- **GUSLAR** · 201 · Niz Ibar sede guslari i pevaju kako si pogubio Musu, Marko. Turci hoće da im polome gusle i ućutkaju pesmu, a na kraju klisure čeka Musin brat, Đemo Brđanin. Odbrani guslare: dok se peva, bes ti raste.  
  <sub>`d7181b0e650` · uvod nivoa · klisura</sub>

**Zapis legende** · 1 replika · 96 znakova

- **GUSLAR** · 96 · Šarac je pio vino iz istog kabla s Markom; zato ga, kažu, nijedan konj nije stizao kroz klisuru.  
  <sub>`d11a3c2782a` · zapis · ZAPISI.klisura</sub>

**Marko i Đemo Brđanin: okovi i mehana** · 12 replika · 1.547 znakova

- **GUSLAR** · 202 · Slavi Marko svetoga Đorđija, a fali mu ribe od Orida. Po majčinoj reči ode bez oružja. Na ćupriji ga srete Đemo Brđanine, topuzinu baca u oblake: „Bogami ću Marka objesiti baš o vratim’ bijela Prilipa!”  
  <sub>`dbabff3d9c9` · pripovedanje · updateOkovi · game.js:3382</sub>
- **MARKO** · 59 · „Kud ćeš tamo, Đemo Brđanine? Evo, more, Kraljevića Marka!”  
  <sub>`d84b9fb74c8` · dijalog · updateOkovi · game.js:3389</sub>
- **GUSLAR** · 206 · Potegne Đemo topuzinu, jadna Marka među pleći žive: pade Marko u zelenu travu. Đemo dopade, okova ga sve u gvožđe ljuto: a na noge dvoje bukagije, a na ruke dvoje belenzuke, a na grlo sindžir, gvožđe teško.  
  <sub>`da321a5b4e9` · pripovedanje · updateOkovi · game.js:3392</sub>
- **GUSLAR** · 77 · Ode pravo bijelu Oridu, pod Oridom vješala ogradi da objesi Kraljevića Marka.  
  <sub>`d1f0f3477b4` · pripovedanje · updateOkovi · game.js:3402</sub>
- **GUSLAR** · 83 · Uze Đemo tri tovara blaga, vodi Marka gradu Vučitrnu, pa pod gradom vješala ogradi.  
  <sub>`ddcd8e2b96b` · pripovedanje · updateOkovi · game.js:3402</sub>
- **GUSLAR** · 79 · Uze Đemo tri tovara blaga, goni Marka bijelu Zvečanu, i tu Đemo vješala ogradi.  
  <sub>`d044a915ae3` · pripovedanje · updateOkovi · game.js:3402</sub>
- **GOSPODA (Orid, Vučitrn, Zvečan)** · 112 · „Bogom brate, Đemo Brđanine, tu nam nemoj objesiti Marka, neće rodit vino ni šenica, evo tebe tri tovara blaga.”  
  <sub>`ddabd391525` · dijalog · updateOkovi · game.js:3404</sub>
- **GUSLAR** · 168 · Uze Đemo tri tovara blaga. Odatle se Đemo podigao kroz nekakvu Janjinu planinu. Teško Đemo ožednjeo bješe: „Znaš li, Marko, vode il’ mehane? Teško me je osvojila žeđa.”  
  <sub>`d91073220ea` · pripovedanje · updateOkovi · game.js:3406</sub>
- **MARKO** · 135 · „Ima, Đemo, bijela mehana i prokleta krčmarica Janja: sad će mi se osvetiti Janja, dosta sam joj vina potrošio, a nisam dao ni dinara.”  
  <sub>`df277425e06` · dijalog · updateOkovi · game.js:3409</sub>
- **KRČMARICA JANJA** · 138 · Kad sagleda savezana Marka, nasmeja se krčmarica Janja: „Pojiću te, Brđanine Đemo, bez bijele pare i dinara, baš ako ćeš tri bijela dana.”  
  <sub>`de31129af40` · dijalog · updateOkovi · game.js:3410 · mešovito: priča + citat</sub>
- **GUSLAR** · 140 · Kad se Đemo nakitio vina, donese mu krčmarica Janja rujna vina od sedam godina, meće u njeg bilje svakojako. Pade Đemo glavom bez uzglavlja.  
  <sub>`d6691a7c4c8` · pripovedanje · updateOkovi · game.js:3411</sub>
- **GUSLAR** · 148 · Skoči Janja na noge lagane, na svom pobru gvožđe otvaraše. Marko uze topuz natrag. A Đemo se trže iz sna, pokida se i uteče kroz klisuru, na megdan.  
  <sub>`d9c2fce0761` · pripovedanje · updateOkovi · game.js:3414</sub>

**Guslari u klisuri** · 1 replika · 120 znakova

- **GUSLAR** · 120 · Stari guslar peva pesmu o Musi, a Turci idu da ga ućutkaju. Ne daj im do njega, Marko: dok pesma traje, bes ti ne opada.  
  <sub>`d5d8e4853f1` · pripovedanje · guslarOdbrana · game.js:4201</sub>

### rusevine · Svadbarina

**Prelaz pred pesmu** · 3 replika · 223 znakova

- **GUSLAR** · 91 · Arapin je kraj mora podigao kulu i uzima svadbarinu: nijedni svatovi ne prođu dok ne plate.  
  <sub>`d5895046787` · prelaz između pesama · rusevine 1 · Svadbarina</sub>
- **GUSLAR** · 81 · Zarobljene svatove drži u kavezima na ruševinama. Mlada plače, a mladoženja ćuti.  
  <sub>`d6d1b458cef` · prelaz između pesama · rusevine 2 · Svatovi u kavezima</sub>
- **GUSLAR** · 51 · Kad Marko razbije kaveze, svatovi će zaigrati kolo.  
  <sub>`df5b6c76ed4` · prelaz između pesama · rusevine 3 · Kolo</sub>

**Uvod nivoa** · 1 replika · 171 znakova

- **GUSLAR** · 171 · Arapin je kraj mora podigao kulu i uzima svadbarinu: ni jedni svatovi ne prođu dok ne plate. Zarobljene svatove drži u kavezima. Razbij kaveze, Marko, pa ukini svadbarinu.  
  <sub>`d20ff9e3428` · uvod nivoa · rusevine</sub>

**Kosovka devojka i svadbarina** · 9 replika · 1.347 znakova

- **MARKO** · 149 · „Božja pomoć, Kosovko devojko! Lepa ti si, seko, mlađa bila, krasna ti si stasa i uzrasta; al’ te, seko, kosa pokvarila: jer si tako, seko, osedila?”  
  <sub>`dbd819c4a4d` · razgovor u sceni · KOSOVKA_RAZGOVOR 1</sub>
- **KOSOVKA DEVOJKA** · 193 · „Evo ima devet godin’ dana kako dođe Arap prekomorac, pa od cara Kosovo zakupi: ko s’ udaje, trideset dukata; ko se ženi, trideset i četiri. A u mene braća siromašna, nema blaga da Arapu daju.”  
  <sub>`daca586fbf8` · razgovor u sceni · KOSOVKA_RAZGOVOR 2</sub>
- **KOSOVKA DEVOJKA** · 115 · „Ovo meni tužnoj reda dođe da dovečer odem Arapinu. Volim, brate, izgubiti glavu nego ljubiti svoj zemlji dušmana!”  
  <sub>`d5feee9164f` · razgovor u sceni · KOSOVKA_RAZGOVOR 3</sub>
- **MARKO** · 174 · „Ne šali se, u vodu ne skači, nemoj, seko, duše ogrešiti! Na ti, seko, trideset dukata, pak ti idi svome belom dvoru; samo kaži Arapove dvore, ja ću platit svadbarinu za te.”  
  <sub>`d7777c9009e` · razgovor u sceni · KOSOVKA_RAZGOVOR 4</sub>
- **KOSOVKA DEVOJKA** · 175 · „Nisu dvori, već šatori pusti. Gdi se onaj svilen barjak vije, onde j’ šator crnog Arapina, sva avlija glavam’ nakićena. Arap ima četrdeset slugu što čuvaju stražu oko njega.”  
  <sub>`d6f4e6e45fa` · razgovor u sceni · KOSOVKA_RAZGOVOR 5</sub>
- **MARKO** · 170 · „Oj davori, ti Kosovo ravno! Što si danas dočekalo, tužno, posle našeg kneza čestitoga, da Arapi sad po tebi sude! Danas ću vas, braćo, osvetiti, osvetiti, ili poginuti.”  
  <sub>`d3c890150ae` · razgovor u sceni · KOSOVKA_RAZGOVOR 6</sub>
- **GUSLAR** · 149 · Marko s’ maši rukom u džepove, pred Arapa tri dukata baci: „Veruj mene, više nemam blaga!” Ciknu Arap kao zmija ljuta: „U mene, kujo, veresije nema!”  
  <sub>`d358c20c0ab` · pripovedanje · kosovkaArap · game.js:3215</sub>
- **MARKO** · 136 · Nasmeja se Kraljeviću Marko: „O junače, Arapine crni, il’ se šališ, il’ od zbilje biješ? Koliko si mene udario, toliko ću tebe udariti!”  
  <sub>`df4c9000b0f` · dijalog · kosovkaArap · game.js:3216 · mešovito: priča + citat</sub>
- **GUSLAR** · 86 · „Pa ga pere vodom studenovom, pričešćuje vinom crvenijem.” Kosovka devojka poji Marka.  
  <sub>`dd851e36d10` · pripovedanje · updateKosovka · game.js:3228</sub>

**Zapis legende** · 1 replika · 81 znakova

- **GUSLAR** · 81 · Arapin je od svake svadbe uzimao danak, dok nije došao Marko i ukinuo svadbarinu.  
  <sub>`d2cf74df7d6` · zapis · ZAPISI.rusevine</sub>

### rudnik · Tri kese dukata

**Prelaz pred pesmu** · 3 replika · 239 znakova

- **GUSLAR** · 111 · Pred smrt, kaže pesma, Marko ostavi tri kese dukata: jednu crkvi, drugu sirotinji, a treću onome ko ga sahrani.  
  <sub>`d53e30c3bfe` · prelaz između pesama · rudnik 1 · Tri kese dukata</sub>
- **GUSLAR** · 71 · Jedna kesa je, kažu, zakopana u starom rudniku. Oklopnici čuvaju izlaz.  
  <sub>`d3f43576bbd` · prelaz između pesama · rudnik 2 · Stari rudnik</sub>
- **GUSLAR** · 57 · U rudniku se ljuljaju fenjeri, a kolica škripe po šinama.  
  <sub>`de552b839fc` · prelaz između pesama · rudnik 3 · Okna</sub>

**Uvod nivoa** · 1 replika · 125 znakova

- **GUSLAR** · 125 · Pred smrt, kažu, Marko je ostavio tri kese dukata, a jedna je zakopana u ovom rudniku. Oklopnici čuvaju izlaz, pazi na grede.  
  <sub>`ddbb2503f54` · uvod nivoa · rudnik</sub>

**Zapis legende** · 1 replika · 88 znakova

- **GUSLAR** · 88 · Pred smrt Marko ostavi tri kese dukata: za onoga ko ga sahrani, za crkve i za sirotinju.  
  <sub>`dae1975d15d` · zapis · ZAPISI.rudnik</sub>

### reka · Obala pred zoru

**Prelaz pred pesmu** · 3 replika · 172 znakova

- **GUSLAR** · 73 · Marko i Šarac stoje pred rekom u zoru. Preko vode se vidi Urvina planina.  
  <sub>`dbeeb9d81a0` · prelaz između pesama · reka 1 · Obala pred zoru</sub>
- **GUSLAR** · 57 · Turski odred gazi reku. Treba stići do vodenice pre njih.  
  <sub>`de52d30d02e` · prelaz između pesama · reka 2 · Odred na gazu</sub>
- **GUSLAR** · 42 · Vodenica se okreće, a reka teče pod zorom.  
  <sub>`ddaa0878103` · prelaz između pesama · reka 3 · Vodenica</sub>

**Uvod nivoa** · 1 replika · 101 znakova

- **GUSLAR** · 101 · Zora je blizu, a preko reke se vidi Urvina planina. Stigni do vodenice pre nego što odred pređe reku.  
  <sub>`d13ad068104` · uvod nivoa · reka</sub>

**Zapis legende** · 1 replika · 81 znakova

- **GUSLAR** · 81 · Na Urvini, kažu, Marko prelomi koplje na sedam komada, da ne padne u turske ruke.  
  <sub>`d134bfc804a` · zapis · ZAPISI.reka</sub>

**Marko i Filip Madžarin** · 9 replika · 1.241 znakova

- **GUSLAR** · 220 · Zmaj-Despot Vuk ču Filipa Madžarina gde se hvali da će kulu na ćupriji okititi rusom glavom Kraljevića Marka, pa napisa Marku knjigu: „Čuvaj se, Bogom pobratime, od Filipa kake prevare.” A Marko ode pravo Karlovcu gradu.  
  <sub>`dc0ab17f723` · pripovedanje · updateMehana · game.js:3317</sub>
- **GUSLAR** · 111 · Odja Šarca, sveza pred mehanu, a on sjede piti rujno vino. Malo bilo, za dugo ne bilo, eto ti Filipa Madžarina.  
  <sub>`d5859031cc2` · pripovedanje · updateMehana · game.js:3325</sub>
- **GUSLAR** · 94 · Filip nagna da uđe u novu mehanu, ali ne da Šarac od megdana, već ga bije kopitama po rebrima.  
  <sub>`dc36407e525` · pripovedanje · updateMehana · game.js:3329</sub>
- **ŠARAC** · 209 · Naljuti se Filip, pa potrže perna buzdovana, ode biti pred mehanom Šarca. Al’ propišta Šarac: „Avaj mene do Boga miloga! Đe pogiboh jutros pred mehanom od silnoga Filip-Madžarina, a kod moga slavna gospodara!”  
  <sub>`d4ba5cc6749` · dijalog · updateMehana · game.js:3332 · mešovito: priča + citat</sub>
- **MARKO** · 30 · „Propusti ga u mehanu, Šarče!”  
  <sub>`d18b9ad2a8a` · dijalog · updateMehana · game.js:3333</sub>
- **GUSLAR** · 79 · A kad Filip uđe u mehanu, a on Marku Boga ne naziva, već potrže tešku topuzinu.  
  <sub>`d46bd540af8` · pripovedanje · updateMehana · game.js:3336</sub>
- **MARKO** · 168 · Udari ga u pleći junačke, ali Marko ni habera nema: „Sjedi s mirom, Madžarsko kopile! Ne budi mi po kožuhu buha, već odjaši da pijemo vino, pa još ima dana za megdana.”  
  <sub>`db6270ebe7f` · dijalog · updateMehana · game.js:3340 · mešovito: priča + citat</sub>
- **GUSLAR** · 170 · Al’ to Filip ne slušaše Marka, već ga udri u desnicu ruku, te mu razbi čašu pozlaćenu, a prosu mu crveniku vino. Kad to viđe Kraljeviću Marko, on skoči od zemlje na noge!  
  <sub>`dcff2b7136a` · pripovedanje · updateMehana · game.js:3344</sub>
- **GUSLAR** · 160 · Pa je oštru sablju zagledao: „Mili Bože, čuda velikoga! Dobra gvožđa u loša junaka!” Ode Marko Filipovu dvoru, obi mu bijelu riznicu, pa otide drumom pjevajući.  
  <sub>`dc1eb38c85f` · pripovedanje · filipPao · game.js:3351</sub>

**Pogled popreko** · 4 replika · 480 znakova

- **GUSLAR** · 105 · Navuci samur-kalpak na obrve i pogledaj ga popreko. Ne posež i za čim, Marko: ko prvi trepne, izgubio je.  
  <sub>`d8c75d5d867` · pripovedanje · usePogled · game.js:3998</sub>
- **GUSLAR** · 136 · Vinograd je Ljutice Bogdana. Pred njim si jednom već bežao uz krševito primorje, i sapom od topuza te je dohvatio. Eno ga, preči ti put.  
  <sub>`d278539444c` · pripovedanje · updatePogled · game.js:4000</sub>
- **GUSLAR** · 88 · „Već te moje oči ne viđele!” Bogdan se smeje. Hajde opet, i ovog puta ne miči ni prstom.  
  <sub>`d44a0bd7485` · pripovedanje · updatePogled · game.js:4006</sub>
- **GUSLAR** · 151 · Pod Bogdanom noge obumreše. „Hodi, Marko, da se pomirimo.” Skide Marko mješinu sa Šarca, pa sjedoše piti rujno vino i mezetiti ga grozdom iz vinograda.  
  <sub>`d57f9799621` · pripovedanje · updatePogled · game.js:4008</sub>

### vracara · Vračeva jaruga

**Uvod nivoa** · 1 replika · 143 znakova

- **GUSLAR** · 143 · U Skopskoj Crnoj Gori, kažu, živi Crni vrač: magli drumove, truje bunare i od senki pravi ljude. Pređi njegovu jarugu i oslobodi put ka Urvini.  
  <sub>`d569f638089` · uvod nivoa · vracara</sub>

### urvina · Urvina planina · Smrt Marka Kraljevića

**Prelaz pred pesmu** · 3 replika · 474 znakova

- **GUSLAR** · 205 · Poranio Marko u nedelju, pre jarkog sunca, pokraj mora, Urvinom planinom. Šarac mu poče posrtati i suze roniti. „Davor, Šaro, sto i šezdeset ljeta još mi nigda posrnuo nisi. Neka Bog zna, dobro biti neće.”  
  <sub>`d202708c063` · prelaz između pesama · urvina 1 · Smrt Marka Kraljevića</sub>
- **GUSLAR** · 153 · Kliče vila sa Urvine: „Kad budeš navrh planine, opazićeš dve tanke jele, a među njima bunar. Nad vodom ćeš lice ogledati, pak ćeš videti kad ćeš umreti.”  
  <sub>`d8647d91cca` · prelaz između pesama · urvina 2 · Vila sa Urvine</sub>
- **GUSLAR** · 116 · Posluša Marko vilu, pa okrenu Šarca uz Urvinu. Pokraj mora, pre jarkog sunca, jaše navrh planine, do dve tanke jele.  
  <sub>`db98530f689` · prelaz između pesama · urvina 3 · Uz Urvinu</sub>

**Priča posle scene** · 4 replika · 627 znakova

- **GUSLAR** · 123 · Nedelju dana ležao je Marko kraj bunara. Ko god prođe drumom, misli da Marko spava, pa ga daleko obilazi, da ga ne probudi.  
  <sub>`dbbfbe87341` · priča u sceni · urvina-kraj 1 · Urvina planina</sub>
- **GUSLAR** · 175 · Na jelovoj grani ostavi knjigu: jedan ćemer onome ko ga ukopa, drugi da se crkve krase, a treći kljastu i slijepu: „Nek slijepi po svijetu hode, nek pjevaju i spominju Marka.”  
  <sub>`d7fb7638c2e` · priča u sceni · urvina-kraj 2 · Tri ćemera blaga</sub>
- **GUSLAR** · 134 · Iguman Vaso odveze ga galijom u Svetu Goru i ukopa nasred bele crkve Hilandara. Belege mu nikakve ne stavi, da mu se dušmani ne svete.  
  <sub>`ddccb7fe8a6` · priča u sceni · urvina-kraj 3 · Hilandar</sub>
- **GUSLAR** · 195 · A narod kaže da Marko nije umro. Spava u pećini, Šarac kraj njega grize mahovinu, vila mu drži gusle javorove, a sablja mu se malo-pomalo izvlači iz kora. Kad sama ispadne, Marko će se probuditi.  
  <sub>`d1e8f42b195` · priča u sceni · urvina-kraj 4 · Kaže pesma…</sub>

**Uvod nivoa** · 1 replika · 173 znakova

- **GUSLAR** · 173 · Nedelja je, pre jarkog sunca. Šarac posrće i suze roni, a vila s planine zove. Niko ti ovde ne stoji na putu, Marko: popni se do vrha, do dve tanke jele i bunara među njima.  
  <sub>`d4db99650b5` · uvod nivoa · urvina</sub>

**Smrt Marka Kraljevića** · 8 replika · 946 znakova

- **GUSLAR** · 136 · „Laživ svijete, moj lijepi cvijete! Lijep ti bješe, ja za malo hodah: ta za malo, tri stotin godina. Zeman dođe da svijetom promijenim.”  
  <sub>`d90f6620833` · razgovor u sceni · VRH_REC 1</sub>
- **GUSLAR** · 153 · Sto i šezdeset ljeta bili su zajedno. Da mu Šarac Turcima ne dopadne, da ne nosi vode ni đuguma, Marko ga posiječe, pa ga ukopa bolje nego brata Andriju.  
  <sub>`d7b96fdfa1d` · razgovor u sceni · VRH_REC 2</sub>
- **GUSLAR** · 118 · Britku sablju prebi na četvoro, a bojno koplje slomi na sedmoro i baci ga u jelove grane: da se Turci njima ne ponose.  
  <sub>`d48fa5fd6db` · razgovor u sceni · VRH_REC 3</sub>
- **GUSLAR** · 58 · „Kad moj topuz iz mora izišao, onda ovaki đetić postanuo!”  
  <sub>`de04ef0f76c` · razgovor u sceni · VRH_REC 4</sub>
- **GUSLAR** · 103 · Zelenu dolamu prostrije pod jelom, prekrsti se, samur-kalpak na oči namače. Dolje leže, gore ne ustade.  
  <sub>`dce6aaf5a31` · razgovor u sceni · VRH_REC 5</sub>
- **RAVIJOJLA** · 114 · Pobratime, Kraljeviću Marko, znadeš li što ti konj posrće? Žali Šarac tebe, gospodara, jer ćete se brzo rastanuti.  
  <sub>`df52e9645c4` · razgovor u sceni · VRH_VILA 1</sub>
- **RAVIJOJLA** · 126 · Ti ne možeš umrijeti, Marko, od junaka ni od oštre sablje, od topuza ni od bojna koplja. Umrijećeš od Boga, od starog krvnika.  
  <sub>`d71a8be973a` · razgovor u sceni · VRH_VILA 2</sub>
- **RAVIJOJLA** · 138 · Kada budeš visu na planinu, opazićeš dvije tanke jele: svu su goru vrhom nadvisile. Među njima bunar voda ima. Nadnesi se, pa ćeš vidjeti.  
  <sub>`d246dfe2bae` · razgovor u sceni · VRH_VILA 3</sub>

### san · San Kraljevića Marka

**Prelaz pred pesmu** · 2 replika · 291 znakova

- **GUSLAR** · 144 · Pod jelom na Urvini Marko sanja vilinsku pećinu. Šarac kraj njega grize mahovinu, a pred njim vila drži gusle javorove: same gude, same udaraju.  
  <sub>`d0d72a327e9` · prelaz između pesama · san 1 · San Kraljevića Marka</sub>
- **GUSLAR** · 147 · U pećini su četiri odaje i u svakoj po jedna pesma. Nema tu megdana ni dušmana. Ko pamti pesme, proći će; ko ne pamti, neka pročita zapis na ulazu.  
  <sub>`dbd1323b2b8` · prelaz između pesama · san 2 · Četiri odaje</sub>

**Priča posle scene** · 1 replika · 120 znakova

- **GUSLAR** · 120 · Kažu: kad sablja sama ispadne iz kora, Marko će se probuditi i ponovo izaći na drum. U tvom snu ispala je. Sedlaj Šarca.  
  <sub>`d62d0d1d2fd` · priča u sceni · san-kraj 1 · Sablja je ispala</sub>

**Uvod nivoa** · 1 replika · 175 znakova

- **GUSLAR** · 175 · Ovo je san, Marko, i u njemu moja pećina. Četiri odaje, četiri pesme. Topuz ti ovde služi samo da kucneš u kamen: pročitaj zapis pred svakom odajom, pa pogodi šta pesma traži.  
  <sub>`ded0319ce35` · uvod nivoa · san</sub>

**Četiri odaje sna** · 13 replika · 1.375 znakova

- **GUSLAR** · 89 · „Bogme, care, jošte nije vreme.” Drvo prsnu nadvoje, natroje, ali iz njega voda ne udari.  
  <sub>`d3f9f9e36f5` · pripovedanje · updateSan · game.js:3178</sub>
- **GUSLAR** · 194 · „Na sablji su tri slova rišćanska: jedno slovo Novaka kovača, drugo slovo Vukašina kralja, treće slovo Kraljevića Marka.” Kucni topuzom u kamenove onim redom kojim je sablja išla iz ruke u ruku.  
  <sub>`d0a2812da86` · zagonetka · world.js:228</sub>
- **GUSLAR** · 32 · Tri slova: kovač, kralj, pa sin.  
  <sub>`d9a1a0d9391` · zagonetka · world.js:228</sub>
- **GUSLAR** · 21 · SABLJA NIJE TAKO IŠLA  
  <sub>`dd93ba3bd98` · zagonetka · world.js:228</sub>
- **GUSLAR** · 67 · Novak je skova, Vukašin je nosi, Marko je poznade. Odaja se otvara.  
  <sub>`d3495513a23` · zagonetka · world.js:228</sub>
- **GUSLAR** · 266 · „Isprosi je Kraljeviću Marko, a preprosi vojevoda Janko, prsten dao Ustupčiću Pavle.” Tri prosca položiše tri zlatne jabuke i tri zlatna prstena, a sirota devojka reče: „Jabuka je dečina zabava, a prsten je junačka belega.” Kucni u ono za čim bi mudra devojka pošla.  
  <sub>`d04d5e33f18` · zagonetka · world.js:232</sub>
- **GUSLAR** · 37 · Ni jabuka ni prsten. Za kim je pošla?  
  <sub>`d5075cda984` · zagonetka · world.js:232</sub>
- **GUSLAR** · 23 · OBE BIH TI ODSEKAO RUKE  
  <sub>`d4287330f22` · zagonetka · world.js:232</sub>
- **GUSLAR** · 85 · „Ja ću poći za Ustupčić-Pavla.” Nije se mašila ni jabuke ni prstena. Odaja se otvara.  
  <sub>`df01509fc3b` · zagonetka · world.js:232</sub>
- **GUSLAR** · 262 · „Donesi mi suve drenovine sa tavana od devet godina, da ogledam može li što biti.” Tri godine tamnice slomile su mu snagu. „Sjede Marko tri mjeseca dana, dok je život malo povratio”, uz vino i ovnujsko meso. Tek tada iz stegnutog drveta dve kaplje vode iskočiše.  
  <sub>`d8d9171f04d` · zagonetka · world.js:235</sub>
- **GUSLAR** · 77 · Stegni suvu drenovinu (drži K). Ako voda ne udari, snaga se još nije vratila.  
  <sub>`dfe3aea45ff` · zagonetka · world.js:235</sub>
- **GUSLAR** · 182 · „A pred Markom vila Ravijojla, u ruke joj gusli javorove: same gude, same udaraju.” Slušaj šta gusle sviraju, pa istim redom kucni u četiri kamena. Triput će zagusti, svaki put duže.  
  <sub>`d6217032500` · zagonetka · world.js:238</sub>
- **GUSLAR** · 40 · Ponovi melodiju gusala na četiri kamena.  
  <sub>`da6cd33cca1` · zagonetka · world.js:238</sub>

### azak · Azačka kula

**Zapis legende** · 1 replika · 137 znakova

- **GUSLAR** · 137 · Iz Azačke tamnice Marko je poslao knjigu po sivom sokolu. Dojčilo ju je pročitao u Solunu, obojio lice kao Arapin i dojahao po pobratima.  
  <sub>`d49aadc5443` · zapis · ZAPISI.azak</sub>

### Kroz celu igru

**Uvod nivoa (noć, oluja)** · 2 replika · 35 znakova

- **GUSLAR** · 12 · Noć je pala.  
  <sub>`d2b7254aa31` · uvod nivoa · night · deo koji se dodaje uvodu nivoa</sub>
- **GUSLAR** · 23 · Oluja bije, više ih je.  
  <sub>`d9dfa92cca9` · uvod nivoa · storm · deo koji se dodaje uvodu nivoa</sub>

**Odbrana (branik)** · 10 replika · 798 znakova

- **GUSLAR** · 110 · Turci idu na selo, a žene i starci nisu stigli do crkve. Ne daj im do njih, Marko: četiri čete, sa obe strane.  
  <sub>`df2351529dd` · odbrana: uvod · selo (Seljani)</sub>
- **GUSLAR** · 54 · Selo je odbranjeno. „Bog ti dao zdravlje, Kraljeviću!”  
  <sub>`d0a17431412` · odbrana: kraj · selo (Seljani)</sub>
- **GUSLAR** · 98 · Kaluđeri nose knjige starostavne iz Samodreže, a Turci hoće da ih otmu. Odbrani ih od četiri čete.  
  <sub>`de8bf5fa363` · odbrana: uvod · kaluderi (Kaluđeri)</sub>
- **GUSLAR** · 64 · Kaluđeri su sačuvali knjige. „Bog da prosti tvoje grehe, Marko.”  
  <sub>`d2db9fb7a83` · odbrana: kraj · kaluderi (Kaluđeri)</sub>
- **GUSLAR** · 87 · Putnici čekaju skelu, a iz trske izlaze Turci. Čuvaj ih dok skela ne dođe: četiri čete.  
  <sub>`d212f78ff83` · odbrana: uvod · putnici (Putnici)</sub>
- **GUSLAR** · 62 · Skela je stigla i putnici su prešli. Trgovac ti daruje dukate.  
  <sub>`d644959cfdf` · odbrana: kraj · putnici (Putnici)</sub>
- **GUSLAR** · 102 · Hodočasnici idu u Markov manastir, a vrač je na njih poslao senke i janičare. Odbrani ih: četiri čete.  
  <sub>`da41cdb6581` · odbrana: uvod · hodocasnici (Hodočasnici)</sub>
- **GUSLAR** · 90 · Hodočasnici su prošli kroz jarugu. „Hvala ti, Marko, u Prilepu ćemo paliti sveću za tebe.”  
  <sub>`dacb3745662` · odbrana: kraj · hodocasnici (Hodočasnici)</sub>
- **GUSLAR** · 82 · Rudari Novog Brda izašli su iz okna, a Turci hoće srebro. Čuvaj ih od četiri čete.  
  <sub>`dbbc6188772` · odbrana: uvod · rudari (Rudari)</sub>
- **GUSLAR** · 49 · Srebro je ostalo rudarima. Daruju ti kesu dukata.  
  <sub>`dc90fafe839` · odbrana: kraj · rudari (Rudari)</sub>

**Saveti i uputstva** · 17 replika · 1.485 znakova

- **RAVIJOJLA** · 105 · Hasan-aga: nijedan topuz ne probija njegov oklop. Navuci ga da se zaleti u stub, pa udri dok je ošamućen.  
  <sub>`d7e4f7f9ffb` · savet · KIT_INTRO.hasan</sub>
- **RAVIJOJLA** · 91 · Ognjeni aga pali ulje po podu. Kad vikne „ulje“, skači na grede, pa ga udri dok je zadihan.  
  <sub>`d5d1be20c2b` · savet · KIT_INTRO.ognjeni · mešovito: priča + citat</sub>
- **RAVIJOJLA** · 95 · Dok barjak stoji na steni, bajraktar ne prima udarce i zove pojačanje. Popni se i obori barjak.  
  <sub>`df32bd52412` · savet · KIT_INTRO.bajraktar</sub>
- **RAVIJOJLA** · 85 · Janičarski aga skače sa grede na gredu i napada sabljom odozgo. Dočekaj ga u vazduhu.  
  <sub>`dca6a73471c` · savet · KIT_INTRO.janicar</sub>
- **RAVIJOJLA** · 108 · Tufekdžija-baša gađa sa kule. Kad vidiš crvenu liniju, skloni se iza kamena ili čučni, pa se popni lestvama.  
  <sub>`dcebb652247` · savet · KIT_INTRO.basa</sub>
- **RAVIJOJLA** · 51 · Lovac-aga pušta pse na tebe. Pobij čopor, pa njega.  
  <sub>`d0ada2c9689` · savet · KIT_INTRO.lovac</sub>
- **RAVIJOJLA** · 131 · Aždaja iz pećine. Krljušt ne puca: kad bljune vatru, sakrij se iza kamena ili čučni, a kad posle ujeda zarije glavu u zemlju, udri.  
  <sub>`d683f18d7df` · savet · KIT_INTRO.azdaja</sub>
- **RAVIJOJLA** · 99 · Dželat seče sekirom i cepa grede pod tobom. Kad mu se sekira zabije, udri, ali ne ostani bez greda.  
  <sub>`d5639302205` · savet · KIT_INTRO.dzelat</sub>
- **RAVIJOJLA** · 145 · Đemo Brđanin, Musin brat, došao je da osveti brata. Baca buzdovan preko polja. Preskoči ga dok leti i dok se vraća. Bez buzdovana Đemo je ranjiv.  
  <sub>`d42acdf7d98` · savet · KIT_INTRO.djemo</sub>
- **RAVIJOJLA** · 68 · Tri janičara sa carskim blagom. Ne daj im da te opkole: razdvoji ih.  
  <sub>`d5030120699` · savet · KIT_INTRO.trio</sub>
- **RAVIJOJLA** · 75 · Turci pucaju iz topa! Đule koje se kotrlja preskoči, pred visokim se sagni.  
  <sub>`d011520686b` · savet · updateCannons · game.js:782</sub>
- **RAVIJOJLA** · 80 · Akindžija projuri kroz tebe i udari s leđa. Kad vidiš crven krst, otkotrljaj se.  
  <sub>`df068eb220d` · savet · akindzijaTick · game.js:2464</sub>
- **RAVIJOJLA** · 97 · Ranjeni kopljanik drži koplje napred: spreda ga ne probiješ. Preskoči ga, udri odozgo ili s leđa.  
  <sub>`de23a856f29` · savet · kopljanikTick · game.js:2473</sub>
- **RAVIJOJLA** · 93 · Strelac puca uvis: senke na zemlji pokazuju gde će pasti strele. Skloni se ili se otkotrljaj.  
  <sub>`dc5a6bab68b` · savet · kisaStrela · game.js:2484</sub>
- **RAVIJOJLA** · 101 · Sabljaš vara: zamahne pa stane. Ko odbije u prazno, dočeka ga dvostruki rez; tada se izmakni kolutom.  
  <sub>`db13c5e73da` · savet · varkaKraj · game.js:2496</sub>
- **RAVIJOJLA** · 31 · Lavina! Trči, Marko, ne zastaj!  
  <sub>`da0801d77e9` · savet · updateTraps · game.js:2968</sub>
- **RAVIJOJLA** · 30 · Odron! Trči, Marko, ne zastaj!  
  <sub>`d6730ed4c77` · savet · updateTraps · game.js:2968</sub>

**Zagonetke (vaga, vilinsko kolo)** · 2 replika · 143 znakova

- **GUSLAR** · 52 · Dve tasove drži jedan konopac. Šta je teže, to tone.  
  <sub>`d59f062a5e5` · pripovedanje · updateMindPuzzles · game.js:640</sub>
- **GUSLAR** · 91 · Vilinsko kolo ima svoj red. Nađi ga sam: kamen koji je na redu zasvetli, pogrešan gasi sve.  
  <sub>`db517ee789e` · pripovedanje · updateMindPuzzles · game.js:641</sub>

## Ne ozvučava se (predlog)

**uputstvo** · 65 · 6.312 znakova

- **RAVIJOJLA** · A i D te vode drumom, a Space je skok. Topuz je na J, teški udarac na K, a štit dižeš na L.  
  <sub>`de980763dda` · HINTS.osnove</sub>
- **RAVIJOJLA** · Udri ga topuzom (J). Kad on zamahne, podigni štit (L) ili odskoči, pa uzvrati.  
  <sub>`d3c8aa15f3a` · HINTS.osnove2</sub>
- **RAVIJOJLA** · Vino iz čuture (Q) vida rane i daje snagu. Popij ga kad zdravlje padne.  
  <sub>`d104e9574a0` · HINTS.osnove3</sub>
- **RAVIJOJLA** · Od danas ti je vila Ravijojla posestrima. Kad zatreba, pozovi je: E. Omamiće dušmane oko tebe ili će ti zalečiti rane.  
  <sub>`dbe7157f1e0` · HINTS.vila</sub>
- **RAVIJOJLA** · Lestve! Priđi i drži W (ili gore na džojstiku).  
  <sub>`d1d9979941e` · HINTS.ladder</sub>
- **RAVIJOJLA** · Kolje! Preskoči ga — a Turčina možeš baciti na njega.  
  <sub>`dd1f42f817a` · HINTS.spikes</sub>
- **RAVIJOJLA** · Ove daske popuštaju. Ne zastaj na njima!  
  <sub>`d167a7fedfe` · HINTS.crumble</sub>
- **RAVIJOJLA** · Ova kapija se zatvori pre nego što do nje dotrčiš. Ostavi Vilin trag kraj kapije (V), vrati se do poluge i povuci je (E), pa se tragom vrati (V) dok je otvorena.  
  <sub>`d0691331eac` · HINTS.vreme</sub>
- **RAVIJOJLA** · Nad jarugom vise srebrne kuke. Baci Ravijojlin lanac na prvu (C), pa iz leta na drugu. Ko lanac nema, silazi lestvama i ide dnom.  
  <sub>`d57086af6fa` · HINTS.kuke</sub>
- **RAVIJOJLA** · Očeva sablja nije topuz. Seče brže (J J J), rane krvare, a treći rez je ubod dugog dometa. K je prolet: prođeš kroz dušmane i izađeš im za leđa. Štit i oklop je zaustavljaju: za njih vrati topuz (G).  
  <sub>`d05572da3e5` · HINTS.sablja</sub>
- **RAVIJOJLA** · Štitonoša zaklanja strelca: stoji pred njim i ne da ti da priđeš. Preskoči ga, slomi mu gard teškim udarcem (K), ili vrati strelu odbijanjem (L).  
  <sub>`d02764e34c2` · HINTS.tandem1</sub>
- **RAVIJOJLA** · Ova dvojica rade zajedno: jedan te drži spreda, a drugi ti zalazi za leđa. Ne daj da te uklešte: obori prvo onoga koji trči.  
  <sub>`d31cb32910f` · HINTS.tandem2</sub>
- **RAVIJOJLA** · Put se račva. Lestvama preko bedema, gde vrebaju strelci, ili kroz prolaz ispod njega, gde čeka straža.  
  <sub>`d29219438e5` · HINTS.bedem</sub>
- **RAVIJOJLA** · Most je truo. Pretrči ga, ili siđi lestvama i prođi dnom jaruge, tamo leži kovčeg.  
  <sub>`d55fcbf7b87` · HINTS.jaruga</sub>
- **RAVIJOJLA** · Balvan se njiše. Sačekaj da prođe, pa protrči ispod.  
  <sub>`dd45fc5b048` · HINTS.log</sub>
- **RAVIJOJLA** · Kamenje pada sa litice. Prati senke na zemlji!  
  <sub>`d928ad1a0ba` · HINTS.rocks</sub>
- **RAVIJOJLA** · Burad se kotrljaju niz stepenice! Preskoči ih ili razbij teškim udarcem.  
  <sub>`de9b7a219d6` · HINTS.barrels</sub>
- **RAVIJOJLA** · Povuci polugu, pa trči — kapija se brzo zatvara.  
  <sub>`def054ce4fa` · HINTS.timed</sub>
- **RAVIJOJLA** · Iza ove kapije je riznica. Ploča u zemlji otvara kapiju dok je nešto pritiska: dogurni teški sanduk na ploču (samo hodaj u njega), pa uđi sa W.  
  <sub>`d121a69972a` · HINTS.plate</sub>
- **RAVIJOJLA** · Zlatno slovo! Skupi sva slova М-А-Р-К-О u ovom pohodu.  
  <sub>`d44f3ce034f` · HINTS.slovo</sub>
- **RAVIJOJLA** · Vilinska moć! Uzmi je i topuz će ti zasijati.  
  <sub>`dc44568134f` · HINTS.moc</sub>
- **RAVIJOJLA** · Kovčeg! Udari ga topuzom da ga otvoriš.  
  <sub>`dd1ef6bdd9e` · HINTS.chest</sub>
- **RAVIJOJLA** · Između ova dva zida možeš da se penješ odskakanjem.  
  <sub>`d75f2e14636` · HINTS.shaft</sub>
- **RAVIJOJLA** · Megdan! Pazi na svaki njegov treći napad.  
  <sub>`da88568815e` · HINTS.boss</sub>
- **RAVIJOJLA** · Sa daske ili poda kule siđeš sa S + Space (na džojstiku dole + A).  
  <sub>`dff0d1c0df6` · HINTS.drop</sub>
- **RAVIJOJLA** · S + K je aperkat: diže Turčina u vazduh! Odmah Space za njim, pa J J J u skoku — treći udarac ga zakuca o zemlju.  
  <sub>`d1af03a1186` · HINTS.launch</sub>
- **RAVIJOJLA** · Crni vrač ne hoda: nestaje u dimu i pojavljuje se drugde. Čini mu odbij (L) pravo u njega, štap mu odbij pa udri dok je iscrpljen. Kad se podeli u senke, Vilinsko oko (O) pokazuje pravog.  
  <sub>`d6a58a96c24` · KIT_INTRO.vrac</sub>
- **RAVIJOJLA** · Akindžijski beg juriša na konju. Skoči na gredu ili odbij (L) kad prolazi, udri dok okreće konja i obori ga na zemlju.  
  <sub>`d10588b56fe` · KIT_INTRO.beg</sub>
- **RAVIJOJLA** · Arapin baca koplja sa vrha kule. Odbij koplje (L) nazad u njega, pa se popni na kulu.  
  <sub>`daddb80e4a8` · KIT_INTRO.arapin</sub>
- **RAVIJOJLA** · Kopljanik-baša drži selo pod opsadom. Gađa kopljem izdaleka i preskoči te kad mu priđeš. Odbij koplje (L) i ne daj mu mesta.  
  <sub>`d90a4b4e776` · KIT_INTRO.kopljanik</sub>
- **RAVIJOJLA** · Klizanje. U trku kliziš po zemlji: ispod niskih otvora i ispod udaraca.  
  <sub>`d9de26c94d9` · moć klizanje</sub>
- **RAVIJOJLA** · Trk po zidu. Na zidu sa Ravijojlinim šarama Marko pretrči nekoliko koraka vodoravno, pa skoči sa njega (SPACE).  
  <sub>`de4d2085fa5` · moć zidotrk</sub>
- **RAVIJOJLA** · Vazdušni kombo. W + K diže dušmanina, SPACE skače za njim, J J ga drži gore, treći udarac ga zakuca.  
  <sub>`dfa7a9d2254` · moć kombo</sub>
- **RAVIJOJLA** · Ravijojlin lanac. Lanac te privuče do srebrne kuke, laka dušmanina privuče k tebi, a štitonoši otme štit.  
  <sub>`dbab0bb0e9e` · moć lanac</sub>
- **RAVIJOJLA** · Vilinsko oko. Dok držiš O, par sekundi vidiš skrivene platforme, zidove koji su varka i tajne prolaze.  
  <sub>`d085c7d6d6b` · moć oko</sub>
- **RAVIJOJLA** · Amajlije. Tri mesta za amajlije, posle i pet. Menjaju se samo na Ravijojlinom izvoru.  
  <sub>`d390f233366` · moć amajlije</sub>
- **RAVIJOJLA** · Odmor i putovanje. Na izvoru se odmoriš (zdravlje, vino, vila), pa putuješ do svakog izvora koji si već našao.  
  <sub>`d9086e457c5` · moć putovanje</sub>
- **RAVIJOJLA** · Oznake na mapi. B ostavlja oznaku sa sličicom ovog mesta na mapi (M), da se vratiš kad dobiješ moć.  
  <sub>`d5904bda21d` · moć oznake</sub>
- **RAVIJOJLA** · Potres. Junački udar: topuz u zemlju, talas ide na obe strane i diže sve na putu. 50 besa.  
  <sub>`d19ffcd3c4f` · moć potres</sub>
- **RAVIJOJLA** · Šarčev gaz. Junački udar: Marko zazviždi, Šarac proleti i pregazi ceo red dušmana. 100 besa.  
  <sub>`d64428e94ae` · moć gaz</sub>
- **RAVIJOJLA** · Janičar: Savršeno odbijanje (L): kontra mu nanosi dvostruku štetu.  
  <sub>`dead0852122` · knjiga dušmana sword</sub>
- **RAVIJOJLA** · Štitonoša: Sporo se okreće: kolutom iza leđa pa udri. Teški udarac, uvis, juriš i Lomilac izbijaju štit.  
  <sub>`d85c9958681` · knjiga dušmana shield</sub>
- **RAVIJOJLA** · Strelac: Odbij strelu (L): sopstvena strela ga obara odmah. Izbliza je slab.  
  <sub>`df224c82da6` · knjiga dušmana archer</sub>
- **RAVIJOJLA** · Akindžija: Posle skoka je zanet: tada su udarci jači za pola. Udar nadole ga obara.  
  <sub>`df8e2f27d1d` · knjiga dušmana akindzija</sub>
- **RAVIJOJLA** · Oklopnik: Teški udarci lome oklop (tri puta). Pun zamah, udar nadole i Lomilac ga skidaju odjednom.  
  <sub>`df43aef32d8` · knjiga dušmana oklopnik</sub>
- **RAVIJOJLA** · Palikuća: Udari ga dok podiže baklju: ispusti je i zapali sebe.  
  <sub>`d639a657508` · knjiga dušmana palikuca</sub>
- **RAVIJOJLA** · Kopljanik: Uđi mu pod koplje ili ga napadni odozgo — izbliza je spor.  
  <sub>`dd507da5fda` · knjiga dušmana kopljanik</sub>
- **RAVIJOJLA** · Ratni pas: Malo izdrži: aperkat (S+K) ga baca u vazduh.  
  <sub>`d25778d8cbd` · knjiga dušmana pas</sub>
- **RAVIJOJLA** · Tufekdžija: Posle pucnja dugo puni pušku: tada je bez odbrane.  
  <sub>`d4aa3222df8` · knjiga dušmana tufekdzija</sub>
- **RAVIJOJLA** · Putnici ne mogu preko provalije. Probudi vilinski kamen kraj nje (E) i podići će kameni most.  
  <sub>`d5b2fef5a90` · updateTravelers · game.js:376</sub>
- **RAVIJOJLA** · Turska horda ide preko polja! W i S dižu i spuštaju cev, A i D daju manje ili više baruta, J ili Space puca. E ostavlja top.  
  <sub>`d1376308683` · updateGunner · game.js:874</sub>
- **RAVIJOJLA** · Zlatan znak nad glavom znači: odbij ga (L) i uzvrati. Crven krst se ne odbija: izmakni se kolutom (Shift).  
  <sub>`dfa8f173294` · drawSoldier · game.js:1373</sub>
- **KONJUŠAR** · Vašar konja u Kosovskom selu. „Biraj, Marko, konja koji će te nositi: uhvati ga za rep (E) i zamahni. Koji se ne pomakne, taj je tvoj.”  
  <sub>`d7ae1b800a3` · updateVasar · game.js:3573</sub>
- **RAVIJOJLA** · „Jao Šaro, moje desno krilo, dostigni mi vilu Ravijojlu!” Drži D za galop, Space preskače balvane. Kad je stigneš, baci topuz: I.  
  <sub>`d991b171f32` · usePotera · game.js:3612</sub>
- **RAVIJOJLA** · Onda Miloš poče da popeva, a krasnu je pesmu započeo od svih naših boljih i starijih. Marko se nasloni sedlu na oblučje: Marko spava, Miloš popeva. Pevaj u taktu gusala: J i K.  
  <sub>`dea279b062c` · pesmaPeva · game.js:3732</sub>
- **RAVIJOJLA** · Nabra vila po Miroču bilja. Leti do Miloša i zagasi mu rane (E).  
  <sub>`d2678555b07` · pvBiljeTick · game.js:3813</sub>
- **RAVIJOJLA** · Kad je Šarac sagledao vilu, po s tri koplja u visinu skače, po s četiri dobre u napredak. Space · Šarčev skok!  
  <sub>`d8806c0ceaa` · pvTrka · game.js:3911</sub>
- **RAVIJOJLA** · „Hajd’ na megdan, da se nadstreljujemo!” Tri strele svakome. Luk se zateže sam: pusti strelu (J) kad je tetiva najzategnutija.  
  <sub>`dd8f119deb7` · useStrela · game.js:3949</sub>
- **RAVIJOJLA** · Lov lovi vezir Murat sa dvanaest delija, a s njima trinaesti, Kraljević Marko. Po zelenom jezeru plove utve zlatokrile. Ti si Markov soko: leti na A D W S, a obruši se na Space.  
  <sub>`d2255483415` · lovStart · game.js:4415</sub>
- **RAVIJOJLA** · Đemo te je, kao u pesmi, zatekao bez oružja: buzdovanom ti je izbio topuz iz ruke. Izmiči se, kotrljaj i odbijaj (L), Marko, dok ga ne dohvatiš na drugom kraju megdana.  
  <sub>`df3bc2b7c08` · throwSpear · game.js:4727</sub>
- **RAVIJOJLA** · Njegov gard ne puca od lakih udaraca, Marko. Drži K za teški udarac, odbij (L) njegov napad, ili ga udri dok se oporavlja od svog zamaha.  
  <sub>`d088320913a` · megdanHint · game.js:4839</sub>
- **RAVIJOJLA** · Kapija riznice je otvorena! Stani u nju i pritisni W (gore) da uđeš.  
  <sub>`dc81e5bf49c` · updatePuzzles · game.js:5469</sub>
- **RAVIJOJLA** · Štit ne popušta pred lakim udarcem. K razbija gard. L odbija napad u pravom trenutku.  
  <sub>`d8117748b73` · world.js:5</sub>
- **RAVIJOJLA** · Priđi svetlećim kamenovima i pritisni E. Otvoriću ti put. U vazduhu te mogu podići još jednom.  
  <sub>`d5fbfe6b08f` · world.js:6</sub>
- **RAVIJOJLA** · Šarac te čeka! Priđi mu i pritisni E. Drži D za galop, Space za skok. Musini ljudi stoje na drumu: Šarac ih gazi, a štitonošu obori topuzom sa sedla (J).  
  <sub>`dabdf91ee17` · world.js:7</sub>

**samo za razvoj** · 9 · 1.081 znakova

- **RAVIJOJLA** · Megdan po novim pravilima. Laki udarci (J) klize niz gard, a treći zaredom donosi odgurivanje. Drži K da slomiš gard, ili ga udri kad promaši. Rombovi pod imenom su činovi.  
  <sub>`dee310084fb` · novoGo · game.js:6245</sub>
- **GUSLAR** · Još koji udarac i počinje drugi čin: megdandžija će te odbaciti, pa nasrnuti da te uhvati. Izmakni se, ili u koštacu uzimaj hvat koji se pokaže, pre nego što mu prsten istekne.  
  <sub>`deb468cb95c` · novoGo · game.js:6246</sub>
- **RAVIJOJLA** · Trgovac stoji pred megdanom: priđi i pritisni E. Dobio si sto dukata za probu. Levo iza tebe podići će se barjak: ako padneš, odatle nastavljaš.  
  <sub>`d9f76f8d748` · novoGo · game.js:6247</sub>
- **GUSLAR** · Uzmi carsku knjigu ispred sebe. Onda presudi, kao u pesmi: na kome je carstvo?  
  <sub>`d28730644ec` · novoGo · game.js:6248</sub>
- **RAVIJOJLA** · Alil-aga stoji na drumu. Priđi, pritisni E i nadstreli ga: J kad je tetiva najzategnutija.  
  <sub>`d85996c4f38` · novoGo · game.js:6249</sub>
- **RAVIJOJLA** · Šarac čeka ispred tebe. E da uzjašeš, D galop, Space preskače balvane, I baca topuz kad stigneš vilu.  
  <sub>`de2985c3cc0` · novoGo · game.js:6251</sub>
- **RAVIJOJLA** · Vrh Urvine. Redom: bunar među jelama (E), Šarac, kamen za sablju, pa topuz u more sa litice (I), i natrag pod jelu.  
  <sub>`d073957c1f0` · novoGo · game.js:6255</sub>
- **RAVIJOJLA** · Ovaj protivnik je već ranjen: udari ga još jednom i pobesneće (BESAN!). Strelci i palikuće se izmiču teškom udarcu (K).  
  <sub>`d2693f7fc53` · novoGo · game.js:6264</sub>
- **GUSLAR** · Guslar svakog kraja peva stihove svoje pesme. Stani kraj njega: bes ti raste dok peva.  
  <sub>`d267f011cb8` · novoGo · game.js:6269</sub>

**greybox (probni nivoi)** · 19 · 3.245 znakova

- **GUSLAR** · Prilep. Marko je pod svojim kulama bez Sokolovog krila. Krilo čeka u Sokolovoj ćeliji, na dnu bunara ispod grada; do bunara se iz kovačnice ide niskim prolazom, a klizanje je u podrumu. Mapa je gore desno.  
  <sub>`d6d3c063e39` · greybox-nivoi.js:22</sub>
- **GUSLAR** · Urvina planina. Marko ima Sokolovo krilo. Juriš u vazduhu čeka u Orlovom gnezdu, visoko na litici iznad vodopada; pred gnezdom je ponor koji se prelazi samo trkom po zidu sa Ravijojlinim šarama (u starom kamenolomu). Bez juriša se klanac ka Ravijojlinoj šumi ne prelazi.  
  <sub>`d6f8d2df018` · greybox-nivoi.js:146</sub>
- **GUSLAR** · Kačanička klisura. Marko ima krilo i juriš. Musina kula je zaključana vratima koja daleki prekidač otvara na tren; Vilin trag ostavlja Ravijojla u isposnici gore na zidu kanjona. Na vrh kule se ide Ravijojlinim lancem, a on čeka u oružani.  
  <sub>`d23ee8c5173` · greybox-nivoi.js:258</sub>
- **GUSLAR** · Kosovsko selo. Kapija je zatvorena iznutra, a na kuli nad bunarom sedi Kopljanik-baša. Sokolovo krilo čeka u Šarčevoj štali; uđi preko osmatračnice.  
  <sub>`db17be8bf61` · greybox-nivoi-pohodi.js:168</sub>
- **GUSLAR** · Manastirski vis. Četiri tabora stoje oko crkve Samodreže, a manastirska kapija je zaključana iznutra. Juriš u vazduhu čeka u kripti; bez njega se provalija do gubilišta ne prelazi.  
  <sub>`dc0551115e4` · greybox-nivoi-pohodi.js:242</sub>
- **GUSLAR** · Oranje drumova. Majka kaže: ostavi četovanje, uzmi plug i volove. Ali drum gaze janičari, a zadnja vrata hana otvara daleki prekidač. Vilin trag je u podrumu hana.  
  <sub>`d99408a9e26` · greybox-nivoi-pohodi.js:307</sub>
- **GUSLAR** · Opsednuta tvrđava na Marici. Kapija je zatvorena iznutra. Lagumi idu ispod reke do cisterne; tamo čeka Sokolovo krilo, a sa njim bedem i kula Hasan-age.  
  <sub>`d35304034e6` · greybox-nivoi-pohodi.js:368</sub>
- **GUSLAR** · Zaboravljeni podrum. Car je zabranio vino uz ramazan, a Ognjeni aga hoće da zapali zalihe. Gvozdena vrata su zatvorena iznutra; juriš u vazduhu čeka dole, kraj podzemnog vrela.  
  <sub>`d6486ccbd38` · greybox-nivoi-pohodi.js:432</sub>
- **GUSLAR** · Noćna močvara. Vezir je slomio krilo Markovom sokolu. Vezirov čardak ima zadnja vrata na daleki prekidač; Vilin trag svetli na ostrvu ispod vode.  
  <sub>`d458906d78d` · greybox-nivoi-pohodi.js:492</sub>
- **GUSLAR** · Ravijojlina šuma na Miroču. Tri vilinska kamena spavaju, a Lovac-aga goni po gori. Sokolovo krilo čeka kraj vilinskog izvora, pod korenjem.  
  <sub>`da117444716` · greybox-nivoi-pohodi.js:550</sub>
- **GUSLAR** · Vilinska pećina. Gusle javorove same gude negde duboko. Kristalna dvorana je presečena ponorom; juriš u vazduhu daje Ravijojla u svojoj odaji, kraj podzemne reke.  
  <sub>`dcdbcf7c3e4` · greybox-nivoi-pohodi.js:609</sub>
- **GUSLAR** · Zimski prevoj. Barjaci vode do kule na prevoju, ali karaula na sedlu otvara vrata samo na daleki prekidač. Vilin trag čeka kraj ledenog izvora, ispod snega.  
  <sub>`d2472c4f326` · greybox-nivoi-pohodi.js:664</sub>
- **GUSLAR** · Klisura Ibra. Đemo vodi okovanog Marka od vešala do vešala. Mostovi su srušeni; krčmarica Janja čuva Sokolovo krilo u svom podrumu.  
  <sub>`d112537ef27` · greybox-nivoi-pohodi.js:721</sub>
- **GUSLAR** · Ruševine na brdu. Arap prekomorac uzima svadbarinu od svake svadbe na Kosovu. Do poslednjeg barjaka na vrhu vodi greben koji se prelazi samo jurišem; juriš čeka u kripti pod ruševinama.  
  <sub>`d03ba68870f` · greybox-nivoi-pohodi.js:784</sub>
- **GUSLAR** · Stari rudnik. U tamnici je voda do kolena, a stari izlaz otvara prekidač koji je predaleko od vrata. Vilin trag čeka u staroj kapeli rudara, duboko dole.  
  <sub>`d29444389a5` · greybox-nivoi-pohodi.js:840</sub>
- **GUSLAR** · Obala pred zoru. Pristanište i svetionik su u turskim rukama. Sokolovo krilo čeka u Vilinom viru, ispod obale; bez njega se na bedem nad morem ne stiže.  
  <sub>`dfa1f23cc7f` · greybox-nivoi-pohodi.js:899</sub>
- **GUSLAR** · San Kraljevića Marka. Četiri odaje: slova, jabuke, drenovina i gusle. Hodnik senki se prelazi samo jurišem, a juriš je na dnu sna, kraj vilinog jezera.  
  <sub>`de6fc865c89` · greybox-nivoi-pohodi.js:955</sub>
- **GUSLAR** · Azačka tamnica. Voda do kolena, kosti do pojasa. Vrata kule otvara prekidač u stražari, predaleko od vrata; Vilin trag čeka u cisterni ispod avlije.  
  <sub>`df53f3836ae` · greybox-nivoi-pohodi.js:1011</sub>
- **GUSLAR** · Tri srca Kačanika. Musini ljudi su zatvorili drum i kapiju hana, a putnici čekaju. Tri vilinska kamena spavaju pod drumom; treći daje Sokolovo krilo, a bez njega se na srušeni drum ne penje.  
  <sub>`dda9318d7fd` · greybox-nivoi-pohodi.js:1065</sub>

## Tekstovi koji se sklapaju u hodu

Ovi `speak(...)` pozivi sklapaju rečenicu od delova (ime nivoa + uvod, ime moći + opis…). Delovi su gore u popisu; ovde je samo mesto.

- start · game.js:191 · `chapters[zone].message`
- enterChapter · game.js:269 · `chapters[zone].message`
- updateDefense · game.js:931 · `DEF_TEXT[zone]`
- uzmiMoc · game.js:1725 · `'${M.name} (${M.key}). ${M.text}'`
- startLevel · game.js:2182 · `'${L.name}. ${VARIANTS[v].intro}${LEVEL_INTRO[L.id]||L.design?.goal||'Prati put do barjaka.'}'`
- collectCudo · game.js:2220 · `'${c.name} — iz pesme „${c.song}”. ${c.perk}.'`
- useVrh · game.js:3087 · `VRH_REC[i]`
- updateUrvina · game.js:3100 · `VRH_VILA[t.said]`
- sanClue · game.js:3165 · `t.clue`
- updateKosovka · game.js:3220 · `txt`
- updateSabljaPesma · game.js:3458 · `txt`
- updatePotera · game.js:3614 · `HINTS.vila`
- updateJahanje · game.js:3697 · `txt`
- pvTick · game.js:3744 · `PV_VILA[P.round]`
- pvTick · game.js:3745 · `PV_MILOS[P.round]`
- pvTick · game.js:3747 · `PV_MILOS[0]`
- pvPesmaKraj · game.js:3750 · `'Miloš peva, vila mu otpeva; lepše grlo u Miloša carsko, jeste lepše nego je u vile.${k>.75?' Gusle su te slušale kao ni`
- updateBranik · game.js:4280 · `tr(B.uvod)`
- updateBranik · game.js:4286 · `tr(B.kraj)`
- updateArena · game.js:4568 · `KIT_INTRO[c.kit]||'${c.name} ti preči put. Pazi na njegov poseban napad, Marko!'`
- hintOnce · game.js:5012 · `HINTS[key]`
- bookSee · game.js:5449 · `'${FOE_BOOK[t].name}: ${FOE_BOOK[t].weak}'`
- takeZapis · game.js:5676 · `t`
- playStory · game.js:6131 · `...q`
- startGreybox · game.js:6186 · `world.gb.L.uvod`
