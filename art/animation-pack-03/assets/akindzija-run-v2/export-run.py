from pathlib import Path
from PIL import Image, ImageDraw
import numpy as np, json, subprocess
ROOT=Path(__file__).resolve().parent
GAME=ROOT.parents[3]
SG=GAME.parent/'tools/sprite-gen/.venv/Scripts/sprite-gen.exe'
heights=[358,354,358,362,358,354,358,362]
strip=Image.new('RGBA',(512*8,512),(0,255,0,255))
for i,h in enumerate(heights):
    source=ROOT/f'generated/pose-{i}-revision.png'
    if not source.exists():source=ROOT/f'generated/pose-{i}.png'
    im=Image.open(source).convert('RGBA');a=np.array(im)
    # Remove the generator's low-alpha backdrop haze before canonical extraction.
    a[:,:,3]=np.clip((a[:,:,3].astype(float)-220)*255/34,0,255).astype('uint8')
    im=Image.fromarray(a);box=im.getchannel('A').getbbox()
    if not box:raise ValueError(f'Empty pose {i}')
    im=im.crop(box);s=min(h/im.height,494/im.width)
    im=im.resize((round(im.width*s),round(im.height*s)),Image.Resampling.LANCZOS)
    strip.alpha_composite(im,(i*512+(512-im.width)//2,488-im.height))
(ROOT/'raw').mkdir(exist_ok=True);strip.convert('RGB').save(ROOT/'raw/motion.png')
if not (ROOT/'sprite-request.json').exists():
    subprocess.run([str(SG),'prepare','--out-dir',str(ROOT),'--force','--character-id','akindzija-run-v2','--base-image',str(GAME/'art/animation-pack-03/sources/akindzija-run/base-source.png'),'--style','hand painted cel shaded','--cell-size','512','--safe-margin','24','--chroma-key','#00ff00','--no-fit-pixel-unfake','--fit-align-x','bbox-center','--fit-align-y','bottom','--fit-ground-frames','--request-json',json.dumps({'states':{'motion':{'frames':8,'fps':12,'loop':True,'action':'alternating near and far leg contact down passing push-off'}}})],check=True,stdout=subprocess.DEVNULL)
reqpath=ROOT/'sprite-request.json';req=json.loads(reqpath.read_text())
req['cell']['safe_margin_x']=4;req['cell']['safe_margin_y']=24
reqpath.write_text(json.dumps(req,indent=2),encoding='utf8')
for action in ['extract','compose-atlas']:
    subprocess.run([str(SG),action,'--run-dir',str(ROOT)],check=True,stdout=subprocess.DEVNULL)
import shutil
shutil.copy2(ROOT/'sprite-sheet-alpha.png',ROOT/'atlas.png')
manifest=json.loads((ROOT/'manifest.json').read_text());manifest['game_input']='atlas.png';manifest['sprite_sheet_alpha']='atlas.png'
(ROOT/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf8')
subprocess.run([str(SG),'compose-gif',*[str(ROOT/f'frames/motion/frame-{i}.png') for i in range(8)],'--output',str(ROOT/'preview.gif'),'--delay-ticks','8','--loop-count','0'],check=True,stdout=subprocess.DEVNULL)
report=[];board=Image.new('RGBA',(512*4,540*2),(24,37,36,255));d=ImageDraw.Draw(board)
for i in range(8):
    im=Image.open(ROOT/f'frames/motion/frame-{i}.png').convert('RGBA');box=im.getchannel('A').getbbox()
    assert im.size==(512,512) and box and box[3]==488,(i,box)
    board.alpha_composite(im,((i%4)*512,(i//4)*540));d.text(((i%4)*512+12,(i//4)*540+515),f'{i+1} '+['near contact','near down','near pass','near push','far contact','far down','far pass','far push'][i],fill='white')
    report.append({'frame':i,'bounds':box,'footY':box[3]-1,'height':box[3]-box[1]})
board.save(ROOT/'contact-sheet.png')
(ROOT/'qa.json').write_text(json.dumps({'frames':report,'oldFootY':487,'fps':12,'bodyBobPixels':8,'phases':['contact','down','pass','push']*2},indent=2),encoding='utf8')
print('PASS: 8 frames, 512x512, feet y=487, canonical extract/atlas/GIF complete')
