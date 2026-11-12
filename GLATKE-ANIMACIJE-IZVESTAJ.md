# Glatke animacije: izveštaj

**Grana:** `claude/glatke-animacije-590652`. Na `main` je otišao `752c729` (svi klipovi, sa Lost Crown pokretima na kojima je grana zasnovana); nastavak `45ae041` je spojen u `realisticni-svet`, a na `main` ga šalje orkestrator.

## Ukratko

- **Tri međukadra po koraku** (1/4, 1/2, 3/4 puta) za sve animacije u igri: Marko, vojnici, Musa, šampioni, putnici, vila, ptice, vatra, koštac. Obrađeno je 319 klipova, a 291 ih koristi međukadrove. Pre je samo 11 klipova (trk i hod) imalo po jedan međukadar.
- Na slikama nema duplih slika ni razmazanih udova. Gde tok ne prati ud (veliki zamah, ud preko tela), par ne dobija međukadar i igra drži nacrtani kadar. Gde se ud izgubi usred koraka, poza se promeni jednom, bez providnosti.
- **Udarac ostaje oštar.** Priprema i kontakt drže celo svoje vreme, bez međukadra. Međukadrovi su samo u zamahu ka pripremi i u oporavku. Hitbox i tajming udarca nisu dirani (menjano je samo crtanje).
- **Proceduralni sloj:**
  - istezanje pri odskoku (i Sokolovom krilu) i sabijanje pri doskoku;
  - nagib tela u trku;
  - pretapanje od 70 ms pri promeni klipa;
  - trag topuza po luku nacrtanog zamaha, posebno za svaki udarac.

  „Smanjeno podrhtavanje i efekti“ gasi istezanje, sabijanje, nagib i pretapanje; trag ostaje samo kao bleda traka.
- **Performanse:** FPS i vreme rada po kadru su isti kao pre. Listovi se ne učitavaju pri pokretanju, nego kad ih pokret prvi put zatraži. Na nivou kvaliteta 2 učitavaju se samo međukadrovi na pola puta. List koji se 45 s ne koristi pušta se iz memorije, a preko 200 MB (64 MB na nivou 2) prvo se puštaju najduže nekorišćeni.
- `?anim=0` u adresi isključuje sve novo (samo nacrtani kadrovi), radi poređenja u istoj verziji.

## Šta da pogledaš

1. **Snimci pre i posle** (levo pre, desno posle; isti ulaz, korak po korak, 60 koraka u sekundi). Fajlovi su u `izvestaj/glatke-animacije/`; otvori ih u browseru:
   - `trk.webp` i `trk-sporo.webp` (4× sporije, vide se međukadrovi jedan po jedan);
   - `kombo.webp` i `kombo-sporo.webp` (J J J: priprema i kontakt ostaju isti, oporavak je tečan, trag topuza pre kontakta);
   - `skok.webp` (istezanje, pretapanje rise → pad);
   - `neprijatelj.webp` (sabljaš u prvom pohodu trči i zamahuje).
2. **U igri:**
   - Marko: trk, hod, kombo J J J, teški udarac K, skok i doskok sa visine, kolut, vino;
   - vojnici i šampioni: mirovanje (ranije 5 kadrova/s, sada do 20 slika/s), trk i zamah;
   - putnici, guslar, kovač, vila, orao i vatra: sada idu tečno.
3. **Poređenje u istoj igri:** dodaj `?anim=0` u adresu, pa ukloni.
4. **Merač F9 / `?fps`:** novi red `in-betweens` pokazuje koliko sprite-ova je međukadar i koliko MB listova je učitano.
5. **Podešavanja:** uključi „Smanjeno podrhtavanje i efekti“; istezanje, nagib i pretapanje treba da nestanu.

## Performanse

Mereno u Chrome-u bez prozora (headless), na istoj kartici (AMD RX 9060 XT), 1600×900. U svakom merenju je isti prolaz od 16 s: trk, kombo, skokovi, trk nazad, teški udarac i borba sa najbližim vojnikom.

**Prvo merenje (samo glavni likovi, mašina mirna; stara verzija prema novoj):**

| | nivo 0 („Visok kvalitet“) | nivo 2 („Brže“) |
|---|---|---|
| FPS pre | 44,3 / 45,5 | 59,8 / 59,7 |
| FPS posle | 43,9 / 46,2 | 59,7 / 59,8 |
| rad po kadru (JS) pre | 1,47 / 1,45 ms | 1,13 / 1,15 ms |
| rad po kadru (JS) posle | 1,40 / 1,32 ms | 1,37 / 1,37 ms |
| JS heap pre → posle | 94–96 → 95–97 MB | 94–96 → 93–97 MB |
| listovi međukadrova u memoriji pre | 61 MB (svih 11 odmah pri startu) | 61 MB |
| listovi međukadrova u memoriji posle (za 16 s igre) | 46 MB (34 lista) | 15–16 MB (18–19 listova, samo pola puta) |

**Konačno merenje (sve animacije; `?anim=0` prema novom, naizmenično, dok je mašinu opterećivala i druga grafika):**

| | nivo 0 | nivo 2 |
|---|---|---|
| FPS bez međukadrova (`?anim=0`) | 25,6 / 25,2 | 45,3 / 44,7 |
| FPS sa međukadrovima | 25,9 / 25,6 | 43,1 / 44,5 |
| rad po kadru bez → sa | 2,32 / 1,78 → 2,15 / 1,75 ms | 1,45 / 1,25 → 1,47 / 1,47 ms |
| listovi u memoriji (16 s igre) | 44–45 MB | 15–16 MB |

- Headless Chrome ne daje pun FPS ni bez međukadrova. Na nivou 0 kadrovi naizmenično traju 16,7 i 33 ms, što dolazi od samog headless prikaza, a ne od igre. Bitno je poređenje u istim uslovima.
- Razlike u FPS i radu su u granicama šuma.
- Najgori slučaj: ako bi se u roku od 45 s pustilo baš svih 319 klipova, međukadrovi bi zauzeli do 993 MB (nivo 0 i 1), odnosno 320 MB (nivo 2). Zato postoji gornja granica od 200 MB (64 MB na nivou 2) iznad koje se puštaju najduže nekorišćeni listovi.
- Preuzimanje: 584 fajla, ukupno 61,7 MB (ranije 11 fajlova, 1 MB). Ništa od toga se ne čeka pri pokretanju igre.

## Kako radi (kratko)

