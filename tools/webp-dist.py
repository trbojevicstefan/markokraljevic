"""Lakša igra za objavu: listovi animacija iz PNG-a u WebP (Stefan, 15. 11. 2026: „WEbpp").

U repou i na računaru sve ostaje PNG (rig, Codex, sync-anims.py i build-sprite-rig.py rade sa PNG-om).
Ovo se pušta samo nad kopijom za objavu (GitHub Pages, posle testova) ili nad probnom kopijom:

    python tools/webp-dist.py <folder-igre> [--cache <folder>]

U <folder-igre>/assets: svaki list iz sprite-rig.json koji je .png postaje .webp (quality 90, providnost bez gubitka),
PNG se briše, a sprite-rig.json pokazuje na .webp. Listovi koje HTML/CSS/JS zovu direktno (assets/gorge.png, ceo cast/)
ostaju PNG. Keš je po sadržaju (sha1 PNG-a), pa se pri sledećoj objavi pretvara samo ono što je novo.
Odbija da radi nad pravim dist/ u repou, da se slučajno ne obrišu izvorni PNG-ovi.
"""
import argparse, hashlib, json, os, re, shutil, sys
from concurrent.futures import ProcessPoolExecutor
from PIL import Image

Q = dict(quality=90, alpha_quality=100, method=4)


def convert(job):
    png, out, cache = job
    data = open(png, 'rb').read()
    key = hashlib.sha1(data).hexdigest()
    hit = os.path.join(cache, key + '.webp') if cache else None
    if hit and os.path.exists(hit):
        shutil.copyfile(hit, out)
        made = False
    else:
        im = Image.open(png)
        im.load()
        im.convert('RGBA').save(out, 'WEBP', **Q)
        made = True
        if hit:
            shutil.copyfile(out, hit + '.tmp')
            os.replace(hit + '.tmp', hit)
    with Image.open(png) as a, Image.open(out) as b:
        if a.size != b.size:
            raise SystemExit(f'{png}: WebP {b.size} != PNG {a.size}')
    # the phone (LITE) asks for a half-size copy in assets/pola/; clips drawn after it was made had none (404, then the full sheet)
    assets = os.path.dirname(png)
    rel = os.path.relpath(png, assets)
    half = os.path.join(assets, 'pola', rel[:-4] + '.webp')
    made_half = False
    if os.path.isdir(os.path.join(assets, 'pola')) and not os.path.exists(half):
        os.makedirs(os.path.dirname(half), exist_ok=True)
        with Image.open(png) as im:
            im = im.convert('RGBA')
            im.resize((max(1, im.width // 2), max(1, im.height // 2)), Image.LANCZOS).save(half, 'WEBP', quality=85, alpha_quality=100, method=4)
        made_half = True
    before, after = len(data), os.path.getsize(out)
    os.remove(png)
    return before, after, made, made_half


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('root', help='folder igre (onaj u kom je index.html), kopija za objavu')
    ap.add_argument('--cache', default=None)
    a = ap.parse_args()
    root = os.path.abspath(a.root)
    repo_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'dist'))
    if root == repo_dist and not os.environ.get('CI'):
        sys.exit('Ne nad pravim dist/ u repou: napravi kopiju ili pusti u objavi (CI).')
    assets = os.path.join(root, 'assets')
    rig_path = os.path.join(assets, 'sprite-rig.json')
    rig = json.load(open(rig_path, encoding='utf-8'))
    direct = set()
    for f in os.listdir(root):
        if f.endswith(('.js', '.html', '.css')):
            direct |= set(re.findall(r'assets/([A-Za-z0-9_/.-]+?\.png)', open(os.path.join(root, f), encoding='utf-8').read()))
    if a.cache:
        os.makedirs(a.cache, exist_ok=True)
    # cast/<lik>.png se zove i preko šablona (`assets/cast/${n}.png`), pa ceo cast/ ostaje PNG
    images = sorted({r['image'] for r in rig.values()
                     if r['image'].endswith('.png') and r['image'] not in direct and not r['image'].startswith('cast/')})
    jobs = [(os.path.join(assets, im), os.path.join(assets, im[:-4] + '.webp'), a.cache) for im in images
            if os.path.exists(os.path.join(assets, im))]
    with ProcessPoolExecutor() as ex:
        res = list(ex.map(convert, jobs, chunksize=4))
    done = {os.path.relpath(j[0], assets).replace('\\', '/') for j in jobs}
    for r in rig.values():
        if r['image'] in done:
            r['image'] = r['image'][:-4] + '.webp'
    json.dump(rig, open(rig_path, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    b, w = sum(x[0] for x in res), sum(x[1] for x in res)
    print(f'WebP: {len(res)} listova, {b / 1e6:.0f} MB -> {w / 1e6:.0f} MB, novo pretvoreno {sum(x[2] for x in res)}, '
          f'ostaju PNG (zovu se direktno): {len(direct)}, nove lake kopije za telefon: {sum(x[3] for x in res)}')


if __name__ == '__main__':
    main()
