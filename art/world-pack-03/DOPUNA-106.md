# Dopuna 106 (od Claude-a, 19. 11.): dženeralovica sa ključevima tamnice

Stefan (19. 11.): „Naslikaj tamnicu i sve što ti treba iz inventara.”

U pesmi „Marko Kraljević i Vuča dženeral”, kad Marko odvede Vuču i Velimira, „knjigu piše dženeralovica: Ne gubi mi Vuče dženerala i mojega sina Velimira; išti, Marko, što je tebe drago”, pa „uzima od tavnice ključe, te otvori prokletu tavnicu, i izvadi tri vojvode mlade”. U igri sada tamnicu otvara Marko sam. Pravi se **dženeralovica**, Vučina žena: stoji pred tamnicom sa ključevima i otključava je.

Status piši u `art/world-pack-03/STATUS-D106.md` (napravi ga), red posle SVAKE stavke, sa oznakom `D106`. **Uradi obe stavke do kraja, ne staj i ne pitaj posle prve.**

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, druge `STATUS-*` fajlove, tuđe foldere klipova, git, fajlove `*dopuna41*`. Paralelno rade D104 i D105: ne diraj njihove fajlove.

## Uzori (`art/world-pack-03/uzori-d106/`)

- `velimirovica-idle-kadar0.png` i `pokret-velimirovica-idle.png`: Velimirovica, snaha Vuče dženerala (mlada ugarska plemkinja), ćelija 512×512, stopala na y=488, gleda ulevo. **Uzor mere, rukopisa i položaja u ćeliji.** Dženeralovica je iz iste kuće, ali starija i bogatije obučena.
- `milos-idle-kadar0.png`: Miloš od Pocerja (visok 380 px), da se vidi mera prema muškarcu.
- `vuca-idle-kadar0.png`: Vuča dženeral, njen muž (boje kuće: plavo i zlatno, krzno).

## Kako izgleda dženeralovica

Gospođa od pedesetak godina, uspravna i ponosna, ali uplakana i zabrinuta: seda kosa pod **belim velom i niskom zlatnom krunicom-partom**, **tamnoplava teška haljina sa zlatnim vezom** do zemlje, preko nje **ogrtač od crvenog somota opšiven krznom**, zlatan pojas sa kog visi **velika gvozdena alka sa tri duga tamnička ključa**, u levoj ruci **savijena knjiga (pismo) sa crvenim pečatom**. **Visoka oko 360 px**, gleda ulevo (kao Velimirovica).

## Pravila (ista kao u `DOPUNA-76.md`)

- Ćelija 512×512, sigurna margina 24 px, providna pozadina, bez teksta, tla, senke, zvezdica i efekata.
- Jedan `image_gen` poziv crta mrežu 3×2 (6 kadrova) na ravnoj jarko zelenoj #00ff00; iseci polja, skini zelenu, svaki kadar u svoju ćeliju. U izvozu ne sme ostati okvir ćelije ni linije mreže, ni komad susednog kadra.
- Stopala (rub haljine) na y=488 (±2 px); lik na istom mestu u ćeliji kao uzor.
- **Ne razvlači kadrove na istu visinu.** Ako je lik malo veći ili manji od traženog, smanji ili uvećaj ceo klip istom razmerom i izvezi (upiši `k=` u status). Ne odbijaj dobar pokušaj zbog visine.
- Klip ide u `art/animation-pack-04/assets/<klip>/`: `atlas.png`, `manifest.json` sa `frame_layout`, `frames/motion/frame-N.png`, `preview.gif`, `qa.json`. JSON bez BOM-a. Radni fajlovi u `art/animation-pack-04/sources/<klip>/attempt-N/`.
- Postupak: `art/world-pack-03/export-dopuna76.py` i `verify-dopuna76.py`, prilagođeni (svoje kopije zovi `export-dopuna106.py` i `verify-dopuna106.py`).
- Kadar 0 klipa `dzeneralovica-idle` je uređivanje `velimirovica-idle-kadar0.png` (ista poza i mera, druga žena i odeća); ostali kadrovi su uređivanje tog kadra.
- Najviše dva pokušaja po klipu.

## Klipovi (redom)

| Klip | Kadrova | Petlja | Šta radi |
|---|---|---|---|
| `dzeneralovica-idle` | 6 | da | stoji, steže pismo na grudi, obriše suzu krajem vela, pogleda ka tamnici pa opet napred |
| `dzeneralovica-otkljucava` | 6 | ne | skida alku sa ključevima sa pojasa, pruži ruku sa ključem napred (ulevo) u visini pojasa i okrene ključ; u poslednjem kadru stoji sa spuštenom rukom i oborenom glavom |
