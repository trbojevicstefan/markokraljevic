# Marko — Tri srca Kačanika

Igriv prvi nivo 2D epskog platformera na srpskom. Vanilla JavaScript; svet se crta u Canvas 2D sloj, a Three.js (lokalna kopija u `dist/vendor/three/`, bez CDN-a) ga sklapa u scenu sa dubinom, svetlom i post-efektima. Bez WebGL-a igra automatski prelazi na čist 2D prikaz. Grafika je generisana ugrađenim Imagegen alatom i obrađena lokalnim sprite-gen 4.0.0.

## Pokretanje

Online igra: https://trbojevicstefan.github.io/markokraljevic/

GitHub Pages objavljuje isključivo `dist/` kroz `.github/workflows/pages.yml`. Svaki push na `main` prvo proverava sintaksu, fiziku, animacije i prolazak nivoa, zatim objavljuje igru. Svi runtime resursi, uključujući Three.js, koriste relativne lokalne putanje.

Node.js 22 ili noviji:

```sh
npm start
```

Otvori http://127.0.0.1:4173. `dist/` je kompletna statička igra i može se servirati bilo kojim HTTP serverom. Pokretanje dvoklikom preko `file://` nije podržano zbog ES modula i JSON manifesta.

## Prikaz i razmere

- `dist/assets/sprite-rig.json` (pravi ga `python build-sprite-rig.py`): jedna razmera po liku za sve animacije, izvedena iz veličine glave u svakom listu, plus tačka stopala i sidro po kadru. Marko je 128 jedinica visok u svakoj pozi (stajanje, trk, udarac, skok, vino, Šarac); Turci su oko 90% njegove visine, Musa je džin.
- Stopala stoje na liniji mahovine kamenog druma; senke prate tlo i smanjuju se u skoku.
- `dist/stage3d.js`: oslikana pozadina sa sunčevim zracima, maglom u klisuri i bojom po poglavlju (sumrak i munje na megdanu), 3D lišće ispred i iza likova, prašina u svetlu, vilinske iskre, žar, dubina ponora, bloom samo na magiji i varnicama, talasi udara, hromatska aberacija na odbijanju, vinjeta i zrno.
- „Smanjeno podrhtavanje i efekti“ u podešavanjima gasi talase udara, aberaciju i deo čestica.

## Brzina prikaza

Sve ovo menja samo crtanje. Logika igre i dalje ide u koracima od 1/120 s, kao i pre.

- **Kvalitet „Automatski“** ima tri nivoa:
  - 0: pun prikaz;
  - 1: manja slika, isti efekti;
  - 2: isto što i „Brže“.
- Telefon, slab procesor i softverski prikaz kreću od nivoa 2, a integrisana grafika (Intel, Radeon Graphics) od nivoa 1.
- Ako tokom igre većina frame-ova tri sekunde ide sporije od ~48 FPS, igra sama pređe na sledeći niži nivo. Spuštanje se pamti za tu grafičku karticu (`localStorage` ključ `marko-perf-v1`). „Visok kvalitet“ u podešavanjima uvek ima prednost.
- **Glatko kretanje.** Na 60 i 120 Hz ekranima sitne razlike u vremenu frame-ova se poravnaju, pa nema naizmeničnih 1 i 3 koraka. Na 75, 144 i 165 Hz kamera i likovi se crtaju između poslednja dva koraka, a prave vrednosti se vraćaju odmah posle crtanja. `?smooth=0` isključuje oba.
- **Manje kopije sprite-ova.** Kad se lik crta na pola veličine ili manje, uzima se kopija sprite sheet-a na pola rezolucije, napravljena van glavne niti. Tako browser u memoriji drži četiri puta manje piksela.
- **Merač za testere: F9 ili `?fps` u adresi.** Pokazuje:
  - FPS i najsporiji frame;
  - koliko traje rad jednog frame-a;
  - trzaje u poslednjih 10 s;
  - grafičku karticu, nivo kvaliteta i rezoluciju.

## Zvuk

