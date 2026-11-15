# Animacije koje fale (provera 15. 11. 2026)

Kako je provereno:
- Igra je puštena u bezglavom Edge-u kroz svih 16 nivoa (Marko premeštan duž celog nivoa, bot se bori) i kroz 43 prečice scena (`?dev&novo=`).
- Usput je beležen svaki crtež koji kod traži, a nema ga u `sprite-rig.json`, i svaka nepomična slika (`cast/…`) koja se crta umesto animacije.
- Uz to je pregledan kod: gde igra prvi kadar nekog klipa koristi kao pozu ili jednu sliku pomera/naginje umesto pokreta.

## Ispravljeno odmah

- **Knjiga dušmana**: Hasan-aga, Ognjeni aga, Lovac-aga i Janičarski aga tražili su pokrete pod pogrešnim imenom (`hasan-aga-aga-idle`), pa njihove strane nisu postojale. Crteži su postojali. Sada knjiga ima 20 strana umesto 16. U `animation-tests.mjs` je dodata provera da svaka poza u knjizi ima svoj klip.

## Naručeno i ugrađeno istog dana (Codex D54–D56, „gameplay sve što fali”)

Stefan je tražio sve što fali u samom igranju. Scene iz pesama (tačka 4, i Šarac u Varadinu, mehani i na vrhu) ostale su za posle.
- Narudžbine: `art/world-pack-03/DOPUNA-54.md`, `-55.md`, `-56.md`; uzori u `uzori-d54/`.
- Status svakog klipa: `STATUS-D54.md`, `STATUS-D55.md`, `STATUS-D56.md`.

Od 39 klipova u igri je 38:
- **Miloš (10/10):**
  - udarci: `milos-niz-2`, `milos-niz-3`, `milos-tezak`, `milos-vazduh`;
  - odbrana i kretanje: `milos-blok`, `milos-cuci`, `milos-kotrlja`, `milos-penje`;
  - ostalo: `milos-pije`, `milos-smrt`.
  - `MILOS_OWN` u `game.js` vodi svaki Markov pokret na Milošev klip tog pokreta.
  - Codex je dva klipa odbio, a Claude ih je posle pregleda izvezao (`export-dopuna54-claude.py`):
    - `milos-penje`: ruke se smenjuju kao u Markovom penjanju;
    - `milos-smrt`: telo 2–3 px iznad tla.
- **Konj (4/4):**
  - `sarac-stoji`: svuda gde je bila nepomična slika (svet i scene), preko `saracDraw()`.
  - `mounted-idle` i `milos-konj`.
  - `marko-uzjase`: treći pokušaj izvezao Claude (`export-dopuna56-claude.py`).
- **Protivnici (24/25):**
  - spavanje i buđenje za kopljanika, akindžiju, palikuću i oklopnika: sada spavaju i oni;
  - penjanje za štitonošu, kopljanika, akindžiju i palikuću;
  - tiho obaranje za svih pet;
  - `pas-jump`, `djemo-jump`, `pas-omamljen`, `arapin-omamljen`;
  - drugi udarac za psa, strelca i palikuću.
- **Nije uspelo:** `tufekdzija-drugi`. Moderacija je dva puta odbila zahtev, a treći pokušaj je skratio pušku. Ostaje ponovljen prvi udarac.

Veličine u igri (`build-sprite-rig.py`, blok `noc-poliranje`):
- Klipovi protivnika dele razmeru svog uzora: Codex je crtao u veličini uzora, a svako buđenje se završava u visini stava, unutar 3 %.
- Konji se mere po punoj visini crteža.
- Uzjahivanje ima pomereno sidro, pa mu prednje kopito stoji gde i u `mounted-idle`.

Ponovna provera u igri (Đemo, Arapin, tvrđava, Močvara, Selo) više ne nalazi praznine od ranije. Jedina nova je `djemo-omamljen`: Đemo bude ošamućen, a nema svoj crtež za to.

Ostaje za posle:
- `djemo-omamljen` i ošamućenost ostalih megdandžija koji se crtaju svojim tipom;
- `tufekdzija-drugi`;
- scene iz pesama (tačka 4 i Šarac u Varadinu, mehani i na vrhu);
- `marko-sjase` (sjahivanje i dalje nema svoj klip);
- `milos-pada-s-konja`.

## 1. Šarac (najvidljivije)

Šarac ima samo `sarac-galop`. U svim ostalim prizorima je nepomična slika (`cast/sarac`) koja se trese ili naginje:

