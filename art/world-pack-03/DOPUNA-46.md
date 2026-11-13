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

---

## Treći pokušaj (v3, jači model): `oklopnik-drugi` i `fx-potres`

`archer-rafal` v2 je prihvaćen i u igri je; njega ne diraj. Druga dva klipa su odbijena i drugi put:

- `oklopnik-drugi` v2: lik je bio pravi, ali je malj u kadrovima 2 i 4 izašao iz ćelije i odsečen je njenom ivicom, a u kadru 5 Oklopnik nije u stavu u kom završava `oklopnik-slam`.
- `fx-potres` v2: u svaku od šest ćelija stao je ceo umanjeni niz od šest sličica, umesto jedne sličice po ćeliji.

Postupak za lik ostaje onaj iz dela „Ponavljanje (v2)" (uzor je kadar 0 iz `dist/assets/oklopnik-idle.png`, `image_gen` kao uređivanje slike, provera lika i veličine). Postupak izvoza pogledaj u `art/world-pack-03/export-dopuna44-deo3-v2.py` i ostalim `export-dopuna44-*.py`. Dodatno:

### `oklopnik-drugi` (512×512, 6 kadrova, jednom)

1. Ceo lik SA MALJEM mora u svakom kadru da stane u ćeliju, sa bar 24 px praznine do svake ivice. Malj se vidi u svih šest kadrova, ceo. Ako zamah ne staje, nacrtaj lik manji: zum ne mora da bude kao `oklopnik-slam`, veličinu ću podesiti u rigu.
2. Pokret: kadar 0 je stav posle udarca o zemlju (malj spušten pred njim, kao poslednji kadrovi `oklopnik-slam`); kadrovi 1–2 zamah: malj ide unazad pored desnog boka, nisko; kadrovi 3–4 udarac: širok vodoravan zamah napred u visini kolena, u kadru 4 malj je ispružen pred njim; kadar 5 je povratak u stav, ista poza i visina kao poslednji kadar `oklopnik-slam`.
3. Stopala ostaju na istom mestu u svih šest kadrova (y=487), lik gleda udesno, štit ostaje na levoj ruci.
4. Pre izvoza proveri svaki kadar posebno: da li bilo koji neprovidan piksel dodiruje ivicu ćelije. Ako dodiruje, kadar nije dobar. Rezultat te provere upiši u `qa.json` (`touchesEdge` po kadru).

### `fx-potres` (ćelija 1024×512, 6 kadrova, jednom, bez lika)

1. Atlas je 6144×512: šest ćelija jedna do druge, u SVAKOJ ćeliji JEDNA sličica talasa u punoj veličini. Nacrtaj šest zasebnih sličica (ili jednu mrežu 3×2 koju pre izvoza isečeš na šest), ne umanjuj niz.
2. Tlo je na y=487 u svakoj ćeliji. Prašina je visoka 90 do 110 px (vrh na y≈380–397), gusta, toplo smeđa kao zemlja u `oklopnik-slam`, neprovidna u jezgru. Pukotina u tlu je tamna, široka 6 do 10 px, duž y≈480–487.
3. Kadar 0: udar kod x≈100, zemlja prsne uvis. Kadrovi 1–4: čelo talasa je redom na x≈300, 500, 720, 950, a iza njega do x≈100 ostaje niža prašina i pukotina. Kadar 5: prašina se razilazi celom dužinom, pukotina ostaje.
4. Pre izvoza izmeri u svakoj ćeliji granice neprovidnog sadržaja (levo, desno, vrh) i upiši ih u `qa.json`; desna granica mora da raste od kadra 0 do 4.

Status upiši kao nove redove sa oznakom `v3`. Najviše tri pokušaja po klipu; ako ni treći ne prođe provere, ne izvozi.

