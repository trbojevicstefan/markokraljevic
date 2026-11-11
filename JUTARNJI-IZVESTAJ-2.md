# Jutarnji izveštaj 2 — noć 10. na 11. novembar

Sve je u grani `noc-poliranje`, u folderu `D:\projects\Marko Kraljevic\marko-noc`. Ništa nije gurnuto na `main` ni na
GitHub Pages: igra na mreži je ista kao sinoć. Tvoj `main` (do commita 6e5c702) je spojen u granu bez sudara.

## Kako da probaš
```
cd "D:\projects\Marko Kraljevic\marko-noc"
set PORT=4174&& node server.mjs
```
Pa otvori http://127.0.0.1:4174 (sa `?dev` na kraju su otvoreni svi nivoi i sve veštine).

Ako ti se sviđa, spajanje je: u folderu `marko-game` → `git merge noc-poliranje`, pa `git push`.

## Šta je urađeno

**Borba i bosovi**
- Lakim udarcem levo-desno „iz neprijatelja" više se ne ubijaju bosovi. Tri razloga:
  - živ neprijatelj je telo: Marko ne može da stane u njega (kolut, klizanje, juriš i skok prolaze);
  - svaki megdandžija ima **gard**: laki udarac skida trunku, a treći zaredom donosi odgurivanje;
  - gard se lomi teškim udarcima (K), a pun udarac prolazi samo dok je bos otvoren: posle svog zamaha, ošamućen,
    odbijen (L) ili u trenutku koji mu je svojstven (zabio se u stub, sekira u zemlji…).
- Traka garda i tri romba za **tri čina** stoje uz traku zdravlja bosa. Na ulasku u novi čin bos odbaci Marka i na
  trenutak ne prima udarce.
- Svaki bos u drugom i poslednjem činu dobija nov potez: kiša strela ili kamenja sa senkom-upozorenjem, ognjeni lonci,
  skok sa udarnim talasom, tri naleta zaredom, tri koplja.
