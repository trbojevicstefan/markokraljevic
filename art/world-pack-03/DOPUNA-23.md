# Dopuna 23 (od Claude-a): interfejs: ikone veština, pauza, dugmad

Sve se crta u stilu igre: slikano, toplo, mat. Bez sjaja i bez pregorelog belog, jer je igra već bila presjajna.
Slike idu na vrh paketa: `art/world-pack-03/<fajl>`.

## A. Ikone veština (10 slika)

- PNG 256×256 sa providnom pozadinom.
- Svaka ikona je okrugli medaljon od tamne bronze, prečnika oko 236 px, sa reljefnim zlatnim ivičnjakom.
- U sredini je urezan JEDAN jasan simbol svetlom starom zlatom, čitljiv i kad je ikona sitna (48 px).
- Svih 10 ikona je isto osvetljeno, sa istim okvirom i istom debljinom linija.

| Fajl | Simbol |
|---|---|
| `ikona-bacanje.png` | Topuz koji leti u luku, iza njega tri crtice brzine. |
| `ikona-uvis.png` | Topuz u zamahu odozdo nagore, sa lučnom strelicom nagore. |
| `ikona-juris.png` | Topuz ispružen napred, sa vodoravnim linijama zaleta. |
| `ikona-nadole.png` | Topuz udara nadole u tlo, od mesta udara idu pukotine. |
| `ikona-kolut.png` | Zaobljena strelica u krug (kolut). |
| `ikona-vihor.png` | Topuz u kovitlacu, spirala vetra. |
| `ikona-junacki.png` | Uspravan topuz sa zracima kao sunce iza njega. |
| `ikona-vila.png` | Vilin profil sa krilima nalik leptirovim, prema Ravijojli iz igre. |
| `ikona-vino.png` | Drvena čutura sa dvoglavim orlom. |
| `ikona-top.png` | Mali top na točkovima. |

## B. Pauza

| Fajl | Opis |
|---|---|
| `pauza-ram.png` | PNG 900×1180, providno. Uspravna ploča za meni pauze: tamni orah sa kožom tamnozelene boje u sredini. Široki rezbareni okvir sa zlatnim vizantijskim ornamentom i malim dvoglavim orlom gore u sredini. Sredina je mirna i tamna, bez šara, jer na nju ide tekst. |
| `dugme-ploca.png` | PNG 640×112, providno. Pločica za dugme: tamni orah sa tankim zlatnim rubom i malim ukrasima na krajevima. Sredina je mirna. |
| `dugme-ploca-aktivno.png` | Ista pločica, ali sa toplim crvenim lakom u sredini i nešto svetlijim zlatom. Za izabrano dugme. |

## C. Animirana scena pauze

Pravila su ista kao za klipove (atlas, manifest, frames, preview.gif), ali sa ćelijama 768×512. Ide u `art/animation-pack-04/assets/pauza-logor/`.

| Klip | Kadrova | Opis |
|---|---|---|
| `pauza-logor` | 8, petlja | Noć u klisuri. Marko sedi kraj logorske vatre ispred malog šatora, topuz mu leži kraj nogu i greje ruke. Šarac pase iza njega. Iznad vatre lebdi mala svetla vila. Vatra treperi, dim se diže, Šarac maše repom. Slikano kao igra, toplo svetlo vatre, ali bez pregorelog belog. Scena ispunjava celu ćeliju i ima pozadinu, nije providna. |

Posle svake stavke upiši red u `STATUS-ANIMACIJE.md`.
