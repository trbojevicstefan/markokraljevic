from pathlib import Path
from PIL import Image,ImageDraw
import json,numpy as np
root=Path(__file__).resolve().parent;world=root.parent/'world-pack-03'
jobs=json.loads((root/'plan-dopuna12.json').read_text())['jobs'];props=json.loads((world/'dopuna12-props-prompts.json').read_text())['jobs']
board=Image.new('RGBA',(1536,4*340),(30,41,43,255));draw=ImageDraw.Draw(board);catalog=[]
for row,j in enumerate(jobs):
    out=root/'assets'/j['id'];m=json.loads((out/'manifest.json').read_text());atlas=Image.open(out/'atlas.png').convert('RGBA');assert atlas.size==(3072,512)
    assert Image.open(out/'preview.gif').n_frames==6
    assert m['animation']['rows']['motion']['loop']==j['loop']
    for i in range(6):
        im=Image.open(out/f'frames/motion/frame-{i}.png').convert('RGBA');assert im.size==(512,512) and im.getchannel('A').getbbox()[3]==488
        assert im.getchannel('A').getextrema()==(0,255)
        assert atlas.crop((i*512,0,(i+1)*512,512)).tobytes()==im.tobytes()
        assert m['frame_layout']['rows']['motion'][i]=={'x':i*512,'y':0,'w':512,'h':512}
    for col,i in enumerate([0,3,5]):
        im=Image.open(out/f'frames/motion/frame-{i}.png').convert('RGBA');im.thumbnail((320,320),Image.Resampling.LANCZOS);board.alpha_composite(im,(col*512+96,row*340));draw.text((col*512+8,row*340+322),j['id']+' '+str(i),fill='white')
    if j['id'].startswith('vilinski-kamen'):
        m['objectId']='vilinski-kamen';m['objectAnchor']={'x':256,'y':488};m['worldHeight']=460
        m['chroma_key']=None if j.get('nativeAlpha') else {'name':'magenta','hex':'#FF00FF','rgb':[255,0,255]}
        m['lightingOnly']=True
    (out/'manifest.json').write_text(json.dumps(m,indent=2))
    catalog.append({'id':j['id'],'frames':6,'loop':j['loop'],'atlas':f"assets/{j['id']}/atlas.png",'manifest':f"assets/{j['id']}/manifest.json",'verified':True})
board.convert('RGB').save(root/'preview-dopuna12.png');(root/'catalog-dopuna12.json').write_text(json.dumps(catalog,indent=2));(root/'validation-dopuna12.json').write_text(json.dumps(catalog,indent=2))
pb=Image.new('RGBA',(1536,768),(222,219,205,255));d=ImageDraw.Draw(pb);records={}
for k,j in enumerate(props):
    im=Image.open(world/(j['id']+'.png')).convert('RGBA');assert im.size==tuple(j['size']);assert im.getchannel('A').getextrema()[0]==0
    b=im.getchannel('A').getbbox();rec={'size':im.size,'bounds':b,'groundAnchor':[im.width//2,im.height] if j['kind']=='obstacle' else None,'verified':True}
    if j['kind']=='obstacle':assert b[3]==512
    if j['id']=='most-vila-segment':
        a=np.array(im);rec['horizontalSeamMax']=int(np.abs(a[:,0].astype(int)-a[:,-1].astype(int)).max());assert rec['horizontalSeamMax']==0
        rec['repeatX']=True
        alpha=a[:,:,3];rec['walkY']=int(np.argmax(np.mean(alpha>200,axis=1)>.95))
        tiled=Image.new('RGBA',(im.width*2,im.height));tiled.alpha_composite(im,(0,0));tiled.alpha_composite(im,(im.width,0));tiled.save(world/'most-vila-segment-tiling-preview.png')
    records[j['id']]=rec
    im.thumbnail((360,320),Image.Resampling.LANCZOS);x=(k%4)*384+(384-im.width)//2;y=(k//4)*384+(350-im.height)//2;pb.alpha_composite(im,(x,y));d.text(((k%4)*384+8,(k//4)*384+359),j['id'],fill=(25,25,25))
pb.convert('RGB').save(world/'preview-dopuna12-props.png');(world/'validation-dopuna12-props.json').write_text(json.dumps(records,indent=2))
with (world/'STATUS-ANIMACIJE.md').open('a',encoding='utf8') as f:
    f.write('\nDOPUNA-12: vilinski-kamen-budan — ispravka GOTOVA; rune su upaljene u svih 6 kadrova, cista alfa bez svetle podloge. Prvi izvoz i crtez sacuvani u sources/vilinski-kamen-budan/export-before-lighting-fix/ i grid.png; odabrani izvor grid-v2.png.\n')
    f.write('\n## DOPUNA-12 — ZAVRSENO\n4 klipa, 24 kadra, 2 slike mosta i 5 prepreka. Svi klipovi imaju atlas/manifest/frame_layout/frames/preview.gif/qa.json, 512x512, oslonac y487. Provereni alfa, broj GIF kadrova i slaganje sa atlasom. Segment mosta 1536x384, kraj 1024x512, prepreke 768x512 sa dnom na tlu. Vodoravni spoj segmenta: 0 razlike. Pregledi: animation-pack-04/preview-dopuna12.png i world-pack-03/preview-dopuna12-props.png. Katalog/provere: catalog-dopuna12.json, validation-dopuna12.json, validation-dopuna12-props.json. Ugradjeni image_gen, po jedan pokusaj osim drugog za budan kamen zbog ocigledne greske u osvetljenju/alfa podlozi. Sve prethodno sacuvano.\n')
print('Verified: 4 clips / 24 frames; 7 props; bridge seam=0')
