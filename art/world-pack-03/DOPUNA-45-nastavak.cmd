@echo off
rem Nastavak DOPUNA-45 posle dopune kredita: Codex crta udarce -v2, tvrde klipove -v2 i protivnike (delovi 2-4).
rem Pokreni dvoklikom ili iz terminala. Radi u repozitorijumu u kom je ovaj fajl; dnevnik je u art\world-pack-03\dopuna45-codex.log.
cd /d "%~dp0\..\.."
codex exec -C "%CD%" -s workspace-write - < "art\world-pack-03\DOPUNA-45-codex-prompt.txt" > "art\world-pack-03\dopuna45-codex.log" 2>&1
echo Codex je zavrsio. Status: art\world-pack-03\STATUS-ANIMACIJE.md, dnevnik: art\world-pack-03\dopuna45-codex.log
pause
