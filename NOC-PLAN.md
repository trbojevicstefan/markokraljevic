# Noćni plan — 9. novembar, 00:00–08:00

Osam iteracija, svaka u puni sat, oko 100k tokena. Svaka iteracija uzima sledeće neštiklirane stavke redom.

## Pravila za svaku iteraciju
1. **Codex prvo.** VAŽNO: desktop aplikacija drži originalnu nit, pa se radi u forku `01a1bd68-2fcf-7023-b45f-bba9e4d3c10e`. Pokretanje iz bash-a (PATH bez WindowsApps, da Codex koristi powershell.exe 5.1):
   `PATH=$(echo "$PATH" | tr ':' '
' | grep -v WindowsApps | paste -sd:) codex exec resume --skip-git-repo-check -c 'sandbox_mode="workspace-write"' -c 'windows.sandbox="unelevated"' 01a1bd68-2fcf-7023-b45f-bba9e4d3c10e "<poruka>"`
   Proveri da li još radi: `tasklist | grep -i codex` ili kraj loga.
   - Pogledaj `art/world-pack-03/STATUS.md` i log `codex-noc.log` u scratchpad-u.
   - Ako Codex stoji, a u listi D ima posla, pošalji mu sledeću poruku kroz terminal, u pozadini:
     `codex exec resume 01a1b16b-b38c-7a72-accf-2512da422b9c "<poruka>"`
     Izlaz ide u scratchpad `codex-noc.log`.
   - Ne šalji novu poruku dok prethodna još radi.
   - Ako odgovori da nema kredita, upiši to u dnevnik i probaj sledeće iteracije.
2. **Posle izmena pusti sve testove:**
   - `npm test`
   - `node simulation-test.mjs` (mora biti `"end": "victory"`)
   - `node animation-tests.mjs`
3. **Vizuelna provera.** Ono što se vidi proveri u pregledaču preko `http://localhost:4173/?dev`. `window.markoDev` daje `startLevel`, `p` i `world`; tasteri se šalju kao `document` keydown/keyup.
4. **Kraj iteracije.**
   - Commit (sa Co-Authored-By linijom), pa push na `main`.
   - Upiši red u Dnevnik na dnu ovog fajla.
   - Štikliraj urađeno.
5. Kapije se ne diraju dok Codex ne isporuči profile (D4).
6. Ništa od Codex-ove isporuke se ne briše.

> **Codex, 00:35:**
> - Isporučio, a čeka ugradnju u igru (iteracija 2):
>   - svih 8 klipova iz DOPUNA-5: idle-2, crouch-walk, block-walk, charge-walk, dizzy, turn, run-start, land;
>   - svih 6 preostalih launch klipova;
>   - sve 4 reakcije iz 7d (shield-guardbreak, oklopnik-armorbreak, akindzija-backstep, palikuca-burn);
>   - prvu kapiju iz DOPUNA-3 (prolaz-kamen-otvoren, sa `portal-anchors.json`).
> - Posle toga je opet ostao bez kredita („workspace is out of credits“). Proveravati u svakoj iteraciji jednom kratkom porukom.

## A. Animacije i fluidnost (najbitnije)
- [x] **A1 Idle bez trzaja.**
  - Izbaci kadar 4 (gleda u kameru).
  - Lagani ping-pong 0-1-2-3 na ~5 fps, uz blago disanje.
  - Test: idle nikad ne vraća kadar 4 i ne menja kadar brže od 0,15 s.
- [x] **A2 Iste visine.**
  - Stojeći kadrovi treba da budu ±3% od iste visine: idle, run, block[0], crouch[0], drink, kick[0], push, combo-1[0], hurt[0], jump[0].
  - Sada je idle 136, a run 127, pa se Marko „smanji“ kad krene.
  - Ispraviti u `build-sprite-rig.py` i dodati proveru u `animation-tests.mjs`.
  - Isto proveriti za neprijatelje (idle prema run/attack).
- [x] **A3 Čučanje i hod u čučnju.**
  - S drži čučanj, a A/D u čučnju je spor hod u čučnju.
  - Za sada crouch kadrovi 2–3 sa korakom i njihanjem.
  - Kad Codex isporuči `marko-crouch-walk`, prebaciti na njega.
- [x] **A4 Hod sa blokom.**
  - L + A/D: block kadar 2 sa korakom, štit napred.
  - Kasnije `marko-block-walk`.
- [x] **A5 Hod dok se puni K.**
  - Charge-hold i spor korak.
  - Kasnije `marko-charge-walk`.
- [x] **A6 Vihor ima cenu.**
  - Kad se završi: vrtoglavica oko 0,7 s (zvezdice oko glave, teturanje), pa pad (knockdown) i sporo ustajanje (getup).
  - Za to vreme je ranjiv.
  - Test.
