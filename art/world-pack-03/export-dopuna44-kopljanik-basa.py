from pathlib import Path
from PIL import Image, ImageDraw
import json, shutil, subprocess, sys, time

WORLD=Path(__file__).resolve().parent
GAME=WORLD.parents[1]
ROOT=WORLD.parent/'animation-pack-04'
SG=GAME.parent/'tools/sprite-gen/.venv/Scripts/sprite-gen.exe'
JOBS={
 'kopljanik-basa-idle':(6,3,2,10,True),
 'kopljanik-basa-run':(8,4,2,10,True),
 'kopljanik-basa-attack':(6,3,2,10,False),
 'kopljanik-basa-hurt':(4,2,2,10,False),
 'kopljanik-basa-death':(6,3,2,10,False),
}
IDENT=ROOT/'assets/kopljanik-idle/frames/motion/frame-0.png'
HASAN=ROOT/'assets/hasan-aga-idle/frames/motion/frame-0.png'
MARKO=ROOT/'assets/marko-idle-2/frames/motion/frame-0.png'
def bbox(im):
 a=im.convert('RGBA').getchannel('A').point(lambda v:255 if v>16 else 0); b=a.getbbox()
 if not b: raise RuntimeError('empty alpha')
 return b
def trim(im): return im.crop(bbox(im))
def main(name,src):
 frames,cols,rows,fps,loop=JOBS[name]; ref=Image.open(IDENT).convert('RGBA'); hasan=Image.open(HASAN).convert('RGBA'); marko=Image.open(MARKO).convert('RGBA')
 refh=bbox(ref)[3]-bbox(ref)[1]; hasanh=bbox(hasan)[3]-bbox(hasan)[1]; markoh=bbox(marko)[3]-bbox(marko)[1]
 run=ROOT/'sources/dopuna44-kopljanik-basa'/name; run.mkdir(parents=True,exist_ok=True); raw=run/'grid.png'; shutil.copy2(src,raw); cut=run/'grid-alpha.png'
 subprocess.run([str(SG),'cutout',str(raw),'--out',str(cut),'--key','green','--decontam','palette'],check=True,stdout=subprocess.DEVNULL)
 grid=Image.open(cut).convert('RGBA'); pieces=[]
 for i in range(frames):
  x,y=i%cols,i//cols; pieces.append(trim(grid.crop((x*512,y*512,(x+1)*512,(y+1)*512))))
 cells=[]; scales=[]
 for p in pieces:
  s=min(refh/p.height,472/p.width); q=p.resize((max(1,round(p.width*s)),max(1,round(p.height*s))),Image.Resampling.LANCZOS); scales.append(s)
  c=Image.new('RGBA',(512,512)); c.paste(q,((512-q.width)//2,488-q.height),q); cells.append(c)
 out=ROOT/'assets'/name
 if out.exists(): shutil.move(str(out),str(run/f'previous-{time.time_ns()}'))
 (out/'frames/motion').mkdir(parents=True,exist_ok=True); ref.save(out/'reference.png')
 board=Image.new('RGBA',(2048,1024),(29,38,46,255)); d=ImageDraw.Draw(board); board.alpha_composite(ref,(0,0)); d.text((8,8),'actual kopljanik-idle frame-0',fill='white'); board.alpha_composite(cells[0],(512,0)); d.text((520,8),'new frame-0',fill='white'); board.alpha_composite(hasan,(1024,0)); d.text((1032,8),'hasan-aga-idle zoom',fill='white'); board.alpha_composite(marko,(1536,0)); d.text((1544,8),'Marko scale',fill='white'); board.save(out/'identity-size-comparison.png')
 ov=Image.new('RGBA',(1024,512)); ov.alpha_composite(hasan,(0,0)); ov.alpha_composite(cells[0],(512,0)); ov.save(out/'size-overlay.png')
 atlas=Image.new('RGBA',(frames*512,512)); qa=[]
 for i,c in enumerate(cells): c.save(out/f'frames/motion/frame-{i}.png'); atlas.paste(c,(i*512,0)); qa.append({'frame':i,'bounds':c.getchannel('A').getbbox()})
 atlas.save(out/'atlas.png')
 m=json.loads((ROOT/'assets/marko-walk/manifest.json').read_text()); m['characterId']=name; m['identityReferences']=[str(IDENT.relative_to(GAME)).replace('\\','/')]; m['animation']['columns']=frames; m['animation']['rows']['motion'].update(frames=frames,fps=fps,loop=loop,durations_ms=[1000//fps]*frames); m['frame_layout']={'cellWidth':512,'cellHeight':512,'sheetWidth':frames*512,'sheetHeight':512,'rows':{'motion':[{'x':i*512,'y':0,'w':512,'h':512} for i in range(frames)]}}; m['chroma_key']={'name':'green','hex':'#00FF00','rgb':[0,255,0]}; m['worldBodyHeight']=refh; m['renderScale']=1; m['renderAnchor']={'x':256,'y':488}; m['holdLastFrame']=not loop; m['scaleReference']={'identityIdle':str(IDENT.relative_to(GAME)).replace('\\','/'),'hasanIdle':str(HASAN.relative_to(GAME)).replace('\\','/'),'identityAlphaHeight':refh,'hasanAlphaHeight':hasanh,'markoIdleAlphaHeight':markoh,'appliedScaleMin':min(scales),'footY':487}; (out/'manifest.json').write_text(json.dumps(m,indent=2)); (out/'frames/frames-manifest.json').write_text(json.dumps({'cellWidth':512,'cellHeight':512,'states':{'motion':{'frames':frames,'fps':fps,'loop':loop,'files':[f'motion/frame-{i}.png' for i in range(frames)]}}},indent=2));
 subprocess.run([str(SG),'compose-gif',*[str(out/f'frames/motion/frame-{i}.png') for i in range(frames)],'--output',str(out/'preview.gif'),'--delay-ticks',str(100//fps),'--loop-count',('0' if loop else '1')],check=True,stdout=subprocess.DEVNULL)
 report={'clip':name,'frames':qa,'loop':loop,'identityReference':str(IDENT.relative_to(GAME)).replace('\\','/'),'hasanReference':str(HASAN.relative_to(GAME)).replace('\\','/'),'identityAlphaHeight':refh,'hasanAlphaHeight':hasanh,'markoIdleAlphaHeight':markoh,'atlasMatchesFrames':all(atlas.crop((i*512,0,(i+1)*512,512)).tobytes()==cells[i].tobytes() for i in range(frames))}; (out/'qa.json').write_text(json.dumps(report,indent=2))
 with (WORLD/'STATUS-ANIMACIJE.md').open('a',encoding='utf8') as f: f.write(f"\nDOPUNA-44 deo 6: {name} — GOTOVO; {frames} kadrova, {'petlja' if loop else 'jednom'}, identitet iz kopljanik-idle/frame-0.png, zum kao hasan-aga-idle ({hasanh}px), oslonac y=487; preklopi identiteta/velicine, atlas/GIF/manifest/QA provereni; source {str(raw.relative_to(GAME)).replace(chr(92),'/')}.\n")
 print(name,'done',frames,'identity',refh,'hasan',hasanh)
if __name__=='__main__': main(sys.argv[1],sys.argv[2])
