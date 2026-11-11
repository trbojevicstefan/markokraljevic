# Dopuna 44 (od Claude-a): koštaci, hvat, ošamućeni i tri baše

Sada svih 12 megdandžija u koštacu postaje isti bezimeni čovek iz `kostac-stoji`. Pred hvat stoje u `idle`, a ošamućeni vojnik je samo nagnut `idle`. Treba nam pravi crteži.

Pravila su ista kao za ostale klipove:
- ćelije su 512×512, a oslonac je na y=487;
- klip ide u `art/animation-pack-04/assets/<klip>/`, sa atlasom, manifestom sa frame_layout, frames i preview.gif;
- klip koji se pušta jednom ima holdLastFrame=true;
- posle svake stavke upiši red u `STATUS-ANIMACIJE.md`.

Slikano, mat, bez krvi. Svaki lik mora da liči na svoj postojeći crtež: isto lice, odeća, boje i oprema. Turci nose turbane, a Marko ne. Kod igre i `dist/` ne diraj.

## Veličina (najvažnije)

U koštacu likovi ne smeju da promene veličinu u odnosu na put. Marko u svakom novom klipu mora da bude iste veličine kao u `marko-idle-2`. Kad leži, dug je koliko je visok kad stoji. Protivnik je prema Marku u istoj srazmeri kao u igri: visine su u tabelama.

Postojeći koštaci na zemlji (`kostac-janicar`, `kostac-oklopnik`, `megdan-kostac`, `megdan-noz`) su nacrtani oko 1,3 puta preveliki. Za nove klipove ne prepisuj njihov zum, nego zum koji piše kod svakog dela. `kostac-stoji` je u pravoj meri.

Svaki klip mora da ima zum koji piše kod njegovog dela, jer veličinu u igri računam po tom zumu.

## Deo 1: stojeći koštac sa megdandžijama

Ovo je isti prizor kao `kostac-stoji`, ali sa pravim protivnikom. Oba lika su u jednoj ćeliji:
- Marko je levo i okrenut udesno, a protivnik je desno i okrenut ulevo.
- Drže se za ramena, a dodir je na sredini ćelije (x≈256).
- Obojica stoje na y=487.
- Marko je kadar po kadar u istom pokretu kao u `kostac-stoji`.

**Zum je jedan za sve:** Marko je 4/5 svoje veličine iz `kostac-stoji`, oko 295 px od temena do pete. Tako i najviši protivnik staje u ćeliju.

Uz svaki koštac ide i `-kraj`, 6 kadrova, jednom. Marko prebaci protivnika preko kuka, kao u `kostac-stoji-kraj`. U poslednjem kadru protivnik leži, a Marko stoji. Zum je isti kao u koštacu.

| Klip (petlja 8, kraj 6) | Lik (postojeći crtež) | Visina prema Marku |
|---|---|---|
| `kostac-hasan` | `hasan-aga` (oklop, šlem) | 1,3 |
| `kostac-djemo` | `djemo` | 1,15 |
| `kostac-dzelat` | `dzelat` | 1,15 |
| `kostac-ognjeni` | `ognjeni-aga` | 1,3 |
| `kostac-bajraktar` | `bajraktar` | 1,35 |
| `kostac-aga` | `janicarski-aga` | 1,35 |
| `kostac-arapin` | `arapin` | 1,25 |
| `kostac-lovac` | `lovac-aga` | 1,25 |
| `kostac-musa` | Musa Kesedžija (`musa-idle`), širok | 1,4 |
| `kostac-basa` | tufekdžija-baša iz dela 6 | 1,2 |
| `kostac-kopljanik-basa` | kopljanik-baša iz dela 6 | 1,25 |
| `kostac-beg` | akindžijski beg iz dela 6 | 1,3 |

Poslednja tri reda se crtaju tek posle dela 6, po novom liku.

Oružje nije u rukama nijednom: ili je za pojasom, ili je palo.

**Musa je izuzetak.** Po pesmi se nose „ljetni dan do podne", obojica u peni. Zato:
- `kostac-musa` je teži i sporiji koštac. Musa polako pritiska Marka nadole.
- `kostac-musa-kraj` ide obrnuto: Musa obori Marka na leđa i klekne nad njim. Poslednji kadar je ista poza kao prvi kadar `megdan-kostac`, ali u zumu ovog klipa (Marko u pravoj meri).

## Deo 2: skok na leđa

