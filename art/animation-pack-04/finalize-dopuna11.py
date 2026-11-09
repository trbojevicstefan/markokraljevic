from pathlib import Path
from PIL import Image,ImageDraw
import json,math
root=Path(__file__).resolve().parent;world=root.parent/'world-pack-03'
jobs=json.loads((root/'plan-dopuna11.json').read_text())['jobs'];report=[];catalog=[]
board=Image.new('RGBA',(1536,math.ceil(len(jobs)/4)*180),(28,38,42,255));d=ImageDraw.Draw(board)
for k,j in enumerate(jobs):
    out=root/'assets'/j['id'];m=json.loads((out/'manifest.json').read_text());atlas=Image.open(out/'atlas.png').convert('RGBA')
    assert atlas.size==(512*j['frames'],512)
    assert Image.open(out/'preview.gif').n_frames==j['frames']
    assert len(list((out/'frames/motion').glob('frame-*.png')))==j['frames']
    for i in range(j['frames']):
        im=Image.open(out/f'frames/motion/frame-{i}.png').convert('RGBA')
        assert im.size==(512,512) and im.getchannel('A').getbbox()[3]==488
        assert im.getchannel('A').getextrema()==(0,255)
        assert im.tobytes()==atlas.crop((512*i,0,512*(i+1),512)).tobytes()
        layout=m['frame_layout']['rows']['motion'][i];assert layout=={'x':i*512,'y':0,'w':512,'h':512}
    assert m['animation']['rows']['motion']['loop']==j['loop']
    x=(k%4)*384;y=(k//4)*180
    for n,i in enumerate([0,j['frames']//2,j['frames']-1]):
        im=Image.open(out/f'frames/motion/frame-{i}.png').convert('RGBA').resize((128,128),Image.Resampling.LANCZOS);board.alpha_composite(im,(x+n*128,y+20))
    d.text((x+8,y+154),j['id'],fill='white')
    report.append({'id':j['id'],'frames':j['frames'],'verified':True})
    catalog.append({'id':j['id'],'frames':j['frames'],'loop':j['loop'],'staticVariants':j.get('staticVariants',False),'atlas':f"assets/{j['id']}/atlas.png",'manifest':f"assets/{j['id']}/manifest.json",'renderScale':m.get('renderScale',1)})
board.convert('RGB').save(root/'preview-dopuna11.png')
(root/'validation-dopuna11.json').write_text(json.dumps(report,indent=2));(root/'catalog-dopuna11.json').write_text(json.dumps(catalog,indent=2))
props=json.loads((world/'dopuna11-props-prompts.json').read_text())['jobs'];pb=Image.new('RGBA',(1536,768),(225,221,205,255));pd=ImageDraw.Draw(pb);pr={}
for i,j in enumerate(props):
    im=Image.open(world/(j['id']+'.png')).convert('RGBA');assert im.size==tuple(j['size']) and im.getchannel('A').getextrema()[0]==0
    a=im.getchannel('A');pr[j['id']]={'size':im.size,'alphaExtrema':a.getextrema(),'transparentPixels':a.histogram()[0],'bounds':a.point(lambda a:255 if a>128 else 0).getbbox()}
    im.thumbnail((360,340),Image.Resampling.LANCZOS);x=i%4*384+(384-im.width)//2;y=i//4*384+(350-im.height)//2;pb.alpha_composite(im,(x,y));pd.text((i%4*384+12,i//4*384+359),j['id'],fill=(30,30,30))
pb.convert('RGB').save(world/'preview-dopuna11-props.png');(world/'validation-dopuna11-props.json').write_text(json.dumps(pr,indent=2))
total=sum(j['frames'] for j in jobs);animated=sum(j['frames'] for j in jobs if not j.get('staticVariants'))
with (world/'STATUS-ANIMACIJE.md').open('a',encoding='utf8') as f:
    f.write('\n## DOPUNA-11 — ZAVRSENO A–E\n29 animacionih klipova ('+str(animated)+' kadrova), kosturi kao 4 staticke varijante, i 8 providnih PNG predmeta. Ukupno '+str(total)+' celija u 30 atlasnih paketa. Po jedno generisanje za svaki trazeni paket/sliku; sword-lunge tehnicki izvoz ispravljen bez novog crtanja. Provereni PNG/GIF brojevi, celije 512x512, alfa, y487, frame_layout i slaganje atlasa sa kadrovima. Sve stare slike i izvori sacuvani.\nPregled klipova: animation-pack-04/preview-dopuna11.png; katalog: catalog-dopuna11.json; provera: validation-dopuna11.json. Predmeti: world-pack-03/preview-dopuna11-props.png; dimenzije i alfa: validation-dopuna11-props.json. Led je 1536x512, ostali predmeti 1024x1024.\nVAZNO ZA UBACIVANJE: kosturi nisu animacija — birati pojedinacne varijante prema variantNames u manifestu. Za azdaju koristiti renderScale i renderAnchor iz manifesta da telo bude oko 906 svetskih piksela (2x Musa); same atlasne celije ostaju 512x512. Nema preostalih stavki.\n')
print(len(jobs),'atlas packages;',animated,'animated frames + 4 static variants;',len(props),'props; verified')
