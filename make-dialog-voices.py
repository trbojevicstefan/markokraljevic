"""Ozvučava dijaloge i priče iz igre (ElevenLabs eleven_v4) u dist/assets/voice/d/<id>.mp3.

Ulaz: art/glasovi/replike.json (pravi ga `node tools/popis-replika.mjs`), art/glasovi/glasovi.json (ko kojim glasom)
i art/glasovi/rezija.json (ton, ko izgovara koji citat, tekst za glas). Izlaz: mp3 po replici i
dist/assets/voice/dijalog.json (tekst iz igre -> [id, trajanje]), po kome igra pušta glas uz speak() i priče.

Replika sa citatom se deli: priču čita guslar, citat lik čiji je; delovi se spajaju u jedan snimak.
Tekst ide glasu ćirilicom: tako Tuco (klon sa engleskim naglaskom) kaže „Ravijojla“, a ne „Ravidžojla“.
Svaki deo se čuva u .glasovi-uzorci/kes/, pa ponovno pokretanje ne troši kredite.

    set ELEVENLABS_API_KEY=...            (ključ naloga u kom su glasovi)
    python make-dialog-voices.py --plan             # šta bi se radilo i koliko znakova, bez slanja
    python make-dialog-voices.py --bez GUSLAR       # sve replike u kojima guslar ne govori
    python make-dialog-voices.py --samo GUSLAR      # samo one u kojima guslar govori
    python make-dialog-voices.py --ids d123,d456    # izabrane replike
    python make-dialog-voices.py --ids d123 --ponovi   # novi snimak, mimo keša
    python make-dialog-voices.py --limit 20
"""
import argparse, concurrent.futures as cf, hashlib, json, os, re, subprocess, sys, tempfile, threading, time
import urllib.error, urllib.request

ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, 'dist', 'assets', 'voice', 'd')
MANIFEST = os.path.join(ROOT, 'dist', 'assets', 'voice', 'dijalog.json')
CACHE = os.path.join(ROOT, '.glasovi-uzorci', 'kes')
MODEL = 'eleven_v4'
SKIP_KAT = {'uputstvo', 'greybox (probni nivoi)', 'samo za razvoj'}
PAUSE = 0.35  # seconds of silence between the parts of one line

load = lambda p: json.load(open(os.path.join(ROOT, p), encoding='utf-8'))

# ---------- latinica -> ćirilica (oznake u [ ] ostaju) ----------
_DI = {'lj': 'љ', 'nj': 'њ', 'dž': 'џ'}
_ONE = dict(zip('abvgdđežzijklmnoprstćufhcčš', 'абвгдђежзијклмнопрстћуфхцчш'))


def cyr(s):
    out, i = [], 0
    while i < len(s):
        if s[i] == '[':
            j = s.find(']', i)
            j = len(s) - 1 if j < 0 else j
            out.append(s[i:j + 1]); i = j + 1; continue
        two = s[i:i + 2]
        if two.lower() in _DI:
            c = _DI[two.lower()]
            out.append(c.upper() if two[0].isupper() else c); i += 2; continue
        ch = s[i]
        c = _ONE.get(ch.lower())
        out.append((c.upper() if ch.isupper() else c) if c else ch); i += 1
    return ''.join(out)


# ---------- jedna replika -> delovi [(lik, tekst, oznake)] ----------
def segments(r, rez, cfg):
    text = rez.get('tekst') or r['text']
    who = rez.get('govornik') or r['who']
    base_tone = rez.get('ton')
    kat_tone = cfg['po_vrsti'].get(r['kat'])
    parts = [p for p in re.split(r'(„[^”]*”)', text) if p.strip()]
    quotes = sum(p.startswith('„') for p in parts)
    narr = any(not p.startswith('„') for p in parts)
    citati = rez.get('citati')
    if citati is None and (who == 'GUSLAR' or not quotes or not narr):
        tone = base_tone or (kat_tone if who in ('GUSLAR', 'RAVIJOJLA') else None) or cfg['podrazumevano'].get(who, '[natural]')
        return [[who, text.strip(), tone]]
    if citati is None:
        citati = [[who, None]] * quotes
    narr_tone = base_tone or kat_tone or cfg['podrazumevano']['GUSLAR']
    segs, qi = [], 0
    for p in parts:
        if p.startswith('„'):
            spk, tone = citati[min(qi, len(citati) - 1)]; qi += 1
            if spk == 'GUSLAR':
                segs.append(['GUSLAR', p.strip(), tone or narr_tone]); continue
            segs.append([spk, p.strip()[1:-1].strip(), tone or cfg['podrazumevano'].get(spk, '[natural]')])
        else:
            segs.append(['GUSLAR', p.strip(), narr_tone])
    merged = []
    for s in segs:
        if merged and merged[-1][0] == s[0]:
            merged[-1][1] += ' ' + s[1]
        else:
            merged.append(s)
    return merged


