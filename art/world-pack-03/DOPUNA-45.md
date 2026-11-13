# Dopuna 45 (od Claude-a): Marko ore drumove i novi potezi protivnika

Po pesmi ne oru Turci, nego Marko ore drumove. Sada se iza rala vidi janičar iz `volovi-plug`. Protivnici osim toga ponavljaju uvek isti udarac.

Pravila su ista kao za ostale klipove:
- lik je okrenut udesno, a oslonac je na y=487 (kod ćelije 1024×1024 na y=999);
- klip ide u `art/animation-pack-04/assets/<klip>/`, sa atlasom, manifestom sa frame_layout, frames i preview.gif;
- klip koji se pušta jednom ima holdLastFrame=true;
- posle svake stavke upiši red u `STATUS-ANIMACIJE.md`.

Slikano, mat, bez krvi. Svaki lik je isti kao njegov postojeći crtež. Kod igre i `dist/` ne diraj.

## Deo 1: oranje

| Klip | Ćelija, kadrova | Opis |
|---|---|---|
| `volovi-ralo` | 1024×512, 8, petlja | Isti kadrovi kao `volovi-plug`, samo bez orača. Najbolje je obrisati janičara iz `volovi-plug` i doslikati ono što je bio zaklonio. Volovi, jaram i ralo ostaju isti, na istom mestu i u istoj veličini. Ručke rala su cele i slobodne. |
| `marko-ore` | 512×512, 8, petlja | Marko ide za ralom, nagnut napred, obema rukama drži ručke. Ralo nije u ćeliji, samo Marko. Zum je kao `marko-walk`. Šake su oko 256 px iznad oslonca (y≈231) i oko 170 px ispred sredine stopala. Topuz je za pojasom. |
| `marko-dize-ralo` | 1024×1024, 8, jednom | Marko digne ralo zajedno sa volovima iznad glave (kadrovi 0–3) i obori ih pred sebe (4–7). Volovi i ralo su isti kao u `volovi-ralo`, a Marko kao u `marko-ore`. Razmera je kao u igri: Marko je oko 300 px od temena do pete, volovi sa jarmom su 0,8 njegove visine (oko 240 px), a ceo zapreg sa ralom je širok oko 2 Marka (oko 610 px). U poslednjem kadru volovi stoje na zemlji ispred njega, a Marko drži ručke kao u `marko-ore`. |

## Deo 2: drugi udarac u nizu

Svaki klip ima 6 kadrova i pušta se jednom. Zum je kao `<tip>-attack` (kod akindžije `akindzija-spin`). Kadrovi 0–2 su zamah, a 3–5 udarac i povratak u stav.

| Klip | Opis |
|---|---|
| `sword-drugi` | Povratni rez: posle udarca odozgo seče nazad odozdo nagore. |
| `shield-drugi` | Kratak rez ispod štita, štit ostaje napred. |
| `akindzija-drugi` | Ukršten rez sa obe sablje nazad. |
| `kopljanik-drugi` | Dvostruki ubod: kratko povuče koplje, pa ubode još dvaput. |

## Deo 3: ostalo

| Klip | Ćelija, kadrova | Opis |
|---|---|---|
| `archer-rafal` | 512×512, 6, jednom | Strelac brzo odapne tri strele zaredom. Odapinje u kadrovima 1, 3 i 5. Zum je kao `archer-shoot`. Strele u letu ne crtaj, njih crta igra. |
| `fx-potres` | 1024×512, 6, jednom | Bez lika. Talas po tlu posle Oklopnikovog malja: pukotina i prašina kreću od x≈100 i idu udesno do x≈950. Na kraju se prašina razilazi. Zum je kao `oklopnik-slam`. Oslonac (tlo) je na y=487, a pozadina providna. |

## Redosled

Ako nestane kredita, ono što je gore važnije je.

1. `volovi-ralo` i `marko-ore`
2. Deo 2
3. DOPUNA-44
4. `marko-dize-ralo`, `archer-rafal` i `fx-potres`
