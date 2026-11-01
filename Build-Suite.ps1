<#
.SYNOPSIS
    Campaign Creator - Centralized Suite Build Runner
.DESCRIPTION
    Runs build_suite.js using the available Node.js runtime, compiling all
    modules, topologies, and tarot matrix files into single-file offline tools.
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

Write-Host "Running build_suite.js with Node: $nodePath" -ForegroundColor Cyan
& "$nodePath" "$PSScriptRoot\build_suite.js" @args
