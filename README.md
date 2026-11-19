# Marko — Tri srca Kačanika

**Autor: Trbojević Stefan** (ideja, priča, dizajn igre i nivoa, likovi, animacije, muzika, programiranje).

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
- **Dijalozi i priče** (`dist/assets/voice/d/`, pravi ih `python make-dialog-voices.py`): svaki tekst iz okvira za razgovor i svaka strana priče između pesama ima svoj snimak, pa ga igra pusti uz `speak()` i čeka da priča završi pre sledeće strane. Spisak tekstova pravi `node tools/popis-replika.mjs --md` (`art/glasovi/replike.json`, `docs/GLASOVI-POPIS.md`), ko kojim glasom govori je u `art/glasovi/glasovi.json`, a ton i ko izgovara koji citat u `art/glasovi/rezija.json`. Priče čita epski narator iz filmskih trejlera (David), Marka Tuco, Ravijojlu Ida, a citate u pričama izgovaraju njihovi likovi (Arapin, Vukašin, car Uroš, guja iz Musinog srca…). Tekst ide glasu ćirilicom, jer na latinici Tuco kaže „Ravidžojla“. `python tools/proveri-glasove.py` sluša snimke lokalnim Whisperom i javlja šta se ne čuje dobro. Glas se pušta samo kad je igra na srpskom.
- **Psovke** (Podešavanja → „Psovke (Marko psuje)“): uključeno je kao do sada. Isključeno, Marko u borbi govori čiste replike (`…_c1` u `make-voice-lines.py`, za svaku grupu u kojoj psuje), replike sa psovkama i vilino „pazi kako govoriš“ ćute (spisak pravi `make-voice-lines.py` u `dist/assets/voice/psovke.json`). Stihovi iz narodnih pesama u pričama ostaju kakvi jesu. Sve replike koje je ranije izgovorio lokalni model (Arapin, janičarski aga, Musine etape, megdan, starac, vila u koštacu, uvod igre) sada su snimljene ElevenLabs glasovima; čitanje pesme čeka nove kredite.
- **Marko i dijalozi** (16. 11.): Marko je Tuco klon iz novog naloga, ali tekst mu ide **latinicom** sa jednom prostom oznakom i `[gruff]`, kao u originalnim replikama; samo ime Ravijojla ide ćirilicom (inače kaže „Ravidžojla“). Ćirilica i duge oznake su mu davale čudan, tih naglasak. Nove replike se izjednačavaju na jačinu starih (oko -23 LUFS). Snimljena replika koja stigne dok druga još traje čeka u redu (`speak` → `govorRed`), a scene sa razgovorom (Kosovka, Varadin, mehana, okovi, sablja, crkva, oranje) stoje dok glas govori (`scenaKorak`), pa sledeći deo scene kreće tek kad je izgovoreno. Posle gutljaja vina Marko kaže „Aaah!“ (`ah_*`), pa tek onda rečenicu o vinu. Svi guslari pevaju prave snimke sa Vikimedije: u Klisuri pesmu o Musi, drugde „Bolani Dojčin“, „Stari Vujadin“ i Musu redom.
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

Ceo spisak sa onim što nije provereno je u `docs/JUTARNJI-IZVESTAJ-2.md`; pesme i beleške po pesmama su u `pesme/`.

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
- **Narudžbine od Codexa iz ove sesije**: Stefan je 13. 11. rekao da se animacije naručuju i odavde. Briefovi su `art/world-pack-03/DOPUNA-46.md` i dalje, status u `STATUS-ANIMACIJE-NOC.md`, Codex radi kao posebna Codex sesija (do 14. 11. u worktree-u `marko-noc`, sada u jedinom folderu igre) (najslabiji model), a klipovi ulaze u rig kroz blok `# ---- noc-poliranje` na kraju tabele u `build-sprite-rig.py`. Klip se ugrađuje tek kad se pogleda pored pravog lika: prvi izvoz DOPUNA-46 (rafal, drugi udarac Oklopnika, potres) je odbijen jer likovi nisu bili oni iz igre. Iz ponovljenog je prihvaćen `archer-rafal`; `oklopnik-drugi` i `fx-potres` su odbijeni i drugi put (pregled je u `STATUS-ANIMACIJE-NOC.md`).

## 13. novembar (4): jedna priča

- **Jedna mapa, jedan niz poglavlja.** Nema više jezičaka „Pesme o Marku” i „Pohodi”: mapa ide od Kosovskog sela do Urvine, megdan na Kačaniku je deseto poglavlje na istom drumu (njegovih šest delova bira se u opisu čvora), a sve se zove poglavlje. V2 nivoi („Junački pohodi”) su sklonjeni iz menija dok ne dobiju slike.
- **Ravijojlina šuma je drugo poglavlje.** Do nje vila nije uz Marka: E je ne zove, savete daje guslar, njenog svetla i merača nema. Posle potere na Šarcu („Bogom brate, Kraljeviću Marko”) postaje posestrima i igra tada objasni šta radi E.
- **Moći iz V2 se nalaze na putu**, svaka na oltaru u poglavlju kome po pesmi pripada: Vilin trag u šumi, Vazdušni kombo kod manastira, Potres na oranju, Vilinsko oko u podrumu, Sokolovo krilo u močvari (gde Marko previja sokolu krilo), Ravijojlin lanac u pećini, Juriš u vazduhu na prevoju, Šarčev gaz u klisuri, Trk po zidu u ruševinama. Oltar stoji na glavnom drumu; ko ga ipak promaši, moć dobija na kraju poglavlja. Stara čuvanja dobijaju moći poglavlja koja su već pređena. Mapa u opisu poglavlja piše koja moć je na putu.
- **Kapije su presek zida** (Stefan, uz snimak iz The Lost Crown: „sve kapije u igri moraju da izgledaju ovako, kao presek”). Kapija više nije kućica sa crkvom na vrhu gledana spreda, nego debeo zid presečen ravni slike: tamna masa preko cele visine ekrana, zasvođen prolaz u dnu, a rešetka se vidi sa strane i diže se u svoj žleb u zidu (`drawSection` u `dist/game.js`; kamen, palisada, rudnik, podrum). Ukrasne kapije gledane spreda (`prop-kapija-*`) se u igri ne postavljaju; spreda su ostali samo ulazi u riznice, u koje se ulazi sa W.
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

## 13. novembar (8): tajne sobe, novi napukli zid, početni ekran, lake kopije crteža

