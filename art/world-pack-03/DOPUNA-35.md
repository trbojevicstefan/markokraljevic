# Dopuna 35 (od Claude-a): prednji sloj pozadine u srazmeri sa Markom

Obišao sam svih 13 pohoda u igri. Kuće, crkve i kule u **prednjem sloju** (`<pohod>-near`) su u devet pohoda visoke kao Marko, a vrata mu dopiru do pasa. Ceo grad deluje kao maketa. Močvara, Rudnik i novi Podrum su dobri: tamo je kuća oko dva Marka visoka, a vrata su visine Marka. Po tome se ravnaj.

**Pravila za `near` sloj** (slika 2172×724, Marko je u igri oko 145 px):
- Vrata kuće, kapije, lukovi i prolazi visoki su najmanje kao Marko, oko 150 px.
- Kuća na sprat je visoka 320–380 px, a crkva ili kula 420–560 px. Bolje je manje zgrada, ali krupnijih.
- Ograda je do Markovog kuka, 60–75 px. Bure i krčag nisu viši od 80 px.
- Drveće, stene i planine ostaju kakve jesu, jer one nisu greška u razmeri.
- Ostaju iste: paleta, svetlo, stil, providno nebo i donjih ~15% visine, gde stoji drum. Levih i desnih 12% se u igri pretapaju jedno u drugo, pa ivice moraju ostati mirne, bez zgrade presečene napola.
- `mid` sloj ne diraj, osim kad su vrata u njemu manja od 45 px; tada ih podigni na oko 70 px.

**Varijante:** dan, noć i oluja (`-night`, `-storm`) moraju imati istu novu kompoziciju. Noć i oluju možeš izvesti iz novog dana svetlom: noću upaljeni prozori i baklje, a u oluji tamno i mokro, kao u sadašnjim varijantama. Nova slika ide na mesto stare, pod istim imenom i u istoj fascikli. Staru premesti u `staro/` u tom paketu.

**Provera:** za svaki pohod napravi `preview-dopuna35-<pohod>.jpg`. Na njemu je staro i novo, jedno ispod drugog, sa Markovom siluetom od 145 px zalepljenom kraj vrata.

Posao je podeljen na tri dela, jedan po pokretanju. Upiši u `STATUS-ANIMACIJE.md` red posle svakog pohoda.

| Deo | Pohodi | Šta je najgore |
|---|---|---|
| A | `selo`, `oranje`, `reka` | Seoske kuće i crkva veličine Marka. Kuće i vodenice na obali su sitne. |
| B | `manastir`, `tvrdjava`, `rusevine` | Manastirski grad i portali su minijaturni, kao i crkve i bedemi iza tvrđave. Na ruševinama su crkve male, a vrata niska. |
| C | `prevoj`, `pecina`, `klisura`, `suma` | Kule na prevoju su visoke jedan Marko. Kuće u pećini su sitne, kao i vrata zdanja u klisuri. U šumi su mala kamena vrata i vrata kuće. |
