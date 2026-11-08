from pathlib import Path
from PIL import Image,ImageDraw
import json,subprocess,shutil,numpy as np,sys
ROOT=Path(__file__).resolve().parent;GAME=ROOT.parents[1]
SG=GAME.parent/'tools/sprite-gen/.venv/Scripts/sprite-gen.exe'
jobs=[]
for p in sorted(ROOT.glob('plan-g*.json')):jobs.extend(json.loads(p.read_text(encoding='utf8'))['jobs'])
published=[]
for j in jobs:
    if sys.argv[1:] and str(j['group']) not in sys.argv[1:]:continue
    run=ROOT/'sources'/j['id'];grid=run/'grid.png'
    if not grid.exists():continue
    if j['id']=='marko-climb' and not all((run/f'far-phase-{i}.png').exists() for i in range(4)):continue
    out=ROOT/'assets'/j['id'];out.mkdir(parents=True,exist_ok=True)
    if not (out/'atlas.png').exists():
        im=Image.open(grid).convert('RGB');cw=im.width//j['cols'];ch=im.height//j['rows']
        if j['id']=='marko-climb':
            def fgbox(pic):
                a=np.array(pic).astype(float);m=np.linalg.norm(a-np.array([0,255,0]),axis=2)>100;ys,xs=np.where(m)
                return (int(xs.min()),int(ys.min()),int(xs.max()+1),int(ys.max()+1))
            for k in range(4):
                top=im.crop((k*cw,0,(k+1)*cw,ch));box=fgbox(top)
                ob=Image.open(run/f'far-phase-{k}.png').convert('RGB');ob=ob.crop(fgbox(ob))
                scale=min((box[3]-box[1])/ob.height,(cw-20)/ob.width);ob=ob.resize((round(ob.width*scale),round(ob.height*scale)),Image.Resampling.LANCZOS)
                cell=Image.new('RGB',(cw,ch),(0,255,0));cell.paste(ob,((cw-ob.width)//2,box[3]-ob.height));im.paste(cell,(k*cw,ch))
            im.save(run/'revised-grid.png')
        row_edges=[k*ch for k in range(j['rows']+1)]
        if 'gridRowCuts' in j:row_edges=[round(k*im.height/j['gridRowCuts'][-1]) for k in j['gridRowCuts']]
        raw_height=max(row_edges[k+1]-row_edges[k] for k in range(j['rows']))
        strip=Image.new('RGB',(cw*j['frames'],raw_height),(0,255,0))
        for i in range(j['frames']):
            row=i//j['cols'];cell=im.crop(((i%j['cols'])*cw,row_edges[row],(i%j['cols']+1)*cw,row_edges[row+1]))
            strip.paste(cell,(i*cw,raw_height-cell.height))
        (run/'raw').mkdir(exist_ok=True);strip.save(run/'raw/motion.png')
        w,h=j['cell'];ref=GAME/j['reference']
        if not (run/'sprite-request.json').exists():
            subprocess.run([str(SG),'prepare','--out-dir',str(run),'--force','--character-id',j['id'],'--base-image',str(ref),'--style','hand painted cel shaded','--cell-width',str(w),'--cell-height',str(h),'--safe-margin','24','--chroma-key','#00ff00','--no-fit-pixel-unfake','--fit-align-x','bbox-center','--fit-align-y','bottom','--fit-ground-frames','--request-json',json.dumps({'states':{'motion':{'frames':j['frames'],'fps':j['fps'],'loop':j['loop'],'action':j['id']}}})],check=True,stdout=subprocess.DEVNULL)
        extract_args=[str(SG),'extract','--run-dir',str(run),'--allow-slot-fallback']
        if 'decontam' in j:extract_args+=['--decontam',j['decontam']]
        subprocess.run(extract_args,check=True,stdout=subprocess.DEVNULL)
        frames=[Image.open(run/f'frames/motion/frame-{i}.png').convert('RGBA') for i in range(j['frames'])]
        frames=[im.crop(im.getchannel('A').getbbox()) for im in frames]
        old=GAME/f"art/animation-pack-03/assets/{j['who']}-idle/frames/motion"
        oldframes=list(old.glob('*.png'))
        if oldframes:
            boxes=[Image.open(p).getchannel('A').getbbox() for p in oldframes]
            reference_height=int(np.median([b[3]-b[1] for b in boxes]));bottom=int(np.median([b[3] for b in boxes]))
        else:reference_height=j.get('referenceHeight',426);bottom=488
        target=j.get('targetHeight',reference_height+j.get('extra',0))
        scale=min(target/max(im.height for im in frames),(w-12)/max(im.width for im in frames),(bottom-8)/max(im.height for im in frames))
        qa=[]
        for i,im in enumerate(frames):
            im=im.resize((max(1,round(im.width*scale)),max(1,round(im.height*scale))),Image.Resampling.LANCZOS)
            cell=Image.new('RGBA',(w,h));cell.alpha_composite(im,((w-im.width)//2,bottom-im.height));cell.save(run/f'frames/motion/frame-{i}.png')
            box=cell.getchannel('A').getbbox();assert box and box[3]==bottom and box[0]>=0 and box[2]<=w
            entry={'frame':i,'bounds':box,'footY':bottom-1}
            if j['id']=='marko-hang':
                pixels=np.array(cell);mask=pixels[:,:,3]>100
                ys,xs=np.where(mask);top=int(ys.min());hy,hx=np.where(mask[top:top+10])
                entry['grip']=[int(np.median(hx)),top+4]
            qa.append(entry)
        subprocess.run([str(SG),'compose-atlas','--run-dir',str(run)],check=True,stdout=subprocess.DEVNULL)
        shutil.copy2(run/'sprite-sheet-alpha.png',out/'atlas.png');shutil.copytree(run/'frames',out/'frames',dirs_exist_ok=True)
        manifest=json.loads((run/'manifest.json').read_text());manifest['game_input']='atlas.png';manifest['sprite_sheet_alpha']='atlas.png';manifest['base_image']='reference.png'
        manifest['scaleReference']={'character':j['who'],'referenceHeight':reference_height,'targetMaxHeight':target,'actualMaxHeight':max(x['bounds'][3]-x['bounds'][1] for x in qa),'footY':bottom-1}
        if j['id']=='marko-hang':
            manifest['gripAnchors']=[{'frame':x['frame'],'point':x['grip']} for x in qa]
            manifest['alignmentNote']='Pin each frame gripAnchors point to the same ledge position; body sway stays below the raised hand.'
        if 'groundImpactFrame' in j:
            manifest['groundImpactFrame']=j['groundImpactFrame'];manifest['airborneFrames']=j['airborneFrames']
        (out/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf8');shutil.copy2(ref,out/'reference.png')
        subprocess.run([str(SG),'compose-gif',*[str(out/f'frames/motion/frame-{i}.png') for i in range(j['frames'])],'--output',str(out/'preview.gif'),'--delay-ticks',str(round(100/j['fps'])),'--loop-count','0'],check=True,stdout=subprocess.DEVNULL)
        (out/'qa.json').write_text(json.dumps({'frames':qa,'referenceHeight':reference_height,'targetMaxHeight':target,'scale':scale,'loop':j['loop']},indent=2),encoding='utf8')
    published.append(j);print('Published',j['id'],j['frames'],flush=True)
allready=[j for j in jobs if (ROOT/'assets'/j['id']/'atlas.png').exists()]
if allready and '9' not in sys.argv[1:]:
    board=Image.new('RGBA',(1536,len(allready)*540),(24,37,36,255));d=ImageDraw.Draw(board)
    for row,j in enumerate(allready):
        old=GAME/f"art/animation-pack-03/assets/{j['who']}-idle/frames/motion/frame-0.png"
        if not old.exists():old=GAME/'art/animation-pack-03/assets/sword-idle/frames/motion/frame-0.png'
        ref=Image.open(old).convert('RGBA');frame=Image.open(ROOT/f"assets/{j['id']}/frames/motion/frame-0.png").convert('RGBA')
        board.alpha_composite(ref,(0,row*540));board.alpha_composite(frame,(512,row*540));d.text((12,row*540+515),'PACK03 reference / '+j['id'],fill='white')
    preview_name='preview-group-7-enemies.png' if '7' in sys.argv[1:] and any(j['group']==7 and j['who']!='marko' for j in allready) else 'preview-group-7.png' if '7' in sys.argv[1:] else 'preview.png'
    board.save(ROOT/preview_name)
(ROOT/'catalog.json').write_text(json.dumps([{'id':j['id'],'group':j['group'],'frames':j['frames'],'fps':j['fps'],'loop':j['loop'],'file':f"assets/{j['id']}/atlas.png",'manifest':f"assets/{j['id']}/manifest.json"} for j in allready],indent=2),encoding='utf8')

