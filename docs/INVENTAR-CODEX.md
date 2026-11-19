# Inventar: šta Codex treba da nacrta (18. 11. 2026)

Stefan (18. 11.): „obavezno napravi inventar svega što treba da naručimo Codexu i naruči”. Na nalogu je ostalo oko 8 % Codexa, pa je spisak poređan po važnosti: **odmah** ide u narudžbinu ove ture, **sledeće** čeka nova sredstva. Model: GPT-6.1-Terra (`.tmp-edge/codex-run-terra.sh <N>`). Terra često stane ili odbije dobar pokušaj zbog svojih mera: posle svake narudžbine pregledati `art/animation-pack-04/sources/<klip>/attempt-N` i izvesti sam.

## Već nacrtano ove ture (D93–D101)

| Šta | Narudžbina | Stanje |
|---|---|---|
| Letnji teren „Pod Varadinom” (nebo, daljina, srednji, bliži ×3, prednji, tlo, tri slike prelaza) | D93 | u igri |
| Vuča dženeral na bedeviji, 9 klipova | D94 | u igri, megdandžija |
| Katane (ugarski husari), 8 klipova | D95 | u igri |
| Velimirovica, Toplica, Kosančić, knjigonoša | D96 | u igri |
| Marko poji Šarca / pije sedeći | D97 | u igri (izvezeno ručno) |
| Šarac se rita sa Markom | D98 | u igri |
| Bedemi, kule, kapija, srušen bedem, bedem sa stepenicama, koplje u ledini | D99 | sve u igri pod Varadinom (19. 11.: iza polja zid, gradska kapija i četvrtasta kula do zida sa stepenicama; srušen bedem pre logora) |
| Konj se rita bez jahača, Šarac se upire za rep | D100 | u igri (izvezeno ručno) |
| Šarac se okreće sa Markom | D101 | u igri (izvezeno ručno) |

## Naručeno ove ture (~8 %), sve stiglo i u igri

| Šta | Zašto | Narudžbina |
|---|---|---|
| **Posmatrači, obični ljudi** (5 likova): seljanka sa korpom grožđa, dečak koji maše, starica koja se krsti, ribar sa mrežom, građanin Varadina | Stefan: „napravi još posmatrača običnih ljudi”; pesma se priča i kroz narod | D102 ✔ (5 likova, pod Varadinom duž puta) |
| **Katana u gardu** (sablja ukrštena za odbranu) i **katana gard slomljen** | nova mehanika borbe: gard koji se probija kombom | D102 ✔ |
| **Merdevine** (pločica tela koja se ponavlja u visinu + vrh) | Stefan: „ove su baš jadne” | D103 ✔ (sve merdevine u igri) |
| **Rekviziti Varadina**: skela na Dunavu, top na lafetu, žuto-crni barjak, korpe grožđa, ribarska mreža na kocu, mešina i leđen u travi | „rekvizita … lepo ih raspodeli” | D103 ✔ (top i barjak na bedemima Varadina; korpe među ukrasima; od 19. 11. skela stoji na drugoj obali Dunava, mreža kod ribara, a mešina i leđen kod Markovog koplja) |

## Sledeće (kad bude Codexa)

| Šta | Gde | Napomena |
|---|---|---|
| Velimir, mladi sin Vuče, na vrancu (kit kao beg ili jahač) | Pod Varadinom, prvi talas katana | sada se samo pominje u stihovima |
| Dženeralovica (piše knjigu Marku, otvara tamnicu) | kraj pohoda | jedan `-idle` i jedan `-pise` |
| Vučine zlatne karuce sa vrancima (Miloš traži da poveze starog Toplicu) | kraj pohoda, slika prelaza | jedna velika slika |
| Tamnica Varadina iznutra (voda do kolena, rešetka) | soba `tamnica` | od 19. 11. je nacrtana kodom u luku zida (kosti, voda, rešetka); slika bi bila lepša |
| Krčma kod Beograda sa natpisom, skeledžija koji beži | soba `dunav` | sada je krčma `prop-kuca` |
| Markova tanka kula u Prilepu | soba `prilep` | sada je `prop-bedem-kula` |
| Noćna i olujna verzija slojeva Varadina | varijante noć/oluja | sada se daje dan sa zatamnjenjem |
| Naslikani stari zidovi sa lukom (soba `bedem` po celoj igri) | svi pohodi sa sobom `bedem` | po uzoru na D99 |
| Posmatrači za ostale pohode (Manastir, Oranje, Tvrđava) | | po 3 lika, kao D102 |
| `vrac-death` | Crni vrač | jedini klip koji igra traži, a nema ga |
| Telo zemljanog stepenika (Oranje) | | sad izgleda kao dupla greda |
| Glasovi novih replika (ElevenLabs, ne Codex) | | knjigonoša, prolaznici, Vuča |
