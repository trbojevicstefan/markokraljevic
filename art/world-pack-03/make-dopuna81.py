"""Writes DOPUNA-81..85.md (Claude, 18. 11. 2026, peta tura). python art/world-pack-03/make-dopuna81.py"""
import os
HERE = os.path.dirname(os.path.abspath(__file__))

PRAVILA = '''## Pravila (ista kao u `DOPUNA-76.md`)

- Ćelija 512×512, sigurna margina 24 px, providna pozadina, bez teksta, tla, senke, zvezdica i efekata. Oružje mora stati u ćeliju (ako treba, ukoso ili uspravno).
- Jedan `image_gen` poziv crta mrežu (3×2 za 6 kadrova, 4×2 za 8) na ravnoj jarko zelenoj #00ff00; iseci polja, skini zelenu, svaki kadar u svoju ćeliju. U izvozu ne sme ostati okvir ćelije ni linije mreže, ni komad susednog kadra.
- Stopala na y=488 (osim u skoku); lik na istom mestu u ćeliji u svim kadrovima.
- Klip ide u `art/animation-pack-04/assets/<klip>/`: `atlas.png`, `manifest.json` sa `frame_layout`, `frames/motion/frame-N.png`, `preview.gif`, `qa.json`, `identity-size-comparison.png`. JSON bez BOM-a. Radni fajlovi u `art/animation-pack-04/sources/<klip>/attempt-N/`.
- Postupak: `art/world-pack-03/export-dopuna76.py` i `verify-dopuna76.py`, prilagođeni (svoje kopije zovi `export-dopuna{N}.py` i `verify-dopuna{N}.py`).
- Visinu uspravnog kadra **izmeri** i uporedi sa uzorom ({H} px, ±5 %). Najviše tri pokušaja po klipu; ako ni treći ne valja, NE izvozi.
- Svaki klip je **uređivanje uzora** `{UZOR}` (`image_gen` sa tim kadrom kao ulazom): isti čovek, ista odeća i oružje, isto lice, ista veličina tela.
'''

GLAVA = '''# Dopuna {N} (od Claude-a, 18. 11.): {NASLOV}

Stefan (18. 11.): „naručuj od Codexa sve što ti treba za naredna tri nivoa; potrebne su nam sve animacije”.

{UVOD}

Status piši u `art/world-pack-03/STATUS-D{N}.md` (napravi ga), red posle SVAKE stavke, sa oznakom `D{N}`.

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, druge `STATUS-*` fajlove, tuđe foldere klipova, git, fajlove `*dopuna41*`. Paralelno rade druge Codex sesije (D81–D85): ne diraj njihove fajlove.

## Uzori (`art/world-pack-03/uzori-d{N}/`)

{UZORI}

'''


def brief(N, naslov, uvod, uzori, uzor, H, klipovi, extra=''):
    t = GLAVA.format(N=N, NASLOV=naslov, UVOD=uvod, UZORI=uzori) + PRAVILA.format(N=N, H=H, UZOR=uzor) + extra
    t += '\n## Klipovi (redom)\n\n| Klip | Kadrova | Petlja | Šta se vidi |\n|---|---|---|---|\n'
    for k in klipovi:
        t += '| `%s` | %d | %s | %s |\n' % k
    open(os.path.join(HERE, f'DOPUNA-{N}.md'), 'w', encoding='utf-8', newline='\n').write(t)
    print('DOPUNA', N, len(klipovi))


