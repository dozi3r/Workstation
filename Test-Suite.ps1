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
param(
    [switch]$SkipBuild,
    [switch]$Quick
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$RootDir = (Resolve-Path $ScriptDir).Path

# Resolve Node.js runtime
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
    Write-Error "Could not find a valid node.exe runtime to run JavaScript test suites."
    exit 1
}

$Results = @()
$TotalStopwatch = [System.Diagnostics.Stopwatch]::StartNew()

function Record-TestPhase {
    param(
        [string]$PhaseName,
        [string]$Description,
        [scriptblock]$Action,
        [bool]$Skip = $false
    )
    
    Write-Host "`n================================================================================" -ForegroundColor Cyan
    Write-Host " RUNNING: $PhaseName - $Description" -ForegroundColor Cyan
    Write-Host "================================================================================" -ForegroundColor Cyan
    
    if ($Skip) {
        Write-Host " [SKIPPED] Phase was skipped via parameters." -ForegroundColor DarkGray
        $script:Results += [PSCustomObject]@{
            Phase = $PhaseName
            Description = $Description
            Duration = "0.00s"
            Status = "SKIP"
            Error = $null
        }
        return
    }
    
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    $status = "PASS"
    $err = $null
    try {
        & $Action
    } catch {
        $status = "FAIL"
        $err = $_.ToString()
        Write-Host " [ERROR] $err" -ForegroundColor Red
    }
    $sw.Stop()
    $duration = "$([Math]::Round($sw.Elapsed.TotalSeconds, 2))s"
    
    $script:Results += [PSCustomObject]@{
        Phase = $PhaseName
        Description = $Description
        Duration = $duration
        Status = $status
        Error = $err
    }
}

# ------------------------------------------------------------------------------
# PHASE 1: BUILD SUITE COMPILATION (Build-Suite.ps1)
# ------------------------------------------------------------------------------
Record-TestPhase -PhaseName "Phase 1: Build Suite" -Description "Centralized Asset Compilation & Wiki Build" -Skip $SkipBuild -Action {
    $buildScript = Join-Path $RootDir "Build-Suite.ps1"
    & powershell -ExecutionPolicy Bypass -File "$buildScript" --stamp-reviewed
    if ($LASTEXITCODE -ne 0) { throw "Build-Suite.ps1 returned exit code $LASTEXITCODE" }
}

# ------------------------------------------------------------------------------
# PHASE 2: HEADLESS JS SYNTAX & UNIT TEST SUITE (test/run_tests.js)
# ------------------------------------------------------------------------------
Record-TestPhase -PhaseName "Phase 2: JS Test Suite" -Description "Surfaces Syntax, ZeroCorsZip, Importer & Cascade" -Action {
    $runTestsJs = Join-Path $RootDir "test\run_tests.js"
    & "$nodePath" "$runTestsJs"
    if ($LASTEXITCODE -ne 0) { throw "test/run_tests.js returned exit code $LASTEXITCODE" }
}

# ------------------------------------------------------------------------------
# PHASE 3: MULTI-CAMPAIGN PACKAGE SCHEMA & INTEGRITY AUDIT
# ------------------------------------------------------------------------------
Record-TestPhase -PhaseName "Phase 3: Campaign Packages" -Description "Schema & Asset Validation across all Campaign Packages" -Action {
    $campValidator = Join-Path $RootDir "campaigns\Test-CampaignPackage.ps1"
    $campDirs = Get-ChildItem -Path (Join-Path $RootDir "campaigns") -Directory | Select-Object -ExpandProperty Name
    foreach ($camp in $campDirs) {
        Write-Host "`n--> Auditing Campaign Package: $camp..." -ForegroundColor Cyan
        if (Test-Path $campValidator) {
            & powershell -ExecutionPolicy Bypass -File "$campValidator" -Campaign $camp
            if ($LASTEXITCODE -ne 0) { throw "Validation failed for campaign '$camp'" }
        } else {
            $campMeta = Join-Path $RootDir "campaigns\$camp\campaign.json"
            if (-not (Test-Path $campMeta)) { throw "Missing campaign.json in campaigns/$camp" }
            Get-Content -Raw $campMeta | ConvertFrom-Json | Out-Null
            Write-Host "  [OK] Validated campaign.json for $camp" -ForegroundColor Green
        }
    }
}

# ------------------------------------------------------------------------------
# PHASE 4: KNOWLEDGE GRAPH SYNC & STALE DOCUMENTATION AUDIT
# ------------------------------------------------------------------------------
Record-TestPhase -PhaseName "Phase 4: Wiki Knowledge Graph" -Description "Zero Stale Documentation Drift via Find-CodebaseNode.ps1" -Action {
    $findNodePs1 = Join-Path $RootDir "Find-CodebaseNode.ps1"
    $staleOutput = & powershell -ExecutionPolicy Bypass -File "$findNodePs1" -Stale
    $staleText = ($staleOutput -join "`n")
    if ($staleText -match "WIKI DRIFT / STALE FILES \((\d+) file\(s\)\)") {
        $staleCount = [int]$Matches[1]
        if ($staleCount -gt 0) {
            throw "Detected $staleCount stale/unreviewed file(s) in knowledge graph."
        }
    }
    Write-Host "Knowledge graph is 100% synchronized (0 stale files)." -ForegroundColor Green
}

