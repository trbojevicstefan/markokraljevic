# Dopuna 119 (od Claude-a, 19. 11.): Murat vezir peške, nastavak D116

D116 je stao posle dva klipa. `vezir-idle` i `vezir-run` su izvezeni i dobri su; **sitne ostatke ključa na ivicama čistim ja posle izvoza, to NIJE razlog da se klip odbije niti da se stane.** Ostaje pet klipova peške (klipovi na konju su u D120).

Opis lika, pravila i postupak su u `art/world-pack-03/DOPUNA-116.md` (pročitaj ga); skripta `art/world-pack-03/export-dopuna116.py` postoji. Uzori su u `art/world-pack-03/uzori-d119/` (isti kao za D116, plus `vezir-idle-kadar0.png` iz D116: **to je uzor lika za sve klipove**).

Status piši u `art/world-pack-03/STATUS-D119.md` (napravi ga), red posle SVAKE stavke, sa oznakom `D119`. **Uradi SVIH pet stavki do kraja. Ne staj i ne pitaj. Ako provera ivica nađe ostatke ključa, upiši to u status i IZVEZI klip svejedno. Jedan pokušaj po klipu; drugi samo ako je lik pogrešan (nije vezir) ili je kadar isečen.**

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, druge `STATUS-*` fajlove, foldere `vezir-idle` i `vezir-run`, tuđe foldere klipova, git, fajlove `*dopuna41*`. Paralelno radi D120: ne diraj njegove fajlove.

## Klipovi (redom)

| Klip | Kadrova | Petlja | Šta radi |
|---|---|---|---|
| `vezir-attack` | 6 | ne | po `pokret-katana-attack.png` (širok zamah sabljom), gleda udesno |
| `vezir-hurt` | 4 | ne | po `pokret-katana-hurt.png` |
| `vezir-death` | 6 | ne | po `pokret-katana-death.png`: pada na kolena pa na leđa, turban mu spadne i otkotrlja se |
| `vezir-pusta-sokola` | 6 | ne | stoji peške kao u `vezir-idle-kadar0.png`, sablja u koricama: **na podignutoj levoj rukavici sedi sivi soko sa kožnom kapicom; skine mu kapicu, zamahne rukom napred-gore i baci sokola u let** (kadrovi 3–4: soko širi krila i odvaja se od ruke; kadar 5: ruka ispružena, sokola više nema u kadru, vezir gleda uvis). Gleda udesno. Visok 426 px, stopala na y=488. |
| `vezir-udara-sokola` | 6 | ne | stoji peške, sablja u koricama, besan: **drži sivog sokola za obe noge desnom rukom, zamahne njime preko glave i udari nadole pred sebe (udesno), kao da udara o stablo koje je odmah desno od njega (stablo se NE crta)**; kadrovi 3–4: udar, leti sivo perje; kadar 5: pusti pticu da padne, otresa ruku i okreće glavu. Ptica mala (raspon krila oko 150 px). Gleda udesno. |