SKOK = 'U kadrovima 2–3 stopala su iznad y=488 (do 110 px), inače na y=488.'
brief(81, 'Lovac-aga, megdandžija Ravijojline šume',
      'Lovac-aga ima hod, udarac, rog, pogođen, smrt i hvat. Igra traži i ispad, skok i ošamućenost, a megdan dobija bes pred kraj.',
      '- `lovac-aga-idle-kadar0.png`: **Lovac-aga**, ćelija 512×512, stopala na y=488, gleda udesno, visok 466 px. Krzneni kalpak, narandžasta dolama obrubljena krznom, kožni opasač, lovački rog o kaišu, kriva sablja nisko u desnoj ruci. **Uzor lika i veličine za sve klipove.**\n- `pokret-lovac-aga-run.png`, `-attack.png`, `-rog.png`, `-hurt.png`: isti aga u pokretima koje već ima.',
      'lovac-aga-idle-kadar0.png', 466, [
          ('lovac-aga-lunge', 6, 'ne', 'Ispad sabljom. 0: stoji; 1: povuče sablju nazad uz bok, telo se spusti; 2–3: dugačak iskorak napred, prednja noga savijena, ruka sa sabljom ispružena vodoravno udesno, vrh sablje daleko ispred; 4: drži ispad; 5: vraća se u stav. ' + 'Stopala na y=488 u svim kadrovima.'),
          ('lovac-aga-jump', 6, 'ne', 'Skok napred sa sabljom. 0: čučne; 1: odraz; 2: u vazduhu, kolena podvijena, sablja podignuta iznad glave; 3: pada, sablja kreće nadole; 4: doskok, čučanj; 5: uspravi se. ' + SKOK),
          ('lovac-aga-omamljen', 6, 'da', 'Ošamućen: tetura u mestu, glava klonula i njiše se levo-desno, kalpak nakrivljen, sablja visi u opuštenoj ruci, druga ruka se hvata za glavu. Kadar 5 se pretapa u 0.'),
          ('lovac-aga-bes', 6, 'ne', 'Razjari se. 0: stoji; 1: strgne kalpak i baci ga; 2: duvne u rog; 3–4: raširi ruke i riče, glava zabačena, usta širom otvorena; 5: pognut, sablja napred, spreman.'),
      ])
brief(82, 'Dželat, megdandžija Manastirskog visa',
      'Dželat ima hod, udarac sekirom, hvat, pogođen i smrt. Megdan dobija tri čina kao Kopljanik-baša u selu: sekira zabijena u zemlju, vitlanje sekirom, skok sa udarcem odozgo, bes; i ošamućenost.',
      '- `dzelat-idle-kadar0.png`: **Dželat**, ćelija 512×512, stopala na y=488, gleda udesno, visok 421 px. Crna kapuljača preko glave, golih mišićavih ruku, verižnjača, crven prsluk sa zlatnim vezom, kožna kecelja, velika sekira sa širokim sečivom koju drži preko ramena. **Uzor lika i veličine za sve klipove.**\n- `pokret-dzelat-run.png`, `-attack.png`, `-hvata.png`, `-hurt.png`: isti dželat u pokretima koje već ima.',
      'dzelat-idle-kadar0.png', 421, [
          ('dzelat-zabio', 6, 'da', 'Sekira mu je duboko zabijena u zemlju ispred stopala, sečivo do pola u zemlji, držalja ukoso naviše ka njemu. Obema rukama cima držalju, upire se nogama, naginje se unazad pa napred; sekira se ne pomera. Kadar 5 se pretapa u 0.'),
          ('dzelat-vitla', 8, 'da', 'Vitla sekirom ukrug oko sebe u visini pojasa: drži je obema rukama za kraj držalje, telo se okreće za sekirom (u kadrovima sečivo ide udesno, ka nama, ulevo, od nas). Stoji raskoračen u mestu. Kadar 7 se pretapa u 0.'),
          ('dzelat-skok', 6, 'ne', 'Skok sa udarcem odozgo. 0: čučne, sekira iza glave; 1: odraz; 2: u vazduhu, sekira visoko iznad glave obema rukama; 3: pada, sekira kreće nadole; 4: doskok, sekira se zabija u zemlju ispred stopala; 5: pogrbljen nad sekirom zabodenom u zemlju. ' + SKOK),
          ('dzelat-bes', 6, 'ne', 'Razjari se. 0: stoji; 1: zabode sekiru u zemlju pored sebe; 2: strgne kapuljaču sa glave (ispod: obrijana glava, crni brk); 3–4: udara se pesnicama u grudi i riče, glava zabačena; 5: zgrabi sekiru, pognut, spreman. Od kadra 2 je bez kapuljače.'),
          ('dzelat-omamljen', 6, 'da', 'Ošamućen: tetura u mestu, glava klonula i njiše se, sekira se vuče sečivom po zemlji u opuštenoj ruci, druga ruka se hvata za glavu. Kadar 5 se pretapa u 0.'),
      ])
