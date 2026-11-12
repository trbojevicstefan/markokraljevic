# Lost Crown pohodi: tri duga nivoa

Pokreću se iz menija (dugme **Lost Crown pohodi** u donjem redu) ili adresom `index.html?greybox=1`, `?greybox=2` i `?greybox=3`. Pohodi 4 i dalje dolaze iz `dist/greybox-nivoi-pohodi.js` preko registra (vidi dole).

| Šta | Fajl |
|---|---|
| Motor | `dist/greybox.js` |
| Nivoi (podaci) | `dist/greybox-nivoi.js` |
| Oblačenje | `dist/greybox-svet.js` |
| Test | `greybox-test.mjs` (deo `npm test`) |

Iz *The Lost Crown* je uzeta samo struktura; raspored soba, crteži i imena su naši. To su:
- povezan svet na više spratova;
- moći kao ključevi;
- prečice koje se otvaraju sa druge strane;
- skrivene sobe prekrivene kao stena dok ne uđeš;
- mapa koja se crta dok istražuješ;
- ponor koji kažnjava (−20 zdravlja i povratak na čvrsto tlo), a ne ubija.

| Nivo | Sobe | Spratova | Tajne | Čekpointi | Protivnici | Bos | Moć | Druge moći (kapije) |
|---|---|---|---|---|---|---|---|---|
| 1 · Podgrađe pod Markovim kulama (Prilep) | 21 | 5 | 4 | 3 | 20 | Kapetan kule (Janičarski aga) | Sokolovo krilo | Klizanje |
| 2 · Urvina planina | 22 | 5 | 4 | 3 | 23 | Lovac-aga sa psima | Juriš u vazduhu | Trk po zidu |
| 3 · Kačanička klisura i Musina kula | 21 | 5 | 4 | 3 | 21 | Musa Kesedžija | Vilin trag | Ravijojlin lanac, Vilinsko oko |

Moći se prenose iz nivoa u nivo:
- nivo 2 počinje sa krilom i klizanjem;
- nivo 3 počinje sa krilom, jurišem, klizanjem i trkom po zidu.

### Nove moći kao kapije i tajne
Moći iz `MOCI2` u `game.js` (klizanje, trk po zidu, lanac, oko) ovde su kapije. Nivo ih daje oltarom (`daje2`), kao i svoju glavnu moć.
- **Nivo 1, Klizanje:** oltar je u podrumu. Iz kovačnice u bunar (i nazad) ide se samo klizanjem ispod niskog prolaza, pa put do krila traži klizanje.
- **Nivo 2, Trk po zidu:** oltar je u starom kamenolomu. Pred Orlovim gnezdom je ponor od 700 px (krilo i juriš daju najviše 553). Preko njega se ide samo trkom po zidu sa Ravijojlinim šarama, u oba smera.
- **Nivo 3, Ravijojlin lanac:** oltar je u oružani. Drugi dimnjak kule je skinut, pa se sa galerije na gornju stazu, i do Muse, ide lancem preko dve srebrne kuke (prva levo, pa okret ka drugoj).
- **Nivo 3, Vilinsko oko:** oltar je na podzemnom izvoru. Pred Skrivenom pećinom je ponor od 640 px, a most preko njega se vidi i drži samo dok je oko otvoreno (O, 3,2 s).
- **Nivo 3, varka:** ulaz u Musinu riznicu je zid-varka. Prolazi se kroz njega, a oko ga pokaže.

Graditelji u `B` su:
- `B.zid(ime,x,y,w,h)`: zid sa šarama; Marko se hvata kad mu je struk u pravougaoniku;
- `B.kuka(ime,x,y)`: srebrna kuka, domet lanca je 430 px od ruke;
- `B.nisko(ime,x,vrh,pod)`: blok od plafona do 60 px iznad poda;
- `B.oko(x,y,w)`: daska koja se vidi samo kroz oko;
- `B.iluzija(ime,x,y,w,h)`: zid koji je varka.

Test prelazi te prolaze stvarnim tasterima (`slide`, `zid`, `kuka`, `oko`). Proverava i da bez moći ostaju zatvoreni, a za ponore da ih ni najbolji skok sa krilom i jurišem ne prelazi.

Zid-skok radi samo uz zidove dimnjaka (dva zida na 150 px). Vilinski uzlet je u ovim nivoima isključen, jer bi preskakao kapije. U sačuvanu igru se ništa ne upisuje.

## Mape

Jedna ćelija je 1200 × 720 px; red 0 je glavni put, gore su zidine i stene, dole podrumi i pećine. Zvezdica (*) je skrivena soba.

### 1 · Podgrađe pod Markovim kulama