- `smooth-anims.py`:
  - računa optički tok (OpenCV DIS) za svaki par kadrova koje igra pokazuje jedan za drugim, uključujući sekvence mirovanja koje preskaču kadrove (lica šampiona dobijaju i sekvence vojnika);
  - kadrove prvo poravna po stopalima, pa ih iskrivi jedan ka drugom za 1/4, 1/2 i 3/4 puta;
  - par odbacuje ako se dve polovine ne slažu (greška > 0,13) ili ako međukadar ispadne providniji od nacrtanih;
  - isečene međukadrove čuva u veličini u kojoj ih igra crta, spakovane u dva lista po klipu: pola puta, i četvrtine.
- `dist/game.js`:
  - poza nosi `tw`, deo puta do sledećeg kadra, iz istog sata koji već bira kadar, pa nema kašnjenja; brojač koji crta kadar direktno prosleđuje i razlomak;
  - udarac nosi `keyAt`, fazu u kojoj počinje pogodak (ista kao u `attackActive`), da priprema i kontakt ostanu nacrtani;
  - kadrovi koje bira stanje (skok po brzini) prolaze kroz međukadrove za najviše 70 ms;
  - gde igra pomera ili uvećava svaki kadar posebno (vihor sa sabljom, spavanje i buđenje), pomeraj i veličina idu zajedno sa međukadrom.
- Kvalitet optičkog toka je dovoljan za trk, hod, mirovanje i oporavak. Za veliki zamah nije, ali se tu ionako drži nacrtani kadar. Zato nije preuzet RIFE ni drugi interpolator.

## Svesno bez međukadrova

- **`kosturi`**: nije animacija; svaki kadar je drugi kostur, po vrsti vojnika.
- **28 klipova** u kojima tok ne prati ni jedan korak, pa igra drži nacrtane kadrove (vidi napomene u tabeli):
  - Marko: `marko-attack`, `marko-charged`, `marko-counter`, `marko-jump`, `marko-roll`, `marko-roll-land`, `marko-death`, `marko-plunge`, `mounted-jump`, dva dokrajčivanja i `marko-sablja-uvis`;
  - vojnici: većina akindžijinih poteza i nekoliko pogodaka i padova;
  - ostalo: `musa-attack`, `magija-zrak` i pojedini potezi bega, čauša, bajraktara i janičarske age.

## Šta nije provereno

- FPS na pravom ekranu i na slabom uređaju (telefon, integrisana grafika). Mereno je samo u headless Chrome-u na jakoj kartici; panel browsera u aplikaciji je bio skriven i usporava crtanje.
- Igra ljudskom rukom: pokreti su snimljeni skriptom, korak po korak. Šampioni, putnici i ptice provereni su testom crtanja (svih 15 pohoda bez greške) i pregledom slika međukadrova, ne gledanjem u igri.

## Testovi

`npm run check && npm test && node animation-tests.mjs && node simulation-test.mjs` (ceo CI iz `pages.yml`) prolazi. U browserskim prolazima nije bilo JavaScript grešaka (pre, posle, „Smanjeno podrhtavanje“, `?anim=0`, nivo 2).

## Nastavak (noćni rad, grana spojena sa `realisticni-svet`)

- Spojeno `realisticni-svet` (Azačka kula); jedan sukob u `game.js` razrešen (kolo svatova + crtanje zamki kule).
- **Drugi pokušaj za parove koje tok nije pratio:** figure se prvo poravnaju po težištu (skok, juriš, pad), pa se računa samo promena poze. Spaseno je 131 par, između ostalog Markov skok (4/5), Šarac u skoku, Musin zamah i kraj koštaca. Sada **306 klipova** ima međukadrove.
- **I dalje bez međukadrova (13 klipova), zato što tok ne prati pokret ni posle poravnanja** (greška 0,14–0,49, prag 0,13): `marko-charged`, `marko-counter`, `marko-roll`, `marko-roll-land`, `marko-plunge` (telo se okreće ili je zamah prevelik), `archer-death`, `akindzija-hurt/jump/launch/charge`, `beg-unhorsed`, `bajraktar-hurt` (velika promena poze), `magija-zrak` (svetlosni efekat: međukadar bi bio dupla slika).
- **Lost Crown pokreti:** dupli skok se jače isteže; juriš u vazduhu se razvlači u pravcu kretanja, naginje i ostavlja brzinske linije; posle Vilinog traga nema pretapanja sa starog mesta, a Marko se pojavljuje blago izdužen. Sve se gasi uz „Smanjeno podrhtavanje i efekti“. Snimak: `izvestaj/glatke-animacije/lost-crown-pokreti.webp` (levo `?anim=0`, desno novo).
- **Brzina:** mašinu su opterećivale druge sesije, pa je FPS skakao i bez međukadrova (19–35). Zato je mereno vreme crtanja jednog kadra, korak po korak, naizmenično: nivo 0 medijan 23,2 i 18,0 ms bez međukadrova, 17,5 i 17,6 ms sa njima; nivo 2: 11,3 i 11,1 ms bez, 11,2 i 11,8 ms sa. Razlike su u šumu. Ceo CI prolazi, bez JavaScript grešaka u Chrome-u.

## DOPUNA-45 (Codex): naručeno, stiglo, u igri

**Naručeno** (`art/world-pack-03/DOPUNA-45.md`, Codex CLI neinteraktivno, `codex exec`):
- deo 1: 13 Markovih moći;
- deo 2: međupoze za 10 udaraca kao `<klip>-v2` (stari kadrovi na parnim mestima, nove poze između, pa tajming i hitbox ostaju isti);
- deo 3: isto za 12 klipova kojima tok ne pomaže;
- deo 4: soko, kostur, vrač, šarka i Ala.

**Stiglo:** 12 od 13 klipova dela 1: `marko-krilo`, `marko-nalet`, `marko-nalet-kraj`, `marko-trag-ostavi`, `marko-trag-povratak`, `marko-air-3`, `marko-kuka-baci`, `marko-kuka-let`, `marko-odmor`, `marko-odmor-ustaje`, `marko-klizanje`, `marko-zid-trk`. Sve je isti Marko, u meri `marko-idle-2`. U 01:51 Codex je stao jer je nalog ostao bez kredita („workspace is out of credits“). Nisu stigli `marko-launcher`, delovi 2–4 i nijedan `-v2` klip.

**U igri:**
- Sokolovo krilo, juriš u vazduhu i izlazak iz njega, Vilin trag (ostavljanje i povratak) i treći udarac u vazduhu koriste svoje crteže (`powersPose`, `marko-air-3`). Do sada su pozajmljivali tuđe poze.
- Kuka, odmor, klizanje i trk uz zid su u rig-u i imaju međukadrove, ali te pokrete u kod dodaje sesija „lc-pokreti“.
- Prihvat `-v2` je spreman: `smooth-anims.py` nacrtanu međupozu stavlja kao polovinu koraka, a četvrtine računa tokom. U igri nacrtana poza prolazi i kroz pripremu i kontakt udarca.

