# Dopuna 132 (od Claude-a, 19. 11.): Arapov sluga, dušman (jedanaesti pohod)

Pesma „Marko Kraljević ukida svadbarinu”: „Arap ima četrdeset slugu, što čuvaju stražu oko njega … beže sluge pod šator Arapu, pa se kriju za Arapa sluge, pokrivaju sablje japundžeti, da im Marko ne vidi sabalja … Trže Marko sablju od pojasa, pak zaredi Arapove sluge.” U jedanaestom pohodu svi dušmani su Arapove sluge. Pravi se njihov lik: pet klipova borbe.

Status piši u `art/world-pack-03/STATUS-D132.md` (napravi ga), red posle SVAKE stavke, sa oznakom `D132`. **Uradi SVIH pet klipova do kraja. Ne staj i ne pitaj. Sitne ostatke ključa čistim ja: upiši ih u status i IZVEZI klip svejedno. Jedan pokušaj po klipu; drugi samo ako je lik pogrešan ili je kadar isečen.**

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, druge `STATUS-*` fajlove, tuđe foldere klipova, git, fajlove `*dopuna41*`. Paralelno rade D129, D134 i D136: ne diraj njihove fajlove.

## Uzori (`art/world-pack-03/uzori-d132/`)

- `katana-idle-kadar0.png`: vojnik iz igre, ćelija 512×512, stopala na y=486, visok 422 px, gleda udesno. **Uzor mere, tela i položaja u ćeliji.**
- `pokret-katana-idle.png`, `-run`, `-attack`, `-hurt`, `-death`: **uzor POKRETA** za klip istog nastavka (isti broj kadrova, isti tok, isti položaj u ćeliji, gleda udesno).
- `arapin-idle-kadar0.png`: njegov gospodar, crni Arapin (plavo i zlatno). Sluga je iz istog kraja sveta, ali je **siromašniji, mršaviji i bez oklopa**; ne sme ličiti na gospodara.

## Kako izgleda Arapov sluga

Mlad tamnoput momak, kratka crna brada, **bela čalma omotana oko crvenog fesa**, **dugačak tamnocrven ogrtač sa kapuljačom zabačenom na leđa (japundže), do kolena, spreda otvoren**, ispod njega bela košulja i široke žute šalvare, zelen pojas, crvene papuče sa povijenim vrhom, u ruci **kriva sablja**, bez štita i bez oklopa. Uspravan visok oko 422 px. Mora se odmah razlikovati od turskog vojnika (janičar, katana, delija) i od Arapina.

## Pravila

- Ćelija 512×512, sigurna margina 24 px (kod `-run` i `-hurt` 8 px), providna pozadina, bez teksta, tla, senke, zvezdica i efekata.
- Jedan `image_gen` poziv crta mrežu (3×2 za 6 kadrova, 2×2 za 4) na ravnoj jarko zelenoj #00ff00; iseci polja, skini zelenu, svaki kadar u svoju ćeliju. Bez okvira ćelije, linija mreže i komada susednog kadra. **Proveri i zatvorene praznine (između ruke i tela, između nogu, ispod ogrtača): ni tu ne sme ostati zelena.** Pojas je zelen: ako ga ključ izjede, crtaj na jarko ljubičastoj #ff00ff i skini ljubičastu.
- Stopala na y=486 (±2 px); lik na istom mestu u ćeliji kao u uzoru pokreta. **Ne razvlači kadrove na istu visinu.** Ako je lik malo veći ili manji od traženog, promeni razmeru celog klipa (upiši `k=` u status).
- Klip ide u `art/animation-pack-04/assets/<klip>/`: `atlas.png`, `manifest.json` sa `frame_layout`, `frames/motion/frame-N.png`, `preview.gif`, `qa.json`. JSON bez BOM-a. Radni fajlovi u `art/animation-pack-04/sources/<klip>/attempt-N/`. Postupak: `art/world-pack-03/export-dopuna127.py` (svoja kopija `export-dopuna132.py`).
- **Prvo** napravi `arap-sluga-idle` kao uređivanje `katana-idle-kadar0.png` (presvuci ga u slugu; poza i mera iste). Njegov kadar 0 je uzor lika za ostale klipove.

## Klipovi (redom)

| Klip | Kadrova | Petlja | Šta radi |
|---|---|---|---|
| `arap-sluga-idle` | 6 | da | po `pokret-katana-idle.png`: stoji na straži sa sabljom, osvrće se, ogrtač se njiše |
| `arap-sluga-run` | 6 | da | po `pokret-katana-run.png`: trči u napad, sablja napred, ogrtač vijori za njim |
| `arap-sluga-attack` | 6 | ne | po `pokret-katana-attack.png`: zamah sabljom odozgo |
| `arap-sluga-hurt` | 4 | ne | po `pokret-katana-hurt.png` |
| `arap-sluga-death` | 6 | ne | po `pokret-katana-death.png`: pada na leđa, čalma se odmota, sablja ispadne |
