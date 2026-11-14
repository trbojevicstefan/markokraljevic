"""The panels in Serbian colours (Stefan, 14. 11.: „ova zelena boja mi se ne sviđa, previše je bez karaktera … mora da bude SRPSKO”):
python tools/boje-srpske.py [--proba]
Every dark teal of the panels (the map, the pause, the books, the HUD, the dialogue, the shop) becomes the deep red of the
Serbian icons and banners, with the same lightness and transparency, so the gold, the parchment and the text keep their
contrast. The title menu, which Stefan likes, keeps its own colours (rules under #menu and the manuscript style .ms-*).
--proba only counts what would change."""
import colorsys, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HUE = 352 / 360      # Serbian red: crimson leaning to wine
SKIP_SEL = re.compile(r'#menu\b|\.ms-|rukopis|\.title-|#intro|--verdigris')

def shift(r, g, b):
    h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
    if not (140 / 360 <= h <= 210 / 360) or l > .42 or s < .08:
        return None
    s2 = min(.62, s * 1.15 + .14)
    r2, g2, b2 = colorsys.hls_to_rgb(HUE, l * .96, s2)
    return round(r2 * 255), round(g2 * 255), round(b2 * 255)

def recolor_decls(text):
    n = 0
    def hexrep(m):
        nonlocal n
        h = m.group(1)
        if len(h) == 3:
            h = ''.join(c * 2 for c in h)
        t = shift(int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))
        if not t:
            return m.group(0)
        n += 1
        return '#%02x%02x%02x' % t + (m.group(2) or '')
    text = re.sub(r'#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})([0-9a-fA-F]{2})?(?![0-9a-fA-F])', hexrep, text)
    def rgbrep(m):
        nonlocal n
        t = shift(int(m.group(2)), int(m.group(3)), int(m.group(4)))
        if not t:
            return m.group(0)
        n += 1
        return f'{m.group(1)}({t[0]},{t[1]},{t[2]}'
    text = re.sub(r'(rgba?)\((\d+),\s*(\d+),\s*(\d+)', rgbrep, text)
    return text, n

total = 0
for rel in ('dist/ui.css', 'dist/style.css'):
    p = os.path.join(ROOT, rel)
    raw = open(p, encoding='utf-8', newline='').read()
    out, pos, changed = [], 0, 0
    # walk the rules: selector { declarations }, keeping @media and the like as they are
    for m in re.finditer(r'([^{}]+)\{([^{}]*)\}', raw):
        sel, decl = m.group(1), m.group(2)
        out.append(raw[pos:m.start()])
        if SKIP_SEL.search(sel) or sel.strip().startswith(':root') and '--verdigris' in decl:
            out.append(m.group(0))
        else:
            d2, n = recolor_decls(decl)
            changed += n
            out.append(sel + '{' + d2 + '}')
        pos = m.end()
    out.append(raw[pos:])
    total += changed
    print(rel, changed, 'colours')
    if '--proba' not in sys.argv:
        open(p, 'w', encoding='utf-8', newline='').write(''.join(out))
print('total', total)
