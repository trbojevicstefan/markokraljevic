"""In-between frames for the sprite clips, computed locally (no drawing credits): python smooth-anims.py [clip ...]

For each pair of neighbouring frames of a clip the script measures how the picture moves (dense optical flow, OpenCV DIS),
warps both frames half way toward each other and blends them. The result is one extra frame between every two drawn ones.
A pair whose two warped halves disagree too much (a limb that crosses the body, a pose change the flow cannot follow)
gets no in-between: the game then simply holds the drawn frame, as before.

Output, read by the game if present:
  dist/assets/smooth/<clip>.webp  the in-betweens of the clip, in the same cells as the drawn sheet
  dist/assets/sprite-smooth.json  {clip: {image, loop, mids: [cell rect + sole | null]}}
It never touches sprite-rig.json or the drawn sheets.
"""
import json, os, sys
import numpy as np
import cv2

ROOT = os.path.dirname(os.path.abspath(__file__))
A = os.path.join(ROOT, 'dist', 'assets')
RIG = json.load(open(os.path.join(A, 'sprite-rig.json'), encoding='utf-8'))
OUT = os.path.join(A, 'smooth')
# clips that loop (the last frame flows into the first) and clips that play once
LOOPS = ['marko-run', 'marko-walk', 'sword-run', 'shield-run', 'archer-run', 'akindzija-run', 'palikuca-run', 'kopljanik-run', 'tufekdzija-run', 'pas-run', 'musa-run']
ONCE = []
MAX_ERR = float(os.environ.get("SMOOTH_MAX_ERR", "0.13"))   # mean disagreement (0..1) of the two warped halves, over the pixels either of them covers


def cell(img, f):
    x, y, w, h = f[:4]
    return img[y:y + h, x:x + w].astype(np.float32) / 255.0


def gray(c):
    # the figure over mid grey, so the outline against emptiness is a feature the flow can follow
    a = c[..., 3:4]
    g = cv2.cvtColor((c[..., :3] * a + 0.5 * (1 - a)).astype(np.float32), cv2.COLOR_BGR2GRAY)
    return (np.clip(g, 0, 1) * 255).astype(np.uint8)


def warp(c, flow, t):
    h, w = flow.shape[:2]
    gx, gy = np.meshgrid(np.arange(w, dtype=np.float32), np.arange(h, dtype=np.float32))
    pm = c.copy(); pm[..., :3] *= pm[..., 3:4]            # premultiplied, so empty pixels carry no colour
    return cv2.remap(pm, gx + flow[..., 0] * t, gy + flow[..., 1] * t, cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=0)


def between(a, b):
    dis = cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
    dis.setFinestScale(1)
    ga, gb = gray(a), gray(b)
    fab = dis.calc(ga, gb, None)   # where each pixel of a goes in b
    fba = dis.calc(gb, ga, None)
    # a pixel of the middle frame comes from a half a step back along b->a, and from b half a step back along a->b
    wa = warp(a, fba, 0.5)
    wb = warp(b, fab, 0.5)
    # where the two halves agree they are averaged; where they do not (a leg the flow lost) only the earlier frame's
    # half is kept, so the limb changes on the drawn frames and nothing is ever seen double
    d = cv2.GaussianBlur(np.abs(wa - wb).max(axis=2), (0, 0), 3)
    m = np.clip((d - 0.10) / 0.16, 0, 1)[..., None]
    mid = wa * m + (wa + wb) / 2 * (1 - m)
    cover = np.maximum(wa[..., 3], wb[..., 3]) > 0.05
    err = float(np.abs(wa - wb)[cover].mean()) if cover.any() else 0.0
    alpha = mid[..., 3:4]
    rgb = np.where(alpha > 1e-4, mid[..., :3] / np.maximum(alpha, 1e-4), 0)
    # the blend of two soft edges is softer than either: tighten the alpha a little so the outline stays an outline
    alpha = np.clip((alpha - 0.5) * 1.35 + 0.5, 0, 1)
    return np.dstack([rgb, alpha]), err


def run(names):
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(A, 'sprite-smooth.json')
    meta = json.load(open(path, encoding='utf-8')) if os.path.exists(path) else {}
    for name in names:
        r = RIG.get(name)
        if not r:
            print('skip (not in the rig):', name); continue
        img = cv2.imread(os.path.join(A, r['image']), cv2.IMREAD_UNCHANGED)
        if img is None or img.shape[2] != 4:
            print('skip (no alpha sheet):', name); continue
        F = r['frames']; n = len(F); loop = name in LOOPS
        pairs = [(i, (i + 1) % n) for i in range(n if loop else n - 1)]
        w, h = F[0][2], F[0][3]
        sheet = np.zeros((h, w * len(pairs), 4), np.float32)
        mids = []; errs = []
        for k, (i, j) in enumerate(pairs):
            if F[i][2:4] != F[j][2:4]:
                mids.append(None); errs.append(9); continue
            m, err = between(cell(img, F[i]), cell(img, F[j]))
            errs.append(err)
            if err > MAX_ERR:
                mids.append(None); continue
            sheet[:, k * w:(k + 1) * w] = m
            mids.append([k * w, 0, w, h, round((F[i][4] + F[j][4]) / 2, 1)])
        cv2.imwrite(os.path.join(OUT, name + '.webp'), (np.clip(sheet, 0, 1) * 255).astype(np.uint8), [cv2.IMWRITE_WEBP_QUALITY, 86])
        meta[name] = {'image': 'smooth/' + name + '.webp', 'loop': loop, 'mids': mids}
        print('%-22s %d/%d in-betweens  disagreement %s' % (name, sum(m is not None for m in mids), len(pairs), ' '.join('%.3f' % e for e in errs)))
    json.dump(meta, open(path, 'w', encoding='utf-8'), separators=(',', ':'))


def sheet(name, dst):
    """A contact sheet for the eye: drawn frames on top, each with its in-between to the right, on a checker ground."""
    r = RIG[name]; meta = json.load(open(os.path.join(A, 'sprite-smooth.json'), encoding='utf-8'))[name]
    img = cv2.imread(os.path.join(A, r['image']), cv2.IMREAD_UNCHANGED); sm = cv2.imread(os.path.join(A, meta['image']), cv2.IMREAD_UNCHANGED)
    F = r['frames']; w, h = F[0][2], F[0][3]; s = 200 / h; cw, ch = int(w * s), int(h * s)
    out = np.full((ch, cw * len(F) * 2, 3), 60, np.uint8)
    def put(c, col, tint):
        c = cv2.resize(c, (cw, ch), interpolation=cv2.INTER_AREA).astype(np.float32) / 255
        bg = np.full((ch, cw, 3), tint, np.float32) / 255
        out[:, col * cw:(col + 1) * cw] = ((c[..., :3] * c[..., 3:4] + bg * (1 - c[..., 3:4])) * 255).astype(np.uint8)
    for i, f in enumerate(F):
        put(img[f[1]:f[1] + f[3], f[0]:f[0] + f[2]], i * 2, (70, 70, 70))
        m = meta['mids'][i] if i < len(meta['mids']) else None
        if m:
            put(sm[m[1]:m[1] + m[3], m[0]:m[0] + m[2]], i * 2 + 1, (60, 80, 60))
    cv2.imwrite(dst, out, [cv2.IMWRITE_JPEG_QUALITY, 82])


if __name__ == '__main__':
    args = sys.argv[1:]
    if args and args[0] == '--sheet':
        sheet(args[1], args[2])
    else:
        run(args or LOOPS + ONCE)
