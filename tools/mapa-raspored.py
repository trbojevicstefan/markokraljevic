"""The layout of the journey map: rivers, coast, lakes, mountains and the places of the songs, from real coordinates.
python tools/mapa-raspored.py -> art/world-pack-03/uzori-d49/mapa-raspored.png (the guide Codex paints over) and
dist/assets/world/mapa-mesta.json (where each place lands on the map, in % of its width and height, for game.js).
The map is a painter's map: longitude is stretched to a 16:10 sheet, as old maps were drawn to fit their parchment."""
import json, os
from PIL import Image, ImageDraw, ImageFont
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W, H = 2048, 1280
LON0, LON1, LAT0, LAT1 = 17.6, 25.0, 40.35, 45.0
def xy(lat, lon):
    return ((lon - LON0) / (LON1 - LON0) * W, (LAT1 - lat) / (LAT1 - LAT0) * H)
def pct(lat, lon):
    x, y = xy(lat, lon)
    return [round(x / W * 100, 1), round(y / H * 100, 1)]

COAST_ADRIATIC = [(45.0, 17.6), (44.2, 17.6), (43.6, 17.6), (43.0, 17.6), (42.65, 18.09), (42.42, 18.55), (42.28, 18.85), (42.09, 19.1), (41.93, 19.2), (41.75, 19.6), (41.32, 19.45), (40.95, 19.45), (40.47, 19.49), (40.35, 19.45)]
AEGEAN = [(40.35, 22.5), (40.55, 22.6), (40.64, 22.94), (40.5, 23.15), (40.35, 23.3), (40.2, 23.6), (40.35, 23.75), (40.6, 23.9), (40.8, 24.4), (40.9, 25.0)]
RIVERS = {
    'Dunav': [(45.3, 17.6), (45.2, 18.9), (45.25, 19.85), (44.82, 20.46), (44.66, 20.93), (44.66, 21.63), (44.67, 22.2), (44.67, 22.53), (44.61, 22.61), (44.25, 22.68), (43.99, 22.88), (43.85, 23.4), (43.7, 24.0), (43.65, 24.6), (43.68, 25.0)],
    'Sava': [(45.1, 17.6), (44.95, 18.6), (44.82, 20.46)],
    'Velika Morava': [(44.66, 20.93), (44.3, 21.1), (43.93, 21.37), (43.67, 21.42)],
    'Južna Morava': [(43.67, 21.42), (43.45, 21.7), (43.32, 21.9), (43.0, 21.95), (42.55, 21.9), (42.3, 21.75)],
    'Zapadna Morava': [(43.67, 21.42), (43.72, 20.69), (43.89, 20.35), (43.86, 19.9)],
    'Ibar': [(43.72, 20.69), (43.5, 20.62), (43.29, 20.62), (42.89, 20.87), (42.8, 20.55), (42.85, 20.2)],
    'Timok': [(43.6, 22.3), (43.9, 22.28), (44.15, 22.65)],
    'Vardar': [(41.8, 20.9), (42.0, 21.43), (41.72, 21.78), (41.45, 22.1), (41.14, 22.5), (40.85, 22.65), (40.64, 22.85)],
    'Crna reka': [(41.05, 21.2), (41.3, 21.45), (41.55, 21.9), (41.62, 21.98)],
    'Drim': [(41.15, 20.65), (41.52, 20.52), (42.08, 20.42), (42.0, 20.0), (41.85, 19.6)],
    'Beli Drim': [(42.66, 20.29), (42.4, 20.5), (42.21, 20.6), (42.08, 20.42)],
    'Struma': [(42.5, 23.1), (42.2, 23.05), (41.6, 23.3), (41.2, 23.5), (40.8, 23.85)],
    'Marica': [(42.3, 23.9), (42.15, 24.75), (42.1, 25.0)]}
LAKES = {'Ohridsko jezero': (41.03, 20.75, .14, .1), 'Prespansko jezero': (40.9, 21.05, .1, .08), 'Skadarsko jezero': (42.17, 19.33, .18, .08)}
MOUNTAINS = {'Šar-planina': (42.1, 20.85, .35, .12), 'Kopaonik': (43.28, 20.8, .2, .12), 'Prokletije': (42.55, 19.9, .3, .12), 'Stara planina': (43.4, 22.7, .5, .15),
             'Rila': (42.13, 23.5, .3, .15), 'Pirin': (41.7, 23.5, .2, .15), 'Miroč': (44.5, 22.3, .2, .08), 'Babuna': (41.55, 21.45, .2, .1), 'Pelister': (41.0, 21.2, .15, .1), 'Rudnik': (44.13, 20.5, .1, .06)}
