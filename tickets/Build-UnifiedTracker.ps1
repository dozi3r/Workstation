<#
.SYNOPSIS
    Unified Master Ticket Tracker - Asset & Backlog Compiler
.DESCRIPTION
    Compiles all creative writing tickets, Tier 0 substratum tickets, and platform architecture tickets
    into a normalized master ticket database and offline interactive command center.
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

Write-Host "Compiling Unified Master Ticket Tracker with Node: $nodePath" -ForegroundColor Cyan
& "$nodePath" "$PSScriptRoot\build_unified_tracker.js"