brief(83, 'Hasan-aga Oklopnik, megdandžija Opsednute tvrđave',
      'Hasan-aga ima hod, udarac, zalet, zaglavljen (posle zaleta u stub), pogođen, smrt i hvat. Igra traži i ispad i skok; megdan dobija tresak buzdovanom o zemlju, bes pred kraj i ošamućenost.',
      '- `hasan-aga-idle-kadar0.png`: **Hasan-aga**, ćelija 512×512, stopala na y=488, gleda udesno, visok 463 px. Šiljat šlem sa verižnim nadvratnikom, sede brade, ljuskast oklop preko crvene dolame, okrugao bronzani štit na levoj ruci, buzdovan sa perima u desnoj. **Uzor lika i veličine za sve klipove.**\n- `pokret-hasan-aga-run.png`, `-attack.png`, `-zalet.png`, `-zaglavljen.png`, `-hurt.png`: isti aga u pokretima koje već ima.',
      'hasan-aga-idle-kadar0.png', 463, [
          ('hasan-aga-lunge', 6, 'ne', 'Ispad buzdovanom iza štita. 0: stoji; 1: štit napred, buzdovan povučen nazad; 2–3: dugačak iskorak napred, buzdovan zamahne napred iznad ivice štita; 4: drži; 5: vraća se u stav. Stopala na y=488.'),
          ('hasan-aga-jump', 6, 'ne', 'Težak skok napred. 0: čučne; 1: odraz; 2: u vazduhu, štit ispred tela, buzdovan podignut; 3: pada; 4: doskok, duboko čučne od težine oklopa; 5: uspravi se. ' + SKOK),
          ('hasan-aga-tresak', 6, 'ne', 'Tresak o zemlju. 0: stoji; 1: podigne buzdovan visoko iznad glave, štit u stranu; 2: zamahne nadole; 3: buzdovan udari o zemlju ispred stopala, kolena savijena, pogrbljen; 4: drži; 5: podiže se. Bez prašine i talasa (to crta igra).'),
          ('hasan-aga-bes', 6, 'ne', 'Razjari se. 0: stoji; 1: tresne buzdovanom o štit; 2: još jednom; 3–4: digne buzdovan i štit u vis i riče, glava zabačena, usta širom otvorena; 5: pognut iza štita, spreman.'),
          ('hasan-aga-omamljen', 6, 'da', 'Ošamućen: tetura u mestu, šlem nakrivljen, glava klonula i njiše se, štit spušten do zemlje, buzdovan visi. Kadar 5 se pretapa u 0.'),
      ])
brief(84, 'Mladi Turčin sa očevom sabljom (Opsednuta tvrđava)',
      'Mladi Turčin (Mustaf-aga iz pesme „Marko Kraljević poznaje očinu sablju”) nosi sablju kralja Vukašina. Ima stav, hod, udarac, pogođen i smrt. Igra ga stavlja da spava u taboru, a traži i buđenje, ispad i skok.',
      '- `mladi-turcin-idle-kadar0.png`: **mladi Turčin**, ćelija 512×512, stopala na y=488, gleda udesno, visok 426 px. Mlad, golobrad, beli turban sa belim perom, zelena dolama sa zlatnim vezom, crven pojas, za pojasom sablja u zlatnim koricama sa tri balčaka. **Uzor lika i veličine za sve klipove.**\n- `pokret-mladi-turcin-run.png`, `-attack.png`, `-hurt.png`, `-death.png`: isti mladić u pokretima koje već ima.\n- `pokret-sword-spava.png`, `pokret-sword-budi.png`: kako u igri spava i budi se janičar (uzor POKRETA, ne lika).',
      'mladi-turcin-idle-kadar0.png', 426, [
          ('mladi-turcin-spava', 6, 'da', 'Spava kao janičar u `pokret-sword-spava.png`: pokret i položaj tela isti, ali lik je mladi Turčin; sablja u koricama uz njega. Diše polako, glava klonula. Kadar 5 se pretapa u 0.'),
          ('mladi-turcin-budi', 6, 'ne', 'Budi se kao janičar u `pokret-sword-budi.png`: trgne se, digne glavu, skoči na noge i hvata se za balčak sablje; kadar 5 je uspravan stav kao uzor.'),
          ('mladi-turcin-lunge', 6, 'ne', 'Ispad sabljom. 0: stoji; 1: izvuče sablju i povuče je uz bok; 2–3: dugačak iskorak napred, ruka sa sabljom ispružena vodoravno udesno; 4: drži; 5: vraća se u stav. Stopala na y=488.'),
          ('mladi-turcin-jump', 6, 'ne', 'Lak skok napred sa sabljom. 0: čučne; 1: odraz; 2: u vazduhu, sablja iznad glave; 3: pada; 4: doskok; 5: uspravi se. ' + SKOK),
      ])
