<#
.SYNOPSIS
    CREATOR STUDIO 2.0 - MASTER LOCAL LOOPBACK LAUNCHER
.DESCRIPTION
    Zero-install launcher that selects the best available local runtime
    (Node.js if present, or Windows native .NET HttpListener fallback)
    and opens the workstation in your browser with full modern API access.
.PARAMETER Port
    Starting port to bind to (default: 8080).
.PARAMETER AppMode
    Launch in distraction-free Chromium/Edge desktop window mode.
#>
param(
    [int]$Port = 8080,
    [switch]$AppMode
)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $ScriptDir

# Runtime resolution
$nodeCmd = Get-Command node -ErrorAction SilentlyContinue
$nodePath = if ($nodeCmd) { 
    $nodeCmd.Source 
} elseif (Test-Path "C:\Program Files\Adobe\Adobe Photoshop 2024\node.exe") { 
    "C:\Program Files\Adobe\Adobe Photoshop 2024\node.exe"
} else {
    $found = Get-ChildItem -Path "C:\Program Files", "$env:LOCALAPPDATA" -Filter node.exe -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($found) { $found.FullName } else { $null }
}

if ($AppMode) {
    # If app mode, launch server without auto-opening default browser, then launch Edge/Chrome in --app mode
    $appUrl = "http://127.0.0.1:$Port/start.html"
    $msedge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    $chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
    
    # Launch browser after a brief pause
    [System.Threading.Tasks.Task]::Run([Action]{
        Start-Sleep -Milliseconds 800
        if (Test-Path $msedge) {
            Start-Process -FilePath $msedge -ArgumentList "--app=`"$appUrl`""
        } elseif (Test-Path $chrome) {
            Start-Process -FilePath $chrome -ArgumentList "--app=`"$appUrl`""
        } else {
            Start-Process $appUrl
        }
    }) | Out-Null
    
    if ($nodePath) {
        Write-Host "Starting Node.js Loopback Server on port $Port (App Mode)..." -ForegroundColor Cyan
        & "$nodePath" "$ScriptDir\server.js" --port $Port --no-open
    } else {
        Write-Host "Starting PowerShell/.NET Loopback Server on port $Port (App Mode)..." -ForegroundColor Cyan
        & powershell -ExecutionPolicy Bypass -File "$ScriptDir\server.ps1" -Port $Port
    }
} else {
    if ($nodePath) {
        Write-Host "Starting Node.js Loopback Server on port $Port..." -ForegroundColor Cyan
        & "$nodePath" "$ScriptDir\server.js" --port $Port --open
    } else {
        Write-Host "Starting PowerShell/.NET Loopback Server on port $Port..." -ForegroundColor Cyan
        & powershell -ExecutionPolicy Bypass -File "$ScriptDir\server.ps1" -Port $Port -Open
    }
}
