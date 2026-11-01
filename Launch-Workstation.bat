@echo off
title Creator Studio 2.0 Loopback Launcher
cd /d "%~dp0"
echo ========================================================
echo   Launching Creator Studio 2.0 (Loopback Edition)...
echo ========================================================
powershell.exe -ExecutionPolicy Bypass -NoProfile -File "%~dp0Launch-Workstation.ps1"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Launcher exited with error code %ERRORLEVEL%.
    pause
)
