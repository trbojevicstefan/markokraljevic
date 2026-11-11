from pathlib import Path
from PIL import Image,ImageChops,ImageStat
import json,hashlib
w=Path(__file__).resolve().parent;assets=w.parent/'animation-pack-04/assets'
items=[]
for n in [1,2]:
 p=w/f'prelaz-urvina-{n}.png';assert Image.open(p).size==(1024,1024)
 items.append({'file':p.name,'size':[1024,1024],'type':'miniature'})
name='prelaz-urvina-anim';folder=assets/name
a=Image.open(folder/'atlas.png').convert('RGB');assert a.size==(9216,512)
assert a.tobytes()==Image.open(w/(name+'.png')).convert('RGB').tobytes()
m=json.loads((folder/'manifest.json').read_text());assert m['animation']['rows']['motion']['loop'];assert abs(m['source_layout']['raw_width']/m['source_layout']['raw_height']-2)<.05
fs=[]
for i in range(12):
 f=Image.open(folder/f'frames/motion/frame-{i}.png').convert('RGB');assert f.size==(768,512);assert a.crop((i*768,0,(i+1)*768,512)).tobytes()==f.tobytes();fs.append(f)
 assert m['frame_layout']['rows']['motion'][i]=={'x':i*768,'y':0,'w':768,'h':512}
assert Image.open(folder/'preview.gif').n_frames==12
diff=[sum(ImageStat.Stat(ImageChops.difference(fs[i],fs[(i+1)%12])).mean)/3 for i in range(12)]
items.append({'name':name,'frames':12,'cell':[768,512],'loop':True,'adjacent_frame_mean_rgb_difference':diff})
name='marko-pocinak';folder=assets/name;a=Image.open(folder/'atlas.png').convert('RGBA');assert a.size==(3072,512)
m=json.loads((folder/'manifest.json').read_text());assert not m['animation']['rows']['motion']['loop']
durations=[350,500,400,400,450,1200];m['animation']['rows']['motion']['durations_ms']=durations;m['holdLastFrame']=True
(folder/'manifest.json').write_text(json.dumps(m,indent=2),encoding='utf8')
fm=folder/'frames/frames-manifest.json';d=json.loads(fm.read_text());d['states']['motion']['durations_ms']=durations;d['states']['motion']['holdLastFrame']=True;fm.write_text(json.dumps(d,indent=2),encoding='utf8')
fs=[]
for i in range(6):
 f=Image.open(folder/f'frames/motion/frame-{i}.png').convert('RGBA');assert f.size==(512,512);assert f.getchannel('A').getextrema()==(0,255);assert f.getchannel('A').getbbox()[3]==488
 assert a.crop((i*512,0,(i+1)*512,512)).tobytes()==f.tobytes();fs.append(f)
 assert m['frame_layout']['rows']['motion'][i]=={'x':i*512,'y':0,'w':512,'h':512}
assert len({hashlib.sha256(f.tobytes()).hexdigest() for f in fs})==6
fs[0].save(folder/'preview.gif',save_all=True,append_images=fs[1:],duration=durations,disposal=2,optimize=False)
gif=Image.open(folder/'preview.gif');assert gif.n_frames==6 and 'loop' not in gif.info
items.append({'name':name,'frames':6,'cell':[512,512],'loop':False,'gifPlaysOnce':True,'holdLastFrame':True,'durations_ms':durations,'renderScale':m['renderScale'],'anchor':m['renderAnchor']})
(w/'validation-dopuna42-23.json').write_text(json.dumps(items,indent=2),encoding='utf8')
html='''<!doctype html><meta charset="utf-8"><title>Urvina — uvod i počinak</title><style>body{background:#202630;color:#eee;font:18px system-ui;margin:32px}img{max-width:100%;display:block}a{color:#ecc491}.minis{display:grid;grid-template-columns:1fr 1fr;gap:24px}section{margin:30px 0}</style><h1>Urvina — uvod i počinak</h1><section class="minis"><a href="prelaz-urvina-1.png"><img src="prelaz-urvina-1.png"></a><a href="prelaz-urvina-2.png"><img src="prelaz-urvina-2.png"></a></section><section><h2>Uspon na Urvinu — 12 kadrova u petlji</h2><img src="../animation-pack-04/assets/prelaz-urvina-anim/preview.gif"><a href="prelaz-urvina-anim.png">PNG traka</a></section><section><h2>Marko na počinku — 6 kadrova, jednom</h2><img src="../animation-pack-04/assets/marko-pocinak/preview.gif"><p>Pregled se igra jednom i zadržava poslednji kadar. Osveži stranicu za ponovno gledanje.</p><img src="../animation-pack-04/assets/marko-pocinak/preview-comparison.png"></section>'''
(w/'preview-dopuna42-23.html').write_text(html,encoding='utf8')
with (w/'STATUS-ANIMACIJE.md').open('a',encoding='utf8') as f:f.write('\nDOPUNA-42 delovi2/3 ZAVRSENO — prelaz-urvina-1/2 PNG1024x1024; prelaz-urvina-anim12x768x512/petlja; marko-pocinak6x512x512/jednom, trajanja350/500/400/400/450/1200ms, holdLastFrame=true, GIFtakodje jednom. Provereni alpha, y487 oslonac, atlas=frames, frame_layout, GIF12/6; preview-dopuna42-23.html i validation-dopuna42-23.json. Ugradjeni image_gen; prompts-dopuna42-23.json, izvori sacuvani. Kod i dist nisu menjani.\n')
print('PASS: two miniatures, 12frame looping scene, 6frame one-shot clip; gallery/status saved')
