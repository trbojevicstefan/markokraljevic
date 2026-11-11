import json,sys,shutil,hashlib
from pathlib import Path
from PIL import Image,ImageDraw
ROOT=Path(__file__).resolve().parents[2]
PACK=ROOT/'art/world-pack-03'
SRC=PACK/'sources/dopuna42-23'
SRC.mkdir(parents=True,exist_ok=True)
def status(name,detail):
    path=PACK/'STATUS-ANIMACIJE.md'
    with path.open('a',encoding='utf-8') as f:f.write(f'\nDOPUNA-42 deo2: {name} GOTOVO. {detail} Ugradjeni image_gen; sources/dopuna42-23/; prompts-dopuna42-23.json.\n')
def export(name,kind,raw):
    out=PACK/f'{name}.png';assert not out.exists(),out
    assert out.resolve().is_relative_to(ROOT)
    shutil.copy2(raw,SRC/f'{name}-raw.png')
    im=Image.open(raw).convert('RGB')
    if kind=='mini':
        im.resize((1024,1024),Image.Resampling.LANCZOS).save(out)
        status(name,'Minijatura1024x1024, zlatna pozadina/srpska freska.')
        print(out);return
    dest=ROOT/'art/animation-pack-04/assets'/name
    assert not dest.exists(),dest
    framesdir=dest/'frames/motion';framesdir.mkdir(parents=True)
    assert abs(im.width/im.height-2)<.05, 'Expected4x3landscape sheet aspect2:1'
    frames=[]
    # Only technical extraction/resampling of twelve generator-painted cells.
    for i in range(12):
        col,row=i%4,i//4
        bounds=(round(col*im.width/4),round(row*im.height/3),round((col+1)*im.width/4),round((row+1)*im.height/3))
        bounds=(bounds[0]+2,bounds[1]+2,bounds[2]-2,bounds[3]-2)
        frame=im.crop(bounds).resize((768,512),Image.Resampling.LANCZOS)
        frame.save(framesdir/f'frame-{i}.png');frames.append(frame)
    atlas=Image.new('RGB',(9216,512))
    preview=Image.new('RGB',(1536,768))
    for i,frame in enumerate(frames):
        atlas.paste(frame,(i*768,0));preview.paste(frame.resize((384,256)),((i%4)*384,(i//4)*256))
    atlas.save(out);atlas.save(dest/'atlas.png');preview.save(dest/'preview.png')
    frames[0].save(dest/'preview.gif',save_all=True,append_images=frames[1:],duration=125,loop=0,optimize=False,disposal=2)
    manifest={'characterId':name,'assetType':'animated-transition-scene','engine':'component-row','game_input':'atlas.png','image':out.name,'degraded_static_fallback':False,'frame_variant':'painted','noFootAlignment':True,'opaqueBackground':True,'cell':{'shape':'rectangle','width':768,'height':512},'animation':{'cellWidth':768,'cellHeight':512,'columns':12,'rows':{'motion':{'row':0,'frames':12,'fps':8,'durations_ms':[125]*12,'loop':True}}},'frame_layout':{'sheetWidth':9216,'sheetHeight':512,'cellWidth':768,'cellHeight':512,'rows':{'motion':[{'x':i*768,'y':0,'w':768,'h':512} for i in range(12)]}},'source_layout':{'columns':4,'rows':3,'order':'row-major','raw_width':im.width,'raw_height':im.height},'generation':'built-in image_gen; twelve painted frames, fixed-camera prompt'}
    (dest/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
    (PACK/f'{name}.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
    qa={'frame_count':12,'unique_frame_hashes':len({hashlib.sha256(f.tobytes()).hexdigest() for f in frames}),'atlas_size':atlas.size,'frames_size':[768,512],'background':'opaque','source_layout':'4 columns x3 rows','fps':8,'gif_frames':Image.open(dest/'preview.gif').n_frames}
    assert qa['unique_frame_hashes']==12 and qa['gif_frames']==12
    (dest/'qa.json').write_text(json.dumps(qa,indent=2),encoding='utf-8')
    status(name,'Scena12kadrova768x512, traka9216x512,8FPS/petlja. Atlas+manifest+preview.gif u art/animation-pack-04/assets/'+name+'/.')
    print(json.dumps(qa))
if __name__=='__main__':export(*sys.argv[1:])
