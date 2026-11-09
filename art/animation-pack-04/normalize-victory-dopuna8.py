from pathlib import Path
from PIL import Image
import json,shutil,subprocess
root=Path(__file__).resolve().parent;out=root/'assets/marko-victory'
backup=root/'sources/marko-victory/export-before-scale-fix'
assert not backup.exists()
shutil.copytree(out,backup)
frames=[Image.open(out/f'frames/motion/frame-{i}.png').convert('RGBA') for i in range(8)]
box=frames[0].getchannel('A').getbbox();factor=383/(box[3]-box[1])
atlas=Image.new('RGBA',(4096,512));qa=json.loads((out/'qa.json').read_text())
for i,im in enumerate(frames):
    im=im.crop(im.getchannel('A').getbbox());im=im.resize((round(im.width*factor),round(im.height*factor)),Image.Resampling.LANCZOS)
    assert im.height<=480 and im.width<=500
    cell=Image.new('RGBA',(512,512));cell.alpha_composite(im,((512-im.width)//2,488-im.height))
    cell.save(out/f'frames/motion/frame-{i}.png');atlas.alpha_composite(cell,(i*512,0))
    qa['frames'][i]['bounds']=list(cell.getchannel('A').getbbox())
atlas.save(out/'atlas.png')
qa['scale']*=factor;qa['normalization']='Uniform scale based on neutral body height 383px, not raised mace height.'
(out/'qa.json').write_text(json.dumps(qa,indent=2))
m=json.loads((out/'manifest.json').read_text());m['scaleReference']['actualMaxHeight']=max(x['bounds'][3]-x['bounds'][1] for x in qa['frames']);m['scaleReference']['neutralBodyHeight']=383
m['scaleReference']['targetMaxHeight']=m['scaleReference']['actualMaxHeight']
(out/'manifest.json').write_text(json.dumps(m,indent=2))
sg=root.parents[2]/'tools/sprite-gen/.venv/Scripts/sprite-gen.exe'
subprocess.run([str(sg),'compose-gif',*[str(out/f'frames/motion/frame-{i}.png') for i in range(8)],'--output',str(out/'preview.gif'),'--delay-ticks','8','--loop-count','0'],check=True,stdout=subprocess.DEVNULL)
with (root.parent/'world-pack-03/STATUS-ANIMACIJE.md').open('a',encoding='utf8') as f:
    f.write('\nDOPUNA-8: marko-victory — ujednacena velicina tela prema neutralnom kadru (383px); topuz podignut iznad glave vise ne smanjuje Marka. Prethodni izvoz sacuvan u sources/marko-victory/export-before-scale-fix/.\n')
print('Victory neutral body height corrected to 383; previous export preserved.')
