# Dopuna 105 (od Claude-a, 19. 11.): Velimir, mladi sin Vuče dženerala

Stefan (19. 11.): „Naslikaj tamnicu i sve što ti treba iz inventara.”

U pesmi „Marko Kraljević i Vuča dženeral” Vuča šalje sina: „Velimire, moje čedo drago! Uzmi, sine, za trista katana … Velimir je na noge skočio, on usjede vranca pomamnoga, i iziđe gradu na kapiju.” Marko razbije katane, a „pobježe mu Velimir dijete … dovati ga malo topuzinom, pade dite u zelenu travu; savezao mu i noge i ruke … baci dite u zelenu travu, a on opet sjede piti vino”. U igri Velimir sada izgleda kao obična katana. Pravi se njegov lik: dojaše na vrancu, bije se peške kao katana, a kad padne leži svezan u travi.

Status piši u `art/world-pack-03/STATUS-D105.md` (napravi ga), red posle SVAKE stavke, sa oznakom `D105`. **Uradi sve stavke do kraja, ne staj i ne pitaj posle prve.**

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, druge `STATUS-*` fajlove, tuđe foldere klipova (klipove katane i Vuče ne menjaš), git, fajlove `*dopuna41*`. Paralelno rade D104 i D106: ne diraj njihove fajlove.

## Uzori (`art/world-pack-03/uzori-d105/`)

- `katana-idle-kadar0.png`: **katana** (ugarski husar), ćelija 512×512, stopala na y=488, visok 426 px, gleda udesno. **Uzor mere, tela i položaja u ćeliji** za klipove peške.
- `pokret-katana-idle.png`, `-run`, `-attack`, `-hurt`, `-death`: katana u pokretu, kadar do kadra. **Uzor POKRETA** za klip istog imena (isti broj kadrova, isti tok, isti položaj u ćeliji, gleda udesno).
- `vuca-mounted-kadar0.png` i `pokret-vuca-mounted.png`: Vuča dženeral na bedeviji (visok 342 px, širok 345 px, kopita na y=488). **Uzor mere i pokreta** za klip na konju.
- `vuca-idle-kadar0.png`: Vuča peške, da se vidi da su otac i sin (ista kuća, iste boje).

## Kako izgleda Velimir

Mladić od šesnaest-sedamnaest godina („dijete”), **golobrad, bez brkova**, svetlosmeđa kosa do ramena, vitak, niži i tanji od katane (**uspravan visok oko 400 px**). Na glavi **nizak kalpak od svetlog krzna sa jednim belim perom**. **Svetloplava husarska dolama sa zlatnim gajtanima** (boje oca, Vuče), preko levog ramena **beli kurtak postavljen krznom**, **crvene** uske čakšire, žute čizme, zlatan pojas, laka kriva sablja. Mora se odmah razlikovati od katana (zeleno-crveno) i od Vuče (star, sed, tamnoplavo).

**Vranac**: crn pastuv, sjajan, „pomaman” (propinje glavu, griva leti), crveno-zlatni čaprak, iste veličine u ćeliji kao Vučina bedevija.

## Pravila (ista kao u `DOPUNA-76.md`)

- Ćelija 512×512, sigurna margina 24 px (kod `-run` i `-hurt` 8 px), providna pozadina, bez teksta, tla, senke, zvezdica i efekata. Sablja, pero i rep konja moraju stati u ćeliju.
- Jedan `image_gen` poziv crta mrežu (3×2 za 6 kadrova, 4×2 za 8, 2×2 za 4) na ravnoj jarko zelenoj #00ff00; iseci polja, skini zelenu, svaki kadar u svoju ćeliju. U izvozu ne sme ostati okvir ćelije ni linije mreže, ni komad susednog kadra.
- Stopala (kopita) na y=488 (±2 px); lik na istom mestu u ćeliji kao u uzoru pokreta.
- **Ne razvlači kadrove na istu visinu.** Ako je lik u tvom pokušaju malo veći ili manji od traženog, **smanji ili uvećaj ceo klip istom razmerom i izvezi** (upiši razmeru `k=` u status). Ne odbijaj dobar pokušaj zbog visine.
- Klip ide u `art/animation-pack-04/assets/<klip>/`: `atlas.png`, `manifest.json` sa `frame_layout`, `frames/motion/frame-N.png`, `preview.gif`, `qa.json`. JSON bez BOM-a. Radni fajlovi u `art/animation-pack-04/sources/<klip>/attempt-N/`.
- Postupak: `art/world-pack-03/export-dopuna76.py` i `verify-dopuna76.py`, prilagođeni (svoje kopije zovi `export-dopuna105.py` i `verify-dopuna105.py`).
- **Prvo** napravi `velimir-idle` kao uređivanje `katana-idle-kadar0.png` (presvuci ga u Velimira i podmladi; poza ista, malo niži). Posle toga je **njegov kadar 0 uzor lika** za sve ostale klipove.
- Najviše dva pokušaja po klipu.

## Klipovi (redom)

| Klip | Kadrova | Petlja | Šta radi |
|---|---|---|---|
| `velimir-idle` | 6 | da | po `pokret-katana-idle.png`: stoji sa sabljom, diše, osvrne se ka gradu |
| `velimir-run` | 6 | da | po `pokret-katana-run.png` |
| `velimir-attack` | 6 | ne | po `pokret-katana-attack.png` (zamah sabljom) |
| `velimir-hurt` | 4 | ne | po `pokret-katana-hurt.png` |
| `velimir-death` | 6 | ne | po `pokret-katana-death.png`, ali **ne gine**: udaren topuzom pada na kolena pa na bok u travu, kalpak mu spadne (Marko ga veže živog) |
| `velimir-jase` | 8 | da | po `pokret-vuca-mounted.png`: Velimir na **vrancu** u galopu, sablja podignuta; kadar 0 je uređivanje `vuca-mounted-kadar0.png` (Velimir umesto Vuče, crni konj umesto sive bedevije) |
| `velimir-svezan` | 4 | da | **leži na boku u travi, svezanih ruku iza leđa i svezanih nogu** (konopac), glava ka desno; malo se koprca, podigne glavu pa je spusti. Nizak i širok lik: visok oko 150 px, dugačak oko 380 px, donja ivica tela na y=488 |
