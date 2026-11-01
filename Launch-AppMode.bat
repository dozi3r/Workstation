@echo off
title Creator Studio 2.0 (App Window Mode)
cd /d "%~dp0"
echo ========================================================
echo   Launching Creator Studio 2.0 in Desktop App Mode...
echo ========================================================
powershell.exe -ExecutionPolicy Bypass -NoProfile -File "%~dp0Launch-Workstation.ps1" -AppMode
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Launcher exited with error code %ERRORLEVEL%.
    pause
)
