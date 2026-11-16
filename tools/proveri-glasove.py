"""Sluša napravljene glasove lokalnim Whisper modelom i poredi sa tekstom iz igre.

Javlja replike u kojima se čuje manje od praga (pogrešan izgovor, preskočene reči) i imena izgovorena pogrešno
(npr. „Ravidžojla“). Ne troši kredite.
    python tools/proveri-glasove.py                 # sve iz dist/assets/voice/dijalog.json
    python tools/proveri-glasove.py --ids d1,d2
    python tools/proveri-glasove.py --fajlovi a.mp3 b.mp3
"""
import argparse, difflib, json, os, re, subprocess, sys
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
C2L = dict(zip('абвгдђежзијклмнопрстћуфхцчшљњџ', ['a', 'b', 'v', 'g', 'd', 'đ', 'e', 'ž', 'z', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'r', 's', 't', 'ć', 'u', 'f', 'h', 'c', 'č', 'š', 'lj', 'nj', 'dž']))
# names that must come out right; what a wrong reading looks like
NAMES = {'ravijojl': r'ravi(d|dž|dz|g|gi|đ)\w*ojl', 'jevrosim': r'(dž|đ)evrosim', 'janj': r'(dž|đ)anj'}


def norm(s):
    s = ''.join(C2L.get(c, c) for c in s.lower())
    s = re.sub(r'\[[^\]]*\]', ' ', s)
    s = s.replace('ije', 'e').replace('je', 'e')  # ekavski/ijekavski i „j“ između samoglasnika ne kvare poređenje
    s = re.sub(r'[^a-zčćžšđ ]', ' ', s)
    return re.sub(r'\s+', ' ', s).strip()


def pcm(f):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-f', 's16le', '-ac', '1', '-ar', '16000', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.int16).astype(np.float32) / 32768


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--ids', default='')
    ap.add_argument('--fajlovi', nargs='*')
    ap.add_argument('--prag', type=float, default=0.72)
    a = ap.parse_args()
    from faster_whisper import WhisperModel
    model = WhisperModel('large-v3-turbo', device='cpu', compute_type='int8')
    items = []
    if a.fajlovi:
        items = [(f, f, '') for f in a.fajlovi]
    else:
        man = json.load(open(os.path.join(ROOT, 'dist', 'assets', 'voice', 'dijalog.json'), encoding='utf-8'))
        rep = {r['id']: r for r in json.load(open(os.path.join(ROOT, 'art', 'glasovi', 'replike.json'), encoding='utf-8'))['replike']}
        rez = json.load(open(os.path.join(ROOT, 'art', 'glasovi', 'rezija.json'), encoding='utf-8'))['replike']
        ids = set(filter(None, a.ids.split(',')))
        for text, (rid, *_) in man.items():
            if ids and rid not in ids:
                continue
            items.append((rid, os.path.join(ROOT, 'dist', 'assets', 'voice', 'd', rid + '.mp3'), rez.get(rid, {}).get('tekst') or text))
    bad = 0
    for rid, path, expect in items:
        segs, _ = model.transcribe(pcm(path), language='sr', beam_size=5)
        heard = ' '.join(s.text.strip() for s in segs)
        h = norm(heard)
        score = difflib.SequenceMatcher(None, norm(expect), h).ratio() if expect else 1
        names = [n for n, wrong in NAMES.items() if re.search(wrong, h) or (n in norm(expect) and n not in h and re.search(wrong, h))]
        flag = score < a.prag or names
        bad += bool(flag)
        print(f'{"!!" if flag else "ok"} {score:.2f} {rid} {"IME: " + ",".join(names) if names else ""}\n     čuje se: {heard}', flush=True)
    print(f'\nproveriti: {bad} od {len(items)}')


if __name__ == '__main__':
    main()
