# Dopuna 116 (od Claude-a, 19. 11.): Murat vezir, megdandžija sedmog pohoda („Lov Markov s Turcima”)

Stefan (19. 11.): „Pređi na sledeći nivo … da prati pesmu, da bude duži i teži. Da postoji svaki lik iz pesme i svaka animacija, do najsitnijeg detalja.”

Sedmi pohod ide po pesmi **„Lov Markov s Turcima”**: „Lov lovio Murate vezire … sa svojijeh dvanaest delija i s trin’estim Kraljevićem Markom … Pusti vezir svojega sokola da uhvati utvu zlatokrilu … pak on uze Markova sokola, te ga ud’ri o jelu zelenu i prebi mu ono desno krilo, pa obrnu kroz goru zelenu … stiže Marko Murata vezira i rusu mu odsiječe glavu.” Vezira u igri nema. Pravi se ceo lik: peške, na konju i dve radnje iz pesme.

Status piši u `art/world-pack-03/STATUS-D116.md` (napravi ga), red posle SVAKE stavke, sa oznakom `D116`. **Uradi sve stavke do kraja, ne staj i ne pitaj posle prve.**

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, druge `STATUS-*` fajlove, tuđe foldere klipova (klipove katane i Vuče ne menjaš), git, fajlove `*dopuna41*`. Paralelno rade D117 i D118: ne diraj njihove fajlove.

## Uzori (`art/world-pack-03/uzori-d116/`)

- `katana-idle-kadar0.png`: katana iz igre, ćelija 512×512, stopala na y=488, visok 426 px, gleda udesno. **Uzor mere, tela i položaja u ćeliji** za klipove peške.
- `pokret-katana-idle.png`, `-run`, `-attack`, `-hurt`, `-death`: **uzor POKRETA** za klip istog imena (isti broj kadrova, isti tok, isti položaj u ćeliji, gleda udesno).
- `vuca-mounted-kadar0.png`, `pokret-vuca-mounted.png`, `pokret-vuca-mounted-strike.png`, `pokret-vuca-unhorsed.png`: megdandžija na konju iz igre (visok 342 px, širok 345 px, kopita na y=488). **Uzor mere i pokreta** za tri klipa na konju.
- `car-uzmice-kadar0.png`: car iz igre, samo kao uzor rukopisa bogate turske odeće (vezir NE sme da liči na cara: manji turban, druge boje).
- `soko-let-kadar0.png`: Markov sivi soko (uzor ptice u dva scenska klipa).

## Kako izgleda Murat vezir

Čovek od pedesetak godina, krupan, **crna brada prošarana sedim, povijen nos, ohol pogled**. **Beo turban srednje veličine sa zelenim vrhom i čelenkom od čapljinog perja**, **tamnozelen kaftan postavljen samurovinom, vezen srebrom**, ispod njega **žuta svilena anterija**, crven pojas, za pojasom handžar, o bedru kriva sablja; na **levoj ruci debela sokolarska rukavica od kože** (uvek, u svakom klipu). Žute čizme. Uspravan visok oko 426 px (kao katana). Mora se odmah razlikovati od cara (zlatni brokat, ogroman turban) i od Vuče (plavo, husar).

**Konj**: beo arapski at sa crvenim čaprakom i srebrnim oglavom, iste veličine u ćeliji kao Vučina bedevija.

## Pravila (ista kao u `DOPUNA-105.md`)

- Ćelija 512×512, sigurna margina 24 px (kod `-run` i `-hurt` 8 px), providna pozadina, bez teksta, tla, senke, zvezdica i efekata.
- Jedan `image_gen` poziv crta mrežu (3×2 za 6 kadrova, 4×2 za 8, 2×2 za 4) na ravnoj jarko zelenoj #00ff00; iseci polja, skini zelenu, svaki kadar u svoju ćeliju. U izvozu ne sme ostati okvir ćelije ni linije mreže, ni komad susednog kadra. **Proveri i zatvorene praznine (između ruke i tela, između nogu konja): ni tu ne sme ostati zelena.** Kaftan je TAMNOzelen (maslinast), da ga ključ ne pojede; ako ga pojede, crtaj na jarko ljubičastoj #ff00ff.
- Stopala (kopita) na y=488 (±2 px); lik na istom mestu u ćeliji kao u uzoru pokreta.
- **Ne razvlači kadrove na istu visinu.** Ako je lik malo veći ili manji od traženog, smanji ili uvećaj ceo klip istom razmerom i izvezi (upiši `k=` u status). Ne odbijaj dobar pokušaj zbog visine.
- Klip ide u `art/animation-pack-04/assets/<klip>/`: `atlas.png`, `manifest.json` sa `frame_layout`, `frames/motion/frame-N.png`, `preview.gif`, `qa.json`. JSON bez BOM-a. Radni fajlovi u `art/animation-pack-04/sources/<klip>/attempt-N/`.
- Postupak: `art/world-pack-03/export-dopuna112.py` i `verify-dopuna112.py`, prilagođeni (svoje kopije zovi `export-dopuna116.py` i `verify-dopuna116.py`).
- **Prvo** napravi `vezir-idle` kao uređivanje `katana-idle-kadar0.png` (presvuci ga u vezira; poza i mera iste). Posle toga je **njegov kadar 0 uzor lika** za sve ostale klipove.
- Najviše dva pokušaja po klipu.

## Klipovi (redom)

| Klip | Kadrova | Petlja | Šta radi |
|---|---|---|---|
| `vezir-idle` | 6 | da | po `pokret-katana-idle.png`: stoji sa isukanom sabljom, gladi bradu, gleda prezrivo |
| `vezir-run` | 6 | da | po `pokret-katana-run.png` |
| `vezir-attack` | 6 | ne | po `pokret-katana-attack.png` (širok zamah sabljom) |
| `vezir-hurt` | 4 | ne | po `pokret-katana-hurt.png` |
| `vezir-death` | 6 | ne | po `pokret-katana-death.png`: pada na kolena pa na leđa, turban mu spadne i otkotrlja se |
| `vezir-mounted` | 8 | da | po `pokret-vuca-mounted.png`: vezir na **belom atu** u galopu, sablja podignuta, kaftan leti; kadar 0 je uređivanje `vuca-mounted-kadar0.png` |
| `vezir-mounted-strike` | 6 | ne | po `pokret-vuca-mounted-strike.png`: iz galopa zamahne sabljom nadole |
| `vezir-unhorsed` | 6 | ne | po `pokret-vuca-unhorsed.png`: konj se propne, vezir pada sa sedla na zemlju; u poslednjem kadru kleči na zemlji, konja više nema u kadru |
| `vezir-pusta-sokola` | 6 | ne | stoji peške kao u `vezir-idle`, sablja u koricama: **na podignutoj levoj rukavici sedi sivi soko sa kožnom kapicom; skine mu kapicu, zamahne rukom napred-gore i baci sokola u let** (kadrovi 3–4: soko širi krila i odvaja se od ruke; kadar 5: ruka ispružena, sokola više nema u kadru, vezir gleda uvis). Gleda udesno. |
| `vezir-udara-sokola` | 6 | ne | stoji peške, sablja u koricama, besan: **drži sivog sokola za obe noge desnom rukom, zamahne njime preko glave i udari nadole pred sebe (udesno), kao da udara o stablo koje je odmah desno od njega (stablo se NE crta)**; kadrovi 3–4: udar, leti sivo perje; kadar 5: pusti pticu da padne, otresa ruku i okreće glavu. Ptica mala (raspon krila oko 150 px). Gleda udesno. |
