from pathlib import Path
from PIL import Image
import json,shutil,subprocess,sys
root=Path(__file__).resolve().parent
sg=root.parents[2]/'tools/sprite-gen/.venv/Scripts/sprite-gen.exe'
jobs=json.loads((root/'plan-dopuna10.json').read_text())['jobs']
for clip,gridname in [('beg-unhorsed','grid.png'),('megdan-noz','grid-v2.png')]:
    j=next(j for j in jobs if j['id']==clip);run=root/'sources'/clip;out=root/'assets'/clip
    backup=run/'export-before-full-slot-fix';assert not backup.exists();shutil.copytree(out,backup)
    cut=run/'whole-grid-alpha.png'
    subprocess.run([str(sg),'cutout',str(run/gridname),'--out',str(cut),'--key','green','--decontam','palette'],check=True,stdout=subprocess.DEVNULL)
    grid=Image.open(cut).convert('RGBA');frames=[]
    for i in range(j['frames']):
        x=i%j['cols'];y=i//j['cols']
        im=grid.crop((x*grid.width//j['cols'],y*grid.height//j['rows'],(x+1)*grid.width//j['cols'],(y+1)*grid.height//j['rows']))
        box=im.getchannel('A').point(lambda a:255 if a>16 else 0).getbbox();assert box
        frames.append(im.crop(box))
    scale=min(j['targetHeight']/max(im.height for im in frames),500/max(im.width for im in frames),480/max(im.height for im in frames))
    atlas=Image.new('RGBA',(j['frames']*512,512));entries=[]
    for i,im in enumerate(frames):
        im=im.resize((round(im.width*scale),round(im.height*scale)),Image.Resampling.LANCZOS)
        cell=Image.new('RGBA',(512,512));cell.alpha_composite(im,((512-im.width)//2,488-im.height))
        cell.save(out/f'frames/motion/frame-{i}.png');atlas.alpha_composite(cell,(i*512,0))
        entries.append({'frame':i,'bounds':cell.getchannel('A').getbbox(),'footY':487})
    atlas.save(out/'atlas.png')
    qa={'frames':entries,'referenceHeight':j['referenceHeight'],'targetMaxHeight':j['targetHeight'],'scale':scale,'loop':j['loop'],'extraction':'Whole-slot chroma key preserves disconnected actors/horse; uniform scale for all poses.'}
    (out/'qa.json').write_text(json.dumps(qa,indent=2))
    m=json.loads((out/'manifest.json').read_text());m['scaleReference']['actualMaxHeight']=max(e['bounds'][3]-e['bounds'][1] for e in entries);m['extractionNote']=qa['extraction'];(out/'manifest.json').write_text(json.dumps(m,indent=2))
    subprocess.run([str(sg),'compose-gif',*[str(out/f'frames/motion/frame-{i}.png') for i in range(j['frames'])],'--output',str(out/'preview.gif'),'--delay-ticks','8','--loop-count','0'],check=True,stdout=subprocess.DEVNULL)
    with (root.parent/'world-pack-03/STATUS-ANIMACIJE.md').open('a',encoding='utf8') as f:
        f.write('\nDOPUNA-10: '+clip+' — ispravljen izvoz. '+('Sacuvani i beg i konj kada se razdvoje.' if clip=='beg-unhorsed' else 'Drugi pokusaj zbog odsecene glave u prvom; sada cela glava i oba lika staju u kadar. Izvor grid-v2.png.')+' Stari izvoz sacuvan u sources/'+clip+'/export-before-full-slot-fix/.\n')
    print('Repaired:',clip)
