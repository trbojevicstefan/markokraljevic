from pathlib import Path
from PIL import Image,ImageDraw
import json,shutil,subprocess,sys,time
W=Path(__file__).resolve().parent;G=W.parents[1];R=W.parent/'animation-pack-04';SG=G.parent/'tools/sprite-gen/.venv/Scripts/sprite-gen.exe'
J={'basa-hvata':'basa-idle','kopljanik-basa-hvata':'kopljanik-basa-idle','beg-hvata':'beg-idle'};MARKO=R/'assets/marko-idle-2/frames/motion/frame-0.png'
def bb(im):
 a=im.convert('RGBA').getchannel('A').point(lambda v:255 if v>16 else 0);q=a.getbbox()
 if not q:raise RuntimeError('empty alpha')
 return q
def main(name,src):
 lik=J[name]; refp=R/'assets'/lik/'frames/motion/frame-0.png'; ref=Image.open(refp).convert('RGBA');mk=Image.open(MARKO).convert('RGBA');rh=bb(ref)[3]-bb(ref)[1];mh=bb(mk)[3]-bb(mk)[1]
 run=R/'sources/dopuna44-deo3-basahvat'/name;run.mkdir(parents=True,exist_ok=True);raw=run/'grid.png';shutil.copy2(src,raw);cut=run/'grid-alpha.png';subprocess.run([str(SG),'cutout',str(raw),'--out',str(cut),'--key','green','--decontam','palette'],check=True,stdout=subprocess.DEVNULL);grid=Image.open(cut).convert('RGBA')
 pieces=[]
 for i in range(6): pieces.append(grid.crop(((i%3)*512,(i//3)*512,(i%3+1)*512,(i//3+1)*512)).crop(bb(grid.crop(((i%3)*512,(i//3)*512,(i%3+1)*512,(i//3+1)*512)))))
 cells=[]
 for p in pieces:
  s=min(rh/p.height,472/p.width);q=p.resize((max(1,round(p.width*s)),max(1,round(p.height*s))),Image.Resampling.LANCZOS);c=Image.new('RGBA',(512,512));c.paste(q,((512-q.width)//2,488-q.height),q);cells.append(c)
 out=R/'assets'/name
 if out.exists():shutil.move(str(out),str(run/f'previous-{time.time_ns()}'))
 (out/'frames/motion').mkdir(parents=True,exist_ok=True);ref.save(out/'reference.png');board=Image.new('RGBA',(1536,512),(29,38,46,255));d=ImageDraw.Draw(board);board.alpha_composite(ref,(0,0));d.text((8,8),'actual idle frame-0',fill='white');board.alpha_composite(cells[0],(512,0));d.text((520,8),'new hvat frame-0',fill='white');board.alpha_composite(mk,(1024,0));d.text((1032,8),'Marko scale',fill='white');board.save(out/'identity-size-comparison.png');ov=Image.new('RGBA',(1024,512));ov.alpha_composite(ref,(0,0));ov.alpha_composite(cells[0],(512,0));ov.save(out/'size-overlay.png')
 atlas=Image.new('RGBA',(3072,512));qa=[]
 for i,c in enumerate(cells):c.save(out/f'frames/motion/frame-{i}.png');atlas.paste(c,(i*512,0));qa.append({'frame':i,'bounds':c.getchannel('A').getbbox()})
 atlas.save(out/'atlas.png');m=json.loads((R/'assets/marko-walk/manifest.json').read_text());m['characterId']=name;m['identityReferences']=[str(refp.relative_to(G)).replace('\\','/')];m['animation']['columns']=6;m['animation']['rows']['motion'].update(frames=6,fps=10,loop=False,durations_ms=[100]*6);m['frame_layout']={'cellWidth':512,'cellHeight':512,'sheetWidth':3072,'sheetHeight':512,'rows':{'motion':[{'x':i*512,'y':0,'w':512,'h':512} for i in range(6)]}};m['chroma_key']={'name':'green','hex':'#00FF00','rgb':[0,255,0]};m['worldBodyHeight']=rh;m['renderScale']=1;m['renderAnchor']={'x':256,'y':488};m['holdLastFrame']=True;m['scaleReference']={'identityIdleReference':str(refp.relative_to(G)).replace('\\','/'),'identityIdleAlphaHeight':rh,'markoIdleAlphaHeight':mh,'footY':487};(out/'manifest.json').write_text(json.dumps(m,indent=2));(out/'frames/frames-manifest.json').write_text(json.dumps({'cellWidth':512,'cellHeight':512,'states':{'motion':{'frames':6,'fps':10,'loop':False,'files':[f'motion/frame-{i}.png' for i in range(6)]}}},indent=2));subprocess.run([str(SG),'compose-gif',*[str(out/f'frames/motion/frame-{i}.png') for i in range(6)],'--output',str(out/'preview.gif'),'--delay-ticks','10','--loop-count','1'],check=True,stdout=subprocess.DEVNULL);(out/'qa.json').write_text(json.dumps({'clip':name,'frames':qa,'identityReference':str(refp.relative_to(G)).replace('\\','/'),'identityIdleAlphaHeight':rh,'markoIdleAlphaHeight':mh,'atlasMatchesFrames':all(atlas.crop((i*512,0,(i+1)*512,512)).tobytes()==cells[i].tobytes() for i in range(6))},indent=2))
 with (W/'STATUS-ANIMACIJE.md').open('a',encoding='utf8') as f:f.write(f"\nDOPUNA-44 deo 3: {name} — GOTOVO; 6 kadrova, jednom, identitet iz {str(refp.relative_to(G)).replace(chr(92),'/')}, zum kao idle ({rh}px), oslonac y=487; preklopi identiteta/velicine, atlas/GIF/manifest/QA provereni; source {str(raw.relative_to(G)).replace(chr(92),'/')}.\n")
 print(name,'done',rh,mh)
if __name__=='__main__':main(sys.argv[1],sys.argv[2])
