@echo off
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
  echo Za pokretanje je potreban Node.js 22 ili noviji.
  pause
  exit /b 1
)
node launch.mjs
