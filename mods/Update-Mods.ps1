<#
.SYNOPSIS
    Creator Studio - Rapid Mod Registry Compiler
.DESCRIPTION
    Scans the mods/ directory and updates the mod registry inside start.html
    without re-running the entire suite build.
#>

$nodeCmd = Get-Command node -ErrorAction SilentlyContinue
$nodePath = if ($nodeCmd) { 
    $nodeCmd.Source 
} elseif (Test-Path "C:\Program Files\Adobe\Adobe Photoshop 2024\node.exe") { 
    "C:\Program Files\Adobe\Adobe Photoshop 2024\node.exe"
} else {
    $found = Get-ChildItem -Path "C:\Program Files", "$env:LOCALAPPDATA" -Filter node.exe -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($found) { $found.FullName } else { $null }
}

if (-not $nodePath) {
    Write-Error "Could not find a valid node.exe runtime on this system."
    exit 1
}

$rootDir = Split-Path $PSScriptRoot -Parent
Write-Host "Compiling workstation mods with Node: $nodePath" -ForegroundColor Cyan
& "$nodePath" "$rootDir\build_suite.js" --mods-only
