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
- [ ] **B. Bosovi po činovima.** Svaki od 13 bosova dobija nov potez u II i III činu (ne samo brži).
- [ ] **C. Više košca i davljenja** i kod običnih neprijatelja.
- [ ] **D. Priča.** Musa u sredini; redosled pohoda po Markovom životu; mapa putovanja.
- [ ] **E. Guslar.** Duža pesma, peva stalno; nivo u kom se guslar brani.
- [ ] **F. Trgovci i dukati.** Dućan, otključavanje poteza, nivoi imaju smisla.
- [ ] **G. Tri sata igre.** Duži pohodi i novi nivoi: Urvina (penjanje), let sokola, potera za vilom, tajni nivo.
- [ ] **H. Izgled.** Prolaz bez neprijatelja, teren bez ponavljanja, HUD, fluidnost animacija.
- [ ] **I. Meni, Knjiga dušmana, Knjiga legendi** prate sve novo.
- [ ] **J. Jutarnji izveštaj.**

## Dnevnik
| Vreme | Urađeno | Commit |
|---|---|---|
| 00:50 | A: pravila megdana (telo, gard, kontra, činovi, koštac), 14 novih provera, 164 provere bitaka prolaze | e25c563 |
