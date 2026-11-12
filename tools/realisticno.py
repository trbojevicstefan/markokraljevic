"""Realistic parallax layers, materials and props for the long levels (Z-Image-Turbo img2img from drafts).

    PY=D:/projects/Videos/_tools/zimg/Scripts/python.exe
    $PY tools/realisticno.py drafts  <biome> [key,key]        draw the drafts  -> art/realisticno/<biome>/draft/
    $PY tools/realisticno.py jobs    <biome> [key,key] [--seeds 1,2] [--strength 0.8]
                                                              -> art/realisticno/<biome>/jobs.json
    $PY tools/zimg_img2img.py art/realisticno/<biome>/jobs.json   (GPU, one job file at a time)
    $PY tools/realisticno.py review  <biome> [key,key]        sheets to look at -> art/realisticno/<biome>/review/
    $PY tools/realisticno.py finish  <biome>                  webp into dist/assets/realisticno/<biome>/ + manifest

Biomes live in tools/realisticno_<biome>.py (drafts, prompts, props). A key is 'sky', 'far', 'mid', 'near',
'in-back', 'in-far', 'in-mid', 'in-near', 'mat-<name>' or 'prop-<id>'. Raw outputs are
art/realisticno/raw/<biome>_<key>_v<version>_s<seed>.png; art/realisticno/<biome>/picks.json may name the raw
file to use for a key, otherwise the newest raw file of the key is used.
"""
import glob, importlib, json, os, sys

import numpy as np
from PIL import Image, ImageDraw

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from realisticno_common import (FINAL_LAYER, FINAL_SKY, FINAL_TILE, LAYER, SKY, SPEED, TILE, prop_prompt,
                                tile_prompt)
from realisticno_post import (birefnet_alpha, key_layer, resize_wrap, resize_wrap_xy, save_webp, seam_score,
                              seam_strip)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ART = os.path.join(ROOT, 'art', 'realisticno')
RAW = os.path.join(ART, 'raw')
DIST = os.path.join(ROOT, 'dist', 'assets', 'realisticno')
ORDER = ['podgradje', 'urvina', 'klisura']


def biome(name):
    if name == 'svet-predmeti':
        return importlib.import_module('realisticno_zamena').make_biome()
    if name.startswith('svet-'):
        return importlib.import_module('realisticno_svet').BIOMES[name]
    return importlib.import_module(f'realisticno_{name}').BIOME


def items(b):
    out = []
    for L in b['layers']:
        out.append(dict(L, key=L['id'], group='layers'))
    for L in b['interior']:
        out.append(dict(L, key=L['id'], group='interior'))
    for name, m in b['materials'].items():
        out.append(dict(m, key=f'mat-{name}', id=name, group='materials', kind='tile',
                        prompt=m.get('full_prompt') or tile_prompt(m['prompt']), strength=m.get('strength', 0.86)))
    for p in b['props']:
        out.append(dict(p, key=f"prop-{p['id']}", group='props', kind=p.get('kind', 'prop'),
                        prompt=p.get('full_prompt') or prop_prompt(p['what']), strength=p.get('strength', 0.78)))
    if b.get('ground'):
        from realisticno_ground import ground_items
        out += ground_items(b['ground'])
    for it in out:
        k = it['kind']
        it.setdefault('size', SKY if k == 'sky' else LAYER if k in ('far', 'mid', 'near') else
                      TILE if k == 'tile' else (1024, 1024))
        it['wrap'] = 'x' if k in ('sky', 'far', 'mid', 'near', 'gtop') else 'xy' if k == 'tile' else None
        it.setdefault('v', 1)
    return out


def pick_keys(all_items, arg):
    if not arg:
        return all_items
    want = set(arg.split(','))
    return [i for i in all_items if i['key'] in want or i['group'] in want]


def draft_path(bname, key):
    return os.path.join(ART, bname, 'draft', f'{key}.png')


def cmd_drafts(bname, keys=None):
    b = biome(bname)
    os.makedirs(os.path.join(ART, bname, 'draft'), exist_ok=True)
    for it in pick_keys(items(b), keys):
        im = it['draw']()
        if im.size != tuple(it['size']):
            raise SystemExit(f"{it['key']}: draft {im.size} != {it['size']}")
        im.save(draft_path(bname, it['key']))
        print('draft', it['key'], im.size)


