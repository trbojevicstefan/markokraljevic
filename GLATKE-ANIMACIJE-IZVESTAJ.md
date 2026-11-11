# Glatke animacije: izveštaj

**Grana:** `claude/glatke-animacije-590652` (od `claude/lost-crown-pokreti-218378`). Nije push-ovano niti spojeno u `main`.

## Ukratko

- **Tri međukadra po koraku** (1/4, 1/2, 3/4 puta) umesto jednog. Obrađeno je 179 klipova, a 157 ih u igri koristi međukadrove: svi Markovi (trk, hod, kombo, udarci, skok, kolut, blok, vino, pogodak, smrt, Šarac, sablja), devet vrsta vojnika i Musa. Pre ih je imalo 11 klipova (samo trk i hod), sa po jednim međukadrom.
- Na slikama nema duplih slika ni razmazanih udova. Gde tok ne prati ud (veliki zamah, ud preko tela), par ne dobija međukadar i igra drži nacrtani kadar. Gde se ud izgubi usred koraka, poza se promeni jednom, bez providnosti.
- **Udarac ostaje oštar.** Priprema i kontakt drže celo svoje vreme, bez međukadra. Međukadrovi su samo u zamahu ka pripremi i u oporavku. Hitbox i tajming udarca nisu dirani (menjano je samo crtanje).
- **Proceduralni sloj:**
  - istezanje pri odskoku (i Sokolovom krilu) i sabijanje pri doskoku;
  - nagib tela u trku;
  - pretapanje od 70 ms pri promeni klipa;
  - trag topuza po luku nacrtanog zamaha, posebno za svaki udarac.

  „Smanjeno podrhtavanje i efekti“ gasi istezanje, sabijanje, nagib i pretapanje; trag ostaje samo kao bleda traka.
- **Performanse:** FPS i vreme rada po kadru su isti kao pre. Listovi se više ne učitavaju pri pokretanju igre, nego kad ih pokret prvi put zatraži. Na nivou kvaliteta 2 učitavaju se samo međukadrovi na pola puta. List koji se 45 s ne koristi pušta se iz memorije.
- `?anim=0` u adresi isključuje sve novo (samo nacrtani kadrovi), radi poređenja u istoj verziji.

## Šta da pogledaš

1. **Snimci pre i posle** (levo pre, desno posle; isti ulaz, korak po korak, 60 koraka u sekundi). Fajlovi su u `izvestaj/glatke-animacije/`; otvori ih u browseru:
   - `trk.webp` i `trk-sporo.webp` (4× sporije, vide se međukadrovi jedan po jedan);
   - `kombo.webp` i `kombo-sporo.webp` (J J J: priprema i kontakt ostaju isti, oporavak je tečan, trag topuza pre kontakta);
   - `skok.webp` (istezanje, pretapanje rise → pad);
   - `neprijatelj.webp` (sabljaš u prvom pohodu trči i zamahuje).
2. **U igri:** trk, hod, kombo J J J, teški udarac K, skok i doskok sa visine, kolut, vino. Na neprijateljima pogledaj mirovanje (ranije 5 kadrova/s, sada do 20 slika/s), trk i zamah.
3. **Poređenje u istoj igri:** dodaj `?anim=0` u adresu, pa ukloni.
4. **Merač F9 / `?fps`:** novi red `in-betweens` pokazuje koliko sprite-ova je međukadar i koliko MB listova je učitano.
5. **Podešavanja:** uključi „Smanjeno podrhtavanje i efekti“; istezanje, nagib i pretapanje treba da nestanu.

## Performanse (pre → posle)

Mereno u Chrome-u bez prozora (headless), na istoj kartici (AMD RX 9060 XT), 1600×900. U oba slučaja je isti prolaz od 16 s: trk, kombo, skokovi, trk nazad, teški udarac i borba sa najbližim vojnikom. Svaki slučaj je meren dvaput.

