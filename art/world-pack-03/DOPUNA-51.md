# Dopuna 51 (od Claude-a, noć 14/15. 11.): Filip Madžarin

Za pesmu „Marko Kraljević i Filip Madžarin” (Vuk II): Marko pije vino u novoj mehani u Karlovcu, Šarac ne pušta Filipa na vrata, a Filip ulazi i bije Marka „perna buzdovana” po plećima, dok Marko „ni habera nema”; tek kad mu razbije čašu i prospe vino, počinje megdan. Filip je nov lik u igri: mali megdandžija u nivou „Reka”.

Status piši u `art/world-pack-03/STATUS-ANIMACIJE-NOC.md` (oznaka `D51`). `dist/`, `build-sprite-rig.py`, `sprite-rig.json` i git ne diraj. Pravila izvoza, provere i zelene mreže su ista kao u `DOPUNA-48.md` (ćelija 512, oslonac y=488, najviše tri pokušaja po klipu, ne izvozi ako lik nije dobar). Uzor za rukopis, svetlo i meru: `art/world-pack-03/uzori-d48/marko-idle-2-kadar0.png`. Kad je prvi klip prihvaćen, njegov kadar 0 je uzor lika za sve ostale (isti čovek, ista odeća, ista visina), kao što je urađeno sa kraljem Vukašinom u D50.

## Filip Madžarin (novi lik)
Madžarski kapetan iz Karlovca, hvalisav i besan, ne baš veliki junak. Visok skoro kao Marko (telo ~370 px u ćeliji 512, Marko 383). **Plavokos, duge plave obešene brkove, obrijane brade**; na glavi visok **samurovinast kalpak sa belim čapljinim perom** i zlatnom kopčom; **plava dolama sa zlatnim gajtanima** (vez preko grudi), preko levog ramena **crvena krznena kabanica (mente)**, uske crvene čakšire, **žute čizme**; o pojasu sablja u koricama; u desnoj ruci **pernat buzdovan** (gvozdena glava od perâ, kraći od Markovog topuza, bez šiljaka). Ne sme da liči na Marka (Marko: crni brci, crven ogrtač, kožni oklop, okrugao topuz sa šiljcima) ni na Turčina (bez turbana, bez fesa, bez handžara). Gleda udesno.

| Klip | Kadrova | Petlja | Šta se vidi |
|---|---|---|---|
| `filip-idle` | 6 | da | Stoji raširenih nogu, buzdovan na ramenu, malo se njiše i prezrivo podiže bradu; kabanica se malo pomera. |
| `filip-run` | 8 | da | Trči udesno sa buzdovanom u desnoj ruci; dva jasna dodira tla, leva i desna noga se smenjuju (pazi: u D50 je trk propao jer je druga polovina ponovila istu nogu). |
| `filip-attack` | 6 | ne | Zamah buzdovanom odozgo i udarac napred-desno; udarac (najduža ruka) u kadru 3; kadrovi 4-5 povratak u stav. |
| `filip-hurt` | 4 | ne | Pogođen, trgne se unazad, kalpak se zaljulja, pa se vraća. |
| `filip-death` | 6 | ne (`holdLastFrame=true`) | Pada unazad (ulevo) i ostaje da leži na leđima; buzdovan mu ispada iz ruke; poslednji kadar ležeći, ceo u ćeliji, stopala na osloncu. Bez krvi. |

Redosled: `filip-idle`, `filip-run`, `filip-attack`, `filip-hurt`, `filip-death`. Posle svakog red u status; na kraju kratak pregled. Ako klip posle tri pokušaja nije dobar, ne izvozi ga i idi na sledeći.
