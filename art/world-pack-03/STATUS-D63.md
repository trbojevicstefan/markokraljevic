# D63 - Marko bez topuza na vrhu Urvine

- D63 | marko-hod-bez-topuza | IZVEZENO | 3 pokusaja | prihvacen pokusaj 3; 8 kadrova, petlja; hod u mestu udesno po ritmu uzora, prazne sake i potpuno cist pojas. Pokusaj 1 nije zadrzan posle image_gen handoff-a; pokusaj 2 odbijen zbog malog horizontalnog smedjeg ostatka uz pojas koji je mogao izgledati kao drska topuza. Treci pokusaj vizuelno i tehnicki proveren.
- D63 | marko-stoji-bez-topuza | IZVEZENO | 1 pokusaj | 6 kadrova, petlja; Marko stoji i dise, gleda udesno, obe sake su prazne i spustene, bez topuza ili drske na pojasu. Vizuelna i tehnicka provera prosle.

## D63 - zavrsni pregled

- D63 | Zavrsena oba klipa redom, ukupno 14 kadrova. Svaki izvezeni klip ima atlas.png, manifest.json, frames/motion/frame-N.png, preview.gif, qa.json i identity-size-comparison.png; dodat je contact.png radi pregleda kadrova.
- D63 | Koriscen ugradjeni image_gen kao uredjivanje uzora, sa uzorima iz uzori-d63/; mreze su sacuvane u sources/<klip>/attempt-N/grid.png, uz prompt.txt, review.json i tehnicke QA podatke.
- D63 | Prilagodjeni postupci: export-dopuna63.py i verify-dopuna63.py. Zavrsna komanda `python art/world-pack-03/verify-dopuna63.py`: PASS za oba klipa; alpha, margine najmanje 24 px, baseline y=488, nula zelenih piksela, atlas, GIF, frame_layout, loop i JSON provereni.
- D63 | Nije dirano: dist/, build-sprite-rig.py, sprite-rig.json, game.js, drugi STATUS fajlovi i git.
