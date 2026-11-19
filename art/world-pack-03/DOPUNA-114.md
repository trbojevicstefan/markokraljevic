# Dopuna 114 (od Claude-a, 19. 11.): likovi pesme „Marko pije uz ramazan vino” (šesti pohod)

Stefan (19. 11.): „za neke scene fale kadrovi i junaci … idemo nivo po nivo da bi sve izgledalo savršeno”.

U pesmi: „Marko igra kolom uz kadune … još nagoni odže i adžije da i oni s njime piju vino … Marko pod šatorom pije, pred njim kupa od dvanaest oka … Rasrdi se Kraljeviću Marko, pak dovati onu kupu s vinom, pa udara careva čauša: pršte kupa, a pršte i glava, i proli se i krvca i vino.” Prave se: kadune u kolu, hodža i hadžija koje Marko natera da piju, i dva Markova klipa.

Status piši u `art/world-pack-03/STATUS-D114.md` (napravi ga), red posle SVAKE stavke, sa oznakom `D114`. **Uradi sve stavke do kraja, ne staj i ne pitaj posle prve.**

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, druge `STATUS-*` fajlove, tuđe foldere klipova, git, fajlove `*dopuna41*`. Paralelno radi D113: ne diraj njegove fajlove.

## Uzori (`art/world-pack-03/uzori-d114/`)

- `svatovi-kolo-kadar0.png`: kolo iz igre (pet ljudi u redu, drže se za ruke; ćelija 512×512, donja ivica na y=486). **Uzor mere, rasporeda i položaja u ćeliji za kadune.**
- `turkinja-idle-kadar0.png`: Turkinja iz igre: **uzor lica, odeće i rukopisa za kadune** (dimije, jelek, marama).
- `tabor-dervis-kadar0.png`: lik koji sedi prekrštenih nogu (270 px, donja ivica na y=488): **uzor mere i poze za hodžu i hadžiju.**
- `marko-stoji-kadar.png`: **Marko kako stoji u igri** (gleda udesno): uzor lika, odeće i mere za `marko-igra-kolo`.
- `marko-sedi-pije-kadar0.png`, `marko-sedi-pije-kadar3.png`: **Marko kako sedi na zemlji i pije** (gleda udesno, lik visok 256 px, telo na y=488): uzor lika, poze i mere za početak klipa `marko-udara-kupom`.
- `caus-idle-kadar0.png`: carev čauš (njega Marko udara kupom; u klipu ga NEMA, samo da znaš visinu: 400 px).

## Pravila (ista kao u `DOPUNA-109.md` i `DOPUNA-97.md`)

- Ćelija 512×512, sigurna margina 24 px, providna pozadina, bez teksta, tla, senke, zvezdica i efekata.
- Jedan `image_gen` poziv crta mrežu (3×2 za 6 kadrova, 4×2 za 8) na ravnoj jarko zelenoj #00ff00; iseci polja, skini zelenu, svaki kadar u svoju ćeliju. U izvozu ne sme ostati okvir ćelije ni linije mreže, ni komad susednog kadra. **Ništa u klipu ne sme biti zeleno od ključa** (para, vino i staklo su crveni ili beli, ne zeleni).
- Stopala (ili donja ivica lika koji sedi) na y=488 (±2 px). Lik se gleda s boka.
- **Ne razvlači kadrove na istu visinu.** Ako je lik malo veći ili manji od traženog, smanji ili uvećaj ceo klip istom razmerom i izvezi (upiši `k=` u status).
- Klip ide u `art/animation-pack-04/assets/<klip>/`: `atlas.png`, `manifest.json` sa `frame_layout`, `frames/motion/frame-N.png`, `preview.gif`, `qa.json`. JSON bez BOM-a. Radni fajlovi u `art/animation-pack-04/sources/<klip>/attempt-N/`.
- Postupak: `art/world-pack-03/export-dopuna112.py` i `verify-dopuna112.py`, prilagođeni (svoje kopije zovi `export-dopuna114.py` i `verify-dopuna114.py`).
- Najviše dva pokušaja po klipu (za Markove klipove tri).

## Klipovi (redom)

| Klip | Kadrova | Petlja | Šta radi |
|---|---|---|---|
| `kadune-kolo` | 8 | da | **Tri kadune (mlade turske gospođe) igraju kolo u redu, drže se za ruke**: svilene dimije (jedna ljubičaste, jedna žute, jedna plave), vezeni jeleci, **tanki beli jašmaci preko kose, lica otkrivena i nasmejana**, nanule; koraci kola, dimije i marame lete. Mera kao u `svatovi-kolo-kadar0.png` (žene visoke oko 330 px), grupa široka do 440 px, donja ivica na y=488. |
| `hodza-odbija` | 6 | da | **Hodža**: debeo, seda brada, **velika bela ahmedija (turban) oko crvenog fesa, crna džuba**; sedi prekrštenih nogu na jastuku, **diže dlanove i odmahuje glavom: „neću!”**, gleda ulevo. Visok oko 280 px, donja ivica na y=488. |
| `hodza-pije` | 6 | da | isti hodža, isto mesto: **obema rukama drži veliku čašu crvenog vina i pije**, obrazi mu se zacrvene, obriše bradu, nasmeje se, zaljulja se. Gleda ulevo. |
| `hadzija-odbija` | 6 | da | **Hadžija**: mršav, crna brada, **zelena ahmedija (zeleni turban hadžije), bela anterija, brojanice u ruci**; sedi prekrštenih nogu, **pokriva oči rukom i okreće glavu od vina**, gleda ulevo. Visok oko 280 px. |
| `hadzija-pije` | 6 | da | isti hadžija, isto mesto: **pije iz zemljanog krčaga dignutog iznad glave**, vino mu curi niz bradu, štucne, podigne krčag kao zdravicu. Gleda ulevo. |
| `marko-igra-kolo` | 8 | da | **Marko igra kolo**: stoji uspravno kao u `marko-stoji-kadar.png` (ista odeća, crven plašt, topuz o pojasu, NE u ruci), **ruke raširene u visini ramena (kao da drži igračice s obe strane), noge u koracima kola: korak, poskok, prekrštanje**, široko se smeje. Gleda udesno. Ista visina kao u uzoru (±3 %), stopala na y=488; pri poskoku sme biti do 20 px iznad. |
| `marko-udara-kupom` | 8 | ne | 0: sedi na zemlji kao u `marko-sedi-pije-kadar0.png`, pred njim **ogromna bakrena kupa sa dve drške**; 1: namršti se i zgrabi kupu obema rukama; 2: ustaje na jedno koleno; 3: stoji, kupa visoko iznad glave, vino se preliva; 4–5: **udara kupom nadole pred sebe (udesno), kupa pršti u komade, crveno vino prska**; 6: stoji, u rukama samo drške, komadi lete; 7: stoji mirno, otresa ruke. Gleda udesno. U kadrovima 3–7 visok kao u `marko-stoji-kadar.png`; u kadru 0 visok 256 px. Telo ostaje na istom mestu (isti x), na y=488. |
