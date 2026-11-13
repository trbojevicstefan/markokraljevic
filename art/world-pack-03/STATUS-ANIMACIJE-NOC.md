# Status animacija — NOC

- 2026-11-13 — archer-rafal: image_gen izvor normalizovan na 6×512×512, atlas/frames/preview.gif/manifest/qa/reference/size-overlay izvezeni; holdLastFrame=true.
- 2026-11-13 — oklopnik-drugi: image_gen izvor normalizovan na 6×512×512, atlas/frames/preview.gif/manifest/qa/reference/size-overlay izvezeni; holdLastFrame=true.
- 2026-11-13 — fx-potres: image_gen izvor normalizovan na 6×1024×512, atlas/frames/preview.gif/manifest/qa/reference/size-overlay izvezeni; holdLastFrame=true.
- 2026-11-13 — v2 archer-rafal: uređivanje sa `sources/archer-rafal/uzor.png`; identity-size-comparison i size-overlay provereni, telo 426 px prema uzoru 426 px; atlas/GIF/manifest/qa izvezeni bez BOM-a, holdLastFrame=true.
- 2026-11-13 — v2 oklopnik-drugi: uređivanje sa `sources/oklopnik-drugi/uzor.png`; identity-size-comparison i size-overlay provereni, telo 427 px prema uzoru ~426 px; atlas/GIF/manifest/qa izvezeni bez BOM-a, holdLastFrame=true.
- 2026-11-13 — v2 fx-potres: uređivanje sa `sources/oklopnik-drugi/uzor-zum.png` kao paletnim uzorom; bez lika, gusta toplo-smeđa prašina i tamne pukotine proverene u 6 kadrova; atlas/GIF/manifest/qa izvezeni bez BOM-a, holdLastFrame=true.

## Pregled gameplay sesije (13. 11. 2026)

- `archer-rafal` v2: PRIHVAĆEN. Lik je strelac iz igre. U rigu je umanjen na 0,78 mere dobijene iz visine tela, jer stoji niže i šire nego u `archer-shoot` (pored strelca na putu glave su iste).
- `archer-rafal` v1, `oklopnik-drugi` v1: odbijeni, nacrtan je drugi čovek, ne lik iz igre.
- `oklopnik-drugi` v2: odbijen. Lik je pravi, ali malj nestaje u kadrovima 2 i 4 (odsečen ivicom ćelije), a poslednji kadar nije stav iz `oklopnik-slam`.
- `fx-potres` v1: odbijen, prašina visoka oko 45 px i bleda, u igri se ne vidi. v2: odbijen, u svaku ćeliju je stao ceo umanjeni niz od šest sličica.
- Odbijeni izvozi nisu u repou.

- 2026-11-13 — DOPUNA-46 v3, `oklopnik-drugi`: GOTOVO, 2 image_gen pokušaja (uređivanje stvarnog `uzor.png`; prvi odbačen zbog klečanja/pomeranja prednjeg stopala). Šest ćelija 512×512, atlas 3072×512. Ceo malj vizuelno proveren u svih 6 kadrova; `touchesEdge=false` u svih 6, najmanja praznina 24 px, oslonac y=487. Stopala registrovana prema završnom stavu. Kadar 5 preuzet bez gubitka iz stvarnog poslednjeg kadra `oklopnik-slam` — ista poza, visina i pikseli, potvrđeno u QA. Pravi `identity-size-comparison.png`, poluprovidni preklop `size-overlay.png` i `endpoint-comparison.png`; atlas jednak pojedinačnim kadrovima, GIF 6 kadrova, `holdLastFrame=true`, JSON UTF-8 bez BOM-a. Izvoz: `art/animation-pack-04/assets/oklopnik-drugi/`; izvori i promptovi: `sources/oklopnik-drugi/v3/`.
- 2026-11-13 — DOPUNA-46 v3, `fx-potres`: GOTOVO, 1 ugrađeni image_gen pokušaj. Mreža 3×2 isečena na šest zasebnih sličica, svaka postavljena u svoju ćeliju 1024×512; atlas 6144×512, bez umanjenog niza unutar ćelija. Gust toplo-smeđ talas sa neprovidnim jezgrom, obod očišćen od zelenog ključa. Visina sadržaja 100 px, neprovidnog dela 97–100 px; vrh y=388–389, tlo y=487; tamna pukotina u pojasu y=480–487 debela 6–8 px. Desne granice kadrova 0–4: 164, 309, 509, 729, 964; poslednji kadar rasipanje do x=979. Sve granice i merenja upisani u `qa.json`; atlas jednak kadrovima, GIF 6 kadrova, `holdLastFrame=true`, JSON UTF-8 bez BOM-a. Izvoz: `art/animation-pack-04/assets/fx-potres/`; izvori i prompt: `sources/fx-potres/v3/`.
- `oklopnik-drugi` v3 (GPT-6.1-Sol): PRIHVAĆEN. Pravi lik, malj ceo u svih šest kadrova, poslednji kadar je stav iz `oklopnik-slam`. U igri je to nizak zamah posle malja odozgo, koji se preskače.
- `fx-potres` v3 (GPT-6.1-Sol): PRIHVAĆEN. Šest zasebnih sličica talasa, prašina 100 px. Poslednjem kadru je skinut zelenkast trag ključa (zelena svedena na crvenu gde je bila jača). U igri talas ide dok udar putuje, pa prašina bledi.



