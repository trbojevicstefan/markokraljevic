# Dopuna 97 (od Claude-a, 18. 11.): Marko sedi na zemlji, poji Šarca vinom, pa pije sam

Stefan (18. 11.): „Moraš i animaciju kako Marko pije vino u tom donjem položaju, a i kako poji Šarca vinom. Jer to imamo skoro u svakoj pesmi … neka bude niz dve animacije: poji Šarca, i onda on popije vino.” I: „treba Markova sedeća poza dok pije kao ispred krčme u ranijim pesmama”: to je poza u kojoj Marko u igri sedi na zemlji pred mehanom i kod koplja (poslednji kadar klipa `marko-odmor`).

U pesmama Marko sedne na zemlju, pa vino „pola pije, pola Šarcu daje” (pod Varadinom pije „leđenom od dvanaest oka”: velikim bakrenim sudom). U igri Marko tada sedi nepomično (`uzori-d97/marko-sedi-kadar.png`, poslednji kadar `marko-odmor`: na zemlji, oslonjen, noge pružene). **Tačno u toj pozi** prave se dva klipa: u prvom poji Šarca, u drugom pije sam. Igra ih pušta jedan za drugim.

Status piši u `art/world-pack-03/STATUS-D97.md` (napravi ga), red posle SVAKE stavke, sa oznakom `D97`. Ako već postoje fajlovi iz prekinutog pokušaja (`art/animation-pack-04/sources/marko-sedi-*`), smeš ih pogledati, ali proveri ih po ovim pravilima.

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, druge `STATUS-*` fajlove, tuđe foldere klipova, git, fajlove `*dopuna41*`. Paralelno rade druge Codex sesije (D98, D99): ne diraj njihove fajlove.

## Uzori (`art/world-pack-03/uzori-d97/`)

- `marko-sedi-kadar.png`: **Marko kako sedi u igri** (poslednji kadar `marko-odmor`), ćelija 512×512, gleda udesno, lik visok 256 px, od x=68 do x=443, telo na zemlji na y=488. **Uzor lika, POZE, mere i položaja u ćeliji za OBA klipa**: svaki kadar počinje i završava se ovako (sedi na istom mestu, isti ugao nogu, topuz leži pored njega).
- `pokret-marko-odmor.png`: kako je seo.
- `pokret-marko-pije-vodu.png`: Marko stoji i pije iz suda: **uzor pokreta pijenja** (podigne sud, nagne ga, pije, spusti).
- `pokret-sarac-pije.png`: Šarac pije sa spuštenom glavom. Šarac stoji desno od Marka, glava mu je spuštena nisko, u visini Markovih kolena. Šarac se crta posebno: **u klipu je samo Marko**.
- `krcma-marko-sedi.jpg`: samo kao uzor kako Marko preliva vino iz visine u bakrač (mlaz vina); poza NE.

## Šta se vidi

Pored Marka na zemlji: **mešina (tulum) sa vinom** i **veliki bakreni sud sa drškom** (leđen; širok kao Markova glava, ne mala čaša).

## Pravila (ista kao u `DOPUNA-76.md`)

- Ćelija 512×512, sigurna margina 24 px, providna pozadina, bez teksta, tla, senke, zvezdica i efekata. **Samo Marko** (i njegov sud, mešina i topuz), bez Šarca. Marko gleda **udesno**.
- Jedan `image_gen` poziv crta mrežu (4×2 za 8 kadrova) na ravnoj jarko zelenoj #00ff00; iseci polja, skini zelenu, svaki kadar u svoju ćeliju. U izvozu ne sme ostati okvir ćelije ni linije mreže, ni komad susednog kadra.
- Marko u svakom kadru sedi na istom mestu (telo na y=488, isti x kao u uzoru); pomeraju se samo ruke, glava i trup. Visina lika u kadru 0 i u poslednjem kadru je 256 px (±5 %); kad digne sud iznad glave sme biti viši.
- **Ne razvlači kadrove na istu visinu** i ne pomeraj lik. Proveri površinu lika po kadru: ne sme biti veća od površine kadra 0 za više od 20 %.
- **Prvo** napravi kadar 0 kao **uređivanje `marko-sedi-kadar.png`** (ista poza, samo sud u krilu, mešina pored); taj kadar 0 je uzor za sve ostale kadrove OBA klipa.
- Klip ide u `art/animation-pack-04/assets/<klip>/`: `atlas.png`, `manifest.json` sa `frame_layout`, `frames/motion/frame-N.png`, `preview.gif`, `qa.json`, `identity-size-comparison.png`. JSON bez BOM-a. Radni fajlovi u `art/animation-pack-04/sources/<klip>/attempt-N/`.
- Postupak: `art/world-pack-03/export-dopuna76.py` i `verify-dopuna76.py`, prilagođeni (svoje kopije zovi `export-dopuna97.py` i `verify-dopuna97.py`).
- Najviše tri pokušaja po klipu; ako ni treći ne valja, NE izvozi. Pre izvoza napravi tablu kadrova pored `marko-sedi-kadar.png` u istoj razmeri i pogledaj je.

## Klipovi (redom)

| Klip | Kadrova | Petlja | Šta radi |
|---|---|---|---|
| `marko-sedi-poji` | 8 | ne | 0: sedi, sud u krilu; 1: dohvati mešinu; 2: podigne mešinu i naspe vino u sud (crveni mlaz); 3: spusti mešinu, uzme sud obema rukama; 4–5: pruži sud **nisko udesno**, ruke ispružene, sud u visini kolena (tu Šarac spusti glavu i pije); 6: drži ga još, nasmeje se; 7: vrati sud u krilo. |
| `marko-sedi-pije` | 8 | ne | 0: sedi, sud u krilu (kao kadar 7 prethodnog klipa); 1: podigne sud; 2–4: nagne ga i pije velikim gutljajima, glava zabačena, sud iznad lica; 5: spusti sud; 6: dlanom obriše brk; 7: sud u krilu, sedi kao u kadru 0. |