def cmd_jobs(bname, keys=None, seeds='1,2', strength=None, steps=10):
    b = biome(bname)
    jobs = []
    for it in pick_keys(items(b), keys):
        for st in (str(strength).split(',') if strength else [it['strength']]):
            st = float(st)
            jobs.append({'name': f"{bname}_{it['key']}_v{it['v']}k{round(st * 100)}",
                         'draft': os.path.relpath(draft_path(bname, it['key']), ROOT).replace('\\', '/'),
                         'prompt': it['prompt'], 'w': it['size'][0], 'h': it['size'][1],
                         'strength': st, 'steps': steps,
                         'seeds': [int(s) for s in str(it.get('seeds', seeds)).split(',')], 'wrap': it['wrap']})
    path = os.path.join(ART, bname, 'jobs.json')
    json.dump(jobs, open(path, 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    prompts = {j['name']: j['prompt'] for j in jobs}
    pp = os.path.join(ART, bname, 'prompts.json')
    old = json.load(open(pp, encoding='utf-8')) if os.path.exists(pp) else {}
    old.update(prompts)
    json.dump(old, open(pp, 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    print(path, len(jobs), 'jobs')


PHOTO = ('Ultra-realistic location photograph: true-to-life light and shadow, natural muted colours, real stone, '
         'wood, earth and foliage textures, fine photographic detail.')


def cmd_refine(bname, keys=None, strength='0.6'):
    """Second img2img pass: the chosen first-pass output (with its picks fixes) is the draft, so the composition
    stays and the remaining painted look goes. Writes <key>-r.png drafts and jobs named <biome>_<key>_v9k<strength>."""
    b = biome(bname)
    jobs = []
    for it in pick_keys(items(b), keys):
        if it['group'] not in ('layers', 'interior'):
            continue
        raw = chosen_raw(bname, it['key'])
        if not raw:
            continue
        im = raw_fixes(bname, it['key'], Image.open(raw).convert('RGB'))
        if im.size != tuple(it['size']):
            im = im.resize(tuple(it['size']), Image.LANCZOS)
        dp = draft_path(bname, it['key'] + '-r')
        im.save(dp)
        for st in str(strength).split(','):
            st = float(st)
            jobs.append({'name': f"{bname}_{it['key']}_v9k{round(st * 100)}",
                         'draft': os.path.relpath(dp, ROOT).replace(chr(92), '/'),
                         'prompt': f"{PHOTO} {it['prompt']}", 'w': it['size'][0], 'h': it['size'][1],
                         'strength': st, 'steps': 10, 'seeds': [1], 'wrap': it['wrap']})
    path = os.path.join(ART, bname, 'jobs_refine.json')
    json.dump(jobs, open(path, 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    print(path, len(jobs), 'jobs')
    return jobs


def raws(bname, key):
    fs = glob.glob(os.path.join(RAW, f'{bname}_{key}_v*_s*.png'))
    return sorted(fs, key=os.path.getmtime)


def chosen_raw(bname, key):
    """picks.json: {key: "raw.png"} or {key: {"raw": "raw.png", "erase": [[x0,y0,x1,y1]], "clone": [[x0,y0,x1,y1,dx]]}}
    (boxes as fractions of the raw image). erase paints magenta over a stray object standing in the empty
    part; clone covers a box with the pixels dx (fraction of the width) to its side."""
    pp = os.path.join(ART, bname, 'picks.json')
    picks = json.load(open(pp, encoding='utf-8')) if os.path.exists(pp) else {}
    if key in picks:
        p = picks[key]
        return os.path.join(RAW, p if isinstance(p, str) else p['raw'])
    fs = raws(bname, key)
    return fs[-1] if fs else None


def raw_fixes(bname, key, im):
    pp = os.path.join(ART, bname, 'picks.json')
    p = (json.load(open(pp, encoding='utf-8')) if os.path.exists(pp) else {}).get(key)
    if not isinstance(p, dict):
        return im
    w, h = im.size
    im = im.copy()
    d = ImageDraw.Draw(im)
    for x0, y0, x1, y1 in p.get('erase', []):
        d.rectangle([x0 * w, y0 * h, x1 * w, y1 * h], fill=(255, 0, 255))
    if p.get('crop_top'):      # a thin band of sky the model put above a ground strip: cut it, stretch back
        im = im.crop((0, round(h * p['crop_top']), w, h)).resize((w, h), Image.LANCZOS)
        d = ImageDraw.Draw(im)
    if p.get('desat_red'):     # red highlights that read as lava: pull red down towards the other channels
        a = np.asarray(im, np.float32)
        ex = np.clip(a[..., 0] - np.maximum(a[..., 1], a[..., 2]) - 12, 0, None) * p['desat_red']
        a[..., 0] -= ex
        im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
        d = ImageDraw.Draw(im)
    for x0, y0, x1, y1, dx in p.get('clone', []):
        box = tuple(round(v) for v in ((x0 + dx) * w, y0 * h, (x1 + dx) * w, y1 * h))
        im.paste(im.crop(box), (round(x0 * w), round(y0 * h)))
    return im


def checker(size, a=(70, 70, 70), b=(110, 110, 110), s=24):
    im = Image.new('RGB', size, a)
    d = ImageDraw.Draw(im)
    for y in range(0, size[1], s):
        for x in range(0, size[0], s):
            if (x // s + y // s) % 2:
                d.rectangle([x, y, x + s - 1, y + s - 1], fill=b)
    return im


def over(rgba, bg):
    base = bg.convert('RGBA').resize(rgba.size)
    base.alpha_composite(rgba.convert('RGBA'))
    return base.convert('RGB')


def grade(im, sat=0.9):
    """A tenth less saturation: the model's colours are a little too rich for a photograph."""
    from PIL import ImageEnhance
    if im.mode == 'RGBA':
        a = im.getchannel('A')
        im = ImageEnhance.Color(im.convert('RGB')).enhance(sat).convert('RGBA')
        im.putalpha(a)
        return im
    return ImageEnhance.Color(im).enhance(sat)


def process(bname, it, raw):
    out = _process(bname, it, raw)
    if it['kind'] in ('sky', 'far', 'mid', 'near') and '_v9k' in os.path.basename(raw):
        out = grade(out)
    return out


def _process(bname, it, raw):
    """Raw generator output -> final image (PIL) for an item."""
    im = Image.open(raw).convert('RGB')
    if raw == chosen_raw(bname, it['key']):
        im = raw_fixes(bname, it['key'], im)
    k = it['kind']
    if k == 'sky':
        return resize_wrap(im, FINAL_SKY)
    if k in ('far', 'mid', 'near'):
        refined = '_v9k' in os.path.basename(raw)
        d = Image.open(draft_path(bname, it['key'] + ('-r' if refined else '')))
        return resize_wrap(key_layer(im, d, band=it.get('band', 56)), FINAL_LAYER)
    if k == 'tile':
        return resize_wrap_xy(im, FINAL_TILE)
    if k == 'gtop':
        return resize_wrap(im, (1024, 256))
    if k == 'replace':     # same pixel size as the old prop, so it drops in for it
        d = Image.open(draft_path(bname, it['key']))
        return key_layer(im, d, band=it.get('band', 24), wrap_x=False).resize((it['w'], it['h']), Image.LANCZOS)
    # prop: magenta key guided by the draft, refined by BiRefNet where the key is unsure
    d = Image.open(draft_path(bname, it['key']))
    keyed = key_layer(im, d, band=it.get('band', 70), wrap_x=False)
    a = np.asarray(keyed, np.float32)[..., 3] / 255
    if it.get('birefnet', True):
        m = np.asarray(birefnet_alpha(im), np.float32) / 255
        unsure = (a > 0.05) & (a < 0.95)
        a = np.where(unsure, np.minimum(a + 0.3, m * 0.5 + a * 0.5), a)
    arr = np.asarray(keyed).copy()
    arr[..., 3] = np.clip(a * 255, 0, 255).astype(np.uint8)
    keyed = Image.fromarray(arr, 'RGBA')
    bbox = keyed.getchannel('A').point(lambda v: 255 if v > 24 else 0).getbbox()
    keyed = keyed.crop(bbox)
    tw, th = it['w'] * 2, it['h'] * 2
    s = min(tw / keyed.width, th / keyed.height)
    return keyed.resize((max(1, round(keyed.width * s)), max(1, round(keyed.height * s))), Image.LANCZOS)


def cmd_review(bname, keys=None):
    b = biome(bname)
    out = os.path.join(ART, bname, 'review')
    os.makedirs(out, exist_ok=True)
    for it in pick_keys(items(b), keys):
        fs = raws(bname, it['key'])
        if not fs:
            continue
        fs = fs[-4:]
        k = it['kind']
        rows = []
        for f in fs:
            fin = process(bname, it, f)
            if k in ('sky', 'far', 'mid', 'near', 'gtop'):
                W = 1400
                raw = Image.open(f).convert('RGB')
                r1 = raw.resize((W, round(W * raw.height / raw.width)))
                r2 = over(fin, checker(fin.size)).resize((W, round(W * fin.height / fin.width))) if fin.mode == 'RGBA' \
                    else None
                st = seam_strip(fin, 300, bg=(70, 110, 70) if fin.mode == 'RGBA' else (255, 0, 255))
                st = st.resize((W // 2, round(W // 2 * st.height / st.width)))
                sc = seam_score(fin)
                lab = Image.new('RGB', (W, 26), (20, 20, 20))
                ImageDraw.Draw(lab).text((6, 6), f'{os.path.basename(f)}  seam {sc:.2f}  {fin.size}', fill=(255, 255, 0))
                parts = [lab, r1] + ([r2] if r2 else []) + [st]
                hh = sum(p.height for p in parts)
                row = Image.new('RGB', (W, hh), (20, 20, 20))
                y = 0
                for p in parts:
                    row.paste(p, (0, y)); y += p.height
                rows.append(row)
            else:
                S = 420
                raw = Image.open(f).convert('RGB')
                r1 = raw.resize((S, round(S * raw.height / raw.width)))
                if k == 'tile':
                    t = Image.new('RGB', (S, S))
                    small = fin.resize((S // 2, S // 2))
                    for i in range(2):
                        for j in range(2):
                            t.paste(small, (i * S // 2, j * S // 2))
                    r2 = t
                else:
                    r2 = over(fin, checker(fin.size, s=12))
                    r2.thumbnail((S, S))
                row = Image.new('RGB', (2 * S + 10, max(r1.height, r2.height) + 26), (20, 20, 20))
                ImageDraw.Draw(row).text((6, 6), f'{os.path.basename(f)} {fin.size}', fill=(255, 255, 0))
                row.paste(r1, (0, 26)); row.paste(r2, (S + 10, 26))
                rows.append(row)
        W = max(r.width for r in rows)
        sheet = Image.new('RGB', (W, sum(r.height + 8 for r in rows)), (0, 0, 0))
        y = 0
        for r in rows:
            sheet.paste(r, (0, y)); y += r.height + 8
        p = os.path.join(out, f"{it['key']}.jpg")
        sheet.save(p, quality=86)
        print(p)


def cmd_finish(bname, keys=None):
    """keys: only redo these items and keep the rest of the biome's manifest entry as it is."""
    b = biome(bname)
    os.makedirs(os.path.join(DIST, bname), exist_ok=True)
    rel = lambda f: f'realisticno/{bname}/{f}'
    entry = {'layers': [], 'interior': {'layers': []}, 'materials': {}, 'props': []}
    report = []
    mp0 = os.path.join(DIST, 'manifest.json')
    old = (json.load(open(mp0, encoding='utf-8'))['biomes'].get(bname) if os.path.exists(mp0) else None) or {}
    want = set(keys.split(',')) if keys else None
    pp = os.path.join(ART, bname, 'picks.json')
    picks = json.load(open(pp, encoding='utf-8')) if os.path.exists(pp) else {}
    for it in items(b):
        if isinstance(picks.get(it['key']), dict) and picks[it['key']].get('skip'):
            report.append(f"SKIP {it['key']}: {picks[it['key']].get('why', '')}")
            continue
        if want is not None and it['key'] not in want and it['group'] not in want:
            fname = f"{it['id']}.webp" if it['kind'] == 'replace' else f"{it['key']}.webp"
            if it['group'] in ('layers', 'interior'):
                src = old.get('layers', []) if it['group'] == 'layers' else old.get('interior', {}).get('layers', [])
                hit = [L for L in src if L['id'] == it['id']]
                (entry['layers'] if it['group'] == 'layers' else entry['interior']['layers']).extend(hit)
            elif it['group'] == 'materials':
                if it['id'] in old.get('materials', {}):
                    entry['materials'][it['id']] = old['materials'][it['id']]
            else:
                entry['props'].extend(P for P in old.get('props', []) if P['id'] == it['id'])
            continue
        raw = chosen_raw(bname, it['key'])
        if not raw:
            report.append(f"MISSING {it['key']}")
            continue
        fin = process(bname, it, raw)
        fname = f"{it['id']}.webp" if it['kind'] == 'replace' else f"{it['key']}.webp"
        q, size = save_webp(fin, os.path.join(DIST, bname, fname), q0=90 if it['kind'] != 'prop' else 92)
        seam = seam_score(fin) if it['wrap'] else None
        seam_y = seam_score(fin, 'y') if it['wrap'] == 'xy' else None
        report.append(f"{it['key']:16s} {os.path.basename(raw):36s} {fin.size} q{q} {size // 1024} KB"
                      + (f' seam {seam:.2f}' if seam is not None else '') + (f'/{seam_y:.2f}' if seam_y else ''))
        if it['group'] in ('layers', 'interior'):
            L = {'id': it['id'], 'file': rel(fname), 'speed': SPEED[it['kind']], 'w': fin.width, 'h': fin.height}
            (entry['layers'] if it['group'] == 'layers' else entry['interior']['layers']).append(L)
        elif it['group'] == 'materials':
            entry['materials'][it['id']] = rel(fname)
        else:
            half = 1 if it['kind'] == 'replace' else 2
            P = {'id': it['id'], 'file': rel(fname), 'w': round(fin.width / half), 'h': round(fin.height / half),
                 'anchor': 'bottom', 'solid': bool(it['solid'])}
            if it.get('layer'):
                P['layer'] = it['layer']
            if it.get('replaces'):
                P['replaces'] = it['replaces']
            entry['props'].append(P)
    mp = os.path.join(DIST, 'manifest.json')
    man = json.load(open(mp, encoding='utf-8')) if os.path.exists(mp) else {'version': 1, 'biomes': {}}
    man['version'] = 1
    man['biomes'][bname] = entry
    if b.get('vista'):
        entry['vista'] = b['vista']
        entry['name'] = b['name']
        man['biomes'][bname] = entry
    from realisticno_svet import ORDER as SVET
    order = ORDER + [f'svet-{v}' for v in SVET] + ['svet-predmeti']
    man['biomes'] = {k: man['biomes'][k] for k in order if k in man['biomes']}
    man['note'] = ('Paths are relative to dist/assets/. Layers: w/h = image px, sky/back 1774x887 opaque, '
                   'far/mid/near 2172x724 RGBA, all tile horizontally with no seam (no crossfade needed), '
                   'bottom-anchored like dist/assets/world layers. interior.layers: same speeds, first is an '
                   'opaque back wall. Materials: 512x512, tile both ways. Props: w/h = draw size in world px '
                   '(the image is 2x that), anchor bottom-centre, solid = can be stood on / blocks.')
    json.dump(man, open(mp, 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    print('\n'.join(report))
    print(mp)


def compose(layers, cam, W=1280, H=720):
    """Stack the layers like stage3d.js: each scaled to the screen height (the sky also to the width),
    bottom-anchored, repeating horizontally, shifted by cam * speed."""
    out = Image.new('RGB', (W, H))
    for i, (im, speed) in enumerate(layers):
        k = max(H / im.height, W / im.width if i == 0 else 0)
        sw, sh = round(im.width * k), round(im.height * k)
        s = im.convert('RGBA').resize((sw, sh), Image.LANCZOS)
        x = -int(cam * speed) % sw
        for xx in range(x - sw, W, sw):
            out.paste(s, (xx, H - sh), s)
    return out


def cmd_preview(bname):
    """Whole scenes from the finished webp files (outdoor and interior), at three camera positions."""
    man = json.load(open(os.path.join(DIST, 'manifest.json'), encoding='utf-8'))['biomes'][bname]
    rows = []
    for group in (man['layers'], man['interior']['layers']):
        L = [(Image.open(os.path.join(ROOT, 'dist', 'assets', l['file'])), l['speed']) for l in group]
        rows.append([compose(L, cam) for cam in (0, 1500, 3700)])
    sheet = Image.new('RGB', (3 * 640 + 8, 2 * 360 + 4))
    for j, row in enumerate(rows):
        for i, im in enumerate(row):
            sheet.paste(im.resize((640, 360), Image.LANCZOS), (i * 644, j * 364))
    p = os.path.join(ART, bname, 'review', 'scene.jpg')
    os.makedirs(os.path.dirname(p), exist_ok=True)
    sheet.save(p, quality=88)
    rows[0][1].save(os.path.join(ART, bname, f'scena-{bname}.jpg'), quality=88)
    rows[1][1].save(os.path.join(ART, bname, f'scena-{bname}-unutra.jpg'), quality=88)
    print(p)


if __name__ == '__main__':
    a = sys.argv[1:]
    opts = {}
    while '--seeds' in a or '--strength' in a:
        for o in ('--seeds', '--strength'):
            if o in a:
                i = a.index(o); opts[o[2:]] = a[i + 1]; del a[i:i + 2]
    cmd, bname, keys = a[0], a[1], (a[2] if len(a) > 2 else None)
    if cmd == 'drafts':
        cmd_drafts(bname, keys)
    elif cmd == 'jobs':
        cmd_jobs(bname, keys, seeds=opts.get('seeds', '1,2'), strength=opts.get('strength'))
    elif cmd == 'review':
        cmd_review(bname, keys)
    elif cmd == 'finish':
        cmd_finish(bname, keys)
    elif cmd == 'refine':
        cmd_refine(bname, keys, opts.get('strength', '0.6'))
    elif cmd == 'preview':
        cmd_preview(bname)
