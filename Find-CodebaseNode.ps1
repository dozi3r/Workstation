<#
================================================================================
CREATOR STUDIO COMPASS HEADER (AUTO-GENERATED VIA build_suite.js)
SURFACE: Zero-Token CLI Codebase Graph, Symbol & Supply-Chain Inspector
AUTHORITATIVE SPECIFICATIONS:
  - docs/AI_DEVELOPER_GUIDE.md
  - docs/adr/0003-bidirectional-wiki-and-scale-fluid-nested-maps.md
DATA PROVENANCE:
  - wiki/wiki_graph.json
  - wiki/wiki_manifest.json
CRITICAL INSTRUCTION:
  CLI tool to query inbound backlinks, outbound dependencies, declared symbols, resource supply chains, and graph integrity (-Check) with zero token overhead.
================================================================================
#>
<#
.SYNOPSIS
    Zero-Token Codebase Graph & Dependency Inspector for Creator Studio (Thin Node.js Launcher)
.DESCRIPTION
    Delegates to scripts/find_codebase_node.js to query wiki/wiki_graph.json for inbound backlinks,
    outbound dependencies, declared symbols, resource supply chains, and graph integrity.
    -Module <ID> and -Chain <CHAIN-ID> print the module/chain atlas (provides/requires, upstream and
    downstream, cascade blast radius, [S, E, C] baseline and quadrant, NPCs, dials/clocks, research
    file, git audit summary, C_verify.md flags). Add -Json for machine-readable output.
#>
param(
    [string]$File = "",
    [string]$Symbol = "",
    [string]$Resource = "",
    [string]$Module = "",
    [string]$Chain = "",
    [switch]$Check,
    [switch]$Stale,
    [switch]$Json
)

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

$cliArgs = @()
if ($File)     { $cliArgs += @("-File", $File) }
if ($Symbol)   { $cliArgs += @("-Symbol", $Symbol) }
if ($Resource) { $cliArgs += @("-Resource", $Resource) }
if ($Module)   { $cliArgs += @("-Module", $Module) }
if ($Chain)    { $cliArgs += @("-Chain", $Chain) }
if ($Check)    { $cliArgs += "-Check" }
if ($Stale)    { $cliArgs += "-Stale" }
if ($Json)     { $cliArgs += "-Json" }

& "$nodePath" "$PSScriptRoot\scripts\find_codebase_node.js" @cliArgs
exit $LASTEXITCODE
