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
- [x] **A8 Prelazi.**
  - Doskok, okret i početak/kraj trčanja bez skokova u pozi.
  - Okret bar 1–2 kadra; trčanje se ubrzava kroz prvi korak.

## B. Neprijatelji, prepreke, pozadine
- [x] **B1 Šatori.**
  - `prop-turski-sator` je izvor Osmanlija: soba `sator` u oranju, tvrđavi, prevoju i reci.
  - Iz šatora izlaze talasi (do 3) dok ga Marko ne sruši teškim udarcima.
  - Test.
- [x] **B2 Raspored.**
  - Dekor se ne sme preklapati sa zamkama, lestvama, kulama, vratima i ciljevima.
  - Nema presečenih propova (drvo presečeno ivicom platforme ili zida) ni predmeta koji lebde.
  - Test u `levels-test`: nijedan prop ne visi preko ivice tla.
- [x] **B3 Pozadine.**
  - Snimci svakog pohoda (dan, noć, oluja) na nekoliko tačaka.
  - Traži šavove neba (nebo naglo druge boje), presečene slojeve i loše spojeve sky/far/mid/near; ispraviti.
- [x] **B4 Prepreke u ritmu.**
  - Zamka, odmor, borba, nagrada — bez dugih praznih delova i bez zamki jedne na drugoj.

## C. Zagonetke i tok
- [x] **C1 Zanimljivije zagonetke.** Kombinacije:
  - teret na ploči otvara put do ključa;
  - poluga sa vremenom, pa klizanje (S u trku) ispod spuštene rešetke;
  - napukao pod i ključ u podrumu;
  - šut (S+J) gura neprijatelja na kolje.
- [x] **C2 Tok.**
  - Headless bot prolazi svaki pohod do cilja bez zaglavljivanja.
  - Svaka zagonetka ima jasan natpis ili savet.

## D. Codex (kad ima kredita)
- [x] **D1** (svih 8 klipova ugrađeno) DOPUNA-5: Markove fluidne animacije (idle, crouch-walk, block-walk, charge-walk, vihor-vrtoglavica, okret).
  Prva poruka Codex-u (jedan red):
  „Dopuna od Claude-a: pročitaj D:\projects\Marko Kraljevic\marko-game\art\world-pack-03\DOPUNA-5.md — Markove fluidne animacije sada imaju prednost. Posle njih: ostatak launch klipova iz DOPUNA-4, izvoz četiri reakcije iz 7d, pa kapije iz DOPUNA-3. Posle svakog klipa dopuni STATUS.md. Ništa urađeno ne briši.“
- [x] **D2** Ostatak launch klipova: akindzija, kopljanik, palikuca, pas, tufekdzija, oklopnik.
- [x] **D3** Četiri reakcije iz 7d: izvoz već nacrtanih grid-ova.
- [ ] **D4** (kamena i drvena kapija ugrađene, Marko prolazi KROZ njih; rudnička i otvorena riznica: Codex radi) Kapije iz DOPUNA-3 (profil, prolaz sleva nadesno), pa ugradnja: prednji deo kapije se crta ispred Marka.
- [ ] **D5** Ugradi sve što stigne (`sync-anims.py`, `sync-world.py`, `build-sprite-rig.py`).

## E. Ispolirani detalji
- [x] **E1** Prašina i zvuk pri doskoku, senke, trzaj kamere — ništa preterano.
- [x] **E2** Natpisi se ne preklapaju.
- [ ] **E3** Jutarnji izveštaj (poslednja iteracija): šta je urađeno, šta čeka, i snimci.

