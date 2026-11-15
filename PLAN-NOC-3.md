# Plan noći 14/15. 11. 2026: „Marko i vila”, Miloš, mapa, meni, jači protivnici

Stefanov spisak (14. 11. uveče, sažeto): kontaktiraj Codex i napravi sve animacije koje fale za Miloša Obilića i vilu Ravijojlu (koristi postojeće, naručuj samo ono što fali, model GPT-6.1-Sol, bez preterivanja); skini pesmu na guslama ako postoji; ceo nivo kao u pesmi „Marko Kraljević i vila” (jašu, Miloš peva, Marko zaspi, vila strelama pogodi Miloša, Marko prebije vilu, igramo kao vila i nalazimo bilje, izlečimo Miloša, jašemo dalje na dva konja); Miloš igriv lik; popraviti Mapu putovanja (dugmad skaču zavisno od dužine opisa), nacrtati lepšu mapu (Kosovo, Makedonija i šta treba) na koju se postavljaju nivoi; deseti nivo sa šest delova ne valja na mapi; meni živiji, zelena boja bez karaktera, mora da bude SRPSKO; bolja muzika; protivnici dosta jači i zanimljiviji; nivoi duži i smisleniji, nivo po nivo; mehanika bez bagova; bolje pratiti pesme i naći još inspiracije; „Marko i vila” maksimalno detaljno; na kraju push na git. Radi celu noć, na svakih sat vremena dodaj detalje iz pesama.

Stanje se upisuje ovde (✔ gotovo, ◐ u toku, ☐ nije počelo, ✖ odustato uz razlog). Dnevnik po satima je na dnu.

## Šta već imamo (pregled 14. 11. u 22 h)

- Vila: `vila-let`, `vila-carolija`, `vila-isceljenje`, `vila-spreda`, `fairy-cast`. Šarac: `sarac-galop`, `cast/sarac`, Marko na Šarcu `mounted-run`, `mounted-jump`, `marko-mounted-attack`. Potera za vilom na Šarcu već postoji u Ravijojlinoj šumi (`potera` u `dist/world.js`).
- Miloš: nema nijednog crteža u igri. Na GitHubu je PR #3 (nacrt) sa 24 dobro opisana posla za Miloša, vilu i Marka, ali bez slika; PR #4 je odvojena stranica od 5 minuta (`miroc-episode.html`), nije u igri i Miloš je tamo prefarbani sabljaš. U Preuzimanjima je samo video Miloševog konja bez jahača (dorat, crven čaprak sa belim orlom): uzor za konja.
- Pesma: `pesme/04-Марко-Краљевић-и-вила.txt` (Vuk II, Miroč) i varijanta `05-…-вила-Равијојла.txt`.

## Faze

### 1. Codex: animacije koje fale (DOPUNA-48, GPT-6.1-Sol, medium) ✔ (D48–D51)
Jedna Codex sesija, redom, najviše 3 pokušaja po klipu, bez izvoza ako lik nije isti. Prvo `milos-idle` koji ja pregledam i odobrim kao uzor lika, pa ostalo sa njegovim kadrom 0 kao ulazom.
- Miloš peške (igriv): `milos-idle`, `milos-run`, `milos-jump`, `milos-attack` (sabljom), `milos-hurt`, `milos-pada` (pogođen, padne), `milos-ranjen` (leži, drži grlo i grudi), `milos-ustaje` (izlečen ustaje).
- Miloš na svom konju: `milos-jase` (kas, peva, petlja), `milos-galop` (petlja).
- Marko: `marko-dremlje` (spava na Šarcu naslonjen na oblučje, korak), `marko-bije-vilu` (koštac: vila na zemlji, Marko je bije buzdovanom).
- Vila: `vila-strela` (zape luk, pusti belu strelu), `vila-pada` (pogođena buzdovanom među pleći, pada s neba), `vila-bere` (bere bilje, petlja).
- Slika: nova Mapa putovanja (DOPUNA-49, jedna slika).

