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
  - grafičku karticu, nivo kvaliteta i rezoluciju;
  - međukadrove: koliko sprite-ova je trenutno međukadar, koliko je listova učitano i koliko MB zauzimaju.
- **Međukadrovi i nivo kvaliteta.** Listovi međukadrova se ne čekaju pri pokretanju. Učitavaju se tek kad ih neki pokret prvi put zatraži; dotle se crta nacrtani kadar. Na nivou 2 igra koristi samo međukadar na pola puta, pa učitava trećinu slika. List koji se 45 s ne koristi pušta se iz memorije, a preko 200 MB (64 MB na nivou 2) prvo se puštaju najduže nekorišćeni.

## Glatke animacije

Nacrtanih kadrova je malo (većinom 6 po klipu), pa se između njih crtaju izračunati međukadrovi i jeftin proceduralni sloj. Sve je samo crtanje: tajming udaraca i logika se ne menjaju. `?anim=0` u adresi isključuje sve ovo radi poređenja (samo nacrtani kadrovi).

- **Tri međukadra po koraku.** `python smooth-anims.py` optičkim tokom (OpenCV DIS) računa kadrove na 1/4, 1/2 i 3/4 puta između svaka dva kadra koje igra pokazuje jedan za drugim. To obuhvata i sekvence mirovanja koje skaču preko kadrova (`FOE_IDLE`, `IDLE_SEQ`). Važi za sve animacije u igri: Marka (trk, hod, udarci, kombo, skok, kolut, blok, vino, pogodak, smrt, Šarac, sablja), vojnike, Musu, šampione, putnike, vilu, ptice, vatru i koštac. Obrađeno je 319 klipova, a 291 ih koristi međukadrove; lica šampiona dobijaju i parove iz sekvenci mirovanja vojnika.
  - Par koji tok ne prati (ud prelazi preko tela, preveliki zamah) ili koji bi ispao providan (dupla slika) ne dobija međukadrove. Tu igra drži nacrtani kadar.
  - Bez međukadrova je samo list kostura (`kosturi`: svaki kadar je drugi kostur, a ne pokret) i 28 klipova u kojima tok ne prati ni jedan korak.
  - Gde igra pomera ili uvećava svaki kadar posebno (vihor sa sabljom, spavanje i buđenje), pomeraj i veličina idu zajedno sa međukadrom.
  - Posle novog izvoza listova pusti skriptu ponovo; `python smooth-anims.py --report` daje tabelu, a `--sheet <klip> <izlaz.jpg>` sliku za oko.
- **Tempo.** Poza zna koliko je daleko do sledećeg kadra, pa se međukadar bira tačno, bez kašnjenja. Kod udarca priprema i kontakt drže celo svoje vreme, bez međukadra; međukadrovi su samo u zamahu ka pripremi i u oporavku. Kadrovi koje bira stanje (skok po brzini i sl.) prolaze kroz svoje međukadrove za najviše 70 ms.
- **Proceduralni sloj:**
  - blago istezanje pri odskoku (i Sokolovom krilu) i sabijanje pri doskoku, jače posle dugog pada;
  - nagib tela u trku, po brzini;
  - pretapanje od 70 ms pri prelazu iz klipa u klip (stara poza bledi ispod nove). Ne radi se u udarac, pri pogotku ni pri okretu;
  - trag topuza po luku nacrtanog zamaha svakog udarca (kombo, teški, uvis, juriš, u skoku), od kraja pripreme do malo posle kontakta. Uz sablju je trag čelično plav.
