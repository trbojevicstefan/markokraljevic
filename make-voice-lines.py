"""Generates all voice lines with ElevenLabs (eleven_v4) into dist/assets/voice/.

Needs the ELEVENLABS_API_KEY environment variable. Edit LINES and run:
    python make-voice-lines.py            # only missing files
    python make-voice-lines.py --force    # regenerate everything
    python make-voice-lines.py super_1    # regenerate selected ids
"""
import json, os, sys, urllib.request, urllib.error

VOICES = {
    'marko': 'pb4oiB4KzXBEHjmRgsdK',   # Tuco (cloned voice in the account)
    'musa': 'adxhr4Ei7ASJ3Cz7fxwX',    # Slobodan
    'vila': 'd3l4f3HgkE3P6Fo91lYA',    # Ida, Serbian
    'turk': 'SOYHLrjzK2X1ezoPC6cr',    # Harry, fierce warrior (speaks Turkish here)
    # each kind of Ottoman has his own voice (all speak Turkish)
    'akindzija': 'IKne3meq5aSn9XLyUdCD',  # Charlie, deep and wild: the raiders
    'oklopnik': 'OFHP1Qg30FPoNfkUFFlA',   # Adam, deep and rich: the armoured
    'palikuca': 'N2lVS1w4EtoT3dr4eOWO',   # Callum, husky trickster: the fire-raiser
    'strelac': 'TX3LPaxmHKxFdv7VOQHJ',    # Liam, young and loud: the archers
    # the champions speak Serbian, each in his own voice
    'hasan': 'OFHP1Qg30FPoNfkUFFlA',      # Hasan-aga Oklopnik
    'beg': 'pNInz6obpgDQGcFmaJgB',        # Akindžijski beg (Adam, dominant)
    'ognjeni': 'N2lVS1w4EtoT3dr4eOWO',    # Ognjeni aga
    'bajraktar': 'nPczCjzI2devNBz1zQrb',  # Bajraktar (Brian, deep)
    'janicar': 'cjVigY5qzO86Huf0OWal',    # Janičarski aga (Eric, smooth)
    'arapin': '9SPZl4Mlgwj7QT4gVprb',     # Arapin (Adam, warm and classic)
    # the travellers Musa keeps off the road
    'starac': 'DAGnQ7r9sMtV0Q44g1Mi',     # Nikola
    'trgovac': 'j96cp162VcYdsYfSp1nc',    # Ivan
}
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dist', 'assets', 'voice')

