# Dopuna 100 (od Claude-a, 18. 11.): Šarac na vašaru, kad ga Marko vuče za rep

Stefan (18. 11.): „Napravi i animaciju za Šarca kada ga Marko vuče za rep u prvom nivou.”

U prvom pohodu (Kosovsko selo) Marko bira konja na vašaru: hvata konje za rep i zamahne. Drugi konji se otmu i ritnu, a **šareno ždrebe se ni s mesta ne pomakne**: to je Šarac. Sada se za to koriste klipovi propinjanja, koji ne liče na to. Prave se dva klipa samog konja (bez jahača), isti konj kao `sarac-stoji` (igra ostale konje samo prebojava).

Status piši u `art/world-pack-03/STATUS-D100.md` (napravi ga), red posle SVAKE stavke, sa oznakom `D100`.

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, druge `STATUS-*` fajlove, tuđe foldere klipova, git, fajlove `*dopuna41*`. Paralelno rade druge Codex sesije (D97–D99): ne diraj njihove fajlove.

## Uzori (`art/world-pack-03/uzori-d100/`)

- `sarac-stoji-kadar0.png`: **Šarac** iz igre, ćelija 512×512, gleda udesno, kopita na y=488, visok 382 px, širok 398 px (od x=77 do x=475). **Uzor konja, mere i položaja u ćeliji.**
- `pokret-sarac-stoji.png`, `pokret-sarac-propinje.png`, `pokret-sarac-pije.png`: isti konj u pokretu (rukopis grive, repa, nogu).

## Pravila (ista kao u `DOPUNA-76.md`)

- Ćelija 512×512, sigurna margina 24 px, providna pozadina, bez teksta, tla, senke, zvezdica, ljudi i efekata. **Samo konj** (sa sedlom i čaprakom kao u uzoru).
- Jedan `image_gen` poziv crta mrežu (4×2 za 8 kadrova) na ravnoj jarko zelenoj #00ff00; iseci polja, skini zelenu, svaki kadar u svoju ćeliju. U izvozu ne sme ostati okvir ćelije ni linije mreže, ni komad susednog kadra.
- Prednja kopita na **y=488**; konj ne putuje levo-desno kroz ćeliju.
- **Ne razvlači kadrove na istu visinu.** Proveri površinu po kadru: ne sme biti veća od površine kadra 0 za više od 20 %.
- **Ako se ispruženi konj ne uklapa u ćeliju sa marginom**, smanji CEO klip istom razmerom (svi kadrovi isto, i kadar 0), tako da najširi kadar stane, i upiši tu razmeru u status (npr. `k=0,92`). Ne seci noge i rep.
- Kadar 0 je **uređivanje `sarac-stoji-kadar0.png`**; ostali kadrovi su uređivanje kadra 0.
- Klip ide u `art/animation-pack-04/assets/<klip>/`: `atlas.png`, `manifest.json` sa `frame_layout`, `frames/motion/frame-N.png`, `preview.gif`, `qa.json`, `identity-size-comparison.png`. JSON bez BOM-a. Radni fajlovi u `art/animation-pack-04/sources/<klip>/attempt-N/`.
- Postupak: `art/world-pack-03/export-dopuna76.py` i `verify-dopuna76.py`, prilagođeni (svoje kopije zovi `export-dopuna100.py` i `verify-dopuna100.py`).
- Najviše tri pokušaja po klipu; ako ni treći ne valja, NE izvozi. Pre izvoza napravi tablu kadrova pored uzora u istoj razmeri i pogledaj je.

## Klipovi (redom)

| Klip | Kadrova | Petlja | Šta radi |
|---|---|---|---|
| `sarac-rep-upire` | 8 | da | Marka nema u kadru, ali neko vuče konja **za rep unazad (ulevo)**: rep je zategnut i ispružen ulevo. Šarac se upire: prednje noge ukopane, telo nagnuto napred, glava spuštena i ispružena napred, uši priljubljene, nozdrve raširene; kroz petlju malo potrese grivom, prebaci težinu, zagrebe prednjim kopitom i opet se ukopa. Ni koraka unazad. |
| `sarac-ritne` | 8 | ne | Konj bez jahača **ritne se zadnjim nogama** unazad: 0: stoji; 1: spusti glavu, prebaci težinu napred; 2: savije zadnje noge; 3: sapi gore; 4: zadnje noge ispružene unazad i gore, skoro vodoravno, rep leti; 5: još ispružene, niže; 6: spušta noge; 7: stoji kao kadar 0. |
