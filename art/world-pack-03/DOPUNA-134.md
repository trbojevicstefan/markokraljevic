# Dopuna 134 (od Claude-a, 19. 11.): Kosovka devojka i dve sluškinje pod šatorom (jedanaesti pohod)

Pesma „Marko Kraljević ukida svadbarinu”: „Devojka se do zemlje poklanja … Proli suze Kosovka devojka … Pogledajde dole niz Kosovo: gdi se onaj svilen barjak vije, onde j’ šator crnog Arapina … Arap sedi, pije vino hladno, služi mu ga mlada i devojka.” Kosovka devojka u igri samo stoji, hoda i poji. Fale tri njene radnje i dve žene koje služe Arapina.

Status piši u `art/world-pack-03/STATUS-D134.md` (napravi ga), red posle SVAKE stavke, sa oznakom `D134`. **Uradi SVIH pet klipova do kraja. Ne staj i ne pitaj. Sitne ostatke ključa čistim ja: upiši ih u status i IZVEZI klip svejedno. Jedan pokušaj po klipu; drugi samo ako je lik pogrešan ili je kadar isečen.**

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, druge `STATUS-*` fajlove, tuđe foldere klipova (postojeće klipove `kosovka-*` i `mlada-*` ne menjaš), git, fajlove `*dopuna41*`. Paralelno rade D129, D132 i D136: ne diraj njihove fajlove.

## Uzori (`art/world-pack-03/uzori-d134/`)

- `kosovka-idle-kadar0.png`: **Kosovka devojka iz igre** (ćelija 512×512, stopala na y=488, visoka 330 px, gleda udesno): mlado lice, **seda kosa u pletenici**, bela vezena košulja, crven jelek, tamna suknja sa šarenom pregačom. **Uzor lika, odeće i mere** za prva tri klipa: na svim kadrovima ista devojka, iste visine.
- `mlada-trci-kadar0.png`: **mlada iz igre** (venac od cveća, tanak veo, crven jelek, bela vezena haljina): uzor lika i odeće za `mlada-sluzi`.
- `marko-idle-2-kadar0.png`: Marko (visok 382 px u ćeliji): samo za meru. Žene su niže od njega: uspravne oko 330 px.

## Pravila

- Ćelija 512×512, sigurna margina 24 px, providna pozadina, bez teksta, tla, senke i efekata.
- Jedan `image_gen` poziv crta mrežu (3×2 za 6 kadrova) na ravnoj jarko zelenoj #00ff00; iseci polja, skini zelenu, svaki kadar u svoju ćeliju. Bez okvira ćelije, linija mreže i komada susednog kadra. **Proveri i zatvorene praznine (između ruke i tela): ni tu ne sme ostati zelena.**
- Stopala na y=488 (±2 px). **Ne razvlači kadrove na istu visinu**: kad se devojka pokloni, kadar je niži, a stopala ostaju na mestu. Ako je lik malo veći ili manji, promeni razmeru celog klipa (upiši `k=` u status).
- Klip ide u `art/animation-pack-04/assets/<klip>/`: `atlas.png`, `manifest.json` sa `frame_layout`, `frames/motion/frame-N.png`, `preview.gif`, `qa.json`. JSON bez BOM-a. Radni fajlovi u `art/animation-pack-04/sources/<klip>/attempt-N/`. Postupak: `art/world-pack-03/export-dopuna127.py` (svoja kopija `export-dopuna134.py`).

## Klipovi (redom)

| Klip | Kadrova | Petlja | Šta radi |
|---|---|---|---|
| `kosovka-klanja` | 6 | ne | **Kosovka devojka se klanja do zemlje**: 0 stoji kao u uzoru, 1–2 desnu ruku stavi na grudi i sagne se, 3 duboko poklonjena (leđa vodoravna, glava oborena, pletenica visi), 4–5 uspravlja se. Gleda udesno. |
| `kosovka-place` | 6 | da | **roni suze**: stoji malo pognuta, obema rukama pokrije lice, ramena joj se tresu, pa rukavom obriše oči i opet zaplače. Gleda udesno. |
| `kosovka-pokazuje` | 6 | ne | **pokazuje niz polje**: 0–1 okrene se i podigne desnu ruku, 2–5 ruka ispružena pravo napred udesno u visini ramena, kažiprst pokazuje, druga ruka na grudima, gleda u daljinu (kadrovi 3–5 se jedva razlikuju: ruka malo podrhtava). Gleda udesno. |
| `mlada-sluzi` | 6 | da | **mlada (kao u `mlada-trci-kadar0.png`) služi vino**: stoji mirno, oborenog pogleda, uplašena; u rukama **bakarni ibrik sa dugim grlićem**, nagne ga kao da toči u čašu ispred sebe, pa ga ispravi i pritisne uz grudi. Gleda ULEVO. Visoka oko 335 px. |
| `devojka-sluzi` | 6 | da | **devojka služi vino**: mlada seljanka duge smeđe pletenice, bez vela i bez venca, bela košulja, plav jelek, crvena suknja; obema rukama drži **okrugao poslužavnik sa srebrnom čašom**, pruži ga napred pa ga privuče, glava pognuta, uplašena. Gleda ULEVO. Visoka oko 330 px. Ne sme ličiti ni na mladu ni na Kosovku devojku (njena kosa nije seda). |
