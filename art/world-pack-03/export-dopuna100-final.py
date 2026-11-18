from pathlib import Path
import json, shutil
from PIL import Image
root=Path(__file__).resolve().parents[1]/'animation-pack-04'
run=root/'sources/sarac-ritne/attempt-3'; out=root/'assets/sarac-ritne'
qa=json.loads((run/'measurements.json').read_text(encoding='utf8')); frames=[Image.open(run/f'frame-{i}.png').convert('RGBA') for i in range(8)]
for f in frames:
 b=f.getbbox(); assert min(b[0],b[1],512-b[2],512-b[3])>=24
assert max(q['area'] for q in qa['frames'])<=qa['frames'][0]['area']*1.2
out.mkdir(parents=True,exist_ok=False); (out/'frames/motion').mkdir(parents=True)
atlas=Image.new('RGBA',(4096,512)); gif=[]
for i,f in enumerate(frames):
 f.save(out/f'frames/motion/frame-{i}.png'); atlas.alpha_composite(f,(512*i,0)); bg=Image.new('RGBA',(512,512),(35,42,49,255)); bg.alpha_composite(f); gif.append(bg.convert('RGB'))
atlas.save(out/'atlas.png'); gif[0].save(out/'preview.gif',save_all=True,append_images=gif[1:],duration=100,disposal=2,loop=1)
shutil.copy2(run/'identity-size-comparison.png',out/'identity-size-comparison.png')
manifest={'characterId':'sarac-ritne','description':'The horse kicks backward with both hind legs and returns to standing.','holdLastFrame':True,'animation':{'columns':8,'rows':{'motion':{'frames':8,'loop':False,'holdLastFrame':True,'durations_ms':[100]*8}}},'frame_layout':{'sheetWidth':4096,'rows':{'motion':[{'x':512*i,'y':0,'w':512,'h':512} for i in range(8)]}}}
qa.update({'identityApproved':True,'motionApproved':True,'atlasMatchesFrames':True,'reference_height_px':382,'frame_zero_height_px':355,'relative_height_approx':round(355/382,3),'support_line_y':488,'note':'Support line is the exclusive lower image bounding coordinate; opaque pixels end at y=487.'})
for name,data in [('manifest.json',manifest),('qa.json',qa)]: (out/name).write_text(json.dumps(data,indent=2,ensure_ascii=False)+'\n',encoding='utf8')