- **Tajne sobe se ne odaju.** Merdevine iz skrivenog podruma se ne crtaju (i savet za lestve ih ne pominje) dok ploča nad njima nije razbijena; posle toga se završavaju ispod ivice rupe, ne vire iz zemlje (`ladderShut`, `skriven` u `dist/world.js`).
- **Napukli zid** više nije kratak stub sa nalepljenim pukotinama. To je zid kao i kapije: masa u preseku preko cele visine slike koja zatvara drum, sa mrežom pukotina kroz koje se vidi svetlo s druge strane. Svaki teški udarac izbije kamenje, pa se kroz rupe vidi predeo iza; kad padne, ostaje otkinuta masa nad prolazom i šut na drumu (`drawCrackWall`, `drawWallRuin`). Ne može se preskočiti ni sa Sokolovim krilom, a sablja ga ne ruši.
- **Početni ekran** je bez pergamentne kartice: slika preko celog ekrana, veliko zlatno ime, jedna kolona krupnih stavki sa zlatnom oznakom kraj izabrane (strelice ili W/S, Enter; prva stavka je odmah izabrana), a brojači i sitne veze su nisko levo. Dugmad i njihovi id-jevi su isti.
- **Optimizacija:** napravljene su 92 lake kopije crteža koje su falile u `dist/assets/pola` (klipovi nacrtani posle V2), pa telefoni i režim „Brže” više ne traže pa ne nalaze fajl i ne učitavaju punu sliku; iz učitavanja nivoa je izbačeno osam slika starih kapija koje se više ne crtaju (oko 1,3 MB po nivou).

## 13. novembar (9): kapija na vreme i kuke u poglavljima

Dve prostorije iz V2 sada su u poglavljima priče (`vreme` i `kuke` u `dist/world.js`), pa su i nivoi duži:

- **Kapija na vreme** (posle šume, gde se nalazi Vilin trag): poluga je predaleko od kapije da se stigne trkom dok je otvorena. Ostavi se trag kraj kapije (V), povuče poluga (E), pa se tragom vrati (V). U Manastirskom visu, Opsednutoj tvrđavi, podrumu, močvari, na prevoju, u rudniku i na obali.
- **Kuke nad jarugom** (posle pećine, gde se nalazi Ravijojlin lanac): dve srebrne kuke nad jarugom bez mosta; lanac (C) nosi Marka od prve do druge i preko. Ko lanac ne baci, silazi lestvama i ide dnom, gde je kovčeg i straža. Na prevoju, u klisuri, ruševinama, rudniku i na obali.

## 13. novembar (10): bregovi i uvale

- Drum više nije samo ravan sa stepenicama: prostorije **breg** (uz padinu, preko zaravni, niz padinu) i **uvala** (niz padinu u udolinu i nazad) koriste kose ploče iz V2 (`ramp` u `dist/world.js`, `surf`). Tlo padine se crta trakom tla tog poglavlja u uskim kriškama, pa trava prati nagib (`drawPadina` u `dist/game.js`); posebni crteži nisu bili potrebni. U selu, šumi, kod manastira, na oranju, u tvrđavi, močvari, na prevoju, u klisuri i na obali.
- Probni programi su dobili `topAt` (visina kose ploče), koji im je falio dok u poglavljima nije bilo padina.

## 18. novembar: prvi nivo, slušanje guslara, miran ulaz u selo

Stefan: „da Marko hoda dok ide pesma i dok slušamo guslara, to jest naratora, da ne može da se ide dalje… blok da nastavimo dalje dok se ne završi dijalog, monolog, replika”.

- **Slušanje** (`slusa` u `dist/game.js`), po uzoru na hod uz razgovor iz *God of War* i *The Lost Crown*. Dok traje snimljena replika (narator, lik iz pesme) ili dok guslar peva stihove, Marko po otvorenom tlu ide hodom (111 umesto 265 px/s), a niz drum stoji **veo pesme**: zlatna svetlost sa notama, najviše 520 px ispred mesta gde je replika počela. Veo se diže sa poslednjom rečju. Replika bez snimka (i cela igra na engleskom) drži Marka onoliko koliko treba da se pročita.
- Slušanje ne važi: u borbi (protivnik koji je video Marka odmah ga oslobađa), na megdanu, na konju, u scenama koje same drže kontrole i kraj zamki koje traže trk (kolje, balvan, kapija na vreme, potera…). U vazduhu Marko ima punu brzinu, a veo nikad ne stoji iza rupe, pa nijedan skok ne propada zbog replike.
- Dok Marko sluša, protivnik koji ga još nije video primeti ga tek sa 330 px (inače 760), a veo staje pre njega: reči se ne prekidaju jurišem sa pola ekrana.
- Saveti (`HINTS`) ne drže Marka i čekaju da narator završi, pa više ne seku uvodnu repliku nivoa.
- Kod guslara koji peva u miru stihovi sada traju koliko je i zamišljeno (2,6 s po stihu; sat `g.pev`): veo stoji 520 px iza guslara dok se tri stiha ne otpevaju.
- **Miran ulaz u Kosovsko selo** (`uvod` u `dist/world.js`): 900 px druma bez protivnika pre prve borbe. Seljanka sa detetom maše Marku, starac skida šubaru i klanja se (`seljani` u `dist/game.js`).
- **Pet novih pokreta** (Codex DOPUNA-65, GPT-5.6-Luna): `kopljanik-basa-jump` (megdandžija sela je skakao bez svog crteža), `marko-slusa` (obe šake na topuzu dok sluša), `marko-hvata-rep` (vašar), `putnica-pozdrav`, `putnik-starac-klanja`. Na vašaru konj sada stoji repom ka Marku kad ga Marko uhvati, a pušten odlazi od njega.
- Provere: `pesme-test.mjs` (hod, veo, skok ga ne prolazi, oslobađanje u borbi, guslar 10,3 s). Bot u `road-test.mjs` ne staje da sluša guslara.

## 18. novembar (2): prvi nivo, šest dopuna

Stefan: „dodaj svih ovih 6 tačaka što si predložio”.

1. **Prva borba je jedan običan janjičar** (`prviSusret` u `dist/game.js`). Do sada su prva dva protivnika bila elitni sabljaši u tandemu. Drugi sabljaš sada čeka 620 px dalje, ili stane pred prvog strelca kad su na istom tlu.
2. **Vašar se igra, ne samo sluša.** Posle izbora Šarca: E kraj ždrebeta daje mu vino (Marko pije, pa pije Šarac, spadne šuga i ždrebe se propne), Šarac ide za Markom do Novaka kovača na kraju vašara, Novak ga potkuje, i tek tada se otvara put. Konji su pomereni da kraj nakovnja ima mesta.
3. **Glas.** Nije snimano ništa: stari ElevenLabs nalog je prazan do 27. 11. Od replika prvog nivoa bez snimka je samo konjušareva prva („Vašar konja u Kosovskom selu…”, vodi se kao uputstvo): `python make-dialog-voices.py --ids d7ae1b800a3`. Saveti (`uputstvo`, `savet`) se po ranijoj odluci ne snimaju. `art/glasovi/replike.json` i `docs/GLASOVI-POPIS.md` su osveženi.
4. **Selo ima više od jedne kuće** (Codex DOPUNA-66): brvnara, vajat, tezga, veš na konopcu i bunar sa đermom. Postavljeni su rukom (`seloRekviziti`): brvnara i veš na ulazu, tezga kod konjušara, vajat i đeram kod guslara, veš kod poslednjeg bunara. Na tri slike je izvoz ostavio tamnu naslikanu pozadinu; skinuta je lokalno, bez novog crtanja.
5. **Seljani i dalje od ulaza** (`setupSeljani`): dvoje sluša guslara sa Markom, a kad megdandžija padne, seljani izađu kod bunara na kraju i kliču. Kokoške (`kokoska-kljuca`) kljucaju po dvorištu i razbeže se kad Marko protrči.
6. **Marko daje dukate** (`marko-daje`): sirotinji pruža šaku zlatnika umesto pokreta otvaranja kovčega.

