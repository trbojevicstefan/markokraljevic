# Paket 03 — napredak

> AKTUELNO: 8 Markovih klipova 7d GOTOVO. HITNO se radi DOPUNA-4 launch, redom sword → shield → archer → akindzija → kopljanik → palikuca → pas → tufekdzija → oklopnik. Reakcije 7d i kapije čekaju.

## Prioritet 1 — u toku
Generišu se predmeti, 12 čuda, lestve, stražarnica i četiri ponovljiva zida. Izvorne slike ostaju u ignorisanom `sources/`. Završene slike i katalog biće objavljeni u ovom folderu po proveri dimenzija i spojeva.

Odluke: lestve se tehnički slažu od nacrtanog segmenta na korak 128 px; zidovi se po potrebi retuširaju preko spojeva. Novi likovi kasnije dobijaju odobrene reference u `animation-pack-04/assets/<lik>/base-source.png`. Postojeći fajlovi igre i slike se ne menjaju.

Prioriteti 2–5: čekaju red.

## Dopuna prioriteta 1
Spremno je 26 od 27 elemenata (sve osim stražarnice), plus cuda-preview.png i razbi-preview.png. Katalog je osvežen. Lestve imaju prečke na 128 px i prolaze vertikalni spoj; sva četiri zida prolaze horizontalni i vertikalni spoj (0/255). Stražarnica se dorađuje zbog tamnih zadnjih nogu; grupa još nije označena kao gotova.

## Prioritet 1 — GOTOVO
Svih 27 elemenata je spremno u art/world-pack-03/, uz catalog.json, cuda-preview.png i razbi-preview.png. Stražarnica ima četiri cele noge; deckY=341, deckX0=270, deckX1=684 (ravni prednji deo poda). Lestve: 256×1024, stranice x=56/200, prečke 64+128n; vertikalni spoj 0/255. Zidovi: 512×512 RGBA, neprovidni, oba spoja 0/255. Neuspele stavke: nema.

## Prioritet 2 — u toku
Počinje generisanje devet klipova za penjanje, bacanje i skokove.

## Prioritet 2 — GOTOVO
Devet klipova / 56 kadrova je spremno u art/animation-pack-04/assets/: marko-climb (8), marko-wallslide (4), marko-throw (8), sword-jump, shield-jump, archer-jump, palikuca-jump, oklopnik-jump i archer-shoot-down (po 6). Svaki ima atlas.png, manifest.json, frames/, preview.gif i qa.json. Penjanje je dorađeno radi smene ruku; topuz je u bacanju samo u kadrovima 1–4. Stopala su na y=487; preview.png poredi nove klipove sa starim likovima. Katalog sveta uključuje atlas i kadrove. Neuspele stavke: nema.

## Prioritet 3 — u toku
Počinje dnevni ambijent Oranje drumova, tlo, predmeti i dva klipa volova.

## AKTUELNO — BLOKIRANO LIMITOM GENERATORA
Prioriteti 1 i 2 su gotovi. Prioritet 3 je delimično gotov. Prioriteti 4 i 5 nisu generisani. Ugrađeni Imagegen je vratio usage_limit_reached / HTTP 429; nije korišćen drugi generator niti API. Alat navodi obnovu 8. novembra 2026. oko 22:01 po Beogradu (22:00:49 CET). Ne tvrdimo da su planirani fajlovi nacrtani.

### Prioritet 3 — isporučeno
- Pet dnevnih pozadina: oranje-sky (1774×887), oranje-far/mid/near/vista (2172×724), sa horizontalnim spojem 0/255.
- tlo-oranje (1024×384, walkY=64), tlo-oranje-kraj (192×384), oba testa spoja 0/255; oranje-tlo-preview.png prikazuje tri ponavljanja.
- prop-plast-sena, prop-kola-seno i prop-medjas. Međaš je nova obrađena kopija ranije generisanog prop-kamen-putokaz iz paketa 01; original nije menjan. Stari šator nije iskorišćen jer ima krst i ne odgovara traženom osmanskom šatoru.
- Referenca volova, pluga i orača: art/animation-pack-04/assets/volovi/base-source.png. Ovo je referenca, NIJE gotova animacija.
Ukupno: 10 od 15 elemenata sveta ove grupe.

