@echo off
rem Nastavak crtanja posle obnove Codex kredita: tri odbijena crteža ponovo (kolut, zakucavanje, vrač nestaje), pa vrač umire, šarka i Ala (DOPUNA-45 deo 4).
rem Pokreni dvoklikom ili iz terminala. Radi u repozitorijumu u kom je ovaj fajl; dnevnik je u art\world-pack-03\codex-nastavak.log.
cd /d "%~dp0\..\.."
codex exec -C "%CD%" -s workspace-write - < "art\world-pack-03\codex-nastavak-prompt.txt" > "art\world-pack-03\codex-nastavak.log" 2>&1
echo Codex je zavrsio. Status: art\world-pack-03\STATUS-ANIMACIJE.md, dnevnik: art\world-pack-03\codex-nastavak.log
pause
