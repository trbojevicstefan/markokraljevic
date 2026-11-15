# Dopuna 55 (od Claude-a, 15. 11.): pokreti protivnika koje igra traži, a nema ih

Stefan (15. 11.): „gameplay sve što fali”. Provera u igri je pokazala da protivnici u nekim stanjima nemaju crtež. Tada se crta jedan zamrznut kadar trka, nagnut:
- dok se penju;
- dok skaču;
- dok su ošamućeni.

Spavaju samo pešaci i štitonoše, jer ostali nemaju crtež spavanja. Pešak (`sword`) ima sve te pokrete; ova dopuna ih daje ostalima, **istim pokretom kao pešak**, ali svaki svoj lik.

Status piši u `art/world-pack-03/STATUS-D55.md` (napravi ga), red posle SVAKOG klipa, sa oznakom `D55`. Ne diraj ništa od sledećeg:
- `dist/`, `build-sprite-rig.py`, `sprite-rig.json`;
- druge `STATUS-*` fajlove i tuđe foldere klipova;
- git (ne pravi commit).

Paralelno rade dve druge Codex sesije (D54 Miloš, D56 konj): ne diraj njihove klipove i statuse.

## Uzori (pogledaj ih PRE crtanja; sve je u `art/world-pack-03/uzori-d54/`)

- **Lik:** `<lik>-idle-kadar0.png` (kopljanik, akindzija, palikuca, shield, oklopnik, pas, archer, tufekdzija, djemo, arapin) je pravi kadar iz igre.
  - Svaki klip je **uređivanje te slike** (`image_gen` sa njom kao ulazom), ne crtež iz opisa.
  - Isti čovek: lice, brci, turban/kapa, odeća, boje, oružje.
  - Ista veličina u ćeliji 512 kao na uzoru. Za pse: isti pas, iste boje.
  - Ne koristi `reference.png` iz foldera klipova: u mnogo foldera to je pogrešan, opšti janičar.
- **Pokret:** `pokret-sword-<pokret>.png` su trake pešakovih klipova iz igre (ćelije 512 u jednom redu). Isti pokret, isti broj kadrova, isti ritam i isti oslonac, ali tvoj lik sa svojim oružjem.
  - Kopljanik drži koplje, akindžija dve krive sablje, palikuća baklju, štitonoša štit i sablju, oklopnik malj i štit.

## Zajednička pravila (ista kao u `DOPUNA-48.md`)

**Ćelija i izvoz:**
- Ćelija 512×512, sigurna margina 24 px, providna pozadina, bez teksta. Lik gleda **udesno**.
- Klip ide u `art/animation-pack-04/assets/<klip>/`: `atlas.png` (N ćelija u jednom redu), `manifest.json` sa `frame_layout`, `frames/motion/frame-N.png`, `preview.gif` i `qa.json`.
- JSON bez BOM-a, ASCII opisi. Uzor fajlova: `art/animation-pack-04/assets/sword-climb/`.
- Radni fajlovi idu u `art/animation-pack-04/sources/<klip>/`. Postupak izvoza je u `art/world-pack-03/export-dopuna44-*.py` i `verify-dopuna51.py`.

**Crtanje i provera:**
- Jedan `image_gen` poziv crta mrežu (3×2 za 6 kadrova, 2×2 za 4, 3×2 sa praznim poljem za 5) na ravnoj jarko zelenoj #00ff00.
- JEDAN lik po polju. Iseci, skini zelenu, svaki kadar u svoju ćeliju, oslonac na **y=488**.
- Za svaki kadar proveri:
  - nijedan neprovidan piksel ne dodiruje ivicu;
  - nema zelenih piksela;
  - oružje celo i spojeno sa rukom.
- Posle svakog klipa napravi `identity-size-comparison.png` (tvoj kadar 0 pored `<lik>-idle-kadar0.png`, ista razmera). Ako lik nije isti ili je visina stojećeg kadra drugačija za više od 5 %, to je promašaj.
- **Najviše tri pokušaja po klipu.** Ako ni treći ne valja, NE izvozi, upiši šta ne valja i idi dalje.
- Bez krvi.

## Klipovi (redom; uzor pokreta u zagradi)

