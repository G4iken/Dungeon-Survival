@echo off
title AI Dungeon Survival
cd /d "%~dp0"
echo ======================================
echo   AI Dungeon Survival - Windows Runner
echo ======================================
where node >nul 2>nul
if %errorlevel% neq 0 (
  echo Node.js is not installed. Please install Node.js LTS from https://nodejs.org/
  pause
  exit /b 1
)
if not exist node_modules (
  echo Installing dependencies...
  call npm install
  if %errorlevel% neq 0 (
    echo Failed to install dependencies.
    pause
    exit /b 1
  )
)
echo Starting development server...
call npm run dev
pause
