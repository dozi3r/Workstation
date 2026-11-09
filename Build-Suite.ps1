<#
.SYNOPSIS
    Campaign Creator - Centralized Suite Build Runner
.DESCRIPTION
    Runs build_suite.js using the available Node.js runtime, compiling all
    modules, topologies, and tarot matrix files into single-file offline tools.
#>

$nodeCandidates = @(
    "C:\Program Files\nodejs\node.exe",
    ((Get-Command node.exe -ErrorAction SilentlyContinue) | Where-Object { $_.Source -notlike "*node.cmd" } | Select-Object -ExpandProperty Source -First 1),
    "C:\Program Files\Adobe\Adobe Photoshop 2024\node.exe"
)

$nodePath = $nodeCandidates | Where-Object { $_ -and (Test-Path $_) } | Select-Object -First 1
if (-not $nodePath) {
    $found = Get-ChildItem -Path "C:\Program Files", "$env:LOCALAPPDATA" -Filter node.exe -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notlike "*node.cmd" } | Select-Object -First 1
    if ($found) { $nodePath = $found.FullName }
}

if (-not $nodePath) {
    Write-Error "Could not find a valid node.exe runtime on this system."
    exit 1
}

Write-Host "Running build_suite.js with Node: $nodePath" -ForegroundColor Cyan
& "$nodePath" "$PSScriptRoot\build_suite.js" @args
