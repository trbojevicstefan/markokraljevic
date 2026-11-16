# Noć 15. na 16. 11. 2026: svaki protivnik svog stila

Stefan (15. 11., kasno uveče): „Nastavi preko noći na svakih sat vremena po jedno poboljšanje na igrici i commit. Najbitniji je gameplay: svaki protivnik drugačijeg stila, da nije svaka bitka ista, da mogu brzo da se pomeraju i imaju neke svoje udarce. Još mašte i raznovrsnosti.”

**Pravila svakog sata:**
- Jedna stavka sa spiska.
- Kod je u `dist/game.js`, sa CRLF; zamena tačnim stringom koji se nađe tačno jednom.
- Nove poteze dobija `MOVES` / `FOES`, sa jasnim znakom napada: zlatan znak se odbija (L), crven krst se izmiče.
- Tekst ide i na engleski (`dist/i18n.js`).
- Test u `protivnici-test.mjs` ili `napredak-test.mjs`.
- Ceo lanac testova: `npm run check && npm test && node animation-tests.mjs && node simulation-test.mjs`.
- Zatim `git commit`, bez push-a.
- Ako lanac ne prođe i ne može se popraviti, izmene tog sata se vraćaju, a ovde se upisuje zašto.

**Ne dirati:**
- tuđe fajlove (`art/world-pack-03/*dopuna41*`, `replace-pecina-scene.py`);
- naslovni meni;
- naručivanje od Codexa (noćas samo kod, bez novih crteža).

Postojeći potezi (pre noći):
- sabljaš: iskorak;
- štitonoša: udar štitom;
- kopljanik: nizak zamah;
- strelac: šut;
- tufekdžija: kundak;
- akindžija: juriš i skok;
- oklopnik: tresak i zalet;
- palikuća: baklja i vatra.

Stefan, isto veče: „Možemo da radimo zoom in kad radimo fatality, brutality i finishing moves. Unesi raznolikosti u igru, pogotovo kod sinematik događaja; toga nam fali. Radi preko noći, ne pitaj ništa, i objavljuj ture kako ih radiš.” Zato posle svakog commit-a ide i `git push origin main`.

Urađeno pre noći:
- more na Urvini i kamera koja prati topuz;
- zum sa filmskim trakama kod završnog udarca, brutalnosti i pada bosa.

## Filmski spisak (naizmenično sa protivnicima: jedan sat film, jedan sat protivnik)

F1. ✔ **Kill-cam:** poslednji dušmanin čete, odbrane ili zemlje pada usporeno, uz zum i kratak zvuk zvona.
F2. ✔ **Uvod megdana:** kamera pređe sa bosa na Marka, a preko ekrana se ispiše ime bosa velikim slovima i podnaslov (kao u Sekiro i Hollow Knight).
F3. ✔ **Tiho obaranje:** zum, a boje izblede za trenutak.
F4. ✔ **Junački udar (R):** kratko zamrznut kadar, zum i crvena crta preko ekrana pre udara.
F5. ✔ **Kad Marko padne:** usporenje, zum i sepija pre ekrana „Ustani, junače”.
F6. ☐ **Ulazak u novu zemlju:** naslovna kartica preko ekrana (ime pohoda i stih iz pesme), uz trake.
F7. ☐ **Faze bosa:** kod druge i treće faze kamera se trgne na bosa, sa kratkim zumom i natpisom faze.
F8. ☐ **Kontra (savršeno odbijanje):** trenutno usporenje i bljesak, a kamera priđe za tren.

## Spisak protivnika (po redu; ✔ kad je gotovo, sa commit-om)