- **Glasovi** (`dist/assets/voice/`, pravi ih `python make-voice-lines.py`, treba `ELEVENLABS_API_KEY`): ElevenLabs `eleven_v4`. Marko je glas „Tuco" (vulgaran, psuje, na R viče „Marš u pičku materinu, Turci!"), Musa je „Slobodan", Ravijojla „Ida" (ženski, srpski), Turci viču na turskom. Zamah topuza prati stenjanje („Hah!", „Aaaaahh!") umesto „swoosh" zvuka, a Marko dobacuje Turcima kad su blizu. Igra bira nasumičnu repliku iz grupe (`kill_*`, `hurt_*`…), jedan lik govori jednu repliku u isto vreme, a muzika se utiša dok neko priča.
- **Efekti** (`dist/assets/sfx/`): udarci, metal, štit, koraci, sablja i pad tela iz Kenney CC0 paketa „Impact Sounds" i „RPG Audio" (licenca u `KENNEY-LICENSE.txt`); zamah, luk, magija, grom, kopita, gutljaj i rog su sintetisani u `make-audio.py`.
- **Muzika** (`dist/assets/music/`): komponovana i renderovana kodom u `make-audio.py` (gusle, tapan, hor, gudači, rogovi, reverb), bez spoljnih servisa. „Drum" (92 BPM, d-mol harmonski, 94 s) za nivo i meni, „Megdan" (124 BPM, frigijski dominantni, 62 s) za Musu; obe se vrte bez šava.

## Paket animacija 02 u igri

- **Novi protivnici:** akindžija (brz, juriša ili skače dvema sabljama), oklopnik (lak udarac odbija oklop; udar čekićem u tlo ili nalet štitom), palikuća (baca zapaljene baklje koje pale tlo, izbliza bljuje vatru). Osam novih protivnika raspoređeno je kroz I, II, III i V deonicu.
- **Marko:** Vihor (F) koristi osam nacrtanih faza okreta; teški udarac (K) koristi `marko-charged`: drži K da zadržiš pun zamah: šteta raste do ~3,4× (pun zamah ubija i štitonošu). Ako punjeni udarac ili super (R) zada smrtni udarac, protivnik odleti kroz vazduh, vrteći se, i klizne po tlu ostavljajući trag krvi; Musa takođe odleti ako ga dokrajčiš tako.
- **Orlovi** lete nebom sa paralaksom; **mangali** gore duž II, V i VI deonice.
- **Krv** šiklja na svaki pogodak, kaplje i ostaje na tlu, a pod palima se širi bara. Isključuje se u podešavanjima („Krv“).
- **Mobilne kontrole:** ikonice; topuz u uglu, ostale akcije u dva luka oko njega; manje strelice za kretanje.

## Paket animacija 03 u igri (pokret i borba)

- **Niz od 3 udarca (J, J, J):** vodoravni, povratni i završni udar o tlo (×1,8 štete). Pauza duža od ~0,35 s vraća niz na početak.
- **Kolut (Shift):** 0,34 s, neranjiv celim tokom, na zemlji koristi `marko-roll`.
- **Primljen udarac:** lak pogodak pušta trzaj; udarac od 20+ štete obara Marka (pad, ležanje, ustajanje, ~1,25 s bez kontrole i neranjiv).
- **Kontra:** posle savršenog odbijanja (L) Marko sam kontrira aperkatom i drugim udarcem (2 pogotka), i protiv Muse.
- **Udar nadole (S + J u skoku):** brz pad i udar o tlo koji pogađa sve oko Marka.
- **Ivica i zid:** u padu kraj ivice kamenog bloka Marko se uhvati i popne; u skoku uz bočnu stranu bloka (drži smer ka bloku) klizi niz nju, a Space ga odbacuje od zida.
- **Protivnici:** svi imaju mirovanje i trzaj na udarac; akindžija, oklopnik i palikuća imaju i hod/trk i smrt; Musa ima mirovanje i trzaj.
- Razmere svih 32 klipa usklađene su po visini tela sa postojećim likovima (`PACK3`/`PACK3_FIX` u `build-sprite-rig.py`).

## Pohodi (novi nivoi)

- Posle Kačanika: dugme **Pohodi** u meniju i „Sledeći pohod“ na kraju megdana. Šest nivoa iz crtačevog `art/world-pack-01/levels.json`: Kosovsko selo, Klisura Ibra, Ravijojlina šuma, Manastirski vis, Opsednuta tvrđava, Zimski prevoj.
- Pozadina su crtačevi slojevi (nebo, daleko, sredina, blizu) sa paralaksom iz `levels.json`; objekti iz plana nivoa crtaju se čim im slika postoji. Svaki predeo ima svoj izgled (tvrđava u sumraku sa munjama i muzikom megdana, šuma sa svicima, prevoj sa snegom).
- Protivnici se raspoređuju po predelu (npr. selo: sabljaši, strelci, akindžije; tvrđava: oklopnici i palikuće), uz vino, travke i zapis legende na najvišoj platformi. Cilj je barjak na kraju puta; pređeni pohodi se pamte.
- **Novi asseti:** `python sync-world.py` prebacuje sve gotove slike iz `art/world-pack-*` u `dist/assets/world/` kao WebP (49 MB PNG → ~10 MB) i pravi spisak fajlova; nedostajuće slike igra preskače bez grešaka.