### 2. Nivo „Marko i vila” po pesmi ✔ (najvažnije, maksimalno detaljno)
Ravijojlina šuma postaje pesma od početka do kraja, stih po stih:
1. Dva pobratima jašu preko Miroča uporedo (Marko na Šarcu, Miloš na doratu), razgovor iz pesme.
2. Marko drema i traži pesmu; Miloš odbija (sinoć pio vino sa vilom, zapretila mu); Marko: „Pevaj, ne boj se vile dok je mene, Šarca i šestopera”.
3. **Igra se Milošem**: pevanje uz gusle (Miloš peva o starim kraljevima i zadužbinama po Maćedoniji, vila otpeva; igrač drži ritam, Miloševo grlo je lepše). Marko spava na Šarcu.
4. Vila se rasrdi, odskoči u Miroč, dve bele strele: u grlo i u srce. Miloš pada: „Jao moja majko!”.
5. Marko se trgne, zateže kolane, grli Šarca i obećava srebrne potkove (tekst pesme), pa potera: vila po vrhu planine, Šarac po sredini; kad je ugleda, skok od tri koplja u visinu.
6. Vila prne pod oblake; Marko baci buzdovan, obori je, bije je („Zašto, vilo…”); vila ga Bogom bratimi i Svetim Jovanom.
7. **Igra se vilom**: leti po Miroču i bere bilje; mora često da se odzove („Sad ću doći, Bogom pobratime!”) ili Marko kreće za njom.
8. Isceljenje: grlo lepše nego što je bilo, srce zdravije.
9. Jašu dalje na dva konja (Marko na Šarcu, Miloš na svom): Poreč, gaz preko Timoka kod Bregova, ka Vidinu; vila drugaricama: „Ne streljajte junake dok je Marka i Šarca”.
- Mehanika mora da bude bez bagova: test za svaki korak (prelazi igra, ne može da se zaglavi, padne, ostane bez cilja).

### 3. Miloš igriv ✔
Igrač može da igra Milošem: klipovi `milos-*` u Markovom telu (crtanje igrača bira lik), sopstveni potezi sabljom, bez Markovog buzdovana i vina. Prvo u nivou „Marko i vila”, posle u izboru junaka gde ima smisla.

### 4. Mapa putovanja ✔
- Detalj pesme sa stalnim rasporedom: slika, naslov, opis u okviru fiksne visine (skrol ako je dug), dugmad uvek na istom mestu.
- Nova naslikana mapa srednjovekovnih srpskih zemalja (Prilep, Skoplje, Kačanik, Kosovo, Šar-planina, Ibar, Zvečan, Miroč, Timok, Vidin, Ohrid, Morava, Dunav); čvorovi po stvarnim mestima iz pesama.
- Megdan na Kačaniku više nije jedan čvor sa šest dugmića: tri prava nivoa na mapi (Zatvoreni drum sa putnicima, Vilinski trag i Šarčev zalet, Megdan sa Musom).
- Raspored nivoa po redu pesama i Markovog života.

### 5. Meni, srpski izgled ✔
Zelenu boju panela zameniti srpskom paletom (tamnocrvena, zlato, pergament, vez i šara pirotskog ćilima), živiji meni (pokret, vatra, barjak), sve na ćirilici kao podrazumevano.

### 6. Protivnici i nivoi ◐ (nivo po nivo, u toku)
Nivo po nivo: jači i zanimljiviji protivnici (novi potezi, čitljiv znak napada, kombinacije), duži i smisleniji nivoi sa detaljima iz pesama (svakog sata po jedan nivo: pesma, likovi, mesta, stihovi).

### 7. Muzika ◐ (čeka Stefanovu odluku)
Bolja muzika bez kvarenja postojeće: tražim slobodne snimke gusala i narodnih instrumenata (Wikimedia, archive.org); preuzimanje tek uz Stefanovo odobrenje (ime fajla, izvor, veličina).

### 8. Kraj ☐
Svi testovi, snimci iz igre, jutarnji izveštaj (`docs/JUTARNJI-IZVESTAJ-3.md`), push na `main`.

