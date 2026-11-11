# Dopuna 44 (od Claude-a): koštaci, hvat i ošamućeni

Sada svih 12 megdandžija u koštacu postaje isti bezimeni čovek iz `kostac-stoji`. Pred hvat stoje u `idle`, a ošamućeni vojnik je samo nagnut `idle`. Treba nam pravi crteži.

Pravila su ista kao za ostale klipove:
- ćelije su 512×512, a oslonac je na y=487;
- klip ide u `art/animation-pack-04/assets/<klip>/`, sa atlasom, manifestom sa frame_layout, frames i preview.gif;
- klip koji se pušta jednom ima holdLastFrame=true;
- posle svake stavke upiši red u `STATUS-ANIMACIJE.md`.

Slikano, mat, bez krvi. Svaki lik mora da liči na svoj postojeći crtež: isto lice, odeća, boje i oružje. Turci nose turbane, a Marko ne. Kod igre i `dist/` ne diraj.

## Deo 1: stojeći koštac sa megdandžijama

Ovo je isti prizor kao `kostac-stoji`, ali sa pravim protivnikom. Oba lika su u jednoj ćeliji:
- Marko je levo i okrenut udesno, a protivnik je desno i okrenut ulevo.
- Drže se za ramena, a dodir je na sredini ćelije (x≈256).
- Obojica stoje na y=487.
- Marko je kadar po kadar u istom pokretu kao u `kostac-stoji`.

Zum je jedan za sve: Marko je 4/5 svoje veličine iz `kostac-stoji` (oko 295 px od temena do pete), da bi viši protivnik stao u ćeliju. Protivnik je onoliko puta viši od Marka koliko piše u tabeli, kao u igri.

Uz svaki koštac ide i `-kraj`, 6 kadrova, jednom. Marko prebaci protivnika preko kuka, kao u `kostac-stoji-kraj`. U poslednjem kadru protivnik leži, a Marko stoji. Zum je isti kao u koštacu.

| Klip (petlja 8, kraj 6) | Lik (postojeći crtež) | Visina prema Marku |
|---|---|---|
| `kostac-hasan` | `hasan-aga` (oklop, šlem, štit na leđima) | 1,3 |
| `kostac-djemo` | `djemo` | 1,15 |
| `kostac-dzelat` | `dzelat` | 1,15 |
| `kostac-ognjeni` | `ognjeni-aga` | 1,3 |
| `kostac-bajraktar` | `bajraktar` | 1,35 |
| `kostac-aga` | `janicarski-aga` | 1,35 |
| `kostac-arapin` | `arapin` | 1,25 |
| `kostac-lovac` | `lovac-aga` | 1,25 |
| `kostac-basa` | tufekdžija-baša: lik `tufekdzija`, bez puške | 1,2 |
| `kostac-kopljanik-basa` | kopljanik-baša: lik `kopljanik`, bez koplja | 1,25 |
| `kostac-beg` | akindžijski beg peške: lik `akindzija` | 1,3 |
| `kostac-musa` | Musa Kesedžija (`musa-idle`), širok | 1,4 |

Oružje nije u rukama nijednom: ili je za pojasom, ili je palo.

**Musa je izuzetak.** Po pesmi se nose „ljetni dan do podne", obojica u peni. Zato:
- `kostac-musa` je teži i sporiji koštac. Musa polako pritiska Marka nadole.
- `kostac-musa-kraj` ide obrnuto: Musa obori Marka na leđa i klekne nad njim. Poslednji kadar mora da se nastavlja na prvi kadar `megdan-kostac`, u istom zumu i na istom mestu.

## Deo 2: skok na leđa

Ovo je isti janičar kao u `kostac-janicar`, a zum je kao u `kostac-stoji`.

| Klip | Kadrova | Opis |
|---|---|---|
| `kostac-ledja` | 8, petlja | Janičar visi Marku na leđima i rukom mu steže vrat. Marko stoji, povija se i otima se, i pokušava da ga dohvati preko ramena. |
| `kostac-ledja-kraj` | 6, jednom | Marko ga zgrabi i prebaci preko ramena na zemlju ispred sebe. U poslednjem kadru janičar leži, a Marko stoji. |

## Deo 3: hvat megdandžije

Svaki klip je `<lik>-hvata`, sa 6 kadrova, jednom. Zum je kao `<lik>-idle`, a lik je okrenut udesno.
- Kadrovi 0–2: širi ruke i saginje se, spreman da skoči.
- Kadrovi 3–5: nasrće napred raširenih ruku, u trku. Ova tri kadra moraju da se vrte u petlji.

Oružje je za pojasom ili na leđima, a ruke su prazne.

Likovi: `hasan-aga`, `ognjeni-aga`, `lovac-aga`, `bajraktar`, `janicarski-aga`, `djemo`, `dzelat`, `arapin`, `tufekdzija`, `kopljanik`, `akindzija`.

## Deo 4: ošamućen vojnik

Svaki klip je `<tip>-omamljen`, sa 6 kadrova, u petlji. Zum je kao `<tip>-idle`, a lik je okrenut udesno. Vojnik se tetura u mestu, sa spuštenim oružjem i obešenom glavom. Zvezdice ne crtaj, njih crta igra.

Tipovi: `sword`, `shield`, `archer`, `akindzija`, `oklopnik`, `palikuca`, `kopljanik`, `tufekdzija`.

## Deo 5: koštac na zemlji za druge vojnike

Ovo je isto kao `kostac-janicar` i `kostac-janicar-kraj`: isti Markov pokret, isti zum i isto mesto, samo je protivnik drugi.

| Klip | Kadrova | Lik |
|---|---|---|
| `kostac-akindzija` | 8, petlja | `akindzija` |
| `kostac-akindzija-kraj` | 6, jednom | `akindzija` |
| `kostac-kopljanik` | 8, petlja | `kopljanik` |
| `kostac-kopljanik-kraj` | 6, jednom | `kopljanik` |
