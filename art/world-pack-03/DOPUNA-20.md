# Dopuna 20 (od Claude-a): Ravijojla, magija i dozivanje u hodu

Pravila su ista kao u DOPUNA-19:
- Ćelije su 512×512, a lik je okrenut udesno.
- Klip ide u `art/animation-pack-04/assets/<klip>/`, sa atlasom, manifestom sa frame_layout, frames i preview.gif.
- Napredak upisuj u `STATUS-ANIMACIJE.md`, posle svakog klipa.

**Marko** se crta u istom zumu kao `marko-idle`, oslonac je na y=487.

**Ravijojla** je ISTA vila kao u `fairy-cast` (`dist/assets/fairy-cast.png`):
- plava pletenica i venac od belih cvetova;
- bela haljina sa crvenim vezom i crveni pojas koji leprša;
- prozirna krila nalik leptirovim, sa šarom od lišća;
- bose noge sa zlatnim alkama.

Ona lebdi, pa nema oslonca. Crta se u sredini ćelije: telo od oko y=90 do y=430, vrh glave uvek na približno istoj visini. Pokret mora biti mekan i lep: krila stvarno mašu, a kosa, pojas i haljina kasne za pokretom.

**Magija** su efekti na providnoj pozadini, sa mekim ivicama:
- boje su vilinska zelena (#9dffd8), bledo zlato (#f3e3a0) i malo bele;
- bez pregorelog belog i bez jakog bleštanja, jer igra ne sme da bude presjajna;
- efekat je u sredini ćelije.

| Klip | Kadrova | Opis |
|---|---|---|
| `marko-call-walk` | 8, petlja | Marko HODA (isti korak kao `marko-walk`) i doziva vilu: glava gore, leva ruka visoko ka nebu otvorenog dlana, a topuz nisko u desnoj. Noge hodaju u svakom kadru. |
| `vila-let` | 8, petlja | Ravijojla leti u mestu. Krila mašu pun krug, telo se blago diže i spušta, pletenica i pojas vijore. Ruke su opuštene. |
| `vila-carolija` | 8, jednom | Baca čini. (1–3) Skupi svetlo među dlanovima kod grudi, a krila se rašire. (4–5) Obe ruke ispruži napred i pusti svetlo. (6–8) Ruke se vrate, krila mašu. Svetlo između dlanova je malo i meko. |
| `vila-isceljenje` | 8, jednom | Isceljuje Marka ispod sebe. Raširi ruke dlanovima nadole i sa njih pada blaga kiša svetlih latica, pa sklopi ruke. |
| `magija-bljesak` | 8, jednom | Vilinski bljesak na mestu gde čini padnu. Prsten od svetlih runa i latica se širi iz sredine, iskre se razlete i bljesak se ugasi. |
| `magija-zrak` | 8, petlja | Vodoravna traka vilinskog svetla s leva na desno preko cele ćelije, u visini y=256. Po njoj teku iskre i latice. Krajevi su meki. |
