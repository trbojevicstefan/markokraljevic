# Dopuna 122 (od Claude-a, 19. 11.): vila brodarica na jelenu (osmi pohod)

Pesma „Marko Kraljević i vila brodarica”: „te uvati trogoca jelena, pa ga jednom gujom zauzdala, a drugom ga gujom prestegnula, a trećom ga gujom ošibuje, pa dostiže Kraljevića Marka”. Opis vile je u `art/world-pack-03/DOPUNA-121.md` (pročitaj ga): bleda, veoma duga mokra kosa boje tamnog zlata sa lokvanjima, haljina boje jezerske vode, bosa.

Status piši u `art/world-pack-03/STATUS-D122.md` (napravi ga), red posle SVAKE stavke, sa oznakom `D122`. **Uradi SVE tri stavke do kraja. Ne staj i ne pitaj. Sitne ostatke ključa čistim ja: upiši ih u status i IZVEZI klip svejedno. Jedan pokušaj po klipu; drugi samo ako je lik pogrešan ili je kadar isečen.**

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, druge `STATUS-*` fajlove, tuđe foldere klipova, git, fajlove `*dopuna41*`. Paralelno rade D121, D123, D124: ne diraj njihove fajlove.

## Uzori (`art/world-pack-03/uzori-d122/`)

- `brodarica-idle-kadar0.png`: **vila brodarica iz D121: uzor lika** (lice, kosa, haljina, guja). Na svim klipovima mora biti ista vila.
- `vuca-mounted-kadar0.png`, `pokret-vuca-mounted.png`, `pokret-vuca-mounted-strike.png`, `pokret-vuca-unhorsed.png`: megdandžija na konju iz igre (visok 342 px, širok 345 px, kopita na y=488, gleda udesno). **Uzor mere i pokreta**; umesto konja je JELEN, umesto konjanika VILA.

## Jelen i guje

**Jelen trogodac**: mlad, snažan jelen riđe dlake sa rogovima od tri paroška na svakoj strani, veličine konja iz uzora. **Zauzdan je živom gujom** (zmija mu ide kroz usta kao žvale i oko njuške, vila je drži kao uzde), **drugom gujom je opasan oko grudi umesto kolana** (kao kaiš sedla, vila jaše bez sedla), a **treću guju vila drži u desnoj ruci kao bič**. Guje su šarke: sivo-smeđe sa tamnom cik-cak šarom.

## Pravila

- Ćelija 512×512, sigurna margina 24 px, providna pozadina, bez teksta, tla, senke i efekata. Rogovi i guja-bič moraju stati u ćeliju.
- Jedan `image_gen` poziv crta mrežu (4×2 za 8 kadrova, 3×2 za 6) na ravnoj **jarko ljubičastoj #ff00ff**; iseci polja, skini ljubičastu, svaki kadar u svoju ćeliju.
- Kopita na y=488 (±2 px); lik na istom mestu u ćeliji kao u uzoru pokreta. Ne razvlači kadrove; ako je lik veći ili manji, promeni razmeru celog klipa (upiši `k=`).
- Klip ide u `art/animation-pack-04/assets/<klip>/`: `atlas.png`, `manifest.json` sa `frame_layout`, `frames/motion/frame-N.png`, `preview.gif`, `qa.json`. JSON bez BOM-a. Postupak: `art/world-pack-03/export-dopuna120.py` (svoja kopija `export-dopuna122.py`).

## Klipovi (redom)

| Klip | Kadrova | Petlja | Šta radi |
|---|---|---|---|
| `brodarica-mounted` | 8 | da | po `pokret-vuca-mounted.png`: vila na jelenu u galopu, kosa leti, levom rukom drži guju-uzdu, desnom vitla gujom-bičem; gleda udesno |
| `brodarica-mounted-strike` | 6 | ne | po `pokret-vuca-mounted-strike.png`: iz galopa ošine gujom-bičem nadole, a jelen obori rogove napred |
| `brodarica-unhorsed` | 6 | ne | po `pokret-vuca-unhorsed.png`: jelen se propne, vila pada sa njega na zemlju; u poslednjem kadru kleči na zemlji sa gujom u ruci, jelena više nema u kadru |