```
 -2                                                                                     [zvonik    ][*zvonara  ][kula      ][vrh       ]
 -1                         [*golubarni]                        [stepeniste][bedem                             ][kula      ]
  0 [livada    ][varos                 ][pijaca    ][kapija    ][stepeniste][dvoriste              ][kasarna   ][kula      ][oruzarnica]
  1                         [*vinski   ][podrum    ][kovacnica ][bunar     ]
  2                                                 [celija    ][bunar     ][tamnica               ][*riznica  ]
```

**Tok igre:**
1. **Varoš i pijaca:** livada, varoš i pijaca. Iz pijace rupa vodi u podrum, gde je Klizanje; gradska kapija je zaključana.
2. **Podrumi do krila:** podrum i kovačnica imaju daske koje popuštaju nad jamom i šiljke. Iz kovačnice se u bunar klizi ispod niskog prolaza. Bunar vodi do dna, a u Sokolovoj ćeliji je **krilo**.
3. **Bunar nagore:** sa krilom se bunar penje ispust po ispust i izlazi kroz otvor u podu stepeništa. Poluga tamo otvara gradsku kapiju, prečicu do početka.
4. **Tvrđava:** dvorište, kasarna, pa kula (dimnjak, pa ispusti za krilo) do bosa na vrhu. Uz put su bedem sa strelnicom i zvonik.

**Tajne:**
- **Golubarnik** iznad varoši: krilo.
- **Zvonara** iza lomljivog zida u zvoniku: krilo, pa teški udarac.
- **Vinski podrum** iza lažnog zida.
- **Riznica** iza lomljivog zida u tamnici.

**Čuda:** Prilepsko zvono i Markov pehar.

### 2 · Urvina planina

```
 -2                                                                         [stene                 ][gnezdo    ][*orlova   ]
 -1             [osmatracni            ][kamenolom             ][vodopad   ][litica                ][jele                  ][*skriveni ]
  0 [zaseok    ][podnozje              ][staza                 ][vodopad   ][klanac                ][suma                  ][izvor     ]
  1                         [*kristali ][pecina                ][ponor                 ][jezero    ]
  2                                     [dubina                ][koren     ][*jazbina  ]
```

**Tok igre:**
1. **Do vodopada:** zaselak, podnožje, staza, pa dimnjak uz vodopad.
2. **Do gnezda:** u starom kamenolomu je Trk po zidu. Zatim litica (pred jelovom padinom je ponor), ispust do stenovite grede, trk po šarenom zidu preko ponora i Orlovo gnezdo sa **jurišem**.
3. **Preko klanca:** sa jurišem se prelazi ponor od 500 px u klancu, pa kroz Ravijojlinu šumu do Vilinog izvora i Lovac-age.
4. **Pod zemljom:** pećine imaju dimnjak do duboke pećine i podzemni ponor do jezera. Iz jezera se ispustom izlazi gore u klanac, iza ponora.

**Tajne:**
- **Orlova stena** preko procepa kod gnezda: juriš. Promašaj pada na jelovu padinu.
- **Skriveni izvor** iza lažnog zida na padini: juriš, pa lažni zid.
- **Kristalna dvorana** iza lomljivog zida.
- **Vučja jazbina** iza lažnog zida u korenju.

**Čuda:** Orlovo pero i Vilino pero.

### 3 · Kačanička klisura i Musina kula

```
 -3                                                                                                             [kula                  ][vrh       ]
 -2                                                                                                 [strazara  ][kula                  ][*riznica  ]
 -1                                     [staza                             ][isposnica ][*kapela   ]            [kula                  ][oruzana   ]
  0 [ulaz      ][obala                 ][most                  ][vodenica  ][skela                 ][podnozje  ][kula                  ]
  1 [*skrivena ][pecina                ][*ispodmost][izvor     ][mlin      ][brzaci                ]            [tamnica               ]
```

**Tok igre:**
1. **Do isposnice:** obala, pa srušeni kameni most (krilo preskače dve pukotine), pa vodenica. Iz vodenice dimnjak vodi na stazu kroz kanjon (strelci, šiljci, strelnica), a staza do isposnice sa **Vilinim tragom**.
2. **Do kule:** nazad dimnjakom u vodenicu, preko skele (juriš preko reke; promašaj pada u brzake) do podnožja Musine kule.
3. **Ulaz u kulu:** vrata kule otvara prekidač na tren. Marko ostavi trag kraj vrata, stane na prekidač, pa se tragom vrati kroz otvorena vrata.
4. **Kroz kulu:**
   - dimnjak do međusprata;
   - ispust za krilo do galerije;
   - lancem (oltar u oružani) preko dve kuke do gornje staze;
   - Musa na krovu.
   - U podu kule je poklopac ka tamnici, isto na trag.

**Tajne:**
- **Ispod mosta:** poklopac na mostu, trag.
- **Kapela u steni:** vrata iz isposnice, trag.
- **Musina riznica:** zid-varka na galeriji kule.
- **Skrivena pećina:** most preko ponora, vidljiv samo Vilinskim okom (oltar na podzemnom izvoru).

