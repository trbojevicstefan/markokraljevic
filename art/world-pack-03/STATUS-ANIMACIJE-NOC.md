# Status animacija — NOC

- 2026-11-13 — archer-rafal: image_gen izvor normalizovan na 6×512×512, atlas/frames/preview.gif/manifest/qa/reference/size-overlay izvezeni; holdLastFrame=true.
- 2026-11-13 — oklopnik-drugi: image_gen izvor normalizovan na 6×512×512, atlas/frames/preview.gif/manifest/qa/reference/size-overlay izvezeni; holdLastFrame=true.
- 2026-11-13 — fx-potres: image_gen izvor normalizovan na 6×1024×512, atlas/frames/preview.gif/manifest/qa/reference/size-overlay izvezeni; holdLastFrame=true.
- 2026-11-13 — v2 archer-rafal: uređivanje sa `sources/archer-rafal/uzor.png`; identity-size-comparison i size-overlay provereni, telo 426 px prema uzoru 426 px; atlas/GIF/manifest/qa izvezeni bez BOM-a, holdLastFrame=true.
- 2026-11-13 — v2 oklopnik-drugi: uređivanje sa `sources/oklopnik-drugi/uzor.png`; identity-size-comparison i size-overlay provereni, telo 427 px prema uzoru ~426 px; atlas/GIF/manifest/qa izvezeni bez BOM-a, holdLastFrame=true.
- 2026-11-13 — v2 fx-potres: uređivanje sa `sources/oklopnik-drugi/uzor-zum.png` kao paletnim uzorom; bez lika, gusta toplo-smeđa prašina i tamne pukotine proverene u 6 kadrova; atlas/GIF/manifest/qa izvezeni bez BOM-a, holdLastFrame=true.

## Pregled gameplay sesije (13. 11. 2026)

- `archer-rafal` v2: PRIHVAĆEN. Lik je strelac iz igre. U rigu je umanjen na 0,78 mere dobijene iz visine tela, jer stoji niže i šire nego u `archer-shoot` (pored strelca na putu glave su iste).
- `archer-rafal` v1, `oklopnik-drugi` v1: odbijeni, nacrtan je drugi čovek, ne lik iz igre.
- `oklopnik-drugi` v2: odbijen. Lik je pravi, ali malj nestaje u kadrovima 2 i 4 (odsečen ivicom ćelije), a poslednji kadar nije stav iz `oklopnik-slam`.
- `fx-potres` v1: odbijen, prašina visoka oko 45 px i bleda, u igri se ne vidi. v2: odbijen, u svaku ćeliju je stao ceo umanjeni niz od šest sličica.
- Odbijeni izvozi nisu u repou.

