<#
================================================================================
CREATOR STUDIO COMPASS HEADER (AUTO-GENERATED VIA build_suite.js)
SURFACE: Zero-Token CLI Codebase Graph, Symbol & Supply-Chain Inspector
WIKI PAGE: wiki/pages/Find-CodebaseNode.ps1.html (Markdown Source: wiki/src/files/Find-CodebaseNode.ps1.md)
AUTHORITATIVE SPECIFICATIONS:
  - docs/AI_DEVELOPER_GUIDE.md
  - docs/adr/0003-bidirectional-wiki-and-scale-fluid-nested-maps.md
DATA PROVENANCE:
  - wiki/wiki_graph.json
  - wiki/wiki_manifest.json
CRITICAL INSTRUCTION:
  CLI tool to query inbound backlinks, outbound dependencies, declared symbols, and resource supply chains with zero token overhead.
================================================================================
#>
<#
.SYNOPSIS
    Zero-Token Codebase Graph & Dependency Inspector for Creator Studio (Thin Node.js Launcher)
.DESCRIPTION
    Delegates to scripts/find_codebase_node.js to query wiki/wiki_graph.json for inbound backlinks,
    outbound dependencies, declared symbols, resource supply chains, and documentation drift.
#>
param(
    [string]$File = "",
    [string]$Symbol = "",
    [string]$Resource = "",
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
if ($Stale)    { $cliArgs += "-Stale" }
if ($Json)     { $cliArgs += "-Json" }

& "$nodePath" "$PSScriptRoot\scripts\find_codebase_node.js" @cliArgs
exit $LASTEXITCODE
