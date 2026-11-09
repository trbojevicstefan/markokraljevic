from pathlib import Path
from PIL import Image
import sys, json
root=Path(__file__).resolve().parent
clip=sys.argv[1]; p=root/'assets'/clip
manifest=json.loads((p/'manifest.json').read_text(encoding='utf8'))
qa=json.loads((p/'qa.json').read_text(encoding='utf8'))
frames=sorted((p/'frames/motion').glob('*.png'))
assert len(frames)==len(qa['frames'])
assert all(Image.open(f).size==(512,512) and Image.open(f).getchannel('A').getbbox()[3]==488 for f in frames)
assert Image.open(p/'preview.gif').n_frames==len(frames)
print(clip, len(frames), 'frames; 512x512; baseline 487; GIF OK')
if len(sys.argv)>2:
    with (root.parent/'world-pack-03/STATUS.md').open('a',encoding='utf8') as f:
        f.write('\n## '+clip+' - GOTOVO\n'+str(len(frames))+' kadrova; atlas/manifest/frames/preview.gif/qa.json u animation-pack-04/assets/'+clip+'/. Proverene celije 512x512, oslonac y=487 i broj GIF kadrova. '+sys.argv[2]+'\n')