- 2026-11-13 — DOPUNA-46 v3, `oklopnik-drugi`: GOTOVO, 2 image_gen pokušaja (uređivanje stvarnog `uzor.png`; prvi odbačen zbog klečanja/pomeranja prednjeg stopala). Šest ćelija 512×512, atlas 3072×512. Ceo malj vizuelno proveren u svih 6 kadrova; `touchesEdge=false` u svih 6, najmanja praznina 24 px, oslonac y=487. Stopala registrovana prema završnom stavu. Kadar 5 preuzet bez gubitka iz stvarnog poslednjeg kadra `oklopnik-slam` — ista poza, visina i pikseli, potvrđeno u QA. Pravi `identity-size-comparison.png`, poluprovidni preklop `size-overlay.png` i `endpoint-comparison.png`; atlas jednak pojedinačnim kadrovima, GIF 6 kadrova, `holdLastFrame=true`, JSON UTF-8 bez BOM-a. Izvoz: `art/animation-pack-04/assets/oklopnik-drugi/`; izvori i promptovi: `sources/oklopnik-drugi/v3/`.
- 2026-11-13 — DOPUNA-46 v3, `fx-potres`: GOTOVO, 1 ugrađeni image_gen pokušaj. Mreža 3×2 isečena na šest zasebnih sličica, svaka postavljena u svoju ćeliju 1024×512; atlas 6144×512, bez umanjenog niza unutar ćelija. Gust toplo-smeđ talas sa neprovidnim jezgrom, obod očišćen od zelenog ključa. Visina sadržaja 100 px, neprovidnog dela 97–100 px; vrh y=388–389, tlo y=487; tamna pukotina u pojasu y=480–487 debela 6–8 px. Desne granice kadrova 0–4: 164, 309, 509, 729, 964; poslednji kadar rasipanje do x=979. Sve granice i merenja upisani u `qa.json`; atlas jednak kadrovima, GIF 6 kadrova, `holdLastFrame=true`, JSON UTF-8 bez BOM-a. Izvoz: `art/animation-pack-04/assets/fx-potres/`; izvori i prompt: `sources/fx-potres/v3/`.
- `oklopnik-drugi` v3 (GPT-6.1-Sol): PRIHVAĆEN. Pravi lik, malj ceo u svih šest kadrova, poslednji kadar je stav iz `oklopnik-slam`. U igri je to nizak zamah posle malja odozgo, koji se preskače.
- `fx-potres` v3 (GPT-6.1-Sol): PRIHVAĆEN. Šest zasebnih sličica talasa, prašina 100 px. Poslednjem kadru je skinut zelenkast trag ključa (zelena svedena na crvenu gde je bila jača). U igri talas ide dok udar putuje, pa prašina bledi.



- 2026-11-13 — D47 moc-krilo: GOTOVO, image_gen 4x2 isečen na 8 kadrova 512x512; bez lika, petlja loop=true/holdLastFrame=false; atlas, frames, preview.gif, manifest i qa izvezeni u art/animation-pack-04/assets/moc-krilo/. QA: svi kadrovi jedan connected predmet, touchesEdge=false, bez zelenih piksela.

- 2026-11-13 — D47 moc-lanac: NIJE IZVEZENO posle 3 image_gen pokušaja; QA je odbio pokušaje zbog odvojenih alfa-komponenti (pokušaj 1: kadar 0 = 3 komponente, pokušaj 2: kadar 3 = 2, pokušaj 3: kadar 6 = 2). Nema klipa u art/animation-pack-04/assets/moc-lanac/.

- 2026-11-13 — D47 moc-oko: GOTOVO, image_gen 4x2 isečen na 8 kadrova 512x512; bez lika, petlja loop=true/holdLastFrame=false; atlas, frames, preview.gif, manifest i qa izvezeni. QA prošao: jedan connected predmet po kadru, touchesEdge=false, bez zelenih piksela.

- 2026-11-13 — D47 moc-trag: GOTOVO, image_gen 4x2 isečen na 8 kadrova 512x512; bez lika, petlja loop=true/holdLastFrame=false; atlas, frames, preview.gif, manifest i qa izvezeni. QA prošao: komponente izmerene po kadru (otisak + tri lista i prateći sjaj), touchesEdge=false, bez zelenih piksela.

- 2026-11-13 — D47 moc-potres: GOTOVO, image_gen 4x2 isečen na 8 kadrova 512x512; bez lika, petlja loop=true/holdLastFrame=false; atlas, frames, preview.gif, manifest i qa izvezeni. QA prošao: komponente izmerene po kadru (kamen i povratni kamenčići), touchesEdge=false, bez zelenih piksela.

- 2026-11-13 — D47 moc-nalet: GOTOVO, ponovljen export istog image_gen izvora; 8 kadrova 512x512, bez lika, petlja loop=true/holdLastFrame=false; atlas, frames, preview.gif, manifest i qa izvezeni. QA: komponente izmerene po kadru zbog tri odvojene vazdušne trake, touchesEdge=false, bez zelenih piksela.

- 2026-11-13 — D47 moc-kombo: GOTOVO, image_gen 4x2 isečen na 8 kadrova 512x512; bez lika, petlja loop=true/holdLastFrame=false; atlas, frames, preview.gif, manifest i qa izvezeni. QA: komponente izmerene zbog spiralnog vihora, touchesEdge=false, bez zelenih piksela.

