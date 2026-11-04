<#
.SYNOPSIS
    Antigravity Campaign CLI Wrapper for Creator Studio 2.5
.DESCRIPTION
    Executes zero-token campaign queries and atomic disk batch mutations across
    campaign.json, topology.json, preset.json, maps/*.json, changelog.json, and campaign_sync.js.
.PARAMETER Command
    Subcommand: list-campaigns, summary, find-node, inspect-entity, active-quests, active-clocks, changelog, apply-batch, import-slice, revert-batch.
.PARAMETER Campaign
    Target campaign folder, slug, ID, or name (e.g., BaldursGate, Fallout2, baldursgate).
.PARAMETER File
    Path to batch or slice JSON file.
.PARAMETER Json
    Inline JSON payload string.
.PARAMETER Query
    Search query string (for find-node).
.PARAMETER Type
    Entity category (npc, quest, item, tracker, faction) for inspect-entity.
.PARAMETER Id
    Entity ID or name for inspect-entity.
.PARAMETER BatchId
    Batch ID to revert (for revert-batch).
.PARAMETER ConflictPolicy
    Conflict policy for import-slice: overwrite (default), keep_existing, or clone.
#>
param(
    [Parameter(Position = 0)]
    [string]$Command = "summary",

    [string]$Campaign,
    [string]$File,
    [string]$Json,
    [string]$Query,
    [string]$Type,
    [string]$Id,
    [string]$BatchId,
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

$nodeArgs = @($CliScript, $Command)
if ($Campaign) { $nodeArgs += @("--campaign", $Campaign) }
if ($File) { $nodeArgs += @("--file", $File) }
if ($Json) { $nodeArgs += @("--json", $Json) }
if ($Query) { $nodeArgs += @("--query", $Query) }
if ($Type) { $nodeArgs += @("--type", $Type) }
if ($Id) { $nodeArgs += @("--id", $Id) }
if ($BatchId) { $nodeArgs += @("--batch-id", $BatchId) }
if ($ConflictPolicy) { $nodeArgs += @("--conflict-policy", $ConflictPolicy) }

$nodeExe = if (Test-Path "$RepoRoot\tools\node\node.exe") { "$RepoRoot\tools\node\node.exe" } else { "node" }
& $nodeExe $nodeArgs
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}
