"""Technical two-source-pixel cell-border removal; keep all twelve painted poses."""
from pathlib import Path
from PIL import Image
import json,hashlib,sys
ROOT=Path(__file__).resolve().parents[2]
PACK=ROOT/'art/world-pack-03'
for theme in (sys.argv[1:] or ['tvrdjava', 'prevoj', 'pecina', 'podrum', 'mocvara']):
    name=f'prelaz-{theme}-anim'
    raw=Image.open(PACK/f'sources/dopuna36-b/{name}-raw.png').convert('RGB')
    dest=ROOT/'art/animation-pack-04/assets'/name
    frames=[];atlas=Image.new('RGB',(9216,512));preview=Image.new('RGB',(1536,768))
    for i in range(12):
        col,row=i%4,i//4
        bounds=(round(col*raw.width/4)+2,round(row*raw.height/3)+2,round((col+1)*raw.width/4)-2,round((row+1)*raw.height/3)-2)
        im=raw.crop(bounds).resize((768,512),Image.Resampling.LANCZOS)
        im.save(dest/f'frames/motion/frame-{i}.png');frames.append(im)
        atlas.paste(im,(i*768,0));preview.paste(im.resize((384,256)),((i%4)*384,(i//4)*256))
    atlas.save(PACK/f'{name}.png');atlas.save(dest/'atlas.png');preview.save(dest/'preview.png')
    frames[0].save(dest/'preview.gif',save_all=True,append_images=frames[1:],duration=125,loop=0,optimize=False,disposal=2)
    for m in [dest/'manifest.json',PACK/f'{name}.json']:
        data=json.loads(m.read_text(encoding='utf-8'));data['source_layout']['cellInsetSourcePixels']=2;data['source_layout']['raw_width']=raw.width;data['source_layout']['raw_height']=raw.height;m.write_text(json.dumps(data,indent=2),encoding='utf-8')
    qpath=dest/'qa.json';qa=json.loads(qpath.read_text());qa['unique_frame_hashes']=len({hashlib.sha256(im.tobytes()).hexdigest() for im in frames});qa['source_cell_inset']=2;assert qa['unique_frame_hashes']==12;qpath.write_text(json.dumps(qa,indent=2))
print('Removed source grid borders from4clips; all48painted frames retained.')
