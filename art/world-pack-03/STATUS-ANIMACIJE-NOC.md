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

