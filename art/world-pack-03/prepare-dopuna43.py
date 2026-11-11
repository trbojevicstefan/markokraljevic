from pathlib import Path
w=Path(__file__).resolve().parent
s=(w/'export-dopuna40.py').read_text(encoding='utf8').replace('prompts-dopuna40.json','prompts-dopuna43.json').replace('DOPUNA-40:','DOPUNA-43:')
s=s.replace("if name=='soko-let':renderScale=345/span", "if name in ('soko-let','utva-let','soko-vezirov-let'):renderScale=345/span")
s=s.replace("assetType='flying-falcon'", "assetType='flying-bird'")
(w/'export-dopuna43.py').write_text(s,encoding='utf8')
print('Prepared exporter')