Provere su u `pesme-test.mjs` (vašar korak po korak, seljani, kokoška, slavlje, prva borba).

## 18. novembar (3): strah i beg, megdan sela, reč nad svakim megdandžijom, kapije

Stefan: „neka neki beže od nas kada se uplaše, treba da imamo taj momenat kroz celu igru”, „za boss fight smisli da bude bolji u prvom nivou… neka bude nešto interaktivno”, „Marko za svakog bosa treba da ima neku rečenicu na kraju”, „naruči lepše kapije”.

- **Strah i beg** (`uplasi`, `begFoe` u `dist/game.js`), u svim pohodima. Vojnik se trgne, baci oružje (ostaje na zemlji, `oruzje-na-zemlji`), digne ruke i beži izbečenih očiju; van vidika nestaje i ne broji se u pobijene, a sateran u ćošak se preda. Šta ih lomi: pad megdandžije (beže svi njegovi), drug smrvljen teškim udarcem ili dokrajčen (neki samo ustuknu, kao pre), roj pčela. Ne beže oklopnik, elite, megdandžije i njihovi. Crteži: `<tip>-uplasen` i `<tip>-bezi` za sabljaša, strelca, akindžiju, kopljanika, štitonošu, palikuću i tufekdžiju (Codex D71/D72; prvi pokušaj D67/D68 je zamenjen po Stefanovoj ispravci: „moraju da bace oružje i da dignu ruke uvis… pomalo karikaturistično”), `pas-bezi`.
- **Megdan Kosovskog sela** (`KITS.kopljanik`, `setupMegdanSela`): na krajevima polja stoje kola sa senom, na gredama košnice. Baša juriša oborenim kopljem; ko se skloni pred kolima, koplje mu se zabije u seno i baša stoji otvoren. Razbijena košnica šalje pčele na njega. Na pola snage duva u rog i dotrče dva janjičara; kad baša padne, oni beže. Crteži D69: `kopljanik-basa-juris`, `-zaglavljen`, `-pcele`, `-poziv`, `-omamljen`, `fx-pcele`.
- **Pčele** iz svake razbijene košnice (i u šumi) idu na najbližeg protivnika: vojnik beži, megdandžija je ošamućen.
- **Markova reč nad svakim megdandžijom** (`MARKO_REC`): četrnaest rečenica, po jedna za svakog, umesto jedne za Musu. Bez snimka dok se krediti ne vrate (27. 11.).
- **Bunar i tezga**: E kraj bunara sa đermom (Marko pije iz vedra, `marko-pije-vodu`), E kraj tezge (pogača, `marko-uzima`), po jednom. Seljak (`seljak-idle`, `seljak-klice`) stoji pred brvnarom i kliče posle megdana.
- **Kapije: bez izmene.** Tri pokušaja naslikane kapije (Codex D70, D73, D75) Stefan je odbio („kapija je užasna, nemoj da je radiš uopšte, vrati na originalnu kapiju”). Kapija se crta kodom kao pre 18. 11.; naslikane slike su sklonjene iz igre i iz repoa.
- Provere u `pesme-test.mjs`: strah (trgne se, baci sablju, beži, nestane; oklopnik ne beži; pad megdandžije), megdan (juriš u kola, košnica i pčele), Markova reč, bunar.

## 18. novembar (4): megdan u tri čina, drugi nivo po pesmi, slike usred pohoda, meni koji se kreće

Stefan: „naruči bosa za prvi nivo da ima više animacija i faza, da ne bude lak za ubiti, a da bude zanimljiv”, „naruči vilu Ravijojlu… sve animacije koje fale kada je udaramo, naruči Miloša”, „sredi Šarčev hod i polako jahanje Miloša i Marka i tajming pesama i produži nivo za tok pesme”, „dodaj još novih aseta”, „među screenovi između nivoa… da ne spojluju… iskoristi ih usred nivoa”, „doradi još animacije za Upgrade menija, vidi još neki kombo za Marka”.

- **Kopljanik-baša, tri čina** (`KITS.kopljanik`; snaga 2000 umesto 1560). Prvi čin kao pre: koplja izdaleka, preskok, juriš u kola. Od pola snage: **ubod odozgo** (skoči i zabije koplje gde Marko stoji; ko se skloni, koplje ostaje u zemlji i baša je otvoren), **vitlo** kad mu Marko stoji uz bok (odskoči; posle vitla mu se zavrti u glavi), **nastup iza štita** (otvorena su mu samo leđa). Na trećini snage **bes**: strgne čalmu, zaurla, i više nema predaha među potezima. Crteži D76: `kopljanik-basa-vitlo`, `-ubod-odozgo`, `-u-zemlji`, `-stit`, `-bes`.
- **Jahanje preko Miroča ide hodom** (`pvCeka`, `PV_HOD`, `p.hodom`): konji idu sami 150 px/s (ranije galop 480, pa je pet stihova kasnilo za slikom i do minut), stih dolazi tek kad se prethodni izgovori, a na kraju puta konji stanu i čekaju poslednji stih (`p.hodStoj`), pa tek onda Miloš zapeva. Put je 12400 umesto 5200, sa devet prepreka; na njemu nema zasede. Vila odgovara, strele lete i Marko udara tek kad se replika završi. Crteži D78: `mounted-hod`, `sarac-hod-2`, `milos-peva`, `milos-pogodjen`, `milos-hod`.
- **Vila Ravijojla** (D77): `vila-peva` dok odgovara Milošu, `vila-pogodjena` kad je topuz stigne, `vila-udarena` na svaki udarac (J), `vila-moli` na kolenima, `vila-ustaje` kad je Marko pusti. Na kolenima je naslikana petinu veća nego u letu, pa je u rigu smanjena na 0,8.
- **Miroč** (`sumaStvari`, `setupSrne`; D80): hrast-zapis i koliba uz put jahanja, drugi zapis nad guslarom šume i kraj njega izvor (E, Marko pije, +30). Srne pasu uz put, dignu glavu kad konji priđu i pobegnu (`srna-pase`, `srna-bezi`). Te tri slike se ne rasipaju po zemlji (`RUKOM`), stoje samo gde su postavljene. Na šumskom putu prepreke su balvani i kamenje, a „SKOK” piše samo jahaču. Bilje koje vila bere ostaje staro (`assets/world/bilje-miroc.webp`): novo iz D80 je ispalo sitnije i tamnije, pa nije uzeto.
- **Slike između pohoda ne odaju pesmu** (`PRELAZ_RED`, `prelazKad`, `prelazTick`). Pre pohoda ide samo ono što je pre puta; slika onoga što se dogodi prikaže se usred pohoda, kad se dogodi: u šumi vila nad Markom kad Miloša pogode strele i palikuće pod bukvom kad Marko stigne do gnezda (ranije je pod tom slikom stajao tekst potere); u manastiru presuda na kraju pohoda; u močvari previjeni soko kad ga Marko previje; na ruševinama kolo svatova kad je poslednji kavez razbijen; u podrumu slika pred carem otvara divan na kraju. Uvodna rečenica šume više ne kaže da je Miloš ustreljen. U razvojnom režimu (`?dev`) te slike se ne puštaju, osim sa `&prelazi`.
- **Kombo K J, „Povratni udarac”** (`tryPovratni`, `marko-povratni`, D79): posle teškog zamaha J vraća topuz naviše istim zamahom i baca dušmanina uvis (megdandžiju i oklopnika ne).
- **Meni Napredak se kreće** (`jnAnimTick`, `dist/hud.css`): Marko u kartici Junak stoji živ i odmerava topuz (`marko-odmerava`), izabrana kombinacija se odigra u opisu potez po potez (`JN_KLIP`), posle kupovine Marko digne topuz (`marko-raduje`) dok dukati lete iz kese do kupljenog; prozor, kartice i polja ulaze pokretom.
- Bez snimka su do 27. 11.: nova uvodna rečenica šume i dva nova teksta slika šume.
- Provere u `pesme-test.mjs` i `pesma-vila-test.mjs`.

