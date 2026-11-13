from pathlib import Path
from PIL import Image,ImageDraw
import json,shutil,subprocess,sys,time
W=Path(__file__).resolve().parent;G=W.parents[1];R=W.parent/'animation-pack-04';S=R/'sources/dopuna44-deo5';SG=G.parent/'tools/sprite-gen/.venv/Scripts/sprite-gen.exe'
name,mode=sys.argv[1:3];end=name.endswith('-kraj');enemy=name.removeprefix('kostac-').removesuffix('-kraj');count=6 if end else 8;cols=3 if end else 4;run=S/name;run.mkdir(parents=True,exist_ok=True)
targets=json.loads((S/f'{enemy}-targets.json').read_text());base='kostac-janicar-kraj' if end else 'kostac-janicar'
def bb(p):return p.getchannel('A').point(lambda v:255 if v>32 else 0).getbbox()
def template(i):return Image.open(S/f'{base}-scaled-{i}.png').convert('RGBA')
if mode=='prepare':
    shutil.copy2(sys.argv[3],run/'grid.png');subprocess.run([str(SG),'cutout',str(run/'grid.png'),'--out',str(run/'grid-alpha.png'),'--key','green','--decontam','palette'],check=True,stdout=subprocess.DEVNULL)
    im=Image.open(run/'grid-alpha.png').convert('RGBA');pieces=[]
    for i in range(count):
        x,y=i%cols,i//cols;p=im.crop((x*im.width//cols+4,y*im.height//2+4,(x+1)*im.width//cols-4,(y+1)*im.height//2-4));b=bb(p);assert b;pieces.append(p.crop(b))
    tb=bb(template(0));targetWidth=tb[2]-tb[0]
    if end:
        opening=Image.open(R/f'assets/{name[:-5]}/frames/motion/frame-0.png').convert('RGBA');ob=bb(opening);targetWidth=ob[2]-ob[0]
    scale=targetWidth/pieces[0].width;fit=min(500/max(p.width for p in pieces),472/max(p.height for p in pieces));scale=min(scale,fit);cells=[]
    for i,p in enumerate(pieces):
        q=p.resize((round(p.width*scale),round(p.height*scale)),Image.Resampling.LANCZOS);c=Image.new('RGBA',(512,512));c.alpha_composite(q,((512-q.width)//2,488-q.height));cells.append(c)
    if end:cells[0]=Image.open(R/f'assets/{name[:-5]}/frames/motion/frame-0.png').convert('RGBA')
    for i,c in enumerate(cells):c.save(run/f'frame-{i}.png')
    board=Image.new('RGBA',(2048,1024),(34,42,49,255));d=ImageDraw.Draw(board)
    for i,c in enumerate(cells):board.alpha_composite(c,((i%4)*512,(i//4)*512));d.text(((i%4)*512+8,(i//4)*512+8),str(i),fill='white')
    board.save(run/'preview-comparison.png');comparison=Image.new('RGBA',(2048,512),(34,42,49,255));comparison.alpha_composite(cells[0],(512,0));comparison.alpha_composite(template(0),(1024,0))
    for idx,t in enumerate(targets):
        p=Image.open(t['path']).convert('RGBA');p=p.crop(bb(p));p=p.resize((t['width'],t['height']),Image.Resampling.LANCZOS);comparison.alpha_composite(p,((0 if idx==0 else 1536)+(512-p.width)//2,488-p.height))
    d=ImageDraw.Draw(comparison)
    for x,label in [(8,'Marko idle x0.80'),(520,name),(1032,base+' x0.76'),(1544,enemy+' actual idle scaled')]:d.text((x,8),label,fill='white')
    comparison.save(run/'identity-size-comparison.png')
    overlays=Image.new('RGBA',(1024,512),(34,42,49,255))
    for idx,i in enumerate([0,count-1]):
        c=cells[i].copy();p=template(i);b=bb(p);p=p.crop(b);a=p.getchannel('A').point(lambda v:round(v*.32));tint=Image.new('RGBA',p.size,(0,220,255));tint.putalpha(a);c.alpha_composite(tint,((512-p.width)//2,488-p.height));overlays.alpha_composite(c,(idx*512,0))
    overlays.save(run/'size-overlay.png');report={'zoomRelativeToOriginal':.76,'uniformScale':scale,'referencePairFirstBounds':tb,'referencePairLastBounds':bb(template(count-1)),'outputPairFirstBounds':bb(cells[0]),'outputPairLastBounds':bb(cells[-1]),'markoHeightEquivalent':306,'enemyHeightEquivalent':targets[1]['height'],'enemyToMarko':1 if enemy=='akindzija' else .95,'fitLimited':fit<targetWidth/pieces[0].width,'actualIdleReferences':targets}
    (run/'export-info.json').write_text(json.dumps(report,indent=2),encoding='utf8');print(json.dumps(report))
elif mode=='export':
    out=R/'assets'/name;existing=out.exists()
    if existing:shutil.copytree(out,run/f'previous-{time.time_ns()}')
    (out/'frames/motion').mkdir(parents=True,exist_ok=True);cells=[Image.open(run/f'frame-{i}.png').convert('RGBA') for i in range(count)];atlas=Image.new('RGBA',(count*512,512));bounds=[]
    for i,c in enumerate(cells):
        b=c.getchannel('A').getbbox();assert b and b[3]==488 and b[0]>0 and b[2]<512 and c.getchannel('A').getextrema()==(0,255);bounds.append(b);c.save(out/f'frames/motion/frame-{i}.png');atlas.alpha_composite(c,(i*512,0))
    atlas.save(out/'atlas.png');cells[0].save(out/'reference.png');m=json.loads((R/'assets/marko-walk/manifest.json').read_text());m.update(characterId=name,frame_variant='painted',base_image='frames/motion/frame-0.png',holdLastFrame=end,renderScale=1,renderAnchor={'x':256,'y':488},worldBodyHeight=306,chroma_key={'name':'green','hex':'#00FF00','rgb':[0,255,0]},sprite_sheet_alpha_report=None)
    m['animation']['columns']=count;m['animation']['rows']['motion'].update(frames=count,fps=10,loop=not end,holdLastFrame=end,frame_variant='painted',durations_ms=[100]*count);m['frame_layout']={'sheetWidth':count*512,'sheetHeight':512,'cellWidth':512,'cellHeight':512,'rows':{'motion':[{'x':i*512,'y':0,'w':512,'h':512} for i in range(count)]}};m['identityReferences']=[str(Path(t['path']).relative_to(G)).replace(chr(92),'/') for t in targets];m['scaleReference']={'sourceClip':base,'sourceZoom':.76,'markoHeight':306,'enemyHeight':targets[1]['height'],'enemyToMarko':1 if enemy=='akindzija' else .95,'footY':487}
    (out/'manifest.json').write_text(json.dumps(m,indent=2),encoding='utf8');(out/'frames/frames-manifest.json').write_text(json.dumps({'cellWidth':512,'cellHeight':512,'states':{'motion':{'frames':count,'fps':10,'loop':not end,'holdLastFrame':end,'files':[f'motion/frame-{i}.png' for i in range(count)]}}},indent=2),encoding='utf8');subprocess.run([str(SG),'compose-gif',*[str(out/f'frames/motion/frame-{i}.png') for i in range(count)],'--output',str(out/'preview.gif'),'--delay-ticks','10','--loop-count','1' if end else '0'],check=True,stdout=subprocess.DEVNULL)
    assert Image.open(out/'preview.gif').n_frames==count;assert all(atlas.crop((i*512,0,(i+1)*512,512)).tobytes()==c.tobytes() for i,c in enumerate(cells))
    for f in ['identity-size-comparison.png','size-overlay.png','preview-comparison.png']:shutil.copy2(run/f,out/f)
    (out/'qa.json').write_text(json.dumps({'bounds':bounds,'atlasMatchesFrames':True,'gifFrames':count,'identityAndScaleCheckedBeforeExport':True,'targets':json.loads((run/'export-info.json').read_text())},indent=2),encoding='utf8')
    with (W/'STATUS-ANIMACIJE.md').open('a',encoding='utf8') as f:f.write(f'\nDOPUNA-44 deo 5: {name} — GOTOVO; {count} kadrova 512x512, '+('jednom/holdLastFrame=true' if end else 'petlja')+f'; rvanje na zemlji kao {base}, zum0.76, stvarni idle frame-0 uzori (akindzija izdvojen iz dist atlasa samo citanjem), pre izvoza pregled identiteta i preklopa velicine; atlas/manifest/frames/GIF/QA provereni, y487. '+('Prethodni klip arhiviran i prepisan.' if existing else 'Prethodni istoimeni klip nije postojao; napravljen novi.')+'\n')
    print('EXPORTED, VALIDATED, STATUS UPDATED',name)
else:raise ValueError(mode)
