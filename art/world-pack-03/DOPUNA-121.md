# Dopuna 121 (od Claude-a, 19. 11.): vila brodarica peške (osmi pohod, „Marko Kraljević i vila brodarica”)

Stefan (19. 11.): „Da prati pesmu … Da postoji svaki lik iz pesme i svaka animacija, do najsitnijeg detalja.” Osmi pohod (Vilinska pećina) ide po pesmi:

> Pa ćeš naći jezer-vodu ladnu i na vodi vilu brodaricu; pa je vila na vodi zaspala, pa se čuvaj da je ne probudiš, jer je vrlo skupa brodarina! … Al’ se trže vila iza sanka, pozna vila da se voda pila, pa otide u goru zelenu, te uvati trogoca jelena, pa ga jednom gujom zauzdala, a drugom ga gujom prestegnula, a trećom ga gujom ošibuje, pa dostiže Kraljevića Marka: „Stani, Marko, plati brodarinu! … oću tvoje oči čarne i od Šarca noge do kičica!” … On potrže laka šestoperca, te udara brodaricu vilu … osta vila nogom micajući.

Vila brodarica je megdandžija pohoda. Ovde je peške (na jelenu je u D122).

Status piši u `art/world-pack-03/STATUS-D121.md` (napravi ga), red posle SVAKE stavke, sa oznakom `D121`. **Uradi SVIH pet stavki do kraja. Ne staj i ne pitaj. Sitne ostatke ključa na ivicama čistim ja posle izvoza: upiši ih u status i IZVEZI klip svejedno. Jedan pokušaj po klipu; drugi samo ako je lik pogrešan ili je kadar isečen.**

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, druge `STATUS-*` fajlove, tuđe foldere klipova, git, fajlove `*dopuna41*`. Paralelno rade D122, D123, D124: ne diraj njihove fajlove.

## Uzori (`art/world-pack-03/uzori-d121/`)

- `katana-idle-kadar0.png`: dušman iz igre, ćelija 512×512, stopala na y=488, visok 426 px, gleda udesno. **Uzor mere i položaja u ćeliji.**
- `pokret-katana-idle.png`, `-run`, `-attack`, `-hurt`, `-death`: **uzor POKRETA** za klip istog imena (isti broj kadrova, isti tok, isti položaj u ćeliji, gleda udesno).
- `turkinja-idle-kadar0.png`, `velimirovica-idle-kadar0.png`: žene iz igre (rukopis lica i tkanine). Vila NE sme da liči na njih: ona nije čovek.

## Kako izgleda vila brodarica

Vila sa jezera, lepa i strašna: **visoka, vitka, bleda kao mesečina, veoma duga mokra kosa boje tamnog zlata do ispod kolena, upletena lokvanjima i trskom**, oči svetle, bez zenica. **Duga haljina boje jezerske vode (plavo-zelena, tamna pri dnu) koja se pri dnu rasipa u kapi i maglu**, srebrn pojas od ribljih krljušti, bosa. **U desnoj ruci drži živu guju šarku kao bič** (zmija duga kao njena ruka, glava zmije je vrh biča). Bez krila. Uspravna visoka oko 426 px. Mora se odmah razlikovati od Ravijojle iz igre (bela haljina, krila, luk).

## Pravila

- Ćelija 512×512, sigurna margina 24 px (kod `-run` i `-hurt` 8 px), providna pozadina, bez teksta, tla, senke, zvezdica i efekata.
- Jedan `image_gen` poziv crta mrežu (3×2 za 6 kadrova, 2×2 za 4) na ravnoj **jarko ljubičastoj #ff00ff** (haljina je plavo-zelena, zato NE na zelenoj); iseci polja, skini ljubičastu, svaki kadar u svoju ćeliju. Bez okvira ćelije, linija mreže i komada susednog kadra.
- Stopala na y=488 (±2 px); lik na istom mestu u ćeliji kao u uzoru pokreta.
- **Ne razvlači kadrove na istu visinu.** Ako je lik malo veći ili manji od traženog, smanji ili uvećaj ceo klip istom razmerom i izvezi (upiši `k=` u status).
- Klip ide u `art/animation-pack-04/assets/<klip>/`: `atlas.png`, `manifest.json` sa `frame_layout`, `frames/motion/frame-N.png`, `preview.gif`, `qa.json`. JSON bez BOM-a. Radni fajlovi u `art/animation-pack-04/sources/<klip>/attempt-N/`.
- Postupak: `art/world-pack-03/export-dopuna116.py` (napravi svoju kopiju `export-dopuna121.py`).
- **Prvo** napravi `brodarica-idle`; njen kadar 0 je uzor lika za ostale klipove (i za D122 i D123: sačuvaj ga i kao `art/world-pack-03/uzori-d121/brodarica-idle-kadar0.png`).

## Klipovi (redom)

| Klip | Kadrova | Petlja | Šta radi |
|---|---|---|---|
| `brodarica-idle` | 6 | da | stoji, guja joj se uvija oko ruke i palaca jezikom, kosa i haljina se lagano talasaju kao pod vodom |
| `brodarica-run` | 6 | da | po `pokret-katana-run.png`: hita napred klizeći, kosa leti za njom, guja zabačena iza ramena |
| `brodarica-attack` | 6 | ne | po `pokret-katana-attack.png`: **zamahne gujom kao bičem i ošine pred sebe (udesno)**; u kadru 3–4 guja je ispružena napred, razjapljenih čeljusti |
| `brodarica-hurt` | 4 | ne | po `pokret-katana-hurt.png` |
| `brodarica-death` | 6 | ne | udarena topuzom pada na zemlju: 0–2 posrće i pada na leđa; 3–5 **leži na leđima, guja joj ispala iz ruke, jedna noga joj se trza u vazduhu** („osta vila nogom micajući”). Poslednja tri kadra moraju moći da se vrte u krug (noga gore, dole, gore). |