- **„Smanjeno podrhtavanje i efekti“** gasi istezanje, sabijanje, nagib i pretapanje, a trag topuza ostaje samo kao bleda traka, bez sjaja.

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
- **Potera za vilom** na Šarcu otvara Ravijojlinu šumu; u Manastiru Marko presuđuje na kome je carstvo. U Oranju je nadstreljivanje sa Alil-agom: ko ga nadstreli, dobija pobratima čije strele pomažu u megdanu.
- **Razgledanje:** `index.html?scout` otvara sve pohode bez neprijatelja, sa slobodnim kretanjem i ispisom položaja. `node megdan-bot.mjs` meri trajanje megdana.
- **Međukadrovi:** `python smooth-anims.py` računa ih lokalno; izlaz je `dist/assets/smooth/` i `dist/assets/sprite-smooth.json`. Posle novog izvoza listova pusti ga ponovo. Sada su to tri međukadra po koraku za sve glavne likove (vidi „Glatke animacije“).

## Kontrole

| Taster | Radnja |
|---|---|
| A / D ili strelice | Kretanje |
| Space | Skok; u vazduhu još jednom: Sokolovo krilo |
| J | Brzi udarac topuzom |
| K | Teški udarac, razbijanje garda |
| L | Drži za blok; pritisni u pravom trenutku za odbijanje |
| S / strelica dole | Čučanj, sporije kretanje i izbegavanje strela |
| R | Super udarac pri 100 junačkog besa |
| Shift | Izmicanje (kolut); u vazduhu: juriš napred |
| E | Ravijojla / aktiviranje kamena / uzjahivanje Šarca |
| F (drži) | Vihor: Marko se vrti sa topuzom i udara sve oko sebe; traži 25 besa i troši ga dok se vrti |
| Q | Vino: 12 s, +30% štete, 20% manje primljene štete, +18 zdravlja |
| V | Vilin trag: ostavi ga, pa se u roku od 8 s vrati na njega |
| Esc | Pauza |

Dodirne kontrole se pojavljuju na uređajima sa primarnim touch pokazivačem. Podešavanja nude lakši režim, jačinu zvuka i manje podrhtavanja. Igra se automatski pauzira pri gubitku fokusa. Kontrolne tačke i podešavanja čuvaju se u localStorage, bez naloga ili server baze.

## Pokreti po uzoru na *The Lost Crown*

Uzete su samo ideje mehanika, bez ikakvih asseta, koda ili imena iz te igre. Marko ih zna od prvog pohoda, ne čekaju veštinu.

- **Sokolovo krilo (dupli skok):** Space u vazduhu (džojstik A, dodir: dugme za skok), jednom po letu i samo peške. Tlo, zid, ivica i lestve ga vraćaju. Krila i perje crta igra sama, bez novog crteža; zvuk je `wings`.
- **Juriš u vazduhu:** Shift u vazduhu (džojstik B, dodir: dugme za izmicanje) baca Marka 0,22 s pravo napred, bez pada; za to vreme ništa ga ne dotiče. Jednom po letu, vraćaju ga tlo i zid. Shift pa J iz naleta daje Juriš. Na zemlji je Shift i dalje kolut.
- **Vilin trag:** V (džojstik ↓ + RT, dodir: dugme sa zvezdom iznad vile) ostavlja svetli Ravijojlin trag. Ponovo V u roku od 8 s vraća Marka na trag: vraća se samo mesto, zdravlje ne. Radi i usred udarca, kao izmicanje; posle povratka odmara 3,5 s. Ne izvlači Marka iz megdana.
- **Sigurno tlo:** pad u ponor je već radio po tom pravilu (−20 zdravlja, povratak na poslednje čvrsto tlo). Sada se daska koja popušta i tlo uz kolje ne računaju kao čvrsto tlo, pa Marko više ne pada ponovo u istu rupu. Kolje i dalje rani i odbaci Marka uvis, kao i pre.
- **Skok:** Space pritisnut visoko u vazduhu više se ne pamti do doskoka (Marko ranije sam skoči kad dotakne tlo).

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

## Borba 11. novembar: koštac, znak napada, plen

