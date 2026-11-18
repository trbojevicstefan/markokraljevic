# D65 - prvi nivo, Kosovsko selo

- D65 | kopljanik-basa-jump | IZVEZENO | attempt-2 prihvacen; attempt-1 odbijen zbog dodira vazdusnih kadrova sa gornjom ivicom. 6 kadrova, jednokratna animacija; izmerena visina 410 px u kadru sa ispruzenim nogama, osnovni uzor 410 px; koplje, stit i barjacic celi. `verify-dopuna65.py` PASS.
- D65 | marko-slusa | IZVEZENO | attempt-1 prihvacen; 8 kadrova, petlja; izmerena visina kadra 0 = 390 px, uzor sa ogrtacem 390 px; topuz je spusten na zemlju, obe sake na drsci, bez dodatnih likova. `verify-dopuna65.py` PASS.
- D65 | marko-hvata-rep | IZVEZENO | attempt-1 prihvacen; 6 kadrova, jednokratna animacija; izmerena visina kadra 0 = 390 px, uzor sa ogrtacem 390 px; nema topuza, konja ni repa, stopala ostaju na baseline-u. `verify-dopuna65.py` PASS.
- D65 | putnica-pozdrav | IZVEZENO | attempt-1 prihvacen; 6 kadrova, petlja; izmerena visina kadra 0 = 342 px, uzor 342 px; ista seljanka i dete, mahanje i mali skok deteta. `verify-dopuna65.py` PASS.
- D65 | putnik-starac-klanja | IZVEZENO | attempt-1 prihvacen; 6 kadrova, petlja; izmerena visina kadra 0 = 314 px, uzor 314 px; skidanje i vracanje subare, duboki naklon, stap u desnoj ruci. `verify-dopuna65.py` PASS.

- D65 | zavrsna provera | PASS | `python art/world-pack-03/verify-dopuna65.py` prosao za svih 5 klipova: alpha, margine, nula zelenih piksela, izmerene visine, atlas, GIF, frame_layout, loop i JSON. Nije dirano: dist/, build-sprite-rig.py, sprite-rig.json, game.js, drugi STATUS fajlovi i git.

