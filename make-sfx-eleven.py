"""Makes the sound effects the free packs lack (gusle, the eagle, fire, bones, the cannon, a splash) with
ElevenLabs sound generation, converts them to OGG and lists them in dist/assets/sfx/sfx.json.

Needs the ELEVENLABS_API_KEY environment variable and ffmpeg on the PATH. Edit SOUNDS and run:
    python make-sfx-eleven.py [name ...]
Existing files are kept unless named on the command line.
"""
import json, os, subprocess, sys, tempfile, urllib.request

ROOT = os.path.dirname(os.path.abspath(__file__))
SFX = os.path.join(ROOT, 'dist', 'assets', 'sfx')

# name: (group, seconds, prompt)
SOUNDS = {
    'gusle_0': ('gusle', 6, 'Solo Serbian gusle, a one-string bowed folk fiddle, playing a slow raw haunting melodic phrase in a mountain gorge, old epic folk style, no voice, no other instruments'),
    'gusle_1': ('gusle', 6, 'Solo Balkan gusle, single horsehair string bowed with a nasal rasping tone, short mournful epic melody, no singing, no other instruments'),
    'orao_0': ('orao', 1.6, 'A golden eagle cry, one sharp piercing screech high in the open sky, natural, outdoors'),
    'orao_1': ('orao', 1.8, 'A large eagle calling twice, high-pitched screeching cry echoing over a forest'),
    'wings_0': ('wings', 1.2, 'A large bird diving fast, heavy wing beats and a rushing whoosh of air passing by'),
    'fire_0': ('fire', 2.5, 'Dry wood catching fire, a sudden whoosh of flame then crackling and popping'),
    'fire_1': ('fire', 2.5, 'A burning bush flaring up, crackling flames and snapping twigs'),
    'bones_0': ('bones', 1.5, 'Bones clattering and scattering on rocky ground, dry hollow knocks'),
    'bones_1': ('bones', 1.5, 'Several bones and a skull falling and bouncing on hard earth'),
    'cannon_0': ('cannon', 2.6, 'A medieval bronze cannon firing, one deep booming blast with a rolling echo over hills'),
    'cannon_1': ('cannon', 2.6, 'An old black powder cannon shot, loud thunderous boom and crackle, outdoors, echo'),
    'splash_0': ('splash', 1.6, 'A man in armor falling into a river, one heavy splash of water'),
}


def make(key, name, seconds, prompt):
    body = json.dumps({'text': prompt, 'duration_seconds': seconds, 'prompt_influence': 0.5}).encode()
    req = urllib.request.Request('https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128', data=body,
                                 headers={'xi-api-key': key, 'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=120) as r:
        mp3 = r.read()
    with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as f:
        f.write(mp3)
        tmp = f.name
    out = os.path.join(SFX, name + '.ogg')
    # trim the silence at the start, a short fade at the end, and a fixed loudness
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', tmp, '-af',
                    f'silenceremove=start_periods=1:start_threshold=-50dB,afade=t=out:st={max(0.1, seconds - 0.25)}:d=0.25,loudnorm=I=-16:TP=-1.5',
                    '-ar', '44100', '-c:a', 'libvorbis', '-q:a', '5', out], check=True)
    os.unlink(tmp)
    return out


def main():
    key = os.environ.get('ELEVENLABS_API_KEY')
    if not key:
        sys.exit('ELEVENLABS_API_KEY nije postavljen.')
    only = set(sys.argv[1:])
    manifest_path = os.path.join(SFX, 'sfx.json')
    manifest = json.load(open(manifest_path, encoding='utf8'))
    for name, (group, seconds, prompt) in SOUNDS.items():
        path = os.path.join(SFX, name + '.ogg')
        if (only and name not in only) or (not only and os.path.exists(path)):
            pass
        else:
            try:
                make(key, name, seconds, prompt)
                print('ok', name)
            except Exception as e:  # keep going; the message never carries the key
                print('greška', name, type(e).__name__, str(e)[:120])
                continue
        if os.path.exists(path):
            manifest.setdefault(group, [])
            if name not in manifest[group]:
                manifest[group].append(name)
    json.dump(manifest, open(manifest_path, 'w', encoding='utf8'), indent=1)


if __name__ == '__main__':
    main()
