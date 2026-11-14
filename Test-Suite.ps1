<#
================================================================================
CREATOR STUDIO COMPASS HEADER (AUTO-GENERATED VIA build_suite.js)
SURFACE: Master Automated Test Harness & Quality Assurance Gate
WIKI PAGE: wiki/pages/Test-Suite.ps1.html (Markdown Source: wiki/src/files/Test-Suite.ps1.md)
AUTHORITATIVE SPECIFICATIONS:
  - docs/srd/authoring_engine_srd.md
  - docs/adr/0004-desktop-workstation-start-html.md
  - docs/adr/0005-campaign-entity-architecture-npcs-quests-items.md
DATA PROVENANCE:
  - test/run_tests.js
  - campaigns/Test-CampaignPackage.ps1
  - Find-CodebaseNode.ps1
CRITICAL INSTRUCTION:
  Master test harness executing compilation, core HTML surface JS syntax, unit tests, campaign validation, zero-CORS isolation, and wiki graph drift in <15s.
================================================================================
#>
<#
.SYNOPSIS
    Master Automated Test Harness & Quality Assurance Gate (Thin Node.js Launcher)
.DESCRIPTION
    Delegates to scripts/test_suite.js to execute all 5 verification phases cross-platform.
#>
param(
    [switch]$SkipBuild,
    [switch]$Quick
)

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
    Write-Error "Could not find a valid node.exe runtime to run JavaScript test suites."
    exit 1
}

$cliArgs = @()
if ($SkipBuild) { $cliArgs += "-SkipBuild" }
if ($Quick)     { $cliArgs += "-Quick" }

& "$nodePath" "$PSScriptRoot\scripts\test_suite.js" @cliArgs
exit $LASTEXITCODE
