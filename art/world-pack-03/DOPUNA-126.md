# Dopuna 126 (od Claude-a, 19. 11.): slava u Prilepu (deseti pohod, „Marko Kraljević i Đemo Brđanin”)

Stefan (19. 11.): „Da prati pesmu … Da postoji svaki lik iz pesme i svaka animacija, do najsitnijeg detalja.” Pesma počinje ovako:

> Slavu slavi Kraljeviću Marko, slavu slavi svetoga Đorđija. U Marka su mloge uzvanice: dvjesta popa, trista kaluđera, i dvanaest srpskijeh vladika, i četiri stare patrijare … al’ govori stari kaluđere: „Svega imaš u bijelu dvoru, još da imaš ribe od Orida!” … doziva slugu Bogosava, dodaje mu čašu i mataru: „Toči vino, Bogosave slugo!” … Za njim stara pristanula majka: „Nemoj nosit ništa od oružja, ti se jesi krvi naučio, učinićeš krvcu o prazniku.”

Tih ljudi u igri nema. Pravi se pet likova, svaki po jedan klip.

Status piši u `art/world-pack-03/STATUS-D126.md` (napravi ga), red posle SVAKE stavke, sa oznakom `D126`. **Uradi SVIH pet stavki do kraja. Ne staj i ne pitaj. Sitne ostatke ključa čistim ja: upiši ih u status i IZVEZI klip svejedno. Jedan pokušaj po klipu; drugi samo ako je lik pogrešan ili je kadar isečen.**

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, druge `STATUS-*` fajlove, tuđe foldere klipova, git, fajlove `*dopuna41*`. Paralelno rade D127 i D128: ne diraj njihove fajlove.

## Uzori (`art/world-pack-03/uzori-d126/`)

- `putnik-kaluder-idle-kadar0.png`: kaluđer iz igre (ćelija 512×512, stopala na y=488, gleda ulevo). **Uzor rukopisa i mere za sveštena lica.**
- `velimirovica-idle-kadar0.png`: žena iz igre (360 px, gleda ulevo): uzor mere za majku.
- `tabor-kuvar-kadar0.png`: sluga iz igre (400 px): uzor mere za Bogosava.
- `car-sedi-kadar0.png`: lik koji sedi (donja ivica na y=488).

## Pravila

- Ćelija 512×512, sigurna margina 24 px, providna pozadina, bez teksta, tla, senke i efekata. Lik se gleda s boka.
- Jedan `image_gen` poziv crta mrežu 3×2 (6 kadrova) na ravnoj jarko zelenoj #00ff00; iseci polja, skini zelenu, svaki kadar u svoju ćeliju. **Proveri i zatvorene praznine (između ruke i tela): ni tu ne sme ostati zelena.**
- Stopala (ili donja ivica lika koji sedi) na y=488 (±2 px). Ne razvlači kadrove; ako je lik veći ili manji, promeni razmeru celog klipa (upiši `k=`).
- **Likovi koji sede za sofrom crtaju se BEZ stola i bez klupe**: vide se celi, kako sede na niskoj klupi koja se ne crta (noge savijene, stopala na y=488). Sto se crta posebno i doći će ispred njih.
- Klip ide u `art/animation-pack-04/assets/<klip>/`: `atlas.png`, `manifest.json` sa `frame_layout`, `frames/motion/frame-N.png`, `preview.gif`, `qa.json`. JSON bez BOM-a. Postupak: `art/world-pack-03/export-dopuna112.py` (svoja kopija `export-dopuna126.py`).

## Klipovi (redom)

| Klip | Kadrova | Petlja | Šta radi |
|---|---|---|---|
| `gost-patrijarh` | 6 | da | **stari patrijarh**: duga bela brada, **bela kamilavka sa koprenom i zlatnim krstom**, bogat zlatom vezen plašt, panagija na grudima, štap sa krstom; **sedi**, blagosilja desnom rukom, klimne glavom. Gleda ulevo. Visok oko 330 px (sedi). |
| `gost-vladika` | 6 | da | **vladika**: seda brada, **crna kamilavka sa koprenom**, ljubičast plašt sa zlatnim rubom, krst na lancu; **sedi**, drži čašu vina, nazdravi, otpije. Gleda ulevo. Visok oko 320 px. |
| `gost-pop` | 6 | da | **seoski pop**: riđa brada, crna mantija, crna kapa, drveni krst; **sedi**, lomi pogaču i jede, nasmeje se. Gleda udesno. Visok oko 310 px. |
| `sluga-bogosav` | 6 | da | **sluga Bogosav**: mlad, bez brade, kosa do ramena, bela lanena košulja, crven jelek, bele čakšire, opanci; **stoji i iz velike matare (bakrenog krčaga) toči vino u čašu koju drži u drugoj ruci**, pruži čašu napred, nakloni se. Gleda ulevo. Visok oko 400 px. |
| `majka-jevrosima` | 6 | da | **stara majka Jevrosima**: sitna, seda, crna marama i tamna haljina sa srebrnim pojasom, lice strogo i brižno; **stoji, podiže kažiprst i opominje, pa položi ruku na grudi**. Gleda ulevo. Visoka oko 340 px. |
