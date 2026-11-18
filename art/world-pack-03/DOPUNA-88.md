# Dopuna 88 (od Claude-a, 18. 11.): naslikane stepenice za Manastirski vis, Oranje i Opsednutu tvrđavu

Stefan (18. 11.): „sredi pozadine, paralaks, stepenice … za svaki nivo mora to bolje”.

Stepenice u igri sada crta kod: ravne svetle ploče i siv zid (`uzori-d88/sada-stepenice-manastir.jpg`, `sada-stepenice-oranje.jpg`). Izgledaju kao kutije, ne kao naslikan svet oko njih. Prave se naslikane pločice od kojih igra slaže stepenice.

Status piši u `art/world-pack-03/STATUS-D88.md` (napravi ga), red posle SVAKE stavke, sa oznakom `D88`.

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, druge `STATUS-*` fajlove, postojeće slike, tuđe foldere, git, fajlove `*dopuna41*`. Paralelno rade druge Codex sesije (D87, D89–D92): ne diraj njihove fajlove; svoje skripte zovi `*-dopuna88.py`.

## Kako igra slaže stepenice

Svaki stepenik je blok: gore **gazište** (ploča po kojoj se hoda, sa svetlom prednjom ivicom), ispod njega **telo** do zemlje. Stepenici su jedan iza drugog, svaki 46 px dalje i 24 px više (u meri igre). Igra:
- telo puni ponavljanjem pločice `-telo` (u oba pravca, kao tapet), u razmeri 0,5;
- preko vrha tela stavlja traku `-vrh` (ponavlja se vodoravno), u razmeri 0,5 (traka od 128 px je u igri 64 px: gazište oko 20 px i lice stepenika ispod).

Zato pločice MORAJU da se nastavljaju bez šava: `-telo` levo-desno i gore-dole, `-vrh` levo-desno. Proveri to sam: složi 3×3 pločice `-telo` i 4 trake `-vrh` jednu do druge, i pogledaj da li se vidi šav; ako se vidi, popravi (pomeri sliku za pola širine, prekrij šav, vrati). Sačuvaj te provere kao `stepenik-<ime>-proba.png`.

## Uzori (`art/world-pack-03/uzori-d88/`)

- `sloj-manastir-near-rucno*.png/jpg`, `sloj-oranje-near-rucno*`, `sloj-tvrdjava-near*`: bliži slojevi pozadina ta tri pohoda. **Rukopis, boje i svetlo** (topla svetlost sleva, slikano, mat, jasna kontura, bez crnih senki).
- `stil-tlo-*.png`: tlo po kom se hoda na tim pohodima: kamen i zemlja moraju da se slažu sa njim.

## Pločice (u `art/world-pack-03/`)

`-vrh`: **1024×128**, providno iznad ploče; crta se na ravnoj **jarko ljubičastoj #ff00ff** pozadini i ključ skida ljubičastu (pogledaj na plavoj i na beloj podlozi: bez ljubičastog ruba i bez rupica). Gornjih ~40 px je gazište gledano blago odozgo (svetla gornja površina, osvetljena prednja ivica), ispod je lice stepenika (malo tamnije), donja ivica ravna i puna do dna slike.

`-telo`: **512×512**, puna slika bez providnosti, tapet koji se nastavlja u svim pravcima.

| Ime | Šta se vidi |
|---|---|
| `stepenik-kamen-vrh` | Manastirski vis: ploče od svetlog toplog krečnjaka (boja kao kamen zvonika u `sloj-manastir-near-rucno`), istrošene i zaobljene ivice od mnogo koraka, po neka pukotina i mrlja mahovine, uz spojeve suvo lišće. |
| `stepenik-kamen-telo` | Isti krečnjak: zid od klesanih blokova različite širine, svetao malter, toplo osvetljen, po neki kamen tamniji ili žućkastiji. Ne crno, ne sivo. |
| `stepenik-zemlja-vrh` | Oranje: stepenik od nabijene zemlje, ivica utvrđena oblom drvenom gredom (brvnom) prikucanom kočićima, odozgo zemlja sa busenjem trave i po kojim klasom. |
| `stepenik-zemlja-telo` | Usek u zemlji: topla smeđa-crvena zemlja (kao `stil-tlo-oranje`) sa slojevima, kamenčićima, korenjem i po kojim vodoravnim brvnom koje drži zemlju. |
| `stepenik-tvrdjava-vrh` | Opsednuta tvrđava: ploče od tamnijeg peščara, oštre ivice, gvozdeni okov na po kojoj ploči. Toplo osvetljene, ne crne. |
| `stepenik-tvrdjava-telo` | Bedem od krupnih tesanih blokova peščara, tamniji spojevi, po neki ožiljak od topovske đulade. Toplo, ne crno. |

Najviše tri pokušaja po pločici. U status upiši veličinu i rezultat provere šava.
