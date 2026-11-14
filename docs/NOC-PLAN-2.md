# Noćni plan 2 — noć 10. na 11. novembar (grana `noc-poliranje`)

Radni folder: `D:\projects\Marko Kraljevic\marko-noc` (git worktree, bez `art/`). Server: `PORT=4174 node server.mjs`
(preview konfiguracija `marko-noc`). Druga sesija („Proporcionalne figure i animacije") radi na `main` u `marko-game`
i jedina naručuje Codex crteže. Ne diram: `art/`, `sprite-rig.json`, `sync-*.py`, `build-sprite-rig.py`, funkcije za
sablju, dokrajčivanje, prikradanje, brutalnost i scene pre pohoda. `deathPose` mora ostati u jednom redu.

## Pravila rada
1. Posle svake celine: `npm test`, `node simulation-test.mjs`, `node animation-tests.mjs`; pa commit u `noc-poliranje`.
2. Ne gura se na `main`. Povremeno `git merge origin/main` u ovu granu.
3. Skripte pisati alatom Write (heredoc u bash-u kvari navodnike i obrnute kose crte).
4. Svaki novi srpski tekst mora imati engleski u `dist/i18n.js` (blok „noc-poliranje"), inače pada `i18n-test`.
5. Snimaka ekrana malo i umanjenih (disk C: se ranije napunio).
6. Na kraju: `JUTARNJI-IZVESTAJ-2.md` — šta je urađeno, šta nije, šta nije provereno u igri.

## Šta je Stefan tražio (redom važnosti)
- [x] **A. Borba.** Kraj spama lakim udarcem; telo neprijatelja se ne prolazi; bosovi imaju gard, kontru, činove, koštac.
- [x] **B. Bosovi po činovima.** Nov potez u II i III činu za 12 bosova (trio ostaje grupna borba).
- [x] **C. Više košca i davljenja** i kod običnih neprijatelja.
- [x] **D. Priča.** Musa posle devetog pohoda; redosled po Markovom životu; Đemo posle Muse.
- [x] **E. Guslar.** Ceo snimak (5:12), teče od guslara do guslara; odbrana guslara u pet četa; guslar u svakom kraju.
- [x] **F. Trgovci i dukati.** Trgovac pred megdanom, amajlija, zadužbine i sofra kod kovača.
- [x] **G. Duže.** Pohodi produženi; barjaci unutar pohoda; novi nivoi Urvina, let sokola, tajni San. Potera za vilom na Šarcu je u Šumi.
- [~] **H. Izgled.** Stena bez mreže pločica, tiši HUD, međukadrovi za trk i hod. Prolaz bez neprijatelja samo plitko.
- [x] **I. Knjige.** Megdandžije u Knjizi dušmana; ispravke u Knjizi legendi.
- [x] **J. Jutarnji izveštaj:** `JUTARNJI-IZVESTAJ-2.md`.
- [x] Pročitan ceo ciklus pesama: `pesme/` i `pesme/BELESKE.md`.

## Ako se rad nastavlja (sledeće po vrednosti)
1. Beg oko crkve od oca u Manastiru (treba crtež Vukašina); presuda je već unutra.
2. Prerušavanje u kaluđera i kaluđersko kolo („Mina od Kostura") na Obali (treba crtež).
3. Megdan pogledom sa Ljuticom Bogdanom (nadstreljivanje sa Alil-agom je urađeno, u Oranju).
4. Ručno razmeštanje predmeta po nivoima uz `?scout` (do sada samo pregled po kadrovima, bez nađenih grešaka).
5. Izbor džojstikom u dućanu i u presudi.

## Dnevnik
| Vreme | Urađeno | Commit |
|---|---|---|
| 00:15 | A: pravila megdana (telo, gard, kontra, činovi, koštac) | e25c563 |
| 00:35 | B, C, D: činovi bosova, više košca, redosled po životu, Đemo posle Muse | (vidi git log) |
| 00:41 | Pesme sa Vikizvornika i beleške | bc45f22 |
| 00:49 | Barjaci unutar pohoda, ceo snimak guslara, odbrana guslara | 7b4efd3 |
| 00:54 | Trgovac, amajlija, zadužbine | d50ee32 |
| 01:07 | Urvina planina | d1ddc6f |
| 01:10 | Stena bez mreže pločica; top više ne ruši crtanje | fdce647 |
| 01:13 | Let sokola | 4a18975 |
| 01:21 | Tajni nivo San Kraljevića Marka | 2bdb787 |
| 01:27 | Megdandžije u Knjizi dušmana, ispravke legendi, tiši HUD | 4f6eea6 |
| 01:30 | Međukadrovi za trk i hod | 819b062 |
| 01:36 | Duži pohodi, guslar svakog kraja, Đemo bez topuza, odjek | 5fe3bd6 |
| 01:42 | Jutarnji izveštaj | (ovaj commit) |
| 01:50 | Veštine po novom redosledu (odskok od zida pre Tvrđave), lakši prvi megdani, obuka u prvom pohodu | 8c90b8e, d8f004f |
| 01:56 | Ređi koštac; megdan-bot.mjs | 713f75a |
| 02:01 | Potera za vilom na Šarcu | 4c4bf70 |
| 02:08 | Presuda u Manastiru | f97cdba |
| 02:14 | Režim razgledanja `?scout` | (ovaj commit) |
| 11. 11. jutro | Stefan odobrio: grana spojena u `main` (c79aec2) i objavljena. Rad se nastavlja u `marko-noc`, spajanje na celinama. | c79aec2 |
| 11. 11. jutro | Nadstreljivanje sa Alil-agom u Oranju (pobratim pomaže u megdanu); partner više ne kopira trećeg janičara; tasteri 1–4 u dućanu | (ovaj commit) |