| | nivo 0 („Visok kvalitet“) | nivo 2 („Brže“) |
|---|---|---|
| FPS pre | 44,3 / 45,5 | 59,8 / 59,7 |
| FPS posle | 43,9 / 46,2 | 59,7 / 59,8 |
| rad po kadru (JS) pre | 1,47 / 1,45 ms | 1,13 / 1,15 ms |
| rad po kadru (JS) posle | 1,40 / 1,32 ms | 1,37 / 1,37 ms |
| JS heap pre → posle | 94–96 → 95–97 MB | 94–96 → 93–97 MB |
| listovi međukadrova u memoriji pre | 61 MB (svih 11 odmah pri startu) | 61 MB |
| listovi međukadrova u memoriji posle (za 16 s igre) | 46 MB (34 lista) | 15–16 MB (18–19 listova, samo pola puta) |

- Headless Chrome na nivou 0 daje ~45 FPS i pre i posle. Kadrovi naizmenično traju 16,7 i 33 ms, što dolazi od samog headless prikaza, a ne od igre. Na pravom ekranu treba da bude 60.
- Razlike u vremenu rada su u granicama šuma (±0,3 ms).
- Najgori slučaj, ako se u jednoj sesiji odigra baš svaki pokret: međukadrovi zauzimaju do 403 MB na nivoima 0 i 1, a 131 MB na nivou 2. To je oko 40% samih nacrtanih listova tih klipova. Ali list koji se 45 s ne koristi pušta se, pa se u memoriji drži samo ono što se trenutno igra.
- Preuzimanje: 316 fajlova, ukupno 25,8 MB (ranije 11 fajlova, 1 MB). Ništa od toga se ne čeka pri pokretanju igre.

## Kako radi (kratko)

- `smooth-anims.py`:
  - računa optički tok (OpenCV DIS) za svaki par kadrova koje igra pokazuje jedan za drugim, uključujući sekvence mirovanja koje preskaču kadrove;
  - kadrove prvo poravna po stopalima, pa ih iskrivi jedan ka drugom za 1/4, 1/2 i 3/4 puta;
  - par odbacuje ako se dve polovine ne slažu (greška > 0,13) ili ako međukadar ispadne providniji od nacrtanih;
  - isečene međukadrove čuva u veličini u kojoj ih igra crta, spakovane u dva lista po klipu: pola puta, i četvrtine.
- `dist/game.js`:
  - poza sada nosi `tw`, deo puta do sledećeg kadra, iz istog sata koji već bira kadar, pa nema kašnjenja;
  - udarac nosi `keyAt`, fazu u kojoj počinje pogodak (ista kao u `attackActive`), da priprema i kontakt ostanu nacrtani;
  - kadrovi koje bira stanje (skok po brzini) prolaze kroz međukadrove za najviše 70 ms.
- Kvalitet optičkog toka je dovoljan za trk, hod, mirovanje i oporavak. Za veliki zamah nije, ali se tu ionako drži nacrtani kadar. Zato nije preuzet RIFE ni drugi interpolator.

## Svesno bez međukadrova

- **22 klipa** u kojima tok ne prati ni jedan korak, pa igra drži nacrtane kadrove (vidi napomene u tabeli):
  - Marko: `marko-attack`, `marko-charged`, `marko-counter`, `marko-jump`, `marko-roll`, `marko-roll-land`, `marko-death`, `marko-plunge`, `mounted-jump`, dva dokrajčivanja i `marko-sablja-uvis`;
  - vojnici: većina akindžijinih poteza i nekoliko pogodaka i padova;
  - Musa: `musa-attack`.
- `marko-sablja-vihor`: svaki kadar se pomera ustranu da čizme stoje, i međukadar to ne može da prati.
- Spavanje i buđenje, imenovani šampioni (age, bajraktar, čauš…), putnici, ptice, vatra: nisu glavni likovi. Može ih dodati sledeći prolaz (`python smooth-anims.py <klip>`).

## Šta nije provereno

- FPS na pravom ekranu i na slabom uređaju (telefon, integrisana grafika). Mereno je samo u headless Chrome-u na jakoj kartici; panel browsera u aplikaciji je bio skriven i usporava crtanje.
- Igra ljudskom rukom: pokreti su snimljeni skriptom, korak po korak.
- Šampioni i bosovi osim Muse nemaju međukadrove.