## Dopuna 10: bitke, putnici, Musa po pesmi, bosovi

Crteži su iz Codexove liste `art/world-pack-03/DOPUNA-10.md` (24 klipa).

**Kačanik**
- **Pojačanje dolazi odnekud.** Turci iz talasa utrčavaju sa ivice ekrana ili skaču sa stena. Pre svakog talasa čuje se rog i turski poklič, a na ivici ekrana piše odakle dolaze.
- **Putnici.** Starac, trgovac, majka sa detetom i kaluđer čekaju kraj druma jer im Musa ne da da prođu. Starac priča Marku svoju muku. Putnici zatim idu za Markom, ne prilaze borbi, a u II poglavlju beže kroz Zatočenu kapiju dok Marko zadržava talase. Odbrana se završava tek kad svi pređu.
- **IV poglavlje, bitka na konju.** Musini ljudi stoje na drumu. Šarac u galopu gazi pešake. Štitonoša zaustavlja konja, pa ga treba oboriti topuzom sa sedla (J ima svoju animaciju).
- **Musa kao u pesmi.** Prvo koplja s konja: Marko na Šarcu, Musa na vrancu. J kad prolazi, Space preskače koplje, a udarac je moguć i dok Musa okreće konja. Tri pogotka lome koplja. Onda sablje (prvo srce, širok zamah sabljom), pa topuzi (drugo i treće srce). Kad pukne poslednje srce, Musa ne pada nego ide u koštac: obori Marka, snaga ga napušta, Ravijojla ga kori iz oblaka, Musa se osvrne, a E izvlači nož zatajac. Zato je Marko u pohodima ranjen i snagu vraća pohod po pohod.

**Bosovi u pohodima: svaki se bori drugačije, na svom terenu sa platformama**
- **Hasan-aga Oklopnik** (tvrđava): zaleće se kao Klompa iz *Prince of Persia: The Two Thrones*. Navuci ga na stub; dok je ošamućen, oklop ne štiti.
- **Akindžijski beg** (prevoj): na konju, kao general Uvishka iz *The Lost Crown*. Skoči na gredu ili odbij kad prolazi, udri dok okreće konja, obori ga, pa se bori sa njim peške.
- **Ognjeni aga** (podrum): razlije ulje i zapali ceo pod. Spas su grede; posle požara je zadihan.
- **Bajraktar** (rudnik): dok barjak stoji na steni, ne prima udarce i zove janičare. Barjak pada posle tri udarca.
- **Janičarski aga** (reka): skače sa grede na gredu i napada sabljom odozgo, kao Shahdee iz *Warrior Within*.
- **Arapin** (ruševine, novi lik iz pesme o svadbarini): baca koplja sa vrha kule. Odbijeno koplje ga ošamuti. Na pola snage skoči dole, a povremeno se vraća na kulu.
- **Tufekdžija-baša** (močvara, novi): gađa sa kule, a crvena linija najavljuje pucanj. Kamenje služi kao zaklon. Kad se Marko popne, skoči dole.
- **Lovac-aga** (šuma, novi): rogom zove čopor pasa sa obe strane.

**Glasovi:** 77 novih replika.
- Svaka vrsta Turaka ima svoj glas na turskom: janičari, akindžije, oklopnici, palikuće i strelci. Svaki ima pokliče, napad, bol, blok, rugalice i smrt.
- Svaki aga ima svoj glas na srpskom za uvod, rugalicu, razjarenost i smrt.
- Putnici imaju svoje glasove, a Musa i Ravijojla imaju replike za nove etape.
- ElevenLabs je ostao bez kredita posle 63 replike. Ostalih 14 izgovorio je lokalni model, sa glasom svakog lika iz njegovih ElevenLabs snimaka kao uzorkom.

`node battles-test.mjs` stvarnim ulazima proverava talase, putnike, galop, sve Musine etape i svakog bosa (45 provera).

## Dopuna 11: dokrajčivanje, kosturi, zagonetke, novi bosovi, muzika bosova

Crteži su iz `art/world-pack-03/DOPUNA-11.md`.

