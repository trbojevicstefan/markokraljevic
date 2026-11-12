# Lost Crown pohodi: tri duga nivoa

Pokreću se iz menija (dugme **Lost Crown pohodi** u donjem redu) ili adresom `index.html?greybox=1`, `?greybox=2` i `?greybox=3`.

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

| Nivo | Sobe | Spratova | Tajne | Čekpointi | Protivnici | Bos | Moć |
|---|---|---|---|---|---|---|---|
| 1 · Podgrađe pod Markovim kulama (Prilep) | 21 | 5 | 4 | 3 | 20 | Kapetan kule (Janičarski aga) | Sokolovo krilo |
| 2 · Urvina planina | 22 | 5 | 4 | 3 | 23 | Lovac-aga sa psima | Juriš u vazduhu |
| 3 · Kačanička klisura i Musina kula | 21 | 5 | 4 | 3 | 21 | Musa Kesedžija | Vilin trag |

Moći se prenose iz nivoa u nivo:
- nivo 2 počinje sa krilom;
- nivo 3 počinje sa krilom i jurišem.

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
1. **Varoš i pijaca:** livada, varoš i pijaca. Iz pijace rupa vodi u podrum; gradska kapija je zaključana.
2. **Podrumi do krila:** podrum i kovačnica imaju daske koje popuštaju nad jamom i šiljke. Bunar vodi do dna, a u Sokolovoj ćeliji je **krilo**.
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
2. **Do gnezda:** litica (pred jelovom padinom je ponor), ispust do stenovite grede, pa Orlovo gnezdo sa **jurišem**.
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
   - dimnjak do gornje staze;
   - Musa na krovu.
   - U podu kule je poklopac ka tamnici, isto na trag.

**Tajne:**
- **Ispod mosta:** poklopac na mostu, trag.
- **Kapela u steni:** vrata iz isposnice, trag.
- **Musina riznica:** lažni zid na galeriji kule.
- **Skrivena pećina:** lomljivi zid.

**Čuda:** Guslareve gusle i Musina sablja.

## Oblačenje

`greybox-svet.js` čita `dist/assets/realisticno/manifest.json` (dogovor sa sesijom „realisticne-pozadine“) za biome `podgradje`, `urvina` i `klisura`:
- **slojevi:** paralaksa po biomu, a za sobe sa `interior` unutrašnji set;
- **materijali:** `ground`, `wall`, `platform`, `beam`, `ceiling`;
- **predmeti:** po `id`.

Dok manifest ili neki fajl iz njega ne postoji, koriste se naslikani materijali iz `dist/assets/world/`:

| Biom | Spolja | Unutra | Posebni setovi |
|---|---|---|---|
| podgradje | oranje | podrum | — |
| urvina | urvina | pećina | šuma, reka |
| klisura | klisura | tvrđava | reka |

Uz to idu trake tla, zid-kamen, zid-stena i zid-cigla, platforme `plat-kamen`, `plat-mahovina` i `plat-greda`, kolje i šiljci. Dok se slike ne učitaju, soba je siva.

Tlo se seče u stubiće od 4 px i prati svaku kosinu. Zidovi, ispusti i grede se pune materijalom tačno gde im stoje blokovi. Oznake igre se crtaju preko materijala: traka krila na ispustima, rub ponora, vrata, kapije i prekidači.

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