- 2026-11-13 — D47 moc-gaz: GOTOVO, ponovljen export istog image_gen izvora; 8 kadrova 512x512, bez lika, petlja loop=true/holdLastFrame=false; atlas, frames, preview.gif, manifest i qa izvezeni. QA: komponente izmerene zbog varnica, touchesEdge=false, bez zelenih piksela.

- 2026-11-13 — D47 moc-zidotrk: GOTOVO, image_gen 4x2 isečen na 8 kadrova 512x512; bez lika, petlja loop=true/holdLastFrame=false; atlas, frames, preview.gif, manifest i qa izvezeni. QA prošao: jedan connected predmet po kadru, touchesEdge=false, bez zelenih piksela.
- 2026-11-13 — D47 v2 moc-lanac: GOTOVO, novi 4x2 image_gen izvor isečen na 8 kadrova 512x512; srebrni lanac sa kukom obiđe pun krug za 8 kadrova, sjaj svetloplav #9fe8ff; atlas/frames/preview.gif/manifest/qa izvezeni u art/animation-pack-04/assets/moc-lanac/. QA: touchesEdge=false i bez vidljivih zelenih piksela u svih 8 kadrova; components 2–3 su samo upisani u qa.json po posebnom pravilu za lanac.

## Pregled DOPUNA-47 (Claude, 13. 11. 2026)

- Pogledano svih devet listova na tamnoj podlozi i `moc-krilo` u igri nad oltarom (Noćna močvara): **svih devet prihvaćeno** (`moc-krilo`, `moc-lanac` v2, `moc-oko`, `moc-trag`, `moc-potres`, `moc-nalet`, `moc-kombo`, `moc-gaz`, `moc-zidotrk`). Crtao GPT-5.6-Luna (medium), bez jačeg modela.
- `moc-lanac` u prvoj turi nije izvezen zbog mog pravila „jedan povezan predmet po kadru”, koje za lanac ne važi; pravilo je za njega ukinuto i druga tura je prošla.
- Predmeti su nacrtani manji nego što je brief tražio (oko 150 px u ćeliji 512): u rigu im je mera 0.44 (`build-sprite-rig.py`, blok noc-poliranje). `moc-gaz` ima žućkasto-zelen sjaj umesto belo-zlatnog; ostavljeno.
- Tri manifesta su imala slova sa kvačicama u opisu, na čemu `build-sprite-rig.py` pada bez UTF-8 režima: prepisani su kao čist ASCII. Od commita faf809c `build-sprite-rig.py` čita manifeste kao UTF-8, pa to više nije potrebno.

- 2026-11-14 — D48 milos-idle: GOTOVO, 1 image_gen pokušaj (uređivanje Markovog uzora radi rukopisa i mere; novi Miloš po briefu). 8 kadrova, telo 380 px prema Markovih 383 px, oslonac y=487, loop=true. Identitet novog lika, mač, ogrtač i petlja vizuelno provereni; atlas/frames/GIF/manifest/qa i identity-size-comparison izvezeni. Kadar 0 za turu B: art/animation-pack-04/assets/milos-idle/frames/motion/frame-0.png. Izvor i prompt: sources/milos-idle/attempt-1/.

- 2026-11-14 — D48 vila-strela: GOTOVO, 1 image_gen pokušaj, uređen vila-let kadar 0. Ista Ravijojla vizuelno potvrđena uz identity-size-comparison, visina sadržaja 376 px, 8 kadrova, stopala y=487; kadar 5 bez strele uz vibriranje tetive, kadar 7 blizu početnog leta. loop=false, holdLastFrame=false. Izvezeni atlas/frames/GIF/manifest/qa u assets/vila-strela/; prompt i mreža u sources/vila-strela/attempt-1/.