**Borba**
- **Dokrajčivanje (U, na džojstiku Y).** Kad je Turčin ošamućen, slomljenog garda ili skoro mrtav, iznad njega se na trenutak pojavi „U · DOKRAJČI“. Ako stigneš da pritisneš, Marko zamahne topuzom u visini vrata: glava odleti i odskače po tlu, iz vrata šiklja krv, a telo padne bez glave.
- **Krv** pada tamo gde stvarno padne: na gredu, na izbočinu ili na drum, nikad ne ostaje u vazduhu. Na ivici se sliva niz kamen i kaplje na tlo ispod.
- **Leševi ostaju.** Posle 10 sekundi istrunu u kostur koji ostaje na tlu: janičar sa turbanom, oklopnik sa šlemom, strelac sa tobolcem, ili kostur bez lobanje za one kojima je odletela glava.
- **Drugi potez svakog neprijatelja:**
  - janičar ubada iz dugog iskoraka;
  - štitonoša juriša štitom;
  - kopljanik seče po nogama, pa ga moraš preskočiti;
  - strelac šutne izbliza i odskoči;
  - tufekdžija udara kundakom;
  - akindžija se vrti sa dve sablje;
  - oklopnik zgrabi Marka i baci ga preko ramena;
  - palikuća baci lonac sa vatrom koji zapali širok krug.
- **Musa ima još poteza:**
  - kao u pesmi baca topuz u oblake: senka prati Marka, topuz padne, a Musa je za to vreme bez oružja i otvoren;
  - tresak nogom šalje talase po tlu;
  - riče kad mu pukne srce;
  - blokira drškom topuza i svaki treći put odgurne Marka.
- **Ravijojla pravi mostove od svetla** preko provalija u I poglavlju, da putnici mogu da pređu.

**Pohodi: duži, sa ručno napravljenim zagonetkama i manje neprijatelja na putu**
- **Zvona** (Manastirski vis): udari tri zvona redom koji pokazuje freska. Pogrešno zvono doziva stražara.
- **Ogledala** (Pećina): udarcem okreni tri bronzana ogledala da sunčev zrak stigne do kristala.
- **Teg** (Rudnik): gvozdeni sanduk na levoj vagi podiže desnu, a sa njom i Marka do izbočine.
- **Vilinsko kolo** (Ravijojlina šuma): ponovi redosled kojim svici pale kamenove, pa preko provalije nastaje most od svetla.
- **Barut** (Opsednuta tvrđava): doguraj bure baruta do gvozdenih vrata, popni se i sruši mangal na njega, pa se skloni.

**Novi bosovi, svaki sa svojom arenom**
- **Aždaja** (pećina): bljuje vatru, pa se skloni iza kamena ili čučni. Kad posle ujeda zarije glavu u zemlju, udri.
- **Dželat** (manastir): sekirom cepa grede pod Markom; kad mu se sekira zabije u zemlju, udri.
- **Đemo Brđanin** (selo): baca buzdovan koji se vraća, a bez njega je ranjiv.
- **Tri janičara** (oranje): kad jedan padne, ostala dvojica se razjare.
- **Kopljanik-baša** (klisura): gađa kopljem izdaleka i preskače Marka kad mu priđe.

**Dopuna 12**
- **Vilinski kamenovi na provalijama u I poglavlju.** Putnici čekaju na ivici. Kad Marko probudi kamen (E), diže se kameni most (crtež `most-vila-*`) i putnici pređu. Isti kamenovi i mostovi su i u III poglavlju. Ako Marko ode dalje bez njih, putnici ga sustignu u II poglavlju.
- **Nisko bacanje.** Topuz bačen iz čučnja (S + I) leti tik iznad zemlje.
- **Duže borbe sa bosovima.** Svaki bos u pohodima ima oko 2,6 puta više snage. Na 30% ulazi u treću fazu: brži je i češće koristi poseban napad, Bajraktar ponovo podiže barjak, Arapin baca koplja u salvama, a Lovac pušta četiri psa. Musa ima 40% više snage, a srca mu pucaju na trećinama.
- **Prepreke koje Šarac preskače** su sada slike: kola, balvani, kolje, odron i bureta (`prepreka-*`).

**Dopuna 13**
- **Četiri dokrajčivanja, jedno za svako dugme na džojstiku:**
  - X / J: odsecanje glave;
  - Y / K: smrskavanje odozgo, u zemlju;
  - B / Shift: nizak zamah topuzom mu odvali noge;
  - A / Space: skok i gaženje, koje ošamuti one oko njega.
- **Kada se nude:** samo kad je neprijatelj ispod 25% snage, nikad dok je zdrav. Ponuda dođe u otprilike polovini slučajeva, a posle svakog dokrajčivanja sledeće ne može 7 sekundi.
- **Rvanje na zemlji:**
  - janičar može da skoči na oborenog Marka sa nožem;
  - oklopnik ga pritisne i davi;
  - pas ga obori i ujeda.
  Brzo udaraj J (X) da se otmeš: tako protivnika odbaciš i udariš kontrom. Dok traje, ostali neprijatelji čekaju.
