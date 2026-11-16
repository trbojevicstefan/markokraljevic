# Jutarnji izveštaj 4 · noć 15. na 16. 11. 2026

Stefan je uveče rekao: „Svakog sata po jedno poboljšanje i commit. Najbitniji je gameplay: svaki protivnik drugačijeg stila, brzi, sa svojim udarcima. Unesi raznolikosti, pogotovo kod sinematik događaja. Ne pitaj ništa, samo radi.”

Rad je tekao naizmenično, jedan sat film i jedan sat protivnik, po spisku `docs/NOC-PROTIVNICI.md`. Posle svake ture je pušten ceo lanac testova, pa commit i objava. Svaka tura je proverena i slikom iz igre (bezglavi Edge).

## Šta je urađeno

### Filmski trenuci

| Stavka | Šta se vidi | Commit |
|---|---|---|
| F1 kill-cam | Poslednji dušmanin bitke pada usporeno, uz zum i zvono, a iskoči natpis „DRUM JE ČIST”. | `f175cd5` |
| F2 uvod megdana | Kamera pređe na bosa pa se vrati na Marka. Ime bosa ide velikim slovima, ispod je podnaslov za svakog od 14 bosova (npr. Crni vrač, „senka iz jaruge”). Bos sačeka 1,3 s pre prvog poteza. | `ef68480` |
| F3 tiho obaranje | Jači zum, boje izblede skoro do sivog, a ivice slike potamne. | `25679ed` |
| F4 junački udar (R) | Na vrhu zamaha kadar stane 0,32 s, slika se zumira na Marka, a crvena crta preseče ekran. Tek onda udarac padne. | `28c5f39` |
| F5 kad Marko padne | Pad teče upola brzine, slika se zumira na Marka i ode u sepiju pre ekrana „Ustani, junače”. | `01ecc3c` |

### Protivnici

| Stavka | Novi stil | Commit |
|---|---|---|
| 1 sabljaš | Varka: zamahne pa stane. Ko odbije u prazno, odmah dobija dvostruki rez (crven krst, samo kolutom se izbegne). Posle udarca brzo odskoči unazad. | `71a4c61` |
| 2 strelac | Kad mu Marko priđe, pravi salto unazad i odmah zapne luk. Izdaleka pušta kišu strela, a senke na zemlji pokazuju gde će pasti. | `e3642e9` |
| 3 kopljanik | Dugi ubod preko pola ekrana (zlatni znak, može se odbiti). Ranjen stane u zid koplja: spreda ga ništa ne probija, a prolaze skok preko njega, udarac odozgo i udarac s leđa. | `a538732` |
| 4 akindžija | Munja: trgne se u stranu od zamaha, uz trag za sobom. Prolazi kroz Marka i udari ga s leđa (crven krst). | `2454d76` |

### Šta je Stefan tražio tokom noći

| Commit | Šta |
|---|---|
| `09ef205` | Završni udarac vraća 5 zdravlja. Tri laka udarca su različita (J, J J, J J J). Nove kombinacije J K „Obarač” i J J J K „Tresak niza”. |
| `2ef9d9e` | Kombinacije sa šutom: J J S+J „Junački šut”, S+J pa J „Za njim!”, S+J pa K „Zakucaj”. Držanje J više ne ponavlja udarac. |
| `63553a1` | Shift bez pravca je odskok unazad; sa pravcem je kolut kao do sada. |
| `71e3b05` | Telefon: uzan okvir bosa, prompt koštaca po uređaju, brže crtanje. Konji na vašaru se ritaju umesto da lete. |

### Usput popravljeno

- **Vetar u prevoju:** više ne gura Marka u skoku. Ranije ga je gurao jače nego na zemlji, pa je udar usred skoka bacao u jamu (`a538732`).
- **Testovi:** neki su čekali tačan broj kadrova, pa su produženi tamo gde je novi film namerno dodao vreme: zamrznut kadar junačkog udara, usporen pad i uvod megdana.

### Jutros (Stefan, posle 9 h)

Ovo ide u poseban commit, posle ovog izveštaja.

