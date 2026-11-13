from pathlib import Path
w=Path(__file__).resolve().parent
s=(w/'export-dopuna43.py').read_text(encoding='utf8')
s=s.replace('prompts-dopuna43.json','prompts-dopuna44-deo6.json').replace('DOPUNA-43:', 'DOPUNA-44 deo 6:')
s=s.replace("'magenta'", "'green'").replace("'name':'magenta','hex':'#FF00FF','rgb':[255,0,255]", "'name':'green','hex':'#00FF00','rgb':[0,255,0]")
(w/'export-dopuna44-deo6.py').write_text(s,encoding='utf8')
print('Prepared exporter')
