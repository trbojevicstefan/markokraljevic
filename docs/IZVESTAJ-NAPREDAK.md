# Izveštaj 15. 11. 2026: WebP, gusle, vrač, animacije, riznica, ekonomija, Napredak, HUD

Stefanov spisak (15. 11.):
- WebP;
- gusle za sve pesme;
- vrač kao novi bos i novi nivo;
- animacije koje fale;
- lepša riznica iznutra (od Codexa);
- teža ekonomija;
- meni napretka;
- novi HUD kao u WoW-u;
- duži odmor jakih udaraca;
- bolja traka zdravlja.

## 1. Lakša igra (WebP)

- Na sajt sada idu slike WebP (kvalitet 90, providnost bez gubitka): `tools/webp-dist.py`, korak u `.github/workflows/pages.yml`.
  - U repou i na računaru sve ostaje PNG, pa Codex, `sync-anims.py` i `build-sprite-rig.py` rade kao i pre.
  - Pretvaranje radi samo nad kopijom za objavu, sa kešom po sadržaju, tako da se svaki put pretvara samo novo.
- Probano na kopiji igre (`.webp-proba`, `ROOT=.webp-proba node server.mjs` ili konfiguracija `marko-webp`):
  - 491 list: 506 MB → 117 MB;
  - cela igra: 840 MB → 470 MB;
  - pretvaranje traje 26 s.
  - Igra radi bez greške i bez 404.
  - Likovi se na dvostrukom uvećanju ne razlikuju od PNG-a, a providnost je ista do piksela.
- Ostaju PNG: ceo `cast/` i `gorge.png`, jer ih HTML i CSS zovu direktno.
- Učitavanje u pozadini posle starta više ne vuče protivnike drugih poglavlja; njih donosi početak njihovog poglavlja. U Selu: 454 od 501 lista.

## 2. Gusle

Na Wikimedia Commons i Internet Archive-u slobodnu licencu ima samo jedan snimak neke pesme o Marku: „Marko Kraljević i Musa Kesedžija”. On je već u igri (guslar u Klisuri). Ostalo na Archive-u je bez licence i ne sme se koristiti.

Preuzeta su još tri slobodna snimka gusala (CC BY-SA), obrađena i stavljena u `dist/assets/music/`. Licence su u `GUSLE-LICENSE.txt`.

| Snimak | Gde svira |
|---|---|
| `gusle-svirka` | uz priču između poglavlja |
| `gusle-dojcin` („Bolani Dojčin”) | na vrhu Urvine, dok se Marko oprašta, i u snu |
| `gusle-musa` | posle megdana sa Musom i uz njegovu priču |
| `gusle-vujadin` („Stari Vujadin”) | uz priču Vračeve jaruge |

Muzika nivoa ostala je ista.

## 3. Crni vrač i Vračeva jaruga

**Novi nivo „Vračeva jaruga”:**
- noć u Skopskoj Crnoj Gori;
- u priči između Reke i Urvine (`JOURNEY`);
- na obe mape, na kraju spiska nivoa, pa se stari sačuvani nivoi ne pomeraju.

**Bos „Crni vrač”** (`KITS.vrac`), po uzoru na čarobnjake iz The Lost Crown i Hollow Knight-a:
- **Kretanje:** ne hoda; nestaje u dimu i pojavljuje se drugde. Dok je u dimu, udarci ga ne hvataju.
- **Čini:** baca ih uz zlatan znak. Odbijene (L) vraćaju se u njega i nose 110 zdravlja.
- **Štap:** iz blizine udara štapom; odbijen udarac ga ostavi iscrpljenog.
- **Senke (od pola zdravlja):** dve senke (tri pri kraju) pucaju od jednog udarca. Pravog pokazuje Vilinsko oko (O); tada senke izblede, a pravi zasvetli.
- **Bekstvo:** posle tri brza udarca beži u dim, a posle dve čini sigurno nestane.

Prečice: `?dev&go=vracara` (početak nivoa) i `?dev&go=vrac` (megdan).

## 4. Animacije (Codex D57, D58, D60)

**Šarac (D57), svih 6:** `sarac-pije`, `sarac-lupa`, `sarac-propinje`, `sarac-boli`, `sarac-pada`, `sarac-hod`.
- Pod Varadinom pije i lupa kopitom.
- U mehani se propinje i trgne kad ga Filip udari.
- Na vrhu Urvine se oprosti, legne, a na njegovom mestu nikne humka (`prop-sarac-humka`, D59).

**Likovi (D58), 5 od 6:**
- `vrac-stap`, `vrac-smrt`;
- `vukasin-stoji`: kralj stoji, a ne zamrzne se u trku;
- `kosovka-poji`: posle boja sa Arapinom Kosovka priđe, klekne i napoji Marka (zdravlje i vino puni);
- `djemo-omamljen`.

**`milos-pada-s-konja`:** Codex ga je odbio jer je konj u kadrovima 4–5 odskakao 12–13 px. Pokušaj je bio dobar, pa ga je Claude izvezao sa spuštena ta dva kadra (`export-dopuna58-claude.py`). U pesmi o vili igra ga crta umesto dve slike koje se pretapaju.

