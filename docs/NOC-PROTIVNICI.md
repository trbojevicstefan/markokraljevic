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

F1. ☐ **Kill-cam:** poslednji dušmanin čete, odbrane ili zemlje pada usporeno, uz zum i kratak zvuk zvona.
F2. ☐ **Uvod megdana:** kamera pređe sa bosa na Marka, a preko ekrana se ispiše ime bosa velikim slovima i podnaslov (kao u Sekiro i Hollow Knight).
F3. ☐ **Tiho obaranje:** zum, a boje izblede za trenutak.
F4. ☐ **Junački udar (R):** kratko zamrznut kadar, zum i crvena crta preko ekrana pre udara.
F5. ☐ **Kad Marko padne:** usporenje, zum i sepija pre ekrana „Ustani, junače”.
F6. ☐ **Ulazak u novu zemlju:** naslovna kartica preko ekrana (ime pohoda i stih iz pesme), uz trake.
F7. ☐ **Faze bosa:** kod druge i treće faze kamera se trgne na bosa, sa kratkim zumom i natpisom faze.
F8. ☐ **Kontra (savršeno odbijanje):** trenutno usporenje i bljesak, a kamera priđe za tren.

## Spisak protivnika (po redu; ✔ kad je gotovo, sa commit-om)

1. ☐ **Sabljaš: varka i dvostruki rez.** Ponekad zamahne pa stane (lažni zamah, bez štete). Kad Marko odbije u prazno, odmah udari pravi rez iz dva poteza. Brži korak unazad posle udarca.
2. ☐ **Strelac: drži razdaljinu.** Kad mu Marko priđe, odskoči unazad (salto) i zapne luk. Povremeno ispali kišu strela uvis, koja pada na mesto gde je Marko stajao (senke na zemlji upozore).
3. ☐ **Kopljanik: dugi ubod i zid koplja.** Dugi ubod napred preko pola ekrana (zlatni znak, odbija se). Kad je ranjen, stane u gard sa kopljem napred: s prednje strane ga ne probiješ, treba skok preko ili udar nadole.
4. ☐ **Akindžija: munja.** Kratki trzaj u stranu (izmicanje) kad Marko zamahne. Brz zalet kroz Marka na drugu stranu, pa udarac s leđa (crven krst: izmakni).
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
