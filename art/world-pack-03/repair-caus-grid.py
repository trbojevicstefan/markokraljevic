from pathlib import Path
import shutil,subprocess,sys
w=Path(__file__).resolve().parent;r=w.parent/'animation-pack-04';s=r/'sources/caus-idle';a=r/'assets/caus-idle'
assert a.resolve().is_relative_to(r.resolve()) and s.resolve().is_relative_to(r.resolve())
shutil.move(str(a),str(s/'initial-export-with-gridlines'))
raw=s/'grid.png';backup=s/'original-generated-grid.png';raw.rename(backup)
subprocess.run([sys.executable,str(w/'export-dopuna27.py'),'caus-idle',str(backup)],check=True)