- **Tekstovi na vrhu:** na računaru razgovor i kartica nove veštine („New power”) idu gore u sredinu, između Markovog okvira i zadatka. U megdanu stoje ispod okvira bosa. Na telefonu ostaju dole, kako je traženo 16. 11.
- **Miloš na konju:** stoji na zemlji kao i Marko. Bio je postavljen 12 px iznad tla.
- **Vilinsko kolo u šumi** (ploče pred velikom jamom):
  - **Uzrok:** kolo se uopšte nije crtalo. Igra je tražila njegovu poziciju preko kapije ili koturače, a kolo nema ni jedno ni drugo. Zato se nisu videli ni kamenovi, ni svici, ni most, a „POGREŠNO · GLEDAJ SVICE” je iskakalo kad se slučajno stane na nevidljivu ploču.
  - **Prikaz sada:** kolo se crta. Dok svici pokazuju redosled, kamera gleda celo kolo i jamu. Iznad kamenova piše „GLEDAJ SVICE” i pale se brojevi 1, 2, 3, 4, a veliko jato svitaca leti od kamena do kamena.
  - **Kamenje:** tamne ploče koje su izgledale kao da lebde zamenjene su gomilama kamena sa runama, koje leže u travi. Upaljeno kamenje sija, uz zeleni krug na zemlji.
  - **Igranje sada:** posle prikaza piše „STANI NA KAMENOVE ISTIM REDOM · 0 / 4”, a pogođen kamen ostaje upaljen. Posle dve greške brojevi ostaju bledo kao pomoć. Preko jame stoji bleda isprekidana senka mosta, dok se most ne pojavi.
- **Kamenje i poluge na E:** sijaju, imaju stub svetlosti, strelicu i krug na zemlji („STANI U KRUG (E)”). Kad su van ekrana, na ivici stoji strelica u njihovom pravcu.
- **Brzina:** dušmani daleko van ekrana, mirni i neuzbunjeni, više se ne računaju svaki kadar. Računanje dušmana je oko 3× jeftinije. Izmereno je:

| Gde | Koliko traje kadar |
|---|---|
| Računar (Selo, Šuma, Prevoj; 1280 i 1920 px) | Sredina oko 9–10 ms. U pravom hodu kroz selo bio je samo jedan kadar duži od 40 ms. |
| Kao telefon (dodir, 844×390, procesor 4× sporiji) | Sredina oko 19–22 ms. Najviše vremena troši crtanje slika (`drawImage`). To još nije rešeno i traži merenje na pravom telefonu. |

## Šta da proveriš

| Šta | Gde |
|---|---|
| Uvod megdana (ime bosa, kamera) | `?dev&go=vrac` ili `?dev&go=hasan` |
| Junački udar | Napuni bes, pa R u bilo kom pohodu |
| Novi protivnici (sabljaš, strelac, kopljanik, akindžija) | `?trening`, svi tipovi redom |
| Pad Marka (usporenje, sepija) | Pusti da te dušmani obore u selu: `?dev&novo=selo` |
| Tiho obaranje (boje izblede) | Priđi uspavanom dušmaninu s leđa i pritisni J |
| Vilinsko kolo, kamenje i tekstovi na vrhu | `?dev&novo=suma` |
| Vetar u prevoju | `?dev&novo=prevoj` |
| Telefon | Kolo i strelice na E (tekstovi su tamo i dalje dole) |

## Šta nije urađeno

- **Protivnici 5–12 iz noćnog spiska:**
  - palikuća sa vatrenim zidom;
  - oklopnik sa kovitlacem;
  - štitonoša sa kornjačom;
  - tufekdžija sa nišanom;
  - čopor pasa;
  - elitni dodaci;
  - kretanje protivnika;
  - kombinovane čete.
- **Filmski F6–F8:**
  - naslovna kartica nove zemlje;
  - faze bosa;
  - usporenje pri savršenom odbijanju.
- **Brzina na telefonu:** treba izmeriti na pravom telefonu. Bezglavi pregledač to samo približno pokazuje.
