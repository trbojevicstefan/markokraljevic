from pathlib import Path
from PIL import Image
import json, shutil, subprocess, sys

WORLD = Path(__file__).resolve().parent
ROOT = WORLD.parent / 'animation-pack-04'
GAME = WORLD.parents[1]
SG = GAME.parent / 'tools/sprite-gen/.venv/Scripts/sprite-gen.exe'

SPECS = {
    'moc-krilo': ('Sokolovo krilo', '#f4ead2'),
    'moc-lanac': ('Ravijojlin lanac', '#9fe8ff'),
    'moc-oko': ('Vilinsko oko', '#c3b2ff'),
    'moc-trag': ('Vilin trag', '#8fffe0'),
    'moc-potres': ('Potres', '#ffcf6a'),
    'moc-nalet': ('Juriš u vazduhu', '#ffcf6a'),
    'moc-kombo': ('Vazdušni kombo', '#ffb86a'),
    'moc-gaz': ('Šarčev gaz', '#ffe9c0'),
    'moc-zidotrk': ('Trk po zidu', '#ffd27a'),
}

def trim(im):
    a = im.getchannel('A').point(lambda v: 255 if v > 16 else 0)
    b = a.getbbox()
    if not b:
        raise RuntimeError('empty frame')
    return im.crop(b)

def components(im):
    # Connected-component count on alpha, 8-neighbor, for QA only.
    a = im.getchannel('A').point(lambda v: 1 if v > 16 else 0)
    px = a.load(); seen=set(); count=0
    for y in range(a.height):
        for x in range(a.width):
            if not px[x,y] or (x,y) in seen: continue
            count += 1; stack=[(x,y)]; seen.add((x,y))
            while stack:
                cx,cy=stack.pop()
                for nx in range(max(0,cx-1), min(a.width,cx+2)):
                    for ny in range(max(0,cy-1), min(a.height,cy+2)):
                        if px[nx,ny] and (nx,ny) not in seen:
                            seen.add((nx,ny)); stack.append((nx,ny))
    return count

def main(name, source):
    if name not in SPECS: raise SystemExit(f'unknown clip: {name}')
    run = ROOT / 'sources' / name
    run.mkdir(parents=True, exist_ok=True)
    raw = run / 'grid.png'; shutil.copy2(source, raw)
    cut = run / 'grid-alpha.png'
    subprocess.run([str(SG), 'cutout', str(raw), '--out', str(cut), '--key', 'green', '--decontam', 'palette'], check=True)
    grid = Image.open(cut).convert('RGBA')
    if grid.width < 4 or grid.height < 2 or grid.width / grid.height < 1.8 or grid.width / grid.height > 2.2:
        raise RuntimeError(f'expected a 4x2 grid, got {grid.size}')
    pieces=[]
    for i in range(8):
        x,y=i%4,i//4
        cell=grid.crop((x*grid.width//4, y*grid.height//2, (x+1)*grid.width//4, (y+1)*grid.height//2))
        pieces.append(trim(cell))
    maxw=max(p.width for p in pieces); maxh=max(p.height for p in pieces)
    scale=min(300/maxw, 300/maxh)
    cells=[]; qa=[]
    for i,p in enumerate(pieces):
        p=p.resize((max(1,round(p.width*scale)), max(1,round(p.height*scale))), Image.Resampling.LANCZOS)
        c=Image.new('RGBA',(512,512),(0,0,0,0))
        c.alpha_composite(p, ((512-p.width)//2, (512-p.height)//2))
        b=c.getchannel('A').point(lambda v:255 if v>16 else 0).getbbox()
        if not b or b[0] <= 0 or b[1] <= 0 or b[2] >= 512 or b[3] >= 512:
            raise RuntimeError(f'frame {i} touches edge or is empty: {b}')
        qa.append({'frame':i,'bbox':list(b),'touchesEdge':False,'components':components(c)})
        allowed = range(1, 33) if name in ('moc-lanac', 'moc-trag', 'moc-potres', 'moc-nalet', 'moc-kombo', 'moc-gaz') else (1,)
        if qa[-1]['components'] not in allowed: raise RuntimeError(f'frame {i} has {qa[-1]["components"]} components')
        cells.append(c)
    out=ROOT/'assets'/name
    (out/'frames/motion').mkdir(parents=True, exist_ok=True)
    atlas=Image.new('RGBA',(4096,512),(0,0,0,0))
    for i,c in enumerate(cells):
        c.save(out/f'frames/motion/frame-{i}.png'); atlas.alpha_composite(c,(i*512,0))
    atlas.save(out/'atlas.png')
    ref=ROOT/'assets/marko-idle-2/frames/motion/frame-0.png'
    if ref.exists(): Image.open(ref).convert('RGBA').save(out/'reference.png')
    manifest={
        'characterId':name,'assetType':'power-symbol','description':SPECS[name][0],
        'animation':{'columns':8,'rows':{'motion':{'frames':8,'fps':12,'loop':True,'durations_ms':[83]*8}}},
        'frame_layout':{'cellWidth':512,'cellHeight':512,'sheetWidth':4096,'sheetHeight':512,
                        'rows':{'motion':[{'x':i*512,'y':0,'w':512,'h':512} for i in range(8)]}},
        'chroma_key':{'name':'green','hex':'#00FF00','rgb':[0,255,0]},
        'renderAnchor':{'x':256,'y':256},'renderScale':1,
        'loop':True,'holdLastFrame':False,'powerGlow':SPECS[name][1],
    }
    (out/'manifest.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False),encoding='utf-8')
    (out/'frames/frames-manifest.json').write_text(json.dumps({'cellWidth':512,'cellHeight':512,'states':{'motion':{'frames':8,'fps':12,'loop':True,'files':[f'motion/frame-{i}.png' for i in range(8)]}}},indent=2,ensure_ascii=False),encoding='utf-8')
    subprocess.run([str(SG),'compose-gif',*[str(out/f'frames/motion/frame-{i}.png') for i in range(8)],'--output',str(out/'preview.gif'),'--delay-ticks','8','--loop-count','0'],check=True)
    qa_report={'clip':name,'frames':qa,'loop':True,'holdLastFrame':False,'atlasMatchesFrames':all(atlas.crop((i*512,0,(i+1)*512,512)).tobytes()==cells[i].tobytes() for i in range(8))}
    (out/'qa.json').write_text(json.dumps(qa_report,indent=2,ensure_ascii=False),encoding='utf-8')
    print(json.dumps({'clip':name,'source':str(raw),'out':str(out),'qa':qa_report},ensure_ascii=False))

if __name__=='__main__': main(sys.argv[1],sys.argv[2])
