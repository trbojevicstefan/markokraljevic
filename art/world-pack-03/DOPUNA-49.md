# Dopuna 49 (od Claude-a, noć 14/15. 11.): naslikana Mapa putovanja Kraljevića Marka

Stefan (14. 11.): „mora bolja mapa, nacrtaj i mapu na koju možeš da postaviš nivoe, lepše nje nacrtaj, neka bude mapa Kosova i Makedonije, šta već treba da bude … Mora da bude SRPSKO.” Nivoi igre će stajati na pravim mestima iz pesama, pa raspored reka, obala i mesta MORA da ostane gde je na uzoru.

Status piši u `art/world-pack-03/STATUS-ANIMACIJE-NOC.md` (oznaka `D49`). `dist/`, git i tuđe fajlove ne diraj, osim izvoza ispod. Ne pravi commit.

## Uzor rasporeda

`art/world-pack-03/uzori-d49/mapa-raspored.png` (2048×1280): pergament, more (levo Jadransko, dole desno Egejsko), reke (Dunav gore, Sava, Morave, Ibar, Timok, Vardar do Soluna, Crna reka, Drim, Struma, Marica), jezera (Ohridsko, Prespansko, Skadarsko), planine (smeđe mrlje sa trouglovima) i **crvene tačke za mesta**. `mapa-raspored-imena.png` je isto sa imenima, samo da znaš šta je šta: imena NE crtaj.

## Šta se crta

Jedna slika **2048×1280**, kao stara ručno slikana karta srpskih zemalja iz XIV veka na pergamentu, u duhu srpskih rukopisa i fresaka (Miroslavljevo jevanđelje, freske Dečana i Markovog manastira): topao pergament sa mrljama i ivicama izbledelim od vremena, mat, slikano.
- **Raspored tačno kao na uzoru**: `image_gen` kao uređivanje slike `mapa-raspored.png` (ne crtež iz opisa). Obala, reke, jezera i planine ostaju na istim mestima i istog oblika; samo dobiju slikani izgled.
- Planine kao naslikani nizovi vrhova (sivo-plavi i oker, kao na ikonama), šume kao sitne jele i bukve u grupama, polja svetlija. More bledo tirkizno sa slikanim talasima, u Jadranu jedna mala galija sa jedrom, u Egejskom jedan mali morski zmaj (aždaja) kao na starim kartama.
- Na mestu SVAKE crvene tačke sitna slikana sličica mesta (tvrđava na steni, kula, manastir sa kubetom, selo sa dve kuće), visine 40 do 70 px, sa središtem tačno na tački. Bez crvenih tačaka u gotovoj slici.
- Ukrasni okvir oko cele karte širine 40 do 60 px: srpski pleter (preplet) u crvenoj (#8a1c1c), zlatnoj (#c9a24a) i tamnoplavoj boji, u uglovima rozete. U donjem levom uglu ruža vetrova sa dvoglavim belim orlom na crvenom štitu.
- **Bez slova, bez brojeva, bez imena i natpisa** bilo gde (imena dodaje igra).
- Ništa važno ne sme da bude pod okvirom: sve tačke su bar 70 px od ivice slike.

## Provera pre izvoza
Preklopi gotovu sliku preko `mapa-raspored.png` (poluprovidno) i snimi `uzori-d49/provera-preklop.png`: reke, obale i tačke se moraju poklapati (odstupanje do ~25 px). Proveri da nema slova. Najviše tri pokušaja.

## Izvoz
- `dist/assets/world/mapa-putovanja.webp` (2048×1280, kvalitet 86) i `art/world-pack-03/uzori-d49/mapa-putovanja.png` (izvorna PNG).
- U status: broj pokušaja, gde je provera preklopa, šta nije savršeno.
