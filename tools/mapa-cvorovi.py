"""Where the pohodi stand on the journey map: python tools/mapa-cvorovi.py [--slika]
Each pohod belongs to the place of its song (a dot at the true spot); its round badge is pulled toward that dot and pushed
away from the other badges, so the crowded lands (Kosovo, the Kačanik gorge, Skoplje and Prilep) stay readable, and a thin
line ties each badge to its place. Writes dist/assets/world/mapa-cvorovi.json; --slika also draws a preview in the scratch dir."""
import json, math, os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W, H = 2048, 1280
LON0, LON1, LAT0, LAT1 = 17.6, 25.0, 40.35, 45.0
def pct(lat, lon):
    return ((lon - LON0) / (LON1 - LON0) * 100, (LAT1 - lat) / (LAT1 - LAT0) * 100)
# pohod -> (place of the song, lat, lon); the three parts of the duel at Kačanik along the gorge
CVOROVI = {
    'selo': ('Kosovo polje', 42.66, 21.08), 'suma': ('Miroč', 44.5, 22.3), 'manastir': ('Samodreža', 42.82, 20.97),
    'oranje': ('Babuna', 41.55, 21.52), 'tvrdjava': ('Skoplje', 42.0, 21.43), 'podrum': ('Prilep', 41.35, 21.55),
    'mocvara': ('Skadarsko blato', 42.17, 19.33), 'pecina': ('Ohrid', 41.12, 20.8), 'prevoj': ('Šar-planina', 42.1, 20.85),
    'kacanik-1': ('Kačanik', 42.14, 21.34), 'kacanik-2': ('Kačanik', 42.22, 21.27), 'kacanik-3': ('Kačanik', 42.3, 21.2),
    'klisura': ('Zvečan', 42.91, 20.84), 'rusevine': ('Drač', 41.32, 19.45), 'rudnik': ('Novo Brdo', 42.61, 21.42),
    'reka': ('Solunski zaliv', 40.55, 23.2), 'urvina': ('Urvina', 40.9, 24.4), 'san': ('Markov manastir', 41.95, 21.4),
    'azak': ('Azak', 44.7, 24.7)}
# the badge measures some 6 % of the map's width; at 820 px wide that is about 48 px
NODE = 7.4     # minimal distance between badge centres, in % of the width (the height is scaled to it)
ASPECT = H / W
pts = {k: list(pct(la, lo)) for k, (_, la, lo) in CVOROVI.items()}
pos = {k: [x, y] for k, (x, y) in pts.items()}
for it in range(9000):
    for a in pos:
        fx = (pts[a][0] - pos[a][0]) * .006; fy = (pts[a][1] - pos[a][1]) * .006
        for b in pos:
            if a == b:
                continue
            dx = pos[a][0] - pos[b][0]; dy = (pos[a][1] - pos[b][1]) * ASPECT
            d = math.hypot(dx, dy) or .01
            if d < NODE:
                push = (NODE - d) / d * .25
                fx += dx * push; fy += dy * push / ASPECT
        pos[a][0] = min(93, max(7, pos[a][0] + fx)); pos[a][1] = min(88, max(10, pos[a][1] + fy))
# laid by hand where the forces only packed them into a honeycomb: Kosovo fanned out, the three parts of the duel in a row
# over the gorge, the south (Skoplje, Prilep, Ohrid) and the far places on their own spots
RUCNO = {'klisura': (36, 35), 'manastir': (45, 31), 'selo': (38, 48), 'rudnik': (61, 44), 'kacanik-1': (44.5, 57), 'kacanik-2': (51.5, 56),
         'kacanik-3': (58.5, 57), 'tvrdjava': (59, 68), 'san': (46.5, 70), 'oranje': (60, 79), 'podrum': (52, 85), 'pecina': (40, 81),
         'prevoj': (36.5, 62), 'mocvara': (24, 55), 'rusevine': (29.5, 75), 'suma': (63, 16), 'reka': (75, 84), 'urvina': (88, 79), 'azak': (90, 14)}
for k, v in RUCNO.items():
    pos[k] = list(v)
out = {k: {'mesto': CVOROVI[k][0], 'tacka': [round(pts[k][0], 1), round(pts[k][1], 1)], 'cvor': [round(pos[k][0], 1), round(pos[k][1], 1)]} for k in CVOROVI}
json.dump(out, open(os.path.join(ROOT, 'dist', 'assets', 'world', 'mapa-cvorovi.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
pairs = sorted(((math.hypot(pos[a][0] - pos[b][0], (pos[a][1] - pos[b][1]) * ASPECT), a, b) for a in pos for b in pos if a < b))[:4]
print('closest', [(round(d, 1), a, b) for d, a, b in pairs])
worst = min(math.hypot(pos[a][0] - pos[b][0], (pos[a][1] - pos[b][1]) * ASPECT) for a in pos for b in pos if a < b)
print('closest badges', round(worst, 2), '% of width')
if '--slika' in sys.argv:
    from PIL import Image, ImageDraw
    im = Image.open(os.path.join(ROOT, 'dist', 'assets', 'world', 'mapa-putovanja.webp')).convert('RGB')
    d = ImageDraw.Draw(im); r = NODE / 2 * W / 100 * .9
    for k, v in out.items():
        tx, ty = v['tacka'][0] * W / 100, v['tacka'][1] * H / 100; cx, cy = v['cvor'][0] * W / 100, v['cvor'][1] * H / 100
        d.line([(tx, ty), (cx, cy)], fill=(120, 30, 30), width=3); d.ellipse([tx - 6, ty - 6, tx + 6, ty + 6], fill=(150, 30, 30))
        d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=(201, 162, 74), width=6, fill=(60, 40, 30)); d.text((cx - r + 6, cy - 8), k, fill=(255, 240, 200))
    im.resize((1024, 640)).save(sys.argv[-1] if sys.argv[-1].endswith('.jpg') else 'mapa-cvorovi.jpg', quality=85)