- **Palica na džojstiku:** blag nagib je hod, pun nagib je trk. **Vino u hodu** ima svoju animaciju.

**Trening soba** · https://trbojevicstefan.github.io/markokraljevic/trening.html (ili `index.html?trening`)
- Neprijatelji stalno izlaze, po trojica u isto vreme.
- Svaki može odmah da se dokrajči, bez čekanja i bez obzira na snagu.
- Tasteri 1–9 biraju vrstu neprijatelja: janičar, štitonoša, strelac, akindžija, oklopnik, palikuća, kopljanik, tufekdžija, pas. Taster 0 ih pušta sve redom.
- N bira da li neprijatelji napadaju ili samo stoje. Markovo zdravlje se stalno vraća.
- Dokrajčivanja posle provere u sobi:
  - smrskavanje (K): glava pukne pod topuzom i telo se sruši bez nje;
  - noge (Shift): nizak zamah topuzom u visini kolena; noge odlete, a telo padne na batrljke i ostane da leži, dok krv šiklja (Markov zamah je Codexov `marko-finisher-legs`);
  - gaženje (Space): protivnik prvo padne, a Marko skoči i zakuca ga topuzom. Visina skoka se dodaje u kodu, jer crtež svaki kadar stavlja na stopala.

**Dopuna 14–18**
- **Y / K iz skoka:** Marko visoko skoči, zabaci topuz iza glave i udari pravo u glavu, kao kad se cepaju drva (Codexov `marko-finisher-skull`). Visina skoka u trenutku udarca se računa prema visini svakog neprijatelja.
- **Polovine posle "bez nogu"** leže u mrtvoj pozi: gornji deo i noge se seku iz poslednjeg kadra pogibije svakog neprijatelja.
- **Barjaci se vijore:** srpski (beli orao) i osmanski (zulfikar) su Codexove animacije od 8 kadrova u petlji (`barjak-*-vijori`). Svaki barjak u igri je jedna slika po kadru. Dok se te slike ne učitaju, služi talas iz ravne tkanine, iscrtan jednom u 20 kadrova.
- **Đule** je Codexova slika (`djule`): mat liveno gvožđe koje se okreće dok se kotrlja.
- **Turski top:**
  - Gde je: poglavlje II, poglavlje V i pohodi Tvrđava, Prevoj i Reka.
  - Topčija pali fitilj. Kad cev ostane ravna, đule se kotrlja po zemlji i treba ga preskočiti. Kad se cev podigne, đule leti u visini glave i treba se sagnuti.
  - Đule obara Turke i razbija sanduke, a zid ga zaustavlja.
  - Top ućutkuješ tako da ubiješ topčiju ili da ga razbiješ topuzom.
- **Vilinski mostovi** stoje u ravni sa tlom, pa se na njih prelazi hodom, bez skoka. Nemaju više sjaja.
- **Manje sjaja:**
  - sloj sjaja i bloom su slabiji, oreoli upola manji;
  - natpisi u svetu nemaju zlatni sjaj;
  - meni nema zlatna svetlucanja.

**Dopuna 19: nove Markove animacije**
- **Skok iz trka** (`marko-run-jump`): kad skoči u punom trku, ide u širokom raskoraku.
- **Dozivanje vile** (`marko-call`): podigne ruku ka nebu dok zove Ravijojlu.
- **Podizanje** (`marko-pickup`): klekne i uzme deo srca, zapis, ključ ili čudo.
- **Na ivici provalije** (`marko-teeter`): kad stoji na samom rubu okrenut ka provaliji, maše rukama da ne padne.
- **Drugo dugo stajanje** (`marko-idle-4`): obriše znoj, pogleda preko ramena, popravi ogrtač. Smenjuje se sa topuzom na ramenu, koji sada ostaje na ramenu oko 5 sekundi: kadrovi na ramenu se vrte napred-nazad, pa se topuz glatko spusti.
- **Odbačaj od đuleta** (`marko-blasted`).
- **Guranje sanduka i bacanje topuza** su bili nacrtani krupnije od ostalih Markovih animacija. Sada su smanjeni, pa je Marko iste veličine kao inače.

