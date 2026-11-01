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
    Zero-Token Codebase Graph & Dependency Inspector for Creator Studio
.DESCRIPTION
    Queries wiki/wiki_graph.json (compiled deterministically by wiki/build_wiki.js)
    to inspect file blast radius, inbound backlinks, outbound dependencies,
    declared functions/symbols, module resource supply chains (provides/requires),
    and documentation drift without consuming LLM tokens or grepping the workspace.
.PARAMETER File
    Relative path or filename to inspect (e.g. "entity_manager.js" or "src/workstation/scripts/entity_manager.js").
.PARAMETER Symbol
    Function, method, or symbol name to locate across the codebase (e.g. "openEntityManager").
.PARAMETER Resource
    Module resource tag (provides/requires) to trace across campaign supply chains (e.g. "salvage", "ore", "food").
.PARAMETER Stale
    Switch to list all tracked files whose SHA-256 hash has drifted from their last reviewed wiki note.
.PARAMETER Json
    Switch to emit machine-readable JSON output.
.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\Find-CodebaseNode.ps1 -File "entity_manager.js"
.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\Find-CodebaseNode.ps1 -Symbol "openEntityManager"
.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\Find-CodebaseNode.ps1 -Resource "timber"
.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\Find-CodebaseNode.ps1 -Stale
#>

param(
    [string]$File,
    [string]$Symbol,
    [string]$Resource,
    [switch]$Stale,
    [switch]$Json
)

$graphPath = Join-Path $PSScriptRoot "wiki\wiki_graph.json"

if (-not (Test-Path $graphPath)) {
    Write-Host "[INFO] wiki/wiki_graph.json not found. Compiling suite first..." -ForegroundColor Cyan
    & powershell -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot "Build-Suite.ps1") | Out-Null
}

if (-not (Test-Path $graphPath)) {
    Write-Error "Could not locate or build wiki/wiki_graph.json."
    exit 1
}

$graph = Get-Content -Path $graphPath -Raw -Encoding UTF8 | ConvertFrom-Json