**Čuda:** Guslareve gusle i Musina sablja.

## Oblačenje

`greybox-svet.js` čita `dist/assets/realisticno/manifest.json` (dogovor sa sesijom „realisticne-pozadine“) za biome `podgradje`, `urvina` i `klisura`:
- **slojevi:** paralaksa po biomu, a za sobe sa `interior` unutrašnji set;
- **materijali:** `ground`, `wall`, `platform`, `beam`, `ceiling` su bešavne slike 512×512 koje se ponavljaju (zidovi i plafoni kao šara, ispusti i grede kao ploče); manifestov `ground` važi i za unutrašnje sobe;
- **predmeti:** po `id` (nivo može da koristi i opšta imena: `tezga` → `kolica`, `kamen` → `kameni-blok`, `bure` → `bacva`, `luk` → `rusevni-luk`, `baklja` → `mangal`). `w`/`h` su u pikselima sveta. U ovim nivoima su predmeti samo ukras i ništa ne zaprečuju.

Sva tri bioma su u manifestu, pa su sva tri nivoa i pohodi 4–19 obučeni realistično:

| Biom | Spolja | Unutra |
|---|---|---|
| podgradje | Prilep u zlatni sat | podrum |
| urvina | jutarnja magla, vodopadi | pećina |
| klisura | klisura u sumrak i oluju | Musina kula |

Kad je biom u manifestu, naslikani setovi soba (šuma, reka) ustupaju realističnim slojevima, a pećine dobijaju unutrašnji set.

Ako manifest ili neki njegov fajl nedostaje, uskaču naslikane slike iz `dist/assets/world/`:
- tri nivoa nose set svog bioma (oranje/podrum, urvina/pećina, klisura/podrum, uz šumu, reku i pećinu);
- pohodi 4–19 nose set svog `zeljeniBiom`.

### Pod sa dubinom
Staza se vidi blago odozgo, ali linija hoda i sudari ostaju isti:
- iznad linije hoda je traka od 30 px; dalja ivica je gore i uvučena na krajevima bloka, a tekstura je skraćena i ima izmaglicu prema daljoj ivici;
- ispod linije je tamnije prednje lice;
- kosine imaju istu traku, a grede i ispusti tanju gornju stranu.

Gornja površina je manifestov `materials.groundTop` (1024×256, ponavlja se vodoravno), u traci od 50 px nad linijom hoda. Ispod ivice je `materials.groundFront` (96 px: ivica staze pa presek tla), a ispod njega `materials.ground`. Obe trake su isečene u stubiće od 8 px koji prate kosinu. Bez njih se gornja površina pravi od skraćenog materijala, a prednje lice od zida.

**Vidici i zamene:**
- `svet-<vista>`: nivo sa `zeljeniBiom` uzima spoljne slojeve, trake tla i prvi plan iz `svet-<vista>` kad je on u manifestu, a unutrašnjost ostaje od bioma;
- soba sa `set` (šuma, reka, pećina) uzima `svet-<set>`;
- `svet-predmeti`: naslikani predmet iz `world/` menja se realističnim po polju `replaces`, iste veličine i sa istim sidrom.

**Predmeti, sve ručno, ništa nasumično:** svaki predmet je upisan u tabelu `ukras` nivoa, soba po sobu: `[id, mesto od leve ivice sobe, {fg, row}]`.
- Predmet se crta posle tla i stoji na stazi, na površini pod sobom (i na kosini), u veličini iz manifesta.
- `fg` je prvi plan ispred Marka (busenje, kamenje, korenje, ograda), tamniji i malo brži od sveta, preko donje ivice slike. Prvi plan je samo ono što je upisano.
- U tri nivoa je 293 predmeta. Test proverava da svaki stoji na čvrstom tlu, da nije nad rupom i da je dalje od oltara, čekpointa, prekidača, poluga i vrata.
- Plan protivnika po sobama je u `PLAN-PROTIVNIKA.md`.

**Brdo:** ivica staze prati kosinu, a zemlja ispod se rasteže do iste linije kao pod pored, pa brdo izgleda kao humka, a ne kao most nad tamnim lukom.

**Vrata, poklopci i kapija** su od drveta ili kamena, sa tankom ivicom u boji. Lažni zid je od istog zida kao zidovi oko njega.

**Sopstveni predmeti** (`dist/assets/greybox/`): oltar moći, kameni prekidač i poluga. Prave se lokalno: skice su u `art/greybox/sketches.py`, slike daje Z-Image img2img (isti radnik kao za realistične pozadine), a `art/greybox/finish.py` ih iseca i snima. Dok ih nema, crta se kameni blok, odnosno oznake u boji.

