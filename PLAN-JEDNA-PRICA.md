# Plan: jedna priča, bogata igra (Stefan, 13. 11. 2026)

Stefanov spisak (njegove reči, sažeto): pratiti priču (vilu imamo pre nego što je sretnemo u njenoj šumi); veštine iz V2 (juriš u vazduhu, lanac...) da se nalaze na mapi; nivoi još veći; protivnici jači, malobrojniji i nekad u tandemu; kod jahanja Šarca pred Musom zemlja da puca dok trčimo, a ne da rupe postoje unapred; zameniti kapije sa crkvom na vrhu; „time eventovi" i kuke; Marku sve veštine iz V2, popraviti animacije sa sabljom i dati sablji drugačije poteze od topuza; početni ekran kao prava AAA igra; uzor Prince of Persia; optimizacija; uvale i bregovi sa asetima; tajne sobe (merdevine ne smeju da vire i odaju ih), bolji napukli zid; bar jedan nivo u zatvorenom; narator na početku da stane kad se preskoči ili izađe u meni; sve u jednu priču, ne „pesme o Marku" i „pohodi"; produženi nivoi sa svim novinama.

Stanje se upisuje ovde posle svake faze (✔ gotovo i objavljeno, ◐ u toku, ☐ nije počelo).

## Faze

0. ✔ **Narator** (13. 11.): svaki glas uvoda, čitanje pesme i zakazane replike staju na preskakanje i na izlaz u meni (`stopNarration`). Grešku nisam uspeo da ponovim u pregledaču (uvod iz menija i Esc su stajali i pre), pa je ovo zaštita za sve puteve; ako se i dalje čuje, treba tačno mesto.
1. ✔ **V2 u V1** (13. 11., commit 0265efa, objavljeno): spojeno, svi testovi prolaze (i `greybox-test`, `greybox-pohodi-test`, `megdani-test`). Nivoi iz V2 su za sada pod dugmetom „Junački pohodi” u meniju i izgledaju sivo dok im se ne dodele slike; moći iz V2 važe tamo gde su nađene. Za kasnije: `assets/pola` nema lake verzije za klipove nacrtane posle V2 (igra tada uzme punu sliku, uz 404 u konzoli). Šta je ušlo: trostrano spajanje koda `752c729 → realisticni-svet` na sadašnji V1 (`dist/game.js`, `world.js`, `i18n.js`, `index.html`: po jedan sukob), novi fajlovi (`dist/greybox*.js`, testovi), crteži novih poteza u `dist/assets`, rig ponovo izgrađen. Time u V1 ulaze: Ravijojlin lanac i kuke, trk po zidu, klizanje, vazdušni kombo, Vilinsko oko, amajlije i izvori, moći koje se nalaze u svetu (Sokolovo krilo, juriš u vazduhu, Vilin trag, Potres, Šarčev gaz), padine, nivoi na više spratova sa tajnim sobama (Podgrađe, Markove kule, Azačka kula).
2. ☐ **Jedna priča**: jedan niz poglavlja na jednoj mapi (pohodi, megdan na Kačaniku i nivoi iz V2 zajedno, bez dva jezička). Vila se pridružuje tek posle svoje šume: do tada savete daje guslar, E ne zove vilu. Moći se nalaze na oltarima u nivoima, ne dobijaju se same.
3. ☐ **Protivnici**: jači i malobrojniji; tandemi (štitonoša zaklanja strelca, kopljanik drži dok janičar zaobilazi, oklopnik i palikuća).
4. ☐ **Šarac pred Musom**: zemlja puca i ruši se dok jašemo; rupe ne postoje unapred.
5. ☐ **Sablja**: svoji potezi, različiti od topuza; ispravljene animacije (šta fali naručiti od Codexa).
6. ☐ **Nivoi**: duži i širi, bregovi i uvale gde ima smisla (aseti), tajne sobe sa skrivenim merdevinama, bolji napukli zid, bar jedan nivo u zatvorenom, zamena kapija sa crkvom na vrhu.
7. ☐ **Time eventovi** (trenuci sa tasterom na vreme) u megdanima i na prelomnim mestima priče.
8. ☐ **Početni ekran** kao velika igra; **optimizacija** (učitavanje, crtanje).

## Pravila rada

- Radi se u `marko-noc`, objavljuje `git push origin noc-poliranje:main` posle testova; u `marko-game` se ne piše.
- Posle svake faze: ceo skup testova, snimci iz igre, README, pa objava.
- Crteže koji fale naručujem sam (vidi `art/world-pack-03/DOPUNA-46.md` i dalje): najslabiji model za jedan lik sa pravim uzorom, jači samo gde najslabiji dvaput ne uspe.
