param(
    [Parameter(Mandatory=$true)]
    [string]$Campaign
)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$campDir = Join-Path $ScriptDir $Campaign

if (-not (Test-Path $campDir)) {
    Write-Error "Campaign directory does not exist: $campDir"
    exit 1
}

$campJson = Join-Path $campDir "campaign.json"
if (-not (Test-Path $campJson)) {
    Write-Error "Missing campaign.json in $campDir"
    exit 1
}

try {
    $raw = Get-Content -Raw $campJson
    $meta = $raw | ConvertFrom-Json
} catch {
    Write-Error "Invalid JSON in campaign.json: $_"
    exit 1
}

$topoFile = if ($meta.topologyFile) { $meta.topologyFile } else { "topology.json" }
$presetFile = if ($meta.presetFile) { $meta.presetFile } else { "preset.json" }

$topoJson = Join-Path $campDir $topoFile
$presetJson = Join-Path $campDir $presetFile

if (-not (Test-Path $topoJson) -and -not (Test-Path $presetJson)) {
    Write-Error "Missing topology.json or preset.json in $campDir"
    exit 1
}

Write-Host "  [OK] Campaign package '$Campaign' passed structural validation." -ForegroundColor Green
exit 0