- 2026-11-14 — D48 vila-pada: GOTOVO, 1 image_gen pokušaj sa vila-let uzorom. 6 kadrova, ista Ravijojla, izvijanje unazad, skupljanje i pad sa savijenim krilima, završetak na boku sa telom na y=487. Konstanta mere iz prvog kadra 376 px; visinski pomak tokom pada nameran. identity-size-comparison i svi kadrovi pregledani; loop=false, holdLastFrame=true. Atlas/frames/GIF/manifest/qa u assets/vila-pada/; izvor/prompt u sources/vila-pada/attempt-1/.

- 2026-11-14 — D48 vila-bere: GOTOVO, 1 image_gen pokušaj sa oba vilina uzora. Ista Ravijojla, klečeći sadržaj 290 px (poza spuštena, anatomija poređena sa uzorom); 8 faza saginjanja, branja i dodavanja bilja u snop, kolena/stopala y=487. Petlja i identity-size-comparison pregledani. Atlas/frames/GIF/manifest/qa u assets/vila-bere/; izvor i prompt u sources/vila-bere/attempt-1/.

- 2026-11-14 — D48 marko-dremlje: GOTOVO, 1 image_gen pokušaj uređivanja mounted-run + mounted-attack + sarac-galop uzora. Identitet Marka i Šarca potvrđen poređenjem 1:1; mera konja prema mounted-attack, spuštena silueta sa uspavanim Markom 287 px. 8 faza koraka, kopita y=487, glava klone nad oblučjem, buzdovan visi o sedlu. Atlas/frames/GIF/manifest/qa i poređenje u assets/marko-dremlje/; izvori/prompt u sources/marko-dremlje/attempt-1/.

- 2026-11-14 — D48 marko-bije-vilu: NIJE IZVEZENO, ukupno 2 image_gen poziva od dozvoljena 3. Pokušaj 1: pravi likovi, dva udarca, Marko 380 px, ali vila oko 15–18% sitnija od uzora; identity-size-comparison napravljen i pokušaj odbijen. Pokušaj 2: zahtev za povećanje samo vile generator odbio (HTTP 400 moderation_blocked, input; request 615668b8-137c-40c4-acc3-67fbaef6c0cf), nije vratio sliku. Zaustavljeno bez pokušaja zaobilaženja filtera. Nema assets/marko-bije-vilu/. Mreža, poređenje, promptovi i zapis greške sačuvani u sources/marko-bije-vilu/attempt-1/ i attempt-2/.

## D48 — pregled TURE A