**Dopuna 20–22**
- **Visenje na ivici:** Marko visi dok ne pritisneš W ili Space. Taster ka zidu, ako je bio pritisnut još od skoka, mora da se pusti i pritisne ponovo. S ga pušta sa ivice.
- **Marko puca iz topa** (pohod Tvrđava; u trening sobi T):
  - E uzima top; W/S menjaju ugao cevi, A/D dodaju ili oduzimaju barut, J ili Space puca.
  - Tačkasta putanja pokazuje let đuleta, a krug mesto gde pada.
  - Horda dolazi u tri talasa, a đule rasprsne sve oko sebe.
- **Palikuća gori od svoje vatre:** baklju vratiš odbijanjem ili udarcem topuza. Pogođeni se zapali i zdravlje mu curi.
- **Ravijojla:**
  - Codexov let, bacanje čini i isceljenje (`vila-let`, `vila-carolija`, `vila-isceljenje`);
  - traka svetla do cilja i prsten od runa na cilju (`magija-zrak`, `magija-bljesak`);
  - prilet ka ekranu (`vila-spreda`);
  - Marko je doziva u hodu (`marko-call-walk`).
- **Slavlje:** kad padne bos, Marko digne topuz i slavi. Posle Muse slavi, pa odhramlje ranjen (`marko-wounded-walk`).
- **Voda i skela:** reka ide do obala, sa talasima i penom. Codexova skela pluta u njoj.
- **Kontrole:** ekran sa nacrtanim džojstikom; dugmad svetle dok ih pritiskaš.
- **Riznica:** podeljena na kartice. Veštine su kartice sa tasterima i opisom.
- **Kadrovi priče:**
  - na početku svakog poglavlja glavnog pohoda i posle megdana dolazi minijatura sa par rečenica;
  - minijature: `minijatura-drum`, `kapija`, `trag`, `zalet`, `opsada`, `ranjen`;
  - Enter ili A ide dalje, Esc ili B preskače.

**Muzika bosova:** 14 tema iz `make-audio.py --bosses`, po jedna za svakog bosa i jedna za Musin megdan kopljima. Svaka ima svoj lestvični modus, tempo, glavni instrument (gusle, rog ili hor) i ritam bubnjeva (težak, galop, marš, dvoboj, napet). Tema se učitava tek kad se otvori arena njenog bosa.

**Provere**
- `node battles-test.mjs`: 106 provera.
- `node draw-test.mjs` iscrtava igru bez ekrana, kroz Kačanik, Musine etape, dokrajčivanje i svih 13 pohoda, i hvata greške u crtanju.

## Noć 10/11. novembar: megdan, priča po pesmama, novi nivoi (grana `noc-poliranje`)

Ceo spisak sa onim što nije provereno je u `JUTARNJI-IZVESTAJ-2.md`; pesme i beleške po pesmama su u `pesme/`.

- **Megdan:** telo neprijatelja se ne prolazi; bosovi imaju gard (lome ga teški udarci), kontru na tri laka udarca, tri čina sa novim potezima i koštac.
- **Redosled:** pohodi idu po Markovom životu, megdan sa Musom je posle devetog pohoda, Đemo Brđanin dolazi posle Muse.
- **Novi nivoi:** Urvina planina (uspon i kraj pesme), let sokola na početku Noćne močvare, tajni „San Kraljevića Marka" (na mapi ukucaj `MARKO`).
- **Guslar:** ceo snimak od 5 min 12 s; odbrana guslara u Klisuri; guslar sa stihovima svog kraja u svakom pohodu.
- **Dukati:** trgovac pred svakim megdanom; zadužbina i sofra kod kovača. **Barjaci** unutar pohoda vraćaju palog Marka bez ponavljanja nivoa.
- **Potera za vilom** na Šarcu otvara Ravijojlinu šumu; u Manastiru Marko presuđuje na kome je carstvo.
- **Razgledanje:** `index.html?scout` otvara sve pohode bez neprijatelja, sa slobodnim kretanjem i ispisom položaja. `node megdan-bot.mjs` meri trajanje megdana.
- **Međukadrovi:** `python smooth-anims.py` računa lokalno jedan kadar između svaka dva nacrtana (trk i hod); izlaz je `dist/assets/smooth/` i `dist/assets/sprite-smooth.json`. Posle novog izvoza tih listova pusti ga ponovo.

## Kontrole

