# Dopuna 3 (od Claude-a) — HITNO: kapije iz profila

Uradi ovo odmah, pre nastavka. Kad završiš, vrati se tačno tamo gde si stao (STATUS.md) i nastavi listu. Ništa od urađenog ne briši i ne prepravljaj.

## Problem
Igra je 2D: Marko trči sleva nadesno (ka istoku). Sadašnje kapije (`cilj-kapija-*`, `cilj-rudarski-izlaz-*`, `prop-kapija-tvrdjava`) nacrtane su spreda, kao da se kroz njih ulazi u ekran (ka severu). Kroz kapiju koja prepreči put mora da se prolazi **sleva nadesno**, zato je treba nacrtati **iz profila**.

## Prolazne kapije, pogled sa strane
Put ide sleva nadesno kroz prolaz. Platno 1024×1024, providno, dno slike je hodna linija puta (tlo se ne crta). Prolaz je u sredini, visok bar 420 px i širok 220–300 px. Kroz prolaz se vidi providna pozadina, ne zid.

| Fajl | Šta je |
|---|---|
| `prolaz-kamen-zatvoren`, `prolaz-kamen-otvoren` | kamena kula-kapija tvrđave iz profila: dva debela kamena stuba (levi i desni zid kule), lučni svod gore, gvozdena rešetka (portkulis). Zatvoren: rešetka spuštena do zemlje. Otvoren: rešetka podignuta u svod, ispod se vidi prolaz. |
| `prolaz-drvo-zatvoren`, `prolaz-drvo-otvoren` | seoska kapija od balvana iz profila: dva stuba s krovićem iznad prolaza, teška drvena rešetka od greda. Zatvoren: spuštena. Otvoren: podignuta pod krović. |
| `prolaz-rudnik-zatvoren`, `prolaz-rudnik-otvoren` | izlaz iz rudnika iz profila: drvena podgrada (stubovi i greda), gvozdena rešetka. Zatvoren: spuštena. Otvoren: podignuta. |
| `resetka` | sama gvozdena rešetka, 512×1024, providna, vertikalne šipke sa šiljcima dole (igra je sama podiže) |

U katalog upiši za svaku `passX0`, `passX1` (gde je prolaz po x u slici) i `archY` (donja ivica svoda).

## Ulaz u odaju, pogled spreda (tu se ulazi u ekran)
| Fajl | Šta je |
|---|---|
| `ulaz-riznica`, `ulaz-riznica-otvoren` | kamena fasada male kule ili ugla zida, okrenuta ka gledaocu, s lučnim okovanim vratima. Zatvoren: vrata zaključana teškom rezom. Otvoren: vrata otvorena, unutra topla svetlost baklji. Platno 1024×1024, dno je tlo, vrata visoka oko 40% slike. |

## Posle ovoga
Upiši u STATUS.md da je gotovo, pa nastavi tamo gde si stao: ostatak prioriteta 7 iz DOPUNA-2.md i sve što je još ostalo iz ZADATAK.md i DOPUNA.md.