- **Koštac je hvatanje, ne lupanje.** Nad borcima se pokaže hvat (J, K, Space ili Shift; na džojstiku X, Y, A, B) sa prstenom koji ističe. Pravi hvat puni traku, pogrešan je prazni, a zakasneli boli.
- **Megdandžija u koštacu ostaje svoj lik.** Dok ne stignu naručeni crteži (`kostac-<ime>`), slaže se od njegovog sopstvenog crteža i Markovog guranja. Čim crtež postoji u rigu, igra ga uzima sama (tablica `KOSTAC_KIT` u `game.js`).
- **Veličina u koštacu.** Crteži koštaca na zemlji (janičar, oklopnik, pas, Musa) nacrtani su krupnije od likova na putu; pri crtanju se svode na meru tablicom `KOSTAC_FIT`. Novi crteži se naručuju u pravoj meri i idu bez ispravke.
- **Znak napada, kao u *The Lost Crown*.** Zlatan znak „!" nad glavom: napad se odbija (L), pa sledi kontra. Crven krst „✕": ne odbija se (plamen palikuće, hvat megdandžije), izmakni se kolutom.
- **Protivnik se odupire.** Posle tri laka udarca zaredom stane čvrsto i odmah uzvraća; teški udarac, odbijanje ili udarac uvis ga lome.
- **Plen, kao u *Metal Slug*-u.** Svaki šesti pali neprijatelj (u priči četvrti, u epskoj težini osmi) ostavlja čuturu, ali samo dok Markova nije puna.
- **Dukati u nizu** zvone sve višim tonom, kao lumovi u *Rayman*-u.
- **Primljen udarac** zaustavi igru na tren, kao u *Hollow Knight*-u, pa se oseti i ostavi trenutak za odgovor.
- **Neprijatelji imaju živce, kao u *Metal Slug*-u.** Kad im drug padne od teškog udarca, trećeg u nizu ili dokrajčivanja, oni kraj njega ustuknu korak i zastanu, a jedan vikne (glasovi `tr_fear`, do sada neiskorišćeni).
- **Musin koštac je pravo rvanje.** Dok Musa drži Marka, pokazuje se hvat kao u svakom drugom koštacu. Marko ne može da zbaci tri srca, ali tri dobra hvata dovode vilu ranije; bez njih dolazi kad i pre. Dugme J više ne treba lupati.
- **Megdan na ekranu.** Dok traje megdan, red zadatka se sklanja, a ime i snaga megdandžije stoje na vrhu ekrana.

## 13. novembar: mapa po pesmama, Marko ore, duža borba

- **Mapa** (`openLevels`, `MAP_AT`, `MAP_PUT`, `MAP_PESME`, `PRE` u `dist/game.js`): pohodi su složeni u pet pesama jedna za drugom, a megdan na Kačaniku stoji na istom putu između treće i četvrte. Unutar pesme put se račva: posle Sela može prvo Manastir ili Oranje, u drugoj pesmi bilo koji od tri pohoda, u trećoj Šuma ili Pećina, posle Klisure Ruševine ili Rudnik. Sledeća pesma se otvara kad su pređeni svi pohodi prethodne (`levelOpen`), pa je odskok od zida uvek naučen pre Tvrđave. Uz svaki pohod piše pesma po kojoj je rađen (`CUDA[].song`). „Sledeći pohod" posle pobede bira `nextPohod()`.
- **Oranje** (`setupPlows`, `usePlow`, `updatePlows`, `plowQuarrel`, `plowLift`, `plowSpoils`, `drawPlows`): ne oru Turci, nego Marko. Ralo i volovi čekaju na početku deonice; E hvata ručke, napred ore do međaša. Tada dolaze tri janičara („More Marko, ne ori drumova!" — „More Turci, ne gaz’te oranja!"), a Marko jednom po deonici može da digne ralo i volove (K dok drži ralo). Kad janičari padnu, na brazdi ostaje tovar blaga; tri deonice su tri tovara. Dok nema crteža `volovi-ralo` i `marko-ore`, crta se `volovi-plug` sa isečenim oračem i `marko-push`.
- **Borba** (`FOE_TOUGH`, `chainRoll`, `chainGo`, `foeTricks`): običan protivnik ima 1,4 puta više zdravlja, a na drumu ih je manje (razmak mesta 450 umesto 330 u `makeLevel`). Janičar, štitonoša, akindžija, kopljanik i oklopnik mogu posle udarca odmah da zadaju drugi (zlatan znak se pokaže ponovo), Oklopnikov malj šalje potres po tlu koji se preskače, strelac na zemlji posle svakog trećeg hica odapne još dve strele, a akindžija odskoči unazad kad vidi težak udarac. `makeElites` je imao grešku (svi u prvom i osmom pohodu su bili elitni, drugde niko); sada je elitni svaki četvrti u svakom pohodu.
- Naručeni crteži se hvataju po imenu čim uđu u rig: `volovi-ralo`, `marko-ore`, `marko-dize-ralo`, `<tip>-drugi`, `archer-rafal`, `fx-potres`. Akindžijin odskok pred teškim udarcem koristi postojeći `akindzija-backstep`.

