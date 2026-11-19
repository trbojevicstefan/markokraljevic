# Dopuna 108 (od Claude-a, 19. 11.): nova kapija u drvetu, steni i cigli

Stefan (19. 11.) je pogledao probu kapije `kapija-34-kamen` (D104) i rekao: „da, stavi tu kapiju”. Ta kapija sada stoji na svim kamenim kapijama u igri. Pohodi drugačijeg kraja (selo i šuma sa palisadom, rudnik i pećina, podrum) treba da dobiju **istu kapiju u svom materijalu**.

Status piši u `art/world-pack-03/STATUS-D108.md` (napravi ga), red posle SVAKE stavke, sa oznakom `D108`. **Uradi sve stavke do kraja, ne staj i ne pitaj posle prve.**

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, druge `STATUS-*` fajlove, postojeće slike (ni `kapija-34-kamen.png` ni `kapija-34-resetka.png`), tuđe foldere, git, fajlove `*dopuna41*`. Paralelno rade D107 i D109: ne diraj njihove fajlove; svoje skripte zovi `*-dopuna108.py`. Slike idu u `art/world-pack-03/<ime>.png`.

## Uzori (`art/world-pack-03/uzori-d108/`)

- `kapija-34-kamen.png` i `kapija-34-resetka.png`: **odobrena kapija** (1536×1024). Kapija-kula gledana u tri četvrtine; otvor luka je na slici od x=395 do x=541, od y=574 do y=1012; rešetka zauzima x=348–569, y=567–1012.
- `prop-palisada.png`, `zid-drvo.png`: drvo i palisada iz igre. `prop-potpora-rudnik.png`, `zid-stena.png`: stena i rudarske grede. `zid-cigla.png`: cigla podruma.
- `kapija-u-igri.jpg`: kako odobrena kapija izgleda u igri.

## Glavno pravilo

Svaka nova kapija je **uređivanje slike `kapija-34-kamen.png`**: **isto platno, ista perspektiva, ista visina i širina kule, a otvor luka na ISTOM mestu i iste veličine** (x 395–541, y 574–1012; dozvoljeno odstupanje 12 px). Menja se samo materijal i ukras. Kroz luk se vidi tamna unutrašnjost, bez vrata i bez rešetke. Rešetka je posebna slika: **uređivanje `kapija-34-resetka.png`** (isto mesto i veličina, x 348–569, y 567–1012), sve ostalo ljubičasto.

Crta se na ravnoj **jarko ljubičastoj #ff00ff**, ključ skida ljubičastu, posle toga se skida i ljubičasti odsjaj. Oblik stoji na dnu slike. Bez ljudi, životinja, teksta, grbova.

## Stavke

| Ime | Šta se menja |
|---|---|
| `kapija-34-drvo` | **Seoska kapija-kula od brvana i palisade**: debela uspravna i vodoravna brvna, uglovi na ćert, gvozdeni okovi, krov od šindre nad vrhom umesto kamenih zubaca, okvir luka od tesanih greda; vođice rešetke su dve uspravne grede sa koturom i konopcem. Topao hrast kao `prop-palisada.png`. |
| `kapija-34-drvo-resetka` | Rešetka od **drvenih oblica okovanih gvožđem**, zašiljenih na dnu, tri vodoravne grede. |
| `kapija-34-rudnik` | **Ulaz u okno usečen u živu stenu**: umesto zidane kule gruba stena (kao `zid-stena.png`), luk podgrađen debelim rudarskim gredama (kao `prop-potpora-rudnik.png`), gore greda sa koturom i lancem, fenjer; bez zubaca, vrh je neravna stena. Ista spoljna mera i isti otvor. |
| `kapija-34-rudnik-resetka` | Rešetka od **zarđalih gvozdenih šipki** sa lancem, grublja. |
| `kapija-34-podrum` | **Kapija od crvene cigle** (kao `zid-cigla.png`) sa lukom od cigle na zub i kamenim uglovima, gvozdeni držač baklje, bez bršljana; zupci od cigle. |
| `kapija-34-podrum-resetka` | Rešetka od **tamnog kovanog gvožđa** sa okruglim zakivcima, bez šiljaka (ravna donja ivica). |

Najviše dva pokušaja po slici. Posle svake kapije **izmeri otvor luka** (levo, desno, vrh, dno) i upiši u status; ako odstupa više od 12 px od zadatog, popravi (pomeri ili razvuci sliku) pre izvoza.