### Prioritet 3 — nije uspelo / nedostaje
prop-turski-sator (odbijen limitom), prop-kruska, prop-krst-raskrsce, cilj-tovar-blaga, plug-slomljen. Volovi-plug i volovi-beg (po 8 kadrova, 1024×512) odbijeni su limitom. Nisu napravljeni lažni atlasi ili statične zamene.

### Prioritet 4 — nije generisano zbog limita
Nedostaju odobrene baze kopljanik, pas, tufekdzija i njihovih 17 klipova / 108 kadrova. Tačni opisi su pripremljeni u animation-pack-04/base-requests.json i plan-g4.json. To su zahtevi, ne gotove slike.

### Prioritet 5 — nije generisano zbog limita
Nedostaje 10 noćnih/olujnih pozadina Oranje i marko-kick (6 kadrova). Zahtevi su u world-pack-03/plan-g5.json i animation-pack-04/plan-g5.json.

### Provere i odluke
DELIVERY.json: 37 gotovih elemenata sveta, 9 gotovih klipova / 56 kadrova, 116 katalogizovanih PNG slika (uključujući kadrove, reference i preglede). Proverene su dimenzije, svi postojeći fajlovi, horizontalni i vertikalni spojevi zidova, ponavljanje lestvi na 128 px, deck podaci stražarnice, broj kadrova, ćelije 512×512, stopala y=487 i broj GIF kadrova.
Alfa Musine sablje je ispravljena iz originalnog izvora (isti naziv cudo-musina-sablja.png); ako je već preuzeta ranija verzija, treba obnoviti tu novu kopiju i cuda-preview.png. Ostale već isporučene slike nisu ponovo prepisivane. Stari paketi nisu menjani. Sirovi izvori oba nova paketa su ignorisani za git.

Nastavak ide redom: prvo pet nedostajućih predmeta i oba klipa volova iz prioriteta 3, zatim prioritet 4, pa prioritet 5. Katalog sadrži samo zaista postojeće slike. Za uputstvo vidi oba README.md.


## Ponovni nastavak — limit je i dalje aktivan
Ponovo je zatražen prop-turski-sator ugrađenim generatorom. Zahtev je ponovo odbijen sa usage_limit_reached (HTTP 429); servis i dalje navodi 8.11.2026. 22:00:49 CET kao obnovu. Nove slike nisu nastale.
Dovršena je tehnička priprema za nastavak: animation-pack-04/prepare-actor-bases.py izveze buduće odobrene baze na traženu veličinu i stopala y=487; audit-delivery.py sada proverava i pravougaone ćelije 1024×512 i računa nedovršene grupe dinamički. Poređenje animacija više neće smanjivati široke klipove volova na pola veličine. Svi postojeći isporučeni PNG-ovi ostali su netaknuti.
Aktuelno stanje je nepromenjeno: 37 elemenata sveta, 9 klipova / 56 kadrova. Prve dve grupe gotove; grupa 3 delimično; grupe 4 i 5 čekaju obnovu limita. DELIVERY.json ponovo je proveren i osvežen.


## 8.11.2026 — nastavak posle obnove / Prioritet 3 GOTOVO
Generator je ponovo dostupan posle 22:00 CET. Dodati su prop-turski-sator, prop-kruska, prop-krst-raskrsce, cilj-tovar-blaga i plug-slomljen u world-pack-03/. Prop-medjas je već bio gotov i nije prepisan. Tovar blaga je ispravljen: samo samar i tri kovčega, bez konja.
Volovi-plug i volovi-beg su gotovi u animation-pack-04/assets/, svaki 8 kadrova, ćelije 1024×512, atlas, manifest, pojedinačni kadrovi i preview.gif. Izvoz je prošao sprite-gen extract → compose-atlas → compose-gif. Vizuelno provereni izvori i atlasi; automatski provereni broj kadrova, dimenzije i donja linija kopita y=487.
Ukupno sada 42 elementa sveta, 11 klipova / 72 kadra, 141 katalogizovan PNG. Tlo i dalje čeka zatraženu vizuelnu ispravku — prethodna tvrdnja walkY=64 nije dovoljna jer je izvor sadržao zgrade. Sledeće: DOPUNA A pa prioriteti 4, 5, 6 i 7. Neuspele stavke ove grupe: nema. Kod igre i dist/ nisu menjani.

