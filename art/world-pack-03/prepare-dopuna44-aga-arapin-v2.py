from pathlib import Path
w=Path(__file__).resolve().parent
s=(w/'prepare-dopuna44-hasan-djemo-v2.py').read_text(encoding='utf8').replace('hasan-djemo','aga-arapin').replace("[('hasan-aga',.93),('djemo',.84)]","[('janicarski-aga',.83),('arapin',.85)]")
exec(compile(s,str(__file__),'exec'))
export=w/'export-dopuna44-aga-arapin-v2.py'
if not export.exists():
 s=(w/'export-dopuna44-ognjeni-bajraktar-v2.py').read_text(encoding='utf8').replace('ognjeni-bajraktar','aga-arapin')
 s=s.replace("enemy='ognjeni-aga' if 'ognjeni' in name else 'bajraktar'", "enemy='arapin' if 'arapin' in name else 'janicarski-aga'")
 s=s.replace(".95 if enemy=='ognjeni-aga' else .90", ".85 if enemy=='arapin' else .83")
 s=s.replace('0.95 if enemy=="ognjeni-aga" else 0.90','0.85 if enemy=="arapin" else 0.83')
 s=s.replace("poseCorrections={'kostac-ognjeni-kraj':{5:.87},'kostac-bajraktar-kraj':{5:.89}}", "poseCorrections={}")
 export.write_text(s,encoding='utf8')
 s=(w/'validate-dopuna44-ognjeni-bajraktar-v2.py').read_text(encoding='utf8').replace('ognjeni-bajraktar','aga-arapin').replace('kostac-ognjeni','kostac-aga').replace('kostac-bajraktar','kostac-arapin')
 (w/'validate-dopuna44-aga-arapin-v2.py').write_text(s,encoding='utf8')