# ------------------------------------------------------------------------------
# 1. INSPECT FILE NODE (-File)
# ------------------------------------------------------------------------------
if ($File) {
    $norm = $File.Trim().Replace('\', '/')
    $node = $graph.nodes | Where-Object { $_.relPath -ieq $norm } | Select-Object -First 1
    if (-not $node) {
        $node = $graph.nodes | Where-Object { $_.relPath -ilike "*/$norm" -or $_.relPath -ilike "*$norm*" } | Select-Object -First 1
    }

    if (-not $node) {
        Write-Error "No tracked file matching '$File' found in wiki/wiki_graph.json."
        exit 1
    }

    if ($Json) {
        $node | ConvertTo-Json -Depth 6
        exit 0
    }

    Write-Host "`n==================================================================" -ForegroundColor Cyan
    Write-Host " CODEBASE NODE: $($node.relPath)" -ForegroundColor Cyan
    Write-Host "==================================================================" -ForegroundColor Cyan
    Write-Host (" Title:    {0}" -f $node.title)
    Write-Host (" Kind:     {0} ({1})" -f $node.kind, $node.volume)
    Write-Host (" Metrics:  {0} lines | {1} bytes | SHA: {2}" -f $node.lineCount, $node.sizeBytes, $node.hash)
    $syncColor = if ($node.stale) { "Yellow" } else { "Green" }
    $syncLabel = if ($node.stale) { "STALE (Reviewed SHA: $($node.reviewedHash))" } else { "SYNCED" }
    Write-Host (" Wiki:     {0} (wiki/src/files/{1}.md)" -f $syncLabel, $node.relPath) -ForegroundColor $syncColor

    if ($node.symbols -and $node.symbols.Count -gt 0) {
        Write-Host "`n[DECLARED SYMBOLS & SUBROUTINES ($($node.symbols.Count))]" -ForegroundColor Yellow
        foreach ($sym in $node.symbols) {
            Write-Host "  * $sym"
        }
    }

    if ($node.globals -and $node.globals.Count -gt 0) {
        Write-Host "`n[SHARED GLOBALS ($($node.globals.Count))]" -ForegroundColor Yellow
        Write-Host ("  " + ($node.globals -join ", "))
    }

    if (($node.provides -and $node.provides.Count -gt 0) -or ($node.requires -and $node.requires.Count -gt 0)) {
        Write-Host "`n[RESOURCE CONTRACTS]" -ForegroundColor Cyan
        if ($node.provides -and $node.provides.Count -gt 0) {
            Write-Host ("  Provides: " + ($node.provides -join ", ")) -ForegroundColor Green
        }
        if ($node.requires -and $node.requires.Count -gt 0) {
            Write-Host ("  Requires: " + ($node.requires -join ", ")) -ForegroundColor Magenta
        }
    }

    Write-Host "`n[INBOUND BACKLINKS / CALLERS / CONSUMERS ($($node.inbound.Count))]" -ForegroundColor Green
    if ($node.inbound.Count -eq 0) {
        Write-Host "  (None)" -ForegroundColor DarkGray
    } else {
        foreach ($inEdge in $node.inbound) {
            Write-Host ("  <- {0,-48} [{1}] {2}" -f $inEdge.source, $inEdge.type, $inEdge.reason)
        }
    }

    Write-Host "`n[OUTBOUND REFERENCES & DEPENDENCIES ($($node.outbound.Count))]" -ForegroundColor Magenta
    if ($node.outbound.Count -eq 0) {
        Write-Host "  (None)" -ForegroundColor DarkGray
    } else {
        foreach ($outEdge in $node.outbound) {
            Write-Host ("  -> {0,-48} [{1}] {2}" -f $outEdge.target, $outEdge.type, $outEdge.reason)
        }
    }
    Write-Host ""
    exit 0
}

# ------------------------------------------------------------------------------
# 2. SEARCH SYMBOL (-Symbol)
# ------------------------------------------------------------------------------
if ($Symbol) {
    $q = $Symbol.Trim()
    $matches = @($graph.symbols | Where-Object { $_.name -ilike "*$q*" -or $_.signature -ilike "*$q*" })

    if ($Json) {
        $matches | ConvertTo-Json -Depth 4
        exit 0
    }

    Write-Host "`n==================================================================" -ForegroundColor Cyan
    Write-Host " SYMBOL SEARCH: '$q' ($($matches.Count) match(es))" -ForegroundColor Cyan
    Write-Host "==================================================================" -ForegroundColor Cyan

    if ($matches.Count -eq 0) {
        Write-Host "  No declared symbols matching '$q' found." -ForegroundColor Yellow
        exit 0
    }

    foreach ($m in $matches) {
        Write-Host "`n  Symbol:    $($m.signature)" -ForegroundColor Yellow
        Write-Host "  Defined:   $($m.file) ($($m.kind))" -ForegroundColor Green

        # Find callers in graph edges
        $defNode = $graph.nodes | Where-Object { $_.relPath -eq $m.file } | Select-Object -First 1
        if ($defNode -and $defNode.inbound) {
            $callers = @($defNode.inbound | Where-Object { $_.reason -ilike "*$($m.name)(*" })
            if ($callers.Count -gt 0) {
                Write-Host "  Called By:" -ForegroundColor Cyan
                foreach ($c in $callers) {
                    Write-Host "    <- $($c.source) ($($c.reason))"
                }
            }
        }
    }
    Write-Host ""
    exit 0
}

# ------------------------------------------------------------------------------
# 3. SEARCH RESOURCE SUPPLY CHAIN (-Resource)
# ------------------------------------------------------------------------------
if ($Resource) {
    $q = $Resource.Trim()
    $matches = @($graph.supplyChains | Where-Object { $_.tag -ilike "*$q*" })

    if ($Json) {
        $matches | ConvertTo-Json -Depth 4
        exit 0
    }

    Write-Host "`n==================================================================" -ForegroundColor Cyan
    Write-Host " RESOURCE SUPPLY CHAIN SEARCH: '$q' ($($matches.Count) tag(s))" -ForegroundColor Cyan
    Write-Host "==================================================================" -ForegroundColor Cyan

    if ($matches.Count -eq 0) {
        Write-Host "  No resource tags matching '$q' found." -ForegroundColor Yellow
        exit 0
    }

    foreach ($sc in $matches) {
        Write-Host "`n  Tag: [$($sc.tag)]" -ForegroundColor Yellow
        if ($sc.providers -and $sc.providers.Count -gt 0) {
            Write-Host "    Providers ($($sc.providers.Count)):" -ForegroundColor Green
            foreach ($p in $sc.providers) { Write-Host "      + $p" }
        } else {
            Write-Host "    Providers: (None - Orphan Requirement)" -ForegroundColor DarkYellow
        }
        if ($sc.consumers -and $sc.consumers.Count -gt 0) {
            Write-Host "    Consumers ($($sc.consumers.Count)):" -ForegroundColor Magenta
            foreach ($c in $sc.consumers) { Write-Host "      - $c" }
        } else {
            Write-Host "    Consumers: (None)" -ForegroundColor DarkGray
        }
    }
    Write-Host ""
    exit 0
}

# ------------------------------------------------------------------------------
# 4. LIST STALE FILES (-Stale)
# ------------------------------------------------------------------------------
if ($Stale) {
    $staleNodes = @($graph.nodes | Where-Object { $_.stale -eq $true })

    if ($Json) {
        $staleNodes | Select-Object relPath, title, hash, reviewedHash | ConvertTo-Json -Depth 3
        exit 0
    }

    Write-Host "`n==================================================================" -ForegroundColor Cyan
    Write-Host " WIKI DRIFT / STALE FILES ($($staleNodes.Count) file(s))" -ForegroundColor Cyan
    Write-Host "==================================================================" -ForegroundColor Cyan

    if ($staleNodes.Count -eq 0) {
        Write-Host "  All $($graph.totalFiles) tracked files are in sync with their wiki documentation!" -ForegroundColor Green
    } else {
        foreach ($s in $staleNodes) {
            Write-Host ("  [STALE] {0,-52} (Current: {1} != Reviewed: {2})" -f $s.relPath, $s.hash, $s.reviewedHash) -ForegroundColor Yellow
        }
        Write-Host "`n  Tip: Update wiki/src/files/<relPath>.md and run:" -ForegroundColor Gray
        Write-Host "       powershell -ExecutionPolicy Bypass -File .\Build-Suite.ps1 --stamp-reviewed`n" -ForegroundColor Cyan
    }
    exit 0
}

# ------------------------------------------------------------------------------
# DEFAULT SUMMARY & USAGE
# ------------------------------------------------------------------------------
Write-Host "`n==================================================================" -ForegroundColor Cyan
Write-Host " CREATOR STUDIO - ZERO-TOKEN CODEBASE GRAPH INSPECTOR" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host (" Generated At:       {0}" -f $graph.generatedAt)
Write-Host (" Tracked Files:      {0}" -f $graph.totalFiles)
Write-Host (" Bidirectional Edges:{0}" -f $graph.totalBidirectionalEdges)
Write-Host (" Indexed Symbols:    {0}" -f $graph.symbols.Count)
Write-Host (" Supply-Chain Tags:  {0}" -f $graph.supplyChains.Count)
Write-Host (" Stale Files:        {0}" -f $graph.staleCount)
Write-Host "`nUsage Examples:" -ForegroundColor Yellow
Write-Host "  powershell -ExecutionPolicy Bypass -File .\Find-CodebaseNode.ps1 -File `"entity_manager.js`""
Write-Host "  powershell -ExecutionPolicy Bypass -File .\Find-CodebaseNode.ps1 -Symbol `"openEntityManager`""
Write-Host "  powershell -ExecutionPolicy Bypass -File .\Find-CodebaseNode.ps1 -Resource `"timber`""
Write-Host "  powershell -ExecutionPolicy Bypass -File .\Find-CodebaseNode.ps1 -Stale`n"
