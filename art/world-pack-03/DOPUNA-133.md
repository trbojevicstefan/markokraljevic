# Dopuna 133 (od Claude-a, 19. 11.): Arapov sluga iz pesme: krije sablju, kleči, telal, beži, oboren (jedanaesti pohod)

Nastavak `DOPUNA-132.md` (lik `arap-sluga`; prva četiri klipa su gotova i dobra). Pesma „Marko Kraljević ukida svadbarinu”: „beže sluge pod šator Arapu, pa se kriju za Arapa sluge, pokrivaju sablje japundžeti, da im Marko ne vidi sabalja … a četiri ne hte pogubiti, već ih Marko ostavi za pravdu … opravi ih na četiri strane, te telale po Kosovu sluge: odsad više nema svadbarine.”

Status piši u `art/world-pack-03/STATUS-D133.md` (napravi ga), red posle SVAKE stavke, sa oznakom `D133`. **Uradi SVIH pet klipova do kraja. Ne staj i ne pitaj. Sitne ostatke ključa čistim ja: upiši ih u status i IZVEZI klip svejedno. Jedan pokušaj po klipu; drugi samo ako je lik pogrešan ili je kadar isečen.**

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, druge `STATUS-*` fajlove, tuđe foldere klipova (gotove klipove `arap-sluga-*` iz D132 ne menjaš), git, fajlove `*dopuna41*`. Paralelno rade D130 i D131: ne diraj njihove fajlove.

## Uzori (`art/world-pack-03/uzori-d133/`)

- `arap-sluga-idle-kadar0.png`: **Arapov sluga, gotov klip iz D132** (ćelija 512×512, stopala na y=486, visok 422 px, gleda udesno): **uzor lika, odeće i mere.** Bela čalma oko crvenog fesa, tamnocrven ogrtač sa kapuljačom (japundže), bela košulja, zelen pojas, žute šalvare, crvene papuče, kriva sablja. Na svim klipovima isti čovek.
- `arap-sluga-run-kadar3.png`: isti sluga u trku.
- `pokret-delija-bezi.png`: vojnik iz igre koji beži: **uzor POKRETA** za `arap-sluga-bezi`.
- `sword-uplasen-kadar0.png`: uplašen vojnik iz igre: uzor izraza lica (razrogačene oči, otvorena usta, pomalo karikaturalno).

## Pravila (ista kao u `DOPUNA-132.md`)

- Ćelija 512×512, sigurna margina 24 px (kod `-bezi` 8 px), providna pozadina, bez teksta, tla, senke, zvezdica i efekata.
- Jedan `image_gen` poziv crta mrežu (3×2 za 6 kadrova, 2×2 za 4, 4×2 za 8) na ravnoj jarko zelenoj #00ff00 (ako ključ izjeda zeleni pojas, crtaj na jarko ljubičastoj #ff00ff); iseci polja, skini ključ, svaki kadar u svoju ćeliju. Bez okvira ćelije, linija mreže i komada susednog kadra. **Proveri i zatvorene praznine.**
- Stopala ili donja ivica lika na y=486 (±2 px). **Ne razvlači kadrove na istu visinu**: lik koji čuči ili kleči je niži. Ako je lik malo veći ili manji, promeni razmeru celog klipa (upiši `k=` u status).
- Klip ide u `art/animation-pack-04/assets/<klip>/` kao u D132. Postupak: `art/world-pack-03/export-dopuna132.py` (svoja kopija `export-dopuna133.py`).
- Bez krvi i bez rana na svim kadrovima. Ovo je crtež za igru po staroj narodnoj pesmi.

## Klipovi (redom)

| Klip | Kadrova | Petlja | Šta radi |
|---|---|---|---|
| `arap-sluga-krije` | 6 | da | **čuči pognut i ogrtačem (japundžetom) pokriva sablju**: obema rukama drži ogrtač prebačen preko sablje uz grudi, viri preko ruba ogrtača razrogačenih očiju, uvuče glavu u ramena, zadrhti, opet proviri. Gleda ULEVO. Visok oko 300 px (čuči). |
| `arap-sluga-kleci` | 4 | da | **kleči na oba kolena, predao se**: sablja leži na zemlji ispred njega, ruke prekrštene na grudima, glava oborena; lagano diše, podigne pogled pa ga opet obori. Gleda ULEVO. Visok oko 290 px (kleči). |
| `arap-sluga-telal` | 8 | da | **telal: ide brzim hodom i viče vest**: jedna šaka kraj usta kao levak, usta širom otvorena, druga ruka maše uvis; bez sablje u ruci (sablja je ostala), ogrtač se njiše. Hod od 8 kadrova, stopala na y=486. Gleda udesno. |
| `arap-sluga-bezi` | 6 | da | po `pokret-delija-bezi.png`: **beži glavom bez obzira (udesno)**, sablju sakrio pod ogrtač, ogrtač vijori, osvrće se preko ramena razrogačenih očiju i otvorenih usta. Ista mera kao `arap-sluga-run-kadar3.png`. |
| `arap-sluga-death` | 6 | ne | **oboren u megdanu: zatetura se unazad, sablja mu ispadne iz ruke, padne na leđa i ostane da leži na zemlji**, čalma mu se odmota. Poslednji kadar: leži miran na leđima, glava ulevo, noge udesno, donja ivica tela na y=486. Gleda udesno dok stoji. Bez krvi i bez rana. |
