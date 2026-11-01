@echo off
title Stop Creator Studio 2.0
powershell.exe -ExecutionPolicy Bypass -NoProfile -File "%~dp0Stop-Workstation.ps1"
echo.
pause