## 13. novembar (2): pohodi sa dva puta, svetlije kule

- **Dva puta** (`bedem` i `jaruga` u `room` u `dist/world.js`): pohod više nije jedna linija. Bedem je dug zid sa prolazom kroz njega: gore lestvama preko zida (dva strelca, bolja nagrada), ili dole kroz prolaz (straža i kovčeg). Jaruga je uvala pod trulim mostom: preko dasaka, od kojih svaka druga popušta, ili lestvama na dno (kovčeg i nagrada) pa lestvama napolje. Ko propadne kroz most, padne na dno, ne u ponor. Svaki pohod osim Sna ima bar jedno račvanje, većina dva, Tvrđava tri.
- Račvanja se **dodaju** u recept, ne stavljaju se umesto postojećih soba, i veličine vuku iz svoje kocke (`R2`, `fr`), pa ostale sobe pohoda ostaju iste kakve su bile, samo pomerene.
- Dno jaruge ne ide ispod y=800, a kamera u pohodu silazi još 70 px kad je Marko ispod druma (`camLow` u `levelCameraY`), pa se vide i podrumi i dno jaruge.
- **Kule i zidovi** (`shadeBlock`, `drawBlock`, `drawTop`, `wallPattern`): crtež zida je svetao i topao, a kule su bile crne od senki preko njega. Sada su senke smeđe i tanke, šara za sirovu stenu je na zidanom jedva vidljiva, zidovi imaju ugaono kamenje, venac i zupce celom dužinom, svod od tesanog kamena, toplu unutrašnjost prolaza sa bakljama i puškarnice koje svetle.
- Saveti „bedem" i „jaruga" se pokažu jednom, kad Marko prvi put naiđe (`updateHints`).

## 13. novembar (3): stene u krajevima sirove stene, narudžbine iz ove sesije

- **Stene** (`drawRockBlock`, `WALL_TINT` u `dist/game.js`): u Klisuri, na Prevoju, u Pećini i Rudniku kula, stub i stepenik više nisu pravougaonik sa tapetom jesenje stene. Crtaju se kao izdanak stene te zemlje: telo od zida stene sa nazubljenim bokovima, a na vrhu traka tla tog pohoda sa njegovim krajevima litice. Zid stene je u Pećini siv i hladan, u Rudniku smeđ, na Prevoju bled, bez jesenjeg žbunja (`WALL_TINT` se peče u šaru zida).
- **Koštac sa Musom** (`kostacStep`, `musaHvat`, `musaObori`, `drawKostac`): kad mu pukne poslednje srce, Musa i Marko se prvo nose stojeći (`kostac-musa`, tri hvata), pa ga Musa obori (`kostac-musa-kraj`) i tek tada sedne na njega (`megdan-kostac`), gde opet idu hvatovi dok vila ne zovne. Par na zemlji je isti crtež kao poslednji kadar obaranja, pa je `KOSTAC_FIT` za `megdan-kostac` i `megdan-noz` podignut na 0,84 da se veličina ne promeni u prelazu.
- **Narudžbine od Codexa iz ove sesije**: Stefan je 13. 11. rekao da se animacije naručuju i odavde. Briefovi su `art/world-pack-03/DOPUNA-46.md` i dalje, status u `STATUS-ANIMACIJE-NOC.md`, Codex radi u worktree-u `marko-noc` kao posebna Codex sesija (najslabiji model), a klipovi ulaze u rig kroz blok `# ---- noc-poliranje` na kraju tabele u `build-sprite-rig.py`. Klip se ugrađuje tek kad se pogleda pored pravog lika: prvi izvoz DOPUNA-46 (rafal, drugi udarac Oklopnika, potres) je odbijen jer likovi nisu bili oni iz igre. Iz ponovljenog je prihvaćen `archer-rafal`; `oklopnik-drugi` i `fx-potres` su odbijeni i drugi put (pregled je u `STATUS-ANIMACIJE-NOC.md`).

