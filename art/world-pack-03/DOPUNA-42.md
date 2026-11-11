# Dopuna 42 (od Claude-a): Urvina, poslednji pohod

Igra dobija poslednji pohod: `urvina`, po pesmi „Smrt Marka Kraljevića”. Marko se penje uz Urvinu planinu kraj mora, do dve tanke jele i bunara među njima. U tom pohodu nema borbe. Sada nivo pozajmljuje pozadine Ruševina, a na kraju se vidi poslednji kadar `marko-death`.

Svi likovi su kao u DOPUNA-36. Marko ima crn brk, crven plašt, krzneni kalpak, pancir i topuz o pojasu, a Šarac je beo sa riđim pegama. Bez krvi.

## 1. Pozadine Urvine

Svetlo je nedelja pre sunca. Nebo je ružičasto i zlatno, a sunce se još nije pomolilo. Nema sela, gradova, kula ni manastira, jer je Marko tu sam.

Format je isti kao `rusevine-*` u `dist/assets/world/`:
- slojevi su PNG 2172×724;
- `urvina-sky` je ceo neproziran;
- `urvina-far`, `urvina-mid` i `urvina-near` su RGBA, a iznad obrisa je providno;
- svaki sloj se nastavlja vodoravno bez šava (proveri sa `python seam-audit.py`);
- `urvina-vista` je jedna slika 2172×724 sa celim prizorom, za mapu pohoda.

| Sloj | Šta je na njemu |
|---|---|
| `urvina-sky` | ružičasto-zlatna zora pre sunca i retki oblaci |
| `urvina-far` | daleko more sa ostrvima u izmaglici |
| `urvina-mid` | go kameni greben planine |
| `urvina-near` | jele i stene, tamnije i krupnije |
| `urvina-vista` | ceo prizor: planina iznad mora, a na vrhu dve tanke jele i bunar među njima |

Noćna i olujna verzija nisu potrebne, jer se Urvina igra samo u zoru.

## 2. Scena pre pohoda

Pravila su ista kao u DOPUNA-36: minijature su 1024×1024, u stilu srpske freske sa zlatnom pozadinom, a oživljena scena ima 12 kadrova od 768×512 u traci, sa manifestom i preview.gif u `art/animation-pack-04/assets/prelaz-urvina-anim/`.

| Fajl | Šta je na njemu |
|---|---|
| `prelaz-urvina-1.png` | Šarac posrće i roni suze, a Marko ga miluje po vratu. |
| `prelaz-urvina-2.png` | Marko je nadnesen nad bunar među dve tanke jele i u vodi vidi svoje lice. |
| `prelaz-urvina-anim` | Marko jaše Šarca uz planinu u zoru, a ispod je more. Kreću se samo griva, plašt, oblaci i talasi. Petlja je bez skoka. |

## 3. Marko na počinku

`marko-pocinak`: 6 kadrova, igra se jednom. Ćelija je 512×512, a pravila su ista kao za ostale Markove klipove: okrenut udesno, oslonac na y=487, zum kao `marko-idle-2`.

Redosled kadrova:
1. Marko prostire zelenu dolamu po zemlji.
2. Prekrsti se.
3. Sedne na dolamu.
4. Navuče samur-kalpak na oči.
5. Legne na leđa.
6. Leži mirno.

Jela se ne crta, nju dodaje igra. Klip ide u `art/animation-pack-04/assets/marko-pocinak/`, sa atlasom, manifestom sa frame_layout, frames i preview.gif.

Slike iz delova 1 i 2 idu u `art/world-pack-03/<fajl>`. Posle svake stavke upiši red u `STATUS-ANIMACIJE.md`. Kod igre i `dist/` ne diraj.
