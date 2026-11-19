# Dopuna 129 (od Claude-a, 19. 11.): Arap prekomorac sa teškim buzdovanom, prvi deo (jedanaesti pohod)

Pesma „Marko Kraljević ukida svadbarinu”: „kako dođe Arap prekomorac, pa od cara Kosovo zakupi … Ciknu Arap kao zmija ljuta … pa potrže teška buzdovana, te udara Kraljevića Marka, udari ga tri-četiri puta.” Arapin u igri postoji, ali sa sabljom u ruci (`arapin-*`). Za megdan po pesmi treba **isti čovek sa teškim buzdovanom u rukama, a sabljom o pojasu**. Novi lik se zove `arap`. Ovde su prva četiri klipa.

Status piši u `art/world-pack-03/STATUS-D129.md` (napravi ga), red posle SVAKE stavke, sa oznakom `D129`. **Uradi SVA četiri klipa do kraja. Ne staj i ne pitaj. Sitne ostatke ključa čistim ja: upiši ih u status i IZVEZI klip svejedno. Jedan pokušaj po klipu; drugi samo ako je lik pogrešan ili je kadar isečen.**

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, druge `STATUS-*` fajlove, tuđe foldere klipova (postojeće klipove `arapin-*` ne menjaš), git, fajlove `*dopuna41*`. Paralelno rade D132, D134 i D136: ne diraj njihove fajlove.

## Uzori (`art/world-pack-03/uzori-d129/`)

- `arapin-idle-kadar0.png`: **Arapin iz igre** (ćelija 512×512, stopala na y=487, visok 424 px, gleda udesno): **uzor lika, lica, odeće i mere.** Na svim klipovima mora biti isti čovek: bela čalma sa zlatnim šiljkom i dugim krajem koji visi niz leđa, crna brada, zlatan oklop na grudima i ramenima, tamnoplava dolama sa zlatnim vezom, crven pojas, plave šalvare, smeđe čizme.
- `pokret-dzelat-idle.png`, `pokret-dzelat-attack.png`, `pokret-dzelat-zabio.png`: megdandžija sa dugom sekirom iz igre. **Uzor POKRETA** (isti broj kadrova, isti tok, isti položaj u ćeliji, gleda udesno). Umesto sekire Arapin drži buzdovan.
- `dzelat-zabio-kadar3.png`: jedan kadar u punoj veličini, da se vidi kako oružje stoji zabijeno u zemlju.
- `pokret-arapin-run.png`: Arapin u trku (osam kadrova): uzor pokreta za `arap-run`.

## Buzdovan

**Težak ratni buzdovan za obe ruke**: debela drvena drška okovana gvozdenim obručima, duga oko 300 px, na vrhu **gvozdena glava sa šest širokih pera** (prečnik oko 90 px), na dnu drške gvozden šiljak. Isti na svim kadrovima. Sablja ostaje **u koricama o pojasu** (ne u ruci).

## Pravila

- Ćelija 512×512, sigurna margina 20 px, providna pozadina, bez teksta, tla, senke, zvezdica i efekata. Buzdovan mora stati u ćeliju i kad je podignut.
- Jedan `image_gen` poziv crta mrežu (3×2 za 6 kadrova, 4×2 za 8) na ravnoj jarko zelenoj #00ff00; iseci polja, skini zelenu, svaki kadar u svoju ćeliju. Bez okvira ćelije, linija mreže i komada susednog kadra. **Proveri i zatvorene praznine (između ruke i tela, između nogu, između drške i tela): ni tu ne sme ostati zelena.**
- Stopala na y=487 (±2 px); uspravan je visok 424 px (±3 %), kao u `arapin-idle-kadar0.png`. **Ne razvlači kadrove na istu visinu**: pognut kadar je niži. Ako je lik malo veći ili manji, promeni razmeru celog klipa (upiši `k=` u status).
- Klip ide u `art/animation-pack-04/assets/<klip>/`: `atlas.png`, `manifest.json` sa `frame_layout`, `frames/motion/frame-N.png`, `preview.gif`, `qa.json`. JSON bez BOM-a. Radni fajlovi u `art/animation-pack-04/sources/<klip>/attempt-N/`. Postupak: `art/world-pack-03/export-dopuna127.py` (svoja kopija `export-dopuna129.py`).
- **Prvo** napravi `arap-idle` kao uređivanje `arapin-idle-kadar0.png` (isti čovek, sablju iz ruke vrati u korice, u ruke mu daj buzdovan). Njegov kadar 0 je uzor lika za ostale klipove.

## Klipovi (redom)

| Klip | Kadrova | Petlja | Šta radi |
|---|---|---|---|
| `arap-idle` | 6 | da | po `pokret-dzelat-idle.png`: stoji raskoračen, buzdovan drži obema rukama ukoso preko grudi, diše, mrko gleda. Gleda udesno. |
| `arap-run` | 8 | da | po `pokret-arapin-run.png`: trči u napad, buzdovan nosi u obe ruke uz desni bok, kraj čalme vijori. |
| `arap-attack` | 6 | ne | po `pokret-dzelat-attack.png`: 0–1 digne buzdovan visoko iznad glave, 2–3 zamah nadole, 4–5 glava buzdovana udara u zemlju ispred njega (desno), telo pognuto. |
| `arap-zabio` | 6 | da | po `pokret-dzelat-zabio.png`: **glava buzdovana se zabila u zemlju ispred njega**, on obema rukama vuče dršku da ga iščupa, upire se nogom, stiska zube, ne može. Glava buzdovana stoji na y=487 na istom mestu u svim kadrovima. |