**Ikone veština (D60):** niz, odskok od zida, kontra, pun zamah, vilinski uzlet, tresak.

**I dalje fali:**
- `tufekdzija-drugi` (moderacija);
- sjahivanje: igra nema radnju sjahivanja, Marko odmah stoji kad scena počne.

## 5. Riznica (Codex D59)

- Naslikana unutrašnjost (`riznica-unutra.webp`), kao presek zida:
  - svodovi, ikone, pehari, barjak, štitovi, sablje, ćilim;
  - pod je prazan za kovčege.
- U riznici se crtaju samo njeni kovčezi, a baklje na slici imaju živu vatru.
- Ista slika je pozadina menija Napredak.

## 6. Ekonomija

Merenje: `node tools/ekonomija.mjs`.

**Pre:**
- priča je davala ~5.750 dukata (60 % iz kovčega i buradi);
- sve trajno je koštalo 3.405, pa se sve kupilo do sredine priče.

**Sada:**
- **Plen:** kovčezi i burad daju upola, slova 20 dukata, elitni protivnik 5 dukata.
- **Ponovljeno poglavlje:** daje trećinu plena i dukata od boja.
- **Cene:**
  - kovač ×1,2;
  - amajlije ×1,5;
  - trgovac: vino 20, melem 30, brus 45, amajlija 70.
- **Novi trošak:** stepeni veština, 120 i 260 dukata, za 10 veština.
- **Ukupno:** priča daje ~4.080 dukata, a sve trajno košta 8.035. Do kraja priče kupi se otprilike polovina, pa se mora birati.
- Dukati iz pesama (sto od sultana, trideset od knjige…) ostali su kako pesme kažu.

## 7. Meni Napredak (P ili Tab; dugme u pauzi i u glavnom meniju)

**Levo:** Marko, titula, zdravlje, snaga, vino, veštine, stepeni, amajlije i kesa.

**Kartice:**
- **Veštine:** stepen I se uči u poglavlju, II i III se kupuju. Svaki stepen daje +15 % snage i/ili 15 % kraći odmor (piše kod svake veštine).
- **Junački udari (F/R):** menjaju se svuda, ne samo na izvoru.
- **Amajlije:** menjaju se svuda, ne samo na izvoru.
- **Kovač i zadužbine:** kupljeno važi odmah.

Usred boja se ništa ne menja.

## 8. Odmor jakih udaraca

| Udarac | Pre | Sada |
|---|---|---|
| Teški udarac (K) | bez odmora (0,78 s između) | 1,6 s |
| Lomilac (J J K) | — | 2,2 s |
| Tresak | — | 2,6 s |
| Prolet sabljom | — | 1,8 s |
| Aperkat | 1,2 s | 2,6 s |
| Udar nadole | 1,1 s | 2,2 s |
| Bačeni topuz | 2,5 s | 3,6 s |
| Juriš | 3 s | 4,5 s |

- Stepen veštine skraćuje odmor za 15 % po stepenu.
- Prvo je K imao 2,4 s, ali bot iz simulacije tada nije mogao da probije oklop oklopnika okruženog strelcem i sabljašem. Na 1,6 s prelazi igru.

## 9. HUD i traka zdravlja (`dist/hud.css`)

- **Okvir junaka** (gore levo, kao u WoW-u):
  - portret u zlatnom krugu sa nivoom: 1 + naučene veštine + kupljeni stepeni;
  - **traka zdravlja:** debela, sa podeocima i brojem; kad Marko primi udarac, svetao trag pokaže koliko je izgubio, pa se isprazni; ispod 30 % portret i traka pulsiraju crveno; na udarac traka zadrhti;
  - traka besa sa natpisom, tanak gard, vino, dukati i vila.
- **Zadatak:** desno, kao spisak zadataka.
- **Traka veština:** dole u sredini, sa kvadratnim poljima, tasterom u uglu i odmorom koji se prazni. Na telefonu je gore u sredini, u dva reda.
- **Megdan:** okvir bosa gore u sredini.
- **Protivnici:** traka u zlatnom ramu, sa tragom udarca, podeocima i zlatnim rombom za elitne.
- Spisak tastera na dnu je sklonjen: tasteri su na ikonama, a ceo spisak je u meniju Kontrole.

## Testovi

Ceo lanac za objavu (`npm run check && npm test && node animation-tests.mjs && node simulation-test.mjs`) prolazi; bot iz simulacije prelazi igru do pobede.

- `napredak-test.mjs` (u `npm test`): ekonomija, odmor teškog udarca, stepeni, kovač i vrač (nestaje, čini, senke, odbijena čini, smrt).
- Usklađeni testovi:
  - cene kod trgovca;
  - pola plena iz kovčega;
  - 20 dukata za slova;
  - razmak između teških udaraca;
  - redosled pohoda sa Vračevom jarugom;
  - bot simulacije, koji dok K miruje udara nizom (J).
