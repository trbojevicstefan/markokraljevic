# Dopuna 62 (od Claude-a, 15. 11.): rekviziti vrha Urvine i slika za kraj igre

Stefan (15. 11.): scena na vrhu Urvine „i sve što ide uz to”, i „napravi kraj igre, neki dirljivi end screen”.

Status piši u `art/world-pack-03/STATUS-D62.md` (napravi ga), sa oznakom `D62`.

Ne diraj ništa od sledećeg:
- `dist/` (osim izvoza ispod), `build-sprite-rig.py`, `sprite-rig.json`, `game.js`;
- druge `STATUS-*` fajlove;
- git (ne pravi commit).

Paralelno radi D61 (Markovi pokreti): ne diraj njene fajlove. Najviše tri `image_gen` pokušaja po slici.

Uzori za stil i meru su u `art/world-pack-03/uzori-d61/`:
- **igra:** `stil-jela.png`, `stil-bunar.png`, `stil-humka.png`, `stil-riznica.png`, `stil-urvina-daleko.png`, `stil-urvina-sredina.png`;
- **likovi:** `marko-idle-2-kadar0.png`, `sarac-stoji-kadar0.png`;
- **sablja:** `marko-sablja-idle-kadar0.png`.

Sve slikano, mat, toplim rukopisom igre, bez teksta.

## 1. `prop-slomljena-sablja` (1024×512, providna pozadina)

Markova sablja (ista kao u `marko-sablja-idle-kadar0.png`) prelomljena na četiri komada, leži na zemlji, gledano sa strane:
- balčak sa delom sečiva;
- tri komada sečiva razbacana u nizu;
- dno komada ravno na y≈480;
- cela grupa široka oko 60 % slike.

Izvoz: `dist/assets/world/prop-slomljena-sablja.webp` i izvor u `art/world-pack-03/uzori-d62/`.

## 2. `prop-koplje-u-granama` (1024×1024, providna pozadina)

Sedam komada slomljenog bojnog koplja (drvena drška, gvozdeni vrh na jednom komadu) zaglavljenih koso, pod raznim uglovima.
- Komadi su raspoređeni u gornjoj polovini slike, kao da vise u granama jele.
- Same grane se ne crtaju: igra stavlja sliku preko jele iz `stil-jela.png`.

Izvoz: `dist/assets/world/prop-koplje-u-granama.webp` i izvor u `uzori-d62/`.

## 3. `kraj-urvina` (1920×1080, neprovidna): slika za kraj igre

Dirljiva završna slika, na vrhu Urvine planine, u predvečerje. Rukopis je kao pozadine igre (`stil-urvina-*`), toplo i svetlo, bez crnih senki.

**Kompozicija:**
- **Levo i u sredini:** dve vitke visoke jele. Između njih:
  - kameni bunar;
  - pod jelom na prostrtom crvenom ogrtaču leži Kraljević Marko (isti lik kao `marko-idle-2-kadar0.png`), na leđima, ruke prekrštene na grudima, oči sklopljene, mirno, kao da spava.
- **Desno od njega:**
  - travnata humka sa kamenom (Šarčev grob, kao `stil-humka.png`);
  - na humci poljsko cveće;
  - uz kamen naslonjen komad slomljene sablje.
- **U granama jele:**
  - komadi slomljenog koplja;
  - mala presavijena knjiga (pismo) obešena o granu.
- **Daleko desno i dole:**
  - more na zalasku sunca, zlatno;
  - jedva vidljiv krug na vodi gde je pao topuz.
- **Nebo:**
  - zlatno-ružičasto;
  - u oblacima, providna i tiha, vila Ravijojla (bela haljina, zlatna kosa) gleda dole na Marka.
- **Donja četvrtina slike:** mirnija (trava, kamen), jer će preko nje ići tekst.

Bez krvi i bez teksta.

**Izvoz:**
- `dist/assets/world/kraj-urvina.webp` (1920×1080, kvalitet 90);
- izvor PNG u `uzori-d62/`.

## Na kraju

Kratak pregled u `STATUS-D62.md`: šta je izvezeno, koliko pokušaja.