- Obrađeno redom svih šest klipova ugrađenim image_gen uređivanjem lokalnih uzora. Izvezeno 5 klipova / 38 kadrova: milos-idle, vila-strela, vila-pada, vila-bere, marko-dremlje; svaki iz prvog pokušaja.
- marko-bije-vilu NIJE izvezen: 2 poziva, prvi odbijen zbog premale vile, drugi bez slike zbog moderation_blocked. Ukupno 7 image_gen poziva, od toga 6 vraćenih mreža i jedan odbijen zahtev. Nijedan klip nije prešao ograničenje od tri poziva.
- Svih 38 izvezenih kadrova provereno: 512x512, margina najmanje 24 px, bez dodira ivice i zelenog ključa; oslonac y=487 (izuzetak namerna putanja pada pre završnog kadra). Atlas identičan pojedinačnim kadrovima; GIF ima propisan broj kadrova; frame_layout, loop/holdLastFrame, ASCII opis i JSON bez BOM-a potvrđeni. components i bbox su u qa.json. Vizuelna provera identiteta, mere i faza uz identity-size-comparison.png i contact.png.
- Milošev kadar 0 za pregled i budući uzor TURE B: art/animation-pack-04/assets/milos-idle/frames/motion/frame-0.png.
- Svi korišćeni promptovi i mreže sačuvani u sources/<klip>/attempt-<broj>/; odbijeni klip postoji samo u sources/. Skripte izvoza/provere: art/world-pack-03/export-dopuna48.py i verify-dopuna48.py. dist/, build-sprite-rig.py, sprite-rig.json, STATUS-ANIMACIJE.md i git nisu dirani.
`n- 2026-11-14 — D48B milos-run: NIJE IZVEZENO, 3 image_gen pokušaja. Identitet i odeća sačuvani, ali donji red ponavlja istu vodeću nogu: nema uverljive smene leve/desne noge u dve polovine ciklusa. Sve tri mreže, promptovi, poređenja i QA u sources/milos-run/attempt-1..3/. Bez assets/milos-run/.
`n- 2026-11-14 — D48B milos-attack: GOTOVO, 2 image_gen pokušaja. Prvi odbijen zbog prelaska mača u susedno polje. Drugi: isti Miloš, telo 380 px, 6 faza, vodoravan rez u kadru 3, ceo mač i margine očuvani; oslonac y=487. Izvezen atlas/frames/GIF/manifest/qa/poređenje u assets/milos-attack/. Petlja ne, holdLastFrame=false. Promptovi i mreže u sources/milos-attack/.
`n- 2026-11-14 — D48B milos-jump: GOTOVO, 1 image_gen pokušaj. Isti Miloš, stalna anatomska mera prema završnom stavu 380 px; čučanj, odraz, uspon, skupljena kolena na vrhu, pad, doskok. Oslonci 487/447/407/377/437/487. Šest kadrova, petlja ne, holdLastFrame=true. Svi izvozi i poređenje u assets/milos-jump/, mreža/prompt u sources/milos-jump/attempt-1/.
`n- 2026-11-14 — D48B milos-hurt: GOTOVO, 1 image_gen pokušaj. Potvrđen isti Miloš i mera 380 px, četiri jasne poze (stav, trzaj nazad, pognuta glava, povratak); oslonac y=487. Petlja ne, holdLastFrame=false. Atlas/frames/GIF/manifest/qa/poređenje u assets/milos-hurt/, izvor/prompt u sources/milos-hurt/attempt-1/.
`n- 2026-11-14 — D48B milos-jase: GOTOVO, 1 image_gen pokušaj uređivanja Miloša + uzor dorata + mera mounted-attack. Identitet jahača i dorata potvrđen; crna griva/rep, crven čaprak sa dvoglavim orlom. Ukupna uspravna silueta 365 px, mera konja prema Šarcu, kopita y=487. Osam faza koraka (bez galopa), podignuta glava i otvorena usta, leva ruka na grudima, desna uzde. Petlja da. Izvoz/poređenje u assets/milos-jase/, mreža/prompt u sources/milos-jase/attempt-1/.
`n- 2026-11-14 — D48B milos-galop: GOTOVO, 1 image_gen pokušaj. Isti Miloš i dorat, mera konja prema mounted-attack (ukupna silueta sa podignutim mačem 370 px), oslonac y=487. Osam različitih faza galopa uključuje izduženu i skupljenu fazu, Miloš nagnut napred, ceo podignut mač u ćeliji. Petlja da. Atlas/frames/GIF/manifest/qa/poređenje u assets/milos-galop/, mreža/prompt u sources/milos-galop/attempt-1/.
`n- 2026-11-14 — D48B milos-strela: NIJE IZVEZENO, 1 image_gen pokušaj, bez vraćene slike. HTTP400 moderation_blocked na izlazu, kategorije violence/self-harm, request93cd642f-10ef-426f-86d3-e2e1c26e5abe. Izvorni zahtev bez krvi/grafičkih rana; nema ponovnog pokušaja zaobilaženja filtera. Prompt i zapis odbijanja u sources/milos-strela/attempt-1/, nema assets/milos-strela/.
`n- 2026-11-14 — D48B milos-ranjen: GOTOVO, 3 image_gen pokušaja. Prvi: ruka ostala na grudima i mač prenisko; drugi: popravljena ruka, ali telo iznad linije mača. Treći prihvaćen: isti Miloš i anatomska mera prema glavi/trupu uzora, leži na leđima, dve bele strele, ruka ka vratu i nazad, mač uz telo; ležeća silueta sa strelama 160 px, oslonac tela/ogrtača y=487. Petlja da, 6 kadrova. Izvoz/poređenje u assets/milos-ranjen/; sve mreže/promptovi u sources/milos-ranjen/attempt-1..3/.
`n- 2026-11-14 — D48B milos-ustaje: GOTOVO, 2 image_gen pokušaja. Prvi odbijen zbog mača ispod oslonca tela/kolena. Drugi prihvaćen: isti Miloš bez strela, šest faza od ležanja preko oslonca na ruku i kolena do idle stava; završni stav 380 px, konstantna razmera, telo/koleno/stopala y=487. Petlja ne, holdLastFrame=true. Izvoz/poređenje u assets/milos-ustaje/, mreže/promptovi u sources/milos-ustaje/attempt-1..2/.
`n- 2026-11-15 — D48B marko-nad-vilom: NIJE IZVEZENO, 3 image_gen pokušaja. Likovi prepoznatljivi, bez udaranja/krvi, dva podizanja buzdovana. Prvi: buzdovan seče gornju ivicu izvornog polja, vila malo sitnija. Drugi i treći: buzdovan staje i Markova mera odgovara uzoru, ali vidljive čizme su oko 10–14 px iznad oslonca vile; zajednički oslonac y488 ±6 nije ispunjen. Sva tri pokušaja/promptovi/poređenja/QA u sources/marko-nad-vilom/attempt-1..3/. Nema assets/marko-nad-vilom/.


