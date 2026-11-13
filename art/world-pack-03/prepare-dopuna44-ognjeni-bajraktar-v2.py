from pathlib import Path
w=Path(__file__).resolve().parent
s=(w/'prepare-dopuna44-hasan-djemo-v2.py').read_text(encoding='utf8').replace('hasan-djemo','ognjeni-bajraktar').replace("[('hasan-aga',.93),('djemo',.84)]","[('ognjeni-aga',.95),('bajraktar',.90)]")
exec(compile(s,str(__file__),'exec'))
# Export and validation are versioned sibling scripts; preserve their clip calibrations.