## DOPUNA A — GOTOVO: tlo ispravljeno
Nova nacrtana tekstura zamenjuje samo eksplicitno tražene tlo-oranje.png (1024×384) i tlo-oranje-kraj.png (192×384). Pravi ravni hodni rub je y=64; svi pikseli iznad su providni. Nema kuća, zidova ni ograda. Ispod je zemlja s korenjem, dno skoro crno. Izostavljeni su opcioni buseni radi potpuno čistog gornjeg ruba. Horizontalni i pomereni spoj su 0/255; leva ivica završnog komada odgovara desnoj ivici trake. Osveženi catalog.json i oranje-tlo-preview.png. Prethodni izvor sa scenografijom sačuvan je samo u ignorisanom sources/. Sledeći prioritet: 4, novi protivnici.

## Prioritet 4 — završna provera
Reference kopljanika, psa i tufekdžije su nacrtane i izvezene u animation-pack-04/assets/<lik>/base-source.png. Svih 17 traženih klipova je nacrtano i izvezeno. Grupa još nije zatvorena: trk kopljanika je već precrtan radi smene nogu; trk tufekdžije se sada na isti način dorađuje. Ne preuzimati tufekdzija-run dok sledeći upis ne označi grupu kao gotovu. Pas je samostalan, bez ljudske figure. Nisu menjane slike ranijih paketa, osim izričito zatražena dva komada tla.

## Prioritet 4 — GOTOVO
Kopljanik: idle 6, run 8, attack 8, hurt 4, death 8, jump 6. Pas: idle 4, run 8, attack 6, hurt 4, death 6. Tufekdžija: idle 6, run 8, shoot 8, hurt 4, death 8, jump 6. Ukupno 17 klipova / 108 kadrova u animation-pack-04/assets/. Svaki ima atlas, manifest, frames/, preview.gif i qa.json. Sva tri lika imaju base-source.png; pas je visok 192 px (oko 45% ratnika). Trkovi kopljanika i tufekdžije su ponovo nacrtani radi različitih faza nogu; preuzeti završne atlase oba klipa. Pucanj: kontakt/bljesak kadar 4. Pregledane sve sekvence na kontaktnim listovima; provera broja kadrova, ćelija 512×512, donje linije y=487 i GIF broja kadrova je prošla. Ukupno 28 klipova / 180 kadrova sa ranijim grupama, 286 katalogizovanih PNG. Neuspele stavke: nema. Sledeći prioritet 5: noć/oluja i marko-kick.


## Prioritet 5 — GOTOVO
Svih deset pozadina Oranje je spremno: sky/far/mid/near/vista, svaka night i storm varijanta. Sky je 1774×887, ostale 2172×724; far/mid/near zadržavaju providnost, sky/vista su neprovidne. Horizontalni spojevi su provereni (0/255). Pregled: oranje-varijante-preview.png. Dnevni originali nisu menjani.
Marko-kick: 6 kadrova, ćelije 512×512, jednom, kontakt kadar 4, topuz za pojasom. Gotov atlas/manifest/frames/preview.gif u animation-pack-04/assets/marko-kick/. Ovaj klip iz DOPUNA se ne radi drugi put. Provera kataloga, kadrova, stopala i GIF-a je prošla. Ukupno 52 elementa sveta, 29 klipova / 186 kadrova, 305 PNG u katalogu. Neuspele stavke: nema. Sledeći prioritet 6.


## Prioritet 6 — GOTOVO
Dodati cudo-sokolovo-pero i cudo-prelomljeno-koplje (512×512, providni), osvežen cuda-preview.png. Marko-slide, marko-hang i sword-climb: po 6 kadrova, 512×512, puni izvoz u animation-pack-04/assets/. Slide je jednom; hang i climb su petlje. Penjanje janičara je precrtano radi hvatanja prečki i smene ruku; lestve nisu nacrtane. Hang/climb imaju dodatni prostor za podignutu ruku, do 478 px visine sadržaja, isti donji oslonac y=487.
Za integraciju visenja: manifest marko-hang ima gripAnchors po kadru. Tu tačku vezati za stalnu tačku ivice platforme, da šaka ostane zakačena dok se telo njiše. Marko-kick već je u grupi 5 i nije dupliran. Pregledani kontaktni listovi, dimenzije i svi kadrovi; provere su prošle. Ukupno 54 elementa sveta, 32 klipa / 204 kadra, 331 PNG u katalogu. Neuspele stavke: nema. Sledeći prioritet 7a.


