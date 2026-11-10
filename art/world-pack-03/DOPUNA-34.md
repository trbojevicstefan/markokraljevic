# Dopuna 34 (od Claude-a): kolci sa srpskim vitezovima, u boji

Siluete iz DOPUNA-32 (`prop-kolci-glave`, `prop-kolci-red`) ne idu u igru. Igrač želi kolce **u boji** i **dalje u pozadini**. Na kočevima moraju biti **srpski vitezovi, a ne Turci**: osmanska vojska je tako ostavljala pobijene srpske vitezove kao opomenu. Stare siluete ne briši.

Igra crta ove slike iza druma, sitnije i sporije od njega, kao da stoje na brdu iza puta. Zato važi:
- Slikano, mat i bez sjaja, istim stilom i paletom kao `selo-near` i `tvrdjava-near`: topla jesenja svetlost i blaga izmaglica daljine.
- Krupni krvavi detalji ne idu. Nema rana ni krvi izbliza, nego se vide izdaleka.
- **Donjih 22% slike je široko brdašce od zemlje i trave sa kamenjem. Ono je neprovidno sve do donje ivice, preko cele širine**, jer ga igra krije iza druma. Iznad brda je providno.
- **Vitezovi:** duga kosa i brade, gvozdeni zašiljeni šlemovi sa nosnikom, pancir (verižnjača), pocepani crveni plaštevi i kabanice, ponegde crveno-beli barjačić. **Nema turbana, fesova ni turske odeće.**

Slike idu na vrh paketa: `art/world-pack-03/<fajl>`, PNG, providno.

| Fajl | Veličina | Opis |
|---|---|---|
| `kolci-vitezovi-glave.png` | 1024×1024 | Pet-šest visokih zašiljenih kočeva, nakrivo pobijenih u brdašce. Na vrhovima su glave srpskih vitezova: neke u šlemu, neke gologlave, duge kose. Iznad su dva-tri gavrana. Kočevi su u gornjih 70% slike, a brdo u donjih 22%. |
| `kolci-vitezovi-red.png` | 1536×768 | Red od osam-devet kočeva duž brega. Na nekima su glave vitezova. Na tri-četiri visi telo viteza u panciru i crvenom plaštu, vezano o kolac, sa glavom klonulom na grudi. Iza su pocepani crveni barjak i oboren štit. |
| `kolac-vitez.png` | 768×1024 | Jedan visok kolac sa telom viteza (pancir, crven plašt, šlem pao u travu pod njim). Telo je vezano o kolac i glava mu je klonula. Kraj kolca je ostavljen mač zabijen u zemlju. |

Ako generator odbije telo nabijeno na kolac, nacrtaj telo **vezano** o kolac, kao u `prop-kolci-red`, sa glavom klonulom. To je dovoljno. Upiši u `STATUS-ANIMACIJE.md` šta je urađeno i šta je odbijeno, posle svake stavke.