1. ✔ **Sabljaš: varka i dvostruki rez.** Ponekad zamahne pa stane (lažni zamah, bez štete). Kad Marko odbije u prazno, odmah udari pravi rez iz dva poteza. Brži korak unazad posle udarca.
2. ✔ **Strelac: drži razdaljinu.** Kad mu Marko priđe, odskoči unazad (salto) i zapne luk. Povremeno ispali kišu strela uvis, koja pada na mesto gde je Marko stajao (senke na zemlji upozore).
3. ✔ **Kopljanik: dugi ubod i zid koplja.** Dugi ubod napred preko pola ekrana (zlatni znak, odbija se). Kad je ranjen, stane u gard sa kopljem napred: s prednje strane ga ne probiješ, treba skok preko ili udar nadole.
4. ✔ **Akindžija: munja.** Kratki trzaj u stranu (izmicanje) kad Marko zamahne. Brz zalet kroz Marka na drugu stranu, pa udarac s leđa (crven krst: izmakni).
5. ☐ **Palikuća: vatreni zid.** Baci tri boce u lepezi, a vatra na zemlji gori nekoliko sekundi i deli bojište. Pobegne kad je Marko blizu.
6. ☐ **Oklopnik: kovitlac.** Dva okreta sa buzdovanom (široko, crven krst). Posle toga ostane zadihan i otvoren dve sekunde. Hvata Marka ako stoji predugo u bloku.
7. ☐ **Štitonoša: kornjača i guranje.** Kad mu se štit pogodi tri puta zaredom, gurne Marka unazad i zakorači. Iza štita baca kratki nož.
8. ☐ **Tufekdžija: nišan.** Pre pucnja crvena linija nišana jednu sekundu; Marko se skloni ili čučne. Posle pucnja puni pušku (dve sekunde otvoren).
9. ☐ **Pas: čopor.** Psi kruže oko Marka i napadaju jedan po jedan sa strane; skok-ugriz; kad jedan padne, ostali zastanu i zarežu.
10. ☐ **Elitni dodaci (u duhu Diablo/Hades).** Elitni protivnik dobija jednu osobinu, napisanu nad trakom zdravlja:
    - **Hitar:** brži za 35 %;
    - **Gvozden:** prvi udarac ne prolazi;
    - **Besan:** ispod pola zdravlja brži i jači;
    - **Senovit:** posle udarca nestane i pojavi se iza Marka.
11. ☐ **Kretanje protivnika:** brže prilaženje (sprint kad su daleko), izmicanje unazad posle promašaja, skok na platformu za Markom, kratki bočni korak.
12. ☐ **Kombinovane čete:** strelac iza štitonoše; kopljanik drži dok sabljaš ulazi; palikuća pali, oklopnik gura u vatru.

## Dnevnik noći