## Prioritet 7a — GOTOVO
Svih deset novih predmeta za razbijanje: razbi-kosnica, razbi-plast, razbi-tikve, razbi-stena-napukla, razbi-panj, razbi-crkveni-sanduk, razbi-bure-baruta, razbi-tobolac, razbi-santa, razbi-vagon. PNG 1024×1024, sadržaj do 400 px visine, providna pozadina, osnova pri dnu. Bure baruta ima fitilj i pečat s polumesecom; crkveni sanduk knjige i krst. Pregledano u osveženom razbi-preview.png. Katalog i README su ažurirani: 64 elementa sveta, 32 klipa / 204 kadra, 341 PNG. Neuspele stavke: nema. Sledeći prioritet 7b, predmeti za skupljanje.


## Prioritet 7b — GOTOVO
Trinaest predmeta za skupljanje je spremno: pet medaljona sa ćiriličnim М, А, Р, К, О; zapis, četvrtina zlatnog srca, ključ s crvenom vrpcom, tri kugle moći (oganj/grom/vila), lekovita trava i čutura. PNG 512×512, providni, predmeti pri dnu. Medaljoni dele isti zlatno-tirkizni okvir; vizuelno provereni znakovi i prikaz na 40 px. Deo srca je precrtan iz medaljona u zaseban gornji levi fragment srca sa ravnim unutrašnjim rezovima — koristiti završni predmet-srce-deo.png, raniji nacrt nije isporuka. Pregled: collectibles-preview.png, uključuje i umanjene 40 px uzorke. Ukupno 77 elemenata sveta, 32 klipa / 204 kadra, 355 PNG u katalogu. Neuspele stavke: nema. Sledeći prioritet 7c, delovi zagonetki.


## Prioritet 7c — GOTOVO
Svih dvanaest elemenata zagonetki je spremno: ploca-pritisak / ploca-pritisak-stisnuta, teret-sanduk, pod-napukao, zid-napukao, lift-platforma, kotur, splav, kolje, siljci, vrata-zakljucana / vrata-otkljucana. Dimenzije odgovaraju tabeli iz DOPUNA-2. Usklađena pritisna ploča ima istu širinu/osnovu, a utisnuta varijanta je niža. Otvor vrata i prostor između pukotina su zaista providni. Kolje i šiljci imaju horizontalni spoj 0/255; vizuelno proverena tri ponavljanja u prepreke-spoj-preview.png. Pregled svih delova: puzzles-preview.png. Ispravljeni su i podaci dimenzija preglednih slika u katalogu; same stare slike nisu menjane.
Ukupno 89 elemenata sveta, 32 klipa / 204 kadra, 369 PNG u katalogu. Sve tražene slike sveta iz prioriteta 1–7c su gotove. Neuspele stavke: nema. Ostaje 7d, dvanaest klipova kombinacija i reakcija.


## HITNO DOPUNA-3 — preuzeto pre 7d
Tačka povratka je tačno početak 7d: nijedan od poslednjih dvanaest klipova još nije generisan. Prioriteti 1–6 i 7a–7c su gotovi. Sada se prvo dodaje devet NOVIH slika kapija/riznice iz DOPUNA-3; nijedna ranija kapija ili druga završena slika neće biti obrisana ili precrtana. Za prolazne kapije bira se bočni uzdužni presek kule/tunela: put ide sleva nadesno; rešetka se diže vertikalno. Ulaz riznice ostaje spreda i ima mali osvetljen ulaz. Posle ove hitne grupe nastavlja se 7d.


