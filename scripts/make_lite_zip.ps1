param(
    [string]$OutZip = "Workstation_Lite.zip"
)

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$root = "C:\Users\Milo\Documents\Antigravity\Workstation 2.5"
$zipPath = Join-Path $root $OutZip

if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

$zip = [System.IO.Compression.ZipFile]::Open($zipPath, [System.IO.Compression.ZipArchiveMode]::Create)

try {
    $rootFiles = @(
        "start.html",
        "index.html",
        "admin.html",
        "Launch-Workstation.bat",
        "Launch-Workstation.ps1",
        "Launch-AppMode.bat",
        "server.js",
        "server.ps1",
        "Stop-Workstation.bat",
        "Stop-Workstation.ps1",
        "Build-Suite.ps1",
        "build_suite.js",
        "README.md",
        "QUICKSTART.md",
        "CONTEXT.md"
    )

    foreach ($rf in $rootFiles) {
        $full = Join-Path $root $rf
        if (Test-Path $full) {
            [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $full, $rf, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
        }
    }

    $dirs = @("src", "network\presets", "mods")
    foreach ($d in $dirs) {
        $dirPath = Join-Path $root $d
        if (Test-Path $dirPath) {
            $files = Get-ChildItem -Path $dirPath -Recurse -File
            foreach ($f in $files) {
                $rel = $f.FullName.Substring($root.Length + 1).Replace('\', '/')
                [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $f.FullName, $rel, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
            }
        }
    }
}
finally {
    $zip.Dispose()
}

$sizeMB = [math]::Round((Get-Item $zipPath).Length / 1MB, 2)
Write-Host "Created $zipPath ($sizeMB MB)"
