# D54 - Milos Obilic, igrivi junak

Ugradjeni image_gen, uredjivanje uzora uzori-d54/milos-idle-kadar0.png. Najvise tri pokusaja po klipu. Radni promptovi, mreze i pregledi su u sources/<klip>/attempt-N/.

- D54 | milos-niz-2 | IZVEZENO | 1 pokusaj | 6 kadrova; identitet i visina 380px provereni; komponente 1/1/1/1/1/1; zeleno 0; oslonac y487; puni mac, rez u kadru 3, povratak u stav.
- D54 | milos-niz-3 | IZVEZENO | 2 pokusaja | Prvi odbacen: vrh maca prelazi polje, hvat nejasan. Drugi: pun mac u celiji, obe ruke na balcku, ubod u kadru 3; 6 kadrova, komponente po 1, zeleno 0, y487, visina 380px.
- D54 | milos-tezak | IZVEZENO | 2 pokusaja | Prvi odbacen: kadar 1 nije iznad glave. Drugi: 1-2 mac visoko iza glave, 3 rez do zemlje sa savijenim kolenima; 6 kadrova, po 1 komponenta, zeleno 0, y487, ista visina.
- D54 | milos-vazduh | IZVEZENO | 1 pokusaj | 5 kadrova, kolena podvijena; mac od gore ka dole; stopala y417 (71px iznad osnovice), fiksno vodoravno sidro. Identitet i anatomska mera provereni; silueta 300px zbog podvijenih nogu; po 1 komponenta, zeleno 0.
- D54 | milos-blok | IZVEZENO | 1 pokusaj | 6 kadrova; dizanje 0-2, vodoravni blok i disanje 3-5, leva ruka pridrzava secivo; holdLastFrame=true, loop=false. Identitet/380px provereni, po 1 komponenta, zeleno 0, y487.
- D54 | milos-cuci | IZVEZENO | 2 pokusaja | Prvi odbacen: cucanj previsok. Drugi: glava u 3-5 na y235/235/244, nize 33-36% visine; zadrzan nizak cucanj; holdLastFrame=true. Identitet/380px provereni, po 1 komponenta, zeleno 0, y487.
- D54 | milos-kotrlja | IZVEZENO | 1 pokusaj | Pun prevrat preko ramena, ogrtac umotan, mac uz telo, povratak u stav u 5; 6 kadrova. Uklonjena izolovana mrvica ruba kose od 18px; po 1 komponenta, zeleno 0, y487, identitet/visina provereni.
- D54 | milos-penje | NIJE IZVEZENO | 3 pokusaja | Sva tri ponavljaju istu podignutu ruku i nogu umesto smene suprotnih udova; treci je i previse frontalno prikazan. Mreze, promptovi, qa, poredjenja i razlozi u sources/milos-penje/attempt-1..3; assets/milos-penje nije napravljen. Limit dostignut, bez cetvrtog pokusaja.
- D54 milos-penje: Claude je posle pregleda izvezao pokušaj 3 (export-dopuna54-claude.py): ruke se smenjuju više nego u Markovom marko-climb, sa kojim igra penje od DOPUNA-4; u meri igre se čita kao penjanje.
- D54 | milos-pije | IZVEZENO | 1 pokusaj | Drvena cuturica levom rukom, pije u 2-3, brise brk u 4, vraca za pojas u 5; mac desnom nadole sve vreme. Identitet/380px provereni, po 1 komponenta, zeleno 0, y487.
- D54 | milos-smrt | NIJE IZVEZENO | 3 pokusaja | Prvi: mac ispod tela i cucanj umesto oba kolena. Drugi: mac preko grudi. Treci: mac pored tela i pad ispravni, ali stvarni oslonac tela/ogrtaca u kadrovima 2-3 je y479/480, izvan y488 +/-6; bbox y487 meri mac i nije dovoljan. Kadrovi 4-5 imaju telo na y483. assets/milos-smrt nije napravljen; svi radni fajlovi i review.json sacuvani.
- D54 milos-smrt: Claude je posle pregleda izvezao pokušaj 3 (export-dopuna54-claude.py): pad je ispravan, telo leži 5–9 px iznad linije ćelije jer mač ispod njega dodiruje liniju (u igri 2–3 px).

## Zavrsni pregled D54

- Obradjeno svih 10 klipova redom, ukupno 17 poziva ugradjenom image_gen kao uredjivanje milos-idle-kadar0.png. Nije bilo vise od 3 pokusaja po klipu.
- Moji odobreni izvozi: 8 klipova / 47 kadrova: milos-niz-2 (1), milos-niz-3 (2), milos-tezak (2), milos-vazduh (1), milos-blok (1), milos-cuci (2), milos-kotrlja (1), milos-pije (1). Broj u zagradi je broj pokusaja.
- Moji odbijeni klipovi: milos-penje (3; nema smene suprotnih udova) i milos-smrt (3; stvarni oslonac tela y479/480 u kadrovima 2-3, izvan tolerancije). Nisu izvezeni mojom skriptom; odbijanja ostaju u review.json.
- Tokom rada druga sesija je izvezla ova dva odbijena pokusaja u assets/ i upisala acceptedBy: Claude review 2026-11-15. Njeni izvozi i beleske nisu menjani. Zato sada fizicki postoji svih 10 assets foldera / 61 kadar, ali samo 8 klipova / 47 kadrova prolazi moje stroge D54 provere. Ta dva spoljna izvoza nisu potvrda usaglasenosti sa prvobitnim pravilima; nedostaju im identity-size-comparison.png, reference.png i puna QA polja (components, greenPixels, supportY i odobrenja).
- python art/world-pack-03/verify-dopuna54.py: PASS za svih mojih 8 izvoza; 2 EXTERNAL EXPORT, odvojeno navedena bez sertifikovanja. Provereni alpha, broj kadrova, jedna komponenta, nula zelenih piksela, margine 24px, oslonac, podudaranje atlasa/kadrova, GIF, frame_layout, loop/hold, JSON bez BOM-a i ASCII opisi.
- Svaki od mojih 8 izvoza ima atlas.png, manifest.json, frames/motion/frame-N.png, preview.gif, qa.json i identity-size-comparison.png. Promptovi i originalne zelene mreze ostaju u art/animation-pack-04/sources/<klip>/attempt-N/.
- dist/, build-sprite-rig.py, sprite-rig.json, drugi STATUS fajlovi, D55/D56 klipovi i git nisu dirani ovom sesijom.