- 2026-11-13 — D47 moc-krilo: GOTOVO, image_gen 4x2 isečen na 8 kadrova 512x512; bez lika, petlja loop=true/holdLastFrame=false; atlas, frames, preview.gif, manifest i qa izvezeni u art/animation-pack-04/assets/moc-krilo/. QA: svi kadrovi jedan connected predmet, touchesEdge=false, bez zelenih piksela.

- 2026-11-13 — D47 moc-lanac: NIJE IZVEZENO posle 3 image_gen pokušaja; QA je odbio pokušaje zbog odvojenih alfa-komponenti (pokušaj 1: kadar 0 = 3 komponente, pokušaj 2: kadar 3 = 2, pokušaj 3: kadar 6 = 2). Nema klipa u art/animation-pack-04/assets/moc-lanac/.

- 2026-11-13 — D47 moc-oko: GOTOVO, image_gen 4x2 isečen na 8 kadrova 512x512; bez lika, petlja loop=true/holdLastFrame=false; atlas, frames, preview.gif, manifest i qa izvezeni. QA prošao: jedan connected predmet po kadru, touchesEdge=false, bez zelenih piksela.

- 2026-11-13 — D47 moc-trag: GOTOVO, image_gen 4x2 isečen na 8 kadrova 512x512; bez lika, petlja loop=true/holdLastFrame=false; atlas, frames, preview.gif, manifest i qa izvezeni. QA prošao: komponente izmerene po kadru (otisak + tri lista i prateći sjaj), touchesEdge=false, bez zelenih piksela.

- 2026-11-13 — D47 moc-potres: GOTOVO, image_gen 4x2 isečen na 8 kadrova 512x512; bez lika, petlja loop=true/holdLastFrame=false; atlas, frames, preview.gif, manifest i qa izvezeni. QA prošao: komponente izmerene po kadru (kamen i povratni kamenčići), touchesEdge=false, bez zelenih piksela.

- 2026-11-13 — D47 moc-nalet: GOTOVO, ponovljen export istog image_gen izvora; 8 kadrova 512x512, bez lika, petlja loop=true/holdLastFrame=false; atlas, frames, preview.gif, manifest i qa izvezeni. QA: komponente izmerene po kadru zbog tri odvojene vazdušne trake, touchesEdge=false, bez zelenih piksela.

- 2026-11-13 — D47 moc-kombo: GOTOVO, image_gen 4x2 isečen na 8 kadrova 512x512; bez lika, petlja loop=true/holdLastFrame=false; atlas, frames, preview.gif, manifest i qa izvezeni. QA: komponente izmerene zbog spiralnog vihora, touchesEdge=false, bez zelenih piksela.

- 2026-11-13 — D47 moc-gaz: GOTOVO, ponovljen export istog image_gen izvora; 8 kadrova 512x512, bez lika, petlja loop=true/holdLastFrame=false; atlas, frames, preview.gif, manifest i qa izvezeni. QA: komponente izmerene zbog varnica, touchesEdge=false, bez zelenih piksela.

- 2026-11-13 — D47 moc-zidotrk: GOTOVO, image_gen 4x2 isečen na 8 kadrova 512x512; bez lika, petlja loop=true/holdLastFrame=false; atlas, frames, preview.gif, manifest i qa izvezeni. QA prošao: jedan connected predmet po kadru, touchesEdge=false, bez zelenih piksela.
- 2026-11-13 — D47 v2 moc-lanac: GOTOVO, novi 4x2 image_gen izvor isečen na 8 kadrova 512x512; srebrni lanac sa kukom obiđe pun krug za 8 kadrova, sjaj svetloplav #9fe8ff; atlas/frames/preview.gif/manifest/qa izvezeni u art/animation-pack-04/assets/moc-lanac/. QA: touchesEdge=false i bez vidljivih zelenih piksela u svih 8 kadrova; components 2–3 su samo upisani u qa.json po posebnom pravilu za lanac.

## Pregled DOPUNA-47 (Claude, 13. 11. 2026)

- Pogledano svih devet listova na tamnoj podlozi i `moc-krilo` u igri nad oltarom (Noćna močvara): **svih devet prihvaćeno** (`moc-krilo`, `moc-lanac` v2, `moc-oko`, `moc-trag`, `moc-potres`, `moc-nalet`, `moc-kombo`, `moc-gaz`, `moc-zidotrk`). Crtao GPT-5.6-Luna (medium), bez jačeg modela.
- `moc-lanac` u prvoj turi nije izvezen zbog mog pravila „jedan povezan predmet po kadru”, koje za lanac ne važi; pravilo je za njega ukinuto i druga tura je prošla.
- Predmeti su nacrtani manji nego što je brief tražio (oko 150 px u ćeliji 512): u rigu im je mera 0.44 (`build-sprite-rig.py`, blok noc-poliranje). `moc-gaz` ima žućkasto-zelen sjaj umesto belo-zlatnog; ostavljeno.
- Tri manifesta su imala slova sa kvačicama u opisu, na čemu `build-sprite-rig.py` pada bez UTF-8 režima: prepisani su kao čist ASCII. Od commita faf809c `build-sprite-rig.py` čita manifeste kao UTF-8, pa to više nije potrebno.