# id: (speaker, text, language). eleven_v4 reads the [tags] as delivery directions.
LINES = {
    # Marko: crude, loud, spits on the enemy
    'super_1': ('marko', '[shouting] [furious] Marš u pičku materinu, Turci!', 'sr'),
    'super_2': ('marko', '[shouting] Marš u pičku materinu, turska kopilad!', 'sr'),
    'super_3': ('marko', '[furious] [shouting] Marš!!! U pičku materinu!', 'sr'),
    'atk_1': ('marko', '[shouting] Evo ti, pičko!', 'sr'),
    'atk_2': ('marko', '[effort] Na! Jebem ti!', 'sr'),
    'atk_3': ('marko', '[shouting] Uzmi, kopile!', 'sr'),
    'kill_1': ('marko', '[spits] Ptu! Turska kopilad!', 'sr'),
    'kill_2': ('marko', '[shouting] Jebem ti sultana!', 'sr'),
    'kill_3': ('marko', '[laughs] Ajde, sledeći, pičko!', 'sr'),
    'kill_4': ('marko', "[mocking] Je l' to sve što imate, kopilad turska?", 'sr'),
    'kill_5': ('marko', '[spits] Pljujem ti na turban, pseto!', 'sr'),
    'kill_6': ('marko', '[angry] Lezi tu, kurvin sine!', 'sr'),
    'kill_7': ('marko', '[shouting] Jebem vam mater sultansku!', 'sr'),
    'hurt_1': ('marko', '[pained] Jebem ti mater!', 'sr'),
    'hurt_2': ('marko', '[angry] [pained] Aah, kurvin sine!', 'sr'),
    'hurt_3': ('marko', '[pained] U pičku materinu!', 'sr'),
    'hurt_4': ('marko', '[growls] Jebo te sultan, boli!', 'sr'),
    'block_1': ('marko', '[laughs] Nećeš, bre, pičko!', 'sr'),
    'block_2': ('marko', '[mocking] Promašio si, kopile!', 'sr'),
    'block_3': ('marko', '[spits] Ptu! Slabo, Turčine!', 'sr'),
    'rage': ('marko', '[growling] Uzavrela mi krv! Sad ste najebali!', 'sr'),
    'wine_1': ('marko', '[happy] E, ovo je vino! Živeli, braćo!', 'sr'),
    'wine_2': ('marko', '[laughs] Ah, vino! Sad ću vas jebati redom!', 'sr'),
    'fairy': ('marko', '[calling out] Ravijojla, sestro, pomozi!', 'sr'),
    'horse': ('marko', '[shouting] Ajde, Šarac! Gazi tursku kopilad!', 'sr'),
    'chapter': ('marko', '[determined] Napred! Drum je naš, jebem vam mater!', 'sr'),
    'low': ('marko', '[strained] Neće Marko ovde pasti, kopilad turska!', 'sr'),
    'boss': ('marko', '[shouting] Muso! Izlazi na megdan, pičko jedna!', 'sr'),
    'phase': ('marko', '[mocking] Još dva srca, Muso? Izvadiću ti i njih, kurvo!', 'sr'),
    'victory': ('marko', '[tired] Tri srca, Muso... a nijedno junačko.', 'sr'),
    'death': ('marko', '[weak] Jebem ti... ustaću ja.', 'sr'),
    # effort grunts (they replace the swing whoosh)
    'grunt_1': ('marko', '[effort] Hah!', 'sr'),
    'grunt_2': ('marko', '[grunts] Hrrah!', 'sr'),
    'grunt_3': ('marko', '[effort] Hup!', 'sr'),
    'grunt_4': ('marko', '[strained] Aah!', 'sr'),
    'gruntheavy_1': ('marko', '[shouting] Aaaaahh!', 'sr'),
    'gruntheavy_2': ('marko', '[effort] Hraaah!', 'sr'),
    'gruntheavy_3': ('marko', '[roars] Aaaargh!', 'sr'),
    'spin_1': ('marko', '[shouting] Vihor, kopilad!', 'sr'),
    'spin_2': ('marko', '[laughs] U krug, pičke turske!', 'sr'),
    'kill_8': ('marko', '[laughs] Još jedan, jebem ti mater!', 'sr'),
    'kill_9': ('marko', '[shouting] Ko je sledeći za topuz?', 'sr'),
    'kill_10': ('marko', '[angry] Crkni, pseto turbansko!', 'sr'),
    'kill_11': ('marko', '[mocking] Pozdravi sultana, kopile!', 'sr'),
    'taunt_1': ('marko', '[shouting] Ajde, priđite, kopilad!', 'sr'),
    'taunt_2': ('marko', '[mocking] Šta stojite, pičke? Ajde!', 'sr'),
    'taunt_3': ('marko', '[spits] Ptu! Dođite po batine!', 'sr'),
    'guard_1': ('marko', '[annoyed] Jebem ti štit!', 'sr'),
    'guard_2': ('marko', '[shouting] Skloni tu tepsiju!', 'sr'),
    'pit': ('marko', '[shouting] Jebem ti klisuru!', 'sr'),
    'relic': ('marko', '[laughs] Zapis legende! Pa ja sam poznat!', 'sr'),
    # Musa Kesedžija
    'musa_intro': ('musa', '[menacing] Ko mi to dolazi na drum? [laughs] Marko... doći ćeš mi glave.', 'sr'),
    'musa_phase2': ('musa', '[angry] Prvo srce... imam još dva!', 'sr'),
    'musa_phase3': ('musa', '[furious] Treće srce ne daje se lako!', 'sr'),
    'musa_death': ('musa', '[dying] Tri srca... a nijedno... dosta.', 'sr'),
    'musa_taunt_1': ('musa', '[laughs] Tvoj topuz je kao perce, Marko!', 'sr'),
    'musa_taunt_2': ('musa', '[menacing] Stani da te iseckam!', 'sr'),
    # Ravijojla (female voice)
    'vila_heal_1': ('vila', '[warm] Evo me, Marko! Ustaj, junače!', 'sr'),
    'vila_heal_2': ('vila', '[gentle] Neka ti rane zarastu, brate.', 'sr'),
    'vila_heal_3': ('vila', '[sighs] Marko, Marko... pazi malo kako govoriš!', 'sr'),
    'vila_bridge_1': ('vila', '[magical] Kamenje, probudi se!', 'sr'),
    'vila_bridge_2': ('vila', '[magical] Most od zvezda, za mog brata!', 'sr'),
    'vila_stun_1': ('vila', '[fierce] Stanite, zlotvori!', 'sr'),
    'vila_stun_2': ('vila', '[fierce] Oslepite od svetla!', 'sr'),
    'vila_lift_1': ('vila', '[whispers] Leti, junače!', 'sr'),
    'vila_lift_2': ('vila', '[laughs] Gore, Marko!', 'sr'),
    'vila_wine': ('vila', '[scolding] Opet vino, Marko? Ti nisi normalan!', 'sr'),
    'vila_worry': ('vila', '[worried] Marko! Čuvaj se!', 'sr'),
    'vila_super': ('vila', '[laughs] Kakav jezik, Marko!', 'sr'),
    # Ottoman soldiers (Turkish)
    'tr_alarm': ('turk', '[shouting] Marko geliyor!', 'tr'),
    'tr_attack_1': ('turk', '[shouting] Saldırın!', 'tr'),
    'tr_attack_2': ('turk', '[shouting] Yakalayın onu!', 'tr'),
    'tr_attack_3': ('turk', '[shouting] Öldürün onu!', 'tr'),
    'tr_fear': ('turk', '[scared] Kaçın! Marko geliyor!', 'tr'),
    'tr_death_1': ('turk', '[pained] Aaah!', 'tr'),
    'tr_death_2': ('turk', '[dying] Ahh... anne...', 'tr'),
    # more janissaries
    'tr_alarm_2': ('turk', '[shouting] Düşman! Marko burada!', 'tr'),
    'tr_alarm_3': ('turk', '[shouting] Hücum! Hepiniz, hücum!', 'tr'),
    'tr_alarm_4': ('turk', '[shouting] Kesin yolunu!', 'tr'),
    'tr_attack_4': ('turk', '[shouting] Al bunu, gâvur!', 'tr'),
    'tr_attack_5': ('turk', '[shouting] Vur! Vur!', 'tr'),
    'tr_hurt_1': ('turk', '[pained] Ah!', 'tr'),
    'tr_hurt_2': ('turk', '[pained] Aman! Kolum!', 'tr'),
    'tr_block_1': ('turk', '[laughs] Boşuna, Marko!', 'tr'),
    'tr_taunt_1': ('turk', '[mocking] Gel buraya, Kraloğlu!', 'tr'),
    'tr_taunt_2': ('turk', '[mocking] Korktun mu, Marko?', 'tr'),
    'tr_fear_2': ('turk', '[scared] Kaçın! Bu adam şeytan!', 'tr'),
    'tr_fear_3': ('turk', '[panicked] Aman! Topuz geliyor!', 'tr'),
    'tr_death_3': ('turk', '[dying] Ahh...', 'tr'),
    'tr_death_4': ('turk', '[dying] Ana...', 'tr'),
    # raiders
    'ak_alarm_1': ('akindzija', '[war cry] Akın! Akın!', 'tr'),
    'ak_alarm_2': ('akindzija', '[war cry] Hey, hey! Yürüyün!', 'tr'),
    'ak_attack_1': ('akindzija', '[shouting] Yaaah!', 'tr'),
    'ak_attack_2': ('akindzija', '[laughs] Yakaladım seni!', 'tr'),
    'ak_attack_3': ('akindzija', '[shouting] Kes! Kes!', 'tr'),
    'ak_hurt_1': ('akindzija', '[pained] Ahh!', 'tr'),
    'ak_death_1': ('akindzija', '[dying] Ahh... atım...', 'tr'),
    # the armoured
    'ok_attack_1': ('oklopnik', '[growls] Ezerim seni!', 'tr'),
    'ok_attack_2': ('oklopnik', '[deep laugh] Zırhım delinmez!', 'tr'),
    'ok_hurt_1': ('oklopnik', '[grunts] Hmph!', 'tr'),
    'ok_death_1': ('oklopnik', '[groans] Zırhım... kırıldı...', 'tr'),
    # the fire-raisers
    'pl_attack_1': ('palikuca', '[laughs maniacally] Yanın! Hepiniz yanın!', 'tr'),
    'pl_attack_2': ('palikuca', '[shouting] Ateş! Ateş!', 'tr'),
    'pl_hurt_1': ('palikuca', '[hisses] Ahh!', 'tr'),
    'pl_death_1': ('palikuca', '[screams] Yanıyorum!', 'tr'),
    # archers
    'ar_attack_1': ('strelac', '[shouting] Oklar! Atın!', 'tr'),
    'ar_attack_2': ('strelac', '[calling out] Nişan alın!', 'tr'),
    'ar_attack_3': ('strelac', '[shouting] Yukarıda! Vurun onu!', 'tr'),
    'ar_death_1': ('strelac', '[dying] Ahh...', 'tr'),
    # the champions (Serbian, so the player understands their threats)
    'aga_hasan_intro': ('hasan', '[deep, menacing] Kraljeviću Marko! Hasan-aga ti je na putu. Ovaj oklop nijedan topuz ne probi.', 'sr'),
    'aga_hasan_taunt': ('hasan', '[laughs deeply] Udri, udri... kao da kiša pada.', 'sr'),
    'aga_hasan_phase': ('hasan', '[roars] Oklop mi puca?! Ne može biti!', 'sr'),
    'aga_hasan_death': ('hasan', '[dying] Teško... teško meni...', 'sr'),
    'aga_beg_intro': ('beg', '[shouting] Ha! Pešak protiv konjanika? Gaziću te, đaurine!', 'sr'),
    'aga_beg_taunt': ('beg', '[laughs] Moj je zelenko brži od tvoga Šarca!', 'sr'),
    'aga_beg_phase': ('beg', '[angry] Oborio me s konja?! Sablju! Dajte sablju!', 'sr'),
    'aga_beg_death': ('beg', '[dying] Akindžije... beg vam pade...', 'sr'),
    'aga_ognjeni_intro': ('ognjeni', '[cackling] Dobro došao u moj podrum, Marko! Ovde sve gori... pa i ti!', 'sr'),
    'aga_ognjeni_taunt': ('ognjeni', '[laughs maniacally] Igraj, Marko, igraj po žeravici!', 'sr'),
    'aga_ognjeni_phase': ('ognjeni', '[furious] Sve neka gori!', 'sr'),
    'aga_ognjeni_death': ('ognjeni', '[screams] Vatra... moja vatra...', 'sr'),
    'aga_bajraktar_intro': ('bajraktar', '[proud] Dok ovaj barjak stoji, nijedan moj vojnik ne beži!', 'sr'),
    'aga_bajraktar_taunt': ('bajraktar', '[shouting] Uz barjak, junaci! Uz barjak!', 'sr'),
    'aga_bajraktar_phase': ('bajraktar', '[shocked] Barjak... pade mi barjak!', 'sr'),
    'aga_bajraktar_death': ('bajraktar', '[dying] Pokrijte me... barjakom...', 'sr'),
    'aga_janicar_intro': ('janicar', '[calm, dangerous] Čuo sam da si junak, Marko. Ja sam janičarski aga. Da vidimo.', 'sr'),
    'aga_janicar_taunt': ('janicar', '[mocking] Prespor si, Kraljeviću.', 'sr'),
    'aga_janicar_phase': ('janicar', '[cold] Dosta igre. Sad dve sablje.', 'sr'),
    'aga_janicar_death': ('janicar', '[dying] Dobar si... bio si bolji...', 'sr'),
    'aga_arapin_intro': ('arapin', '[booming] Ko to ulazi u moju kulu? Svadbarinu si doneo, Marko? Glavu ćeš mi dati!', 'sr'),
    'aga_arapin_taunt': ('arapin', '[laughs] Penji se, Marko, penji... sa vrha se lepo pada!', 'sr'),
    'aga_arapin_phase': ('arapin', '[furious] Dosta! Hajde na vrh kule, da te bacim u more!', 'sr'),
    'aga_arapin_death': ('arapin', '[dying] Kula... moja kula...', 'sr'),
    # the travellers
    'pt_starac_1': ('starac', '[old, tired] Tri godine, sinko... tri godine niko ne prođe ovim drumom. Musa Kesedžija zatvorio je drumove i primorje.', 'sr'),
    'pt_trgovac_1': ('trgovac', '[worried] Roba mi trune ovde, a Musa traži glavu svakome ko krene napred.', 'sr'),
    'pt_putnica_1': ('vila', '[scared, pleading] Marko! Zar si to ti? Dete mi je gladno... otvori nam drum, junače!', 'sr'),
    'pt_free_1': ('starac', '[joyful] Kapija je otvorena! Bog te poživeo, Marko!', 'sr'),
    'pt_free_2': ('trgovac', '[urgent] Idemo, braćo, idemo dok je kapija otvorena!', 'sr'),
    'pt_free_3': ('vila', '[crying with joy] Hvala ti, junače!', 'sr'),
    'pt_fear_1': ('trgovac', '[panicked] Turci! Opet dolaze!', 'sr'),
    'pt_end_1': ('starac', '[awed] Pade Musa... pade Kesedžija! Slobodni su drumovi!', 'sr'),
    # Marko, new
    'mounted_1': ('marko', '[shouting] S konja ću te, kopile!', 'sr'),
    'mounted_2': ('marko', '[laughs] Gazi ih, Šarac!', 'sr'),
    'putnici': ('marko', '[warm] Ne bojte se, braćo. Marko je ovde. Drum će biti slobodan.', 'sr'),
    'pinned': ('marko', '[strained, choking] Ravijojla... sestro... gde si sad?!', 'sr'),
    'noz': ('marko', '[shouting] Evo ti nož zatajac, Muso!', 'sr'),
    'weak': ('marko', '[weak] Ranio me, pseto... ali drum je slobodan.', 'sr'),
    'meg_1': ('marko', '[shouting] Izlazi, aga, da ti vidim srce!', 'sr'),
    'meg_2': ('marko', '[mocking] Još jedan aga, još jedan topuz.', 'sr'),
    # Musa, the new stages of the duel
    'musa_joust': ('musa', '[shouting] Koplje na koplje, Kraljeviću!', 'sr'),
    'musa_sword': ('musa', '[menacing] Polomismo koplja. Hajde sad sablje!', 'sr'),
    'musa_kostac': ('musa', '[furious] Dosta gvožđa! U koštac, Marko!', 'sr'),
    'musa_pin': ('musa', '[triumphant] Sad si moj, Kraljeviću! Gde ti je sad vila?', 'sr'),
    'musa_look': ('musa', '[startled] Ko to... ko to zove iz oblaka?!', 'sr'),
    'vila_kostac': ('vila', '[urgent] Zar ti nisam govorila, brate, da ne biješ megdan u nedelju? A gde su ti ljute guje u nedrima?!', 'sr'),
}