**Pregled u igri** (snimak korak po korak u prvom pohodu: klizanje, skok, krilo, vazdušni kombo, juriš, Vilin trag):
- Veličina se ne menja na prelazima: visina krajnjih poza je ista kao kod `marko-idle-2` i `marko-fall`, a oslonac je isti do 0,6 jedinica.
- Trup je skakao vodoravno na nekoliko prelaza, jer se sidro računa kao medijan klipa, a ogrtač raširen kao krila ili noga ispružena napred ga pomeraju. Najviše kod klizanja (55 jedinica), `air-3` (25) i krila (15). Sidro novih klipova je pomereno tako da se trup poklopi sa susednim klipovima (`ANCHOR_FIX` u `build-sprite-rig.py`).
- Klizanje (S u trku) koristi `marko-klizanje` u sredini, a početak i kraj iz `marko-slide`. Lanac koristi `marko-kuka-baci` i `marko-kuka-let`, a trk po zidu `marko-zid-trk`. Lanac i trk po zidu traže kuke i zidove iz greybox nivoa, pa ih u igri nisam video; vezani su za `p.lanac` i `p.zidotrk`.
- `marko-launcher` je alias za `marko-uppercut`, uz proceduralni sloj: skupi se pred udarac i istegne se nagore kad udari.

**Nastavak, kad se kredit dopuni:** pokrenuti `art/world-pack-03/codex-nastavak.cmd`. Codex radi od dela 2 (udarci `-v2`, pa tvrdi klipovi `-v2`, pa protivnici); `marko-launcher` crta na kraju.

## DOPUNA-46: šta Marku još treba za lanac, kuke i nove junačke udare

Naručeno je u `art/world-pack-03/DOPUNA-46.md`; Codex ga radi prvi kad se kredit obnovi.
- **Marko:** `marko-lanac-trgne`, `marko-lanac-vuce`, `marko-potres`, `marko-zvizduk` (Šarčev gaz), `marko-oko` (Vilinsko oko), `marko-zid-trk-vodoravno` (trk po zidu je vodoravan, a već stigli `marko-zid-trk` ide uz zid naviše) i `marko-launcher`.
- **Šarac:** `sarac-galop`, Šarac bez jahača za gaz. Danas klizi statična slika.
- **Ikone za traku** (fale): `ikona-trag`, `ikona-lanac`, `ikona-oko`, `ikona-potres`, `ikona-gaz`.
- **Lanac i kuka:** `lanac-karika`, `lanac-kuka`, `kuka-alka`.

Igra ih već čeka: klip se koristi čim ga rig ima, sa međukadrovima. Razmere su u `build-sprite-rig.py`, a veze u `powersPose`, u izboru udarca (Potres), u Šarčevom gazu i u tabeli luka topuza. Već sada, bez novih crteža, Marko sedne kraj izvora dok je izvor otvoren (`marko-odmor`) i ustane kad ga zatvori.

**Codex kredit:**
- nalog je Team, a Codex je stao jer su potrošeni krediti člana radnog prostora;
- petočasovni prozor je bio na 98% i obnavlja se 12. novembra u 06:23;
- nedeljni je na 93% i obnavlja se 16. novembra u 10:39.

Posle 06:23 ostaje oko 7% nedeljne kvote, osim ako vlasnik radnog prostora dopuni kredite. Pokretanje: `art/world-pack-03/codex-nastavak.cmd`.

## Tabela pre i posle, po klipu

„Nacrtanih/s“ je brzina kojom igra smenjuje nacrtane kadrove (trk pri 265 px/s, vojnik oko 120 px/s; „—“ znači da zavisi od scene). Zvezdica znači da laki udarci idu po ubrzanom satu, brže na početku. „Slika po prolazu“ je koliko različitih slika se vidi u jednom krugu petlje ili jednom izvođenju klipa, na nivou 0 i 1; na nivou 2 svaki korak sa međukadrovima daje jednu sliku više umesto tri.