## D48B ? pregled TURE B (2026-11-15)

- Obra?eno svih deset klipova u propisanom redosledu, ugra?enim image_gen ure?ivanjem zadatih lokalnih uzora. Status je dopisan posle svakog klipa.
- Izvezeno 7 klipova / 44 kadra: milos-attack (6, 2 poku?aja), milos-jump (6, 1), milos-hurt (4, 1), milos-jase (8, 1), milos-galop (8, 1), milos-ranjen (6, 3), milos-ustaje (6, 2). Svaki ima atlas.png, manifest.json sa frame_layout, frames/motion/, preview.gif, qa.json, reference.png, contact.png i identity-size-comparison.png u art/animation-pack-04/assets/<klip>/.
- Nisu izvezeni: milos-run (3 poku?aja, ponovljena vode?a noga umesto smene), milos-strela (1 poziv, moderation_blocked bez slike), marko-nad-vilom (3 poku?aja; poslednja dva ne ispunjavaju zajedni?ki oslonac ?izama i vile). Ovi klipovi postoje samo u sources/, bez la?nih gotovih assets/ foldera.
- Ukupno 18 image_gen poziva: 17 vra?enih mre?a i 1 odbijen zahtev. Nijedan klip nije pre?ao tri poku?aja. Svi promptovi, mre?e, staged kadrovi, pore?enja i razlozi odbijanja sa?uvani su u art/animation-pack-04/sources/<klip>/attempt-<broj>/; za moderaciju su sa?uvani prompt i rejection.json.
- Vizuelno provereni identitet, mera i faze svih izvezenih klipova. Konstantna razmera kroz svaki klip; uspravni Milo? 380 px, mera dorata pore?ena sa mounted-attack. Le?e?i Milo? meren prema glavi/trupu i odrasloj anatomiji, ne rastegnut na uspravnu visinu.
- Tehni?ka provera svih 44 izvezenih kadrova: ?elije 512x512, sigurna margina najmanje 24 px, providnost, bez dodira ivice i zelenog klju?a, bbox/components u qa.json, oslonac y=487 osim namerno podignutih faza skoka. Atlas je identi?an pojedina?nim kadrovima, GIF ima ta?an broj faza, frame_layout i loop/holdLastFrame odgovaraju tabeli; JSON bez BOM-a i ASCII opisi potvr?eni.
- Petlje: milos-jase, milos-galop, milos-ranjen. Jednokratni milos-attack i milos-hurt imaju holdLastFrame=false; milos-jump i milos-ustaje imaju holdLastFrame=true.
- Prilago?ene kopije postupka ture A: art/world-pack-03/export-dopuna48b.py i verify-dopuna48b.py; vizuelna odluka se bele?i pre izvoza, neodobreni poku?aji ne mogu da se izvezu. Originalne skripte ture A nisu menjane.
- dist/, build-sprite-rig.py, sprite-rig.json, STATUS-ANIMACIJE.md, katalozi, raniji klipovi i git nisu dirani.

