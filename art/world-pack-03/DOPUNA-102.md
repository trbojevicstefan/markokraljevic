# Dopuna 102 (od Claude-a, 18. 11.): posmatrači, obični ljudi, i katana u gardu

Stefan (18. 11.): „Napravi još posmatrača običnih ljudi” i „daj još neku zanimljivu mehaniku borbe … da moramo da uradimo određeni potez, kombo, da savladamo protivnika”.

U pohodu „Pod Varadinom” (pesma „Marko Kraljević i Vuča dženeral”) narod stoji pored puta i gleda kako Marko prolazi. Pravi se pet običnih ljudi (po jedan klip `-idle` koji se vrti) i dva klipa katane (ugarski husar koji je već u igri) za novu mehaniku: katana uhvati gard sabljom, a Marko mora da otkuca kombo da ga probije.

Status piši u `art/world-pack-03/STATUS-D102.md` (napravi ga), red posle SVAKE stavke, sa oznakom `D102`. **Uradi sve stavke do kraja, ne staj i ne pitaj posle prve.**

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, druge `STATUS-*` fajlove, tuđe foldere klipova, git, fajlove `*dopuna41*`. Paralelno radi D103: ne diraj njegove fajlove.

## Uzori (`art/world-pack-03/uzori-d102/`)

- `milos-idle-kadar0.png`: Miloš od Pocerja, ćelija 512×512, stopala na y=488, visok 380 px. **Uzor mere, rukopisa i položaja u ćeliji** za sve ljude.
- `putnica-idle-*`, `seljak-idle-*`, `knjigonosa-idle-*`, `toplica-idle-*`: obični ljudi iz igre (rukopis, odeća, kako dišu u mestu).
- `katana-idle-kadar0.png` i `pokret-katana-idle.png`: **katana**, visok 426 px, gleda udesno. **Uzor lika i mere za oba klipa katane.** `pokret-katana-hurt.png`: kako se trgne.

## Likovi

| Klip | Ko | Visina | Šta radi (6 kadrova, petlja) |
|---|---|---|---|
| `posmatrac-seljanka` | mlada seljanka u beloj košulji, crvenoj pregači, marama na glavi, na kuku korpa grožđa | 350 | gleda ka Marku, dlanom zakloni oči od sunca, malo se njiše |
| `posmatrac-decak` | bosonog dečak u košulji do kolena, šubara | 250 | skakuće u mestu i maše rukom iznad glave |
| `posmatrac-starica` | starica u crnom, crna marama, štap | 320 | stoji pogrbljena i krsti se, pa sklopi ruke |
| `posmatrac-ribar` | ribar sa Dunava, zasukane nogavice, preko ramena mreža | 370 | stoji, gleda, podigne ruku u pozdrav |
| `posmatrac-gradjanin` | građanin Varadina: tamni kaput sa srebrnim dugmadima, šešir sa perom, brkovi | 375 | stoji ruku na pojasu, odmahuje glavom, pa pokaže prstom napred |

Svi ljudi gledaju **ulevo** (kao Miloš). Kadar 0 svakog lika je uređivanje `milos-idle-kadar0.png` u odeći tog lika; ostali kadrovi su uređivanje kadra 0.

## Katana

| Klip | Kadrova | Petlja | Šta radi |
|---|---|---|---|
| `katana-gard` | 4 | da | katana stoji raskoračen, **sablju drži vodoravno ispred lica obema rukama** (gard), štit sa leđa prebačen napred na levu ruku; malo podrhtava, oči uprte napred. Gleda udesno, kao uzor. |
| `katana-gard-slomljen` | 6 | ne | gard mu se lomi: sablja odbačena ustranu, on se zatetura unazad, rašireni ruke, pa ostane pogrbljen i ošamućen (kadar 5 kao `katana-omamljen`). |

Kadar 0 oba klipa je uređivanje `katana-idle-kadar0.png` (isti čovek, ista odeća, ista mera).

## Pravila (ista kao u `DOPUNA-76.md`)

- Ćelija 512×512, sigurna margina 24 px, providna pozadina, bez teksta, tla, senke, zvezdica i efekata.
- Jedan `image_gen` poziv crta mrežu (3×2 za 6 kadrova, 2×2 za 4) na ravnoj jarko zelenoj #00ff00; iseci polja, skini zelenu, svaki kadar u svoju ćeliju. U izvozu ne sme ostati okvir ćelije ni linije mreže, ni komad susednog kadra.
- Stopala na y=488 (±2 px je u redu); lik na istom mestu u ćeliji kao uzor.
- **Ne razvlači kadrove na istu visinu.** Ako lik ne staje ili je u tvom pokušaju malo veći ili manji od traženog, **smanji ili uvećaj ceo klip istom razmerom i izvezi** (upiši razmeru `k=` u status). Ne odbijaj pokušaj zbog visine.
- Klip ide u `art/animation-pack-04/assets/<klip>/`: `atlas.png`, `manifest.json` sa `frame_layout`, `frames/motion/frame-N.png`, `preview.gif`, `qa.json`. JSON bez BOM-a. Radni fajlovi u `art/animation-pack-04/sources/<klip>/attempt-N/`.
- Postupak: `art/world-pack-03/export-dopuna76.py` i `verify-dopuna76.py`, prilagođeni (svoje kopije zovi `export-dopuna102.py` i `verify-dopuna102.py`).
- Najviše dva pokušaja po klipu.
