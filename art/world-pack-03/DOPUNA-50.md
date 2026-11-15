# Dopuna 50 (od Claude-a, noć 14/15. 11.): kralj Vukašin, bela crkva Samodreža i bilje sa Miroča

Za dve pesme koje su noćas ušle u igru: „Uroš i Mrnjavčevići” (kralj Vukašin goni Marka oko crkve Samodreže i udari handžarom po direku) i „Marko Kraljević i vila” (vila bere bilje po Miroču). Sada se kralj crta prefarbanim Markom sa krunom iz koda, crkva je nacrtana kodom, a bilje su tačkice: treba pravi crtež.

Status piši u `art/world-pack-03/STATUS-ANIMACIJE-NOC.md` (oznaka `D50`). `dist/`, `build-sprite-rig.py`, `sprite-rig.json` i git ne diraj. Pravila izvoza, provere i zelene mreže su ista kao u `DOPUNA-48.md` (ćelija 512, oslonac y=488, najviše tri pokušaja, ne izvozi ako lik ili predmet nisu dobri). Uzori: `art/world-pack-03/uzori-d48/` (Marko: `marko-idle-2-kadar0.png` za rukopis, svetlo i meru).

## Kralj Vukašin (novi lik)
Markov otac, kralj: krupan kao Marko i iste visine (telo ~380 px u ćeliji 512), stariji, **seda duga brada i seda kosa**, na glavi **zlatna kraljevska kruna**, preko verižnjače dug **tamnocrven kraljevski plašt sa zlatnim vezom** i zlatnim kopčama, visoke čizme; u desnoj ruci **zlatan handžar** (kratak zakrivljen nož). Ne sme da liči na Marka (Marko ima crne brkove, crven ogrtač i buzdovan) niti na Turčina. Isti rukopis kao `marko-idle-2-kadar0.png`.

| Klip | Kadrova | Petlja | Šta se vidi |
|---|---|---|---|
| `vukasin-trci` | 8 | da | Kralj trči udesno, handžar podignut u desnoj ruci, plašt leprša; dva dodira tla, kao `marko-run`. |
| `vukasin-udara` | 6 | ne (`holdLastFrame=true`) | Kralj stoji, zamahne handžarom odozgo i zarije ga u drveni dovratak (direk) koji je DESNO, izvan kadra; poslednji kadar: ruka ispružena, handžar zariven, glava pognuta (pokajanje). Bez krvi i bez drugog lika. |

## Predmeti (jedna slika svaki, providna pozadina, bez teksta)
- `prop-crkva-samodreza`: **bela crkva Samodreža** gledana spreda, srpski srednji vek (moravska škola: trake kamena i opeke, slepi lukovi, kube na tamburu sa krstom, crveni krov od ćeramide), bela i topla kao na naslikanoj pozadini manastira (pogledaj `dist/assets/world/manastir-mid.webp`), bez crnih senki. Na sredini dna **dvokrilna drvena vrata između dva hrastova dovratka (direka)**. Slika 1024×1024, crkva ispunjava ~85 % visine, dno crkve na dnu slike (y≈1000). Izvoz: `dist/assets/world/prop-crkva-samodreza.webp` i izvor u `art/world-pack-03/uzori-d50/`.
- `bilje-miroc`: **pet lekovitih biljaka** u jednom redu, svaka u svom polju 256×256 (slika 1280×256), svaka kao mali busen sa korenom u zemlji na dnu polja: (1) žalfija sa ljubičastim cvetom, (2) ranilist sa ružičastim klasom, (3) hajdučka trava sa belim štitastim cvetom, (4) kantarion sa žutim cvetovima, (5) srdačica sa ružičasto-ljubičastim pršljenovima. Slikano, mat, kao ostali predmeti igre. Izvoz: `dist/assets/world/bilje-miroc.webp` i izvor u `uzori-d50/`.

Redosled: `vukasin-trci`, `vukasin-udara`, `prop-crkva-samodreza`, `bilje-miroc`. Posle svakog red u status; na kraju kratak pregled.
