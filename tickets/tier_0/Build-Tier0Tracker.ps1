<#
.SYNOPSIS
    Tier 0 Baseline Settlement Substratum - Dedicated Project Visualizer Compiler
.DESCRIPTION
    Compiles all research notes from tickets/tier_0/notes/ and domain tickets
    from tickets/tier_0/tickets/ into an offline interactive visualizer.
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

Write-Host "Compiling Tier 0 Visualizer with Node: $nodePath" -ForegroundColor Cyan
& "$nodePath" "$PSScriptRoot\build_tier_0_visualizer.js"
