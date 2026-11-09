from pathlib import Path
from PIL import Image
import sys,json,shutil,subprocess
root=Path(__file__).resolve().parent;game=root.parents[1]
sg=game.parent/'tools/sprite-gen/.venv/Scripts/sprite-gen.exe'
name,source=sys.argv[1:3]
j=next(j for j in json.loads((root/'plan-dopuna14.json').read_text())['jobs'] if j['id']==name)
out=root/'assets'/name;run=root/'sources'/name
assert not (out/'atlas.png').exists() or (j.get('sourceFile') and (run/'export-before-identity-fix').exists()), 'Existing output preserved'
run.mkdir(exist_ok=True);raw=run/j.get('sourceFile','grid.png');assert not raw.exists();shutil.copy2(source,raw)
cut=run/'grid-alpha.png'
subprocess.run([str(sg),'cutout',str(raw),'--out',str(cut),'--key','green','--decontam','palette'],check=True,stdout=subprocess.DEVNULL)
grid=Image.open(cut).convert('RGBA');pieces=[]
for i in range(j['frames']):
    x=i%j['cols'];y=i//j['cols'];im=grid.crop((x*grid.width//j['cols'],y*grid.height//j['rows'],(x+1)*grid.width//j['cols'],(y+1)*grid.height//j['rows']))
    box=im.getchannel('A').point(lambda a:255 if a>16 else 0).getbbox();assert box;pieces.append(im.crop(box))
height=j['targetHeight']
if name.startswith('azdaja-') and name!='azdaja-idle':
    ref=Image.open(game/j['reference']).convert('RGBA');b=ref.getchannel('A').getbbox();height=b[3]-b[1]
scale=min(height/max(im.height for im in pieces),500/max(im.width for im in pieces),480/max(im.height for im in pieces))
if j.get('neutralFrame') is not None:
    scale=min(height/pieces[j['neutralFrame']].height,500/max(im.width for im in pieces),480/max(im.height for im in pieces))
if j.get('staticVariants'):scale=min(397/max(im.width for im in pieces),180/max(im.height for im in pieces))
(out/'frames/motion').mkdir(parents=True,exist_ok=True);atlas=Image.new('RGBA',(512*j['frames'],512));qa=[]
for i,im in enumerate(pieces):
    im=im.resize((max(1,round(im.width*scale)),max(1,round(im.height*scale))),Image.Resampling.LANCZOS)
    cell=Image.new('RGBA',(512,512));cell.alpha_composite(im,((512-im.width)//2,488-im.height));cell.save(out/f'frames/motion/frame-{i}.png');atlas.alpha_composite(cell,(512*i,0))
    qa.append({'frame':i,'bounds':cell.getchannel('A').getbbox(),'footY':487})
atlas.save(out/'atlas.png');shutil.copy2(game/j['reference'],out/'reference.png')
m=json.loads((root/'assets/marko-walk/manifest.json').read_text());m['characterId']=name
m['animation']['columns']=j['frames'];m['animation']['rows']['motion'].update(frames=j['frames'],fps=j['fps'],loop=j['loop'],durations_ms=[round(1000/j['fps'])]*j['frames'])
layouts=[{'x':i*512,'y':0,'w':512,'h':512} for i in range(j['frames'])]
m['frame_layout'].update(sheetWidth=512*j['frames'],sheetHeight=512,rows={'motion':layouts})
m['scaleReference']={'referenceHeight':j['referenceHeight'],'actualMaxHeight':max(q['bounds'][3]-q['bounds'][1] for q in qa),'footY':487,'uniformScale':scale}
m['sprite_sheet_alpha_report']=None
if j.get('impactFrame') is not None:
    m['impactFrame']=j['impactFrame'];m['impactFrameOneBased']=j['impactFrame']+1
if j.get('staticVariants'):m['assetType']='static-variants';m['variantNames']=['janicar','oklopnik','strelac','bez-lobanje'];m['scaleReference']['maxLength']=397
if j.get('worldHeight'):
    bodyHeight=qa[0]['bounds'][3]-qa[0]['bounds'][1];m['renderScale']=906/bodyHeight;m['worldBodyHeight']=906;m['renderAnchor']={'x':256,'y':488};m['renderNote']='Apply renderScale to 512px cells for dragon roughly twice Musa height; pin renderAnchor to ground.'
(out/'manifest.json').write_text(json.dumps(m,indent=2));(out/'qa.json').write_text(json.dumps({'frames':qa,'loop':j['loop'],'scale':scale},indent=2));(out/'frames/frames-manifest.json').write_text(json.dumps({'cellWidth':512,'cellHeight':512,'states':{'motion':{'frames':j['frames'],'fps':j['fps'],'loop':j['loop'],'files':[f'motion/frame-{i}.png' for i in range(j['frames'])]}}},indent=2))
subprocess.run([str(sg),'compose-gif',*[str(out/f'frames/motion/frame-{i}.png') for i in range(j['frames'])],'--output',str(out/'preview.gif'),'--delay-ticks',str(round(100/j['fps'])),'--loop-count','0'],check=True,stdout=subprocess.DEVNULL)
assert Image.open(out/'preview.gif').n_frames==j['frames']
assert all(q['bounds'][3]==488 for q in qa)
with (root.parent/'world-pack-03/STATUS-ANIMACIJE.md').open('a',encoding='utf8') as f:
    f.write('\nDOPUNA-14: '+name+' — GOTOVO; '+str(j['frames'])+(' staticke varijante' if j.get('staticVariants') else ' kadrova')+'; atlas, manifest sa frame_layout, frames, preview.gif i qa.json u animation-pack-04/assets/'+name+'/. 512x512, alfa, oslonac y487 provereni. Prompt: plan-dopuna14.json.'+(' Za velicinu azdaje koristiti renderScale i renderAnchor iz manifesta (svetska visina 906px).' if j.get('worldHeight') else '')+'\n')
print('Delivered and logged:',name,j['frames'])