| Taster | Radnja |
|---|---|
| A / D ili strelice | Kretanje |
| Space / W / gore | Skok |
| J | Brzi udarac topuzom |
| K | Teški udarac, razbijanje garda |
| L | Drži za blok; pritisni u pravom trenutku za odbijanje |
| S / strelica dole | Čučanj, sporije kretanje i izbegavanje strela |
| R | Super udarac pri 100 junačkog besa |
| Shift | Izmicanje |
| E | Ravijojla / aktiviranje kamena / uzjahivanje Šarca |
| F (drži) | Vihor: Marko se vrti sa topuzom i udara sve oko sebe; traži 25 besa i troši ga dok se vrti |
| Q | Vino: 12 s, +30% štete, 20% manje primljene štete, +18 zdravlja |
| Esc | Pauza |

Dodirne kontrole se pojavljuju na uređajima sa primarnim touch pokazivačem. Podešavanja nude lakši režim, jačinu zvuka i manje podrhtavanja. Igra se automatski pauzira pri gubitku fokusa. Kontrolne tačke i podešavanja čuvaju se u localStorage, bez naloga ili server baze.

## Sadržaj

Šest povezanih deonica: Drum junaka, Zatočena kapija, Vilinski trag, Šarčev zalet, Poslednji barjak i Tri srca Kačanika. Ukupno 55 čuvara kroz osnovne susrete i devet talasa pojačanja; tri vilinska mosta; upravljiv Šarac; tri opciona zapisa koji povećavaju maksimalno zdravlje; završni megdan sa tri faze, dva zamaha i talasom po tlu.

Osmanski odred je antagonistička vojska u ovoj fikcionalnoj priči. Musa je samostalan odmetnik. Igra koristi srednjovekovne crvene barjake i stilizovane bele dvoglave orlove, a nije precizna istorijska rekonstrukcija. Istorijski Marko bio je osmanski vazal; epika i autorske mehanike jasno su objašnjene u meniju „O legendi“.

## Provere

```sh
npm run check
npm test
node simulation-test.mjs
```

Devet testova obuhvata raspored nivoa, kontrolne tačke, sudare, oba stanja vilinskog mosta, skokove peške i na konju, jedinstvene ID-jeve i pristup kamenovima. Simulacija koristi stvarnu logiku igre sa ulazima testnog igrača, bez menjanja položaja ili zdravlja. Završeni prolazak: oko 5:35, 55 poraženih čuvara, svi delovi i boss završeni. To nije ljudski playtest niti garancija najbržeg mogućeg prolaska; prvi ljudski prolazak zavisi od veštine.

Browser provere: početni meni, kretanje, borba i ubistvo neprijatelja, vino, jahanje/skok, otključavanje mosta, vilinski bljesak nad Musom, pauza, vraćanje sa kontrolne tačke i mobilni meni bez horizontalnog prelivanja. U proveravanim putanjama nije bilo JavaScript izuzetaka.

## Grafika i ograničenja prve verzije

`dist/assets/gorge.png` — panorama klisure. `dist/assets/cast/` — likovi i modularni objekti. `dist/assets/marko-run.png` i JSON manifest — šest frejmova trčanja. `art/marko-run/` čuva referencu, izvorni strip, recept, izdvojene frejmove, atlas i izveštaj sprite-gen provere bez upozorenja. `art/sources/` čuva izvorne listove.

Markovo trčanje i zamah koriste po šest kadrova. Šarac sa Markom u sedlu koristi šest kadrova galopa i četiri poze mirovanja, odraza, leta i doskoka. Ravijojla ima šest kadrova pojavljivanja i čaranja, putanju do cilja i sinhronizovan efekat čarolije. Njeno puno telo se vidi na poziv E, a tokom odmora predstavlja je svetleća tačka. Priprema, aktivni deo i povratak zamaha odvojeni su: pogodak je moguć samo u aktivnom delu. Markov skok i vino, Musin zamah, napadi sabljaša i štitonoše, i ispaljivanje strele sada koriste zasebne sekvence od po šest kadrova. Hod neprijatelja koristi zasebne nacrtane cikluse; mirovanje, odbijanje i sporedni efekti koriste proceduralnu animaciju. Animacije nisu motion-capture niti produkcijski verifikovane kao savršene. Zvuk je proceduralan preko Web Audio; nema snimljenih glasova ili orkestarske muzike. Ovo je dovršen igriv prvi nivo, a ne završna produkcijska igra.

## Vizuelni promptovi i obrada

Smrt sada ima 30 posebnih kadrova: po šest za Marka, Musu, sabljaša, štitonošu i strelca. Pad se ne ponavlja; telo se smiruje na tlu. Ekrani poraza i pobede čekaju 1,55 sekundi da se završni kadar vidi. Čuvari ostaju na zemlji pa blede; Marko i Musa ostaju do promene ekrana. Pauza zamrzava animaciju i čestice. Šarac preživljava Markov poraz.

