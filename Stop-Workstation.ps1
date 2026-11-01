<#
.SYNOPSIS
    CREATOR STUDIO 2.5 - SHUTDOWN SCRIPT
.DESCRIPTION
    Sends a shutdown request to active Creator Studio loopback server instances.
#>
param(
    [int]$StartPort = 8080,
    [int]$EndPort = 8100
)

Write-Host "Scanning for running Creator Studio servers (ports $StartPort..$EndPort)..." -ForegroundColor Cyan
$found = $false

for ($p = $StartPort; $p -le $EndPort; $p++) {
    $statusUrl = "http://127.0.0.1:$p/api/status"
    $shutdownUrl = "http://127.0.0.1:$p/api/shutdown"
    
    try {
        $resp = Invoke-RestMethod -Uri $statusUrl -Method Get -TimeoutSec 1 -ErrorAction Stop
        if ($resp -and ($resp.version -match "^2\.")) {
            Write-Host "  -> Found active Creator Studio server on port $p ($($resp.engine), v$($resp.version)). Shutting down..." -ForegroundColor Yellow
            Invoke-RestMethod -Uri $shutdownUrl -Method Post -TimeoutSec 2 -ErrorAction SilentlyContinue | Out-Null
            $found = $true
        }
    } catch {
        # Port not listening or not our server
    }
}

if ($found) {
    Write-Host "[OK] All active Creator Studio servers have been stopped." -ForegroundColor Green
} else {
    Write-Host "[INFO] No active Creator Studio servers detected on ports $StartPort..$EndPort." -ForegroundColor DarkGray
}
