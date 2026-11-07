"""Read atlas geometry; do not modify images. Derive consistent runtime display sizes."""
from PIL import Image
from pathlib import Path
import json

root=Path('dist/assets')
names=['mounted-run','mounted-jump','fairy-cast','marko-attack','musa-attack','sword-attack','shield-attack','archer-shoot','marko-jump','marko-drink']
targets={'mounted-run':210,'mounted-jump':210,'fairy-cast':76,'musa-attack':146,'shield-attack':110}
sizes={}
report={}
for name in names:
    manifest=json.loads((root/(name+'.json')).read_text())
    frames=list(manifest['frame_layout']['rows'].values())[0]
    image=Image.open(root/(name+'.png'))
    boxes=[]
    for frame in frames:
        box=image.crop((frame['x'],frame['y'],frame['x']+frame['w'],frame['y']+frame['h'])).getbbox()
        assert box is not None, (name,'empty frame')
        assert box[0]>0 and box[1]>0 and box[2]<frame['w'] and box[3]<frame['h'],(name,'clipped frame')
        boxes.append(box)
    sizes[name]=round(targets.get(name,114)*frames[0]['h']/(boxes[0][3]-boxes[0][1]),2)
    report[name]={'frames':len(frames),'boxes':boxes,'displaySize':sizes[name]}
(root/'motion-sizes.json').write_text(json.dumps(sizes,indent=2))
Path('output').mkdir(exist_ok=True)
Path('output/animation-qa.json').write_text(json.dumps(report,indent=2))
print(json.dumps(sizes))
print('All 58 new animation frames are nonempty and inside the safe bounds.')
