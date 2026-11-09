from pathlib import Path
from PIL import Image
import sys, shutil, subprocess, json
root=Path(__file__).resolve().parent
clip=sys.argv[1]
if len(sys.argv)>2:
    grid=root/'sources'/clip/'grid.png'
    assert not grid.exists(), 'Existing source preserved'
    grid.parent.mkdir(parents=True,exist_ok=True); shutil.copy2(sys.argv[2],grid)
    subprocess.run([sys.executable,str(root/'export-dopuna10.py'),'12','--clip='+clip],check=True)
out=root/'assets'/clip
j=next(j for j in json.loads((root/'plan-dopuna10.json').read_text())['jobs'] if j['id']==clip)
frames=list((out/'frames/motion').glob('frame-*.png'))
assert len(frames)==j['frames']
assert all(Image.open(p).size==(512,512) and Image.open(p).getchannel('A').getbbox()[3]==488 for p in frames)
assert Image.open(out/'preview.gif').n_frames==j['frames']
with (root.parent/'world-pack-03/STATUS-ANIMACIJE.md').open('a',encoding='utf8') as f:
    f.write('\n## DOPUNA-10: '+clip+' — izvezeno\n'+str(j['frames'])+' kadrova, '+('petlja' if j['loop'] else 'jednom')+'. Atlas, manifest, frames, preview.gif i qa.json u art/animation-pack-04/assets/'+clip+'/. Celije 512x512; oslonac y=487. Ugradjeni image_gen; prompt: animation-pack-04/plan-dopuna10.json.\n')
print('Validated and logged:',clip)
