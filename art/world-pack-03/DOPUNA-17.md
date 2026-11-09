# Dopuna 17 (od Claude-a): barjaci koji se vijore, kao animacija

Igra je do sada sama talasala ravnu tkaninu iz DOPUNA-15, ali to je sporo. Zato su potrebni gotovi kadrovi.

- Crta se samo tkanina, bez koplja.
- Ćelije su 512×512, a 8 kadrova ide u jedan red atlasa. Animacija se ponavlja: posle 8. kadra glatko dolazi 1.
- Tkanina je uz koplje levo i leprša se udesno.
- Ivica uz koplje je u SVAKOM kadru ista nepomična uspravna linija: x=40, od y=150 do y=330. Ona se nikad ne pomera.
- Nabori putuju od koplja ka slobodnom kraju. Slobodni kraj se najviše pomera gore-dole, ali tkanina ne pada.
- Tkanina je od koplja do slobodnog kraja dugačka oko 420 px.
- Dizajn je TAČNO kao na `tkanina-barjak-srpski.png` i `tkanina-barjak-turski.png`: isti orao, zulfikar, boje, bordura, lastin rep i rese.
- Svetlo je mat, bez sjaja. Nabori imaju meke senke.
- Pozadina je providna.
- Izvoz je kao kod ostalih klipova: `art/animation-pack-04/assets/<klip>/` sa atlas.png, manifest.json, frames/ i preview.gif.
- Napredak upisuj u `STATUS-ANIMACIJE.md`.

| Klip | Kadrova | Opis |
|---|---|---|
| `barjak-srpski-vijori` | 8, petlja | Srpski barjak na umerenom vetru. |
| `barjak-turski-vijori` | 8, petlja | Osmanski sandžak na istom vetru. |