def generate(line_id, speaker, text, lang):
    key = os.environ.get('ELEVENLABS_API_KEY')
    if not key:
        sys.exit('ELEVENLABS_API_KEY nije postavljen.')
    body = json.dumps({
        'text': text,
        'model_id': 'eleven_v4',
        'language_code': lang,
        'voice_settings': {'stability': 0.0, 'similarity_boost': 0.85},
    }).encode()
    req = urllib.request.Request(
        f'https://api.elevenlabs.io/v1/text-to-speech/{VOICES[speaker]}?output_format=mp3_44100_128',
        data=body, headers={'xi-api-key': key, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg'})
    with urllib.request.urlopen(req, timeout=120) as r:
        audio = r.read()
    with open(os.path.join(OUT, line_id + '.mp3'), 'wb') as f:
        f.write(audio)
    print(f'{line_id:12s} {len(audio) // 1024:4d} KB  {text}', flush=True)


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    force = '--force' in sys.argv
    for line_id, (speaker, text, lang) in LINES.items():
        if args and line_id not in args:
            continue
        if not force and not args and os.path.exists(os.path.join(OUT, line_id + '.mp3')):
            continue
        try:
            generate(line_id, speaker, text, lang)
        except urllib.error.HTTPError as e:
            print(line_id, 'GREŠKA', e.code, e.read()[:300].decode(errors='replace'), flush=True)
    with open(os.path.join(OUT, 'lines.json'), 'w', encoding='utf-8') as f:
        json.dump(sorted(i for i in LINES if os.path.exists(os.path.join(OUT, i + '.mp3'))), f)
