from pathlib import Path
# Run the existing seam-audit.py math on the new PNG assets without touching dist.
root=Path(__file__).resolve().parents[2]
audit=root/'seam-audit.py'
source=audit.read_text(encoding='utf8').replace("os.path.join(ROOT, 'dist', 'assets', 'world', '*.webp')","os.path.join(ROOT, 'art', 'world-pack-03', 'urvina-*.png')").replace('os.path.basename(f)[:-5]','os.path.splitext(os.path.basename(f))[0]')
exec(compile(source,str(audit),'exec'),{'__file__':str(audit),'__name__':'__main__'})
