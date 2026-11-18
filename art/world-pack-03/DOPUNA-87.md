# Dopuna 87 (od Claude-a, 18. 11.): naslovna scena, Marko i Šarac dele vino pred krčmom

Stefan (18. 11.): „Početni ekran mora da bude mnogo bolji: neka Marko i Šarac dele vino ispred neke krčme, mnogo bolja scena od ove trenbunte.”

Sadašnji početni ekran (`uzori-d87/sadasnji-pocetni-ekran.jpg`) je Marko koji stoji na litici. Pravi se nova slika preko celog ekrana.

Status piši u `art/world-pack-03/STATUS-D87.md` (napravi ga), red posle SVAKE stavke, sa oznakom `D87`.

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, druge `STATUS-*` fajlove, postojeće slike, tuđe foldere, git, fajlove `*dopuna41*`. Paralelno rade druge Codex sesije (D88–D92): ne diraj njihove fajlove; svoje skripte zovi `*-dopuna87.py`.

## Ko je ko (uzori u `art/world-pack-03/uzori-d87/`)

- `lik-prelaz-selo-1.jpg`, `lik-prelaz-selo-2.jpg`, `lik-prelaz-oranje-1.jpg`: **Marko i Šarac kakvi su u igri.** Marko: crna kosa do ramena, crni brkovi i kratka brada, krupan; crven plašt sa zlatnim vezom; ljuskast oklop preko bele košulje sa crvenim vezom; tamne čakšire i visoke smeđe čizme; topuz sa šiljcima o pojasu, čutura o boku. Šarac: **beo konj sa velikim kestenjasto-crvenim pegama (šarac)**, svetla griva i rep, crven pokrovac sa zlatnim vezom, uzda sa crvenim kićankama. Lice i odeća moraju biti ISTI kao na tim slikama.
- `sarac-stoji-kadar0.png`, `sarac-pije-kadar0.png`: Šarac iz igre (kako stoji i kako pije).
- `stil-meni-sada-pozadina.jpg`, `stil-manastir-far-rucno.jpg`, `stil-oranje-sky.jpg`: **rukopis slike** igre: toplo, bogato slikano, mekana svetlost, jasni oblici, bez fotografske realnosti.

## Šta se vidi

Iz narodne pesme: Marko pije vino, „pola pije, pola Šarcu daje”. Predvečerje, toplo zlatno-crveno nebo, prve zvezde. **Desna polovina slike:** stara balkanska krčma (prizemlje od kamena, sprat od drveta sa doksatom, krov od ćeramide, dimnjak iz kog ide dim, mali prozori u kojima gori vatra, fenjer nad vratima, vinova loza preko drvene senice, burad uz zid). Pred krčmom drveni astal i klupa; na astalu bardak, testija i hleb. **Marko sedi na klupi**, okrenut ka Šarcu, nasmejan, podiže veliku kupu crnog vina i preliva pola u drveni ćup (ili bakrač) iz kog Šarac pije. **Šarac stoji uz astal**, glavu spustio u ćup, pije. Toplo prijateljstvo, junak i konj kao drugovi. Topuz prislonjen uz klupu.

**Leva trećina slike** je mirnija i tamnija (put koji vodi u daljinu, brda, sumrak): tu ide naslov igre i meni, pa tu ne sme biti likova ni jarkih detalja.

Bez teksta, bez okvira, bez potpisa. Likovi su krupni (Marko sedeći zauzima oko 40 % visine slike), jasno čitljivi.

## Slike (u `art/world-pack-03/`)

Uradi **tri** različita kadra iste scene, svaku kao jedan `image_gen` poziv, najveće vodoravne veličine koju alat daje (1536×1024 ili veće), pa iseci na **16:9** (npr. 1536×864) tako da sve bitno ostane u kadru:

| Ime | Kadar |
|---|---|
| `naslovna-krcma-a.png` | Blizu: Marko na klupi i Šarac uz astal zauzimaju desnu polovinu, krčma iza njih. |
| `naslovna-krcma-b.png` | Malo šire: cela krčma desno, Marko i Šarac pred njom, levo drum ka brdima i sumrak. |
| `naslovna-krcma-c.png` | Noć sa fenjerima: isto kao `a`, ali kasnije, plavo-ljubičasto nebo, zlatna svetlost iz krčme i fenjera pada na Marka i Šarca. |

Posle svake slike uporedi Marka i Šarca sa `lik-prelaz-selo-1.jpg`: ako lice, plašt ili pege na konju nisu isti, pokušaj ponovo (najviše tri pokušaja po slici). U status upiši koji je pokušaj uzet i zašto.

Uz svaku sliku sačuvaj i umanjenu kopiju 640 px širine (`naslovna-krcma-a-mala.jpg` itd.).