## 18. novembar (5): megdandžije narednih pohoda, mladi Turčin, trnje Miroča

Stefan: „naručuj od Codexa sve što ti treba za naredna tri nivoa, potrebne su nam sve animacije”, „zašto ne uradiš klip ispada”. Naredna tri pohoda po redu priče su Manastirski vis, Oranje i Opsednuta tvrđava.

- **Dželat** (Manastirski vis, `KITS.dzelat`) se bije u tri čina kao Kopljanik-baša: sekira mu se zabije u zemlju i čupa je (`dzelat-zabio`); od pola snage skače sa sekirom odozgo i vitla njome kad mu Marko stoji uz bok (posle mu se zavrti u glavi); na trećini snage strgne kapuljaču (`dzelat-bes`). Crteži D82: `dzelat-zabio`, `-vitla`, `-skok`, `-bes`, `-omamljen`.
- **Hasan-aga** (Opsednuta tvrđava, `KITS.hasan`): od pola snage tresne buzdovanom o zemlju kad mu Marko priđe (talas ide po zemlji: preskoči ga), na trećini se razjari. D83: `hasan-aga-lunge`, `-jump`, `-tresak`, `-bes`, `-omamljen`.
- **Lovac-aga** (Ravijojlina šuma) dobija ispad (sada nacrtan, ranije zamena), skok, ošamućenost i bes na trećini snage, kad odmah zove pse. D81.
- **Mladi Turčin sa očevom sabljom** (tvrđava): spava, budi se, ispad, skok (D84; buđenje iz D84 je bilo isečeno pa je naručeno ponovo, D86). Sedeći je bio naslikan visok kao uspravan; smanjen u rigu na 0,69, kao uspavani janičar.
- **Strelac se penje uz lestve** (`archer-climb`), **oklopnik ima vodoravan udarac čekićem** (`oklopnik-attack`), D85.
- **Trnje Miroča** (`prop-trnje`, D85): u berbi bilja vila leti preko naslikanog trnja umesto štapova crtanih kodom.
- Svaki megdandžija sa nacrtanim ošamućenjem (`<lik>-omamljen`) i besom (`<lik>-bes`) sada ih pokazuje.
- Oranje nije tražilo nove crteže: tri janičara su obični sabljaši, a koštac sa sabljašem igra već crta postojećim `kostac-janicar`.
- Provere u `pesme-test.mjs` (dželat i Hasan-aga u tri čina).

## 18. novembar (6): junački udari na F/R, muzika svakog pohoda, krčma na početnom ekranu, Manastir i Oranje

Stefan: „kada otključam L3 i R3 skillove oni ne rade … automatski ih stavi dole u Action bar”, „kreni na sledeća 2 nivoa i pojačaj animacije, sredi pozadine, paralaks, stepenice, neprijatelje, ljude”, „napiši nove muzike za skoro svaki nivo”, „početni ekran: neka Marko i Šarac dele vino ispred neke krčme”.

- **Junački udari (F / R, na džojstiku L3 / R3).** Potres se nađe posle Oranja, ali je tražio Vihor (Prevoj) ili Junački udar (Reka), pa pet pohoda nije radio i nije bio u traci; isto Šarčev gaz. Sada radi čim se nađe. Svaki udar koji tek postane dostupan sam ide na taster i u traku (`udariNovi`, `udarMoze`): prvo na taster čiji udar još ne radi, inače na svoj (Vihor i Potres F, Junački udar i Gaz R); poruka kaže gde je i da se menja u Napretku (P). Stari save sa nađenim Potresom ga dobija na F.
- **Muzika.** `make-level-music.py` sklapa temu za 14 pohoda (sve osim Urvine i Sna, gde ostaje guslar): svaki svoj lad, tempo, takt (selo kolo 7/8, Oranje 9/8) i svoje instrumente (frula, kaval, gajde, tambura, zvona, gusle, hor, trube), oblik uvod–A–A'–B–A'' koji se vrti bez šava. Novi instrumenti: frula/kaval, tambura (Karplus-Strong, tremolo), crkvena zvona, gajde, def, kapi u pećini. Svaki pohod učita samo svoju temu (`trackOr('nivo-<id>')`), do tada svira stara. Megdani zadržavaju svoje teme.
- **Početni ekran (D87).** Codex je naslikao krčmu u predvečerje: Marko na klupi preliva pola vina u bakrač iz kog pije Šarac. Slika stoji dole desno i preliva se u zamućenu kopiju sebe, pa meni stoji nad mirnim drumom. Fenjer treperi, iz dimnjaka ide dim, sunce sija; od 20 do 6 časova ista scena noću (`#menu.noc`). Marko na litici se više ne crta.
- **Pozadine (D89, D90).** Bliži i srednji slojevi Manastirskog visa i Oranja dobili su druge verzije: konak sa česmom, groblje sa paraklisom, isposnica u steni; vodenica, gumno sa đermom, selo na brdu. Crtač pozadine (`stage3d.js`) smenjuje pločice A B A C (`<sloj>-b`, `-c`), pa se isti zvonik ne ponavlja. Ljubičasti odsjaj sa ključa je skinut (`.tmp-edge/p96.py`).
- **Prednji sloj** (`<nivo>-prednji`, `drawPrednji`): jesenje grmlje i klasje dole na ekranu, tamnije i malo zamućeno, ide brže od puta (1,3) kao u The Lost Crown; prati tlo, ne skokove.
- **Stepenice (D88)** su naslikane na Manastiru (krečnjak), Oranju (zemlja sa gredom) i u tvrđavi (peščar): gazište + telo kao tapet (`drawStairsPainted`), crtaju se odozdo naviše pa viši stepenik pokriva niži (ranije su preko stepenika išle pruge). Codex je telo pravio preslikavanjem (rombovi kao u kaleidoskopu); pločice su ponovo složene od njegovih prvih slika (`.tmp-edge/p97.py`).
- **Ljudi na poslu (D91, `setupRadnici`):** na Manastirskom visu dva kaluđera se mole i jedan zvoni na drvenoj zvonari (zvono se čuje kad je Marko blizu), u Oranju žetelice žanju i nose snopove, kosac kosi. Svako jednom pozdravi Marka. Codex je pognute kadrove razvukao na visinu uspravnih; smanjeni su po površini lika.
- **Zlatni janičari (D92):** trojica sa carevim blagom na kraju Oranja imaju svoj izgled (`look:'zlatni-janicar'`, osam klipova).
- Kapije nisu dirane.

