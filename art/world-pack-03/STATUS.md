# Paket 03 — napredak

## Prioritet 1 — u toku
Generišu se predmeti, 12 čuda, lestve, stražarnica i četiri ponovljiva zida. Izvorne slike ostaju u ignorisanom `sources/`. Završene slike i katalog biće objavljeni u ovom folderu po proveri dimenzija i spojeva.

Odluke: lestve se tehnički slažu od nacrtanog segmenta na korak 128 px; zidovi se po potrebi retuširaju preko spojeva. Novi likovi kasnije dobijaju odobrene reference u `animation-pack-04/assets/<lik>/base-source.png`. Postojeći fajlovi igre i slike se ne menjaju.

Prioriteti 2–5: čekaju red.

## Dopuna prioriteta 1
Spremno je 26 od 27 elemenata (sve osim stražarnice), plus cuda-preview.png i razbi-preview.png. Katalog je osvežen. Lestve imaju prečke na 128 px i prolaze vertikalni spoj; sva četiri zida prolaze horizontalni i vertikalni spoj (0/255). Stražarnica se dorađuje zbog tamnih zadnjih nogu; grupa još nije označena kao gotova.

## Prioritet 1 — GOTOVO
Svih 27 elemenata je spremno u art/world-pack-03/, uz catalog.json, cuda-preview.png i razbi-preview.png. Stražarnica ima četiri cele noge; deckY=341, deckX0=270, deckX1=684 (ravni prednji deo poda). Lestve: 256×1024, stranice x=56/200, prečke 64+128n; vertikalni spoj 0/255. Zidovi: 512×512 RGBA, neprovidni, oba spoja 0/255. Neuspele stavke: nema.

## Prioritet 2 — u toku
Počinje generisanje devet klipova za penjanje, bacanje i skokove.

## Prioritet 2 — GOTOVO
Devet klipova / 56 kadrova je spremno u art/animation-pack-04/assets/: marko-climb (8), marko-wallslide (4), marko-throw (8), sword-jump, shield-jump, archer-jump, palikuca-jump, oklopnik-jump i archer-shoot-down (po 6). Svaki ima atlas.png, manifest.json, frames/, preview.gif i qa.json. Penjanje je dorađeno radi smene ruku; topuz je u bacanju samo u kadrovima 1–4. Stopala su na y=487; preview.png poredi nove klipove sa starim likovima. Katalog sveta uključuje atlas i kadrove. Neuspele stavke: nema.

## Prioritet 3 — u toku
Počinje dnevni ambijent Oranje drumova, tlo, predmeti i dva klipa volova.
