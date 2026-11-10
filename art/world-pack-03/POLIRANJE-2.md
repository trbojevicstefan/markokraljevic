# Poliranje, krug 2: šta fali ili je slabo

Ovo je drugi pregled. Ono što je ostalo iz kruga 1 a nije urađeno ([POLIRANJE-1.md](POLIRANJE-1.md)) ovde se ne ponavlja, nego se samo navodi šta ovaj krug uzima.

## Pohodi i njihove pesme

| Pohod | Pesma | Šta fali |
|---|---|---|
| Klisura Ibra | Guslar peva o Marku | Guslar sedi na odmorištima i peva stihove priče. Turci hoće da mu polome gusle: Marko ga brani, a kad odbrani, guslar peva i Marku se puni bes. **(krug 2)** |
| Ravijojlina šuma | Marko Kraljević i orao | Palikuće pale bukvu sa orlovim gnezdom. Marko gasi vatru (pobije palikuće pre nego što plamen stigne do gnezda). Spaseni orao posle prati Marka: obrušava se na strelce, a kad je Marko ranjen, raširi krila nad njim (hlad leči). **(krug 2)** |

## Likovi i crteži koji fale (novo)

- **Guslar:** sedi na kamenu, svira i peva; čeka, a gusle mu stoje na kolenu.
- **Orao kao pomagač.** Postojeći `orao-flight` je mala ptica u pozadini. Fale:
  - veliki orao u letu;
  - obrušavanje sa kandžama napred;
  - lebdenje raširenih krila (hlad nad Markom).
- **Orlovo gnezdo sa orlićima,** na grani.
- **Lovac-aga** (bos Šume): sopstveni izgled. Ima lovački rog kojim pušta pse, pa mu treba i klip duvanja u rog.
- **Stihovi guslara:** traka od pergamenta za tekst pesme. Za sada se crta kodom.

## Zvuk koji fali (novo)

- Gusle: kratka melodija, za guslara.
- Krik orla.
- Pucketanje vatre, kosti koje padaju, topovski pucanj i pljusak (iz kruga 1). Ako ElevenLabs zvučni efekti rade, prave se u ovom krugu.

## Igra

- Klisura i Šuma su bile kraće od drugih pohoda (oko 20 soba): sada dobijaju po dve-tri sobe više i sobe vezane za pesmu.
- Bos Šume (Lovac-aga) je bio običan janičar uvećan: dobija svoj crtež i rog za pse.

## Krug 2 urađeno

1. Codex (DOPUNA-26), sve ubačeno:
   - guslar (sedi na kamenu, svira i čeka);
   - orao (let, obrušavanje sa kandžama, let sa čuturom vode);
   - orlovo gnezdo sa orlićima;
   - Lovac-aga u šest klipova, sa rogom.
2. Klisura po pesmi o guslaru:
   - tri guslara;
   - Turci jurišaju da polome gusle, a druga četa dolazi s leđa;
   - odbranjen guslar peva stih o Marku, puni bes i leči;
   - poslednji guslar peva u miru pred Kopljanik-bašom.
3. Šuma po pesmi o orlu:
   - palikuće pale bukvu sa gnezdom;
   - ako ih Marko pobije na vreme, orao ga prati, obrušava se na Turke i leči ga kad je teško ranjen;
   - orao mu ostavlja čudo „Orlovo pero”.
4. Lovac-aga sa svojim crtežom: duva u rog kad pušta pse.
5. Zvuci, napravljeni sintezom (`make-sfx-synth.py`): gusle, krik orla, krila, vatra, kosti, top i pljusak.
   - ElevenLabs nalog nema kredita: `make-sfx-eleven.py` je spreman za kad se dopuni.

## Ostaje za krug 3

- Močvara po pesmi o sokolu.
- Podrum po pesmi o ramazanu.
- Sopstveni crteži za Janičarskog agu, Bajraktara, Ognjenog agu i Hasan-agu.
- Efekti kao crteži: varnice, prašina, pljusak.
