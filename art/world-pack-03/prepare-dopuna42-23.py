from pathlib import Path
w=Path(__file__).resolve().parent
scene=(w/'export-dopuna36-c.py').read_text(encoding='utf8').replace('dopuna36-c','dopuna42-23').replace('DOPUNA-36 C','DOPUNA-42 deo2')
scene=scene.replace("frames=[]\n    # Only", "assert abs(im.width/im.height-2)<.05, 'Expected4x3landscape sheet aspect2:1'\n    frames=[]\n    # Only")
(w/'export-dopuna42-scene.py').write_text(scene,encoding='utf8')
clip=(w/'export-dopuna40.py').read_text(encoding='utf8').replace('prompts-dopuna40.json','prompts-dopuna42-23.json').replace('DOPUNA-40:','DOPUNA-42 deo3:')
(w/'export-dopuna42-clip.py').write_text(clip,encoding='utf8')
print('Prepared scene and clip exporters')
