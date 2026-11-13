from pathlib import Path
from PIL import Image, ImageDraw, ImageChops
import json, shutil, subprocess, sys, time

WORLD = Path(__file__).resolve().parent
ROOT = WORLD.parent / 'animation-pack-04'
GAME = WORLD.parents[1]
SG = GAME.parent / 'tools/sprite-gen/.venv/Scripts/sprite-gen.exe'
MARKO_REF = ROOT / 'assets/marko-idle-2/frames/motion/frame-0.png'

JOBS = {
 'hasan-aga-hvata': ('hasan-aga', 0.93),
 'ognjeni-aga-hvata': ('ognjeni-aga', 0.95),
 'lovac-aga-hvata': ('lovac-aga', 0.77),
 'bajraktar-hvata': ('bajraktar', 0.90),
 'janicarski-aga-hvata': ('janicarski-aga', 0.83),
 'djemo-hvata': ('djemo', 0.84),
 'dzelat-hvata': ('dzelat', 0.80),
 'arapin-hvata': ('arapin', 0.85),
}

def alpha_height(p):
    b = p.convert('RGBA').getchannel('A').point(lambda v: 255 if v > 16 else 0).getbbox()
    if not b: raise RuntimeError(f'no alpha in {p}')
    return b[3]-b[1], b

def trim(p):
    a = p.getchannel('A').point(lambda v: 255 if v > 16 else 0)
    b = a.getbbox()
    if not b: raise RuntimeError('empty frame')
    return p.crop(b)

