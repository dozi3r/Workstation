<#
.SYNOPSIS
    Headless CLI Campaign Slice & Entity Importer for Creator Studio 2.5.
.DESCRIPTION
    Merges an AI-authored or writer-authored JSON slice into a target campaign folder.
    Delegates to scripts/campaign_cli.js import-slice backed by CampaignMutationEngine,
    ensuring automatic multi-file disk sync (preset.json, maps/*.json, changelog.json, campaign_sync.js).
.PARAMETER Campaign
    Target campaign folder ID under ./campaigns/ (e.g., Peridot, BaldursGate, Fallout2).
.PARAMETER SlicePath
    Path to the incoming JSON slice file (.json or .creator.json).
.PARAMETER ConflictPolicy
    Resolution policy when an incoming entity ID matches an existing entity: overwrite (default), keep_existing, or clone.
#>
param(
    [Parameter(Mandatory = $true)]
    [string]$Campaign,

    [Parameter(Mandatory = $true)]
    [string]$SlicePath,

    [ValidateSet("overwrite", "keep_existing", "clone")]
    [string]$ConflictPolicy = "overwrite"
)

$ErrorActionPreference = "Stop"
$RepoRoot = $PSScriptRoot
$CliScript = Join-Path $RepoRoot "scripts\campaign_cli.js"

if (-not (Test-Path $CliScript)) {
    Write-Error "scripts\campaign_cli.js not found at $CliScript"
    exit 1
}
if (-not (Test-Path $SlicePath)) {
    Write-Error "Slice JSON file not found: $SlicePath"
    exit 1
}

$resolvedSlice = (Resolve-Path $SlicePath).Path
$nodeExe = if (Test-Path "$RepoRoot\tools\node\node.exe") { "$RepoRoot\tools\node\node.exe" } else { "node" }

& $nodeExe $CliScript import-slice --campaign $Campaign --file $resolvedSlice --conflict-policy $ConflictPolicy
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}
