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

