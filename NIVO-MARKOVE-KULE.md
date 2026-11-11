# Nivo „Markove kule“ (greybox)

Igra se na `index.html?greybox` (lokalno `npm start`, pa http://127.0.0.1:4173/index.html?greybox). Kod nivoa je u `dist/greybox.js`, a test u `greybox-test.mjs`.

Iz *The Lost Crown* uzeta je samo struktura, bez rasporeda soba, crteža i imena:
- svet je povezan na više spratova;
- moći su ključevi: svaka otvara novi put i staru tajnu;
- prečice se otvaraju sa druge strane;
- čekpointi stoje na raskršćima;
- skrivene sobe izgledaju kao stena dok ne uđeš;
- mapa se crta dok istražuješ;
- ponor kažnjava (−20 zdravlja i povratak na čvrsto tlo), ne ubija.

## Mapa

Svaka ćelija je 1200 × 720 px. Zvezdica (*) je skrivena soba. Kula je jedno okno kroz sva tri sprata.

```
          -1        0      1      2      3      4      5      6      7      8      9     10     11     12     13
sprat -1                   [Golub.*]                      [ K ][      Bedem    ]
sprat  0  [Vinski*][   Podgrađe   ][Straž.][    Prolaz    ][ U ][    Dvorište   ][  Srušeni most ][  Vilina odaja ][Preds][Arena]
sprat  1                   [Rizn.*][     Podrum   ][Tamn.][ L ][Ćelija*][Kapela*]
```

Ukupno: 17 soba (od toga 5 skrivenih), 18.000 px od kraja do kraja, 4 čekpointa, 15 protivnika i čuvar arene.

## Tok igre

1. **Podgrađe** (početak, čekpoint).
   - Nizak blok uči hvat ivice.
   - Napukao zid levo traži teški udarac (K). Iza njega je *Vinski podrum*.
   - Visok ispust ispod otvora u tavanici je za kasnije, kad stigne krilo.
2. **Stražarnica**.
   - Janičar i strelac na bloku.
   - Rupa u podu vodi u podrum, samo nadole.
   - Desna kapija je zaključana i otvara se sa druge strane.
3. **Podrum**.
   - Daske koje popuštaju preko jame: skače se sa jedne na drugu.
   - Nizak svod.
   - Štitonoša, pas i janičar.
   - Levo je ponor od 500 px. Iza njega je *Riznica*, ali za nju treba juriš, pa se tu vraća kasnije.
4. **Sokolova tamnica** (čekpoint): **Sokolovo krilo**.
5. **Kula**.
   - Okno se penje ispust po ispust, svaki na visini krila.
   - Na glavnom spratu okno izlazi levo u Prolaz i desno u Dvorište, a na vrhu u Bedem.
   - Na dnu se kroz desni zid prolazi u *Tajnu ćeliju*: to je lažni zid.
6. **Prolaz**.
   - Brda i uvala, akindžija i pas.
   - Poluga otvara kapiju za Stražarnicu. To je **prečica** do početka: tada se vraćaš po *Vinski podrum* i, krilom, po *Golubarnik*.
7. **Bedem** (sa vrha kule).
   - Strelci na zupcima i janičar.
   - Preko rupe se skače do **Juriša u vazduhu**, pa se kroz rupu spušta u Dvorište.
8. **Dvorište** (čekpoint).
   - Akindžija i oklopnik.
   - Prekidač otvara poklopac na drugom kraju sobe na 1 s. Iza njega je *Kapela*, ali tek sa tragom.
9. **Srušeni most**: ponor od 500 px, a preko njega se prelazi samo jurišem.
10. **Vilina odaja**: **Vilin trag**, prekidač i vrata 2100 px dalje.
11. **Predsoblje** (čekpoint): oklopnik i palikuća na brdima.
12. **Arena čuvara**: Janičarski aga.

Tri tajne traže moć koja dolazi kasnije:
- Golubarnik traži krilo;
- Riznica traži juriš;
- Kapela traži trag.

U svakoj tajni je deo srca (+10 zdravlja) i zapis iz Markovog života.

## Mere za crtanje novih soba

Mere su izvučene iz igre, a `greybox-test.mjs` ih proverava stvarnim ulazima.

| Šta | Koliko |
|---|---|
| Visina skoka / sa hvatom ivice | 126 / 266 px |
| Sa krilom / sa krilom i hvatom | 243 / 383 px; ispusti za krilo su 345–365 px |
| Najdalji skok bez juriša (kolut, krilo u pravom kadru) | 469 px |
| Običan zalet, juriš, pa krilo | do 553 px; ponori za juriš su 500 px |
| Daleka ivica ponora | poslednjih 60 px je „step“, ne može se uhvatiti odozdo |
| Vrata i poklopac na prekidač | otvoreni 1 s; prekidač je 1500+ px dalje |
| Vilin trag | traje 8 s, pa povratak do prekidača sme da traje najviše toliko |
| Brdo / uvala | glatke izbočine do 130 px, najviše oko 36° |

## Kako se pravi sledeći nivo

U `dist/greybox.js` nivo je samo podatak:
- `GB_ROOMS`: sobe na rešetki;
- `OPEN`: otvori u zidovima;
- `HOLES`: rupe u podu;
- `BUMPS`: brda i uvale;
- blokovi, protivnici, svetilišta, vrata i tajne u `makeGreybox()`.

`GB_LINKS` je graf prolaza sa moći koju svaki traži. Test na njemu proverava dostižnost, a stvarnim ulazima proverava da svaka kapija drži.