## 18. novembar (7): Pod Varadinom, vila koja maše krilima, Šarac koji se rita, Marko koji poji Šarca

Stefan: „popravi zimski prevoj: pesma priča o zelenoj travi a mi na zimskom tlu, i ne vidi se dosta stvari koje su ispevane”, „koristi 6.1 Terra za teren i osmisli likove”, „animiraj vilu u glavnom meniju”, „animacija kako Marko pije vino u donjem položaju i kako poji Šarca”, „ritanje Šarcem kad ga jašemo … okrene se Šarac i odvali glavu”, „vilu da udaramo jedno 40 puta i krv da leti”, „kad jašemo moramo da možemo polako”, „Šarčev hod za Markom u prvom nivou”, „strelac ima jednu debelu animaciju”. Crteži ove ture: Codex **GPT-6.1-Terra** (`.tmp-edge/codex-run-terra.sh`).

- **Pod Varadinom (deveti pohod, id `prevoj`).** Pesma je „Marko Kraljević i Vuča dženeral”, a u njoj nema zime: Marko pregazi Dunav i dođe „pod Varadin, u polje zeleno”. Ime, uvod, tri slike pre pohoda (tamnica Varadina, Marko gazi Dunav, šenluk topova na Varadinu), cilj i engleski parovi su po pesmi. Sneg u vetru, ledene ploče, lavina, snežno tlo i snežni ukrasi su isključeni (`level.zimski`). Novi teren (D93): nebo, ravnica uz Dunav, vinogradi sa skelom, Varadin na steni sa dimom topova, polje sa hrastovima i bulkama, obala sa čamcem, podnožje bedema, prednji sloj, tlo sa travom. Zimski fajlovi su u `.tmp-edge/stari-prevoj`.
- **Ljudi iz pesme (D96):** knjigonoša na početku skine kapu, pokloni se i da Marku Miloševu knjigu (stihovi iz pesme); Velimirovica gleda sa bedema dok Marko pije i beži kad ga prepozna; na kraju pored Miloša stoje stari Toplica i Kosančić Ivan. Duž puta kosci, žetelice, trgovac, putnica, starac i seljak koji kliče, svako sa rečju o Vuči i tamnici.
- **Katane (D95)** umesto janičara pod Varadinom: ugarski husari (zelena dolama, crvena kapa), osam klipova, `look:'katana'`.
- **Vuča dženeral (D94)** je megdandžija pohoda: stari velikaš na sivoj bedeviji, sa pokretima akindžijskog bega (`BOSSES.vuca`, klipovi kita se crtaju pod `look`). Kao u pesmi: kad mu katane izginu, beži na bedeviji (`T.ph='potera'`), a tek kad padne „u zelenu travu” Marko ga veže i vojvode izlaze iz tamnice.
- **Bedemi i kule (D99)** u rukopisu zida koji se Stefanu svideo: deo bedema, okrugla i četvrtasta kula, kapija, srušen bedem, bedem sa stepenicama. Pod Varadinom: iza logora niski bedem sa kulom (pozadina, na njemu Velimirovica), a na kraju polja bedem sa kamenim stepenicama i kula, **po kojima se ide i skače** (nevidljivi stepenici `kind:'step', slika:true` ispod slike), na kuli novac. Markovo koplje u ledini sa uzdom je naslikano.
- **Marko poji Šarca, pa pije (D97):** dva klipa u položaju u kome Marko sedi (`marko-sedi-poji`, `marko-sedi-pije`), iste veličine kao `marko-odmor`. Pod Varadinom se smenjuju „pola Šarcu daje” / „pola pije”, a gde god sedi (mehana) otpije na svakih nekoliko sekundi. Terra ih je nacrtao dobro, ali ih nije izvezao zbog sopstvene mere; isečeni su iz njegove mreže (`.tmp-edge/izvoz-d97.py`).
- **Šarac se rita (D98, D101):** na Šarcu S+SPACE. Ako je protivnik ispred, Šarac se prvo okrene u mestu (`mounted-okret`, kadar spreda), pa se ritne zadnjim kopitama (`mounted-ritne`): običnom protivniku odleti glava (`behead`), megdandžija dobije jak udarac.
- **Hod na Šarcu:** drži SHIFT (ili palicu do pola) i Šarac ide hodom (`mounted-hod`), ne samo trkom.
- **Vašar u selu (D100):** konj držan za rep se ritne (`sarac-ritne`), a šareno ždrebe se upire i ne da se pomaći (`sarac-rep-upire`). Šarac posle pojenja prati Marka hodom ili kasom prema brzini, noge prate pređeni put (ranije je klizio).
- **Vila u šumi:** J (X) što brže, oko 40 udaraca: svaki je zamah topuzom, krv leti na sve strane, metar se puni; tri stiha dolaze redom dok se bije, a vila se preda tek kad je metar pun i pesma otpevana.
- **Vila u glavnom meniju** maše krilima (osam kadrova `vila-let`, `assets/ui/vila-meni.webp`).
- **Strelac:** `archer-rafal` je bio nacrtan zdepasto; sužen na 0,8 širine i malo viši.
- Glasovi za nove replike nisu snimljeni.

## 18. novembar (8): iza zubaca, gard katane, topuz obara Vuču, posmatrači i prave merdevine

Stefan: „kada smo na ovim zidinama neka budemo iza vrhova, ne ispred”, „da nema razmaka između zida i kule”, „neku zanimljivu mehaniku borbe … da moramo da uradimo određeni potez, kombo”, „napravi još posmatrača običnih ljudi, rekvizita”, „nove merdevine, ove su baš jadne”, „napravi inventar svega što treba da naručimo Codexu i naruči”.