| Klip | Kadrova | Petlja | Šta se vidi |
|---|---|---|---|
| `kopljanik-spava` | 4 | da | Spava sedeći na kamenu, glava klonula na grudi, koplje naslonjeno na rame, diše. Kamen sme da bude u kadru. (`pokret-sword-spava.png`) |
| `kopljanik-budi` | 5 | ne (`holdLastFrame=true`) | Trgne se iz sna, zgrabi koplje i ustane; poslednji kadar je stav iz `kopljanik-idle-kadar0.png`. (`pokret-sword-budi.png`) |
| `akindzija-spava` | 4 | da | Isto kao kopljanik-spava, akindžija sa dve sablje preko kolena. |
| `akindzija-budi` | 5 | ne (`holdLastFrame=true`) | Isto kao kopljanik-budi, kraj u stavu akindžije. |
| `palikuca-spava` | 4 | da | Isto, palikuća; baklja je ugašena i leži pored njega (bez vatre). |
| `palikuca-budi` | 5 | ne (`holdLastFrame=true`) | Isto; ustajući dohvati baklju, koja se u poslednja dva kadra upali; kraj u njegovom stavu. |
| `oklopnik-spava` | 4 | da | Isto, oklopnik sedi na kamenu, malj naslonjen, štit pored nogu. |
| `oklopnik-budi` | 5 | ne (`holdLastFrame=true`) | Isto, kraj u stavu oklopnika. |
| `shield-climb` | 6 | da | Penje se uz zid/stenu kao pešak u `pokret-sword-climb.png` (ruke gore, hvata ivicu), štit na leđima, sablja o pojasu. Telo na istom mestu u ćeliji. |
| `kopljanik-climb` | 6 | da | Isto, koplje na leđima. |
| `akindzija-climb` | 6 | da | Isto, sablje u pojasu. |
| `palikuca-climb` | 6 | da | Isto, baklja zadenuta za pojas (gori). |
| `shield-tiho-pada` | 6 | ne (`holdLastFrame=true`) | Tiho oboren s leđa: trgne se, uhvati se za vrat, klone na kolena i padne licem na zemlju. Poslednji kadar leži, ceo u ćeliji. (`pokret-sword-tiho-pada.png`) |
| `kopljanik-tiho-pada` | 6 | ne (`holdLastFrame=true`) | Isto, kopljanik; koplje pada pored njega. |
| `akindzija-tiho-pada` | 6 | ne (`holdLastFrame=true`) | Isto, akindžija. |
| `palikuca-tiho-pada` | 6 | ne (`holdLastFrame=true`) | Isto, palikuća; baklja pada i gasi se. |
| `oklopnik-tiho-pada` | 6 | ne (`holdLastFrame=true`) | Isto, oklopnik (teško se sruši). |
| `pas-jump` | 6 | ne | Pas skače: kadar 0 se pritaji, 1 odraz, 2 uspon (prednje noge napred), 3 vrh skoka ispružen, 4 pada, 5 doček na sve četiri. U kadrovima 1–4 pas je u vazduhu, više u ćeliji. (`pokret-sword-jump.png` za ritam, `pokret-pas-attack.png` za izgled psa u skoku) |
| `djemo-jump` | 6 | ne | Đemo Brđanin skače sa buzdovanom: 0 čučne, 1 odraz, 2 uspon, 3 vrh (buzdovan podignut), 4 pada, 5 doček u čučanj. (`pokret-sword-jump.png`; lik `djemo-idle-kadar0.png`, trk `pokret-djemo-run.png`) |
| `pas-omamljen` | 6 | da | Ošamućen pas: noge mu se razilaze, tetura se, glava klone i trese se, rep podvijen. Stoji na istom mestu. (`pokret-sword-omamljen.png` za ritam) |
| `arapin-omamljen` | 6 | da | Ošamućen Arapin: tetura u mestu, koplje/sablja spušteni, glava klonula, hvata se za glavu. (`pokret-sword-omamljen.png`, lik `arapin-idle-kadar0.png`) |
| `pas-drugi` | 6 | ne | Drugi napad psa posle prvog ujeda: kratak skok i ujed nisko (za nogu). Poslednji kadar isti stav kao poslednji kadar `pokret-pas-attack.png`. |
| `archer-drugi` | 6 | ne | Drugi udarac strelca posle šuta: zamah lukom kao toljagom odozgo nadole. Poslednji kadar isti stav kao poslednji kadar `pokret-archer-kick.png`. |
| `palikuca-drugi` | 6 | ne | Drugi udarac palikuće: zamah upaljenom bakljom odozdo nagore, iskre. Poslednji kadar isti stav kao poslednji kadar `pokret-palikuca-torch.png`. |
| `tufekdzija-drugi` | 6 | ne | Drugi udarac tufekdžije posle udarca kundakom: ubod cevi tufeka napred (bez pucnja). Poslednji kadar isti stav kao poslednji kadar `pokret-tufekdzija-butt.png`. |

## Na kraju

Kratak pregled u `STATUS-D55.md`: šta je izvezeno, koliko pokušaja, šta nije i zašto.