**Rupe u podu** pokazuju sobu ispod, a ne nebo sobe iznad.

## Registar nivoa

`GB_LEVELS` u `greybox.js` je registar.
- `gbRegister({broj: nivo})` dodaje nivoe; zauzeti brojevi ostaju.
- U pregledaču `gbReady` jednom učita `dist/greybox-nivoi-pohodi.js` (njegov `GB_POHODI`, nivoi 4 i dalje). Ako fajla nema, ostaju tri nivoa.
- Meni „Lost Crown pohodi“ pravi spisak pri svakom otvaranju, a `?greybox=N` kreće tek kad je registar spreman.

## Kraj nivoa

- **Bos se pamti na prvom ticku** (`S.boss`, `gbBoss`). Ako nivo ima više šampiona, bos je onaj iz arene u `bosSoba`, inače poslednji napravljen. Nivo je pređen kad bos padne ili kad ga igra izbaci iz `enemies` (ponor, dokrajčivanje, gaz, prizor), čak i pre nego što ga provera vidi mrtvog.
- **Ekran pobede** dolazi `GB_WIN_AFTER` = 2 s posle pada: naslov „<NIVO> · PREĐEN“, vreme, tajne sobe i čuda. Igra za to vreme stoji (`mode='gbDone'`).
  - **Sledeći pohod** (Enter, A): nivo n+1, a adresa prelazi na `?greybox=n+1`. Posle poslednjeg nivoa vodi u spisak pohoda.
  - **Ostani i traži tajne** (Esc, B): ekran se zatvara, a nivo ide dalje i ekran se više ne vraća.
  - **Junački pohodi**: glavni meni sa otvorenim spiskom.
- Pređeni nivoi se pamte pod `marko-junacki-pohodi` (`GB_DONE_KEY`, niz brojeva) i u spisku imaju kvačicu. `marko-megdani` i `marko-levels` se ne diraju.
- `greybox-test.mjs` (nivoi 1–3) i `greybox-pohodi-test.mjs` (4–19) za svaki nivo proveravaju četiri stvari: ekran posle 2 s, „Ostani“, bosa izbačenog iz liste i „Sledeći pohod“ do n+1, a posle 19 u meni.

## Provereno u pravoj igri

Sva tri nivoa su pređena u pregledaču pravim tasterima, od starta do bosa: moći, dimnjaci, ispusti, poluga, vrata na trag, juriš preko ponora u oba smera, tajne Orlova stena i Kapela u steni. Prolaz je našao tri greške, sada popravljene:
- bos je izlazio iz arene kroz otvor vrata (sada ostaje unutra dok traje megdan);
- tamna rupa ponora prekrivala je plafon sobe ispod;
- nebo sobe ispod virilo je iznad poda sobe iznad.

Test meri u koracima od 1/120 s, kao igra. Pragovi su široki: na primer, uspon na poslednji ispust u bunaru uspeva za skok bilo gde u oko 130 px pred ivicom i krilo oko 0,25–0,5 s posle skoka.

## Mere za nove sobe

| Šta | Koliko |
|---|---|
| Visina skoka / sa hvatom ivice | 126 / 266 px |
| Krilo / krilo i hvat | 243 / 383 px |
| Ispust za krilo | 345–365 px iznad poda |
| Razmak dva ispusta u nizu | 150–190 px vodoravno, jer na manjem Marko udari glavom pre hvata |
| Ponor za juriš | 500 px (bez juriša najviše 469, sa jurišem 553); poslednjih 60 px daleke ivice je „step“ |
| Pukotina za krilo | 300 px |
| Dimnjak | dva zida 150 px razmaka; donji kraj 150 px iznad poda, da se ispod prolazi |
| Vrata i poklopac na prekidač | otvoreni 1 s; prekidač je najmanje 700 px dalje, a između nema rupa |
| Zona ponora | samo traka debljine poda ispod rupe; sobe ispod rupe nisu pogođene |
| Bos | arena počinje tek kad je Marko na njenoj visini; vrata ka areni su jednosmerna |

## Kako se dodaje nivo

U `GB_NIVOI` dodaj objekat sa sledećim delovima:
- `sobe`: rešetka;
- `vrata` i `rupe`;
- `brda`: kosine;
- `delovi`: delovi sobe iza ponora, kao posebni čvorovi;
- `build(B)`: blokovi, protivnici, zamke, tajne, svetilište moći, čekpointi i bos;
- `veze`: prolazi koji nisu obična vrata ili rupe, svaki sa načinom na koji ga test prelazi (`up`, `chimney`, `leap`, `hop`, `trace`, `break`, `walk`, `open`).

`greybox-test.mjs` za svaki nivo:
- proverava graf;
- svaki prolaz prelazi stvarnim ulazima u oba smera;
- svaki prolaz koji traži moć proba i bez nje;
- obara bosa.
