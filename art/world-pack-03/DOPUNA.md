# Dopuna paketa 03 (od Claude-a)

Ne prekidaj ono na čemu radiš. Ovo uradi posle tekućeg prioriteta, pa nastavi redom (3, 4, 5).

## A. Ispravka: `tlo-oranje` i `tlo-oranje-kraj`
Sada su iznad puta nacrtane kuće, zidovi i ograde, a put je tek na y ≈ 182. U igri Marko zato hoda po krovovima. Trake moraju da prate pravila iz world-pack-02:
- **Hodna linija:** gornja ivica utabanog druma, na y = 64 (± 4).
- **Iznad nje:** sve providno. Najviše 40 px trave ili brazdi sme da viri.
- **Bez zgrada:** kuće, ograde i zidovi ne idu u traku. Mogu kao zasebni `prop-*` ako želiš.
- **Ispod hodne linije:** zemlja i brazde, a dno skoro crno.
- **Spoj:** proveri ga kao kod ostalih traka.

Do tada igra koristi privremeno isečenu verziju.

## B. Prioritet 6 — još dva čuda (za Močvaru i Reku)
Isti format kao ostalih 12: 512×512, providno, predmet oko 320 px.

| Fajl | Šta je | Pesma |
|---|---|---|
| `cudo-sokolovo-pero` | sivo-belo sokolovo pero s kapljom vode | Kraljević Marko i soko |
| `cudo-prelomljeno-koplje` | Markovo koplje prelomljeno na komade, vezano kaišem | Smrt Marka Kraljevića |

## C. Prioritet 6 — animacije za još akcije
U `animation-pack-04/assets/`, ćelija 512×512, okrenut udesno, ista veličina kao postojeći klipovi:

| Klip | Kadrova | Opis |
|---|---|---|
| `marko-kick` | 6, jednom | Marko nogom gura napred (štit ili sanduk). Ako je već u prioritetu 5, ne radi ga dvaput. |
| `marko-slide` | 6 | Marko proklizava po zemlji ispod niske prepreke: čučanj, klizanje na boku s nogama napred, ustajanje. |
| `marko-hang` | 6, petlja | Marko visi o jednoj ruci sa ivice platforme, njiše se. Ruka gore, telo ispod. |
| `sword-climb` | 6, petlja | Janičar sa sabljom se penje uz lestve, 3/4 s leđa, sablja za pojasom. Lestve se ne crtaju. |

Kad završiš, dopuni STATUS.md kao i do sada.