PROP = '''
## Deo 2: trnje (slika 1536×1024, providna pozadina, `art/world-pack-03/prop-trnje.png`)

Crta se na ravnoj **jarko ljubičastoj #ff00ff** pozadini (zelena bi pojela lišće) i ključ skida ljubičastu. Posle skidanja pogledaj sliku na plavoj I na beloj podlozi: ne sme ostati ljubičast rub, a u predmetu ne sme biti rupica. Uzor rukopisa, boja i svetla su `stil-prop-zbun.png`, `stil-prop-paprat.png`, `stil-prop-korenje.png` (topla svetlost sleva, slikano, mat, jasna tamna kontura). Predmet gledan sa strane, zauzima skoro ceo okvir, donja ivica leži na dnu okvira; bez tla, senke, ljudi i teksta. Najviše tri pokušaja.

| Ime | Šta se vidi |
|---|---|
| `prop-trnje` | Gust, nizak i širok grm kupine i gloga na planini: isprepletene tamne grane pune oštrog trnja, nešto zelenog i crvenkastog lišća, po neka crna kupina i crven glog. Grane štrče na sve strane, kao zid od trnja. Tri puta širi nego visok. |
'''
brief(85, 'strelac i oklopnik u tvrđavi, trnje Miroča',
      'U Opsednutoj tvrđavi strelci se penju uz lestve na bedeme, a oklopnik nema običan udarac (ima samo tresak). U Ravijojlinoj šumi vila bere bilje preko trnja, koje se sada crta kodom.',
      '- `archer-idle-kadar0.png`: **strelac**, ćelija 512×512, stopala na y=488, gleda udesno, visok 456 px. Crvena kapa sa belim turbanom, žuto-plava dolama, tobolac sa strelama na leđima, luk u levoj ruci, strela u desnoj. **Uzor lika i veličine za `archer-climb`.**\n- `oklopnik-idle-kadar0.png`: **oklopnik**, ista ćelija, visok 428 px. Šlem sa verižnjačom, ljuskast zlatni oklop, crvena prošivena dolama, ratni čekić preko ramena, okrugao štit. **Uzor lika i veličine za `oklopnik-attack`.**\n- `pokret-sword-climb.png`: kako se u igri penje janičar (uzor POKRETA). `pokret-archer-run.png`, `pokret-archer-jump.png`, `pokret-oklopnik-slam.png`, `-walk.png`, `-grab.png`: isti likovi u pokretima koje već imaju.',
      'archer-idle-kadar0.png (za strelca) i oklopnik-idle-kadar0.png (za oklopnika)', '456 za strelca, 428 za oklopnika', [
          ('archer-climb', 8, 'da', 'Penje se uz lestve kao janičar u `pokret-sword-climb.png` (lestve se NE crtaju): okrenut leđima ka nama, ruke i noge naizmenično hvataju prečke iznad, luk preko leđa uz tobolac. Kadar 7 se pretapa u 0.'),
          ('oklopnik-attack', 6, 'ne', 'Udarac čekićem napred (vodoravno, nije tresak o zemlju). 0: stoji; 1: štit napred, čekić povučen unazad preko ramena; 2: široko zamahne udesno u visini grudi; 3: čekić ispružen napred na kraju zamaha; 4: telo ide za zamahom; 5: vraća se u stav.'),
      ], extra=PROP)