def place(p, target_h):
    p = trim(p)
    s = target_h / p.height
    p = p.resize((max(1, round(p.width*s)), target_h), Image.Resampling.LANCZOS)
    c = Image.new('RGBA',(512,512),(0,0,0,0))
    c.paste(p,((512-p.width)//2,488-p.height),p)
    return c

def main(name, source):
    if name not in JOBS: raise SystemExit(f'unknown job {name}')
    lik, factor = JOBS[name]
    ref_path = ROOT / 'assets' / f'{lik}-idle/frames/motion/frame-0.png'
    marko_path = MARKO_REF
    ref = Image.open(ref_path).convert('RGBA')
    marko = Image.open(marko_path).convert('RGBA')
    marko_h, _ = alpha_height(marko)
    idle_h, idle_b = alpha_height(ref)
    target_h = round(idle_h * factor)

    run = ROOT / 'sources' / 'dopuna44-deo3-v2' / name
    run.mkdir(parents=True, exist_ok=True)
    raw = run / 'grid.png'
    if raw.exists(): raw.unlink()
    shutil.copy2(source, raw)
    cut = run / 'grid-alpha.png'
    subprocess.run([str(SG),'cutout',str(raw),'--out',str(cut),'--key','green','--decontam','palette'],check=True,stdout=subprocess.DEVNULL)
    grid = Image.open(cut).convert('RGBA')
    if grid.width < 1536 or grid.height < 1024: raise RuntimeError(f'expected 3x2 1536x1024, got {grid.size}')
    pieces=[]
    for i in range(6):
        x,y=i%3,i//3
        cell=grid.crop((x*512,y*512,(x+1)*512,(y+1)*512))
        # Generated sheet puts the featured enemy on the left and Marko on the right.
        # Keep only the enemy side to prevent the partner from becoming part of the clip.
        enemy=cell.crop((0,0,322,512))
        pieces.append(trim(enemy))
    cells=[place(p,target_h) for p in pieces]

    out = ROOT / 'assets' / name
    if out.exists():
        archive = run / f'previous-{time.time_ns()}'
        shutil.move(str(out),str(archive))
    (out/'frames/motion').mkdir(parents=True,exist_ok=True)
    ref.save(out/'reference.png')
    (out/'identity-size-comparison.png').save if False else None
    board=Image.new('RGBA',(2048,1024),(29,38,46,255)); d=ImageDraw.Draw(board)
    board.alpha_composite(ref.resize((512,512)),(0,0)); d.text((8,8),'actual idle frame-0',fill='white')
    board.alpha_composite(cells[0],(512,0)); d.text((520,8),'new hvat frame-0',fill='white')
    board.alpha_composite(marko.resize((512,512)),(1024,0)); d.text((1032,8),'Marko idle scale',fill='white')
    board.save(out/'identity-size-comparison.png')
    overlay=Image.new('RGBA',(1024,512),(0,0,0,0)); overlay.alpha_composite(ref.resize((512,512)),(0,0)); overlay.alpha_composite(cells[0],(512,0)); overlay.save(out/'size-overlay.png')
    atlas=Image.new('RGBA',(3072,512)); qa=[]
    for i,c in enumerate(cells):
        c.save(out/f'frames/motion/frame-{i}.png'); atlas.paste(c,(i*512,0)); qa.append({'frame':i,'bounds':c.getchannel('A').getbbox()})
    atlas.save(out/'atlas.png')
    m=json.loads((ROOT/'assets/marko-walk/manifest.json').read_text(encoding='utf-8'))
    m['characterId']=name; m['identityReferences']=[str(ref_path.relative_to(GAME)).replace('\\','/')]
    m['animation']['columns']=6; m['animation']['rows']['motion'].update(frames=6,fps=10,loop=False,durations_ms=[100]*6)
    m['frame_layout']={'cellWidth':512,'cellHeight':512,'sheetWidth':3072,'sheetHeight':512,'rows':{'motion':[{'x':i*512,'y':0,'w':512,'h':512} for i in range(6)]}}
    m['chroma_key']={'name':'green','hex':'#00FF00','rgb':[0,255,0]}; m['worldBodyHeight']=target_h; m['renderAnchor']={'x':256,'y':488}; m['renderScale']=1
    m['scaleReference']={'idleReference':str(ref_path.relative_to(GAME)).replace('\\','/'),'idleAlphaHeight':idle_h,'factorFromBrief':factor,'targetHeight':target_h,'markoIdleAlphaHeight':marko_h,'footY':487}
    m['holdLastFrame']=True
    (out/'manifest.json').write_text(json.dumps(m,indent=2),encoding='utf-8')
    (out/'frames/frames-manifest.json').write_text(json.dumps({'cellWidth':512,'cellHeight':512,'states':{'motion':{'frames':6,'fps':10,'loop':False,'files':[f'motion/frame-{i}.png' for i in range(6)]}}},indent=2),encoding='utf-8')
    subprocess.run([str(SG),'compose-gif',*[str(out/f'frames/motion/frame-{i}.png') for i in range(6)],'--output',str(out/'preview.gif'),'--delay-ticks','10','--loop-count','1'],check=True,stdout=subprocess.DEVNULL)
    report={'clip':name,'reference':str(ref_path.relative_to(GAME)).replace('\\','/'),'markoReference':str(MARKO_REF.relative_to(GAME)).replace('\\','/'),'frames':qa,'actualIdleAlphaHeight':idle_h,'targetHeight':target_h,'markoIdleAlphaHeight':marko_h,'factor':factor,'identityOverlay':'identity-size-comparison.png','sizeOverlay':'size-overlay.png','atlasMatchesFrames':all(atlas.crop((i*512,0,(i+1)*512,512)).tobytes()==cells[i].tobytes() for i in range(6))}
    (out/'qa.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
    with (WORLD/'STATUS-ANIMACIJE.md').open('a',encoding='utf-8') as f:
        f.write(f"\nDOPUNA-44 deo 3 v2: {name} — GOTOVO; 6 kadrova, isti stvarni idle uzor ({lik}), ciljna visina {target_h}px prema faktoru {factor}, Marko idle visina {marko_h}px, preklop identiteta i veličine u identity-size-comparison.png/size-overlay.png, atlas/GIF/manifest/QA provereni; source: {str(raw.relative_to(GAME)).replace(chr(92),'/')}.\n")
    print(name, 'done', target_h, 'idle', idle_h, 'marko', marko_h)

if __name__=='__main__': main(sys.argv[1],sys.argv[2])
