from pathlib import Path
import hashlib,json,sys
R=Path(__file__).resolve().parent;A=R.parent/'animation-pack-04';G=R.parents[1]
record=R/'sources/pre-dopuna3-hashes.json'
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
if sys.argv[1]=='snapshot':
    if record.exists():raise FileExistsError('Keep original preservation snapshot')
    paths=list(R.glob('*.png'))+list((A/'assets').rglob('*.png'))+list((A/'assets').rglob('*.gif'))+list(A.glob('preview*.png'))
    record.write_text(json.dumps({p.relative_to(G).as_posix():digest(p) for p in paths},indent=2),encoding='utf8')
    print('Preserved-image snapshot:',len(paths))
else:
    old=json.loads(record.read_text(encoding='utf8'));changed=[p for p,h in old.items() if not (G/p).exists() or digest(G/p)!=h]
    result={'checkedImages':len(old),'unchanged':not changed,'changed':changed}
    (R/'preservation-check.json').write_text(json.dumps(result,indent=2),encoding='utf8');print(json.dumps(result));assert not changed
