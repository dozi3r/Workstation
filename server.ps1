<#
.SYNOPSIS
    CREATOR STUDIO 2.5 - PURE POWERSHELL / .NET LOOPBACK SERVER
.DESCRIPTION
    Zero-install static HTTP server running on native .NET System.Net.HttpListener.
    No Node.js or external dependencies required.
.PARAMETER Port
    Starting port to bind to (defaults to 8080, increments if busy).
.PARAMETER Open
    Automatically launch default browser.
.PARAMETER AppMode
    Launch in standalone app mode via Edge or Chrome.
#>
param(
    [int]$Port = 8080,
    [switch]$Open,
    [switch]$AppMode
)

$ErrorActionPreference = "Stop"
$RootDir = (Resolve-Path $PSScriptRoot).Path

$MimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".htm"  = "text/html; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".mjs"  = "application/javascript; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".gif"  = "image/gif"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
    ".webp" = "image/webp"
    ".md"   = "text/markdown; charset=utf-8"
    ".txt"  = "text/plain; charset=utf-8"
    ".woff" = "font/woff"
    ".woff2"= "font/woff2"
    ".ttf"  = "font/ttf"
    ".wasm" = "application/wasm"
    ".zip"  = "application/zip"
    ".pdf"  = "application/pdf"
}

function Get-MimeType([string]$filePath) {
    $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
    if ($MimeTypes.ContainsKey($ext)) {
        return $MimeTypes[$ext]
    }
    return "application/octet-stream"
}

function Resolve-CampaignFolder([string]$query) {
    if (-not $query) { return $null }
    $campDir = Join-Path $RootDir "campaigns"
    if (-not (Test-Path $campDir)) { return $null }
    $qLower = $query.ToLower().Trim()
    $qSlug = ($query -replace '[^a-zA-Z0-9]', '').ToLower()
    $folders = Get-ChildItem -Path $campDir -Directory | Select-Object -ExpandProperty Name
    foreach ($f in $folders) {
        if ($f -eq $query -or $f.ToLower() -eq $qLower) { return $f }
        $cJson = Join-Path $campDir (Join-Path $f "campaign.json")
        if (Test-Path $cJson) {
            try {
                $cData = Get-Content -Path $cJson -Raw -Encoding UTF8 | ConvertFrom-Json
                if ($cData.id -and ($cData.id.ToLower() -eq $qLower -or ($cData.id -replace '[^a-zA-Z0-9]','').ToLower() -eq $qSlug)) { return $f }
                if ($cData.name -and ($cData.name.ToLower() -eq $qLower -or ($cData.name -replace '[^a-zA-Z0-9]','').ToLower() -eq $qSlug)) { return $f }
            } catch {}
        }
        $pJson = Join-Path $campDir (Join-Path $f "preset.json")
        if (Test-Path $pJson) {
            try {
                $pData = Get-Content -Path $pJson -Raw -Encoding UTF8 | ConvertFrom-Json
                if ($pData.id -and ($pData.id.ToLower() -eq $qLower -or ($pData.id -replace '[^a-zA-Z0-9]','').ToLower() -eq $qSlug)) { return $f }
                if ($pData.name -and ($pData.name.ToLower() -eq $qLower -or ($pData.name -replace '[^a-zA-Z0-9]','').ToLower() -eq $qSlug)) { return $f }
            } catch {}
        }
        if (($f -replace '[^a-zA-Z0-9]','').ToLower() -eq $qSlug) { return $f }
    }
    return $null
}

function Send-JsonResponse($response, [int]$statusCode, $data) {
    $json = if ($data -is [string]) { $data } else { $data | ConvertTo-Json -Depth 10 }
    $jsonBytes = [System.Text.Encoding]::UTF8.GetBytes($json)
    $response.Headers.Add("Cache-Control", "no-store, no-cache, must-revalidate")
    $response.Headers.Add("Pragma", "no-cache")
    $response.ContentType = "application/json; charset=utf-8"
    $response.StatusCode = $statusCode
    $response.ContentLength64 = $jsonBytes.Length
    $response.OutputStream.Write($jsonBytes, 0, $jsonBytes.Length)
    $response.Close()
}

# Find available port
$listener = $null
$boundPort = $Port
$maxAttempts = 20

for ($i = 0; $i -lt $maxAttempts; $i++) {
    $tryPort = $Port + $i
    try {
        $tempListener = New-Object System.Net.HttpListener
        $prefix = "http://127.0.0.1:$tryPort/"
        $tempListener.Prefixes.Add($prefix)
        $tempListener.Start()
        $listener = $tempListener
        $boundPort = $tryPort
        break
    } catch {
        if ($tempListener) { $tempListener.Close() }
    }
}

