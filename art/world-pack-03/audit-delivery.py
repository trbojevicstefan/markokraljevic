from pathlib import Path
from PIL import Image
import numpy as np,json
ROOT=Path(__file__).resolve().parent;ANIM=ROOT.parent/'animation-pack-04'
catalog=json.loads((ROOT/'catalog.json').read_text(encoding='utf8'))['images']
assert len({e['id'] for e in catalog})==len(catalog)
for e in catalog:
    p=ROOT/e['file'];assert p.exists(),str(p)
    im=Image.open(p).convert('RGBA');assert list(im.size)==e['size'] and im.getchannel('A').getbbox(),e['id']
for id in ['zid-kamen','zid-stena','zid-drvo','zid-cigla']:
    a=np.array(Image.open(ROOT/(id+'.png')).convert('RGBA')).astype(float)
    assert a.shape==(512,512,4) and (a[:,:,3]==255).all()
    assert abs(a[:,0]-a[:,-1]).mean()<6 and abs(a[0]-a[-1]).mean()<6
a=np.array(Image.open(ROOT/'lestve.png').convert('RGBA'));assert a.shape==(1024,256,4) and np.array_equal(a[0],a[-1])
assert all(np.array_equal(a[:128],a[y:y+128]) for y in range(128,1024,128))
t=next(e for e in catalog if e['id']=='kula-strazara');assert all(k in t for k in ['deckY','deckX0','deckX1'])
clips=json.loads((ANIM/'catalog.json').read_text());plans={}
for p in ANIM.glob('plan-g*.json'):plans.update({j['id']:j for j in json.loads(p.read_text(encoding='utf8'))['jobs']})
group2=[c for c in clips if c['group']==2];assert len(group2)==9 and sum(c['frames'] for c in group2)==56
for c in clips:
    folder=ANIM/'assets'/c['id'];frames=list((folder/'frames/motion').glob('frame-*.png'));assert len(frames)==c['frames']
    for p in frames:
        im=Image.open(p).convert('RGBA');assert im.size==tuple(plans[c['id']]['cell']) and im.getchannel('A').getbbox()[3]==488,str(p)
    assert Image.open(folder/'preview.gif').n_frames==c['frames'],c['id']
world_done=[e['id'] for e in catalog if e['kind'] not in ['preview','animation-frame','animation-atlas','animation-reference']]
assert len([e for e in catalog if e.get('group')==1 and e['kind']!='preview'])==27
missing3=[j['id'] for j in json.loads((ROOT/'plan-g3.json').read_text(encoding='utf8'))['jobs'] if not (ROOT/(j['id']+'.png')).exists()]
missing_clips={g:[j['id'] for j in plans.values() if j['group']==g and not (ANIM/'assets'/j['id']/'atlas.png').exists()] for g in [3,4,5]}
missing5=[j['id'] for j in json.loads((ROOT/'plan-g5.json').read_text(encoding='utf8'))['jobs'] if not (ROOT/(j['id']+'.png')).exists()]
bases=json.loads((ANIM/'base-requests.json').read_text(encoding='utf8'))['jobs'];missing_bases=[j['id'] for j in bases if not (ANIM/'assets'/j['id']/'base-source.png').exists()]
g3ready=sum(e.get('group')==3 and e['kind'] in ['background','ground','ground-end','object'] for e in catalog)
report={'worldAssetsReady':len(world_done),'catalogImages':len(catalog),'readyClips':len(clips),'readyFrames':sum(c['frames'] for c in clips),'group1':'complete','group2':'complete','group3WorldReady':g3ready,'group3MissingObjects':missing3,'group3MissingClips':missing_clips[3],'group4':'complete' if not missing_bases and not missing_clips[4] else 'pending: quota reached','group4MissingBases':missing_bases,'group4MissingClips':missing_clips[4],'group5':'complete' if not missing5 and not missing_clips[5] else 'pending: quota reached','group5MissingImages':missing5,'group5MissingClips':missing_clips[5],'quotaResetBelgrade':None if not any(missing_clips.values()) and not missing3 and not missing5 else '2026-11-08T22:00:49+01:00','checksPassed':['catalog files and bounds','tile XY joins','ladder vertical join and 128px repetition','tower deck fields','animation frame counts and requested cells','feet y=487','GIF frame counts']}
(ROOT/'DELIVERY.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps(report,ensure_ascii=False))