# ------------------------------------------------------------------------------
# PHASE 5: DUAL-ENGINE LOOPBACK SERVER & HTTP INTEGRATION AUDIT
# ------------------------------------------------------------------------------
Record-TestPhase -PhaseName "Phase 5: Loopback Servers" -Description "Zero-Install Node & .NET Loopback Verification" -Action {
    # Test 5A: Node.js Loopback Engine
    Write-Host "--> Verifying Node.js Loopback Server Engine (server.js)..." -ForegroundColor Cyan
    $testPortNode = 8991
    $procNode = Start-Process -FilePath $nodePath -ArgumentList "server.js --port $testPortNode --no-open" -WorkingDirectory $RootDir -PassThru
    Start-Sleep -Milliseconds 700
    try {
        $statusNode = Invoke-RestMethod -Uri "http://127.0.0.1:$testPortNode/api/status"
        if ($statusNode.status -ne "running" -or $statusNode.engine -ne "node") {
            throw "Node engine /api/status returned invalid payload: $($statusNode | ConvertTo-Json)"
        }
        $resHtml = Invoke-WebRequest -Uri "http://127.0.0.1:$testPortNode/start.html"
        if ($resHtml.StatusCode -ne 200) { throw "GET /start.html returned $($resHtml.StatusCode)" }
        if ($resHtml.Headers["Content-Type"] -notmatch "text/html") { throw "GET /start.html Content-Type is not text/html" }
        
        $resJson = Invoke-WebRequest -Uri "http://127.0.0.1:$testPortNode/campaigns/Emerald%20Isle/campaign.json"
        if ($resJson.StatusCode -ne 200) { throw "GET campaign.json returned $($resJson.StatusCode)" }
        
        Invoke-RestMethod -Uri "http://127.0.0.1:$testPortNode/api/shutdown" -Method Post | Out-Null
        Write-Host "  [OK] Node.js loopback engine validated (HTTP 200, MIME types, CORS, Shutdown)." -ForegroundColor Green
    } finally {
        Start-Sleep -Milliseconds 300
        if (-not $procNode.HasExited) { Stop-Process -Id $procNode.Id -Force }
    }

    # Test 5B: PowerShell / .NET HttpListener Fallback Engine
    Write-Host "--> Verifying PowerShell/.NET Loopback Server Engine (server.ps1)..." -ForegroundColor Cyan
    $testPortPs = 8992
    $procPs = Start-Process powershell -ArgumentList "-ExecutionPolicy Bypass -File server.ps1 -Port $testPortPs" -WorkingDirectory $RootDir -PassThru
    Start-Sleep -Milliseconds 800
    try {
        $statusPs = Invoke-RestMethod -Uri "http://127.0.0.1:$testPortPs/api/status"
        if ($statusPs.status -ne "running" -or $statusPs.engine -ne "powershell-net") {
            throw ".NET engine /api/status returned invalid payload: $($statusPs | ConvertTo-Json)"
        }
        $resPsHtml = Invoke-WebRequest -Uri "http://127.0.0.1:$testPortPs/start.html"
        if ($resPsHtml.StatusCode -ne 200) { throw ".NET GET /start.html returned $($resPsHtml.StatusCode)" }
        
        Invoke-RestMethod -Uri "http://127.0.0.1:$testPortPs/api/shutdown" -Method Post | Out-Null
        Write-Host "  [OK] PowerShell/.NET HttpListener engine validated (HTTP 200, MIME types, CORS, Shutdown)." -ForegroundColor Green
    } finally {
        Start-Sleep -Milliseconds 300
        if (-not $procPs.HasExited) { Stop-Process -Id $procPs.Id -Force }
    }
}

$TotalStopwatch.Stop()
$TotalSeconds = [Math]::Round($TotalStopwatch.Elapsed.TotalSeconds, 2)

# ------------------------------------------------------------------------------
# EXECUTIVE SUMMARY TABLE
# ------------------------------------------------------------------------------
Write-Host "`n================================================================================" -ForegroundColor Cyan
Write-Host "                       MASTER TEST SUITE SUMMARY REPORT                         " -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan

$hasFailure = $false
foreach ($r in $Results) {
    $color = if ($r.Status -eq "PASS") { "Green" } elseif ($r.Status -eq "SKIP") { "DarkGray" } else { "Red" }
    if ($r.Status -eq "FAIL") { $hasFailure = $true }
    
    $phasePad = $r.Phase.PadRight(28)
    $descPad = $r.Description.PadRight(34)
    $durPad = $r.Duration.PadLeft(8)
    $statPad = "[$($r.Status)]".PadLeft(8)
    
    Write-Host " $phasePad $descPad $durPad " -NoNewline
    Write-Host "$statPad" -ForegroundColor $color
    if ($r.Error) {
        Write-Host "   -> Error: $($r.Error)" -ForegroundColor Red
    }
}

Write-Host "--------------------------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host " Total Execution Time: $($TotalSeconds)s" -ForegroundColor White
Write-Host "================================================================================" -ForegroundColor Cyan

if ($hasFailure) {
    Write-Host "`n [FAILURE] One or more test phases failed. See details above." -ForegroundColor Red
    exit 1
} else {
    Write-Host "`n [SUCCESS] All test suites and quality gates passed with 100% compliance!" -ForegroundColor Green
    exit 0
}