if (-not $listener) {
    Write-Error "Could not bind to any port between $Port and $($Port + $maxAttempts - 1)."
    exit 1
}

$appUrl = "http://127.0.0.1:$boundPort/start.html"

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   CREATOR STUDIO 2.0 - LOCAL LOOPBACK (.NET ACTIVE)    " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Loopback Address : http://127.0.0.1:$boundPort/" -ForegroundColor White
Write-Host "  Workstation App  : $appUrl" -ForegroundColor Green
Write-Host "  Engine           : Pure Windows .NET HttpListener" -ForegroundColor Gray
Write-Host "  Security Origin  : Secure Context (CORS / Storage partition unlocked)" -ForegroundColor Gray
Write-Host "--------------------------------------------------------" -ForegroundColor DarkGray
Write-Host "  Press Ctrl+C in this console to stop the workstation." -ForegroundColor Yellow
Write-Host "========================================================`n" -ForegroundColor Cyan

# Open browser if requested
if ($Open -or $AppMode) {
    if ($AppMode) {
        $msedge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
        $chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
        if (Test-Path $msedge) {
            Start-Process -FilePath $msedge -ArgumentList "--app=`"$appUrl`""
        } elseif (Test-Path $chrome) {
            Start-Process -FilePath $chrome -ArgumentList "--app=`"$appUrl`""
        } else {
            Start-Process $appUrl
        }
    } else {
        Start-Process $appUrl
    }
}

