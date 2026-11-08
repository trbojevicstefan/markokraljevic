"""Export generated rows with the existing sprite-gen pipeline; never touch game assets."""
import json, subprocess, shutil, hashlib, sys
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parent
SG=ROOT.parents[2]/'tools/sprite-gen/.venv/Scripts/sprite-gen.exe'
entries=[]
for run in sorted((ROOT/'sources').iterdir()):
    raw=run/'raw/motion.png'
    if not raw.exists(): continue
    reqpath=run/'sprite-request.json'
    req=json.loads(reqpath.read_text(encoding='utf-8-sig'))
    state=req['states']['motion']; count=state['frames']; fps=state['fps']
    if not (run/'sprite-request.original.json').exists(): shutil.copy2(reqpath,run/'sprite-request.original.json')
    req['chroma_key']={'name':'green','hex':'#00FF00','rgb':[0,255,0],'selection':'manual'}
    reqpath.write_text(json.dumps(req,indent=2),encoding='utf8')
    out=ROOT/'assets'/run.name
    if not (out/'atlas.png').exists() or run.name in sys.argv[1:]:
        for action in ['extract','compose-atlas']:
            subprocess.run([str(SG),action,'--run-dir',str(run)],check=True,stdout=subprocess.DEVNULL)
        out.mkdir(parents=True,exist_ok=True)
        shutil.copy2(run/'sprite-sheet-alpha.png',out/'atlas.png')
        shutil.copy2(run/'manifest.json',out/'manifest.json')
        shutil.copytree(run/'frames',out/'frames',dirs_exist_ok=True)
        (ROOT/'previews').mkdir(exist_ok=True)
        subprocess.run([str(SG),'compose-gif',*[str(run/f'frames/motion/frame-{i}.png') for i in range(count)],'--output',str(ROOT/f'previews/{run.name}.gif'),'--delay-ticks',str(round(100/fps)),'--loop-count','0'],check=True,stdout=subprocess.DEVNULL)
    frames=[out/f'frames/motion/frame-{i}.png' for i in range(count)]
    hashes=[]; bounds=[]
    for p in frames:
        im=Image.open(p); assert im.mode=='RGBA',str(p)
        a=im.getchannel('A'); box=a.getbbox()
        assert box and a.getextrema()[0]==0,str(p)
        assert box[0]>0 and box[1]>0 and box[2]<im.width and box[3]<im.height,str(p)
        hashes.append(hashlib.sha256(im.tobytes()).hexdigest());bounds.append(box)
    assert len(set(hashes))==count,run.name
    manifest=json.loads((out/'manifest.json').read_text())
    entries.append({'id':run.name,'fps':fps,'loop':state['loop'],'frames':next(iter(manifest['frame_layout']['rows'].values())),'bounds':bounds})
    print('PASS',run.name,count,flush=True)
(ROOT/'generated-catalog.js').write_text('const CATALOG = '+json.dumps(entries,ensure_ascii=False)+';',encoding='utf8')
(ROOT/'qa-generated.json').write_text(json.dumps({'clips':len(entries),'frames':sum(len(e['frames']) for e in entries),'entries':entries},indent=2),encoding='utf8')
