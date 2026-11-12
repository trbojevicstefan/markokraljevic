"""Realistic replacements for the painted props in dist/assets/world/ (same pixel size, same bottom anchor).

Each old prop is its own draft: put on magenta, scaled so its longer side is ~1024 px (2048 for the layer-sized
ones), img2img at a moderate strength, keyed back to alpha and resized to exactly the old size. The manifest
biome 'svet-predmeti' lists them with "replaces": "world/<old file>".
"""
import glob, os, re

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WORLD = os.path.join(ROOT, 'dist', 'assets', 'world')

PATTERNS = ['prop-*.webp', 'prepreka-*.webp', 'bacva-*.webp', 'barjak-*.webp', 'kolje.webp', 'kolac-*.webp',
            'kolci-*.webp', 'kula-strazara.webp', 'lestve*.webp', 'most-*.webp', 'kavez-*.webp', 'plug-slomljen.webp',
            'orlovo-gnezdo.webp', 'kotur.webp', 'djule.webp']

WORDS = {
    'ambar': 'a wooden granary on stilts', 'baklja': 'torch', 'drzac': 'iron wall holder', 'balkon': 'wooden balcony',
    'balvan': 'log', 'balvani': 'logs', 'barjak': 'banner on a pole', 'manastir': 'monastery', 'srpski': 'Serbian',
    'turski': 'Ottoman', 'vijori': 'waving', 'bunar': 'stone well', 'bure': 'barrel', 'bacva': 'barrel',
    'puna': 'full', 'prolivena': 'tipped over and spilling', 'cvece': 'wild flowers', 'dok': 'wooden jetty',
    'drvo': 'tree', 'bukva': 'beech', 'hrast': 'oak', 'jela': 'fir', 'sneg': 'snow', 'dzakovi': 'grain sacks',
    'kamen': 'stone', 'izlaz': 'exit', 'putokaz': 'stone waymark', 'kapija': 'gate', 'tvrdjava': 'fortress',
    'katapult': 'wooden catapult', 'klupa': 'wooden bench', 'kola': 'wooden cart', 'seno': 'hay', 'kolac': 'stake',
    'kolci': 'stakes', 'glave': 'with skulls', 'red': 'in a row', 'korenje': 'tree roots', 'kovceg': 'wooden chest',
    'otvoren': 'open', 'krcag': 'clay jug', 'kristal': 'crystal', 'krov': 'roof', 'crijep': 'clay tiles',
    'slama': 'straw thatch', 'krst': 'stone cross', 'raskrsce': 'at a crossroads', 'kruska': 'pear tree',
    'kuca': 'village house', 'lanac': 'iron chain', 'led': 'ice', 'loza': 'grape vine', 'luk': 'arch',
    'kameni': 'stone', 'medjas': 'boundary stone', 'merdevine': 'wooden ladder', 'mlin': 'mill', 'most': 'bridge',
    'drveni': 'wooden', 'mali': 'small', 'segment': 'section', 'slomljen': 'broken', 'uzad': 'rope',
    'nagib': 'slope', 'trava': 'grass', 'desno': '', 'levo': '', 'nakovanj': 'anvil', 'ognjiste': 'fire pit',
    'ograda': 'fence', 'rusevina': 'ruined', 'pleter': 'woven wattle', 'palisada': 'wooden palisade',
    'panj': 'tree stump', 'paprat': 'fern', 'paukova': 'spider', 'mreza': 'web', 'pecurke': 'mushrooms',
    'plast': 'haystack', 'sena': '', 'platforma': 'platform', 'viseca': 'hanging', 'potpora': 'timber prop',
    'rudnik': 'mine', 'prozor': 'window', 'run': 'rubble', 'sanduci': 'wooden crates', 'sator': 'tent',
    'sine': 'mine rails', 'slomljene': 'broken', 'snopovi': 'wheat sheaves', 'stena': 'rock', 'mala': 'small',
    'visoka': 'tall', 'stepenice': 'stone stairs', 'stol': 'wooden table', 'strassarnica': 'watch house',
    'stub': 'pillar', 'tlo': 'ground', 'susara': 'drying rack', 'svetiliste': 'roadside shrine',
    'svetiljka': 'lantern', 'taraba': 'plank fence', 'ravna': 'straight', 'slomljena': 'broken', 'cigla': 'brick',
    'daske': 'planks', 'mahovina': 'moss', 'suvo': 'dry', 'tocak': 'wheel', 'vodeni': 'water', 'trska': 'reeds',
    'uze': 'rope', 'vagon': 'mine cart', 'voda': 'water', 'traka': 'strip', 'vodopad': 'waterfall',
    'vrata': 'door', 'drvena': 'wooden', 'zbun': 'bush', 'zid': 'wall', 'penjanje': 'for climbing',
    'prepreka': 'obstacle', 'kamenje': 'rocks', 'kolje': 'sharpened stakes', 'vitez': 'knight', 'vitezovi': 'knights',
    'kula': 'tower', 'strazara': 'watch', 'lestve': 'wooden ladder', 'vrh': 'top', 'vila': 'fairy', 'kraj': 'end',
    'kavez': 'wooden cage', 'razbijen': 'broken', 'svatovi': 'empty', 'plug': 'wooden plough', 'orlovo': 'eagle',
    'gnezdo': 'nest', 'kotur': 'wooden pulley', 'djule': 'iron cannonball', 'variant': '',
}


def describe(stem):
    parts = [p for p in re.split(r'[-_]', stem) if p and p != 'prop']
    words = [WORDS.get(p, p) for p in parts]
    return ' '.join(w for w in words if w).strip()


def prompt(stem):
    return (f'A realistic photographic game prop: {describe(stem)}, exactly the same shape, pose and outline as the '
            f'picture, seen from the side, medieval Balkan, real weathered materials, soft natural light. '
            f'Photorealistic, ultra detailed. Isolated on a flat, solid, pure magenta (#FF00FF) background.')


def gen_size(w, h):
    big = 2048 if max(w, h) >= 1600 else 1024
    s = big / max(w, h)
    return max(256, round(w * s / 16) * 16), max(256, round(h * s / 16) * 16)


def make_draft(path, size):
    im = Image.open(path).convert('RGBA')
    bg = Image.new('RGBA', im.size, (255, 0, 255, 255))
    bg.alpha_composite(im)
    return bg.convert('RGB').resize(size, Image.LANCZOS)


def files():
    out = []
    for p in PATTERNS:
        out += glob.glob(os.path.join(WORLD, p))
    return sorted(set(out))


def make_biome():
    props = []
    for f in files():
        stem = os.path.basename(f)[:-5]
        w, h = Image.open(f).size
        size = gen_size(w, h)
        props.append({'id': stem, 'kind': 'replace', 'draw': (lambda f=f, s=size: make_draft(f, s)), 'size': size,
                      'what': describe(stem), 'full_prompt': prompt(stem), 'strength': 0.6, 'w': w, 'h': h,
                      'solid': False, 'replaces': f'world/{os.path.basename(f)}'})
    return {'id': 'svet-predmeti', 'layers': [], 'interior': [], 'materials': {}, 'props': props}