## 13. novembar (4): jedna priča

- **Jedna mapa, jedan niz poglavlja.** Nema više jezičaka „Pesme o Marku” i „Pohodi”: mapa ide od Kosovskog sela do Urvine, megdan na Kačaniku je deseto poglavlje na istom drumu (njegovih šest delova bira se u opisu čvora), a sve se zove poglavlje. V2 nivoi („Junački pohodi”) su sklonjeni iz menija dok ne dobiju slike.
- **Ravijojlina šuma je drugo poglavlje.** Do nje vila nije uz Marka: E je ne zove, savete daje guslar, njenog svetla i merača nema. Posle potere na Šarcu („Bogom brate, Kraljeviću Marko”) postaje posestrima i igra tada objasni šta radi E.
- **Moći iz V2 se nalaze na putu**, svaka na oltaru u poglavlju kome po pesmi pripada: Vilin trag u šumi, Vazdušni kombo kod manastira, Potres na oranju, Vilinsko oko u podrumu, Sokolovo krilo u močvari (gde Marko previja sokolu krilo), Ravijojlin lanac u pećini, Juriš u vazduhu na prevoju, Šarčev gaz u klisuri, Trk po zidu u ruševinama. Oltar stoji na glavnom drumu; ko ga ipak promaši, moć dobija na kraju poglavlja. Stara čuvanja dobijaju moći poglavlja koja su već pređena. Mapa u opisu poglavlja piše koja moć je na putu.
- **Kapije su presek zida** (Stefan, uz snimak iz The Lost Crown: „sve kapije u igri moraju da izgledaju ovako, kao presek”). Kapija više nije kućica sa crkvom na vrhu gledana spreda, nego debeo zid presečen ravni slike: tamna masa preko cele visine ekrana, zasvođen prolaz u dnu, a rešetka se vidi sa strane i diže se u svoj žleb u zidu (`drawSection` u `dist/game.js`; kamen, palisada, rudnik, podrum). Ukrasne kapije gledane spreda (`prop-kapija-*`) još nisu zamenjene.
- Nad oltarom lebdi znak moći; kad Codex isporuči animirane crteže (`moc-<ime>`, `art/world-pack-03/DOPUNA-47.md`), igra ih sama crta umesto svetla, a uzeti znak uleti u Marka.
- Testovi: `mechanics-test` proverava red priče, vilu pre i posle šume i oltar u svakom poglavlju.

## 13. novembar (5): manje protivnika, jači su i rade u paru; animirani znakovi moći

