# Dopuna 78 (od Claude-a, 18. 11.): Miloš i konji u hodu (drugi nivo)

Stefan (18. 11.): „naruči Miloša… sredi Šarčev hod i polako jahanje Miloša i Marka”.

Ravijojlina šuma počinje stihom: dva pobratima jašu naporedo preko Miroča, HODOM, Marko zatraži pesmu, Miloš peva, vila ga ustreli. Sada Marko budan jaše samo galopom, Šarac bez jahača skoro ne pomera noge, a Miloš nema pevanje ni trenutak kad ga strela pogodi.

Status piši u `art/world-pack-03/STATUS-D78.md` (napravi ga), red posle SVAKOG klipa, sa oznakom `D78`.

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, druge `STATUS-*` fajlove, tuđe foldere klipova (ni postojeći `sarac-hod`), git. Paralelno rade druge Codex sesije (D76, D77, D79, D80): ne diraj njihove fajlove; svoje skripte zovi `export-dopuna78.py` i `verify-dopuna78.py`.

## Uzori (`art/world-pack-03/uzori-d78/`)

- `mounted-idle-kadar0.png`: **Marko na Šarcu**, stoji (ćelija 512×512, kopita na y=489, visina 463 px, širina 393 px, gleda udesno). Uzor lika i veličine za `mounted-hod`.
- `pokret-marko-dremlje.png`: Marko koji spava u sedlu dok Šarac HODA: **uzor koraka konja** (redosled nogu, njihanje glave i repa).
- `sarac-stoji-kadar0.png`: **Šarac bez jahača** (kopita na y=489, visina 382 px, širina 398 px). Uzor lika i veličine za `sarac-hod-2`. `pokret-sarac-hod.png` je postojeći hod koji NE valja (noge se skoro ne pomeraju): ne kopiraj ga.
- `milos-jase-kadar0.png`, `pokret-milos-jase.png`: **Miloš na doratu** u hodu (kopita na y=488, visina 365 px, širina 356 px). Uzor lika i veličine za `milos-peva` i `milos-pogodjen`; plava kabanica, smeđa kosa i brada, dorat sa crvenim pokrovcem.
- `milos-idle-kadar0.png`, `pokret-milos-run.png`: **Miloš peške** (visok 380 px, stopala na y=488). Uzor za `milos-hod`.
- `pokret-milos-pada-s-konja.png`: kako Miloš pada sa konja (ono što dolazi POSLE `milos-pogodjen`).

Svaki klip je **uređivanje kadra 0 svog uzora** (`image_gen` sa tim kadrom kao ulazom): isti lik i konj, ista veličina (±5 %), isto mesto u ćeliji.

## Pravila (ista kao u `DOPUNA-65.md`)

- Ćelija 512×512, sigurna margina 24 px (rep i glava konja moraju stati), providna pozadina, bez teksta, tla, senke, strela, krvi i rana.
- Jedan `image_gen` poziv crta mrežu (4×2 za 8 kadrova, 3×2 za 6) na ravnoj jarko zelenoj #00ff00; iseci polja, skini zelenu, svaki kadar u svoju ćeliju. U izvozu ne sme ostati okvir ćelije.
- Kopita (stopala) na liniji uzora; lik je na istom mestu u ćeliji u svim kadrovima (hoda u mestu).
- **Hod konja mora da se vidi**: u svakom kadru su noge u drugom položaju, četvorotaktni hod (jedna po jedna noga), glava klima, rep se njiše. Kadar 7 se pretapa u 0.
- Klip ide u `art/animation-pack-04/assets/<klip>/`: `atlas.png`, `manifest.json` sa `frame_layout`, `frames/motion/frame-N.png`, `preview.gif`, `qa.json`, `identity-size-comparison.png`. JSON bez BOM-a. Radni fajlovi u `art/animation-pack-04/sources/<klip>/attempt-N/`.
- Postupak: `art/world-pack-03/export-dopuna65.py` i `verify-dopuna65.py`, prilagođeni za D78.
- Izmeri visinu i širinu kadra 0 i uporedi sa brojevima gore. Najviše tri pokušaja po klipu; ako ni treći ne valja, NE izvozi.

## Klipovi (redom)

| Klip | Kadrova | Petlja | Uzor | Šta se vidi |
|---|---|---|---|---|
| `mounted-hod` | 8 | da | `mounted-idle-kadar0.png` | Marko BUDAN jaše Šarca hodom: sedi uspravno, topuz preko ramena ili o sedlu, gleda napred, telo mu se njiše u ritmu koraka; Šarac hoda kao u `pokret-marko-dremlje.png`. |
| `sarac-hod-2` | 8 | da | `sarac-stoji-kadar0.png` | Šarac bez jahača hoda: pun četvorotaktni korak, glava klima, griva i rep se njišu, kite na pokrovcu se ljuljaju. |
| `milos-peva` | 8 | da | `milos-jase-kadar0.png` | Miloš peva u sedlu dok dorat hoda: glava zabačena, usta otvorena, desna ruka na grudima pa ispružena u stranu (kao guslar kad zapeva), kabanica leprša. Konj hoda kao u `pokret-milos-jase.png`. |
| `milos-pogodjen` | 4 | ne | `milos-jase-kadar0.png` | Strela ga pogodi (strela se NE crta). 0: jaše kao na uzoru; 1: trzaj, ruka poleti ka grlu, glava unazad; 2: druga ruka na grudi, savija se preko konjskog vrata; 3: klonuo, klizi iz sedla (konj stane, digne glavu). |
| `milos-hod` | 8 | da | `milos-idle-kadar0.png` | Miloš peške HODA (ne trči): miran korak, sablja o pojasu, ruka na balčaku, kabanica se njiše. Noge se smenjuju jasno, kao u trku iz `pokret-milos-run.png`, ali sporim korakom i uspravno. |
