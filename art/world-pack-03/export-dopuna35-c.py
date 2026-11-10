import sys,json,hashlib,shutil
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
ROOT=Path(__file__).resolve().parents[2]
PACK=ROOT/'art/world-pack-03'
SRC=PACK/'sources/dopuna35-c'
SRC.mkdir(parents=True,exist_ok=True)
def path(theme,variant=''):
    folder=ROOT/'art/world-pack-01/assets' if theme!='oranje' else PACK
    return folder/f'{theme}-near{variant}.png'
def export(theme,variant,raw):
    if variant=='day':variant=''
    out=path(theme,variant); backup=out.parent.parent/'staro'/out.name if theme!='oranje' else PACK/'staro'/out.name
    for p in [out,backup]: assert p.resolve().is_relative_to(ROOT)
    assert not backup.exists(),f'Backup exists: {backup}'
    old=Image.open(out).convert('RGBA'); im=Image.open(raw).convert('RGBA').resize(old.size,Image.Resampling.LANCZOS)
    if theme=='reka' and variant=='-night':
        im.putalpha(Image.open(path(theme)).convert('RGBA').getchannel('A'))
    rawdest=SRC/f'{theme}{variant}-raw.png'; shutil.copy2(raw,rawdest)
    # Generator preserves road/river appearance. Do not paste old architecture
    # that extends into the bottom15%, as that leaves ghost wheels and clipped doors.
    backup.parent.mkdir(parents=True,exist_ok=True)
    digest=hashlib.sha256(out.read_bytes()).hexdigest();out.replace(backup);im.save(out)
    qa={'file':str(out.relative_to(ROOT)),'original':str(backup.relative_to(ROOT)),'original_sha256':digest,'size':im.size,'alpha_extrema':im.getchannel('A').getextrema(),'road_preservation':'visual from edit reference; not pixel exact, to avoid old architecture ghosts'}
    (SRC/f'{theme}{variant}-qa.json').write_text(json.dumps(qa,indent=2),encoding='utf-8')
    print(json.dumps(qa))
def preview(theme):
    sil=Image.open(ROOT/'art/animation-pack-04/assets/marko-idle-2/frames/motion/frame-0.png').convert('RGBA')
    bbox=sil.getchannel('A').point(lambda a:255 if a>16 else 0).getbbox();sil=sil.crop(bbox)
    sil=sil.resize((round(sil.width*145/sil.height),145),Image.Resampling.LANCZOS)
    solid=Image.new('RGBA',sil.size,(235,225,200,255));solid.putalpha(sil.getchannel('A'))
    canvas=Image.new('RGB',(2172,6*760),(35,42,53)); d=ImageDraw.Draw(canvas)
    for i,v in enumerate(['','-night','-storm']):
        out=path(theme,v);old=out.parent.parent/'staro'/out.name if theme!='oranje' else PACK/'staro'/out.name
        for j,p in enumerate([old,out]):
            y=(i*2+j)*760;im=Image.open(p).convert('RGBA');canvas.paste(im,(0,y+32),im)
            # Same 145px reference, beside architecture; no silhouette is burned into assets.
            anchors={'selo':[(1660,620),(1430,630),(1940,650),(1430,620),(1940,620),(1430,620)],'oranje':[(690,516),(1160,566)]*3,'reka':[(650,670),(310,633),(520,680),(310,633),(1550,650),(310,633)]}
            anchors.update({'manastir':[(1870,485),(1230,630)]*3,'tvrdjava':[(1800,580),(1090,632)]*3,'rusevine':[(420,590),(760,650)]*3})
            anchors.update({'prevoj':[(1780,500),(1370,650)]*3,'pecina':[(300,640),(620,615)]*3,'klisura':[(380,530),(480,535)]*3,'suma':[(1820,580),(1260,610)]*3})
            x,feet=anchors[theme][i*2+j]
            canvas.paste(solid,(x,y+32+feet-145),solid)
            d.text((20,y+5),f'{theme} {v or "day"} | {"OLD" if j==0 else "NEW"} | Marko145px',fill='white',font=ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf',24))
    target=PACK/f'preview-dopuna35-{theme}.jpg';canvas.save(target,quality=91)
    status=PACK/'STATUS-ANIMACIJE.md'
    lines=status.read_text(encoding='utf-8').splitlines()
    lines=[s for s in lines if not s.startswith(f'DOPUNA-35 C: {theme} GOTOVO')]
    lines.append(f'DOPUNA-35 C: {theme} GOTOVO3/3 near (dan,noc,oluja),2172x724. Uvecane kuce/prolazi prema Marku145px; isti dnevni raspored je referenca za vremenske varijante; providno nebo, drum/voda zadrzani vizuelno prema referenci (nisu piksel-identicni). Originali u odgovarajucem staro/. Pregled preview-dopuna35-{theme}.jpg: staro/novo sa siluetom145px. Ugradjeni image_gen, izvori i QA u sources/dopuna35-c/. mid/kod/dist nisu menjani.')
    status.write_text('\n'.join(lines)+'\n',encoding='utf-8')
    print(target)
if sys.argv[1]=='export':export(*sys.argv[2:])
elif sys.argv[1]=='preview':preview(sys.argv[2])