| Gde | Šta se sada vidi | Šta treba |
|---|---|---|
| Svet, Šarac čeka Marka | slika koja „diše" | `sarac-stoji`: rep, glava, kopito (petlja) |
| Varadin: Šarac pije, lupa kopitom | slika nagnuta 0,08 / slika se trese | `sarac-pije`, `sarac-lupa` |
| Mehana: Šarac ne pušta Filipa, Filip ga bije, „Šarac zakuka" | slika se trese | `sarac-propinje` (rita, ne pušta), `sarac-boli` |
| Vašar, potera, potera za vilom (i branje bilja), jahanje | slika | `sarac-stoji`, `sarac-hod` |
| Vrh (smrt Marka i Šarca) | slika nestane i odmah je tu humka od dve braon elipse | `sarac-pada` (bez krvi) i crtež humke |

## 2. Marko na konju

- **Uzjahivanje i sjahivanje**: dve nepomične slike (`cast/sarac` + `cast/marko`) se pretapaju, Marko „leti" po luku. Treba `marko-uzjase` (i `marko-sjase`).
- **Na konju u mestu**: prvi kadar `mounted-jump` sa disanjem. Treba `mounted-idle` (konj stoji pod Markom: rep, glava, frktanje).

## 3. Miloš (igrivi junak)

Miloš ima 9 svojih klipova (idle, attack, hurt, ranjen, ustaje, run, jump, jase, galop). Svih 116 Markovih pokreta se prevodi na njih:
- 40 udaraca (niz, teški, vihor, kontra, šut, sablja, završni udarci) → jedan isti `milos-attack`;
- 32 stanja (blok, čučanj, pijenje, guranje, poluga, pobeda, podizanje predmeta) → Miloš samo stoji (`milos-idle`);
- 23 skoka i penjanja (zid, ivica, penjanje, kuka, lanac) → `milos-jump`;
- 8 udaraca primljenih i smrt → `milos-hurt` (smrt je njegov poslednji kadar).

Prvo bi trebalo: `milos-blok`, `milos-cuci`, `milos-tezak` (teški udarac), `milos-niz-2` (drugi udarac niza), `milos-penje`, `milos-smrt`, `milos-pije`.

Uz to:
- **Milošev konj** (`milos-konj`) ne postoji: crta se Šarac obojen sepijom.
- Miloš pada s konja (`milos-strela` je odbila moderacija): sada se pretapaju dva nepomična kadra. Može `milos-pada-s-konja`, bez strela i krvi.

## 4. Likovi iz pesama

- **Vukašin** (Samodreža): ima samo `vukasin-trci` i `vukasin-udara`. Kad stoji, crta se zamrznut kadar trka ili prvi kadar udarca. Treba `vukasin-stoji`.
- **Kosovka devojka**: samo stoji i hoda. U pesmi poji ranjenike: `kosovka-poji` (kleči, daje vodu).

## 5. Protivnici: pokreti koje kod traži, a nema ih (potvrđeno u igri)

| Pokret | Ko ga nema | Šta se sada vidi |
|---|---|---|
| penjanje (`-climb`) | akindžija, kopljanik, palikuća, štitonoša, pas (ima ga samo pešak) | petlja trka, malo nagnuta, dok se penje |
| skok (`-jump`) | pas, Đemo (viđeno u igri); crtež nemaju ni ostali megdandžije | jedan zamrznut kadar trka, nagnut |
| bačen uvis (`-launch`) | Đemo (viđeno u igri); crtež nemaju ni ostali megdandžije | isti zamrznut kadar trka |
| ošamućen (`-omamljen`) | Arapin, pas (viđeno u igri); crtež nemaju ni ostali megdandžije | obična poza, nagnuta, sa zvezdicama |
| spava/budi se (`-spava`, `-budi`) | kopljanik, akindžija, palikuća, oklopnik | igra ih zato nikad ne stavlja da spavaju: spavaju samo pešaci i štitonoše |
| tiho obaranje (`-tiho-pada`) | štitonoša, kopljanik, akindžija, palikuća, oklopnik | opšti pad |
| drugi udarac (`-drugi`) | pas, strelac, palikuća, tufekdžija | ponovljen prvi udarac |

## Šta je u redu

- Nijedan nivo i nijedna scena nisu pukli tokom prolaza.
- Nepomične slike pešaka, štitonoše i strelca se pojave samo na trenutak, dok se crtež prvi put učitava; to nije praznina u animacijama.
- Crteži vrača (4 klipa) postoje, ali ih igra nigde ne koristi.
