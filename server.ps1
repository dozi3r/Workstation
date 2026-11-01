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
            $jsonBytes = [System.Text.Encoding]::UTF8.GetBytes(($statusObj | ConvertTo-Json))
            $response.ContentType = "application/json; charset=utf-8"
            $response.StatusCode = 200
            $response.ContentLength64 = $jsonBytes.Length
            $response.OutputStream.Write($jsonBytes, 0, $jsonBytes.Length)
            $response.Close()
            continue
        }

        # API shutdown
        if ($rawPath -eq "/api/shutdown") {
            $shutdownMsg = [System.Text.Encoding]::UTF8.GetBytes('{"message":"Server shutting down"}')
            $response.ContentType = "application/json; charset=utf-8"
            $response.StatusCode = 200
            $response.ContentLength64 = $shutdownMsg.Length
            $response.OutputStream.Write($shutdownMsg, 0, $shutdownMsg.Length)
            $response.Close()
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