- [x] **A7 Manje stenjanja.**
  - Glas pri udarcu ima razmak od bar 1,6 s; laki udarci 30% šanse; skok bez glasa osim ponekad.
  - Test: 10 udaraca za 3 s daje najviše 3 glasa.
- [ ] **A8 Prelazi.**
  - Doskok, okret i početak/kraj trčanja bez skokova u pozi.
  - Okret bar 1–2 kadra; trčanje se ubrzava kroz prvi korak.

## B. Neprijatelji, prepreke, pozadine
- [ ] **B1 Šatori.**
  - `prop-turski-sator` je izvor Osmanlija: soba `sator` u oranju, tvrđavi, prevoju i reci.
  - Iz šatora izlaze talasi (do 3) dok ga Marko ne sruši teškim udarcima.
  - Test.
- [ ] **B2 Raspored.**
  - Dekor se ne sme preklapati sa zamkama, lestvama, kulama, vratima i ciljevima.
  - Nema presečenih propova (drvo presečeno ivicom platforme ili zida) ni predmeta koji lebde.
  - Test u `levels-test`: nijedan prop ne visi preko ivice tla.
- [ ] **B3 Pozadine.**
  - Snimci svakog pohoda (dan, noć, oluja) na nekoliko tačaka.
  - Traži šavove neba (nebo naglo druge boje), presečene slojeve i loše spojeve sky/far/mid/near; ispraviti.
- [ ] **B4 Prepreke u ritmu.**
  - Zamka, odmor, borba, nagrada — bez dugih praznih delova i bez zamki jedne na drugoj.

## C. Zagonetke i tok
- [ ] **C1 Zanimljivije zagonetke.** Kombinacije:
  - teret na ploči otvara put do ključa;
  - poluga sa vremenom, pa klizanje (S u trku) ispod spuštene rešetke;
  - napukao pod i ključ u podrumu;
  - šut (S+J) gura neprijatelja na kolje.
- [ ] **C2 Tok.**
  - Headless bot prolazi svaki pohod do cilja bez zaglavljivanja.
  - Svaka zagonetka ima jasan natpis ili savet.

## D. Codex (kad ima kredita)
- [ ] **D1** (u toku; marko-idle-2 gotov i ugrađen) DOPUNA-5: Markove fluidne animacije (idle, crouch-walk, block-walk, charge-walk, vihor-vrtoglavica, okret).
  Prva poruka Codex-u (jedan red):
  „Dopuna od Claude-a: pročitaj D:\projects\Marko Kraljevic\marko-game\art\world-pack-03\DOPUNA-5.md — Markove fluidne animacije sada imaju prednost. Posle njih: ostatak launch klipova iz DOPUNA-4, izvoz četiri reakcije iz 7d, pa kapije iz DOPUNA-3. Posle svakog klipa dopuni STATUS.md. Ništa urađeno ne briši.“
- [ ] **D2** Ostatak launch klipova: akindzija, kopljanik, palikuca, pas, tufekdzija, oklopnik.
- [ ] **D3** Četiri reakcije iz 7d: izvoz već nacrtanih grid-ova.
- [ ] **D4** Kapije iz DOPUNA-3 (profil, prolaz sleva nadesno), pa ugradnja: prednji deo kapije se crta ispred Marka.
- [ ] **D5** Ugradi sve što stigne (`sync-anims.py`, `sync-world.py`, `build-sprite-rig.py`).

## E. Ispolirani detalji
- [ ] **E1** Prašina i zvuk pri doskoku, senke, trzaj kamere — ništa preterano.
- [ ] **E2** Natpisi se ne preklapaju.
- [ ] **E3** Jutarnji izveštaj (poslednja iteracija): šta je urađeno, šta čeka, i snimci.

## Dnevnik
| Iteracija | Vreme | Urađeno | Commit |
|---|---|---|---|
| 1/8 | 00:04–01:00 | Codex ponovo radi preko terminala (fork niti, popravljen sandbox), isporučio marko-idle-2 i radi crouch-walk. Visine izjednačene: Marko 128 px u svim stojećim klipovima, neprijatelji idle = trk (heights-test.mjs, 20 provera). Mirni idle bez kadra koji gleda u kameru, sada Codex-ov idle-2. Hod u čučnju, hod sa blokom i hod dok se puni K (privremene poze dok Codex ne isporuči klipove). Posle vihora: vrtoglavica 0,9 s sa zvezdicama, pad i ustajanje 1,25 s. Manje stenjanja (razmak 1,6–2,4 s, retko). 117 mehaničkih provera. | vidi git log |
