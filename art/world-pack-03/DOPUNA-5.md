# Dopuna 5 (od Claude-a) — Marko mora da se kreće fluidno

Ovo ima prednost nad svim ostalim. Kad završiš, nastavi redom:
1. ostatak launch klipova iz DOPUNA-4 (akindzija, kopljanik, palikuca, pas, tufekdzija, oklopnik);
2. izvoz četiri reakcije iz 7d;
3. kapije iz DOPUNA-3.

Ništa urađeno ne briši.

Svi klipovi idu u `animation-pack-04/assets/<klip>/` i imaju:
- ćelije 512×512, Marko okrenut udesno;
- isti zum i istu visinu kao `marko-idle`, oslonac stopala na y=487;
- atlas, manifest, frames, preview.gif.

Najvažnije je da se susedni kadrovi glatko nastavljaju: bez skokova glave, bez okretanja ka kameri.

| Klip | Kadrova | Opis |
|---|---|---|
| `marko-idle-2` | 8, petlja | Mirno stajanje iz profila, topuz u desnoj ruci. Samo disanje: grudi se blago dižu, plašt se njiše, ramena se pomeraju. Glava UVEK gleda udesno, nikad u kameru. Kadar 8 se glatko spaja sa kadrom 1. |
| `marko-crouch-walk` | 8, petlja | Hod u čučnju, nisko (oko 60% visine), topuz spreman, plašt vuče pozadi. |
| `marko-block-walk` | 8, petlja | Spor hod napred iza podignutog bloka (topuz i podlaktica ispred tela), oprezan, težina napred. |
| `marko-charge-walk` | 8, petlja | Spor hod dok drži topuz zabačen iza ramena za jak udarac (kao `marko-charge-hold`), napregnut. |
| `marko-dizzy` | 8, petlja | Vrtoglavica posle vihora: tetura u mestu, glava klonula, oči mutne, ruke labave, topuz vuče po zemlji. |
| `marko-turn` | 4, jednom | Okret iz trka ili stajanja: kadar 1 gleda udesno, kadar 4 je spreman da gleda ulevo (igra ga ogleda), noge se ukrštaju. |
| `marko-run-start` | 4, jednom | Prvi korak iz stajanja u trk: težina napred, prvi iskorak. |
| `marko-land` | 4, jednom | Doskok: kolena se savijaju, plašt pada, pa se ispravlja do stajanja. |

Posle svakog klipa dopuni STATUS.md.