## Testovi

`npm run check && npm test && node animation-tests.mjs && node simulation-test.mjs` (ceo CI iz `pages.yml`) prolazi. `draw-test.mjs` crta 4431 kadar bez greške. U browserskim prolazima nije bilo JavaScript grešaka (pre, posle, „Smanjeno podrhtavanje“, `?anim=0`).

## Tabela pre i posle, po klipu

„Nacrtanih/s“ je brzina kojom igra smenjuje nacrtane kadrove (trk pri 265 px/s, vojnik oko 120 px/s). Zvezdica znači da laki udarci idu po ubrzanom satu, brže na početku. „Slika po prolazu“ je koliko različitih slika se vidi u jednom krugu petlje ili jednom izvođenju klipa, na nivou 0 i 1; na nivou 2 svaki korak sa međukadrovima daje jednu sliku više umesto tri.

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
| marko-teeter | 6 | 8 | 0 | 6 | 15 | 21 | 5/6 |  |
| marko-vihor | 8 | 20 | 0 | 8 | 6 | 14 | 2/8 |  |
| marko-charge-hold | 4 | 9 | 0 | 4 | 12 | 16 | 4/4 |  |
| marko-fall | 4 | 9 | 0 | 4 | 12 | 16 | 4/4 |  |
| mounted-run | 6 | ≈11 | 0 | 6 | 9 | 15 | 3/6 |  |
| marko-sablja-idle | 6 | 6 | 0 | 6 | 18 | 24 | 6/6 |  |
| marko-sablja-trci | 6 | 10,6 | 0 | 6 | 15 | 21 | 5/6 |  |
| sword-run | 6 | ≈8 | 6 | 12 | 18 | 24 | 6/6 |  |
| sword-idle | 6 | 5 | 0 | 6 | 18 | 24 | 6/6 |  |
| sword-climb | 6 | — | 0 | 6 | 18 | 24 | 6/6 |  |
| shield-run | 6 | ≈8 | 6 | 12 | 18 | 24 | 6/6 |  |
| shield-idle | 6 | 5 | 0 | 8 | 24 | 32 | 8/8 |  |
| archer-run | 6 | ≈8 | 6 | 12 | 15 | 21 | 5/6 |  |
| archer-idle | 6 | 5 | 0 | 8 | 24 | 32 | 8/8 |  |
| akindzija-run | 8 | ≈8 | 2 | 10 | 6 | 14 | 2/8 |  |
| akindzija-idle | 6 | 5 | 0 | 8 | 24 | 32 | 8/8 |  |
| oklopnik-idle | 6 | 5 | 0 | 6 | 18 | 24 | 6/6 |  |
| oklopnik-walk | 6 | — | 0 | 6 | 12 | 18 | 4/6 |  |
| palikuca-run | 6 | ≈8 | 2 | 8 | 6 | 12 | 2/6 |  |
| palikuca-idle | 6 | 5 | 0 | 10 | 30 | 40 | 10/10 |  |
| palikuca-burn | 6 | — | 0 | 6 | 9 | 15 | 3/6 |  |
| kopljanik-run | 8 | ≈8 | 7 | 15 | 21 | 29 | 7/8 |  |
| kopljanik-idle | 6 | 5 | 0 | 10 | 30 | 40 | 10/10 |  |
| tufekdzija-run | 8 | ≈8 | 2 | 10 | 6 | 14 | 2/8 |  |
| tufekdzija-idle | 6 | 5 | 0 | 6 | 18 | 24 | 6/6 |  |
| pas-run | 8 | ≈8 | 5 | 13 | 18 | 26 | 6/8 |  |
| pas-idle | 4 | 5 | 0 | 4 | 12 | 16 | 4/4 |  |
| musa-run | 6 | ≈6 | 5 | 11 | 15 | 21 | 5/6 |  |
| musa-idle | 6 | 5 | 0 | 6 | 18 | 24 | 6/6 |  |
| musa-mounted | 8 | po putu | 0 | 8 | 24 | 32 | 8/8 |  |
| marko-attack | 6 | — | 0 | 6 | 0 | 6 | 0/5 | tok ne prati pokret: drži nacrtane kadrove; udarac: priprema i kontakt bez međukadrova |
| marko-combo-1 | 6 | 16,7* | 0 | 6 | 9 | 15 | 3/5 | udarac: priprema i kontakt bez međukadrova |
| marko-combo-2 | 6 | 16,7* | 0 | 6 | 9 | 15 | 3/5 | udarac: priprema i kontakt bez međukadrova |
| marko-combo-3 | 6 | 12* | 0 | 6 | 3 | 9 | 1/5 | udarac: priprema i kontakt bez međukadrova |
| marko-combo-4 | 8 | 14,3 | 0 | 8 | 12 | 20 | 4/7 | udarac: priprema i kontakt bez međukadrova |
| marko-charged | 6 | 11,5 | 0 | 6 | 0 | 6 | 0/5 | tok ne prati pokret: drži nacrtane kadrove; udarac: priprema i kontakt bez međukadrova |
| marko-super | 6 | 6,3 | 0 | 6 | 3 | 9 | 1/5 | udarac: priprema i kontakt bez međukadrova |
| marko-counter | 8 | 14,5 | 0 | 8 | 0 | 8 | 0/7 | tok ne prati pokret: drži nacrtane kadrove; udarac: priprema i kontakt bez međukadrova |
| marko-run-attack | 6 | 16,7* | 0 | 6 | 3 | 9 | 1/5 | udarac: priprema i kontakt bez međukadrova |
| marko-air-1 | 5 | 16,7* | 0 | 5 | 3 | 8 | 1/4 | udarac: priprema i kontakt bez međukadrova |
| marko-air-2 | 5 | 14,7 | 0 | 5 | 3 | 8 | 1/4 | udarac: priprema i kontakt bez međukadrova |
| marko-uppercut | 6 | 14,3 | 0 | 6 | 3 | 9 | 1/5 | udarac: priprema i kontakt bez međukadrova |
| marko-dash-strike | 6 | 14,3 | 0 | 6 | 6 | 12 | 2/5 | udarac: priprema i kontakt bez međukadrova |
| marko-mounted-attack | 6 | — | 0 | 6 | 6 | 12 | 2/5 | udarac: priprema i kontakt bez međukadrova |
| marko-jump | 6 | po brzini | 0 | 6 | 0 | 6 | 0/5 | tok ne prati pokret: drži nacrtane kadrove |
| marko-jump-rise | 4 | 12,5 | 0 | 4 | 9 | 13 | 3/3 |  |
| marko-run-jump | 8 | 11,4 | 0 | 8 | 18 | 26 | 6/7 |  |
| marko-land | 4 | 20 | 0 | 4 | 6 | 10 | 2/3 |  |
| marko-roll | 6 | 17,6 | 0 | 6 | 0 | 6 | 0/5 | tok ne prati pokret: drži nacrtane kadrove |
| marko-roll-land | 6 | 14,3 | 0 | 6 | 0 | 6 | 0/5 | tok ne prati pokret: drži nacrtane kadrove |
| marko-block | 6 | po stanju | 0 | 6 | 15 | 21 | 5/5 |  |
| marko-block-hit | 4 | 18 | 0 | 4 | 6 | 10 | 2/3 |  |
| marko-crouch | 6 | po stanju | 0 | 6 | 9 | 15 | 3/5 |  |
| marko-drink | 6 | 7 | 0 | 6 | 15 | 21 | 5/5 |  |
| marko-hurt | 4 | 18 | 0 | 4 | 9 | 13 | 3/3 |  |
| marko-hurt-air | 4 | 18 | 0 | 4 | 3 | 7 | 1/3 |  |
| marko-death | 6 | ≈6,7 | 0 | 6 | 0 | 6 | 0/5 | tok ne prati pokret: drži nacrtane kadrove |
| marko-knockdown | 6 | 9 | 0 | 6 | 9 | 15 | 3/5 |  |
| marko-getup | 6 | 12 | 0 | 6 | 3 | 9 | 1/5 |  |
| marko-turn | 4 | 25 | 0 | 4 | 3 | 7 | 1/3 |  |
| marko-run-start | 4 | 22 | 0 | 4 | 9 | 13 | 3/3 |  |
| marko-run-stop | 4 | 15,4 | 0 | 4 | 6 | 10 | 2/3 |  |
| marko-combo-recover | 4 | 16,7 | 0 | 4 | 6 | 10 | 2/3 |  |
| marko-ledge | 8 | — | 0 | 8 | 3 | 11 | 1/7 |  |
| marko-walljump | 6 | — | 0 | 6 | 6 | 12 | 2/5 |  |
| marko-plunge | 6 | — | 0 | 6 | 0 | 6 | 0/5 | tok ne prati pokret: drži nacrtane kadrove |
| marko-kick | 6 | 16,7 | 0 | 6 | 9 | 15 | 3/5 | udarac: priprema i kontakt bez međukadrova |
| marko-slide | 6 | 12 | 0 | 6 | 9 | 15 | 3/5 |  |
| marko-lever | 6 | 12 | 0 | 6 | 15 | 21 | 5/5 |  |
| marko-throw | 8 | 16 | 0 | 8 | 15 | 23 | 5/7 |  |
| marko-crouch-throw | 6 | — | 0 | 6 | 9 | 15 | 3/5 |  |
| marko-pickup | 6 | 10 | 0 | 6 | 9 | 15 | 3/5 |  |
| marko-call | 6 | 8 | 0 | 6 | 15 | 21 | 5/5 |  |
| marko-open | 6 | 14,3 | 0 | 6 | 9 | 15 | 3/5 |  |
| marko-victory | 8 | ≈6 | 0 | 8 | 21 | 29 | 7/7 |  |
| marko-idle-3 | 12 | 4 | 0 | 13 | 36 | 49 | 12/12 |  |
| marko-idle-4 | 12 | 6 | 0 | 12 | 33 | 45 | 11/11 |  |
| marko-blasted | 6 | — | 0 | 6 | 3 | 9 | 1/5 |  |
| mounted-jump | 4 | po brzini | 0 | 4 | 0 | 4 | 0/3 | tok ne prati pokret: drži nacrtane kadrove |
| marko-finisher | 8 | — | 0 | 8 | 3 | 11 | 1/7 |  |
| marko-finisher-smash | 8 | — | 0 | 8 | 9 | 17 | 3/7 |  |
| marko-finisher-throw | 8 | — | 0 | 8 | 18 | 26 | 6/7 |  |
| marko-finisher-stomp | 8 | — | 0 | 8 | 3 | 11 | 1/7 |  |
| marko-finisher-legs | 8 | — | 0 | 8 | 0 | 8 | 0/7 | tok ne prati pokret: drži nacrtane kadrove |
| marko-finisher-skull | 8 | — | 0 | 8 | 0 | 8 | 0/7 | tok ne prati pokret: drži nacrtane kadrove |
| marko-brutal | 8 | — | 0 | 8 | 21 | 29 | 7/7 |  |
| marko-tiho | 7 | — | 0 | 7 | 12 | 19 | 4/6 |  |
| marko-sablja-izvlaci | 6 | — | 0 | 6 | 15 | 21 | 5/5 |  |
| marko-sablja-vraca | 5 | — | 0 | 5 | 12 | 17 | 4/4 |  |
| marko-sablja-udarac-1 | 6 | — | 0 | 6 | 6 | 12 | 2/5 |  |
| marko-sablja-udarac-2 | 6 | — | 0 | 6 | 15 | 21 | 5/5 |  |
| marko-sablja-udarac-3 | 7 | — | 0 | 7 | 9 | 16 | 3/6 |  |
| marko-sablja-skok | 6 | — | 0 | 6 | 3 | 9 | 1/5 |  |
| marko-sablja-tezak | 7 | — | 0 | 7 | 6 | 13 | 2/6 |  |
| marko-sablja-ubod | 6 | — | 0 | 6 | 6 | 12 | 2/5 |  |
| marko-sablja-uvis | 6 | — | 0 | 6 | 0 | 6 | 0/5 | tok ne prati pokret: drži nacrtane kadrove |
| sword-attack | 6 | 3,5–4,3 | 0 | 6 | 6 | 12 | 2/5 | udarac: priprema i kontakt bez međukadrova |
| sword-hurt | 4 | 11,8 | 0 | 4 | 0 | 4 | 0/3 | tok ne prati pokret: drži nacrtane kadrove |
| sword-death | 6 | ≈6,7 | 0 | 6 | 6 | 12 | 2/5 |  |
| sword-jump | 6 | po brzini | 0 | 6 | 9 | 15 | 3/5 |  |
| sword-launch | 6 | po brzini | 0 | 6 | 3 | 9 | 1/5 |  |
| sword-lunge | 6 | — | 0 | 6 | 15 | 21 | 5/5 |  |
| shield-attack | 6 | 3,5–4,3 | 0 | 6 | 3 | 9 | 1/5 | udarac: priprema i kontakt bez međukadrova |
| shield-hurt | 4 | 11,8 | 0 | 4 | 6 | 10 | 2/3 |  |
| shield-death | 6 | ≈6,7 | 0 | 6 | 3 | 9 | 1/5 |  |
| shield-jump | 6 | po brzini | 0 | 6 | 12 | 18 | 4/5 |  |
| shield-launch | 6 | po brzini | 0 | 6 | 3 | 9 | 1/5 |  |
| shield-bash | 6 | — | 0 | 6 | 3 | 9 | 1/5 |  |
| shield-guardbreak | 4 | — | 0 | 4 | 3 | 7 | 1/3 |  |
| archer-shoot | 6 | 3,5–4,3 | 0 | 6 | 6 | 12 | 2/5 | udarac: priprema i kontakt bez međukadrova |
| archer-shoot-down | 6 | — | 0 | 6 | 15 | 21 | 5/5 |  |
| archer-hurt | 4 | 11,8 | 0 | 4 | 3 | 7 | 1/3 |  |
| archer-death | 6 | ≈6,7 | 0 | 6 | 0 | 6 | 0/5 | tok ne prati pokret: drži nacrtane kadrove |
| archer-jump | 6 | po brzini | 0 | 6 | 6 | 12 | 2/5 |  |
| archer-launch | 6 | po brzini | 0 | 6 | 3 | 9 | 1/5 |  |
| archer-kick | 6 | — | 0 | 6 | 9 | 15 | 3/5 |  |
| akindzija-hurt | 4 | 11,8 | 0 | 4 | 0 | 4 | 0/3 | tok ne prati pokret: drži nacrtane kadrove |
| akindzija-death | 6 | ≈6,7 | 0 | 6 | 6 | 12 | 2/5 |  |
| akindzija-jump | 6 | po brzini | 0 | 6 | 0 | 6 | 0/5 | tok ne prati pokret: drži nacrtane kadrove |
| akindzija-launch | 6 | po brzini | 0 | 6 | 0 | 6 | 0/5 | tok ne prati pokret: drži nacrtane kadrove |
| akindzija-spin | 6 | — | 0 | 6 | 0 | 6 | 0/5 | tok ne prati pokret: drži nacrtane kadrove |
| akindzija-charge | 6 | — | 0 | 6 | 0 | 6 | 0/5 | tok ne prati pokret: drži nacrtane kadrove |
| akindzija-backstep | 4 | — | 0 | 4 | 6 | 10 | 2/3 |  |
| oklopnik-hurt | 4 | 11,8 | 0 | 4 | 9 | 13 | 3/3 |  |
| oklopnik-death | 6 | ≈6,7 | 0 | 6 | 6 | 12 | 2/5 |  |
| oklopnik-jump | 6 | po brzini | 0 | 6 | 12 | 18 | 4/5 |  |
| oklopnik-launch | 6 | po brzini | 0 | 6 | 3 | 9 | 1/5 |  |
| oklopnik-armorbreak | 4 | — | 0 | 4 | 9 | 13 | 3/3 |  |
| oklopnik-slam | 6 | — | 0 | 6 | 6 | 12 | 2/5 |  |
| oklopnik-rush | 6 | — | 0 | 6 | 12 | 18 | 4/5 |  |
| oklopnik-grab | 6 | — | 0 | 6 | 6 | 12 | 2/5 |  |
| palikuca-hurt | 4 | 11,8 | 0 | 4 | 3 | 7 | 1/3 |  |
| palikuca-death | 6 | ≈6,7 | 0 | 6 | 3 | 9 | 1/5 |  |
| palikuca-jump | 6 | po brzini | 0 | 6 | 6 | 12 | 2/5 |  |
| palikuca-launch | 6 | po brzini | 0 | 6 | 3 | 9 | 1/5 |  |
| palikuca-bomb | 6 | — | 0 | 6 | 9 | 15 | 3/5 |  |
| palikuca-torch | 6 | — | 0 | 6 | 9 | 15 | 3/5 |  |
| palikuca-fire | 6 | — | 0 | 6 | 9 | 15 | 3/5 |  |
| kopljanik-attack | 8 | 3,5–4,3 | 0 | 8 | 12 | 20 | 4/7 | udarac: priprema i kontakt bez međukadrova |
| kopljanik-hurt | 4 | 11,8 | 0 | 4 | 3 | 7 | 1/3 |  |
| kopljanik-death | 8 | ≈6,7 | 0 | 8 | 9 | 17 | 3/7 |  |
| kopljanik-jump | 6 | po brzini | 0 | 6 | 9 | 15 | 3/5 |  |
| kopljanik-launch | 6 | po brzini | 0 | 6 | 0 | 6 | 0/5 | tok ne prati pokret: drži nacrtane kadrove |
| kopljanik-sweep | 6 | — | 0 | 6 | 9 | 15 | 3/5 |  |
| tufekdzija-shoot | 8 | 3,5–4,3 | 0 | 8 | 15 | 23 | 5/7 | udarac: priprema i kontakt bez međukadrova |
| tufekdzija-hurt | 4 | 11,8 | 0 | 4 | 0 | 4 | 0/3 | tok ne prati pokret: drži nacrtane kadrove |
| tufekdzija-death | 8 | ≈6,7 | 0 | 8 | 9 | 17 | 3/7 |  |
| tufekdzija-jump | 6 | po brzini | 0 | 6 | 12 | 18 | 4/5 |  |
| tufekdzija-launch | 6 | po brzini | 0 | 6 | 3 | 9 | 1/5 |  |
| tufekdzija-butt | 6 | — | 0 | 6 | 12 | 18 | 4/5 |  |
| pas-attack | 6 | 3,5–4,3 | 0 | 6 | 6 | 12 | 2/5 | udarac: priprema i kontakt bez međukadrova |
| pas-hurt | 4 | 11,8 | 0 | 4 | 3 | 7 | 1/3 |  |
| pas-death | 6 | ≈6,7 | 0 | 6 | 6 | 12 | 2/5 |  |
| pas-launch | 6 | po brzini | 0 | 6 | 3 | 9 | 1/5 |  |
| musa-attack | 6 | 3,2 | 0 | 6 | 0 | 6 | 0/5 | tok ne prati pokret: drži nacrtane kadrove; udarac: priprema i kontakt bez međukadrova |
| musa-hurt | 4 | 11,8 | 0 | 4 | 3 | 7 | 1/3 |  |
| musa-death | 6 | ≈6,7 | 0 | 6 | 3 | 9 | 1/5 |  |
| musa-mounted-strike | 6 | — | 0 | 6 | 12 | 18 | 4/5 |  |
| musa-sword | 6 | 3–10 | 0 | 6 | 3 | 9 | 1/5 |  |
| musa-grab | 6 | — | 0 | 6 | 6 | 12 | 2/5 |  |
| musa-throw-up | 8 | — | 0 | 8 | 15 | 23 | 5/7 |  |
| musa-stomp | 6 | — | 0 | 6 | 6 | 12 | 2/5 |  |
| musa-roar | 6 | — | 0 | 6 | 15 | 21 | 5/5 |  |
| musa-block | 6 | — | 0 | 6 | 9 | 15 | 3/5 |  |
| **ukupno (179 klipova)** | **1102** | | **55** | **1172** | **1743** | **2860** | | |
