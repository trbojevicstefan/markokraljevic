# Dopuna 82 (od Claude-a, 18. 11.): Dželat, megdandžija Manastirskog visa

Stefan (18. 11.): „naručuj od Codexa sve što ti treba za naredna tri nivoa; potrebne su nam sve animacije”.

Dželat ima hod, udarac sekirom, hvat, pogođen i smrt. Megdan dobija tri čina kao Kopljanik-baša u selu: sekira zabijena u zemlju, vitlanje sekirom, skok sa udarcem odozgo, bes; i ošamućenost.

Status piši u `art/world-pack-03/STATUS-D82.md` (napravi ga), red posle SVAKE stavke, sa oznakom `D82`.

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, druge `STATUS-*` fajlove, tuđe foldere klipova, git, fajlove `*dopuna41*`. Paralelno rade druge Codex sesije (D81–D85): ne diraj njihove fajlove.

## Uzori (`art/world-pack-03/uzori-d82/`)

- `dzelat-idle-kadar0.png`: **Dželat**, ćelija 512×512, stopala na y=488, gleda udesno, visok 421 px. Crna kapuljača preko glave, golih mišićavih ruku, verižnjača, crven prsluk sa zlatnim vezom, kožna kecelja, velika sekira sa širokim sečivom koju drži preko ramena. **Uzor lika i veličine za sve klipove.**
- `pokret-dzelat-run.png`, `-attack.png`, `-hvata.png`, `-hurt.png`: isti dželat u pokretima koje već ima.

## Pravila (ista kao u `DOPUNA-76.md`)

- Ćelija 512×512, sigurna margina 24 px, providna pozadina, bez teksta, tla, senke, zvezdica i efekata. Oružje mora stati u ćeliju (ako treba, ukoso ili uspravno).
- Jedan `image_gen` poziv crta mrežu (3×2 za 6 kadrova, 4×2 za 8) na ravnoj jarko zelenoj #00ff00; iseci polja, skini zelenu, svaki kadar u svoju ćeliju. U izvozu ne sme ostati okvir ćelije ni linije mreže, ni komad susednog kadra.
- Stopala na y=488 (osim u skoku); lik na istom mestu u ćeliji u svim kadrovima.
- Klip ide u `art/animation-pack-04/assets/<klip>/`: `atlas.png`, `manifest.json` sa `frame_layout`, `frames/motion/frame-N.png`, `preview.gif`, `qa.json`, `identity-size-comparison.png`. JSON bez BOM-a. Radni fajlovi u `art/animation-pack-04/sources/<klip>/attempt-N/`.
- Postupak: `art/world-pack-03/export-dopuna76.py` i `verify-dopuna76.py`, prilagođeni (svoje kopije zovi `export-dopuna82.py` i `verify-dopuna82.py`).
- Visinu uspravnog kadra **izmeri** i uporedi sa uzorom (421 px, ±5 %). Najviše tri pokušaja po klipu; ako ni treći ne valja, NE izvozi.
- Svaki klip je **uređivanje uzora** `dzelat-idle-kadar0.png` (`image_gen` sa tim kadrom kao ulazom): isti čovek, ista odeća i oružje, isto lice, ista veličina tela.

## Klipovi (redom)

| Klip | Kadrova | Petlja | Šta se vidi |
|---|---|---|---|
| `dzelat-zabio` | 6 | da | Sekira mu je duboko zabijena u zemlju ispred stopala, sečivo do pola u zemlji, držalja ukoso naviše ka njemu. Obema rukama cima držalju, upire se nogama, naginje se unazad pa napred; sekira se ne pomera. Kadar 5 se pretapa u 0. |
| `dzelat-vitla` | 8 | da | Vitla sekirom ukrug oko sebe u visini pojasa: drži je obema rukama za kraj držalje, telo se okreće za sekirom (u kadrovima sečivo ide udesno, ka nama, ulevo, od nas). Stoji raskoračen u mestu. Kadar 7 se pretapa u 0. |
| `dzelat-skok` | 6 | ne | Skok sa udarcem odozgo. 0: čučne, sekira iza glave; 1: odraz; 2: u vazduhu, sekira visoko iznad glave obema rukama; 3: pada, sekira kreće nadole; 4: doskok, sekira se zabija u zemlju ispred stopala; 5: pogrbljen nad sekirom zabodenom u zemlju. U kadrovima 2–3 stopala su iznad y=488 (do 110 px), inače na y=488. |
| `dzelat-bes` | 6 | ne | Razjari se. 0: stoji; 1: zabode sekiru u zemlju pored sebe; 2: strgne kapuljaču sa glave (ispod: obrijana glava, crni brk); 3–4: udara se pesnicama u grudi i riče, glava zabačena; 5: zgrabi sekiru, pognut, spreman. Od kadra 2 je bez kapuljače. |
| `dzelat-omamljen` | 6 | da | Ošamućen: tetura u mestu, glava klonula i njiše se, sekira se vuče sečivom po zemlji u opuštenoj ruci, druga ruka se hvata za glavu. Kadar 5 se pretapa u 0. |
