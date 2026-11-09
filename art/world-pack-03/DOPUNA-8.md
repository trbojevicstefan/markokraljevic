# Dopuna 8 (od Claude-a) — još animacija za Marka, da bude fluidniji

Radi se u posebnoj Codex sesiji, paralelno sa DOPUNA-6 i DOPUNA-7 (rukopis i minijature). Napredak upisuj u `art/world-pack-03/STATUS-ANIMACIJE.md`, NE u STATUS.md, da se dve sesije ne sudaraju. Ništa urađeno ne briši.

**Pravila kao u DOPUNA-5:**
- Svaki klip ide u `art/animation-pack-04/assets/<klip>/` i ima atlas, manifest, frames i preview.gif.
- Ćelije su 512×512, Marko okrenut udesno.
- Isti zum i ista visina kao `marko-idle` i `marko-idle-2`.
- Oslonac stopala je na y=487.
- Isti lik: crni brkovi, crveni plašt, verižnjača, topuz sa šiljcima.
- Susedni kadrovi se glatko nastavljaju: bez skokova glave, bez okretanja ka kameri, plašt se kreće sa inercijom.
- Klipovi u petlji se glatko spajaju (poslednji kadar u prvi).
- Klipovi koji se puštaju jednom počinju i završavaju se u stavu iz kadra 1 klipa `marko-idle-2`, osim ako opis kaže drugačije.

Redosled je po važnosti:

| Klip | Kadrova | Opis |
|---|---|---|
| `marko-walk` | 8, petlja | Spor hod, opušten: topuz nisko u desnoj ruci, ramena se ljuljaju, plašt se njiše. Koraci su upola kraći od trka. |
| `marko-run-stop` | 4, jednom | Kočenje iz trka: telo se zabaci unazad, pete zariju, plašt poleti napred, pa se ispravi u stav. |
| `marko-fall` | 4, petlja | Pad posle vrha skoka: ruke raširene za ravnotežu, plašt se diže iznad ramena, noge spremne za doskok. |
| `marko-jump-rise` | 4, jednom | Odraz i penjanje: kolena se podižu, topuz ide uvis, plašt visi nadole. Završava se u vrhu skoka. |
| `marko-idle-3` | 12, jednom | Duži odmor: spusti topuz na rame, pogleda levo-desno (glava ostaje iz profila), zavrne brk, vrati se u stav. |
| `marko-run-attack` | 6, jednom | Udarac u trku bez zaustavljanja: kosi zamah topuzom napred-nadole, noge nastavljaju korak. |
| `marko-block-hit` | 4, jednom | Primi udarac na blok: ruka i topuz se trgnu unazad, stopala kliznu, vrati se u blok (`marko-block` kadar 3). |
| `marko-hurt-air` | 4, jednom | Pogođen u vazduhu: telo se izvije, topuz poleti u stranu, plašt se zavrti. |
| `marko-combo-recover` | 4, jednom | Posle trećeg udarca niza: povuče topuz nazad, uspravi se i vrati u stav. |
| `marko-roll-land` | 6, jednom | Doskok sa velike visine u kolut, pa ustajanje. |
| `marko-victory` | 8, jednom | Kraj pohoda: podigne topuz visoko iznad glave, plašt leprša, pa ga spusti na rame. Završava se ponosno, sa topuzom na ramenu. |
| `marko-open` | 6, jednom | Saginje se do kovčega ili predmeta, posegne nadole i uspravi se. |

Codex sesija za ovu listu (fork): `01a1bfb7-c1bf-7370-80b1-d1fc0457eead`. Rukopis i minijature rade u `01a1bd68-2fcf-7023-b45f-bba9e4d3c10e`.