- **Iza zubaca:** ko stoji na naslikanim bedemima (Marko, Velimirovica, strelci) stoji malo ispod procepa među zupcima, a gornji pojas bedema (zupci i grudobran) crta se ponovo preko njega (`drawBedemiNapred`, pre prednjeg sloja).
- **Kula uz zid:** kula prekriva kraj zida, pa nema razmaka; hod po zidu ide do kule, na kulu se skače.
- **Gard katane:** kad je udariš spreda sa J, katana ponekad uhvati gard: nad glavom joj stoje tri tastera (npr. J K J). Spreda prolazi samo taj kombo, taster po taster (pogođen taster pozlati); pogrešan vraća na početak i odbija Marka. S leđa, kontrom ili Šarčevim kopitama gard puca odmah. Slomljen gard: katana ošamućena, spremna za završni udarac.
- **Vuča pada od topuza, kao u pesmi:** bačen topuz (I) koji ga stigne dok juri na bedeviji obara ga s konja („udari ga sapom od topuza, pade Vuča u zelenu travu”).
- **Posmatrači (D102):** seljanka sa korpom grožđa, dečak koji maše, starica koja se krsti, ribar sa mrežom, građanin Varadina stoje duž puta pod Varadinom i svako kaže reč o Marku i Vuči. Katana u gardu i katana kojoj je gard slomljen imaju svoje klipove.
- **Prave merdevine (D103):** sve merdevine u igri su sada naslikane hrastove, prečke vezane konopcem (`merdevine-telo` se ponavlja u visinu, `merdevine-vrh` na vrhu; prečke ostaju na 28 px). Rekviziti Varadina: top iza zubaca na bedemu, žuto-crni barjak na kuli, korpe grožđa, ribarska mreža i mešina sa leđenom među ukrasima pohoda.
- **Inventar za Codex:** `docs/INVENTAR-CODEX.md`, šta je nacrtano, šta je naručeno ove ture (D102 posmatrači i gard katane, D103 merdevine i rekviziti Varadina) i šta čeka nova sredstva.

## 19. novembar: ceo bedem Varadina

Tri slike iz D99 koje su čekale sad su u igri. Iza polja pod Varadinom bedem ide bez prekida: zid sa Velimirovicom, okrugla kula, zid sa gradskom kapijom, zid i četvrtasta kula, pa zid sa stepenicama po kome se ide (`VARADIN_ZALEDJE` u `game.js`). Srušen bedem stoji kao stara ruševina na polju pre logora. Sve je pozadina, ništa nije čvrsto. Skela na Dunavu još čeka mesto, jer u pohodu nema vode.

## 19. novembar (2): Pod Varadinom po pesmi, soba po soba

Stefan: „Sredi ceo nivo po pesmi i vodi računa o najsitnijim detaljima i placementu aseta i zanimljivih stvari tipa blaga, zagonetki.” Deveti pohod je do sada bio stari planinski prevoj sa letnjim slikama (penjao se 1300 px, sa lavinom, liftom i dimnjakom). Sada ide redom kojim ide pesma „Marko Kraljević i Vuča dženeral” (`RECIPES.prevoj` u `world.js`), po ravnici:

- **Prilep, nedelja** (soba `prilep`, bez dušmana): bela crkva i zvonik sa kaluđerom koji zvoni, knjigonoša pred crkvom se klanja i predaje knjigu. Zapis pohoda leži kod njega i u njemu je Miloševo pismo zapečaćeno krvlju. Dalje je Markova kula sa barjakom, sto sa vinom i bure iz koga ispada vino.
- **Zagonetka „Oprema za megdan”**: četiri kamena (ТОПУЗ, САБЉА, ТУЛУМ, КОПЉЕ) udaraju se redom kojim se Marko u pesmi opremao: sablja, koplje, tulum vina, topuzina. Stihovi su na zapisu kod kule. Tek tada se otvara kapija Prilepa.
- **Drum na sever**: breg, plastovi, jarak, karaula, razvaljen zid, jaruga sa trulim mostom, guslar koji peva početak pesme („Ili grmi, il’ se zemlja trese?”), riznica sa pločom i sandukom (deo srca), skriveni podrum, kula, prolaz ispod grede, tajna odaja, granična straža pred Beogradom, trgovac.
- **Beograd i Dunav** (soba `dunav`): krčma („uvrati se, te se napi vina”, E za stolom puni čuturu), Šarac vezan pred krčmom (E), ribar, mreža, dok, skela na drugoj obali. Sa obale se dvaput vikne skeledžija (E); skela se ne miče, pa Marko natera Šarca u reku. Dunav je udolina puna vode koja se crta ispred svih koji su u njoj, pa Šarac gazi do trbuha i ide upola sporije. Peške se ne može preći. Katana koja uđe u vodu udavi se posle dve i po sekunde („što podavi u tihom Dunavu”); u boju se Marko može povući u reku.
- **Polje pod Varadinom**: scena kakva je bila, uz sitnice: Marko dojaše iz Dunava i zaustavi Šarca kod koplja, mešina i leđen u travi su naslikani, prvi talas vodi **Velimir** (jača katana sa imenom), a kad Marko izađe iz reke čuju se topovi sa grada.
- **Potera**: na Šarcu preko zida i kule, pa preko brega, kolja i plastova do megdana sa Vučom pod zidinama. Megdan ima svoj uvod i savet (bačen topuz, I). Ko padne u polju, vraća se na Šarcu.
- **Tamnica Varadina** (soba `tamnica`): luk sa rešetkom u gradskom zidu, iza nje tri vojvode u vodi do kolena, sa kostima do ramena. Dok Vuča ne padne, kroz rešetku se ne može; posle E diže rešetku, vojvode izlaze na drum, a u otvorenoj ćeliji leži čudo pohoda (Buzdovan).
- **Tri tovara blaga** (soba `blago`): tri tovara pred poslednjim barjakom, svaki po 40 dukata.

Ljudi iz pesme stoje tamo gde im je soba (`narod` u `world.js`, `setupRadnici`): putnica na samom početku, zvonar, knjigonoša, starica, seljanka i dečak kod crkve, trgovac, starac i ribar kod Beograda, građanin i seljak kod blaga. Slike „Preko Dunava” i „Šenluk na Varadinu” izlaze usred pohoda, kad se to desi (`PRELAZ_RED.prevoj`).

Provera: `pesme-test.mjs` igra Prilep, zagonetku, krčmu, Dunav, tamnicu i tovare (160 provera); bot u `road-test.mjs` prelazi ceo pohod.

## 19. novembar (3): naslikana tamnica, krčma, Markova kula, karuce, Velimir, dženeralovica i proba nove kapije

Stefan: „Naslikaj tamnicu i sve što ti treba iz inventara”, „ugasi vetar, može da ostane, ali da nas ne pomera na 9-om nivou, i pokušaj da središ kapije”. Tri narudžbine kod Codexa (GPT-6.1-Terra), sve iz prvog pokušaja:

- **D104, slike:** `prop-tamnica-varadin` (zid sa lukom, lobanje i kosti do ramena, lanci, snop svetla, zelena voda), `prop-krcma-beograd` (trem, sto, burad, tabla sa grozdom, direk i korito za konja), `prop-markova-kula` (vitka kula sa čardakom), `prop-karuce-zlatne` (zlatne karuce sa četiri vranca), `kapija-34-kamen` i `kapija-34-resetka` (proba kapije).
- **D105, Velimir:** `velimir-idle/run/attack/hurt/death`, `velimir-jase` (na vrancu), `velimir-svezan` (leži svezan u travi). U prvom talasu dojaše na čelu katana, sjaše kad boj počne i bije se peške (`look:'velimir'`); kad padne, leži svezan kod Markovog koplja.
- **D106, dženeralovica:** `dzeneralovica-idle` i `-otkljucava`. Kad Vuča padne, stoji kod tamnice sa ključevima; E („Pusti mene do tri pobratima”) i ona otključava.
- **Tamnica** se crta slikom; vojvode, voda preko kolena i rešetka su i dalje iz igre (`TAM_ART`, `drawTamnica`). **Krčma** ima svoj sto pod tremom (E za vino) i Šarac pije iz korita kod direka. **Karuce** stoje kod tri tovara.
- **Proba nove kapije** (`drawKapija34`, samo kapija Prilepa): kapija-kula gledana u tri četvrtine. Cela stoji iza Marka, a deo desno od luka crta se još jednom ispred njega, pa on ulazi u luk i izlazi iza kule (zid se proredi dok je iza njega). Rešetka se diže uz lice zida i ostaje vidljiva iznad luka. Ostale kapije u igri nisu dirane dok Stefan ne kaže da li ova valja.
- **Vetar** na devetom pohodu se vidi i čuje, ali ne gura Marka i ne najavljuje se natpisom.
- Slike soba devetog pohoda traže se čim pohod počne (`PREVOJ_SLIKE`), da nijedna ne iskoči tek kad Marko priđe.

## 19. novembar (4): nova kapija svuda, peti pohod po pesmi o očevoj sablji, replike koje se ne preklapaju

Stefan: „da, stavi tu kapiju, kreni na nivo 5 sve do najsitnijeg detalja i produženog gameplaya, i boljeg boss fighta, pazi da se zvukovi ne preklapaju”.

**Kapija.** Kapija-kula u tri četvrtine sada stoji na svim kapijama kroz koje drum prolazi (ciljevi, kapije na polugu i na vreme, zagonetke), u četiri materijala: kamen (D104), a brvna, stena i cigla su nacrtani po njoj (D108, `kapija-34-drvo`, `-rudnik`, `-podrum`, svaka sa svojom rešetkom; otvor luka je na istom mestu). Kapija je dublja od starog preseka, pa svaka soba koja se završava kapijom dobija 380 px ravnog druma iza nje (`KAPIJA_DUB` u `world.js`), a kapija-cilj se postavlja samo gde je drum ravan. Zid se proredi i kad je iza njega dušman, da niko ne napada nevidljiv. Megdan na Kačaniku (bez pohoda) i dalje ima stari presek.

**Replike.** Replika bez snimka je do sada odmah pregazila prethodnu: tekst se menjao dok je glas prethodne još išao. Sada i takve replike čekaju red (`speak`, `govorTik`): svaka ima svoje vreme čitanja, najviše četiri čekaju, a dok se govori Marko ne uzvikuje.

**Peti pohod, „Marko Kraljević poznaje očinu sablju”** (`RECIPES.tvrdjava`, oko 37.500 px umesto 30.000):

- **Marica u zoru** (`marica`, bez dušmana): Turkinja devojka kleči i beli platno; kad Marko priđe, ustane i priča (voda mutna i krvava, ranjeni junak, sablja sa tri zlatna balčaka), prokune brata i daje prvi ćemer blaga. Reka je gaz sa mutnom crvenom vodom koja nosi kalpake; na drugoj obali je grob neznanog junaka i zapis.
- **Mustaf-agina bijela kula** (`belakula`): naslikana kula sa balkonom do kog vode merdevine; na balkonu je drugi ćemer, a pred kulom agini ljudi.
- **Carev tabor** (`tabor`): sablja ide „od ruke do ruke”, trojica je redom vuku i „ne da se”. E: sablja se sama izvadi u Markovoj ruci, izađu tri slova, pa Markovo pitanje, agina priča i megdan sa Mustaf-agom. Kad padne, sa njim padne treći ćemer i očeva sablja, a ostali „otidoše caru kazivati”.
- **Megdan sa Hasan-agom** (carev čauš-baša): dva bureta baruta u areni (zalet u bure ga diže u vazduh), od druge trećine skače na Marka koji stoji daleko ili na gredi, a gde padne zemljom idu talasi; na trećini snage silaze dva careva čauša.
- **Carev čador** (`cador`), posle megdana: Marko „u čizmama sjede na serdžadu”, car uzmiče do duvara i pruža kesu, sto dukata.
- **Tri ćemera blaga** se broje (`cemer`), za sva tri ide još trideset dukata.

Narudžbine (GPT-6.1-Terra, sve iz prvog pokušaja): D107 slike (bijela kula, platno na Marici, grob, carev čador), D108 kapije, D109 likovi (Turkinja devojka: stoji, beli platno, kune; car: sedi, uzmiče, daje; janičar koji vuče sablju).

Provera: `pesme-test.mjs` igra Maricu, kulu, tabor, megdan i čador (178 provera).

## 19. novembar (5): zvuk na svom mestu, peti pohod bez grešaka

Stefan: „Dosta pesama po nivoima nema veze sa nivoima, ponavljamo ih više puta, moraš da vodiš računa gde koji audio puštamo, i za neke scene fale kadrovi i junaci. Moraš da poradiš na carevom šatoru, i ona devojka što pere veš: loša perspektiva, iskrivljeno deluju ti modeli.” I: „onaj mladi Turčin sa sabljom: piše mu iznad glave da ima sablju i svaki put trigeruje taj voice … kad car beži od nas, mi se krećemo ka njemu sedeći … ne želim da izgleda polugotovo.”

**Zvuk** (pravilo i stanje po pohodima: `docs/ZVUK-PO-NIVOIMA.md`):

- Guslar je u svakom pohodu pevao jedan od tri snimka redom („Bolani Dojčin”, „Stari Vujadin”, „Musa Kesedžija”), bez veze sa pesmom tog pohoda, dok su na ekranu išli stihovi druge pesme. Sada se pesma o Musi peva samo u Klisuri Ibra, gde joj je mesto; u ostalim pohodima guslar svira gusle bez reči (`gusle-svirka.ogg`) pod stihovima pesme svog pohoda (`pesmaSrc`).
- Peti pohod: priča o sablji se čuje jednom. Mustaf-aga nosi samo svoje ime (ne „OČEVA SABLJA”); kad sablja izađe iz korica i kad on padne idu snimljene replike guslara umesto mojih nesnimljenih dvojnika; bijela kula ćuti (devojka je sve rekla na reci); guslar peva druge stihove iste pesme („o bedri mu sablja okovana”). Ljudi iz tabora i aga ne dobijaju par na težim nivoima.

**Slike iz pesme** (D111): slike pre petog pohoda prikazivale su tvrđavu u plamenu i katapulte, čega u pesmi nema. Nove tri: zora na Marici (pre puta), devojka vadi ranjenog junaka platnom (kad Marko priđe devojci), Mustaf-aga zagledan u sablju nad ranjenikom (kod groba). `PRELAZ_RED.tvrdjava`; slika koje nema u `files.json` se preskače.

