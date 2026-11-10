# Dopuna 36 (od Claude-a): scene između pohoda

Kad počne novi pohod, igrač sada odmah upada u borbu. Pre svakog pohoda treba da se odigra kratka scena po pesmi: dve minijature sa tekstom i jedna oživljena scena. Igra ih prikazuje u istom okviru kao uvod.

**Minijature:** isti stil kao `dist/assets/ui/minijature/hd/minijatura-drum.webp` i ostale minijature uvoda: srpska freska i minijatura, zlatna pozadina, topla paleta, likovi sa jasnim licima. PNG 1024×1024, a ime je `prelaz-<pohod>-1.png` i `prelaz-<pohod>-2.png`.

**Oživljena scena:** slikana kao igra, istim stilom kao `pauza-logor` (logorska vatra u pauzi). Traka ima 12 kadrova od 768×512 (9216×512), kadrovi idu sleva nadesno, a petlja je bez skoka. Kreću se samo male stvari: vatra, voda, barjak, plašt, griva, krila i dim. Ime je `prelaz-<pohod>-anim.png`, uz manifest i preview.gif u `art/animation-pack-04/assets/prelaz-<pohod>-anim/`.

Marko je uvek isti: crn brk, crven plašt, krzneni kalpak ili gologlav, pancir, topuz o pojasu i šarac konj (beo sa riđim pegama). Turci nose turbane, a srpski likovi ne. Bez krvi izbliza.

Slike idu na vrh paketa: `art/world-pack-03/<fajl>`. Posle svake stavke upiši red u `STATUS-ANIMACIJE.md`. Posao je podeljen na tri dela, jedan po pokretanju.

## Deo A

| Pohod | Minijatura 1 | Minijatura 2 | Oživljena scena |
|---|---|---|---|
| `selo` | Seoski kovač potkiva Šarca, a Marko drži uzdu. Jedna potkova leži na nakovnju. | Turski odred opkoljava kosovsko selo, žene sklanjaju decu, a Marko izjahuje kroz kapiju. | Marko jaše Šarca drumom ka selu u zoru, a srpski barjak se vije. |
| `klisura` | Guslari sede kraj Ibra pod hrastom, a narod sluša pesmu o Marku. | Turci otimaju i lome gusle, a starac guslar ih štiti telom. | Stari guslar svira kraj vatre na obali Ibra, a reka teče. |
| `suma` | Vila Ravijojla se javlja Marku među bukvama, sva u svetlosti. | Palikuće pale bukvu na kojoj orlušina ima gnezdo sa orlićima. | Orlušina kruži nad šumom, a dim se diže iz daljine. |
| `manastir` | Četiri carevića se svađaju pred manastirom čije je carstvo (pesma „Uroš i Mrnjavčevići“). | Marko pred carskom knjigom presuđuje po pravdi, a kaluđeri gledaju. | Manastirska zvona se njišu u zvoniku, a golubovi lete. |

## Deo B

| Pohod | Minijatura 1 | Minijatura 2 | Oživljena scena |
|---|---|---|---|
| `tvrdjava` | Tvrđava gori pod turskom opsadom, a katapulti bacaju vatru. | Mladi Turčin za pojasom nosi sablju sa tri zlatna balčaka: sablju kralja Vukašina. | Marko na Šarcu na brdu gleda tvrđavu koja gori, a plašt mu se vije. |
| `prevoj` | Musa Kesedžija baca topuz u oblake i dočekuje ga u ruke. | Zaleđen prevoj, a na vrhu Musin odred kraj kule. | Marko vodi Šarca kroz mećavu, a sneg veje. |
| `pecina` | Ravijojla vodi Marka u pećinu, a kristali svetle plavo. | Turci se zavlače u pećinu sa bakljama. | Kristali u pećini trepere, a kapi padaju u jezerce. |
| `podrum` | Marko javno pije vino uz ramazan pred carevim čaušima (pesma „Marko pije uz ramazan vino“). | Car šalje po Marka, a Marko dolazi sa topuzom i staje pred cara. | Marko toči vino iz bačve u podrumu, a baklje trepere. |
| `mocvara` | Turci strelama gađaju sokola nad trskom. | Marko previja sokolu slomljeno krilo. | Soko leti nad močvarom pod mesecom, a trska se njiše. |

## Deo C

| Pohod | Minijatura 1 | Minijatura 2 | Oživljena scena |
|---|---|---|---|
| `rudnik` | Marko ostavlja tri kese dukata: jednu crkvi, jednu sirotinji i jednu za sahranu (pesma „Smrt Marka Kraljevića“). | Oklopnici čuvaju ulaz starog rudnika. | U rudniku se ljuljaju fenjeri i prolaze kolica. |
| `rusevine` | Arapin je kraj mora podigao kulu i uzima svadbarinu od svatova. | Zarobljeni svatovi u kavezima na ruševinama. | Oslobođeni svatovi igraju kolo, a mlada i mladoženja vode. |
| `reka` | Marko i Šarac pred rekom u zoru, a preko reke je Urvina planina. | Turski odred gazi reku. | Vodenica se okreće, a reka teče pod zorom. |
| `oranje` | Majka moli Marka da ostavi četovanje i da ore (pesma „Oranje Markovo“). | Marko ore drumove, a ne brda i doline, a Turci sa tovarom zastaju. | Marko ore drum sa dva vola, a ptice slede brazdu. |
