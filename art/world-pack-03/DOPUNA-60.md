# Dopuna 60 (od Claude-a, 15. 11.): šest ikona veština

Stefan (15. 11.) traži novi meni Napredak i traku veština kao u WoW-u. Šest veština nema ikonu, pa se u meniju vidi prazno polje.

Status piši u `art/world-pack-03/STATUS-D60.md` (napravi ga), sa oznakom `D60`.

Ne diraj ništa od sledećeg:
- `dist/` (osim izvoza ispod), `build-sprite-rig.py`, `sprite-rig.json`, `game.js`;
- druge `STATUS-*` fajlove;
- git (ne pravi commit).

Najviše dva `image_gen` pokušaja.

## Stil

Uzori su u `art/world-pack-03/uzori-d60/` (`ikona-bacanje.png`, `ikona-juris.png`, `ikona-nadole.png`, `ikona-vihor.png`, `ikona-junacki.png`, `ikona-uvis.png`). Nove ikone moraju biti isti rukopis:
- okrugao bronzani medaljon sa pletenim (upletenim) obodom;
- tamnosmeđe kožnato polje u sredini;
- znak u sredini u zlatno-bronzanom reljefu;
- providna pozadina van kruga;
- 256×256, krug iste veličine i na istom mestu kao u uzorima.

Jedan `image_gen` poziv (uređivanje sa uzorima kao ulazom) crta mrežu 3×2 od šest medaljona na ravnoj jarko zelenoj #00ff00. Iseci, skini zelenu, svaki medaljon postavi u 256×256 tačno kao u uzorima (uporedi preklapanjem sa `ikona-bacanje.png`).

## Ikone (redom u mreži)

| Fajl | Znak u sredini |
|---|---|
| `ikona-niz` | tri luka (traga zamaha) jedan za drugim i mali bodljikavi topuz na kraju trećeg |
| `ikona-zid` | uspravan kameni zid levo, a od njega se odbija strelica u luku nagore-desno |
| `ikona-kontra` | okrugao štit sa iskrom na sredini i strelica koja se vraća udesno |
| `ikona-zamah` | bodljikavi topuz podignut za udarac, oko njega tri zareza (stepena punjenja) kao luk |
| `ikona-uzlet` | vilinsko krilo i strelica pravo nagore, sa nekoliko iskrica |
| `ikona-tresak` | topuz koji pada pravo dole na zemlju, ispod njega udarni talas (dva luka) i pukotina |

**Izvoz:**
- `dist/assets/world/ikona-<ime>.webp` (256×256, RGBA, lossless WebP);
- izvori u `art/world-pack-03/uzori-d60/`;
- `art/world-pack-03/uzori-d60/pregled.png`: svih 12 ikona (6 uzora + 6 novih) u redu, da se vidi da su iste.

Na kraju kratak pregled u `STATUS-D60.md`.