## Promena reda od Claude-a — 7d sada ima prednost
Kapije iz DOPUNA-3 su ODLOŽENE do završetka animacija. Sve njihove dosadašnje slike/probe ostaju sačuvane u sources/: prolaz-kamen-otvoren.png (frontalna proba, nije isporuka), prolaz-kamen-otvoren-profile-v2.png (bočni presek, još zahteva korekciju prolaza), ulaz-riznica.png i resetka.png. Već pokrenuta korekcija profila v3 biće sačuvana kad stigne; novi zahtevi za kapije se do tada ne pokreću.
Novi red rada: prvo osam Markovih klipova 7d (combo-4, air-1, air-2, uppercut, dash-strike, charge-hold, push, lever), zatim četiri reakcije protivnika 7d, pa nastavak devet kapija/riznice iz DOPUNA-3. Ostali prioriteti 1–6 i 7a–7c već su završeni. Markovih prvih osam klipova je sada u generisanju.


## Prioritet 7d — SVI MARKOVI KLIPOVI GOTOVI
Osam klipova / 46 kadrova je završeno u animation-pack-04/assets/: marko-combo-4 (8), marko-air-1 (5), marko-air-2 (5), marko-uppercut (6), marko-dash-strike (6), marko-charge-hold (4, petlja), marko-push (6, petlja), marko-lever (6). Svaki ima atlas.png, manifest.json, frames/, preview.gif i qa.json. Marko-push i lever imaju topuz za pojasom, bez nacrtanog sanduka/poluge, da ih igra crta zasebno. U zamahu je dodat prostor za topuz uz poravnanje sa starom Markovom pozom. Cela glava topuza u aperkatu je sačuvana pravilnom podelom dva reda izvora; nije odsečena niti prešla u susedni kadar. Charge-hold je izvezen uz čišćenje palete, bez zelenih ivica.
Pregledano svih 46 kadrova uz staru pozu, provereni broj kadrova, GIF-ovi, ćelije 512×512 i donji oslonac y=487. Novi zbirni pregled je animation-pack-04/preview-group-7.png; prethodni preview.png je ostao netaknut. Preservation-check proverio je 401 raniju sliku i sve su bit-identične. Ukupno je sada 40 klipova / 250 kadrova, 91 finalni element sveta (uključuje već izvezenu rešetku i zatvorenu riznicu), 434 PNG u katalogu. Neuspele Markove stavke: nema.
Sledeće: shield-guardbreak, oklopnik-armorbreak, akindzija-backstep, palikuca-burn. Zatim kapije DOPUNA-3. Njihova profilna v3 proba je sačuvana u sources/prolaz-kamen-otvoren-profile-v3.png; nije završena kapija niti ubačena u katalog jer još čekaju tačne mere prolaza.


## HITNO DOPUNA-4 — launch ima prednost
Osam Markovih klipova iz 7d je gotovo. Sada, pre svega ostalog, ide redom sword-launch, shield-launch, archer-launch, akindzija-launch, kopljanik-launch, palikuca-launch, pas-launch, tufekdzija-launch, oklopnik-launch. Svaki je nov klip sa 6 kadrova, jednom, 512×512: udar odozdo, let, prevrat, glava dole, pad, odskok na leđima. Posle svakog će biti upisano stanje. Sword-launch je pokrenut odmah po čitanju DOPUNA-4.
Četiri reakcije 7d već su bile poslate generatoru pre nove poruke; njihovi rezultati će biti sačuvani, a obrada/predaja dolazi posle launch klipova. Kapije i dalje čekaju; sve njihove probe i dva postojeća izvoza ostaju netaknuti.


## DOPUNA-4 — 1/9: sword-launch GOTOVO
Nacrtan i izvezen sword-launch: 6 novih kadrova, jednom, 512×512, atlas/manifest/frames/preview.gif u animation-pack-04/assets/sword-launch/. Proverene poze: udar odozdo, let, vrh leta, potpuno naopako glava dole u kadru 4, pad i odskok na leđima u kadru 6. Nije ponovljena animacija smrti. Proveren prikaz uz sword-idle, alfa, broj kadrova i GIF. Manifest ima airborneFrames 0–4 i groundImpactFrame=5 (indeksi od nule). Sledeći: shield-launch.
Četiri ranije započete reakcije 7d (shield-guardbreak, oklopnik-armorbreak, akindzija-backstep, palikuca-burn) su nacrtane i trajno sačuvane u animation-pack-04/sources/<klip>/grid.png, ali još nisu izvezene/predate: launch klipovi imaju prednost.

