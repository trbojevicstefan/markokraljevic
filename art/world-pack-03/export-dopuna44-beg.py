from pathlib import Path
from PIL import Image,ImageDraw
import json,shutil,subprocess,sys,time
W=Path(__file__).resolve().parent; G=W.parents[1]; R=W.parent/'animation-pack-04'; SG=G.parent/'tools/sprite-gen/.venv/Scripts/sprite-gen.exe'
J={'beg-idle':(6,3,2,True),'beg-run':(8,4,2,True),'beg-attack':(6,3,2,False),'beg-hurt':(4,2,2,False),'beg-death':(6,3,2,False)}
IDENT=R/'assets/beg-mounted/frames/motion/frame-0.png'; HASAN=R/'assets/hasan-aga-idle/frames/motion/frame-0.png'; MARKO=R/'assets/marko-idle-2/frames/motion/frame-0.png'
def b(im):
 a=im.convert('RGBA').getchannel('A').point(lambda v:255 if v>16 else 0); q=a.getbbox()
 if not q: raise RuntimeError('empty alpha')
 return q
def trim(im): return im.crop(b(im))
def main(name,src):
 n,cols,rows,loop=J[name]; ref=Image.open(IDENT).convert('RGBA'); has=Image.open(HASAN).convert('RGBA'); mk=Image.open(MARKO).convert('RGBA'); rh=b(has)[3]-b(has)[1]; mh=b(mk)[3]-b(mk)[1]
 run=R/'sources/dopuna44-beg'/name; run.mkdir(parents=True,exist_ok=True); raw=run/'grid.png'; shutil.copy2(src,raw); cut=run/'grid-alpha.png'; subprocess.run([str(SG),'cutout',str(raw),'--out',str(cut),'--key','green','--decontam','palette'],check=True,stdout=subprocess.DEVNULL); grid=Image.open(cut).convert('RGBA')
 pieces=[trim(grid.crop(((i%cols)*512,(i//cols)*512,((i%cols)+1)*512,((i//cols)+1)*512))) for i in range(n)]; cells=[]; scales=[]
 for p in pieces:
  s=min(rh/p.height,472/p.width); scales.append(s); q=p.resize((max(1,round(p.width*s)),max(1,round(p.height*s))),Image.Resampling.LANCZOS); c=Image.new('RGBA',(512,512)); c.paste(q,((512-q.width)//2,488-q.height),q); cells.append(c)
 out=R/'assets'/name
 if out.exists(): shutil.move(str(out),str(run/f'previous-{time.time_ns()}'))
 (out/'frames/motion').mkdir(parents=True,exist_ok=True); ref.save(out/'reference.png'); board=Image.new('RGBA',(2048,1024),(29,38,46,255)); d=ImageDraw.Draw(board); board.alpha_composite(ref,(0,0)); d.text((8,8),'beg-mounted frame-0',fill='white'); board.alpha_composite(cells[0],(512,0)); d.text((520,8),'new frame-0',fill='white'); board.alpha_composite(has,(1024,0)); d.text((1032,8),'hasan zoom',fill='white'); board.alpha_composite(mk,(1536,0)); d.text((1544,8),'Marko scale',fill='white'); board.save(out/'identity-size-comparison.png'); ov=Image.new('RGBA',(1024,512)); ov.alpha_composite(has,(0,0)); ov.alpha_composite(cells[0],(512,0)); ov.save(out/'size-overlay.png')
 atlas=Image.new('RGBA',(n*512,512)); qa=[]
 for i,c in enumerate(cells): c.save(out/f'frames/motion/frame-{i}.png'); atlas.paste(c,(i*512,0)); qa.append({'frame':i,'bounds':c.getchannel('A').getbbox()})
 atlas.save(out/'atlas.png'); m=json.loads((R/'assets/marko-walk/manifest.json').read_text()); m['characterId']=name; m['identityReferences']=[str(IDENT.relative_to(G)).replace('\\','/')]; m['animation']['columns']=n; m['animation']['rows']['motion'].update(frames=n,fps=10,loop=loop,durations_ms=[100]*n); m['frame_layout']={'cellWidth':512,'cellHeight':512,'sheetWidth':n*512,'sheetHeight':512,'rows':{'motion':[{'x':i*512,'y':0,'w':512,'h':512} for i in range(n)]}}; m['chroma_key']={'name':'green','hex':'#00FF00','rgb':[0,255,0]}; m['worldBodyHeight']=rh; m['renderScale']=1; m['renderAnchor']={'x':256,'y':488}; m['holdLastFrame']=not loop; m['scaleReference']={'identityReference':str(IDENT.relative_to(G)).replace('\\','/'),'hasanIdleReference':str(HASAN.relative_to(G)).replace('\\','/'),'hasanIdleAlphaHeight':rh,'markoIdleAlphaHeight':mh,'footY':487,'appliedScaleMin':min(scales)}; (out/'manifest.json').write_text(json.dumps(m,indent=2)); (out/'frames/frames-manifest.json').write_text(json.dumps({'cellWidth':512,'cellHeight':512,'states':{'motion':{'frames':n,'fps':10,'loop':loop,'files':[f'motion/frame-{i}.png' for i in range(n)]}}},indent=2)); subprocess.run([str(SG),'compose-gif',*[str(out/f'frames/motion/frame-{i}.png') for i in range(n)],'--output',str(out/'preview.gif'),'--delay-ticks','10','--loop-count',('0' if loop else '1')],check=True,stdout=subprocess.DEVNULL); (out/'qa.json').write_text(json.dumps({'clip':name,'frames':qa,'identityReference':str(IDENT.relative_to(G)).replace('\\','/'),'hasanIdleAlphaHeight':rh,'markoIdleAlphaHeight':mh,'atlasMatchesFrames':all(atlas.crop((i*512,0,(i+1)*512,512)).tobytes()==cells[i].tobytes() for i in range(n))},indent=2));
 with (W/'STATUS-ANIMACIJE.md').open('a',encoding='utf8') as f: f.write(f"\nDOPUNA-44 deo 6: {name} — GOTOVO; {n} kadrova, {'petlja' if loop else 'jednom'}, identitet iz beg-mounted/frame-0.png, zum kao hasan-aga-idle ({rh}px), oslonac y=487; preklopi identiteta/velicine, atlas/GIF/manifest/QA provereni; source {str(raw.relative_to(G)).replace(chr(92),'/')}.\n")
 print(name,'done',n,'hasan',rh,'marko',mh)
if __name__=='__main__': main(sys.argv[1],sys.argv[2])