| klip | nacrtano | nacrtanih/s | pre: međukadrova | pre: slika po prolazu | posle: međukadrova | posle: slika po prolazu | koraci sa međukadrovima | napomena |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| marko-run | 6 | 10,6 | 6 | 12 | 18 | 24 | 6/6 |  |
| marko-walk | 8 | 12 | 8 | 16 | 24 | 32 | 8/8 |  |
| marko-idle | 8 | 4 | 0 | 8 | 24 | 32 | 8/8 |  |
| marko-idle-2 | 8 | 6 | 0 | 8 | 24 | 32 | 8/8 |  |
| marko-crouch-walk | 8 | 4,5 | 0 | 8 | 24 | 32 | 8/8 |  |
| marko-block-walk | 8 | 4,8 | 0 | 8 | 24 | 32 | 8/8 |  |
| marko-charge-walk | 8 | 4,8 | 0 | 8 | 24 | 32 | 8/8 |  |
| marko-drink-walk | 8 | 12 | 0 | 8 | 24 | 32 | 8/8 |  |
| marko-call-walk | 8 | 12 | 0 | 8 | 24 | 32 | 8/8 |  |
| marko-wounded-walk | 8 | — | 0 | 8 | 24 | 32 | 8/8 |  |
| marko-dizzy | 8 | 8 | 0 | 8 | 24 | 32 | 8/8 |  |
| marko-climb | 8 | po putu | 0 | 8 | 18 | 26 | 6/8 |  |
| marko-hang | 6 | 5 | 0 | 6 | 18 | 24 | 6/6 |  |
| marko-wallslide | 4 | 8 | 0 | 4 | 12 | 16 | 4/4 |  |
| marko-push | 6 | 8 | 0 | 6 | 18 | 24 | 6/6 |  |
| marko-teeter | 6 | 8 | 0 | 6 | 18 | 24 | 6/6 |  |
| marko-vihor | 8 | 20 | 0 | 8 | 9 | 17 | 3/8 |  |
| marko-charge-hold | 4 | 9 | 0 | 4 | 12 | 16 | 4/4 |  |
| marko-fall | 4 | 9 | 0 | 4 | 12 | 16 | 4/4 |  |
| mounted-run | 6 | ≈11 | 0 | 6 | 12 | 18 | 4/6 |  |
| marko-sablja-idle | 6 | 6 | 0 | 6 | 18 | 24 | 6/6 |  |
| marko-sablja-trci | 6 | 10,6 | 0 | 6 | 15 | 21 | 5/6 |  |
| sword-run | 6 | ≈8 | 6 | 12 | 18 | 24 | 6/6 |  |
| sword-idle | 6 | 5 | 0 | 6 | 18 | 24 | 6/6 |  |
| sword-climb | 6 | — | 0 | 6 | 18 | 24 | 6/6 |  |
| shield-run | 6 | ≈8 | 6 | 12 | 18 | 24 | 6/6 |  |
| shield-idle | 6 | 5 | 0 | 8 | 24 | 32 | 8/8 |  |
| archer-run | 6 | ≈8 | 6 | 12 | 18 | 24 | 6/6 |  |
| archer-idle | 6 | 5 | 0 | 8 | 24 | 32 | 8/8 |  |
| akindzija-run | 8 | ≈8 | 2 | 10 | 12 | 20 | 4/8 |  |
| akindzija-idle | 6 | 5 | 0 | 8 | 24 | 32 | 8/8 |  |
| oklopnik-idle | 6 | 5 | 0 | 6 | 18 | 24 | 6/6 |  |
| oklopnik-walk | 6 | — | 0 | 6 | 12 | 18 | 4/6 |  |
| palikuca-run | 6 | ≈8 | 2 | 8 | 18 | 24 | 6/6 |  |
| palikuca-idle | 6 | 5 | 0 | 10 | 30 | 40 | 10/10 |  |
| palikuca-burn | 6 | — | 0 | 6 | 12 | 18 | 4/6 |  |
| kopljanik-run | 8 | ≈8 | 7 | 15 | 21 | 29 | 7/8 |  |
| kopljanik-idle | 6 | 5 | 0 | 10 | 30 | 40 | 10/10 |  |
| tufekdzija-run | 8 | ≈8 | 2 | 10 | 9 | 17 | 3/8 |  |
| tufekdzija-idle | 6 | 5 | 0 | 6 | 18 | 24 | 6/6 |  |
| pas-run | 8 | ≈8 | 5 | 13 | 21 | 29 | 7/8 |  |
| pas-idle | 4 | 5 | 0 | 4 | 12 | 16 | 4/4 |  |
| musa-run | 6 | ≈6 | 5 | 11 | 15 | 21 | 5/6 |  |
| musa-idle | 6 | 5 | 0 | 6 | 18 | 24 | 6/6 |  |
| musa-mounted | 8 | po putu | 0 | 8 | 24 | 32 | 8/8 |  |
| marko-attack | 6 | — | 0 | 6 | 3 | 9 | 1/5 | udarac: priprema i kontakt bez međukadrova |
| marko-combo-1 | 6 | 16,7* | 0 | 6 | 9 | 15 | 3/5 | udarac: priprema i kontakt bez međukadrova |
| marko-combo-2 | 6 | 16,7* | 0 | 6 | 9 | 15 | 3/5 | udarac: priprema i kontakt bez međukadrova |
| marko-combo-3 | 6 | 12* | 0 | 6 | 3 | 9 | 1/5 | udarac: priprema i kontakt bez međukadrova |
| marko-combo-4 | 8 | 14,3 | 0 | 8 | 15 | 23 | 5/7 | udarac: priprema i kontakt bez međukadrova |
| marko-charged | 6 | 11,5 | 0 | 6 | 0 | 6 | 0/5 | tok ne prati pokret: drži nacrtane kadrove; udarac: priprema i kontakt bez međukadrova |
| marko-super | 6 | 6,3 | 0 | 6 | 3 | 9 | 1/5 | udarac: priprema i kontakt bez međukadrova |
| marko-counter | 8 | 14,5 | 0 | 8 | 0 | 8 | 0/7 | tok ne prati pokret: drži nacrtane kadrove; udarac: priprema i kontakt bez međukadrova |
| marko-run-attack | 6 | 16,7* | 0 | 6 | 3 | 9 | 1/5 | udarac: priprema i kontakt bez međukadrova |
| marko-air-1 | 5 | 16,7* | 0 | 5 | 3 | 8 | 1/4 | udarac: priprema i kontakt bez međukadrova |
| marko-air-2 | 5 | 14,7 | 0 | 5 | 6 | 11 | 2/4 | udarac: priprema i kontakt bez međukadrova |
| marko-uppercut | 6 | 14,3 | 0 | 6 | 3 | 9 | 1/5 | udarac: priprema i kontakt bez međukadrova |
| marko-dash-strike | 6 | 14,3 | 0 | 6 | 6 | 12 | 2/5 | udarac: priprema i kontakt bez međukadrova |
| marko-mounted-attack | 6 | — | 0 | 6 | 6 | 12 | 2/5 | udarac: priprema i kontakt bez međukadrova |
| marko-jump | 6 | po brzini | 0 | 6 | 12 | 18 | 4/5 |  |
| marko-jump-rise | 4 | 12,5 | 0 | 4 | 9 | 13 | 3/3 |  |
| marko-run-jump | 8 | 11,4 | 0 | 8 | 21 | 29 | 7/7 |  |
| marko-land | 4 | 20 | 0 | 4 | 6 | 10 | 2/3 |  |
| marko-roll | 6 | 17,6 | 0 | 6 | 0 | 6 | 0/5 | tok ne prati pokret: drži nacrtane kadrove |
| marko-roll-land | 6 | 14,3 | 0 | 6 | 0 | 6 | 0/5 | tok ne prati pokret: drži nacrtane kadrove |
| marko-block | 6 | po stanju | 0 | 6 | 15 | 21 | 5/5 |  |
| marko-block-hit | 4 | 18 | 0 | 4 | 9 | 13 | 3/3 |  |
| marko-crouch | 6 | po stanju | 0 | 6 | 15 | 21 | 5/5 |  |
| marko-drink | 6 | 7 | 0 | 6 | 15 | 21 | 5/5 |  |
| marko-hurt | 4 | 18 | 0 | 4 | 9 | 13 | 3/3 |  |
| marko-hurt-air | 4 | 18 | 0 | 4 | 3 | 7 | 1/3 |  |
| marko-death | 6 | ≈6,7 | 0 | 6 | 3 | 9 | 1/5 |  |
| marko-knockdown | 6 | 9 | 0 | 6 | 9 | 15 | 3/5 |  |
| marko-getup | 6 | 12 | 0 | 6 | 3 | 9 | 1/5 |  |
| marko-turn | 4 | 25 | 0 | 4 | 3 | 7 | 1/3 |  |
| marko-run-start | 4 | 22 | 0 | 4 | 9 | 13 | 3/3 |  |
| marko-run-stop | 4 | 15,4 | 0 | 4 | 6 | 10 | 2/3 |  |
| marko-combo-recover | 4 | 16,7 | 0 | 4 | 6 | 10 | 2/3 |  |
| marko-ledge | 8 | — | 0 | 8 | 6 | 14 | 2/7 |  |
| marko-walljump | 6 | — | 0 | 6 | 9 | 15 | 3/5 |  |
| marko-plunge | 6 | — | 0 | 6 | 0 | 6 | 0/5 | tok ne prati pokret: drži nacrtane kadrove |
| marko-kick | 6 | 16,7 | 0 | 6 | 9 | 15 | 3/5 | udarac: priprema i kontakt bez međukadrova |
| marko-slide | 6 | 12 | 0 | 6 | 9 | 15 | 3/5 |  |
| marko-lever | 6 | 12 | 0 | 6 | 15 | 21 | 5/5 |  |
| marko-throw | 8 | 16 | 0 | 8 | 18 | 26 | 6/7 |  |
| marko-crouch-throw | 6 | — | 0 | 6 | 12 | 18 | 4/5 |  |
| marko-pickup | 6 | 10 | 0 | 6 | 12 | 18 | 4/5 |  |
| marko-call | 6 | 8 | 0 | 6 | 15 | 21 | 5/5 |  |
| marko-open | 6 | 14,3 | 0 | 6 | 15 | 21 | 5/5 |  |
| marko-victory | 8 | ≈6 | 0 | 8 | 21 | 29 | 7/7 |  |
| marko-idle-3 | 12 | 4 | 0 | 13 | 36 | 49 | 12/12 |  |
| marko-idle-4 | 12 | 6 | 0 | 12 | 33 | 45 | 11/11 |  |
| marko-blasted | 6 | — | 0 | 6 | 3 | 9 | 1/5 |  |
| mounted-jump | 4 | po brzini | 0 | 4 | 3 | 7 | 1/3 |  |
| marko-finisher | 8 | — | 0 | 8 | 6 | 14 | 2/7 |  |
| marko-finisher-smash | 8 | — | 0 | 8 | 15 | 23 | 5/7 |  |
| marko-finisher-throw | 8 | — | 0 | 8 | 18 | 26 | 6/7 |  |
| marko-finisher-stomp | 8 | — | 0 | 8 | 6 | 14 | 2/7 |  |
| marko-finisher-legs | 8 | — | 0 | 8 | 3 | 11 | 1/7 |  |
| marko-finisher-skull | 8 | — | 0 | 8 | 6 | 14 | 2/7 |  |
| marko-brutal | 8 | — | 0 | 8 | 21 | 29 | 7/7 |  |
| marko-tiho | 7 | — | 0 | 7 | 15 | 22 | 5/6 |  |
| marko-sablja-izvlaci | 6 | — | 0 | 6 | 15 | 21 | 5/5 |  |
| marko-sablja-vraca | 5 | — | 0 | 5 | 12 | 17 | 4/4 |  |
| marko-sablja-udarac-1 | 6 | — | 0 | 6 | 6 | 12 | 2/5 |  |
| marko-sablja-udarac-2 | 6 | — | 0 | 6 | 15 | 21 | 5/5 |  |
| marko-sablja-udarac-3 | 7 | — | 0 | 7 | 12 | 19 | 4/6 |  |
| marko-sablja-skok | 6 | — | 0 | 6 | 6 | 12 | 2/5 |  |
| marko-sablja-tezak | 7 | — | 0 | 7 | 9 | 16 | 3/6 |  |
| marko-sablja-ubod | 6 | — | 0 | 6 | 12 | 18 | 4/5 |  |
| marko-sablja-uvis | 6 | — | 0 | 6 | 9 | 15 | 3/5 |  |
| sword-attack | 6 | 3,5–4,3 | 0 | 6 | 6 | 12 | 2/5 | udarac: priprema i kontakt bez međukadrova |
| sword-hurt | 4 | 11,8 | 0 | 4 | 3 | 7 | 1/3 |  |
| sword-death | 6 | ≈6,7 | 0 | 6 | 6 | 12 | 2/5 |  |
| sword-jump | 6 | po brzini | 0 | 6 | 15 | 21 | 5/5 |  |
| sword-launch | 6 | po brzini | 0 | 6 | 3 | 9 | 1/5 |  |
| sword-lunge | 6 | — | 0 | 6 | 15 | 21 | 5/5 |  |
| shield-attack | 6 | 3,5–4,3 | 0 | 6 | 6 | 12 | 2/5 | udarac: priprema i kontakt bez međukadrova |
| shield-hurt | 4 | 11,8 | 0 | 4 | 6 | 10 | 2/3 |  |
| shield-death | 6 | ≈6,7 | 0 | 6 | 3 | 9 | 1/5 |  |
| shield-jump | 6 | po brzini | 0 | 6 | 15 | 21 | 5/5 |  |
| shield-launch | 6 | po brzini | 0 | 6 | 3 | 9 | 1/5 |  |
| shield-bash | 6 | — | 0 | 6 | 9 | 15 | 3/5 |  |
| shield-guardbreak | 4 | — | 0 | 4 | 6 | 10 | 2/3 |  |
| archer-shoot | 6 | 3,5–4,3 | 0 | 6 | 6 | 12 | 2/5 | udarac: priprema i kontakt bez međukadrova |
| archer-shoot-down | 6 | — | 0 | 6 | 15 | 21 | 5/5 |  |
| archer-hurt | 4 | 11,8 | 0 | 4 | 3 | 7 | 1/3 |  |
| archer-death | 6 | ≈6,7 | 0 | 6 | 0 | 6 | 0/5 | tok ne prati pokret: drži nacrtane kadrove |
| archer-jump | 6 | po brzini | 0 | 6 | 15 | 21 | 5/5 |  |
| archer-launch | 6 | po brzini | 0 | 6 | 3 | 9 | 1/5 |  |
| archer-kick | 6 | — | 0 | 6 | 15 | 21 | 5/5 |  |
| akindzija-hurt | 4 | 11,8 | 0 | 4 | 0 | 4 | 0/3 | tok ne prati pokret: drži nacrtane kadrove |
| akindzija-death | 6 | ≈6,7 | 0 | 6 | 6 | 12 | 2/5 |  |
| akindzija-jump | 6 | po brzini | 0 | 6 | 0 | 6 | 0/5 | tok ne prati pokret: drži nacrtane kadrove |
| akindzija-launch | 6 | po brzini | 0 | 6 | 0 | 6 | 0/5 | tok ne prati pokret: drži nacrtane kadrove |
| akindzija-spin | 6 | — | 0 | 6 | 3 | 9 | 1/5 |  |
| akindzija-charge | 6 | — | 0 | 6 | 0 | 6 | 0/5 | tok ne prati pokret: drži nacrtane kadrove |
| akindzija-backstep | 4 | — | 0 | 4 | 9 | 13 | 3/3 |  |
| oklopnik-hurt | 4 | 11,8 | 0 | 4 | 9 | 13 | 3/3 |  |
| oklopnik-death | 6 | ≈6,7 | 0 | 6 | 6 | 12 | 2/5 |  |
| oklopnik-jump | 6 | po brzini | 0 | 6 | 15 | 21 | 5/5 |  |
| oklopnik-launch | 6 | po brzini | 0 | 6 | 3 | 9 | 1/5 |  |
| oklopnik-armorbreak | 4 | — | 0 | 4 | 9 | 13 | 3/3 |  |
| oklopnik-slam | 6 | — | 0 | 6 | 6 | 12 | 2/5 |  |
| oklopnik-rush | 6 | — | 0 | 6 | 12 | 18 | 4/5 |  |
| oklopnik-grab | 6 | — | 0 | 6 | 6 | 12 | 2/5 |  |
| palikuca-hurt | 4 | 11,8 | 0 | 4 | 3 | 7 | 1/3 |  |
| palikuca-death | 6 | ≈6,7 | 0 | 6 | 3 | 9 | 1/5 |  |
| palikuca-jump | 6 | po brzini | 0 | 6 | 12 | 18 | 4/5 |  |
| palikuca-launch | 6 | po brzini | 0 | 6 | 3 | 9 | 1/5 |  |
| palikuca-bomb | 6 | — | 0 | 6 | 9 | 15 | 3/5 |  |
| palikuca-torch | 6 | — | 0 | 6 | 9 | 15 | 3/5 |  |
| palikuca-fire | 6 | — | 0 | 6 | 12 | 18 | 4/5 |  |
| kopljanik-attack | 8 | 3,5–4,3 | 0 | 8 | 12 | 20 | 4/7 | udarac: priprema i kontakt bez međukadrova |
| kopljanik-hurt | 4 | 11,8 | 0 | 4 | 3 | 7 | 1/3 |  |
| kopljanik-death | 8 | ≈6,7 | 0 | 8 | 12 | 20 | 4/7 |  |
| kopljanik-jump | 6 | po brzini | 0 | 6 | 15 | 21 | 5/5 |  |
| kopljanik-launch | 6 | po brzini | 0 | 6 | 3 | 9 | 1/5 |  |
| kopljanik-sweep | 6 | — | 0 | 6 | 15 | 21 | 5/5 |  |
| tufekdzija-shoot | 8 | 3,5–4,3 | 0 | 8 | 15 | 23 | 5/7 | udarac: priprema i kontakt bez međukadrova |
| tufekdzija-hurt | 4 | 11,8 | 0 | 4 | 6 | 10 | 2/3 |  |
| tufekdzija-death | 8 | ≈6,7 | 0 | 8 | 15 | 23 | 5/7 |  |
| tufekdzija-jump | 6 | po brzini | 0 | 6 | 15 | 21 | 5/5 |  |
| tufekdzija-launch | 6 | po brzini | 0 | 6 | 3 | 9 | 1/5 |  |
| tufekdzija-butt | 6 | — | 0 | 6 | 12 | 18 | 4/5 |  |
| pas-attack | 6 | 3,5–4,3 | 0 | 6 | 9 | 15 | 3/5 | udarac: priprema i kontakt bez međukadrova |
| pas-hurt | 4 | 11,8 | 0 | 4 | 3 | 7 | 1/3 |  |
| pas-death | 6 | ≈6,7 | 0 | 6 | 12 | 18 | 4/5 |  |
| pas-launch | 6 | po brzini | 0 | 6 | 3 | 9 | 1/5 |  |
| musa-attack | 6 | 3,2 | 0 | 6 | 3 | 9 | 1/5 | udarac: priprema i kontakt bez međukadrova |
| musa-hurt | 4 | 11,8 | 0 | 4 | 3 | 7 | 1/3 |  |
| musa-death | 6 | ≈6,7 | 0 | 6 | 3 | 9 | 1/5 |  |
| musa-mounted-strike | 6 | — | 0 | 6 | 15 | 21 | 5/5 |  |
| musa-sword | 6 | 3–10 | 0 | 6 | 3 | 9 | 1/5 |  |
| musa-grab | 6 | — | 0 | 6 | 12 | 18 | 4/5 |  |
| musa-throw-up | 8 | — | 0 | 8 | 15 | 23 | 5/7 |  |
| musa-stomp | 6 | — | 0 | 6 | 12 | 18 | 4/5 |  |
| musa-roar | 6 | — | 0 | 6 | 15 | 21 | 5/5 |  |
| musa-block | 6 | — | 0 | 6 | 9 | 15 | 3/5 |  |
| orao-flight | 6 | — | 0 | 6 | 6 | 12 | 2/6 |  |
| fairy-cast | 6 | — | 0 | 6 | 6 | 12 | 2/6 |  |
| volovi-plug | 8 | — | 0 | 8 | 24 | 32 | 8/8 |  |
| volovi-beg | 8 | — | 0 | 8 | 18 | 26 | 6/8 |  |
| vila-let | 8 | — | 0 | 8 | 21 | 29 | 7/8 |  |
| vila-carolija | 8 | — | 0 | 8 | 21 | 29 | 7/8 |  |
| vila-isceljenje | 8 | — | 0 | 8 | 24 | 32 | 8/8 |  |
| vila-spreda | 8 | — | 0 | 8 | 15 | 23 | 5/8 |  |
| magija-bljesak | 8 | — | 0 | 8 | 6 | 14 | 2/8 |  |
| magija-zrak | 8 | — | 0 | 8 | 0 | 8 | 0/8 | tok ne prati pokret: drži nacrtane kadrove |
| plamen | 8 | — | 0 | 8 | 21 | 29 | 7/8 |  |
| plamen-mali | 8 | — | 0 | 8 | 24 | 32 | 8/8 |  |
| eksplozija | 8 | — | 0 | 8 | 3 | 11 | 1/8 |  |
| svatovi-zarobljeni | 6 | — | 0 | 6 | 18 | 24 | 6/6 |  |
| svatovi-kolo | 8 | — | 0 | 8 | 24 | 32 | 8/8 |  |
| mladi-turcin-idle | 6 | — | 0 | 70 | 162 | 232 | 54/70 |  |
| mladi-turcin-run | 8 | — | 0 | 8 | 9 | 17 | 3/8 |  |
| mladi-turcin-attack | 6 | — | 0 | 6 | 9 | 15 | 3/6 | udarac: priprema i kontakt bez međukadrova |
| mladi-turcin-hurt | 4 | — | 0 | 4 | 9 | 13 | 3/4 |  |
| mladi-turcin-death | 6 | — | 0 | 6 | 3 | 9 | 1/6 |  |
| beg-mounted | 8 | — | 0 | 8 | 24 | 32 | 8/8 |  |
| beg-mounted-strike | 6 | — | 0 | 6 | 9 | 15 | 3/6 |  |
| beg-unhorsed | 6 | — | 0 | 6 | 0 | 6 | 0/6 | tok ne prati pokret: drži nacrtane kadrove |
| megdan-kostac | 8 | — | 0 | 8 | 24 | 32 | 8/8 |  |
| megdan-noz | 8 | — | 0 | 8 | 15 | 23 | 5/8 |  |
| putnik-starac-idle | 6 | — | 0 | 6 | 18 | 24 | 6/6 |  |
| putnik-starac-walk | 8 | — | 0 | 8 | 24 | 32 | 8/8 |  |
| putnik-trgovac-idle | 6 | — | 0 | 6 | 18 | 24 | 6/6 |  |
| putnik-trgovac-walk | 8 | — | 0 | 8 | 24 | 32 | 8/8 |  |
| putnica-idle | 6 | — | 0 | 6 | 18 | 24 | 6/6 |  |
| putnica-walk | 8 | — | 0 | 8 | 24 | 32 | 8/8 |  |
| putnik-kaluder-idle | 6 | — | 0 | 6 | 18 | 24 | 6/6 |  |
| putnik-kaluder-walk | 8 | — | 0 | 8 | 24 | 32 | 8/8 |  |
| arapin-idle | 6 | — | 0 | 6 | 18 | 24 | 6/6 |  |
| arapin-run | 8 | — | 0 | 8 | 18 | 26 | 6/8 |  |
| arapin-attack | 6 | — | 0 | 6 | 6 | 12 | 2/6 | udarac: priprema i kontakt bez međukadrova |
| arapin-throw | 6 | — | 0 | 6 | 9 | 15 | 3/6 |  |
| arapin-hurt | 4 | — | 0 | 4 | 9 | 13 | 3/4 |  |
| arapin-death | 6 | — | 0 | 6 | 12 | 18 | 4/6 |  |
| azdaja-idle | 6 | — | 0 | 6 | 18 | 24 | 6/6 |  |
| azdaja-hurt | 4 | — | 0 | 4 | 9 | 13 | 3/4 |  |
| azdaja-death | 6 | — | 0 | 6 | 15 | 21 | 5/6 |  |
| azdaja-fire | 8 | — | 0 | 8 | 24 | 32 | 8/8 |  |
| azdaja-bite | 6 | — | 0 | 6 | 15 | 21 | 5/6 |  |
| dzelat-idle | 6 | — | 0 | 6 | 18 | 24 | 6/6 |  |
| dzelat-run | 8 | — | 0 | 8 | 24 | 32 | 8/8 |  |
| dzelat-attack | 6 | — | 0 | 6 | 6 | 12 | 2/6 | udarac: priprema i kontakt bez međukadrova |
| dzelat-hurt | 4 | — | 0 | 4 | 9 | 13 | 3/4 |  |
| dzelat-death | 6 | — | 0 | 6 | 6 | 12 | 2/6 |  |
| djemo-idle | 6 | — | 0 | 6 | 18 | 24 | 6/6 |  |
| djemo-run | 8 | — | 0 | 8 | 24 | 32 | 8/8 |  |
| djemo-attack | 6 | — | 0 | 6 | 9 | 15 | 3/6 | udarac: priprema i kontakt bez međukadrova |
| djemo-throw | 6 | — | 0 | 6 | 12 | 18 | 4/6 |  |
| djemo-hurt | 4 | — | 0 | 4 | 6 | 10 | 2/4 |  |
| djemo-death | 6 | — | 0 | 6 | 12 | 18 | 4/6 |  |
| vilinski-kamen-spava | 6 | — | 0 | 6 | 18 | 24 | 6/6 |  |
| vilinski-kamen-budi | 6 | — | 0 | 6 | 18 | 24 | 6/6 |  |
| vilinski-kamen-budan | 6 | — | 0 | 6 | 18 | 24 | 6/6 |  |
| kostac-janicar | 8 | — | 0 | 8 | 24 | 32 | 8/8 |  |
| kostac-janicar-kraj | 6 | — | 0 | 6 | 3 | 9 | 1/6 |  |
| kostac-oklopnik | 8 | — | 0 | 8 | 24 | 32 | 8/8 |  |
| kostac-oklopnik-kraj | 6 | — | 0 | 6 | 6 | 12 | 2/6 |  |
| kostac-pas | 8 | — | 0 | 8 | 24 | 32 | 8/8 |  |
| kostac-pas-kraj | 6 | — | 0 | 6 | 3 | 9 | 1/6 |  |
| orao-let | 8 | — | 0 | 8 | 18 | 26 | 6/8 |  |
| orao-obrusavanje | 6 | — | 0 | 6 | 6 | 12 | 2/6 |  |
| orao-hlad | 6 | — | 0 | 6 | 18 | 24 | 6/6 |  |
| lovac-aga-idle | 6 | — | 0 | 70 | 162 | 232 | 54/70 |  |
| lovac-aga-run | 8 | — | 0 | 8 | 21 | 29 | 7/8 |  |
| lovac-aga-attack | 6 | — | 0 | 6 | 12 | 18 | 4/6 | udarac: priprema i kontakt bez međukadrova |
| lovac-aga-rog | 6 | — | 0 | 6 | 18 | 24 | 6/6 |  |
| lovac-aga-hurt | 4 | — | 0 | 4 | 12 | 16 | 4/4 |  |
| lovac-aga-death | 6 | — | 0 | 6 | 15 | 21 | 5/6 |  |
| guslar-svira | 8 | — | 0 | 8 | 24 | 32 | 8/8 |  |
| guslar-ceka | 4 | — | 0 | 4 | 12 | 16 | 4/4 |  |
| soko-let | 8 | — | 0 | 8 | 9 | 17 | 3/8 |  |
| soko-napad | 6 | — | 0 | 6 | 9 | 15 | 3/6 |  |
| soko-voda | 6 | — | 0 | 6 | 6 | 12 | 2/6 |  |
| soko-ranjen | 4 | — | 0 | 4 | 12 | 16 | 4/4 |  |
| caus-idle | 4 | — | 0 | 70 | 51 | 121 | 17/70 |  |
| caus-walk | 8 | — | 0 | 8 | 15 | 23 | 5/8 |  |
| caus-ferman | 6 | — | 0 | 6 | 15 | 21 | 5/6 |  |
| caus-hurt | 4 | — | 0 | 4 | 6 | 10 | 2/4 |  |
| caus-death | 6 | — | 0 | 6 | 3 | 9 | 1/6 |  |
| ognjeni-aga-idle | 6 | — | 0 | 70 | 162 | 232 | 54/70 |  |
| ognjeni-aga-run | 8 | — | 0 | 8 | 24 | 32 | 8/8 |  |
| ognjeni-aga-attack | 6 | — | 0 | 6 | 9 | 15 | 3/6 | udarac: priprema i kontakt bez međukadrova |
| ognjeni-aga-ulje | 6 | — | 0 | 6 | 18 | 24 | 6/6 |  |
| ognjeni-aga-zadihan | 4 | — | 0 | 4 | 12 | 16 | 4/4 |  |
| ognjeni-aga-hurt | 4 | — | 0 | 4 | 6 | 10 | 2/4 |  |
| ognjeni-aga-death | 6 | — | 0 | 6 | 3 | 9 | 1/6 |  |
| hasan-aga-idle | 6 | — | 0 | 70 | 162 | 232 | 54/70 |  |
| hasan-aga-run | 8 | — | 0 | 8 | 24 | 32 | 8/8 |  |
| hasan-aga-attack | 6 | — | 0 | 6 | 12 | 18 | 4/6 | udarac: priprema i kontakt bez međukadrova |
| hasan-aga-zalet | 6 | — | 0 | 6 | 18 | 24 | 6/6 |  |
| hasan-aga-zaglavljen | 4 | — | 0 | 4 | 12 | 16 | 4/4 |  |
| hasan-aga-hurt | 4 | — | 0 | 4 | 6 | 10 | 2/4 |  |
| hasan-aga-death | 6 | — | 0 | 6 | 12 | 18 | 4/6 |  |
| bajraktar-idle | 6 | — | 0 | 70 | 162 | 232 | 54/70 |  |
| bajraktar-run | 8 | — | 0 | 8 | 24 | 32 | 8/8 |  |
| bajraktar-attack | 6 | — | 0 | 6 | 6 | 12 | 2/6 | udarac: priprema i kontakt bez međukadrova |
| bajraktar-poziv | 6 | — | 0 | 6 | 18 | 24 | 6/6 |  |
| bajraktar-hurt | 4 | — | 0 | 4 | 0 | 4 | 0/4 | tok ne prati pokret: drži nacrtane kadrove |
| bajraktar-death | 6 | — | 0 | 6 | 3 | 9 | 1/6 |  |
| janicarski-aga-idle | 6 | — | 0 | 70 | 162 | 232 | 54/70 |  |
| janicarski-aga-run | 8 | — | 0 | 8 | 21 | 29 | 7/8 |  |
| janicarski-aga-attack | 6 | — | 0 | 6 | 12 | 18 | 4/6 | udarac: priprema i kontakt bez međukadrova |
| janicarski-aga-skok | 6 | — | 0 | 6 | 3 | 9 | 1/6 |  |
| janicarski-aga-hurt | 4 | — | 0 | 4 | 3 | 7 | 1/4 |  |
| janicarski-aga-death | 6 | — | 0 | 6 | 3 | 9 | 1/6 |  |
| mlada-trci | 8 | — | 0 | 8 | 21 | 29 | 7/8 |  |
| mlada-skok | 6 | — | 0 | 6 | 9 | 15 | 3/6 |  |
| mladozenja-trci | 8 | — | 0 | 8 | 18 | 26 | 6/8 |  |
| mladozenja-skok | 6 | — | 0 | 6 | 6 | 12 | 2/6 |  |
| sirotinja-ceka | 4 | — | 0 | 4 | 12 | 16 | 4/4 |  |
| sirotinja-blagoslov | 6 | — | 0 | 6 | 18 | 24 | 6/6 |  |
| marko-sablja-vihor | 8 | — | 0 | 8 | 12 | 20 | 4/8 |  |
| marko-sablja-glava | 8 | — | 0 | 8 | 15 | 23 | 5/8 |  |
| marko-sablja-proburazi | 8 | — | 0 | 8 | 15 | 23 | 5/8 |  |
| marko-sablja-preseci | 8 | — | 0 | 8 | 12 | 20 | 4/8 |  |
| marko-sablja-tiho | 7 | — | 0 | 7 | 18 | 25 | 6/7 |  |
| sword-spava | 4 | — | 0 | 4 | 12 | 16 | 4/4 |  |
| sword-budi | 5 | — | 0 | 5 | 9 | 14 | 3/5 |  |
| shield-spava | 4 | — | 0 | 4 | 12 | 16 | 4/4 |  |
| shield-budi | 5 | — | 0 | 5 | 9 | 14 | 3/5 |  |
| sword-tiho-pada | 6 | — | 0 | 6 | 3 | 9 | 1/6 |  |
| kostur-stoji | 6 | — | 0 | 6 | 18 | 24 | 6/6 |  |
| kostur-pada | 8 | — | 0 | 8 | 12 | 20 | 4/8 |  |
| oklopnik-kostur-pada | 8 | — | 0 | 8 | 15 | 23 | 5/8 |  |
| marko-pocinak | 6 | — | 0 | 6 | 3 | 9 | 1/6 |  |
| marko-okovan | 8 | — | 0 | 8 | 24 | 32 | 8/8 |  |
| kostac-stoji | 8 | — | 0 | 8 | 24 | 32 | 8/8 |  |
| kostac-stoji-kraj | 6 | — | 0 | 6 | 3 | 9 | 1/6 |  |
| trgovac-tezga-idle | 6 | — | 0 | 6 | 18 | 24 | 6/6 |  |
| utva-let | 6 | — | 0 | 6 | 9 | 15 | 3/6 |  |
| soko-vezirov-let | 8 | — | 0 | 8 | 12 | 20 | 4/8 |  |
| janja-idle | 6 | — | 0 | 6 | 18 | 24 | 6/6 |  |
| janja-toci | 6 | — | 0 | 6 | 18 | 24 | 6/6 |  |
| novak-idle | 6 | — | 0 | 6 | 18 | 24 | 6/6 |  |
| novak-kuje | 8 | — | 0 | 8 | 24 | 32 | 8/8 |  |
| **ukupno (319 klipova)** | **1999** | | **55** | **2519** | **4863** | **7327** | | |
