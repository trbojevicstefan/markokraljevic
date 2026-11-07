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