**Marica**: devojka kleči na samoj vodi i beli platno u reci (ranije je prala na kamenom drumu, daleko od vode, a platno je bilo naslikano odozgo). Perilo sa platnom je naslikano s boka (`prop-perilo-marica`, D110).

**Carev čador** (`prop-cador-bok`, D110): naslikan s boka kao pozornica, bez poda u dubinu; car i Marko su iste mere. Marko uđe, „u čizmama sjede na serdžadu”, **ustane** i korača ka caru koji uzmiče do platnenog zida; scenu nose dve snimljene replike guslara. Prednji stub sa tugom crta se ispred likova.

**Junaci** (D112): Mustaf-agina ostarela majka na balkonu bijele kule; u taboru kuvar nad kazanom, bubnjar i stari derviš.

Provera: `pesme-test.mjs` (180), posebno: jedan čovek nosi sablju, Marko u čadoru ustaje pre nego što krene ka caru.

## 19. novembar (6): šesti pohod po pesmi „Marko pije uz ramazan vino”

Stefan: „Pređi na sledeći nivo koji nismo radili … idemo nivo po nivo da bi sve izgledalo savršeno i bez i jedne greške.”

Zaboravljeni podrum (`RECIPES.podrum`) ide redom pesme:

- **Carev telal** (`jasak`) pred tablom sa četiri precrtane sličice čita jasak (snimljena replika čauša): ne pije se vino uz ramazan, ne nose se zelene dolame, ne pašu se sablje okovane, ne igra se kolom uz kadune. Od tada cilj pohoda glasi „Pogazi carev jasak · n/4”.
- **Vino** (`vino`): čauši idu da proliju bačvu; kad ih Marko poseče, pije (1/4).
- **Zelena dolama i sablja okovana** (`dolama`): na krojačevom stalku visi zelena dolama, na polici su zaplenjene sablje pod lancem i pečatom. E kod stalka: Marko obuče dolamu i **ostaje u zelenom do kraja pohoda** (crvena boja plašta se pretvara u zelenu kadar po kadar, `dolamaFrame`). E kod police: slomi pečat i pripaše sablju (ko nema očevu sablju iz petog pohoda, dobija je za ovaj pohod). Sablja se broji i kad je igrač sam izvuče (G). Na svaki prestup silazi careva straža.
- **Hodža i hadžija** (`vino:odze`) sede kraj druge bačve i odmahuju; kad Marko popije, E ih natera da piju („još nagoni odže i adžije da i oni s njime piju vino”), a jedan Turčin otrči: „idu Turci caru na parnicu”.
- **Kolo uz kadune** (`kadune`): E i Marko se uhvati u kolo za poslednju kadunu; posle kola straža upada (4/4). Kad su sva četiri jasaka pogažena, guslar izgovori snimljene stihove koji ih nabrajaju.
- **Megdan sa Ognjenim agom** ostaje kakav je bio.
- **Kupa od dvanaest oka** (`kupa`), posle megdana: Marko sedne pod svoj šator, pred njim kupa; dođu dva mlada čauša (snimljena replika), Marko ustane i razbije kupu o glavu prvog (nov klip `marko-udara-kupom`), drugi pobegne; divan ispričaju četiri postojeće slike, pa sto dukata.

Zvuk: jasak se čuje jednom (čita ga telal, ne više prvi čauš kod prve bačve); slika pre pohoda više ne ponavlja zabranu; guslar peva tužbu Turaka („Idu Turci caru na parnicu”), a ne stihove koje scene već kažu; stara scena sa glasnikom kod treće bačve je zamenjena šatorom posle megdana.

Narudžbine (GPT-6.1-Terra): D113 slike (tabla sa jasakom, zelena dolama na stalku, zaplenjene sablje, Markov šator), D114 likovi (kadune u kolu, hodža i hadžija: odbija i pije, Marko igra kolo, Marko udara kupom), D115 ispravke (prazan stalak, šator bez kupe na sofri). Zeleni ostaci ključa u klipovima čiste se sa `.tmp-edge/cisti-zeleno.py`.

Provera: `pesme-test.mjs` igra ceo pohod (198 provera), `battles-test.mjs` (dve bačve), `road-test.mjs` (bot preskače scenu pod šatorom).

## 19. novembar (7): mera stvari prema Marku

Stefan: „popravi veličine aseta u odnosu na Marka: taj čiviluk je prevelik, mačevi su preveliki itd.”

Marko je u igri visok **128 px** (oko 67 px na metar). Slike iz D107–D115 bile su postavljene po oku i ispale su prevelike. Nova mera (visina crtanja u px):

| Šta | Bilo | Sada |
|---|---|---|
| Čiviluk sa zelenom dolamom (i prazan) | 262 | 124 |
| Polica sa zaplenjenim sabljama | 214 | 88 (sablja oko 74 px) |
| Tabla sa jasakom | 340 | 200 |
| Markov šator | 410 | 300 |
| Bačva (puna, prolivena) | 150, 168 | 120, 134 |
| Hodža, hadžija, derviš (sede) | 94, 94, 91 | 73, 73, 73 |
| Carev čador | 500 | 380 |
| Car (stoji, sedi) | 128, 87 | 118, 75 |
| Mustaf-agina majka | 111 | 98 |
| Perilo na Marici | 206 | 153 |
| Grob neznanog junaka | 185 | 132 |
| Tovar blaga (deveti pohod) | 112×104 | 88×76 |

Mesta u scenama su pomerena prema novoj meri (`CADOR`, `KUPA`). Bačve šestog pohoda se učitavaju unapred (ranije se prva bačva na tren crtala kao tamna elipsa).

## Izvori

- https://sr.wikisource.org/sr-el/Марко_Краљевић_и_Муса_кесеџија
- https://sr.wikisource.org/sr-el/Марко_Краљевић_и_вила
- https://www.enciklopedija.hr/clanak/kraljevic-marko
- https://github.com/aldegad/sprite-gen — Apache-2.0, lokalna alatka za obradu grafike; nije runtime zavisnost.

Nova animaciona grafika i izvorni promptovi: `art/animation-prompts.json`; atlasi `dist/assets/mounted-run.png`, `mounted-jump.png`, `fairy-cast.png`, `marko-attack.png` sa odgovarajućim manifestima. Svi su generisani ugrađenim Imagegen alatom, izdvojeni originalnim sprite-gen komponentnim ekstraktorom i poravnati opcijom centroid.

## Pokretanje dvoklikom

Na Windowsu otvori `Igraj.cmd`. Potreban je Node.js 22+. Launcher pokreće lokalni server i tek kada je spreman otvara browser; ako igra već radi, otvara postojeću instancu. Paket `Marko-Tri-srca-Kacanika.zip` sadrži igru i launcher. Za animacione izvore vidi `art/combat-animation-prompts.json`.
