# Dopuna 109 (od Claude-a, 19. 11.): likovi pesme „Marko Kraljević poznaje očinu sablju” (peti pohod)

Stefan (19. 11.): „kreni na nivo 5 sve do najsitnijeg detalja”.

U pesmi: „Rano rani Turkinja đevojka, prije zore i bijela dana, na Maricu bijeliti platno”; ona izvuče iz vode ranjenog junaka, a kad joj ga brat Mustaf-aga poseče zbog sablje, kune ga i „uz kulu uteče”. U carevoj vojsci sablja ide „od ruke do ruke” i „nikome se izvaditi ne da”. Na kraju Marko sedne caru na serdžadu, a „car s’ odmiče, a Marko primiče, dok doćera cara do duvara; car se maši u džepove rukom, te izvadi stotinu dukata”. Prave se tri lika.

Status piši u `art/world-pack-03/STATUS-D109.md` (napravi ga), red posle SVAKE stavke, sa oznakom `D109`. **Uradi sve stavke do kraja, ne staj i ne pitaj posle prve.**

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, druge `STATUS-*` fajlove, tuđe foldere klipova, git, fajlove `*dopuna41*`. Paralelno rade D107 i D108: ne diraj njihove fajlove.

## Uzori (`art/world-pack-03/uzori-d109/`)

- `velimirovica-idle-kadar0.png`: žena iz igre, ćelija 512×512, stopala na y=488, visoka 360 px, gleda ulevo. **Uzor mere i položaja u ćeliji za Turkinju.**
- `milos-idle-kadar0.png`: Miloš od Pocerja (380 px, gleda ulevo). **Uzor mere za cara.**
- `sword-idle-kadar0.png` i `pokret-sword-idle.png`: janičar sabljaš (426 px, gleda udesno). **Uzor lika, mere i odeće za janičara koji vuče sablju.**
- `dzeneralovica-idle-kadar0.png`, `mladi-turcin-idle-kadar0.png`: rukopis novijih likova; mladi Turčin je Mustaf-aga, brat Turkinje (iste boje kuće: zeleno i crveno).

## Kako izgledaju

- **Turkinja devojka**: mlada, lepa, crna kosa u dve pletenice pod **belom tankom maramom (jašmak je spušten, lice se vidi)**, **crvene dimije**, bela košulja širokih rukava zasukanih do lakta, **zeleni jelek vezen zlatom**, niska dukata oko vrata, bosa. Visoka oko 350 px. Gleda ulevo.
- **Car (sultan)**: sredovečan, crna negovana brada, strog. **Ogroman beli turban sa zlatnom čelenkom i crvenim dragim kamenom**, **dug kaftan od zlatnog brokata postavljen samurovinom**, ispod crvena svilena anterija, široki pojas, žute papuče sa povijenim vrhom. Gleda ulevo.
- **Janičar**: isti čovek i ista odeća kao u `sword-idle-kadar0.png`; u rukama drži **sablju u koricama sa tri zlatna balčaka** (krsnica sa tri zlatne jabuke i tri draga kamena) umesto svoje.

## Pravila (ista kao u `DOPUNA-76.md`)

- Ćelija 512×512, sigurna margina 24 px, providna pozadina, bez teksta, tla, senke, zvezdica i efekata.
- Jedan `image_gen` poziv crta mrežu 3×2 (6 kadrova) na ravnoj jarko zelenoj #00ff00; iseci polja, skini zelenu, svaki kadar u svoju ćeliju. U izvozu ne sme ostati okvir ćelije ni linije mreže, ni komad susednog kadra.
- Stopala (ili donja ivica lika koji kleči ili sedi) na y=488 (±2 px).
- **Ne razvlači kadrove na istu visinu.** Ko kleči ili sedi niži je od onoga ko stoji. Ako je lik malo veći ili manji od traženog, smanji ili uvećaj ceo klip istom razmerom i izvezi (upiši `k=` u status). Ne odbijaj dobar pokušaj zbog visine.
- Klip ide u `art/animation-pack-04/assets/<klip>/`: `atlas.png`, `manifest.json` sa `frame_layout`, `frames/motion/frame-N.png`, `preview.gif`, `qa.json`. JSON bez BOM-a. Radni fajlovi u `art/animation-pack-04/sources/<klip>/attempt-N/`.
- Postupak: `art/world-pack-03/export-dopuna76.py` i `verify-dopuna76.py`, prilagođeni (svoje kopije zovi `export-dopuna109.py` i `verify-dopuna109.py`).
- Najviše dva pokušaja po klipu.

## Klipovi (redom)

| Klip | Kadrova | Petlja | Šta radi |
|---|---|---|---|
| `turkinja-idle` | 6 | da | stoji, ruka na grudima, gleda niz reku, obriše oko krajem marame. Kadar 0 je uređivanje `velimirovica-idle-kadar0.png` (ista poza i mera, druga devojka i odeća). Visoka oko 350 px. |
| `turkinja-beli` | 6 | da | **kleči na jednom kolenu i pratljačom (drvenom lopaticom) udara po mokrom platnu pred sobom**, zamah, udarac, okrene platno. Visoka oko 250 px (kleči), donja ivica na y=488. Gleda ulevo. |
| `turkinja-kune` | 6 | ne | stoji, **diže obe ruke ka nebu pa upire prstom napred (ulevo)**: kune brata. Poslednji kadar: ruke na licu. |
| `car-sedi` | 6 | da | **sedi prekrštenih nogu na jastuku**, jednom rukom gladi bradu, u drugoj brojanice; nizak i širok lik: visok oko 260 px, donja ivica na y=488. |
| `car-uzmice` | 6 | da | **stoji i uzmiče unazad sitnim koracima, obe ruke podignute pred sobom dlanovima napred**, uplašen, oči razrogačene; gleda ulevo, a korača udesno (unazad). Visok oko 380 px. |
| `car-daje` | 6 | ne | leđima uza zid: **zavuče ruku u džep kaftana, izvadi kesu dukata i pruži je napred (ulevo)** drhtavom rukom; poslednji kadar drži pruženu kesu. Visok oko 380 px. |
| `janicar-vuce-sablju` | 6 | da | **obema rukama pokušava da izvuče sablju iz korica i ne može**: zapne, nagne se unazad, stegne zube, otpusti i odmahne glavom. Kadar 0 je uređivanje `sword-idle-kadar0.png` (ista mera, 426 px, gleda udesno). |