Čučanj, blok i super udarac imaju još 18 nacrtanih kadrova. Čučanj smanjuje koliziju sa 112 na 64 jedinice. Frontalni blok smanjuje štetu za 80%, troši gard i može da se slomi; napadi iza leđa ga zaobilaze. Bes se puni pogocima, primljenom štetom i preciznim odbijanjem. Super udarac troši 100 besa, ima zasebnu pripremu/kontakt/povratak, razbija gard i pravi zlatne varnice i prašinu. Vrednosti garda i besa prikazane su u HUD-u; nove radnje postoje i na dodirnim kontrolama.

Izvori za ovu doradu: `art/death-combat-prompts.json`, osam odgovarajućih direktorijuma u `art/`, PNG/JSON atlasi u `dist/assets/`. Generisano ugrađenim Imagegen alatom i obrađeno sprite-gen ekstraktorom bez upozorenja. `simulation-test.mjs` proverava smrt, prizemljenje, odložene ekrane, čučanj ispod strele, blok sprijeda/pozadi, lom garda i cenu/tajming super udarca.

Dorada kretanja: sabljaš, štitonoša, strelac i Musa imaju po šest različitih nacrtanih kadrova (`*-run.png`). Ciklus zavisi od pređene udaljenosti; staje pri zaustavljanju, omamljenosti i pripremi napada. Nema pomeranja cele slike gore-dole. Postojeće skale i sidra Marka, Šarca, Ravijojle i prethodnih animacija ostaju neizmenjeni. `node animation-tests.mjs` proverava 24 kadra i oslonac stopala. Mirovanje i reakcija na pogodak koriste proceduralne pokrete; pad koristi zasebne nacrtane kadrove.

Izvori novih ciklusa: `art/{sword,shield,archer,musa}-run/raw/run.png`, recepti `sprite-request.json`, promptovi u `art/locomotion-prompts.json`. Ugrađeni Imagegen → sprite-gen `prepare`, `extract`, `compose-atlas` → postojeći `build-sprite-rig.py`. Ekstraktor je za sva četiri ciklusa završio bez upozorenja.

Generisano ugrađenim Imagegen alatom, bez zasebnih API ključeva. Kreativni briefovi: (1) panoramska Kačanička klisura, oslikani/cel-shaded stil, zlatne hrastove krošnje, tirkizna reka, srednjovekovni manastir i crveni barjaci sa belim dvoglavim orlom; (2) transparentan list sa Markovim mirovanjem, napadom i skokom, Šarcem, Ravijojlom i Musom; (3) transparentan list sabljaša, štitonoše, strelca, hrasta, kamene platforme i orlovske kapije; (4) šest uzastopnih bočnih poza Marka u trku, uz istu referentnu ilustraciju, na čistoj zelenoj pozadini.

Obrada listova koristila je `sprite-gen slice-sheet --chroma-key none --alpha-floor 64 --grid 3x2 --cell-width 384 --cell-height 384 --baseline-y 370 --target-height 350 --fit contain`. Trčanje: `prepare` → ugrađeni Imagegen za jedan red → `extract` → `compose-atlas` → `inspect`. Generisanje reda je urađeno direktnim ugrađenim alatom umesto CLI `gen-set`; ekstrakcija i atlas koriste originalne sprite-gen faze. Runtime čita `frame_layout` iz manifesta.

## Izvori

- https://sr.wikisource.org/sr-el/Марко_Краљевић_и_Муса_кесеџија
- https://sr.wikisource.org/sr-el/Марко_Краљевић_и_вила
- https://www.enciklopedija.hr/clanak/kraljevic-marko
- https://github.com/aldegad/sprite-gen — Apache-2.0, lokalna alatka za obradu grafike; nije runtime zavisnost.

Nova animaciona grafika i izvorni promptovi: `art/animation-prompts.json`; atlasi `dist/assets/mounted-run.png`, `mounted-jump.png`, `fairy-cast.png`, `marko-attack.png` sa odgovarajućim manifestima. Svi su generisani ugrađenim Imagegen alatom, izdvojeni originalnim sprite-gen komponentnim ekstraktorom i poravnati opcijom centroid.

## Pokretanje dvoklikom

Na Windowsu otvori `Igraj.cmd`. Potreban je Node.js 22+. Launcher pokreće lokalni server i tek kada je spreman otvara browser; ako igra već radi, otvara postojeću instancu. Paket `Marko-Tri-srca-Kacanika.zip` sadrži igru i launcher. Za animacione izvore vidi `art/combat-animation-prompts.json`.
