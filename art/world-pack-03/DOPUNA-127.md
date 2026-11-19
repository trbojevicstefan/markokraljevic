# Dopuna 127 (od Claude-a, 19. 11.): Đemo Brđanin iz pesme (deseti pohod)

Pesma „Marko Kraljević i Đemo Brđanin”: „al’ eto ti jednoga junaka, na doratu noge prekrstio, topuzinu baca u oblake, dočekuje u bijele ruke … za njime se Đemo naturio … Pije vino Brđanine Đemo, a nazdravlja Kraljeviću Marku, nazdravlja mu, ali mu ne daje … Pade Đemo glavom bez uzglavlja … sindžir gvožđe zemlji pritezaše, on poteže rukam i nogama, popucuju ruke iz ramena, popucuju noge iz koljena; al’ se tvrdo gvožđe uhvatilo.” Đemo u igri postoji samo kao megdandžija peške. Pravi se pet klipova iz pesme.

Status piši u `art/world-pack-03/STATUS-D127.md` (napravi ga), red posle SVAKE stavke, sa oznakom `D127`. **Uradi SVIH pet stavki do kraja. Ne staj i ne pitaj. Sitne ostatke ključa čistim ja: upiši ih u status i IZVEZI klip svejedno. Jedan pokušaj po klipu; drugi samo ako je lik pogrešan ili je kadar isečen.**

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, druge `STATUS-*` fajlove, tuđe foldere klipova (postojeće klipove Đema ne menjaš), git, fajlove `*dopuna41*`. Paralelno rade D126 i D128: ne diraj njihove fajlove.

## Uzori (`art/world-pack-03/uzori-d127/`)

- `djemo-idle-kadar0.png`: **Đemo Brđanin iz igre** (ćelija 512×512, stopala na y=488, gleda udesno): **uzor lika, odeće i mere.** Na svim klipovima mora biti isti čovek.
- `vuca-mounted-kadar0.png`, `pokret-vuca-mounted.png`: megdandžija na konju iz igre (visok 342 px, širok 345 px, kopita na y=488, gleda udesno). **Uzor mere i pokreta za klipove na konju.**
- `car-sedi-kadar0.png`: lik koji sedi (donja ivica na y=488).

**Dorat**: Đemov konj, riđ (crvenkastosmeđ) sa crnom grivom i repom, jak, prosto sedlo, bez ukrasa.

## Pravila

- Ćelija 512×512, sigurna margina 24 px, providna pozadina, bez teksta, tla, senke i efekata. Topuz mora stati u ćeliju i kad je u vazduhu.
- Jedan `image_gen` poziv crta mrežu (4×2 za 8 kadrova, 3×2 za 6, 2×2 za 4) na ravnoj jarko zelenoj #00ff00; iseci polja, skini zelenu, svaki kadar u svoju ćeliju. **Proveri i zatvorene praznine (između nogu konja, između ruke i tela): ni tu ne sme ostati zelena.**
- Stopala, kopita ili donja ivica lika na y=488 (±2 px). Ne razvlači kadrove; ako je lik veći ili manji, promeni razmeru celog klipa (upiši `k=`).
- Klip ide u `art/animation-pack-04/assets/<klip>/`: `atlas.png`, `manifest.json` sa `frame_layout`, `frames/motion/frame-N.png`, `preview.gif`, `qa.json`. JSON bez BOM-a. Postupak: `art/world-pack-03/export-dopuna120.py` (svoja kopija `export-dopuna127.py`).

## Klipovi (redom)

| Klip | Kadrova | Petlja | Šta radi |
|---|---|---|---|
| `djemo-na-doratu` | 8 | da | **Đemo sedi na doratu koji stoji, noge je prekrstio preko sedla** (sedi postrance, opušten), **baca topuzinu uvis i dočekuje je u ruke**: 0–1 zamah, 2–4 topuz leti gore i vrti se (ostaje u ćeliji, najviše do vrha), 5–6 dočeka ga obema rukama, 7 kao 0. Gleda udesno. Mera kao `vuca-mounted-kadar0.png`. |
| `djemo-jase` | 8 | da | po `pokret-vuca-mounted.png`: Đemo na doratu u galopu, topuz podignut iznad glave, nagnut napred. Gleda udesno. |
| `djemo-pije` | 6 | da | **sedi na niskoj tronošci (tronožac se crta)**, u ruci veliki drveni pehar: **digne ga visoko kao da nazdravlja, podrugljivo se nasmeje, pa ispije sam**, obriše brk. Gleda ulevo. Visok oko 330 px (sedi). |
| `djemo-spava` | 4 | da | isto mesto i tronožac: **klonuo, glava mu pala na grudi, pehar ispao iz ruke i leži kraj noge**, hrče (grudi se dižu). Gleda ulevo. |
| `djemo-okovan` | 6 | da | **okovan sav u gvožđe: na nogama bukagije (okovi sa lancem), na rukama belenzuke (lisice sa lancem), oko vrata težak sindžir koji pada do zemlje; sedi na zemlji i upinje se rukama i nogama da pokida lance**, stegne zube, klone, opet povuče. Gleda udesno. Visok oko 300 px (sedi), donja ivica na y=488. |
