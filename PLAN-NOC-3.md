# Plan noći 14/15. 11. 2026: „Marko i vila”, Miloš, mapa, meni, jači protivnici

Stefanov spisak (14. 11. uveče, sažeto): kontaktiraj Codex i napravi sve animacije koje fale za Miloša Obilića i vilu Ravijojlu (koristi postojeće, naručuj samo ono što fali, model GPT-6.1-Sol, bez preterivanja); skini pesmu na guslama ako postoji; ceo nivo kao u pesmi „Marko Kraljević i vila” (jašu, Miloš peva, Marko zaspi, vila strelama pogodi Miloša, Marko prebije vilu, igramo kao vila i nalazimo bilje, izlečimo Miloša, jašemo dalje na dva konja); Miloš igriv lik; popraviti Mapu putovanja (dugmad skaču zavisno od dužine opisa), nacrtati lepšu mapu (Kosovo, Makedonija i šta treba) na koju se postavljaju nivoi; deseti nivo sa šest delova ne valja na mapi; meni živiji, zelena boja bez karaktera, mora da bude SRPSKO; bolja muzika; protivnici dosta jači i zanimljiviji; nivoi duži i smisleniji, nivo po nivo; mehanika bez bagova; bolje pratiti pesme i naći još inspiracije; „Marko i vila” maksimalno detaljno; na kraju push na git. Radi celu noć, na svakih sat vremena dodaj detalje iz pesama.

Stanje se upisuje ovde (✔ gotovo, ◐ u toku, ☐ nije počelo, ✖ odustato uz razlog). Dnevnik po satima je na dnu.

## Šta već imamo (pregled 14. 11. u 22 h)

- Vila: `vila-let`, `vila-carolija`, `vila-isceljenje`, `vila-spreda`, `fairy-cast`. Šarac: `sarac-galop`, `cast/sarac`, Marko na Šarcu `mounted-run`, `mounted-jump`, `marko-mounted-attack`. Potera za vilom na Šarcu već postoji u Ravijojlinoj šumi (`potera` u `dist/world.js`).
- Miloš: nema nijednog crteža u igri. Na GitHubu je PR #3 (nacrt) sa 24 dobro opisana posla za Miloša, vilu i Marka, ali bez slika; PR #4 je odvojena stranica od 5 minuta (`miroc-episode.html`), nije u igri i Miloš je tamo prefarbani sabljaš. U Preuzimanjima je samo video Miloševog konja bez jahača (dorat, crven čaprak sa belim orlom): uzor za konja.
- Pesma: `pesme/04-Марко-Краљевић-и-вила.txt` (Vuk II, Miroč) i varijanta `05-…-вила-Равијојла.txt`.

## Faze

### 1. Codex: animacije koje fale (DOPUNA-48, GPT-6.1-Sol, medium) ◐
Jedna Codex sesija, redom, najviše 3 pokušaja po klipu, bez izvoza ako lik nije isti. Prvo `milos-idle` koji ja pregledam i odobrim kao uzor lika, pa ostalo sa njegovim kadrom 0 kao ulazom.
- Miloš peške (igriv): `milos-idle`, `milos-run`, `milos-jump`, `milos-attack` (sabljom), `milos-hurt`, `milos-pada` (pogođen, padne), `milos-ranjen` (leži, drži grlo i grudi), `milos-ustaje` (izlečen ustaje).
- Miloš na svom konju: `milos-jase` (kas, peva, petlja), `milos-galop` (petlja).
- Marko: `marko-dremlje` (spava na Šarcu naslonjen na oblučje, korak), `marko-bije-vilu` (koštac: vila na zemlji, Marko je bije buzdovanom).
- Vila: `vila-strela` (zape luk, pusti belu strelu), `vila-pada` (pogođena buzdovanom među pleći, pada s neba), `vila-bere` (bere bilje, petlja).
- Slika: nova Mapa putovanja (DOPUNA-49, jedna slika).

### 2. Nivo „Marko i vila” po pesmi ☐ (najvažnije, maksimalno detaljno)
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

### 3. Miloš igriv ☐
Igrač može da igra Milošem: klipovi `milos-*` u Markovom telu (crtanje igrača bira lik), sopstveni potezi sabljom, bez Markovog buzdovana i vina. Prvo u nivou „Marko i vila”, posle u izboru junaka gde ima smisla.

### 4. Mapa putovanja ☐
- Detalj pesme sa stalnim rasporedom: slika, naslov, opis u okviru fiksne visine (skrol ako je dug), dugmad uvek na istom mestu.
- Nova naslikana mapa srednjovekovnih srpskih zemalja (Prilep, Skoplje, Kačanik, Kosovo, Šar-planina, Ibar, Zvečan, Miroč, Timok, Vidin, Ohrid, Morava, Dunav); čvorovi po stvarnim mestima iz pesama.
- Megdan na Kačaniku više nije jedan čvor sa šest dugmića: tri prava nivoa na mapi (Zatvoreni drum sa putnicima, Vilinski trag i Šarčev zalet, Megdan sa Musom).
- Raspored nivoa po redu pesama i Markovog života.

### 5. Meni, srpski izgled ☐
Zelenu boju panela zameniti srpskom paletom (tamnocrvena, zlato, pergament, vez i šara pirotskog ćilima), živiji meni (pokret, vatra, barjak), sve na ćirilici kao podrazumevano.

### 6. Protivnici i nivoi ☐
Nivo po nivo: jači i zanimljiviji protivnici (novi potezi, čitljiv znak napada, kombinacije), duži i smisleniji nivoi sa detaljima iz pesama (svakog sata po jedan nivo: pesma, likovi, mesta, stihovi).

### 7. Muzika ☐
Bolja muzika bez kvarenja postojeće: tražim slobodne snimke gusala i narodnih instrumenata (Wikimedia, archive.org); preuzimanje tek uz Stefanovo odobrenje (ime fajla, izvor, veličina).

### 8. Kraj ☐
Svi testovi, snimci iz igre, jutarnji izveštaj (`docs/JUTARNJI-IZVESTAJ-3.md`), push na `main`.

## Pesma na guslama
Traži se snimak „Marko Kraljević i vila” na guslama sa slobodnom licencom. Ništa se ne preuzima bez Stefanove potvrde.

## Dnevnik
