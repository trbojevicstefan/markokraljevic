# Realistične pozadine: izveštaj (noć 11/12. 11. 2026)

Grana `claude/realisticne-pozadine-1239f2`, bez push-a. Sve je u `dist/assets/realisticno/`, a opis je u
`dist/assets/realisticno/manifest.json` (ugovor sa greybox sesijom). Kako to izgleda složeno kao u igri:
`art/realisticno/<biom>/scena-<biom>.jpg` i `scena-<biom>-unutra.jpg`.

## Šta je napravljeno

| Celina | Sadržaj |
|---|---|
| **Podgrađe** (Prilep u zlatni sat) | nebo, daleki plan (Markove kule na granitnom brdu), srednji (zidine, kule, kuće podgrađa), bliži (kuća sa čardakom, orah, kula); podrum i tamnica: zadnji zid sa nišama, arkada, bačve i ćelija, stubovi sa bakljama; 5 materijala; 10 predmeta (sanduk, bačva, kameni blok, greda, ruševni luk, mangal, kapija, ćup, bunar, kolica) |
| **Urvina** (jutarnja magla) | vrhovi u moru magle, litice sa vodopadima, Ravijojlina šuma; pećina (snop svetla, stalaktiti, podzemni vodopad); 5 materijala; 10 predmeta (… baklja, vrata u steni, panj, paprat, stena sa mahovinom) |
| **Klisura** (sumrak i oluja) | olujno nebo, planine sa crvenim svetlom, kanjon sa drvenim mostom, rekom i Musinom kulom, obala sa borom; unutrašnjost kule (puškarnice, stepenice, vrata, koplja); 5 materijala; 10 predmeta (… čekrk, uže, kolje, most) |
| **Tlo sa dubinom** (za sva 3 + svih 14 ispod) | `materials.groundTop` (staza odozgo pod ~30°), `materials.groundFront` (ivica staze i presek tla), 4 predmeta `"layer":"foreground"` (busen, kamenje, koren, ograda) |
| **14 postojećih pejzaža** (`svet-<vista>`) | selo, klisura Ibra, šuma, manastir, tvrđava, prevoj, pećina, podrum, močvara, rudnik, ruševine, reka, oranje, Urvina: po 4 sloja, realistične verzije istih kompozicija |
| **151 predmet iz `world/`** (`svet-predmeti`) | iste veličine u pikselima i isti oslonac kao stari, svaki ima `"replaces":"world/<stari fajl>"` |

Svi slojevi se nastavljaju bez šava (proveravano spajanjem dve kopije i merenjem: šav je kao bilo koja susedna kolona).
Formati: nebo/zadnji zid 1774×887 RGB, slojevi 2172×724 RGBA, materijali 512×512 (ponavljaju se u oba pravca),
tlo 1024×256 (vodoravno). Sve je WebP, najveći fajl ~600 KB, ukupno ~60 MB.

## Kako je rađeno

- **Model:** Z-Image-Turbo na RX 9060 XT, `tools/zimg_img2img.py`.
  - Komponente idu direktno na GPU, tenzor po tenzor. Standardni safetensors loader je na Windows-u padao, jer kopira šard od 9,9 GB u RAM.
  - Transformer i text encoder su u fp8.
  - Vrh je 7,5 GB VRAM-a, a pre svake slike alat čeka da ostanu 3 GB slobodne za TTS iz projekta Videos.
  - Radnik (`--watch art/realisticno/queue`) drži model učitan i redom uzima poslove.
- **Bez šava već u modelu:** u svakom koraku model vidi sliku i njenu kopiju pomerenu za pola širine, a predviđanja se mešaju; VAE kodira i dekodira sa obmotanom ivicom.
- **Draftovi:** strogo bočni crteži u PIL-u (`tools/realisticno_<biom>.py`, `realisticno_draw.py`), pa img2img na magenti, pa magenta u alfu.
  - Prag za isecanje se prilagođava stvarnoj pozadini.
  - Ivice se oslobađaju magentnog odsjaja, a poluprovidna magla i sjaj gube lažnu boju.
- **Postojeći pejzaži:** draft je sam stari sloj, sa pretopljenih poslednjih 12 % (kao u `stage3d.js`).
- **Drugi prolaz** (na korisnikov zahtev „još realističnije“): prvi izlaz je ponovo draft (jačina 0,66–0,72) sa promptom za pravu fotografiju, plus 10 % manja zasićenost.
- Ponavljanje: `python tools/realisticno.py drafts|jobs|refine|review|finish|preview <biom>`; izbor slika i ispravke su u `art/realisticno/<biom>/picks.json`.

## Koliko traje jedna slika (medijana, 512 slika ove noći)

| Vrsta | Trajanje |
|---|---|
| sloj 2048×688 (2 pogleda) | ~48 s |
| nebo / zadnji zid 1792×896 | ~50 s |
| traka tla | ~34 s |
| materijal 1024² (4 pogleda, bešavno u oba pravca) | ~76 s |
| predmet 1024² | ~18 s |
| učitavanje modela | ~30 s; text encoder ~10 s |

Kad TTS iz projekta Videos radi na istoj kartici, slika traje i do 2,5 puta duže.

## Šta nije uspelo ili je rađeno ponovo

- **Negacija u promptu ne radi** (Turbo radi bez CFG-a): „no lamp posts, no cars“ je nacrtalo bandere, kola i žice. Prompt sada opisuje samo ono što treba da postoji.
- **Svetlo sa maglom i zalaskom** u promptu tla i predmeta u prvom planu ubacivalo je nebo u traku. Za tlo sada postoji posebno, „površinsko“ svetlo.
- **Postojeći pejzaži:**
  - Na jačini 0,64 ostali su slikarski, pa su ponovljeni na 0,76, a zatim i drugim prolazom.
  - Nebesa su ponovljena na 0,86.
  - Pećini, podrumu i rudniku je umesto neba pravljen zadnji zid, jer im je prompt za nebo dodao oblake.
- **Predmeti sa vitezovima na kocu** (`kolac-vitez`, `kolci-vitezovi-glave`, `kolci-vitezovi-red`) nisu zamenjeni, jer bi nova verzija prikazala ljude. Ostaju stari.
- **Ručno obrisano:** anahroni fenjeri u kuli Klisure, lebdeće brvno u pećini Urvine i lebdeći kamen na nebu klisure Ibra.
- **Noćne i olujne varijante** postojećih pejzaža (`-night`, `-storm`) nisu rađene; postoje samo dnevne.
- **Stil:** Klisura i deo postojećih pejzaža (kristali pećine, žute stene klisure Ibra) i posle drugog prolaza čuvaju trag stila originala.
  - Treći prolaz (0,62) za svih 42 sloja postojećih pejzaža skoro ništa nije promenio, pa je odbačen.
  - Prolaz direktno iz starog crteža na 0,86 (klisura Ibra, pećina, rudnik, šuma) takođe zadržava stil, a pomera kompoziciju. I on je odbačen.
  - Stil nose sami stari crteži. Za potpuno fotografske verzije tih setova treba napraviti nove draftove, kao za tri glavna bioma.
- Zadnji zid rudnika ima tunel koji vodi u dubinu, kao i originalni crtež.
