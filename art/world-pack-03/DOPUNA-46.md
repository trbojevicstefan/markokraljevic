# Dopuna 46 (od Claude-a, sesija za gameplay): rafal strelca, potres malja, drugi udarac Oklopnika

Tri klipa za poteze koji u igri već rade, ali se crtaju starim crtežom ili prašinom. Ovu dopunu vodi druga sesija nego ostale: status piši u `art/world-pack-03/STATUS-ANIMACIJE-NOC.md` (napravi ga ako ne postoji), a `STATUS-ANIMACIJE.md` ne diraj.

Pravila su ista kao za ostale klipove:
- lik je okrenut udesno, a oslonac (tabani, tlo) je na y=487;
- klip ide u `art/animation-pack-04/assets/<klip>/`, sa `atlas.png`, `manifest.json` sa `frame_layout`, `frames/motion/`, `preview.gif`, `reference.png` i `qa.json`. Gotov uzor je `art/animation-pack-04/assets/sword-drugi/`;
- klip koji se pušta jednom ima `holdLastFrame=true`;
- posle svake stavke upiši red u `STATUS-ANIMACIJE-NOC.md`.

Postupak izvoza je u `art/animation-pack-04/README.md` (sprite-gen extract → compose-atlas → compose-gif; alat je `../tools/sprite-gen/.venv/Scripts/sprite-gen.exe`, gledano iz foldera igre). Skripte `export-*.py`, `deliver-*.py` i `check-clip-delivery.py` u `art/animation-pack-04/` su uzor. Radni fajlovi idu u `art/animation-pack-04/sources/<klip>/` (ne ide u git).

Slikano, mat, bez krvi. Svaki lik je isti kao njegov postojeći crtež: isti lik, ista odeća, ista veličina u ćeliji. Uzori za lik i veličinu su gotovi listovi u `dist/assets/` (samo ih čitaj): `archer-shoot.png`, `archer-idle.png`, `oklopnik-slam.png`, `oklopnik-idle.png`. Pre izvoza preklopi prvi kadar novog klipa sa prvim kadrom uzora i proveri da su glava i visina tela isti; sliku preklopa sačuvaj uz klip kao `size-overlay.png`.

Kod igre, `dist/`, `build-sprite-rig.py`, `sprite-rig.json` i tuđe foldere klipova ne diraj. Ne pravi commit.

## Klipovi

| Klip | Ćelija, kadrova | Opis |
|---|---|---|
| `archer-rafal` | 512×512, 6, jednom | Strelac brzo odapne tri strele zaredom, ne spuštajući luk. Odapinje u kadrovima 1, 3 i 5; u kadrovima 0, 2 i 4 poteže novu strelu iz tobolca na tetivu. Zum i lik kao `archer-shoot`. Strele u letu ne crtaj, njih crta igra. |
| `oklopnik-drugi` | 512×512, 6, jednom | Drugi udarac posle malja odozgo: Oklopnik ne diže malj ponovo, nego ga iz zemlje povuče u širok zamah u stranu, u visini kolena, napred. Kadrovi 0–2 su zamah (malj ide unazad pored boka), 3–5 udarac i povratak u stav. Zum i lik kao `oklopnik-slam`; poslednji kadar je iste visine kao poslednji kadar `oklopnik-slam`, da zamena ne skoči. |
| `fx-potres` | 1024×512, 6, jednom | Bez lika. Talas po tlu posle Oklopnikovog malja: pukotina u zemlji i prašina kreću od x≈100 i idu udesno do x≈950; u kadru 0 je samo udar kod x≈100, u kadru 5 se prašina razilazi celom dužinom. Tlo je na y=487, sve iznad je providno, visina prašine najviše 110 px. Boje zemlje i prašine kao u `oklopnik-slam`. |

## Redosled

1. `archer-rafal`
2. `oklopnik-drugi`
3. `fx-potres`

Ako nešto ne može da se nacrta kako treba iz dva pokušaja, upiši u status šta je pošlo naopako i pređi na sledeći klip.

---

## Ponavljanje (v2): prvi izvoz je odbijen

Sva tri klipa iz prvog izvoza su odbijena i sklonjena iz `assets/`:
- `archer-rafal` i `oklopnik-drugi`: nacrtan je neki drugi čovek, ne lik iz igre. Strelac u igri ima žuto-plavu odeću sa šarom, beli turban sa crvenim vrhom i tobolac na leđima. Oklopnik u igri je visok, u crvenom prošivenom kaputu sa zlatnim krljuštima na grudima, sa šiljatim šlemom, okruglim štitom i velikim maljem; nacrtan je zdepast čovek u zlatnom oklopu.
- `fx-potres`: prašina je ispala visoka oko 45 px i bleda, u igri se ne vidi.

Zato za likove važi ovaj postupak, korak po korak. Bez njega klip ne izvozi.

1. **Uzor.** Iz `dist/assets/sprite-rig.json` uzmi `frames[0]` (x, y, w, h) za `archer-idle`, odnosno `oklopnik-idle`, iseci tu ćeliju iz `dist/assets/<lik>-idle.png` i sačuvaj je kao `art/animation-pack-04/sources/<klip>/uzor.png`. Isto uradi za kadar 0 iz `archer-shoot`, odnosno `oklopnik-slam` (`uzor-zum.png`): on pokazuje zum u kom se crta.
2. **Crtanje.** `image_gen` pozovi kao uređivanje slike, sa `uzor.png` kao ulaznom slikom, ne iz teksta. U opisu traži: ista osoba, isto lice, ista kapa, ista odeća i boje, isto oružje; menja se samo poza. Šest poza u jednom redu na zelenoj pozadini, lik okrenut udesno.
3. **Provera lika.** Stavi kadar 0 novog klipa pored `uzor.png` i sačuvaj kao `identity-size-comparison.png` u folderu klipa. Pogledaj sliku: lice, kapa, odeća, boje i oružje moraju biti isti. Ako nisu, odbaci i crtaj ponovo.
4. **Provera veličine.** Visina tela (teme do tabana) u kadru 0 novog klipa mora biti u okviru 5% visine tela u `uzor-zum.png`. Ako nije, umanji ili uvećaj kadrove pre izvoza. Preklop sačuvaj kao `size-overlay.png`.
5. Najviše tri pokušaja po klipu. Ako ni treći ne prođe proveru lika, NE izvozi klip, nego upiši u status šta je bilo pogrešno.
6. `manifest.json` i `qa.json` piši bez BOM-a (UTF-8 bez potpisa).

Za `fx-potres` (bez lika): prašina mora biti visoka 90 do 110 px u ćeliji, gusta i toplo smeđa, neprovidna u jezgru i providna samo po obodu; pukotina u tlu tamna, široka 6 do 10 px. U kadru 0 udar kod x≈100 (prsne zemlja uvis), u kadrovima 1–4 čelo talasa ide udesno do x≈950 a iza njega ostaje prašina, u kadru 5 se sve razilazi. Tlo je na y=487.

Opisi poza ostaju kao u tabeli gore. Status upiši kao nove redove sa oznakom `v2`.
