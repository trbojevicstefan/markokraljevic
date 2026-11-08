# Dopuna 2 (od Claude-a) — zagonetke, slabe tačke, kombinacije, predmeti po krajevima

Radi posle prioriteta iz ZADATAK.md i DOPUNA.md (3 → 4 → 5 → 6), pa ovo kao **prioritet 7**. Ista pravila i isti stil. Napredak upisuj u STATUS.md.

## 7a. Predmeti koji se razbijaju, po krajevima

Platno 1024×1024, predmet 300–450 px, providno, pun i jasan (igra ga seče na komade).

| Fajl | Šta je | Kraj |
|---|---|---|
| `razbi-kosnica` | pletena košnica na panju | selo, šuma |
| `razbi-plast` | mali plast sena vezan užetom | selo, oranje |
| `razbi-tikve` | gomila tikava i bundeva | selo |
| `razbi-stena-napukla` | napukla stena (kamen se drobi) | klisura, prevoj, rudnik |
| `razbi-panj` | truo panj s gljivama | šuma, močvara |
| `razbi-crkveni-sanduk` | okovan sanduk s knjigama i krstom | manastir |
| `razbi-bure-baruta` | bure baruta s fitiljem i turskim pečatom (u igri eksplodira) | tvrđava, podrum |
| `razbi-tobolac` | korpa puna strela | tvrđava |
| `razbi-santa` | santa leda | prevoj, pećina |
| `razbi-vagon` | mali rudarski vagon s rudom | rudnik |

## 7b. Predmeti koji se skupljaju

Platno 512×512, providno, predmet oko 300 px, mora se prepoznati na 40 px.

| Fajl | Šta je |
|---|---|
| `predmet-slovo-m`, `-a`, `-r`, `-k`, `-o` | zlatni medaljoni s ćiriličnim slovima М, А, Р, К, О |
| `predmet-zapis` | smotani pergament s pečatom (stranica iz pesme) |
| `predmet-srce-deo` | četvrtina zlatnog srca (četiri čine celo) |
| `predmet-kljuc` | stari gvozdeni ključ s crvenom vrpcom |
| `predmet-moc-oganj`, `predmet-moc-grom`, `predmet-moc-vila` | kugle moći: plamena, munjevita, vilinska (tirkizna) |
| `predmet-trava` | snop lekovite trave |
| `predmet-cutura` | drvena čutura s vinom |

## 7c. Zagonetke (u stilu Prince of Persia / Hollow Knight)

| Fajl | Veličina | Šta je |
|---|---|---|
| `ploca-pritisak`, `ploca-pritisak-stisnuta` | 512×256 | kamena ploča u tlu: podignuta i utisnuta |
| `teret-sanduk` | 1024×1024 | težak okovan sanduk koji se gura (ne razbija se) |
| `pod-napukao` | 512×256 | napukla kamena ploča u podu (lomi se udarom nadole) |
| `zid-napukao` | 512×512 | providan sloj pukotina koji se stavlja preko zida |
| `lift-platforma` | 1024×512 | drveni lift s gvozdenim okovom; lanci idu nagore |
| `kotur` | 512×512 | drveni kotur s lancem (vrh lifta) |
| `splav` | 1024×512 | splav od balvana za prelaz preko vode |
| `kolje` | 512×192 | red zašiljenog kolja, bez šava levo-desno |
| `siljci` | 512×192 | red gvozdenih šiljaka, bez šava levo-desno |
| `vrata-zakljucana`, `vrata-otkljucana` | 1024×1024 | okovana vrata s katancem, zatvorena i otvorena |

## 7d. Animacije za kombinacije i nove poteze

U `animation-pack-04/assets/`, ćelija 512×512, okrenut udesno, ista veličina kao postojeći klipovi.

| Klip | Kadrova | Opis |
|---|---|---|
| `marko-combo-4` | 8, jednom | Završni udarac „Lomilac”: zamah topuzom odozgo s iskorakom i udarom ramenom |
| `marko-air-1` | 5, jednom | Udarac topuzom u skoku, vodoravno |
| `marko-air-2` | 5, jednom | Drugi udarac u skoku, odozdo nagore |
| `marko-uppercut` | 6, jednom | Udar uvis: čučanj, pa topuz odozdo nagore, telo se diže |
| `marko-dash-strike` | 6, jednom | Juriš: nisko telo, topuz napred, prah iza nogu |
| `marko-charge-hold` | 4, petlja | Marko drži zamah iza ramena, topuz svetli, telo napeto |
| `marko-push` | 6, petlja | Marko gura težak sanduk ramenom |
| `marko-lever` | 6, jednom | Marko povlači polugu |
| `shield-guardbreak` | 4, jednom | Štitonoši je štit izbijen u stranu, zatetura se |
| `oklopnik-armorbreak` | 4, jednom | Oklopniku puca oklop, komadi lete |
| `akindzija-backstep` | 4, jednom | Akindžija odskoči unazad, izbegne udarac |
| `palikuca-burn` | 6, petlja | Palikuća gori od sopstvene baklje i maše rukama |

Kad završiš, dopuni STATUS.md.