# the places of the songs (and the main towns, to read the map by)
MESTA = {
    'Prilep': (41.35, 21.55), 'Skoplje': (42.0, 21.43), 'Kačanik': (42.23, 21.26), 'Prizren': (42.21, 20.74), 'Peć': (42.66, 20.29), 'Kosovo polje': (42.66, 21.08),
    'Samodreža': (42.82, 20.97), 'Zvečan': (42.91, 20.84), 'Novo Brdo': (42.61, 21.42), 'Kruševac': (43.58, 21.33), 'Niš': (43.32, 21.9), 'Smederevo': (44.66, 20.93),
    'Beograd': (44.82, 20.46), 'Ohrid': (41.12, 20.8), 'Kostur': (40.52, 21.27), 'Solun': (40.64, 22.94), 'Miroč': (44.5, 22.3), 'Bregovo': (44.15, 22.65),
    'Vidin': (43.99, 22.88), 'Markov manastir': (41.95, 21.4), 'Treskavac': (41.4, 21.58), 'Sofija': (42.7, 23.32), 'Dubrovnik': (42.65, 18.09), 'Bar': (42.09, 19.1),
    'Studenica': (43.49, 20.53), 'Dečani': (42.55, 20.27), 'Plovdiv': (42.15, 24.75), 'Kotor': (42.42, 18.77)}

img = Image.new('RGB', (W, H), (232, 216, 178))
d = ImageDraw.Draw(img)
sea = [xy(*p) for p in COAST_ADRIATIC] + [xy(40.35, 17.6)]
d.polygon(sea, fill=(120, 160, 175))
aeg = [xy(*p) for p in AEGEAN] + [xy(40.35, 25.0)]
d.polygon(aeg, fill=(120, 160, 175))
for name, (la, lo, rx, ry) in MOUNTAINS.items():
    x, y = xy(la, lo); x1, y1 = xy(la - ry, lo + rx)
    d.ellipse([x - (x1 - x), y - (y1 - y), x1, y1], fill=(170, 150, 112))
    for k in range(5):
        cx = x - (x1 - x) * .7 + k * (x1 - x) * .35
        d.polygon([(cx - 22, y + 14), (cx, y - 26), (cx + 22, y + 14)], outline=(110, 90, 60), width=3)
for name, pts in RIVERS.items():
    d.line([xy(*p) for p in pts], fill=(70, 120, 150), width=9 if name == 'Dunav' else 5, joint='curve')
for name, (la, lo, rx, ry) in LAKES.items():
    x, y = xy(la, lo); x1, y1 = xy(la - ry, lo + rx)
    d.ellipse([x - (x1 - x), y - (y1 - y), x1, y1], fill=(110, 155, 172))
try:
    font = ImageFont.truetype('arial.ttf', 22)
except Exception:
    font = ImageFont.load_default()
for name, (la, lo) in MESTA.items():
    x, y = xy(la, lo)
    d.ellipse([x - 9, y - 9, x + 9, y + 9], fill=(150, 40, 40))
img.save(os.path.join(ROOT, 'art', 'world-pack-03', 'uzori-d49', 'mapa-raspored.png'))
lab = img.copy(); dl = ImageDraw.Draw(lab)
for name, (la, lo) in MESTA.items():
    x, y = xy(la, lo); dl.text((x + 12, y - 12), name, fill=(40, 20, 10), font=font)
lab.save(os.path.join(ROOT, 'art', 'world-pack-03', 'uzori-d49', 'mapa-raspored-imena.png'))
out = {'size': [W, H], 'bounds': {'lon': [LON0, LON1], 'lat': [LAT0, LAT1]}, 'mesta': {k: pct(*v) for k, v in MESTA.items()},
       'planine': {k: pct(v[0], v[1]) for k, v in MOUNTAINS.items()}, 'reke': {k: pct(*v[len(v) // 2]) for k, v in RIVERS.items()},
       'jezera': {k: pct(v[0], v[1]) for k, v in LAKES.items()}}
json.dump(out, open(os.path.join(ROOT, 'dist', 'assets', 'world', 'mapa-mesta.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('ok', len(MESTA), 'places')