(svaki sat jedan red: vreme, stavka, commit, šta je provereno)
- 00:40 · F1 kill-cam: poslednji dušmanin prave bitke (3 pala za 12 s, niko živ u blizini) pada usporeno, kamera priđe, zvono, „DRUM JE ČIST” (`killCam` u `slay`). Provereno: `napredak-test.mjs` (prva tri pada bez usporenja, poslednji sa usporenjem i zumom) i ceo lanac.
- 02:04 · Protivnik 1, sabljaš: u otprilike četvrtini zamaha varka (zamahne, zastane, spusti sablju, „VARKA!”). Ko odbije u prazno, odmah dva reza sa crvenim krstom; prvi čeka da Markovo odbijanje istekne. Posle običnog udarca brz korak unazad (`varkaKraj`, `sabljasTick`, `p.parryAt`). Provereno: 7 novih provera u `protivnici-test.mjs`, ceo lanac i slika iz igre (drugi rez, crven krst).
- 02:56 · F2 uvod megdana: pri ulasku u borilište kamera pređe na bosa i posle sekunde se vrati na Marka, uz blagi zum. Preko ekrana ide ime bosa velikim slovima u jednom redu i podnaslov za svakog od 14 megdana (npr. Crni vrač, „senka iz jaruge”), u crvenom tonu (`megdanUvod`, `uvodTick`, `#title-card.megdan`). Bos sačeka 1,3 s pre prvog poteza. Kamera se oslobađa i kad bos nestane ili počne nov nivo. Provereno: 7 provera u `napredak-test.mjs`; `battles-test` i `megdani-test` sačekaju kraj uvoda pre provera ponašanja bosa; ceo lanac i slika iz igre.
- 03:49 · Protivnik 2, strelac: kad mu Marko priđe na 150, salto unazad (prevrne se oko sredine tela, crtež `archer-jump`), pa odmah zapne luk (zamah ×0,55). Odmor između salta je 4,5 s. Izdaleka (220–700) u 40 % zamaha pušta kišu strela uvis: crven znak, pet strela pada posle 1,15 s gde je Marko stajao, a senke na zemlji upozore. Kiša ima odmor od 7 s; strelci na kulama je nemaju, da ostane vraćanje strele (`strelacTick`, `kisaStrela`, `kiseTick`, `drawKise`). Provereno: 10 provera u `protivnici-test.mjs` (salto, brz luk, odmor, retkost kiše, pogađa onog ko stoji, promaši onog ko se skloni), ceo lanac i slika iz igre.
- 04:46 · F3 tiho obaranje: zum 1,4 umesto 1,3, a boje izblede (saturacija pada na oko 0,2, slika malo potamni) i ivice slike se zamrače dok traje tiho obaranje; posle se lagano vrate (`bledoTick`, `#game-shell.tiho .vignette`). Na telefonu (LITE) samo tamne ivice, bez filtera preko cele slike. Provereno: 3 provere u `napredak-test.mjs` (boje izblede, vrate se, glasan završni udarac ostaje u boji), ceo lanac i slika pravog tihog obaranja u selu.
- 05:53 · Protivnik 3, kopljanik. Dugi ubod: izdaleka (250–620) zlatni znak, pa juriš kopljem preko pola ekrana; šteta 22, može se odbiti, odmor 5,5 s. Zid koplja: ispod pola zdravlja stane u gard na 2,6 s (odmor 6 s). Spreda ga ništa ne probija i bocka onog ko stoji pred kopljem. Skok i udarac odozgo prolaze, a udarac s leđa ruši gard. Okreće se sporo (0,6 s), pa ima vremena da ga Marko preskoči (`kopljanikTick`, gard u `foeDefense`). Usput: vetar u prevoju više ne gura Marka u skoku. Gurao ga je jače nego na zemlji (230), pa je udar usred skoka obarao u jamu; zbog toga je `road-test` povremeno padao u prevoju. Provereno: 8 provera u `protivnici-test.mjs`, ceo lanac i slika iz igre.
- 06:46 · F4 junački udar: na 40 % zamaha, kad je topuz najviše, kadar stane 0,32 s (`hitstop`; sa smanjenim efektima 0,12 s). Slika se zumira na Marka (1,35), a crvena crta preseče ceo ekran uz tamnocrven obod (`junakTick`, `#junak-crta` u hud.css). Zum radi i dok kadar stoji. Udarac pada tek posle. Provereno: 4 provere u `napredak-test.mjs`; u `simulation-test` čekanje na pogodak junačkog udara produženo za zamrznut kadar (55 → 95 kadrova); ceo lanac i slika iz igre.
- 07:47 · Protivnik 4, akindžija. Munja: kad Marko zamahne prema njemu, u 40 % slučajeva se u trenu trgne nazad (oko 95 px za 0,13 s), uz providni trag; odmor 2,4 s. Prolaz: crven krst, pa juri kroz Marka na drugu stranu (900 px/s; ne gura ga i ne staje pred njim), okrene se i posle 0,32 s udari s leđa, takođe pod crvenim krstom. Odmor između prolaza 5,5 s (`akindzijaTick`, `e.prolaz`, `e.trag`). Provereno: 7 provera u `protivnici-test.mjs` (munja, zalet, prolaz na drugu stranu bez štete, udarac s leđa pogađa onog ko stoji, kolut u pravom trenutku izbegne), ceo lanac i slika iz igre.
- 08:53 · F5 kad Marko padne: prvih 0,8 s pada teče upola brzine, slika se zumira na njega (1,32) i lagano pređe u sepiju; sepija ostaje i pod ekranom „Ustani, junače”. Na putu se boje brzo vraćaju (`die` → `kino`, `sepija` u `bledoTick`, `kinoTick` radi i dok je igra u stanju smrti). Ekran „Ustani, junače” stiže posle oko 2,35 s umesto 1,55 s. Provereno: 5 provera u `napredak-test.mjs`; u `simulation-test` čekanje na ekran produženo za usporen pad (210 → 300 kadrova); ceo lanac i slika pravog pada u selu (sepija, zum, trake).
