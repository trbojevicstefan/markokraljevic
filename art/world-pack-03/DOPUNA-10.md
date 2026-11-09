# Dopuna 10 (od Claude-a): Šarac u borbi, putnici, Musine nove etape i novi bosovi

Pravila su ista kao u DOPUNA-8:
- Svaki klip ide u `art/animation-pack-04/assets/<klip>/` (atlas, manifest sa frame_layout, frames, preview.gif).
- Ćelije su 512×512, lik okrenut udesno, oslonac stopala (ili kopita) na y=487.
- Susedni kadrovi se glatko nastavljaju, a petlje se zatvaraju.
- Napredak upisuj u `STATUS-ANIMACIJE.md`.
- Ništa urađeno ne briši.

Isti slikarski stil kao postojeći likovi. Uzori su `dist/assets/marko-idle.png`, `musa-idle.png`, `sword-idle.png`, `akindzija-idle.png` i `mounted-run.png`.

Redosled je po važnosti. Ako nestane vremena, bolje je završiti prve stavke nego početi sve.

## A. Marko udara sa Šarca

| Klip | Kadrova | Opis |
|---|---|---|
| `marko-mounted-attack` | 6, jednom | Marko na Šarcu u galopu zamahne topuzom napred-nadole, sa sedla. Šarac nastavlja galop. Isti zum, konj i jahač kao `mounted-run`. |

## B. Putnici koje Musa ne pušta drumom

Srpski putnici iz 14. veka. Visina i zum kao `sword-idle`; dete je manje.
- `idle`: 6 kadrova, petlja. Uplašeno stoje i osvrću se.
- `walk`: 8 kadrova, petlja. Hodaju udesno, umorno.

| Lik | Klipovi | Izgled |
|---|---|---|
| Trgovac | `putnik-trgovac-idle`, `putnik-trgovac-walk` | Šubara, dug kaput, zavežljaj robe na leđima. |
| Majka sa detetom | `putnica-idle`, `putnica-walk` | Narodna nošnja i marama; dete drži za ruku. |
| Starac | `putnik-starac-idle`, `putnik-starac-walk` | Bela brada, štap, opanci. |
| Kaluđer | `putnik-kaluder-idle`, `putnik-kaluder-walk` | Crna mantija i kamilavka, knjiga pod rukom. |

## C. Musine nove etape, kao u pesmi

Megdan teče ovako: koplja s konja, pa sablje, pa topuzi, pa „u koštac“. Musa obori Marka, a Marko ga dokrajči nožem zatajcem.

Musa je džin, iste veličine kao `musa-idle`.

| Klip | Kadrova | Opis |
|---|---|---|
| `musa-mounted` | 8, petlja | Musa u galopu na crnom konju, koplje položeno napred. Konj je krupniji od Šarca. |
| `musa-mounted-strike` | 6, jednom | Ubod kopljem sa konja u galopu. |
| `musa-sword` | 6, jednom | Širok vodoravni zamah velikom sabljom. |
| `musa-grab` | 6, jednom | Baci se napred raširenih ruku da zgrabi protivnika. |
| `megdan-kostac` | 8, petlja | Oba lika u jednom kadru: Marko leži na leđima, Musa mu kleči na grudima i steže ga za vrat. Marko se otima. |
| `megdan-noz` | 8, jednom | Marko izvuče skriveni nož i ubode Musu odozdo. Musa se zabaci i padne unazad, udesno, i ostane da leži. |

## D. Akindžijski beg na konju

Uzor je borba sa generalom Uvishkom iz Prince of Persia: The Lost Crown, u kojoj se bos prvo obara s konja.

| Klip | Kadrova | Opis |
|---|---|---|
| `beg-mounted` | 8, petlja | Osmanski beg na sivom konju u galopu, sablja u ruci, perjanica na kalpaku. Veličina konja kao Šarac. |
| `beg-mounted-strike` | 6, jednom | Zamah sabljom sa konja u prolazu. |
| `beg-unhorsed` | 6, jednom | Konj se propne, beg padne unazad na zemlju. Konj izađe iz kadra, a beg ostane da leži. |

## E. Novi bos: Arapin iz pesme „Marko Kraljević ukida svadbarinu“

Gospodar kule na moru. Visok ratnik u čeliku i svili, sa turbanom i velikom zakrivljenom sabljom. Dostojanstven i strašan, bez karikature. Visina je između `oklopnik-idle` i Muse.

| Klip | Kadrova | Opis |
|---|---|---|
| `arapin-idle` | 6, petlja | Mirovanje. |
| `arapin-run` | 8, petlja | Trk. |
| `arapin-attack` | 6, jednom | Zamah sabljom iznad glave. |
| `arapin-throw` | 6, jednom | Baci koplje. |
| `arapin-hurt` | 4, jednom | Trzaj od udarca. |
| `arapin-death` | 6, jednom | Pad. |