## Pregled D48B (Claude, 15. 11. 2026, 00:40)
- Prihvaćeni svi izvezeni: `milos-attack`, `milos-jump`, `milos-hurt`, `milos-jase`, `milos-galop`, `milos-ranjen`, `milos-ustaje` (lik, mera i oslonac tačni; ranjen sa dve strele i ustajanje bez njih kao u pesmi).
- `marko-nad-vilom` pokušaj 3 i `milos-run` pokušaj 3 izvezao sam (`export-dopuna48-claude.py`): čizme 10–14 px iznad linije su u igri ~4 px; trk bez čiste smene nogu u drugoj polovini se u meri igre čita kao trk. Novi kredit nije potrošen.
- `milos-strela` (pogođen na konju) nije ponovo tražen: moderacija ga odbija; u igri strele lete kodom, Miloš pada (`milos-hurt`) pa leži (`milos-ranjen`).

## D49 — Mapa putovanja (2026-11-15)

- Izvezen treći od ukupno **3 ugrađena image_gen pokušaja**, svi kao uređivanje `art/world-pack-03/uzori-d49/mapa-raspored.png`; drugi je dodatno koristio prvi rezultat samo kao uzor slikanja. Nema daljih pokušaja. **Nije u potpunosti ispunjen strogi brief: geometrijska provera nije prošla svuda do ~25 px.**
- Izvoz: `dist/assets/world/mapa-putovanja.webp` (2048×1280, WebP quality=86) i `art/world-pack-03/uzori-d49/mapa-putovanja.png` (2048×1280, PNG). Alat je vratio 1586×992; izabrani rezultat je za izvoz proporcionalno prilagođen zahtevanoj veličini pomoću Lanczos resamplinga, bez naknadnog precrtavanja sadržaja.
- Pre izvoza pregledan stvarni preklop 50% rezultata + 50% uzora: `art/world-pack-03/uzori-d49/provera-preklop.png`. Većina rečnih tokova i jezera dobro prati uzor, ali severna reka odstupa lokalno oko 25–35 px, a obale i planinske grupe nisu svuda identične. Naselja oko (963,644) i (1057,657) imaju pomerene centre približno 35–55 px, pojedina druga naselja oko 25–40 px; bliski parovi nisu savršeno razdvojeni/centrirani. To su vizuelne procene sa preklopa, ne automatski izmerena maksimalna greška. Ne označavati kao potpuno prihvaćeno po preciznosti.
- Vizuelno pregledana cela mapa: bez uočenih slova, brojeva, imena i natpisa; nema crvenih tačaka u konačnoj mapi (crvene tačke postoje samo u provera-preklop.png kao deo originalnog uzora). Pergament, pleter, rozete, planine, šume, galija, aždaja i ruža vetrova sa dvoglavim orlom prisutni. Sličice su sitnije nego u prva dva pokušaja; okvir i deo pejzaža lokalno se dodiruju.
- Uzor i brief imaju neslaganje: centri (791,49) i (1015,1233) nisu 70 px od ivice; desni centar (1978,784) je tačno 70 px od ivice. Prednost je data rasporedu uzora, uz zahtev da okvir ustupi prostor naseljima. Ni ovaj detalj nije svuda savršen u generisanom rezultatu.
- Završni prompt: `art/world-pack-03/uzori-d49/d49-prompt.txt`. Izvorni rezultat trećeg pokušaja: `C:/Users/PC/.codex/generated_images/01a1dc4e-a15a-7fa0-b951-9d9ea8e13b39/exec-40aecb70-7500-464c-ad86-923c350aad12.png`. Korišćen ugrađeni image_gen, bez CLI/API zamene. Nijedan drugi fajl u dist/ niti git nije diran.