- **Manje ih je i jači su.** Svaki treći protivnik sa druma je izostavljen (oko četvrtine manje po poglavlju), a oni koji ostaju nose više zdravlja (`FOE_TOUGH` 1.75).
- **Tandemi.** Dva protivnika koji stoje jedan do drugog rade zajedno (`makeTandems`, `tandemStep` u `dist/game.js`), a nad glavama im stoje dve spojene karike. Štitonoša ili sabljaš sa strelcem: prvi stane između Marka i strelca i tu ostaje, udara samo ono što mu priđe, a strele lete preko njegovog ramena. Dva sabljaša: jedan drži Marka spreda, drugi trkom zalazi za leđa, i udaraju jedan za drugim, nikad zajedno. Kad jedan iz para padne, drugi podivlja na nekoliko sekundi („OSVETA!”). Drugi čovek koga dodaje težina igre sada je uvek onaj koji dopunjuje prvog (štit strelcu, strelac štitu, sablja sablji).
- **Animirani znakovi moći.** Nad oltarom više nije svetla loptica nego nacrtan znak koji se kreće: sokolovo krilo maše, lanac sa kukom kruži, vilinsko oko trepće, potkova sevne, kamen puca po zlatnoj pukotini, topuz se vrti u vihoru, opanak maše krilom, pero strele vijori, vilin otisak pulsira (`moc-*`, devet klipova po 8 kadrova, `art/world-pack-03/DOPUNA-47.md`). Uzeti znak uleti u Marka.

## 13. novembar (6): zemlja puca pod Šarcem

- Na jahanju pred Musom (megdan, deo IV) **rupe više ne postoje unapred**. Drum je ceo kad Marko uzjaše; svaku provaliju zatvara ploča istog druma, i tek kad Šarac priđe ona napukne (pukotine, prašina, kamenje iskače), pa se raspadne na komade koji padaju jedan za drugim, i ostane rupa koju treba preskočiti (`setupPuca`, `updatePuca`, `drawPuca` u `dist/game.js`). Ko stoji na ploči kad padne, pada sa njom.

## 13. novembar (7): sablja je svoje oružje

Stefan: „sablja treba da ima drugačije poteze od topuza, a ne identične”. Do sada je sablja bila topuz nacrtan drugačije. Sada (G je vadi i vraća, kao i pre):

- **Rezovi su brži i lakši** (`SABLJA_BRZ`, `SABLJA_HIT`), a svaki ostavlja **ranu koja krvari** (do tri rane, četiri sekunde). Ljude bez oklopa (strelac, akindžija, palikuća, tufekdžija) seče dublje.
- **Treći rez je ubod** dugog dometa, umesto topuzovog udarca koji obara.
- **K je prolet**: Marko prođe kroz dušmane pred sobom, zaseče svakog u prolazu i izađe im za leđa. Nema lomilac ni zamah koji se drži.
- **Štit spreda i oklop je zaustavljaju**, i rez i prolet (oklopnik pod oklopom ne krvari): za njih se vraća topuz. Zato se oružja menjaju usred boja.
- Sa sabljom u ruci trenutak za odbijanje (L) traje duže.
- Trk sa sabljom je bio nacrtan 28 px iza mesta na kom Marko stoji, pa je lik trzao unazad kad potrči: pomak je ispravljen (`SABLJA_TRK_DX`). Druge greške u crtežima nisam našao merenjem; u igri uživo nisam gledao.

## Izvori

- https://sr.wikisource.org/sr-el/Марко_Краљевић_и_Муса_кесеџија
- https://sr.wikisource.org/sr-el/Марко_Краљевић_и_вила
- https://www.enciklopedija.hr/clanak/kraljevic-marko
- https://github.com/aldegad/sprite-gen — Apache-2.0, lokalna alatka za obradu grafike; nije runtime zavisnost.

Nova animaciona grafika i izvorni promptovi: `art/animation-prompts.json`; atlasi `dist/assets/mounted-run.png`, `mounted-jump.png`, `fairy-cast.png`, `marko-attack.png` sa odgovarajućim manifestima. Svi su generisani ugrađenim Imagegen alatom, izdvojeni originalnim sprite-gen komponentnim ekstraktorom i poravnati opcijom centroid.

## Pokretanje dvoklikom

Na Windowsu otvori `Igraj.cmd`. Potreban je Node.js 22+. Launcher pokreće lokalni server i tek kada je spreman otvara browser; ako igra već radi, otvara postojeću instancu. Paket `Marko-Tri-srca-Kacanika.zip` sadrži igru i launcher. Za animacione izvore vidi `art/combat-animation-prompts.json`.
