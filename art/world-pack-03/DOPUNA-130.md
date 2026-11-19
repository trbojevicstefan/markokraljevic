# Dopuna 130 (od Claude-a, 19. 11.): Arap prekomorac sa teškim buzdovanom, drugi deo (jedanaesti pohod)

Nastavak `DOPUNA-129.md` (lik `arap`, crni Arapin sa teškim buzdovanom za obe ruke; pesma „Marko Kraljević ukida svadbarinu”: „Ciknu Arap kao zmija ljuta … pa potrže teška buzdovana”). Prva četiri klipa su gotova i dobra. Ovde su još četiri klipa megdana.

Status piši u `art/world-pack-03/STATUS-D130.md` (napravi ga), red posle SVAKE stavke, sa oznakom `D130`. **Uradi SVA četiri klipa do kraja. Ne staj i ne pitaj. Sitne ostatke ključa čistim ja: upiši ih u status i IZVEZI klip svejedno. Jedan pokušaj po klipu; drugi samo ako je lik pogrešan ili je kadar isečen.**

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, druge `STATUS-*` fajlove, tuđe foldere klipova (gotove klipove `arap-idle`, `arap-run`, `arap-attack`, `arap-zabio` i sve `arapin-*` ne menjaš), git, fajlove `*dopuna41*`. Paralelno rade D131 i D133: ne diraj njihove fajlove.

## Uzori (`art/world-pack-03/uzori-d130/`)

- `arap-idle-kadar0.png`: **Arap sa buzdovanom, gotov klip iz D129** (ćelija 512×512, stopala na y=487, visok 424 px, gleda udesno). **Uzor lika, lica, odeće, buzdovana i mere.** Na svim klipovima isti čovek i isti buzdovan (duga drška okovana obručima, gvozdena glava sa šest pera), sablja u koricama o pojasu.
- `pokret-dzelat-vitla.png`, `pokret-dzelat-skok.png`, `pokret-dzelat-bes.png`, `pokret-dzelat-omamljen.png`: megdandžija sa dugom sekirom iz igre. **Uzor POKRETA** za klip istog nastavka (isti broj kadrova, isti tok, isti položaj u ćeliji, gleda udesno). Umesto sekire Arap drži buzdovan.

## Pravila (ista kao u `DOPUNA-129.md`)

- Ćelija 512×512, sigurna margina 20 px, providna pozadina, bez teksta, tla, senke, zvezdica i efekata. Buzdovan mora stati u ćeliju i kad je podignut.
- Jedan `image_gen` poziv crta mrežu (3×2 za 6 kadrova, 4×2 za 8) na ravnoj jarko zelenoj #00ff00; iseci polja, skini zelenu, svaki kadar u svoju ćeliju. Bez okvira ćelije, linija mreže i komada susednog kadra. **Proveri i zatvorene praznine (između ruke i tela, između nogu, između drške i tela).**
- Stopala na y=487 (±2 px) osim u skoku; uspravan je visok 424 px (±3 %). **Ne razvlači kadrove na istu visinu.** Ako je lik malo veći ili manji, promeni razmeru celog klipa (upiši `k=` u status).
- Klip ide u `art/animation-pack-04/assets/<klip>/` kao u D129 (`atlas.png`, `manifest.json` sa `frame_layout`, `frames/motion/frame-N.png`, `preview.gif`, `qa.json`; JSON bez BOM-a). Postupak: `art/world-pack-03/export-dopuna129.py` (svoja kopija `export-dopuna130.py`).

## Klipovi (redom)

| Klip | Kadrova | Petlja | Šta radi |
|---|---|---|---|
| `arap-vitla` | 8 | da | po `pokret-dzelat-vitla.png`: **vitla buzdovanom oko sebe** držeći ga obema rukama za kraj drške; glava buzdovana obiđe pun krug (ispred, desno, iza, levo), telo se okreće za njom, kraj čalme leti. Stopala na mestu. |
| `arap-skok` | 6 | ne | po `pokret-dzelat-skok.png`, istim redom: 0 čučne i zamahne, 1 odskok uvis sa buzdovanom iznad glave, 2 vrh skoka (noge skupljene), 3 pada i zamahuje nadole, 4 **doskočio, glava buzdovana zabijena u zemlju ispred njega**, 5 pridiže se. U kadrovima 1–3 je u vazduhu (stopala iznad y=487 kao u uzoru). |
| `arap-bes` | 6 | ne | po `pokret-dzelat-bes.png`: **„Ciknu Arap kao zmija ljuta”**: buzdovan osloni glavom o zemlju i drži ga jednom rukom, drugom pesnicom se udari u grudi, zabaci glavu i **vrišti širom otvorenih usta**, žile na vratu; na kraju zgrabi buzdovan obema rukama. |
| `arap-omamljen` | 6 | da | po `pokret-dzelat-omamljen.png`: ošamućen, tetura se u mestu, jednom rukom se drži za glavu, buzdovan mu visi u drugoj ruci glavom na zemlji, kolena klecaju. Bez zvezdica. |
