from pathlib import Path
w=Path(__file__).resolve().parent
s=(w/'export-dopuna43.py').read_text(encoding='utf8').replace('prompts-dopuna43.json','prompts-dopuna43-ljudi.json').replace('DOPUNA-43:','DOPUNA-43 ljudi:')
(w/'export-dopuna43-ljudi.py').write_text(s,encoding='utf8')
