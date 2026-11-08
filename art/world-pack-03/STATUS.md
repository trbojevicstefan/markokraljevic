# Paket 03 — napredak

> AKTUELNO: prioriteti 1 i 2 gotovi; prioritet 3 delimično; nastavak blokiran limitom ugrađenog generatora. Obnova prema alatu: 8.11.2026. oko 22:01, Beograd. Potpun spisak je na kraju ovog fajla.

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
