# Dopuna 86 (od Claude-a, 18. 11.): mladi Turčin se budi, ponovo

`mladi-turcin-budi` iz D84 nije valjao: kadrovi 1, 3, 4 i 5 su isečeni (vidi se samo čizma ili pola tela), a lik sedi na kamenu. Ovo je ponovna narudžbina jednog klipa. Status u `art/world-pack-03/STATUS-D86.md`, red sa oznakom `D86`.

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, druge `STATUS-*` fajlove, tuđe foldere klipova (i ne briši stari `mladi-turcin-budi`: novi izvoz ga prepisuje tek kad prođe proveru), git, fajlove `*dopuna41*`.

## Uzori (`art/world-pack-03/uzori-d86/`)

- `mladi-turcin-idle-kadar0.png`: **mladi Turčin** uspravan, ćelija 512×512, stopala na y=488, gleda udesno, visok **426 px**. Uzor lika.
- `mladi-turcin-sedi-mera.png`: isti mladić kako spava sedeći na zemlji, u **pravoj veličini za igru: visok 294 px**, stopala i sedalo na y=488. Uzor položaja i veličine za kadar 0.
- `pokret-sword-budi.png`: kako se u igri budi janičar (uzor pokreta).

## Pravila

- Ćelija 512×512, sigurna margina 24 px, providna pozadina, bez teksta, tla, kamena, senke. **Svaki kadar mora sadržati CEO lik** (od turbana sa perom do čizama) unutar ćelije; isečen kadar je greška.
- Jedan `image_gen` poziv (uređivanje `mladi-turcin-idle-kadar0.png`) crta mrežu 3×2 na jarko zelenoj #00ff00; iseci polja, skini zelenu, svaki kadar u svoju ćeliju, bez linija mreže i komada susednog kadra.
- Stopala na y=488 u svim kadrovima; lik na istom mestu u ćeliji.
- Izmeri visine: kadar 0 oko **294 px** (±5 %), kadar 5 **426 px** (±5 %), između raste.
- Izvoz kao u D84 (`export-dopuna84.py`, `verify-dopuna84.py`; svoje kopije `export-dopuna86.py`, `verify-dopuna86.py`). Pre izvoza napravi tablu svih 6 kadrova i POGLEDAJ je: ako je ijedan kadar isečen ili lik sedi na nečemu, pokušaj ponovo. Najviše tri pokušaja.

## Klip

| Klip | Kadrova | Petlja | Šta se vidi |
|---|---|---|---|
| `mladi-turcin-budi` | 6 | ne | 0: spava sedeći na zemlji kao u `mladi-turcin-sedi-mera.png`; 1: trgne se, digne glavu, oči otvorene; 2: oslanja se rukom o zemlju, podiže se na koleno; 3: ustaje, druga ruka ide na balčak sablje za pojasom; 4: skoro uspravan, hvata balčak; 5: uspravan stav kao uzor, ruka na balčaku. |
