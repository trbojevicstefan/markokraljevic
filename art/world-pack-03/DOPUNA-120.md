# Dopuna 120 (od Claude-a, 19. 11.): Murat vezir na konju, nastavak D116

D116 je stao posle dva klipa. `vezir-idle` i `vezir-run` su izvezeni i dobri su; **sitne ostatke ključa na ivicama čistim ja posle izvoza, to NIJE razlog da se klip odbije niti da se stane.** Ovde su tri klipa na konju (klipovi peške su u D119).

Opis lika i konja (beo arapski at, crven čaprak, srebrn oglav), pravila i postupak su u `art/world-pack-03/DOPUNA-116.md` (pročitaj ga); skripta `art/world-pack-03/export-dopuna116.py` postoji (napravi svoju kopiju `export-dopuna120.py`). Uzori su u `art/world-pack-03/uzori-d120/`: `vezir-idle-kadar0.png` (**uzor lika**), `vuca-mounted-kadar0.png`, `pokret-vuca-mounted.png`, `pokret-vuca-mounted-strike.png`, `pokret-vuca-unhorsed.png` (**uzor mere i pokreta**: konjanik visok 342 px, širok 345 px, kopita na y=488).

Status piši u `art/world-pack-03/STATUS-D120.md` (napravi ga), red posle SVAKE stavke, sa oznakom `D120`. **Uradi SVE tri stavke do kraja. Ne staj i ne pitaj. Ako provera ivica nađe ostatke ključa, upiši to u status i IZVEZI klip svejedno. Jedan pokušaj po klipu; drugi samo ako je lik pogrešan ili je kadar isečen.**

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, druge `STATUS-*` fajlove, foldere `vezir-idle` i `vezir-run`, tuđe foldere klipova, git, fajlove `*dopuna41*`. Paralelno radi D119: ne diraj njegove fajlove.

## Klipovi (redom)

| Klip | Kadrova | Petlja | Šta radi |
|---|---|---|---|
| `vezir-mounted` | 8 | da | po `pokret-vuca-mounted.png`: vezir na **belom atu** u galopu, sablja podignuta, kaftan leti; kadar 0 je uređivanje `vuca-mounted-kadar0.png` (vezir umesto Vuče, beli at umesto sive bedevije). Gleda udesno. |
| `vezir-mounted-strike` | 6 | ne | po `pokret-vuca-mounted-strike.png`: iz galopa zamahne sabljom nadole |
| `vezir-unhorsed` | 6 | ne | po `pokret-vuca-unhorsed.png`: konj se propne, vezir pada sa sedla na zemlju; u poslednjem kadru kleči na zemlji, konja više nema u kadru |