## Dnevnik
| Iteracija | Vreme | Urađeno | Commit |
|---|---|---|---|
| 1/8 | 00:04–01:00 | Codex ponovo radi preko terminala (fork niti, popravljen sandbox), isporučio marko-idle-2 i radi crouch-walk. Visine izjednačene: Marko 128 px u svim stojećim klipovima, neprijatelji idle = trk (heights-test.mjs, 20 provera). Mirni idle bez kadra koji gleda u kameru, sada Codex-ov idle-2. Hod u čučnju, hod sa blokom i hod dok se puni K (privremene poze dok Codex ne isporuči klipove). Posle vihora: vrtoglavica 0,9 s sa zvezdicama, pad i ustajanje 1,25 s. Manje stenjanja (razmak 1,6–2,4 s, retko). 117 mehaničkih provera. | vidi git log |
| 2/8 | 01:04–01:45 | Ugrađeno 17 Codex klipova: hod u čučnju, hod sa blokom, hod dok se puni K, vrtoglavica (sada pravi klipovi), okret, prvi korak trka, doskok; launch klipovi za svih 9 neprijatelja; reakcije: štit odbijen, oklop puca, akindžijin odskok, palikuća gori. Šatori (oranje, tvrđava, prevoj, reka): do 3 talasa Osmanlija dok ih Marko ne sruši. Codex i dalje bez kredita (kapije čekaju). 126 mehaničkih provera. | vidi git log |
| 3/8 | 02:04–02:20 | Pozadine: svaki sloj se na spoju tila meko pretapa (12%), nema više naglih promena boje neba; seam-audit.py proverava svih 195 slojeva. Raspored: propovi stoje celi na svom tlu, ništa ih ne preseca (daske, kule, lestve), drže se dalje od zamki; mali propovi smeju i u sobe pa je gustina 19–36 po pohodu (bila 6–14); layoutAudit() u ?dev režimu čist za svih 13 pohoda. Poruka „Kapija se otvorila“ samo kad je Marko blizu. Codex i dalje bez kredita. | vidi git log |
| 4/8 | 03:04–03:35 | Zagonetke: nizak zid s procepom pri dnu (pećina, rudnik, podrum, ruševine, manastir, klisura) — prolazi se samo čučeći ili klizanjem, ispod zida Marko ostaje čučeći; kolje sada ranjava neprijatelja koji padne na njega bačen, šutnut ili ošamućen (šut na kolje). Ritam: provera recepata (nikad 3 zamke zaredom, odmor ili nagrada bar svakih 6 soba), ispravljeni klisura, prevoj, pećina, ruševine; ciljevi traže slobodno mesto do 2600 px (opet 19 ciljeva). Codex bez kredita. 132 mehaničke provere. | vidi git log |
| 5/8 | 04:04–04:40 | Kapije: Codex-ova bočna kamena kapija ugrađena tako da se crta ISPRED Marka — Marko ulazi između stubova, iza njega je taman tunel, rešetka (resetka) se diže u kulu kad se kapija otvori; staje 80 px ispred prolaza. Sve kapije (i na polugu) to koriste dok Codex ne nacrta drvenu i rudničku. U prolazu kapije nema više sanduka i ćupova (provera u levels-test). Codex bez kredita. | vidi git log |
| 6/8 | 05:04–05:35 | Tok: road-test.mjs — bot prolazi svih 13 pohoda do cilja (17 s, deo npm test); staje samo na namernim zagonetkama (lift, okno za skok od zida, rala), nijedno zaglavljivanje. Doskok: prašina, zvuk i blago drmanje kamere rastu sa visinom pada. Natpisi u istom kadru se više ne preklapaju (slažu se naviše). 134 mehaničke provere. Codex bez kredita. | 7e933e9 |
| 7/8 | 06:04–06:45 | Neprijatelji dišu mirno: idle petlje idu napred-nazad kroz kadrove koji se glatko nastavljaju, 5 fps (najveći skok kadra npr. janičar 16.8 → 7.0); pas i ostali blago dišu. Propovi se ne stavljaju u sobe sa zamkama ni na zamke (ni ručno postavljeni); layoutAudit čist za svih 39 varijanti (dan/noć/oluja). Codex opet ima kredita: nacrtao drvenu kapiju (ugrađena — sela, šuma, močvara, reka, oranje) i radi rudničku i otvorenu riznicu. 135 mehaničkih provera. | vidi git log |