Ovo je isti janičar kao u `kostac-janicar`. Zum je kao u `kostac-stoji`, a janičar je 0,9 Markove visine.

| Klip | Kadrova | Opis |
|---|---|---|
| `kostac-ledja` | 8, petlja | Janičar visi Marku na leđima i rukom mu steže vrat. Marko stoji, povija se i otima se, i pokušava da ga dohvati preko ramena. |
| `kostac-ledja-kraj` | 6, jednom | Marko ga zgrabi i prebaci preko ramena na zemlju ispred sebe. U poslednjem kadru janičar leži, a Marko stoji. |

## Deo 3: hvat megdandžije

Svaki klip je `<lik>-hvata`, sa 6 kadrova, jednom. Zum je kao `<lik>-idle`, a lik je okrenut udesno.
- Kadrovi 0–2: širi ruke i saginje se, spreman da skoči.
- Kadrovi 3–5: nasrće napred raširenih ruku, u trku. Ova tri kadra moraju da se vrte u petlji.

Oružje je za pojasom ili na leđima, a ruke su prazne.

Likovi: `hasan-aga`, `ognjeni-aga`, `lovac-aga`, `bajraktar`, `janicarski-aga`, `djemo`, `dzelat` i `arapin`. Posle dela 6 dolaze i `basa`, `kopljanik-basa` i `beg`.

## Deo 4: ošamućen vojnik

Svaki klip je `<tip>-omamljen`, sa 6 kadrova, u petlji. Zum je kao `<tip>-idle`, a lik je okrenut udesno. Vojnik se tetura u mestu, sa spuštenim oružjem i obešenom glavom. Zvezdice ne crtaj, njih crta igra.

Tipovi: `sword`, `shield`, `archer`, `akindzija`, `oklopnik`, `palikuca`, `kopljanik` i `tufekdzija`.

## Deo 5: koštac na zemlji za druge vojnike

Ovo je isti Markov pokret i isto mesto kao `kostac-janicar` i `kostac-janicar-kraj`, samo je protivnik drugi. Zum nije isti: sve je 0,76 puta manje nego u `kostac-janicar`, da Marko bude u pravoj meri.

| Klip | Kadrova | Lik | Visina prema Marku |
|---|---|---|---|
| `kostac-akindzija` | 8, petlja | `akindzija` | 1 |
| `kostac-akindzija-kraj` | 6, jednom | `akindzija` | 1 |
| `kostac-kopljanik` | 8, petlja | `kopljanik` | 0,95 |
| `kostac-kopljanik-kraj` | 6, jednom | `kopljanik` | 0,95 |

## Deo 6: sopstveni lik za tri baše

Ove tri megdandžije su sada samo uvećani obični vojnici. Svaki treba da dobije svoj lik, sa likom okrenutim udesno. Zum je kao `hasan-aga-idle`.

| Lik | Klipovi | Opis |
|---|---|---|
| `basa` | `basa-idle` (6, petlja), `basa-run` (8, petlja), `basa-attack` (6, jednom), `basa-hurt` (4, jednom), `basa-death` (6, jednom) | Tufekdžija-baša: stariji, krupan zapovednik tufekdžija, sa dugom ukrašenom puškom i barutnim rogom. Ima turban sa perjanicom i tamnoplavu dolamu sa zlatom. Napad je pucanj iz puške, sa dimom na cevi. |
| `kopljanik-basa` | isto: `-idle`, `-run`, `-attack`, `-hurt`, `-death` | Kopljanik-baša: visok, u pancirnoj košulji, sa dugim kopljem sa zastavicom i okruglim štitom. Napad je ubod kopljem napred. |
| `beg` | isto: `-idle`, `-run`, `-attack`, `-hurt`, `-death` | Akindžijski beg peške: isti čovek kao jahač u `beg-mounted`, sa krznenim kalpakom i belim perom, plavo-zlatnim kaftanom i crvenim plaštom. Nosi sablju. Napad je kos udarac sabljom. |

Visina u igri: baša i kopljanik-baša su 1,2–1,25 Marka, a beg je 1,3 Marka.

## Redosled

Ako nestane kredita, ono što je gore važnije je.

1. Deo 1 bez tri baše (9 koštaca i 9 krajeva)
2. Deo 2
3. Deo 3 bez tri baše
4. Deo 4
5. Deo 5
6. Deo 6
7. Koštac i kraj za tri baše, pa njihov hvat