## Pesma na guslama
Traži se snimak „Marko Kraljević i vila” na guslama sa slobodnom licencom. Ništa se ne preuzima bez Stefanove potvrde.

## Dnevnik
- **22:15–00:00** — Plan napisan. Codex DOPUNA-48 tura A (GPT-6.1-Sol, 7 poziva): prihvaćeni `milos-idle`, `vila-strela`, `vila-pada`, `vila-bere`, `marko-dremlje`; `marko-bije-vilu` odbila moderacija (tuča), u turi B je blaži `marko-nad-vilom`. Tura B (Miloš: trk, skok, mač, rana, ustajanje, jahanje, galop, strela) radi. Nivo „Marko i vila” ugrađen i igra se od prvog do poslednjeg stiha (commit fd15e14): jahanje uporedo, pevanje uz gusle (J/K), dve strele, potera po pesmi (vila se ne vidi pa je Šarac sagleda, Šarčev skok), buzdovan, Marko nad vilom, vila bere bilje sa odzivom, isceljenje, jahanje na dva konja, Miloš peške kao drug. `pesma-vila-test.mjs` (34 provere) i ceo skup testova prolaze. Test je našao bag (vila je odmah ponovo brala ispušteno bilje), ispravljen. Nije provereno: kako se igra na pravom ekranu sa mišem/tastaturom, glasovi (pesma za sada nema snimljen glas, samo tekst).
- **00:00–00:40** — Tura B (Codex): prihvaćeno 7 klipova Miloša, a dva odbijena pokušaja sam izvezao bez novog kredita (`milos-run`, `marko-nad-vilom`); `milos-strela` odbila moderacija. Miloš je igriv (H). Nova naslikana mapa (Codex DOPUNA-49, jedan pokušaj): pohodi kraj mesta svojih pesama, Kačanik kao tri poglavlja, panel stalne visine, Marko na Šarcu kod sledećeg poglavlja. Paneli u srpskoj tamnocrvenoj umesto zelene, ram pauze kao crveni somot. Jači protivnici (snaga po poglavljima, BESAN, IZMAČE SE). Commitovi 7678682, cbcdffe, 25fbfde; svi testovi prolaze. Gusle: slobodnog snimka „Marko i vila” nema; na Wikimedia Commons je „Marko Kraljević i Musa Kesedžija (dio).ogg” (CC BY-SA 3.0, 2,47 MB) — čeka Stefanovu potvrdu za preuzimanje. Muzika: slobodni „srednjovekovni” komadi na OpenGameArt nisu srpski; predlog čeka jutro.
- **00:40–01:20** — Nivo po nivo, scene iz pesama: Kosovsko selo (vašar konja, Marko bira Šarca, Novak potkuje), Manastirski vis („Bježi Marko oko b’jele crkve”: triput oko Samodreže, „Bjež’ u crkvu”, handžar u direku, kajanje, glas, kletva i blagoslov), Opsednuta tvrđava (Mustaf-aga i priča sa Marice, sablja sama iskoči, tri slova, car do duvara i sto dukata). Commitovi 3ec6644, 49429d2 i sledeći; `pesme-test.mjs` 25 provera. Codex DOPUNA-50 (Vukašin, crkva, bilje) radi.
- **01:20–01:45** — Klisura Ibra po pesmi „Marko Kraljević i Đemo Brđanin”: Marko po majčinoj reči ide bez oružja, Đemo baca topuz u oblake i obara ga, okiva u bukagije, belenzuke i sindžir (Marko hoda okovan, bez udarca i skoka; ko zaostane, Đemo ga vuče). Vešala pod Oridom, Vučitrnom i Zvečanom, gospoda plaćaju po tri tovara blaga („tu nam nemoj objesiti Marka, neće rodit vino ni šenica”). Janjina mehana: vino od sedam godina sa biljem, „pade Đemo glavom bez uzglavlja”, Janja raskiva Marka, Đemo beži na megdan; posle megdana Marko vraća blago i nosi ribu od Orida na slavu. Codex D50 (Sol, 7 poziva) gotov: kralj Vukašin (udarac u direk; trk od četiri dobra kadra trećeg pokušaja), naslikana crkva Samodreža i pet biljaka sa Miroča, sve ugrađeno. Popravke: kamera drži oba lika, nema čekpoint barjaka, saveta ni ukrasa usred scene. Svi testovi prolaze. Commit `9c683c1`.
- **01:45–02:50** — Podrum po pesmi „Marko pije uz ramazan vino”: na prvoj bačvi čauš čita carev jasak (četiri zabrane: vino, zelena dolama, okovana sablja, kolo uz kadune), posle prve čaše pesma kaže šta Marko radi; kod poslednje bačve dva mlada čauša zovu na divan, Marko ih dočeka kupom od dvanaest oka, a divan je minijatura iz pesme (kalpak na oči, „čelo gori, s carem se govori”, „teško onom tko j’ najbliže Marka”, car do duvara, sto dukata). Commit `dc22794`. Reka po pesmi „Marko Kraljević i Filip Madžarin”: pismo Zmaj-Despota Vuka, nova mehana u Karlovcu, Marko sedne da pije, Šarac ne pušta Filipa na vrata i zakuka kad ga Filip bije, E: „Propusti ga u mehanu, Šarče!”, Filip udara a Marko „ni habera nema” („ne budi mi po kožuhu buha”), razbijena čaša i prosuto vino, Marko skoči i počinje megdan; posle „Dobra gvožđa u loša junaka!”. Codex D51 (Sol) crta Filipa: idle, trk (treći pokušaj) i udarac gotovi, rana i smrt u radu.
- **02:50–03:55** — Filip Madžarin od Codexa (D51, Sol): stajanje, trk, udarac, rana, smrt; svih pet pregledano pored Marka i ugrađeno (commit `c8797f8`), Reka sa mehanom commit `6b8d33f`. Zimski prevoj po pesmi „Marko Kraljević i Vuča dženeral”: Miloševo pismo krvlju zapečaćeno, Marko preko Dunava bez skele, pod Varadinom koplje u ledinu i Šarac za koplje, „pola pije, pola Šarcu daje”, Velimirovica sa bedema („nešto crno drži u zubima, kolik’ jagnje od pola godine”), Vuča šalje Velimira sa katanama, Šarac kopitom upozori, E i Marko na Šarcu „kako soko među golubove”, Velimir svezan, Vuča drmne topove i šalje još katana, Vuča bežeći pada od bačenog topuza, dženeralovica pušta tri vojvode, Miloš zahvaljuje.
- **03:55–04:45** — Ruševine po pesmi „Marko Kraljević ukida svadbarinu”: na početku nivoa Kosovka devojka, lepa a seda, razgovor stih po stih (Arapova svadbarina, trideset i trideset i četiri dukata, noćas je red na nju, „volim, brate, izgubiti glavu”), Marko joj da trideset dukata, ona pokaže svilen barjak nad Arapovim šatorom, „Oj davori, ti Kosovo ravno… osvetiti, ili poginuti”. Prevoj: Marko na Šarcu ostaje u polju pod Varadinom dok vojvode ne izađu (ne može da odjaše u penjačke sobe). Codex D52 (Sol) crta Kosovku devojku; do tada se crta mladom iz svatova.
- **04:45–05:30** — Codex D52: Kosovka devojka (stajanje, hod), ugrađena. Svi testovi i provere (check, npm test, animacije, simulacija) prolaze; **push na main** (`5b64aa6..9bd660e`). Kačanik: posle pobede nad Musom kraj pesme u minijaturama (vila iz oblaka, tri srca i guja na trećem, „đe pogubih od sebe boljega”).
- **05:30–06:10** — Objava na GitHub Pages uspela. Pregled novih scena na granične slučajeve: scena koja preuzme kontrole sada počinje čisto (Marko na zemlji i peške, bez zaostalog udarca, pića ili zaleta); okovi ne počinju dok je Marko u skoku (ranije je mogao da lebdi celu scenu). Testovi za to.