## DOPUNA-4 — 2/9: shield-launch GOTOVO
Šest novih kadrova štitonoše je završeno u animation-pack-04/assets/shield-launch/: atlas, manifest, frames/, preview.gif, qa. Provereni odvajanje nogu od tla, prevrat/glava dole (4), pad i odskok na leđima (6); štit i sablja ostaju vidljivi u svim pozama, bez odsečenih delova. Proverena veličina uz shield-idle, ćelije 512×512, broj kadrova, alfa i GIF. STATUS, katalog i README osveženi. Launch napredak: sword i shield gotovi, sledeći archer-launch. Ukupno 42 klipa / 262 kadra.

## DOPUNA-5 - 1/8: marko-idle-2 GOTOVO
Osam nacrtanih kadrova disanja, petlja 12 FPS, 512x512; atlas, manifest, frames, preview.gif i qa.json u animation-pack-04/assets/marko-idle-2/. Proveren desni profil, svi oslonci y=487, 8 GIF kadrova, visina prema aktuelnom marko-idle 383 px. Postojece slike sacuvane. Sledeci: marko-crouch-walk.

## DOPUNA-5 - 2/8: marko-crouch-walk GOTOVO
Osam kadrova hoda u cucnju, petlja 12 FPS, atlas/manifest/frames/preview.gif/qa.json u animation-pack-04/assets/marko-crouch-walk/. Niska poza 230 px prema stajacih 383 px, oslonac y=487; provereni svi kadrovi i GIF. Sledeci: marko-block-walk.

## DOPUNA-5 - 3/8: marko-block-walk IZVEZEN
Osam kadrova hoda sa podignutim topuzom, petlja 12 FPS; atlas/manifest/frames/preview.gif/qa.json u animation-pack-04/assets/marko-block-walk/. Proverene celije 512x512, oslonac y=487, 8 GIF kadrova. Vizuelno: druga polovina koraka je slicna prvoj; za potpuno prirodan naizmenicni hod potrebna je dodatna provera/poliranje daleke noge. Sledeci: marko-charge-walk.

## DOPUNA-5 - 4/8: marko-charge-walk IZVEZEN
Osam kadrova sa topuzom iza ramena, petlja 12 FPS, atlas/manifest/frames/preview.gif/qa.json u animation-pack-04/assets/marko-charge-walk/. Proveren oslonac y=487, alfa, 8 kadrova GIF-a. Izvoz je spreman za pregled, ali faze daleke noge u drugoj polovini ciklusa treba dodatno doraditi kao kod block-walk. Sledeci: marko-dizzy.

## DOPUNA-5 - 5/8: marko-dizzy GOTOVO
Osam faza teturanja, topuz na tlu, glava udesno; atlas/manifest/frames/preview.gif/qa.json u animation-pack-04/assets/marko-dizzy/. Prva proba ostaje grid-draft.png; nova verzija ispravlja smer lica. Linije izmedju celija uklonjene izdvajanjem unutrasnjosti slotova, izvor sacuvan. Provereni alfa, celije 512x512, y=487 i GIF. Sledeci: marko-turn.

## DOPUNA-5 - 6/8: marko-turn GOTOVO
Cetiri faze: stajanje, kocenje, ukrstanje nogu i spreman stav. Atlas/manifest/frames/preview.gif/qa.json u animation-pack-04/assets/marko-turn/. Jednokratno, 16 FPS; glava udesno, igra ogleda po zavrsetku. Proverene 512x512 celije, y=487, GIF. Sledeci: marko-run-start.

## DOPUNA-5 - 7/8: marko-run-start GOTOVO
Cetiri faze pokretanja trka, 16 FPS jednom. Atlas/manifest/frames/preview.gif/qa.json u animation-pack-04/assets/marko-run-start/. Provereni broj kadrova, alfa, celije 512x512, oslonac y=487 i GIF. Sledeci: marko-land.

## DOPUNA-5 - 8/8: marko-land GOTOVO
Cetiri faze doskoka: kontakt, sabijanje, podizanje i stajanje; 16 FPS jednom. Atlas/manifest/frames/preview.gif/qa.json u animation-pack-04/assets/marko-land/. Izvoz cuva relativne visine originalnih poza, da cucanj ne postane rastegnuta figura. Provereni 512x512, y=487, GIF. Svih 8 trazenih klipova je izvezeno (52 kadra); block-walk i charge-walk imaju zabelezenu potrebu za dodatnim poliranjem koraka. Nastavak launch klipova, zatim reakcije 7d, kapije.