def simple_tone(tone):
    """Marko (Tuco clone) gets one plain tag: long mixed directions gave him a strange accent."""
    t = (tone or '').lower()
    for keys, tag in [(('shout', 'furious', 'calling'), '[shouting]'), (('laugh', 'delight'), '[laughs]'),
                      (('mock', 'contempt', 'sly', 'amused', 'dry'), '[mocking]'), (('sad', 'griev', 'cry', 'remorse', 'farewell', 'bitter', 'tender'), '[sad]'),
                      (('weak', 'tired', 'strain', 'hoarse', 'sleepy', 'dying'), '[tired]'), (('desperate', 'plead'), '[pleading]'),
                      (('angry', 'threat', 'menac', 'cold', 'grim'), '[angry]'), (('warm', 'gentle', 'kind', 'calm', 'proud', 'confident'), '[calm]')]:
        if any(k in t for k in keys):
            return tag
    return '[firm]'


def tagged(spk, text, tone, cfg, cast=None):
    pre = cfg.get('osnova', {}).get(spk, '')
    if (cast or {}).get(spk, {}).get('pismo') == 'latinica':
        # in Latin, as the original lines were; only the fairy's name in Cyrillic, or he says "Ravidžojla"
        t = text.replace('Ravijojl', 'Равијојл')
        tone = simple_tone(tone)
    else:
        t = cyr(text)
    # pronunciation fixes, for everyone or for one speaker: {"Кесеџиј": "…"} or {"GUSLAR": {"…": "…"}}
    for k, v in cfg.get('izgovor', {}).items():
        if isinstance(v, dict):
            if k == spk:
                for a, b in v.items():
                    t = t.replace(a, b)
        else:
            t = t.replace(k, v)
    return f'{pre} {tone or ""} {t}'.replace('  ', ' ').strip()


# ---------- ElevenLabs ----------
KEY = os.environ.get('ELEVENLABS_API_KEY_NOVI') or os.environ.get('ELEVENLABS_API_KEY')
_sent = {'znakova': 0, 'zahteva': 0}
_lock = threading.Lock()


def tts(voice_id, stability, text, path):
    body = json.dumps({'text': text, 'model_id': MODEL, 'language_code': 'sr',
                       'voice_settings': {'stability': stability, 'similarity_boost': 0.85}}).encode()
    for attempt in range(6):
        req = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{voice_id}?output_format=mp3_44100_128',
                                     data=body, headers={'xi-api-key': KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg'})
        try:
            with urllib.request.urlopen(req, timeout=180) as r:
                data = r.read()
            tmp = path + '.tmp'
            open(tmp, 'wb').write(data); os.replace(tmp, path)
            with _lock:
                _sent['znakova'] += len(text); _sent['zahteva'] += 1
            return
        except urllib.error.HTTPError as e:
            msg = e.read()[:300].decode(errors='replace')
            if e.code in (429, 500, 502, 503, 504) and attempt < 5:
                time.sleep(3 * (attempt + 1)); continue
            raise RuntimeError(f'{e.code} {msg}')
        except (urllib.error.URLError, TimeoutError):
            if attempt < 5:
                time.sleep(3 * (attempt + 1)); continue
            raise


def credits():
    try:
        r = urllib.request.urlopen(urllib.request.Request('https://api.elevenlabs.io/v1/user/subscription', headers={'xi-api-key': KEY}), timeout=60)
        d = json.loads(r.read())
        return d['character_count'], d['character_limit']
    except Exception:
        return None, None


def duration(path):
    out = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path], capture_output=True, text=True).stdout
    return round(float(out.strip() or 0), 2)


