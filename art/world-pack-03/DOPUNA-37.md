# Dopuna 37 (od Claude-a): platforme od kamena i zemlje

Platforme po kojima Marko skače sada su tanke daske sa dve nožice, nacrtane kodom, i ružno odudaraju od slikanog sveta. Treba ih zameniti slikanim komadima stene, zemlje i zida, za svaki kraj po jedan materijal.

Svaka platforma se slaže od tri dela, pa može biti bilo koje širine:
- `plat-<materijal>-levo.png`: 128×192, levi kraj.
- `plat-<materijal>-sredina.png`: 256×192. **Ponavlja se vodoravno bez šava**: levi i desni rub se poklapaju piksel po piksel.
- `plat-<materijal>-desno.png`: 128×192, desni kraj.

Pravila za sva tri dela:
- **Gornja površina po kojoj se hoda je ravna i stoji tačno na y=40.** Iznad nje smeju samo niske vlati trave, sneg ili mahovina, do y=24.
- Ispod površine je debeo komad koji lebdi: stena, zemlja sa korenjem ili zid. Donja ivica je nepravilna i završava se oko y=150–185, a ispod je providno.
- Igra crta ove slike na pola veličine. Platforma je tada debela oko 60 jedinica, a Marko je visok 125.
- Slikano, mat, bez sjaja, istom paletom i svetlom kao `tlo-<pohod>` i `near` slojevi. Svetlo pada odozgo levo.
- Krajevi su zaobljeni ili okrnjeni, da se vidi gde platforma prestaje.

| Materijal | Pohodi | Izgled |
|---|---|---|
| `zemlja` | selo, oranje, reka | Busen zemlje sa travom i poljskim cvećem, a ispod visi korenje i sitno kamenje. |
| `mahovina` | suma, mocvara | Tamna zemlja obrasla mahovinom i paprati, a ispod visi debelo korenje. |
| `kamen` | klisura | Siv krečnjak, napukao, sa busenovima trave u pukotinama. |
| `zid` | manastir, tvrdjava, rusevine | Klesani kameni blokovi u nizu, sa izrezbarenom ivicom i ponegde bršljanom. |
| `sneg` | prevoj | Stena pod debelim snegom, a ispod vise ledenice. |
| `kristal` | pecina | Tamna pećinska stena sa plavim kristalima koji izrastaju odozdo. |
| `cigla` | podrum | Ozidan ispust od cigle i kamena, a ispod drveni podupirač. |
| `greda` | rudnik | Debele grede okovane gvožđem, kao rudarska skela, a ispod kosi podupirač. |

Slike idu na vrh paketa: `art/world-pack-03/<fajl>`, PNG, providno. Napravi i `preview-dopuna37.jpg`: za svaki materijal platformu od levo + 3× sredina + desno, sa Markovom siluetom od 125 px (na pola veličine) koja stoji na njoj. Posle svakog materijala upiši red u `STATUS-ANIMACIJE.md`.
