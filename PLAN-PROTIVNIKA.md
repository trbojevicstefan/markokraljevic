# Plan protivnika: Lost Crown pohodi 1–3

Svaki protivnik je postavljen ručno, u podacima nivoa (`dist/greybox-nivoi.js`, `B.foe`). Tabele ispod su izvučene iz tih podataka, pa se slažu sa igrom. Isti raspored proverava i `greybox-test.mjs`. Položaj je u pikselima od leve ivice sobe; soba je široka 1200 px po ćeliji.

## Pravila rasporeda
- **Rast težine:** prve sobe imaju jednog ili dva laka protivnika (janičar, pas). Štitonoše čuvaju uska grla (gradska kapija), a oklopnici i konjanici stoje pred čekpointom ili posle njega.
- **Strelci stoje na uzvišenju:** na bloku, merlonu ili steni, odakle drže prolaz. Do njih se penje ili se strele izbegavaju.
- **Psi su na otvorenom trku** (varoš, pijaca, obala, pećine), gde mogu da jurnu.
- **Palikuće su u kovačnici, šumi i vodenici**, gde imaju šta da pale.
- **Mirne sobe:** tajne sobe, sobe sa oltarom moći i čekpointi nemaju protivnike ni na oltaru ni na čekpointu. Oltar se uzima u miru, a borba je pre ili posle njega.
- **Bos ima svoju arenu** (vrh kule, Vilin izvor, krov Musine kule). Vrata ka areni su jednosmerna, a bos i ono što pozove ostaju u areni dok traje megdan.
- **Ništa nije nasumično:** ni protivnici, ni predmeti, ni prvi plan. Predmeti su u tabeli `ukras` u istom fajlu, soba po sobu.

## 1 · Podgrađe pod Markovim kulama

Ukupno 20 protivnika: 7 × janičar (sablja), 3 × pas, 3 × štitonoša, 1 × akindžija (konjanik), 1 × oklopnik, 4 × strelac, 1 × palikuća (baklja).

| Soba | Broj | Ko i gde (od leve ivice sobe) |
|---|---|---|
| Varoš | 2 | janičar (sablja) na 1550 px; pas na 1900 px |
| Pijaca | 2 | janičar (sablja) na 300 px; pas na 1000 px |
| Gradska kapija | 2 | štitonoša na 300 px; štitonoša na 700 px |
| Dvorište | 2 | akindžija (konjanik) na 1000 px; oklopnik na 2100 px |
| Kasarna | 3 | janičar (sablja) na 300 px; strelac na 600 px; štitonoša na 900 px |
| Vrh kule |  | **Kapetan kule (Janičarski aga)** (bos) |
| Bedem | 3 | strelac na 650 px; strelac na 2750 px; janičar (sablja) na 2200 px |
| Zvonik | 1 | strelac na 300 px |
| Podrum | 2 | pas na 700 px; janičar (sablja) na 950 px |
| Kovačnica | 1 | palikuća (baklja) na 1000 px |
| Tamnica | 2 | janičar (sablja) na 900 px; janičar (sablja) na 1700 px |

## 2 · Urvina planina

Ukupno 23 protivnika: 8 × janičar (sablja), 3 × pas, 7 × strelac, 1 × akindžija (konjanik), 1 × oklopnik, 1 × palikuća (baklja), 2 × štitonoša.

| Soba | Broj | Ko i gde (od leve ivice sobe) |
|---|---|---|
| Podnožje Urvine | 2 | janičar (sablja) na 1000 px; pas na 2150 px |
| Osmatračnica | 2 | strelac na 800 px; strelac na 1300 px |
| Planinska staza | 2 | janičar (sablja) na 450 px; strelac na 1200 px |
| Stari kamenolom | 2 | janičar (sablja) na 300 px; strelac na 2000 px |
| Klanac | 1 | akindžija (konjanik) na 300 px |
| Litica | 3 | strelac na 300 px; strelac na 800 px; janičar (sablja) na 1200 px |
| Stenovita greda | 1 | oklopnik na 2150 px |
| Jelova padina | 2 | janičar (sablja) na 600 px; strelac na 1700 px |
| Ravijojlina šuma | 2 | janičar (sablja) na 400 px; palikuća (baklja) na 1700 px |
| Vilin izvor |  | **Lovac-aga** (bos) |
| Pećina | 2 | pas na 500 px; pas na 900 px |
| Podzemni ponor | 1 | štitonoša na 400 px |
| Duboka pećina | 2 | janičar (sablja) na 600 px; štitonoša na 1300 px |
| Korenje | 1 | janičar (sablja) na 500 px |

## 3 · Kačanička klisura i Musina kula

Ukupno 21 protivnika: 8 × janičar (sablja), 2 × pas, 2 × štitonoša, 1 × palikuća (baklja), 1 × akindžija (konjanik), 2 × oklopnik, 5 × strelac.

| Soba | Broj | Ko i gde (od leve ivice sobe) |
|---|---|---|
| Obala Lepenca | 2 | janičar (sablja) na 1000 px; pas na 2150 px |
| Srušeni kameni most | 1 | štitonoša na 2200 px |
| Vodenica | 1 | palikuća (baklja) na 900 px |
| Skela | 1 | akindžija (konjanik) na 300 px |
| Podnožje Musine kule | 1 | oklopnik na 700 px |
| Musina kula | 2 | janičar (sablja) na 1100 px; strelac na 300 px |
| Krov Musine kule |  | **Musa Kesedžija** (bos) |
| Oružana | 2 | oklopnik na 500 px; štitonoša na 900 px |
| Stražara | 2 | strelac na 400 px; strelac na 800 px |
| Staza kroz kanjon | 3 | strelac na 550 px; strelac na 1450 px; janičar (sablja) na 2000 px |
| Pećina pod obalom | 2 | pas na 1000 px; janičar (sablja) na 1500 px |
| Mlinski točak | 1 | janičar (sablja) na 300 px |
| Brzaci | 1 | janičar (sablja) na 600 px |
| Musina tamnica | 2 | janičar (sablja) na 500 px; janičar (sablja) na 1900 px |

