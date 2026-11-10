from pathlib import Path
from PIL import Image
import hashlib,json,subprocess,sys
ROOT=Path(__file__).resolve().parents[2]
PACK=ROOT/'art/world-pack-03'
SRC=PACK/'sources/dopuna35-c'
THEMES=['prevoj','pecina','klisura','suma']
qa=[]
sheet=Image.new('RGB',(724*4,1520),(35,42,53))
for i,t in enumerate(THEMES):
    for v in ['','-night','-storm']:
        path=ROOT/f'art/world-pack-01/assets/{t}-near{v}.png'
        im=Image.open(path).convert('RGBA')
        qpath=SRC/f'{t}{v}-qa.json'
        q=json.loads(qpath.read_text(encoding='utf-8'))
        q['original_hash_verified']=hashlib.sha256((ROOT/q['original']).read_bytes()).hexdigest()==q['original_sha256']
        q['size']=im.size
        q['mode']=im.mode
        q['alpha_extrema']=im.getchannel('A').getextrema()
        q['transparent_pixels']=im.getchannel('A').histogram()[0]
        q['sky_alpha_samples']=[im.getpixel(pt)[3] for pt in [(1000,150),(1100,250),(1000,350)]]
        q['correction_count']=1 if t=='klisura' and not v else 0
        assert im.size==(2172,724) and q['original_hash_verified'] and q['transparent_pixels']>100000
        assert all(a==0 for a in q['sky_alpha_samples']),q
        qpath.write_text(json.dumps(q,indent=2),encoding='utf-8')
        qa.append(q)
    subprocess.run([sys.executable,str(PACK/'export-dopuna35-c.py'),'preview',t],capture_output=True,check=True)
    preview=Image.open(PACK/f'preview-dopuna35-{t}.jpg')
    preview.thumbnail((724,1520))
    sheet.paste(preview,(724*i,0))
sheet.save(SRC/'qa-contact.jpg',quality=92)
(PACK/'validation-dopuna35-c.json').write_text(json.dumps(qa,indent=2),encoding='utf-8')
(PACK/'catalog-dopuna35-c.json').write_text(json.dumps({'scope':'DOPUNA35 part C near only','mode':'built-in image_gen','assets':[q['file'] for q in qa],'previews':[f'preview-dopuna35-{t}.jpg' for t in THEMES],'prompts':'prompts-dopuna35-c.json','limitation':'Weather composition follows new day reference; painted detail can vary. Foreground visually preserved, not pixel-identical.','corrections':'klisura day: one additional built-in transparency edit; initial source retained.'},indent=2),encoding='utf-8')
print(json.dumps({'png_count':len(qa),'original_hashes_verified':sum(q['original_hash_verified'] for q in qa),'previews':len(THEMES),'sky_samples_all_alpha0':True}))
