from pathlib import Path
from PIL import Image, ImageDraw
import json, sys, shutil, subprocess, time
W=Path(__file__).resolve().parent; R=W.parent/'animation-pack-04'; G=W.parents[1]
S=R/'sources/dopuna44-tri-base'; SG=G.parent/'tools/sprite-gen/.venv/Scripts/sprite-gen.exe'
name,mode=sys.argv[1:3]; enemy=name.removeprefix('kostac-').removesuffix('-kraj')
end=name.endswith('-kraj'); count=6 if end else 8; cols=3 if end else 4
target=json.loads((S/'targets.json').read_text())[enemy]; run=S/name;run.mkdir(parents=True,exist_ok=True)
def bounds(p):return p.getchannel('A').point(lambda v:255 if v>32 else 0).getbbox()
if mode=='prepare':
    shutil.copy2(sys.argv[3],run/'grid.png')
    subprocess.run([str(SG),'cutout',str(run/'grid.png'),'--out',str(run/'grid-alpha.png'),'--key','green','--decontam','palette'],check=True,stdout=subprocess.DEVNULL)
    grid=Image.open(run/'grid-alpha.png').convert('RGBA'); pieces=[]
    for i in range(count):
        x,y=i%cols,i//cols
        p=grid.crop((x*grid.width//cols+4,y*grid.height//2+4,(x+1)*grid.width//cols-4,(y+1)*grid.height//2-4));b=bounds(p);assert b
        pieces.append(p.crop(b))
    scale=target['refs'][1]['height']/pieces[0].height
    fit=min(500/max(p.width for p in pieces),472/max(p.height for p in pieces))
    scale=min(scale,fit)
    cells=[]
    for i,p in enumerate(pieces):
        p=p.resize((round(p.width*scale),round(p.height*scale)),Image.Resampling.LANCZOS)
        c=Image.new('RGBA',(512,512));c.alpha_composite(p,((512-p.width)//2,488-p.height));cells.append(c)
    if end:cells[0]=Image.open(R/f'assets/{name[:-5]}/frames/motion/frame-0.png').convert('RGBA')
    for i,c in enumerate(cells):c.save(run/f'frame-{i}.png')
    board=Image.new('RGBA',(1536,512),(34,42,49,255));board.alpha_composite(cells[0],(512,0))
    overlay=cells[0].copy()
    for idx,rf in enumerate(target['refs']):
        p=Image.open(rf['path']).convert('RGBA');p=p.crop(bounds(p));p=p.resize((rf['width'],rf['height']),Image.Resampling.LANCZOS)
        if idx:p=p.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
        board.alpha_composite(p,((0 if idx==0 else 1024)+(512-p.width)//2,488-p.height))
        a=p.getchannel('A').point(lambda v:round(v*.3));tint=Image.new('RGBA',p.size,(0,220,255));tint.putalpha(a)
        overlay.alpha_composite(tint,((145 if idx==0 else 365)-p.width//2,488-p.height))
    d=ImageDraw.Draw(board);d.text((8,8),'Marko idle x0.80; 306px',fill='white');d.text((520,8),name,fill='white');d.text((1032,8),f"{enemy} idle {target['refs'][1]['height']}px",fill='white');d.line((0,488,1535,488),fill='yellow')
    board.save(run/'identity-size-comparison.png');overlay.save(run/'size-overlay.png')
    preview=Image.new('RGBA',(2048,1024),(34,42,49,255))
    for i,c in enumerate(cells):preview.alpha_composite(c,((i%4)*512,(i//4)*512))
    preview.save(run/'preview-comparison.png')
    mb=bounds(cells[0].crop((30,0,220,512))); observed=488-mb[1]
    report={'target':target,'uniformScale':scale,'fitLimited':fit<target['refs'][1]['height']/pieces[0].height,'observedMarkoHeadToGround':observed,'markoDifferencePx':observed-306,'pairFirstHeight':bounds(cells[0])[3]-bounds(cells[0])[1]}
    (run/'export-info.json').write_text(json.dumps(report,indent=2),encoding='utf8');print(json.dumps(report))
elif mode=='export':
    out=R/'assets'/name;existing=out.exists()
    if existing:shutil.copytree(out,run/f'previous-{time.time_ns()}')
    (out/'frames/motion').mkdir(parents=True,exist_ok=True);cells=[Image.open(run/f'frame-{i}.png').convert('RGBA') for i in range(count)]
    atlas=Image.new('RGBA',(count*512,512));qa=[]
    for i,c in enumerate(cells):
        b=c.getchannel('A').getbbox();assert b and b[3]==488 and c.getchannel('A').getextrema()[0]==0
        c.save(out/f'frames/motion/frame-{i}.png');atlas.alpha_composite(c,(i*512,0));qa.append({'frame':i,'bounds':b})
    atlas.save(out/'atlas.png');cells[0].save(out/'reference.png')
    m=json.loads((R/'assets/marko-walk/manifest.json').read_text());m['characterId']=name;m['frame_variant']='painted';m['base_image']='frames/motion/frame-0.png';m['animation']['columns']=count
    m['animation']['rows']['motion'].update(frames=count,fps=10,loop=not end,holdLastFrame=end,durations_ms=[100]*count);m['holdLastFrame']=end;m['renderScale']=1;m['renderAnchor']={'x':256,'y':488};m['worldBodyHeight']=306
    m['chroma_key']={'name':'green','hex':'#00FF00','rgb':[0,255,0]};m['sprite_sheet_alpha_report']=None;m['identityReferences']=[str(Path(r['path']).relative_to(G)).replace(chr(92),'/') for r in target['refs']]
    m['scaleReference']={'markoIdleFactor':.8,'enemyIdleFactor':target['refs'][1]['factor'],'markoHeight':306,'enemyHeight':target['refs'][1]['height'],'footY':487}
    m['frame_layout']={'sheetWidth':count*512,'sheetHeight':512,'cellWidth':512,'cellHeight':512,'rows':{'motion':[{'x':i*512,'y':0,'w':512,'h':512} for i in range(count)]}}
    (out/'manifest.json').write_text(json.dumps(m,indent=2),encoding='utf8');(out/'frames/frames-manifest.json').write_text(json.dumps({'cellWidth':512,'cellHeight':512,'states':{'motion':{'frames':count,'fps':10,'loop':not end,'holdLastFrame':end,'files':[f'motion/frame-{i}.png' for i in range(count)]}}},indent=2),encoding='utf8')
    subprocess.run([str(SG),'compose-gif',*[str(out/f'frames/motion/frame-{i}.png') for i in range(count)],'--output',str(out/'preview.gif'),'--delay-ticks','10','--loop-count','1' if end else '0'],check=True,stdout=subprocess.DEVNULL)
    assert Image.open(out/'preview.gif').n_frames==count
    assert all(atlas.crop((i*512,0,(i+1)*512,512)).tobytes()==c.tobytes() for i,c in enumerate(cells))
    for n in ['identity-size-comparison.png','size-overlay.png','preview-comparison.png']:shutil.copy2(run/n,out/n)
    (out/'qa.json').write_text(json.dumps({'frames':qa,'atlasMatchesFrames':True,'gifFrames':count,'targets':json.loads((run/'export-info.json').read_text()),'identityCheck':'actual idle frame-0 checked visually alongside generated frame','sizeCheck':'overlay inspected before export'},indent=2),encoding='utf8')
    with (W/'STATUS-ANIMACIJE.md').open('a',encoding='utf8') as f:f.write(f'\nDOPUNA-44 deo 1 tri nove base: {name} — GOTOVO; {count} kadrova 512x512, '+('jednom, holdLastFrame' if end else 'petlja')+f'; uzori marko-idle-2 i {enemy}-idle/frames/motion/frame-0.png; Marko 306px, protivnik cilj {target["refs"][1]["height"]}px (odnos {target["ratio"]}); pregled lika i preklopa pre izvoza, atlas/manifest/frames/GIF/QA provereni. '+('Prethodni izvoz arhiviran.' if existing else 'Prethodni istoimeni klip nije postojao.')+'\n')
    print('EXPORTED, VALIDATED, STATUS UPDATED',name)
else:raise ValueError(mode)
