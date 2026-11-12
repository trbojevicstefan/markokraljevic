"""Put a whole biome into the GPU worker's queue with the strengths found on Podgrađe:
sky/back wall 0.66, outdoor and interior layers 0.76-0.78 (two seeds for far/mid/near), materials 0.86, props 0.78.
    python tools/realisticno_queue.py <biome> <NN>"""
import json, os, subprocess, sys
b, nn = sys.argv[1], sys.argv[2]
PY = sys.executable
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
plan = [('sky,in-back', '1', '0.66'), ('far,mid,near', '1,2', '0.76'), ('in-far,in-mid,in-near', '1', '0.78'),
        ('materials', '1', None), ('props', '1', None)]
jobs = []
for keys, seeds, st in plan:
    cmd = [PY, os.path.join(root, 'tools', 'realisticno.py'), 'jobs', b, keys, '--seeds', seeds] + (['--strength', st] if st else [])
    subprocess.run(cmd, check=True, cwd=root, capture_output=True)
    jobs += json.load(open(os.path.join(root, 'art', 'realisticno', b, 'jobs.json'), encoding='utf-8'))
json.dump(jobs, open(os.path.join(root, 'art', 'realisticno', b, 'jobs.json'), 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
q = os.path.join(root, 'art', 'realisticno', 'queue', f'{nn}_{b}.json')
json.dump(jobs, open(q, 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
print(q, len(jobs), 'jobs', sum(len(j['seeds']) for j in jobs), 'images')