# Request processing loop
try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        # Add CORS & Security headers
        $response.Headers.Add("Access-Control-Allow-Origin", "*")
        $response.Headers.Add("Access-Control-Allow-Methods", "GET, HEAD, POST, OPTIONS")
        $response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Range, Authorization")

        if ($request.HttpMethod -eq "OPTIONS") {
            $response.StatusCode = 204
            $response.Close()
            continue
        }

        $rawPath = [System.Uri]::UnescapeDataString($request.Url.AbsolutePath)

        # API status
        if ($rawPath -eq "/api/status") {
            $statusObj = @{
                status = "running"
                version = "2.5.0"
                engine = "powershell-net"
                port = $boundPort
                rootDir = $RootDir
            }
            Send-JsonResponse $response 200 $statusObj
            continue
        }

        # Campaign loopback query extraction
        $campQuery = $request.QueryString["campaign"]
        if (-not $campQuery) { $campQuery = $request.QueryString["slug"] }
        if (-not $campQuery) { $campQuery = $request.QueryString["id"] }

        # GET /api/campaign/sync-status
        if ($rawPath -eq "/api/campaign/sync-status" -and $request.HttpMethod -eq "GET") {
            $folder = Resolve-CampaignFolder $campQuery
            if (-not $folder) {
                Send-JsonResponse $response 404 @{ status = "error"; message = "Campaign '$campQuery' not found" }
                continue
            }
            $campDir = Join-Path $RootDir (Join-Path "campaigns" $folder)
            $cJson = Join-Path $campDir "campaign.json"
            $cData = if (Test-Path $cJson) { Get-Content -Path $cJson -Raw -Encoding UTF8 | ConvertFrom-Json } else { @{} }
            $syncToken = if ($cData.syncToken) { $cData.syncToken } else { "sync_initial" }
            $lastBatchId = if ($cData.appliedBatchIds -and $cData.appliedBatchIds.Count -gt 0) { $cData.appliedBatchIds[-1] } else { $null }
            $resPayload = @{
                status = "ok"
                campaign = $folder
                id = if ($cData.id) { $cData.id } else { $folder }
                name = if ($cData.name) { $cData.name } else { $folder }
                syncToken = $syncToken
                lastBatchId = $lastBatchId
                census = @{
                    npcs = if ($cData.entities.npcs) { $cData.entities.npcs.Count } else { 0 }
                    quests = if ($cData.entities.quests) { $cData.entities.quests.Count } else { 0 }
                    items = if ($cData.entities.items) { $cData.entities.items.Count } else { 0 }
                    trackers = if ($cData.entities.trackers) { $cData.entities.trackers.Count } else { 0 }
                    factions = if ($cData.entities.factions) { $cData.entities.factions.Count } else { 0 }
                }
            }
            Send-JsonResponse $response 200 $resPayload
            continue
        }

        # GET /api/campaign/changelog
        if ($rawPath -eq "/api/campaign/changelog" -and $request.HttpMethod -eq "GET") {
            $folder = Resolve-CampaignFolder $campQuery
            if (-not $folder) {
                Send-JsonResponse $response 404 @{ status = "error"; message = "Campaign '$campQuery' not found" }
                continue
            }
            $chJson = Join-Path $RootDir (Join-Path "campaigns" (Join-Path $folder "changelog.json"))
            $chRaw = if (Test-Path $chJson) { Get-Content -Path $chJson -Raw -Encoding UTF8 } else { "[]" }
            Send-JsonResponse $response 200 $chRaw
            continue
        }

        # GET /api/campaign/load
        if ($rawPath -eq "/api/campaign/load" -and $request.HttpMethod -eq "GET") {
            $folder = Resolve-CampaignFolder $campQuery
            if (-not $folder) {
                Send-JsonResponse $response 404 @{ status = "error"; message = "Campaign '$campQuery' not found" }
                continue
            }
            $cliScript = Join-Path $RootDir "scripts\campaign_cli.js"
            $nodeExe = if (Test-Path "$RootDir\tools\node\node.exe") { "$RootDir\tools\node\node.exe" } else { "node" }
            $loadScript = @"
const { loadCampaignState } = require('$($cliScript.Replace('\', '/'))');
const state = loadCampaignState('$((Join-Path $RootDir "campaigns\$folder").Replace('\', '/'))', '$folder');
console.log(JSON.stringify({
    status: 'ok',
    campaign: '$folder',
    id: state.id,
    name: state.name,
    syncToken: state.syncToken,
    appliedBatchIds: state.appliedBatchIds,
    entities: state.entities,
    activeTopology: state.activeTopology,
    maps: state.maps,
    changelog: state.changelog
}));
"@
            $tempJs = Join-Path ([System.IO.Path]::GetTempPath()) "load_camp_$([guid]::NewGuid().ToString('N')).js"
            try {
                Set-Content -Path $tempJs -Value $loadScript -Encoding UTF8
                $outJson = & $nodeExe $tempJs
                Send-JsonResponse $response 200 $outJson
            } catch {
                Send-JsonResponse $response 500 @{ status = "error"; message = $_.Exception.Message }
            } finally {
                if (Test-Path $tempJs) { Remove-Item $tempJs -Force -ErrorAction SilentlyContinue }
            }
            continue
        }

        # POST /api/campaign/save
        if ($rawPath -eq "/api/campaign/save" -and $request.HttpMethod -eq "POST") {
            $folder = Resolve-CampaignFolder $campQuery
            if (-not $folder) {
                Send-JsonResponse $response 404 @{ status = "error"; message = "Campaign '$campQuery' not found" }
                continue
            }
            $reader = New-Object System.IO.StreamReader($request.InputStream, $request.ContentEncoding)
            $bodyText = $reader.ReadToEnd()
            $reader.Close()

            $cliScript = Join-Path $RootDir "scripts\campaign_cli.js"
            $nodeExe = if (Test-Path "$RootDir\tools\node\node.exe") { "$RootDir\tools\node\node.exe" } else { "node" }
            $tempPayload = Join-Path ([System.IO.Path]::GetTempPath()) "save_payload_$([guid]::NewGuid().ToString('N')).json"
            $tempJs = Join-Path ([System.IO.Path]::GetTempPath()) "save_camp_$([guid]::NewGuid().ToString('N')).js"
            try {
                Set-Content -Path $tempPayload -Value $bodyText -Encoding UTF8
                $saveScript = @"
const fs = require('fs');
const { loadCampaignState, saveCampaignStateToDisk } = require('$($cliScript.Replace('\', '/'))');
const campDir = '$((Join-Path $RootDir "campaigns\$folder").Replace('\', '/'))';
const payload = JSON.parse(fs.readFileSync('$($tempPayload.Replace('\', '/'))', 'utf8'));
const state = loadCampaignState(campDir, '$folder');
if (payload.entities) state.entities = payload.entities;
if (payload.activeTopology) state.activeTopology = payload.activeTopology;
if (payload.maps) state.maps = payload.maps;
if (Array.isArray(payload.appliedBatchIds)) state.appliedBatchIds = payload.appliedBatchIds;
const diskRes = saveCampaignStateToDisk(state, campDir, payload.batchRecord || null);
console.log(JSON.stringify({ status: 'ok', campaign: '$folder', syncToken: diskRes.syncToken, savedAt: diskRes.updatedAt }));
"@
                Set-Content -Path $tempJs -Value $saveScript -Encoding UTF8
                $outJson = & $nodeExe $tempJs
                Send-JsonResponse $response 200 $outJson
            } catch {
                Send-JsonResponse $response 500 @{ status = "error"; message = $_.Exception.Message }
            } finally {
                if (Test-Path $tempPayload) { Remove-Item $tempPayload -Force -ErrorAction SilentlyContinue }
                if (Test-Path $tempJs) { Remove-Item $tempJs -Force -ErrorAction SilentlyContinue }
            }
            continue
        }

        # API live modules
        if ($rawPath -eq "/api/modules") {
            $modsList = @()
            $campDir = Join-Path $RootDir "campaigns"
            if (Test-Path $campDir) {
                $mdFiles = Get-ChildItem -Path $campDir -Recurse -Filter "*.md" -ErrorAction SilentlyContinue | Where-Object { $_.FullName -match "[\\/]modules[\\/]" }
                foreach ($mf in $mdFiles) {
                    $rawText = Get-Content -Path $mf.FullName -Raw -Encoding UTF8
                    $modId = [System.IO.Path]::GetFileNameWithoutExtension($mf.Name)
                    $modTitle = $modId
                    if ($rawText -match '(?m)^id:\s*["'']?([^"''\r\n]+)["'']?') { $modId = $Matches[1].Trim() }
                    if ($rawText -match '(?m)^title:\s*["'']?([^"''\r\n]+)["'']?') { $modTitle = $Matches[1].Trim() }
                    $modsList += @{
                        id = $modId
                        title = $modTitle
                        content = $rawText
                    }
                }
            }
            $modPayload = @{ status = "ok"; count = $modsList.Count; modules = $modsList }
            Send-JsonResponse $response 200 $modPayload
            continue
        }

        # API shutdown
        if ($rawPath -eq "/api/shutdown") {
            Send-JsonResponse $response 200 @{ message = "Server shutting down" }
            Write-Host "`n[SERVER] Shutdown signal received via /api/shutdown." -ForegroundColor Yellow
            break
        }

        # Root routing
        if ($rawPath -eq "/" -or [string]::IsNullOrWhiteSpace($rawPath)) {
            $rawPath = "/start.html"
        }

        # Security check: resolve relative to RootDir
        $rel = $rawPath.TrimStart("/\").Replace("/", "\")
        $fullPath = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($RootDir, $rel))

        if (-not $fullPath.StartsWith($RootDir, [System.StringComparison]::OrdinalIgnoreCase)) {
            $response.StatusCode = 403
            $msg = [System.Text.Encoding]::UTF8.GetBytes("403 Forbidden: Directory traversal blocked.")
            $response.ContentType = "text/plain; charset=utf-8"
            $response.OutputStream.Write($msg, 0, $msg.Length)
            $response.Close()
            continue
        }

        if (-not (Test-Path $fullPath)) {
            $response.StatusCode = 404
            $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $rawPath")
            $response.ContentType = "text/plain; charset=utf-8"
            $response.OutputStream.Write($msg, 0, $msg.Length)
            $response.Close()
            continue
        }

        $targetFile = $fullPath
        if (Test-Path $fullPath -PathType Container) {
            $startInDir = Join-Path $fullPath "start.html"
            $indexInDir = Join-Path $fullPath "index.html"
            if (Test-Path $startInDir) {
                $targetFile = $startInDir
            } elseif (Test-Path $indexInDir) {
                $targetFile = $indexInDir
            } else {
                $response.StatusCode = 403
                $msg = [System.Text.Encoding]::UTF8.GetBytes("403 Forbidden: Directory listing disabled.")
                $response.ContentType = "text/plain; charset=utf-8"
                $response.OutputStream.Write($msg, 0, $msg.Length)
                $response.Close()
                continue
            }
        }

        try {
            $fileBytes = [System.IO.File]::ReadAllBytes($targetFile)
            $response.ContentType = Get-MimeType $targetFile
            $response.StatusCode = 200
            $response.ContentLength64 = $fileBytes.Length
            $response.OutputStream.Write($fileBytes, 0, $fileBytes.Length)
        } catch {
            $response.StatusCode = 500
            $errMsg = [System.Text.Encoding]::UTF8.GetBytes("500 Internal Error: $($_.Exception.Message)")
            $response.OutputStream.Write($errMsg, 0, $errMsg.Length)
        } finally {
            $response.Close()
        }
    }
} finally {
    if ($listener -and $listener.IsListening) {
        $listener.Stop()
        $listener.Close()
    }
    Write-Host "[SERVER] Loopback listener stopped." -ForegroundColor DarkGray
}
