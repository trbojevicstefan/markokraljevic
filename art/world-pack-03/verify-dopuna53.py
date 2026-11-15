"""Read-only D53 checks, matching D50 export checks and D53 registration limits."""
from pathlib import Path
import json,hashlib
import numpy as np
from PIL import Image
ROOT=Path(__file__).resolve().parents[2]
REF=ROOT/'art/world-pack-03/uzori-d53'
NAME='prop-crkva-samodreza-presek'
def read(p):
    raw=p.read_bytes();assert not raw.startswith(b'\xef\xbb\xbf');return json.loads(raw)
run=REF/NAME/'attempt-2';q=read(run/'qa.json');assert q['visualApproved'] and read(run/'review.json')['approved']
p=Image.open(REF/f'{NAME}.png').convert('RGBA');w=Image.open(ROOT/f'dist/assets/world/{NAME}.webp').convert('RGBA');f=Image.open(ROOT/'art/world-pack-03/uzori-d50/prop-crkva-samodreza.png').convert('RGBA')
assert p.size==w.size==(1024,1024)
a=np.array(p);assert a[:,:,3].min()==0 and a[:,:,3].max()==255
assert np.array_equal(a[:,:,3],np.array(w)[:,:,3])
assert p.tobytes()==Image.open(run/'prepared.png').convert('RGBA').tobytes()
bb=p.getbbox();assert list(bb)==q['bbox'] and bb[3]-1==1000
assert all(abs(x-y)<=8 for x,y in zip(bb,f.getbbox()))
m=a[:,:,3]>0;assert not(m[0].any() or m[-1].any() or m[:,0].any() or m[:,-1].any())
assert Image.open(REF/'preklop.png').convert('RGBA').tobytes()==Image.blend(f,p,.5).tobytes()
runs=list((REF/NAME).glob('attempt-*'));assert len(runs)==2 and not read(REF/NAME/'attempt-1/review.json')['approved']
for r in runs:
    for name in ['generated.png','prepared.png','prompt.txt','qa.json','review.json','preklop.png']:assert (r/name).is_file()
before=read(REF/'protected-before.json')
for path,h in before.items():assert hashlib.sha256((ROOT/path).read_bytes()).hexdigest()==h,path
current={str(p.relative_to(ROOT)).replace('\\','/') for p in (ROOT/'dist').rglob('*') if p.is_file()}
assert current=={p for p in before if p.startswith('dist/')}|{f'dist/assets/world/{NAME}.webp'}
print('PASS D53: 2 attempts; 1024 RGBA; bbox (141,131,882,1001); baseline 1000; alpha equal in WebP; 50% overlay; visual approval; protected files unchanged; only authorized dist export added.')
