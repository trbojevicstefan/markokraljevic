from pathlib import Path
import json, shutil, sys
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSET = ROOT / 'animation-pack-04' / 'assets' / 'marko-dize-ralo'
RAW = Path(sys.argv[1]) if len(sys.argv) > 1 else None
if RAW is None:
    raise SystemExit('usage: export-dopuna45-marko-dize-ralo.py RAW_SHEET')

if ASSET.exists():
    archive = ROOT / 'animation-pack-04' / 'sources' / 'dopuna45-marko-dize-ralo' / 'previous'
    archive.mkdir(parents=True, exist_ok=True)
    shutil.copytree(ASSET, archive / 'marko-dize-ralo', dirs_exist_ok=True)
ASSET.mkdir(parents=True, exist_ok=True)
(ASSET / 'frames' / 'motion').mkdir(parents=True, exist_ok=True)

src = Image.open(RAW).convert('RGBA')
w, h = src.size
cols, rows = 4, 2
cw, ch = w // cols, h // rows
frames = []
for i in range(8):
    cell = src.crop(((i % cols) * cw, (i // cols) * ch, (i % cols + 1) * cw, (i // cols + 1) * ch))
    px = cell.load()
    for y in range(ch):
        for x in range(cw):
            r,g,b,a = px[x,y]
            if g > 150 and g > r * 1.28 and g > b * 1.18:
                px[x,y] = (r,g,b,0)
            elif g > 120 and g > r * 1.16 and g > b * 1.08:
                alpha = max(0, min(255, int((r + b) * 1.9)))
                px[x,y] = (r,g,b,alpha)
    bb = cell.getchannel('A').getbbox()
    if not bb:
        raise RuntimeError(f'empty frame {i}')
    crop = cell.crop(bb).resize((round((bb[2]-bb[0]) * 1.55), round((bb[3]-bb[1]) * 1.55)), Image.Resampling.LANCZOS)
    canvas = Image.new('RGBA', (1024,1024), (0,0,0,0))
    x = (1024 - crop.width) // 2
    y = max(0, 999 - crop.height)
    canvas.alpha_composite(crop, (x,y))
    frames.append(canvas)
    canvas.save(ASSET / 'frames' / 'motion' / f'frame-{i}.png')

atlas = Image.new('RGBA', (8192,1024), (0,0,0,0))
for i,im in enumerate(frames):
    atlas.alpha_composite(im, (i*1024,0))
atlas.save(ASSET / 'atlas.png')
frame_layout = {'motion': [{'x': i*1024, 'y': 0, 'w': 1024, 'h': 1024} for i in range(8)]}
(ASSET/'frames'/'frames-manifest.json').write_text(json.dumps({'frame_layout':{'rows':frame_layout}}, indent=2), encoding='utf-8')
manifest = {
  'characterId':'marko-dize-ralo','engine':'component-row','game_input':'atlas.png','degraded_static_fallback':False,'curation_applied':True,'frame_variant':'pixel','sprite_sheet_alpha':'atlas.png','base_image':'reference.png',
  'cell':{'shape':'square','width':1024,'height':1024,'safe_margin_x':48,'safe_margin_y':48,'size':1024,'safe_margin':48},
  'chroma_key':{'name':'transparent','hex':'#00000000','rgb':[0,0,0,0]},
  'animation':{'cellWidth':1024,'cellHeight':1024,'columns':8,'rows':{'motion':{'row':0,'frames':8,'fps':10,'durations_ms':[100]*8,'loop':False,'holdLastFrame':True,'frame_variant':'pixel'}}},
  'frame_layout':{'sheetWidth':8192,'sheetHeight':1024,'cellWidth':1024,'cellHeight':1024,'rows':frame_layout},
  'scaleReference':{'markoTargetHeightPx':300,'oxenYokeTargetHeightPx':240,'teamTargetWidthPx':610,'footY':999,'cell':'1024x1024'},
  'renderScale':1.0,'renderAnchor':{'x':512,'y':999},'worldBodyHeight':300,
  'identityReferences':['../volovi-ralo/frames/motion/frame-0.png','../marko-ore/frames/motion/frame-0.png'],
  'renderNote':'Frames 0-3 lift the ox team and plough overhead; frames 4-7 lower it forward.'
}
(ASSET/'manifest.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')
shutil.copy2(ASSET/'frames'/'motion'/'frame-0.png', ASSET/'reference.png')
print(ASSET)
