# Dopuna 112 (od Claude-a, 19. 11.): ljudi carevog tabora i Mustaf-agina majka (peti pohod)

Stefan (19. 11.): „za neke scene fale kadrovi i junaci”. U petom pohodu („Marko Kraljević poznaje očinu sablju”) carev tabor ima samo vojnike, a na bijeloj kuli nema nikoga. U pesmi: „Imam jednu ostarjelu majku, i imadem brata Mustaf-agu.” Prave se četiri lika, svaki po jedan klip.

Status piši u `art/world-pack-03/STATUS-D112.md` (napravi ga), red posle SVAKE stavke, sa oznakom `D112`. **Uradi sve stavke do kraja, ne staj i ne pitaj posle prve.**

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, druge `STATUS-*` fajlove, tuđe foldere klipova, git, fajlove `*dopuna41*`. Paralelno rade D110 i D111: ne diraj njihove fajlove.

## Uzori (`art/world-pack-03/uzori-d112/`)

- `sword-idle-kadar0.png`: janičar iz igre (426 px, gleda udesno). **Uzor mere, rukopisa i boja vojske.**
- `velimirovica-idle-kadar0.png`: žena iz igre, ćelija 512×512, stopala na y=488, visoka 360 px, gleda ulevo. **Uzor mere za majku.**
- `turkinja-idle-kadar0.png`, `mladi-turcin-idle-kadar0.png`: njena deca (iste boje kuće: zeleno i crveno, zlatan vez).
- `car-sedi-kadar0.png`: uzor za lik koji sedi (nizak, širok, donja ivica na y=488).

## Pravila (ista kao u `DOPUNA-109.md`)

- Ćelija 512×512, sigurna margina 24 px, providna pozadina, bez teksta, tla, senke, zvezdica i efekata.
- Jedan `image_gen` poziv crta mrežu 3×2 (6 kadrova) na ravnoj jarko zelenoj #00ff00; iseci polja, skini zelenu, svaki kadar u svoju ćeliju. U izvozu ne sme ostati okvir ćelije ni linije mreže, ni komad susednog kadra.
- Stopala (ili donja ivica lika koji sedi ili čuči) na y=488 (±2 px).
- **Lik se gleda s boka** (kao svi likovi u igri), ne odozgo.
- **Ne razvlači kadrove na istu visinu.** Ako je lik malo veći ili manji od traženog, smanji ili uvećaj ceo klip istom razmerom i izvezi (upiši `k=` u status). Ne odbijaj dobar pokušaj zbog visine.
- Klip ide u `art/animation-pack-04/assets/<klip>/`: `atlas.png`, `manifest.json` sa `frame_layout`, `frames/motion/frame-N.png`, `preview.gif`, `qa.json`. JSON bez BOM-a. Radni fajlovi u `art/animation-pack-04/sources/<klip>/attempt-N/`.
- Postupak: `art/world-pack-03/export-dopuna109.py` i `verify-dopuna109.py`, prilagođeni (svoje kopije zovi `export-dopuna112.py` i `verify-dopuna112.py`).
- Najviše dva pokušaja po klipu.

## Klipovi (redom)

| Klip | Kadrova | Petlja | Šta radi |
|---|---|---|---|
| `tabor-kuvar` | 6 | da | debeli vojnički kuvar (aščija) u beloj kecelji i sa crvenim fesom **meša velikom kutlačom u bakarnom kazanu koji visi o tronošcu nad vatrom** (kazan, tronožac i vatra su deo klipa), proba, klimne glavom. Gleda udesno. Visok oko 400 px; cela grupa sa kazanom široka do 440 px. |
| `tabor-bubnjar` | 6 | da | mehter (vojni svirač) sa visokom kapom **udara u veliki bubanj (davul) okačen o rame**, levom tankim prutom, desnom maljicom. Gleda ulevo. Visok oko 420 px. |
| `tabor-dervis` | 6 | da | stari derviš sa belom bradom, u visokoj kapi od filca i dugom tamnozelenom plaštu, **sedi prekrštenih nogu na ovčijoj koži i prebira brojanice**, klima se napred-nazad. Gleda ulevo. Visok oko 270 px (sedi), donja ivica na y=488. |
| `mustafagina-majka` | 6 | da | **ostarela Turkinja**: pogrbljena, sitna, u tamnozelenoj anteriji i beloj marami preko glave i ramena, o pojasu ključevi. **Stoji oslonjena na štap, drugom rukom zaklanja oči i gleda u daljinu (ulevo)**, odmahne glavom, obriše oči krajem marame. Visoka oko 330 px. |
