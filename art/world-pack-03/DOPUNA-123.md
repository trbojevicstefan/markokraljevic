# Dopuna 123 (od Claude-a, 19. 11.): uspavana vila u čunu i guje (osmi pohod)

Pesma „Marko Kraljević i vila brodarica”: „pa ćeš naći jezer-vodu ladnu i na vodi vilu brodaricu; pa je vila na vodi zaspala, pa se čuvaj da je ne probudiš … Al’ se trže vila iza sanka, pozna vila da se voda pila.” Opis vile je u `art/world-pack-03/DOPUNA-121.md` (pročitaj ga).

Status piši u `art/world-pack-03/STATUS-D123.md` (napravi ga), red posle SVAKE stavke, sa oznakom `D123`. **Uradi SVIH šest stavki do kraja. Ne staj i ne pitaj. Sitne ostatke ključa čistim ja: upiši ih u status i IZVEZI klip svejedno. Jedan pokušaj po klipu; drugi samo ako je lik pogrešan ili je kadar isečen.**

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, druge `STATUS-*` fajlove, tuđe foldere klipova, git, fajlove `*dopuna41*`. Paralelno rade D121, D122, D124: ne diraj njihove fajlove.

## Uzori (`art/world-pack-03/uzori-d123/`)

- `brodarica-idle-kadar0.png`: **vila brodarica iz D121: uzor lika** (lice, kosa, haljina, guja). Na svim klipovima mora biti ista vila.
- `pas-idle-kadar0.png`, `pokret-pas-run.png`, `pokret-pas-attack.png`: pas iz igre (ćelija 512×512, šape na y=488, dugačak oko 330 px, gleda udesno). **Uzor mere i položaja u ćeliji za guju.**
- `utva-plovi-kadar0.png`: ptica na vodi iz igre: **uzor kako se crta ono što pluta** (donja ivica = linija vode na y=488, ispod nje ništa).
- `turkinja-idle-kadar0.png`: uzor rukopisa.

## Pravila

- Ćelija 512×512, sigurna margina 24 px, providna pozadina, bez teksta, tla, vode, senke i efekata.
- Jedan `image_gen` poziv crta mrežu (3×2 za 6 kadrova, 2×2 za 4) na ravnoj **jarko ljubičastoj #ff00ff**; iseci polja, skini ljubičastu, svaki kadar u svoju ćeliju.
- Donja ivica lika na y=488 (±2 px). Lik se gleda s boka. Ne razvlači kadrove; ako je lik veći ili manji, promeni razmeru celog klipa (upiši `k=`).
- Klip ide u `art/animation-pack-04/assets/<klip>/`: `atlas.png`, `manifest.json` sa `frame_layout`, `frames/motion/frame-N.png`, `preview.gif`, `qa.json`. JSON bez BOM-a. Postupak: `art/world-pack-03/export-dopuna116.py` (svoja kopija `export-dopuna123.py`).

## Klipovi (redom)

| Klip | Kadrova | Petlja | Šta radi |
|---|---|---|---|
| `brodarica-spava` | 6 | da | **vila brodarica spava u malom čunu izdubljenom od stabla, gledano s boka**: leži na leđima, glava na pramcu desno, **duga kosa boje tamnog zlata visi preko ivice čuna**, jedna ruka visi do vode, na grudima joj sklupčana guja; diše polako, čun se jedva ljulja. Čun dugačak oko 440 px, cela grupa visoka oko 150 px; **dno čuna (linija vode) na y=488**. |
| `brodarica-budi` | 6 | ne | isti čun, isto mesto: 0: spava; 1–2: trgne se, otvori svetle oči; 3: sedne u čunu; 4: zagrabi vodu dlanom i pogleda je („pozna vila da se voda pila”); 5: stoji u čunu, besna, guja joj se digla uz ruku. |
| `guja-idle` | 4 | da | **guja šarka** (sivo-smeđa, tamna cik-cak šara, krupna: debela kao ljudska ruka) sklupčana, glava podignuta, palaca jezikom. Dugačka/široka oko 260 px, visoka oko 150 px, donja ivica na y=488. Gleda udesno. |
| `guja-run` | 6 | da | gmiže brzo udesno u talasima (telo u obliku slova S koje se pomera), glava napred nisko. Dugačka oko 330 px. |
| `guja-attack` | 6 | ne | po `pokret-pas-attack.png` (isti tok): skupi se, pa **sune napred razjapljenih čeljusti, vide se otrovni zubi**, pa se povuče. |
| `guja-death` | 4 | ne | prevrne se na leđa (vidi se svetao trbuh), uvije i ostane opružena. |
