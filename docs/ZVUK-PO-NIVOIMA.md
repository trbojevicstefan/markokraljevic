# Zvuk po pohodima: šta se gde čuje

Stefan, 19. 11. 2026: „Dosta pesama po nivoima nema veze sa nivoima, ponavljamo ih više puta, moraš da vodiš računa gde koji audio puštamo.”

## Pravila

1. **Jedan pohod, jedna pesma.** Sve što se u pohodu govori ili peva (uvod, slike, scene, guslar, zapis) je iz pesme tog pohoda, redom kojim pesma ide.
2. **Svaki stih jednom.** Isti događaj ne priča i slika, i lik, i guslar. Ako ga kaže lik u sceni, slika pre toga daje samo ono što mu prethodi.
3. **Snimljeno ima prednost.** Ako za mesto postoji snimljena replika (`dist/assets/voice/dijalog.json`), koristi se njen tekst slovo u slovo; nesnimljen dvojnik istog stiha se ne piše.
4. **Guslar**: snimak pesme sa rečima peva se samo tamo gde je to pesma tog pohoda (sada samo „Musa Kesedžija” u Klisuri Ibra). Drugde gusle bez reči pod stihovima `LAND_STIH[pohod]`.
5. **Replike čekaju red** (`speak`, `govorTik`); scena koja ima svoju snimljenu repliku čeka da prethodna završi (čador) ili počinje slikom (Marica).
6. Popis svih replika po funkcijama: `python .tmp-edge/audit_govor.py` (R = snimljena, r = sadrži snimljenu, - = nema snimka).

## Stanje

| Pohod | Pesma | Stanje zvuka |
|---|---|---|
| 1 Kosovsko selo | Šarac (vašar konja) | sređen ranije; guslar sada bez tuđe pesme |
| 2 Ravijojlina šuma | Marko Kraljević i vila | sređen ranije |
| 3 Manastirski vis | Uroš i Mrnjavčevići | sređen ranije |
| 4 Oranje | Oranje Marka Kraljevića | sređen ranije; megdan streljanja sa Alil-agom je iz druge pesme (ostaje kao usputna scena) |
| 5 Opsednuta tvrđava | Marko Kraljević poznaje očinu sablju | sređen 19. 11. (5): vidi README |
| 6 Zaboravljeni podrum | Marko pije uz ramazan vino | **sledeći** |
| 7 Noćna močvara | Marko Kraljević i soko / Lov Markov s Turcima | nije pregledan |
| 8 Vilinska pećina | (vila Ravijojla) | nije pregledan |
| 9 Pod Varadinom | Marko Kraljević i Vuča dženeral | sređen 19. 11.; uvod, slika i zapis pominju Miloševu knjigu (tri puta): skratiti kad se bude snimalo |
| 10 Klisura Ibra | Marko Kraljević i Đemo Brđanin | guslari pevaju Musu (namerno: Đemo sveti brata) |
| 11 Ruševine | Marko Kraljević ukida svadbarinu | nije pregledan |
| 12 Stari rudnik | (tri kese dukata) | nije pregledan; nema svoju pesmu |
| 13 Obala pred zoru | meša Ljuticu Bogdana, Filipa Madžarina i Urvinu | nije pregledan; najviše mešanja |
| 14 Vračeva jaruga | (izmišljen) | nije pregledan |

## Šta nema snimak (peti pohod)

- Turkinja devojka, četiri replike (`MARICA_REC`): nema ženskog glasa za nju.
- Tekst uz tri nove slike (`PRELAZ_RED.tvrdjava`).
- Reči ranjenog junaka kod groba (kad se igra bez slika).