## akindzija-launch - GOTOVO
6 kadrova; atlas/manifest/frames/preview.gif/qa.json u animation-pack-04/assets/akindzija-launch/. Proverene celije 512x512, oslonac y=487 i broj GIF kadrova. Launch 4/9. Proveren prevrat, glava dole u cetvrtom kadru i odskok na ledjima. Sledeci kopljanik-launch.

## kopljanik-launch - GOTOVO
6 kadrova; atlas/manifest/frames/preview.gif/qa.json u animation-pack-04/assets/kopljanik-launch/. Proverene celije 512x512, oslonac y=487 i broj GIF kadrova. Launch 5/9. Proveren potpuni prevrat i koplje unutar kadra. Sledeci palikuca-launch.

## palikuca-launch - GOTOVO
6 kadrova; atlas/manifest/frames/preview.gif/qa.json u animation-pack-04/assets/palikuca-launch/. Proverene celije 512x512, oslonac y=487 i broj GIF kadrova. Launch 6/9. Provereni prevrat i baklja. Sledeci pas-launch.

## pas-launch - GOTOVO
6 kadrova; atlas/manifest/frames/preview.gif/qa.json u animation-pack-04/assets/pas-launch/. Proverene celije 512x512, oslonac y=487 i broj GIF kadrova. Launch 7/9. Ispravljen zavrsni pad na ledja, uklonjeni dodatni simboli; originalna proba sacuvana. Sledeci tufekdzija-launch.

## tufekdzija-launch - GOTOVO
6 kadrova; atlas/manifest/frames/preview.gif/qa.json u animation-pack-04/assets/tufekdzija-launch/. Proverene celije 512x512, oslonac y=487 i broj GIF kadrova. Launch 8/9. Proveren prevrat i puska u svim kadrovima. Sledeci oklopnik-launch.

## oklopnik-launch - GOTOVO
6 kadrova; atlas/manifest/frames/preview.gif/qa.json u animation-pack-04/assets/oklopnik-launch/. Proverene celije 512x512, oslonac y=487 i broj GIF kadrova. Launch 9/9. Svi trazeni launch klipovi izvezeni. Proveren prevrat i odskok sa sacuvanim oklopom. Sledeci izvoz reakcija 7d.

## shield-guardbreak - GOTOVO
4 kadrova; atlas/manifest/frames/preview.gif/qa.json u animation-pack-04/assets/shield-guardbreak/. Proverene celije 512x512, oslonac y=487 i broj GIF kadrova. Reakcije 7d 1/4: gard se otvara nakon udarca, stit ostaje u ruci.

## oklopnik-armorbreak - GOTOVO
4 kadrova; atlas/manifest/frames/preview.gif/qa.json u animation-pack-04/assets/oklopnik-armorbreak/. Proverene celije 512x512, oslonac y=487 i broj GIF kadrova. Reakcije 7d 2/4: udar, pucanje oklopa i zateturavanje; odvojeni delovi oklopa sacuvani.

## akindzija-backstep - GOTOVO
4 kadrova; atlas/manifest/frames/preview.gif/qa.json u animation-pack-04/assets/akindzija-backstep/. Proverene celije 512x512, oslonac y=487 i broj GIF kadrova. Reakcije 7d 3/4: odskok unazad uz desnu orijentaciju.

## palikuca-burn - GOTOVO
6 kadrova; atlas/manifest/frames/preview.gif/qa.json u animation-pack-04/assets/palikuca-burn/. Proverene celije 512x512, oslonac y=487 i broj GIF kadrova. Reakcije 7d 4/4. Svih cetiri reakcije izvezene iz ranije sacuvanih izvora. Nastavak kapije DOPUNA-3.

## DOPUNA-3 - kameni otvoreni prolaz GOTOVO
Objavljena ranije nacrtana profilna v3 proba kao prolaz-kamen-otvoren.png. Izmeren slobodan prolaz passX0=380, passX1=640, archY=600: sirina 260 i visina 424 px. Provera providnosti prolaza prosla. Postojece probe sacuvane. Sada zatvorena varijanta.
