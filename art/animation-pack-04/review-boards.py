"""Make labeled contact sheets from actual delivered frames for visual review."""
from pathlib import Path
from PIL import Image,ImageDraw
import json,sys
R=Path(__file__).resolve().parent
group=int(sys.argv[1]) if len(sys.argv)>1 else 4
jobs=json.loads((R/f'plan-g{group}.json').read_text(encoding='utf8'))['jobs']
for who in dict.fromkeys(j['who'] for j in jobs):
    clips=[j for j in jobs if j['who']==who and (R/'assets'/j['id']/'atlas.png').exists()]
    if not clips:continue
    offset=160 if group in [7,9] else 0
    board=Image.new('RGB',(1280+offset,len(clips)*190),(25,37,36));d=ImageDraw.Draw(board)
    for row,j in enumerate(clips):
        d.text((8,row*190+2),j['id']+(' / left: old idle' if offset else ''),fill='white')
        if offset:
            ref=R.parents[1]/f"art/animation-pack-03/assets/{who}-idle/frames/motion/frame-0.png"
            if not ref.exists():ref=R/f"assets/{who}-idle/frames/motion/frame-0.png"
            im=Image.open(ref).convert('RGBA');im.thumbnail((160,160));board.paste(im,(0,row*190+20),im)
        for i in range(j['frames']):
            im=Image.open(R/f"assets/{j['id']}/frames/motion/frame-{i}.png").convert('RGBA');im.thumbnail((160,160))
            board.paste(im,(offset+i*160,row*190+20),im)
            d.text((offset+i*160+3,row*190+174),str(i+1),fill='white')
    out=R/'sources/review';out.mkdir(parents=True,exist_ok=True);board.save(out/f'group-{group}-{who}.png')
    print(out/f'group-{group}-{who}.png')
