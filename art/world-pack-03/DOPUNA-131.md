# Dopuna 131 (od Claude-a, 19. 11.): Arap prekomorac, treći deo: pogođen, pada, sedi i pije (jedanaesti pohod)

Nastavak `DOPUNA-129.md` (lik `arap`, crni Arapin sa teškim buzdovanom za obe ruke; pesma „Marko Kraljević ukida svadbarinu”: „Arap sedi, pije vino hladno, služi mu ga mlada i devojka”). Ovde su tri klipa.

Status piši u `art/world-pack-03/STATUS-D131.md` (napravi ga), red posle SVAKE stavke, sa oznakom `D131`. **Uradi SVA tri klipa do kraja. Ne staj i ne pitaj. Sitne ostatke ključa čistim ja: upiši ih u status i IZVEZI klip svejedno. Jedan pokušaj po klipu; drugi samo ako je lik pogrešan ili je kadar isečen.**

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, druge `STATUS-*` fajlove, tuđe foldere klipova (gotove klipove `arap-*` iz D129 i sve `arapin-*` ne menjaš), git, fajlove `*dopuna41*`. Paralelno rade D130 i D133: ne diraj njihove fajlove.

## Uzori (`art/world-pack-03/uzori-d131/`)

- `arap-idle-kadar0.png`: **Arap sa buzdovanom, gotov klip iz D129** (ćelija 512×512, stopala na y=487, visok 424 px, gleda udesno). **Uzor lika, lica, odeće, buzdovana i mere.** Na svim klipovima isti čovek i isti buzdovan, sablja u koricama o pojasu.
- `pokret-arapin-hurt.png`, `pokret-arapin-death.png`: isti čovek u starim klipovima (tamo sa sabljom u ruci). **Uzor POKRETA** za `arap-hurt` i `arap-death` (isti broj kadrova, isti tok, isti položaj u ćeliji). U novim klipovima u ruci mu je buzdovan, a sablja je u koricama.
- `car-sedi-kadar0.png`, `djemo-pije-kadar0.png`: likovi iz igre koji sede (donja ivica na y=489): **uzor mere za lik koji sedi** (sedeći je visok oko 290 px, ne kao uspravan).

## Pravila (ista kao u `DOPUNA-129.md`)

- Ćelija 512×512, sigurna margina 20 px, providna pozadina, bez teksta, tla, senke, zvezdica i efekata.
- Jedan `image_gen` poziv crta mrežu (2×2 za 4 kadra, 3×2 za 6) na ravnoj jarko zelenoj #00ff00; iseci polja, skini zelenu, svaki kadar u svoju ćeliju. Bez okvira ćelije, linija mreže i komada susednog kadra. **Proveri i zatvorene praznine.**
- Stopala ili donja ivica lika na y=487 (±2 px). **Ne razvlači kadrove na istu visinu.** Ako je lik malo veći ili manji, promeni razmeru celog klipa (upiši `k=` u status).
- Klip ide u `art/animation-pack-04/assets/<klip>/` kao u D129. Postupak: `art/world-pack-03/export-dopuna129.py` (svoja kopija `export-dopuna131.py`).
- Bez krvi i bez rana na svim kadrovima. Ovo je crtež za igru po staroj narodnoj pesmi; megdandžija posle megdana samo leži oboren.

## Klipovi (redom)

| Klip | Kadrova | Petlja | Šta radi |
|---|---|---|---|
| `arap-hurt` | 4 | ne | po `pokret-arapin-hurt.png`: trgne se unazad od udarca, glava zabačena, buzdovan mu se zanese u ruci, pa se vrati u stav. |
| `arap-death` | 6 | ne | po `pokret-arapin-death.png`: **izgubi megdan: zatetura se, buzdovan mu ispadne iz ruku, padne na kolena, pa se svali na bok i ostane da leži**, čalma mu se odmota po zemlji, buzdovan leži kraj njega. Poslednji kadar: leži miran. Bez krvi. |
| `arap-sedi-pije` | 6 | da | **sedi prekrštenih nogu na velikom crvenom jastuku (jastuk je deo klipa), pije hladno vino iz zlatne čaše**: digne čašu, otpije, spusti je na koleno, obriše bradu nadlanicom, oholo gleda preda se; **buzdovan leži na zemlji kraj njegovog kolena**. Gleda ULEVO. Visok oko 290 px (sedi), donja ivica jastuka na y=487. |