- **Koštac kod svih megdandžija**: od drugog čina bos upozori („!! HVATA TE · KOLUT") i nasrne. Ako se izmakneš,
  promaši i ostane otvoren; ako te uhvati, otimaš se (J J J), pa ga zbaciš i ostaviš slomljenog garda.
- Kod običnih neprijatelja češće: janičar skoči na oborenog Marka, a onaj iza leđa ume da mu skoči na leđa dok tuče drugog.

**Priča i redosled (po pesmama)**
- Pročitao sam ceo ciklus sa Vikizvornika (30 pesama, u folderu `pesme/`), a u `pesme/BELESKE.md` je za svaku pesmu
  šta daje igri i koji crteži fale.
- Pohodi idu redom Markovog života: Selo (Šarac), Manastir (Uroš i Mrnjavčevići), Oranje, Tvrđava (očina sablja),
  Podrum (ramazan), Močvara (lov i soko), Šuma i Pećina (vila), Zimski prevoj, pa **megdan sa Musom**, pa Klisura,
  Ruševine, Rudnik, Reka i na kraju Urvina.
- Đemo Brđanin je sada bos Klisure, posle Muse, jer u pesmi dolazi da osveti brata. Megdan počinje kao u pesmi:
  Marko je bez topuza i mora da ga dohvati na drugom kraju megdana.
- Nova igra počinje uvodom guslara (tri minijature), a stari uvod o Musi ide pred Kačanik.
- U Manastiru, kad Marko uzme carsku knjigu, igra postavlja pitanje iz pesme: na kome je carstvo? Otac i stričevi su
  pogrešan odgovor (majčine reči, pa pitanje ponovo); Uroš donosi kraljevu kletvu i carev blagoslov do kraja pohoda.
- Prvi pohod sada ima kratku obuku (kretanje, topuz, štit, vila), jer nova igra više ne počinje Kačanikom.

**Novi nivoi**
- **Urvina planina** (poslednji pohod, „Smrt Marka Kraljevića"): uspon od oko 2.900 visine bez ijednog neprijatelja;
  vila govori stihove usput. Na vrhu redom: bunar među dve jele, oproštaj sa Šarcem, lomljenje sablje i koplja, topuz
  u more (taster I), počinak pod jelom, pa četiri završne slike (tri ćemera, Hilandar, „Marko još spava").
- **Let sokola** (početak Noćne močvare, „Lov Markov s Turcima"): igraš kao Markov soko, loviš tri utve zlatokrile,
  izmičeš vezirovom sokolu i udaraš ga dok je umoran; vezir mu slomi krilo i soko padne u trsku baš tamo gde ga Marko
  posle nalazi.
- **Tajni nivo „San Kraljevića Marka"**: otvara se kad na Mapi putovanja ukucaš `MARKO` (nagoveštaj je u Knjizi
  legendi, poglavlje „Marko još spava"). Bez borbe, četiri odaje:
  1. tri slova na sablji (kovač, kralj, sin);
  2. jabuke i prstenovi mudre devojke (ne diraš ni jedno ni drugo);
  3. suva drenovina koja pusti dve kaplje tek posle tri čaše vina;
  4. gusle javorove: melodija se pamti i ponavlja triput, svaki put duža.
- **Potera za vilom** (početak Ravijojline šume, „Marko Kraljević i vila"): uzjašeš Šarca (E), galopiraš za vilom
  preko Miroča, preskačeš balvane dok te ona gađa strelama, a kad je stigneš bacaš topuz (I). Vila izleči Miloša i
  postane posestrima.
- **Odbrana guslara** (Klisura): guslar peva pesmu o Musi, a Turci dolaze u pet četa sa obe strane. Ako ga poseku,
  Marko pada sa pesmom.

**Guslar**
- Skinuo sam ceo snimak sa Vikimedije (5 min 12 s, ista licenca CC BY-SA 3.0, upisano u `GUSLAR-PESMA-LICENSE.txt`).
  U Klisuri pesma teče od guslara do guslara i ne počinje iznova.
- U svakom drugom kraju sedi po jedan guslar koji peva stihove pesme tog kraja (uz gusle, bez snimljenog glasa).

**Dukati i napredovanje**
- **Trgovac kraj puta** stoji pred svakim megdanom (E): vino, melem, naoštren topuz do kraja pohoda i amajlija svetog
  Đorđa koja te jednom digne kad padneš.
- U Riznici, kod kovača, dve nove stavke iz pesama: **zadužbina** (+12 zdravlja i svaki barjak vida rane) i **sofra za
  ništе i uboge** (bes se puni brže).
- **Barjaci unutar pohoda**: ranije te je smrt vraćala na početak nivoa. Sada se na mirnim deonicama i pred megdanom
  podigne barjak, pa nastavljaš odatle; svet ostaje kako si ga ostavio, a bos kome si podlegao dobija snagu nazad.

**Izgled i zvuk**
- Masa stene više nije mreža istih pločica: preko nje idu krupne mrlje i pukotine, a ispod ivice tone u tamu.
- Međukadrovi za trk i hod (Marko i devet vrsta neprijatelja) izračunati su lokalno, bez Codex kredita
  (`python smooth-anims.py`), i igra ih crta između nacrtanih kadrova.
- U pećini, podrumu i rudniku udarci, koraci i glasovi imaju odjek.
- Legenda sa tasterima se povlači dok neko govori i posle prvih pola minuta pohoda.
- Knjiga dušmana ima stranice za deset megdandžija (otvaraju se kad ih pobediš). U Knjizi legendi ispravljena je
  svadbarina (šator na Kosovu; kula je iz pesme „Marko i Arapin") i dopunjen soko pesmom o lovu.

**Alati**
- `http://127.0.0.1:4174/?scout`: razgledanje nivoa bez neprijatelja. Svi pohodi su otvoreni, Marko lebdi na A D W S
  (Shift ubrzava), a gore piše gde se nalazi (nivo, x, y, procenat puta), da se lako zabeleži gde nešto treba da stoji.
- `node megdan-bot.mjs`: bot se bori sa svakim megdandžijom pravim tasterima i ispisuje koliko megdan traje. Ume samo
  običnu borbu (ne penje se na kule, ne odbija konjanika), pa bosove sa posebnim trikom ne pobeđuje; korisno je za
  merenje: Kopljanik-baša pada za oko 55 s, Ognjeni aga za 77 s, Janičarski aga za 137 s.
- `python smooth-anims.py`: međukadrovi (vidi gore).

**Usput popravljeno:** igra se rušila ako se turski top crta pre prvog koraka nivoa (`c.balls`). Ista greška postoji
i na `main`; javio sam drugoj sesiji.

## Provere
- `npm test` prolazi ceo: 1.402 provere prevoda, 15 pohoda, 146 mehaničkih provera, bot prolazi sve nivoe, 290 provera
  bitaka (od toga 140 novih za ovo iznad), crtanje bez greške.
- `node simulation-test.mjs`: pobeda u Kačaniku. `node animation-tests.mjs`: prolazi.

## Šta nije urađeno ili nije provereno
- **Koštac je bio prečest** kad je više neprijatelja (bot je kod Tri janičara bivao oboren na svakih 13 s); razmak je
  sada 13 s umesto 7 i šanse su manje. Vredi da osetiš da li je sada dobro.
- **Nisam odigrao igru rukom.** Sve novo je provereno testovima i pojedinačnim kadrovima u pregledaču, ne celim
  prolaskom. Težinu bosova sa gardom treba da osetiš ti; ako je preteško, brojevi su na jednom mestu (`champGuard`).
- **Tri sata igre je procena, nije mereno.** Bot koji ubija na dodir i preskače zagonetke prođe svih 15 pohoda za
  oko 21 minut (ranije 13 pohoda za 14). Uz borbe, zagonetke, megdane i Kačanik računam na dva i po do tri sata prvog
  prolaska.
- **Međukadrovi:** gledao sam ih na tabli kadrova (čisti su, noge se ne vide duplo), ali ne i u pokretu. Udarci
  nemaju međukadrove: tamo je kretanje preveliko za ovaj postupak.
- **Odjek i duga pesma** nisu provereni sluhom.
- **Brzina igre u pregledaču:** okno u kom sam gledao igru vrti je usporeno, pa trku, let i međukadrove nisam mogao
  da ocenim u pravoj brzini. Logika je proverena testovima sa pravim tasterima.
- **Veštine su premeštene** da prate novi redosled (odskok od zida se sada uči u Manastiru, jer ga Tvrđava traži).
  Ko ima stari snimak igre zadržava naučene veštine, ali „Nagrada" na mapi sada piše drugačije.
- **Prolaz kroz nivoe bez neprijatelja** uradio sam plitko: po jedan do četiri kadra po nivou. Nisam premeštao
  pojedinačne predmete. Zapažanja: u pozadini Sela crkva se ponavlja na svakih par ekrana (ponavlja se sloj
  pozadine); u Vilinskoj pećini i Rudniku u pozadini se vide seoska kuća i crkva.
- **Dućan** radi mišem i tasterom Esc; izbor džojstikom nije dodat.
- **Novi crteži:** ništa nije naručeno. Lista po prioritetu poslata je drugoj sesiji uz napomenu da ne naručuje bez
  tvoje potvrde (pozadine Urvine, Marko pod jelom, utva, Janja, Novak, stojeći koštac). Do tada rade zamene:
  Urvina koristi pozadine Ruševina, utve su nacrtane kodom, a u košcu sa bosom Marko leži, a bos je nagnut nad njim.
- **Muziku nisam dirao**, kako si rekao.
