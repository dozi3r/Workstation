<#
.SYNOPSIS
    Campaign Package Structural Validator (Thin Node.js Launcher)
.DESCRIPTION
    Delegates to scripts/test_suite.js --campaign <Campaign> for cross-platform validation.
#>
param(
    [Parameter(Mandatory=$true)]
    [string]$Campaign
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

$suiteScript = Join-Path (Split-Path -Parent $PSScriptRoot) "scripts\test_suite.js"
& "$nodePath" "$suiteScript" --campaign "$Campaign"
exit $LASTEXITCODE
