# Dopuna 47 (od Claude-a, sesija za gameplay): animirani znakovi moći nad oltarom

Stefan (13. 11.): „za moći moraš da napraviš animirane asete, nije dovoljno da bude samo sjajna loptica”. Devet moći se u igri nalazi na kamenom oltaru (`dist/assets/greybox/oltar.webp`, pogledaj ga: sivi kamen sa plavim krugom). Nad oltarom sada lebdi svetla loptica nacrtana kodom. Treba devet kratkih animacija predmeta koji lebdi nad oltarom, po jedna za svaku moć.

Status piši u `art/world-pack-03/STATUS-ANIMACIJE-NOC.md` (novi redovi sa oznakom `D47`). `STATUS-ANIMACIJE.md`, `dist/`, `build-sprite-rig.py`, `sprite-rig.json` i tuđe foldere klipova ne diraj. Ne pravi commit.

## Zajednička pravila

- Bez lika i bez tla: samo predmet, na providnoj pozadini. Slikano, mat, srednjovekovni Balkan, isti rukopis kao ostali crteži igre (pogledaj `dist/assets/greybox/oltar.webp` i `art/animation-pack-04/assets/sword-drugi/atlas.png` radi rukopisa). Bez teksta, bez slova, bez okvira.
- Ćelija 512×512, **8 kadrova, petlja** (`loop=true`, `holdLastFrame=false`): kadar 7 se pretapa u kadar 0 bez skoka.
- Predmet je u sredini ćelije (središte oko x=256, y=256), visok i širok 230 do 300 px, sa bar 40 px praznine do svake ivice u svakom kadru. Veličina i položaj središta su isti u svih 8 kadrova (razlika središta najviše 12 px): kreće se predmet u sebi (krilo maše, lanac kruži), ne šeta po ćeliji.
- Oko predmeta sme da bude sjaj u boji moći, ali predmet mora da se prepozna i bez sjaja, kao taman obris.
- Klip ide u `art/animation-pack-04/assets/<klip>/`, sa `atlas.png` (4096×512, 8 ćelija u jednom redu), `manifest.json` sa `frame_layout`, `frames/motion/frame-0.png … frame-7.png`, `preview.gif` i `qa.json`. `manifest.json` i `qa.json` bez BOM-a.
- Postupak izvoza pogledaj u `art/world-pack-03/export-dopuna44-deo3-v2.py` i ostalim `export-dopuna44-*.py`, i u `art/animation-pack-04/README.md` (alat `../tools/sprite-gen/.venv/Scripts/sprite-gen.exe`, gledano iz foldera igre). Radni fajlovi idu u `art/animation-pack-04/sources/<klip>/`.

## Kako se crta (važno, na ovome su ranije dopune padale)

1. Jednim pozivom `image_gen` nacrtaj **mrežu 4×2**: osam sličica istog predmeta u osam uzastopnih trenutaka pokreta, na ravnoj jarko zelenoj pozadini (#00ff00), sa razmakom između sličica. U svakom polju mreže je JEDAN predmet.
2. Iseci mrežu na osam polja, skini zelenu (i zeleni obrub sa ivica predmeta), i svako polje stavi u svoju ćeliju 512×512 tako da je predmet u sredini i iste veličine u svih osam.
3. **Provera pre izvoza**, za svaki kadar: (a) u ćeliji je jedan povezan predmet, a ne ceo umanjen niz; (b) nijedan neprovidan piksel ne dodiruje ivicu ćelije; (c) granice neprovidnog sadržaja (levo, desno, vrh, dno) su u okviru pravila o veličini; (d) nema zelenih piksela. Rezultat upiši u `qa.json` po kadru (`bbox`, `touchesEdge`, `components`).
4. Najviše tri pokušaja po klipu. Ako ni treći ne prođe provere, NE izvozi klip, upiši u status šta je bilo pogrešno i pređi na sledeći.

## Klipovi

| Klip | Moć | Predmet i pokret | Boja sjaja |
|---|---|---|---|
| `moc-krilo` | Sokolovo krilo | Jedno rašireno sokolovo krilo, bela i krem pera sa smeđim vrhovima. Maše: gore, pa dole, pa gore (pun zamah u 8 kadrova). | krem #f4ead2 |
| `moc-lanac` | Ravijojlin lanac | Srebrni lanac sa kukom na kraju, savijen u krug. Krug se polako okreće, kuka obiđe pun krug za 8 kadrova, karike sevnu. | svetloplava #9fe8ff |
| `moc-oko` | Vilinsko oko | Veliko oko od ljubičaste svetlosti, bez lica. Otvara se, zenica se raširi, pa trepne i ponovo se otvori. | ljubičasta #c3b2ff |
| `moc-trag` | Vilin trag | Otisak bosog stopala od tirkizne svetlosti, oko njega tri vilinska lista koja kruže. Otisak pulsira, lišće obiđe krug. | tirkizna #8fffe0 |
| `moc-potres` | Potres | Okrugao kamen sa zlatnom pukotinom preko sredine. Pukotina se širi i zasija, iz nje iskoče tri kamenčića, pa se vrate. | zlatna #ffcf6a |
| `moc-nalet` | Juriš u vazduhu | Zlatno pero strele sa tri vazdušne trake koje se uvijaju iza njega udesno. Trake teku, pero podrhtava. | zlatna #ffcf6a |
| `moc-kombo` | Vazdušni kombo | Glava bodljikavog topuza (gvozdena kugla sa šiljcima, kratak deo drške), okreće se oko svoje ose, oko nje vihor u obliku spirale. | narandžasta #ffb86a |
| `moc-gaz` | Šarčev gaz | Velika gvozdena potkova, krajevi nadole. Zasija, iz nje sevnu varnice sa obe strane, pa se smiri. | bela-zlatna #ffe9c0 |
| `moc-zidotrk` | Trk po zidu | Kožni opanak sa malim krilom na peti. Krilo maše, opanak se blago naginje napred-nazad. | zlatna #ffd27a |

## Redosled

Radi ovim redom i posle SVAKOG klipa upiši red u status: `moc-krilo`, `moc-lanac`, `moc-oko`, `moc-trag`, `moc-potres`, `moc-nalet`, `moc-kombo`, `moc-gaz`, `moc-zidotrk`.
