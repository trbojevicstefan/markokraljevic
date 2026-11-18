# Dopuna 96 (od Claude-a, 18. 11.): ljudi iz pesme „Marko Kraljević i Vuča dženeral”

Stefan (18. 11.): „ne vidi se dosta stvari koje su ispevane u pesmi … osmisli likove iz tog nivoa”.

U pohodu „Pod Varadinom” igraju se stihovi pesme, ali se ne vide ljudi o kojima pesma peva. Prave se četiri lika (po jedan ili dva kratka klipa), svi u istoj meri kao Miloš od Pocerja koji je već u igri.

Status piši u `art/world-pack-03/STATUS-D96.md` (napravi ga), red posle SVAKE stavke, sa oznakom `D96`.

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, druge `STATUS-*` fajlove, tuđe foldere klipova, git, fajlove `*dopuna41*`. Paralelno rade druge Codex sesije (D93–D95): ne diraj njihove fajlove.

## Uzori (`art/world-pack-03/uzori-d96/`)

- `milos-idle-kadar0.png`: **Miloš od Pocerja** iz igre, ćelija 512×512, stopala na y=488, visok 380 px, gleda ulevo. **Uzor mere, rukopisa i položaja u ćeliji** za sve likove (isti način crtanja, iste debljine kontura, isto svetlo).
- `pokret-milos-idle.png`: kako diše i stoji (8 kadrova). Uzor za sve `-idle` klipove.
- `putnica-idle-kadar0.png`, `pokret-putnica-idle.png`: žena iz igre (rukopis ženskog lika, haljina).
- `putnik-kaluder-idle-kadar0.png`, `seljak-idle-kadar0.png`: drugi ljudi iz igre (rukopis).
- `pokret-sword-bezi.png`: kako lik beži (uzor za `velimirovica-bezi`).

## Likovi

**Velimirovica**, snaha Vuče dženerala: mlada ugarska plemkinja. Duga **tamnoplava** haljina od kadife sa zlatnim vezom, beli čipkasti okovratnik, crveni prsluk sa pertlama, na glavi **mala zlatna kapica** sa velom, kosa u debelu pletenicu. Visoka 360 px.

**Toplica Milan**, „stari Toplica”: star vojvoda, iscrpljen od tamnice („jer je junak mlogo dangubio”): duga **seda brada** i duga seda kosa, pogrbljen, oslanja se na štap, pocepana crvena čoha preko košulje, bos, na zglobovima tragovi okova. Visok 350 px (pogrbljen).

**Kosančić Ivan**: mlad vojvoda, vitak, plava kosa do ramena, mladi brkovi, iscrpljen ali uspravan; plava pocepana dolama, beli pojas, bez oružja, na zglobovima tragovi okova. Visok 385 px.

**Pošta knjigonoša**, koji Marku donosi Miloševu knjigu pred crkvom u Prilipu: mlađi čovek u **crvenoj kratkoj dolami**, preko ramena **kožna torba** sa pečatom, na glavi crvena kapa, u ruci **savijena knjiga** (pismo sa crvenim voštanim pečatom). Visok 370 px.

## Pravila (ista kao u `DOPUNA-76.md`)

- Ćelija 512×512, sigurna margina 24 px, providna pozadina, bez teksta, tla, senke, zvezdica i efekata. Svi likovi **gledaju ulevo** kao Miloš.
- Jedan `image_gen` poziv crta mrežu (3×2 za 6 kadrova, 4×2 za 8) na ravnoj jarko zelenoj #00ff00; iseci polja, skini zelenu, svaki kadar u svoju ćeliju. U izvozu ne sme ostati okvir ćelije ni linije mreže, ni komad susednog kadra.
- Stopala na y=488; lik na istom mestu u ćeliji kao Miloš.
- **Ne razvlači kadrove na istu visinu.** Kadar u kome se lik pokloni je niži. Proveri površinu lika po kadru: ne sme biti veća od površine kadra 0 za više od 15 %.
- Klip ide u `art/animation-pack-04/assets/<klip>/`: `atlas.png`, `manifest.json` sa `frame_layout`, `frames/motion/frame-N.png`, `preview.gif`, `qa.json`, `identity-size-comparison.png`. JSON bez BOM-a. Radni fajlovi u `art/animation-pack-04/sources/<klip>/attempt-N/`.
- Postupak: `art/world-pack-03/export-dopuna76.py` i `verify-dopuna76.py`, prilagođeni (svoje kopije zovi `export-dopuna96.py` i `verify-dopuna96.py`).
- Za svaki lik **prvo** `-idle` (kadar 0 je uzor lika za njegov drugi klip). Visinu **izmeri** i uporedi sa brojem gore (±5 %). Najviše tri pokušaja po klipu; ako ni treći ne valja, NE izvozi. Pre izvoza napravi tablu kadrova pored `milos-idle-kadar0.png` u istoj razmeri i pogledaj je.

## Klipovi (redom)

| Klip | Kadrova | Petlja | Šta radi |
|---|---|---|---|
| `velimirovica-idle` | 6 | da | stoji na bedemu i gleda u daljinu: dlan iznad očiju, vetar joj malo pomera veo i haljinu |
| `velimirovica-bezi` | 6 | da | uplašena beži, podigla haljinu jednom rukom (uzor pokreta `pokret-sword-bezi.png`) |
| `toplica-idle` | 6 | da | pogrbljen stoji oslonjen na štap, teško diše, ruka mu drhti |
| `kosancic-idle` | 6 | da | stoji, trlja zglob na kome je bio okov, pa se uspravi |
| `knjigonosa-idle` | 6 | da | stoji i drži knjigu na grudima |
| `knjigonosa-poklon` | 8 | ne | skida kapu, stavlja je pod mišku, pokloni se „do zemljice” i pruži knjigu (kadar 7: uspravlja se, ruka sa knjigom ispružena) |