def assemble(parts, dest):
    """Join the parts with short pauses, even out the loudness, write a mono 96 kb/s mp3."""
    args, filt = [], []
    for i, p in enumerate(parts):
        args += ['-i', p]
        filt.append(f'[{i}:a]aresample=44100,aformat=channel_layouts=mono,'
                    f'silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse'
                    + (f',apad=pad_dur={PAUSE}' if i < len(parts) - 1 else '') + f'[a{i}]')
    filt.append(''.join(f'[a{i}]' for i in range(len(parts))) + f'concat=n={len(parts)}:v=0:a=1,'
                'loudnorm=I=-17:TP=-1.5:LRA=11,aresample=44100[out]')
    tmp = dest + '.tmp.mp3'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', *args, '-filter_complex', ';'.join(filt), '-map', '[out]',
                    '-ac', '1', '-c:a', 'libmp3lame', '-b:a', '96k', tmp], check=True)
    os.replace(tmp, dest)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--plan', action='store_true')
    ap.add_argument('--ids', default='')
    ap.add_argument('--bez', default='', help='preskoči replike u kojima govori ovaj lik')
    ap.add_argument('--samo', default='', help='samo replike u kojima govori ovaj lik')
    ap.add_argument('--bez-teksta', default='', help='preskoči replike čiji tekst sadrži ovo (regex)')
    ap.add_argument('--limit', type=int, default=0)
    ap.add_argument('--ponovi', action='store_true', help='novi snimak mimo keša (uz --ids)')
    ap.add_argument('--niti', type=int, default=3)
    a = ap.parse_args()

    rep = load('art/glasovi/replike.json')['replike']
    cast = load('art/glasovi/glasovi.json')
    cfg = load('art/glasovi/rezija.json')
    rz = cfg['replike']
    ids = set(filter(None, a.ids.split(',')))

    jobs = []
    for r in rep:
        rez = rz.get(r['id'], {})
        if r['kat'] in SKIP_KAT or rez.get('preskoci'):
            continue
        if ids and r['id'] not in ids:
            continue
        if a.bez_teksta and re.search(a.bez_teksta, r['text']):
            continue
        segs = segments(r, rez, cfg)
        spk = {s[0] for s in segs}
        if a.bez and a.bez in spk or a.samo and a.samo not in spk:
            continue
        missing = [s[0] for s in segs if s[0] not in cast]
        if missing:
            print('NEMA GLASA za', missing, 'u', r['id']); continue
        jobs.append((r, segs))
    if a.limit:
        jobs = jobs[:a.limit]

    # every part, with its cache file
    os.makedirs(CACHE, exist_ok=True); os.makedirs(OUT, exist_ok=True)
    parts = {}
    for r, segs in jobs:
        for s in segs:
            c = cast[s[0]]
            text = tagged(s[0], s[1], s[2], cfg, cast)
            h = hashlib.sha1(json.dumps([c['voice_id'], c.get('stabilnost', 0.5), MODEL, text], ensure_ascii=False).encode()).hexdigest()[:16]
            s.append(os.path.join(CACHE, h + '.mp3'))
            parts[s[3]] = (c['voice_id'], c.get('stabilnost', 0.5), text, r['id'])
    if a.ponovi:
        for p in parts:
            if os.path.exists(p):
                os.remove(p)
    todo = {p: v for p, v in parts.items() if not os.path.exists(p)}
    chars = sum(len(v[2]) for v in todo.values())
    print(f'replika {len(jobs)}, delova {len(parts)}, za slanje {len(todo)} delova / {chars} znakova')
    if a.plan:
        for r, segs in jobs[:400]:
            print(r['id'], ' + '.join(f'{s[0]}{"*" if s[3] in todo else ""}' for s in segs))
            for s in segs:
                print('     ', parts[s[3]][2][:150])
        return
    if todo and not KEY:
        sys.exit('ELEVENLABS_API_KEY nije postavljen.')
    before = credits()[0] if todo else None
    errors = []

    def work(item):
        p, (vid, stab, text, rid) = item
        try:
            tts(vid, stab, text, p)
        except Exception as e:
            errors.append((rid, str(e)))
            print('GREŠKA', rid, e, flush=True)
    with cf.ThreadPoolExecutor(a.niti) as ex:
        for n, _ in enumerate(ex.map(work, todo.items()), 1):
            if n % 10 == 0:
                print(f'  {n}/{len(todo)} delova', flush=True)

    manifest = json.load(open(MANIFEST, encoding='utf-8')) if os.path.exists(MANIFEST) else {}
    made = 0
    for r, segs in jobs:
        files = [s[3] for s in segs]
        if not all(os.path.exists(f) for f in files):
            continue
        dest = os.path.join(OUT, r['id'] + '.mp3')
        stamp = os.path.join(CACHE, r['id'] + '.delovi')
        sig = json.dumps(files)
        if not os.path.exists(dest) or not os.path.exists(stamp) or open(stamp).read() != sig:
            assemble(files, dest)
            open(stamp, 'w').write(sig)
        manifest[r['text']] = [r['id'], duration(dest), rz.get(r['id'], {}).get('govornik') or r['who']]
        made += 1
    json.dump(dict(sorted(manifest.items(), key=lambda kv: kv[1][0])), open(MANIFEST, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    after = credits()[0] if todo else None
    print(f'gotovo: {made} replika u dist/assets/voice/d, poslato {_sent["znakova"]} znakova u {_sent["zahteva"]} zahteva'
          + (f', kredita potrošeno {after - before} (ukupno {after})' if before is not None and after is not None else ''))
    if errors:
        print('greške:', len(errors))


if __name__ == '__main__':
    main()
