param(
    [string]$OutZip = "Creator_Full_Standalone.zip"
)

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$rootPath = (Get-Item .).FullName
$zipPath = Join-Path $rootPath $OutZip

if (Test-Path $zipPath) {
    Write-Host "Removing existing $zipPath..."
    Remove-Item $zipPath -Force
}

$zip = [System.IO.Compression.ZipFile]::Open($zipPath, [System.IO.Compression.ZipArchiveMode]::Create)

try {
    $files = Get-ChildItem -Path $rootPath -Recurse -File | Where-Object {
        $_.FullName -notmatch '\\regions\\images' -and
        $_.FullName -notmatch '\\tarot\\.*\.pdf$' -and
        $_.FullName -notmatch '\.zip$' -and
        $_.FullName -notmatch '\\\.git\\'
    }

    $total = $files.Count
    Write-Host "Compressing $total files into $OutZip (excluding regions/images, tarot PDFs, and zip archives)..."

    $counter = 0
    foreach ($file in $files) {
        $counter++
        $relPath = $file.FullName.Substring($rootPath.Length + 1).Replace('\', '/')
        if ($counter % 200 -eq 0 -or $counter -eq $total) {
            Write-Host "[$counter / $total] $relPath"
        }
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $file.FullName, $relPath, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
    }

    Write-Host "[OK] Archive created successfully: $zipPath"
}
finally {
    $zip.Dispose()
}

$sizeMB = [math]::Round((Get-Item $zipPath).Length / 1MB, 2)
Write-Host "========================================================"
Write-Host "   CREATOR STUDIO ARCHIVE COMPLETE: $sizeMB MB"
Write-Host "   Output: $zipPath"
Write-Host "========================================================"
