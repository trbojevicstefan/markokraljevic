"""Izdvajanje D60 medaljona i provera izvoza (Pillow + NumPy)."""
from pathlib import Path
import json
import sys

import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent
PROJECT = ROOT.parents[2]
NAMES = ['niz', 'zid', 'kontra', 'zamah', 'uzlet', 'tresak']
REFS = ['bacanje', 'juris', 'nadole', 'vihor', 'junacki', 'uvis']


def main():
    source = Image.open(sys.argv[1]).convert('RGB')
    source.save(ROOT / 'mreza-d60.png')
    ref = Image.open(ROOT / 'ikona-bacanje.png').convert('RGBA')
    ref_alpha = ref.getchannel('A')
    bounds = ref.getbbox()
    reports = []
    overlays = []
    for index, name in enumerate(NAMES):
        col, row = index % 3, index // 3
        cell = source.crop((round(col * source.width / 3),
                            round(row * source.height / 2),
                            round((col + 1) * source.width / 3),
                            round((row + 1) * source.height / 2)))
        pixels = np.array(cell).astype(float)
        r, g, b = pixels[:, :, 0], pixels[:, :, 1], pixels[:, :, 2]
        green = (g > 100) & (g > r * 1.35) & (g > b * 1.35)
        bbox = Image.fromarray((~green).astype('uint8') * 255).getbbox()
        if bbox is None:
            raise ValueError(f'Prazno polje: {name}')
        # All six are fitted to the reference's exact position and diameter.
        cut = cell.crop(bbox).resize((bounds[2] - bounds[0], bounds[3] - bounds[1]), Image.Resampling.LANCZOS)
        icon = Image.new('RGBA', (256, 256))
        icon.paste(cut, bounds[:2])
        icon.putalpha(ref_alpha)
        # Remove any green chroma contamination at the antialiased silhouette.
        arr = np.array(icon)
        spill = np.maximum(0, arr[:, :, 1].astype(float) - np.maximum(arr[:, :, 0], arr[:, :, 2]).astype(float))
        arr[:, :, 1] = np.clip(arr[:, :, 1].astype(float) - spill, 0, 255).astype('uint8')
        icon = Image.fromarray(arr)
        icon.save(ROOT / f'ikona-{name}.png')
        target = PROJECT / 'dist' / 'assets' / 'world' / f'ikona-{name}.webp'
        icon.save(target, 'WEBP', lossless=True, exact=True, method=6)
        check = Image.open(target).convert('RGBA')
        assert check.size == (256, 256)
        assert np.array_equal(np.array(check), np.array(icon)), 'WebP nije bez gubitaka'
        assert np.array_equal(np.array(check.getchannel('A')), np.array(ref_alpha))
        assert check.getbbox() == bounds
        raw = target.read_bytes()
        assert b'VP8L' in raw and b'VP8 ' not in raw
        reports.append(dict(name=name, source_cell_bbox=bbox, size=check.size,
                            mode=check.mode, bbox=check.getbbox(),
                            alpha_identical_to_reference=True, lossless_roundtrip=True))
        overlay = Image.blend(ref, icon, 0.5)
        overlays.append(overlay)

    # A single row shows all six references followed by all six new icons.
    preview = Image.new('RGB', (12 * 276, 300), '#302923')
    draw = ImageDraw.Draw(preview)
    for index, name in enumerate(REFS + NAMES):
        icon = Image.open(ROOT / f'ikona-{name}.png').convert('RGBA')
        preview.paste(icon, (index * 276 + 10, 10), icon)
        draw.text((index * 276 + 16, 274), f'ikona-{name}', fill='#e8cc9c')
    preview.save(ROOT / 'pregled.png')
    overlay_sheet = Image.new('RGBA', (6 * 256, 256))
    for index, overlay in enumerate(overlays):
        overlay_sheet.paste(overlay, (index * 256, 0))
    overlay_sheet.save(ROOT / 'preklapanje-bacanje.png')
    (ROOT / 'provera-d60.json').write_text(json.dumps(reports, indent=2), encoding='utf-8')
    print(json.dumps(reports, indent=2))


if __name__ == '__main__':
    main()
